const DATA_URL="/biblioteca/literatura/books.json?v=20261012-literatura-cepreuni-v1";
const list=document.querySelector("#literature-groups");
const search=document.querySelector("#literature-search");
const count=document.querySelector("#literature-result-count");
const modeButtons=[...document.querySelectorAll("[data-group-mode]")];
const dialog=document.querySelector("#literature-preview");
const frame=document.querySelector("#literature-frame");
const dialogTitle=document.querySelector("#literature-preview-title");
const dialogMeta=document.querySelector("#literature-preview-meta");
const openDrive=document.querySelector("#literature-open-drive");
const closePreview=document.querySelector("#literature-close-preview");
const EPOCH_ORDER=["Antigüedad clásica","Edad Media","Renacimiento","Literatura colonial peruana","Siglo de Oro y Barroco","Clasicismo y Romanticismo","Realismo y Naturalismo","Pensamiento social del siglo XIX","Literatura peruana del siglo XIX","Modernismo hispanoamericano","Generación del 98","Generación del 27","Literatura moderna del siglo XX","Vanguardias","Ensayo peruano del siglo XX"];
const epochOrder=new Map(EPOCH_ORDER.map((label,index)=>[label,index]));
const collator=new Intl.Collator("es",{numeric:true,sensitivity:"base"});
let books=[];
let mode="theme";
const normalize=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es").trim();
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
function groupKey(book){if(mode==="theme")return String(book.theme);if(mode==="author")return book.author;return book.epoch}
function groupLabel(key){if(mode==="theme")return `Tema ${key}`;return key}
function compareGroups(a,b){if(mode==="theme")return Number(a.key)-Number(b.key);if(mode==="author")return collator.compare(a.key,b.key);return (epochOrder.get(a.key)??999)-(epochOrder.get(b.key)??999)||collator.compare(a.key,b.key)}
function compareBooks(a,b){if(mode==="author")return Number(a.theme)-Number(b.theme)||collator.compare(a.title,b.title);if(mode==="epoch")return Number(a.theme)-Number(b.theme)||collator.compare(a.author,b.author)||collator.compare(a.title,b.title);return collator.compare(a.author,b.author)||collator.compare(a.title,b.title)}
function matchesSearch(book,query){if(!query)return true;return normalize([book.title,book.author,book.theme,`tema ${book.theme}`,book.epoch,book.year].join(" ")).includes(query)}
function bookMarkup(book){const meta=[book.author,book.credit,`Tema ${book.theme}`].filter(Boolean).map(escapeHtml);return `<article class="literature-book"><div class="literature-book-copy"><h3>${escapeHtml(book.title)}</h3><p>${meta.map(value=>`<span>${value}</span>`).join("")}</p></div><button class="literature-preview-button" type="button" data-preview-id="${escapeHtml(book.driveId)}" aria-label="Abrir vista previa de ${escapeHtml(book.title)}"><span aria-hidden="true">▧</span>Vista previa</button></article>`}
function render(){const query=normalize(search.value);const visible=books.filter(book=>matchesSearch(book,query));count.textContent=`Mostrando ${visible.length} de ${books.length} libros`;if(!visible.length){list.innerHTML='<div class="literature-empty">No encontramos libros con esa búsqueda. Prueba con otro título, autor, tema o época.</div>';return}const groups=new Map();for(const book of visible){const key=groupKey(book);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(book)}const sections=[...groups.entries()].map(([key,items])=>({key,label:groupLabel(key),items:items.sort(compareBooks)})).sort(compareGroups);list.innerHTML=sections.map(section=>`<details class="literature-group" open><summary><span class="literature-group-title"><strong>${escapeHtml(section.label)}</strong><span>${section.items.length} ${section.items.length===1?"libro":"libros"}</span></span></summary><div class="literature-group-list">${section.items.map(bookMarkup).join("")}</div></details>`).join("")}
modeButtons.forEach(button=>button.addEventListener("click",()=>{mode=button.dataset.groupMode;modeButtons.forEach(item=>item.setAttribute("aria-pressed",String(item===button)));render()}));
search.addEventListener("input",render);
list.addEventListener("click",event=>{const button=event.target.closest("[data-preview-id]");if(!button)return;const book=books.find(item=>item.driveId===button.dataset.previewId);if(!book)return;const url=`https://drive.google.com/file/d/${encodeURIComponent(book.driveId)}/preview`;dialogTitle.textContent=book.title;dialogMeta.textContent=[book.author,book.credit,`Tema ${book.theme}`,book.epoch].filter(Boolean).join(" · ");openDrive.href=`https://drive.google.com/file/d/${encodeURIComponent(book.driveId)}/view`;frame.title=`Vista previa: ${book.title}`;frame.src=url;dialog.showModal();closePreview.focus()});
closePreview.addEventListener("click",()=>dialog.close());
dialog.addEventListener("close",()=>frame.removeAttribute("src"));
dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
fetch(DATA_URL).then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json()}).then(data=>{if(!Array.isArray(data)||!data.length)throw new Error("Catálogo vacío");books=data;render()}).catch(error=>{console.error("No se pudo cargar el catálogo de literatura",error);count.textContent="No se pudo cargar el catálogo";list.innerHTML='<div class="literature-error">No se pudieron cargar los libros. Actualiza la página para intentarlo de nuevo.</div>'});
