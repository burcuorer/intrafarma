
/* ana sayfa pilotu: video slaytı, ortaklar bandı, kaydırma animasyonları, sayaçlar, sayfa başı */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const tr=k=>window.IF&&IF.tr?IF.tr(k):k;

/* partners: logos from the current intrafarma.com.tr partners page */
const PT=[['regenyal','Regenyal Laboratories','https://www.regenyal.eu'],['dual-trend','Dual Trend','https://www.dualtrend.it'],['emotec','Emotec','https://www.emotec.it'],['meika','Meika Group','https://www.meikagroup.com'],['neftis','Neftis Laboratorios','https://neftislaboratorios.com'],['helite','Helite','https://www.helite.com'],['hyjawe','Hyjawe Trades','https://www.hyjawe.com'],['alfagen','Alfagen','https://www.alfagen.net'],['apharma','Apharma','https://www.apharma.com.tr/tr'],['artsante','Artsante','https://www.artsante.com.tr'],['bnl-medikal','BNL Medikal','https://www.bnlmedikal.com',1],['cell-medical','Cell Medical',''],['gelsam','Gelsam İlaç & Medikal','https://www.gelsam.com'],['endorfinmed','Endorfinmed',''],['konted','Konted','https://www.kontedturkiye.com'],['neotec','Neotec Biotechnology','https://www.neotec.com.tr'],['ss-ilac','SS İlaç ve Sağlık Hizmetleri','https://www.ssilac.com'],['vefa','Vefa İlaç','https://vefailac.com.tr']];
const track=$('#ptTrack');
[0,1].forEach(copy=>PT.forEach(([f,n,u,dk])=>{
 const a=document.createElement(u?'a':'span');a.className='pt-l'+(dk?' dk':'');
 if(u){a.href=u;a.target='_blank';a.rel='noopener';}
 if(copy){a.setAttribute('aria-hidden','true');if(u)a.tabIndex=-1;}
 const im=new Image();im.src=(window.IF_BASE||'')+'media/ortaklar/'+f+'.jpg';im.alt=copy?'':n;im.loading='lazy';im.decoding='async';a.appendChild(im);track.appendChild(a);}));

/* video hero: sequential silent clips, arrows, dots, pause */
const vs=$$('.vh-v'),dots=$('#vhDots'),pp=$('#vhPP');let cur=0,playing=!RM,inView=true;
vs.forEach((v,k)=>{const b=document.createElement('button');b.type='button';b.addEventListener('click',()=>go(k,true));dots.appendChild(b);
 v.addEventListener('ended',()=>{if(playing&&k===cur)go(cur+1);});});
function labels(){
 $$('[data-tl]').forEach(el=>el.setAttribute('aria-label',tr(el.dataset.tl)));
 [...dots.children].forEach((b,k)=>{b.setAttribute('aria-label',tr('v_slide')+' '+(k+1));b.classList.toggle('on',k===cur);b.setAttribute('aria-current',k===cur?'true':'false');});
 pp.setAttribute('aria-label',tr(playing?'v_pause':'v_play'));pp.classList.toggle('paused',!playing);
 $('#vhCap').textContent=tr(vs[cur].dataset.cap);$('#vhNum').textContent=String(cur+1).padStart(2,'0')+' / '+String(vs.length).padStart(2,'0');
}
function go(k,user){
 const prev=vs[cur];cur=(k+vs.length)%vs.length;const v=vs[cur];
 if(v.preload==='none'){v.preload='auto';v.load();}
 const nx=vs[(cur+1)%vs.length];if(nx.preload==='none'){nx.preload='metadata';}
 vs.forEach(x=>x.classList.toggle('on',x===v));
 try{v.currentTime=0;}catch(e){}
 if(playing&&inView){const p=v.play();if(p&&p.catch)p.catch(()=>{});}
 if(prev!==v)setTimeout(()=>{if(!prev.classList.contains('on'))prev.pause();},1100);
 labels();
}
$('#vhPrev').addEventListener('click',()=>go(cur-1,true));
$('#vhNext').addEventListener('click',()=>go(cur+1,true));
pp.addEventListener('click',()=>{playing=!playing;const v=vs[cur];if(playing){if(v.ended)go(cur+1);else{const p=v.play();if(p&&p.catch)p.catch(()=>{});}}else v.pause();labels();});
new IntersectionObserver(es=>{inView=es[0].isIntersecting;const v=vs[cur];if(!inView)v.pause();else if(playing){const p=v.play();if(p&&p.catch)p.catch(()=>{});}},{threshold:.15}).observe($('#vh'));
go(0);

