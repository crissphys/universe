import {orbitHTML,mountOrbits} from './orbit.js';
import {renderProfile,syncProfileBadge} from './profile.js';
import {renderBranchedMenu} from './branched-menu.js?v=20261114-calcpre';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const store={get(k,d){try{return JSON.parse(localStorage.getItem('universe-preview-'+k))??d}catch{return d}},set(k,v){try{localStorage.setItem('universe-preview-'+k,JSON.stringify(v));return true}catch{return false}}};
const safe=s=>{try{const u=new URL(s,'https://universetostudy.com');return u.protocol==='https:'?esc(u.href):'#'}catch{return '#'}};
const routes={
 '/explorar':['Herramientas para ingresar a la UNI','PLATAFORMA / 01','Un lugar para conectar lo que aprendes, lo que practicas y lo que quieres alcanzar.','Herramientas gratis para ingresar a la UNI | UNIverse','Temario, planificador, fijas, exámenes de admisión, biblioteca y ranking CEPREUNI: las herramientas gratuitas de UNIverse para ingresar a la UNI.'],
};
let data,ui,view,home,routeVersion=0,toastTimer;
const link=(url,label,cls='button',live=false)=>`<a class="${cls}" href="${safe(url)}" ${live||!url.startsWith('/')?'data-live target="_blank" rel="noopener noreferrer"':''}>${esc(label)} ${ui.icon('arrow-up-right')}</a>`;
const internal=(url,label,cls='button')=>`<a class="${cls}" href="${esc(url)}">${esc(label)} ${ui.icon('arrow-right')}</a>`;
const note=(text)=>`<div class="p-notice">${text}</div>`;
const sub=(title,right='')=>`<div class="p-subhead"><h2>${title}</h2><span>${right}</span></div>`;
const tile=(url,title,text,icon='orbit',foot='Explorar',live=false)=>`<a class="p-panel p-tile" href="${esc(url)}" ${live?'data-live target="_blank" rel="noopener noreferrer"':''}>${ui.icon(icon)}<h3>${esc(title)}</h3><p>${esc(text)}</p><span class="tile-foot">${esc(foot)}${ui.icon(live?'arrow-up-right':'arrow-right')}</span></a>`;
const logoTile=(url,title,text,logoId,foot='Explorar')=>`<a class="p-panel p-tile logo-tile" href="${esc(url)}"><span class="tile-logo"><img src="${esc(data.logos[logoId])}" alt="Logo de ${esc(title)}" loading="lazy"></span><h3>${esc(title)}</h3><p>${esc(text)}</p><span class="tile-foot">${esc(foot)}${ui.icon('arrow-right')}</span></a>`;
const stats=rows=>`<div class="p-statbar">${rows.map(([a,b])=>`<div><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</div>`;
const orbit=orbitHTML;
const miniBooks=()=>'<div class="mini-books" aria-hidden="true"><img src="/universe-ui/assets/quimica.webp" alt=""><img src="/universe-ui/assets/algebra.webp" alt=""><img src="/universe-ui/assets/geometria.webp" alt=""></div>';
const empty=text=>`<div class="p-empty">${esc(text)}</div>`;
function toast(text){let el=$('.local-toast');if(!el){el=document.createElement('div');el.className='local-toast';el.setAttribute('role','status');document.body.append(el)}el.textContent=text;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3500)}
function pathName(){const path=decodeURI(location.pathname).replace(/\/$/,'').replace(/\.html$/,'')||'/';return path==='/index'?'/':path}
function setRouteSeo(title,description,canonical){document.title=title;let meta=$('meta[name="description"]');if(!meta){meta=document.createElement('meta');meta.name='description';document.head.append(meta)}meta.content=description;let link=$('link[rel="canonical"]');if(!link){link=document.createElement('link');link.rel='canonical';document.head.append(link)}link.href=new URL(canonical,location.origin).href}
function head(path){const r=routes[path]||['Aún no estamos aquí.','UNIVERSE / 404','No encontramos esta página. Puedes volver a la plataforma.'];return `<div class="page-topline"><span><a href="/">Universe</a> / <a href="/explorar">Plataforma</a> / ${esc(r[0].replace(/\.$/,''))}</span></div><div class="page-head"><span class="eyebrow">${r[1]}</span><h1 id="page-title" tabindex="-1">${r[0]}</h1><p>${r[2]}</p></div>`}
async function route(focus=false){const token=++routeVersion,p=pathName();if(p==='/'){location.reload();return}const isHome=false;home.hidden=!isHome;$('#platform').hidden=isHome;document.body.classList.toggle('in-platform',!isHome);$('.brand').href='/';$('.footer-brand').href='/';$$('.header .nav a').forEach(a=>a.setAttribute('aria-current',a.getAttribute('href')===p?'page':'false'));if(isHome){setRouteSeo('Universe — El origen de tu siguiente idea','Universe to Study. Una nueva experiencia para aprender, practicar y avanzar.','/');return}const meta=routes[p],title=meta?.[0]||'Página no encontrada';setRouteSeo(meta?.[3]||`${title} — Universe`,meta?.[4]||meta?.[2]||'No encontramos esta página. Puedes volver a la plataforma.',p);renderBranchedMenu($('.side-rail'),{activePath:p,renderIcon:name=>ui.icon(name)});view.innerHTML=head(p)+'<div class="page-view" id="page-view"></div>';const out=$('#page-view');if(!data){out.innerHTML=empty('Conectando tus recursos…');try{data=await fetch('/universe-ui/data/platform.json?v=20261114-calcpre').then(r=>{if(!r.ok)throw Error('Datos no disponibles');return r.json()});hydrateHumanities(data)}catch{out.innerHTML=note('No se pudieron cargar los recursos. Recarga esta página.');return}}if(token!==routeVersion)return;
 if(p==='/explorar')overview(out);
 
 else if(p==='/account')account(out);
 else out.innerHTML=internal('/explorar','Volver a la plataforma');
 mountOrbits();syncProfileBadge();
 if(focus)$('#page-title')?.focus({preventScroll:true});
}
function overview(out){out.innerHTML=`<section class="p-panel p-feature"><div><span class="p-label">UNA RUTA PARA CADA OBJETIVO</span><h2>Tu siguiente idea<br>ya tiene un lugar.</h2><p>No necesitas tener todo resuelto. Empieza por un concepto, una lectura o una pregunta.</p><div class="page-actions">${internal('/temariouni','Explorar mi temario','button primary')}${internal('/planificador','Crear mi ruta','text-button')}</div></div>${orbit()}</section>${sub('Elige tu próxima conexión','Herramientas de Universe')}<div class="p-grid">${ui.tools.map(t=>tile(t.url,t.name,t.desc,t.icon)).join('')}${tile('/cepreuni/fijas','Fijas CEPREUNI','Los temas que más probablemente vienen en el 2.º parcial, curso por curso.','target')}</div>`}
// El programa CEPREUNI de humanidades sí existe, pero guardado aparte (syllabus.humanities: una lista
// de 21 semanas por curso) y con otro nombre que el del temario de admisión — "Historia" frente a
// "Historia del Perú y del Mundo". El render solo leía cepreSemanas, así que esos cursos aparecían
// vacíos en CEPREUNI. Se normalizan una vez, de modo que también entren en la vista por evaluación.
const HUMANITIES_PROGRAM={razonamientoverbal:'Razonamiento Verbal',lenguaje:'Lenguaje',literatura:'Literatura',historia:'Historia',geografia:'Geografía',economia:'Economía',filosofia:'Filosofía',psicologia:'Psicología',ingles:'Inglés'};
function hydrateHumanities(d){const src=d?.syllabus?.humanities;if(!src)return;
 for(const [id,key] of Object.entries(HUMANITIES_PROGRAM)){const c=d.syllabus.temarios[id];const weeks=src[key];
  if(!c||!weeks||(c.cepreSemanas||[]).length)continue;
  c.cepreSemanas=weeks.map((title,i)=>({label:`Semana ${i+1}`,topics:[{title,items:[title]}]}));}}
// Small arithmetic parser. No eval, Function constructor, or remote requests.
export function calculate(input){const text=input.replace(/\s+/g,'').replace(/×/g,'*').replace(/÷/g,'/').replace(/,/g,'.');if(!text||text.length>160||/[^0-9.+\-*/()%]/.test(text))throw Error('Expresión no válida');const tokens=text.match(/(?:\d+(?:\.\d*)?|\.\d+)|[+\-*/()%]/g)||[];if(tokens.join('')!==text)throw Error('Número no válido');let at=0,depth=0;function value(){if(++depth>40)throw Error('Expresión demasiado larga');let n;if(tokens[at]==='+'||tokens[at]==='-'){const sign=tokens[at++];n=(sign==='-'?-1:1)*value()}else if(tokens[at]==='('){at++;n=add();if(tokens[at++]!==')')throw Error('Falta cerrar paréntesis')}else{const t=tokens[at++];if(!t||!/^\d|^\./.test(t))throw Error('Falta un número');n=Number(t)}while(tokens[at]==='%'){at++;n/=100}depth--;return n}function mul(){let n=value();while(['*','/'].includes(tokens[at])){const op=tokens[at++],v=value();if(op==='/'&&v===0)throw Error('No se puede dividir entre cero');n=op==='*'?n*v:n/v}return n}function add(){let n=mul();while(['+','-'].includes(tokens[at])){const op=tokens[at++],v=mul();n=op==='+'?n+v:n-v}return n}const result=add();if(at!==tokens.length||!Number.isFinite(result))throw Error('Revisa la expresión');return Number(result.toPrecision(12))}
function account(out){renderProfile(out,data,ui.openPreferences)}
export function startPlatform(api){ui=api;home=$('main');const shell=document.createElement('main');shell.id='platform';shell.className='platform';shell.hidden=true;shell.innerHTML='<aside class="side-rail"></aside><div class="platform-body"></div>';home.after(shell);view=$('.platform-body');const phone=document.createElement('a');phone.className='phone-nav';phone.href='/explorar';phone.textContent='Explorar toda la plataforma →';$('.hero-copy')?.append(phone);$('#search-dialog .dialog-foot').removeAttribute('data-en');$('#search-dialog .dialog-foot').textContent='Busca herramientas, materiales y recursos de estudio.';
 // Real local URLs also make Ctrl-click, copying links and opening new tabs work.
 const localize=()=>{$$('a[href]').forEach(a=>{if(a.hasAttribute('data-live'))return;let u;try{u=new URL(a.getAttribute('href'),location.origin)}catch{return}const p=u.pathname.replace(/\/$/,'').replace(/\.html$/,'')||'/';if(['universetostudy.com','www.universetostudy.com'].includes(u.hostname)&&routes[p]){a.setAttribute('href',p+u.search+u.hash);a.removeAttribute('target')}})};
 localize();new MutationObserver(localize).observe(document.body,{childList:true,subtree:true});
 $('.skip-link').addEventListener('click',e=>{e.preventDefault();const target=home.hidden?$('#page-title'):home;target?.scrollIntoView({behavior:'instant'});target?.focus({preventScroll:true})});
 const go=async(url)=>{$$('dialog[open]').forEach(d=>d.close());const u=new URL(url,location.origin);history.pushState({},'',u.pathname+u.search+u.hash);await route(true);scrollTo({top:0,behavior:'instant'});if(u.hash)setTimeout(()=>{try{$(u.hash)?.scrollIntoView({behavior:'instant'})}catch{}},60)};
 document.addEventListener('click',e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest('a');if(!a||a.hasAttribute('data-live')||a.hasAttribute('download'))return;const href=a.getAttribute('href');if(!href||href==='data:,')return;let u;try{u=new URL(href,location.href)}catch{return}if(u.origin!==location.origin&&!['universetostudy.com','www.universetostudy.com'].includes(u.hostname))return;const p=u.pathname.replace(/\/$/,'').replace(/\.html$/,'')||'/';if(p==='/'||!routes[p])return;e.preventDefault();go(p+u.search+u.hash)});
 addEventListener('popstate',()=>route());route();return{navigate:go};
}

export function startNativeNavigation(renderIcon,{home=false}={}){
 const header=$('.header');
 if(!header)return;
 if(home)$('.platform .side-rail')?.remove();
 let rail=home?null:$('.native-platform .side-rail');
 if(!rail&&!home)rail=document.querySelector('.side-rail');
 if(!rail){
  rail=document.createElement('aside');
  rail.className='side-rail';
  rail.setAttribute('aria-label','Navegación de Universe');
  header.after(rail);
 }
 if(home)document.body.classList.add('home-with-rail');
 renderBranchedMenu(rail,{activePath:home?'/explorar':pathName(),renderIcon});
}
