# Decisiones, pendientes y roadmap

## Decisiones confirmadas

| ID | Decisión |
|---|---|
| D-001 | Elegir AbsenceLens como TFM provisional definitivo frente a MockSeed por equilibrio entre valor, claridad y plazo. |
| D-002 | Angular como frontend. |
| D-003 | Procesamiento local y sin backend para el MVP. |
| D-004 | Un único archivo `.xlsx`, una hoja y un perfil de importación versionado. |
| D-005 | Mantener el archivo completo; no separar vacaciones por rendimiento. |
| D-006 | Dos listados imprescindibles: recurrencia corta y larga duración. |
| D-007 | Corto: duración total efectiva `<= 30` días inclusivos. |
| D-008 | Recurrente: al menos 5 episodios cortos en una ventana de 12 meses. |
| D-009 | Largo: duración total efectiva `>= 180` días inclusivos. |
| D-010 | Fecha de corte configurable; por defecto, último día del mes anterior. |
| D-011 | `31/12/2999` representa una ausencia activa y se recorta a la fecha de corte. |
| D-012 | La clasificación corta/larga usa duración total; las métricas del periodo usan la intersección. |
| D-013 | Avisar cuando clasificación total y días visibles en el periodo difieran. |
| D-014 | En recurrencia se cuenta por fecha de inicio; avisar sobre episodios que solo intersectan la ventana. |
| D-015 | Top largo: 10 globales; con filtros, top 10 del conjunto de centros seleccionados. |
| D-016 | Top largo ordenado por el episodio individual más largo. |
| D-017 | Top recurrente ordenado por cantidad y luego por mayor recencia. |
| D-018 | Días consecutivos de vacaciones se agrupan en un periodo. |
| D-019 | No existen solapamientos; la adyacencia futura usa el día natural anterior/posterior. |
| D-020 | Revisada por D-027 y P-008: `Ubicación - Código` identifica el centro aeroportuario y `Ambito` una zona interna; no se asumirá el estándar del código hasta confirmarlo. |
| D-021 | Permitir filtrar y ordenar por todas las columnas importadas. |
| D-022 | Ignorar la duración calculada por el sistema de origen y recalcularla. |
| D-023 | Exportación de resultados en Excel. |
| D-024 | Diseño inicial para portátil/escritorio; móvil y tableta fuera del MVP. |
| D-025 | El TFM y la IA de desarrollo solo usarán datos sintéticos. |
| D-026 | `Nº Nómina` se importa y conserva como texto, incluidos los ceros a la izquierda; no se normaliza como número. |
| D-027 | La cabecera confirmada es `Ambito`, sin tilde. |
| D-028 | El inventario categórico autorizado se conserva literalmente para mostrar, filtrar, ordenar y exportar, sin asignarle semántica adicional ni usarlo como factor de candidatura. |
| D-029 | El valor de origen `Número de Días de Ausencia a Fecha de hoy` se descarta y se sustituye, cuando corresponda, por cálculos internos. |
| D-030 | Las capturas con datos o métricas reales a nivel de trabajador no se incorporan ni se transforman; las referencias visuales se recrean desde cero con datos sintéticos. |
| D-031 | Los dashboards anteriores son referencias de cobertura informativa, no plantillas que deban reproducirse de forma idéntica. |
| D-032 | La interfaz debe respetar la paleta de marca en cabeceras, cuerpos, superficies y estados mediante tokens de color autorizados, sin conservar ni muestrear capturas con datos reales. |
| D-033 | Las capturas con datos reales solo permiten confirmar estructura y necesidades visuales; sus filas, métricas y combinaciones no se analizan ni se trasladan al producto. |
| D-034 | La cabecera exacta del perfil inicial es `Convenio Laboral`; su aparición como `Convenio` en una captura se debía al ancho visible de la columna. |
| D-035 | `Plan Salarial - Desc.` y `Ubicación - Código` son cabeceras confirmadas y no se aceptan como valores de sus propias columnas. |
| D-036 | R1 evalúa únicamente la ventana inclusiva de 12 meses que termina en la fecha de corte; para `31/07/2026`, comienza el `01/08/2025`. |
| D-037 | R2 muestra una fila por empleado con su episodio largo máximo y acceso al detalle de los demás episodios. |
| D-038 | R2 ordena por duración máxima descendente, inicio del episodio representativo descendente y `Nº Nómina` ascendente. |
| D-039 | Los episodios iniciados después del corte se excluyen con advertencia; los iniciados antes y terminados después se recortan al corte conservando el final original en el detalle. |
| D-040 | El conjunto inicial de aceptación consta de un `.xlsx` de una hoja y 73 filas completamente sintéticas, acompañado por 23 casos con resultado conocido. |
| D-041 | El primer incremento vertical `I-001` cubre importación, validación, normalización, fecha de corte, R1, explicación y borrado de sesión. |
| D-042 | R2, filtros avanzados, exportación, dashboards, festivos, rendimiento y PWA quedan fuera de `I-001`. |
| D-043 | Para `I-001`, cualquier error de fila bloquea el análisis y se informa mediante fila, columna y código saneado, sin incluir el valor de la celda. |
| D-044 | La librería `.xlsx` se elegirá mediante un ADR breve antes de implementar su adaptador, manteniendo el dominio independiente. |
| D-045 | WSL 2 con Ubuntu es el entorno canónico de desarrollo; el repositorio reside en el sistema de archivos Linux y no en `/mnt/c`. |
| D-046 | La base técnica inicial usa Node.js 24 mediante NVM, pnpm 11.19 mediante Corepack y Angular 22 con CLI local al proyecto. |
| D-047 | El adaptador de `WorkbookReader` utilizará `read-excel-file` 9.3.x para lectura local en navegador, según ADR-0001. |
| D-048 | Las mejoras no críticas detectadas tras verificar `I-001` se registran y se abordan después de completar las capacidades troncales del MVP; los defectos de corrección, privacidad o accesibilidad mantienen prioridad inmediata. |
| D-049 | El detalle R2 muestra los episodios largos considerados para el empleado, no todos sus episodios cortos. |
| D-050 | R2 mantiene al empleado como unidad principal: primero construye una candidatura global por empleado y después el filtro de centros actúa sobre el centro de su episodio representativo. Las estadísticas futuras por centro tendrán un cálculo agregado independiente. |
| D-051 | Una única acción de análisis calcula R1 y R2; alternar listados o cambiar el filtro de centros no vuelve a leer ni normalizar el Excel. |
| D-052 | `I-002` no introduce un periodo visible independiente ni métricas de días dentro de ese periodo; muestra la duración total efectiva a fecha de corte. |
| D-053 | El repositorio canónico se publica como código abierto en `https://github.com/TheLukasArts/AbsenceLens`; solo puede contener código, documentación y datos completamente sintéticos. La licencia de código abierto se elegirá antes de cerrar el MVP. |
| D-054 | El usuario valida funcionalmente `I-002` en navegador; los ajustes de presentación observados se mantienen diferidos para la revisión final conforme a D-048. |
| D-055 | Los filtros adicionales de `I-003` acotan la revisión visible después de calcular R1/R2 y no recalculan las reglas. |
| D-056 | El listado principal continúa agrupado por empleado y el detalle operativo muestra una fila por registro asociado. |
| D-057 | Cada exportación contiene únicamente la vista activa, R1 o R2, y los filtros aplicados en ese momento. |
| D-058 | El libro exportado contiene las hojas `Resumen`, `Candidatos` y `Registros`, y excluye la duración errónea del origen. |
| D-059 | `I-003` utiliza `write-excel-file` 4.1.1 tras el puerto `CandidateReportExporter`, según ADR-0002. |
| D-060 | `Vacaciones` queda excluida de R1, R2, los listados, el detalle operativo habitual y sus exportaciones. Se conserva únicamente como contexto para futuros análisis temporales con vacaciones o festivos. |
| D-061 | El detalle operativo deja de situarse debajo de listados potencialmente largos y se organiza en una sección `Revisión` independiente con patrón maestro-detalle, accesible desde la navegación de resultados y desde cada candidato. |
| D-062 | El rediseño priorizará filtros habituales simples; los filtros avanzados se mantienen como mejora posterior y no bloquean la corrección actual. |
| D-063 | Ninguna exportación global puede truncar o limitar arbitrariamente el conjunto visible de candidatos; la usabilidad no se resolverá sesgando información. |
| D-064 | Las vacaciones y los festivos se usarán para detectar adyacencia inmediata anterior o posterior, no solapamiento literal. La mención a solapamientos fue una imprecisión terminológica. |
| D-065 | La ficha individual será accesible y exportable directamente desde cada fila candidata y desde la sección `Revisión`, sin obligar a recorrer el detalle global. |
| D-066 | La exportación global contiene el conjunto completo visible en `Resumen + Candidatos`, sin `Registros`; cada candidato ofrece una exportación individual `Ficha` desde su fila y desde `Revisión`. |

