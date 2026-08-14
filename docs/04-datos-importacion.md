# Datos e importación

## Características del archivo real

- Formato `.xlsx`.
- Una sola hoja.
- Cabecera única en la primera fila.
- Sin fórmulas, macros, contraseña, celdas combinadas, filas ocultas ni hojas auxiliares.
- Fechas mostradas en formato español `DD/MM/AAAA`.
- Aproximadamente 15.000 filas y 8,4 MB cuando incluye vacaciones.
- Histórico completo de aproximadamente dos años.
- El archivo se puede regenerar en cualquier momento.
- No existen incrementales: cada export contiene todo el histórico disponible.
- Los registros históricos pueden corregirse o cambiar de tipo, por lo que no debe persistirse una copia anterior para mezclarla automáticamente.
- La fuente entrega registros previamente filtrados y considerados válidos.

## Columnas observadas

| Cabecera de origen | Uso previsto |
|---|---|
| Nº Nómina | Identificador estable del empleado; importar y conservar como texto, incluidos los ceros a la izquierda |
| Activo/Inactivo | Mostrar, filtrar, ordenar y exportar |
| Convenio Laboral | Mostrar, filtrar, ordenar y exportar |
| Fecha Inicio Ausencia | Regla, filtro, ordenación y exportación |
| Fecha Fin Ausencia | Regla, filtro, ordenación y exportación |
| Descripción Ausencia | Clasificación entre vacaciones y bajas; filtro y exportación |
| Ambito | Sección o zona de trabajo dentro del aeropuerto; gráficos y filtros |
| Fecha Nacimiento | Fecha de calendario sin hora; cálculo agregado de rango de edad y detalle autorizado |
| Tipo de Empleado | Mostrar, filtrar, ordenar y exportar |
| Fijo/Temporal | Perfil agregado, filtro y exportación |
| Plan Salarial - Desc. | Mostrar, filtrar, ordenar y exportar |
| Sexo | Perfil agregado, filtro y exportación |
| Ubicación - Código | Código del centro aeroportuario; filtro, calendario y exportación; estándar exacto pendiente de confirmar |
| Número de Días de Ausencia a Fecha de hoy | Descartar el valor de origen; no filtrar, ordenar ni exportar ese valor y sustituirlo por cálculos internos cuando proceda |

Mantener exactamente la grafía real de las cabeceras en el perfil de importación y mapearla a nombres internos neutrales. La cabecera confirmada es `Ambito`, sin tilde. El identificador de nómina no debe convertirse a número ni perder su representación con ceros a la izquierda.

La cabecera exacta confirmada es `Convenio Laboral`. En la captura aparecía como `Convenio` porque el ancho visible de la columna truncaba el texto.

## Perfil de importación inicial

La primera versión contendrá un único perfil integrado y versionado, provisionalmente `ausencias-v1`. El lector físico del libro estará separado del perfil que mapea hoja, cabeceras, tipos y transformaciones.

El roadmap contempla:

1. perfil único integrado;
2. carga de perfiles externos;
3. editor visual y almacenamiento local de perfiles;
4. detección y gestión de distintos formatos.

## Valores categóricos conocidos

Inventario autorizado para el perfil inicial:

| Columna | Valores admitidos o conocidos |
|---|---|
| Activo/Inactivo | `Activo`, `Inactivo` |
| Convenio Laboral | `HND-14`, `RG-14`, `TI-15` |
| Descripción Ausencia | `Vacaciones`, `Enfermedad con Baja en la S.S`, `Accidente Laboral`, `Ampliacion Incapacidad Temp` |
| Ambito | `CEN`, `CIC`, `IBI`, `MYP`, `PAC`, `PAX`, `PRO`, `RAM`, `SGE`, `TER` |
| Tipo de Empleado | `EV`, `FD`, `FJI`, `FJR`, `FTP` |
| Fijo/Temporal | `Fijo`, `Fijo/Temporal`, `Temporal` |
| Plan Salarial - Desc. | `ADMINISTRATIVOS`, `Fuera CC`, `GRUPO SUPERIOR GESTORES Y TEC.`, `SE ADMINISTRATIVO`, `SE SERVICIOS AUXILIARES`, `SERVICIOS AUXILIARES` |
| Sexo | `F`, `M` |
| Ubicación - Código | `ABC`, `AGP`, `ALC`, `BCN`, `BIO`, `BJS`, `BJZ`, `EAS`, `GRO`, `GRX`, `IBZ`, `LCG`, `LEI`, `LEN`, `LPA`, `MAD`, `MAH`, `MJV`, `MLN`, `OVD`, `PMI`, `PNA`, `REU`, `RGS`, `RJL`, `SCQ`, `SDR`, `SLM`, `SPC`, `TFN`, `TFS`, `VGO`, `VIT`, `VLL`, `XRY`, `ZAZ` |

