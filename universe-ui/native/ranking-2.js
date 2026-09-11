
(function(){
  var historyNode=document.getElementById('ranking-v3-history-data');
  var rankingNode=document.getElementById('cepre2026-ranking-data');
  var body=document.getElementById('ranking-v3-history-body');
  var note=document.getElementById('ranking-v3-history-note');
  if(!historyNode||!rankingNode||!body||!note)return;
  var history={},ranking=[];
  try{history=JSON.parse(historyNode.textContent||'{}');ranking=JSON.parse(rankingNode.textContent||'[]');}catch(e){return;}
  var official=window.UNIVERSE_CEPRE_2026_2||{},examScores=official.examScores||{},finalScores=official.finalScores||{};
  var scoreColumns={pc1:2,pc2:3,pc3:4,pc4:5,pc5:6,pc6:7,pc7:8,ep1:9,ep2:10};
  if(official.ranges){history['2026-2']={Lima:official.ranges.Lima||[],Juliaca:official.ranges.Juliaca||[]};}
  ranking.forEach(function(row){
    Object.keys(scoreColumns).forEach(function(key){var scores=examScores[key]||{};if(Object.prototype.hasOwnProperty.call(scores,row[1]))row[scoreColumns[key]]=Number(scores[row[1]]);});
    var finals=examScores.ef||finalScores;row[14]=Object.prototype.hasOwnProperty.call(finals,row[1])?Number(finals[row[1]]):0;
    var pcs=row.slice(2,8).map(Number).sort(function(a,b){return b-a;}).slice(0,5);
    row[11]=(pcs.reduce(function(total,value){return total+value;},0)+Number(row[8]||0)+2*Number(row[9]||0)+4*Number(row[10]||0)+6*row[14])/18;
  });
  var supplied2025=window.UNIVERSE_CEPRE_HISTORY_2025_2;
  if(supplied2025&&Array.isArray(supplied2025.rows)){
    history[supplied2025.cycle]={};
    history[supplied2025.cycle][supplied2025.site]=supplied2025.rows;
  }
  function projectedRows(siteName){
    var ordered=['2024-2','2025-2','2026-1','2026-2'];
    var latest=(history['2026-2']&&history['2026-2'][siteName])||[];
    return latest.map(function(base){
      var code=base[1],series=[];
      ordered.forEach(function(key){var rows=history[key]&&history[key][siteName]||[];var row=rows.find(function(item){return item[1]===code});if(row&&Number.isFinite(Number(row[3]))&&Number.isFinite(Number(row[4])))series.push(row)});
      if(!series.length)return base.slice();
      var first=series[0],last=series[series.length-1],steps=Math.max(1,series.length-1);
      var minTrend=Math.max(-.7,Math.min(.7,(Number(last[3])-Number(first[3]))/steps*.55));
      var maxTrend=Math.max(-.8,Math.min(.8,(Number(last[4])-Number(first[4]))/steps*.55));
      var projectedMin=Math.max(0,Math.min(20,Number(last[3])+.2+minTrend));
      var projectedMax=Math.max(projectedMin,Math.min(20,Number(last[4])+.15+maxTrend));
      return[base[0],base[1],base[2],Number(projectedMin.toFixed(3)),Number(projectedMax.toFixed(3)),base[5],null];
    });
  }
  history['2027-1']={Lima:projectedRows('Lima'),Juliaca:projectedRows('Juliaca')};
  var cycle='2026-2',site='Lima';
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function fmt(v){return Number.isFinite(Number(v))?Number(v).toFixed(3):'—';}
  function currentBenchmark(){
    var complete=ranking.filter(function(r){
      var firstSix=r.slice(2,8).filter(function(v){return Number(v)>0;}).length;
      return r[12]===site&&firstSix>=5&&Number(r[8])>0&&Number(r[9])>0&&Number(r[10])>0&&Number(r[14])>0;
    });
    var average=complete.length?complete.reduce(function(sum,r){return sum+Number(r[11]||0);},0)/complete.length/7.5:0;
    var top=complete.length?complete.reduce(function(best,r){return !best||Number(r[11])>Number(best[11])?r:best;},null):null;
    return{average:average,top:top,count:complete.length};
  }
  function range(row,current){
    var min=Number(row[3]),max=Number(row[4]),hasMin=Number.isFinite(min),hasMax=Number.isFinite(max);
    if(!hasMax)return'<span class="ranking-v3-no-admission">Sin ingresantes</span>';
    var left=(hasMin?min:max)/20*100,width=Math.max(hasMin?(max-min)/20*100:1.5,1.5),marker=Math.max(0,Math.min(100,current/20*100));
    return'<div class="ranking-v3-range" title="Promedio 2026-2: '+fmt(current)+'"><i style="left:'+left+'%;width:'+width+'%"></i><b style="left:'+marker+'%"></b></div>';
  }
  function rowHTML(row,current){
    return'<tr><td><span class="ranking-v3-faculty">'+esc(row[0])+'</span><strong>'+esc(row[1])+'</strong></td><th scope="row">'+esc(row[2])+'</th><td>'+(row[5]==null?'Sin ingresantes':esc(row[5]))+'</td><td><span class="ranking-v3-unpublished">No publicado</span></td><td>'+fmt(row[3])+'</td><td>'+fmt(row[4])+'</td><td>'+range(row,current)+'</td></tr>';
  }
  function render(){
    var rows=history[cycle]&&history[cycle][site]?history[cycle][site]:[];
    var benchmark=currentBenchmark();
    document.getElementById('ranking-v3-current-average').textContent=benchmark.count?fmt(benchmark.average)+'/20':'—';
    document.getElementById('ranking-v3-current-average-copy').textContent=benchmark.count.toLocaleString('es-PE')+' estudiantes con datos suficientes para el ponderado';
    document.getElementById('ranking-v3-current-top').textContent=benchmark.top?fmt(Number(benchmark.top[11])/7.5)+'/20':'—';
    document.getElementById('ranking-v3-current-top-copy').textContent=benchmark.top?'Código '+benchmark.top[1]:'Sin datos completos';
    document.getElementById('ranking-v3-history-context').textContent=cycle+' · '+site;
    var entrants=document.getElementById('ranking-v3-history-entrants');
    var entrantsCopy=document.getElementById('ranking-v3-history-entrants-copy');
    if(cycle==='2027-1'){
      entrants.textContent='Proyección';
      entrantsCopy.textContent='Aún no existen ingresantes oficiales para este ciclo';
    }else if(cycle==='2026-2'&&official.entrantCount){
      entrants.textContent=Number(official.entrantCount[site]||0).toLocaleString('es-PE')+' CEPREUNI';
      entrantsCopy.textContent=Number(official.evaluated&&official.evaluated[site]||0).toLocaleString('es-PE')+' evaluados en '+site;
    }else if(cycle==='2025-2'&&supplied2025){
      entrants.textContent=supplied2025.officialEntrants.toLocaleString('es-PE')+' CEPREUNI';
      entrantsCopy.textContent=supplied2025.ordinaryEntrants.toLocaleString('es-PE')+' por examen ordinario';
    }else{
      var detailed=rows.reduce(function(total,row){return total+(Number(row[5])||0);},0);
      entrants.textContent=detailed?detailed.toLocaleString('es-PE'):'—';
      entrantsCopy.textContent=detailed?'Suma del desglose disponible':'Sin total oficial incorporado';
    }
    body.innerHTML=rows.length?rows.map(function(r){return rowHTML(r,benchmark.average);}).join(''):'<tr><td colspan="7" class="ranking-v3-history-empty">Las capturas proporcionadas no incluyen datos de '+esc(site)+' para el ciclo '+esc(cycle)+'.</td></tr>';
    if(cycle==='2027-1'){
      note.innerHTML='<strong>2027-1 es una proyección referencial:</strong> combina los rangos recientes disponibles, atenúa cambios extremos y añade un margen moderado. No representa un corte oficial ni garantiza una vacante.';
    }else if(cycle==='2026-2'&&official.source){
      note.innerHTML='<strong>2026-2:</strong> los mínimos, máximos e ingresantes provienen de la asignación oficial de vacantes. La fuente pública no incluye la carrera elegida por quienes no ingresaron, por eso “postulantes por carrera” se muestra como no publicado y no como una estimación. <a href="'+esc(official.source)+'" target="_blank" rel="noopener">Ver publicación oficial</a>.';
    }else if(cycle==='2025-2'&&rows.length&&supplied2025){
      note.innerHTML='<strong>2025-2:</strong> '+supplied2025.officialEntrants.toLocaleString('es-PE')+' ingresantes CEPREUNI y '+supplied2025.ordinaryEntrants.toLocaleString('es-PE')+' ingresantes por examen ordinario. La tabla proporcionada distribuye '+supplied2025.listedVacancies.toLocaleString('es-PE')+' vacantes; el total CEPREUNI no se repartió artificialmente por carrera. <a href="'+esc(supplied2025.officialSource)+'" target="_blank" rel="noopener">Ver estadística oficial</a>.';
    }else{
      note.textContent=rows.length?'La línea azul marca el promedio final 2026-2 de la sede elegida; la franja celeste representa el mínimo y máximo histórico.':'Selecciona otra combinación de ciclo y sede para consultar la información disponible.';
    }
  }
  document.querySelectorAll('[data-history-cycle]').forEach(function(button){button.addEventListener('click',function(){cycle=button.dataset.historyCycle;document.querySelectorAll('[data-history-cycle]').forEach(function(b){b.setAttribute('aria-pressed',String(b===button));});render();});});
  document.querySelectorAll('[data-history-site]').forEach(function(button){button.addEventListener('click',function(){site=button.dataset.historySite;document.querySelectorAll('[data-history-site]').forEach(function(b){b.setAttribute('aria-pressed',String(b===button));});render();});});
  render();
})();
    