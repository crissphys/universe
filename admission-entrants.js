(function(){
  'use strict';
  var data=window.UNIVERSE_ADMISSION_2026_2_ENTRANTS;if(!data)return;
  var nf0=new Intl.NumberFormat('es-PE',{maximumFractionDigits:0});
  var nf3=new Intl.NumberFormat('es-PE',{minimumFractionDigits:3,maximumFractionDigits:3});
  function id(value){return document.getElementById(value)}
  function safe(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function norm(value){return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
  function points(value){return nf3.format(Number(value||0))}
  function modalityLabel(value){var v=norm(value);if(v==='ordinario')return'Ordinario';if(v.indexOf('primeros puestos')>=0)return'Primeros puestos';if(v.indexOf('bachillerato internacional')>=0)return'Bachillerato Internacional';if(v.indexOf('plan integral de reparaciones')>=0)return'Plan Integral de Reparaciones';if(v.indexOf('personas con discapacidad')>=0)return'Personas con discapacidad';if(v.indexOf('deportistas calificados')>=0)return'Deportista calificado';return String(value||'Otra modalidad')}
  function setStats(){id('entrantApplicants').textContent=nf0.format(data.stats.ordinaryApplicants);id('entrantTotal').textContent=nf0.format(data.stats.allPublishedEntrants);id('entrantCount').textContent=nf0.format(data.stats.ordinaryEntrants);id('entrantOther').textContent=nf0.format(data.stats.otherEntrants);id('entrantFaculties').textContent=nf0.format(data.stats.faculties);id('entrantCareers').textContent=nf0.format(data.stats.careers)}
  function confetti(){
    if(document.documentElement.dataset.universeAnimations==='off')return;
    var colors=['#2563eb','#60a5fa','#f59e0b','#22c55e','#ec4899','#8b5cf6'];
    for(var i=0;i<110;i++){var piece=document.createElement('i');piece.className='entrant-confetti';piece.style.left=(Math.random()*100)+'vw';piece.style.background=colors[i%colors.length];piece.style.setProperty('--duration',(2.8+Math.random()*2.5)+'s');piece.style.setProperty('--drift',(-100+Math.random()*200)+'px');piece.style.animationDelay=(Math.random()*.5)+'s';document.body.appendChild(piece);setTimeout(function(node){node.remove()},6000,piece)}
  }
  function melody(){
    try{var AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;var context=new AudioContext();var notes=[523.25,659.25,783.99,1046.5,783.99,987.77];notes.forEach(function(freq,index){var oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime+index*.16;oscillator.type='sine';oscillator.frequency.value=freq;gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.07,start+.025);gain.gain.exponentialRampToValueAtTime(.0001,start+.24);oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start);oscillator.stop(start+.26)});setTimeout(function(){context.close()},1800)}catch(e){}
  }
  function celebrate(row){
    var card=id('entrantCelebration');card.hidden=false;
    id('entrantName').textContent=row.name;
    id('entrantCareer').textContent=row.career;
    id('entrantCode').textContent=row.code;
    id('entrantFaculty').textContent=row.facultyCode;
    id('entrantScore').textContent=points(row.score)+' pts';
    var modality=modalityLabel(row.modality);id('entrantModality').textContent=modality;
    id('entrantRank').textContent='#'+nf0.format(row.careerRank)+' en su carrera';
    var special=id('entrantSpecialScore');
    if(row.architectureScore!=null){special.hidden=false;special.querySelector('strong').textContent=points(row.architectureScore)+' PA'}else special.hidden=true;
    var route=modality==='Ordinario'?'por examen ordinario':'mediante la modalidad <strong>'+safe(modality)+'</strong>';
    id('entrantMessage').innerHTML='<p>Hoy celebramos una meta construida con constancia, disciplina y muchas horas de preparación. <strong>'+safe(row.name)+'</strong>, tu ingreso '+route+' a <strong>'+safe(row.career)+'</strong> reconoce todo ese esfuerzo y abre una nueva etapa llena de retos, aprendizaje y oportunidades.</p><p>Que este resultado sea el comienzo de una trayectoria universitaria que te permita crecer, aportar y transformar tu entorno. Disfruta este momento junto a las personas que te acompañaron: <strong>bienvenido a la Universidad Nacional de Ingeniería</strong>.</p><div class="entrant-message-signature"><img src="/assets/temario/uni-logo.png" alt="" width="30" height="38"><span><b>Universidad Nacional de Ingeniería</b><small>Lima, Perú</small></span></div>';
    card.scrollIntoView({behavior:'smooth',block:'center'});confetti();melody();
  }
  function findMatches(query){var q=norm(query);if(!q)return[];return data.rows.filter(function(row){return norm(row.code+' '+row.name).indexOf(q)>=0}).slice(0,12)}
  function renderMatches(matches){var box=id('entrantMatches');if(!matches.length){box.innerHTML='<div class="entrants-match"><span><b>No encontramos coincidencias</b><small>Revisa el nombre o código e inténtalo otra vez.</small></span></div>';return}if(matches.length===1){box.innerHTML='';celebrate(matches[0]);return}box.innerHTML=matches.map(function(row){return'<button type="button" class="entrants-match" data-code="'+safe(row.code)+'"><img class="entrants-match-logo" src="/assets/temario/uni-logo.png" alt="" width="28" height="35"><span><b>'+safe(row.name)+'</b><small>'+safe(row.code)+' · '+safe(row.career)+' · '+safe(modalityLabel(row.modality))+'</small></span><strong>'+points(row.score)+'</strong></button>'}).join('');box.querySelectorAll('[data-code]').forEach(function(button){button.onclick=function(){var row=data.rows.find(function(item){return item.code===button.dataset.code});if(row){box.innerHTML='';celebrate(row)}}})}
  function renderList(){
    var q=norm(id('entrantListSearch').value),faculty=id('entrantFacultyFilter').value,modality=id('entrantModalityFilter').value;
    var rows=data.rows.filter(function(row){return(!faculty||row.facultyCode===faculty)&&(!modality||row.modality===modality)&&(!q||norm(row.code+' '+row.name+' '+row.career+' '+row.modality).indexOf(q)>=0)});
    var groups={};rows.forEach(function(row){(groups[row.facultyCode]||(groups[row.facultyCode]={name:row.faculty,rows:[]})).rows.push(row)});
    id('entrantListCount').textContent=nf0.format(rows.length)+' ingresantes visibles';
    id('entrantDirectory').innerHTML=Object.keys(groups).sort().map(function(code){var group=groups[code],careers={};group.rows.forEach(function(row){(careers[row.career]||(careers[row.career]=[])).push(row)});return'<section class="faculty-group"><header><h3>'+safe(code)+' · '+safe(group.name)+'</h3><span>'+nf0.format(group.rows.length)+' ingresantes</span></header>'+Object.keys(careers).sort(function(a,b){return a.localeCompare(b,'es')}).map(function(career){return'<div class="career-group"><h4>'+safe(career)+' · '+nf0.format(careers[career].length)+'</h4>'+careers[career].map(function(row){return'<div class="entrant-list-row"><b>#'+nf0.format(row.careerRank)+'</b><span>'+safe(row.code)+'</span><strong>'+safe(row.name)+'</strong><em>'+safe(modalityLabel(row.modality))+'</em><span>'+points(row.score)+' pts</span></div>'}).join('')+'</div>'}).join('')+'</section>'}).join('')||'<p>No hay ingresantes que coincidan con el filtro.</p>';
  }
  function init(){
    setStats();
    var select=id('entrantFacultyFilter');select.innerHTML='<option value="">Todas las facultades</option>'+data.faculties.map(function(item){return'<option value="'+safe(item.code)+'">'+safe(item.code)+' · '+safe(item.name)+'</option>'}).join('');
    var modalitySelect=id('entrantModalityFilter'),modalities=[...new Set(data.rows.map(function(row){return row.modality}))].sort(function(a,b){return modalityLabel(a).localeCompare(modalityLabel(b),'es')});modalitySelect.innerHTML='<option value="">Todas las modalidades</option>'+modalities.map(function(value){return'<option value="'+safe(value)+'">'+safe(modalityLabel(value))+'</option>'}).join('');
    id('entrantSearchForm').addEventListener('submit',function(event){event.preventDefault();renderMatches(findMatches(id('entrantSearch').value))});
    id('entrantCelebrateAgain').addEventListener('click',function(){confetti();melody()});
    id('entrantListSearch').addEventListener('input',renderList);select.addEventListener('change',renderList);modalitySelect.addEventListener('change',renderList);renderList();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
