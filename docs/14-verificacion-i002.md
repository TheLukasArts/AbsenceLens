# Verificación del incremento I-002

## Estado

La implementación funcional y la verificación automatizada de `I-002` quedaron completadas el 15/08/2026. La revisión visual manual en navegador permanece pendiente porque el navegador integrado no pudo iniciarse por un error del entorno aislado de Windows, ajeno a la aplicación.

## Comprobaciones realizadas

- Suite completa: 8 archivos y 26 pruebas superadas.
- Compilación de producción completada sin errores ni avisos de presupuesto.
- Auditoría de dependencias de producción sin vulnerabilidades conocidas.
- Revisión estática sin referencias a peticiones HTTP, almacenamiento persistente ni escritura de datos de empleados en consola.
- Solo se utilizó el fixture sintético `absence-lens-aceptacion-v1.xlsx`.

## Cobertura funcional automatizada

- R2 aplica el umbral inclusivo de 180 días y excluye vacaciones y episodios posteriores al corte.
- Los episodios abiertos y los que terminan después del corte se recortan de forma determinista.
- Se construye una única candidatura global por empleado.
- El episodio representativo es el de mayor duración, con desempate por inicio más reciente.
- El filtro se aplica al centro del episodio representativo sin releer el Excel.
- El fixture produce exactamente los nueve candidatos globales y los subconjuntos de `BCN`, `MAD`, `AGP` y `BCN + MAD` documentados.
- R1 conserva exactamente sus siete candidatos esperados.
- La interfaz permite analizar una sola vez, alternar R1/R2, filtrar centros, limpiar el filtro y abrir o cerrar la explicación R2.
- La prueba de interfaz confirma una única lectura del libro durante el análisis combinado.

## Revisión visual manual pendiente

Arrancar la aplicación con `pnpm start` y comprobar:

1. que la alternancia entre recurrencia corta y larga duración es clara;
2. que los filtros de centro son comprensibles y utilizables con teclado;
3. que la tabla R2 mantiene una lectura correcta en escritorio y pantalla estrecha;
4. que el detalle recibe el foco, se cierra con `Escape` y devuelve el foco al control que lo abrió;
5. que las advertencias y estados se entienden sin depender únicamente del color;
6. que eliminar la sesión restablece resultados, filtros y explicación.

Esta revisión puede generar ajustes de presentación, pero no bloquea la corrección automatizada de la regla R2.
