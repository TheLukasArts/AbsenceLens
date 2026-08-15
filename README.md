# AbsenceLens

Repositorio de trabajo para el TFM del Máster de Desarrollo con IA de BIG School.

AbsenceLens es una aplicación web local-first que importa un único archivo Excel con el histórico de ausencias, aplica reglas temporales deterministas y genera listados de empleados candidatos para revisión humana. No determina si una ausencia está justificada, no asigna puntuaciones de riesgo y no recomienda actuaciones laborales.

## Estado

`I-001`, `I-002` e `I-003` están implementados. La corrección de revisión y exportación también está implementada y cubierta por pruebas automatizadas; queda pendiente la validación visual del usuario en navegador. Vacaciones se conserva solo como contexto futuro y no aparece en R1, R2, Revisión ni sus exportaciones. R1 y R2 ofrecen top 10 y conjunto completo, Revisión combina una fila por empleado y la ficha explicable se abre en un diálogo reusable. El entorno canónico continúa siendo WSL 2 y todo el procesamiento permanece local.

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
- [Propuesta del segundo incremento vertical](docs/13-segundo-incremento-vertical.md)
- [Verificación del incremento I-002](docs/14-verificacion-i002.md)
- [Tercer incremento vertical](docs/15-tercer-incremento-vertical.md)
- [Verificación del incremento I-003](docs/16-verificacion-i003.md)
- [Corrección y rediseño de revisión y exportación](docs/17-correccion-redisenio-revision-exportacion.md)
- [ADR-0001: lector XLSX en navegador](docs/adr/0001-lector-xlsx.md)
- [ADR-0002: escritor XLSX en navegador](docs/adr/0002-escritor-xlsx.md)
- [ADR-0003: adopción selectiva de Angular Material](docs/adr/0003-angular-material.md)

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
