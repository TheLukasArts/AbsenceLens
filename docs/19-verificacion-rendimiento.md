# Verificación de rendimiento

## Estado

Medición de referencia realizada el 21/08/2026 sobre el **despliegue oficial** en GitHub Pages, con un archivo real de 150.000 filas. La aplicación mide sus propias fases y muestra la duración en pantalla, de modo que la cifra es directamente comprobable por cualquiera que repita la operación.

Existe además una medición local reproducible sobre un conjunto sintético equivalente, que sirve de guardia de regresiones en la suite automatizada.

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

El número de empleados **no es un parámetro fijo**: se deriva del volumen para mantener la densidad de
referencia de unos 10,75 episodios de baja por empleado en dos años. Esa densidad es la que determina
que aparezcan candidatos de recurrencia corta, porque la regla exige cinco episodios dentro de la
ventana de doce meses. Un libro pequeño repartido entre una plantilla grande no produce ninguno.

Se regenera con:

```bash
pnpm sample:large
```

El generador es determinista: con la misma semilla produce el mismo libro, de modo que las
mediciones son comparables entre ejecuciones.

## Resultados

### Medición de referencia: despliegue oficial y archivo real

Entorno: `https://thelukasarts.github.io/AbsenceLens/`, navegador de escritorio, archivo real de 150.000 filas.

| Fase | Tiempo |
| --- | --- |
| Importación completa (lectura, decodificación y validación) | **5,4 s** |
| Análisis completo (normalización, R1, R2 y proyección de revisión) | **0,2 s** |

Filas válidas reconocidas: 149.999.

**El coste está dominado por la lectura del archivo**, no por las reglas de negocio. Analizar 150.000
filas cuesta dos décimas de segundo; lo que se percibe como espera es descomprimir y decodificar el
`.xlsx`.

Del archivo empleado solo se anotaron la duración y el número de filas, conforme al procedimiento
recogido en `docs/05-privacidad-etica-seguridad.md`. No se copió al repositorio ni se conservó.

### Medición local reproducible: conjunto sintético

Entorno: Windows, Node.js 24, suite automatizada.

| Fase | Tiempo orientativo |
| --- | --- |
| Lectura y decodificación del `.xlsx` | 4 a 15 s |
| Validación del perfil de importación | 0,3 a 0,7 s |
| Análisis completo | 0,3 a 0,7 s |

Estos valores **varían mucho según la carga de la máquina**: la misma prueba mide 3,7 s de lectura con
el equipo en reposo y casi 15 s con el servidor de desarrollo y el compilador en marcha. Por eso la
prueba automatizada no comprueba un tiempo concreto, sino que valida y analiza por debajo de diez
segundos cada uno: el objetivo es detectar una regresión de orden de magnitud, no medir la máquina.

### Resultados obtenidos sobre los conjuntos sintéticos

| Libro | Filas | Candidatos R1 | Candidatos R2 |
| --- | --- | --- | --- |
| Demostración | 15.000 | 106 | 44 |
| Rendimiento | 150.000 | 968 | 507 |

> Los recuentos de candidatos no son representativos de un caso real. Los datos sintéticos se
> distribuyen de forma uniforme, lo que produce muchas más coincidencias de las que aparecerían en un
> histórico real. Los conjuntos sirven para medir volumen y tiempo y para tener ejemplos con
> resultados en ambas reglas, no para estimar resultados de negocio.

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
| 21/08/2026 | Medición de referencia sobre el despliegue oficial con archivo real | Sustituye las estimaciones aproximadas por cifras comprobables en producción |
| 21/08/2026 | El generador deriva la plantilla del volumen en lugar de fijarla | El libro de demostración pasa de no producir ningún candidato de recurrencia corta a producir 106 |

## Decisiones pendientes

- El uso de un Web Worker sigue sin justificarse: el análisis tarda menos de un segundo y la lectura
  ocurre antes de que haya nada que mostrar. Se revisará si alguna fase supera el umbral perceptible.
- Las optimizaciones de la vista de revisión no se han abordado porque sus proyecciones no se
  evalúan mientras no estén enlazadas a una tabla.
