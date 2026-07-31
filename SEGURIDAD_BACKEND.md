# Backend privado de Universe to Study

Para que la seguridad funcione de verdad, la web debe servirse con Cloudflare Pages Functions o con un Worker que enrute `/api/*` a `functions/api/[[path]].js`.

Variables privadas que debes configurar en Cloudflare, nunca en archivos públicos:

- `GOOGLE_CLIENT_ID`: ID OAuth web de Google.
- `SESSION_SECRET`: texto largo aleatorio para firmar sesiones.
- `ADMIN_EMAILS`: correos administradores separados por coma, o mejor:
- `ADMIN_EMAIL_SHA256`: hash SHA-256 del correo admin en minúsculas. Esta opción evita guardar el correo como texto visible incluso en variables.
- `ADMIN_EMAIL_SHA256_EXTRA`: hash adicional para autorizar otra cuenta sin sustituir el administrador principal.
- `RESEND_API_KEY`: clave privada del proveedor de correo para las notificaciones del Simulacro Final.
- `SIMULACRO_EMAIL_FROM`: remitente de un dominio verificado, por ejemplo `UNIverse to Study <resultados@universetostudy.com>`.
- `PUBLIC_SITE_URL`: URL pública usada en los botones de los correos, normalmente `https://universetostudy.com`.

Para archivos de UNITalk, configura un bucket R2 como binding privado con el nombre
`UNITALK_MEDIA`. Los archivos se cargan por partes y las publicaciones solo guardan
la referencia del objeto; el contenido binario no se almacena en Firebase ni en el
JavaScript público.

Los correos del Simulacro Final se envían únicamente al publicar un examen ya
finalizado. El backend registra cada envío por participante para evitar duplicados.
La clave de Resend nunca debe guardarse en GitHub.
- `FIREBASE_DATABASE_URL`: URL de Realtime Database.
- `FIREBASE_DATABASE_SECRET`: secreto/token privado para REST de Firebase.
- `OPENAI_API_KEY`: solo si luego se habilita el endpoint del modelo.

Cambios aplicados:

- El cliente ya no consulta ni modifica Firebase directamente para perfiles, soporte o datos del sitio.
- El panel administrador ya no se activa por correo/hashes/IP dentro de JavaScript público.
- El inicio con Google se valida en `/api/auth/google` antes de entregar un token local firmado.
- Soporte y perfil usan `Authorization: Bearer <token>` y el backend decide permisos.
- El backend incluye límite básico de abuso por IP para login y endpoints de IA.

Preguntas privadas de Clases:

- Las preguntas exactas no deben guardarse en HTML ni JavaScript público.
- Extrae a JSON privado con `tools/extract-class-questions.py`.
- Importa solo con cuenta administradora usando `tools/import-class-questions.js`.
- El cliente lee preguntas por `GET /api/classes/questions?course=<curso>&topic=<tema>`.
- El backend exige sesión Google y nunca devuelve claves, respuestas correctas ni solucionarios.
