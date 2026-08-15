# ADR-0003: adopción selectiva de Angular Material

- Estado: aceptado
- Fecha: 2026-08-15

## Contexto

La aplicación ya necesita pestañas, diálogos accesibles, tablas ordenables, ayudas contextuales, controles de selección y paneles expandibles. Mantener implementaciones propias para todas estas primitivas aumenta el coste de accesibilidad, pruebas y mantenimiento. A la vez, AbsenceLens necesita conservar una composición visual propia, la paleta de marca y reglas de negocio independientes de Angular.

## Decisión

Se incorpora Angular Material 22 y Angular CDK 22 como base selectiva de primitivas interactivas. El incremento utiliza:

- `MatDialog` para la ficha y explicación reusable;
- navegación de pestañas Material;
- `MatTable` y `MatSort` para Revisión;
- botones, checkbox, tooltip y panel de expansión Material.

No se adopta `MatTableDataSource` para el filtrado: los conjuntos se calculan mediante funciones puras de aplicación y se entregan ya preparados a la tabla. Tampoco se incorporan paginador ni virtual scroll mientras los datos permanezcan procesados en memoria y las mediciones no demuestren su necesidad.

El tema se genera localmente mediante Sass. No se descargan fuentes, iconos ni otros recursos remotos. La estructura de página, las superficies de dominio, los tokens de marca y las reglas de negocio continúan siendo propios.

## Consecuencias

### Positivas

- Primitivas accesibles y probadas para teclado, foco, diálogo y ordenación.
- Menos código personalizado y menor coste de evolución.
- Componente de ficha reutilizable desde R1, R2 y Revisión.
- Posibilidad de ampliar controles Material de forma gradual.

### Costes y límites

- Aumenta el tamaño de dependencias y del CSS generado.
- Requiere mantener un tema compatible con la identidad visual.
- Debe evitarse acoplar filtros y reglas de negocio a componentes Material.
- No se usarán estilos sobre detalles internos no públicos de la librería salvo necesidad documentada.
