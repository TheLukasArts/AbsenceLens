# Privacidad, ética y seguridad

## Finalidad y límites

La aplicación localiza coincidencias objetivas entre registros. No determina causas, legitimidad, fraude, sospecha ni medidas laborales. El resultado es un conjunto de candidatos para revisión humana fuera de AbsenceLens.

## Naturaleza de los datos

El número de nómina permite que una persona autorizada identifique al empleado en otro sistema. Por tanto, es un identificador seudonimizado, no un dato anónimo. Las ausencias y algunas categorías pueden relacionarse con salud. Fecha de nacimiento, sexo, ubicación, convenio y plan son datos personales o cuasiidentificadores relevantes al riesgo.

## Separación de responsabilidades

### TFM público

- Solo datos sintéticos.
- No contiene marca, nombres, códigos internos no autorizados ni información confidencial.
- El vocabulario categórico expresamente autorizado puede formar parte del perfil de importación, pero nunca se copiarán filas, combinaciones o distribuciones del origen empresarial.
- El evaluador puede probar todo sin acceder a información empresarial.

### Posible uso personal posterior

- No constituye una implantación oficial en la empresa.
- Requiere comprobar políticas corporativas y autorización antes de usar datos reales.
- Podría requerir compilación local, alojamiento corporativo o revisión de seguridad.
- El responsable del tratamiento y la organización conservan sus obligaciones legales y organizativas.

## Medidas técnicas previstas

- Aplicación Angular estática y local-first.
- Lectura mediante API de archivos del navegador.
- Procesamiento en memoria; sin persistencia por defecto.
- Sin backend, subida de archivos o base de datos remota.
- Sin IA en tiempo de ejecución.
- Sin telemetría, analítica, fuentes remotas ni envío de errores con contenido.
- Sin fuentes de datos externas: el análisis solo utiliza el archivo importado.
- Botón para eliminar la sesión.
- No registrar nombre del archivo, identificadores, filas ni valores personales.
- Mensajes de error saneados.
- Exportación individual mediante acción explícita y advertencia.
- Prueba de que importar y analizar no genera peticiones de red.
- Evaluar una política de seguridad de contenidos estricta.

## Minimización funcional

El motor de reglas utilizará únicamente identificador, fechas, descripción y centro. La aplicación conservará durante la sesión el resto de columnas porque el usuario ha confirmado que son necesarias para filtrar, ordenar y realizar la revisión posterior. Esta decisión debe explicarse en la memoria y revisarse si el uso cambia.

## Mediciones con archivos no sintéticos

Comprobar el comportamiento con el volumen real exigió abrir una vez un archivo autorizado en la aplicación. El procedimiento seguido, y el que debe repetirse si vuelve a hacer falta, es este:

- el archivo se abre exclusivamente en local, desde la máquina de quien lo tiene autorizado;
- no se copia al repositorio, ni a la carpeta de muestras, ni a ningún directorio del proyecto;
- no se conserva después de la medición;
- solo se anota la duración observada y el número de filas: ningún valor, identificador ni combinación de columnas sale de la sesión;
- la cifra publicada se acompaña siempre de la aclaración de que procede de una medición puntual sobre un archivo que no forma parte del proyecto.

Las mediciones reproducibles se realizan sobre el conjunto sintético equivalente descrito en `docs/19-verificacion-rendimiento.md`, que sí está versionado y puede regenerarse.

## Gráficos de perfil

- Mostrar exclusivamente agregados por rango de edad, ámbito, contrato y sexo.
- No utilizar estos atributos para decidir candidaturas o posiciones en rankings.
- No inferir causalidad.
- Considerar ocultar o agrupar segmentos de tamaño muy pequeño.
- Definir rangos de edad y fecha a la que se calcula la edad.

## Transparencia en resultados

- Mostrar reglas y umbrales.
- Explicar episodios incluidos y excluidos.
- Diferenciar duración total de días dentro del periodo.
- Indicar datos incompletos.
- Evitar colores, iconos y términos que impliquen culpabilidad.
- Mantener siempre la decisión humana.

## Uso de IA durante el desarrollo

- GPT-5.6 y Codex pueden proponer código, pruebas, documentación y alternativas.
- El autor valida requisitos, arquitectura, reglas, resultados y seguridad.
- No se proporcionarán datos empresariales o de empleados a los modelos.
- Se conservará un registro breve de decisiones aceptadas, modificadas o rechazadas.
- Las pruebas y resultados verificables prevalecen sobre las afirmaciones de la IA.

## Capturas de referencia

- Una captura con identificadores, atributos o métricas reales a nivel de trabajador no se considera saneada aunque nombres u otros campos estén cubiertos.
- Esas capturas no se copiarán, editarán, transformarán, versionarán ni utilizarán como activos del repositorio.
- Las referencias visuales se recrearán desde cero con datos y distribuciones completamente sintéticos.

## Documentación del TFM

Incluir una sección de privacidad desde el diseño, un diagrama de flujo de datos, un pequeño análisis de riesgos, las limitaciones de uso y la distinción entre prototipo público y posible uso empresarial.