/* keep the second language picker and aria labels in sync with applyLang */
const sel2=$('#langSel2');
sel2.addEventListener('change',e=>{const b=document.querySelector('.site-top [data-lang="'+e.target.value+'"]');if(b)b.click();});
new MutationObserver(()=>{sel2.value=document.documentElement.lang;labels();homeData();splitWords();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
sel2.value=document.documentElement.lang||'tr';

/* outer buttons open things inside the cell stage: bring it into view first */

/* reveal on scroll */
const ioIn=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');}),{threshold:.18,rootMargin:'0px 0px -6% 0px'});
/* once an element has left the screen completely it resets, so coming back to a section plays it again */
const ioOut=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting&&!RM&&e.target.classList.contains('in')){e.target.classList.remove('in');e.target.classList.add('seen');}}),{threshold:0});
const io={observe(el){ioIn.observe(el);ioOut.observe(el);}};
$$('[data-rv]').forEach(el=>io.observe(el));

/* count-up numbers */
const nums=$$('.st-g b[data-n]').map(b=>({b,to:+b.dataset.n,pad:+(b.dataset.pad||0),suf:b.dataset.suf||''}));
const fmt=(n,v)=>String(v).padStart(n.pad,'0')+n.suf;
if(!RM)nums.forEach(n=>{n.b.textContent=fmt(n,0);});
let cRun=0;
if($('.st-g'))new IntersectionObserver(es=>{if(RM)return;const e0=es[0];
 if(!e0.isIntersecting){if(e0.boundingClientRect.bottom<0||e0.boundingClientRect.top>innerHeight){cRun++;nums.forEach(n=>{n.b.textContent=fmt(n,0);});}return;}
 const id=++cRun,t0=performance.now();
 (function step(t){if(id!==cRun)return;const k=Math.min(1,(t-t0)/1700),e=1-Math.pow(1-k,3);nums.forEach(n=>{n.b.textContent=fmt(n,Math.round(n.to*e));});if(k<1)requestAnimationFrame(step);})(t0);},{threshold:[0,.35]}).observe($('.st-g'));

/* hero shrinks slightly as the page scrolls past it */
const vh=$('#vh');let vhq=false;
function vhShrink(){vhq=false;const r=vh.getBoundingClientRect(),p=Math.min(1,Math.max(0,-r.top/(r.height*.85)));
 vh.style.transform=p>0?'scale('+(1-.075*p).toFixed(4)+')':'';vh.style.clipPath=p>0?'inset(0 round '+(p*28).toFixed(1)+'px)':'';}
if(!RM){addEventListener('scroll',()=>{if(!vhq){vhq=true;requestAnimationFrame(vhShrink);}},{passive:true});vhShrink();}

