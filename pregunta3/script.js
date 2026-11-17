/**
 * PREGUNTA 3 - HTML Drag and Drop API
 *
 * Mismo tablero (P1) y mismos peces/contadores/color (P2). Nuevo juego:
 *  - Cada 2 s emerge una burbuja en la parte superior (naranja = Nemo, azul = Dory).
 *  - La burbuja es arrastrable (draggable="true").
 *  - Las áreas de cada pez son zonas de soltado (drop targets).
 *  - Si la burbuja cae en el área de SU pez: +1 al contador de ese pez y la burbuja desaparece.
 *  - Si cae en el área equivocada o fuera del tablero: vuelve a su posición inicial.
 *
 * Eventos de la API usados:
 *  Sobre la burbuja (origen):   dragstart, dragend
 *  Sobre la zona   (destino):   dragenter, dragover, dragleave, drop
 *  Objeto clave:                event.dataTransfer (setData / getData / effectAllowed / dropEffect)
 */

// ===================== DOM: tablero (Pregunta 1) =====================
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

// ===================== Web Storage: peces (Pregunta 2) =====================
const PECES = {
  nemo: { nombre: 'Nemo', emoji: '🐠', storage: localStorage,   clave: 'contadorNemo', memoria: 'localStorage' },
  dory: { nombre: 'Dory', emoji: '🐟', storage: sessionStorage, clave: 'contadorDory', memoria: 'sessionStorage' },
};

function leerContador(id) {
  const pez = PECES[id];
  return parseInt(pez.storage.getItem(pez.clave), 10) || 0;
}

function guardarContador(id, valor) {
  const pez = PECES[id];
  pez.storage.setItem(pez.clave, String(valor));
}

function incrementar(id) {
  guardarContador(id, leerContador(id) + 1);
  pintarContador(id);
}

function pintarContador(id) {
  const el = document.getElementById(`contador-${id}`);
  el.textContent = leerContador(id);
  el.classList.remove('sube');
  void el.offsetWidth;          // reinicia la animación
  el.classList.add('sube');
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
  capa.className = 'capa-peces con-superficie';
  const zonaNemo = crearZonaPez('nemo');
  const zonaDory = crearZonaPez('dory');
  capa.append(zonaNemo, zonaDory);
  pecera.appendChild(capa);

  capa.addEventListener('click', (e) => {
    const boton = e.target.closest('button.aleta');
    if (boton) incrementar(boton.dataset.pez);
  });

  pintarContador('nemo');
  pintarContador('dory');
  return [zonaNemo, zonaDory];
}

window.addEventListener('storage', (e) => {
  if (e.key === PECES.nemo.clave) pintarContador('nemo');
});

// ===================== Color del agua (Pregunta 2) =====================
const AZUL_CLARO = [173, 216, 230];
const VERDE      = [46, 204, 113];
const SEGUNDOS_HASTA_VERDE = 60;
let segundos = 0;

