# Verificación del incremento I-001

Fecha de referencia: 14/08/2026.

## Estado

La implementación funcional de `I-001` está completa en el repositorio local WSL. La aceptación se mantiene abierta hasta realizar una revisión visual manual en navegador.

## Evidencia automatizada

- `pnpm test --watch=false`: 18 pruebas superadas en 7 archivos.
- `pnpm build`: compilación de producción correcta.
- `pnpm audit --prod`: ninguna vulnerabilidad conocida en dependencias de producción.
- Comprobación estática sin referencias en `src` a solicitudes HTTP, `localStorage`, `sessionStorage`, `IndexedDB` o logs de consola.
- Prueba del fixture `samples/absence-lens-aceptacion-v1.xlsx`:
  - una hoja;
  - 73 filas válidas;
  - nóminas conservadas como texto;
  - exactamente siete candidatos R1;
  - orden y cantidades iguales a `docs/11-primer-incremento-vertical.md`.
- Prueba de interfaz:
  - importación y validación;
  - fecha de corte;
  - ejecución R1;
  - apertura de explicación;
  - cierre con `Escape`;
  - eliminación de la sesión.

## Resultado R1 verificado

| Posición | Nº Nómina | Episodios |
| -------: | --------- | --------: |
|        1 | `910001`  |         6 |
|        2 | `910008`  |         5 |
|        3 | `910010`  |         5 |
|        4 | `910011`  |         5 |
|        5 | `910004`  |         5 |
|        6 | `910006`  |         5 |
|        7 | `910002`  |         5 |

## Revisión manual pendiente

Ejecutar `pnpm start` desde WSL y comprobar en navegador:

1. composición y legibilidad en portátil;
2. correspondencia visual de la paleta de marca;
3. foco visible y recorrido completo con teclado;
4. selector de archivo nativo;
5. tabla horizontal en anchuras reducidas;
6. foco inicial y restaurado del diálogo;
7. ausencia de solicitudes en la pestaña Network durante importación y análisis.

La automatización del navegador integrado no pudo iniciarse por un fallo de su proceso aislado en Windows. Esto no afectó al servidor Angular, las pruebas ni la compilación.
