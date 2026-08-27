# Catálogo Lumbreras

El catálogo se genera desde `catalog.json`. Para añadir una colección, curso o libro:

1. Copiar las portadas a `assets/library/lumbreras/<coleccion-o-curso>/`.
2. Añadir la colección, el curso o los libros en `catalog.json`.
3. Ejecutar `tools/update-lumbreras-catalog.ps1` desde la raíz del proyecto.

El generador admite colecciones agrupadas por cursos y colecciones planas. Valida portadas, enlaces duplicados y rutas de Drive; luego actualiza las secciones, el número de colecciones y cursos, el total de libros y la descripción de la página.