## Preguntas abiertas

Estas preguntas no bloquean el primer incremento vertical si las capacidades asociadas permanecen fuera de él.

| ID | Pregunta | Responsable |
|---|---|---|
| P-001 | ¿Cuál era la fórmula exacta del porcentaje de absentismo, especialmente su denominador? | Usuario interesado |
| P-006 | ¿Qué columnas exactas debe contener cada exportación de resultados y en qué orden? | Usuario interesado |
| P-008 | ¿Los códigos de `Ubicación - Código` son identificadores IATA, códigos internos o un inventario mixto? Debe confirmarse antes de construir la futura tabla de centro, comunidad autónoma y municipio. | Usuario interesado |
| P-010 | ¿La sección equivalente a “limitaciones” debe formar parte de AbsenceLens? No existe una columna ni una regla asociada en el alcance actual. | Usuario interesado |
| P-011 | Para cubrir el dashboard de tasa, ¿se proporcionará una fuente autorizada de horas netas/trabajadas y la fórmula, o se sustituirá por métricas derivables del Excel de ausencias? | Usuario interesado |
| P-012 | ¿Cuáles son los valores exactos de la paleta de marca, preferiblemente en hexadecimal, y sus usos previstos? | Usuario interesado |

## Preguntas para gráficos

- Fórmula y fuente del denominador del porcentaje de absentismo.
- Periodicidad: mensual dentro de cada año o una cifra por año.
- Rangos de edad.
- Edad calculada en fecha de corte o fecha del episodio.
- Qué significa “contrato”: `Tipo de Empleado`, `Fijo/Temporal`, convenio u otra dimensión.
- Tratamiento de categorías desconocidas o sin informar.
- Tamaño mínimo de grupo para mostrar agregados.
- Recreaciones completamente sintéticas de los dashboards anteriores; las capturas recibidas no son admisibles como activos por contener información real a nivel de trabajador.
- Cobertura funcional detallada en `docs/09-cobertura-dashboards.md`.

