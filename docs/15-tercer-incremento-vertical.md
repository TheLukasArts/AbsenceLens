# Tercer incremento vertical: revisión y exportación de resultados

## Estado

Especificación aprobada el 15/08/2026 y preparada para implementar.

## Identificación

- ID: `I-003`.
- Objetivo: completar el flujo operativo desde los listados R1/R2 hasta una revisión filtrable y una exportación explícita en Excel.
- Entrada de aceptación: `absence-lens-aceptacion-v1.xlsx`.
- Reutiliza la fecha de corte, la normalización y las candidaturas ya calculadas.

## Resultado demostrable

En menos de cuatro minutos, una persona debe poder:

1. importar el archivo Excel de prueba y ejecutar R1/R2;
2. mantener el listado principal agrupado por empleado;
3. abrir una zona de revisión con los registros de ausencia asociados a los candidatos visibles;
4. filtrar y ordenar esa revisión por las columnas autorizadas;
5. comprobar que los filtros de revisión no cambian silenciosamente las reglas ya calculadas;
6. exportar explícitamente el resultado visible a un nuevo archivo `.xlsx`;
7. abrir el archivo generado y reconocer los criterios, candidatos y registros exportados;
8. eliminar la sesión y sus datos de memoria.

## Alcance propuesto

### Listado principal

- Conservar R1 y R2 como vistas de una fila por empleado.
- Mantener el orden de dominio de cada regla como orden inicial y explicable.
- Mantener el filtro especial de centros de R2 con su semántica ya confirmada.
- Añadir acceso evidente al detalle operativo de los registros asociados.

### Revisión de registros

- Mostrar una fila por registro importado perteneciente a los empleados del conjunto candidato visible.
- Mantener la relación con la regla y el empleado sin duplicar ni reinterpretar candidaturas.
- Mostrar todas las columnas autorizadas del perfil salvo `Número de Días de Ausencia a Fecha de hoy`.
- Sustituir esa duración de origen por la duración efectiva calculada cuando sea útil.
- Presentar las fechas de forma consistente y los códigos categóricos literalmente, sin añadir significado.
- Permitir búsqueda por `Nº Nómina`, filtros categóricos, rango de fechas y ordenación por columna.
- Mostrar el número de empleados y registros que permanecen visibles.
- Proporcionar una acción accesible para limpiar todos los filtros de revisión.

### Semántica recomendada de filtros

- Los filtros adicionales actúan sobre la revisión visible después de calcular R1/R2.
- No recalculan la condición de recurrencia ni la selección del episodio representativo de larga duración.
- Un empleado permanece visible si al menos uno de sus registros asociados cumple los filtros de revisión.
- La explicación conserva siempre los episodios usados por la regla, aunque la tabla operativa esté filtrada.
- El filtro de centros de R2 conserva su comportamiento específico anterior al límite top 10.

### Exportación recomendada

- Exportar únicamente mediante una acción explícita del usuario.
- Generar el archivo completamente en el navegador y en memoria.
- No enviar datos, nombres de archivo o métricas a servicios externos.
- Exportar el conjunto y los filtros visibles en el momento de pulsar la acción.
- Proponer tres hojas:
  - `Resumen`: regla, versión, fecha de corte, filtros, cantidades y advertencias agregadas;
  - `Candidatos`: una fila por empleado visible con los campos calculados de R1 o R2;
  - `Registros`: filas de ausencia visibles con las columnas autorizadas y cálculos internos.
- Excluir siempre la duración errónea proporcionada por el origen.
- Utilizar un nombre de descarga neutro que no incluya identificadores ni el nombre del archivo importado.

## Decisiones confirmadas

1. Los filtros adicionales son de revisión y no recalculan R1/R2.
2. El listado principal sigue agrupado por empleado y el detalle usa una fila por registro.
3. La exportación contiene únicamente la vista activa y sus filtros.
4. El libro exportado contiene `Resumen`, `Candidatos` y `Registros`.

Las decisiones están registradas como D-055 a D-058 en `docs/06-decisiones-pendientes-roadmap.md`.

## Fuera del incremento

- Detección automática de totales y textos añadidos al pie del Excel.
- Continuación parcial cuando existen filas erróneas.
- Cambios de lenguaje, ayuda visual de columnas y pulido general.
- Gráficos, tasas, horas y perfiles agregados.
- Periodo de análisis independiente.
- Agrupación visible de vacaciones y reglas de adyacencia.
- Festivos y enriquecimiento de centros.
- Fixture de rendimiento de 15.000 filas y Web Worker.
- PWA, persistencia, backend, autenticación y telemetría.

## Diseño técnico preliminar

- Conservar `ValidatedAbsenceRecord` como modelo neutral de revisión durante la sesión.
- Crear una proyección de presentación que relacione registros, empleados candidatos y cálculos normalizados mediante `sourceRow`.
- Implementar filtrado, ordenación y proyección como funciones puras independientes de Angular.
- Definir un puerto `CandidateReportExporter` que reciba estructuras neutrales.
- Mantener la librería de escritura `.xlsx` encapsulada en un adaptador y justificarla en un ADR antes de incorporarla.
- No acoplar las reglas R1/R2 a los filtros de presentación ni a la librería de exportación.

## Pruebas previstas

- Asociación exacta entre candidatos y registros mediante identificador y fila de origen.
- Filtros de texto, categorías y fechas; combinación y limpieza.
- Ordenación estable de texto, fechas y valores calculados.
- Un empleado visible cuando al menos un registro asociado coincide.
- R1 y R2 invariables al aplicar filtros de revisión.
- Exportación exacta de la vista activa y relectura del libro generado.
- Exclusión de la duración de origen y conservación de nóminas como texto.
- Nombre de descarga saneado.
- Ausencia de red y persistencia durante revisión y exportación.
- Navegación por teclado, foco visible y estado no dependiente solo del color.

## Condiciones para comenzar

- Confirmar las cuatro decisiones funcionales.
- Elegir y documentar mediante ADR una librería de escritura compatible con navegador y licencia del proyecto.
- Definir los resultados exactos de aceptación para una combinación representativa de filtros y para cada hoja exportada.
- Mantener en verde las regresiones completas de I-001 e I-002.
