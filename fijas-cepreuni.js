(function(){
  'use strict';

  var root=document.getElementById('fixed-app');
  var source=window.UNIVERSE_CEPRE_FIXED;
  if(!root||!source||!source.examTypes||!source.examTypes.length)return;

  var state={examType:source.examTypes[0].id,category:'Todos',course:'all',query:'',showAll:false,sort:'frequency'};
  var els={
    exam:document.getElementById('fixed-exam'),
    course:document.getElementById('fixed-course'),
    search:document.getElementById('fixed-search'),
    showAll:document.getElementById('fixed-show-all'),
    sort:document.getElementById('fixed-sort'),
    categories:document.getElementById('fixed-categories'),
    resultCount:document.getElementById('fixed-result-count'),
    courseNav:document.getElementById('fixed-course-nav'),
    top:document.getElementById('fixed-top-grid'),
    topDescription:document.getElementById('fixed-top-description'),
    tables:document.getElementById('fixed-tables'),
    note:document.getElementById('fixed-note'),
    kpiExams:document.getElementById('fixed-kpi-exams'),
    kpiExamsLabel:document.getElementById('fixed-kpi-exams-label'),
    kpiExamsNote:document.getElementById('fixed-kpi-exams-note'),
    kpiCourses:document.getElementById('fixed-kpi-courses'),
    kpiCoursesNote:document.getElementById('fixed-kpi-courses-note'),
    kpiTopics:document.getElementById('fixed-kpi-topics'),
    kpiTopicsNote:document.getElementById('fixed-kpi-topics-note'),
    kpiAppearances:document.getElementById('fixed-kpi-appearances'),
    kpiAppearancesNote:document.getElementById('fixed-kpi-appearances-note')
  };

  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]})}
  function plain(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function activeExam(){return source.examTypes.find(function(item){return item.id===state.examType})||source.examTypes[0]}
  function visibleCourses(){
    return activeExam().courses.filter(function(course){
      return (state.category==='Todos'||course.category===state.category)&&(state.course==='all'||course.slug===state.course);
    });
  }
  function visibleTopics(course){
    var query=plain(state.query.trim());
    var topics=course.topics.map(function(topic,index){return Object.assign({_order:index},topic)}).filter(function(topic){
      return (state.showAll||topic.total>0)&&(!query||plain(topic.name+' '+course.name).indexOf(query)>-1);
    });
    if(state.sort==='alpha')topics.sort(function(a,b){return a.name.localeCompare(b.name,'es')});
    if(state.sort==='frequency')topics.sort(function(a,b){return b.total-a.total||(b.cycles||0)-(a.cycles||0)||a._order-b._order});
    return topics;
  }
  function examMetrics(exam){
    var allTopics=[];
    exam.courses.forEach(function(course){allTopics=allTopics.concat(course.topics)});
    var positive=allTopics.filter(function(topic){return topic.total>0});
    var appearances=allTopics.reduce(function(total,topic){return total+topic.total},0);
    return {
      exams:exam.examCount||exam.periods.length,
      courses:exam.courses.length,
      topics:positive.length,
      allTopics:allTopics.length,
      appearances:appearances
    };
  }
  function renderExamOptions(){
    els.exam.innerHTML=source.examTypes.map(function(exam){
      var count=exam.examCount||exam.periods.length;
      return '<option value="'+esc(exam.id)+'">'+esc(exam.label)+' · '+count+' '+(exam.aggregateOnly?'pruebas':'ciclos')+'</option>';
    }).join('');
    els.exam.value=state.examType;
  }
  function renderContext(){
    var exam=activeExam();
    var metrics=examMetrics(exam);
    var categories=Array.from(new Set(exam.courses.map(function(course){return course.category}))).join(' y ');
    els.kpiExamsLabel.textContent=exam.aggregateOnly?'Pruebas analizadas':'Exámenes analizados';
    els.kpiExams.textContent=metrics.exams;
    els.kpiExamsNote.textContent=exam.aggregateOnly?exam.range:'Desde '+exam.periods[exam.periods.length-1]+' hasta '+exam.periods[0];
    els.kpiCourses.textContent=metrics.courses;
    els.kpiCoursesNote.textContent=categories;
    els.kpiTopics.textContent=metrics.topics;
    els.kpiTopicsNote.textContent=exam.aggregateOnly?'Clasificaciones temáticas de los seis bancos':'De '+metrics.allTopics+' temas revisados';
    els.kpiAppearances.textContent=metrics.appearances;
    els.kpiAppearancesNote.textContent=exam.aggregateOnly?'Preguntas históricas clasificadas':'Conteo total de preguntas';
    els.showAll.closest('label').hidden=!!exam.aggregateOnly;
    els.topDescription.textContent=exam.aggregateOnly?'Frecuencia acumulada entre '+exam.range+'. Presiona un tema para revisar su tabla y compararlo con los demás contenidos del curso.':'La lista se actualiza al buscar o filtrar. Presiona un tema para ir directamente a la tabla de su curso.';
    els.note.innerHTML=exam.aggregateOnly?'<strong>Prueba de selección:</strong> seis bancos temáticos reúnen '+metrics.appearances+' preguntas de Física, Química, Aritmética, Álgebra, Geometría y Trigonometría, identificadas en 19 pruebas entre 2011-2 y 2026-2. Una frecuencia alta orienta el repaso, pero no garantiza que el tema aparezca en la próxima evaluación.':'<strong>Examen final:</strong> datos CEPREUNI 2022-2, 2023-1, 2023-2, 2024-1, 2024-2, 2025-1, 2025-2 y 2026-1. Los conteos sirven como referencia histórica y no reemplazan el temario oficial.';
  }
  function renderCategories(){
    var categories=['Todos'].concat(Array.from(new Set(activeExam().courses.map(function(course){return course.category}))));
    els.categories.innerHTML=categories.map(function(category){return '<button type="button" class="fixed-filter-btn'+(category===state.category?' active':'')+'" data-category="'+esc(category)+'">'+esc(category)+'</button>'}).join('');
  }
  function renderCourseOptions(){
    var courses=activeExam().courses.filter(function(course){return state.category==='Todos'||course.category===state.category});
    if(state.course!=='all'&&!courses.some(function(course){return course.slug===state.course}))state.course='all';
    els.course.innerHTML='<option value="all">Todos los cursos</option>'+courses.map(function(course){return '<option value="'+esc(course.slug)+'">'+esc(course.name)+'</option>'}).join('');
    els.course.value=state.course;
  }
  function renderTop(){
    var topics=[];
    visibleCourses().forEach(function(course){
      visibleTopics(course).forEach(function(topic){if(topic.total>0)topics.push({course:course,topic:topic})});
    });
    topics.sort(function(a,b){return b.topic.total-a.topic.total||(b.topic.cycles||0)-(a.topic.cycles||0)});
    els.top.innerHTML=topics.slice(0,10).map(function(item,index){
      return '<button type="button" class="fixed-top-card" data-target="course-'+esc(item.course.slug)+'"><span class="fixed-top-rank">'+(index+1)+'</span><span><b>'+esc(item.topic.name)+'</b><small>'+esc(item.course.name)+' · '+item.topic.total+' apariciones</small></span></button>';
    }).join('')||'<div class="fixed-empty">No hay coincidencias para mostrar.</div>';
  }
  function renderCourseNav(courseRows){
    els.courseNav.innerHTML=courseRows.map(function(item){return '<button type="button" class="fixed-course-chip" data-target="course-'+esc(item.course.slug)+'">'+esc(item.course.name)+' · '+item.topics.length+'</button>'}).join('');
    els.courseNav.hidden=!courseRows.length;
  }
  function tableFor(course,topics,periods){
    var courseAppearances=topics.reduce(function(total,topic){return total+topic.total},0);
    var exam=activeExam();
    if(exam.aggregateOnly){
      var maxTotal=Math.max.apply(null,topics.map(function(topic){return topic.total}));
      var aggregateRows=topics.map(function(topic){
        var share=courseAppearances?Math.round(topic.total/courseAppearances*1000)/10:0;
        var average=Math.round(topic.total/(exam.examCount||1)*100)/100;
        var intensity=maxTotal?Math.round(topic.total/maxTotal*100):0;
        return '<tr><td>'+esc(topic.name)+'</td><td class="fixed-frequency"><b>'+topic.total+' apariciones</b><span class="fixed-frequency-track"><i style="--presence:'+intensity+'%"></i></span></td><td class="fixed-total">'+share+'%</td><td>'+average+'</td></tr>';
      }).join('');
      return '<section class="fixed-course" id="course-'+esc(course.slug)+'"><header class="fixed-course-head"><div><h2>'+esc(course.name)+'</h2><p>'+topics.length+' temas clasificados · '+courseAppearances+' preguntas · '+(Math.round(courseAppearances/exam.examCount*100)/100)+' por prueba</p></div><span class="fixed-course-badge">'+esc(course.category)+'</span></header><div class="fixed-table-wrap" tabindex="0" aria-label="Frecuencia histórica de '+esc(course.name)+'"><table class="fixed-table fixed-table-aggregate"><thead><tr><th>Tema</th><th>Apariciones</th><th>Peso del curso</th><th>Promedio por prueba</th></tr></thead><tbody>'+aggregateRows+'</tbody></table></div></section>';
    }
    var rows=topics.map(function(topic){
      var presence=Math.round((topic.cycles/periods.length)*100);
      var counts=topic.counts.map(function(count,index){
        return '<td class="fixed-hit" data-count="'+Math.min(count,4)+'" title="'+esc(periods[index])+': '+count+' pregunta'+(count===1?'':'s')+'">'+count+'</td>';
      }).join('');
      return '<tr><td>'+esc(topic.name)+'</td><td class="fixed-frequency"><b>'+topic.cycles+' de '+periods.length+' exámenes</b><span class="fixed-frequency-track"><i style="--presence:'+presence+'%"></i></span></td><td class="fixed-total">'+topic.total+'</td>'+counts+'</tr>';
    }).join('');
    return '<section class="fixed-course" id="course-'+esc(course.slug)+'"><header class="fixed-course-head"><div><h2>'+esc(course.name)+'</h2><p>'+topics.length+' temas visibles · '+courseAppearances+' apariciones en esta vista</p></div><span class="fixed-course-badge">'+esc(course.category)+'</span></header><div class="fixed-table-wrap" tabindex="0" aria-label="Tabla histórica de '+esc(course.name)+'"><table class="fixed-table"><thead><tr><th>Tema</th><th>Presencia</th><th>Total</th>'+periods.map(function(period){return '<th>'+esc(period)+'</th>'}).join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div></section>';
  }
  function renderTables(){
    var exam=activeExam();
    var courseRows=visibleCourses().map(function(course){return {course:course,topics:visibleTopics(course)}}).filter(function(item){return item.topics.length});
    var total=courseRows.reduce(function(sum,item){return sum+item.topics.length},0);
    els.resultCount.textContent=total+' tema'+(total===1?'':'s')+' visible'+(total===1?'':'s')+' en '+courseRows.length+' curso'+(courseRows.length===1?'':'s');
    renderCourseNav(courseRows);
    els.tables.innerHTML=courseRows.map(function(item){return tableFor(item.course,item.topics,exam.periods)}).join('')||'<div class="fixed-empty"><strong>No encontramos temas.</strong><br>Prueba con otro curso o borra la búsqueda.</div>';
  }
  function render(){renderContext();renderCategories();renderCourseOptions();renderTop();renderTables()}
  function scrollTarget(id){var target=document.getElementById(id);if(target)target.scrollIntoView({behavior:'smooth',block:'start'})}

  renderExamOptions();
  render();
  els.exam.addEventListener('change',function(){state.examType=this.value;state.category='Todos';state.course='all';state.showAll=false;els.showAll.checked=false;render()});
  els.course.addEventListener('change',function(){state.course=this.value;render()});
  els.search.addEventListener('input',function(){state.query=this.value;render()});
  els.showAll.addEventListener('change',function(){state.showAll=this.checked;render()});
  els.sort.addEventListener('change',function(){state.sort=this.value;render()});
  els.categories.addEventListener('click',function(event){var button=event.target.closest('[data-category]');if(!button)return;state.category=button.dataset.category;state.course='all';render()});
  els.courseNav.addEventListener('click',function(event){var button=event.target.closest('[data-target]');if(button)scrollTarget(button.dataset.target)});
  els.top.addEventListener('click',function(event){var button=event.target.closest('[data-target]');if(button)scrollTarget(button.dataset.target)});
})();
