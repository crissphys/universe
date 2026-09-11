
(function(){
  var dataNode=document.getElementById('cepre2026-ranking-data');
  var table=document.getElementById('cepre2026-cepre-v2-table');
  var body=document.getElementById('cepre2026-cepre-v2-body');
  var input=document.getElementById('cepre2026-cepre-v2-search');
  var summary=document.getElementById('cepre2026-cepre-v2-summary');
  var stats=document.getElementById('cepre2026-cepre-v2-stats');
  if(!dataNode||!table||!body||!input||!summary||!stats)return;
  var data=[];
  try{data=JSON.parse(dataNode.textContent||'[]');}catch(e){data=[];}
  var official=window.UNIVERSE_CEPRE_2026_2||{},examScores=official.examScores||{},finalScores=official.finalScores||{};
  var scoreColumns={pc1:2,pc2:3,pc3:4,pc4:5,pc5:6,pc6:7,pc7:8,ep1:9,ep2:10};
  function finalAverage(row){
    var pcs=row.slice(2,8).map(Number).sort(function(a,b){return b-a;}).slice(0,5);
    var points=pcs.reduce(function(total,value){return total+value;},0)+Number(row[8]||0)+2*Number(row[9]||0)+4*Number(row[10]||0)+6*Number(row[14]||0);
    return points/18;
  }
  data.forEach(function(row){
    Object.keys(scoreColumns).forEach(function(key){var scores=examScores[key]||{};if(Object.prototype.hasOwnProperty.call(scores,row[1]))row[scoreColumns[key]]=Number(scores[row[1]]);});
    var finals=examScores.ef||finalScores;if(Object.prototype.hasOwnProperty.call(finals,row[1]))row[14]=Number(finals[row[1]]);else row[14]=0;
    var lowest=0;for(var pc=1;pc<6;pc++)if(Number(row[2+pc])<Number(row[2+lowest]))lowest=pc;row[13]=lowest;
    row[11]=finalAverage(row);
  });
  data.sort(function(a,b){return Number(b[11])-Number(a[11])||String(a[1]).localeCompare(String(b[1]));});
  data.forEach(function(row,index){row[0]=index+1;});
  var limit=420, showAll=false, activeSede='';
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function fmt(v){return Number(v||0).toFixed(3);}
  function cell(v,discard){var n=Number(v||0), cls=[]; if(!n)cls.push('cepre-v2-missing'); if(discard)cls.push('cepre-v2-discarded'); return '<td'+(cls.length?' class="'+cls.join(' ')+'"':'')+'>'+fmt(n)+'</td>';}
  function rowHTML(r){
    var out='<tr><td class="cepre-v2-position">'+esc(r[0])+'</td><th scope="row">'+esc(r[1])+'</th>';
    for(var i=0;i<7;i++)out+=cell(r[2+i], i<6&&r[13]===i);
    out+=cell(r[9], false)+cell(r[10], false)+cell(r[14], false)+'<td>'+fmt(r[11])+'</td><td>'+esc(r[12]||'Lima')+'</td></tr>';
    return out;
  }
  function filtered(){
    var q=(input.value||'').trim().toUpperCase();
    var site=activeSede;
    return data.filter(function(r){return (!site||r[12]===site)&&(!q||String(r[1]).toUpperCase().indexOf(q)>-1||String(r[12]).toUpperCase().indexOf(q)>-1);});
  }
  function renderStats(){
    var rows=activeSede?data.filter(function(r){return r[12]===activeSede;}):data;
    var exams=[
      ['1.ª PC',2],['2.ª PC',3],['3.ª PC',4],['4.ª PC',5],['5.ª PC',6],
      ['6.ª PC',7],['7.ª PC',8],['EP1',9],['EP2',10],['Examen final',14]
    ];
    var items=exams.map(function(exam){
      var registered=rows.filter(function(row){return Number(row[exam[1]]||0)>0;});
      var best=registered.reduce(function(top,row){
        var score=Number(row[exam[1]]||0);
        return !top||score>Number(top[exam[1]]||0)||(score===Number(top[exam[1]]||0)&&String(row[1])<String(top[1]))?row:top;
      },null);
      var average=registered.length?registered.reduce(function(sum,row){return sum+Number(row[exam[1]]||0);},0)/registered.length:0;
      return '<article class="cepre-v2-stat"><div><span>'+esc(exam[0])+'</span><small>Promedio '+(registered.length?fmt(average):'—')+'</small></div><div><strong>'+(best?fmt(best[exam[1]]):'—')+'</strong><em>'+esc(best?best[1]:'Sin registros')+'</em></div></article>';
    }).join('');
    stats.innerHTML=items;
  }
  function render(){
    var rows=filtered();
    var visible=showAll?rows:rows.slice(0,limit);
    if(!visible.length){body.innerHTML='<tr><td colspan="14" class="cepre-v2-empty">No se encontraron códigos con ese filtro.</td></tr>';}
    else{body.innerHTML=visible.map(rowHTML).join('');}
    var msg='Mostrando '+visible.length.toLocaleString('es-PE')+' de '+rows.length.toLocaleString('es-PE')+' códigos';
    if(activeSede)msg+=' · sede '+activeSede;
    msg+=' · orden descendente por promedio final con examen final ×6.';
    if(rows.length>limit&&!showAll)msg+=' <button class="cepre-v2-show-all" type="button">Mostrar todo</button>';
    summary.innerHTML=msg;
  }
  input.addEventListener('input',function(){showAll=false;render();});
  var buttons=document.querySelectorAll('.cepre-v2-site-button');
  for(var b=0;b<buttons.length;b++)buttons[b].addEventListener('click',function(){
    activeSede=this.getAttribute('data-sede')||''; table.setAttribute('data-sede',activeSede);
    for(var j=0;j<buttons.length;j++)buttons[j].setAttribute('aria-pressed','false');
    this.setAttribute('aria-pressed','true'); showAll=false; renderStats(); render();
  });
  summary.addEventListener('click',function(ev){if(ev.target&&ev.target.classList.contains('cepre-v2-show-all')){showAll=true;render();}});
  renderStats();
  render();
})();
      