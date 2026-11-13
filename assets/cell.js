
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const IF=window.IF, stage=document.getElementById('stage'), canvas=document.getElementById('gl');
const OLAB=['c_hint'].map(k=>{const d=document.createElement('div');d.className='anno org'+(k==='c_hint'?' hint':'');d.setAttribute('aria-hidden','true');d.innerHTML='<i></i><s></s><span></span>';d.dataset.k=k;stage.appendChild(d);return d;});
const OLOC={o_nuc:new THREE.Vector3(-.22,.27,.12)};
const an1=document.getElementById('an1'), an2=document.getElementById('an2'), an5=document.getElementById('an5'), an6=document.getElementById('an6');
const SPD=IF.reduce?0.2:1;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const lerp=(a,b,t)=>a+(b-a)*t;

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
let DPR=Math.min(window.devicePixelRatio||1,1);renderer.setPixelRatio(DPR);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
renderer.outputColorSpace=THREE.SRGBColorSpace;

const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(renderer),0.04).texture;
const cam=new THREE.PerspectiveCamera(30,1,0.1,100);cam.position.set(0,0,10);scene.add(cam);
const key=new THREE.DirectionalLight(0xffffff,1.8);key.position.set(-3,4,5);key.layers.enableAll();scene.add(key);
const rim=new THREE.DirectionalLight(0xb4e2e6,1.2);rim.position.set(4,-2,-3);rim.layers.enableAll();scene.add(rim);
{const am=new THREE.AmbientLight(0xffffff,0.35);am.layers.enableAll();scene.add(am);}

const NOISE2=`
float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hh(i),hh(i+vec2(1,0)),f.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=0.5,s=0.0;for(int i=0;i<3;i++){s+=a*vn(p);p*=2.03;a*=0.5;}return s;}`;
const RTS=0.6;
const rt=new THREE.WebGLRenderTarget(4,4,{type:renderer.extensions.has('EXT_color_buffer_half_float')||renderer.extensions.has('EXT_color_buffer_float')?THREE.HalfFloatType:THREE.UnsignedByteType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false,samples:renderer.capabilities.isWebGL2?4:0});
const bgMat=new THREE.ShaderMaterial({
 uniforms:{uRes:{value:new THREE.Vector2(1,1)},uTime:{value:0},uC:{value:new THREE.Vector2()},uR:{value:0},uCell:{value:new THREE.Vector2()},uPro:{value:0},uCmp:{value:0},uSX:{value:0},uK:{value:RTS},uPtr:{value:new THREE.Vector2(-999,-999)},uPtrOn:{value:0},uFlash:{value:0},uFC:{value:new THREE.Vector2(-999,-999)}},
 vertexShader:`void main(){gl_Position=vec4(position.xy,0.9999,1.0);}`,
 fragmentShader:`uniform vec2 uRes;uniform float uTime;uniform vec2 uC;uniform float uR;uniform vec2 uCell;uniform float uPro;uniform float uCmp;uniform float uSX;uniform float uK;uniform vec2 uPtr;uniform float uPtrOn;uniform float uFlash;uniform vec2 uFC;
 ${NOISE2}
 /* light waves: two drifting sheen bands + soft caustic filaments, warped by noise */
 float waves(vec2 uv,float f,float g,float pl){
  float a=pow(max(0.0,sin((uv.x*1.3+uv.y*0.8+f*0.7)*9.0-uTime*0.28)),12.0);
  float b=pow(max(0.0,sin((uv.x*-0.6+uv.y*1.25+g*0.9)*5.5-uTime*0.19+1.7)),9.0);
  float k=fbm(uv*vec2(4.2,2.6)+vec2(f,g)*1.6+vec2(uTime*0.035,-uTime*0.025));
  float cs=pow(1.0-abs(sin(k*7.0+uTime*0.15)),5.0);
  return (a*0.9+b*0.65+cs*0.3)*(1.0+pl*1.6);
 }
 vec3 pubCol(vec2 uv,vec2 px,float pl){
  vec3 c=mix(vec3(0.972,0.976,0.988),vec3(0.925,0.945,0.965),clamp(1.0-uv.y*0.9,0.0,1.0)*0.6);
  float f=fbm(uv*2.2+vec2(uTime*0.02,-uTime*0.015));
  c=mix(c,vec3(0.76,0.88,0.93),smoothstep(0.85,0.05,distance(uv*vec2(uRes.x/uRes.y,1.0),vec2(0.88*uRes.x/uRes.y,0.92)))*0.6*(0.55+0.45*f));
  float dc=distance(px,uCell)/uRes.y;
  c=mix(c,vec3(0.56,0.75,0.84),smoothstep(0.62,0.06,dc)*0.58*(0.8+0.2*f));
  c+=waves(uv,f,f*0.7,pl)*0.03*vec3(0.9,1.0,1.0);
  c+=pl*0.025;
  return c;}
 vec3 proCol(vec2 uv,float pl){
  float f=fbm(uv*1.8+vec2(uTime*0.03,uTime*0.02));
  float g=fbm(uv*3.0-vec2(uTime*0.02,0.0)+f);
  vec3 c1=vec3(0.91,0.96,0.97),c2=vec3(0.64,0.84,0.88),c3=vec3(0.12,0.50,0.58),c4=vec3(0.70,0.82,0.92);
  float t=clamp((1.0-uv.y)*0.75+uv.x*0.45-0.15+(f-0.5)*0.35,0.0,1.0);
  vec3 c=mix(c1,c2,smoothstep(0.0,0.55,t));c=mix(c,c3,smoothstep(0.55,1.0,t));
  c=mix(c,c4,smoothstep(0.35,0.75,g)*0.35);
  c+=waves(uv,f,g,pl)*0.085*vec3(0.85,1.0,1.0);
  c+=pl*0.05*vec3(0.9,1.0,1.0);
  return c;}
 void main(){
  vec2 px=gl_FragCoord.xy, uv=px/uRes;
  float pl=uPtrOn*exp(-pow(distance(px,uPtr)/(uRes.y*0.32),2.0));
  vec3 a=pubCol(uv,px,pl), b=proCol(uv,pl);
  float d=distance(px,uC);
  float m;float edge=0.0;
  if(uCmp>0.5){m=smoothstep(uSX-1.0,uSX+1.0,px.x);}
  else{
   m=uPro>0.5?1.0:1.0-smoothstep(uR-30.0*uK,uR+2.0*uK,d);
   if(uR<1.0&&uPro<0.5)m=0.0;
   edge=(uR>1.0&&uPro<0.5)?exp(-pow((d-uR)/(22.0*uK),2.0))*0.35:0.0;
  }
  vec3 col=mix(a,b,m)+edge;
  float fd=distance(px,uFC)/uRes.y;
  col+=uFlash*(exp(-fd*fd*30.0)*0.7+exp(-fd*fd*4.0)*0.16)*vec3(0.86,1.0,1.0);
  gl_FragColor=vec4(pow(max(col,0.0),vec3(2.2)),1.0);
 }`,
 depthWrite:false,depthTest:false,toneMapped:false
});
const bg=new THREE.Mesh(new THREE.PlaneGeometry(2,2),bgMat);bg.frustumCulled=false;bg.renderOrder=-10;bg.layers.set(1);scene.add(bg);
/* full-res copy of the background (+ fine grain) for the visible frame */
const cpMat=new THREE.ShaderMaterial({
 uniforms:{tBg:{value:rt.texture},uRes:{value:new THREE.Vector2(1,1)},uTime:{value:0}},
 vertexShader:`void main(){gl_Position=vec4(position.xy,0.9999,1.0);}`,
 fragmentShader:`uniform sampler2D tBg;uniform vec2 uRes;uniform float uTime;
 float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 void main(){vec3 c=texture2D(tBg,gl_FragCoord.xy/uRes).rgb;c+=(hh(gl_FragCoord.xy+fract(uTime))-0.5)*0.006;gl_FragColor=vec4(c,1.0);
 #include <colorspace_fragment>
 }`,
 depthWrite:false,depthTest:false,toneMapped:false
});
const cp=new THREE.Mesh(new THREE.PlaneGeometry(2,2),cpMat);cp.frustumCulled=false;cp.renderOrder=-10;scene.add(cp);

