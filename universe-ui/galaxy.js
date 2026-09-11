import * as THREE from './vendor/three.module.min.js';
import {createExplorer} from './galaxy-navigation.js';

// A generated spiral galaxy: local geometry and shaders, no textures, video, or API.
export async function createGalaxy(canvas,initial){
  const lowMemory=navigator.deviceMemory&&navigator.deviceMemory<=4;
  let settings={...initial},renderer=null,frame=0,last=0,time=0,progress=0,targetProgress=0,immersive=false,disposed=false,dirty=true,quality='';
  let pointerX=0,pointerY=0,px=0,py=0,frames=0,slowFrames=0,autoReduced=false;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(47,innerWidth/innerHeight,.1,160);
  const galaxy=new THREE.Group();scene.add(galaxy);
  const look=new THREE.Vector3();
  let stars,dust,background,core,halo,materials=[];
  let seed=74023;
  function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  function signed(scale){return (rand()<.5?-1:1)*Math.pow(rand(),2.7)*scale}
  const vertex=`attribute float aSize; attribute float aSeed; varying vec3 vColor; varying float vSeed; uniform float uTime; uniform float uPixelRatio; uniform float uCloud;
  void main(){vColor=color;vSeed=aSeed;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float twinkle=0.9+0.1*sin(uTime*.45+aSeed*60.);gl_PointSize=clamp(aSize*uPixelRatio*(125./max(1.,-mv.z))*twinkle,1.,uCloud>0.5?100.:10.);}`;
  const fragment=`varying vec3 vColor; varying float vSeed; uniform float uOpacity; uniform float uCloud;
  void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);if(d>.5)discard;float strength=uCloud>.5?exp(-d*d*22.)*smoothstep(.5,.12,d):pow(max(0.,1.-d*2.),3.);gl_FragColor=vec4(vColor,strength*uOpacity);}`;
  function pointMaterial(cloud,opacity){const m=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{uTime:{value:0},uPixelRatio:{value:1},uCloud:{value:cloud?1:0},uOpacity:{value:opacity}},vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});materials.push(m);return m}
  function spiral(count,cloud=false){
    const positions=new Float32Array(count*3),colors=new Float32Array(count*3),sizes=new Float32Array(count),seeds=new Float32Array(count);
    const center=new THREE.Color('#fff1e6'),outside=new THREE.Color('#8596bd'),c=new THREE.Color();
    for(let i=0;i<count;i++){
      const radius=Math.pow(rand(),.8)*11.5+.035,branch=(i%4)/4*Math.PI*2,angle=radius<.85?rand()*Math.PI*2:branch+radius*.78;
      const spread=Math.max(.09,(cloud?.42:.28)*radius);
      positions[i*3]=Math.cos(angle)*radius+signed(spread);
      positions[i*3+1]=signed(Math.max(.06,.14*Math.sqrt(radius)));
      positions[i*3+2]=Math.sin(angle)*radius+signed(spread);
      c.copy(center).lerp(outside,Math.min(1,radius/10));if(rand()>.82)c.set('#ffffff');
      colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;
      sizes[i]=cloud?4+rand()*7:.12+Math.pow(rand(),3)*.75;seeds[i]=rand();
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));geometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
    const points=new THREE.Points(geometry,pointMaterial(cloud,cloud?.042:.85));galaxy.add(points);return points;
  }
  function starfield(count){const p=new Float32Array(count*3);for(let i=0;i<count;i++){p[i*3]=(rand()-.5)*110;p[i*3+1]=(rand()-.5)*80;p[i*3+2]=(rand()-.5)*100}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));const m=new THREE.PointsMaterial({color:'#dbe4ff',size:.043,transparent:true,opacity:.58,sizeAttenuation:true,depthWrite:false});const points=new THREE.Points(g,m);scene.add(points);return points}
  function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,248,235,.9)');g.addColorStop(.04,'rgba(255,246,233,.7)');g.addColorStop(.17,'rgba(207,218,244,.19)');g.addColorStop(.45,'rgba(107,137,200,.038)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
  const texture=glowTexture();core=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.8}));core.scale.set(5,5,1);galaxy.add(core);halo=new THREE.Sprite(core.material.clone());halo.scale.set(17,9,1);halo.material.opacity=.35;galaxy.add(halo);
  const explorer=createExplorer({canvas,camera,galaxy,wake,texture});
  function remove(points){if(!points)return;points.parent?.remove(points);points.geometry.dispose();points.material.dispose()}
  function level(){return settings.quality==='high'?'high':settings.quality==='low'?'low':innerWidth<760||lowMemory||autoReduced?'low':'high'}
  function build(){const q=level();if(q===quality)return;quality=q;remove(stars);remove(dust);remove(background);materials=[];seed=74023;stars=spiral(q==='high'?26000:8500);dust=spiral(q==='high'?3200:900,true);background=starfield(q==='high'?1500:550);document.body.dataset.quality=q;resize()}
  function resize(){if(!renderer)return;if(level()!==quality){build();return}renderer.setPixelRatio(Math.min(devicePixelRatio||1,quality==='high'?1.5:1));renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();materials.forEach(m=>m.uniforms.uPixelRatio.value=renderer.getPixelRatio());dirty=true;wake()}
  function updateCamera(){const mobile=innerWidth<760;
    const t=progress;
    camera.position.set((mobile?0:-1)+Math.sin(t*Math.PI*1.6)*4+px*.45,11-t*4+py*.35,21-t*5);
    look.set(0,0,0);camera.lookAt(look);
    galaxy.position.set(mobile?0:5-t*8,mobile?2.3:1.1-t*2,0);
    galaxy.rotation.set(.10+t*.55,Math.PI*.1+time*.014+t*1.7,-.27+t*.5);
    if(immersive){galaxy.position.x*=.15;galaxy.position.y=0;camera.position.z-=2}
    background.rotation.y=time*.002+t*.07;
    const shade=settings.theme==='light'?.8:1;materials.forEach(m=>{m.uniforms.uTime.value=time;if(m===stars.material)m.uniforms.uOpacity.value=.85*shade});
    canvas.dataset.scroll=progress.toFixed(3);
  }
  function draw(now){frame=0;if(disposed||document.hidden||settings.quality==='off'||!renderer)return;
    const elapsed=last?now-last:16;last=now;
    if(settings.motion&&elapsed<250)time+=Math.min(elapsed,45)/1000;
    const lerp=settings.motion?.045:0;
    progress+=(targetProgress-progress)*lerp;px+=(pointerX-px)*.04;py+=(pointerY-py)*.04;
    if(!explorer.update(now,settings.motion))updateCamera();renderer.render(scene,camera);dirty=false;
    if(settings.motion&&settings.quality==='auto'&&!autoReduced&&quality==='high'&&frames++>40){if(elapsed>38&&elapsed<250)slowFrames++;if(frames>160){if(slowFrames>80){autoReduced=true;build()}frames=0;slowFrames=0}}
    const moving=immersive||settings.motion||Math.abs(progress-targetProgress)>.001;
    if(moving&&!frame)frame=requestAnimationFrame(draw);
  }
  function wake(){if(!frame&&!document.hidden&&renderer&&settings.quality!=='off')frame=requestAnimationFrame(draw)}
  function initRenderer(){if(renderer)return;renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});renderer.setClearColor('#060608',0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.debug.onShaderError=()=>{document.body.dataset.space='fallback';document.getElementById('scene-status').textContent='FONDO LIGERO';settings.quality='off'};build();renderer.compile(scene,camera);document.body.dataset.space='ready';}
  function configure(next){settings={...settings,...next};if(!['off','low','high','auto'].includes(settings.quality))settings.quality='auto';if(settings.quality==='off'){cancelAnimationFrame(frame);frame=0;document.body.dataset.space='fallback';document.getElementById('scene-status').textContent='FONDO ESTÁTICO';return}try{initRenderer();build();document.body.dataset.space='ready';document.getElementById('scene-status').textContent='GALAXIA 3D / '+(quality==='high'?'ALTA':'LIGERA');if(!settings.motion){targetProgress=progress;pointerX=px;pointerY=py;cancelAnimationFrame(frame);frame=0}dirty=true;wake()}catch(e){document.body.dataset.space='fallback';document.getElementById('scene-status').textContent='FONDO LIGERO';console.warn('WebGL unavailable',e.message)}}
  addEventListener('resize',resize,{passive:true});addEventListener('pointermove',e=>{if(!settings.motion)return;pointerX=e.clientX/innerWidth-.5;pointerY=e.clientY/innerHeight-.5},{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0}else wake()});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;document.body.dataset.space='fallback';document.getElementById('scene-status').textContent='FONDO LIGERO'});canvas.addEventListener('webglcontextrestored',()=>{document.body.dataset.space='ready';wake()});
  configure(settings);
  return {configure,setScroll(p){if(!settings.motion)return;targetProgress=Math.max(0,Math.min(1,p));dirty=true;wake()},setImmersive(on){immersive=on;explorer.setActive(on);dirty=true;wake()},dispose(){disposed=true;cancelAnimationFrame(frame);explorer.dispose();renderer?.dispose();texture.dispose()}};
}