`Vacaciones` identifica vacaciones disfrutadas. Los otros tres valores de `Descripción Ausencia` representan episodios de baja laboral y deben conservarse literalmente, sin inferir diagnósticos ni causas adicionales.

`Plan Salarial - Desc.` y `Ubicación - Código` están confirmadas como cabeceras y no forman parte de sus respectivos inventarios de valores.

## Alcance semántico de las columnas

- El motor de reglas utiliza únicamente identificador, fechas, descripción de ausencia y, cuando corresponda, centro.
- Las demás categorías se conservan como etiquetas opacas para mostrar, filtrar, ordenar y exportar. AbsenceLens no les asigna significado adicional.
- Ninguna de esas categorías interviene por sí sola en la generación de candidatos ni en su posición en los listados.
- Los gráficos de perfil futuros podrán agregarlas solo cuando exista una decisión funcional explícita y sin convertirlas en factores de candidatura.

## Normalización

- Convertir fechas Excel o texto a fecha de calendario sin hora.
- Tratar inicio y fin como inclusivos.
- Reconocer `31/12/2999` como final abierto.
- Mantener las filas originales para detalle y exportación, salvo el valor de duración de origen expresamente descartado.
- Construir entidades normalizadas independientes para el motor de reglas.
- Agrupar filas consecutivas de vacaciones por empleado.
- No confiar en la columna de duración del origen.
- No deduplicar agresivamente: no existe un identificador de episodio y una fila diaria de vacaciones es intencionada.
- Puede utilizarse un identificador técnico de fila solo dentro de la sesión.

## Validaciones defensivas

Aunque la fuente declare todas las filas válidas, el importador debe detectar:

- hoja o cabeceras incompatibles;
- fechas vacías o ilegibles;
- fin anterior a inicio;
- identificador de nómina vacío;
- descripción desconocida;
- ubicación sin mapeo cuando se ejecuten reglas de festivos;
- filas fuera de la fecha de corte;
- inicio posterior a la fecha de corte, que se omite con advertencia;
- final posterior a la fecha de corte, que se recorta para el análisis conservando el valor original en el detalle;
- tipos de celda inesperados.

Definir antes de implementar si los errores bloquean toda la importación o permiten continuar omitiendo filas. Recomendación provisional: bloquear por estructura incompatible y permitir revisar/omitir errores de fila con un resumen explícito.

## Datos sintéticos

No utilizar el archivo empresarial real. Crear desde cero:

- un archivo pequeño de aceptación con casos conocidos;
- un archivo de aproximadamente 15.000 filas para rendimiento y demo;
- vocabulario categórico autorizado combinado de forma totalmente sintética;
- identificadores sintéticos de seis dígitos, generados desde cero y tratados como texto;
- fechas y perfiles totalmente inventados;
- varios centros públicos o ficticios sin reproducir la distribución empresarial.

No basta con sustituir el número de nómina de un archivo real: fechas, nacimiento, sexo, ubicación, convenio y plan pueden reidentificar cuando se combinan.

El archivo pequeño de aceptación `absence-lens-aceptacion-v1.xlsx` se ha creado desde cero con 73 filas sintéticas, una sola hoja y las cabeceras exactas del perfil. Utiliza como fecha de corte de referencia `31/07/2026`; sus resultados esperados se documentan en `docs/10-casos-aceptacion.md`.