const U={uTime:{value:0},uSplit:{value:0},uDiv:{value:new THREE.Vector3(.4,.6,.68)},uPtrDir:{value:new THREE.Vector3(0,0,1)},uPtrAmt:{value:0},uRip:{value:[0,1,2,3].map(()=>new THREE.Vector4(0,0,1,-99))}};
const SNOISE=`
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
uniform float uTime;uniform float uSplit;uniform vec3 uDiv;uniform vec3 uPtrDir;uniform float uPtrAmt;uniform vec4 uRip[4];
/* p on the unit sphere -> two daughter spheres (radius uDiv.z, centres +-uDiv.x) joined by a tether of radius uDiv.y */
vec3 dumb(vec3 p){
 float r=uDiv.z,rt=uDiv.y,D=uDiv.x,e=0.14;
 float sx=p.x>=0.0?1.0:-1.0;float ax=abs(p.x);
 float l=length(p.yz);vec2 dir=l>1e-5?p.yz/l:vec2(0.0,1.0);
 float th0=asin(clamp(rt/r,0.0,0.999));
 float xj=D-r*cos(th0);
 if(ax<e){float xn=ax/e;float rmin=max(rt*0.35,rt-0.5*xj*cos(th0)/max(sin(th0),0.02));float rad=mix(rmin,rt,xn*xn);return vec3(sx*xn*xj,dir*rad);}
 float th=(3.14159265-th0)*acos(clamp(ax,0.0,1.0))/acos(e);
 return vec3(sx*(D+r*cos(th)),dir*r*sin(th));
}
vec3 dispF(vec3 p){
 float ca=cos(uTime*0.08),sa=sin(uTime*0.08);vec3 pn=vec3(ca*p.x+sa*p.z,p.y,-sa*p.x+ca*p.z);
 float n=snoise(pn*1.05+vec3(0.0,0.0,uTime*0.18))*0.064+snoise(pn*0.55+vec3(uTime*0.07))*0.03+snoise(pn*2.1-vec3(uTime*0.2))*0.014;
 float dd=distance(p,uPtrDir);
 float bulge=uPtrAmt*exp(-dd*dd*5.0)*0.20;
 float r=0.0;
 for(int i=0;i<4;i++){float age=uTime-uRip[i].w;if(age>0.0&&age<3.0){float d2=distance(p,uRip[i].xyz);float fr=age*0.95;r+=sin((d2-fr)*16.0)*exp(-age*1.4)*exp(-pow(d2-fr,2.0)*7.0)*0.055;}}
 float k=1.0+n+bulge+r;
 vec3 q=p*k;
 if(uSplit>0.0)q=mix(q,dumb(p)*k,uSplit);
 return q;
}`;
const NORMAL_CODE=`
vec3 nrm0=normalize(normal);
vec3 tg=normalize(cross(nrm0,abs(nrm0.y)<0.99?vec3(0.0,1.0,0.0):vec3(1.0,0.0,0.0)));
vec3 bt=cross(nrm0,tg);
vec3 dispP=dispF(position);
vec3 dA=dispF(normalize(position+tg*0.012));
vec3 dB=dispF(normalize(position+bt*0.012));
vec3 objectNormal=normalize(cross(dA-dispP,dB-dispP));
if(dot(objectNormal,dispP-vec3(sign(position.x)*uDiv.x*uSplit,0.0,0.0))<0.0)objectNormal=-objectNormal;
#ifdef USE_TANGENT
vec3 objectTangent=vec3(tangent.xyz);
#endif`;
const ATT_PUB=new THREE.Color('#9ED3E0'),ATT_PRO=new THREE.Color('#BFEFEF');
const MU={uRT:{value:rt.texture},uFull:{value:new THREE.Vector2(1,1)},uTint:{value:new THREE.Color()},uRim:{value:new THREE.Color()},uGlow:{value:0}};
const RIM_PUB=new THREE.Color('#2A7397'),RIM_PRO=new THREE.Color('#0F4A70');
const memMat=new THREE.MeshPhysicalMaterial({color:0x000000,roughness:0.08,iridescence:1,iridescenceIOR:1.28,iridescenceThicknessRange:[140,640],clearcoat:1,clearcoatRoughness:0.06,envMapIntensity:1.25,specularIntensity:1});
memMat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U,MU);
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uRT;uniform vec2 uFull;uniform vec3 uTint;uniform vec3 uRim;uniform float uGlow;').replace('#include <opaque_fragment>',`{
  vec2 suv=gl_FragCoord.xy/uFull;vec3 nv=normalize(normal);
  float ndv=clamp(abs(dot(nv,geometryViewDir)),0.0,1.0);float fr=pow(1.0-ndv,2.4);
  vec2 off=nv.xy*(0.04+0.05*fr);
  vec3 rf=vec3(texture2D(uRT,suv-off*0.9).r,texture2D(uRT,suv-off).g,texture2D(uRT,suv-off*1.12).b);
  rf*=mix(vec3(1.0),uTint,0.5+0.3*fr);
  outgoingLight=rf*(1.0-0.55*fr)+uRim*fr*0.9+outgoingLight+uGlow*vec3(0.55,0.9,0.95)*(0.25+fr*1.2);
 }
