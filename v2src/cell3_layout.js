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

