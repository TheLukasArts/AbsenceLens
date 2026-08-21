# Contexto y visión

## Origen de la necesidad

Una persona responsable del seguimiento de ausencias recibe periódicamente un histórico exportado a Excel y necesita localizar en él determinados patrones temporales. No dispone de un panel analítico que resuelva esa consulta, de modo que trabaja directamente sobre la hoja de cálculo: aplica filtros sucesivos, ordena por distintas columnas y revisa los resultados a simple vista.

El volumen de empleados y de registros convierte ese trabajo en una tarea lenta, repetitiva y propensa a errores, que además hay que rehacer entera cada vez que llega una exportación nueva.

La aplicación se concibe para el uso individual de esa persona. No se integra en ningún sistema corporativo, no recibe datos de terceros y no publica resultados en ninguna plataforma. Esa condición es la que justifica que todo el procesamiento ocurra en el navegador y en memoria.

## Problema

Partiendo de un histórico de aproximadamente dos años y unas 150.000 filas, resulta costoso encontrar empleados cuyas ausencias cumplan patrones como recurrencia de procesos cortos o episodios de larga duración. De esas filas, alrededor de 21.500 corresponden a episodios de baja y el resto a días de vacaciones, que se registran uno por fila. Actualmente se aplican sucesivos filtros en Excel, se revisan resultados visualmente y se ordenan los candidatos.

El problema no es específico de una organización ni de un sector: se reproduce en cualquier entorno donde el análisis de ausencias se resuelva sobre exportaciones en hoja de cálculo.

## Propuesta de valor

AbsenceLens reduce un conjunto grande de registros a listados breves de candidatos, cada uno acompañado del motivo por el que aparece: la regla aplicada, la ventana evaluada y los episodios contabilizados y descartados. La investigación posterior, el acceso a otras fuentes y cualquier decisión corresponden exclusivamente a una persona autorizada y quedan fuera del producto.

Toda la información necesaria para el análisis viaja dentro del propio archivo importado. La aplicación no consulta ninguna fuente de datos externa.

## Formulación de producto

> AbsenceLens es una aplicación web local-first que importa y normaliza un histórico de ausencias desde Excel, aplica reglas temporales configuradas y presenta coincidencias explicables para revisión humana, sin transmitir el archivo ni tomar decisiones laborales.

## Usuario principal

Una única persona, que realiza el análisis de ausencias y domina los filtros y las ordenaciones de Excel, pero necesita ahorrar el trabajo manual de localizar patrones entre miles de filas. No hay más perfiles de uso, ni roles, ni permisos.

## Objetivos del TFM

- Resolver un problema real definido por una persona distinta del autor.
- Demostrar toma y validación de requisitos, incluidas las decisiones que **reducen** el alcance.
- Aplicar arquitectura limpia de forma proporcionada, de modo que la aplicación resulte extensible y mantenible.
- Implementar importación, normalización, filtrado, reglas temporales y visualización.
- Demostrar pruebas, calidad, seguridad, privacidad desde el diseño, CI/CD y despliegue.
- Contrastar un desarrollo íntegramente asistido por IA, con la persona en el papel de supervisor, frente al uso acotado de la IA como complemento puntual; documentar el método, los modelos empleados y las conclusiones.
- Presentar la funcionalidad principal en un vídeo de demostración de entre seis y siete minutos.

## Restricciones académicas y operativas

- Fecha oficial de entrega: 24/08/2026.
- Repositorio público en GitHub y licencia open source.
- Despliegue gratuito accesible para el evaluador.
- Sin registro, autenticación ni gestión de usuarios.
- Sin costes de infraestructura o servicios durante la evaluación.
- La demostración pública utiliza únicamente datos sintéticos.

## Posicionamiento

La aplicación no pretende sustituir un sistema de gestión de personas ni una plataforma de cuadros de mando. Es una herramienta especializada de análisis local sobre exportaciones existentes. Su diferenciación es la combinación de importación sencilla, reglas transparentes, procesamiento local sin dependencias externas, ausencia de puntuaciones y código abierto.

## Nombre

`AbsenceLens` es el nombre definitivo del proyecto y se utiliza en el repositorio, el despliegue y toda la documentación.
