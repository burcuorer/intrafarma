
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
