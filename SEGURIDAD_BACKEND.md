# Backend privado de Universe to Study

Para que la seguridad funcione de verdad, la web debe servirse con Cloudflare Pages Functions o con un Worker que enrute `/api/*` a `functions/api/[[path]].js`.

Variables privadas que debes configurar en Cloudflare, nunca en archivos públicos:

- `GOOGLE_CLIENT_ID`: ID OAuth web de Google.
- `SESSION_SECRET`: texto largo aleatorio para firmar sesiones.
- `ADMIN_EMAILS`: correos administradores separados por coma, o mejor:
- `ADMIN_EMAIL_SHA256`: hash SHA-256 del correo admin en minúsculas. Esta opción evita guardar el correo como texto visible incluso en variables.
- `FIREBASE_DATABASE_URL`: URL de Realtime Database.
- `FIREBASE_DATABASE_SECRET`: secreto/token privado para REST de Firebase.
- `OPENAI_API_KEY`: solo si luego se habilita el endpoint del modelo.

Cambios aplicados:

- El cliente ya no consulta ni modifica Firebase directamente para perfiles, soporte o datos del sitio.
- El panel administrador ya no se activa por correo/hashes/IP dentro de JavaScript público.
- El inicio con Google se valida en `/api/auth/google` antes de entregar un token local firmado.
- Soporte y perfil usan `Authorization: Bearer <token>` y el backend decide permisos.
- El backend incluye límite básico de abuso por IP para login y endpoints de IA.
