# AbsenceLens

Repositorio de trabajo para el TFM del Máster de Desarrollo con IA de BIG School.

AbsenceLens es una aplicación web local-first que importa un único archivo Excel con el histórico de ausencias, aplica reglas temporales deterministas y genera listados de empleados candidatos para revisión humana. No determina si una ausencia está justificada, no asigna puntuaciones de riesgo y no recomienda actuaciones laborales.

## Estado

Requisitos del primer incremento cerrados e implementación de `I-001` iniciada. El entorno de desarrollo canónico es WSL 2 y el procesamiento continúa siendo íntegramente local.

## Documentación de referencia

- [Contexto y visión](docs/01-contexto-y-vision.md)
- [Requisitos y alcance del MVP](docs/02-requisitos-mvp.md)
- [Reglas de negocio](docs/03-reglas-negocio.md)
- [Datos e importación](docs/04-datos-importacion.md)
- [Privacidad, ética y seguridad](docs/05-privacidad-etica-seguridad.md)
- [Decisiones, pendientes y roadmap](docs/06-decisiones-pendientes-roadmap.md)
- [Arquitectura, pruebas y demostración](docs/07-arquitectura-pruebas-demo.md)
- [Investigación y referencias](docs/08-investigacion-referencias.md)
- [Cobertura funcional de los dashboards](docs/09-cobertura-dashboards.md)
- [Casos de aceptación sintéticos](docs/10-casos-aceptacion.md)
- [Primer incremento vertical](docs/11-primer-incremento-vertical.md)
- [Verificación del incremento I-001](docs/12-verificacion-i001.md)
- [ADR-0001: lector XLSX en navegador](docs/adr/0001-lector-xlsx.md)

## Desarrollo local

El proyecto se desarrolla dentro del sistema de archivos de WSL, no desde `/mnt/c`. Versiones iniciales:

- Node.js 24 administrado mediante NVM.
- pnpm 11.19 administrado mediante Corepack.
- Angular 22 con CLI local al proyecto.

Comprobaciones habituales:

```bash
pnpm install
pnpm start
pnpm test --watch=false
pnpm build
```

No utilizar instalaciones de Node, Angular o `node_modules` procedentes de Windows para este repositorio.

## Restricción esencial

El repositorio público, las conversaciones con asistentes de IA, las pruebas y la demostración utilizarán exclusivamente datos sintéticos. No se incorporarán archivos empresariales ni datos reales de empleados.
