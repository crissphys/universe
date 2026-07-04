# Migración de UNIVERSE: de Blogger a GitHub Pages

Este paquete contiene tu sitio ya convertido de la plantilla de Blogger a archivos HTML estáticos normales, listos para GitHub Pages.

## Qué se hizo

- Se extrajo el CSS de tu plantilla (`<b:skin>`) a un archivo `style.css` independiente.
- Se armó `index.html` con el contenido de tu página de inicio (que estaba incrustado en el XML del tema).
- Se convirtieron tus 8 "páginas físicas" en archivos HTML normales:
  - `ranking.html` (Ranking de Promedios)
  - `calculadora.html` (Calculadora UNI/CEPREUNI)
  - `temario.html` (Temario UNI y CEPREUNI)
  - `biblioteca.html` (Biblioteca UNIVERSE)
  - `simulacros.html` (Simulacros tipo UNI)
  - `examenes.html` (Exámenes CEPREUNI)
  - `terminos.html` (Términos y Condiciones)
  - `privacidad.html` (Política de Privacidad)
- Se reescribieron **todos** los enlaces internos que apuntaban a `universecriss.blogspot.com/p/...` para que ahora apunten a estos nuevos archivos (por ejemplo `/ranking.html`).
- Se dejaron intactos: tu Google Analytics (mismo ID, funciona en cualquier dominio), el chat de soporte (Firebase), y el login con Google.

## Paso 1 — Sube esto a GitHub (sin necesidad de línea de comandos)

1. Entra a [github.com](https://github.com) e inicia sesión (o crea una cuenta gratis).
2. Clic en **New repository**. Nómbralo, por ejemplo, `universe-site`. Márcalo como **Public**. No agregues README ni .gitignore.
3. Dentro del repo vacío, clic en **uploading an existing file**.
4. Arrastra **todos** los archivos de esta carpeta (los `.html`, `style.css` y `CNAME`) y confirma el commit.

## Paso 2 — Activa GitHub Pages

1. En el repo, ve a **Settings → Pages**.
2. En "Build and deployment", elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`. Guarda.
3. Espera 1-2 minutos; GitHub te dará una URL tipo `https://tuusuario.github.io/universe-site/`. Ábrela y prueba que todo se vea bien antes de seguir.

## Paso 3 — Conecta tu dominio propio

1. Sigue en **Settings → Pages**, en el campo **Custom domain** escribe `www.universetostudy.com` y guarda (esto confirma el archivo CNAME que ya incluí).
2. Ve al panel de DNS de donde compraste `universetostudy.com` (Namecheap, GoDaddy, Cloudflare, etc. — el nombre exacto de la sección suele ser "DNS" o "Administrar DNS").
3. **Elimina** cualquier registro viejo que apunte a Blogger (normalmente un CNAME de `www` hacia `ghs.google.com`, o registros A hacia IPs de Google/Blogger).
4. **Agrega** estos registros (los oficiales de GitHub Pages, verifica que sigan vigentes en la [documentación de GitHub](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)):

   | Tipo  | Host/Nombre | Valor                     |
   |-------|-------------|----------------------------|
   | A     | @           | 185.199.108.153            |
   | A     | @           | 185.199.109.153            |
   | A     | @           | 185.199.110.153            |
   | A     | @           | 185.199.111.153             |
   | CNAME | www         | tuusuario.github.io        |

5. Espera la propagación (minutos a 24-48h). Cuando GitHub detecte el dominio correctamente, activa **Enforce HTTPS** en Settings → Pages.

## Paso 4 — Muy importante: actualiza el login de Google

Tu botón de "Iniciar sesión con Google" usa un Client ID (`410302293146-...apps.googleusercontent.com`) configurado en Google Cloud Console. Ese login **dejará de funcionar** en el dominio nuevo si no agregas el dominio autorizado:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → el proyecto donde creaste ese Client ID.
2. Ábrelo y en **Authorized JavaScript origins** agrega:
   - `https://www.universetostudy.com`
   - `https://universetostudy.com`
3. Guarda. Puede tardar unos minutos en propagarse.

## Paso 5 — Revisa el chat de soporte (Firebase)

El chat usa una base de datos en `universe-82fc3-default-rtdb.firebaseio.com`. Si en las reglas de seguridad de esa base de datos restringiste el acceso por dominio (poco común, pero revisa en Firebase Console → Realtime Database → Rules), agrega el nuevo dominio ahí también. Si las reglas no verifican el origen (lo más probable), no necesitas tocar nada.

## Paso 6 — Desconecta Blogger

Cuando confirmes que `www.universetostudy.com` carga bien desde GitHub Pages:

1. En Blogger → **Configuración → Dominio personalizado**, quita `www.universetostudy.com` de ahí (para que Blogger deje de esperar tráfico de ese dominio).
2. Tu blog seguirá existiendo en `universecriss.blogspot.com` si quieres conservarlo, pero tu dominio ya no dependerá de Blogger.

## Notas

- `index.html` se reconstruyó automáticamente a partir del tema XML de Blogger — revísalo bien en la URL de prueba de GitHub Pages antes de mover el DNS.
- Todos los enlaces de navegación y pie de página ya apuntan a los nuevos archivos, no a Blogger.
