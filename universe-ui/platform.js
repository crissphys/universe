import {renderScore,renderCatalog,renderFijas,cepreEmblem} from './upgrades.js';
import {orbitHTML,mountOrbits} from './orbit.js';
import {renderProfile,syncProfileBadge} from './profile.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const store={get(k,d){try{return JSON.parse(localStorage.getItem('universe-preview-'+k))??d}catch{return d}},set(k,v){try{localStorage.setItem('universe-preview-'+k,JSON.stringify(v));return true}catch{return false}}};
const safe=s=>{try{const u=new URL(s,'https://universetostudy.com');return u.protocol==='https:'?esc(u.href):'#'}catch{return '#'}};
function openVideoPreview(id,title,channel){const dialog=$('#video-preview');if(!dialog)return;
 $('#video-frame').innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&amp;rel=0" title="${esc(title)}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
 $('#video-preview-meta').textContent=`${title} · ${channel}`;
 $('#video-preview-link').href=`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
 document.body.classList.add('modal-open');dialog.showModal();
 if(!dialog.dataset.wired){dialog.dataset.wired='1';dialog.addEventListener('close',()=>{$('#video-frame').innerHTML=''})}
}
const routes={
 '/explorar':['Tu universo de estudio','PLATAFORMA / 01','Un lugar para conectar lo que aprendes, lo que practicas y lo que quieres alcanzar.'],
 '/biblioteca':['Conocimiento en órbita.','BIBLIOTECA / 02','Encuentra tu siguiente lectura. Colecciones, materiales y libros organizados para acompañarte antes y después del ingreso.'],
 '/biblioteca/universe':['Hecho en Universe.','UNIVERSE × CICLESOLUS','Solucionarios CEPREUNI 2027-1. La colección conserva las portadas, los autores y la disponibilidad del catálogo.'],
 '/biblioteca/cuzcano':['Catálogo Cuzcano.','BIBLIOTECA / EDITORIALES','Material preuniversitario y solucionarios CEPREUNI organizados por curso.'],
 '/biblioteca/lumbreras':['Catálogo Lumbreras.','BIBLIOTECA / EDITORIALES','Explora las colecciones y encuentra el libro que acompaña a tu siguiente tema.'],
 '/biblioteca/librosuniversitarios':['Más allá del ingreso.','BIBLIOTECA / UNIVERSITARIA','Raymond Chang y coautores. Química y fisicoquímica, con sus ediciones e idiomas identificados.'],
 '/cepreuni/ciclopre20271':['Tu material. Tu avance.','CEPREUNI / CICLO PRE 2027-1','Documentos del ciclo, libros y clases. Las mismas fuentes, en un espacio más claro.'],
 '/cepreuni':['Tu próxima etapa.','CEPREUNI / 2027-1','Un centro de estudio para tu ciclo: materiales, temas, evaluaciones y una ruta para llegar preparado.'],
 '/temario':['Entender empieza aquí.','MAPA DEL CONOCIMIENTO','Explora el temario de admisión y CEPREUNI. Abre un tema, revisa sus conceptos y registra lo que ya estudiaste.'],
 '/clases':['Una idea más clara.','CLASES / VIDEOTECA','Videos organizados por curso. Filtra, busca y continúa aprendiendo desde el canal de origen.'],
 '/planificador':['Una intención. Un plan.','TU TRAYECTORIA','Convierte tus próximos temas en pasos concretos. Este tablero guarda tus tareas únicamente en este navegador.'],
 '/fijas-cepreuni':['Prioriza con criterio.','CEPREUNI / PRIMERA PC','Explora el tipo de problema asociado a cada tema del modelo histórico. Una referencia de preparación, nunca una garantía del examen.'],
 '/calculadora':['Pon tu meta en perspectiva.','CEPREUNI / PUNTAJES','Tus notas, tu carrera y las referencias históricas. Una calculadora para orientar tu preparación, no para prometer una vacante.'],
 '/account':['Tu espacio, a tu manera.','CUENTA / PREFERENCIAS','Personaliza esta experiencia y accede a tu cuenta real cuando lo necesites.'],
};
let data,videoData,ui,view,home,routeVersion=0,toastTimer;
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
function pathName(){return decodeURI(location.pathname).replace(/\/$/,'').replace(/\.html$/,'')||'/'}
function sidebar(path){const items=[['/explorar','Plataforma','grid'],['/cepreuni','CEPREUNI','cap'],['/admision','Admisión UNI','cap'],['/unitalk','UNITALK','users'],['/temario','Temario','list'],['/clases','Clases','play'],['/planificador','Planificador','calendar'],['/simulacros','Simulacros','target'],['/examenes','Exámenes','layers'],['/biblioteca','Biblioteca','book']];return `<span>TODO CONECTA</span><nav aria-label="Secciones de Universe">${items.map(([url,t,i])=>`<a href="${url}" ${path===url||(url==='/biblioteca'&&path.startsWith('/biblioteca/'))?'aria-current="page"':''}>${ui.icon(i)}${t}</a>`).join('')}</nav>`}
function head(path){const r=routes[path]||['Aún no estamos aquí.','UNIVERSE / 404','No encontramos esta página. Puedes volver a la plataforma.'];return `<div class="page-topline"><span><a href="/">Universe</a> / <a href="/explorar">Plataforma</a> / ${esc(r[0].replace(/\.$/,''))}</span></div><div class="page-head"><span class="eyebrow">${r[1]}</span><h1 id="page-title" tabindex="-1">${r[0]}</h1><p>${r[2]}</p></div>`}
async function route(focus=false){const token=++routeVersion,p=pathName();const isHome=p==='/';home.hidden=!isHome;$('#platform').hidden=isHome;document.body.classList.toggle('in-platform',!isHome);$('.brand').href='/';$('.footer-brand').href='/';$$('.header .nav a').forEach(a=>a.setAttribute('aria-current',a.getAttribute('href')===p?'page':'false'));if(isHome){document.title='Universe — El origen de tu siguiente idea';return}document.title=`${routes[p]?.[0]||'Página no encontrada'} — Universe`;$('.side-rail').innerHTML=sidebar(p);view.innerHTML=head(p)+'<div class="page-view" id="page-view"></div>';const out=$('#page-view');if(!data){out.innerHTML=empty('Conectando tus recursos…');try{data=await fetch('/universe-ui/data/platform.json').then(r=>{if(!r.ok)throw Error('Datos no disponibles');return r.json()});hydrateHumanities(data)}catch{out.innerHTML=note('No se pudieron cargar los recursos. Recarga esta página.');return}}if(token!==routeVersion)return;
 const catalogs={'/biblioteca/universe':'universe','/biblioteca/cuzcano':'cuzcano','/biblioteca/lumbreras':'lumbreras','/biblioteca/librosuniversitarios':'college','/cepreuni/ciclopre20271':'materials'};
 if(catalogs[p])catalog(out,catalogs[p]);
 else if(p==='/explorar')overview(out);
 else if(p==='/biblioteca')library(out);
 else if(p==='/cepreuni')cepre(out);
 else if(p==='/temario')syllabus(out);
 else if(p==='/clases')await classes(out,token);
 else if(p==='/planificador')planner(out);
 else if(p==='/fijas-cepreuni')cepre(out);
 else if(p==='/calculadora')calculator(out);
 else if(p==='/account')account(out);
 else out.innerHTML=internal('/explorar','Volver a la plataforma');
 mountOrbits();syncProfileBadge();
 if(focus)$('#page-title')?.focus({preventScroll:true});
}
function overview(out){out.innerHTML=`<section class="p-panel p-feature"><div><span class="p-label">UNA RUTA PARA CADA OBJETIVO</span><h2>Tu siguiente idea<br>ya tiene un lugar.</h2><p>No necesitas tener todo resuelto. Empieza por un concepto, una lectura o una pregunta.</p><div class="page-actions">${internal('/temario','Explorar mi temario','button primary')}${internal('/planificador','Crear mi ruta','text-button')}</div></div>${orbit()}</section>${sub('Elige tu próxima conexión','Herramientas de Universe')}<div class="p-grid">${ui.tools.map(t=>tile(t.url,t.name,t.desc,t.icon)).join('')}${tile('/cepreuni?panel=fijas','Fijas CEPREUNI','Primera PC, examen final y prueba de selección.','target')}</div>`}
// /biblioteca es el índice de la biblioteca, no un escaparate: la vista previa de portadas de la
// colección Universe × Ciclesolus vive en su propio catálogo, y aquí solo se enumeran las colecciones
// y las editoriales, cada una con su logo entero.
function library(out){const all=Object.values(data.catalogs).reduce((n,a)=>n+a.length,0);const pubs=data.publishers||[];
 out.innerHTML=`${stats([[all,'recursos catalogados'],[String(pubs.length).padStart(2,'0'),'editoriales'],['2027-1','ciclo preuniversitario']])}${sub('Encuentra tu colección','Cada logo abre su catálogo')}<div class="p-grid two logo-grid">${logoTile('/cepreuni/ciclopre20271','Materiales CEPREUNI','Documentos del ciclo, libros y clases con su vista previa.','cepreuni',data.catalogs.materials.length+' recursos')}${logoTile('/biblioteca/universe','Universe × Ciclesolus','Seis cursos con portadas originales. Álgebra en modo lector.','universe',data.catalogs.universe.length+' libros')}${logoTile('/biblioteca/librosuniversitarios','Libros universitarios','Raymond Chang y coautores. Ediciones e idiomas identificados.','uni',data.catalogs.college.length+' libros')}${logoTile('/biblioteca/lumbreras','Lumbreras','Libros rojos, azules, esenciales y otras colecciones.','lumbreras',data.catalogs.lumbreras.length+' libros')}${logoTile('/biblioteca/cuzcano','Cuzcano','Colecciones de preparación y solucionarios por curso.','cuzcano',data.catalogs.cuzcano.length+' libros')}</div>${sub('Todas las editoriales','Las que no tienen catálogo propio abren su carpeta de origen')}<div class="publisher-grid">${pubs.map(p=>{const ext=p.href.startsWith('http');return `<a class="publisher-card${p.flat?' is-flat':''}" href="${esc(p.href)}"${ext?' data-live target="_blank" rel="noopener noreferrer"':''} aria-label="${esc(p.name)}"><img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy"><span>${esc(p.action||(ext?'Abrir':'Catálogo'))}${ext?' ↗':''}</span></a>`}).join('')}</div>${note('Los archivos se abren en su fuente original. La disponibilidad depende de los permisos de cada archivo.')}`}
function catalog(out,key){renderCatalog(out,key,data)}

function cepre(out){out.innerHTML=`<section class="p-panel p-feature"><div><span class="p-label">CICLO PRE / 2027-1</span><h2>Prepárate para<br>lo que viene.</h2><p>Tu ciclo, conectado: pasa del tema a la clase, de la clase al material y del material a tu plan.</p><div class="page-actions">${internal('/cepreuni/ciclopre20271','Abrir mis materiales','button primary')}${internal('/cepreuni?panel=fijas','Explorar fijas','text-button')}</div></div>${cepreEmblem()}</section>${sub('Tu centro de estudio')}<div class="p-grid four">${tile('/temario','Temario','Los conceptos de cada semana.','list')}${tile('/clases','Clases','Explicaciones a tu ritmo.','play')}${tile('/cepreuni/ciclopre20271','Materiales','Sílabos, libros y clases del ciclo.','book')}${tile('/docentes-cepreuni','Guía de aulas','Horarios y docentes.','grid')}</div>${sub('Todo tu ciclo CEPREUNI','Las herramientas del proceso, en un mismo lugar')}<div class="p-grid four">${tile('/informacion-cepreuni','Información CEPREUNI','Normas, evaluaciones y organización del ciclo.','cap')}${tile('/fijas-cepreuni','Fijas CEPREUNI','Los temas que siempre caen, prueba por prueba.','target')}${tile('/simulacros','Simulacros','Ensaya en condiciones de examen.','layers')}${tile('/ranking','Ranking','Máximos, mínimos y promedios del ciclo.','orbit')}${tile('/ingresantes-cepreuni','Ingresantes','Quiénes ingresaron y con qué puntaje.','users')}${tile('/calculadora','Calculadora','Calcula tu puntaje y tu proyección.','calculator')}${tile('/examenes','Exámenes','Genera preguntas de práctica con IA.','layers')}${tile('/planificador','Planificador','Arma tu horario de estudio.','calendar')}</div><section id="cepre-fijas" class="cepre-fijas"></section>${sub('En el horizonte','Septiembre 2026 · Hora de Lima')}<div class="p-split"><div class="p-panel"><div class="p-chips" id="page-cycles"><button data-c="pre" aria-pressed="true">Pre</button><button data-c="basic" aria-pressed="false">Básico</button><button data-c="ien" aria-pressed="false">IEN</button></div><div id="page-schedule"></div></div><div class="p-panel"><span class="p-label">ANTES DE TU EVALUACIÓN</span><h2 style="margin-top:15px">Una ruta más clara.</h2><p>Revisa el alcance de tu práctica, identifica los temas que necesitas reforzar y anótalos en tu tablero.</p><div class="page-actions">${internal('/planificador','Organizar mi preparación','button primary')}</div><p class="source-note">Las fechas proceden del calendario configurado en Universe. Confirma cualquier actualización en CEPREUNI.</p></div></div>`;const render=c=>{$('#page-schedule').innerHTML=ui.events.filter(e=>e.cycle===c).map(e=>`<article class="schedule-row"><div class="schedule-date">${e.day}<small>SEP 2026</small></div><div><h3>${e.name}</h3><p>Domingo · ${e.time} · Lima (UTC−5)</p></div></article>`).join('')};$$('#page-cycles button').forEach(b=>b.onclick=()=>{$$('#page-cycles button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render(b.dataset.c)});render('pre');renderFijas($('#cepre-fijas'),data);if(new URLSearchParams(location.search).get('panel')==='fijas'||pathName()==='/fijas-cepreuni')requestAnimationFrame(()=>$('#cepre-fijas').scrollIntoView({block:'start'}))}
const EVALUATIONS=[{name:'1RA PC',range:[1,2]},{name:'2DA PC',range:[3,6]},{name:'1ER PARCIAL',range:[1,7]},{name:'3RA PC',range:[8,9]},{name:'4TA PC',range:[10,11]},{name:'2DO PARCIAL',range:[8,13]},{name:'5TA PC',range:[15,16]},{name:'6TA PC',range:[17,18]},{name:'7MA PC',range:[19,20]},{name:'EXAMEN FINAL',range:[15,20]}];
const HUMANITIES=new Set(['razonamientoverbal','razonamientomatematico','historia','geografia','economia','lenguaje','literatura','filosofia','dpcc','logica','psicologia','ingles']);
const AREAS=[['Matemática',['aritmetica','algebra','geometria','trigonometria','calculo']],['Ciencias',['fisica','quimica']],['Humanidades',['razonamientoverbal','razonamientomatematico','historia','geografia','economia','lenguaje','literatura','filosofia','dpcc','logica','psicologia','ingles']]];
const weekNum=label=>{const m=/\d+/.exec(label||'');return m?+m[0]:null};
// El temario cubre tres procesos distintos y antes vivían mezclados: Admisión UNI y CEPREUNI compartían
// un selector escondido dentro de los filtros, y San Marcos —cuyo temario sí existe en el repositorio—
// no aparecía en ninguna parte. Ahora cada proceso es su propia sección.
// El programa CEPREUNI de humanidades sí existe, pero guardado aparte (syllabus.humanities: una lista
// de 21 semanas por curso) y con otro nombre que el del temario de admisión — "Historia" frente a
// "Historia del Perú y del Mundo". El render solo leía cepreSemanas, así que esos cursos aparecían
// vacíos en CEPREUNI. Se normalizan una vez, de modo que también entren en la vista por evaluación.
const HUMANITIES_PROGRAM={razonamientoverbal:'Razonamiento Verbal',lenguaje:'Lenguaje',literatura:'Literatura',historia:'Historia',geografia:'Geografía',economia:'Economía',filosofia:'Filosofía',psicologia:'Psicología',ingles:'Inglés'};
function hydrateHumanities(d){const src=d?.syllabus?.humanities;if(!src)return;
 for(const [id,key] of Object.entries(HUMANITIES_PROGRAM)){const c=d.syllabus.temarios[id];const weeks=src[key];
  if(!c||!weeks||(c.cepreSemanas||[]).length)continue;
  c.cepreSemanas=weeks.map((title,i)=>({label:`Semana ${i+1}`,topics:[{title,items:[title]}]}));}}
function syllabus(out){const temarios=data.syllabus.temarios;const marcos=data.syllabus.sanMarcos;const progress=store.get('topics',{});
 const SECTIONS=[['admission','Admisión UNI'],['cepre','CEPREUNI'],['marcos','Admisión San Marcos']];
 const marcosGroups=marcos?[...new Set(marcos.courses.map(c=>c.group))]:[];
 out.innerHTML=`<div class="p-chips" id="syllabus-section">${SECTIONS.map(([id,label],i)=>`<button data-section="${id}" aria-pressed="${i===0}">${esc(label)}</button>`).join('')}</div><div class="p-chips" id="cepre-view" hidden><button data-view="course" aria-pressed="true">Por curso</button><button data-view="exam" aria-pressed="false">Por evaluación</button></div><div id="syllabus-course"><div class="p-filter"><input class="p-input" id="topic-query" type="search" placeholder="Buscar un concepto dentro del curso…" aria-label="Buscar tema"><select class="p-select" id="topic-course" aria-label="Curso">${AREAS.map(([area,ids])=>`<optgroup label="${esc(area)}">${ids.map(id=>`<option value="${id}">${esc(temarios[id].name)}</option>`).join('')}</optgroup>`).join('')}</select></div><div class="p-split"><div><p class="p-result" id="topic-count" aria-live="polite"></p><div class="topic-list" id="topics"></div></div><aside><div class="p-panel"><span class="p-label">TU MAPA DE PROGRESO</span><h2 id="topic-progress" style="margin-top:18px"></h2><div class="progress-line"><i id="topic-progress-bar"></i></div><p>Marca los conceptos que ya revisaste. No es una evaluación: tú decides cuándo estás listo para practicar.</p>${internal('/clases','Buscar una explicación','text-button')}<p class="source-note">Progreso guardado en este navegador. No sincronizado con tu cuenta.</p></div><div class="p-notice" id="syllabus-source"></div></aside></div></div><div id="syllabus-exam" hidden><div class="p-subhead"><div><span class="p-label">CEPREUNI / EVALUACIONES</span><h2>¿Qué entra en tu próxima prueba?</h2></div></div><div class="p-chips" id="exam-picker">${EVALUATIONS.map((e,i)=>`<button data-exam="${i}" aria-pressed="${i===0}">${esc(e.name)}</button>`).join('')}</div><p class="p-notice" id="exam-range"></p><div id="exam-results"></div></div><div id="syllabus-marcos" hidden>${marcos?`<div class="p-subhead"><div><span class="p-label">UNMSM / CICLO ${esc(marcos.cycle)}</span><h2>Temario de Admisión San Marcos</h2></div><span>${marcos.courses.length} cursos</span></div><div class="p-filter"><input class="p-input" id="marcos-query" type="search" placeholder="Buscar un tema del temario San Marcos…" aria-label="Buscar tema de San Marcos"><select class="p-select" id="marcos-course" aria-label="Curso">${marcosGroups.map(g=>`<optgroup label="${esc(g)}">${marcos.courses.filter(c=>c.group===g).map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</optgroup>`).join('')}</select></div><p class="p-result" id="marcos-count" aria-live="polite"></p><div class="topic-list" id="marcos-topics"></div><p class="source-note">Temario publicado para el proceso de admisión UNMSM. Consulta el prospecto oficial para cambios del proceso.</p>`:empty('El temario de San Marcos no está disponible.')}</div>`;
 let section='admission',view='course',shown=[];
 const render=()=>{const id=$('#topic-course').value,c=temarios[id],track=section==='cepre'?'cepre':'admission',modules=track==='cepre'?c.cepreSemanas:c.semanas;let n=0;const rows=(modules||[]).flatMap(m=>(m.topics||[]).map(t=>({...t,group:m.label,key:`${id}/${track}/${n++}`})));const q=norm($('#topic-query').value);shown=rows;const filtered=rows.filter(t=>norm(t.title+' '+t.items.join(' ')).includes(q));$('#topic-count').textContent=`${c.name} · ${filtered.length} temas`;$('#topics').innerHTML=filtered.map((t,i)=>`<details class="topic-item"><summary><span class="topic-num">${String(i+1).padStart(2,'0')}</span><span>${esc(t.title.replace(/^\d+\.\s*/,''))}</span><span class="topic-plus">+</span></summary><div class="topic-detail"><span class="p-label">${esc(t.group)}</span>${t.items.map(x=>`<p>${esc(x)}</p>`).join('')}<label><input type="checkbox" data-topic="${esc(t.key)}" ${progress[t.key]?'checked':''}>Ya revisé este concepto</label></div></details>`).join('')||empty('No se encontraron temas en este programa.');$('#syllabus-source').textContent=track==='cepre'?'Programa del ciclo CEPREUNI, semana por semana. Consulta la guía oficial para cambios del ciclo.':'Temario del prospecto de Admisión UNI. Se conserva el contenido completo de cada tema.';$$('#topics [data-topic]').forEach(el=>el.onchange=()=>{progress[el.dataset.topic]=el.checked;if(!store.set('topics',progress))toast('El navegador no permitió guardar el progreso.');update()});update()};
 const update=()=>{const done=shown.filter(t=>progress[t.key]).length;$('#topic-progress').textContent=`${done} / ${shown.length} temas`;$('#topic-progress-bar').style.width=(shown.length?done/shown.length*100:0)+'%'};
 $('#topic-query').oninput=render;$('#topic-course').onchange=render;
 const renderMarcos=()=>{if(!marcos)return;const c=marcos.courses.find(x=>x.id===$('#marcos-course').value)||marcos.courses[0];const q=norm($('#marcos-query').value);const hits=c.topics.map((t,i)=>({text:t,key:`marcos/${c.id}/${i}`})).filter(t=>norm(t.text).includes(q));$('#marcos-count').textContent=`${c.name} · ${hits.length} temas`;$('#marcos-topics').innerHTML=hits.map((t,i)=>`<details class="topic-item"><summary><span class="topic-num">${String(i+1).padStart(2,'0')}</span><span>${esc(t.text.split('. ')[0].slice(0,90))}</span><span class="topic-plus">+</span></summary><div class="topic-detail"><span class="p-label">${esc(c.group)}</span><p>${esc(t.text)}</p><label><input type="checkbox" data-topic="${esc(t.key)}" ${progress[t.key]?'checked':''}>Ya revisé este concepto</label></div></details>`).join('')||empty('No se encontraron temas con esa búsqueda.');$$('#marcos-topics [data-topic]').forEach(el=>el.onchange=()=>{progress[el.dataset.topic]=el.checked;store.set('topics',progress)})};
 if(marcos){$('#marcos-query').oninput=renderMarcos;$('#marcos-course').onchange=renderMarcos}
 let examIndex=0;const renderExam=()=>{const ev=EVALUATIONS[examIndex];$$('#exam-picker [data-exam]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.exam===examIndex)));// No todos los cursos entran en cada evaluación. Donde el corpus de fijas lo registra, la lista es esa
 // y no la que se deduzca de las semanas; donde no está registrada, se dice, en vez de aparentar que sí.
 const spec=(data.syllabus.evaluationCourses||{})[ev.name],allowed=spec?new Set(spec.ids):null;
 $('#exam-range').textContent=`Semanas ${ev.range[0]}–${ev.range[1]} del ciclo CEPREUNI · Humanidades acumula desde la semana 1 hasta la ${ev.range[1]}.`+(spec?` · ${spec.ids.length} cursos evaluados. ${spec.source}`:' · La lista oficial de cursos de esta evaluación no está registrada: se muestran los cursos cuyo programa cubre estas semanas.');const cards=Object.entries(temarios).filter(([id])=>!allowed||allowed.has(id)).map(([id,c])=>{const modules=c.cepreSemanas||[];const inRange=HUMANITIES.has(id)?modules.filter(m=>{const w=weekNum(m.label);return w!==null&&w<=ev.range[1]}):modules.filter(m=>{const w=weekNum(m.label);return w!==null&&w>=ev.range[0]&&w<=ev.range[1]});const topics=inRange.flatMap(m=>(m.topics||[]).map(t=>({...t,group:m.label})));if(!topics.length)return '';return `<details class="topic-item exam-course"><summary><span>${esc(c.name)}</span><span class="topic-plus">${topics.length}</span></summary><div class="topic-detail">${topics.map(t=>`<p><b>${esc(t.group)}</b> · ${esc(t.title.replace(/^\d+\.\s*/,''))}</p>`).join('')}${HUMANITIES.has(id)?'<p class="source-note">Acumulativo: incluye todas las semanas previas del ciclo.</p>':''}</div></details>`}).filter(Boolean).join('');$('#exam-results').innerHTML=cards||empty('No hay temario CEPREUNI registrado para este rango todavía.')};
 $$('#exam-picker [data-exam]').forEach(b=>b.onclick=()=>{examIndex=+b.dataset.exam;renderExam()});
 const show=()=>{const courseOpen=section==='admission'||(section==='cepre'&&view==='course');$('#syllabus-course').hidden=!courseOpen;$('#syllabus-exam').hidden=!(section==='cepre'&&view==='exam');$('#syllabus-marcos').hidden=section!=='marcos';$('#cepre-view').hidden=section!=='cepre';if(courseOpen)render();if(section==='marcos')renderMarcos()};
 $$('#syllabus-section [data-section]').forEach(b=>b.onclick=()=>{section=b.dataset.section;$$('#syllabus-section [data-section]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));show()});
 $$('#cepre-view [data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;$$('#cepre-view [data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));show()});
 show();renderExam();
}
function splitShift(from,to,blocks){
 const toMin=t=>{const[h,m]=String(t||'07:00').split(':').map(Number);return h*60+(m||0)};
 const toStr=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
 const start=toMin(from),span=Math.max(60,toMin(to)-start),per=Math.max(20,Math.floor(span/Math.max(1,blocks)));
 return Array.from({length:blocks},(_,i)=>[toStr(start+i*per),toStr(start+(i+1)*per)]);
}
function buildPlan(profile){
 const {focus,days,start,weeks,blocksPerDay,focusCourses=[]}=profile;
 const slots=splitShift(profile.from,profile.to,blocksPerDay);
 const pick=new Set(focusCourses);const weights={};AREAS.forEach(([name,ids])=>{const n=ids.filter(id=>pick.has(id)).length;weights[name]=n?1+n:(name===focus?3:1)});
 const pools={};AREAS.forEach(([name,ids])=>{pools[name]=ids.flatMap(id=>Array(pick.has(id)?2:1).fill(0).map(()=>{const c=data.syllabus.temarios[id];const mods=c.cepreSemanas||c.semanas||[];const topics=mods.flatMap(m=>(m.topics||[]).map(t=>({group:m.label,title:t.title.replace(/^\d+\.\s*/,'')})));return {id,name:c.name,topics,pos:0}}))});
 const cursor={};AREAS.forEach(([name])=>cursor[name]=0);
 const counts={};AREAS.forEach(([name])=>counts[name]=0);
 function nextForArea(name){const courses=pools[name];for(let tries=0;tries<courses.length;tries++){const idx=cursor[name]%courses.length;cursor[name]++;const course=courses[idx];if(course.pos<course.topics.length){const t=course.topics[course.pos++];return {area:name,courseId:course.id,course:course.name,group:t.group,title:t.title,type:'study'}}}
  courses.forEach(c=>c.pos=0);const idx=cursor[name]%courses.length;cursor[name]++;const course=courses[idx];const t=course.topics[course.pos++%course.topics.length]||{group:'',title:course.name};return {area:name,courseId:course.id,course:course.name,group:t.group,title:'Repaso: '+t.title,type:'review'}}
 const entries=[];const startDate=new Date(start+'T00:00:00');
 for(let d=0;d<weeks*7;d++){const date=new Date(startDate);date.setDate(date.getDate()+d);const weekday=date.getDay();if(weekday===0||!days.includes(weekday))continue;
  for(let b=0;b<blocksPerDay;b++){const areaNames=AREAS.map(([n])=>n).sort((a,c)=>counts[a]/weights[a]-counts[c]/weights[c]);const area=areaNames[0];counts[area]++;const pick=nextForArea(area);const iso=date.toISOString().slice(0,10);const[startTime,endTime]=slots[b]||[profile.from,profile.to];entries.push({date:iso,index:b,...pick,startTime,endTime,done:false,id:iso+'-'+b})}}
 return entries;
}
function planWeekStart(iso){const d=new Date(iso+'T00:00:00');const day=d.getDay()||7;d.setDate(d.getDate()-(day-1));return d}
// Academias registradas en la base de datos de Universe (planner.js del sitio real).
const ACADEMIES=['Pitágoras','César Vallejo','ADUNI','Trilce','Pamer','Exclusiva UNI','ASEUNI','ADCUNI','Academia Ingeniería','Formación UNI','Aula 20','ACUNI','Grupo Ciencias','Vonex','Saco Oliveros','Savia','Integral Class','Academia Prisma','Academia Euclides','Academia Apolo','Academia Mendel','Otra academia'];
const CEPRE_CYCLES=[['pre','Ciclo preuniversitario'],['basico','Ciclo básico'],['ien','Ciclo IEN']];
const SHIFTS=[['morning','Mañana','07:00 – 14:00'],['afternoon','Tarde','14:00 – 20:00'],['custom','Personalizado','Tú eliges las horas']];
// Fechas estimadas: el calendario oficial del proceso no está publicado en el repositorio, así que se
// muestran como estimación y el estudiante puede cambiarlas.
const GOALS=[['cepre','Examen final CEPREUNI','2027-01-31','Una semana antes del final del ciclo'],['admision','Admisión UNI 2027-1','2027-02-14','Día del examen de admisión'],['custom','Fecha personalizada','','Tú eliges el día']];
const planCourses=()=>AREAS.flatMap(([area,ids])=>ids.filter(id=>data.syllabus.temarios[id]).map(id=>({id,area,name:data.syllabus.temarios[id].name})));

function planner(out){
 let plan=store.get('plan',null);
 const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
 const iso=d=>d.toISOString().slice(0,10);
 const courses=planCourses();
 const draft={track:'',cycle:'',academy:'',shift:'morning',from:'07:00',to:'14:00',focus:[],goal:'cepre',goalDate:'2027-01-31',start:iso(today),blocksPerDay:2,days:[1,2,3,4,5,6]};
 let step=1;

 out.innerHTML=`<div id="plan-setup"><ol class="plan-steps" id="plan-steps">${['Tu punto de partida','Horario y prioridades','Tu meta'].map((t,i)=>`<li${i?'':' aria-current="step"'}><b>${i+1}</b>${esc(t)}</li>`).join('')}</ol>

<section class="p-panel plan-step" data-step="1"><span class="p-label">PASO 1 / TU PUNTO DE PARTIDA</span><h2>¿Cómo estás estudiando ahora?</h2><p>De esto depende el ritmo del plan y el temario que usamos como base.</p>
<div class="plan-choices" id="plan-track">${[['cepre','Estudio en CEPREUNI','Ruta semanal según prácticas y parciales.'],['academy','Estudio en una academia','Preparación basada en el temario de admisión UNI.'],['self','Soy autodidacta','Tú marcas el ritmo, nosotros el orden.']].map(([v,t,d])=>`<button type="button" class="plan-choice" data-track="${v}"><b>${esc(t)}</b><small>${esc(d)}</small></button>`).join('')}</div>
<div id="plan-track-detail" hidden></div>
<div class="page-actions"><button class="button primary" id="plan-next-1" type="button">Continuar</button></div></section>

<section class="p-panel plan-step" data-step="2" hidden><span class="p-label">PASO 2 / HORARIO Y PRIORIDADES</span><h2>¿Cuándo estudias y qué necesita más espacio?</h2>
<div class="plan-choices" id="plan-shift">${SHIFTS.map(([v,t,d])=>`<button type="button" class="plan-choice" data-shift="${v}"${v==='morning'?' aria-pressed="true"':''}><b>${esc(t)}</b><small>${esc(d)}</small></button>`).join('')}</div>
<div class="plan-fields" id="plan-custom-hours" hidden><label>Empiezo a las<input class="p-input" type="time" id="plan-from" value="07:00"></label><label>Termino a las<input class="p-input" type="time" id="plan-to" value="14:00"></label></div>
<div class="plan-fields"><label>Días disponibles<span class="plan-days" id="plan-days">${[['1','L'],['2','M'],['3','X'],['4','J'],['5','V'],['6','S']].map(([v,l])=>`<label><input type="checkbox" value="${v}" checked>${l}</label>`).join('')}</span></label><label>Bloques por día<select id="plan-blocks" class="p-select"><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option><option value="4">4</option></select></label></div>
<h3 style="margin-top:26px">Cursos que necesitan más espacio</h3><p>Todos siguen en el plan; los que elijas reciben más bloques. Puedes elegir varios.</p>
<div class="p-chips plan-focus" id="plan-focus"><button type="button" data-focus="all" aria-pressed="false">Todos los cursos</button>${courses.map(c=>`<button type="button" data-focus="${esc(c.id)}" aria-pressed="false">${esc(c.name)}</button>`).join('')}</div>
<div class="page-actions"><button class="button" id="plan-back-2" type="button">Atrás</button><button class="button primary" id="plan-next-2" type="button">Continuar</button></div></section>

<section class="p-panel plan-step" data-step="3" hidden><span class="p-label">PASO 3 / TU META</span><h2>¿Hasta cuándo planificamos?</h2>
<div class="plan-choices" id="plan-goal">${GOALS.map(([v,t,d,note])=>`<button type="button" class="plan-choice" data-goal="${v}"${v==='cepre'?' aria-pressed="true"':''}><b>${esc(t)}</b><small>${esc(note)}</small>${d?`<span class="plan-est">${esc(d.split('-').reverse().join('/'))} · estimada</span>`:''}</button>`).join('')}</div>
<div class="plan-fields"><label>Empiezo el<input class="p-input" type="date" id="plan-start" value="${iso(today)}"></label><label>Fecha de la meta<input class="p-input" type="date" id="plan-goal-date" value="2027-01-31"></label></div>
<p class="p-notice" id="plan-summary" aria-live="polite"></p>
<div class="page-actions"><button class="button" id="plan-back-3" type="button">Atrás</button><button class="button primary" id="plan-generate" type="button">Crear mi cronograma</button></div>
<p class="source-note">Las fechas de CEPREUNI y de admisión son estimaciones: el calendario oficial del proceso 2027-1 aún no está publicado. Puedes cambiarlas.</p></section></div>

<div id="plan-calendar" hidden><div class="p-row" style="margin:28px 0 14px"><div><span class="p-label">TU SEMANA</span><h2 style="margin-top:8px" id="plan-week-label"></h2></div><div class="p-chips"><button id="plan-prev" type="button">← Semana</button><button id="plan-next" type="button">Semana →</button><button id="plan-add" type="button">+ Añadir sesión</button><button id="plan-notify" type="button" aria-pressed="false">🔔 Avisarme al empezar</button><button id="plan-reset" class="text-button" type="button">Reconfigurar</button></div></div><p class="p-notice" id="plan-notify-status" hidden></p><p class="p-result" id="plan-progress-label" aria-live="polite"></p><div class="progress-line"><i id="plan-progress-bar"></i></div><div class="plan-week" id="plan-week"></div><p class="source-note">Tu plan y tu avance se guardan solo en este navegador. Pasa el cursor sobre un bloque para eliminarlo.</p></div>

<dialog id="plan-add-dialog"><form method="dialog"><h3>Añadir una sesión</h3><div class="plan-fields plan-add-fields"><label style="grid-column:1/-1">Día<input class="p-input" type="date" id="add-date"></label><label>Empieza<input class="p-input" type="time" id="add-start" value="07:00"></label><label>Termina<input class="p-input" type="time" id="add-end" value="08:00"></label><label>Tipo<select class="p-select" id="add-type"><option value="study">Estudio de un tema</option><option value="review">Repaso</option><option value="practice">Práctica dirigida</option></select></label><label>Curso<select class="p-select" id="add-course">${courses.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label><label style="grid-column:1/-1">Descripción<input class="p-input" type="text" id="add-title" placeholder="Ej. Repasar cinemática"></label></div><div class="page-actions"><button class="button" value="cancel" type="submit">Cancelar</button><button class="button primary" id="add-confirm" value="ok" type="submit">Añadir</button></div></form></dialog>

<a class="button account-cloud-link" href="/planificador/seguimiento">Mi seguimiento y calendario →</a>${sub('¿No sabes por dónde empezar?')}<div class="p-grid two">${tile('/temario','Tu mapa de conceptos','Explora los temas antes de organizar tus sesiones.','list')}${tile('/fijas-cepreuni','Prepara tu Primera PC','Consulta los tipos de problema del modelo histórico.','target')}</div>`;

 const show=()=>{$$('#plan-setup .plan-step').forEach(x=>x.hidden=+x.dataset.step!==step);
  $$('#plan-steps li').forEach((li,k)=>{li.toggleAttribute('aria-current',k+1===step);li.classList.toggle('is-done',k+1<step)})};
 // Se marca entre hermanos: seleccionar por [aria-pressed] solo alcanzaba a los botones que ya traían
 // el atributo, de modo que la opción recién elegida nunca llegaba a marcarse.
 const press=el=>[...el.parentElement.children].forEach(x=>x.setAttribute('aria-pressed',String(x===el)));
 // Un único manejador delegado en la raíz del planificador. Repartir manejadores por nodo obligaba a
 // reengancharlos cada vez que una respuesta reescribe su pregunta de seguimiento, y bastaba con que la
 // vista se volviera a renderizar para que el asistente se quedara pidiendo un dato ya elegido.
 const chosen=sel=>$(sel+' [aria-pressed="true"]')?.dataset||{};
 const readState=()=>({track:chosen('#plan-track').track||'',cycle:chosen('#plan-cycle').cycle||'',
  academy:$('#plan-academy')?.value||'',shift:chosen('#plan-shift').shift||'morning',
  goal:chosen('#plan-goal').goal||'cepre',
  focus:$$('#plan-focus [data-focus][aria-pressed="true"]').map(b=>b.dataset.focus).filter(f=>f!=='all')});

 document.addEventListener('click',e=>{const anchor=e.target.closest('a[href]');if(anchor){const target=new URL(anchor.href,location.href);if(["/account/cloud","/planificador/seguimiento","/simulacros","/ranking","/admision","/docentes-cepreuni","/informacion-cepreuni","/privacidad","/terminos","/nosotros","/metodologia-editorial","/correcciones","/contacto","/aula","/biblioteca/recursos","/autores/criss-vasquez","/autores/luhana-belen","/biblioteca/seleccion-de-preguntas","/calculadora-admision","/fichas-admision","/guias/como-interpretar-ranking-cepreuni","/guias/como-se-calcula-puntaje-cepreuni-2026-2","/ingresantes-cepreuni","/ingresantes-uni-2026-2","/ranking-admision","/resultados-admision"].includes(target.pathname.replace(/\/$/,'')))return;}if(!$('#plan-setup'))return;
  const t=e.target.closest('[data-track]');
  if(t){press(t);const d=$('#plan-track-detail');
   if(t.dataset.track==='cepre'){d.hidden=false;d.innerHTML=`<h3>¿Qué ciclo CEPREUNI 2027-1 llevarás?</h3><div class="p-chips" id="plan-cycle">${CEPRE_CYCLES.map(([v,x])=>`<button type="button" data-cycle="${v}" aria-pressed="false">${esc(x)}</button>`).join('')}</div>`}
   else if(t.dataset.track==='academy'){d.hidden=false;d.innerHTML=`<h3>¿En qué academia estudias?</h3><select class="p-select" id="plan-academy"><option value="">Elige tu academia</option>${ACADEMIES.map(a=>`<option>${esc(a)}</option>`).join('')}</select><label id="plan-academy-other" hidden>Nombre de la academia<input class="p-input" type="text" id="plan-academy-name"></label>`}
   else{d.hidden=true;d.innerHTML=''}
   return}
  const c=e.target.closest('[data-cycle]');if(c){press(c);return}
  const sh=e.target.closest('[data-shift]');if(sh){press(sh);$('#plan-custom-hours').hidden=sh.dataset.shift!=='custom';return}
  const g=e.target.closest('[data-goal]');if(g){press(g);const spec=GOALS.find(x=>x[0]===g.dataset.goal);if(spec&&spec[2])$('#plan-goal-date').value=spec[2];summary();return}
  const f=e.target.closest('[data-focus]');if(f){
   if(f.dataset.focus==='all'){const on=f.getAttribute('aria-pressed')!=='true';$$('#plan-focus [data-focus]').forEach(x=>x.setAttribute('aria-pressed',String(on)))}
   else{f.setAttribute('aria-pressed',String(f.getAttribute('aria-pressed')!=='true'));
    $('#plan-focus [data-focus="all"]').setAttribute('aria-pressed',String(readState().focus.length===courses.length))}
   return}
 });
 document.addEventListener('change',e=>{if(!$('#plan-setup'))return;
  if(e.target.id==='plan-academy')$('#plan-academy-other').hidden=e.target.value!=='Otra academia';
  if(['plan-start','plan-goal-date','plan-blocks'].includes(e.target.id)||e.target.closest('#plan-days'))summary();
 });

 $('#plan-next-1').onclick=()=>{const st=readState();
  if(!st.track){toast('Elige cómo estás estudiando ahora.');return}
  if(st.track==='cepre'&&!st.cycle){toast('Elige tu ciclo CEPREUNI.');return}
  if(st.track==='academy'&&!st.academy){toast('Elige o escribe tu academia.');return}
  step=2;show()};
 $('#plan-back-2').onclick=()=>{step=1;show()};
 $('#plan-next-2').onclick=()=>{step=3;show();summary()};
 const weeksTo=()=>{const a=new Date($('#plan-start').value||iso(today)),b=new Date($('#plan-goal-date').value||draft.goalDate);
  return Math.max(1,Math.min(30,Math.ceil((b-a)/6048e5)))};
 const summary=()=>{const w=weeksTo(),d=$$('#plan-days input:checked').length,b=+$('#plan-blocks').value,n=w*d*b,f=readState().focus.length;
  $('#plan-summary').textContent=`${w} semanas · ${d} días por semana · ${n} sesiones · alrededor de ${Math.round(n*1.5)} horas planificadas${f?` · prioridad en ${f} curso${f>1?'s':''}`:''}.`};
 $('#plan-back-3').onclick=()=>{step=2;show()};

 let weekOffset=0;
 const dayNames=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
 const renderWeek=()=>{
  const base=planWeekStart(plan.profile.start);const start=new Date(base);start.setDate(start.getDate()+weekOffset*7);
  const end=new Date(start);end.setDate(end.getDate()+6);
  const fmt=d=>d.toLocaleDateString('es-PE',{day:'numeric',month:'short'});
  $('#plan-week-label').textContent=`${fmt(start)} – ${fmt(end)}`;
  $('#plan-prev').disabled=weekOffset<=0;
  const done=plan.entries.filter(e=>e.done).length;
  $('#plan-progress-label').textContent=`${done} / ${plan.entries.length} bloques completados`;
  $('#plan-progress-bar').style.width=(plan.entries.length?done/plan.entries.length*100:0)+'%';
  const cells=[];for(let i=0;i<7;i++){const d=new Date(start);d.setDate(d.getDate()+i);const day=iso(d);const items=plan.entries.filter(e=>e.date===day);cells.push({iso:day,label:dayNames[d.getDay()],date:fmt(d),items,isSunday:d.getDay()===0})}
  $('#plan-week').innerHTML=cells.map(c=>{const items=[...c.items].sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||''));return `<div class="plan-day${items.length?'':' plan-day-empty'}"><header><b>${c.label}</b><span>${c.date}</span><button class="plan-day-add" type="button" data-add-day="${c.iso}" aria-label="Añadir sesión el ${c.label}">+</button></header>${items.length?items.map(it=>`<div class="plan-block-wrap"><label class="plan-block ${it.type==='review'?'is-review':''}"><input type="checkbox" data-block="${esc(it.id)}" ${it.done?'checked':''}>${it.startTime?`<span class="plan-time">${esc(it.startTime)}${it.endTime?'–'+esc(it.endTime):''}</span>`:''}<span class="p-label">${esc(it.area||'')}</span><b>${esc(it.course)}</b><small>${esc([it.group,it.title].filter(Boolean).join(' · '))}</small></label><button class="plan-remove" type="button" data-remove="${esc(it.id)}" aria-label="Eliminar este bloque">×</button></div>`).join(''):`<p class="source-note">${c.isSunday?'Descanso':'Sin bloques'}</p>`}</div>`}).join('');
  $$('[data-block]').forEach(cb=>cb.onchange=()=>{const e=plan.entries.find(x=>x.id===cb.dataset.block);if(e)e.done=cb.checked;store.set('plan',plan);renderWeek()});
  $$('[data-remove]').forEach(b=>b.onclick=()=>{plan.entries=plan.entries.filter(e=>e.id!==b.dataset.remove);store.set('plan',plan);renderWeek()});
  $$('[data-add-day]').forEach(b=>b.onclick=()=>openAdd(b.dataset.addDay));
 };
 const openAdd=day=>{$('#add-date').value=day||iso(today);$('#add-start').value='07:00';$('#add-end').value='08:00';$('#plan-add-dialog').showModal()};
 $('#plan-add-dialog').addEventListener('close',()=>{
  if($('#plan-add-dialog').returnValue!=='ok')return;
  const id=$('#add-course').value,c=courses.find(x=>x.id===id);
  let startTime=$('#add-start').value||'07:00',endTime=$('#add-end').value||'08:00';
  if(endTime<=startTime){toast('La hora de fin debe ser después de la de inicio.');return}
  plan.entries.push({id:'x'+Date.now().toString(36),date:$('#add-date').value,startTime,endTime,type:$('#add-type').value,area:c?.area||'',courseId:id,course:c?.name||'',group:'Añadido por ti',title:$('#add-title').value.trim()||'Sesión libre',done:false});
  store.set('plan',plan);renderWeek();
 });
 $('#plan-add').onclick=()=>openAdd();
 function setupNotify(){
  const btn=$('#plan-notify'),status=$('#plan-notify-status');
  if(!('Notification' in window)){btn.hidden=true;return}
  const notifiedToday=new Set();let timer=null;
  const tick=()=>{
   if(!document.body.contains(btn)){clearInterval(timer);return}
   if(!plan||!plan.entries)return;
   const now=new Date(),hh=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
   const day=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
   plan.entries.forEach(e=>{if(e.date===day&&e.startTime===hh&&!notifiedToday.has(e.id)){notifiedToday.add(e.id);
    try{new Notification('Tu sesión empieza ahora',{body:[e.course,e.title].filter(Boolean).join(' · '),tag:e.id})}catch{}
   }});
  };
  const start=()=>{if(timer)return;timer=setInterval(tick,20000);tick();btn.setAttribute('aria-pressed','true');status.hidden=false;status.textContent='Te avisaremos aquí cuando empiece una sesión programada. Funciona solo mientras esta pestaña esté abierta.'};
  const stop=()=>{clearInterval(timer);timer=null;btn.setAttribute('aria-pressed','false');status.hidden=true};
  if(Notification.permission==='granted'&&store.get('plan-notify',false))start();
  btn.onclick=()=>{
   if(btn.getAttribute('aria-pressed')==='true'){stop();store.set('plan-notify',false);return}
   if(Notification.permission==='denied'){toast('Activa las notificaciones de este sitio desde los ajustes de tu navegador.');return}
   Notification.requestPermission().then(perm=>{if(perm==='granted'){store.set('plan-notify',true);start()}else toast('No se activaron las notificaciones.')});
  };
 }
 setupNotify();

 const showCalendar=()=>{$('#plan-setup').hidden=true;$('#plan-calendar').hidden=false;weekOffset=0;renderWeek()};
 if(plan&&plan.entries?.length)showCalendar();else show();

 $('#plan-generate').onclick=()=>{
  const days=$$('#plan-days input:checked').map(i=>+i.value);
  if(!days.length){toast('Elige al menos un día disponible.');return}
  const st=readState();
  const profile={...draft,...st,academy:st.academy==='Otra academia'?($('#plan-academy-name')?.value.trim()||'Otra academia'):st.academy,
   start:$('#plan-start').value||iso(today),goalDate:$('#plan-goal-date').value,
   weeks:weeksTo(),blocksPerDay:+$('#plan-blocks').value,days,
   from:st.shift==='custom'?$('#plan-from').value:(st.shift==='afternoon'?'14:00':'07:00'),to:st.shift==='custom'?$('#plan-to').value:(st.shift==='afternoon'?'20:00':'14:00'),
   focusCourses:st.focus};
  const entries=buildPlan(profile);
  plan={profile,entries,createdAt:new Date().toISOString()};
  if(!store.set('plan',plan))toast('No se pudo guardar el plan en este navegador.');
  toast(`Cronograma de ${profile.weeks} semanas creado a partir del temario real.`);
  showCalendar();
 };
 $('#plan-prev').onclick=()=>{if(weekOffset>0){weekOffset--;renderWeek()}};
 $('#plan-next').onclick=()=>{weekOffset++;renderWeek()};
 $('#plan-reset').onclick=()=>{$('#plan-calendar').hidden=true;$('#plan-setup').hidden=false;step=1;show()};
}
function fixed(out){renderFijas(out,data)}
// Small arithmetic parser. No eval, Function constructor, or remote requests.
export function calculate(input){const text=input.replace(/\s+/g,'').replace(/×/g,'*').replace(/÷/g,'/').replace(/,/g,'.');if(!text||text.length>160||/[^0-9.+\-*/()%]/.test(text))throw Error('Expresión no válida');const tokens=text.match(/(?:\d+(?:\.\d*)?|\.\d+)|[+\-*/()%]/g)||[];if(tokens.join('')!==text)throw Error('Número no válido');let at=0,depth=0;function value(){if(++depth>40)throw Error('Expresión demasiado larga');let n;if(tokens[at]==='+'||tokens[at]==='-'){const sign=tokens[at++];n=(sign==='-'?-1:1)*value()}else if(tokens[at]==='('){at++;n=add();if(tokens[at++]!==')')throw Error('Falta cerrar paréntesis')}else{const t=tokens[at++];if(!t||!/^\d|^\./.test(t))throw Error('Falta un número');n=Number(t)}while(tokens[at]==='%'){at++;n/=100}depth--;return n}function mul(){let n=value();while(['*','/'].includes(tokens[at])){const op=tokens[at++],v=value();if(op==='/'&&v===0)throw Error('No se puede dividir entre cero');n=op==='*'?n*v:n/v}return n}function add(){let n=mul();while(['+','-'].includes(tokens[at])){const op=tokens[at++],v=mul();n=op==='+'?n+v:n-v}return n}const result=add();if(at!==tokens.length||!Number.isFinite(result))throw Error('Revisa la expresión');return Number(result.toPrecision(12))}
async function classes(out,token){
 const courses=data.videoIndex?.courses||[];
 const slug=new URLSearchParams(location.search).get('curso');
 const course=courses.find(c=>c.slug===slug);
 if(!course){
  const areas=[...new Set(courses.map(c=>c.area))];
  out.innerHTML=`${sub('Elige un curso','Cada uno abre sus clases reales, agrupadas por semana')}${areas.map(area=>`<div class="p-subhead"><h2>${esc(area)}</h2></div><div class="p-grid three">${courses.filter(c=>c.area===area).map(c=>tile('/clases?curso='+encodeURIComponent(c.slug),c.title,`${c.videoCount} clases disponibles`,'play')).join('')}</div>`).join('')}`;
  return;
 }
 out.innerHTML=`<div class="page-actions">${internal('/clases','← Todos los cursos','text-button')}</div>${sub(course.title,course.videoCount+' clases')}<div id="classes-list">${empty('Cargando clases…')}</div>`;
 if(!videoData){try{videoData=await fetch('/universe-ui/data/videos.json').then(r=>{if(!r.ok)throw Error();return r.json()})}catch{videoData=null}}
 if(token!==routeVersion)return;
 const list=$('#classes-list'),videos=videoData?.[slug]||[];
 if(!videos.length){list.innerHTML=empty('No se pudieron cargar las clases de este curso.');return}
 const weeks=[...new Set(videos.map(v=>v.week).filter(Boolean))].sort((a,b)=>(Number(a)||0)-(Number(b)||0));
 list.innerHTML=(weeks.length?weeks:['']).map(w=>{const items=w?videos.filter(v=>v.week===w):videos;if(!items.length)return'';
  return `<div class="p-subhead"><h2>${w?'Semana '+esc(w):'Clases'}</h2><span>${items.length}</span></div><div class="p-grid three">${items.map(v=>`<button type="button" class="p-panel p-tile class-video" data-video="${esc(v.videoId)}" data-title="${esc(v.title)}" data-channel="${esc(v.channel)}"><span class="class-thumb"><img src="https://i.ytimg.com/vi/${esc(v.videoId)}/hqdefault.jpg" alt="" loading="lazy" width="320" height="180">${ui.icon('play')}</span><h3>${esc(v.title)}</h3><p>${esc(v.channel)}</p><span class="tile-foot">Ver vista previa${ui.icon('arrow-right')}</span></button>`).join('')}</div>`}).join('');
 $$('.class-video').forEach(b=>b.onclick=()=>openVideoPreview(b.dataset.video,b.dataset.title,b.dataset.channel));
}
function calculator(out){renderScore(out,data)}
function account(out){renderProfile(out,data,ui.openPreferences)}
export function startPlatform(api){ui=api;home=$('main');const shell=document.createElement('main');shell.id='platform';shell.className='platform';shell.hidden=true;shell.innerHTML='<aside class="side-rail"></aside><div class="platform-body"></div>';home.after(shell);view=$('.platform-body');const phone=document.createElement('a');phone.className='phone-nav';phone.href='/explorar';phone.textContent='Explorar toda la plataforma →';$('.hero-copy').append(phone);$('#search-dialog .dialog-foot').removeAttribute('data-en');$('#search-dialog .dialog-foot').textContent='Busca herramientas, materiales y recursos de estudio.';
 // Real local URLs also make Ctrl-click, copying links and opening new tabs work.
 const localize=()=>{$$('a[href]').forEach(a=>{if(a.hasAttribute('data-live'))return;let u;try{u=new URL(a.getAttribute('href'),location.origin)}catch{return}const p=u.pathname.replace(/\/$/,'').replace(/\.html$/,'')||'/';if(['universetostudy.com','www.universetostudy.com'].includes(u.hostname)&&routes[p]){a.setAttribute('href',p+u.search+u.hash);a.removeAttribute('target')}})};
 localize();new MutationObserver(localize).observe(document.body,{childList:true,subtree:true});
 $('.skip-link').addEventListener('click',e=>{e.preventDefault();const target=home.hidden?$('#page-title'):home;target?.scrollIntoView({behavior:'instant'});target?.focus({preventScroll:true})});
 const go=async(url)=>{$$('dialog[open]').forEach(d=>d.close());const u=new URL(url,location.origin);history.pushState({},'',u.pathname+u.search+u.hash);await route(true);scrollTo({top:0,behavior:'instant'});if(u.hash)setTimeout(()=>{try{$(u.hash)?.scrollIntoView({behavior:'instant'})}catch{}},60)};
 document.addEventListener('click',e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest('a');if(!a||a.hasAttribute('data-live')||a.hasAttribute('download'))return;const href=a.getAttribute('href');if(!href||href==='data:,')return;let u;try{u=new URL(href,location.href)}catch{return}if(u.origin!==location.origin&&!['universetostudy.com','www.universetostudy.com'].includes(u.hostname))return;const p=u.pathname.replace(/\/$/,'').replace(/\.html$/,'')||'/';if(p!=='/'&&!routes[p])return;e.preventDefault();if(p==='/'&&pathName()==='/'&&u.hash){$(u.hash)?.scrollIntoView({behavior:'smooth'});return}go(p+u.search+u.hash)});
 addEventListener('popstate',()=>route());route();return{navigate:go};
}
