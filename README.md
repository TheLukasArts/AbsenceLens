# AbsenceLens

> Aplicación web local-first que identifica **coincidencias** en patrones temporales de ausencias a partir de un archivo Excel, mediante reglas deterministas, explicables y orientadas a la **revisión humana**.

Trabajo Fin de Máster del Máster de Desarrollo con IA de BIG School. Reduce el trabajo manual de localizar patrones en exportaciones de ausencias, sin sustituir el criterio de las personas autorizadas ni adoptar decisiones laborales automatizadas.

## Enlaces de entrega

| Recurso | Enlace | Estado |
|---|---|---|
| Código fuente | [Repositorio público en GitHub](https://github.com/TheLukasArts/AbsenceLens) | Disponible |
| Aplicación | [Abrir AbsenceLens](https://thelukasarts.github.io/AbsenceLens/) | Disponible |
| Presentación | [Slides del proyecto](https://thelukasarts.github.io/AbsenceLens/slides/) | Disponible |
| Vídeo de demostración | [Vídeo del proyecto](https://thelukasarts.github.io/AbsenceLens/video/) | Publicación en curso |

> El proyecto no tiene inicio de sesión, por lo que no requiere usuario ni contraseña de prueba.

## Qué resuelve

Cuando alguien recibe un histórico de ausencias en Excel, localizar recurrencias o episodios largos exige filtros sucesivos, ordenaciones e inspección visual. Un archivo habitual ronda las **150.000 filas**: unos 21.500 episodios de baja y el resto días de vacaciones, que se registran uno por fila. El proceso hay que repetirlo entero con cada exportación nueva, y después justificar por qué aparece cada resultado.

AbsenceLens convierte ese trabajo en un flujo trazable: importa el archivo, lo valida, aplica dos reglas temporales sobre una fecha de corte y devuelve una lista breve de candidatos, cada uno acompañado del motivo por el que aparece.

La aplicación no determina si una ausencia está justificada, no clasifica a las personas por riesgo, no recomienda medidas laborales y no sustituye la revisión humana.

## Probarlo en dos minutos

1. Abre [la aplicación desplegada](https://thelukasarts.github.io/AbsenceLens/).
2. Descarga el [Excel de ejemplo](https://github.com/TheLukasArts/AbsenceLens/raw/main/samples/absence-lens-aceptacion-v1.xlsx) y selecciónalo en la pantalla de importación.
3. Mantén la fecha de corte `31/07/2026` y ejecuta el análisis.
4. Debes obtener **7 candidatos de recurrencia corta** y **9 de larga duración**.
5. Abre la ficha de cualquiera para ver por qué aparece, y exporta el informe si quieres.

Todos los libros del repositorio son sintéticos: ninguno procede de una exportación real ni reproduce combinaciones de datos empresariales.

| Libro | Filas | Para qué sirve |
|---|---|---|
| [Aceptación](https://github.com/TheLukasArts/AbsenceLens/raw/main/samples/absence-lens-aceptacion-v1.xlsx) | 73 | Verificar los resultados conocidos de arriba. Es la referencia de corrección del proyecto. |
| [Demostración](https://github.com/TheLukasArts/AbsenceLens/raw/main/public/samples/absence-lens-demo-15000.xlsx) | 15.000 | Probar con volumen apreciable. Produce 106 candidatos R1 y 44 R2. |
| Rendimiento | 150.000 | Medir tiempos con la volumetría real. Se regenera con `pnpm sample:large`. |

Los resultados esperados del libro de aceptación están detallados en [Casos de aceptación](docs/10-casos-aceptacion.md).

## Funcionalidades

| Capacidad | Qué hace |
|---|---|
| **Importación validada** | Lee un único `.xlsx` contra el perfil versionado `ausencias-v1`. Conserva `Nº Nómina` como texto con sus ceros iniciales e interpreta las fechas sin depender de la zona horaria del navegador. |
| **Errores saneados** | Informa de estructura, fila, columna y código de validación, nunca del contenido de las celdas. |
| **Análisis reproducible** | Fecha de corte configurable, con el último día del mes completo anterior como valor inicial. Mismas entradas, mismos resultados. |
| **Explicación por candidato** | Episodios contabilizados y descartados con su motivo, ventana evaluada, duración efectiva, advertencias y criterio de ordenación. |
| **Revisión filtrable** | Tabla combinada por empleado con filtros y ordenación, y filtro por centro en larga duración. |
| **Exportación local** | Genera en memoria los listados y la ficha de cada candidato en `.xlsx`. |
| **Borrado de sesión** | Elimina de la memoria los datos cargados, bajo confirmación explícita. |

La interfaz es accesible por teclado, con foco visible y etiquetas asociadas.

## Reglas de análisis

| Regla | Criterio | Resultado |
|---|---|---|
| **R1 · Recurrencia corta** | Al menos 5 episodios de hasta 30 días de duración efectiva, iniciados dentro de la ventana inclusiva de 12 meses que termina en la fecha de corte. | Una fila por empleado, ordenada por número de episodios, recencia y nómina. |
| **R2 · Larga duración** | Al menos un episodio de 180 días o más de duración efectiva. | Una fila por empleado, representada por su episodio más largo. |

La duración se calcula de forma inclusiva: `final efectivo − inicio + 1`. **La columna de duración del archivo de origen nunca determina la clasificación.**

La especificación completa, el tratamiento de episodios activos y los criterios de desempate están en [Reglas de negocio](docs/03-reglas-negocio.md).

## Privacidad

La protección de datos es una decisión arquitectónica, no una opción de configuración:

- El archivo se procesa en el navegador y en memoria. No hay backend, base de datos, subida de archivos ni servicios de terceros.
- Sin autenticación, persistencia, analítica, telemetría ni servicios de errores.
- **Ninguna fuente de datos externa**: todo lo que el análisis necesita viaja en el propio archivo.
- Puede comprobarse en la pestaña de red del navegador: importar, analizar, filtrar y exportar no generan una sola petición.

El detalle de los principios de minimización y uso responsable está en [Privacidad, ética y seguridad](docs/05-privacidad-etica-seguridad.md).

## Arquitectura y stack

Las dependencias apuntan hacia el dominio: las reglas de negocio no conocen ni Angular ni la librería de Excel, de modo que sustituir el perfil de importación o el lector no obliga a tocarlas.

```text
Archivo XLSX seleccionado por la persona usuaria
                  |
                  v
Adaptador de lectura en navegador          → infraestructura
                  |
                  v
Perfil de importación y normalización      → aplicación
                  |
                  v
Reglas temporales R1 y R2                  → dominio
                  |
                  v
Revisión, explicación y exportación        → aplicación
                  |
                  v
Interfaz web Angular                       → presentación
```

| Área | Tecnología |
|---|---|
| Interfaz | Angular 22.1, TypeScript 6.0 y SCSS |
| Componentes | Angular Material 22.1, con adopción selectiva |
| Estado | Signals de Angular, sin librería externa |
| Textos | `@ngx-translate/core` 18 con catálogo español empaquetado |
| Excel | `read-excel-file` 9.3.10 y `write-excel-file` 4.1.1, ambos en navegador |
| Pruebas | Vitest 4 sobre `@angular/build:unit-test`, con jsdom |
| Formato | Prettier 3 y configuración de editor compartida |
| CI/CD | GitHub Actions y GitHub Pages |
| Presentación | Reveal.js 6, empaquetado localmente y sin recursos remotos |

El porqué de cada dependencia está en los [ADR del proyecto](docs/adr/).

## Instalación y ejecución

**Requisitos:** Node.js 24 y pnpm 11.19 mediante Corepack.

```bash
git clone https://github.com/TheLukasArts/AbsenceLens.git
cd AbsenceLens
corepack enable
pnpm install --frozen-lockfile
pnpm start
```

La aplicación queda disponible en `http://localhost:4200/`.

| Comando | Efecto |
|---|---|
| `pnpm start` | Servidor de desarrollo |
| `pnpm build` | Compilación de producción |
| `pnpm test --watch=false` | Suite completa de pruebas |
| `pnpm sample:small` | Regenera el libro de 15.000 filas |
| `pnpm sample:large` | Regenera el libro de 150.000 filas |

En WSL 2, trabaja dentro del sistema de archivos Linux y no desde `/mnt/c`, para evitar problemas de rendimiento y permisos con las dependencias.

## Estructura del proyecto

```text
.
├── .github/workflows/       # Integración continua y despliegue en GitHub Pages
├── docs/                    # Requisitos, decisiones, verificaciones y ADR
├── public/                  # Recursos servidos junto a la aplicación
│   ├── samples/             # Excel de demostración descargable
│   ├── slides/              # Presentación HTML con Reveal.js
│   └── video/               # Página estable del vídeo
├── samples/                 # Libros Excel completamente sintéticos
├── scripts/                 # Generador determinista de libros de prueba
├── src/
│   ├── app/
│   │   ├── domain/          # Entidades y reglas temporales puras
│   │   ├── application/     # Casos de uso, validación, revisión e informes
│   │   ├── infrastructure/  # Adaptadores de XLSX y descarga
│   │   ├── presentation/    # Componentes y diálogos
│   │   └── i18n/            # Catálogo de textos
│   └── theme/               # Paleta de marca y paletas de Material
├── angular.json             # Configuración de Angular
├── tsconfig*.json           # Configuración de TypeScript
├── package.json             # Scripts y dependencias
├── AGENTS.md                # Reglas de trabajo para los asistentes de IA
├── LICENSE                  # Licencia MIT
└── README.md                # Este documento
```

## Calidad y rendimiento

La suite automatizada cubre la aritmética inclusiva de fechas y los años bisiestos, la lectura de fechas en UTC, los límites exactos de 30 y 180 días, la ventana de recurrencia con sus desempates, la validación de cabeceras y nóminas como texto, la neutralización de textos que una hoja de cálculo interpretaría como fórmulas, y el libro de aceptación completo contrastado contra sus resultados conocidos.

Cada cambio integrado en `main` ejecuta en GitHub Actions la instalación reproducible, las pruebas y una compilación de producción antes de desplegar.

La aplicación **mide sus propias fases** y muestra la duración al terminar. Solo se conserva el tiempo: ningún dato del archivo interviene en la medición. Sobre el despliegue público con un archivo de 150.000 filas:

| Fase | Tiempo |
|---|---|
| Importación completa | 5,4 s |
| Análisis de las dos reglas | 0,2 s |

El coste lo domina descomprimir el archivo, no las reglas. El método y el historial están en [Verificación de rendimiento](docs/19-verificacion-rendimiento.md).

## Objetivos del TFM y grado de cumplimiento

| Objetivo | Estado |
|---|---|
| Resolver un problema real planteado por otra persona | Cumplido: la herramienta está en uso y sus requisitos se validaron con la persona usuaria |
| Demostrar toma y validación de requisitos | Cumplido: una validación posterior **redujo** el alcance al descartar los festivos |
| Arquitectura limpia y proporcional | Cumplido: dominio y aplicación independientes de Angular y de la librería de Excel |
| Pruebas, calidad, privacidad, CI/CD y despliegue | Cumplido: suite automatizada, integración continua y despliegue gratuito reproducible |
| Contrastar un desarrollo íntegramente asistido por IA | Cumplido: método, modelos y conclusiones documentados más abajo |

Los objetivos completos y las restricciones del trabajo están en [Contexto y visión](docs/01-contexto-y-vision.md).

## Alcance, límites y evolución

Estas limitaciones son deliberadas. Se declaran para que nadie descubra un límite por sorpresa:

- **Un único perfil de importación.** El archivo debe traer las catorce cabeceras esperadas, con su grafía exacta y en su orden.
- **Cualquier fila inválida bloquea la importación completa.** Se prefirió no analizar un conjunto parcial sin que la persona lo sepa.
- **Sin persistencia.** Cerrar la pestaña vacía la sesión: es consecuencia directa de procesar todo en memoria.
- **Pensado para escritorio.** No hay diseño específico para móvil ni tableta.
- **Las vacaciones no generan coincidencias.** Se conservan como contexto temporal para reglas futuras.
- **Sin festivos ni calendarios laborales.** La plantilla analizada trabaja a turnos los 365 días del año, así que un festivo puede ser laborable para cualquiera. La consecuencia positiva es que el análisis no necesita ninguna fuente externa.
- **En larga duración, cada empleado se adscribe al centro de su episodio más largo.** No se divide ni se duplica entre centros.
- **Sin porcentajes de absentismo ni indicadores de horas.** Faltan la fórmula y la fuente autorizadas.

Líneas de evolución previstas: adyacencia entre bajas y periodos de vacaciones, plantillas de importación configurables, modo oscuro y ejecución instalable sin conexión.

**No forman parte del roadmap** la predicción individual, las puntuaciones de riesgo, la investigación automática, las recomendaciones disciplinarias, un backend ni la persistencia de datos.

## Desarrollo con IA

Este proyecto no solo usa IA: **es también un experimento sobre cómo usarla**. En el trabajo diario del autor la IA se emplea de forma acotada, para tareas puntuales. Aquí se invirtió el planteamiento: la IA elabora todo y la persona define, dirige y valida.

**Ninguna línea de código se ha escrito a mano.** El desarrollo principal se hizo con Codex y GPT-5.6; el pulido y la revisión, con Copilot usando Claude Sonnet y Opus. Emplear varios modelos evita depender del criterio de una sola herramienta. [AGENTS.md](AGENTS.md) actúa como contrato: prohíbe datos reales, fija el lenguaje de producto y veta el backend sin una decisión registrada. En ningún momento se han enviado filas de datos reales a un asistente.

**Supervisar no es aprobar sin leer.** La revisión humana encontró dos defectos que la IA introdujo y que las pruebas no detectaban: las fechas del Excel se leían con los captadores locales sobre valores construidos en UTC, de modo que en cualquier navegador con desplazamiento negativo **todas retrocedían un día**; y un recorrido cuadrático en la validación por fila, inapreciable con 73 filas y capaz de bloquear la interfaz con un archivo real.

**Conclusión.** El rol de supervisor ahorró muchísimo tiempo en la estructura del proyecto, las pruebas y la documentación, y ayudó a desbloquear situaciones difíciles. Encareció en cambio el acabado: dejar la aplicación a gusto propio resultó más costoso que hacerlo directamente, porque modificar código ajeno cuesta más y una instrucción precisa no garantiza el resultado, así que se itera. A ello se suma un coste económico real, que obliga a elegir qué modelo usar en cada tarea.

> La IA rinde mejor cuanto más **estructurada y verificable** es la tarea, y peor cuanto más depende del **criterio subjetivo** de quien la dirige.

## Documentación

| Bloque | Documentos |
|---|---|
| Producto | [Contexto y visión](docs/01-contexto-y-vision.md) · [Requisitos y alcance](docs/02-requisitos-mvp.md) · [Cobertura funcional](docs/09-cobertura-dashboards.md) |
| Negocio y datos | [Reglas de negocio](docs/03-reglas-negocio.md) · [Datos e importación](docs/04-datos-importacion.md) · [Casos de aceptación](docs/10-casos-aceptacion.md) |
| Responsabilidad | [Privacidad, ética y seguridad](docs/05-privacidad-etica-seguridad.md) · [Investigación y referencias](docs/08-investigacion-referencias.md) |
| Ingeniería | [Arquitectura, pruebas y demostración](docs/07-arquitectura-pruebas-demo.md) · [Decisiones y roadmap](docs/06-decisiones-pendientes-roadmap.md) · [ADR](docs/adr/) |
| Incrementos | [I-001](docs/11-primer-incremento-vertical.md) · [I-002](docs/13-segundo-incremento-vertical.md) · [I-003](docs/15-tercer-incremento-vertical.md) · [Corrección de revisión y exportación](docs/17-correccion-redisenio-revision-exportacion.md) |
| Verificaciones | [I-001](docs/12-verificacion-i001.md) · [I-002](docs/14-verificacion-i002.md) · [I-003](docs/16-verificacion-i003.md) · [Rendimiento](docs/19-verificacion-rendimiento.md) |
| Entrega | [Guion del vídeo](docs/18-guion-video.md) |

## Licencia

Este proyecto se distribuye bajo la [licencia MIT](LICENSE).
