# Laboratorio 10 – APIs nativas de JavaScript (TEL137 · Gestión de Servicios de TICs)

Alvaro Brandon Pimentel Melgar – 20232283

| Carpeta | Pregunta | API |
|---|---|---|
| `pregunta1/` | `crearPecera(x)`: tablero de x × x que representa la pecera | DOM |
| `pregunta2/` | Nemo y Dory cuentan peces; el agua pasa de azul a verde | Web Storage |
| `pregunta3/` | Burbujas que se arrastran hasta el pez que corresponde | Drag and Drop |

**Cómo ejecutar:** abre el `index.html` de cada carpeta en Chrome o Edge. No hace falta servidor (también funciona con Live Server de VS Code).

---

## P1 – Document Object Model (DOM)
El DOM es la representación en árbol de la página. Cada etiqueta es un **nodo** que JS puede crear, modificar o eliminar.

- `document.getElementById()`: obtiene un nodo que ya existe.
- `document.createElement()` + `appendChild()`: crean nodos nuevos y los insertan en el árbol. Así se generan las x² celdas.
- `DocumentFragment`: todas las celdas se arman en memoria y se insertan **una sola vez**, con un único reflow. Es más eficiente que insertar celda por celda.
- `replaceChildren()`: limpia la pecera anterior antes de crear una nueva.
- `dataset` (`data-fila`, `data-columna`), `classList` y `style`: guardan datos en el nodo y le dan estilo.
- **Delegación de eventos**: hay un solo `click` en el contenedor y `closest('.celda')` identifica la celda clicada. Sirve para elementos creados dinámicamente.

## P2 – Web Storage API
Guarda pares **clave/valor (siempre strings)** en el navegador. Métodos: `setItem`, `getItem` (devuelve `null` si la clave no existe), `removeItem`, `clear`.

| | `localStorage` → **Nemo** | `sessionStorage` → **Dory** |
|---|---|---|
| ¿Sobrevive a la recarga (limpiar la pecera)? | Sí | Sí |
| ¿Se comparte con otra pestaña (otro acuario)? | **Sí** | **No**, cada pestaña tiene el suyo |
| ¿Sobrevive al cerrar el navegador? | Sí | No |
| Ámbito | origen (protocolo + dominio + puerto) | origen **+ pestaña** |

- Por eso, en una pestaña nueva Nemo sigue su cuenta y Dory empieza en 0.
- Evento `storage`: se dispara en las **otras** pestañas cuando una de ellas cambia `localStorage`. Con él, el contador de Nemo se actualiza en vivo en todos los acuarios abiertos.
- **Color del agua**: `setInterval` cada 1 s interpola linealmente RGB de azul claro `#ADD8E6` a verde `#2ECC71` (llega al verde en 60 s). El tiempo vive en una variable normal, **no** en el storage. Por eso al recargar (limpiar) el agua vuelve al azul original.

## P3 – HTML Drag and Drop API
- **Origen** (burbuja): `draggable="true"`.
  - `dragstart`: `dataTransfer.setData('text/plain', id)` guarda qué burbuja se arrastra.
  - `dragend`: se dispara siempre, al final del arrastre.
- **Destino** (área de cada pez):
  - `dragover` **debe** llamar a `preventDefault()`. Si no, el navegador no permite soltar y `drop` nunca se dispara.
  - `dragenter` / `dragleave`: resaltan la zona.
  - `drop`: con `dataTransfer.getData()` se obtiene el id y se compara `data-pez` de la burbuja con el de la zona.
- Si la burbuja cae en su pez: se incrementa el contador (en el mismo storage de la P2) y se hace `remove()` de la burbuja.
- Si cae en el área equivocada, fuera del tablero o se cancela con Esc: no se marca como acierto y en `dragend` vuelve a su posición inicial (guardada en `data-inicio-left/top`).
- Cada 2 s, `setInterval` crea una burbuja naranja o azul en la franja superior. Hay un máximo de 14 a la vez para que no se sature la superficie.
- Limitación: la API de Drag and Drop de HTML5 no funciona con touch en móviles. Hay que probar con mouse.