function colorDelAgua(seg) {
  const t = Math.min(seg / SEGUNDOS_HASTA_VERDE, 1);
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

// ===================== Drag and Drop: burbujas (Pregunta 3) =====================
const INTERVALO_BURBUJAS_MS = 2000;
const MAX_BURBUJAS = 14;          // evita que la superficie se llene sin límite
let contadorIds = 0;
let soltadaCorrectamente = false; // la marca el drop y la lee el dragend

function actualizarNumBurbujas(pecera) {
  document.getElementById('num-burbujas').textContent = pecera.querySelectorAll('.burbuja').length;
}

function crearBurbuja(pecera) {
  if (pecera.querySelectorAll('.burbuja').length >= MAX_BURBUJAS) return;

  const pez = Math.random() < 0.5 ? 'nemo' : 'dory';
  const burbuja = document.createElement('div');
  burbuja.id = `burbuja-${++contadorIds}`;
  burbuja.className = `burbuja burbuja-${pez}`;
  burbuja.dataset.pez = pez;
  burbuja.draggable = true;                         // 1) la hace arrastrable
  burbuja.title = `Burbuja de ${PECES[pez].nombre}`;

  // Posición inicial: franja superior del tablero (porcentajes → responsive)
  const left = 4 + Math.random() * 84;   // 4% .. 88%
  const top  = 2 + Math.random() * 10;   // 2% .. 12%
  burbuja.dataset.inicioLeft = left;
  burbuja.dataset.inicioTop = top;
  burbuja.style.left = `${left}%`;
  burbuja.style.top = `${top}%`;

  burbuja.addEventListener('dragstart', alIniciarArrastre);
  burbuja.addEventListener('dragend', alTerminarArrastre);

  pecera.appendChild(burbuja);
  actualizarNumBurbujas(pecera);
}

// --- Eventos en el ORIGEN (la burbuja) ---
function alIniciarArrastre(e) {
  soltadaCorrectamente = false;
  // 2) se "empaqueta" qué se está arrastrando: el id de la burbuja
  e.dataTransfer.setData('text/plain', e.target.id);
  e.dataTransfer.effectAllowed = 'move';
  // se añade la clase un instante después para que la imagen fantasma salga normal
  requestAnimationFrame(() => e.target.classList.add('arrastrando'));
}

function alTerminarArrastre(e) {
  const burbuja = e.target;
  burbuja.classList.remove('arrastrando');
  // dragend siempre se dispara: si no hubo un drop correcto (área equivocada,
  // fuera del tablero o se canceló con Esc), la burbuja regresa a su posición inicial.
  if (!soltadaCorrectamente && burbuja.isConnected) {
    regresarAPosicionInicial(burbuja);
  }
}

function regresarAPosicionInicial(burbuja) {
  burbuja.style.left = `${burbuja.dataset.inicioLeft}%`;
  burbuja.style.top = `${burbuja.dataset.inicioTop}%`;
  burbuja.classList.remove('regresa');
  void burbuja.offsetWidth;
  burbuja.classList.add('regresa'); // animación de "rebote" para evidenciar el regreso
}

// --- Eventos en el DESTINO (zonas de los peces) ---
function configurarZonaDeSoltado(zona) {
  zona.addEventListener('dragenter', (e) => {
    e.preventDefault();
    zona.classList.add('sobre');
  });

  // 3) preventDefault en dragover es OBLIGATORIO: indica que aquí se permite soltar
  zona.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  zona.addEventListener('dragleave', (e) => {
    if (!zona.contains(e.relatedTarget)) zona.classList.remove('sobre');
  });

  // 4) drop: se recupera el dato y se valida si la burbuja es de este pez
  zona.addEventListener('drop', (e) => {
    e.preventDefault();
    zona.classList.remove('sobre');
    const id = e.dataTransfer.getData('text/plain');
    const burbuja = document.getElementById(id);
    if (!burbuja) return;

    if (burbuja.dataset.pez === zona.dataset.pez) {
      soltadaCorrectamente = true;
      incrementar(zona.dataset.pez);   // suma en localStorage / sessionStorage
      const pecera = burbuja.parentElement;
      burbuja.remove();                // la burbuja desaparece
      actualizarNumBurbujas(pecera);
      zona.classList.add('acierto');
      setTimeout(() => zona.classList.remove('acierto'), 400);
    } else {
      zona.classList.add('error');
      setTimeout(() => zona.classList.remove('error'), 400);
      // no se marca como correcta -> dragend la regresa a su posición inicial
    }
  });
}

// ===================== Inicio =====================
document.addEventListener('DOMContentLoaded', () => {
  const pecera = crearPecera(10);
  const zonas = montarPeces(pecera);
  zonas.forEach(configurarZonaDeSoltado);
  iniciarCambioDeColor(pecera);

  crearBurbuja(pecera);
  setInterval(() => crearBurbuja(pecera), INTERVALO_BURBUJAS_MS);

  document.getElementById('btn-limpiar').addEventListener('click', () => location.reload());
  document.getElementById('btn-nuevo-acuario').addEventListener('click', () => window.open(location.href, '_blank'));
});
