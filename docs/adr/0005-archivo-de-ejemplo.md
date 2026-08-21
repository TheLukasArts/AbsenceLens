# ADR-0005: archivo de ejemplo servido como recurso descargable

- Estado: aceptado
- Fecha: 2026-08-21

## Contexto

Quien abre la aplicación por primera vez no tiene un archivo compatible a mano. Sin él no puede probar nada: la pantalla de importación queda vacía y no hay forma de ver qué hace el producto. Esto afecta especialmente a la evaluación del trabajo, donde el objetivo es que cualquiera pueda comprobar el resultado en dos minutos.

El proyecto ya publica libros sintéticos en el repositorio, pero descargarlos desde GitHub exige salir de la aplicación, localizar la carpeta correcta y entender cuál de los tres conviene.

La restricción relevante es ADR-0001, que fija que el libro se lee **únicamente desde un `File` elegido por la persona usuaria y nunca desde una URL**. A ello se suma el compromiso de que importar y analizar no generen ninguna petición de red relacionada con los datos, algo que se demuestra abriendo la pestaña de red del navegador.

## Decisión

Publicar el libro de demostración de 15.000 filas como recurso estático de la aplicación y ofrecerlo mediante un **enlace de descarga** en el panel de importación.

- El archivo vive en `public/samples/` y se despliega junto a la aplicación.
- El enlace es un `<a download>` a un recurso del propio origen. El navegador descarga el archivo; después la persona lo selecciona con el selector de siempre.
- La aplicación sigue recibiendo un `File` elegido explícitamente. **No lee el libro desde una URL**, de modo que ADR-0001 se mantiene intacto.

## Alternativa descartada

Un botón de «cargar ejemplo» que obtuviera el archivo con `fetch` y lo inyectara directamente en el flujo de importación.

Se descarta por dos motivos:

1. **Contradice ADR-0001.** El libro entraría en el sistema desde una URL y no desde un archivo elegido por la persona, que es justamente el límite que ese ADR establece.
2. **Rompe una garantía demostrable.** El argumento de privacidad del producto no es solo que no haya backend, sino que puede comprobarse en directo: se abre la pestaña de red, se importa y se analiza, y no aparece una sola petición. Una carga automática introduciría una petición durante la importación y obligaría a matizar esa demostración.

La comodidad que aportaba no compensa debilitar el argumento central del proyecto.

## Consecuencias

- El artefacto de despliegue crece unos 750 kB. Es asumible y no afecta al paquete de la aplicación, porque se sirve como recurso estático independiente.
- El libro grande de 150.000 filas **no** se publica: permanece solo en el repositorio, para no cargar el despliegue con varios megabytes que la mayoría de visitantes no va a usar.
- El archivo se regenera con `pnpm sample:small`. Al ser determinista, su contenido no depende de cuándo se ejecute el comando.
- Una prueba automatizada comprueba que el libro publicado produce candidatos de ambas reglas. Un ejemplo sin resultados no cumpliría su función.
