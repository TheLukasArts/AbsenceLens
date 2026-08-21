# Requisitos y alcance del MVP

## Flujo principal

1. El usuario abre la aplicación desde un equipo Windows 11 y un navegador moderno.
2. Selecciona un archivo `.xlsx` conforme al perfil de importación soportado, con el selector nativo o arrastrándolo sobre la zona de importación.
3. La aplicación valida estructura y tipos sin transmitir el contenido.
4. El usuario selecciona la fecha de corte y, cuando proceda, filtros de análisis.
5. La aplicación normaliza periodos y calcula las reglas.
6. Se muestran los listados de recurrentes de corta duración y larga duración.
7. El usuario puede filtrar y ordenar los resultados por las columnas importadas.
8. El usuario puede descargar los resultados en Excel.
9. El usuario puede eliminar la sesión y sus datos de memoria.

## Funcionalidad imprescindible

### Importación

- Aceptar un único `.xlsx` con una sola hoja y cabecera en la primera fila.
- Utilizar un perfil de importación versionado para el formato inicial.
- Conservar los valores necesarios para mostrar, ordenar, filtrar y exportar las filas candidatas.
- Ignorar para los cálculos la columna de duración proporcionada por el origen.
- Calcular internamente duraciones inclusivas y días dentro del periodo.
- Reconocer el valor centinela `31/12/2999` como episodio activo.

### Listado de recurrentes de corta duración

- Identificar empleados con al menos cinco episodios de duración total menor o igual a 30 días.
- Evaluar recurrencia en ventanas de 12 meses.
- Contar episodios por su fecha de inicio.
- Ordenar por número de episodios descendente y, en empate, por episodio más reciente.
- Explicar por qué aparece cada empleado.

### Listado de larga duración

- Identificar empleados con al menos un episodio de duración total mayor o igual a 180 días.
- Mostrar inicialmente los diez primeros del conjunto completo.
- Al seleccionar uno o varios centros, recalcular y mostrar los diez primeros dentro de los centros seleccionados.
- Ordenar por la duración del episodio individual más largo.
- Definir un desempate estable antes de implementar.

### Fecha y periodo

- Campo para seleccionar fecha de corte.
- Valor inicial: último día del mes anterior a la fecha actual.
- Para episodios activos, utilizar como final efectivo la fecha de corte.
- Las estadísticas del periodo contabilizan únicamente la intersección del episodio con dicho periodo.
- La clasificación corta/larga utiliza la duración total efectiva del episodio, aunque solo una parte caiga dentro del periodo.
- Señalar visualmente y explicar los casos en los que la duración total y los días contabilizados en el periodo difieran.
- Si un episodio empieza antes de una ventana y termina dentro, no cuenta como nuevo episodio recurrente, aunque sus días puedan contabilizarse en estadísticas del periodo.
- Señalar visualmente esta circunstancia mediante icono, tooltip o ayuda equivalente.

### Filtros y ordenación

- Permitir filtros rápidos semejantes a los de Excel.
- Filtrar por centro, fechas y descripción de ausencia.
- Permitir ordenar y filtrar por todas las columnas importadas, debido a su utilidad en la revisión posterior.
- Aplicar los filtros de centro antes de obtener el top 10 de larga duración.

### Resultados y exportación

- Mostrar el número de nómina como identificador del empleado.
- Conservar el detalle de las columnas originales para la revisión posterior autorizada.
- Mostrar explicación trazable de las reglas y cálculos.
- Descargar el resultado en `.xlsx` mediante una acción explícita.

## Funcionalidad importante

- Listados y tops por uno o varios centros.
- Gráficos de barras y líneas.
- Porcentaje de absentismo por año, pendiente de conocer fórmula y denominador.
- Gráficos agregados del perfil de absentismo por rango de edad, ámbito, contrato y sexo.

## Funcionalidad deseable

- Pantalla detallada de cada resultado.
- Ejecución offline/PWA.
- Estadísticas adicionales.
- Coincidencias de ausencias adyacentes a vacaciones.

## Fuera del MVP

- Investigar o decidir si una ausencia está justificada.
- Diagnósticos, justificantes o motivos médicos adicionales.
- Puntuación de riesgo, fraude o sospecha.
- Predicción mediante aprendizaje automático.
- Recomendaciones laborales o disciplinarias.
- Login, usuarios, roles o permisos internos de la aplicación.
- Backend, base de datos, subida de archivos o almacenamiento remoto.
- Integración con sistemas de gestión de personas o plataformas de cuadros de mando.
- Soporte móvil o tableta.
- Importación incremental o combinación histórica de sesiones.
- Interpretación arbitraria de cualquier Excel.
- Editor y almacenamiento de perfiles de importación.

## Experiencia objetivo

- Diseño para portátil y resolución de escritorio.
- Cubrir la información necesaria de los dashboards de referencia mediante una interfaz propia, sin exigir una reproducción idéntica.
- Respetar la paleta de marca en cabeceras, cuerpos, superficies y estados, utilizando tokens de color autorizados.
- Primera acción evidente: seleccionar archivo. Quien no disponga de uno puede descargar un libro sintético de ejemplo desde el propio panel.
- El usuario debe entender el estado de privacidad antes de importar.
- Las reglas y límites deben estar visibles, no ocultos en una caja negra.
- Advertencias explicativas, no alarmistas.
- Demostración completa inferior a cinco minutos.

## Requisitos no funcionales iniciales

- Procesar al menos 150.000 filas con fluidez en un portátil convencional.
- No bloquear la interfaz durante operaciones perceptibles; evaluar Web Worker si la medición lo justifica.
- Funcionamiento en navegadores modernos sobre Windows 11.
- Sin peticiones de red provocadas por la importación, análisis, filtrado o exportación.
- Resultados deterministas para el mismo archivo, fecha y configuración.
- Accesibilidad básica de teclado, contraste, etiquetas y tooltips accesibles.
- No depender de la zona horaria para interpretar fechas sin hora.
