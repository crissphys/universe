# Catálogo Lumbreras

El catálogo se genera desde `catalog.json`. Para añadir un curso o libro:

1. Copiar las portadas a `assets/library/lumbreras/<curso>/`.
2. Añadir el curso o los libros en `catalog.json`.
3. Ejecutar `tools/update-lumbreras-catalog.ps1` desde la raíz del proyecto.

El generador valida portadas, enlaces duplicados y rutas de Drive; luego actualiza las tarjetas, el número de cursos, el total de libros y la descripción de la página.