#include <opaque_fragment>`);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+SNOISE).replace('#include <beginnormal_vertex>',NORMAL_CODE).replace('#include <begin_vertex>','vec3 transformed=dispP;');};
const memGeo=new THREE.SphereGeometry(1,64,64).rotateZ(Math.PI/2);
const NUC_PUB=new THREE.Color('#6A4A9E'),NUC_PRO=new THREE.Color('#5A55A8');
const nucMat=new THREE.MeshPhysicalMaterial({color:NUC_PUB.clone(),roughness:0.22,metalness:0.05,clearcoat:1,clearcoatRoughness:0.12,iridescence:0.3,iridescenceIOR:1.3,envMapIntensity:1.0,sheen:.6,sheenColor:new THREE.Color('#C9B4F0')});
const nlMat=new THREE.MeshPhysicalMaterial({color:'#3A2066',roughness:0.3,clearcoat:.8,emissive:new THREE.Color('#2A1450'),emissiveIntensity:0.2});
const vesMat=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:0.32,clearcoat:0.6,envMapIntensity:1.0});
const sph=new THREE.SphereGeometry(1,24,16);
/* organelles: mitochondria (striped capsules), endoplasmic reticulum (ribbons around the nucleus), Golgi (stacked arcs) */
const mitoTex=cvTex(128,32,(g,w,h)=>{g.fillStyle='#D2553A';g.fillRect(0,0,w,h);g.strokeStyle='rgba(252,232,204,.95)';g.lineWidth=3;for(let x=7;x<w;x+=13){g.beginPath();g.moveTo(x,5);g.quadraticCurveTo(x+6,h/2,x,h-5);g.stroke();}});
const mitoMat=new THREE.MeshPhysicalMaterial({color:0xffffff,map:mitoTex,roughness:.34,clearcoat:.7,clearcoatRoughness:.2,envMapIntensity:1});
const erMat=new THREE.MeshPhysicalMaterial({color:'#C48AD6',roughness:.3,clearcoat:.6,emissive:new THREE.Color('#E2BDEE'),emissiveIntensity:.1});
const golMat=new THREE.MeshPhysicalMaterial({color:'#E2B03A',roughness:.32,clearcoat:.7,emissive:new THREE.Color('#7A5208'),emissiveIntensity:.12});
const mitoGeo=new THREE.CapsuleGeometry(.048,.17,6,14);
function makeOrg(){
 const org=new THREE.Group(),o3=new THREE.Object3D(),mpos=[];
 const MN=7,mito=new THREE.InstancedMesh(mitoGeo,mitoMat,MN);
 for(let i=0;i<MN;i++){const a=i/MN*Math.PI*2+.35,y=(((i*53)%10)/10-.5)*.75,r=(.58+((i*37)%10)/10*.15)*Math.sqrt(1-y*y*.5);
  o3.position.set(Math.cos(a)*r,y,Math.sin(a)*r*.8);o3.rotation.set(a*1.7,a,a*.6+i);o3.scale.setScalar(1);o3.updateMatrix();mito.setMatrixAt(i,o3.matrix);mpos.push(o3.position.clone());}
 org.add(mito);
 const er=[];for(let k=0;k<3;k++){const pts=[],st=k*2.1+.3,span=Math.PI*1.25;
  for(let j=0;j<=26;j++){const an=st+j/26*span,rad=.45+.03*Math.sin(j*1.3+k*2)+k*.025;pts.push(new THREE.Vector3(Math.cos(an)*rad,(k-1)*.13+.09*Math.sin(an*2+k),Math.sin(an)*rad*.85));}
  const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),90,.017,8,false),erMat);org.add(m);er.push(pts[9]);}
 const gol=new THREE.Group();gol.position.set(-.5,-.3,.3);gol.rotation.set(.3,.5,.75);
 for(let k=0;k<4;k++){const m=new THREE.Mesh(new THREE.TorusGeometry(.15-.024*k,.017,8,40,Math.PI*.95),golMat);m.position.set(0,0,k*.04);gol.add(m);}
 org.add(gol);
 org.traverse(o=>o.layers.enable(1));
 return {org,mpos,anch:{er:er[0].clone(),golgi:gol.position.clone()}};
}

function makeCell(){
 const g=new THREE.Group();
 const mem=new THREE.Mesh(memGeo,memMat);mem.renderOrder=2;g.add(mem);
 const nuc=new THREE.Mesh(sph,nucMat);nuc.scale.setScalar(0.36);g.add(nuc);
 const nl=new THREE.Mesh(sph,nlMat);nl.scale.setScalar(0.11);g.add(nl);
 const N=24,ves=new THREE.InstancedMesh(sph,vesMat,N);g.add(ves);
 const data=[];for(let i=0;i<N;i++){const u=Math.random()*2-1,th=Math.random()*Math.PI*2;data.push({u,th,r:0.5+Math.random()*0.32,s:0.025+Math.random()*0.045,sp:(Math.random()-0.5)*0.35,ph:Math.random()*6.28});}
 const nuc2=new THREE.Mesh(sph,nucMat);nuc2.visible=false;g.add(nuc2);
 const br=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,14,1,true).rotateZ(Math.PI/2),nucMat);br.visible=false;g.add(br);
 [nuc,nl,ves,nuc2,br].forEach(o=>o.layers.enable(1));
 const O=makeOrg();g.add(O.org);
 return {g,mem,nuc,nl,ves,data,nuc2,br,org:O.org,anch:O.anch,mpos:O.mpos};
}
const A=makeCell(),B=makeCell();B.data=A.data;scene.add(A.g);scene.add(B.g);B.g.visible=false;

const exo=[];
[[.13,.22,-1.5,.11,1],[.9,.18,-2.5,.07,0],[.93,.8,.8,.09,1],[.08,.82,-1,.06,0],[.86,.56,1.6,.05,0],[.2,.6,-3,.05,0],[.74,.08,0.5,.045,0]].forEach(([fx,fy,z,s,glass],i)=>{
 const m=new THREE.Mesh(sph,vesMat);m.layers.enable(1);exo.push({m,fx,fy,z,s,ph:i*1.7});scene.add(m);});


/* magnifier: under the lens the membrane is lifted; the interior is redrawn enlarged and sharp */
const lensRT=new THREE.WebGLRenderTarget(4,4,{type:rt.texture.type,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false,samples:renderer.capabilities.isWebGL2?4:0});
const lensMat=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,
 uniforms:{uTex:{value:lensRT.texture},uLC:{value:new THREE.Vector2()},uLR:{value:1},uCC:{value:new THREE.Vector2()},uCR:{value:1},uZ:{value:2},uA:{value:0},uCyto:{value:new THREE.Color('#EDEBF5')},uRimC:{value:new THREE.Color('#9CC9D6')}},
 vertexShader:`void main(){gl_Position=vec4(position.xy,0.0,1.0);}`,
 fragmentShader:`uniform sampler2D uTex;uniform vec2 uLC;uniform float uLR;uniform vec2 uCC;uniform float uCR;uniform float uZ;uniform float uA;uniform vec3 uCyto;uniform vec3 uRimC;
 void main(){vec2 d=gl_FragCoord.xy-uLC;float r=length(d);if(r>uLR)discard;
  vec2 src=uLC+d/uZ;float dc=length(src-uCC)/uCR;
  float inside=1.0-smoothstep(0.93,0.99,dc);if(inside<0.002)discard;
  vec4 sm=texture2D(uTex,d/(2.0*uLR)+0.5);
  vec3 c=mix(uCyto*(1.0-0.08*dc*dc),sm.rgb,sm.a);
  float rim=smoothstep(0.84,0.93,dc)*(1.0-smoothstep(0.95,0.99,dc));
  c=mix(c,uRimC,rim*0.55);
  gl_FragColor=vec4(c,inside*uA*smoothstep(uLR,uLR-1.5,r));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`});
const lensScene=new THREE.Scene();{const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),lensMat);q.frustumCulled=false;lensScene.add(q);}
let lensA=0;

