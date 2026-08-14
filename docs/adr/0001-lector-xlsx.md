# ADR-0001: lector XLSX en navegador

- Estado: aceptado.
- Fecha: 14/08/2026.
- Alcance: primer incremento vertical `I-001`.

## Contexto

AbsenceLens debe leer un único archivo `.xlsx` local, en memoria y sin enviar filas a servicios externos. El dominio y las reglas no deben depender de celdas, hojas ni de una librería concreta. Para `I-001` solo se necesita lectura; la exportación queda fuera.

## Decisión

Utilizar `read-excel-file` 9.3.x mediante su entrada para navegador y encapsularla en un adaptador que implemente `WorkbookReader`.

El adaptador entregará una matriz neutral de valores y metadatos mínimos. El perfil `ausencias-v1`, la validación y la normalización permanecerán fuera de la librería.

La aplicación no utilizará lectura desde URL. El único origen admitido será un `File` elegido explícitamente por la persona usuaria.

## Motivos

- Está diseñada para leer `.xlsx` desde `File`, `Blob` o `ArrayBuffer` en navegador.
- Su alcance de lectura es menor que el de suites generales de hojas de cálculo.
- Tiene licencia MIT y mantenimiento activo en el momento de la decisión.
- Permite conservar fechas y valores de texto antes de aplicar el perfil propio.
- Dispone de una ruta con Web Worker si las mediciones de un incremento posterior justifican usarla.

## Consecuencias

- Se fija una versión exacta en el archivo de bloqueo y las actualizaciones se revisarán expresamente.
- Los errores de la librería se traducirán a códigos saneados; no se mostrarán valores de celdas ni nombres de archivo.
- La validación de una sola hoja, cabeceras exactas y tipos pertenece a AbsenceLens.
- Si la librería deja de satisfacer privacidad, compatibilidad o rendimiento, podrá sustituirse sin modificar el dominio.

## Alternativas consideradas

- `xlsx`/SheetJS: capacidad más amplia de la necesaria para este incremento y una distribución pública con consideraciones adicionales de actualización.
- `ExcelJS`: solución más extensa orientada también a escritura y formato, funcionalidades fuera de `I-001`.
- Implementar OOXML directamente: coste y superficie de errores desproporcionados para el MVP.

## Verificación

- Prueba de integración con el Excel sintético de aceptación.
- Comprobación de una sola hoja y 14 cabeceras exactas.
- Conservación de `Nº Nómina` como texto.
- Flujo de importación y análisis sin solicitudes de red.
