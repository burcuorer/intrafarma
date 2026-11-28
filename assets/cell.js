

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
let DPR=Math.min(window.devicePixelRatio||1,1.5);renderer.setPixelRatio(DPR);
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
let RTS=0.6;
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
  float t=uTime*0.012;vec2 q=uv*vec2(uRes.x/uRes.y,1.0)*1.7;
  float n=fbm(q+vec2(t,-t*0.6)+fbm(q*1.3-t)*1.2);float m=fbm(q*0.7+vec2(-t*0.5,t)+3.1);
  vec3 c=mix(vec3(0.07,0.23,0.40),vec3(0.09,0.44,0.48),smoothstep(0.22,0.62,m));
  c=mix(c,vec3(0.26,0.66,0.53),smoothstep(0.40,0.74,n)*0.8);
  c=mix(c,vec3(0.58,0.87,0.73),smoothstep(0.62,0.86,n)*0.42);
  float dc=distance(px,uCell)/uRes.y;
  c=mix(c,vec3(0.55,0.86,0.80),smoothstep(0.55,0.04,dc)*0.16);
  c+=waves(uv,n,m,pl)*0.045*vec3(0.80,1.0,0.95);
  c+=pl*0.02;
  c*=1.0-0.28*smoothstep(0.45,0.95,distance(uv,vec2(0.5)));
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

/* ===== Revize 8: eksozom videosundaki hücre. Organel kartları yok; hücreye tıklayınca eksozom tomurcuklanıp kopar,
   eksozoma tıklayınca büyüteçte içindekiler görünür. Pro geçişinde aynı hücre ikiye bölünür, Pro alanında da aynı hücre durur. ===== */
document.documentElement.classList.add('c3');
const NR=.30,HC=1.102,EXR=.12;
let seed=11;const rnd=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
const PERM=new Uint8Array(512);{const p=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(rnd()*(i+1));[p[i],p[j]]=[p[j],p[i]];}for(let i=0;i<512;i++)PERM[i]=p[i&255];}
const fadeN=t=>t*t*t*(t*(t*6-15)+10);
const gradN=(h,x,y,z)=>{h&=15;const u=h<8?x:y,v=h<4?y:(h===12||h===14?x:z);return((h&1)?-u:u)+((h&2)?-v:v);};
function pn(x,y,z){const P=PERM,X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);const u=fadeN(x),v=fadeN(y),w=fadeN(z);const A_=P[X]+Y,AA=P[A_]+Z,AB=P[A_+1]+Z,B_=P[X+1]+Y,BA=P[B_]+Z,BB=P[B_+1]+Z;
return lerp(lerp(lerp(gradN(P[AA],x,y,z),gradN(P[BA],x-1,y,z),u),lerp(gradN(P[AB],x,y-1,z),gradN(P[BB],x-1,y-1,z),u),v),lerp(lerp(gradN(P[AA+1],x,y,z-1),gradN(P[BA+1],x-1,y,z-1),u),lerp(gradN(P[AB+1],x,y-1,z-1),gradN(P[BB+1],x-1,y-1,z-1),u),v),w);}
const fbmN=(x,y,z,o=4)=>{let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*pn(x*f,y*f,z*f);f*=2.03;a*=.5;}return s;};
const randDir=()=>{const u=rnd()*2-1,a=rnd()*Math.PI*2,s=Math.sqrt(1-u*u);return new THREE.Vector3(s*Math.cos(a),u,s*Math.sin(a));};
function mergeV(g){const p=g.attributes.position,map=new Map(),pos=[],idx=[];for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=Math.round(x*1e4)+'_'+Math.round(y*1e4)+'_'+Math.round(z*1e4);let j=map.get(k);if(j===undefined){j=pos.length/3;map.set(k,j);pos.push(x,y,z);}idx.push(j);}const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setIndex(idx);return o;}
function bumpy(detail,amt,f=3,off=0){const g=mergeV(new THREE.IcosahedronGeometry(1,detail));const p=g.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);v.multiplyScalar(1+amt*fbmN(v.x*f+off,v.y*f,v.z*f,3));p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return g;}
const UPV=new THREE.Vector3(0,1,0),ZV=new THREE.Vector3(0,0,1),D3=new THREE.Object3D();
function inst(geo,mat,n,fill){const m=new THREE.InstancedMesh(geo,mat,n);for(let i=0;i<n;i++){D3.position.set(0,0,0);D3.quaternion.identity();D3.scale.set(1,1,1);fill(D3,i);D3.updateMatrix();m.setMatrixAt(i,D3.matrix);}m.instanceMatrix.needsUpdate=true;return m;}
const phys=(c,o={})=>new THREE.MeshPhysicalMaterial(Object.assign({color:c,roughness:.5,sheen:.6,sheenRoughness:.5,sheenColor:0xffffff,clearcoat:.25,clearcoatRoughness:.35,envMapIntensity:.8},o));
const L1=o=>{o.traverse(x=>x.layers.set(1));return o;};

const NOISEF=`vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;
const U={uTime:{value:0},uSplit:{value:0},uDiv:{value:new THREE.Vector3(.4,.6,.68)},uPtrDir:{value:new THREE.Vector3(0,0,1)},uPtrAmt:{value:0},uRip:{value:[0,1,2,3].map(()=>new THREE.Vector4(0,0,1,-99))},uBud:{value:[0,1,2,3].map(()=>new THREE.Vector4(0,1,0,-99))},uNM:{value:new THREE.Matrix3()}};
const SNOISE=NOISEF+`
uniform float uTime;uniform float uSplit;uniform vec3 uDiv;uniform vec3 uPtrDir;uniform float uPtrAmt;uniform vec4 uRip[4];uniform vec4 uBud[4];varying vec3 vObj;
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
/* a bud: the membrane around axis b.xyz grows into a vesicle on a narrowing neck, then snaps back when it is released */
vec3 budApply(vec3 q,vec3 p,vec4 b){float t=uTime-b.w;if(t<0.0||t>2.1)return q;
 float g=t<1.5?smoothstep(0.0,1.5,t):1.0-smoothstep(1.5,1.95,t);vec3 ax=b.xyz;float c=clamp(dot(p,ax),-1.0,1.0);float a=acos(c);
 const float SIG=0.27;if(a>=SIG)return q;float u=a/SIG;vec3 tv=p-ax*c;float tl=length(tv);vec3 td=tl>1e-5?tv/tl:vec3(0.0);
 const float RB=0.12;const float HC=1.102;const float UC=0.78;const float TH=2.55;vec3 tg;
 if(u<UC){float th=u/UC*TH;tg=ax*(HC+RB*cos(th))+td*(RB*sin(th));}else{float k=smoothstep(0.0,1.0,(u-UC)/(1.0-UC));vec3 n0=ax*(HC+RB*cos(TH))+td*(RB*sin(TH));tg=mix(n0,p,k);}
 return mix(q,tg,g);}
