# Muestras de datos

Esta carpeta solo admite libros completamente sintéticos creados desde cero.

No copiar aquí el Excel empresarial original, versiones seudonimizadas mediante simple sustitución del número de nómina ni archivos que conserven combinaciones reales de fechas, nacimiento, sexo, ubicación, convenio o plan salarial.

Archivos disponibles:

- `absence-lens-aceptacion-v1.xlsx`: 73 filas creadas a mano con resultados conocidos. Es la referencia de corrección: los 23 casos de aceptación de `docs/10-casos-aceptacion.md` se comprueban contra él en cada ejecución de la suite. **No debe modificarse.**
- `absence-lens-rendimiento-150000.xlsx`: 150.000 filas sintéticas con la forma de un archivo mensual completo, para medir rendimiento. Se regenera con `pnpm sample:large`.

En `public/samples/` hay además `absence-lens-demo-15000.xlsx`, una versión reducida publicada junto a la aplicación para que cualquiera pueda probarla. Se regenera con `pnpm sample:small`.

Ambos conjuntos sintéticos los produce `scripts/generate-sample-workbook.mjs`, que es determinista: con la misma semilla genera exactamente el mismo libro.
