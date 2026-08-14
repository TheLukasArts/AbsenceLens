# Primer incremento vertical: importación y recurrencia corta

## Identificación

- ID: `I-001`.
- Objetivo: demostrar el flujo completo desde un `.xlsx` sintético hasta un listado explicable de candidatos R1.
- Fixture de referencia: `absence-lens-aceptacion-v1.xlsx`.
- Fecha de corte de aceptación: `31/07/2026`.
- Ventana R1 inclusiva: `01/08/2025` a `31/07/2026`.

## Resultado demostrable

En menos de dos minutos, una persona debe poder:

1. abrir AbsenceLens y leer la garantía de procesamiento local;
2. seleccionar el Excel sintético de aceptación;
3. ver que la estructura y las filas han sido validadas;
4. confirmar o modificar la fecha de corte;
5. ejecutar el análisis de recurrencia corta;
6. ver los siete candidatos esperados en el orden documentado;
7. abrir la explicación de uno de ellos;
8. eliminar la sesión y volver al estado inicial.

## Alcance incluido

### Interfaz

- Pantalla inicial con mensaje de privacidad y selector de archivo.
- Estado de lectura y validación accesible.
- Resumen de importación sin mostrar datos personales en mensajes o logs.
- Selector de fecha de corte con valor inicial calculado mediante un reloj inyectable.
- Acción explícita para ejecutar el análisis.
- Tabla R1 con:
  - `Nº Nómina`;
  - número de episodios contabilizados;
  - inicio del episodio más reciente;
  - límites de la ventana evaluada;
  - acción para consultar la explicación.
- Detalle explicable con episodios incluidos y excluidos, duración efectiva y advertencias.
- Acción para eliminar de memoria la sesión.

### Importación y normalización

- Un único `.xlsx`, una hoja y cabecera en la primera fila.
- Perfil integrado y versionado `ausencias-v1` con las 14 cabeceras exactas.
- `Nº Nómina` conservado como texto.
- Fechas convertidas a un tipo de calendario sin hora ni dependencia de zona horaria.
- Final `31/12/2999` y finales posteriores al corte recortados según las reglas confirmadas.
- Episodios iniciados después del corte excluidos con advertencia.
- Columna de duración del origen descartada.
- Filas de vacaciones reconocidas, aunque su agrupación no se muestra todavía en la interfaz.

### Regla R1

- Duración corta `<= 30` días inclusivos.
- Al menos 5 episodios cortos iniciados dentro de la única ventana de 12 meses terminada en el corte.
- Orden por cantidad descendente, inicio más reciente descendente y nómina ascendente.
- Explicación de episodios incluidos y de episodios que solo intersectan la ventana.

## Fuera del incremento

- Regla R2 y top de larga duración.
- Filtros avanzados por todas las columnas.
- Exportación de resultados.
- Dashboards, gráficos, tasas e indicadores de horas.
- Vacaciones agrupadas visibles y reglas de adyacencia.
- Festivos y tablas de centros.
- PWA, persistencia, backend, autenticación y telemetría.
- Archivo de rendimiento de 15.000 filas y optimización mediante Web Worker.

## Diseño técnico

### Dominio puro

- `EmployeeId`: texto no vacío y estable.
- `LocalDate`: año, mes y día sin hora ni zona horaria.
- `AbsenceEpisode`: identificador técnico de sesión, empleado, inicio, final original, final efectivo, descripción y centro.
- `CutoffDate` y `RecurrenceWindow`.
- `CandidateMatch` y `MatchExplanation`.

Las funciones de duración, intersección, clasificación y ordenación no dependen de Angular ni de la librería `.xlsx`.

### Casos de uso

1. `ImportAbsenceWorkbook`.
2. `ValidateImportedRows`.
3. `NormalizeAbsenceRecords`.
4. `FindShortDurationRecurrences`.
5. `BuildCandidateExplanation`.
6. `ClearAnalysisSession`.

### Puertos iniciales

- `WorkbookReader`.
- `ImportProfileProvider`.
- `Clock`.

El adaptador `.xlsx` se seleccionará mediante una decisión técnica breve antes de implementarlo. El dominio recibirá estructuras neutrales y no conocerá celdas, hojas o cabeceras.

### Estado de interfaz

