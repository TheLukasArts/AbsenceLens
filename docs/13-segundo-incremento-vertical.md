# Segundo incremento vertical: larga duración

## Estado

Especificación aprobada el 15/08/2026 y preparada para implementar.

## Identificación

- ID: `I-002`.
- Objetivo: añadir al flujo ya operativo el listado explicable R2 de larga duración y su top 10 por centros.
- Fixture de referencia: `absence-lens-aceptacion-v1.xlsx`.
- Fecha de corte de aceptación: `31/07/2026`.
- Umbral inclusivo de larga duración: `>= 180` días.

## Resultado demostrable

En menos de tres minutos, una persona debe poder:

1. importar y validar el archivo Excel de prueba;
2. elegir la fecha de corte y ejecutar el análisis;
3. alternar entre recurrencia corta y larga duración;
4. ver los nueve candidatos R2 esperados en el orden documentado;
5. seleccionar uno o varios centros y comprobar que el top se recalcula;
6. abrir la explicación de un candidato, incluidos sus episodios largos y advertencias;
7. quitar los filtros y recuperar el top global;
8. eliminar la sesión y volver al estado inicial.

## Alcance incluido

### Regla R2

- Considerar únicamente episodios de ausencia distintos de vacaciones.
- Excluir del análisis los episodios iniciados después de la fecha de corte.
- Utilizar la duración total efectiva inclusiva ya normalizada.
- Clasificar como largo un episodio con duración total efectiva mayor o igual a 180 días.
- Agrupar los episodios largos por `Nº Nómina`.
- Mostrar una sola fila por empleado.
- Elegir como representativo el episodio largo de mayor duración.
- Si varios episodios del empleado tienen la misma duración máxima, elegir el de inicio más reciente.
- Ordenar los empleados por:
  1. duración representativa descendente;
  2. inicio representativo descendente;
  3. `Nº Nómina` ascendente.
- Limitar el resultado a los primeros diez empleados después de construir las candidaturas y aplicar el filtro de centros.

### Filtro de centros

- Sin centros seleccionados, calcular el top sobre todas las candidaturas de empleados.
- Permitir seleccionar uno o varios valores de `Ubicación - Código`.
- Construir primero una única candidatura global por empleado y elegir su episodio largo representativo.
- Aplicar después el filtro al centro del episodio representativo de cada candidatura.
- Si un empleado tiene episodios en varios centros, conservar su episodio representativo global y mostrar los demás episodios largos en el detalle.
- No dividir ni duplicar al empleado por centros.
- Derivar las opciones disponibles de los centros representativos de las candidaturas R2 y ordenarlas alfabéticamente, sin interpretar el significado de los códigos.
- Recalcular el top al cambiar la selección, sin volver a leer, normalizar ni reagrupar el archivo.

### Interfaz

- Mantener el flujo de importación, fecha de corte y eliminación de sesión de `I-001`.
- Una única acción de análisis calcula R1 y R2 para la fecha de corte elegida.
- Ofrecer controles evidentes y accesibles para alternar entre ambos listados.
- Mostrar en la tabla R2:
  - posición;
  - `Nº Nómina`;
  - duración máxima efectiva;
  - inicio y final efectivo del episodio representativo;
  - centro del episodio representativo;
  - cantidad de episodios largos considerados;
  - indicador de episodio activo o recortado, cuando corresponda;
  - acción para consultar la explicación.
- Mostrar el número de resultados del conjunto filtrado y aclarar que la tabla está limitada a diez.
- Proporcionar un control accesible para limpiar el filtro de centros.

### Explicación R2

- Regla y versión: `R2-v1`.
- Fecha de corte y umbral de 180 días.
- Centros incluidos o indicación de conjunto global.
- Criterios de selección del episodio representativo y de ordenación.
- Episodios largos considerados para el empleado, identificando el representativo.
- Inicio, final original, final efectivo, duración efectiva, centro y fila de origen.
- Advertencias por final abierto o final ordinario posterior al corte.
- Mensajes saneados que no incluyan contenido adicional de las celdas.

## Decisiones confirmadas

1. El detalle R2 muestra los episodios largos considerados, no todos los episodios cortos del empleado.
2. R2 construye primero una candidatura global por empleado; el filtro de centros se aplica después al centro de su episodio representativo.
3. La misma acción de análisis calcula R1 y R2; cambiar de listado o filtro no vuelve a leer el Excel.
4. `I-002` no introduce un periodo visible independiente. Por ello muestra duración total efectiva, pero no una métrica de días dentro de un periodo todavía inexistente.

Las decisiones están registradas como D-049 a D-052 en `docs/06-decisiones-pendientes-roadmap.md`.

## Fuera del incremento

- Detección automática de totales y textos al pie de exportaciones.
- Importación parcial con revisión de filas erróneas.
- Cambios de lenguaje, previsualización de columnas y pulido visual general.
- Filtros avanzados por todas las columnas.
- Exportación de resultados.
- Periodo de análisis independiente y métricas de días dentro de ese periodo.
- Dashboards, gráficos, tasas e indicadores de horas.
- Vacaciones agrupadas visibles y reglas de adyacencia.
- Festivos y tablas enriquecidas de centros.
- Archivo de rendimiento de 15.000 filas y optimización mediante Web Worker.
- PWA, persistencia, backend, autenticación y telemetría.

## Diseño técnico

### Dominio puro

