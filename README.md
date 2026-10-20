# Algoritmia y Programación II — IST 2089

Aplicación web local (sin backend, sin instalación, sin internet) para estudiar **Algoritmia y
Programación II** con Daladier Jabba, periodo **2026-30** (27 de julio – 2 de diciembre de 2026).

La idea que la organiza: en esta materia no se estudia leyendo, se estudia **viendo ejecutarse el
código**. Por eso el núcleo no son animaciones dibujadas a mano sino un **intérprete real** del
pseudocódigo del profesor. Todo lo demás —variables, memoria, pila de llamadas, consola, hoja de
prueba de escritorio— son vistas sincronizadas sobre la misma traza.

---

## Cómo abrirla

Doble clic en `index.html`. Funciona en Chrome, Edge o Firefox sin instalar nada y sin conexión:
las fuentes y **KaTeX** están empaquetados en `assets/` y los iconos son SVG en línea. Ni un solo
CDN, ni una sola petición a la red.

Si prefieres servirla por HTTP:

```bash
python -m http.server 8137 --directory .
```

Servida por HTTP (o desplegada en Vercel) se registra `sw.js`, que precachea todo y la hace
instalable como aplicación.

> **Al probar cambios**, el service worker es la trampa: su handler usa `ignoreSearch`, así que se
> traga el `?v=` y sirve versiones viejas de lo que edites. Por eso **no se registra en
> localhost**. Si aun así ves código viejo, abre la consola y ejecuta:
> `navigator.serviceWorker.getRegistrations().then(r=>r.forEach(x=>x.unregister()))`
> y luego borra las cachés. Recuerda además subir el `?v=` de `index.html` y el `CACHE` de `sw.js`.

---

## Cómo está organizada

| Ruta | Qué es |
|---|---|
| `#/` | Portada: en qué semana vas, los cuatro cortes, la evaluación y tu nota |
| `#/corte/N` | **Ruta del corte**: la línea de semanas del cronograma, con los temas colgando |
| `#/corte/N/tema/<id>` | Un tema a pantalla completa: **Teoría · Ver · Ejemplos · Ejercicios** |
| `#/corte/N/meta` | La meta del corte: qué entra, la plantilla del examen, checklist y tus notas |
| `#/corte/N/propuestos` | **Los 42 ejercicios propuestos del manual**, con solucion ejecutable |
| `#/corte/N/patrones` | Tarjetero de patrones recortado a ese corte |
| `#/corte/N/drill` | Reconocer la estructura que resuelve un enunciado, en segundos |
| `#/corte/N/traza` | **Drill de prueba de escritorio**: predecir el siguiente estado |
| `#/corte/N/simulacro` | La plantilla real del examen, con cronometro |
| `#/corte/N/examen` | Examenes reales transcritos punto por punto |
| `#/corte/N/cronograma` | Las 16 semanas del semestre |
| `#/laboratorio` | **Banco de trabajo**: pega cualquier pseudocódigo y velo ejecutarse |

No hay pantalla de Ajustes: la apariencia vive en el desplegable de la barra superior y la copia
de seguridad, al pie de la portada, que es donde se usa.

