/**
 * PREGUNTA 1 - Document Object Model (DOM) API
 *
 * crearPecera(x): crea en la página un tablero de x filas por x columnas
 * que representa las dimensiones de una pecera.
 *
 * APIs del DOM usadas:
 *  - document.getElementById()   -> obtener un nodo existente
 *  - document.createElement()    -> crear nodos nuevos
 *  - element.classList / dataset / style -> configurar los nodos
 *  - element.appendChild()       -> insertar nodos en el árbol
 *  - element.replaceChildren()   -> limpiar el contenido anterior
 *  - DocumentFragment            -> construir todo en memoria y pintar una sola vez
 */
function crearPecera(x) {
  const n = Number(x);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error('crearPecera(x): x debe ser un entero mayor o igual a 1');
  }

  const contenedor = document.getElementById('contenedor-pecera');
  contenedor.replaceChildren(); // borra la pecera anterior (si existía)

  // Nodo raíz del tablero
  const pecera = document.createElement('div');
  pecera.id = 'pecera';
  pecera.className = 'pecera';
  pecera.dataset.dimension = n;
  pecera.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  pecera.style.gridTemplateRows = `repeat(${n}, 1fr)`;

  // Se arman las x*x celdas en un fragmento (un solo reflow al insertarlo)
  const fragmento = document.createDocumentFragment();
  for (let fila = 0; fila < n; fila++) {
    for (let col = 0; col < n; col++) {
      const celda = document.createElement('div');
      celda.classList.add('celda');
      celda.dataset.fila = fila;
      celda.dataset.columna = col;
      celda.title = `Celda (${fila}, ${col})`;
      fragmento.appendChild(celda);
    }
  }
  pecera.appendChild(fragmento);
  contenedor.appendChild(pecera);

  const info = document.getElementById('info');
  if (info) info.textContent = `Pecera de ${n} × ${n} = ${n * n} celdas`;

  return pecera;
}

// --- Interacción con el formulario ---
document.getElementById('form-pecera').addEventListener('submit', (evento) => {
  evento.preventDefault(); // evita que el formulario recargue la página
  const x = document.getElementById('dimension').value;
  crearPecera(x);
});

// Al hacer clic en una celda se resalta (demuestra eventos sobre nodos creados dinámicamente)
document.getElementById('contenedor-pecera').addEventListener('click', (evento) => {
  const celda = evento.target.closest('.celda');
  if (celda) celda.classList.toggle('marcada');
});

// Pecera inicial
document.addEventListener('DOMContentLoaded', () => crearPecera(10));