/* expertise cards and product axes from the shared catalogue data */
const UA_IMG=[null,null,null,null,null,null];
const UA_IC=['<circle cx="12" cy="12" r="9"/><path d="M8 8.5c2 1 2 3 0 4M16 11.5c-2 1-2 3 0 4M9 12.5h6"/>','<circle cx="12" cy="12" r="9"/><path d="M5 9c4 1 10 1 14 0M5 15c4-1 10-1 14 0"/>','<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z"/>','<rect x="7" y="3" width="10" height="18" rx="5"/><path d="M12 8v6"/>','<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>','<path d="M6 13c0-3 3-4 6-4s6 1 6 4-2 6-6 6-6-3-6-6z"/><circle cx="7" cy="6" r="1.6"/><circle cx="12" cy="4.5" r="1.6"/><circle cx="17" cy="6" r="1.6"/>'];
function homeData(){
 const D=window.IFD;if(!D)return;const L=(window.IF&&IF.lang)||'tr',CA=D.CA[L]||D.CA.en,AX=D.AX[L]||D.AX.en;
 const g=$('#uaG');if(g){const was=!!g.querySelector('.in');g.innerHTML='';CA.forEach((n,i)=>{const a=document.createElement('a');a.href=IFU.alan(i);a.className='ua-c'+(UA_IMG[i]?'':' noimg');a.setAttribute('data-rv',i%3===0?'left':i%3===2?'right':'up');a.style.setProperty('--i',i%3+Math.floor(i/3));if(was)a.classList.add('in');io.observe(a);
  a.innerHTML=(UA_IMG[i]?'<img src="'+(window.IF_BASE||'')+'media/gorsel/'+UA_IMG[i]+'.jpg" alt="" loading="lazy" decoding="async">':'<svg class="ua-ic" viewBox="0 0 24 24" aria-hidden="true">'+UA_IC[i]+'</svg>')+'<span class="ua-n">0'+(i+1)+'</span><span class="ua-x"><b></b><i aria-hidden="true">→</i></span>';
  a.querySelector('b').textContent=n;g.appendChild(a);});}
 const l=$('#hpL');if(l){const was=!!l.querySelector('.in');l.innerHTML='';AX.forEach((n,i)=>{const c=D.PRODS.filter(p=>p.a===i).length;const li=document.createElement('li');li.innerHTML='<a href="'+IFU.ax(i)+'"><i>0'+(i+1)+'</i><b></b><span aria-hidden="true">→</span></a>';li.querySelector('b').textContent=n;li.dataset.rv='up';li.style.setProperty('--i',i+2);if(was)li.classList.add('in');io.observe(li);l.appendChild(li);});}
 const nu=$('#nvUa');if(nu){nu.innerHTML='';CA.forEach((n,i)=>{const a=document.createElement('a');a.href=IFU.alan(i);a.textContent=n;nu.appendChild(a);});const al=document.createElement('a');al.href=IFU.alan(-1);al.className='nv-all';al.textContent=tr('all_areas');nu.appendChild(al);}
 const nh=$('#nvHp');if(nh){nh.innerHTML='';AX.forEach((n,i)=>{const a=document.createElement('a');a.href=IFU.ax(i);a.textContent=n;nh.appendChild(a);});const al=document.createElement('a');al.href=IFU.ax(-1);al.className='nv-all';al.textContent=tr('all_prods');nh.appendChild(al);}
 if(typeof renderAlan==='function')renderAlan();
 const kw=$('#kwT');if(kw){kw.innerHTML='';[0,1].forEach(()=>AX.concat(CA).forEach(n=>{const sp=document.createElement('span');sp.textContent=n;kw.appendChild(sp);}));}
}
homeData();


/* v3: staggered children, headings rising word by word, colour bands opening while scrolling */
[['.hc','.hc-c'],['.st-g','div'],['.bl-g','article'],['.bk-g','figure'],['.fq-l','details'],['.ev-up ul','li']].forEach(([p,c])=>$$(p).forEach(par=>[...par.children].forEach((el,i)=>{if(!el.matches(c))return;if(!el.dataset.rv){el.dataset.rv='up';io.observe(el);}el.style.setProperty('--i',i);})));
const WSEL='.hs-h h2,.st-h h2,.hp-t h2,.lb-t h2,.pt-head h2,.pg h1';
function splitWords(){if(RM)return;$$(WSEL).forEach(h=>{if(h.querySelector('.wd'))return;let n=0;
 const walk=node=>[...node.childNodes].forEach(ch=>{if(ch.nodeType===3){const fr=document.createDocumentFragment();ch.textContent.split(/(\s+)/).forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){fr.appendChild(document.createTextNode(p));return;}const w=document.createElement('span');w.className='wd';const x=document.createElement('span');x.textContent=p;x.style.setProperty('--w',n++);w.appendChild(x);fr.appendChild(w);});ch.replaceWith(fr);}else if(ch.nodeType===1)walk(ch);});
 walk(h);});}
splitWords();
const bio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('bin');}),{threshold:0,rootMargin:'0px 0px -22% 0px'});
const bioOut=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting&&!RM)e.target.classList.remove('bin');}),{threshold:0});
$$('.band').forEach(b=>bioOut.observe(b));
$$('.band').forEach(b=>bio.observe(b));


