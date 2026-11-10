/* UNIverse · inicio — agujero negro de Schwarzschild en blanco y negro.
   Cada píxel traza un rayo de luz curvado por la gravedad (a = -1.5·h²·r/|r|⁵, unidades Rs = 1): el disco de acreción
   se ve por encima y por debajo de la sombra, con anillo de fotones, y la Vía Láctea del fondo se deforma alrededor.
   Al llegar (una vez por sesión) la cámara viaja desde lejos a la velocidad de la luz entre estelas de estrellas. */
(function () {
  'use strict';
  var root = document.documentElement;
  var canvas = document.getElementById('bh');
  var arrive = function () { root.classList.add('arrived'); dispatchEvent(new Event('bh-arrive')); };
  if (!canvas) { arrive(); return; }
  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  if (!gl) { root.classList.add('no-gl'); arrive(); return; }

  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FRAG = `
precision highp float;
uniform vec2 uRes,uCenter,uLook;
uniform float uTime,uIntro,uScroll,uFocal,uDist,uWarp,uPhase,uFlash;
const float RIN=3.0;const float ROUT=13.0;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float h31(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float nP(vec2 p,float P){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float y0=mod(i.y,P),y1=mod(i.y+1.,P);
 return mix(mix(h21(vec2(i.x,y0)),h21(vec2(i.x+1.,y0)),f.x),mix(h21(vec2(i.x,y1)),h21(vec2(i.x+1.,y1)),f.x),f.y);}
float fbm(vec2 p,float P){float v=0.,a=.5;for(int k=0;k<4;k++){v+=a*nP(p,P);p*=2.;P*=2.;a*=.5;}return v;}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm3(vec3 p){float v=0.,a=.5;for(int k=0;k<3;k++){v+=a*n3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return v;}
vec3 sky(vec3 d){
 vec3 p=d*190.;vec3 c=floor(p);float h=h31(c);
 float st=h>.989?smoothstep(.24,0.,length(fract(p)-.5))*(.2+.9*fract(h*91.)):0.;
 vec3 gn=normalize(vec3(.28,1.,-.42));float b=dot(d,gn);
 float band=exp(-b*b*12.),core=exp(-b*b*55.);
 float cl=fbm3(d*4.2),du=fbm3(d*8.5+3.);
 float milky=band*(.2+.8*cl)*(1.-.8*smoothstep(.45,.7,du)*exp(-b*b*30.))+core*.7*cl*cl;
 vec3 q=d*430.;float h2=h31(floor(q));
 float st2=h2>1.-.03*band?smoothstep(.32,0.,length(fract(q)-.5))*.55:0.;
 return vec3(st*.8+st2*band+milky*.2);}
vec4 disk(vec3 h,float r,vec3 rd){
 float phi=atan(h.z,h.x)+uTime*3.4*pow(r,-1.5);
 float v=phi*2.2281692;
 float n=fbm(vec2(r*1.15,v),14.);
 float s=fbm(vec2(r*3.6+7.,v*2.),28.);
 float hot=pow(nP(vec2(r*.9+3.,v*.5),7.),5.)*2.2;
 float edge=smoothstep(RIN,RIN+.5,r)*(1.-smoothstep(ROUT*.4,ROUT,r));
 float I=pow(RIN/r,2.)*edge*(.16+1.55*n*n+hot)*(.72+.56*s);
 vec3 t=normalize(vec3(-h.z,0.,h.x));float be=sqrt(.5/(r-1.));
 float g=sqrt(1.-be*be)/(1.-be*dot(t,-normalize(rd)));
 I*=g*g*g*g*sqrt(1.-1./r);
 return vec4(vec3(I),clamp(I*2.2,0.,.95)*edge);}
float streaks(vec2 uv){
 float rho=length(uv);if(rho<.01)return 0.;
 float N=170.,a=atan(uv.y,uv.x)/6.2831853*N,ai=floor(a),af=fract(a)-.5;
 float z=log(rho)*5.-uPhase+h21(vec2(ai,3.))*9.;float zi=floor(z),zf=fract(z);
 float on=step(.55,h21(vec2(ai,zi)));
 float L=.05+uWarp*.85;
 float len=smoothstep(0.,L,zf)*(1.-smoothstep(L,L+.04,zf));
 float w=1.3/uRes.y/rho*N/6.2831853;
 return on*len*exp(-af*af/(w*w))*smoothstep(.02,.35,rho)*(.4+.6*h21(vec2(zi,ai)));}
void main(){
 vec2 uv0=(gl_FragCoord.xy-uCenter*uRes)/uRes.y;
 float roll=-.09;vec2 uv=mat2(cos(roll),-sin(roll),sin(roll),cos(roll))*uv0;
 float dist=uDist*mix(1.,.6,uScroll);
 float el=.12+.035*sin(uTime*.07)+uLook.y*.05+uScroll*.06,az=.24*sin(uTime*.045)+uLook.x*.09;
 vec3 ro=dist*vec3(sin(az)*cos(el),sin(el),-cos(az)*cos(el));
 vec3 fw=normalize(-ro),rt=normalize(cross(vec3(0.,1.,0.),fw)),up=cross(fw,rt);
 vec3 rd=normalize(fw*uFocal*(1.+uWarp*.7)+rt*uv.x+up*uv.y);
 vec3 pos=ro,dir=rd;vec3 hv=cross(pos,dir);float h2=dot(hv,hv);
 vec3 col=vec3(0.);float a=0.,glow=0.;bool cap=false,done=false;
 float bq=dot(pos,dir),cq=dot(pos,pos)-1600.;bool far=false;
 if(cq>0.){float di=bq*bq-cq;if(di<0.||bq>0.)far=true;else pos+=dir*(-bq-sqrt(di));}
 if(!far){
  for(int i=0;i<220;i++){
   float r2=dot(pos,pos);float r=sqrt(r2);
   if(r<1.){cap=true;break;}
   float dt=r<3.4?.045:clamp(.075*r,.045,1.6);
   float rx=length(pos.xz);
   glow+=(1.-a)*dt*(.05*exp(-pow((r-1.55)*6.,2.))+.02*exp(-abs(pos.y)*3.2)*smoothstep(ROUT,RIN,rx)*smoothstep(RIN*.8,RIN*1.1,rx));
   dir+=-1.5*h2*pos/(r2*r2*r)*dt;
   vec3 np=pos+dir*dt;
   if(pos.y*np.y<0.){vec3 h=mix(pos,np,pos.y/(pos.y-np.y));float rr=length(h.xz);
    if(rr>RIN&&rr<ROUT){vec4 d=disk(h,rr,dir);col+=(1.-a)*d.rgb;a+=(1.-a)*d.a;if(a>.985){done=true;break;}}}
   pos=np;
   if(r>42.&&dot(pos,dir)>0.){done=true;break;}
  }
  if(!done&&!cap&&dot(pos,pos)<64.)cap=true;
 }
 if(!cap)col+=(1.-a)*sky(normalize(dir));
 col+=vec3(glow);
 if(!cap)col+=vec3(streaks(uv0))*uWarp*1.4*(1.-a);
 col=1.-exp(-col*2.*uIntro);
 col=mix(col,vec3(1.),uFlash);
 col+=(h21(gl_FragCoord.xy+fract(uTime))-.5)/255.;
 gl_FragColor=vec4(col,1.);
}`;

  function shader(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  var prog = gl.createProgram();
  try {
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { root.classList.add('no-gl'); arrive(); return; }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ['uRes', 'uCenter', 'uLook', 'uTime', 'uIntro', 'uScroll', 'uFocal', 'uDist', 'uWarp', 'uPhase', 'uFlash'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  var hero = canvas.parentElement;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var dpr = devicePixelRatio || 1, small = innerWidth < 760;
  // escala de render en píxeles CSS; se ajusta sola según el tiempo por cuadro
  var scale = small ? Math.min(dpr, 1.5) : Math.min(dpr, 1.25) * .8, maxScale = Math.min(dpr, small ? 2 : 1.5);
  var cssH = 1;
  function size() {
    var r = hero.getBoundingClientRect();
    cssH = r.height; small = r.width < 760;
    var w = Math.max(2, Math.round(r.width * scale)), h = Math.max(2, Math.round(r.height * scale));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.uRes, w, h);
    gl.uniform2f(U.uCenter, .5, small ? .69 : .62);
    gl.uniform1f(U.uFocal, 1.32 * Math.max(.6, Math.min(1, r.width / r.height * 1.05)));
  }

  var look = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  if (finePointer) addEventListener('pointermove', function (e) { target.x = e.clientX / innerWidth * 2 - 1; target.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });

  // viaje inicial: desde 320 Rs hasta 23 Rs; una vez por sesión, se puede saltar con cualquier interacción
  var WARP_MS = 4600, warpOn = root.dataset.warp === '1';
  var start = performance.now(), warpStart = start, last = start, raf = 0, visible = true, frames = 0, acc = 0, phase = 0, arrived = false;
  var t0 = 20 + Math.random() * 40;
  var ease = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var clamp01 = function (x) { return Math.max(0, Math.min(1, x)); };
  function skip() { if (warpOn && !arrived) warpStart = Math.min(warpStart, performance.now() - WARP_MS * .84); }
  if (warpOn) ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { addEventListener(ev, skip, { passive: true, once: true }); });
  try { sessionStorage.setItem('universe_warp', '1'); } catch (e) {}

  function frame(now) {
    raf = 0;
    var dt = Math.min(64, now - last); last = now;
    var k = 1 - Math.exp(-dt / 260); // seguimiento amortiguado del puntero (sin rebote)
    look.x += (target.x - look.x) * k; look.y += (target.y - look.y) * k;
    var dist = 23, warp = 0, flash = 0;
    if (warpOn) {
      var p = clamp01((now - warpStart) / WARP_MS);
      dist = 23 * Math.pow(320 / 23, 1 - ease(clamp01((p - .04) / .8)));
      warp = Math.pow(Math.sin(Math.PI * clamp01((p - .06) / .78)), .7);
      flash = .55 * Math.exp(-Math.pow((p - .86) * 16, 2));
      if (p >= .86 && !arrived) { arrived = true; arrive(); }
      if (p >= 1) warpOn = false;
    }
    phase += warp * dt / 1000 * 7;
    gl.uniform1f(U.uTime, t0 + (now - start) / 1000);
    gl.uniform1f(U.uIntro, 1 - Math.pow(1 - clamp01((now - start) / 1600), 3));
    gl.uniform1f(U.uScroll, clamp01(scrollY / Math.max(1, cssH)));
    gl.uniform2f(U.uLook, look.x, -look.y);
    gl.uniform1f(U.uDist, dist); gl.uniform1f(U.uWarp, warp); gl.uniform1f(U.uPhase, phase); gl.uniform1f(U.uFlash, flash);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // resolución adaptable: baja si el cuadro tarda más de ~24 ms, sube si sobra margen
    frames++; acc += dt;
    if (frames === 40) {
      var avg = acc / frames, next = scale;
      if (avg > 24 && scale > .38) next = scale * .82;
      else if (avg < 13 && scale < maxScale) next = Math.min(maxScale, scale * 1.08);
      if (next !== scale) { scale = next; size(); }
      frames = 0; acc = 0;
    }
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  // animación permanente: solo se detiene fuera de pantalla o con la pestaña oculta
  function play() { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  size();
  if (!warpOn) arrive();
  play();
  canvas.classList.add('on');
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; play(); }).observe(hero);
  document.addEventListener('visibilitychange', play);
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 120); });
  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; root.classList.add('no-gl'); arrive(); });
})();