```text
vacío → leyendo → validando → listo → analizando → resultados
  ↑          ↘ error de archivo/fila ↗                 ↓
  └──────────────── eliminar sesión ───────────────────┘
```

No se persisten filas en `localStorage`, `IndexedDB` ni servicios remotos.

## Contrato de validación

### Errores bloqueantes

- extensión distinta de `.xlsx`;
- número de hojas distinto de uno;
- cabeceras ausentes, duplicadas, adicionales o con grafía incompatible;
- identificador, inicio, final o descripción obligatorios ausentes;
- fecha ilegible o final anterior al inicio.

### Advertencias no bloqueantes

- episodio iniciado después de la fecha de corte;
- final ordinario posterior a la fecha de corte;
- episodio que intersecta la ventana pero comenzó antes;
- valor de duración de origen presente pero descartado.

Para `I-001`, cualquier error de fila impide ejecutar el análisis y se presenta únicamente mediante número de fila, columna y código de error saneado. La posibilidad de omitir filas erróneas queda para un incremento posterior.

## Criterios de aceptación

### Resultado principal

Con el fixture y la fecha de corte de referencia, R1 devuelve exactamente:

| Posición | Nº Nómina | Cantidad | Inicio más reciente |
|---:|---|---:|---|
| 1 | `910001` | 6 | `01/07/2026` |
| 2 | `910008` | 5 | `31/07/2026` |
| 3 | `910010` | 5 | `20/07/2026` |
| 4 | `910011` | 5 | `20/07/2026` |
| 5 | `910004` | 5 | `15/07/2026` |
| 6 | `910006` | 5 | `15/06/2026` |
| 7 | `910002` | 5 | `01/06/2026` |

### Casos obligatorios

- AC-01 a AC-04 y AC-09 a AC-15 de `docs/10-casos-aceptacion.md`.
- AC-22 para aritmética de fechas.
- AC-23 para demostrar que la duración de origen no interviene.
- Advertencias de `910005` y `910009` visibles y explicables.

### Privacidad y seguridad

- Importar, validar, analizar, consultar resultados y eliminar la sesión no provoca peticiones de red.
- No se registra nombre del archivo, nómina, fila completa o valores personales.
- Los errores no contienen valores de celda.
- El conjunto de datos utilizado en pruebas y demostración es completamente sintético.

### Accesibilidad

- Flujo completo realizable con teclado.
- Selector, botones, tabla, estado y detalle con nombre accesible.
- Foco visible y orden lógico.
- Advertencias identificables sin depender solo del color.

## Estrategia de pruebas

### Unitarias

- `LocalDate`, duración inclusiva, límites 30/31 y año bisiesto.
- Cálculo de ventana desde una fecha de corte.
- Inclusión y exclusión por fecha de inicio.
- Recorte del final efectivo.
- Conteo, ordenación y desempates R1.
- Construcción de explicaciones.

### Integración

- Lectura del fixture y conservación de nóminas como texto.
- Validación de las 14 cabeceras.
- Error por libro incompatible y por fila inválida.
- Resultado R1 exacto de siete candidatos.
- Ausencia de peticiones de red durante el flujo.

### Interfaz

- Estados vacío, carga, error, listo, resultados y sesión eliminada.
- Selección de fecha de corte.
- Apertura y cierre del detalle explicable.
- Navegación por teclado.

## Secuencia de construcción

1. Crear el repositorio Angular mínimo, pruebas y comprobaciones de formato.
2. Implementar tipos de fecha, entidades y funciones puras con pruebas unitarias.
3. Definir el perfil `ausencias-v1` y seleccionar mediante ADR la librería `.xlsx`.
4. Implementar importación, validación y normalización con el fixture.
5. Implementar R1 y comprobar el resultado de aceptación.
6. Conectar el flujo de interfaz y el detalle explicable.
7. Verificar accesibilidad, ausencia de red, borrado de sesión y demostración.

Cada paso debe dejar las comprobaciones en verde y un cambio revisable de tamaño reducido.

## Definición de terminado

- Los criterios funcionales, de privacidad y accesibilidad de este documento están demostrados.
- Todos los tests relevantes pasan en local y CI.
- El fixture produce exactamente los siete candidatos esperados.
- No existen peticiones de red durante importación y análisis.
- No se ha añadido backend, persistencia, telemetría ni funcionalidad fuera del incremento.
- La documentación refleja cualquier decisión técnica tomada durante la implementación.