/* tabs: Bilim (#bilim, #sss) and Güncel (#guncel, #etkinlikler, #blog) are pages of their own; everything else is the home page */
const VIEWS={bilim:'vBilim',kurul:'vBilim',sss:'vBilim',guncel:'vGuncel',etkinlikler:'vGuncel',blog:'vGuncel',uretim:'vUretim',iletisim:'vIletisim'},PAGEH={bilim:1,guncel:1,uretim:1,iletisim:1},siteEl=$('.site');
var alanI=-1;
function renderAlan(){const D=window.IFD;if(!D||alanI<0)return;const L=IF.lang||'tr',CA=D.CA[L]||D.CA.en,AX=D.AX[L]||D.AX.en;
 $('#alH').textContent=CA[alanI];const g=$('#alG');g.innerHTML='';
 D.AXCA.forEach((areas,ax)=>{if(!areas.includes(alanI))return;const h=document.createElement('h3');h.textContent='0'+(ax+1)+' · '+AX[ax];g.appendChild(h);const ul=document.createElement('ul');
  D.PRODS.filter(p=>p.a===ax).forEach(p=>{const li=document.createElement('li');const pa=document.createElement('a');pa.href=IFU.prod(p);pa.textContent=p.n;li.appendChild(pa);ul.appendChild(li);});g.appendChild(ul);});
 const o=$('#alO');o.innerHTML='';CA.forEach((n,i)=>{if(i===alanI)return;const a=document.createElement('a');a.href=IFU.alan(i);a.innerHTML='<span></span><i>0'+(i+1)+'</i>';a.firstChild.textContent=n;o.appendChild(a);});}
function closeNav(){siteEl.classList.remove('nav-open');document.documentElement.classList.remove('nav-lock');$('#nvBurger').setAttribute('aria-expanded','false');$$('.nv.open').forEach(n=>{n.classList.remove('open');n.firstElementChild.setAttribute('aria-expanded','false');});}
function route(first){const h=decodeURIComponent(location.hash.slice(1));if(h==='pro')return;closeNav();
 const am=/^alan-(\d)$/.exec(h);let v=VIEWS[h]||'';if(am&&+am[1]<6){v='vAlan';alanI=+am[1];renderAlan();}
 const was=siteEl.classList.contains('on-view')?($$('.view').find(x=>!x.hidden)||{}).id:'';
 $$('.view').forEach(x=>{x.hidden=x.id!==v;});siteEl.classList.toggle('on-view',!!v);
 $$('.site-top .pub-nav a[data-nav]').forEach(a=>{const on=a.dataset.nav===v;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const tgt=h&&!PAGEH[h]&&!am?document.getElementById(h):null;
 if(v||was){requestAnimationFrame(()=>{if(tgt)tgt.scrollIntoView({behavior:'auto',block:'start'});else scrollTo({top:siteEl.getBoundingClientRect().top+scrollY-12,behavior:'auto'});});}
 if(v){$$('#'+v+' [data-rv]').forEach(el=>el.classList.remove('in'));}
}

/* menus: click opens on touch, the burger opens the full menu on small screens */
$$('.nv-t').forEach(t=>t.addEventListener('click',e=>{const n=t.parentElement,o=!n.classList.contains('open');$$('.nv.open').forEach(x=>{x.classList.remove('open');x.firstElementChild.setAttribute('aria-expanded','false');});n.classList.toggle('open',o);t.setAttribute('aria-expanded',o);e.stopPropagation();}));
document.addEventListener('click',e=>{if(!e.target.closest('.nv'))$$('.nv.open').forEach(x=>{x.classList.remove('open');x.firstElementChild.setAttribute('aria-expanded','false');});});
$('#nvBurger').addEventListener('click',()=>{const o=!siteEl.classList.contains('nav-open');if(!o){closeNav();return;}siteEl.classList.add('nav-open');document.documentElement.classList.add('nav-lock');$('#nvBurger').setAttribute('aria-expanded','true');});
$('#pubNav').addEventListener('click',e=>{if(e.target.closest('a,[data-cat]'))closeNav();});
addEventListener('keydown',e=>{if(e.key==='Escape')closeNav();});
/* Güncel filters */
$$('#gnF button').forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.f;$$('#gnF button').forEach(x=>x.setAttribute('aria-pressed',x===b));
 $$('#vGuncel [data-k]').forEach(el=>{const k=el.dataset.k;el.hidden=!(f==='all'||k===f||(k==='bl'&&f!=='ev'));});}));