vec3 dispF(vec3 p){
 float ca=cos(uTime*0.08),sa=sin(uTime*0.08);vec3 pn=vec3(ca*p.x+sa*p.z,p.y,-sa*p.x+ca*p.z);
 float n=snoise(pn*1.05+vec3(0.0,0.0,uTime*0.18))*0.034+snoise(pn*0.55+vec3(uTime*0.07))*0.016+snoise(pn*3.2-vec3(uTime*0.2))*0.008;
 float dd=distance(p,uPtrDir);
 float bulge=uPtrAmt*exp(-dd*dd*6.0)*0.08;
 float r=0.0;
 for(int i=0;i<4;i++){float age=uTime-uRip[i].w;if(age>0.0&&age<3.0){float d2=distance(p,uRip[i].xyz);float fr=age*0.95;r+=sin((d2-fr)*16.0)*exp(-age*1.4)*exp(-pow(d2-fr,2.0)*7.0)*0.04;}}
 float k=1.0+n+bulge+r;
 vec3 q=p;for(int i=0;i<4;i++)q=budApply(q,p,uBud[i]);
 q*=k;
 if(uSplit>0.0)q=mix(q,dumb(p)*k,uSplit);
 return q;
}`;
const NORMAL_CODE=`
vec3 nrm0=normalize(position);
vec3 tg=normalize(cross(nrm0,abs(nrm0.y)<0.99?vec3(0.0,1.0,0.0):vec3(1.0,0.0,0.0)));
vec3 bt=cross(nrm0,tg);
vec3 dispP=dispF(nrm0);
vec3 dA=dispF(normalize(nrm0+tg*0.005));
vec3 dB=dispF(normalize(nrm0+bt*0.005));
vec3 objectNormal=normalize(cross(dA-dispP,dB-dispP));
if(dot(objectNormal,dispP-vec3(sign(position.x)*uDiv.x*uSplit,0.0,0.0))<0.0&&uSplit>0.0)objectNormal=-objectNormal;
vObj=dispP;
#ifdef USE_TANGENT
vec3 objectTangent=vec3(tangent.xyz);
#endif`;
const ATT_PUB=new THREE.Color('#D2F6EC'),ATT_PRO=new THREE.Color('#BFEFEF');
const MU={uRT:{value:rt.texture},uFull:{value:new THREE.Vector2(1,1)},uTint:{value:new THREE.Color()},uRim:{value:new THREE.Color()},uGlow:{value:0}};
const RIM_PUB=new THREE.Color('#7FE6D2'),RIM_PRO=new THREE.Color('#0F4A70');
const memMat=new THREE.MeshPhysicalMaterial({color:0x000000,roughness:0.07,iridescence:.2,iridescenceIOR:1.28,iridescenceThicknessRange:[140,640],clearcoat:.6,clearcoatRoughness:0.06,envMapIntensity:1.0,specularIntensity:.8});
memMat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U,MU);
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uRT;uniform vec2 uFull;uniform vec3 uTint;uniform vec3 uRim;uniform float uGlow;uniform float uTime;uniform mat3 uNM;varying vec3 vObj;\n'+NOISEF+'\nfloat rid(vec3 q){return 1.0-abs(snoise(q));}')
 .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 {vec3 q=vObj*6.5+vec3(0.0,uTime*0.1,uTime*0.04);float n0=rid(q);vec3 gr=vec3(rid(q+vec3(.02,0.,0.))-n0,rid(q+vec3(0.,.02,0.))-n0,rid(q+vec3(0.,0.,.02))-n0)/.02;vec3 gv=uNM*gr;normal=normalize(normal-(gv-dot(gv,normal)*normal)*0.026);}`)
 .replace('#include <opaque_fragment>',`{
  vec2 suv=gl_FragCoord.xy/uFull;vec3 nv=normalize(normal);
  float ndv=clamp(abs(dot(nv,geometryViewDir)),0.0,1.0);float fr=pow(1.0-ndv,2.4);
  vec2 off=nv.xy*(0.03+0.05*fr);
  vec3 rf=vec3(texture2D(uRT,suv-off*0.94).r,texture2D(uRT,suv-off).g,texture2D(uRT,suv-off*1.06).b);
  rf*=mix(vec3(1.0),uTint,0.45+0.3*fr);
  outgoingLight=rf*(1.0-0.5*fr)+uRim*fr*0.75+outgoingLight+uGlow*vec3(0.55,0.9,0.95)*(0.25+fr*1.2);
 }
