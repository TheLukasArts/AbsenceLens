# Instrucciones de trabajo de AbsenceLens

## Fuente de verdad

Antes de proponer o implementar cambios, leer `README.md` y los documentos de `docs/`. No sustituir una decisión confirmada por una suposición. Registrar las nuevas decisiones y preguntas pendientes en `docs/06-decisiones-pendientes-roadmap.md`.

## Protección de datos

- No leer, copiar, transformar, versionar ni subir datos reales de empleados.
- Utilizar solamente archivos sintéticos o expresamente autorizados y sin información identificable.
- No incluir datos personales en logs, errores, telemetría, capturas, pruebas o documentación.
- No enviar filas del Excel a servicios externos ni a modelos de IA.
- No añadir analítica, seguimiento, fuentes remotas o servicios de errores sin una decisión explícita.
- Mantener el procesamiento en el navegador y en memoria salvo que una decisión documentada establezca otra cosa.

## Lenguaje de producto

Usar “coincidencia”, “patrón temporal”, “candidato” y “revisión humana”. Evitar “fraude”, “sospechoso”, “culpable”, “riesgo del empleado” y cualquier recomendación disciplinaria.

## Ingeniería

- Favorecer una arquitectura limpia y proporcional, sin sobreingeniería.
- Mantener las reglas de negocio independientes de Angular y de la librería de Excel.
- Implementar reglas deterministas, explicables y cubiertas por pruebas.
- Tratar identificadores de nómina como texto.
- Calcular fechas mediante tipos y utilidades explícitas; no depender de la zona horaria del navegador.
- Mantener pequeños los cambios, ejecutar las comprobaciones relevantes y revisar todo código generado por IA.
- No añadir backend, autenticación o persistencia sin una necesidad confirmada y un ADR.

## Entrega

La aplicación debe poder demostrarse en menos de cinco minutos, desplegarse gratuitamente, publicarse como código abierto y funcionar con un conjunto de datos completamente sintético.