/* annotated tissue around the cell: collagen matrix, growth factors, exosomes leaving the cell */
const ecmTex=cvTex(256,16,(g,w,h)=>{g.fillStyle='#DDB085';g.fillRect(0,0,w,h);g.fillStyle='rgba(255,244,228,.85)';for(let x=0;x<w;x+=12)g.fillRect(x,0,5,h);});
ecmTex.wrapS=THREE.RepeatWrapping;ecmTex.repeat.set(10,1);
const ecmMat=new THREE.MeshPhysicalMaterial({color:0xffffff,map:ecmTex,roughness:.45,clearcoat:.5,sheen:.6,sheenColor:new THREE.Color('#FFF1DE'),transparent:true,opacity:0});
const ECM=new THREE.Group();
for(let f=0;f<7;f++){const pts=[],a0=f*.9+.3;for(let j=0;j<=10;j++){const an=a0+j*.36,r=1.3+.28*Math.sin(j*.8+f*1.7);pts.push(new THREE.Vector3(Math.cos(an)*r,Math.sin(an)*r*.86,-.75+.55*Math.sin(j*.6+f*2.1)));}
 ECM.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),120,.024,8,false),ecmMat));}
for(let f=0;f<4;f++){const y0=-1.1+f*.75,pts=[];for(let j=0;j<=8;j++){const x=-2.6+j*.65;pts.push(new THREE.Vector3(x,y0+.25*Math.sin(j*.9+f)+x*.12*(f%2?1:-1),-1.25-.2*Math.cos(j*.7+f)));}
 ECM.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),120,.018,8,false),ecmMat));}
ECM.traverse(o=>o.layers.enable(1));ECM.visible=false;A.g.add(ECM);
const gfMat=new THREE.MeshPhysicalMaterial({color:'#2FAE96',roughness:.3,clearcoat:.8,emissive:new THREE.Color('#1E8C78'),emissiveIntensity:.35});
const GFN=18,GF=new THREE.InstancedMesh(sph,gfMat,GFN);GF.layers.enable(1);GF.visible=false;A.g.add(GF);
const gfD=[...Array(GFN)].map((_,i)=>({a:i*2.39996,y:((i*37)%GFN)/GFN*1.7-.85,r:1.1+((i*53)%10)/10*.22,sp:.06+((i*29)%10)/120,s:.026+((i*17)%10)/10*.018}));
const exMat=new THREE.MeshPhysicalMaterial({color:'#ffffff',roughness:.2,clearcoat:1,emissive:new THREE.Color('#9ADDE2'),emissiveIntensity:.4});
const EXV=[...Array(9)].map((_,i)=>{const m=new THREE.Mesh(sph,exMat);m.layers.enable(1);m.visible=false;A.g.add(m);const an=i*.698+.4;return {m,dir:new THREE.Vector3(Math.cos(an),Math.sin(an)*.85,.35+.25*Math.sin(i*1.3)).normalize(),off:i/9};});
let ecmA=0,OPOS=null;
const OCW=[...document.querySelectorAll('.oc')],OCC=[...document.querySelectorAll('.oc-c')];
const MKK=['o_nuc','o_golgi','o_ecm','o_mito','o_er','o_gf'];
const MK=MKK.map((k,i)=>{const d=document.createElement('div');d.className='mk';d.dataset.o=k;d.setAttribute('aria-hidden','true');d.textContent='0'+(i+1);stage.appendChild(d);return d;});
const LL=document.createElementNS('http://www.w3.org/2000/svg','svg');LL.setAttribute('class','ll');LL.setAttribute('aria-hidden','true');stage.appendChild(LL);
const LLC={o_nuc:'#6A4A9E',o_golgi:'#C7962A',o_ecm:'#B98452',o_mito:'#D2553A',o_er:'#A96FBE',o_gf:'#2FAE96'};
const LLP=MKK.map(k=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('stroke',LLC[k]);p.dataset.o=k;LL.appendChild(p);return p;});
let llR=null,llN=0;
const ANCH={hint:new THREE.Vector3(-.62,-.86,0),ecm:new THREE.Vector3(-.92,-.88,-.35),gf:new THREE.Vector3(.86,.66,.25)};
let W=1,H=1,vh=1,vw=1;const L={pub:{},pro:{}};
function place(o,fx,fy,rf){const n=W<760;if(document.documentElement.dir==='rtl')fx=1-fx;o.fx=fx;o.fy=fy;o.rf=Math.min(rf,(n?.40:.34)*vw/vh);o.x=(fx-.5)*vw;o.y=(.5-fy)*vh;o.R=o.rf*vh;}
function resize(){
 W=stage.clientWidth;H=stage.clientHeight;renderer.setSize(W,H,false);
 cam.aspect=W/H;cam.updateProjectionMatrix();
 vh=2*cam.position.z*Math.tan(THREE.MathUtils.degToRad(cam.fov/2));vw=vh*cam.aspect;
 const n=W<760;
 place(L.pub,.5,n?.42:.45,n?.32:.36);
 place(L.pro,n?.66:.63,n?.29:.44,n?.15:.23);
 const v=new THREE.Vector2();renderer.getDrawingBufferSize(v);const rw=Math.max(2,Math.round(v.x*RTS)),rh=Math.max(2,Math.round(v.y*RTS));rt.setSize(rw,rh);bgMat.uniforms.uRes.value.set(rw,rh);cpMat.uniforms.uRes.value.copy(v);MU.uFull.value.copy(v);
}
new ResizeObserver(resize).observe(stage);resize();IF.relayout=resize;

const toPx=(x,y)=>({x:(x/vw+.5)*W,y:(.5-y/vh)*H});
const tmpQ=new THREE.Quaternion(),tmpV=new THREE.Vector3(),dummy=new THREE.Object3D(),nt=new THREE.Vector3();
let ripIdx=0,ptrAmt=0,snapped=false,flashT=-99;
const ptrDir=new THREE.Vector3(0,0,1);

function dirFor(px,py,cx,cy,R,mesh){
 const wx=(px/W-.5)*vw,wy=(.5-py/H)*vh,dx=(wx-cx)/R,dy=(wy-cy)/R,d=Math.hypot(dx,dy);
 tmpV.set(dx,dy,Math.sqrt(Math.max(0,1-d*d))).normalize();
 mesh.getWorldQuaternion(tmpQ);tmpV.applyQuaternion(tmpQ.invert());
 return d;
}
const sst=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
/* mode 0 normal · 1 dividing (tb blend, D centre, r radius) · 2 daughter (keep parity, other parity scaled by grow) */
function updVes(c,t,mode=0,tb=0,D=0,r=1,keep=0,grow=1){
 for(let i=0;i<c.data.length;i++){const q=c.data[i],th=q.th+t*q.sp,rr=q.r*(1+.03*Math.sin(t*1.3+q.ph)),s=Math.sqrt(1-q.u*q.u);
  let x=Math.cos(th)*s*rr,y=q.u*rr,z=Math.sin(th)*s*rr,sz=q.s;
  if(mode===1){const sd=i%2?-1:1;x=lerp(x,sd*D+r*x,tb);y=lerp(y,r*y,tb);z=lerp(z,r*z,tb);sz*=lerp(1,r,tb);}
  else if(mode===2&&(i%2)!==keep)sz*=grow;
  dummy.position.set(x,y,z);dummy.scale.setScalar(Math.max(sz,1e-4));dummy.updateMatrix();c.ves.setMatrixAt(i,dummy.matrix);}
 c.ves.instanceMatrix.needsUpdate=true;
}

