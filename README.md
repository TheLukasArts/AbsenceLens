# AbsenceLens

> Aplicación web local-first para identificar **coincidencias** en patrones temporales de ausencias a partir de un archivo Excel, mediante reglas deterministas, explicables y orientadas a la **revisión humana**.

AbsenceLens es el Trabajo Fin de Máster del Máster de Desarrollo con IA de BIG School. Nace para reducir el trabajo manual de localizar patrones en exportaciones de ausencias, sin sustituir el criterio de las personas autorizadas ni adoptar decisiones laborales automatizadas.

## Enlaces de entrega

| Recurso | Enlace | Estado |
|---|---|---|
| Código fuente | [Repositorio público en GitHub](https://github.com/TheLukasArts/AbsenceLens) | Disponible |
| Aplicación | [Abrir AbsenceLens](https://thelukasarts.github.io/AbsenceLens/) | Disponible |
| Presentación | [Slides del proyecto](https://thelukasarts.github.io/AbsenceLens/slides/) | Disponible |
| Vídeo de demostración | Se publicará antes de la revisión final | Pendiente de grabación |
| Excel de ejemplo | [Descargar conjunto sintético de aceptación](samples/absence-lens-aceptacion-v1.xlsx) | Disponible |

> **Aviso para la entrega:** antes de enviar el formulario del TFM, sustituye el estado del vídeo por su URL pública definitiva. El proyecto no tiene inicio de sesión, por lo que no requiere usuario ni contraseña de prueba.

## Índice

- [Qué resuelve](#qué-resuelve)
- [Demostración rápida](#demostración-rápida)
- [Funcionalidades](#funcionalidades)
- [Reglas de análisis](#reglas-de-análisis)
- [Privacidad y uso responsable](#privacidad-y-uso-responsable)
- [Arquitectura y tecnologías](#arquitectura-y-tecnologías)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
- [Pruebas y calidad](#pruebas-y-calidad)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Datos de ejemplo](#datos-de-ejemplo)
- [Despliegue](#despliegue)
- [Documentación](#documentación)
- [Alcance y siguientes pasos](#alcance-y-siguientes-pasos)
- [Licencia](#licencia)

## Qué resuelve

Cuando una organización recibe históricos de ausencias en Excel, localizar recurrencias o episodios largos puede requerir filtros sucesivos, ordenaciones e inspección manual. AbsenceLens convierte ese proceso en un flujo trazable:

1. la persona selecciona un único archivo `.xlsx` compatible;
2. la aplicación lo valida y normaliza localmente;
3. se establece una fecha de corte para hacer reproducible el análisis;
4. se aplican reglas temporales transparentes;
5. se muestran candidatos, el motivo de cada coincidencia y el detalle de sus episodios;
6. se exportan los resultados cuando procede y se puede eliminar la sesión de memoria.

La aplicación no determina si una ausencia está justificada, no clasifica a las personas por riesgo, no recomienda medidas laborales y no sustituye la revisión humana.

## Demostración rápida

Puedes probar la aplicación sin instalar nada:

1. Abre [la versión desplegada](https://thelukasarts.github.io/AbsenceLens/).
2. Descarga el [Excel sintético de ejemplo](samples/absence-lens-aceptacion-v1.xlsx).
3. Selecciónalo desde la pantalla de importación.
4. Mantén la fecha de corte de referencia `31/07/2026` para reproducir los resultados documentados.
5. Ejecuta el análisis y consulta las vistas de recurrencia, larga duración y revisión.
6. Abre el detalle explicable de cualquier candidato o descarga el informe Excel correspondiente.

El libro de ejemplo contiene 73 filas creadas completamente desde cero y resultados conocidos. No contiene información personal ni reproduce combinaciones de datos empresariales reales.

## Funcionalidades

### Importación y validación

- Importación local de un único archivo `.xlsx` con una hoja y cabecera en la primera fila.
- Perfil de importación `ausencias-v1` con cabeceras y tipos validados.
- Conservación de `Nº Nómina` como texto, incluidos posibles ceros iniciales.
- Interpretación de fechas como valores de calendario, sin depender de la zona horaria del navegador.
- Mensajes de error saneados: indican estructura, fila, columna o código de validación, sin mostrar valores de celdas.
- Borrado explícito de la sesión y los datos cargados desde la memoria de la aplicación.

### Análisis explicable

- Fecha de corte configurable; su valor inicial es el último día del mes completo anterior.
- Reglas R1 y R2 deterministas, con límites visibles y resultados reproducibles.
- Tratamiento explícito de episodios activos y de episodios que terminan después de la fecha de corte.
- Top 10 y conjunto completo de resultados para las dos reglas principales.
- Explicación por candidato con episodios contabilizados, descartados, duración efectiva, advertencias y criterio de ordenación.

### Revisión y salida

- Vista de revisión por empleado, con las columnas autorizadas del archivo importado.
- Filtros y ordenación para facilitar la revisión posterior por una persona autorizada.
- Filtro por centro en la vista de larga duración, aplicado antes de calcular el top.
- Exportación local a `.xlsx` de los listados y del detalle de cada candidato.
- Interfaz accesible de teclado, con foco visible, etiquetas y diálogos reutilizables.

## Reglas de análisis

| Regla | Criterio | Resultado |
|---|---|---|
| **R1 - recurrencia de corta duración** | Al menos 5 episodios con duración total efectiva menor o igual a 30 días, iniciados dentro de la ventana inclusiva de 12 meses que termina en la fecha de corte. | Una fila por empleado, ordenada por número de episodios, recencia y nómina. |
| **R2 - larga duración** | Al menos un episodio con duración total efectiva mayor o igual a 180 días. | Una fila por empleado, representada por su episodio largo máximo. |

La duración se calcula de forma inclusiva: `final efectivo - inicio + 1`. La columna de duración del archivo de origen nunca determina la clasificación.

Para un episodio activo con fecha final `31/12/2999`, o con final posterior a la fecha de corte, se utiliza una fecha final efectiva igual a la de corte y se informa de la circunstancia. En R1 se cuentan los episodios por su fecha de inicio: un episodio iniciado antes de la ventana no aumenta el contador aunque intersecte con ella.

La especificación completa y los criterios de ordenación están en [Reglas de negocio](docs/03-reglas-negocio.md) y los casos verificables en [Casos de aceptación sintéticos](docs/10-casos-aceptacion.md).

## Privacidad y uso responsable

La protección de datos es una decisión arquitectónica, no una opción de configuración:

- El archivo se procesa en el navegador y en memoria; no se envía a un backend ni a servicios de terceros.
- No hay autenticación, base de datos, persistencia local, analítica, telemetría ni servicios de errores.
- La importación, el análisis, los filtros y la exportación no deben provocar peticiones de red relacionadas con las filas del Excel.
- El repositorio, las pruebas, la documentación, las capturas y la demostración utilizan exclusivamente datos sintéticos.
- El producto emplea lenguaje neutral: coincidencia, patrón temporal, candidato y revisión humana.

AbsenceLens es una herramienta de apoyo al análisis. La investigación posterior, el acceso a otras fuentes y cualquier decisión corresponden exclusivamente a personas autorizadas y quedan fuera del producto.

## Arquitectura y tecnologías

La aplicación aplica una arquitectura limpia de manera proporcional: las reglas de negocio no dependen de Angular ni de las bibliotecas de Excel.

```text
Archivo XLSX seleccionado por la persona usuaria
                  |
                  v
Adaptador de lectura en navegador
                  |
                  v
Perfil de importación y normalización
                  |
                  v
Casos de uso y reglas de dominio puras
                  |
                  v
Modelos de revisión, explicación y exportación
                  |
                  v
Interfaz web Angular
```

| Área | Tecnología |
|---|---|
| Interfaz | Angular 22, TypeScript y SCSS |
| Componentes de interfaz | Angular Material |
| Estado de interfaz | Signals de Angular |
| Internacionalización preparada | `@ngx-translate/core` con catálogo estático en español |
| Lectura de Excel | `read-excel-file` en navegador |
| Exportación de Excel | `write-excel-file` en navegador |
| Pruebas | Angular test runner, Vitest y pruebas unitarias/integración |
| Calidad de código | Prettier y configuración de editor compartida |
| Integración continua | GitHub Actions |
| Despliegue | GitHub Pages |

Las decisiones relevantes de dependencias están recogidas en los ADR del proyecto, especialmente [ADR-0001](docs/adr/0001-lector-xlsx.md).

## Instalación y ejecución local

### Requisitos

- Node.js 24.
- pnpm 11.19, administrado mediante Corepack.
- Un navegador moderno; el escenario de uso objetivo es Windows 11 en resolución de escritorio.

En WSL 2, trabaja dentro del sistema de archivos Linux del proyecto y no desde `/mnt/c`, para evitar problemas de rendimiento y permisos con las dependencias.

### Comandos

```bash
git clone https://github.com/TheLukasArts/AbsenceLens.git
cd AbsenceLens
corepack enable
pnpm install --frozen-lockfile
pnpm start
```

La aplicación de desarrollo estará disponible en la dirección indicada por Angular CLI, habitualmente `http://localhost:4200/`.

Para crear una compilación de producción:

```bash
pnpm build
```

## Pruebas y calidad

Ejecuta la suite automatizada con:

```bash
pnpm test --watch=false
```

Las pruebas cubren, entre otros aspectos:

- aritmética inclusiva de fechas, cambios de mes y año bisiesto;
- límites exactos de 30 y 180 días;
- fecha centinela de episodio activo y recortes a fecha de corte;
- ventana de recurrencia, conteo, ordenación y desempates;
- una sola fila por empleado en larga duración;
- lectura del Excel de aceptación, validación de cabeceras y nóminas como texto;
- filtros, revisión y generación de informes Excel.

Cada cambio enviado a `main` ejecuta en GitHub Actions la instalación reproducible, las pruebas y una compilación de producción con la ruta base de GitHub Pages. El despliegue se genera desde esa misma rama después de una compilación correcta.

## Estructura del proyecto

```text
.
├── .github/workflows/       # Integración continua y despliegue en GitHub Pages
├── docs/                    # Requisitos, decisiones, arquitectura y casos de aceptación
├── public/slides/           # Presentación HTML autocontenida con Reveal.js
├── samples/                 # Libros Excel completamente sintéticos
├── src/
│   └── app/
│       ├── domain/          # Entidades y reglas temporales puras
│       ├── application/     # Casos de uso, validación, revisión y generación de informes
│       ├── infrastructure/  # Adaptadores de XLSX y descarga en navegador
│       ├── presentation/    # Componentes y diálogos de la interfaz
│       └── i18n/            # Catálogo de textos en español
├── angular.json             # Configuración de Angular
├── package.json             # Scripts y dependencias
└── README.md                # Este documento
```

## Datos de ejemplo

El [conjunto sintético de aceptación](samples/absence-lens-aceptacion-v1.xlsx) está pensado para probar la aplicación y verificar resultados de referencia. Con fecha de corte `31/07/2026` debe producir:

- 7 candidatos de recurrencia corta (R1);
- 9 candidatos de larga duración (R2);
- advertencias controladas para episodios activos, recortados o iniciados fuera de la ventana.

Consulta [la tabla completa de casos y resultados esperados](docs/10-casos-aceptacion.md) antes de utilizar el libro en una demostración.

No subas archivos empresariales, exportaciones reales ni seudonimizaciones superficiales al repositorio. Para pruebas externas, utiliza únicamente conjuntos creados desde cero y sin información identificable.

## Despliegue

La versión pública se publica gratuitamente en GitHub Pages:

<https://thelukasarts.github.io/AbsenceLens/>

La presentación del proyecto se publica en el mismo despliegue:

<https://thelukasarts.github.io/AbsenceLens/slides/>

El flujo de despliegue se ejecuta al actualizar la rama `main`: instala las dependencias bloqueadas, compila con la ruta base `/AbsenceLens/` y publica el artefacto estático. No requiere servidor, credenciales de usuario ni infraestructura de datos.

## Documentación

| Documento | Contenido |
|---|---|
| [Contexto y visión](docs/01-contexto-y-vision.md) | Problema, usuario, objetivos y restricciones. |
| [Requisitos y alcance](docs/02-requisitos-mvp.md) | Flujo principal, alcance del MVP y requisitos no funcionales. |
| [Reglas de negocio](docs/03-reglas-negocio.md) | Definiciones temporales y reglas R1/R2. |
| [Datos e importación](docs/04-datos-importacion.md) | Perfil de datos, validación y tratamiento del Excel. |
| [Privacidad, ética y seguridad](docs/05-privacidad-etica-seguridad.md) | Principios de minimización, uso responsable y límites. |
| [Decisiones y roadmap](docs/06-decisiones-pendientes-roadmap.md) | Decisiones confirmadas, preguntas abiertas y evolución prevista. |
| [Arquitectura, pruebas y demostración](docs/07-arquitectura-pruebas-demo.md) | Diseño técnico, estrategia de pruebas y guion de demo. |
| [Investigación y referencias](docs/08-investigacion-referencias.md) | Alternativas, fuentes técnicas y regulatorias consultadas. |
| [Cobertura de dashboards](docs/09-cobertura-dashboards.md) | Cobertura funcional y diferencias deliberadas. |
| [Casos de aceptación](docs/10-casos-aceptacion.md) | Datos sintéticos y resultados conocidos. |
| [Primer incremento vertical](docs/11-primer-incremento-vertical.md) | Alcance, criterios y verificación de I-001. |
| [ADRs](docs/adr/) | Decisiones de arquitectura y bibliotecas. |

## Alcance y siguientes pasos

El producto actual se centra en importación, análisis explicable de R1 y R2, revisión y exportación. Las mejoras posteriores no alteran sus principios de procesamiento local, datos sintéticos y revisión humana.

Entre las líneas de evolución documentadas se encuentran:

- coincidencias adyacentes a vacaciones;
- calendarios de festivos nacionales, autonómicos y locales con tablas maestras confirmadas;
- métricas y gráficos agregados, únicamente cuando exista una fórmula y una fuente de datos autorizadas;
- mejoras de rendimiento, PWA y ejecución offline;
- perfiles de importación adicionales.

No forman parte del roadmap la predicción individual, el scoring, la investigación automática, las recomendaciones disciplinarias, un backend o la persistencia de datos.

## Uso de IA durante el desarrollo

GPT-5.6 y Codex se han utilizado como apoyo de desarrollo bajo revisión humana. Las decisiones de producto, privacidad, reglas de negocio, validación y aceptación permanecen documentadas y sometidas al criterio del autor. No se han enviado filas de datos reales a asistentes de IA.

## Licencia

Este proyecto se distribuye bajo la [licencia MIT](LICENSE).