Atajos: **Ctrl+K** o **/** abren la búsqueda · **J / K** van al tema siguiente o anterior ·
**Esc** cierra lo que esté abierto (nunca navega).
Dentro de una traza: **Espacio** reproduce/pausa · **← →** un paso · **R** reinicia · **Inicio/Fin**
van a los extremos.

---

## Cómo está construida por dentro

Tres capas, y ninguna sabe más de lo que necesita:

| Capa | Archivos | Responsabilidad |
|---|---|---|
| Motor | `pseudo/*.js` | Léxico → sintaxis → AST → **traza**. No sabe que existe una interfaz. |
| Vistas | `js/ui.js`, `js/views-corte.js`, `js/views-tools.js` | Devuelven `{ html, despues }`. No conocen el router. |
| Armazón | `js/app.js`, `js/router.js` | Barra superior, **camino del corte** y enrutado. |

`js/app.js` construye el armazón **una sola vez** y el router escribe únicamente dentro de `#main`.
Es lo que permite que la barra lateral conserve su scroll y qué semanas están abiertas al navegar
entre temas. Reconstruir todo en cada render, como se hacía antes, hacía saltar el camino.

`js/ui.js` guarda las piezas compartidas —anillo de progreso, migas, encabezado, **la fila del
banco de ejercicios**, los filtros, los pasos de teoría y las cuatro ilustraciones—. Existe porque
la fila del banco llegó a estar escrita a mano en cuatro sitios y las cuatro copias divergieron.

### Reglas duras del CSS

Las hojas `tokens.css`, `base.css`, `layout.css` y `components.css` vienen de Cálculo II y se
mantienen **idénticas**. De ahí salen tres reglas que no se negocian:

1. **`views.css` no redefine nada que ya exista** en `layout.css` o `components.css`. Si hace falta
   otra cosa, lleva nombre propio (`.fstrip2`, `.evrow`, `.bmeta2`, `.prefs`). Las únicas
   repeticiones admitidas son los ajustes responsive dentro de `@media`.
2. **`.step`, `.wk` y `.tema` tienen dueño.** `.step` y `.wk` pertenecen al camino de la barra
   lateral (`layout.css`) y a los pasos de teoría (`components.css`); la ruta del corte usa
   `.wknode` y `.tema`. Mezclarlos partía los títulos en una palabra por línea.
3. **Cada `?v=` de `index.html` sube junto al `CACHE` de `sw.js`.** Si no, el service worker sirve
   la versión anterior.

### LaTeX

KaTeX está vendorizado en `assets/katex/` y se renderiza al final de cada vista con
`AYP.ui.math(nodo)`. Su uso está acotado a una sola cosa: **la notación matemática**
—índices, sumatorias, recurrencias, complejidad—, en `teoria.notacion` o entre `$…$`.

**El pseudocódigo nunca va en LaTeX.** Va en `<pre class="codigo">` con el resaltado de
`pseudo/fmt.js`. KaTeX ignora `pre` y `code` justamente para que esto no pueda romperse por
accidente.

### Fechas y horario

El horario —**lunes y martes de 7:00 a 9:00**— es dato del curso en `data/core.js`, no un ajuste
del usuario. De él salen la próxima clase de la portada y las sesiones de cada semana en la ruta
y el cronograma.

Los recesos existen en `data/cronograma` porque el cálculo de semanas los necesita, pero **no se
pintan en ningún sitio**: ni en el camino, ni en la ruta, ni en la agenda. La agenda de la portada
sólo lleva lo que cambia una decisión: parciales, laboratorios, proyecto, final y el tema que
empieza cada semana.

---

## Los cuatro cortes

| Corte | Contenido | Horas | Semanas | Meta |
|---|---|---:|---|---|
| 1 | Vectores y matrices | 20 | 1 – 6 | **Parcial 1** (25 %), 31 ago – 4 sep |
| 2 | Cadenas de caracteres | 4 | 7 – 10 | **Laboratorio 1** (15 %), hasta el 2 oct |
| 3 | Subrutinas y funciones | 18 | 7 – 12 | **Parcial 2** (20 %), 19 – 23 oct |
| 4 | Recursividad y memoria | 14 | 13 – 16 | **Proyecto** (10 %) · **Lab 2** (10 %) · **Final** (20 %) |

**27 temas · 42 ejemplos ejecutables · 311 ejercicios · 42 ejercicios propuestos del manual ·
88 soluciones en pseudocodigo verificadas por el motor · 22 patrones · 18 visualizadores.**

Los ejercicios llevan su procedencia: `del manual` (propuestos del texto guia), `cayo en parcial`
(evaluaciones reales) y `clasico` (enunciados convencionales de AyP II en segundo semestre:
notas de estudiantes, ventas, temperaturas, cedulas, nomina, asistencia).

Los cortes 2 y 3 se solapan en el calendario y eso es correcto: el syllabus dicta cadenas y
procedimientos en paralelo.

> Las fechas están **derivadas** del calendario institucional 2026-30 (el syllabus da números de
> semana, no fechas). Confirma las de los parciales en la primera clase y ajusta `data/core.js`.

---

## El motor de pseudocódigo

Vive en `pseudo/` y es lo que distingue esta app de un PDF.

```
lexer.js    texto → tokens
parser.js   tokens → AST
fmt.js      AST → texto, en cualquiera de los dos dialectos
interp.js   AST → traza (lista completa de estados)
```

### Los dos dialectos

El profesor escribe de dos maneras y la app entiende ambas sin configuración:

| | Libro (*Manual de Informática II*) | Parcial (exámenes) |
|---|---|---|
| | `INICIO … FIN` | `Inicio … Fin` |
| | `V(I)`, `M(I,J)` | `V[i]`, `M[i][j]` |
| | sin declarar tipos | `Entero A[9], S, X` |
| | `PARA I=1,N,1 HAGA … F-PARA` | `Para i=1,N,1 hacer … Finpara` |
| | `mayor ← MAY` | `Retorna CC` |

El conmutador **Libro | Parcial** de cada traza re-imprime el mismo AST en la otra notación y
vuelve a ejecutar, así que los números de línea siguen cuadrando. Escribir a mano las dos
versiones garantizaría que se desincronizaran; generarlas del mismo AST garantiza lo contrario.

### Decisiones que hacen que el motor coincida con lo que el profesor califica

- **Índices base 1.** `V(1)` es el primer elemento; `V(0)` es error, con el mensaje que lo explica.
- **`←` asigna, `=` compara.** Un `=` en posición de sentencia da error con sugerencia.
- **`||` concatena cadenas**; el «o lógico» es la palabra `o`.
- **`<>` es distinto**; `!=` da error con sugerencia.
- **Una función devuelve un solo dato.** Devolver un arreglo es error: obliga a subrutina.
- **`EJECUTE` sólo para subrutinas**, y las funciones sólo se usan por su valor.
- **Las locales mueren al retornar** — es lo que hace fallar la prueba de escritorio del preparcial.
- **Palabras contextuales.** `Y`, `CADENA` y `leer` son a la vez palabras del lenguaje y nombres
  que usa el profesor (`Entero … S, Y, X`; `FUNCION verificar (CADENA)`; `SUBRUTINA leer(V,T,I)`).
  El lexer las emite como identificadores y el contexto decide; los nombres que el usuario declara
  ganan siempre sobre la palabra clave.
- **Corte de seguridad** a 20 000 pasos y 120 marcos, con el mensaje que remite al método de las
  dos preguntas. Ese error es una lección, no un fallo.

### La hoja de prueba de escritorio

Pestaña **Hoja** de cada traza. Reproduce el formato de la hoja de respuestas del parcial: **una
fila por vuelta del ciclo principal**, arrastrando el último valor conocido de cada columna aunque
la ejecución esté dentro de una función —que es exactamente lo que se hace a mano.

Una columna puede ser una variable (`i`, `au`) o una casilla indexada (`C[i]`).

Dos modos: **Ver** (se llena sola, sincronizada con el reproductor) y **Resolver** (aparece vacía;
al comprobar, cada celda errada enlaza al **paso exacto** de la traza donde se torció). Las celdas
en blanco no cuentan como fallo.

En `#/corte/3/tema/pila-llamadas` está el punto 1 del preparcial real ("R4_Info") con datos
precargados: sale la contraseña completa `23 52 11 74 32 65 43 87`.

---

## Estructura

```
app/
├── index.html
├── manifest.json      instalable como aplicación
├── sw.js              precaché (no se registra en localhost)
├── _test.html         batería de 17 pruebas del motor — ábrela por HTTP
├── assets/            fuentes Geist, Geist Mono y Plus Jakarta Sans, iconos
├── css/               fonts · tokens · base · layout · components · traza · views
├── data/              core · patrones · unidad1..5 · temas-extra
│                      banco1..4 (311 ejercicios) · propuestos · examenes
├── pseudo/            lexer · parser · fmt · interp
└── js/                icons · store · model · traza · views · router · app
```

### Añadir contenido

Todo vive en `data/`. Un tema tiene esta forma:

```js
{
  id: 'burbuja', titulo: 'Ordenamiento por el método de la Burbuja',
  corte: 'arreglos', semana: 3, horas: 3,
  manual: '§1.1 ej. 2',        // dónde está en el Manual de Informática II
  clave: true,                 // marca «clave en la meta»
  resumen: '…',
  teoria: { concepto, procedimiento: [], logica, trampas: [] },
  patrones: ['intercambio', 'doble-ciclo'],   // ids de data/patrones.js
  ejemplos: [{
    id, enunciado, fuente,
    codigo: `…pseudocódigo…`,
    entradas: [6, 5, 2, 9],    // lo que consumen los LEA, en orden
    precarga: { A: [...] },    // arreglos ya poblados
    hoja: ['I', 'J', 'T'],     // columnas de la prueba de escritorio
    dialecto: 'libro',         // o 'parcial'
    explicacion: '…'
  }],
  banco: [{ id, enunciado, dificultad, estructura: [], nota, fuente }]
}
```

#### Reglas de escritura (obligatorias)

1. **El pseudocódigo se escribe en el dialecto Libro.** El conmutador genera el Parcial solo.
2. **Todo `codigo` tiene que compilar y correr.** Al arrancar, `AYP.model.validar()` pasa cada
   ejemplo por el motor y avisa por consola. Un ejemplo que no corre no sirve para nada aquí.
3. **`entradas` y `precarga` son obligatorias si el código las necesita**, o la traza se corta.
4. **Nada de `<` ni `>` sueltos en prosa**: todo se inyecta con `innerHTML`.
5. **Convenciones de cifras en español**: coma decimal, espacio antes del `%` y de la unidad.
6. **`fuente` en todo lo que venga del manual o de un examen.** Es lo que separa «esto lo pregunta
   el profesor» de «esto lo inventamos».
7. **Un `id` único por ejercicio**: es la llave del progreso.
8. **Ningún `font-size` fuera de los tokens** de `css/tokens.css`, o se rompe el ajuste de letra.

---

## Sistema visual

Heredado literalmente de la app de Cálculo II: mismos tokens, mismas fuentes, mismas reglas.

- **Tipografía:** Plus Jakarta Sans en titulares, Geist en el cuerpo, **Geist Mono en todo el
  pseudocódigo**. Seis pasos de tamaño en `rem`.
- **Color:** neutro para lo estructural, **violeta** como único acento (el examen y lo que apunta
  a él), verde = dominado/correcto, ámbar = pendiente, rojo **sólo** para errores reales, y
  **azul reservado a la visualización**.
- **Sub-paleta de traza:** no introduce ningún matiz nuevo; todo se deriva de los tokens que ya
  existen (`--trace-line`, `--cell-read`, `--cell-write`, `--cell-dim`, `--ptr`).
- **Jerarquía dura:** mientras hay un paso activo, el resaltado de sintaxis **cede**. Lo que tiene
  que leerse de un vistazo es el estado, no los colores del código.
- **El color nunca va solo:** celda leída con borde punteado, escrita con borde sólido y negrita,
  descartada tachada, puntero con un triángulo. Con `prefers-reduced-motion` desaparece el
  movimiento pero no los estados.

---

## Tu progreso

- Se guarda en `localStorage`, clave `aypii_estudio_v1`.
- Tres estados por ejercicio: pendiente · intentado · dominado. Los temas se marcan desde su
  barra inferior.
- Las notas se escriben en `#/corte/N/meta` y la portada calcula el acumulado y **qué necesitas de
  promedio en lo que falta** para llegar a 3,0.
- **Ajustes → Exportar** genera un `.json`; **Importar** lo restaura.

---

## Qué falta (pendiente deliberadamente)

- **Visualizadores especializados.** La traza universal cubre el estado; faltan las piezas que
  muestran la *forma* de un algoritmo (barras de la Burbuja, árbol de recursión, selector de
  recorridos de matriz, ventana deslizante sobre cadenas). Están catalogados en
  `../PROMPT_ClaudeCode_AyPII.md` §7, en orden de rendimiento.
- **Simulacro con cronómetro** (`#/corte/N/simulacro`).
- **Búsqueda global** con Ctrl+K.
- **Puente a Java** (`pseudo/java.js`): traducir el AST señalando el desfase de base 1 a base 0.

---

## Fuentes

- **Normativa:** *Syllabus IST 2089*, Departamento de Ingeniería de Sistemas, Universidad del
  Norte, 2026-30. Profesor Daladier Jabba M., NRC 2034 y 2035.
- **Texto guía y fuente de la notación:** Jabba, Daladier. *Manual de Informática II*, Ediciones
  Uninorte, 2000 (91 páginas). El profesor es el autor: la notación, los ejemplos y buena parte de
  los enunciados de examen salen de ahí.
- **Pedagógica:** *Preparcial Segundo Parcial IST 2089*, periodo 202430.

El detalle completo de la materia está en `../AyPII_Base_Conocimiento_2026-30.md`, y la
especificación de la app en `../PROMPT_ClaudeCode_AyPII.md`.
