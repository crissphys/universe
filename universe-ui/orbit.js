// A lightweight 3D orbital instrument, projected into a 2D canvas.
// One animation loop, intersection-gated, no external textures or extra WebGL context.
export const orbitHTML=()=>'<div class="orbital-instrument" aria-label="Núcleo de conocimiento: esfera y conexiones orbitales animadas" role="img"><canvas class="orbital-canvas"></canvas><span class="orbital-coordinate">UNIVERSE / NÚCLEO 01</span><span class="orbital-caption">Todo está conectado.</span></div>';
let cleanup=()=>{};
export function mountOrbits(){cleanup();const canvases=[...document.querySelectorAll('.orbital-canvas')];if(!canvases.length)return;
 let frame=0,t=0,last=0,visible=true;const small=matchMedia('(max-width:760px)').matches,ratio=Math.min(devicePixelRatio,1.5);
 const nodes=Array.from({length:900},(_,i)=>{const y=1-2*(i+.5)/900,a=i*2.399963,r=Math.sqrt(1-y*y);return [r*Math.cos(a),y,r*Math.sin(a)]});
 const contexts=canvases.map(c=>{c.width=620*ratio;c.height=460*ratio;return c.getContext('2d')});
 const visibleCanvases=new Set();const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)visibleCanvases.add(e.target);else visibleCanvases.delete(e.target)});visible=visibleCanvases.size>0;if(visible&&!frame)frame=requestAnimationFrame(draw)},{rootMargin:'100px'});canvases.forEach(c=>observer.observe(c));
 const turn=(p,a,b)=>{const x=p[0]*Math.cos(a)-p[2]*Math.sin(a),z=p[0]*Math.sin(a)+p[2]*Math.cos(a);return [x,p[1]*Math.cos(b)-z*Math.sin(b),p[1]*Math.sin(b)+z*Math.cos(b)]};
 const sparks=Array.from({length:70},()=>({x:(Math.random()*2-1)*300,y:(Math.random()*2-1)*225,r:Math.random()*1.3+.3,p:Math.random()*Math.PI*2,s:Math.random()*.6+.5}));
 function paint(ctx){const light=document.documentElement.dataset.theme==='light';ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,620,460);ctx.save();ctx.translate(310,226);const blue=light?'40,68,120':'178,204,255',white=light?'30,40,65':'255,255,255',gold=light?'170,120,40':'255,208,140';
 // Deep-space backdrop glow: cool core with a faint warm rim, echoing the galaxy's palette.
 const halo=ctx.createRadialGradient(0,0,30,0,0,225);halo.addColorStop(0,`rgba(${blue},.22)`);halo.addColorStop(.45,`rgba(${blue},.09)`);halo.addColorStop(1,`rgba(${blue},0)`);ctx.fillStyle=halo;ctx.fillRect(-310,-230,620,460);
 const rim=ctx.createRadialGradient(0,0,80,0,0,145);rim.addColorStop(0,`rgba(${gold},0)`);rim.addColorStop(.82,`rgba(${gold},.05)`);rim.addColorStop(1,`rgba(${gold},0)`);ctx.fillStyle=rim;ctx.fillRect(-310,-230,620,460);
 for(const s of sparks){const tw=.35+.65*Math.abs(Math.sin(t*s.s+s.p));ctx.fillStyle=`rgba(${white},${tw*.55})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}
 // Project each orbital plane, drawing the far half behind the globe.
 const paths=[0,1,2].map((ring)=>Array.from({length:241},(_,j)=>{const a=j/240*Math.PI*2;return turn([Math.cos(a)*(174+ring*13),0,Math.sin(a)*(174+ring*13)],ring*.83+t*.07,.35+ring*.71)}));
 function rings(front){paths.forEach((pts,k)=>{const glowPass=()=>{ctx.beginPath();let pen=false;pts.forEach(([x,y,z])=>{const on=(z>0)===front;if(on){if(pen)ctx.lineTo(x,y);else ctx.moveTo(x,y)}pen=on});ctx.stroke()};
  ctx.strokeStyle=`rgba(${blue},${front?.16:.05})`;ctx.lineWidth=k===1?4:3;glowPass();
  ctx.strokeStyle=`rgba(${blue},${front?.55:.16})`;ctx.lineWidth=k===1?1.2:.85;glowPass()})}
 rings(false);
 const globe=ctx.createRadialGradient(-38,-42,4,8,12,104);globe.addColorStop(0,light?'#e4ecfb':'#5670a6');globe.addColorStop(.32,light?'#b9c8e6':'#243252');globe.addColorStop(.7,light?'#93a8cc':'#0d1220');globe.addColorStop(1,light?'#5f78a8':'#05070c');ctx.fillStyle=globe;ctx.beginPath();ctx.arc(0,0,96,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.beginPath();ctx.arc(0,0,95,0,Math.PI*2);ctx.clip();
 for(const p of nodes){const [x,y,z]=turn(p,t*.16,-.32);if(z<0)continue;const d=1+.12*z;ctx.fillStyle=`rgba(${white},${.1+z*.75})`;ctx.beginPath();ctx.arc(x*95,y*95,d*.75,0,Math.PI*2);ctx.fill()}
 // Fine meridians and parallels rotate with the sphere instead of a flat CSS disc.
 for(let k=0;k<10;k++){ctx.beginPath();let pen=false;for(let j=0;j<=90;j++){const b=-Math.PI/2+j/90*Math.PI,a=k/10*Math.PI*2+t*.16,[x,y,z]=turn([Math.cos(b)*Math.cos(a),Math.sin(b),Math.cos(b)*Math.sin(a)],0,-.32);if(z>0){if(pen)ctx.lineTo(x*95,y*95);else ctx.moveTo(x*95,y*95)}pen=z>0}ctx.strokeStyle=`rgba(${blue},.14)`;ctx.lineWidth=.5;ctx.stroke()}
 ctx.restore();
 // A thin bright limb light along the globe's rim for a more physical, lit sphere.
 ctx.save();ctx.beginPath();ctx.arc(0,0,95.5,0,Math.PI*2);ctx.lineWidth=2.4;ctx.strokeStyle=`rgba(${blue},.4)`;ctx.stroke();ctx.restore();
 rings(true);
 paths.forEach((pts,k)=>{const idx=((t*(.024+k*.009)+k*.3)%1)*240,head=Math.floor(idx);
  for(let trail=5;trail>=0;trail--){const p=pts[(head-trail+240)%240];if(p[2]<0&&Math.hypot(p[0],p[1])<98)continue;const [x,y]=p,a=1-trail/6;ctx.fillStyle=trail===0?`rgb(${white})`:`rgba(${gold},${a*.55})`;if(trail===0){ctx.shadowColor=`rgb(${gold})`;ctx.shadowBlur=18}ctx.beginPath();ctx.arc(x,y,(k===0?3.6:2.4)*(trail===0?1:.55*a+.2),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
  const [hx,hy]=pts[head];ctx.strokeStyle=`rgba(${blue},.3)`;ctx.beginPath();ctx.arc(hx,hy,9,0,Math.PI*2);ctx.stroke()});
 ctx.strokeStyle=`rgba(${blue},.16)`;ctx.lineWidth=.5;for(const x of [-270,270]){ctx.beginPath();ctx.moveTo(x-7,0);ctx.lineTo(x+7,0);ctx.moveTo(x,-7);ctx.lineTo(x,7);ctx.stroke()}ctx.restore();
 }
 function draw(now){frame=0;if(!visible||document.hidden)return;const motion=!document.documentElement.classList.contains('motion-off');if(!small||now-last>30||!last){if(last&&motion)t+=Math.min((now-last)/1000,.05);contexts.forEach(paint);last=now}if(motion)frame=requestAnimationFrame(draw)}
 const wake=()=>{if(!document.hidden&&!frame)frame=requestAnimationFrame(draw)};document.addEventListener('visibilitychange',wake);frame=requestAnimationFrame(draw);
 const preferences=new MutationObserver(wake);preferences.observe(document.documentElement,{attributes:true,attributeFilter:['class','data-theme']});
 cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();preferences.disconnect();document.removeEventListener('visibilitychange',wake)};
}
