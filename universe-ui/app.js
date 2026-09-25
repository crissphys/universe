const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const storage = {get(k,d){try{return localStorage.getItem('universe-galaxy-'+k)??d}catch{return d}},set(k,v){try{localStorage.setItem('universe-galaxy-'+k,String(v))}catch{}}};
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const prefs={motion:storage.get('motion',reduceMotion.matches?'off':'on')==='on',theme:storage.get('theme','dark'),quality:storage.get('quality','auto'),lang:storage.get('language','es')};
// An OS request pauses motion immediately; an explicit preview toggle may enable it again.
reduceMotion.addEventListener('change',event=>{if(event.matches){prefs.motion=false;renderMotion()}});
let mode='learn',cycle='pre',space=null,lastFocus=null;
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
const STOP=['quiero','para','una','uno','los','las','del','que','con','como','busco','sobre','tema','temas'];
const GROUPS=[['tool','Herramientas','Tools'],['syllabus','Temario','Syllabus'],['library','Biblioteca','Library'],['material','Materiales del ciclo','Cycle materials'],['class','Clases','Classes']];
let indexRows=null,indexPromise=null;
function row(kind,label,sub,url,extra){return {kind,label,sub,url,keys:normalize([label,sub,extra].join(' '))}}
function buildIndex(d,videos,directory){
 const rows=tools.map(t=>row('tool',t.name,t.desc,t.url,[t.en,t.keys].join(' ')));
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
 const ROUTES={universe:'/biblioteca/universe',cuzcano:'/biblioteca/cuzcano',lumbreras:'/biblioteca/lumbreras',college:'/biblioteca/librosuniversitarios',materials:'/cepreuni/ciclopre20271'};
 for(const [key,list] of Object.entries(d.catalogs||{}))for(const b of list)
  rows.push(row(key==='materials'?'material':'library',b.title,[b.series,b.author].filter(Boolean).join(' · '),ROUTES[key]||'/biblioteca',b.catalog+' '+b.section));
 for(const p of d.publishers||[])rows.push(row('library',p.name,'Editorial','/biblioteca',''));
 for(const c of d.videoIndex?.courses||[])rows.push(row('class',c.title,`${c.videoCount} clases · ${c.area}`,'/clases',c.slug));
 if(videos)for(const [slug,list] of Object.entries(videos))for(const v of list)
  rows.push(row('class',v.title,[v.topicLabel,v.channel].filter(Boolean).join(' · '),'/clases',slug));
 return rows;
}
function loadIndex(){
 if(indexRows)return Promise.resolve(indexRows);
 if(!indexPromise)indexPromise=Promise.all([
  fetch('/universe-ui/data/platform.json?v=20260925-lumbreras-organizacion').then(r=>r.json()),
  fetch('/universe-ui/data/videos.json').then(r=>r.json()).catch(()=>null),
  fetch('/universe-ui/data/library-directory.json').then(r=>r.json()).catch(()=>null),
 ]).then(([d,v,directory])=>{indexRows=buildIndex(d,v,directory);return indexRows}).catch(()=>{indexRows=tools.map(t=>row('tool',t.name,t.desc,t.url,[t.en,t.keys].join(' ')));return indexRows});
 return indexPromise;
}
function words(q){return normalize(q).split(/\s+/).filter(w=>w.length>2&&!STOP.includes(w))}
function matchRows(q,rows){
 const ws=words(q);
 if(!ws.length)return rows.filter(r=>r.kind==='tool');
 return rows.map(r=>{let score=0;for(const w of ws){const i=r.keys.indexOf(w);if(i<0)return null;score+=i===0?3:i<40?2:1}
  return {r,score:score+(r.kind==='tool'?2:0)}}).filter(Boolean).sort((a,b)=>b.score-a.score).map(x=>x.r);
}
// Mantiene la firma anterior: el resto del archivo sigue pidiendo herramientas.
function matches(q){const ws=words(q);return tools.filter(t=>!ws.length||ws.every(w=>normalize([t.name,t.en,t.keys].join(' ')).includes(w)))}
function groupHits(hits,perGroup){
 return GROUPS.map(([kind,es,ens])=>({kind,name:en()?ens:es,items:hits.filter(h=>h.kind===kind),shown:hits.filter(h=>h.kind===kind).slice(0,perGroup)})).filter(g=>g.items.length);
}
function renderSearch(hits){
 const box=$('#search-results');
 if(!hits.length){box.innerHTML=`<p>${en()?'No matches. Try “physics”, “books” or “planner”.':'No encontramos coincidencias. Prueba «física», «libros» o «planificador».'}</p>`;return}
 box.innerHTML=groupHits(hits,6).map(g=>`<div class="search-group"><h4>${esc2(g.name)}<small>${g.items.length}</small></h4>${g.shown.map(h=>`<a class="search-row" href="${esc2(h.url)}"><div>${esc2(h.label)}<small>${esc2(h.sub)}</small></div><span>→</span></a>`).join('')}</div>`).join('');
}
const esc2=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function search(){
 const q=$('#tool-search').value;
 renderSearch(matchRows(q,indexRows||[]));
 loadIndex().then(rows=>{if($('#tool-search').value===q)renderSearch(matchRows(q,rows))});
}
function intent(){
 const q=$('#intent').value,result=$('#intent-result');
 result.hidden=false;
 const paint=rows=>{
  const hits=matchRows(q,rows);
  result.replaceChildren();
  const heading=document.createElement('strong');
  heading.textContent=en()?'Your next connections':'Tus siguientes conexiones';
  result.append(heading);
  if(!hits.length){const p=document.createElement('p');p.textContent=en()?'Try a topic or a tool: physics, books, weekly plan.':'Prueba con un tema o una herramienta: física, libros, plan semanal.';result.append(p);return}
  for(const g of groupHits(hits,3)){
   const label=document.createElement('span');label.className='intent-group';label.textContent=`${g.name} · ${g.items.length}`;result.append(label);
   for(const h of g.shown){const a=document.createElement('a');a.href=h.url;a.textContent=h.label;a.title=h.sub;result.append(a)}
  }
 };
 paint(indexRows||[]);
 loadIndex().then(rows=>{if($('#intent').value===q)paint(rows)});
}
$('#intent-form').addEventListener('submit',e=>{e.preventDefault();intent()});$$('[data-intent]').forEach(b=>b.addEventListener('click',()=>{$('#intent').value=b.dataset.intent;intent()}));
$$('[data-mode]').forEach(b=>{b.addEventListener('click',()=>{mode=b.dataset.mode;$$('[data-mode]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));renderTools()});b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=$$('[data-mode]');let i=tabs.indexOf(b);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[i].focus();tabs[i].click()}})});
const events=[{day:13,time:'09:00',cycle:'pre',name:'Primera práctica calificada',en:'First graded practice',date:'2026-09-13T09:00:00-05:00'},{day:27,time:'00:00',cycle:'pre',name:'Segunda práctica calificada',en:'Second graded practice',date:'2026-09-27T00:00:00-05:00'},{day:13,time:'09:00',cycle:'basic',name:'Primera evaluación calificada',en:'First graded evaluation',date:'2026-09-13T09:00:00-05:00'},{day:27,time:'00:00',cycle:'basic',name:'Segunda evaluación calificada',en:'Second graded evaluation',date:'2026-09-27T00:00:00-05:00'},{day:20,time:'09:00',cycle:'ien',name:'Examen parcial presencial',en:'In-person midterm exam',date:'2026-09-20T09:00:00-05:00'}];
function renderEvents(){$('#events').innerHTML=events.filter(e=>cycle==='all'||cycle===e.cycle).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)).map(e=>`<article class="event-row"><div class="event-date">${e.day}<small>SEP</small></div><div class="event-info"><h3>${en()?e.en:e.name}</h3><p>${en()?'Cycle':'Ciclo'} ${e.cycle==='pre'?'Pre':e.cycle==='basic'?'Básico':'IEN'} · ${en()?'Sunday':'Domingo'} · ${e.time} / Lima</p></div><div class="countdown" data-deadline="${e.date}"></div></article>`).join('');tick()}
function tick(){$$('[data-deadline]').forEach(e=>{const delta=Date.parse(e.dataset.deadline)-Date.now();if(delta<=0){e.textContent=en()?'Date reached':'Fecha alcanzada';return}const m=Math.floor(delta/60000),d=Math.floor(m/1440),h=Math.floor(m%1440/60);e.innerHTML=`${String(d).padStart(2,'0')}d : ${String(h).padStart(2,'0')}h : ${String(m%60).padStart(2,'0')}m<small>${en()?'UNTIL YOUR NEXT STEP':'PARA TU SIGUIENTE PASO'}</small>`})}
$$('[data-cycle]').forEach(b=>b.addEventListener('click',()=>{cycle=b.dataset.cycle;$$('[data-cycle]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderEvents()}));setInterval(tick,30000);
function openDialog(d){lastFocus=document.activeElement;d.showModal();document.body.classList.add('modal-open');if(d.id==='search-dialog'){$('#tool-search').focus();search()}}
$$('.search-trigger').forEach(b=>b.addEventListener('click',()=>openDialog($('#search-dialog'))));$$('.settings-trigger').forEach(b=>b.addEventListener('click',()=>openDialog($('#preferences'))));$$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));$$('dialog').forEach(d=>{d.addEventListener('close',()=>{document.body.classList.remove('modal-open');lastFocus?.focus()});d.addEventListener('click',e=>{if(e.target===d){const rect=d.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)d.close()}})});$('#tool-search').addEventListener('input',search);
$$('[data-en]').forEach(e=>e.dataset.es=e.innerHTML);
function translate(){document.documentElement.lang=prefs.lang;$$('[data-en]').forEach(e=>e.innerHTML=en()?e.dataset.en:e.dataset.es);$('#intent').placeholder=en()?'Understand physics, organize my week, find a book…':'Quiero entender física, organizarme, encontrar un libro…';$('#tool-search').placeholder=en()?'Books, classes, calculator…':'Busca libros, clases, calculadora…';renderTools();renderEvents();search();renderMotion();externalLinks()}
function renderMotion(){const enabled=prefs.motion;document.documentElement.classList.toggle('motion-off',!enabled);$$('.motion-trigger').forEach(b=>{b.setAttribute('aria-pressed',String(!enabled));b.querySelector('[data-icon]').innerHTML=icon(enabled?'pause':'play');b.querySelector('[data-motion-label]').textContent=en()?(enabled?'Pause motion':'Motion paused'):(enabled?'Pausar movimiento':'Activar movimiento')});$('#motion').checked=prefs.motion;space?.configure({...prefs,motion:enabled});if(!enabled)$$('.pending').forEach(e=>e.classList.remove('pending'))}
$('#theme').value=prefs.theme;$('#language').value=prefs.lang;$('#quality').value=prefs.quality;document.documentElement.dataset.theme=prefs.theme;
$('#theme').addEventListener('change',e=>{prefs.theme=e.target.value;storage.set('theme',prefs.theme);document.documentElement.dataset.theme=prefs.theme});$('#language').addEventListener('change',e=>{prefs.lang=e.target.value;storage.set('language',prefs.lang);translate()});$('#quality').addEventListener('change',e=>{prefs.quality=e.target.value;storage.set('quality',prefs.quality);renderMotion()});$('#motion').addEventListener('change',e=>{prefs.motion=e.target.checked;storage.set('motion',prefs.motion?'on':'off');renderMotion()});$$('.motion-trigger').forEach(b=>b.addEventListener('click',()=>{prefs.motion=!prefs.motion;storage.set('motion',prefs.motion?'on':'off');renderMotion()}));reduceMotion.addEventListener('change',renderMotion);
let immersive=false;
function immersion(on){immersive=on;document.body.classList.toggle('immersive',on);$('.immersion-controls').hidden=!on;$$('main,.header,.footer,.support,.chapter-nav').forEach(el=>el.inert=on);$('#space').setAttribute('aria-hidden',String(!on));space?.setImmersive(on);if(on)$('#exit-space').focus();else $('#space-mode').focus()}
$('#space-mode').addEventListener('click',()=>immersion(true));$('#exit-space').addEventListener('click',()=>immersion(false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&immersive)immersion(false);if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!$$('dialog').some(d=>d.open)&&!immersive)openDialog($('#search-dialog'))}});
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pending');observer.unobserve(e.target)}})},{threshold:.07});
if(prefs.motion&&!reduceMotion.matches){document.documentElement.classList.add('motion-ready');$$('.reveal').forEach(e=>{if(e.getBoundingClientRect().top>innerHeight)e.classList.add('pending');observer.observe(e)})}
const chapters=$$('.chapter');let scrollScheduled=false;
function scrollState(){const active=chapters.reduce((best,s)=>s.getBoundingClientRect().top<innerHeight*.55?s:best,chapters[0]);$$('.chapter-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active.id));space?.setScroll(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight));scrollScheduled=false}
addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(scrollState)}},{passive:true});
translate();
const {startPlatform}=await import('./platform.js?v=20260925-lumbreras-organizacion');
if(!document.body.dataset.native) startPlatform({icon,tools,events,openPreferences:()=>openDialog($('#preferences'))});
const {orbitHTML,mountOrbits}=await import('./orbit.js');
$('.command-visual').innerHTML=orbitHTML();mountOrbits();
const {syncProfileBadge}=await import('./profile.js');syncProfileBadge();
try{const {createGalaxy}=await import('./galaxy.js');space=await createGalaxy($('#galaxy'),prefs);space.setImmersive(immersive);scrollState()}catch(error){document.body.dataset.space='fallback';$('#scene-status').textContent='FONDO LIGERO';console.warn('Galaxy fallback:',error.message)}
