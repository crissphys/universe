/* /experimentos/tablaperiodica/elemento/<nombre> sirve la ficha; sin nombre vuelve a la tabla */
export async function onRequest(context) {
  var url = new URL(context.request.url);
  var slug = context.params.slug;
  if (!slug || (Array.isArray(slug) && !slug.filter(Boolean).length)) {
    return Response.redirect(url.origin + '/experimentos/tablaperiodica', 302);
  }
  url.pathname = '/experimentos/tablaperiodica/ficha/';
  url.search = '';
  return context.env.ASSETS.fetch(new Request(url.toString(), context.request));
}
