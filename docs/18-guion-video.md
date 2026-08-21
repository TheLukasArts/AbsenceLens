# Guion del vídeo de demostración

## Ficha

| Dato               | Valor                                                           |
| ------------------ | --------------------------------------------------------------- |
| Duración objetivo  | 6 a 7 minutos                                                   |
| Tono               | Comercial: qué es, a quién ayuda, qué le ahorra y qué garantiza |
| Formato            | Voz en off sobre captura de pantalla, sin cámara                |
| Grabación          | Por tramos, montados después                                    |
| Herramienta        | OBS Studio                                                      |
| URL de publicación | `https://thelukasarts.github.io/AbsenceLens/video/`             |

La parte técnica —arquitectura, capas, librerías y decisiones— **no entra en el vídeo**. Está en la
presentación y en la documentación. Aquí solo se enseña el producto funcionando.

## Lenguaje obligatorio

Según `AGENTS.md`, durante toda la locución:

- Usar: coincidencia, patrón temporal, candidato, revisión humana, episodio.
- Evitar: fraude, sospechoso, culpable, riesgo del empleado, absentista, y cualquier recomendación
  disciplinaria.
- No decir «detecta empleados que abusan». Decir «señala coincidencias para que una persona las
  revise».

## Preparación antes de grabar

1. OBS Studio a 1920×1080, 30 fps, escena de captura de pantalla completa.
2. Zoom del navegador al 100 % y ventana maximizada.
3. Escritorio limpio: sin iconos personales, sin nombres de carpetas identificables.
4. Notificaciones silenciadas en el sistema y en el navegador.
5. `samples/absence-lens-aceptacion-v1.xlsx` accesible desde el explorador de archivos.
6. Aplicación abierta en `https://thelukasarts.github.io/AbsenceLens/` con la sesión vacía.
7. Pestaña de red de las herramientas de desarrollo preparada, pero cerrada hasta el tramo 6.
8. Ensayo completo cronometrado antes de la toma buena.

## Tramos

Cada tramo se graba por separado. El corte entre tramos permite repetir uno sin rehacer el resto.

---

### Tramo 1 · Portada y gancho — 0:00 a 0:40

**En pantalla:** diapositiva de portada de la presentación.

> Cada cierto tiempo, alguien recibe un archivo Excel con el histórico de ausencias de su
> organización. Dos años de datos. Unas quince mil filas. Catorce columnas.
>
> Y una pregunta que responder: ¿qué personas presentan patrones que convenga revisar?
>
> Hoy eso se hace a mano. Filtrar, ordenar, mirar, anotar. Y volver a empezar con la siguiente
> exportación.
>
> Esto es AbsenceLens.

**Corte.**

---

### Tramo 2 · El problema desde la persona usuaria — 0:40 a 1:20

**En pantalla:** el archivo Excel de ejemplo abierto, desplazándose por las filas sin detenerse.

> El archivo no tiene nada de raro. Una fila por episodio de baja, una fila por día de vacaciones,
> fechas de inicio y de fin, el centro de trabajo.
>
> El problema aparece al buscar. Localizar quién ha tenido cinco o más procesos cortos en el último
> año exige cruzar fechas una por una. Y cuando por fin aparece un nombre, hay que reconstruir a
> mano por qué ha salido, porque nadie acepta una lista sin explicación.
>
> Es un trabajo lento, repetitivo y fácil de equivocar.

**Corte.** Cerrar Excel antes del siguiente tramo.

---

### Tramo 3 · Qué es AbsenceLens — 1:20 a 1:50

**En pantalla:** la aplicación recién abierta, sin datos cargados.

> AbsenceLens hace ese cribado en unos segundos, y explica cada resultado.
>
> Es una aplicación web que se abre en el navegador. No hay que instalar nada, no hay que
> registrarse, y no hay ningún servidor detrás. Ahora mismo verás por qué eso importa.

**Corte.**

---

### Tramo 4 · Importar y analizar — 1:50 a 3:00

**En pantalla, en este orden:**

1. Arrastrar `absence-lens-aceptacion-v1.xlsx` sobre la zona de importación.
2. Dejar que se vean el resumen de validación y el número de registros.
3. Señalar la fecha de corte, que ya viene propuesta.
4. Pulsar Analizar.

