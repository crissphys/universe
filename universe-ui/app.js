import {loadDrive,searchDrive,driveMeta,fileIcon} from './drive-search.js?v=20261001-drive';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const storage = {get(k,d){try{return localStorage.getItem('universe-galaxy-'+k)??d}catch{return d}},set(k,v){try{localStorage.setItem('universe-galaxy-'+k,String(v))}catch{}}};
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const prefs={motion:storage.get('motion',reduceMotion.matches?'off':'on')==='on',theme:storage.get('theme','dark'),quality:storage.get('quality','auto'),lang:storage.get('language','es')};
// An OS request pauses motion immediately; an explicit preview toggle may enable it again.
reduceMotion.addEventListener('change',event=>{if(event.matches){prefs.motion=false;renderMotion()}});
let mode='learn',cycle='pre',space=null,strands=null,lastFocus=null;
const paths={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',settings:'<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="2.5"/><circle cx="16" cy="17" r="2.5"/>','arrow-up-right':'<path d="M6 18 18 6M6 6h12v12"/>','arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',pause:'<path d="M9 5v14M15 5v14"/>',play:'<path d="m8 5 11 7-11 7z"/>',orbit:'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-35 12 12)"/><path d="M16 3.5A9 9 0 1 0 21 13"/>',book:'<path d="M12 6C8 3 4 4 3 5v14c3-1.5 6-1.5 9 1m0-14c4-3 8-2 9-1v14c-3-1.5-6-1.5-9 1V6Z"/>',layers:'<path d="m12 3 10 5-10 5L2 8Zm-10 10 10 5 10-5M2 18l10 5 10-5"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18M8 15h2M14 15h2"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',message:'<path d="M4 4h16v13H9l-5 4zM8 8h8M8 12h5"/>',cap:'<path d="m2 9 10-5 10 5-10 5zM6 12v6q6 4 12 0v-6M22 9v7"/>',calculator:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h1M15 11h1M8 15h1M15 15h1M8 19h1M15 19h1"/>',list:'<path d="M9 5h12M9 12h12M9 19h12m-18-15 1 1 2-2m-3 8 1 1 2-2m-3 8 1 1 2-2"/>',users:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 4a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>'};
function icon(name,cls=''){return `<svg aria-hidden="true" viewBox="0 0 24 24" class="${cls}">${paths[name]||paths.orbit}</svg>`}
$$('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
// Hover-only cover preview across the library (mouse only; touch users tap through to the source instead).
let coverPop;
function coverPreview(){if(coverPop)return coverPop;coverPop=document.createElement('div');coverPop.className='cover-preview';coverPop.hidden=true;coverPop.innerHTML='<img alt="">';document.body.append(coverPop);return coverPop}
function showCover(img){const rect=img.getBoundingClientRect(),pop=coverPreview(),pic=pop.querySelector('img');if(pic.src!==img.currentSrc)pic.src=img.currentSrc||img.src;pop.hidden=false;requestAnimationFrame(()=>{const pw=pop.offsetWidth||220,ph=pop.offsetHeight||300;let left=rect.right+16;if(left+pw>innerWidth-12)left=rect.left-pw-16;left=Math.max(12,Math.min(left,innerWidth-pw-12));let top=rect.top+rect.height/2-ph/2;top=Math.max(12,Math.min(top,innerHeight-ph-12));pop.style.left=left+'px';pop.style.top=top+'px'})}
function hideCover(){if(coverPop)coverPop.hidden=true}
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
 document.addEventListener('mouseover',e=>{const img=e.target.closest('.p-cover img,.mini-books img');if(img)showCover(img)});
 document.addEventListener('mouseout',e=>{const img=e.target.closest('.p-cover img,.mini-books img');if(img&&!(e.relatedTarget&&img.contains(e.relatedTarget)))hideCover()});
 addEventListener('scroll',hideCover,{passive:true,capture:true});
}
const tools=[
 {id:'syllabus',name:'Temario',en:'Syllabus',desc:'Conoce el mapa. Identifica los conceptos que necesitas dominar.',descEn:'Know the map. Identify the concepts you need to master.',url:'/temario',icon:'list',keys:'temas algebra fisica aritmetica matematica química'},
 {id:'classes',name:'Clases',en:'Classes',desc:'Dale contexto a cada idea. Aprende a tu ritmo.',descEn:'Give every idea context. Learn at your own pace.',url:'/clases',icon:'play',keys:'videos profesor explicacion entender aprender newton'},
 {id:'library',name:'Biblioteca',en:'Library',desc:'Libros, editoriales y colecciones para ampliar tu universo.',descEn:'Books, publishers and collections to expand your universe.',url:'/biblioteca',icon:'book',keys:'libro pdf lectura material algebra física química resumenes formularios academias universidades cursos'},
 {id:'mock',name:'Simulacros',en:'Mock exams',desc:'Convierte conocimiento en criterio. Practica y revisa.',descEn:'Turn knowledge into judgment. Practice and review.',url:'/simulacros',icon:'target',keys:'practicar prueba preguntas examen evaluar pc'},
 {id:'exams',name:'Exámenes de admisión UNI',en:'UNI admission exams',desc:'Rinde el examen real con su tiempo: 3 pruebas de 3 horas y calificación al terminar.',descEn:'Take the real exam on the clock: 3 tests of 3 hours, graded at the end.',url:'/examenes',icon:'layers',keys:'examen admision uni 2026-2 simulacro humanidades aptitud matematica fisica quimica soluciones clave'},
{id:'calculator',name:'Calculadora',en:'Calculator',desc:'Calcula tu puntaje CEPREUNI según tus notas y carrera.',descEn:'Calculate your CEPREUNI score and compare historical cutoffs.',url:'/calculadora',icon:'calculator',keys:'calcular puntaje operaciones numeros'},
 {id:'planner',name:'Planificador',en:'Planner',desc:'Dale un espacio a tu objetivo. Organiza tu próximo paso.',descEn:'Make room for your goal. Organize your next step.',url:'/planificador',icon:'calendar',keys:'plan organizar semana horario tiempo rutina'},
 {id:'admissions',name:'Admisión',en:'Admissions',desc:'Encuentra orientación para tu siguiente etapa.',descEn:'Find guidance for your next stage.',url:'/admision',icon:'cap',keys:'ingresar uni postular universidad requisitos'},
 {id:'cepre',name:'CEPREUNI',en:'CEPREUNI',desc:'Tu ciclo, sus recursos y las fechas que importan.',descEn:'Your cycle, its resources and the dates that matter.',url:'/cepreuni',icon:'orbit',keys:'cepre uni ciclo pre basico ien fijas'},
 {id:'talk',name:'UNITALK',en:'UNITALK',desc:'Comparte ideas. Conecta con otras mentes curiosas.',descEn:'Share ideas. Connect with other curious minds.',url:'/unitalk',icon:'message',keys:'comunidad charla amigos conversar'},
 {id:'classrooms',name:'Guía de aulas',en:'Classroom guide',desc:'Consulta la guía de docentes y aulas CEPREUNI.',descEn:'Explore the CEPREUNI teacher and classroom guide.',url:'/docentes-cepreuni',icon:'users',keys:'aulas docentes profesor'},
 {id:'ranking',name:'Ranking',en:'Ranking',desc:'Accede a la consulta de promedios.',descEn:'Access the average score ranking.',url:'/ranking',icon:'list',keys:'notas promedios resultados puntaje'},
 {id:'applicants',name:'Cantidad de postulantes',en:'Applicant counts',desc:'Consulta las elecciones registradas para 2027-1.',descEn:'Explore registered 2027-1 career choices.',url:'/cantidad-de-postulantes',icon:'users',keys:'postulantes carreras encuesta cepreuni admision 2027-1'},
 {id:'cepre-exams',name:'Exámenes CEPREUNI',en:'CEPREUNI exams',desc:'Biblioteca del ciclo preuniversitario: prácticas, parciales y finales.',descEn:'Pre-university exam library.',url:'/cepreuni/examenes',icon:'layers',keys:'1pc 2pc 1ep 3pc 4pc 2ep 5pc 6pc 7pc examen final pdf'},
 {id:'materials',name:'Materiales CEPREUNI 2027-1',en:'CEPREUNI 2027-1 materials',desc:'Recursos del ciclo preuniversitario.',descEn:'Pre-university cycle resources.',url:'/cepreuni/ciclopre20271',icon:'layers',keys:'material libro pdf primer quimica'},
 {id:'universe',name:'Editorial Universe',en:'Universe collection',desc:'Solucionarios CEPREUNI 2027-1.',descEn:'CEPREUNI 2027-1 solution books.',url:'/biblioteca/universe/',icon:'book',keys:'editorial universe solucionarios ciclesolus'},
 {id:'college',name:'Libros universitarios',en:'University books',desc:'Lecturas para ir más allá del ingreso.',descEn:'Readings to go beyond admission.',url:'/biblioteca/librosuniversitarios/',icon:'book',keys:'universitarios chang fisica calculo'},
 {id:'account',name:'Mi cuenta',en:'My account',desc:'Abre tu espacio en el sitio real.',descEn:'Open your space on the live site.',url:'/account',icon:'users',keys:'perfil iniciar sesion cuenta'}
];
// El resto de páginas del sitio, para que el buscador de la entrada llegue a todo y no solo a las herramientas.
const pages=[
 {name:'Plataforma',desc:'Un lugar para conectar lo que aprendes, lo que practicas y lo que quieres alcanzar.',url:'/explorar',keys:'explorar todas las herramientas inicio'},
 {name:'Fijas CEPREUNI',desc:'El tipo de problema asociado a cada tema del modelo histórico. Una referencia de preparación, nunca una garantía del examen.',url:'/fijas-cepreuni',keys:'cepreuni primera pc practica calificada fijas temas problemas'},
 {name:'Información CEPREUNI',desc:'Normas oficiales, estrategia de estudio y consejos prácticos en un solo lugar.',url:'/informacion-cepreuni',keys:'normas reglamento faltas asistencia pagos estudiante familia'},
 {name:'Ingresantes CEPREUNI 2026-2',desc:'Busca a una persona por su nombre o código y celebra su ingreso.',url:'/ingresantes-cepreuni',keys:'ingresantes vacantes especialidad sede codigo nombre'},
 {name:'Ingresantes UNI 2026-2',desc:'Ordinario, primeros puestos y modalidades extraordinarias. Busca por nombre o código.',url:'/ingresantes-uni-2026-2',keys:'ingresantes admision uni codigo nombre'},
 {name:'Ranking final Admisión UNI',desc:'Notas de Humanidades, Matemática, Física y Química por nombre o código.',url:'/ranking-admision',keys:'ranking admision uni notas puesto promedio'},
 {name:'Máximos y mínimos de Admisión UNI',desc:'Cómo cambian los cortes por especialidad en cada concurso.',url:'/resultados-admision',keys:'resultados cortes maximos minimos puntajes carrera especialidad'},
 {name:'Calculadora de Admisión UNI',desc:'Tu avance sobre 600, 1200 o 1800 puntos, comparado con los cortes de tu carrera.',url:'/calculadora-admision',keys:'calcular puntaje admision uni examen carrera'},
 {name:'Fijas de Admisión UNI',desc:'Cursos y temas del temario UNI separados por examen, con los temas más recurrentes.',url:'/fichas-admision',keys:'fijas admision uni temas recurrentes repaso'},
 {name:'Cómo se calcula el puntaje CEPREUNI 2026-2',desc:'Prácticas calificadas, exámenes parciales y examen final con pesos distintos.',url:'/guias/como-se-calcula-puntaje-cepreuni-2026-2',keys:'guia puntaje calcular pesos promedio'},
 {name:'Cómo interpretar el ranking CEPREUNI',desc:'Qué dice el ranking, qué no dice y cómo usarlo para estudiar mejor.',url:'/guias/como-interpretar-ranking-cepreuni',keys:'guia ranking interpretar puesto'},
 {name:'Catálogo Cuzcano',desc:'Material preuniversitario, solucionarios CEPREUNI y fascículos de Física por curso.',url:'/biblioteca/cuzcano',keys:'editorial cuzcano libros fasciculos'},
 {name:'Catálogo Amautas',desc:'Problemas de admisión UNI ordenados por temas. Encuentra tu curso y abre el libro en Google Drive.',url:'/biblioteca/amautas',keys:'editorial amautas problemas admision libros'},
 {name:'Catálogo Lumbreras',desc:'Las colecciones de Lumbreras y el libro que acompaña a tu siguiente tema.',url:'/biblioteca/lumbreras',keys:'editorial lumbreras libros'},
 {name:'Recursos de la biblioteca',desc:'Resúmenes, academias, universidades y libros, con una ruta destacada para UNI y CEPREUNI.',url:'/biblioteca/recursos',keys:'drive carpetas resumenes academias universidades'},
 {name:'Correcciones',desc:'Reporta una fórmula incorrecta, una nota mal registrada, una fuente dudosa o un error visual.',url:'/correcciones',keys:'error reporte corregir'},
 {name:'Contacto',desc:'Pide ayuda, reporta problemas técnicos o envía observaciones sobre el contenido.',url:'/contacto',keys:'ayuda soporte whatsapp'},
 {name:'Metodología editorial',desc:'Cómo Universe crea, revisa y corrige sus guías, calculadoras y recursos.',url:'/metodologia-editorial',keys:'editorial revision fuentes'},
 {name:'Criss Vásquez',desc:'Fundador y editor de Universe to Study.',url:'/autores/criss-vasquez',keys:'autor creador equipo'},
 {name:'Luhana Belén',desc:'Colaboradora editorial.',url:'/autores/luhana-belen',keys:'autora equipo'},
 {name:'Términos y condiciones',desc:'Reglas claras para usar las herramientas, materiales y espacios comunitarios de Universe to Study.',url:'/terminos',keys:'legal reglas uso'},
 {name:'Política de privacidad',desc:'Qué información utiliza Universe to Study, para qué se usa y qué controles conserva cada usuario.',url:'/privacidad',keys:'legal datos cuenta'}
];
const modes={learn:['syllabus','classes','library'],practice:['mock','exams','calculator'],plan:['planner','admissions','cepre'],connect:['talk','classrooms','ranking']};
const en=()=>prefs.lang==='en';
const title=t=>en()?t.en:t.name;
const desc=t=>en()?t.descEn:t.desc;
function externalLinks(){ $$('a[href^="https://"]').forEach(a=>{const u=new URL(a.href);if(u.origin===location.origin||['universetostudy.com','www.universetostudy.com'].includes(u.hostname))return;a.target='_blank';a.rel='noopener noreferrer'})}
function toolHTML(t){return `<a class="tool-card" href="${t.url}">${icon(t.icon)}${icon('arrow-up-right','tool-arrow')}<h3>${title(t)}</h3><p>${desc(t)}</p></a>`}
function renderTools(){ $('#workspace-content').innerHTML=modes[mode].map(id=>toolHTML(tools.find(t=>t.id===id))).join('');$('#workspace-content').setAttribute('aria-labelledby','tab-'+mode);externalLinks() }
function normalize(s){return String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()}
// Buscar "física" devolvía tres herramientas y nada más, cuando la plataforma sabe muchísimo sobre
// física: el temario de admisión, el de CEPREUNI, el de San Marcos, los libros de la biblioteca, los
// universitarios, los materiales del ciclo y los videos de clase. El índice cubre ahora todo eso, para
// que una palabra devuelva de verdad las siguientes conexiones y no solo el nombre de una pestaña.
const STOP=['quiero','para','una','uno','los','las','del','que','con','como','busco','sobre','tema','temas','mi','mis','tu','tus','de','la','el','en','un','al','lo','le','se','me','por','necesito','ver'];
const GROUPS=[['tool','Herramientas','Tools'],['page','Páginas','Pages'],['syllabus','Temario','Syllabus'],['library','Biblioteca','Library'],['material','Materiales del ciclo','Cycle materials'],['class','Clases','Classes']];
let indexRows=null,indexPromise=null;
function row(kind,label,sub,url,extra){return {kind,label,sub,url,keys:normalize([label,sub,extra].join(' '))}}
const baseRows=()=>[...tools.map(t=>row('tool',t.name,t.desc,t.url,[t.en,t.keys].join(' '))),...pages.map(p=>row('page',p.name,p.desc,p.url,p.keys))];
function buildIndex(d,videos,directory){
 const rows=baseRows();
 for(const g of directory?.groups||[])for(const item of g.items)rows.push(row('library',item.title,g.title,'/biblioteca#'+g.id,''));
 const s=d.syllabus||{};
 for(const [id,c] of Object.entries(s.temarios||{})){
  rows.push(row('syllabus',c.name,`Temario · ${(c.semanas||[]).length} semanas de admisión y ${(c.cepreSemanas||[]).length} de CEPREUNI`,'/temario',id+' '+(c.cat||'')));
  for(const m of [...(c.semanas||[]),...(c.cepreSemanas||[])])for(const t of m.topics||[])
   rows.push(row('syllabus',t.title.replace(/^\d+\.\s*/,''),`${c.name} · ${m.label}`,'/temario',(t.items||[]).join(' ').slice(0,400)));
 }
 for(const c of s.sanMarcos?.courses||[]){
  rows.push(row('syllabus',c.name,`San Marcos · ${c.topics.length} temas`,'/temario',c.group));
  for(const t of c.topics)rows.push(row('syllabus',t.split('. ')[0].slice(0,90),`San Marcos · ${c.name}`,'/temario',t));
 }
 const ROUTES={amautas:'/biblioteca/amautas',manhattan:'/biblioteca/manhattan',universe:'/biblioteca/universe',cuzcano:'/biblioteca/cuzcano',lumbreras:'/biblioteca/lumbreras',college:'/biblioteca/librosuniversitarios',materials:'/cepreuni/ciclopre20271'};
 // Cada libro lleva su portada (la misma que muestra el catálogo) y el enlace a su posición: ?libro=<índice>.
 const thumb=b=>{const id=(b.url||'').match(/\/d\/([^/?]+)|[?&]id=([^&]+)/);return (b.drivePreview||b.image==='/assets/library/editorials/cepreuni.png')&&id?`https://drive.google.com/thumbnail?id=${id[1]||id[2]}&sz=w200`:b.image||''};
 for(const [key,list] of Object.entries(d.catalogs||{}))list.forEach((b,i)=>
  rows.push({...row(key==='materials'?'material':'library',b.title,[b.series,b.author].filter(Boolean).join(' · '),key==='examenes'?'/cepreuni/examenes':ROUTES[key]?ROUTES[key]+'?libro='+i:'/biblioteca',b.catalog+' '+b.section),image:thumb(b)}));
 for(const p of d.publishers||[])rows.push(row('library',p.name,'Editorial','/biblioteca',''));
 for(const c of d.videoIndex?.courses||[])rows.push(row('class',c.title,`${c.videoCount} clases · ${c.area}`,'/clases',c.slug));
 if(videos)for(const [slug,list] of Object.entries(videos))for(const v of list)
  rows.push(row('class',v.title,[v.topicLabel,v.channel].filter(Boolean).join(' · '),'/clases',slug));
 return rows;
}
function loadIndex(){
 if(indexRows)return Promise.resolve(indexRows);
 if(!indexPromise)indexPromise=Promise.all([
  fetch('/universe-ui/data/platform.json?v=20261010-universe-economia-3ra-v1').then(r=>r.json()),
  fetch('/universe-ui/data/videos.json').then(r=>r.json()).catch(()=>null),
  fetch('/universe-ui/data/library-directory.json').then(r=>r.json()).catch(()=>null),
 ]).then(([d,v,directory])=>{indexRows=buildIndex(d,v,directory);return indexRows}).catch(()=>{indexRows=baseRows();return indexRows});
 return indexPromise;
}
// Palabras de dos letras cuentan («pc», «uni»), y cada palabra larga también se busca sin su terminación,
// para que «practicar» encuentre «práctica» y «primera» encuentre «primer».
function words(q){return normalize(q).split(/[^a-z0-9]+/).filter(w=>w.length>1&&!STOP.includes(w))}
const stem=w=>w.length>4?w.replace(/(es|s|ar|er|ir|a|o)$/,''):w;
// Frases naturales («quiero practicar para mi primera PC») no exigen todas las palabras: con tres o más,
// basta con que falte una, y si así no hay nada se relaja hasta una sola. Primero va lo que coincide con más.
function matchRows(q,rows){
 const ws=words(q).map(w=>[w,stem(w)]);
 if(!ws.length)return rows.filter(r=>r.kind==='tool');
 const scored=rows.map(r=>{let hit=0,score=0;for(const [w,s] of ws){let i=r.keys.indexOf(w),exact=i>=0;if(!exact&&s!==w)i=r.keys.indexOf(s);if(i<0)continue;hit++;score+=(i===0?3:i<40?2:1)-(exact?0:.5)}
  return hit?{r,hit,score:hit*10+score+(r.kind==='tool'?2:r.kind==='page'?1:0)}:null}).filter(Boolean);
 let need=ws.length<3?ws.length:ws.length-1,hits=[];
 while(need>0&&!(hits=scored.filter(x=>x.hit>=need)).length)need--;
 return hits.sort((a,b)=>b.score-a.score).map(x=>x.r);
}
// Mantiene la firma anterior: el resto del archivo sigue pidiendo herramientas.
function matches(q){const ws=words(q);return tools.filter(t=>!ws.length||ws.every(w=>normalize([t.name,t.en,t.keys].join(' ')).includes(w)))}
// Los grupos salen en el orden de su mejor resultado, así lo más pertinente queda arriba.
function groupHits(hits,perGroup){
 const rank=new Map(hits.map((h,i)=>[h,i]));
 return GROUPS.map(([kind,es,ens])=>({kind,name:en()?ens:es,items:hits.filter(h=>h.kind===kind),shown:hits.filter(h=>h.kind===kind).slice(0,perGroup)})).filter(g=>g.items.length).sort((a,b)=>rank.get(a.items[0])-rank.get(b.items[0]));
}
// DRIVE UNIVERSE: todo el Drive de Universe (índice local generado por scripts/index-drive.mjs).
// Cada resultado abre el archivo directamente en Google Drive.
const DRIVE_LABEL={pdf:'PDF',doc:'DOC',slides:'PPT',sheet:'XLS',image:'IMG',media:'MP4',zip:'ZIP',file:'FILE'};
function driveRow(f,cls,id){const kind=fileIcon(f.type);return `<a class="${cls} drive-row" ${id?`id="${id}" role="option"`:''} href="${esc2(f.url)}" data-live target="_blank" rel="noopener noreferrer"><span class="drive-icon" data-kind="${kind}">${f.ext&&f.ext.length<=4?esc2(f.ext.toUpperCase()):DRIVE_LABEL[kind]}</span><span>${esc2(f.title)}<small>${esc2(f.path||'Drive Universe')}</small></span>${icon('arrow-up-right')}</a>`}
let driveShown=20;
function renderDrive(q){
 const box=$('#search-drive');if(!box)return;
 if(!q.trim()){box.innerHTML='';return}
 const r=searchDrive(q),meta=driveMeta();
 if(!meta){box.innerHTML=`<div class="search-group drive-group"><h4>Drive Universe</h4><p class="entry-note">${en()?'Loading the Drive index…':'Cargando el índice del Drive…'}</p></div>`;return}
 box.innerHTML=`<div class="search-group drive-group"><h4>Drive Universe<small>${r.hits.length}${r.similar?(en()?' · similar':' · similares'):''}</small></h4>${r.hits.length?r.hits.slice(0,driveShown).map(f=>driveRow(f,'search-row')).join(''):`<p class="entry-note">${en()?'No files match.':'Ningún archivo coincide.'}</p>`}${r.hits.length>driveShown?`<button type="button" class="drive-more">${en()?'Show more results':'Ver más resultados'} (${r.hits.length-driveShown})</button>`:''}</div>`;
 box.querySelector('.drive-more')?.addEventListener('click',()=>{driveShown+=20;renderDrive(q)});
}
function renderSearch(hits){
 const box=$('#search-results');
 if(!hits.length){box.innerHTML=`<p>${en()?'No matches. Try “physics”, “books” or “planner”.':'No encontramos coincidencias. Prueba «física», «libros» o «planificador».'}</p>`;return}
 box.innerHTML=groupHits(hits,6).map(g=>`<div class="search-group"><h4>${esc2(g.name)}<small>${g.items.length}</small></h4>${g.shown.map(h=>`<a class="search-row" href="${esc2(h.url)}">${h.image?`<img class="search-thumb" src="${esc2(h.image)}" alt="" loading="lazy" width="30" height="40">`:''}<div>${esc2(h.label)}<small>${esc2(h.sub)}</small></div><span>→</span></a>`).join('')}</div>`).join('');
}
const esc2=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function search(){
 const q=$('#tool-search').value;
 driveShown=20;renderDrive(q);loadDrive().then(()=>{if($('#tool-search').value===q)renderDrive(q)}).catch(()=>{});
 renderSearch(matchRows(q,indexRows||[]));
 loadIndex().then(rows=>{if($('#tool-search').value===q)renderSearch(matchRows(q,rows))});
}
// Buscador de la entrada: combobox con resultados en vivo sobre el índice completo (herramientas, páginas,
// temario, biblioteca, materiales y clases). Flechas para moverse, Enter abre el resultado marcado.
const finder={form:$('#intent-form'),input:$('#intent'),list:$('#intent-result'),clear:$('.entry-clear'),active:-1};
const finderOptions=()=>[...finder.list.querySelectorAll('[role=option]')];
function finderActive(i){
 const opts=finderOptions();finder.active=opts.length?(i+opts.length)%opts.length:-1;
 opts.forEach((o,j)=>o.setAttribute('aria-selected',String(j===finder.active)));
 const cur=opts[finder.active];
 if(cur){finder.input.setAttribute('aria-activedescendant',cur.id);cur.scrollIntoView({block:'nearest'})}else finder.input.removeAttribute('aria-activedescendant');
}
function finderOpen(open){const was=!finder.list.hidden;finder.list.hidden=!open;finder.input.setAttribute('aria-expanded',String(open));finder.form.classList.toggle('is-open',open);if(!open){finderActive(-1);return}if(!was)finderFit()}
// En pantallas bajas sube la página lo justo para que la lista quepa bajo el campo, sin tapar la cabecera.
function finderFit(){
 let rect=finder.form.getBoundingClientRect();const want=Math.min(440,innerHeight*.56),room=innerHeight-rect.bottom-24;
 if(room<want){const lift=Math.min(want-room,rect.top-96);if(lift>0){scrollBy({top:lift,behavior:prefs.motion?'smooth':'instant'});rect={bottom:rect.bottom-lift}}}
 finder.list.style.maxHeight=Math.max(200,Math.min(want,innerHeight-rect.bottom-24))+'px';
}
function finderPaint(rows){
 const q=finder.input.value.trim();
 finder.clear.hidden=!q;
 if(!q){finderOpen(false);return}
 finder.list.replaceChildren();
 const note=text=>{const p=document.createElement('p');p.className='entry-note';p.textContent=text;finder.list.append(p)};
 if(!rows){note(en()?'Searching…':'Buscando…');finderOpen(true);return}
 const hits=matchRows(q,rows),drive=searchDrive(q);
 if(!hits.length&&!drive.hits.length&&driveMeta()){note(en()?'No matches. Try “physics”, “books” or “planner”.':'Sin coincidencias. Prueba «física», «libros» o «planificador».');finderOpen(true);return}
 let n=0;const groups=groupHits(hits,3);
 for(const g of groups){
  const group=document.createElement('div');group.className='entry-group';group.setAttribute('role','group');group.setAttribute('aria-labelledby','intent-group-'+g.kind);
  group.innerHTML=`<div class="entry-group-head" id="intent-group-${g.kind}"><span>${esc2(g.name)}</span><small>${g.items.length}</small></div>`;
  for(const h of g.shown){const a=document.createElement('a');a.className='entry-option';a.id='intent-option-'+n++;a.setAttribute('role','option');a.href=h.url;a.innerHTML=`${h.image?`<img class="entry-thumb" src="${esc2(h.image)}" alt="" loading="lazy" width="30" height="40">`:''}<span>${esc2(h.label)}<small>${esc2(h.sub)}</small></span>${icon('arrow-right')}`;group.append(a)}
  finder.list.append(group);
 }
 if(groups.reduce((t,g)=>t+g.shown.length,0)<hits.length){
 const more=document.createElement('button');more.type='button';more.className='entry-option entry-more';more.id='intent-option-'+n;more.setAttribute('role','option');
 more.innerHTML=`<span>${en()?`See all ${hits.length} results`:`Ver los ${hits.length} resultados`}</span>${icon('grid')}`;
 more.addEventListener('click',()=>{$('#tool-search').value=q;finderOpen(false);openDialog($('#search-dialog'))});
 finder.list.append(more);
 }
 const dg=document.createElement('div');dg.className='entry-group drive-group';dg.setAttribute('role','group');dg.setAttribute('aria-labelledby','intent-group-drive');
 dg.innerHTML=`<div class="entry-group-head" id="intent-group-drive"><span>Drive Universe</span><small>${driveMeta()?drive.hits.length+(drive.similar?(en()?' · similar':' · similares'):''):'…'}</small></div>`
  +(driveMeta()?drive.hits.slice(0,10).map(f=>driveRow(f,'entry-option','intent-option-'+n++)).join(''):`<p class="entry-note">${en()?'Loading the Drive index…':'Cargando el índice del Drive…'}</p>`);
 if(drive.hits.length>10){dg.insertAdjacentHTML('beforeend',`<button type="button" class="entry-option entry-more" id="intent-option-${n++}" role="option"><span>${en()?`See more Drive results (${drive.hits.length})`:`Ver más resultados del Drive (${drive.hits.length})`}</span>${icon('grid')}</button>`);
  dg.lastElementChild.addEventListener('click',()=>{$('#tool-search').value=q;finderOpen(false);openDialog($('#search-dialog'))})}
 if(driveMeta()&&!drive.hits.length)dg.insertAdjacentHTML('beforeend',`<p class="entry-note">${en()?'No files match.':'Ningún archivo coincide.'}</p>`);
 finder.list.append(dg);
 finderOpen(true);finderActive(0);
}
function finderSearch(){
 const q=finder.input.value;
 finderPaint(indexRows);
 loadDrive().then(()=>{if(finder.input.value===q&&indexRows)finderPaint(indexRows)}).catch(()=>{});
 return loadIndex().then(rows=>{if(finder.input.value===q)finderPaint(rows)});
}
// Escribir rápido no recalcula en cada tecla: espera 180 ms de pausa.
let finderTimer=0;const finderDebounced=()=>{clearTimeout(finderTimer);finderTimer=setTimeout(finderSearch,180)};
if(finder.form){
 finder.input.addEventListener('input',finderDebounced);
 finder.input.addEventListener('focus',()=>{loadIndex();loadDrive().catch(()=>{});if(finder.input.value.trim()&&finder.list.hidden)finderSearch()});
 finder.input.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(finder.list.hidden){if(finder.input.value.trim())finderSearch();return}finderActive(finder.active+(e.key==='ArrowDown'?1:-1))}
  else if(e.key==='Escape'){if(!finder.list.hidden){e.preventDefault();finderOpen(false)}else if(finder.input.value){finder.input.value='';finderSearch()}}
 });
 finder.form.addEventListener('submit',e=>{e.preventDefault();if(!finder.input.value.trim()){finder.input.focus();return}
  const pick=()=>{const opts=finderOptions();(opts[finder.active]||opts[0])?.click()};
  if(indexRows&&!finder.list.hidden)pick();else finderSearch().then(pick)});
 // Mantiene el foco en el campo al pulsar un resultado; el clic sigue navegando (también por el router).
 finder.list.addEventListener('mousedown',e=>e.preventDefault());
 finder.list.addEventListener('click',e=>{if(e.target.closest('a'))finderOpen(false)});
 finder.clear.addEventListener('click',()=>{finder.input.value='';finderSearch();finder.input.focus()});
 document.addEventListener('pointerdown',e=>{if(!finder.form.contains(e.target))finderOpen(false)});
 finder.form.addEventListener('focusout',e=>{if(!finder.form.contains(e.relatedTarget))finderOpen(false)});
 $$('[data-intent]').forEach(b=>b.addEventListener('click',()=>{finder.input.value=b.dataset.intent;finder.input.focus();finderSearch()}));
}
$$('[data-mode]').forEach(b=>{b.addEventListener('click',()=>{mode=b.dataset.mode;$$('[data-mode]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));renderTools()});b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=$$('[data-mode]');let i=tabs.indexOf(b);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[i].focus();tabs[i].click()}})});
const events=[{day:13,time:'09:00',cycle:'pre',name:'Primera práctica calificada',en:'First graded practice',date:'2026-09-13T09:00:00-05:00'},{day:27,time:'00:00',cycle:'pre',name:'Segunda práctica calificada',en:'Second graded practice',date:'2026-09-27T00:00:00-05:00'},{day:13,time:'09:00',cycle:'basic',name:'Primera evaluación calificada',en:'First graded evaluation',date:'2026-09-13T09:00:00-05:00'},{day:27,time:'00:00',cycle:'basic',name:'Segunda evaluación calificada',en:'Second graded evaluation',date:'2026-09-27T00:00:00-05:00'},{day:20,time:'09:00',cycle:'ien',name:'Examen parcial presencial',en:'In-person midterm exam',date:'2026-09-20T09:00:00-05:00'}];
function renderEvents(){$('#events').innerHTML=events.filter(e=>cycle==='all'||cycle===e.cycle).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)).map(e=>`<article class="event-row"><div class="event-date">${e.day}<small>SEP</small></div><div class="event-info"><h3>${en()?e.en:e.name}</h3><p>${en()?'Cycle':'Ciclo'} ${e.cycle==='pre'?'Pre':e.cycle==='basic'?'Básico':'IEN'} · ${en()?'Sunday':'Domingo'} · ${e.time} / Lima</p></div><div class="countdown" data-deadline="${e.date}"></div></article>`).join('');tick()}
function tick(){$$('[data-deadline]').forEach(e=>{const delta=Date.parse(e.dataset.deadline)-Date.now();if(delta<=0){e.textContent=en()?'Date reached':'Fecha alcanzada';return}const m=Math.floor(delta/60000),d=Math.floor(m/1440),h=Math.floor(m%1440/60);e.innerHTML=`${String(d).padStart(2,'0')}d : ${String(h).padStart(2,'0')}h : ${String(m%60).padStart(2,'0')}m<small>${en()?'UNTIL YOUR NEXT STEP':'PARA TU SIGUIENTE PASO'}</small>`})}
$$('[data-cycle]').forEach(b=>b.addEventListener('click',()=>{cycle=b.dataset.cycle;$$('[data-cycle]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderEvents()}));setInterval(tick,30000);
function openDialog(d){lastFocus=document.activeElement;d.showModal();document.body.classList.add('modal-open');if(d.id==='search-dialog'){$('#tool-search').focus();search()}}
$$('.search-trigger').forEach(b=>b.addEventListener('click',()=>openDialog($('#search-dialog'))));$$('.settings-trigger').forEach(b=>b.addEventListener('click',()=>openDialog($('#preferences'))));$$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));$$('dialog').forEach(d=>{d.addEventListener('close',()=>{document.body.classList.remove('modal-open');lastFocus?.focus()});d.addEventListener('click',e=>{if(e.target===d){const rect=d.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)d.close()}})});{let t=0;$('#tool-search').addEventListener('input',()=>{clearTimeout(t);t=setTimeout(search,180)})}
$$('[data-en]').forEach(e=>e.dataset.es=e.innerHTML);
function translate(){document.documentElement.lang=prefs.lang;$$('[data-en]').forEach(e=>e.innerHTML=en()?e.dataset.en:e.dataset.es);$('#intent').placeholder=en()?'Search topics, books, classes…':'Busca temas, libros, clases…';if(!finder.list.hidden)finderPaint(indexRows);$('#tool-search').placeholder=en()?'Books, classes, calculator…':'Busca libros, clases, calculadora…';renderTools();renderEvents();search();renderMotion();externalLinks()}
function renderMotion(){const enabled=prefs.motion;document.documentElement.classList.toggle('motion-off',!enabled);$$('.motion-trigger').forEach(b=>{b.setAttribute('aria-pressed',String(!enabled));b.querySelector('[data-icon]').innerHTML=icon(enabled?'pause':'play');b.querySelector('[data-motion-label]').textContent=en()?(enabled?'Pause motion':'Motion paused'):(enabled?'Pausar movimiento':'Activar movimiento')});$('#motion').checked=prefs.motion;space?.configure({...prefs,motion:enabled});strands?.setMotion(enabled&&!immersive);if(!enabled)$$('.pending').forEach(e=>e.classList.remove('pending'))}
$('#theme').value=prefs.theme;$('#language').value=prefs.lang;$('#quality').value=prefs.quality;document.documentElement.dataset.theme=prefs.theme;
$('#theme').addEventListener('change',e=>{prefs.theme=e.target.value;storage.set('theme',prefs.theme);document.documentElement.dataset.theme=prefs.theme});$('#language').addEventListener('change',e=>{prefs.lang=e.target.value;storage.set('language',prefs.lang);translate()});$('#quality').addEventListener('change',e=>{prefs.quality=e.target.value;storage.set('quality',prefs.quality);renderMotion()});$('#motion').addEventListener('change',e=>{prefs.motion=e.target.checked;storage.set('motion',prefs.motion?'on':'off');renderMotion()});$$('.motion-trigger').forEach(b=>b.addEventListener('click',()=>{prefs.motion=!prefs.motion;storage.set('motion',prefs.motion?'on':'off');renderMotion()}));reduceMotion.addEventListener('change',renderMotion);
let immersive=false;
function immersion(on){immersive=on;document.body.classList.toggle('immersive',on);$('.immersion-controls').hidden=!on;$$('main,.header,.footer,.support,.chapter-nav').forEach(el=>el.inert=on);$('#space').setAttribute('aria-hidden',String(!on));space?.setImmersive(on);strands?.setMotion(prefs.motion&&!on);if(on)$('#exit-space').focus();else $('#space-mode').focus()}
$('#space-mode').addEventListener('click',()=>immersion(true));$('#exit-space').addEventListener('click',()=>immersion(false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&immersive)immersion(false);if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!$$('dialog').some(d=>d.open)&&!immersive)openDialog($('#search-dialog'))}});
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pending');observer.unobserve(e.target)}})},{threshold:.07});
if(prefs.motion&&!reduceMotion.matches){document.documentElement.classList.add('motion-ready');$$('.reveal').forEach(e=>{if(e.getBoundingClientRect().top>innerHeight)e.classList.add('pending');observer.observe(e)})}
const chapters=$$('.chapter');let scrollScheduled=false;
function scrollState(){const active=chapters.reduce((best,s)=>s.getBoundingClientRect().top<innerHeight*.55?s:best,chapters[0]);$$('.chapter-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active.id));space?.setScroll(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight));scrollScheduled=false}
addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(scrollState)}},{passive:true});
// Strands (React Bits) en la entrada. Se crea la primera vez que la portada es visible, así las páginas
// internas (que comparten este HTML con la portada oculta) no abren un contexto WebGL que no usan.
// Fuera de la portada se espera al router: antes de que oculte la portada, esta se ve un instante.
const strandsHost=$('.entry-strands .strands-container'),startsHome=['/','/index.html'].includes(location.pathname);
function wakeStrands(){if(!strandsHost)return;const wake=new IntersectionObserver(async entries=>{if(!entries.some(e=>e.isIntersecting))return;wake.disconnect();const stage=strandsHost.parentElement;
 try{const {createStrands}=await import('./strands.js?v=20261001-strands');
  strands=createStrands(strandsHost,{colors:['#492f1c','#7d60af','#06B6D4'],count:4,speed:.2,amplitude:1.1,waviness:2.6,thickness:.7,glow:2.85,taper:5.3,spread:.3,intensity:.7,saturation:1.5,opacity:1,scale:2.3,glass:false,refraction:1,dispersion:1,glassSize:1,motion:prefs.motion&&!immersive});
  stage.classList.add('is-live')}catch(error){stage.classList.add('is-static');console.warn('Strands fallback:',error.message)}});wake.observe(strandsHost)}
if(startsHome)wakeStrands();
translate();
const {startPlatform}=await import('./platform.js?v=20261010-universe-economia-3ra-v1');
if(!document.body.dataset.native) startPlatform({icon,tools,events,openPreferences:()=>openDialog($('#preferences'))});
if(!startsHome)wakeStrands();
const visual=$('.command-visual');if(visual){const {orbitHTML,mountOrbits}=await import('./orbit.js');visual.innerHTML=orbitHTML();mountOrbits()}
const {syncProfileBadge}=await import('./profile.js');syncProfileBadge();
try{const {createGalaxy}=await import('./galaxy.js');space=await createGalaxy($('#galaxy'),prefs);space.setImmersive(immersive);scrollState()}catch(error){document.body.dataset.space='fallback';$('#scene-status').textContent='FONDO LIGERO';console.warn('Galaxy fallback:',error.message)}