/* cell on phones and tablets: numbered tabs and a swipeable strip, in step with the markers on the cell */
{const tabs=$('#ocTabs'),strip=$('#ocs'),cards=$$('#ocs .oc-c');
 const go=k=>{const c=cards.find(x=>x.dataset.o===k);if(c&&innerWidth<1180)strip.scrollTo({left:c.offsetLeft-(strip.clientWidth-c.offsetWidth)/2,behavior:RM?'auto':'smooth'});};
 cards.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.dataset.o=c.dataset.o;b.textContent='0'+(i+1);b.setAttribute('aria-label',c.querySelector('b').textContent||('0'+(i+1)));b.addEventListener('click',()=>go(c.dataset.o));tabs.appendChild(b);});
 const act=k=>{IF.mobKey=k;[...tabs.children].forEach(b=>b.classList.toggle('on',b.dataset.o===k));if(innerWidth<1180)cards.forEach(c=>c.classList.toggle('on',c.dataset.o===k));};
 const sio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&innerWidth<1180)act(e.target.dataset.o);}),{root:strip,threshold:.6});cards.forEach(c=>sio.observe(c));
 $('#stage').addEventListener('click',e=>{const m=e.target.closest('.mk');if(m)go(m.dataset.o);});
 if(innerWidth<1180)act('o_nuc');}
/* hovering or focusing a cell card lights up its marker on the cell */
$$('.oc-c').forEach(c=>{const on=v=>{const m=document.querySelector('.mk[data-o="'+c.dataset.o+'"]');if(m)m.classList.toggle('hl',v);};
 c.addEventListener('mouseenter',()=>on(true));c.addEventListener('mouseleave',()=>on(false));c.addEventListener('focus',()=>on(true));c.addEventListener('blur',()=>on(false));});

/* scroll progress */
{const pg=$('#prog');let q=false;const up=()=>{q=false;const m=document.documentElement.scrollHeight-innerHeight;pg.style.transform='scaleX('+(m>0?Math.min(1,scrollY/m):0).toFixed(4)+')';};
 addEventListener('scroll',()=>{if(!q){q=true;requestAnimationFrame(up);}},{passive:true});up();}

/* back to top */
const tt=$('#totop');addEventListener('scroll',()=>tt.classList.toggle('show',scrollY>560),{passive:true});

/* ===================== v2: sayfa yönlendirme, sayfa yolu, ürün sayfası, dil seçici ===================== */
const P=IFU.page,D2=()=>window.IFD;
const esc2=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const VMAP={uzmanlik:'vUzmanlik',urunler:'vUrunler',uretim:'vUretim',bilim:'vBilim',guncel:'vGuncel',iletisim:'vIletisim',hakkimizda:'vHakkimizda'};
const SEC={uzmanlik:'uzmanlik',urunler:'urunler',uretim:'kurumsal',hakkimizda:'kurumsal',bilim:'bilim',guncel:'guncel',iletisim:'iletisim'};
let curView='';
document.documentElement.classList.add('v2');