/* product 3D (lazy, only while the detail view is open) */
let P3=null;
function cvTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
const LOGO_IMG=new Image(),MARK_IMG=new Image();{const cs=getComputedStyle(document.documentElement),u=v=>(v.match(/url\(["']?([^"')]+)/)||[])[1]||'';LOGO_IMG.src=u(cs.getPropertyValue('--logo'));MARK_IMG.src=u(cs.getPropertyValue('--mark'));}
const imgOk=i=>i.complete&&i.naturalWidth>0;
const FD='"Schibsted Grotesk", Arial, sans-serif', FM='"IBM Plex Mono", Menlo, monospace';
function gradFill(g,x0,y0,x1,y1){const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,'#104068');gr.addColorStop(1,'#209098');return gr;}
function buildSyringe(){
 const outer=new THREE.Group(),inner=new THREE.Group();outer.add(inner);
 const glass=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.04,transparent:true,opacity:.26,clearcoat:1,clearcoatRoughness:.03,ior:1.5,envMapIntensity:1.8,side:THREE.DoubleSide,depthWrite:false});
 const glassRim=glass.clone();glassRim.opacity=.55;
 const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,3,72,1,true),glass);barrel.renderOrder=5;inner.add(barrel);
 [-1.5,1.5].forEach(y=>{const r=new THREE.Mesh(new THREE.TorusGeometry(.34,.022,12,72),glassRim);r.rotation.x=Math.PI/2;r.position.y=y;r.renderOrder=6;inner.add(r);});
 const liquid=new THREE.Mesh(new THREE.CylinderGeometry(.305,.305,2.0,64),new THREE.MeshPhysicalMaterial({color:'#DDEFF2',transparent:true,opacity:.6,roughness:.12,clearcoat:.6,sheen:.5,sheenColor:new THREE.Color('#ffffff')}));liquid.position.y=-.45;liquid.renderOrder=1;inner.add(liquid);
 const rubber=new THREE.MeshPhysicalMaterial({color:'#1E2440',roughness:.45,clearcoat:.35});
 const stop=new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,.26,48),rubber);stop.position.y=.68;inner.add(stop);
 [.58,.78].forEach(y=>{const t=new THREE.Mesh(new THREE.TorusGeometry(.31,.028,10,48),rubber);t.rotation.x=Math.PI/2;t.position.y=y;inner.add(t);});
 const plastic=new THREE.MeshPhysicalMaterial({color:'#F2F4FF',roughness:.22,transparent:true,opacity:.92,clearcoat:.8});
 const rod=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,1.7,32),plastic);rod.position.y=1.6;inner.add(rod);
 const press=new THREE.Mesh(new THREE.CylinderGeometry(.44,.44,.07,64),plastic);press.position.y=2.45;inner.add(press);
 const flange=new THREE.Mesh(new THREE.CylinderGeometry(.82,.82,.08,64),glassRim);flange.scale.z=.42;flange.position.y=1.52;flange.renderOrder=6;inner.add(flange);
 const tip=new THREE.Mesh(new THREE.CylinderGeometry(.1,.24,.3,48),glassRim);tip.position.y=-1.65;tip.renderOrder=6;inner.add(tip);
 const capM=new THREE.MeshPhysicalMaterial({color:'#EEF1FA',roughness:.32,clearcoat:.6});
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(.17,.19,.95,48),capM);cap.position.y=-2.28;inner.add(cap);
 const band=new THREE.Mesh(new THREE.CylinderGeometry(.196,.196,.12,48),new THREE.MeshPhysicalMaterial({color:'#104068',roughness:.28,metalness:.2,clearcoat:1}));band.position.y=-1.9;inner.add(band);
 const lt=cvTex(1024,512,(g)=>{
  g.clearRect(0,0,1024,512);
  g.fillStyle='rgba(255,255,255,.97)';g.fillRect(20,0,460,512);
  g.fillStyle=gradFill(g,20,0,480,0);g.fillRect(20,440,460,72);g.fillRect(20,0,460,8);
  g.save();g.translate(250,250);g.rotate(-Math.PI/2);g.scale(.73,1);g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#0E2235';g.font='800 100px '+FD;g.fillText('REGENFLEX',0,-62);
  g.fillStyle=gradFill(g,-200,0,200,0);g.font='700 70px '+FD;g.fillText('32 mg',0,32);
  if(imgOk(LOGO_IMG))g.drawImage(LOGO_IMG,-100,92,200,48.5);g.fillStyle='#46596B';g.font='500 20px '+FM;g.fillText('TEMSİLİ ETİKET',0,166);
  g.restore();
  g.fillStyle='rgba(16,22,46,.6)';for(let i=0;i<=10;i++){g.fillRect(500,50+i*38,i%5===0?90:50,4);}
 });
 const label=new THREE.Mesh(new THREE.CylinderGeometry(.346,.346,1.5,72,1,true),new THREE.MeshPhysicalMaterial({map:lt,transparent:true,roughness:.35,clearcoat:.7,side:THREE.DoubleSide,depthWrite:false}));
 label.position.y=-.35;label.rotation.y=-1.54;label.renderOrder=3;inner.add(label);
 outer.userData={inner,tilt:-.5,scale:.6};return outer;
}
function buildBox(){
 const outer=new THREE.Group(),inner=new THREE.Group();outer.add(inner);
 const front=cvTex(600,1000,(g,w,h)=>{
  const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#FFFFFF');bg.addColorStop(1,'#E3F1F3');g.fillStyle=bg;g.fillRect(0,0,w,h);
  const rg=g.createRadialGradient(440,330,10,440,330,210);rg.addColorStop(0,'rgba(32,144,152,.45)');rg.addColorStop(.7,'rgba(16,64,104,.12)');rg.addColorStop(1,'rgba(16,64,104,0)');g.fillStyle=rg;g.beginPath();g.arc(440,330,210,0,7);g.fill();
  g.strokeStyle='rgba(16,64,104,.3)';g.lineWidth=2;g.beginPath();g.arc(440,330,160,0,7);g.stroke();if(imgOk(MARK_IMG))g.drawImage(MARK_IMG,402,259,76,142.7);
  if(imgOk(LOGO_IMG))g.drawImage(LOGO_IMG,52,58,236,57.3);else{g.fillStyle='#104068';g.font='700 34px '+FD;g.fillText('intrafarma',56,96);}g.fillStyle='#0E2235';
  g.font='800 104px '+FD;g.fillText('Regenflex',50,590);
  g.fillStyle=gradFill(g,50,0,360,0);g.font='700 84px '+FD;g.fillText('32 mg',52,685);
  g.fillStyle='rgba(16,22,46,.2)';g.fillRect(56,730,488,2);
  g.fillStyle='#4A5372';g.font='500 24px '+FM;g.fillText('Temsili ambalaj',56,780);g.fillText('Representative pack',56,814);
  g.fillStyle=gradFill(g,0,0,w,0);g.fillRect(0,880,w,120);
  g.fillStyle='#FFFFFF';g.font='500 22px '+FM;g.fillText('SAĞLIK ÇALIŞANLARI İÇİN',56,950);
 });
 const side=cvTex(300,1000,(g,w,h)=>{g.fillStyle=gradFill(g,0,0,0,h);g.fillRect(0,0,w,h);g.save();g.translate(150,500);g.rotate(-Math.PI/2);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font='800 72px '+FD;g.fillText('REGENFLEX',0,-20);g.font='500 30px '+FM;g.fillText('32 mg',0,50);g.restore();if(imgOk(MARK_IMG)){g.globalAlpha=.9;g.drawImage(MARK_IMG,124,60,52,97.7);g.globalAlpha=1;}});
 const back=cvTex(600,1000,(g,w,h)=>{g.fillStyle='#F7F8FD';g.fillRect(0,0,w,h);g.fillStyle='rgba(16,22,46,.12)';for(let i=0;i<14;i++)g.fillRect(56,120+i*48,i%4===3?300:488,10);g.fillStyle=gradFill(g,0,0,w,0);g.fillRect(0,880,w,120);});
 const M=m=>new THREE.MeshPhysicalMaterial({map:m,roughness:.3,clearcoat:1,clearcoatRoughness:.12});
 const plain=new THREE.MeshPhysicalMaterial({color:'#F4F6FD',roughness:.3,clearcoat:1});
 const box=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.5,.62),[M(side),M(side),plain,plain,M(front),M(back)]);
 inner.add(box);outer.userData={inner,tilt:-.1,scale:1};return outer;
}
function initProd(){
 const cv=document.getElementById('prodCv');
 const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
 r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25));r.toneMapping=THREE.ACESFilmicToneMapping;r.outputColorSpace=THREE.SRGBColorSpace;r.setClearColor(0x000000,0);
 const sc=new THREE.Scene();const pm=new THREE.PMREMGenerator(r);sc.environment=pm.fromScene(new RoomEnvironment(r),0.04).texture;
 const cm=new THREE.PerspectiveCamera(28,1,.1,60);cm.position.set(0,0,9);
 const k=new THREE.DirectionalLight(0xffffff,2.2);k.position.set(-3,5,4);sc.add(k);
 const rl=new THREE.DirectionalLight(0x8fd6d8,2);rl.position.set(4,1,-3);sc.add(rl);
 const fl=new THREE.DirectionalLight(0xa8dcf0,.8);fl.position.set(3,-3,3);sc.add(fl);
 const models=[buildSyringe(),buildBox()];models.forEach(m=>sc.add(m));models[1].visible=false;
 const st={cur:0,sw:0,rotY:.6,rotX:0,vel:0,drag:false,lx:0,ly:0,last:performance.now()};
 const fit=()=>{const w=cv.clientWidth||1,h=cv.clientHeight||1;r.setSize(w,h,false);cm.aspect=w/h;cm.position.z=9*Math.max(1,.78/cm.aspect);cm.updateProjectionMatrix();};
 new ResizeObserver(fit).observe(cv);fit();
 cv.addEventListener('pointerdown',e=>{st.drag=true;st.lx=e.clientX;st.ly=e.clientY;cv.setPointerCapture(e.pointerId);});
 cv.addEventListener('pointermove',e=>{if(!st.drag)return;const dx=e.clientX-st.lx,dy=e.clientY-st.ly;st.lx=e.clientX;st.ly=e.clientY;st.vel=dx*.012;st.rotY+=st.vel;st.rotX=clamp(st.rotX+dy*.006,-.5,.5);});
 const end=()=>{st.drag=false;};cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
 const backOut=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);};
 return {render(t){
  const now=performance.now(),dt=Math.min(.1,(now-st.last)/1000);st.last=now;
  const target=IF.prodView||0;
  if(target!==st.cur){st.sw-=dt*4;if(st.sw<=0){st.sw=0;st.cur=target;models.forEach((m,i)=>m.visible=i===st.cur);}}
  else st.sw=Math.min(1,st.sw+dt*2.2);
  if(!st.drag){st.rotY+=st.vel+(IF.prodSpin?.006*SPD:0);st.vel*=.93;st.rotX*=.95;}
  const m=models[st.cur],u=m.userData;
  m.rotation.z=u.tilt;m.rotation.x=st.rotX;u.inner.rotation.y=st.rotY;
  m.position.y=Math.sin(t*1.2)*.07;m.scale.setScalar(u.scale*Math.max(.001,backOut(st.sw)));
  r.render(sc,cm);
 }};
}

