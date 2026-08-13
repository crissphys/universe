# Memoria de datos CEPREUNI

Esta carpeta conserva las publicaciones oficiales que alimentan el ranking y la calculadora.

- `manifest.json`: catálogo, huella digital y fecha del último cambio de cada fuente.
- `current/`: última copia válida de cada publicación.
- `history/`: instantáneas inmutables creadas únicamente cuando cambia una fuente.

La sincronización se ejecuta cada seis horas mediante GitHub Actions. El receptor no usa inteligencia artificial: descubre archivos publicados por la UNI, valida JSON, códigos, duplicados y rangos de notas, calcula las estadísticas y genera `cepre-2026-2-official.js`. Si la fuente devuelve HTML, un archivo vacío o datos inválidos, la ejecución falla y la web conserva la última versión válida.
