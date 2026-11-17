/**
 * PREGUNTA 2 - Web Storage API
 *
 * - Cada pestaña del navegador = un acuario distinto.
 * - Limpiar el acuario = recargar la pestaña.
 *
 * Nemo (excelente memoria)  -> localStorage
 *   · Persiste entre recargas, entre pestañas e incluso al cerrar el navegador.
 *   · Se comparte entre todas las pestañas del mismo origen.
 *
 * Dory (distraída)          -> sessionStorage
 *   · Persiste mientras viva la pestaña (sobrevive a la recarga = limpieza).
 *   · Cada pestaña nueva tiene su propio sessionStorage vacío -> empieza en 0.
 *
 * Color del agua: NO se guarda en ningún storage (vive en una variable),
 * por eso al recargar (limpiar) vuelve al azul claro original.
 */

// ===================== DOM: tablero (reutiliza la Pregunta 1) =====================
function crearPecera(x) {
  const n = Number(x);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error('crearPecera(x): x debe ser un entero mayor o igual a 1');
  }
  const contenedor = document.getElementById('contenedor-pecera');
  contenedor.replaceChildren();

  const pecera = document.createElement('div');
  pecera.id = 'pecera';
  pecera.className = 'pecera';
  pecera.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  pecera.style.gridTemplateRows = `repeat(${n}, 1fr)`;

  const fragmento = document.createDocumentFragment();
  for (let i = 0; i < n * n; i++) {
    const celda = document.createElement('div');
    celda.className = 'celda';
    fragmento.appendChild(celda);
  }
  pecera.appendChild(fragmento);
  contenedor.appendChild(pecera);
  return pecera;
}

// ===================== Peces =====================
// Cada pez sabe qué storage usa: ahí está toda la diferencia de "memoria".
const PECES = {
  nemo: { nombre: 'Nemo', emoji: '🐠', storage: localStorage,   clave: 'contadorNemo', memoria: 'localStorage' },
  dory: { nombre: 'Dory', emoji: '🐟', storage: sessionStorage, clave: 'contadorDory', memoria: 'sessionStorage' },
};

function leerContador(id) {
  const pez = PECES[id];
  // getItem devuelve null si la clave no existe -> se toma como 0
  return parseInt(pez.storage.getItem(pez.clave), 10) || 0;
}

function guardarContador(id, valor) {
  const pez = PECES[id];
  pez.storage.setItem(pez.clave, String(valor)); // Web Storage solo guarda strings
}

function incrementar(id) {
  const nuevo = leerContador(id) + 1;
  guardarContador(id, nuevo);
  pintarContador(id);
}

function pintarContador(id) {
  document.getElementById(`contador-${id}`).textContent = leerContador(id);
}

function crearZonaPez(id) {
  const pez = PECES[id];
  const zona = document.createElement('section');
  zona.className = `zona zona-${id}`;
  zona.dataset.pez = id;

  zona.innerHTML = `
    <div class="pez" aria-hidden="true">${pez.emoji}</div>
    <h2>${pez.nombre}</h2>
    <p class="contador" id="contador-${id}">0</p>
    <button type="button" class="aleta" data-pez="${id}">Golpe de aleta 👋</button>
    <small>memoria: <code>${pez.memoria}</code></small>
  `;
  return zona;
}

function montarPeces(pecera) {
  const capa = document.createElement('div');
  capa.className = 'capa-peces';
  capa.append(crearZonaPez('nemo'), crearZonaPez('dory'));
  pecera.appendChild(capa);

  // Un solo listener para ambos botones (delegación de eventos)
  capa.addEventListener('click', (e) => {
    const boton = e.target.closest('button.aleta');
    if (boton) incrementar(boton.dataset.pez);
  });

  pintarContador('nemo');
  pintarContador('dory');
}

// Evento "storage": se dispara en las OTRAS pestañas cuando una cambia localStorage.
// Así el contador de Nemo se actualiza en vivo en todos los acuarios abiertos.
window.addEventListener('storage', (e) => {
  if (e.key === PECES.nemo.clave) pintarContador('nemo');
});

// ===================== Color del agua =====================
const AZUL_CLARO = [173, 216, 230]; // #ADD8E6 (color original)
const VERDE      = [46, 204, 113];  // #2ECC71 (agua sucia)
const SEGUNDOS_HASTA_VERDE = 60;     // en 60 s llega al verde total

let segundos = 0; // variable en memoria: se pierde al recargar (limpiar)

function colorDelAgua(seg) {
  const t = Math.min(seg / SEGUNDOS_HASTA_VERDE, 1); // 0 → 1
  const [r, g, b] = AZUL_CLARO.map((c, i) => Math.round(c + (VERDE[i] - c) * t));
  return `rgb(${r}, ${g}, ${b})`;
}

function iniciarCambioDeColor(pecera) {
  pecera.style.backgroundColor = colorDelAgua(0);
  setInterval(() => {
    segundos++;
    pecera.style.backgroundColor = colorDelAgua(segundos);
    document.getElementById('segundos').textContent = segundos;
  }, 1000);
}

// ===================== Inicio =====================
document.addEventListener('DOMContentLoaded', () => {
  const pecera = crearPecera(10);
  montarPeces(pecera);
  iniciarCambioDeColor(pecera);

  document.getElementById('btn-limpiar').addEventListener('click', () => location.reload());
  document.getElementById('btn-nuevo-acuario').addEventListener('click', () => window.open(location.href, '_blank'));
});
