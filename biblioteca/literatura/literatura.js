const DATA_URL="/biblioteca/literatura/books.json?v=20261012-literatura-cepreuni-v3";
const results=document.querySelector("#book-results");
const search=document.querySelector("#literature-search");
const count=document.querySelector("#literature-result-count");
const total=document.querySelector("#literature-total");
const sort=document.querySelector("#literature-sort");
const reset=document.querySelector("#literature-reset");
const modeButtons=[...document.querySelectorAll("[data-group-mode]")];
const layoutButtons=[...document.querySelectorAll(".catalog-layout [data-layout]")];
const EPOCH_ORDER=["Antigüedad clásica","Edad Media","Renacimiento","Literatura colonial peruana","Siglo de Oro y Barroco","Clasicismo y Romanticismo","Realismo y Naturalismo","Pensamiento social del siglo XIX","Literatura peruana del siglo XIX","Modernismo hispanoamericano","Generación del 98","Generación del 27","Literatura moderna del siglo XX","Vanguardias","Ensayo peruano del siglo XX"];
const epochOrder=new Map(EPOCH_ORDER.map((label,index)=>[label,index]));
const collator=new Intl.Collator("es",{numeric:true,sensitivity:"base"});
const normalize=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es").trim();
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
let books=[];
let mode="theme";

function groupKey(book){
  if(mode==="theme")return String(book.theme);
  if(mode==="author")return book.author||"Autor no indicado";
  return book.epoch||"Época no indicada";
}
function groupLabel(key){return mode==="theme"?`Tema ${key}`:key}
function modeLabel(){return mode==="theme"?"TEMA CEPREUNI":mode==="author"?"AUTOR":"ÉPOCA"}
function compareGroups(a,b){
  if(mode==="theme")return Number(a.key)-Number(b.key);
  if(mode==="author")return collator.compare(a.key,b.key);
  return (epochOrder.get(a.key)??999)-(epochOrder.get(b.key)??999)||collator.compare(a.key,b.key);
}
function matchesSearch(book,query){
  if(!query)return true;
  return normalize([book.title,book.author,book.theme,`tema ${book.theme}`,book.epoch,book.year].join(" ")).includes(query);
}
function bookMarkup(book){
  const id=encodeURIComponent(book.driveId);
  const preview=`https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  const href=`https://drive.google.com/file/d/${id}/view`;
  const label=mode==="theme"?book.epoch:`Tema ${book.theme} · ${book.epoch}`;
  return `<a class="p-book" href="${href}" data-live target="_blank" rel="noopener noreferrer" aria-label="Abrir vista previa de ${escapeHtml(book.title)} en Google Drive"><div class="p-cover"><img src="${preview}" data-fallback="/assets/home-access/cepreuni.png" data-fallback-alt="Portada CEPREUNI de respaldo" alt="Vista previa de ${escapeHtml(book.title)}" loading="lazy" width="180" height="240"></div><span class="p-label">${escapeHtml(label||`Tema ${book.theme}`)}</span><h4>${escapeHtml(book.title)}</h4><p>${escapeHtml(book.author||"Autor no indicado")}</p><span class="book-action">Vista previa en Drive ↗</span></a>`;
}
function render(){
  const query=normalize(search.value);
  const visible=books.filter(book=>matchesSearch(book,query));
  count.textContent=`${visible.length} recursos · ${visible.length} visibles`;
  if(!visible.length){results.innerHTML='<p class="p-empty">No encontramos libros con esa búsqueda. Prueba con otro título, autor, tema o época.</p>';return}
  const groups=new Map();
  for(const book of visible){const key=groupKey(book);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(book)}
  const sortMode=sort.value;
  const sections=[...groups.entries()].map(([key,items])=>{
    if(sortMode!=="original")items.sort((a,b)=>collator.compare(a.title,b.title)*(sortMode==="za"?-1:1));
    return {key,label:groupLabel(key),items};
  }).sort(compareGroups);
  results.innerHTML=sections.map((section,index)=>`<section class="catalog-volume"><header class="catalog-divider"><span>${String(index+1).padStart(2,"0")} / ${modeLabel()}</span><h2>${escapeHtml(section.label)}</h2><small>${section.items.length} ${section.items.length===1?"libro":"libros"}</small></header><section class="catalog-section" aria-label="${escapeHtml(section.label)}"><div class="p-books">${section.items.map(bookMarkup).join("")}</div></section></section>`).join("");
}

modeButtons.forEach(button=>button.addEventListener("click",()=>{
  mode=button.dataset.groupMode;
  modeButtons.forEach(item=>item.setAttribute("aria-pressed",String(item===button)));
  render();
}));
layoutButtons.forEach(button=>button.addEventListener("click",()=>{
  results.dataset.layout=button.dataset.layout;
  layoutButtons.forEach(item=>item.setAttribute("aria-pressed",String(item===button)));
}));
search.addEventListener("input",render);
sort.addEventListener("change",render);
reset.addEventListener("click",()=>{
  search.value="";
  sort.value="original";
  mode="theme";
  results.dataset.layout="grid";
  modeButtons.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.groupMode==="theme")));
  layoutButtons.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.layout==="grid")));
  render();
});
results.addEventListener("error",event=>{
  const image=event.target;
  if(image.tagName!=="IMG"||image.dataset.retried||!image.dataset.fallback||image.dataset.fallback===image.getAttribute("src"))return;
  image.dataset.retried="1";
  if(image.dataset.fallbackAlt)image.alt=image.dataset.fallbackAlt;
  image.src=image.dataset.fallback;
},true);

fetch(DATA_URL).then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json()}).then(data=>{
  if(!Array.isArray(data)||!data.length)throw new Error("Catálogo vacío");
  books=data;
  total.textContent=String(books.length);
  render();
}).catch(error=>{
  console.error("No se pudo cargar el catálogo de literatura",error);
  total.textContent="—";
  count.textContent="No se pudo cargar el catálogo";
  results.innerHTML='<p class="p-empty">No se pudieron cargar los libros. Actualiza la página para intentarlo de nuevo.</p>';
});
