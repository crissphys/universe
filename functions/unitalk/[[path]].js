export async function onRequest(context) {
  var url = new URL(context.request.url);
  url.pathname = '/unitalk';
  url.search = '';
  return context.env.ASSETS.fetch(new Request(url.toString(), context.request));
}
