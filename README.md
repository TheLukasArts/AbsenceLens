# AbsenceLens

> Aplicación web local-first para identificar **coincidencias** en patrones temporales de ausencias a partir de un archivo Excel, mediante reglas deterministas, explicables y orientadas a la **revisión humana**.

AbsenceLens es el Trabajo Fin de Máster del Máster de Desarrollo con IA de BIG School. Nace para reducir el trabajo manual de localizar patrones en exportaciones de ausencias, sin sustituir el criterio de las personas autorizadas ni adoptar decisiones laborales automatizadas.

## Enlaces de entrega

| Recurso | Enlace | Estado |
|---|---|---|
| Código fuente | [Repositorio público en GitHub](https://github.com/TheLukasArts/AbsenceLens) | Disponible |
| Aplicación | [Abrir AbsenceLens](https://thelukasarts.github.io/AbsenceLens/) | Disponible |
| Presentación | [Slides del proyecto](https://thelukasarts.github.io/AbsenceLens/slides/) | Disponible |
| Vídeo de demostración | [Vídeo del proyecto](https://thelukasarts.github.io/AbsenceLens/video/) | Publicación en curso |
| Excel de ejemplo | [Descargar conjunto sintético de aceptación](https://github.com/TheLukasArts/AbsenceLens/raw/main/samples/absence-lens-aceptacion-v1.xlsx) | Disponible |

> El proyecto no tiene inicio de sesión, por lo que no requiere usuario ni contraseña de prueba.

## Índice

- [Qué resuelve](#qué-resuelve)
- [Demostración rápida](#demostración-rápida)
- [Funcionalidades](#funcionalidades)
- [Reglas de análisis](#reglas-de-análisis)
- [Privacidad y uso responsable](#privacidad-y-uso-responsable)
- [Arquitectura y tecnologías](#arquitectura-y-tecnologías)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
- [Pruebas y calidad](#pruebas-y-calidad)
- [Rendimiento](#rendimiento)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Datos de ejemplo](#datos-de-ejemplo)
- [Despliegue](#despliegue)
- [Documentación](#documentación)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Alcance y siguientes pasos](#alcance-y-siguientes-pasos)
- [Uso de IA durante el desarrollo](#uso-de-ia-durante-el-desarrollo)
- [Licencia](#licencia)

## Qué resuelve

Cuando una organización recibe históricos de ausencias en Excel, localizar recurrencias o episodios largos puede requerir filtros sucesivos, ordenaciones e inspección manual. Un archivo habitual ronda las 150.000 filas: unos 21.500 episodios de baja y el resto días de vacaciones, que se registran uno por fila. AbsenceLens convierte ese proceso en un flujo trazable:

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
2. Descarga el [Excel sintético de ejemplo](https://github.com/TheLukasArts/AbsenceLens/raw/main/samples/absence-lens-aceptacion-v1.xlsx).
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
| Interfaz | Angular 22.1, TypeScript 6.0 y SCSS |
| Componentes de interfaz | Angular Material 22.1, con adopción selectiva |
| Estado de interfaz | Signals de Angular, sin librería de estado externa |
| Internacionalización preparada | `@ngx-translate/core` 18 con catálogo estático en español |
| Lectura de Excel | `read-excel-file` 9.3.10 en navegador |
| Exportación de Excel | `write-excel-file` 4.1.1 en navegador |
| Pruebas | Vitest 4 sobre el ejecutor `@angular/build:unit-test`, con jsdom |
| Formato de código | Prettier 3 y configuración de editor compartida |
| Integración continua | GitHub Actions |
| Despliegue | GitHub Pages |
| Presentación | Reveal.js 6, empaquetado localmente y sin recursos remotos |

Las decisiones relevantes de dependencias están recogidas en los [ADR del proyecto](docs/adr/).

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

Para regenerar los libros sintéticos de prueba:

```bash
pnpm sample:small   # 15.000 filas, publicado junto a la aplicación
pnpm sample:large   # 150.000 filas, para medir rendimiento
```

## Pruebas y calidad

Ejecuta la suite automatizada con:

```bash
pnpm test --watch=false
```

Las pruebas cubren, entre otros aspectos:

- aritmética inclusiva de fechas, cambios de mes y año bisiesto;
- lectura de las fechas del Excel en UTC, sin depender de la zona horaria del navegador;
- límites exactos de 30 y 180 días;
- fecha centinela de episodio activo y recortes a fecha de corte;
- ventana de recurrencia, conteo, ordenación y desempates;
- una sola fila por empleado en larga duración;
- lectura del Excel de aceptación, validación de cabeceras y nóminas como texto;
- neutralización de textos que una hoja de cálculo podría interpretar como fórmulas;
- filtros, revisión y generación de informes Excel;
- una prueba de volumen sobre 150.000 filas que vigila regresiones de rendimiento.

Cada cambio enviado a `main` ejecuta en GitHub Actions la instalación reproducible, las pruebas y una compilación de producción con la ruta base de GitHub Pages. El despliegue se genera desde esa misma rama después de una compilación correcta.

## Rendimiento

La aplicación mide sus propias fases con el reloj de alta resolución del navegador y muestra la duración al terminar la importación y el análisis. Solo se conserva el tiempo: ningún dato del archivo interviene en la medición.

Sobre el conjunto sintético de 150.000 filas:

| Fase | Tiempo |
|---|---|
| Lectura y decodificación del `.xlsx` | 3,72 s |
| Validación del perfil de importación | 0,30 s |
| Análisis completo | 0,26 s |

El coste lo domina descomprimir el archivo, no las reglas de negocio. El método, el entorno y el historial de mediciones están en [Verificación de rendimiento](docs/19-verificacion-rendimiento.md).

## Estructura del proyecto

```text
.
├── .github/workflows/       # Integración continua y despliegue en GitHub Pages
├── docs/                    # Requisitos, decisiones, arquitectura, verificaciones y ADR
├── public/                  # Recursos servidos tal cual junto a la aplicación
│   ├── samples/             # Excel de demostración descargable desde la interfaz
│   ├── slides/              # Presentación HTML autocontenida con Reveal.js
│   └── video/               # Página estable del vídeo de demostración
├── samples/                 # Libros Excel completamente sintéticos
├── scripts/                 # Generador determinista de libros de prueba
├── src/
│   ├── app/
│   │   ├── domain/          # Entidades y reglas temporales puras
│   │   ├── application/     # Casos de uso, validación, revisión y generación de informes
│   │   ├── infrastructure/  # Adaptadores de XLSX y descarga en navegador
│   │   ├── presentation/    # Componentes y diálogos de la interfaz
│   │   └── i18n/            # Catálogo de textos en español
│   └── theme/               # Paleta de marca y paletas tonales de Material
├── angular.json             # Configuración de Angular
├── tsconfig*.json           # Configuración de TypeScript
├── .prettierrc              # Formato de código
├── .editorconfig            # Convenciones de editor
├── package.json             # Scripts y dependencias
├── LICENSE                  # Licencia MIT
└── README.md                # Este documento
```

## Datos de ejemplo

Todos los libros del repositorio son sintéticos. Ninguno procede de una exportación real ni reproduce combinaciones de datos empresariales.

| Libro | Filas | Para qué sirve |
|---|---|---|
| [Conjunto de aceptación](https://github.com/TheLukasArts/AbsenceLens/raw/main/samples/absence-lens-aceptacion-v1.xlsx) | 73 | Verificar resultados conocidos. Es la referencia de corrección del proyecto. |
| [Demostración](https://github.com/TheLukasArts/AbsenceLens/raw/main/public/samples/absence-lens-demo-15000.xlsx) | 15.000 | Probar la aplicación con un volumen apreciable. |
| Rendimiento | 150.000 | Medir tiempos con la volumetría real. Se regenera con `pnpm sample:large`. |

Con el conjunto de aceptación y fecha de corte `31/07/2026` deben obtenerse:

- 7 candidatos de recurrencia corta (R1);
- 9 candidatos de larga duración (R2);
- advertencias controladas para episodios activos, recortados o iniciados fuera de la ventana.

Consulta [la tabla completa de casos y resultados esperados](docs/10-casos-aceptacion.md) antes de utilizar el libro en una demostración.

Los conjuntos grandes los produce `scripts/generate-sample-workbook.mjs`, que es determinista: con la misma semilla genera exactamente el mismo libro, de modo que cualquier medición es reproducible.

No subas archivos empresariales, exportaciones reales ni seudonimizaciones superficiales al repositorio. Para pruebas externas, utiliza únicamente conjuntos creados desde cero y sin información identificable.

## Despliegue

La versión pública se publica gratuitamente en GitHub Pages:

<https://thelukasarts.github.io/AbsenceLens/>

La presentación del proyecto se publica en el mismo despliegue:

<https://thelukasarts.github.io/AbsenceLens/slides/>

Y el vídeo de demostración:

<https://thelukasarts.github.io/AbsenceLens/video/>

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
| [Verificación de I-001](docs/12-verificacion-i001.md) | Resultado de la comprobación del primer incremento. |
| [Segundo incremento vertical](docs/13-segundo-incremento-vertical.md) | Larga duración, filtro por centros y explicación de R2. |
| [Verificación de I-002](docs/14-verificacion-i002.md) | Resultado de la comprobación del segundo incremento. |
| [Tercer incremento vertical](docs/15-tercer-incremento-vertical.md) | Revisión filtrable y exportación a Excel. |
| [Verificación de I-003](docs/16-verificacion-i003.md) | Resultado de la comprobación del tercer incremento. |
| [Corrección de revisión y exportación](docs/17-correccion-redisenio-revision-exportacion.md) | Exclusión de vacaciones y rediseño de la navegación. |
| [Guion del vídeo](docs/18-guion-video.md) | Escaleta, locución y comprobaciones de la demostración. |
| [Verificación de rendimiento](docs/19-verificacion-rendimiento.md) | Método, entorno y resultados de las mediciones. |

### Decisiones de arquitectura

| ADR | Decisión |
|---|---|
| [ADR-0001](docs/adr/0001-lector-xlsx.md) | Librería de lectura de Excel y límites de su uso. |
| [ADR-0002](docs/adr/0002-escritor-xlsx.md) | Librería de escritura y formato de las exportaciones. |
| [ADR-0003](docs/adr/0003-angular-material.md) | Adopción selectiva de Angular Material, sin recursos remotos. |
| [ADR-0004](docs/adr/0004-i18n.md) | Internacionalización con catálogo empaquetado. |

## Limitaciones conocidas

Estas limitaciones son deliberadas y responden al alcance acordado. Se documentan aquí para que nadie descubra un límite por sorpresa:

- **Un único perfil de importación.** El archivo debe traer las catorce cabeceras esperadas, con su grafia exacta y en su orden. Admitir otros formatos requiere plantillas configurables, previstas como evolución.
- **Cualquier fila inválida bloquea la importación completa.** Se prefirió no analizar un conjunto parcial sin que la persona lo sepa. Permitir continuar omitiendo filas erróneas está registrado como mejora pendiente.
- **Sin persistencia.** Cerrar o recargar la pestaña vacía la sesión. Es consecuencia directa de procesar todo en memoria.
- **Pensado para escritorio.** No hay diseño específico para móvil ni tableta.
- **Las vacaciones no generan coincidencias.** Se conservan en memoria como contexto temporal para reglas futuras, pero quedan fuera de R1, R2, los listados y las exportaciones.
- **Sin festivos ni calendarios laborales.** La plantilla analizada trabaja a turnos los 365 días del año, de modo que un festivo puede ser laborable para cualquier empleado. La consecuencia positiva es que el análisis no necesita ninguna fuente de datos externa.
- **El filtro por centro de larga duración adscribe cada empleado al centro de su episodio más largo.** No divide ni duplica a una persona entre centros.
- **No se detectan episodios duplicados o solapados** de un mismo empleado. La fuente garantiza que no se producen.
- **Sin porcentajes de absentismo ni indicadores de horas.** Faltan la fórmula y la fuente autorizadas.

## Alcance y siguientes pasos

El producto actual se centra en importación, análisis explicable de R1 y R2, revisión y exportación. Las mejoras posteriores no alteran sus principios de procesamiento local, datos sintéticos y revisión humana.

Entre las líneas de evolución documentadas se encuentran:

- coincidencias adyacentes a vacaciones;
- plantillas de importación configurables, para admitir otros formatos de archivo;
- métricas y gráficos agregados, únicamente cuando exista una fórmula y una fuente de datos autorizadas;
- modo oscuro;
- ejecución instalable y sin conexión como aplicación web progresiva.

No forman parte del roadmap la predicción individual, el scoring, la investigación automática, las recomendaciones disciplinarias, un backend o la persistencia de datos.

## Uso de IA durante el desarrollo

Este proyecto no solo usa IA: **es también un experimento sobre cómo usarla**.

En el trabajo diario del autor la IA se emplea de forma acotada, como complemento para tareas concretas y revisiones puntuales. Aquí se invirtió el planteamiento para contrastar ambos enfoques: la IA elabora todo y la persona pasa a definir, dirigir y validar.

### Cómo se ha trabajado

- **Ninguna línea de código se ha escrito a mano.** Todo el código lo han generado asistentes de IA; el autor ha revisado cada cambio y ha dirigido su implementación.
- **Multimodelo deliberado**, para no depender del criterio de una sola herramienta: Codex y GPT-5.6 para el desarrollo principal; Copilot con Claude Sonnet y Opus para pulir y revisar.
- **Incrementos verticales** con verificación documentada en `docs/12`, `docs/14`, `docs/16` y `docs/19`.
- **Decisiones registradas** como ADR y como entradas numeradas en `docs/06`.
- **[AGENTS.md](AGENTS.md) actúa como contrato**: prohíbe datos reales, fija el lenguaje de producto, obliga a tratar las nóminas como texto y veta el backend sin una decisión registrada.

No se han enviado filas de datos reales a asistentes de IA en ningún momento.

### Qué encontró la supervisión humana

Supervisar no es aprobar sin leer. Dos ejemplos concretos de defectos que la IA introdujo y que las pruebas no detectaban:

- Las fechas del Excel se leían con los captadores locales sobre valores construidos en UTC. En cualquier navegador con desplazamiento horario negativo, **todas las fechas retrocedían un día**. Invisible desde España, con la suite en verde.
- Un recorrido cuadrático en la validación por fila, inapreciable con 73 filas y capaz de bloquear la interfaz con un archivo real.

### Conclusiones

El rol de supervisor **ahorró muchísimo tiempo** en la estructura del proyecto, las pruebas y la documentación, y ayudó a desbloquear situaciones difíciles.

**Encareció el trabajo de acabado.** Dejar la aplicación a gusto propio, en lo visual y en los matices del código, resultó más costoso que hacerlo directamente. Modificar a mano código generado por otro cuesta más, lo que empuja a volver a pedirlo a la IA; y una instrucción precisa no garantiza el resultado esperado, así que se itera, y en esa iteración se van tiempo y tokens.

Hay además un **coste económico real**: conviene saber qué modelo usar para cada tarea y aplicar técnicas de ahorro de tokens.

> La IA rinde mejor cuanto más **estructurada y verificable** es la tarea, y peor cuanto más depende del **criterio subjetivo** de quien la dirige.

## Licencia

Este proyecto se distribuye bajo la [licencia MIT](LICENSE).