function v2route(){
 let v=VMAP[P]||'';
 if(P==='uzmanlik'){const a=IFU.AL.indexOf(new URLSearchParams(location.search).get('alan')||'');alanI=a;if(a>=0){v='vAlan';renderAlan();}}
 curView=v;
 $$('.view').forEach(x=>{x.hidden=x.id!==v;});
 siteEl.classList.toggle('on-view',!!v);
 const sec=SEC[P]||'';
 $$('.site-top [data-sec]').forEach(n=>{const on=n.dataset.sec===sec;n.classList.toggle('cur',on);const t=n.matches('a')?n:n.querySelector('.nv-t');if(t){if(on)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current');}});
}

/* ---- ürünler sayfası: eksen, klinik alan ve arama; ürün ayrıntısı aynı sayfada, her durumun kendi adresi var ---- */
const UC={ax:-1,ca:-1,q:'',urun:-1};
function ucRead(){const q=new URLSearchParams(location.search),PR=D2().PRODS;UC.ax=IFU.AXS.indexOf(q.get('eksen')||'');UC.ca=IFU.AL.indexOf(q.get('alan')||'');const u=q.get('urun');UC.urun=u?PR.findIndex(p=>IFU.slug(p.n)===u):-1;}
function ucHref(o){const s=Object.assign({ax:UC.ax,ca:UC.ca,urun:-1},o||{}),q=new URLSearchParams();
 if(s.urun>=0)q.set('urun',IFU.slug(D2().PRODS[s.urun].n));else{if(s.ax>=0)q.set('eksen',IFU.AXS[s.ax]);if(s.ca>=0)q.set('alan',IFU.AL[s.ca]);}
 const qo={};q.forEach((v,k)=>{qo[k]=v;});return IFU.q(IFU.U.urunler,qo);}
function ucCard(p,i,L,AX){const AXC=IF.AXC||[];const open=!!p.open;
 return '<a class="uc-c" href="'+ucHref({urun:i})+'" style="--tc:'+(AXC[p.a]||'#17707A')+'"><span class="uc-t"><i>0'+(p.a+1)+'</i>'+esc2(AX[p.a])+'</span><b>'+esc2(p.n)+'</b><span class="uc-acc'+(open?' open':'')+'">'+esc2(tr(open?'cat_pub':'cat_pro'))+'</span><span class="uc-go" aria-hidden="true">→</span></a>';}
function renderUC(){
 if(P!=='urunler')return;
 const L=IF.lang||'tr',D=D2(),AX=D.AX[L]||D.AX.en,CA=D.CA[L]||D.CA.en,PR=D.PRODS,AXC=IF.AXC||[];
 const det=UC.urun>=0;
 $('#ucBar').hidden=det;$('#ucCa').hidden=det;$('#ucN').hidden=det;$('#ucG').hidden=det;$('#ucD').hidden=!det;
 const h=$('#ucH'),ey=$('#ucEy'),pp=$('#ucP');
 if(det){const p=PR[UC.urun];h.textContent=p.n;ey.textContent='/ '+AX[p.a];pp.textContent=tr('d_lede').replace('{n}',p.n).replace('{a}',AX[p.a]);}
 else{h.textContent=UC.ax>=0?AX[UC.ax]:tr('nav3');ey.textContent=tr('hp_ey');pp.textContent=tr('uc_p');}
 if(!det){
  const ax=$('#ucAx');ax.innerHTML='';
  const chip=(label,href,on,cls)=>{const a=document.createElement('a');a.href=href;a.className='chip'+(cls?' '+cls:'');a.textContent=label;if(on)a.setAttribute('aria-current','true');return a;};
  ax.appendChild(chip(tr('cat_all'),ucHref({ax:-1}),UC.ax<0));
  AX.forEach((n,i)=>ax.appendChild(chip(n,ucHref({ax:i}),UC.ax===i)));
  const ca=$('#ucCa');ca.innerHTML='<span class="lab">'+esc2(tr('cat_ca'))+'</span>';
  ca.appendChild(chip(tr('cat_all'),ucHref({ca:-1}),UC.ca<0,'sm'));
  CA.forEach((n,i)=>ca.appendChild(chip(n,ucHref({ca:i}),UC.ca===i,'sm')));
  const q=UC.q.trim().toLocaleLowerCase(L);
  const list=PR.map((p,i)=>({p,i})).filter(({p})=>(UC.ax<0||p.a===UC.ax)&&(UC.ca<0||D.AXCA[p.a].includes(UC.ca))&&(!q||p.n.toLocaleLowerCase(L).includes(q)));
  $('#ucN').textContent=tr('cat_n').replace('{n}',list.length);
  $('#ucG').innerHTML=list.length?list.map(({p,i})=>ucCard(p,i,L,AX)).join(''):'<div class="uc-empty"><p>'+esc2(tr('cat_empty'))+'</p><a class="b-sec" href="'+IFU.U.urunler+'">'+esc2(tr('all_prods'))+'</a></div>';
 }else{
  const p=PR[UC.urun],axn=AX[p.a],open=!!p.open;
  const areas=D.AXCA[p.a].map(i=>'<a href="'+IFU.alan(i)+'">'+esc2(CA[i])+'</a>').join('');
  const more=PR.map((x,i)=>({x,i})).filter(o=>o.x.a===p.a&&o.i!==UC.urun);
  $('#ucD').innerHTML=
   '<a class="uc-back" href="'+ucHref({ax:p.a,ca:-1})+'"><i aria-hidden="true">←</i><span>'+esc2(axn)+'</span></a>'+
   '<div class="uc-dg"><div class="uc-vis" style="--tc:'+(AXC[p.a]||'#17707A')+'"><small>0'+(p.a+1)+' · '+esc2(axn)+'</small><span>'+esc2(p.n)+'</span></div>'+
   '<div class="uc-info"><dl class="uc-meta"><div><dt>'+esc2(tr('d_ax'))+'</dt><dd><a href="'+ucHref({ax:p.a,ca:-1})+'">0'+(p.a+1)+' '+esc2(axn)+'</a></dd></div>'+
   '<div><dt>'+esc2(tr('d_ca'))+'</dt><dd class="uc-areas">'+areas+'</dd></div><div><dt>'+esc2(tr('d_lang'))+'</dt><dd>TR · EN</dd></div></dl>'+
   (open?'<div class="uc-box open"><h2>'+tr('op_t')+'</h2><p>'+tr('op_b')+'</p></div>'
        :'<div class="uc-box lock"><h2>'+tr('lk_t')+'</h2><p>'+tr('lk_b')+'</p><button type="button" class="b-pri" id="ucGate"><span>'+esc2(tr('cta1'))+'</span><span class="o"></span></button></div>')+
   '</div></div>'+
   (more.length?'<div class="uc-more"><h2>'+esc2(tr('uc_more'))+'</h2><div class="uc-g">'+more.map(o=>ucCard(o.x,o.i,L,AX)).join('')+'</div></div>':'');
  const g=$('#ucGate');if(g)g.addEventListener('click',()=>{IF.after=/^Regenflex/.test(p.n)?p.n:'';IF.openGate();});
 }
}
function ucGo(href,push){history[push?'pushState':'replaceState']({ifuc:1},'',href);ucRead();renderUC();crumbs();titleSync();}
if(P==='urunler'){
 ['ucEy','ucP'].forEach(id=>{const e=$('#'+id);if(e)e.removeAttribute('data-t');});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||!IFU.same(a.href,'urunler')||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();closeNav();ucGo(a.href,true);scrollTo({top:0,behavior:'auto'});});
 $('#ucQ').addEventListener('input',e=>{UC.q=e.target.value;renderUC();});
 addEventListener('popstate',()=>{ucRead();renderUC();crumbs();titleSync();});
}

/* ---- uzmanlık genel bakış: ana sayfadaki altı kartın aynısı ---- */
function renderUZ(){const g=$('#uzG');if(!g||P!=='uzmanlik')return;g.innerHTML='';$$('#uaG .ua-c').forEach(c=>{const k=c.cloneNode(true);k.removeAttribute('data-rv');k.classList.add('in');g.appendChild(k);});}
/* ---- hakkımızda: iş ortakları logoları (kayan banttaki logoların tekil kopyası) ---- */
function renderHK(){const g=$('#hkPt');if(!g||P!=='hakkimizda')return;const seen=new Set(),out=[];
 $$('#ptTrack .pt-l').forEach(l=>{if(l.getAttribute('aria-hidden')==='true')return;const im=l.querySelector('img');const k=im?im.getAttribute('src'):l.textContent;if(seen.has(k))return;seen.add(k);const c=l.cloneNode(true);c.removeAttribute('tabindex');out.push(c);});
 if(out.length){g.innerHTML='';out.forEach(c=>g.appendChild(c));}}

/* ---- sayfa yolu: her alt sayfada Ana sayfa › Bölüm › Ayrıntı ---- */
function crumbs(){
 $$('.bc').forEach(n=>n.remove());if(!curView)return;
 const L=IF.lang||'tr',D=D2(),CA=D.CA[L]||D.CA.en,AX=D.AX[L]||D.AX.en,items=[[tr('pg_home'),IFU.U.home]];
 if(P==='uzmanlik'){items.push([tr('nav2'),alanI>=0?IFU.U.uzmanlik:null]);if(alanI>=0)items.push([CA[alanI],null]);}
 else if(P==='urunler'){const deep=UC.ax>=0||UC.urun>=0;items.push([tr('nav3'),deep?IFU.U.urunler:null]);
  if(UC.urun>=0){const p=D.PRODS[UC.urun];items.push([AX[p.a],ucHref({ax:p.a,ca:-1})]);items.push([p.n,null]);}else if(UC.ax>=0)items.push([AX[UC.ax],null]);}
 else items.push([tr({uretim:'nav_ur',hakkimizda:'nav1',bilim:'nav4',guncel:'nav6',iletisim:'nav5'}[P]),null]);
 const nav=document.createElement('nav');nav.className='bc';nav.setAttribute('aria-label',tr('bc'));const ol=document.createElement('ol');
 items.forEach(([t,h])=>{const li=document.createElement('li');let e;if(h){e=document.createElement('a');e.href=h;}else{e=document.createElement('span');e.setAttribute('aria-current','page');}e.textContent=t;li.appendChild(e);ol.appendChild(li);});
 nav.appendChild(ol);const host=$('#'+curView+' .pg-in');if(host)host.insertBefore(nav,host.firstChild);
}
function titleSync(){const L=IF.lang||'tr',D=D2(),AX=D.AX[L]||D.AX.en,CA=D.CA[L]||D.CA.en;let t='';
 if(P==='uzmanlik')t=alanI>=0?CA[alanI]:tr('nav2');
 else if(P==='urunler')t=UC.urun>=0?D.PRODS[UC.urun].n:(UC.ax>=0?AX[UC.ax]:tr('nav3'));
 else if(P!=='home')t=tr({uretim:'nav_ur',hakkimizda:'nav1',bilim:'nav4',guncel:'nav6',iletisim:'nav5'}[P]);
 document.title=t?t+' · Intrafarma':'Intrafarma';}

/* ---- üst çubuk: her zaman görünür; sayfa kayınca zemin alır ---- */
{const hdr=$('.site-top');const onS=()=>hdr.classList.toggle('scrolled',scrollY>8||P!=='home'&&scrollY>0);addEventListener('scroll',onS,{passive:true});onS();}

/* ---- dil seçici: tek yuvarlak düğme; üzerine gelince ya da dokununca diğer diller soldan sağa açılır ---- */
const lsw=$('#lsw'),lswC=$('#lswCur');
function lswSet(o){lsw.classList.toggle('open',o);lswC.setAttribute('aria-expanded',o);}
lswC.addEventListener('click',e=>{e.stopPropagation();lswSet(!lsw.classList.contains('open'));});
lsw.addEventListener('mouseenter',()=>{if(matchMedia('(hover: hover)').matches)lswSet(true);});
lsw.addEventListener('mouseleave',()=>{if(matchMedia('(hover: hover)').matches)lswSet(false);});
lsw.addEventListener('focusout',e=>{if(!lsw.contains(e.relatedTarget))lswSet(false);});
document.addEventListener('click',e=>{if(!e.target.closest('#lsw'))lswSet(false);});
addEventListener('keydown',e=>{if(e.key==='Escape')lswSet(false);});
$$('#lswOpts [data-lang]').forEach(b=>b.addEventListener('click',()=>{lswSet(false);lswC.focus({preventScroll:true});}));
function lswSync(){const L=IF.lang||'tr';$('#lswCode').textContent=L.toUpperCase();
 $$('#lswOpts [data-lang]').forEach(b=>{b.hidden=b.dataset.lang===L;});
 $$('.lsw-m [data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===L));}

/* ---- dil değişince yeniden çiz (homeData ile aynı sinyal, ondan sonra çalışır) ---- */
function v2refresh(){renderUC();renderUZ();renderHK();crumbs();lswSync();titleSync();}
new MutationObserver(v2refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

/* ---- alt sayfa başlığında dönen tek video (geniş ekran; hareket azaltılmışsa yalnız kapak görseli) ---- */
const PGV={urunler:'hero-urun',uretim:'hero-uretim',bilim:'hero-bilim',uzmanlik:'hero-laboratuvar',hakkimizda:'hero-laboratuvar',guncel:'hero-bilim',iletisim:'hero-laboratuvar'};
function pgVideo(){const k=PGV[P];if(!k||!curView||!matchMedia('(min-width: 901px)').matches)return;const pg=$('#'+curView+' .pg');if(!pg||pg.querySelector('.pg-vid'))return;
 const B=(window.IF_BASE||'')+'media/'+k,f=document.createElement('figure'),v=document.createElement('video');f.className='pg-vid';f.setAttribute('aria-hidden','true');
 v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='metadata';v.poster=B+'.jpg';
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){v.autoplay=true;v.src=B+'.mp4';}
 f.appendChild(v);pg.appendChild(f);pg.classList.add('has-vid');const pl=v.play&&v.src?v.play():null;if(pl&&pl.catch)pl.catch(()=>{});}
ucRead();v2route();v2refresh();pgVideo();setTimeout(renderHK,1500);
if(location.hash&&location.hash!=='#pro'){const t=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(t)requestAnimationFrame(()=>setTimeout(()=>t.scrollIntoView({block:'start'}),80));}

/* WordPress: gövdedeki .html bağlantıları sayfa adresleriyle değiştirilir (GitHub'da dokunulmaz) */

labels();
})();