#include <opaque_fragment>`);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+SNOISE).replace('#include <beginnormal_vertex>',NORMAL_CODE).replace('#include <begin_vertex>','vec3 transformed=dispP;');};
const memGeo=new THREE.SphereGeometry(1,128,96).rotateZ(Math.PI/2);
const _m4=new THREE.Matrix4();
const NUC_PUB=new THREE.Color('#FFFFFF'),NUC_PRO=new THREE.Color('#EDE7FF');
const nucMat=phys(0xffffff,{vertexColors:true,roughness:.55,sheen:1,sheenColor:0xffc0dc,clearcoat:.35});
const nlMat=new THREE.MeshBasicMaterial({color:0x000000});
const brMat=phys(0xc0608f,{roughness:.5,sheen:.8,sheenColor:0xffc0dc});
const vesMat=phys(0xffffff,{roughness:.35,clearcoat:.6,sheen:.4});
const sph=new THREE.SphereGeometry(1,24,16);
/* nucleus: lumpy, darker in the creases, with nuclear pores */
const nucR=(x,y,z)=>1+.075*fbmN(x*2.1+3,y*2.1,z*2.1,4)+.03*pn(x*8.5,y*8.5,z*8.5);
const nucGeo=(()=>{const g=mergeV(new THREE.IcosahedronGeometry(1,40));const p=g.attributes.position,col=new Float32Array(p.count*3),c1=new THREE.Color(0x7c2f60),c2=new THREE.Color(0xd77fa9),c=new THREE.Color(),v=new THREE.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).normalize();const r=nucR(v.x,v.y,v.z);c.lerpColors(c1,c2,clamp((r-.94)/.14));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;v.multiplyScalar(r);p.setXYZ(i,v.x,v.y*.92,v.z);}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();return g;})();
const poreGeo=new THREE.TorusGeometry(.053,.018,6,14),poreMat=phys(0x4a1a3e,{roughness:.6,sheen:0,clearcoat:0});
function makeNuc(){const m=new THREE.Mesh(nucGeo,nucMat);m.add(inst(poreGeo,poreMat,46,d=>{const dir=randDir();if(dir.y<-.1)dir.y=-dir.y;dir.normalize();const r=nucR(dir.x,dir.y,dir.z);d.position.copy(dir).multiplyScalar(r);d.position.y*=.92;d.quaternion.setFromUnitVectors(ZV,dir);d.scale.setScalar(.8+rnd()*.6);}));return m;}
/* organelles: folded rough ER with ribosomes, Golgi stacks, ribbed mitochondria, centrioles, lysosomes, small vesicles */
const ER=[];for(let i=0;i<4;i++)ER.push({r0:.37+i*.046,th0:1.2-i*.05,thL:.78+i*.12,ph0:rnd()*6.283,phL:6.283*(.66+rnd()*.22),k:i*1.7});
function erPos(Lr,th,ph,off=0){const e=Math.min(th-Lr.th0,Lr.th0+Lr.thL-th)/.12;const curl=e<1?(1-e)*(1-e)*.03:0;const r=Lr.r0+.017*Math.sin(ph*21+Lr.k)+.006*Math.sin(ph*53+Lr.k*2)+.012*pn(Math.cos(ph)*3,th*3,Lr.k)-curl+off;return new THREE.Vector3(-r*Math.cos(ph)*Math.sin(th),Math.cos(th)*r+.012*Math.sin(ph*9+Lr.k),r*Math.sin(ph)*Math.sin(th));}
const erGeos=ER.map(Lr=>{const g=new THREE.SphereGeometry(1,innerWidth<760?140:200,30,Lr.ph0,Lr.phL,Lr.th0,Lr.thL);const p=g.attributes.position,uv=g.attributes.uv,col=new Float32Array(p.count*3),cA=new THREE.Color(0x9e2d48),cB=new THREE.Color(0xec7a8d),cc=new THREE.Color();
 for(let j=0;j<p.count;j++){const ph=Lr.ph0+uv.getX(j)*Lr.phL,q=erPos(Lr,Lr.th0+(1-uv.getY(j))*Lr.thL,ph);p.setXYZ(j,q.x,q.y,q.z);cc.lerpColors(cA,cB,Math.pow(.5+.5*Math.sin(ph*21+Lr.k),.7));col[j*3]=cc.r;col[j*3+1]=cc.g;col[j*3+2]=cc.b;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();return g;});
const erMat=phys(0xffffff,{vertexColors:true,side:THREE.DoubleSide,roughness:.5,sheen:.8,sheenColor:0xffc8d0,clearcoat:.2});
const riboGeo=new THREE.IcosahedronGeometry(.0055,1),riboMat=phys(0x86233c,{roughness:.55,sheen:.3,clearcoat:0});
const golgiMat=phys(0xf3b23a,{roughness:.42,sheen:.7,sheenColor:0xfff2b0,clearcoat:.35,emissive:0x2a1600,emissiveIntensity:.6}),golgiVes=phys(0xf7c75a,{roughness:.35,clearcoat:.5});
const golgiGeos=[0,1,2,3,4,5].map(k=>{const geo=new THREE.SphereGeometry(1,56,14);const p=geo.attributes.position,v=new THREE.Vector3();const sx=.17-k*.011,sz=.078-k*.005;
 for(let j=0;j<p.count;j++){v.fromBufferAttribute(p,j);const a=Math.atan2(v.z,v.x),rim=Math.hypot(v.x,v.z);const x=v.x*sx,z=v.z*sz;const y=v.y*.02+.007*Math.sin(a*11+k)*rim*rim+x*x*(3.2+k*.25)+z*z*1.2;p.setXYZ(j,x,y+k*.032,z);}
 geo.computeVertexNormals();return geo;});
const icoS=new THREE.IcosahedronGeometry(1,2);
const mitoGeo=(()=>{const g=new THREE.CapsuleGeometry(.032,.12,10,24);const p=g.attributes.position,v=new THREE.Vector3();for(let j=0;j<p.count;j++){v.fromBufferAttribute(p,j);const cyl=Math.abs(v.y)<.062?1:.4;const s=1+.14*Math.sin(v.y*110)*cyl;v.x=v.x*s+.9*v.y*v.y;v.z*=s;p.setXYZ(j,v.x,v.y,v.z);}g.computeVertexNormals();return g;})();
const mitoMat=phys(0xd8343c,{roughness:.45,sheen:.6,sheenColor:0xffb0a0,clearcoat:.3});
const cenGeo=new THREE.CylinderGeometry(.0065,.0065,.075,6),cenMat=phys(0x3c3fb0,{roughness:.4,sheen:.3,clearcoat:.4});
const lysGeo=bumpy(5,.12,3,9),lysMats=[phys(0x7f93d0,{roughness:.32,clearcoat:.6,sheen:.4}),phys(0x8aa0c4,{roughness:.32,clearcoat:.6,sheen:.4})];
const ORG_PLAN=(()=>{const avoid=[],plan={golgi:[[.5,.34,.38,.4,.8,-.5,1],[-.12,-.5,.42,1.6,.2,.3,.85],[-.52,.32,-.2,-.3,2,.6,.8]],mito:[],cen:[[.24,-.52,.5],[-.62,.05,.48]],lys:[],ves:[],ribo:[]};
 plan.golgi.forEach(g=>avoid.push({p:new THREE.Vector3(g[0],g[1],g[2]),r:.24}));plan.cen.forEach(c=>avoid.push({p:new THREE.Vector3(...c),r:.08}));
 const samp=(a,b,gap)=>{for(let k=0;k<400;k++){const v=new THREE.Vector3(rnd()*2-1,rnd()*2-1,rnd()*2-1);if(v.lengthSq()>1)continue;v.multiplyScalar(b);if(v.length()<a)continue;if(avoid.some(o=>o.p.distanceTo(v)<o.r+gap))continue;return v;}return new THREE.Vector3(0,-a,0);};
 for(let i=0;i<11;i++){const p=samp(.63,.86,.02);plan.mito.push({p,q:new THREE.Quaternion().setFromUnitVectors(UPV,randDir()),s:.85+rnd()*.4});avoid.push({p,r:.1});}
 for(let i=0;i<5;i++){const p=samp(.6,.84,.03);plan.lys.push({p,s:.042+rnd()*.022,m:i%2});avoid.push({p,r:.07});}
 for(let i=0;i<110;i++)plan.ves.push({p:samp(.6,.9,0),s:.007+rnd()*.009,c:Math.floor(rnd()*5)});
 for(let i=0;i<(innerWidth<760?800:1300);i++){const Lr=ER[Math.floor(rnd()*4)];plan.ribo.push(erPos(Lr,Lr.th0+rnd()*Lr.thL,Lr.ph0+rnd()*Lr.phL,rnd()<.55?.009:-.009));}
 return plan;})();
const VCOL=[0xf4a73b,0xf4a73b,0xf6bd55,0xe9962f,0x8a5ae0].map(h=>new THREE.Color(h));
function makeOrg(){
 const org=new THREE.Group(),P_=ORG_PLAN;
 erGeos.forEach(g=>org.add(new THREE.Mesh(g,erMat)));
 org.add(inst(riboGeo,riboMat,P_.ribo.length,(d,i)=>d.position.copy(P_.ribo[i])));
 P_.golgi.forEach(([x,y,z,a,b,c,s])=>{const g=new THREE.Group();golgiGeos.forEach(geo=>g.add(new THREE.Mesh(geo,golgiMat)));
  g.add(inst(icoS,golgiVes,18,(d,i)=>{const sd=i%2?1:-1;d.position.set(sd*(.17+rnd()*.07),rnd()*.2-.02,(rnd()-.5)*.12);d.scale.setScalar(.012+rnd()*.012);}));
  g.position.set(x,y,z);g.rotation.set(a,b,c);g.scale.setScalar(s);org.add(g);});
 org.add(inst(mitoGeo,mitoMat,P_.mito.length,(d,i)=>{const m=P_.mito[i];d.position.copy(m.p);d.quaternion.copy(m.q);d.scale.setScalar(m.s);}));
 P_.cen.forEach(([x,y,z])=>{const g=new THREE.Group();[0,1].forEach(j=>{const c=new THREE.Group();for(let k=0;k<9;k++){const a=k/9*6.283,m=new THREE.Mesh(cenGeo,cenMat);m.position.set(Math.cos(a)*.022,0,Math.sin(a)*.022);c.add(m);}if(j){c.rotation.z=Math.PI/2;c.position.set(.03,.035,0);}g.add(c);});g.position.set(x,y,z);g.rotation.set(rnd()*3,rnd()*3,0);org.add(g);});
 P_.lys.forEach(l=>{const m=new THREE.Mesh(lysGeo,lysMats[l.m]);m.position.copy(l.p);m.scale.setScalar(l.s);org.add(m);});
 const vm=inst(icoS,vesMat,P_.ves.length,(d,i)=>{d.position.copy(P_.ves[i].p);d.scale.setScalar(P_.ves[i].s);});P_.ves.forEach((v,i)=>vm.setColorAt(i,VCOL[v.c]));org.add(vm);
 org.rotation.x=.42;
 return {org:L1(org),mpos:P_.mito.map(m=>m.p.clone()),anch:{er:new THREE.Vector3(.45,0,0),golgi:new THREE.Vector3(.5,.34,.38)}};
}
function makeCell(){
 const g=new THREE.Group();
 const mem=new THREE.Mesh(memGeo,memMat);mem.renderOrder=2;mem.frustumCulled=false;g.add(mem);
 mem.onBeforeRender=(r,s,c)=>{_m4.multiplyMatrices(c.matrixWorldInverse,mem.matrixWorld);U.uNM.value.getNormalMatrix(_m4);};
 const nuc=makeNuc();nuc.scale.setScalar(NR);g.add(nuc);
 const nl=new THREE.Mesh(sph,nlMat);nl.visible=false;g.add(nl);
 const N=64,ves=new THREE.InstancedMesh(sph,vesMat,N);g.add(ves);
 const data=[];for(let i=0;i<N;i++){const u=Math.random()*2-1,th=Math.random()*Math.PI*2;data.push({u,th,r:0.56+Math.random()*0.34,s:0.008+Math.random()*0.014,sp:(Math.random()-0.5)*0.35,ph:Math.random()*6.28});ves.setColorAt(i,VCOL[i%5]);}
 const nuc2=makeNuc();nuc2.visible=false;g.add(nuc2);
 const br=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,14,1,true).rotateZ(Math.PI/2),brMat);br.visible=false;g.add(br);
 [nuc,ves,nuc2,br].forEach(L1);
 const O=makeOrg();g.add(O.org);
 return {g,mem,nuc,nl,ves,data,nuc2,br,org:O.org,anch:O.anch,mpos:O.mpos};
}
const A=makeCell(),B=makeCell();B.data=A.data;scene.add(A.g);scene.add(B.g);B.g.visible=false;
const innerL=new THREE.PointLight(0xffe0cc,1.3,3,1.2);innerL.position.set(.1,.85,.75);innerL.layers.enableAll();A.g.add(innerL);

