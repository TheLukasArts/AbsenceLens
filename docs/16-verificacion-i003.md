# Verificación del incremento I-003

## Estado

La implementación y la verificación automatizada iniciales de `I-003` quedaron completadas el 15/08/2026. La revisión manual posterior detectó que el detalle operativo y la hoja `Registros` incluían vacaciones de los empleados candidatos.

R1 y R2 ya excluyen correctamente esas filas de sus cálculos y candidaturas, pero `I-003` permanece pendiente de corrección porque las vacaciones tampoco deben aparecer en la revisión ni en las exportaciones habituales. El rediseño se define en `docs/17-correccion-redisenio-revision-exportacion.md`.

## Comprobaciones realizadas

- Suite completa: 11 archivos y 34 pruebas superadas.
- Compilación de producción completada sin errores ni avisos de presupuesto.
- Auditoría de dependencias de producción sin vulnerabilidades conocidas.
- Revisión estática sin referencias a peticiones HTTP, almacenamiento persistente ni escritura de datos en consola.
- Solo se utilizaron estructuras y fixtures completamente sintéticos.

## Cobertura funcional automatizada

- La revisión muestra únicamente los registros asociados a los empleados de la vista activa R1 o R2.
- Los filtros de texto y categorías se combinan con el rango inclusivo de fecha de inicio.
- La ordenación es estable para textos, fechas y valores calculados.
- Un empleado permanece visible si al menos uno de sus registros asociados coincide con los filtros.
- Los filtros de revisión no recalculan las candidaturas ni las explicaciones R1/R2.
- La vista principal conserva una fila por empleado y el detalle una fila por registro.
- El informe se genera solo tras una acción explícita y contiene `Resumen`, `Candidatos` y `Registros`.
- La prueba del adaptador genera el libro en memoria, lo relee y confirma sus tres hojas.
- Las nóminas se conservan como texto, la duración errónea de origen se excluye y los valores interpretables como fórmulas se neutralizan.
- La prueba de interfaz confirma que el informe contiene únicamente la regla activa y los registros filtrados.
- El borrado de sesión elimina también filas de revisión, filtros y errores de exportación.

## Revisión manual pendiente

La validación final en navegador debe comprobar:

1. que la relación entre listado por empleado y detalle por registro se entiende sin explicación previa;
2. que añadir, retirar y limpiar filtros es cómodo con teclado;
3. que el rango de fechas y la ordenación comunican claramente su efecto;
4. que la tabla ancha sigue siendo utilizable mediante desplazamiento horizontal;
5. que los recuentos de empleados y registros son legibles en escritorio y pantalla estrecha;
6. que el estado de preparación y los errores de exportación no dependen únicamente del color;
7. que el archivo descargado se abre correctamente en Excel y conserva las nóminas con ceros a la izquierda;
8. que la paleta y la jerarquía visual son coherentes con las pantallas anteriores.

## Observación de dependencias

`write-excel-file` 4.1.1 se incorpora como dependencia de producción según ADR-0002. La comprobación de pares informa de un desacuerdo previo y transitivo entre herramientas de desarrollo de Angular (`listr2` 10.2.2 frente a 10.2.1); no pertenece al árbol de producción del escritor, no afecta a las pruebas ni a la compilación y no se fuerza una resolución manual.