- Reutilizar `LocalDate`, `AbsenceEpisode` y las funciones de duración existentes.
- Crear tipos específicos `LongDurationCandidate`, `LongDurationExplanation` y `ExplainedLongEpisode`.
- Implementar R2 en un módulo de dominio independiente de R1, Angular y la librería de Excel.
- Evitar generalizar prematuramente `CandidateMatch`, que actualmente representa el contrato concreto de R1.

### Operación de dominio propuesta

`findLongDurationCandidates(episodes, cutoff, selectedCentres)`

La operación construye una candidatura global por empleado, filtra por el centro del episodio representativo, ordena y limita a diez. El conjunto vacío de centros representa la vista global.

### Estado de interfaz

- Conservar una sola colección normalizada por sesión.
- Mantener resultados R1 y R2 separados.
- Mantener la selección de centros como estado de presentación de R2.
- Restablecer resultados, filtros y explicaciones al importar otro archivo o eliminar la sesión.
- No persistir registros ni filtros en `localStorage`, `IndexedDB` o servicios remotos.

## Criterios de aceptación

### Top global

Con el fixture y la fecha de corte de referencia, R2 devuelve exactamente:

| Posición | Nº Nómina | Duración máxima | Inicio representativo | Centro |
| -------: | --------- | --------------: | --------------------- | ------ |
|        1 | `920010`  |             300 | `01/10/2024`          | `MAD`  |
|        2 | `920011`  |             250 | `01/12/2024`          | `BCN`  |
|        3 | `920003`  |             212 | `01/01/2026`          | `AGP`  |
|        4 | `920005`  |             212 | `01/01/2026`          | `AGP`  |
|        5 | `920006`  |             210 | `01/01/2025`          | `MAD`  |
|        6 | `920008`  |             200 | `01/02/2025`          | `BCN`  |
|        7 | `920009`  |             200 | `01/02/2025`          | `BCN`  |
|        8 | `920007`  |             200 | `01/01/2025`          | `MAD`  |
|        9 | `920001`  |             180 | `01/01/2025`          | `ABC`  |

### Filtros de centro

- `BCN`: `920011`, `920008`, `920009`.
- `MAD`: `920010`, `920006`, `920007`.
- `AGP`: `920003`, `920005`.
- `BCN + MAD`: `920010`, `920011`, `920006`, `920008`, `920009`, `920007`.
- Quitar todos los filtros recupera exactamente el top global.

### Casos obligatorios

- AC-05 y AC-06 para los límites 180/179.
- AC-07 y AC-08 para episodios activos largos y no largos.
- AC-16 para final ordinario posterior al corte.
- AC-17 para una sola fila por empleado y detalle de varios episodios largos.
- AC-18 para los desempates por inicio y nómina.
- AC-19 para el recálculo por centros.
- AC-22 para aritmética de fechas.
- AC-23 para demostrar que la duración de origen no interviene.

### Privacidad y accesibilidad

- Analizar, alternar vistas, filtrar, explicar y borrar no provoca peticiones de red.
- No se registra el nombre del archivo, la nómina ni valores de las filas.
- El conjunto de pruebas y demostración es completamente sintético.
- El listado y el filtro son utilizables con teclado.
- El estado del filtro y las advertencias no dependen únicamente del color.
- El detalle recibe el foco, se cierra con `Escape` y restaura el foco.

## Estrategia de pruebas

### Unitarias de dominio

- Límites exactos 179/180.
- Exclusión de vacaciones y episodios posteriores al corte.
- Final abierto y final ordinario posterior al corte.
- Máximo por empleado y desempate interno por inicio.
- Ordenación global y desempates entre empleados.
- Límite de diez resultados.
- Filtro único, filtro múltiple y filtro sin coincidencias.
- Empleado con episodios en centros distintos cuyo episodio representativo determina su pertenencia al filtro.
- Invariantes: una fila por empleado y centro representativo incluido en la selección.

### Integración

- Resultado R2 exacto a partir del fixture.
- Resultados exactos para `BCN`, `MAD`, `AGP` y `BCN + MAD`.
- R1 conserva sus siete resultados después de incorporar R2.
- La duración de origen sigue sin intervenir.

### Interfaz

- Alternancia R1/R2.
- Selección y limpieza de uno o varios centros.
- Actualización del contador y de la tabla sin nueva importación.
- Apertura, cierre y restauración de foco de la explicación R2.
- Estado vacío del filtro sin presentarlo como error.
- Eliminación de sesión restablece ambas vistas y filtros.

## Secuencia de construcción

1. Implementar tipos y función pura R2 con pruebas unitarias.
2. Verificar el fixture y los filtros de centro mediante pruebas de integración.
3. Integrar R2 en el estado de sesión sin modificar la importación.
4. Añadir alternancia de listados, filtro multiselección y tabla R2.
5. Añadir explicación y advertencias R2.
6. Ejecutar las regresiones de I-001 y verificar accesibilidad, ausencia de red y compilación.

Cada paso debe dejar las comprobaciones en verde y producir un cambio revisable de tamaño reducido.

## Definición de terminado

- Las cuatro decisiones están registradas como D-049 a D-052.
- Los criterios funcionales, de privacidad y accesibilidad están demostrados.
- El fixture produce exactamente el top global y los subconjuntos documentados.
- R1 continúa produciendo exactamente sus siete candidatos.
- Todas las pruebas relevantes y la compilación de producción pasan.
- No existen peticiones de red durante el flujo.
- No se añade funcionalidad fuera del incremento.
