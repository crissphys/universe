import * as THREE from './vendor/three.module.min.js';
// A stylized, deliberately-not-to-scale Solar System: same generated-shader approach as the galaxy
// (no textures, no photos). Sizes and distances are compressed so every body stays visible and reachable.
export const PLANETS=[
 {name:'Mercurio',a:'#6b6459',b:'#a79c8d',c:'#000',bands:0,rough:7,dist:4,size:.16,fact:'El más cercano al Sol y el más pequeño del sistema.'},
 {name:'Venus',a:'#caa15c',b:'#f2dba0',c:'#000',bands:0,rough:3,dist:6.4,size:.30,fact:'El planeta más caliente: su atmósfera densa atrapa el calor.'},
 {name:'Tierra',a:'#0f3a63',b:'#3f7d3a',c:'#000',bands:0,rough:5,dist:9,size:.32,fact:'Nuestro hogar. El único planeta confirmado con vida.'},
 {name:'Marte',a:'#7a3312',b:'#c9713f',c:'#000',bands:0,rough:5,dist:11.6,size:.21,fact:'El planeta rojo, por el óxido de hierro en su superficie.'},
 {name:'Júpiter',a:'#c9a877',b:'#ecd7ae',c:'#a9744f',bands:1,rough:2.4,dist:16.5,size:.95,fact:'El gigante gaseoso más grande del sistema solar.'},
 {name:'Saturno',a:'#d8c48a',b:'#efe0b8',c:'#b89a63',bands:1,rough:2.4,dist:21.5,size:.82,ring:true,fact:'Conocido por su llamativo sistema de anillos de hielo y roca.'},
 {name:'Urano',a:'#a9dde0',b:'#cdf0f0',c:'#000',bands:0,rough:1.8,dist:25.5,size:.5,fact:'Gira casi de costado sobre su propio eje.'},
 {name:'Neptuno',a:'#33509e',b:'#5c7fe0',c:'#000',bands:0,rough:1.8,dist:28.5,size:.48,fact:'El planeta más lejano y ventoso del sistema solar.'},
];
const vertex=`varying vec3 vPosition;varying vec3 vNormal;varying vec3 vView;void main(){vPosition=position;vec4 mv=modelViewMatrix*vec4(position,1.);vNormal=normalize(normalMatrix*normal);vView=-mv.xyz;gl_Position=projectionMatrix*mv;}`;
const fragment=`varying vec3 vPosition;varying vec3 vNormal;varying vec3 vView;uniform float uTime;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;uniform float uBands;uniform float uRough;
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float sum=0.,amp=.55;for(int i=0;i<4;i++){sum+=noise(p)*amp;p=p*2.12+7.3;amp*=.49;}return sum;}
void main(){
 vec3 p=vPosition*uRough+vec3(uTime*.015,uBands*uTime*.02,0.);
 float terrain=fbm(p);
 vec3 base=mix(uA,uB,smoothstep(.35,.65,terrain));
 float band=uBands>.5?sin(vPosition.y*9.+fbm(vPosition*2.+uTime*.01)*2.5)*.5+.5:0.;
 base=mix(base,uC,band*uBands*.55);
 float clouds=smoothstep(.58,.86,fbm(vPosition*6.+vec3(uTime*.05,uTime*.03,0.)));
 base=mix(base,vec3(1.),clouds*.3*(1.-uBands));
 float limb=pow(max(0.,dot(normalize(vNormal),normalize(vView))),.4);
 gl_FragColor=vec4(base*(.32+.85*limb),1.);
}`;
export function createSolar(){
 const group=new THREE.Group();group.visible=false;
 const materials=[],bodies=[];
 const sunGeometry=new THREE.SphereGeometry(1,40,28);
 const sunMat=new THREE.MeshBasicMaterial({color:'#fff2d9'});
 const sun=new THREE.Mesh(sunGeometry,sunMat);sun.scale.setScalar(1.3);group.add(sun);
 bodies.push({name:'Sol',mesh:sun,size:1.3,dist:0,fact:'Una estrella enana amarilla. Contiene más del 99% de la masa del sistema solar.'});
 const light=new THREE.PointLight('#fff6e6',2.4,0,0);group.add(light);
 const geometry=new THREE.SphereGeometry(1,44,30);
 PLANETS.forEach(p=>{
  const material=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{uTime:{value:0},uA:{value:new THREE.Color(p.a)},uB:{value:new THREE.Color(p.b)},uC:{value:new THREE.Color(p.c)},uBands:{value:p.bands},uRough:{value:p.rough}}});
  materials.push(material);
  const mesh=new THREE.Mesh(geometry,material);mesh.scale.setScalar(p.size);mesh.position.set(p.dist,0,0);group.add(mesh);
  if(p.ring){
   const ring=new THREE.Mesh(new THREE.RingGeometry(p.size*1.5,p.size*2.3,64),new THREE.MeshBasicMaterial({color:'#cbb98a',transparent:true,opacity:.55,side:THREE.DoubleSide}));
   ring.rotation.x=Math.PI*.44;ring.position.copy(mesh.position);group.add(ring);
  }
  bodies.push({name:p.name,mesh,size:p.size,dist:p.dist,fact:p.fact});
 });
 return {group,bodies,update(dt){materials.forEach(m=>m.uniforms.uTime.value+=dt)},dispose(){geometry.dispose();sunGeometry.dispose();sunMat.dispose();materials.forEach(m=>m.dispose());group.parent?.remove(group)}};
}