const clock=new THREE.Clock();
let visible=true,fAvg=16,fLast=performance.now(),fCount=0,skip=0;
new IntersectionObserver(es=>{visible=es[0].isIntersecting;},{threshold:0}).observe(stage);
function frame(){
 requestAnimationFrame(frame);
 const now=performance.now(),fd=now-fLast;fLast=now;fAvg=fAvg*.92+fd*.08;
 if(++fCount%60===0&&fAvg>21&&DPR>.65){DPR=Math.max(.65,DPR-.15);renderer.setPixelRatio(DPR);resize();}
 if(!visible)return;
 if(IF.zoomOpen){if(!P3)P3=initProd();P3.render(clock.getElapsedTime()*SPD);if((skip++)%4)return;}
 else if(IF.catOpen&&(skip++)%4)return;
 const t=clock.getElapsedTime()*SPD;U.uTime.value=t;bgMat.uniforms.uTime.value=t;cpMat.uniforms.uTime.value=t;
 const cmp=IF.mode==='compare';
 const s=IF.mode==='transition'?IF.p:(IF.mode==='pro'?1:0);
 const P=L.pub,Q=L.pro;
 const breath=1+.022*Math.sin(t*1.1);
 let ax,ay,aR,showB=false,bx=0,by=0,bR=0;
 const S1=.48,SNAP=.78,DR=.68;
 /* phase: 0 interphase · 1 dividing (one membrane) · 2 two daughters */
 let ph=0,u=0,dn=0,nucK=1,grow=1,Dd=0,tb=0,glow=0;
 if(!cmp&&s>0&&s<S1){u=s/S1;ph=u<SNAP?1:2;}else if(!cmp&&s>=S1&&s<1)ph=2;
 const cx=P.x-P.R*.32*sst(.05,SNAP,Math.min(1,s/S1));
 if(ph===1){
  tb=sst(.08,.42,u);
  const rt=lerp(.6,.035,ease(clamp((u-.12)/.5)));
  const th0=Math.asin(Math.min(.999,rt/DR));
  Dd=DR*Math.cos(th0)+.07+sst(.56,SNAP,u)*.13;
  glow=sst(.5,SNAP,u)*.55;{const sp=toPx(cx,P.y);IF.revealC.x=sp.x;IF.revealC.y=sp.y;}
  U.uSplit.value=tb;U.uDiv.value.set(Dd,rt,DR);
  dn=Dd*sst(.04,.45,u);nucK=lerp(1,DR,sst(.04,.45,u));
  ax=cx;ay=P.y;aR=P.R;
 }else{U.uSplit.value=0;}
 if(ph===2){
  const th0=Math.asin(.035/DR),Dsnap=DR*Math.cos(th0)+.2;
  const uu=s<S1?(s/S1-SNAP)/(1-SNAP):1;Dd=Dsnap+.1*ease(clamp(uu));
  const b=s<S1?0:ease((s-S1)/(1-S1));grow=b;
  const d0=Dd*P.R,r0=DR*P.R;
  ax=lerp(cx+d0,Q.x,b);ay=lerp(P.y,Q.y,b);aR=lerp(r0,Q.R,b);
  if(b<.999){showB=true;bx=lerp(cx-d0,cx-P.R*2.4,b);by=lerp(P.y,P.y-P.R*1.2,b);bR=r0*(1-b*.92);}
 }
 if(ph===0&&!cmp){if(s>=1){ax=Q.x;ay=Q.y;aR=Q.R;}else{ax=P.x;ay=P.y;aR=P.R;}}
 if(cmp){ax=(IF.cmpX/W-.5)*vw;ay=(.5-.48)*vh;aR=P.R*.78;}
 if(ph===2&&!snapped){snapped=true;flashT=t;U.uRip.value[0].set(-1,0,0,t);U.uRip.value[1].set(1,0,0,t);U.uRip.value[2].set(0,1,0,t+.12);ripIdx=3;}
 if(s===0){snapped=false;flashT=-99;}
 const fl=Math.max(glow,flashT>-50?Math.exp(-Math.max(0,t-flashT)*2.6):0);
 MU.uGlow.value=fl;bgMat.uniforms.uFlash.value=fl;
 {const fp=toPx(cx,P.y),k=renderer.getPixelRatio()*RTS;if(ph===1)bgMat.uniforms.uFC.value.set(fp.x*k,(H-fp.y)*k);}
 A.g.position.set(ax,ay,0);A.g.scale.setScalar(aR*breath);
 B.g.visible=showB;if(showB){B.g.position.set(bx,by,0);B.g.scale.setScalar(bR*breath);}

 const ct=cmp?.5:clamp((s-.3)/.7);
 MU.uTint.value.copy(ATT_PUB).lerp(ATT_PRO,ct);MU.uRim.value.copy(RIM_PUB).lerp(RIM_PRO,ct);nucMat.color.copy(NUC_PUB).lerp(NUC_PRO,ct);

 const ptr=IF.ptr;let target=0;
 if(ptr.in&&IF.mode!=='transition'){const d=dirFor(ptr.x,ptr.y,ax,ay,aR,A.mem);target=clamp((2.1-d)/1.1);if(target>0)ptrDir.lerp(tmpV,.25).normalize();}
 ptrAmt+=(target-ptrAmt)*.08;U.uPtrAmt.value=ptrAmt*(ptr.touch?.5:1);U.uPtrDir.value.copy(ptrDir);
 IF.near=ptrAmt;
 while(IF.ripples.length){const r=IF.ripples.shift();const d=dirFor(r.x,r.y,ax,ay,aR,A.mem);if(d<2.4){U.uRip.value[ripIdx].set(tmpV.x,tmpV.y,tmpV.z,t);ripIdx=(ripIdx+1)%4;}}

 nt.set(0,0,0);if(ptr.in){const wx=(ptr.x/W-.5)*vw,wy=(.5-ptr.y/H)*vh;nt.set(clamp((wx-ax)/aR*.09,-.1,.1),clamp((wy-ay)/aR*.09,-.1,.1),.04);}
 const pulse=1+.03*Math.sin(t*1.7);
 if(ph===1){
  /* nucleus pulls apart into two, joined by a thinning chromatin bridge that finally snaps */
  if(IF.mode==='transition')nt.set(0,0,0);
  A.nuc.position.set(dn,0,.02);A.nuc2.position.set(-dn,0,.02);A.nuc2.visible=true;
  const nr=.36*nucK*pulse;A.nuc.scale.set(nr*(1+.18*sst(.02,.25,u)*(1-sst(.3,.6,u))),nr,nr);A.nuc2.scale.copy(A.nuc.scale);
  const bw=.075*(1-sst(.24,.44,u)),len=2*dn-nr*1.2;
  A.br.visible=bw>.004&&len>.01&&u>.08;if(A.br.visible){A.br.position.set(0,0,.02);A.br.scale.set(len,bw*(1+.6*sst(.08,.2,u)),bw);}
  A.nl.scale.setScalar(.11*(1-sst(.02,.15,u)));A.nl.position.set(A.nuc.position.x+.09,.1,.24);
  updVes(A,t,1,tb,Dd,DR);
 }else{
  A.nuc2.visible=false;A.br.visible=false;
  if(ph===2)A.nuc.position.set(0,0,.02);else A.nuc.position.lerp(nt,.06);
  A.nl.position.set(A.nuc.position.x*1.6+.09,A.nuc.position.y*1.6+.1,.24);
  A.nuc.scale.setScalar(.36*pulse);
  const ng=ph===2?grow:1;A.nl.scale.setScalar(.11*ng);B.nl.scale.setScalar(.11*ng);B.nl.position.set(.09,.1,.24);
  if(ph===2){updVes(A,t,2,0,0,1,0,grow);updVes(B,t,2,0,0,1,1,0);}else updVes(A,t);
 }

 const pxo=ptr.in?(ptr.x/W-.5):0,pyo=ptr.in?(ptr.y/H-.5):0;
 exo.forEach(e=>{const k=(e.z+4)*.06;e.m.position.set((e.fx-.5)*vw+Math.sin(t*.4+e.ph)*.12-pxo*k,(.5-e.fy)*vh+Math.cos(t*.33+e.ph)*.12+pyo*k,e.z);e.m.scale.setScalar(e.s*vh*.18*(1+.04*Math.sin(t+e.ph)));});

 const sc=toPx(ax,ay);IF.cell={x:sc.x,y:sc.y,r:aR/vh*H};
 const pr=renderer.getPixelRatio()*RTS;
 if(ptr.in){bgMat.uniforms.uPtr.value.set(ptr.x*pr,(H-ptr.y)*pr);}
 bgMat.uniforms.uPtrOn.value+=((ptr.in&&!IF.overlay?1:0)-bgMat.uniforms.uPtrOn.value)*.06;
 bgMat.uniforms.uCell.value.set(sc.x*pr,(H-sc.y)*pr);
 bgMat.uniforms.uC.value.set(IF.revealC.x*pr,(H-IF.revealC.y)*pr);
 bgMat.uniforms.uR.value=IF.revealR*pr;
 bgMat.uniforms.uPro.value=IF.mode==='pro'?1:0;
 bgMat.uniforms.uCmp.value=cmp?1:0;bgMat.uniforms.uSX.value=IF.cmpX*pr;

 {let os=1;if(ph===1)os=1-sst(0,.3,u);else if(ph===2)os=grow;A.org.visible=os>.01;A.org.scale.setScalar(Math.max(os,1e-3));A.org.rotation.y=Math.sin(t*.16)*.3;B.org.visible=false;}
 const showA=(IF.mode==='public'||IF.mode==='pro')&&W>=760&&!IF.overlay;
 const orgOn=showA&&IF.mode==='public'&&IF.near>.3;
 {A.g.updateMatrixWorld(true);const pos={};
  const wp=(v,o)=>{tmpV.copy(v);o.localToWorld(tmpV);return toPx(tmpV.x,tmpV.y);};
  pos.c_hint=wp(ANCH.hint,A.g);pos.o_nuc=wp(OLOC.o_nuc,A.g);
  {let best=null;A.mpos.forEach(mp=>{const q=wp(mp,A.org);if(!best||q.x-q.y*.4>best.x-best.y*.4)best=q;});pos.o_mito=best;}
  pos.o_er=wp(A.anch.er,A.org);pos.o_golgi=wp(A.anch.golgi,A.org);pos.o_ecm=wp(ANCH.ecm,A.g);pos.o_gf=wp(ANCH.gf,A.g);
  pos._nc=wp(A.nuc.position,A.g);pos._nr=.36*aR/vh*H;OPOS=pos;IF.opos=pos;
  OLAB.forEach(el=>{const p=pos.c_hint;const txt=IF.tr('c_hint');const sp=el.lastChild;if(sp.textContent!==txt)sp.textContent=txt;
   el.style.opacity=(showA&&IF.mode==='public'&&IF.near<.15&&!IF.ptr.touch&&!IF.tour)?1:0;
   el.style.transform='translate('+(W/2).toFixed(1)+'px,22px) translateX('+(document.documentElement.dir==='rtl'?'50%':'-50%')+')';});
  const mkOn=IF.mode==='public'&&!IF.overlay&&ecmA>.5;
  MK.forEach(el=>{const p=pos[el.dataset.o];el.style.opacity=mkOn?1:0;el.style.transform='translate('+p.x.toFixed(1)+'px,'+p.y.toFixed(1)+'px) translate(-50%,-50%)';});
  /* leader lines from each card to its marker */
  const llOn=mkOn&&innerWidth>=1180;LL.style.opacity=llOn?1:0;
  if(llOn){if(!(llN++%45)||!llR){const sr=stage.getBoundingClientRect();llR={};OCC.forEach(c=>{const r=c.getBoundingClientRect(),left=r.left+r.width/2<sr.left+sr.width/2;llR[c.dataset.o]={x:(left?r.right:r.left)-sr.left,y:r.top+24-sr.top,d:left?1:-1};});}
   MKK.forEach((k,i)=>{const a=llR[k],p=pos[k];if(!a||!p)return;const mx=a.x+a.d*22;LLP[i].setAttribute('d','M'+a.x.toFixed(1)+' '+a.y.toFixed(1)+'H'+mx.toFixed(1)+'L'+p.x.toFixed(1)+' '+p.y.toFixed(1));});}}
 const isPro=IF.mode==='pro';
 [[an1,-1.12,'an1','an3'],[an2,0.98,'an2','an4'],[an5,2.35,'an1','an1'],[an6,-2.25,'an2','an2']].forEach(([el,ang,a,b])=>{const lf=el.classList.contains('l');
  const p=toPx(ax+Math.cos(ang)*aR*1.02,ay-Math.sin(ang)*aR*1.02);
  const txt=IF.tr(isPro?b:a);const sp=el.lastChild;if(sp.textContent!==txt)sp.textContent=txt;
  const ok=showA&&(lf?p.x>230:p.x<W-210)&&isPro;el.style.opacity=ok?1:0;
  el.style.transform='translate('+p.x.toFixed(1)+'px,'+(p.y-5).toFixed(1)+'px)'+(lf?' translate(-100%,0)':'');});

 cam.layers.set(1);renderer.setRenderTarget(rt);renderer.render(scene,cam);
 cam.layers.set(0);renderer.setRenderTarget(null);renderer.render(scene,cam);

 {const LZ=IF.lens,cr=aR/vh*H;let on=false;
  if(LZ&&LZ.show&&!ptr.touch&&(IF.mode==='public'||IF.mode==='pro')&&!IF.overlay)on=Math.hypot(LZ.x-sc.x,LZ.y-sc.y)<cr*.98+LZ.L*.5;
  lensA+=((on?1:0)-lensA)*.2;
  if(lensA>.01&&LZ){
   const pr=renderer.getPixelRatio(),Lp=Math.max(8,Math.round(LZ.L*pr)),vwid=LZ.L/LZ.z;
   if(lensRT.width!==Lp)lensRT.setSize(Lp,Lp);
   cam.setViewOffset(W,H,LZ.x-vwid/2,LZ.y-vwid/2,vwid,vwid);bg.visible=false;const ev=ECM.visible,gv=GF.visible;ECM.visible=false;GF.visible=false;
   cam.layers.set(1);renderer.setRenderTarget(lensRT);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(scene,cam);
   renderer.setClearColor(0x000000,1);bg.visible=true;ECM.visible=ev;GF.visible=gv;cam.clearViewOffset();cam.layers.set(0);renderer.setRenderTarget(null);
   const u=lensMat.uniforms;u.uLC.value.set(LZ.x*pr,(H-LZ.y)*pr);u.uLR.value=LZ.L*pr/2;u.uCC.value.set(sc.x*pr,(H-sc.y)*pr);u.uCR.value=cr*pr;u.uZ.value=LZ.z;u.uA.value=lensA;
   renderer.autoClear=false;renderer.render(lensScene,cam);renderer.autoClear=true;
  }}

 {const on=IF.mode==='public'&&!cmp;ecmA+=((on?1:0)-ecmA)*(on?.06:.15);const vis=ecmA>.01;
  ECM.visible=vis;ecmMat.opacity=ecmA;GF.visible=vis;
  if(vis){for(let i=0;i<GFN;i++){const q=gfD[i],th=q.a+t*q.sp,sy=Math.sqrt(1-q.y*q.y),rr=q.r+.03*Math.sin(t*.8+q.a);
    dummy.position.set(Math.cos(th)*sy*rr,q.y*rr*.92,Math.sin(th)*sy*rr);dummy.scale.setScalar(q.s*ecmA);dummy.updateMatrix();GF.setMatrixAt(i,dummy.matrix);}
   GF.instanceMatrix.needsUpdate=true;}
  EXV.forEach(e=>{const u=(t*.075+e.off)%1;e.m.visible=vis;e.m.position.copy(e.dir).multiplyScalar(.9+u*1.05);e.m.scale.setScalar(Math.max(1e-4,.04*Math.sin(Math.PI*u)*ecmA));});
  const wide=innerWidth>=1180,showOC=!wide||(IF.mode==='public'&&W>=760&&!IF.overlay);OCW.forEach(w=>{const v=showOC?'1':'0';if(w.style.opacity!==v)w.style.opacity=v;});
  let best=null;const LZ=IF.lens;
  if(LZ&&LZ.show&&!ptr.touch&&IF.mode==='public'&&OPOS&&ecmA>.5){const cr=aR/vh*H;
   if(Math.hypot(LZ.x-OPOS._nc.x,LZ.y-OPOS._nc.y)<OPOS._nr*.85)best='o_nuc';else if(Math.hypot(LZ.x-sc.x,LZ.y-sc.y)<cr*1.5){let bd=Math.max(90,LZ.L*.95);MKK.forEach(k=>{const p=OPOS[k];if(!p)return;const d=Math.hypot(p.x-LZ.x,p.y-LZ.y);if(d<bd){bd=d;best=k;}});}}
  if(IF.tour)best=IF.tour.key||null;
  if(!best&&innerWidth<1180&&IF.mobKey)best=IF.mobKey;
  OCC.forEach(c=>{const o=c.dataset.o===best;if(c.classList.contains('on')!==o)c.classList.toggle('on',o);});
  MK.forEach(m=>{const o=m.dataset.o===best;if(m.classList.contains('on')!==o)m.classList.toggle('on',o);});
  LLP.forEach(m=>{const o=m.dataset.o===best;if(m.classList.contains('on')!==o)m.classList.toggle('on',o);});}
 if(!stage.classList.contains('gl-on'))stage.classList.add('gl-on');
}
requestAnimationFrame(frame);
