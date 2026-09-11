// CEPRE-UNI 2026-2 student guide, pp. 7–9. No personal records or API calls.
export const labels=['PC 1','PC 2','Primer parcial','PC 3','PC 4','Segundo parcial','PC 5','PC 6','PC 7','Examen final'];
const practices=[0,1,3,4,6,7],weighted=[[8,1],[2,2],[5,4],[9,6]];
const present=v=>v!==null&&v!==undefined&&v!=='';
export function grade(v,max=150){if(!present(v))return null;const n=Number(String(v).replace(',','.'));if(!Number.isFinite(n)||n<0||n>max)throw Error(`Cada nota debe estar entre 0 y ${max}.`);return n}
function best(values,n,max){const known=values.filter(present).sort((a,b)=>b-a).slice(0,n);return {sum:known.reduce((a,b)=>a+b,0),max:known.length*max}}
export function computeScore(values,architecture=false,vocational=[]){
 const g=labels.map((_,i)=>grade(values[i])),s=best(practices.map(i=>g[i]),5,150);
 let points=s.sum,possible=s.max;
 for(const [i,w] of weighted)if(present(g[i])){points+=g[i]*w;possible+=150*w}
 let sv=0,pvd=null;
 if(architecture){const v=Array.from({length:6},(_,i)=>grade(vocational[i],90)),b=best(v,5,90);sv=b.sum;pvd=grade(vocational[6],200);points+=1.54*(sv+(pvd??0));possible+=1.54*(b.max+(pvd===null?0:200))}
 const complete=g.every(present)&&(!architecture||vocational.length===7&&vocational.every(present));
 const maximum=architecture?3701:2700;
 return {points,possible,maximum,complete,normalized:possible?points/possible*20:null,final20:complete?points/maximum*20:null,s:s.sum+(g[8]??0),sv,pvd,entered:g.filter(present).length};
}
export function projectScore(values,architecture,vocational,percent){
 const p=grade(percent,100)/100;
 return computeScore(labels.map((_,i)=>present(values[i])?values[i]:150*p),architecture,Array.from({length:7},(_,i)=>present(vocational[i])?vocational[i]:(i===6?200:90)*p));
}
export function requiredPercent(values,architecture,vocational,target20){
 if(projectScore(values,architecture,vocational,100).final20<target20)return null;
 if(projectScore(values,architecture,vocational,0).final20>=target20)return 0;
 let lo=0,hi=100;for(let i=0;i<48;i++){const mid=(lo+hi)/2;if(projectScore(values,architecture,vocational,mid).final20<target20)lo=mid;else hi=mid}return hi;
}
export function historyRows(cutoffs,career,site){return Object.entries(cutoffs).filter(([k])=>k.endsWith('|'+site)).map(([k,v])=>({cycle:k.split('|')[0],label:v.label,range:v.values[career]||[null,null],source:v.source})).sort((a,b)=>b.cycle.localeCompare(a.cycle))}
export function cutoffMean(rows){const a=rows.map(r=>r.range[0]).filter(n=>typeof n==='number'&&Number.isFinite(n));return a.length?{mean:a.reduce((x,y)=>x+y,0)/a.length,count:a.length}:null}
