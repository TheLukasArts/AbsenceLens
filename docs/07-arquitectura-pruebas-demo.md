# Arquitectura, pruebas y demostración

Este documento recoge una propuesta inicial, no una selección irreversible de librerías.

## Enfoque arquitectónico

Aplicación Angular estática, local-first y sin backend. La arquitectura limpia o hexagonal se aplicará de manera minimalista para aislar reglas, entradas y salidas sin crear capas vacías.

```text
Excel sintético/real autorizado
            ↓
Adaptador de libro XLSX
            ↓
Perfil de importación + normalización
            ↓
Casos de uso
            ↓
Motor de reglas de dominio
            ↓
Consultas y modelos de presentación
            ↓
Pantallas / gráficos / exportación XLSX
```

## Dominio inicial

- `EmployeeId`
- `AbsenceEpisode`
- `VacationDay`
- `VacationPeriod`
- `WorkCentre`
- `LocationCode`
- `AnalysisPeriod`
- `CutoffDate`
- `RecurrenceWindow`
- `CandidateMatch`
- `MatchExplanation`
- `Holiday`
- `HolidayCalendar`

Las filas originales pueden conservarse en un modelo de importación separado para tabla, filtros y exportación. El dominio no debe depender de nombres de cabecera o estructuras de Excel.

## Casos de uso iniciales

- `ImportAbsenceWorkbook`
- `ValidateImportedRows`
- `NormalizeAbsenceRecords`
- `GroupConsecutiveVacationDays`
- `FindShortDurationRecurrences`
- `FindLongDurationCandidates`
- `FilterCandidateResults`
- `BuildCandidateExplanation`
- `ExportCandidateWorkbook`
- `ClearAnalysisSession`

Casos de uso futuros:

- `FindVacationAdjacencies`
- `FindHolidayAdjacencies`
- `CalculateAbsenteeismMetrics`
- `BuildProfileAggregates`

## Puertos y adaptadores candidatos

### Puertos

- `WorkbookReader`
- `ImportProfileProvider`
- `HolidayCalendarProvider`
- `CandidateReportExporter`
- `Clock` para controlar fecha actual y pruebas deterministas

### Adaptadores

- Lector `.xlsx` en navegador.
- Perfil integrado `ausencias-v1`.
- Calendarios incluidos en recursos estáticos.
- Exportador `.xlsx`.
- Reloj del sistema en producción y reloj fijo en pruebas.

## Estado y rendimiento

- El archivo completo sustituye la sesión anterior.
- No se necesita base de datos para 15.000 filas.
- Medir primero antes de introducir Web Worker.
- Si la lectura o cálculo bloquea perceptiblemente la UI, mover importación y reglas puras a un Worker.
- No persistir filas en `localStorage` o `IndexedDB` en el MVP.
- Los filtros deben operar sobre estructuras normalizadas y mantener referencia segura a las filas de detalle.

## Estrategia de pruebas

### Unitarias de dominio

- Duración inclusiva de un día.
- Límites exactos de 30 y 180 días.
- Final `31/12/2999` recortado a fecha de corte.
- Inicio posterior al corte excluido con advertencia.
- Final no centinela posterior al corte recortado con advertencia.
- Cambio de mes, año y año bisiesto.
- Intersección parcial con periodo de análisis.
- Episodio iniciado antes de ventana pero finalizado dentro.
- Cinco episodios frente a cuatro.
- Varias ventanas de recurrencia.
- Ordenación por cantidad y recencia.
- Top 10 global y top 10 tras filtrar centros.
- Una fila por empleado largo con selección de su máximo.
- Desempate de larga duración por inicio y nómina.
- Agrupación de vacaciones consecutivas.
- Días de vacaciones no consecutivos.
- Adyacencia anterior y posterior.

### Propiedades e invariantes

- Los días dentro del periodo nunca superan la duración total efectiva.
- La duración efectiva nunca es negativa.
- Aplicar el mismo archivo y configuración produce el mismo resultado.
- Filtrar centros no puede introducir empleados de centros excluidos.
- Un empleado aparece una sola vez en el top si la vista es por empleado.
- La suma por centros debe reconciliar con el total cuando las categorías son exclusivas.

### Integración

- Libro sintético de aceptación `absence-lens-aceptacion-v1.xlsx` con 73 filas y resultados definidos en `docs/10-casos-aceptacion.md`.

- Libro compatible completo.
- Cabecera ausente o alterada.
- Fecha Excel numérica y texto español.
- Identificador con ceros iniciales.
- Categoría desconocida.
- Exportación y relectura del resultado.
- Importación y análisis sin solicitudes de red.

### Rendimiento

- Libro sintético de aproximadamente 15.000 filas y tamaño representativo.
- Tiempo de importación, normalización, cálculo, filtrado y exportación.
- Verificación de que la interfaz mantiene respuesta suficiente en portátil.

## Estrategia de desarrollo con IA

- Trabajar en incrementos verticales pequeños.
- Pedir a Codex implementación y pruebas de una capacidad delimitada.
- Revisar diffs y ejecutar pruebas antes de aceptar.
- Registrar decisiones en el documento de decisiones.
- Mantener ejemplos de propuestas de IA corregidas o rechazadas.
- No solicitar una generación completa y no revisada del repositorio.

## Demostración propuesta, menos de cinco minutos

1. Presentar el problema y la garantía de procesamiento local.
2. Cargar un Excel sintético de aproximadamente 15.000 filas.
3. Mostrar validación, fecha de corte y resumen de importación.
4. Abrir recurrentes de corta duración y explicar una coincidencia.
5. Abrir larga duración, mostrar el top global y filtrar uno o varios centros.
6. Mostrar una advertencia de duración total frente a días del periodo.
7. Mostrar filtros, ordenación y uno o dos gráficos agregados si están incluidos.
8. Exportar el listado a Excel.
9. Enseñar brevemente arquitectura, pruebas, CI y ausencia de peticiones de red.

## Posible estructura de pantallas

1. Inicio y privacidad.
2. Importación y validación.
3. Panel de análisis.
4. Recurrentes de corta duración.
5. Larga duración.
6. Detalle explicable.
7. Ayuda, límites y privacidad.

Evitar navegación extensa. Los dos listados principales deben quedar accesibles desde el panel mediante acciones evidentes.
