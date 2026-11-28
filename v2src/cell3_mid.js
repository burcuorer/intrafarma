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

const NOISEF=SNOISE_FN;
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
