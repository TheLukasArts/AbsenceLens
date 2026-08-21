# Investigación y referencias

## Requisitos académicos consultados

Los documentos originales del máster se encuentran fuera de esta carpeta en `C:\IAMaster\Documentación Master`.

- `Documentacion-TFM-Fundae-1.pdf`: README, repositorio público, vídeo/captura, presentación y aplicación desplegada recomendada.
- `Temario_MDEV_Edición2.pdf`: ingeniería, arquitectura limpia/hexagonal, IA aplicada, pruebas y calidad, seguridad, cloud/CI-CD y bases de datos.

El proyecto debe demostrar lo aprendido sin añadir tecnologías que contradigan su finalidad local-first.

## Mercado y alternativas

### Suites integrales de RR. HH.

- Workday Absence Management: https://www.workday.com/en-us/products/workforce-management/absence.html
- Dayforce Absence Management: https://www.dayforce.com/how-we-help/dayforce/workforce-management-software/absence-management
- Sesame HR, informes y KPI: https://www.sesamehr.es/software-informes-rrhh/

Estas soluciones centralizan datos, usuarios, solicitudes, fichajes y analítica. AbsenceLens no pretende sustituirlas: analiza puntualmente un export existente y no requiere implantación.

### Solución especializada cercana

- Appsentia: https://www.appsentia.com/

Detecta patrones como lunes/viernes y proximidad a festivos, pero está orientada al entorno sudafricano e incorpora puntuaciones individuales de riesgo y recomendaciones. AbsenceLens se diferencia mediante reglas neutrales y explicables, procesamiento local sin fuentes externas, ausencia de scoring y orientación a revisión humana.

### Open source relacionado

- Jorani: https://jorani.org/
- Who's OOO: https://www.whoisooo.app/

Se centran en gestión de permisos, usuarios, calendarios y aprobaciones, no en analizar localmente exportaciones históricas para encontrar coincidencias.

### Herramientas generalistas

Power Query, Power BI y plantillas Excel pueden construir análisis equivalentes, pero requieren preparar modelos, fórmulas y paneles. AbsenceLens encapsula las reglas concretas y reduce el trabajo manual de la persona usuaria sin necesidad de montar ni mantener un modelo.

## Protección de datos y ámbito laboral

- AEPD, justificantes de ausencia y datos de salud: https://www.aepd.es/preguntas-frecuentes/3-proteccion-de-datos-en-el-ambito-laboral/FAQ-0301-pueden-contener-datos-de-salud-los-justificantes-de-ausencia-laboral
- AEPD, protección de datos desde el diseño: https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/proteccion-de-datos-desde-el-diseno
- AEPD, anonimización y seudonimización: https://www.aepd.es/prensa-y-comunicacion/blog/anonimizacion-y-seudonimizacion
- AEPD, guía básica de anonimización: https://www.aepd.es/documento/guia-basica-anonimizacion.pdf
- AEPD, protección de datos en relaciones laborales: https://www.aepd.es/documento/la-proteccion-de-datos-en-las-relaciones-laborales.pdf
- RGPD, artículos sobre minimización, diseño y seguridad: https://eur-lex.europa.eu/eli/reg/2016/679/oj/spa
- Reglamento europeo de IA: https://eur-lex.europa.eu/eli/reg/2024/1689/oj/esp

Estas referencias sirven para justificar minimización, seudonimización, seguridad, explicabilidad y ausencia de decisiones automatizadas. No sustituyen la evaluación jurídica de un uso empresarial real.

## Calendarios laborales: línea de investigación descartada

- Resolución del BOE sobre fiestas laborales de 2026: https://www.boe.es/eli/es/res/2025/10/17/%282%29
- Portal oficial de calendarios laborales: https://administracion.gob.es/pag_Home/atencionCiudadana/calendarios/laboral.html?idioma=es

El calendario laboral español puede incluir fiestas nacionales, autonómicas y dos locales. La comunidad autónoma no basta para resolver festivos locales; se necesita municipio, lo que obligaba a mantener una tabla maestra de centros y un calendario por año.

La validación con la persona usuaria descartó esta línea: la plantilla analizada trabaja a turnos los 365 días del año y las 24 horas, de modo que un festivo puede ser laborable para cualquier empleado y no aporta información a ninguna regla. La investigación se conserva como registro de la decisión.

## Códigos de centro

El inventario de `Ubicación - Código` puede responder a un estándar sectorial o a una codificación interna. Mientras el estándar no se confirme (P-008), los valores se tratan como etiquetas opacas de centro: se muestran, se filtran y se exportan literalmente, sin interpretarlos ni enriquecerlos.

## Tecnología investigada

- DuckDB-Wasm: https://duckdb.org/docs/current/clients/wasm/overview
- SheetJS, fórmulas y valores guardados: https://docs.sheetjs.com/docs/csf/features/formulae/
- ExcelJS, modelo de celdas con fórmula: https://github.com/exceljs/exceljs/blob/master/MODEL.md#formula-cell-model

DuckDB-Wasm se estudió para análisis Excel genérico, pero no está decidido ni parece necesario para dos reglas principales sobre un archivo de este volumen. La elección de librería `.xlsx` debe valorar lectura, escritura, licencia, tamaño, soporte de fechas y funcionamiento en navegador.

## Uso de OpenAI

- Controles de datos: https://help.openai.com/en/articles/7730893-chatgpt-memory
- Uso de contenido para mejorar modelos: https://help.openai.com/en/articles/5722486-api-data-usage-policies
- Codex con un plan ChatGPT: https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan

El proyecto empleará GPT-5.6 y Codex para desarrollo supervisado. Los controles de datos no convierten en apropiado compartir información empresarial; solo se utilizarán datos sintéticos.

## Valoración frente a otras ideas

AbsenceLens fue elegida frente a MockSeed porque proporciona:

- usuario y problema reales;
- demo más comprensible;
- menor riesgo de alcance;
- suficiente profundidad técnica;
- una decisión de privacidad arquitectónicamente significativa;
- mayor probabilidad de finalización antes de la fecha objetivo.

MockSeed sigue siendo una idea futura con mayor amplitud backend y SQL, pero su MVP estimado era de 70–90 horas frente a aproximadamente 40–55 de AbsenceLens tras conocer el formato real.
