# Cobertura funcional de los dashboards de referencia

## Finalidad

Las capturas recibidas se utilizan únicamente para consolidar requisitos estructurales. No se almacenan, versionan ni reutilizan sus filas, identificadores, métricas o combinaciones reales. AbsenceLens no tiene que reproducir los dashboards de forma idéntica, pero debe cubrir la información necesaria mediante una interfaz propia, explicable y compatible con el procesamiento local.

## Cobertura del dashboard de candidatos

| Área de referencia | Cobertura prevista en AbsenceLens | Estado |
|---|---|---|
| Filtros globales | Filtros por centro, fechas, descripción y resto de columnas importadas | Confirmado para el MVP |
| Recurrentes | Listado R1 con identificador de nómina, número de episodios, recencia, ventana y explicación | Confirmado para el MVP |
| Larga duración | Listado R2 con top 10 global o por centros, episodio máximo y explicación | Confirmado para el MVP |
| Limitaciones | No existe campo ni regla equivalente en el perfil de importación actual | Pendiente de confirmar si debe quedar fuera |
| Detalle personal | Se utiliza `Nº Nómina`; no se importan ni muestran nombre o DNI | Conforme al alcance y a la minimización actuales |

## Cobertura del dashboard de absentismo

| Área de referencia | Cobertura prevista en AbsenceLens | Estado o dependencia |
|---|---|---|
| Evolución temporal | Gráfico de barras o líneas por periodo | Requiere definir métrica, periodicidad y denominador |
| Comparación con periodo anterior | Serie y tabla comparativa con diferencia | Requiere fórmula confirmada y periodos comparables |
| Ventana móvil de 12 meses | Opción de análisis móvil para métricas agregadas | Requiere definir la métrica y su cálculo; la ventana de recurrencia R1 ya está cerrada en D-036 |
| Indicadores de tasa y horas | Tasa, horas de ausencia, horas netas y medias | No calculables con el perfil actual sin fuente y fórmula adicionales |
| Perfil agregado | Distribuciones por rango de edad, `Ambito`, contrato y sexo | Funcionalidad importante; solo agregados y con mínimo de grupo pendiente |
| Tabla de detalle | Filas filtrables con las columnas importadas autorizadas | Confirmado, sin nombres ni DNI y sin atributos no presentes en el Excel |

## Principios de diseño visual

- Mantener la jerarquía reconocible de cabecera, filtros, indicadores, gráficos y tabla sin copiar la interfaz de la herramienta anterior.
- Respetar la paleta de marca en cabeceras, superficies, cuerpos, bordes y estados interactivos.
- Registrar los colores como tokens autorizados, preferiblemente en valores hexadecimales, antes de implementar el tema.
- No extraer ni versionar muestras de color desde capturas que contengan datos reales.
- Mantener contraste, foco visible y estados que no dependan únicamente del color.
- Utilizar lenguaje neutral: coincidencia, patrón temporal, candidato y revisión humana.

## Diferencias deliberadas

- AbsenceLens muestra explicaciones de reglas y advertencias de periodo que no tienen por qué existir en el dashboard anterior.
- No muestra nombres, DNI ni datos ausentes del perfil de importación.
- No calcula tasas u horas sin una fórmula y un denominador verificables.
- No incorpora una sección de limitaciones mientras no exista una necesidad confirmada y una fuente de datos compatible.