/* exosomes: glass shell refracting the scene behind it; cargo drawn in the refraction pass so it shows through */
const XU={uRT:MU.uRT,uFull:MU.uFull,uXT:{value:new THREE.Color('#E8FFF6')},uXR:{value:new THREE.Color('#BDE99A')}};
const exoMat=new THREE.MeshPhysicalMaterial({color:0x000000,roughness:.05,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.25,specularIntensity:1});
exoMat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,XU);sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uRT;uniform vec2 uFull;uniform vec3 uXT;uniform vec3 uXR;')
 .replace('#include <opaque_fragment>',`{vec2 suv=gl_FragCoord.xy/uFull;vec3 nv=normalize(normal);float ndv=clamp(abs(dot(nv,geometryViewDir)),0.0,1.0);float fr=pow(1.0-ndv,2.2);vec2 off=nv.xy*(0.02+0.04*fr);vec3 rf=texture2D(uRT,suv-off).rgb*uXT;outgoingLight=rf*(1.0-0.45*fr)+uXR*fr*0.85+outgoingLight;}
#include <opaque_fragment>`);};
const exoShellGeo=bumpy(5,.03,2),cargoGeo=bumpy(2,.2,3,4);
const cargoMats=[phys(0xf06c98,{sheen:1,sheenColor:0xffd0e0}),phys(0xc23a8e,{sheen:.8}),phys(0xf2b443,{sheen:.6})];
function wiggle(c,spread,steps,maxR){const pts=[];const p=c.clone();for(let i=0;i<steps;i++){pts.push(p.clone());p.add(randDir().multiplyScalar(spread));if(p.length()>maxR)p.multiplyScalar(maxR/p.length());}return new THREE.CatmullRomCurve3(pts);}
const strandGeo=new THREE.TubeGeometry(wiggle(new THREE.Vector3(-.2,.1,0),.22,6,.55),40,.05,6,false);
function makeExo(full=true){const g=new THREE.Group();g.add(new THREE.Mesh(exoShellGeo,exoMat));
 const cg=new THREE.Group();const n=full?5:3;for(let i=0;i<n;i++){const c=new THREE.Mesh(cargoGeo,cargoMats[i%3]);c.position.copy(randDir()).multiplyScalar(.22+rnd()*.33);c.scale.setScalar(.12+rnd()*.1);cg.add(c);}
 if(full)cg.add(new THREE.Mesh(strandGeo,cargoMats[0]));g.add(L1(cg));return g;}
const exo=[];
[[.13,.22,-1.5,.11],[.9,.18,-2.5,.07],[.93,.8,.8,.09],[.08,.82,-1,.06],[.86,.56,1.6,.05],[.2,.6,-3,.05],[.74,.08,0.5,.045]].forEach(([fx,fy,z,s],i)=>{
 const m=makeExo(false);exo.push({m,fx,fy,z,s,ph:i*1.7});scene.add(m);});

/* floating specks, as in the film */
const dustMat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uVW:{value:1},uVH:{value:1},uPR:{value:1},uA:{value:1}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`attribute float aS;attribute float aA;uniform float uTime;uniform float uVW;uniform float uVH;uniform float uPR;varying float vA;void main(){vec3 p=vec3(position.x*uVW,position.y*uVH,position.z);p.y+=sin(uTime*.1+position.x*9.)*.12;p.x+=cos(uTime*.08+position.z*3.)*.12;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aS*uPR*(10./-mv.z);vA=aA;}`,
 fragmentShader:`uniform float uA;varying float vA;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(vec3(.85,1.,.95),smoothstep(.5,0.,d)*vA*uA);}`});
{const DN=innerWidth<760?160:300,dp=new Float32Array(DN*3),ds=new Float32Array(DN),da=new Float32Array(DN);
 for(let i=0;i<DN;i++){dp[i*3]=Math.random()-.5;dp[i*3+1]=Math.random()-.5;dp[i*3+2]=-3+Math.random()*5;const big=i<DN*.06;ds[i]=big?9+Math.random()*12:1.1+Math.random()*2;da[i]=big?.04+Math.random()*.05:.22+Math.random()*.45;}
 const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dp,3));dg.setAttribute('aS',new THREE.BufferAttribute(ds,1));dg.setAttribute('aA',new THREE.BufferAttribute(da,1));
 const dust=new THREE.Points(dg,dustMat);dust.frustumCulled=false;scene.add(dust);}