> Se selecciona el archivo. También se puede arrastrar directamente.
>
> La aplicación lo valida antes de nada: comprueba que están las columnas esperadas, que las fechas
> son fechas y que los números de nómina se conservan tal cual, con sus ceros a la izquierda.
>
> Después se elige la fecha de corte. Por defecto propone el último mes completo, para que el
> análisis sea reproducible: si mañana repites el mismo análisis con la misma fecha, obtienes
> exactamente el mismo resultado.
>
> Y ya está. Análisis hecho.

**Corte.**

---

### Tramo 5 · Los resultados y la explicación — 3:00 a 5:00

**En pantalla, en este orden:**

1. Pestaña de recurrencia corta con sus candidatos.
2. Abrir la ficha de un candidato y recorrer los episodios contabilizados y descartados.
3. Cerrar la ficha y pasar a larga duración.
4. Aplicar un filtro por centro y mostrar cómo cambia el listado.
5. Pasar a la pestaña de revisión y aplicar un filtro cualquiera.
6. Exportar y abrir el Excel generado.

> Aquí está el primer listado: personas con al menos cinco episodios de hasta treinta días dentro
> del último año.
>
> Y esta es la parte importante. Al abrir la ficha no aparece una puntuación ni una etiqueta:
> aparece el porqué. Qué episodios se han contado, cuáles se han descartado y por qué motivo, qué
> ventana de fechas se ha evaluado y con qué criterio se ha ordenado la lista. Todo comprobable
> contra el archivo original.
>
> El segundo listado recoge los episodios de larga duración, de ciento ochenta días o más. Se puede
> filtrar por centro de trabajo.
>
> La vista de revisión reúne a todos los candidatos en una sola tabla, con filtros para acotar lo
> que interesa mirar.
>
> Y cuando hace falta compartir el resultado, se exporta a Excel. Los números de nómina salen como
> texto, sin perder los ceros iniciales.

**Corte.**

---

### Tramo 6 · La privacidad, demostrada — 5:00 a 6:00

**En pantalla, en este orden:**

1. Abrir las herramientas de desarrollo en la pestaña de red.
2. Repetir un análisis y un filtro con la pestaña visible, mostrando que no aparece ninguna petición.
3. Pulsar Borrar datos y confirmar.

> Vuelvo al principio, porque esto es lo que de verdad diferencia a AbsenceLens.
>
> Voy a abrir la pestaña de red del navegador, la que muestra todo lo que sale del equipo. Y voy a
> repetir el análisis con ella abierta.
>
> No aparece nada. Ni una sola petición.
>
> El archivo nunca se sube a ningún sitio. No hay servidor, no hay base de datos, no hay analítica y
> no se guarda nada. Todo ocurre en la memoria del navegador, y al pulsar este botón desaparece.
>
> Para quien maneja datos de personas, esa garantía no es una opción de configuración: es la forma
> en que está construida la aplicación.

**Corte.**

---

### Tramo 7 · Cierre — 6:00 a 6:40

**En pantalla:** diapositiva de cierre de la presentación.

> AbsenceLens convierte horas de filtrado manual en unos segundos, y entrega una lista corta que
> cualquiera puede verificar.
>
> No decide nada. No clasifica a nadie. Señala coincidencias temporales y explica por qué aparecen,
> para que sea una persona quien revise y decida.
>
> Está publicada, es gratuita y el código es abierto. Los enlaces están en pantalla.
>
> Gracias por ver la demostración.

**Fin.**

## Comprobaciones tras el montaje

- [ ] Duración total entre 6 y 7 minutos.
- [ ] No aparece ningún dato real ni nombre identificable en ningún fotograma.
- [ ] No se ve ninguna ruta local que revele carpetas personales.
- [ ] La pestaña de red se ve con claridad y sin peticiones durante el tramo 6.
- [ ] El audio mantiene un volumen homogéneo entre tramos.
- [ ] No se ha usado ninguna palabra de la lista prohibida.
- [ ] Se sube el vídeo y se actualiza el destino de `public/video/index.html`.
