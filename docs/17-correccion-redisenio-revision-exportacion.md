# Corrección y rediseño de revisión y exportación

## Estado

Propuesta funcional del 15/08/2026. La exclusión de vacaciones está confirmada; la estructura exacta de navegación y exportación queda pendiente de confirmación antes de implementar.

## Hallazgo funcional

El motor actual aplica correctamente `isSicknessEpisode` antes de calcular R1 y R2, por lo que `Vacaciones` no incrementa la recurrencia corta ni puede originar una candidatura de larga duración.

El defecto se encuentra después del cálculo: la proyección de revisión recupera todas las filas de los empleados candidatos. Esto hace que las vacaciones aparezcan en el detalle operativo y en la hoja `Registros`, aunque no hayan intervenido en la candidatura.

La corrección debe garantizar una única frontera semántica:

- R1, R2, sus listados, explicaciones, revisión habitual y exportaciones contienen solo episodios de baja laboral;
- las vacaciones permanecen separadas en memoria;
- solo una futura función explícita de contexto temporal podrá mostrar vacaciones relacionadas, distinguiéndolas visualmente y sin contabilizarlas como bajas.

## Problema de experiencia de usuario

Con centenares de candidatos, colocar el detalle operativo debajo de la tabla principal obliga a recorrer una página excesivamente larga. Además, una única hoja con todos los registros traslada al Excel exportado la necesidad de filtrar manualmente que AbsenceLens pretende reducir.

El detalle debe organizarse alrededor del empleado seleccionado, no alrededor de una tabla global de registros.

## Estructura de interfaz recomendada

Después de ejecutar el análisis, la configuración de importación se resume en una barra compacta y la zona principal ofrece navegación persistente:

1. `Resumen`: cantidades, fecha de corte, advertencias y accesos a los dos análisis.
2. `Recurrencia corta`: listado R1 por empleado.
3. `Larga duración`: listado R2 por empleado.
4. `Revisión`: espacio independiente de detalle por empleado.

La navegación permanece visible y muestra los recuentos, por ejemplo `Recurrencia corta (387)`. Así ninguna función importante depende de conocer que existe más abajo en la página.

### Listados R1 y R2

- Barra de herramientas fija en la parte superior del listado.
- Búsqueda rápida por nómina y filtros habituales visibles.
- Tabla con paginación sencilla o renderizado incremental para mantener fluidez con centenares de candidatos.
- Acción principal `Abrir ficha` en cada fila.
- Casillas de selección para preparar exportaciones de uno o varios empleados.
- Acción `Exportar listado` siempre accesible en la barra superior.

### Sección Revisión

Se recomienda un patrón maestro-detalle para escritorio:

- panel izquierdo compacto con empleados candidatos, búsqueda y selección;
- panel derecho con la ficha del empleado activo;
- acceso directo desde `Abrir ficha` en R1/R2;
- URL o estado de navegación interno que permita volver al listado sin perder filtros ni posición.

La ficha muestra:

- nómina y atributos informativos esenciales;
- regla y motivo de inclusión;
- métricas calculadas relevantes;
- episodios médicos considerados, ordenados cronológicamente;
- episodios médicos descartados con su motivo cuando formen parte de la explicación;
- botón `Exportar ficha`.

Las vacaciones no aparecen en esta ficha habitual. En un incremento futuro podrá existir un bloque separado denominado `Contexto temporal`, visible solo al analizar adyacencias o coincidencias con vacaciones y festivos.

## Exportación recomendada

No se recomienda generar automáticamente una hoja por cada uno de los aproximadamente 400 candidatos: el libro resultante sería difícil de abrir, recorrer y mantener.

Se proponen dos acciones explícitas:

### Exportar listado

Genera:

- `Resumen`: regla, fecha de corte, filtros, cantidades y advertencias agregadas;
- `Candidatos`: una fila por empleado del conjunto visible.

No incluye una hoja global `Registros`.

### Exportar fichas seleccionadas

Genera:

- `Resumen`;
- `Candidatos` con los empleados seleccionados;
- una hoja por empleado, nombrada de forma neutra y segura, con sus episodios médicos y explicación.

La interfaz muestra cuántas fichas se exportarán. Se recomienda limitar cada libro a 25 empleados para mantenerlo manejable; si hay más seleccionados, la aplicación solicita acotar la selección en lugar de crear silenciosamente centenares de pestañas.

## Filtros

La corrección actual solo debe preparar una ubicación clara para filtros frecuentes y avanzados:

- frecuentes, siempre visibles: nómina, centro, rango de fechas y tipo de baja médica;
- avanzados, dentro de un panel desplegable: restantes columnas y combinaciones más específicas.

La mejora completa de semántica, controles y combinaciones avanzadas permanece diferida conforme a D-062.

## Criterios de aceptación de la corrección

1. Una fila de `Vacaciones` nunca aparece en R1, R2, su detalle habitual ni sus exportaciones.
2. Añadir vacaciones a un empleado no cambia su candidatura ni los recuentos médicos.
3. `Revisión` es accesible sin desplazarse hasta el final de un listado.
4. `Abrir ficha` conserva el contexto del listado al volver.
5. `Exportar listado` no contiene registros individuales.
6. `Exportar fichas seleccionadas` crea una hoja por empleado seleccionado y ninguna hoja contiene vacaciones.
7. Los identificadores conservan sus ceros a la izquierda.
8. Todo el procesamiento y la generación del libro permanecen en el navegador y en memoria.

## Decisiones pendientes antes de implementar

- Confirmar el patrón maestro-detalle propuesto para `Revisión`.
- Confirmar las dos modalidades de exportación y el máximo recomendado de 25 fichas por libro.