/* exosome close-up for the lens (own scene, drawn into a circle) */
const lensScene=new THREE.Scene();lensScene.environment=scene.environment;
const lensCam=new THREE.PerspectiveCamera(28,1,.1,60);lensCam.position.set(0,.18,4.5);lensCam.lookAt(0,0,0);lensScene.add(lensCam);
{lensScene.add(new THREE.HemisphereLight(0xc6fff2,0x08324a,.9));const k=new THREE.DirectionalLight(0xffffff,2.6);k.position.set(3,4,5);lensScene.add(k);const r=new THREE.DirectionalLight(0x8fe6ff,1.8);r.position.set(-4,1.5,-4);lensScene.add(r);lensScene.add(new THREE.PointLight(0xffe6d6,3,3,1.2));}
const lensBgMat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},depthWrite:false,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float uTime;varying vec2 vUv;${NOISE2}
 void main(){vec2 p=vUv*vec2(3.,3.);float t=uTime*.015;float n=fbm(p+vec2(t,-t*.6)+fbm(p*1.3-t)*1.2);float m=fbm(p*.7+vec2(-t*.5,t)+3.1);
 vec3 c=mix(vec3(.008,.06,.17),vec3(.02,.27,.33),smoothstep(.2,.6,m));c=mix(c,vec3(.13,.5,.34),smoothstep(.35,.7,n)*.85);c=mix(c,vec3(.4,.8,.58),smoothstep(.6,.85,n)*.45);gl_FragColor=vec4(c,1.);}`});
{const lb=new THREE.Mesh(new THREE.PlaneGeometry(14,14),lensBgMat);lb.position.z=-20;lensCam.add(lb);}
const LX=new THREE.Group();lensScene.add(LX);const XANCH=[];
{const sm=new THREE.MeshPhysicalMaterial({color:0xf4fffa,roughness:.04,transmission:1,thickness:.5,ior:1.2,attenuationColor:new THREE.Color(0xd8f5ec),attenuationDistance:5,clearcoat:.6,clearcoatRoughness:.1,envMapIntensity:1.4});
 sm.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>','{float fr=pow(1.-clamp(dot(normal,normalize(vViewPosition)),0.,1.),2.2);outgoingLight+=vec3(.71,.89,.55)*fr*.6;}\n#include <opaque_fragment>');};
 LX.add(new THREE.Mesh(bumpy(24,.012,2.5,2),sm));
 const stalk=new THREE.CylinderGeometry(.022,.026,.13,8);stalk.translate(0,.065,0);const head=bumpy(3,.16,4,7);const pm=phys(0xf3a6c8,{sheen:1,sheenColor:0xffe0ee,roughness:.6});
 const memDir=new THREE.Vector3(-.62,.58,.52).normalize();const dirs=[memDir];for(let i=0;i<15;i++){const d=randDir();if(dirs.every(o=>o.dot(d)<.8))dirs.push(d);}
 dirs.forEach((d,i)=>{const g=new THREE.Group();g.position.copy(d).multiplyScalar(.99);g.quaternion.setFromUnitVectors(UPV,d);const h=new THREE.Mesh(head,pm);h.position.y=.17;h.scale.set(.075,.06,.075);g.add(new THREE.Mesh(stalk,pm),h);LX.add(g);if(!i){const a=new THREE.Object3D();a.position.y=.17;g.add(a);XANCH[0]=a;}});
 const yMat=phys(0xf2729c,{sheen:1,sheenColor:0xffd3e2,roughness:.55}),lobe=bumpy(3,.18,4,1);
 const yProt=(x,y,z,s)=>{const g=new THREE.Group();[[0,-.1,0],[-.075,.07,.6],[.075,.07,-.6]].forEach(([px,py,rz])=>{const l=new THREE.Mesh(lobe,yMat);l.position.set(px,py,0);l.rotation.z=rz;l.scale.set(.045,.1,.045);g.add(l);});g.position.set(x,y,z);g.scale.setScalar(s);g.rotation.set(rnd()*3,rnd()*3,rnd()*3);LX.add(g);return g;};
 XANCH[2]=yProt(.3,.3,.2,1.9);yProt(-.3,-.02,.32,1.7);yProt(.04,-.38,-.22,1.75);
 const metM=phys(0xc0308d,{sheen:.9,sheenColor:0xff9ad8,roughness:.5}),metG=bumpy(4,.2,3.5,3);[[-.26,.36,-.16],[.38,-.12,-.3]].forEach(([x,y,z])=>{const m=new THREE.Mesh(metG,metM);m.position.set(x,y,z);m.scale.setScalar(.15);LX.add(m);});
 const rnaM=phys(0xec5f86,{sheen:.8,roughness:.5});const rc=wiggle(new THREE.Vector3(-.5,-.38,.12),.18,7,.62);LX.add(new THREE.Mesh(new THREE.TubeGeometry(rc,90,.032,8,false),rnaM));{const a=new THREE.Object3D();a.position.copy(rc.getPoint(.5));LX.add(a);XANCH[1]=a;}
 LX.add(new THREE.Mesh(new THREE.TubeGeometry(wiggle(new THREE.Vector3(.1,.45,.1),.16,6,.6),80,.03,8,false),rnaM));
 const helix=ph=>{const pts=[];for(let i=0;i<=80;i++){const t=i/80,a=t*2.5*6.283+ph;pts.push(new THREE.Vector3(Math.cos(a)*.075,(t-.5)*.8,Math.sin(a)*.075));}return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),120,.028,6,false);};
 const dna=new THREE.Group(),dm=phys(0x7b8296,{roughness:.45,sheen:.4});dna.add(new THREE.Mesh(helix(0),dm),new THREE.Mesh(helix(Math.PI),dm));
 const rg=new THREE.CylinderGeometry(.009,.009,.15,5);rg.rotateZ(Math.PI/2);dna.add(inst(rg,phys(0xe06c8c,{roughness:.5}),22,(d,k)=>{const t=k/21;d.position.y=(t-.5)*.8;d.rotation.y=-t*2.5*6.283;}));
 dna.position.set(.06,.05,-.26);dna.rotation.set(.5,.2,.9);LX.add(dna);
 const gfM=phys(0xf5b443,{sheen:.7,sheenColor:0xfff0b8,roughness:.45}),gfG=bumpy(2,.15,3,8);
 [[.33,-.33,.26],[-.1,.18,.45],[.45,.12,-.05],[-.4,.12,-.36],[.05,-.5,.15]].forEach(([x,y,z],i)=>{const g=new THREE.Group();for(let k=0;k<3;k++){const m=new THREE.Mesh(gfG,gfM);m.position.copy(randDir()).multiplyScalar(.06);m.scale.setScalar(.05+rnd()*.018);g.add(m);}g.position.set(x,y,z);LX.add(g);if(!i)XANCH[3]=g;});}
const lensRT2=new THREE.WebGLRenderTarget(64,64,{type:rt.texture.type,samples:renderer.capabilities.isWebGL2?4:0});
const circMat=new THREE.ShaderMaterial({uniforms:{tMap:{value:lensRT2.texture},uOpen:{value:0}},transparent:true,depthTest:false,depthWrite:false,
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
 fragmentShader:`uniform sampler2D tMap;uniform float uOpen;varying vec2 vUv;void main(){vec2 c=vUv-.5;float r=length(c)*2.;if(r>uOpen)discard;vec4 col=texture2D(tMap,vUv);col.rgb*=mix(1.,.8,smoothstep(.78,1.,r));gl_FragColor=vec4(col.rgb,smoothstep(uOpen,uOpen-.015,r));
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
const circScene=new THREE.Scene();{const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),circMat);q.frustumCulled=false;circScene.add(q);}
const dimMat=new THREE.ShaderMaterial({uniforms:{uA:{value:0}},transparent:true,depthTest:false,depthWrite:false,vertexShader:`void main(){gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`uniform float uA;void main(){gl_FragColor=vec4(.02,.1,.13,uA);}`});
const dimScene=new THREE.Scene();{const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),dimMat);q.frustumCulled=false;dimScene.add(q);}
const flatCam=new THREE.Camera();
let ecmA=0;
const ANCH={hint:new THREE.Vector3(-.62,-.86,0)};

var xReady=false;
let W=1,H=1,vh=1,vw=1;const L={pub:{},pro:{}};
function place(o,fx,fy,rf){const n=W<760;if(document.documentElement.dir==='rtl')fx=1-fx;o.fx=fx;o.fy=fy;o.rf=Math.min(rf,(n?.40:.34)*vw/vh);o.x=(fx-.5)*vw;o.y=(.5-fy)*vh;o.R=o.rf*vh;}
function resize(){
 W=stage.clientWidth;H=stage.clientHeight;renderer.setSize(W,H,false);
 cam.aspect=W/H;cam.updateProjectionMatrix();
 vh=2*cam.position.z*Math.tan(THREE.MathUtils.degToRad(cam.fov/2));vw=vh*cam.aspect;
 const n=W<760;RTS=n?.75:1;bgMat.uniforms.uK.value=RTS;
 place(L.pub,.5,n?.42:.47,n?.32:.36);
 if(n)place(L.pro,.5,Math.min(.33,260/H),Math.min(.15,96/H));else place(L.pro,.63,.44,.23);
 const v=new THREE.Vector2();renderer.getDrawingBufferSize(v);const rw=Math.max(2,Math.round(v.x*RTS)),rh=Math.max(2,Math.round(v.y*RTS));rt.setSize(rw,rh);bgMat.uniforms.uRes.value.set(rw,rh);cpMat.uniforms.uRes.value.copy(v);MU.uFull.value.copy(v);
 dustMat.uniforms.uVW.value=vw*1.15;dustMat.uniforms.uVH.value=vh*1.15;dustMat.uniforms.uPR.value=renderer.getPixelRatio();
 if(xReady)xLayout();
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

/* ===== Revize 8 etkileşim: sürükle-çevir, dokun-tomurcuk, eksozom büyüteci ===== */
const qUser=new THREE.Quaternion(),qI=new THREE.Quaternion(),qTmp=new THREE.Quaternion(),rotVel=new THREE.Vector2();
let T=0,tPrev=0,drag=null,userActed=false,idleT=0,autoT=0,firstAuto=false,focus=0,focusT=0,sel=null,hovExo=null,lastMode='';
const EXS=[],pend=[],SC={x:0,y:0,r:1,ax:0,ay:0,aR:1};
const isRTL=()=>document.documentElement.dir==='rtl';
const liveN=()=>EXS.filter(e=>!e.dying).length;
function budAt(d){for(const b of U.uBud.value)if(T-b.w<2.1&&b.x*d.x+b.y*d.y+b.z*d.z>Math.cos(.6))return false;
 const slot=U.uBud.value.find(b=>T-b.w>2.1);if(!slot)return false;slot.set(d.x,d.y,d.z,T);pend.push({d:d.clone(),at:T+1.5});return true;}
function release(d){A.g.updateMatrixWorld(true);A.mem.getWorldQuaternion(qTmp);const dw=d.clone().applyQuaternion(qTmp);
 const g=makeExo(true);scene.add(g);EXS.push({g,o:dw.clone().multiplyScalar(HC),v:dw.clone().multiplyScalar(.42),born:T,ph:Math.random()*10,hov:0,dying:0,sel:false});
 U.uRip.value[ripIdx].set(d.x,d.y,d.z,T);ripIdx=(ripIdx+1)%4;
 const lv=EXS.filter(e=>!e.dying&&!e.sel),max=IF.mode==='pro'?3:7;while(lv.length>max)lv.shift().dying=1e-4;}
function emitFront(){A.g.updateMatrixWorld(true);A.mem.getWorldQuaternion(qTmp);const c=new THREE.Vector3(0,0,1).applyQuaternion(qTmp.invert());
 for(let k=0;k<30;k++){const d=randDir(),q=d.dot(c);if(q>.08&&q<.42&&budAt(d))return true;}return false;}
const isUI=el=>!!(el&&el.closest&&el.closest('button,a,input,select,textarea,label,.x-info,.gate,.zoom,.divider,.pro,.cat,.oc,.cell-poster'));
const cellHit=(x,y)=>Math.hypot(x-SC.x,y-SC.y)<SC.r*.98;
const pv=new THREE.Vector3();
function scr(o3){pv.copy(o3.position).project(cam);return[(pv.x+1)/2*W,(1-pv.y)/2*H];}
function pickExo(x,y){let best=null,bd=1e9;for(const e of EXS){if(e.dying)continue;const[px,py]=scr(e.g);const r=e.g.scale.x*H/vh*(cam.position.z/(cam.position.z-e.g.position.z));const d=Math.hypot(px-x,py-y);if(d<Math.max(r*1.5,16)&&d<bd){bd=d;best=e;}}return best;}
function turn(dx,dy){const a=Math.hypot(dx,dy)*.007;if(a<1e-5)return;tmpV.set(dy,dx,0).normalize();qTmp.setFromAxisAngle(tmpV,a);qUser.premultiply(qTmp);}
function tap(x,y){userActed=true;idleT=0;if(focusT&&Math.hypot(x-XLY.cx,y-XLY.cy)<XLY.d/2)return;const e=pickExo(x,y);if(e){openX(e);return;}if(focusT){closeX();return;}
 if(cellHit(x,y)){dirFor(x,y,SC.ax,SC.ay,SC.aR,A.mem);budAt(tmpV.clone().normalize());}}
stage.addEventListener('pointerdown',e=>{if(IF.mode!=='public'||IF.overlay||isUI(e.target))return;drag={id:e.pointerId,lx:e.clientX,ly:e.clientY,t:performance.now(),mv:0,touch:e.pointerType!=='mouse'};idleT=0;});
addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.lx,dy=e.clientY-drag.ly;drag.lx=e.clientX;drag.ly=e.clientY;drag.mv+=Math.abs(dx)+Math.abs(dy);if(!drag.touch&&drag.mv>6&&!focusT){turn(dx,dy);rotVel.set(dx,dy);}});
addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;if(d.mv<8&&performance.now()-d.t<650){const r=stage.getBoundingClientRect();tap(e.clientX-r.left,e.clientY-r.top);}});
addEventListener('pointercancel',()=>{drag=null;});
stage.addEventListener('pointermove',e=>{if(drag||IF.mode!=='public')return;const r=stage.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,ui=isUI(e.target);
 hovExo=ui?null:pickExo(x,y);const on=!ui&&cellHit(x,y);stage.style.cursor=ui?'':((hovExo||(on&&!focusT))?'pointer':(focusT?'default':'grab'));});
stage.addEventListener('pointerleave',()=>{hovExo=null;});

/* "Hücre turu" düğmesi artık eksozom salgılatır */
let emitLbl=null;{const tb=document.getElementById('tourBtn');if(tb){const nb=tb.cloneNode(true);nb.id='emitBtn';nb.classList.remove('on');tb.replaceWith(nb);emitLbl=nb.querySelector('#tourLbl');if(emitLbl)emitLbl.id='emitLbl';
 nb.addEventListener('click',e=>{e.stopPropagation();userActed=true;idleT=0;closeX();emitFront();});}}

/* büyüteç: halka, etiketler, çizgiler, bilgi kartı */
const NS='http://www.w3.org/2000/svg';
const XR=document.createElement('div');XR.className='x-ring';XR.setAttribute('aria-hidden','true');stage.appendChild(XR);
const XS=document.createElementNS(NS,'svg');XS.setAttribute('class','x-lines');XS.setAttribute('aria-hidden','true');stage.appendChild(XS);
const mk=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);XS.appendChild(e);return e;};
const selRing=mk('circle',{fill:'none',stroke:'#fff','stroke-width':1.5,'stroke-dasharray':'3 4'}),leader=mk('line',{stroke:'#fff','stroke-width':1.2,'stroke-dasharray':'2 5'});
const lns=[0,1,2,3].map(()=>mk('polyline',{fill:'none',stroke:'#fff','stroke-width':1.1})),sqs=[0,1,2,3].map(()=>mk('rect',{width:7,height:7,fill:'none',stroke:'#fff','stroke-width':1.1}));
const XLB=[0,1,2,3].map(i=>{const d=document.createElement('div');d.className='x-lbl'+(i<2?' l':'');d.setAttribute('aria-hidden','true');stage.appendChild(d);return d;});
const XI=document.createElement('aside');XI.className='x-info';XI.hidden=true;XI.setAttribute('aria-live','polite');
XI.innerHTML='<button type="button" class="x-x"><span aria-hidden="true">×</span></button><h3></h3><p class="x-size"></p><p class="x-t"></p><ul class="x-cargo"><li></li><li></li><li></li><li></li></ul><a class="x-cta"><span></span><i aria-hidden="true">→</i></a>';
stage.appendChild(XI);
function xText(){const tr=k=>IF.tr(k);XI.querySelector('h3').textContent=tr('x_title');XI.querySelector('.x-size').textContent=tr('x_size');XI.querySelector('.x-t').textContent=tr('x_text');
 XI.querySelector('.x-x').setAttribute('aria-label',tr('x_close'));XLB.forEach((d,i)=>{d.textContent=tr('x_l'+(i+1));});XI.querySelectorAll('.x-cargo li').forEach((li,i)=>{li.textContent=tr('x_l'+(i+1));});
 XI.querySelector('.x-cta span').textContent=tr('x_cta');XI.querySelector('.x-cta').href=(window.IFU&&IFU.ax)?IFU.ax(0):'urunler.html';if(emitLbl)emitLbl.textContent=tr('x_emit');}
xText();new MutationObserver(xText).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
let XLY={x:0,y:0,d:200,cx:0,cy:0,desk:true};
function xLayout(){const desk=W>=760,rtl=isRTL();let d,cx,cy;const ih=XI.offsetHeight||220;
 if(desk){d=Math.round(clamp(Math.min(H*.46,W*.26,H-ih-58),170,330));cx=W*(rtl?.28:.72);cy=clamp(H*.37,d/2+18,Math.max(d/2+18,H-16-ih-22-d/2));}
 else{d=Math.round(Math.min(W*.6,H*.4,280));cx=W/2;cy=d/2+16;}
 XLY={x:cx-d/2,y:cy-d/2,d,cx,cy,desk};Object.assign(XR.style,{left:XLY.x+'px',top:XLY.y+'px',width:d+'px',height:d+'px'});
 const px=Math.max(8,Math.round(d*renderer.getPixelRatio()));if(lensRT2.width!==px)lensRT2.setSize(px,px);
 if(desk){const iw=Math.min(420,Math.round(W*.36));Object.assign(XI.style,{width:iw+'px',left:clamp(cx-iw/2,12,W-iw-12)+'px',top:(cy+d/2+22)+'px'});}
 else Object.assign(XI.style,{width:'',left:'',top:''});
 const sL=cx-d/2-22,sR=cx+d/2+22,ys=[cy-d*.28,cy+d*.26,cy-d*.26,cy+d*.28];
 XLB.forEach((el,i)=>{const l=i<2;el.style.left=(l?sL:sR)+'px';el.style.top=ys[i]+'px';el.style.maxWidth=Math.max(96,l?sL-12:W-sR-12)+'px';el.dataset.x=l?sL:sR;el.dataset.y=ys[i];el.style.display=desk?'':'none';});}
xLayout();xReady=true;
function openX(e){if(sel&&sel!==e)sel.sel=false;sel=e;e.sel=true;e.v.set(0,0,0);focusT=1;XI.hidden=false;xLayout();requestAnimationFrame(()=>XI.classList.add('on'));XR.classList.add('on');XLB.forEach(l=>l.classList.add('on'));stage.classList.add('x-open');}
function closeX(){if(!focusT)return;if(sel)sel.sel=false;sel=null;focusT=0;XI.classList.remove('on');XR.classList.remove('on');XLB.forEach(l=>l.classList.remove('on'));stage.classList.remove('x-open');setTimeout(()=>{if(!focusT)XI.hidden=true;},380);}
XI.querySelector('.x-x').addEventListener('click',e=>{e.stopPropagation();closeX();});
addEventListener('keydown',e=>{if(e.key==='Escape'&&focusT)closeX();});
IF.c3={emit:()=>emitFront(),open:()=>{const e=EXS.find(x=>!x.dying);if(e)openX(e);return !!e;},close:()=>closeX(),info:()=>({n:EXS.length,acted:userActed,focus:focusT})};

function updExos(dt,ax,ay,aR,cmp){
 const pub=IF.mode==='public'&&!cmp,pro=IF.mode==='pro'&&!cmp,maxR=pro?1.7:2.25,rtl=isRTL();
 for(let i=EXS.length-1;i>=0;i--){const e=EXS[i],o=e.o;
  if(!(pub||pro)&&!e.dying)e.dying=1e-4;
  if(e.dying){e.dying+=dt;const k=1-Math.min(1,e.dying/.6);e.g.scale.setScalar(EXR*aR*k);e.g.position.set(ax+o.x*aR,ay+o.y*aR,o.z*aR);if(k<=0){scene.remove(e.g);EXS.splice(i,1);}continue;}
  if(e.sel&&XLY.desk){tmpV.set(rtl?-1.22:1.22,.5,.3);o.lerp(tmpV,1-Math.exp(-dt*3));}
  else if(!e.sel){e.v.multiplyScalar(Math.exp(-dt*.8));e.v.x+=Math.sin(T*.5+e.ph)*.03*dt;e.v.y+=Math.cos(T*.41+e.ph*1.3)*.03*dt;e.v.z+=Math.sin(T*.33+e.ph*.7)*.03*dt;
   const r=o.length();if(r<1.35)e.v.addScaledVector(o,(1.35-r)*1.2*dt/r);if(r>maxR)e.v.addScaledVector(o,-(r-maxR)*.7*dt/r);const yT=(H*.5-34)/SC.r,yB=-(H*.5-(pub?120:40))/SC.r,xL=(W*.5-30)/SC.r;if(o.y>yT)e.v.y-=(o.y-yT)*1.5*dt;if(o.y<yB)e.v.y+=(yB-o.y)*1.5*dt;if(Math.abs(o.x)>xL)e.v.x-=Math.sign(o.x)*(Math.abs(o.x)-xL)*1.5*dt;const f=o.z/r;if(f<.2)e.v.z+=(.2-f)*.3*dt;o.addScaledVector(e.v,dt);}
  e.hov+=((e===hovExo?1:0)-e.hov)*Math.min(1,dt*10);const grow=Math.min(1,(T-e.born)/.4);
  e.g.position.set(ax+o.x*aR,ay+o.y*aR,o.z*aR);e.g.scale.setScalar(EXR*aR*(.92+.08*grow)*(1+.18*e.hov+(e.sel?.1:0)));e.g.rotation.y+=dt*.35;e.g.rotation.x+=dt*.12;}
}
function xOverlay(fe){
 XS.style.opacity=fe;if(fe<.01||!sel)return;
 const[ex,ey]=scr(sel.g);const rp=sel.g.scale.x*H/vh*(cam.position.z/(cam.position.z-sel.g.position.z))*1.7+6;
 selRing.setAttribute('cx',ex);selRing.setAttribute('cy',ey);selRing.setAttribute('r',rp);
 const dx=XLY.cx-ex,dy=XLY.cy-ey,dl=Math.hypot(dx,dy);if(dl>XLY.d/2+rp+12){const ux=dx/dl,uy=dy/dl;leader.setAttribute('x1',ex+ux*(rp+3));leader.setAttribute('y1',ey+uy*(rp+3));leader.setAttribute('x2',XLY.cx-ux*(XLY.d/2+4));leader.setAttribute('y2',XLY.cy-uy*(XLY.d/2+4));leader.style.opacity=1;}else leader.style.opacity=0;
 LX.updateMatrixWorld(true);const lc=lensCam.position.distanceTo(LX.position);
 XLB.forEach((el,i)=>{if(!XLY.desk){lns[i].style.opacity=0;sqs[i].style.opacity=0;return;}XANCH[i].getWorldPosition(tmpV);const back=tmpV.distanceTo(lensCam.position)>lc+.15;tmpV.project(lensCam);
  const ax=XLY.x+(tmpV.x+1)/2*XLY.d,ay=XLY.y+(1-tmpV.y)/2*XLY.d,bx=+el.dataset.x,by=+el.dataset.y,e2=i<2?bx+14:bx-14;
  lns[i].setAttribute('points',bx+','+by+' '+e2+','+by+' '+ax+','+ay);sqs[i].setAttribute('x',ax-3.5);sqs[i].setAttribute('y',ay-3.5);const op=back?.35:1;lns[i].style.opacity=op;sqs[i].style.opacity=op;});
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
 const t=clock.getElapsedTime()*SPD,dt=Math.min(.05,Math.max(0,t-tPrev));tPrev=t;T=t;
 U.uTime.value=t;bgMat.uniforms.uTime.value=t;cpMat.uniforms.uTime.value=t;dustMat.uniforms.uTime.value=t;lensBgMat.uniforms.uTime.value=t;
 const cmp=IF.mode==='compare';
 const s=IF.mode==='transition'?IF.p:(IF.mode==='pro'?1:0);
 if(IF.mode!==lastMode){if(IF.mode!=='public'){closeX();stage.style.cursor='';U.uBud.value.forEach(b=>b.w=-99);pend.length=0;}lastMode=IF.mode;}
 const P=L.pub,Q=L.pro;
 const breath=1+.012*Math.sin(t*1.1);
 let ax,ay,aR,showB=false,bx=0,by=0,bR=0;
 const S1=.48,SNAP=.78,DR=.68;
 /* phase: 0 interphase · 1 dividing (one membrane) · 2 two daughters */
 let ph=0,u=0,dn=0,nucK=1,grow=1,Dd=0,tb=0,glow=0;
 if(!cmp&&s>0&&s<S1){u=s/S1;ph=u<SNAP?1:2;}else if(!cmp&&s>=S1&&s<1)ph=2;
 const cx=P.x-P.R*.32*sst(.05,SNAP,Math.min(1,s/S1));
 if(ph===1){
  tb=sst(.08,.42,u);
  const rt_=lerp(.6,.035,ease(clamp((u-.12)/.5)));
  const th0=Math.asin(Math.min(.999,rt_/DR));
  Dd=DR*Math.cos(th0)+.07+sst(.56,SNAP,u)*.13;
  glow=sst(.5,SNAP,u)*.55;{const sp=toPx(cx,P.y);IF.revealC.x=sp.x;IF.revealC.y=sp.y;}
  U.uSplit.value=tb;U.uDiv.value.set(Dd,rt_,DR);
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
 if(ph===0&&!cmp){if(s>=1){ax=Q.x;ay=Q.y+(W<760&&IF.proSY?IF.proSY*vh/H:0);aR=Q.R;}else{ax=P.x;ay=P.y;aR=P.R;}}
 if(cmp){ax=(IF.cmpX/W-.5)*vw;ay=(.5-.48)*vh;aR=P.R*.78;}
 /* eksozom büyüteci açıkken hücre yana kayar */
 focus+=(focusT-focus)*Math.min(1,dt*5);const fe=focus*focus*(3-2*focus);
 if(IF.mode==='public'&&!cmp&&XLY.desk)ax+=(isRTL()?1:-1)*vw*.22*fe;
 if(ph===2&&!snapped){snapped=true;flashT=t;U.uRip.value[0].set(-1,0,0,t);U.uRip.value[1].set(1,0,0,t);U.uRip.value[2].set(0,1,0,t+.12);ripIdx=3;}
 if(s===0){snapped=false;flashT=-99;}
 const fl=Math.max(glow,flashT>-50?Math.exp(-Math.max(0,t-flashT)*2.6):0);
 MU.uGlow.value=fl;bgMat.uniforms.uFlash.value=fl;
 {const fp=toPx(cx,P.y),k=renderer.getPixelRatio()*RTS;if(ph===1)bgMat.uniforms.uFC.value.set(fp.x*k,(H-fp.y)*k);}
 A.g.position.set(ax,ay,0);A.g.scale.setScalar(aR*breath);
 /* dönüş: genel sitede sürüklenir; geçişte ve Pro'da düz konuma döner (bölünme ekseni yatay kalsın) */
 if(IF.mode==='public'&&!cmp){if(!drag||drag.touch){if(Math.abs(rotVel.x)+Math.abs(rotVel.y)>.05){turn(rotVel.x,rotVel.y);rotVel.multiplyScalar(.93);}else{qTmp.setFromAxisAngle(UPV,dt*.05);qUser.premultiply(qTmp);}}}
 else{qUser.slerp(qI,1-Math.exp(-dt*(IF.mode==='transition'?9:3)));rotVel.set(0,0);}
 A.g.quaternion.copy(qUser);
 B.g.visible=showB;if(showB){B.g.position.set(bx,by,0);B.g.scale.setScalar(bR*breath);B.g.quaternion.identity();}

 const ct=cmp?.5:clamp((s-.3)/.7);
 MU.uTint.value.copy(ATT_PUB).lerp(ATT_PRO,ct);MU.uRim.value.copy(RIM_PUB).lerp(RIM_PRO,ct);nucMat.color.copy(NUC_PUB).lerp(NUC_PRO,ct);
 dustMat.uniforms.uA.value=1-ct;

 const ptr=IF.ptr;let target=0;
 if(ptr.in&&IF.mode==='public'&&!focusT&&!drag){const d=dirFor(ptr.x,ptr.y,ax,ay,aR,A.mem);target=clamp((2.1-d)/1.1);if(target>0)ptrDir.lerp(tmpV,.25).normalize();}
 ptrAmt+=(target-ptrAmt)*.08;U.uPtrAmt.value=ptrAmt*(ptr.touch?.5:1);U.uPtrDir.value.copy(ptrDir);
 IF.near=ptrAmt;
 while(IF.ripples.length){const r=IF.ripples.shift();const d=dirFor(r.x,r.y,ax,ay,aR,A.mem);if(d<2.4){U.uRip.value[ripIdx].set(tmpV.x,tmpV.y,tmpV.z,t);ripIdx=(ripIdx+1)%4;}}

 const pulse=1+.02*Math.sin(t*1.7);
 if(ph===1){
  /* çekirdek ikiye ayrılır, aralarındaki köprü incelip kopar */
  A.nuc.position.set(dn,0,.02);A.nuc2.position.set(-dn,0,.02);A.nuc2.visible=true;
  const nr=NR*nucK*pulse;A.nuc.scale.set(nr*(1+.18*sst(.02,.25,u)*(1-sst(.3,.6,u))),nr,nr);A.nuc2.scale.copy(A.nuc.scale);
  const bw=.06*(1-sst(.24,.44,u)),len=2*dn-nr*1.2;
  A.br.visible=bw>.004&&len>.01&&u>.08;if(A.br.visible){A.br.position.set(0,0,.02);A.br.scale.set(len,bw*(1+.6*sst(.08,.2,u)),bw);}
  updVes(A,t,1,tb,Dd,DR);
 }else{
  A.nuc2.visible=false;A.br.visible=false;
  A.nuc.position.set(0,0,0);A.nuc.scale.setScalar(NR*pulse);A.nuc.rotation.y=Math.sin(t*.16)*.3;
  if(ph===2){B.nuc.position.set(0,0,0);B.nuc.scale.setScalar(NR*pulse);updVes(A,t,2,0,0,1,0,grow);updVes(B,t,2,0,0,1,1,0);}else updVes(A,t);
 }

 const pxo=ptr.in?(ptr.x/W-.5):0,pyo=ptr.in?(ptr.y/H-.5):0;
 exo.forEach(e=>{const k=(e.z+4)*.06;e.m.position.set((e.fx-.5)*vw+Math.sin(t*.4+e.ph)*.12-pxo*k,(.5-e.fy)*vh+Math.cos(t*.33+e.ph)*.12+pyo*k,e.z);e.m.scale.setScalar(e.s*vh*.18*(1+.04*Math.sin(t+e.ph)));e.m.rotation.y=t*.2+e.ph;});

 const sc=toPx(ax,ay);IF.cell={x:sc.x,y:sc.y,r:aR/vh*H};
 SC.x=sc.x;SC.y=sc.y;SC.r=aR*breath/vh*H;SC.ax=ax;SC.ay=ay;SC.aR=aR*breath;
 const pr=renderer.getPixelRatio()*RTS;
 if(ptr.in){bgMat.uniforms.uPtr.value.set(ptr.x*pr,(H-ptr.y)*pr);}
 bgMat.uniforms.uPtrOn.value+=((ptr.in&&!IF.overlay?1:0)-bgMat.uniforms.uPtrOn.value)*.06;
 bgMat.uniforms.uCell.value.set(sc.x*pr,(H-sc.y)*pr);
 bgMat.uniforms.uC.value.set(IF.revealC.x*pr,(H-IF.revealC.y)*pr);
 bgMat.uniforms.uR.value=IF.revealR*pr;
 bgMat.uniforms.uPro.value=IF.mode==='pro'?1:0;
 bgMat.uniforms.uCmp.value=cmp?1:0;bgMat.uniforms.uSX.value=IF.cmpX*pr;

 {let os=1;if(ph===1)os=1-sst(0,.3,u);else if(ph===2)os=grow;A.org.visible=os>.01;A.org.scale.setScalar(Math.max(os,1e-3));A.org.rotation.y=Math.sin(t*.16)*.3;B.org.visible=false;}

 /* eksozomlar: genel sitede dokununca ve kendiliğinden; Pro'da arada bir kendiliğinden */
 for(let i=pend.length-1;i>=0;i--)if(T>=pend[i].at){if(IF.mode==='public'||IF.mode==='pro')release(pend[i].d);pend.splice(i,1);}
 idleT+=dt;
 if(IF.mode==='public'&&!cmp&&!IF.overlay){if(!firstAuto&&t>1.6){firstAuto=emitFront();}if(!focusT&&idleT>5&&liveN()<5){autoT+=dt;if(autoT>5.5){autoT=0;emitFront();}}}
 else if(IF.mode==='pro'){autoT+=dt;if(autoT>7&&liveN()<3){autoT=0;emitFront();}}
 updExos(dt,ax,ay,aR*breath,cmp);

 const showA=(IF.mode==='public'||IF.mode==='pro')&&W>=760&&!IF.overlay;
 {A.g.updateMatrixWorld(true);const wp=(v,o)=>{tmpV.copy(v);o.localToWorld(tmpV);return toPx(tmpV.x,tmpV.y);};
  const pos={c_hint:wp(ANCH.hint,A.g),_nc:sc,_nr:NR*aR/vh*H};IF.opos=pos;
  OLAB.forEach(el=>{const txt=IF.tr(IF.ptr.touch?'c_hint_t':'c_hint');const sp=el.lastChild;if(sp.textContent!==txt)sp.textContent=txt;
   el.style.opacity=(IF.mode==='public'&&!userActed&&!focusT&&!IF.overlay&&!cmp)?1:0;
   el.style.transform='translate('+(W/2).toFixed(1)+'px,22px) translateX('+(isRTL()?'50%':'-50%')+')';});}
 const isPro=IF.mode==='pro';
 [[an1,-1.12,'an1','an3'],[an2,0.98,'an2','an4'],[an5,2.35,'an1','an1'],[an6,-2.25,'an2','an2']].forEach(([el,ang,a,b])=>{if(!el)return;const lf=el.classList.contains('l');
  const p=toPx(ax+Math.cos(ang)*aR*1.02,ay-Math.sin(ang)*aR*1.02);
  const txt=IF.tr(isPro?b:a);const sp=el.lastChild;if(sp.textContent!==txt)sp.textContent=txt;
  const ok=showA&&(lf?p.x>230:p.x<W-210)&&isPro;el.style.opacity=ok?1:0;
  el.style.transform='translate('+p.x.toFixed(1)+'px,'+(p.y-5).toFixed(1)+'px)'+(lf?' translate(-100%,0)':'');});

 cam.layers.set(1);renderer.setRenderTarget(rt);renderer.render(scene,cam);
 cam.layers.set(0);renderer.setRenderTarget(null);renderer.render(scene,cam);

 if(focus>.01){
  renderer.autoClear=false;dimMat.uniforms.uA.value=.45*fe;renderer.render(dimScene,flatCam);
  LX.rotation.y=.55*Math.sin(t*.22);LX.rotation.x=.1+.15*Math.sin(t*.17);
  renderer.setRenderTarget(lensRT2);renderer.setClearColor(0x05202a,1);renderer.clear();renderer.render(lensScene,lensCam);renderer.setRenderTarget(null);renderer.setClearColor(0x000000,1);
  renderer.setViewport(XLY.x,H-XLY.y-XLY.d,XLY.d,XLY.d);circMat.uniforms.uOpen.value=fe;renderer.render(circScene,flatCam);renderer.setViewport(0,0,W,H);
  renderer.autoClear=true;
 }
 xOverlay(fe);
 if(!stage.classList.contains('gl-on'))stage.classList.add('gl-on');
}
requestAnimationFrame(frame);

