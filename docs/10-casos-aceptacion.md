# Casos de aceptación sintéticos

## Alcance

Este documento define los resultados esperados del libro `absence-lens-aceptacion-v1.xlsx`. El libro contiene una sola hoja, 73 filas y datos creados completamente desde cero. No reproduce personas, combinaciones ni distribuciones del origen empresarial.

Configuración común:

- fecha de corte: `31/07/2026`;
- ventana R1 inclusiva: `01/08/2025` a `31/07/2026`;
- episodio corto: duración total efectiva `<= 30` días;
- recurrencia: al menos 5 episodios cortos iniciados dentro de la ventana;
- episodio largo: duración total efectiva `>= 180` días;
- los valores de la columna de duración de origen son deliberadamente inconsistentes y deben ignorarse.

## Resultado esperado de R1

| Posición | Nº Nómina | Episodios contabilizados | Inicio más reciente |
|---:|---|---:|---|
| 1 | `910001` | 6 | `01/07/2026` |
| 2 | `910008` | 5 | `31/07/2026` |
| 3 | `910010` | 5 | `20/07/2026` |
| 4 | `910011` | 5 | `20/07/2026` |
| 5 | `910004` | 5 | `15/07/2026` |
| 6 | `910006` | 5 | `15/06/2026` |
| 7 | `910002` | 5 | `01/06/2026` |

`910010` precede a `910011` porque empatan en cantidad y recencia y se aplica el identificador ascendente.

## Resultado esperado de R2

| Posición | Nº Nómina | Duración máxima | Inicio representativo | Centro |
|---:|---|---:|---|---|
| 1 | `920010` | 300 | `01/10/2024` | `MAD` |
| 2 | `920011` | 250 | `01/12/2024` | `BCN` |
| 3 | `920003` | 212 | `01/01/2026` | `AGP` |
| 4 | `920005` | 212 | `01/01/2026` | `AGP` |
| 5 | `920006` | 210 | `01/01/2025` | `MAD` |
| 6 | `920008` | 200 | `01/02/2025` | `BCN` |
| 7 | `920009` | 200 | `01/02/2025` | `BCN` |
| 8 | `920007` | 200 | `01/01/2025` | `MAD` |
| 9 | `920001` | 180 | `01/01/2025` | `ABC` |

Resultados esperados al filtrar centros:

- `BCN`: `920011`, `920008`, `920009`;
- `MAD`: `920010`, `920006`, `920007`;
- `AGP`: `920003`, `920005`.

## Catálogo de casos

| ID | Situación sintética | Resultado esperado |
|---|---|---|
| AC-01 | Identificadores de seis dígitos | Se conservan como texto y no pierden ceros iniciales |
| AC-02 | Episodio de un único día | Duración inclusiva igual a 1 |
| AC-03 | `910006`, episodio del 01/09 al 30/09 | Duración 30; se clasifica como corto |
| AC-04 | `910007`, episodio del 01/09 al 01/10 | Duración 31; no se clasifica como corto |
| AC-05 | `920001` | Duración 180; se clasifica como largo |
| AC-06 | `920002` | Duración 179; no se clasifica como largo |
| AC-07 | `920003`, final `31/12/2999` | Activo, final efectivo 31/07/2026 y duración 212; se clasifica como largo |
| AC-08 | `920004`, final `31/12/2999` | Activo y duración 153; no se clasifica como largo |
| AC-09 | `910002`, cinco episodios cortos | Candidato R1 con contador 5 |
| AC-10 | `910003`, cuatro episodios cortos | No es candidato R1 |
| AC-11 | `910001`, seis episodios cortos | Primer candidato R1 por cantidad 6 |
| AC-12 | `910004`, inicio el 01/08/2025 | El episodio del límite inicial se contabiliza |
| AC-13 | `910005`, episodio iniciado antes de la ventana y terminado dentro | Ese episodio no incrementa el contador; el empleado queda con 4 |
| AC-14 | `910008`, episodio iniciado el 31/07/2026 | El episodio del límite final se contabiliza; el empleado alcanza 5 |
| AC-15 | `910009`, episodio iniciado el 01/08/2026 | Se excluye con advertencia; el empleado queda con 4 |
| AC-16 | `920005`, final ordinario 31/08/2026 | Se conserva el final original, se recorta al corte, duración efectiva 212 y advertencia |
| AC-17 | `920006`, dos episodios largos | Aparece una sola vez con el máximo de 210 y ambos episodios en el detalle |
| AC-18 | `920008`, `920009` y `920007`, todos con 200 días | Primero inicio más reciente; en empate de inicio, nómina ascendente |
| AC-19 | Filtro de centros en R2 | Se recalcula el listado sobre los centros seleccionados según los órdenes documentados |
| AC-20 | `930001`, tres días consecutivos de vacaciones | Un único periodo del 01/06 al 03/06/2026 |
| AC-21 | `930002`, dos días no consecutivos de vacaciones | Dos periodos independientes de un día |
| AC-22 | `940001`, del 28/02 al 01/03/2024 | Duración inclusiva 3 en año bisiesto |
| AC-23 | Valores 0, 1, 999 u otros en la duración de origen | No alteran ningún cálculo; se utilizan exclusivamente las fechas |

## Advertencias esperadas

- `910005`: episodio que intersecta la ventana pero comenzó antes y no incrementa la recurrencia.
- `910009`: episodio iniciado después de la fecha de corte y excluido.
- `920003` y `920004`: episodios activos identificados por el centinela.
- `920005`: final ordinario posterior a la fecha de corte, recortado para el análisis.
- Todas las filas: la duración proporcionada por el origen se descarta.
