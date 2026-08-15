# ADR-0002: escritor XLSX en navegador

- Estado: aceptado.
- Fecha: 15/08/2026.
- Alcance: tercer incremento vertical `I-003`.

## Contexto

AbsenceLens debe exportar tres hojas `.xlsx` mediante una acción explícita y sin transmitir filas. El dominio, las reglas y la proyección de revisión no deben depender de la estructura OOXML ni de una librería concreta.

## Decisión

Utilizar `write-excel-file` 4.1.1 mediante su entrada de navegador y encapsularlo en un adaptador que implemente `CandidateReportExporter`.

El caso de uso entregará hojas neutrales ya proyectadas. El adaptador generará un `Blob` en memoria y activará una descarga con nombre saneado. No recibirá el nombre del archivo importado.

## Motivos

- Está orientada a escritura `.xlsx` sencilla en navegador y Node.js.
- Genera un `Blob` sin necesitar servidor.
- Admite varias hojas, formatos, anchos y filas congeladas.
- Tiene licencia MIT y una versión reciente en el momento de la decisión.
- Su alcance es proporcional a una exportación tabular y complementa el lector ya adoptado.

Fuentes primarias consultadas:

- https://www.npmjs.com/package/write-excel-file
- https://github.com/catamphetamine/write-excel-file

## Consecuencias

- Se fija la versión exacta en el archivo de bloqueo.
- Las hojas y celdas se preparan fuera del adaptador mediante estructuras neutrales.
- Las nóminas se escriben como texto y las fechas como valores de calendario explícitos.
- La duración de origen no forma parte del contrato de exportación.
- La descarga solo se inicia tras una acción explícita del usuario.
- Si la librería deja de satisfacer privacidad, compatibilidad o mantenimiento, podrá sustituirse sin modificar R1/R2.

## Alternativas consideradas

- `ExcelJS`: admite navegador y licencia MIT, pero ofrece una superficie y tamaño mayores de los necesarios.
- `xlsx`/SheetJS: capacidad amplia y artefacto npm con una cadencia distinta a la distribución principal actual.
- Generar OOXML directamente: coste, riesgo de corrupción y mantenimiento desproporcionados.

## Verificación

- Prueba del contrato neutral del informe.
- Generación de las tres hojas y relectura del `Blob`.
- Conservación de `Nº Nómina` como texto.
- Ausencia de la duración de origen.
- Nombre de descarga saneado.
- Exportación sin solicitudes de red ni persistencia.