## Datos y recursos pendientes

- Recreaciones sintéticas de los dos dashboards anteriores.
- Lista de códigos de centro realmente necesarios y confirmación de su estándar.
- Tabla de código de centro a comunidad autónoma y municipio, después de confirmar el estándar.
- Calendarios nacionales, autonómicos y locales para los años soportados.
- Archivo sintético de aproximadamente 15.000 filas para rendimiento.

## Decisiones técnicas todavía reversibles

- Librería de lectura y escritura `.xlsx`.
- Uso de Web Worker según mediciones reales.
- Librería de gráficos.
- Gestión de estado en Angular.
- Estrategia de PWA/offline.
- Fuente y formato de calendarios festivos.
- Ubicación de iconos, tooltips y ayuda contextual.

## Mejoras diferidas tras I-001

| ID | Mejora | Prioridad y criterio de aceptación |
|---|---|---|
| M-001 | Detectar y omitir de forma determinista las filas finales añadidas por las herramientas de exportación: totales, filas vacías, descripción de filtros y avisos de truncamiento. | Media; debe resolverse antes de cerrar el MVP y probarse sin confundir una fila válida con metadatos del informe. |
| M-002 | Permitir que las filas válidas continúen aunque existan filas erróneas, excluyendo estas últimas y mostrándolas en una zona de revisión mediante número de fila, columna y código saneado, nunca mediante el contenido de la celda. | Media; no es urgente para el siguiente incremento, pero debe diseñarse junto con M-001 y nunca omitir errores silenciosamente. Revisa en el futuro el comportamiento bloqueante de D-043. |
| M-003 | Sustituir en la interfaz “Excel sintético” por una expresión más clara, preferentemente “archivo Excel de prueba” o “archivo de demostración”; conservar “sintético” en la documentación técnica y de privacidad. | Baja; mejora de lenguaje de producto. |
| M-004 | Sustituir “14 columnas exactas” por una ayuda visual que permita previsualizar las columnas esperadas. | Baja; la ayuda debe ser comprensible con teclado y lector de pantalla y no depender únicamente de un icono. |
| M-005 | Revisar conjuntamente los demás ajustes visuales una vez que las capacidades troncales del MVP estén operativas. | Baja; agrupar el pulido para mantener pequeños los incrementos actuales. |

## Roadmap posterior al MVP

1. Coincidencias adyacentes a vacaciones.
2. Coincidencias con festivos nacionales, autonómicos y locales.
3. Más estadísticas agregadas.
4. PWA y ejecución offline instalada.
5. Perfiles de importación externos.
6. Editor visual y almacenamiento de perfiles.
7. Compatibilidad con distintos formatos de Excel.
8. Posible proceso complementario de seudonimización bajo control de la organización.

No incluir predicción, puntuación individual, fraude, recomendaciones laborales o investigación automática en el roadmap funcional del producto.

## Estimación actual

Con el formato tabular confirmado, el MVP presentable se estima provisionalmente en 40–55 horas utilizando Codex y GPT-5.6 con revisión humana. Debe reservarse tiempo específico para documentación, presentación, vídeo, despliegue y margen FUNDAE.

## Criterio para comenzar la implementación

El criterio previo queda satisfecho el 14/08/2026:

1. existe un Excel completamente sintético y estructuralmente representativo;
2. están cerradas P-002 y las decisiones del top largo;
3. existen 23 casos de aceptación con resultados conocidos para las reglas y normalizaciones esenciales.

La implementación puede comenzar cuando el usuario lo indique expresamente y después de dejar delimitado el primer incremento vertical. La fórmula de absentismo puede permanecer pendiente si los gráficos asociados se mantienen fuera de ese incremento.

El primer incremento queda delimitado en `docs/11-primer-incremento-vertical.md` y está preparado para comenzar cuando exista una orden expresa de implementación.
