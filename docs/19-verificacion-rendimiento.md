# Verificación de rendimiento

## Estado

Medición realizada el 21/08/2026 sobre el conjunto sintético de 150.000 filas. Los tiempos son
reproducibles: el libro se genera con semilla fija y la prueba automatizada vuelve a medirlos en cada
ejecución de la suite.

## Por qué existe este documento

La presentación afirma que la aplicación procesa un libro de unas 150.000 filas en unos segundos.
Una afirmación de rendimiento sin método ni cifras no es verificable, así que aquí quedan
registrados el procedimiento, el entorno y los resultados.

## Volumetría de referencia

Un archivo mensual habitual contiene aproximadamente:

| Concepto | Filas |
| --- | --- |
| Episodios de baja | ~21.500 |
| Días de vacaciones | ~128.500 |
| **Total del archivo** | **~150.000** |

La diferencia de magnitud entre ambos conceptos tiene una causa concreta: **las vacaciones se
registran como una fila por cada día disfrutado**, mientras que una baja ocupa una única fila para
todo el episodio. Por eso el número de filas es casi siete veces el número de episodios de baja.

## Conjunto sintético

`samples/absence-lens-rendimiento-150000.xlsx` reproduce esa forma con datos inventados:

- 150.000 filas de datos, 21.495 episodios de baja y 128.505 filas de vacaciones.
- 2.000 identificadores de nómina ficticios, como texto y con ceros a la izquierda.
- Dos años de histórico terminando en la fecha de corte de referencia, 31/07/2026.
- Códigos de centro neutros, sin correspondencia con ningún inventario real.
- Fechas escritas como texto `DD/MM/AAAA`, para no depender del formato de celda.
- Una fracción de episodios abiertos con el centinela `31/12/2999`.
- La columna de días declarados se rellena de forma deliberadamente inconsistente, ya que la
  aplicación descarta ese valor.

Se regenera con:

```bash
pnpm sample:large
```

El generador es determinista: con la misma semilla produce el mismo libro, de modo que las
mediciones son comparables entre ejecuciones.

## Resultados

Entorno: Windows, Node.js 24, ejecución local mediante la suite automatizada.

| Fase | Tiempo |
| --- | --- |
| Lectura y decodificación del `.xlsx` | 3,72 s |
| Validación del perfil de importación | 0,30 s |
| Análisis completo (normalización, R1, R2 y proyección de revisión) | 0,26 s |

Resultados obtenidos sobre ese conjunto: 968 candidatos de recurrencia corta, 507 de larga duración
y 21.495 filas de revisión.

**El coste está dominado por la lectura del archivo**, no por las reglas de negocio. Descomprimir y
decodificar el `.xlsx` supone más del ochenta por ciento del tiempo total; validar y analizar
150.000 filas cuesta poco más de medio segundo entre ambas fases.

> Los recuentos de candidatos no son representativos de un caso real. Los datos sintéticos se
> distribuyen de forma uniforme, lo que produce muchas más coincidencias de las que aparecerían en un
> histórico real. El conjunto sirve para medir volumen y tiempo, no para estimar resultados.

## Medición desde la aplicación

La aplicación mide sus propios tiempos con el reloj de alta resolución del navegador y los muestra al
terminar cada fase:

- al completar la importación, «Importación finalizada en X s»;
- al completar el análisis, «Análisis completado en X s».

Solo se conserva la duración. Ningún dato del archivo interviene en la medición ni se registra en
ningún sitio.

Para reproducirlo: abrir la aplicación, seleccionar el libro de 150.000 filas y leer los mensajes.

## Prueba automatizada

`src/app/application/performance.spec.ts` repite la medición en cada ejecución de la suite y
comprueba que la validación y el análisis se mantienen por debajo de diez segundos cada uno. Los
umbrales son holgados a propósito: deben detectar una regresión de orden de magnitud, no el ruido
propio de una máquina concreta.

La prueba se omite automáticamente si el libro no está presente, de modo que la suite sigue siendo
ejecutable sin él.

## Historial

| Fecha | Cambio | Efecto |
| --- | --- | --- |
| 20/08/2026 | Se elimina un recorrido cuadrático en la validación por fila | Evita el bloqueo de la interfaz al importar archivos grandes con errores |
| 21/08/2026 | Primera medición registrada con el conjunto sintético de 150.000 filas | Referencia para detectar regresiones |

## Decisiones pendientes

- El uso de un Web Worker sigue sin justificarse: el análisis tarda menos de un segundo y la lectura
  ocurre antes de que haya nada que mostrar. Se revisará si alguna fase supera el umbral perceptible.
- Las optimizaciones de la vista de revisión no se han abordado porque sus proyecciones no se
  evalúan mientras no estén enlazadas a una tabla.
