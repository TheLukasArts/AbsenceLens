# Contexto y visión

## Origen de la necesidad

Una gran empresa ha separado una división como nueva empresa con marca y gestión propias, manteniéndola dentro del grupo. Antes del cambio, el análisis de ausencias se realizaba mediante paneles de hechos y dashboards de Power BI o una herramienta similar.

Los datos y paneles todavía no han sido migrados y la migración puede tardar. Mientras tanto, la persona responsable debe solicitar exportaciones en Excel y localizar manualmente coincidencias mediante filtros, ordenaciones e inspección visual. El volumen de empleados y registros convierte el proceso en una tarea lenta, repetitiva y propensa a errores.

## Problema

Partiendo de un histórico de aproximadamente dos años y unas 15.000 filas, resulta costoso encontrar empleados cuyas ausencias cumplan patrones como recurrencia de procesos cortos o episodios de larga duración. Actualmente se aplican sucesivos filtros en Excel, se revisan resultados visualmente y se ordenan los candidatos.

## Propuesta de valor

AbsenceLens reducirá un conjunto grande de registros a listados explicables de identificadores que cumplen reglas objetivas. La investigación posterior, el acceso a otras fuentes y cualquier decisión corresponden exclusivamente a una persona autorizada y quedan fuera del producto.

## Formulación de producto

> AbsenceLens es una aplicación web local-first que importa y normaliza un histórico de ausencias desde Excel, aplica reglas temporales configuradas y presenta coincidencias explicables para revisión humana, sin transmitir el archivo ni tomar decisiones laborales.

## Usuario principal

Persona que realiza análisis de ausencias y que actualmente domina filtros y ordenaciones de Excel, pero necesita ahorrar el trabajo manual de localizar patrones entre miles de filas.

## Objetivos del TFM

- Resolver un problema real definido por una persona distinta del autor.
- Demostrar toma y validación de requisitos.
- Aplicar arquitectura limpia de forma proporcionada.
- Implementar importación, normalización, filtrado, reglas temporales y visualización.
- Demostrar pruebas, calidad, seguridad, privacidad desde el diseño, CI/CD y despliegue.
- Documentar el uso de GPT-5.6 y Codex como apoyo supervisado, manteniendo las decisiones y validación bajo criterio humano.
- Presentar toda la funcionalidad principal en un vídeo inferior a cinco minutos.

## Restricciones académicas y operativas

- Fecha oficial de entrega: 24/08/2026.
- Fecha objetivo interna: 18 o 19/08/2026 para disponer de margen de tramitación FUNDAE.
- Repositorio público en GitHub y licencia open source.
- Despliegue gratuito accesible para el evaluador.
- Sin registro, autenticación ni gestión de usuarios.
- Sin costes de infraestructura o servicios durante la evaluación.
- La demostración pública utiliza únicamente datos sintéticos.

## Posicionamiento

La aplicación no pretende sustituir un sistema de RR. HH. o Power BI. Es una herramienta temporal y especializada de análisis local de exportaciones existentes. Su diferenciación es la combinación de importación sencilla, reglas transparentes, calendarios españoles, procesamiento local, ausencia de puntuaciones y código abierto.

## Nombre

`AbsenceLens` es el nombre provisional. Alternativas consideradas: `Coincide`, `AusenLens`, `Foco Ausencias`, `NexoDías`, `Prisma Ausencias`, `Intervalia` y `TrazaDías`. Antes de adoptar un nombre definitivo deberán comprobarse repositorios, dominios y posibles marcas.
