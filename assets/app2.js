
/* ana sayfa pilotu: video slaytı, ortaklar bandı, kaydırma animasyonları, sayaçlar, sayfa başı */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const tr=k=>window.IF&&IF.tr?IF.tr(k):k;

/* partners: logos from the current intrafarma.com.tr partners page */
const PT=(window.IF_CMS&&Array.isArray(window.IF_CMS.partners)&&window.IF_CMS.partners.length&&window.IF_CMS.partners)||[['regenyal','Regenyal Laboratories','https://www.regenyal.eu'],['dual-trend','Dual Trend','https://www.dualtrend.it'],['emotec','Emotec','https://www.emotec.it'],['meika','Meika Group','https://www.meikagroup.com'],['neftis','Neftis Laboratorios','https://neftislaboratorios.com'],['helite','Helite','https://www.helite.com'],['hyjawe','Hyjawe Trades','https://www.hyjawe.com'],['alfagen','Alfagen','https://www.alfagen.net'],['apharma','Apharma','https://www.apharma.com.tr/tr'],['artsante','Artsante','https://www.artsante.com.tr'],['bnl-medikal','BNL Medikal','https://www.bnlmedikal.com',1],['cell-medical','Cell Medical',''],['gelsam','Gelsam İlaç & Medikal','https://www.gelsam.com'],['endorfinmed','Endorfinmed',''],['konted','Konted','https://www.kontedturkiye.com'],['neotec','Neotec Biotechnology','https://www.neotec.com.tr'],['ss-ilac','SS İlaç ve Sağlık Hizmetleri','https://www.ssilac.com'],['vefa','Vefa İlaç','https://vefailac.com.tr']];
const track=$('#ptTrack');
[0,1].forEach(copy=>PT.forEach(([f,n,u,dk])=>{
 const a=document.createElement(u?'a':'span');a.className='pt-l'+(dk?' dk':'');
 if(u){a.href=u;a.target='_blank';a.rel='noopener';}
 if(copy){a.setAttribute('aria-hidden','true');if(u)a.tabIndex=-1;}
 const im=new Image();im.src=/^(https?:)?\/\//.test(f)||f.charAt(0)==='/'?f:(window.IF_BASE||'')+'media/ortaklar/'+f+'.webp';im.alt=copy?'':n;im.loading='lazy';im.decoding='async';a.appendChild(im);track.appendChild(a);}));

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
if(!window.IFU||IFU.page==='home')go(0);

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
{const _P=(window.IFD&&IFD.PRODS)||[],_s=$$('.st-g b[data-n]'),_o=new Set($$('#ptTrack .pt-l').map(a=>a.getAttribute('href')||(a.querySelector('img')||{}).src));if(_s[1]&&_P.length){_s[1].dataset.n=_P.length;_s[1].textContent=_P.length;}if(_s[2]&&_o.size){_s[2].dataset.n=_o.size;_s[2].textContent=_o.size;}}
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
const UA_IMG=['ortopedi','uroloji','kadin-sagligi','noroloji','estetik','diger'];
const UA_IC=['<circle cx="12" cy="12" r="9"/><path d="M8 8.5c2 1 2 3 0 4M16 11.5c-2 1-2 3 0 4M9 12.5h6"/>','<circle cx="12" cy="12" r="9"/><path d="M5 9c4 1 10 1 14 0M5 15c4-1 10-1 14 0"/>','<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z"/>','<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>','<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>','<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'];
function homeData(){
 const portfolio=document.querySelector('.hp-f img');if(portfolio&&window.IF_CMS&&IF_CMS.home_product_image)portfolio.src=IF_CMS.home_product_image;

 const D=window.IFD;if(!D)return;const L=(window.IF&&IF.lang)||'tr',CA=D.CA[L]||D.CA.en,AX=D.AX[L]||D.AX.en;
 const g=$('#uaG');if(g){const was=!!g.querySelector('.in');g.innerHTML='';CA.forEach((n,i)=>{const a=document.createElement('a');a.href=IFU.alan(i);a.className='ua-c'+(UA_IMG[i]?'':' noimg');a.setAttribute('data-rv',i%3===0?'left':i%3===2?'right':'up');a.style.setProperty('--i',i%3+Math.floor(i/3));if(was)a.classList.add('in');io.observe(a);
  a.innerHTML=(UA_IMG[i]?'<img src="'+(window.IF_BASE||'')+'media/alan/'+UA_IMG[i]+'.webp'+'" alt="" loading="lazy" decoding="async" width="800" height="755">':'<svg class="ua-ic" viewBox="0 0 24 24" aria-hidden="true">'+UA_IC[i]+'</svg>')+'<span class="ua-n">'+String(i+1).padStart(2,'0')+'</span><span class="ua-x"><b></b><i aria-hidden="true">→</i></span>';
  a.querySelector('b').textContent=n;g.appendChild(a);});}
 const l=$('#hpL');if(l){const was=!!l.querySelector('.in');l.innerHTML='';AX.forEach((n,i)=>{const c=D.PRODS.filter(p=>p.a===i).length;const li=document.createElement('li');li.innerHTML='<a href="'+IFU.ax(i)+'"><i>'+String(i+1).padStart(2,'0')+'</i><b></b><span aria-hidden="true">→</span></a>';li.querySelector('b').textContent=n;li.dataset.rv='up';li.style.setProperty('--i',i+2);if(was)li.classList.add('in');io.observe(li);l.appendChild(li);});}
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
 $('#alH').textContent=CA[alanI];{const ap=$('#alH').nextElementSibling;if(ap&&ap.tagName==='P'){ap.removeAttribute('data-t');const t=tr('al_p'+alanI);ap.textContent=t&&t!=='al_p'+alanI?t:tr('ua_p');}}const g=$('#alG');g.innerHTML='';
 D.AXCA.forEach((areas,ax)=>{if(!D.PRODS.some(p=>p.a===ax&&pCA(p).includes(alanI)))return;const h=document.createElement('h3');h.textContent=String(ax+1).padStart(2,'0')+' · '+AX[ax];g.appendChild(h);const gr=document.createElement('div');gr.className='uc-g al-cards';
  gr.innerHTML=D.PRODS.map((p,i)=>({p,i})).filter(o=>o.p.a===ax&&pCA(o.p).includes(alanI)).map(o=>ucCard(o.p,o.i,L,AX)).join('');g.appendChild(gr);});
 const o=$('#alO');o.innerHTML='';CA.forEach((n,i)=>{if(i===alanI)return;const a=document.createElement('a');a.href=IFU.alan(i);a.innerHTML='<span></span><i>'+String(i+1).padStart(2,'0')+'</i>';a.firstChild.textContent=n;o.appendChild(a);});}
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
 cards.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.dataset.o=c.dataset.o;b.textContent=String(i+1).padStart(2,'0');b.setAttribute('aria-label',c.querySelector('b').textContent||(String(i+1).padStart(2,'0')));b.addEventListener('click',()=>go(c.dataset.o));tabs.appendChild(b);});
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
const VMAP={uzmanlik:'vUzmanlik',urunler:'vUrunler',uretim:'vUretim',bilim:'vBilim',guncel:'vGuncel',iletisim:'vIletisim',hakkimizda:'vHakkimizda',kvkk:'vYasal'};
const SEC={uzmanlik:'uzmanlik',urunler:'urunler',uretim:'uretim',hakkimizda:'kurumsal',bilim:'bilim',guncel:'kurumsal',iletisim:'iletisim'};
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
function ucCard(p,i,L,AX){const AXC=IF.AXC||[],open=!!p.open;
 const art=p.img?'<span class="uc-art" aria-hidden="true"><img class="uc-ci" src="'+esc2(p.img)+'" alt="" loading="lazy" decoding="async"></span>'
  :'<span class="uc-art uc-soon" aria-hidden="true"><i></i><em>'+esc2(tr('img_soon'))+'</em></span>';
 const bd=(p.pr?'<em class="uc-bd pr">'+esc2(tr('bdg_pr'))+'</em>':'')+(p.nw?'<em class="uc-bd nw">'+esc2(tr('bdg_nw'))+'</em>':'');
 return '<a class="uc-c'+(p.img?' has-img':' no-img')+'" data-axis="'+p.a+'" href="'+ucHref({urun:i})+'" style="--tc:'+(AXC[p.a]||'#17707A')+'">'+art+(bd?'<span class="uc-bds">'+bd+'</span>':'')+'<span class="uc-t"><i>'+String(p.a+1).padStart(2,'0')+'</i>'+esc2(AX[p.a])+'</span><b>'+esc2(p.n)+'</b><span class="uc-acc'+(open?' open':'')+'"><span class="l">'+esc2(tr(open?'cat_pub':'cat_pro'))+'</span><span class="s">'+esc2(tr(open?'cat_pub_s':'cat_pro_s'))+'</span></span><span class="uc-go" aria-hidden="true">→</span></a>';}

function renderUC(){
 if(P!=='urunler')return;
 const L=IF.lang||'tr',D=D2(),AX=D.AX[L]||D.AX.en,CA=D.CA[L]||D.CA.en,PR=D.PRODS,AXC=IF.AXC||[];
 const det=UC.urun>=0;
 $('#ucBar').hidden=det;$('#ucCa').hidden=det;$('#ucN').hidden=det;$('#ucG').hidden=det;$('#ucD').hidden=!det;
 const h=$('#ucH'),ey=$('#ucEy'),pp=$('#ucP');
 if(det){const p=PR[UC.urun];h.textContent=p.n;ey.textContent='/ '+AX[p.a];const ds=p.d&&(p.d[L]||p.d.en||p.d.tr);pp.textContent=ds||tr('d_lede').replace('{n}',p.n).replace('{a}',AX[p.a]);}
 else{h.textContent=UC.ax>=0?AX[UC.ax]:tr('nav3');ey.textContent=tr('hp_ey');const axp=UC.ax>=0?tr('ax_p'+UC.ax):'';pp.textContent=axp&&axp!=='ax_p'+UC.ax?axp:tr('uc_p');}
 if(!det){
  const ax=$('#ucAx');ax.innerHTML='';
  const chip=(label,href,on,cls)=>{const a=document.createElement('a');a.href=href;a.className='chip'+(cls?' '+cls:'');a.textContent=label;if(on)a.setAttribute('aria-current','true');return a;};
  ax.appendChild(chip(tr('cat_all'),ucHref({ax:-1}),UC.ax<0));
  AX.forEach((n,i)=>ax.appendChild(chip(n,ucHref({ax:i}),UC.ax===i)));
  const ca=$('#ucCa');ca.innerHTML='<span class="lab">'+esc2(tr('cat_ca'))+'</span>';
  ca.appendChild(chip(tr('cat_all'),ucHref({ca:-1}),UC.ca<0,'sm'));
  CA.forEach((n,i)=>ca.appendChild(chip(n,ucHref({ca:i}),UC.ca===i,'sm')));
  const q=UC.q.trim().toLocaleLowerCase(L);
  const list=PR.map((p,i)=>({p,i})).filter(({p})=>(UC.ax<0||p.a===UC.ax)&&(UC.ca<0||pCA(p).includes(UC.ca))&&(!q||p.n.toLocaleLowerCase(L).includes(q)));
  $('#ucN').textContent=tr('cat_n').replace('{n}',list.length);
  $('#ucG').innerHTML=list.length?list.map(({p,i})=>ucCard(p,i,L,AX)).join(''):'<div class="uc-empty"><p>'+esc2(tr('cat_empty'))+'</p><a class="b-sec" href="'+IFU.U.urunler+'">'+esc2(tr('all_prods'))+'</a></div>';
 }else{
  const p=PR[UC.urun],axn=AX[p.a],open=!!p.open;
  const areas=pCA(p).map(i=>'<a href="'+IFU.alan(i)+'">'+esc2(CA[i])+'</a>').join('');
  const pc=pCA(p),all=PR.map((x,i)=>({x,i})).filter(o=>o.i!==UC.urun),same=all.filter(o=>o.x.a===p.a),near=all.filter(o=>o.x.a!==p.a&&pCA(o.x).some(c=>pc.includes(c)));const more=same.concat(near).slice(0,4);
  $('#ucD').innerHTML=
   '<a class="uc-back" href="'+ucHref({ax:p.a,ca:-1})+'"><i aria-hidden="true">←</i><span>'+esc2(axn)+'</span></a>'+
   '<div class="uc-dg"><div class="uc-vis'+(p.img?' has-img':'')+'" style="--tc:'+(AXC[p.a]||'#17707A')+(p.img?';--im:url(&quot;'+esc2(encodeURI(p.img))+'&quot;)':'')+'">'+(p.img?'<img src="'+esc2(p.img)+'" alt="'+esc2(p.n)+'" loading="lazy">':'')+'<small>'+String(p.a+1).padStart(2,'0')+' · '+esc2(axn)+'</small><span>'+esc2(p.n)+'</span></div>'+
   '<div class="uc-info"><dl class="uc-meta"><div><dt>'+esc2(tr('d_ax'))+'</dt><dd><a href="'+ucHref({ax:p.a,ca:-1})+'">'+String(p.a+1).padStart(2,'0')+' '+esc2(axn)+'</a></dd></div>'+
   '<div><dt>'+esc2(tr('d_ca'))+'</dt><dd class="uc-areas">'+areas+'</dd></div><div><dt>'+esc2(tr('d_lang'))+'</dt><dd>TR · EN</dd></div></dl>'+
   (open?'<div class="uc-box open"><h2>'+tr('op_t')+'</h2><p>'+tr('op_b')+'</p><button type="button" class="b-pri" data-gate><span>'+esc2(tr('pd_cta'))+'</span><span class="o"></span></button></div>'
        :'<div class="uc-box lock"><h2>'+tr('lk_t')+'</h2><p>'+tr('lk_b')+'</p><button type="button" class="b-pri" id="ucGate"><span>'+esc2(tr('pd_cta'))+'</span><span class="o"></span></button></div>')+
   '</div></div>'+
   (more.length?'<div class="uc-more"><h2>'+esc2(tr('uc_sim'))+'</h2><div class="uc-g">'+more.map(o=>ucCard(o.x,o.i,L,AX)).join('')+'</div></div>':'');
  const g=$('#ucGate');if(g)g.addEventListener('click',()=>{IF.after=p.n;IF.openGate();});ucExtra(p,L);
 }
}
function ucGo(href,push){history[push?'pushState':'replaceState']({ifuc:1},'',href);ucRead();renderUC();crumbs();titleSync();pgMode();}
if(P==='urunler'){
 ['ucEy','ucP'].forEach(id=>{const e=$('#'+id);if(e)e.removeAttribute('data-t');});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||!IFU.same(a.href,'urunler')||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();closeNav();
  /* filtre düğmeleri (eksen, klinik alan) sayfayı yerinde bırakır; ürün açılınca ya da başka yerden gelinince başa dönülür */
  const inFilter=!!a.closest('.uc-bar,.uc-ca,.uc-ax');const toProd=new URL(a.href).searchParams.has('urun');
  ucGo(a.href,true);if(!inFilter||toProd)scrollTo({top:0,behavior:'auto'});});
 $('#ucQ').addEventListener('input',e=>{UC.q=e.target.value;/* arama her zaman bütün ürünlerde: seçili grup/klinik alan sıfırlanır */if(UC.q.trim()&&(UC.ax>=0||UC.ca>=0)){UC.ax=-1;UC.ca=-1;history.replaceState({ifuc:1},'',IFU.U.urunler);crumbs();titleSync();}renderUC();});
 addEventListener('popstate',()=>{ucRead();renderUC();crumbs();titleSync();pgMode();});
}

/* ---- uzmanlık genel bakış: ana sayfadaki altı kartın aynısı ---- */
function renderUZ(){const g=$('#uzG');if(!g||P!=='uzmanlik')return;g.innerHTML='';$$('#uaG .ua-c').forEach(c=>{const k=c.cloneNode(true);k.removeAttribute('data-rv');k.classList.add('in');g.appendChild(k);});}
/* ---- hakkımızda: iş ortakları logoları (kayan banttaki logoların tekil kopyası) ---- */
function renderHK(){
 const g=$('#hkPt');if(!g||P!=='hakkimizda')return;
 const seen=new Set(),out=[];
 $$('#ptTrack .pt-l').forEach(l=>{if(l.getAttribute('aria-hidden')==='true')return;const im=l.querySelector('img'),key=im?im.getAttribute('src'):l.textContent;if(seen.has(key))return;seen.add(key);const c=l.cloneNode(true);c.removeAttribute('tabindex');out.push(c);});
 if(!out.length)return;
 if(g._filmObserver)g._filmObserver.disconnect();
 g.innerHTML='';g.classList.add('hk-film');
 const control=document.createElement('button');control.type='button';control.className='film-control';control.setAttribute('aria-pressed','false');
 const label=()=>{const stopped=g.classList.contains('is-paused');control.textContent=IF.lang==='tr'?(stopped?'Hareketi sürdür':'Hareketi durdur'):(stopped?'Resume motion':'Pause motion');control.setAttribute('aria-pressed',String(stopped));};
 control.onclick=()=>{g.classList.toggle('is-paused');label();};label();g.appendChild(control);
 const size=Math.ceil(out.length/3);
 for(let row=0;row<3;row++){
  const items=out.slice(row*size,(row+1)*size);if(!items.length)continue;
  const rail=document.createElement('div');rail.className='film-rail';
  const belt=document.createElement('div');belt.className='film-track';belt.style.setProperty('--film-duration',(100+row*12)+'s');
  for(let copy=0;copy<2;copy++){const group=document.createElement('div');group.className='film-group';
   if(copy){group.setAttribute('aria-hidden','true');}
   items.forEach(item=>{const c=item.cloneNode(true);c.querySelectorAll('img').forEach(i=>{i.loading='eager';});if(copy){c.tabIndex=-1;const im=c.querySelector('img');if(im)im.alt='';}group.appendChild(c);});belt.appendChild(group);}
  rail.appendChild(belt);g.appendChild(rail);
 }
 /* kayan bant: kart genişliği sabit (CSS --cw), grup genişliği = adet × (kart + boşluk); ölçüm yok, Safari'de de bindirme yok */
 g.querySelectorAll('.film-track').forEach(t=>{const n=t.querySelector('.film-group').children.length;t.style.setProperty('--n',n);});
 const sync=()=>g.classList.toggle('film-active',g.dataset.inview==='true'&&!document.hidden);
 g._filmObserver=new IntersectionObserver(es=>{g.dataset.inview=String(es[0].isIntersecting);sync();},{threshold:.05});g._filmObserver.observe(g);
 if(!g.dataset.visibilityBound){document.addEventListener('visibilitychange',sync);g.dataset.visibilityBound='1';}
 const sec=g.closest('.hk-pt');if(sec)sec.classList.add('in');
}

/* ---- sayfa yolu: her alt sayfada Ana sayfa › Bölüm › Ayrıntı ---- */
function crumbs(){
 $$('.bc').forEach(n=>n.remove());if(!curView)return;
 const L=IF.lang||'tr',D=D2(),CA=D.CA[L]||D.CA.en,AX=D.AX[L]||D.AX.en,items=[[tr('pg_home'),IFU.U.home]];
 if(P==='uzmanlik'){items.push([tr('nav2'),alanI>=0?IFU.U.uzmanlik:null]);if(alanI>=0)items.push([CA[alanI],null]);}
 else if(P==='urunler'){const deep=UC.ax>=0||UC.urun>=0;items.push([tr('nav3'),deep?IFU.U.urunler:null]);
  if(UC.urun>=0){const p=D.PRODS[UC.urun];items.push([AX[p.a],ucHref({ax:p.a,ca:-1})]);items.push([p.n,null]);}else if(UC.ax>=0)items.push([AX[UC.ax],null]);}
 else items.push([tr({uretim:'nav_ur',hakkimizda:'nav1',bilim:'nav4',guncel:'nav6',iletisim:'nav5',kvkk:'ft_kvkk'}[P]),null]);
 const nav=document.createElement('nav');nav.className='bc';nav.setAttribute('aria-label',tr('bc'));const ol=document.createElement('ol');
 items.forEach(([t,h])=>{const li=document.createElement('li');let e;if(h){e=document.createElement('a');e.href=h;}else{e=document.createElement('span');e.setAttribute('aria-current','page');}e.textContent=t;li.appendChild(e);ol.appendChild(li);});
 nav.appendChild(ol);const host=$('#'+curView+' .pg-in');if(host)host.insertBefore(nav,host.firstChild);
}
function titleSync(){const L=IF.lang||'tr',D=D2(),AX=D.AX[L]||D.AX.en,CA=D.CA[L]||D.CA.en;let t='';
 if(P==='uzmanlik')t=alanI>=0?CA[alanI]:tr('nav2');
 else if(P==='urunler')t=UC.urun>=0?D.PRODS[UC.urun].n:(UC.ax>=0?AX[UC.ax]:tr('nav3'));
 else if(P!=='home')t=tr({uretim:'nav_ur',hakkimizda:'nav1',bilim:'nav4',guncel:'nav6',iletisim:'nav5',kvkk:'ft_kvkk'}[P]);
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
/* başlık boyu: büyük video yalnız Hakkımızda ve Üretim'de; ürün ayrıntısında video yok (ürünün kendi görseli hemen altta) */
function pgMode(){const pg=curView&&$('#'+curView+' .pg');if(!pg)return;pg.classList.toggle('pg-tall',P==='hakkimizda'||P==='uretim');pg.classList.toggle('pg-det',P==='urunler'&&UC.urun>=0);}
/* alt sayfa başlıkları: aynı videolar yerine sayfaya uygun görsellerin yavaş geçişli döngüsü (firma videoları gelene kadar) */
const PGI={urunler:['genis/hero-urun.webp','genis/portfolio-regenflex-studio.webp','genis/regenyal-siringhe.webp'],
 uretim:['genis/hero-uretim.webp','genis/regenyal-laboratuvar.webp','genis/hero-laboratuvar.webp'],
 bilim:['genis/hero-bilim.webp','genis/hero-laboratuvar.webp','genis/regenyal-laboratuvar.webp'],
 guncel:['genis/hero-bilim.webp','genis/regenyal-laboratuvar.webp','genis/hero-laboratuvar.webp'],
 uzmanlik:['banner/ortopedi.webp','banner/uroloji.webp','banner/kadin-sagligi.webp','banner/noroloji.webp','banner/estetik.webp','banner/diger.webp'],
 hakkimizda:['genis/hero-laboratuvar.webp','genis/hero-uretim.webp','genis/regenyal-laboratuvar.webp'],
 iletisim:['genis/regenyal-laboratuvar.webp','genis/hero-laboratuvar.webp']};
function pgVideo(){const L=PGI[P];if(!L||!curView)return;const pg=$('#'+curView+' .pg');if(!pg||pg.querySelector('.pg-vid'))return;
 const f=document.createElement('figure');f.className='pg-vid pg-loop'+(P==='uzmanlik'?' pg-alan':'')+(P==='iletisim'?' pg-ct':'');f.setAttribute('aria-hidden','true');
 f.innerHTML=L.map((u,i)=>'<img class="pl'+(i?'':' on')+'" src="'+(window.IF_BASE||'')+'media/'+u+'" alt="" decoding="async"'+(i?' loading="lazy"':'')+'>').join('');
 pg.appendChild(f);pg.classList.add('has-vid');
 if(L.length<2||matchMedia('(prefers-reduced-motion: reduce)').matches)return;let k=0;
 const t=setInterval(()=>{const im=f.querySelectorAll('img.pl');if(!im.length||!f.isConnected){clearInterval(t);return;}im[k%im.length].classList.remove('on');k++;im[k%im.length].classList.add('on');},6000);}
ucRead();v2route();v2refresh();pgVideo();pgMode();setTimeout(renderHK,1500);
if(location.hash&&location.hash!=='#pro'){const t=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(t)requestAnimationFrame(()=>setTimeout(()=>t.scrollIntoView({block:'start'}),80));}

/* WordPress: gövdedeki .html bağlantıları sayfa adresleriyle değiştirilir (GitHub'da dokunulmaz) */

/* ===== panelden gelen sosyal medya adresleri: boş bırakılan simge gizlenir ===== */
(function(){const S=window.IF_CMS&&window.IF_CMS.set;if(!S)return;
 [['Instagram','instagram'],['Facebook','facebook'],['LinkedIn','linkedin'],['YouTube','youtube']].forEach(([lab,k])=>{
  if(!(k in S))return;
  document.querySelectorAll('.il-soc a[aria-label="'+lab+'"],.site-foot a[aria-label="'+lab+'"]').forEach(a=>{if(S[k]){a.href=S[k];a.hidden=false;}else a.hidden=true;});});
})();

/* ürün görseli yüklenemezse (dosya yoksa) renkli ad kutusuna dön */
document.addEventListener('error',e=>{const im=e.target;if(!(im instanceof HTMLImageElement))return;
 if(im.classList.contains('uc-ci')){const c=im.closest('.uc-c'),art=im.closest('.uc-art');if(c){c.classList.remove('has-img');c.classList.add('no-img');}if(art){art.className='uc-art uc-soon';art.innerHTML='<i></i><em>'+esc2(tr('img_soon'))+'</em>';}else im.remove();}
 else if(im.parentElement&&im.parentElement.classList.contains('uc-vis')){im.parentElement.classList.remove('has-img');im.remove();}},true);

/* ---- mobil menü: açılınca bulunulan bölüm açık gelir; menüdeki sağlık çalışanı girişi menüyü kapatır ---- */
{const bg=$('#nvBurger');if(bg)bg.addEventListener('click',()=>{if(!siteEl.classList.contains('nav-open'))return;const c=$('.site-top .nv.cur');if(c&&!$('.site-top .nv.open')){c.classList.add('open');c.firstElementChild.setAttribute('aria-expanded','true');}const n=$('#pubNav');if(n)n.scrollTop=0;});
 const nh=$('.nv-hcp');if(nh)nh.addEventListener('click',()=>closeNav(),true);}


/* Observe dynamically rendered cards once; do not animate off-screen or hidden tabs. */
(function(){
 const seen=new WeakSet(),visible=new Set();
 const sync=()=>visible.forEach(el=>el.classList.toggle('motion-visible',!document.hidden));
 const ob=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
  if(isIntersecting)visible.add(target);else visible.delete(target);
  target.classList.toggle('motion-visible',isIntersecting&&!document.hidden);
 }),{rootMargin:'30px',threshold:0});
 function scan(root){if(root.nodeType!==1)return;
  const cards=root.matches('.uc-c,.pcard,.ua-c')?[root]:[...root.querySelectorAll('.uc-c,.pcard,.ua-c')];
  cards.forEach(el=>{if(!seen.has(el)){seen.add(el);ob.observe(el);}});
 }
 scan(document.querySelector('.site'));
 new MutationObserver(entries=>{entries.forEach(e=>e.addedNodes.forEach(scan));visible.forEach(el=>{if(!el.isConnected){visible.delete(el);ob.unobserve(el);}});}).observe(document.querySelector('.site'),{childList:true,subtree:true});
 document.addEventListener('visibilitychange',sync);
})();


/* ---- üretim: her fotoğrafın üstünde küçük başlık; hafifçe yükselerek belirir ---- */
{const uf=$('.ur-f');if(uf&&!uf.querySelector('figure'))[...uf.querySelectorAll(':scope>img')].forEach((im,i)=>{const f=document.createElement('figure');f.className='ur-ph';f.dataset.rv='up';f.style.setProperty('--i',i);
 const c=document.createElement('figcaption');c.innerHTML='<i>'+String(i+1).padStart(2,'0')+'</i><span data-t="ur_f'+(i+1)+'"></span>';c.lastChild.textContent=tr('ur_f'+(i+1));
 im.removeAttribute('data-rv');im.classList.remove('in','seen');uf.insertBefore(f,im);f.appendChild(c);f.appendChild(im);io.observe(f);});}

/* ---- örnek içerik (sunum için): yer tutucuların yerine örnek metin ve "Örnektir" işaretli görseller.
        Tüm metinler dil anahtarıdır; WordPress'te Intrafarma → Metinler ekranından değiştirilir. ---- */
{const T2=k=>{const v=tr(k);return v===k?'':v;},sp=(k,tagName,cls)=>'<'+(tagName||'span')+(cls?' class="'+cls+'"':'')+' data-t="'+k+'">'+T2(k)+'</'+(tagName||'span')+'>';
 /* WordPress → Intrafarma → Bölüm görselleri: kart sayıları, fotoğraflar, bağlantılar, "Örnektir" etiketi */
 const O=(window.IF_CMS&&window.IF_CMS.orn)||{},ON=O.tag!==false;
 const n=(k,max)=>{const v=parseInt(O['n_'+k],10);return Array.from({length:isNaN(v)?0:Math.max(0,Math.min(max,v))},(_,i)=>i+1);};
 const at=(arr,i)=>(Array.isArray(arr)&&arr[i-1])||{};
 const safe=u=>{u=String(u||'').trim();return u&&(/^https?:\/\//i.test(u)||!/^[a-z][a-z0-9+.-]*:/i.test(u))?esc2(u):'';};
 const tag=k=>ON?'<em class="ornek" data-t="'+(k||'ornek')+'">'+T2(k||'ornek')+'</em>':'';
 const AV='<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="45" r="20"/><path d="M17 121c2-27 19-41 43-41s41 14 43 41z"/><path class="c" d="M47 81l13 17 13-17"/></svg>';
 const note=ON?'<p class="mk-note"><i aria-hidden="true"></i>'+sp('ornek_note')+'</p>':'';
 const img=u=>'<img src="'+safe(u)+'" alt="" loading="lazy" decoding="async">';
 const lnk=(u,inner,cls)=>safe(u)?'<a'+(cls?' class="'+cls+'"':'')+' href="'+safe(u)+'" target="_blank" rel="noopener">'+inner+'</a>':inner;
 const put=(sel,html,count)=>{const p=$(sel);if(!p||!count)return;const d=document.createElement('div');d.className='orn-b'+(ON?'':' orn-off');d.innerHTML=html;p.replaceWith(d);d.querySelectorAll('[data-rv]').forEach(e=>io.observe(e));};
 const B=window.IF_BASE||'';
 /* bilim: danışma kurulu */
 {const L=n('kurul',4);put('#kurul .pend-card',sp('bk_lede','p','mk-lede')+'<div class="bk-g mk-bk">'+L.map((i,j)=>{const ph=at(O.kurul,i).img;return '<figure data-rv="up" style="--i:'+j+'"><div class="mk-av a'+i+(ph?' has-img':'')+'">'+(ph?img(ph):AV)+tag()+'</div><figcaption>'+sp('bk'+i+'_n','b')+sp('bk'+i+'_r','span')+sp('bk'+i+'_d','small')+'</figcaption></figure>';}).join('')+'</div>'+note,L.length);}
 /* bilim: sık sorulan sorular */
 $$('#sss .fq-l details').forEach((d,i)=>{const a=d.querySelector('p');if(a&&T2('fq_a'+(i+1))){a.dataset.t='fq_a'+(i+1);a.innerHTML=T2('fq_a'+(i+1));}});
 /* güncel: etkinlikler */
 {const L=n('etkinlik',3);put('#etkinlikler .pend-card','<div class="mk-ev">'+L.map((i,j)=>'<article data-rv="up" style="--i:'+j+'">'+sp('ev'+i+'_d','time')+'<div>'+lnk(at(O.etkinlik,i).url,sp('ev'+i+'_t','b'))+sp('ev'+i+'_p','small')+'</div>'+tag()+'</article>').join('')+'</div><a class="hc-m mk-cta" href="'+IFU.U.iletisim+'">'+sp('ev_cta')+'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></a>',L.length);}
 /* güncel: yazılar */
 {const L=n('yazi',3);put('#yayinlar .pend-card','<div class="bl-g mk-bl">'+L.map((i,j)=>{const x=at(O.yazi,i);return '<article data-rv="up" style="--i:'+j+'"><div class="mk-cov c'+i+(x.img?' has-img':'')+'">'+(x.img?img(x.img):'')+tag(x.img?'ornek':'ornek_img')+sp('bl_c'+i,'span','bl-c')+'</div>'+lnk(x.url,sp('bl'+i+'_t','h3'),'mk-h')+sp('bl'+i+'_p','p')+'<footer>'+sp('bl'+i+'_m','small')+lnk(x.url,'<span class="mk-more">'+sp('bl_read')+' →</span>')+'</footer></article>';}).join('')+'</div>'+note,L.length);}
 /* hakkımızda: medya ve basın */
 {const L=n('basin',3),F=O.film||{};put('.hk-med .pend-card','<div class="mk-md">'+lnk(F.url,'<figure class="mk-film" data-rv="up">'+img(F.img||B+'media/gorsel/regenyal-laboratuvar.jpg')+'<span class="mk-play" aria-hidden="true"></span>'+tag()+'<figcaption>'+sp('md_film','b')+sp('md_film_p','span')+'</figcaption></figure>','mk-film-a')+(L.length?'<ul class="mk-press">'+L.map((i,j)=>'<li data-rv="up" style="--i:'+(j+1)+'">'+sp('md'+i+'_s','small')+lnk(at(O.basin,i).url,sp('md'+i+'_t','b'))+sp('md'+i+'_d','time')+tag()+'</li>').join('')+'</ul>':'')+'</div>'+note,(F.url||L.length)?1:0);}
 /* üretim: adım açıklamaları */
 $$('.ur-g article p').forEach((a,i)=>{if(T2('ur_p'+(i+1))){a.dataset.t='ur_p'+(i+1);a.textContent=T2('ur_p'+(i+1));}});
}

/* ===== Ürün sayfası ekleri (panelden): uzun açıklama, öne çıkanlar, video; Pro: fotoğraf, teknik bilgi, belgeler ===== */
function pTx(p,k,L){const o=p&&p[k]||{};return String(o[L]||o.en||o.tr||'').trim();}
function pParas(t){return t?t.split(/\n\s*\n/).map(x=>'<p>'+esc2(x.trim()).replace(/\n/g,'<br>')+'</p>').join(''):'';}
function pLines(t){return t?t.split('\n').map(x=>x.replace(/^\s*[-•*]\s*/,'').trim()).filter(Boolean):[];}
function pRows(t){return pLines(t).map(x=>{const i=x.indexOf(':');return i>0?[x.slice(0,i).trim(),x.slice(i+1).trim()]:['',x];});}
function pVid(u){u=String(u||'').trim();if(!u)return null;let m=u.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{6,})/i);if(m)return {k:'yt',src:'https://www.youtube-nocookie.com/embed/'+m[1]+'?autoplay=1&rel=0&modestbranding=1'};
 m=u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);if(m)return {k:'vm',src:'https://player.vimeo.com/video/'+m[1]+'?autoplay=1&dnt=1'};return /^(https?:)?\/\/|^\//i.test(u)?{k:'mp4',src:u}:null;}
function vidBox(p,cls){const v=pVid(p.v);if(!v)return '';const im=p.img?' style="--im:url(&quot;'+esc2(encodeURI(p.img))+'&quot;)"':'';
 return '<div class="'+cls+(p.img?' has-img':'')+'"'+im+' data-vk="'+v.k+'" data-vs="'+esc2(v.src)+'"><button type="button" class="vplay"><i aria-hidden="true"></i><span data-t="ux_play">'+esc2(tr('ux_play'))+'</span></button>'+(v.k==='mp4'?'':'<small data-t="ux_vnote">'+esc2(tr('ux_vnote'))+'</small>')+'</div>';}
document.addEventListener('click',e=>{const b=e.target.closest('.vplay');if(!b)return;const box=b.parentElement,k=box.dataset.vk,src=box.dataset.vs;
 box.innerHTML=k==='mp4'?'<video controls autoplay playsinline src="'+esc2(src)+'"></video>':'<iframe src="'+esc2(src)+'" title="Video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>';box.classList.add('on');});
function ucExtra(p,L){const u=pTx(p,'u',L),f=pLines(pTx(p,'f',L)),vb=vidBox(p,'ux-vid');if(!u&&!f.length&&!vb)return;
 const s=document.createElement('section');s.className='ux'+(vb?'':' nov');
 s.innerHTML='<div class="ux-txt">'+(u?'<h2 data-t="ux_about">'+esc2(tr('ux_about'))+'</h2>'+pParas(u):'')+(f.length?'<h3 data-t="ux_feat">'+esc2(tr('ux_feat'))+'</h3><ul class="ux-feat">'+f.map(x=>'<li>'+esc2(x)+'</li>').join('')+'</ul>':'')+'</div>'+(vb?'<div class="ux-v"><h3 data-t="ux_vid">'+esc2(tr('ux_vid'))+'</h3>'+vb+'</div>':'');
 const dg=$('#ucD .uc-dg');if(dg)dg.after(s);}
/* Pro ürün sayfası: örnek (Regenflex) kartın yerine ürünün kendi bilgileri */
{let ORIG=null;const Q=s=>document.querySelector(s);
 const keep=()=>{if(ORIG)return;ORIG={tiles:Q('#zoom .tiles').innerHTML,docs:Q('#zoom .docs').innerHTML,pub:Q('#zoom [data-pane="2"]').innerHTML,lede:Q('#zoom .z-lede').innerHTML};};
 window.proRestore=()=>{if(!ORIG)return;Q('#zoom .tiles').innerHTML=ORIG.tiles;Q('#zoom .docs').innerHTML=ORIG.docs;Q('#zoom [data-pane="2"]').innerHTML=ORIG.pub;const l=Q('#zoom .z-lede');l.innerHTML=ORIG.lede;l.dataset.t='z_lede';
  const tg=Q('#zoom .z-body>.tag');if(tg)tg.hidden=false;const st=Q('#zoom .pstage');st.classList.remove('has-ph');st.querySelectorAll('.pph').forEach(x=>x.remove());window.IF_CUR='';};
 window.proExtra=p=>{keep();const L=IF.lang||'tr',D=window.IFD,AX=(D.AX[L]||D.AX.en),CA=(D.CA[L]||D.CA.en);window.IF_CUR=p.n;
  const ds=pTx(p,'d',L)||pTx(p,'u',L).split(/\n\s*\n/)[0];const l=Q('#zoom .z-lede');if(ds){l.textContent=ds;delete l.dataset.t;}
  const real=!!(pTx(p,'t',L)||(p.docs&&p.docs.length)||pTx(p,'u',L));const tg=Q('#zoom .z-body>.tag');if(tg)tg.hidden=real;
  const st=Q('#zoom .pstage');st.querySelectorAll('.pph').forEach(x=>x.remove());
  if(p.img||p.v){const ph=document.createElement('div');ph.className='pph';ph.innerHTML=(p.img?'<img src="'+esc2(p.img)+'" alt="'+esc2(p.n)+'">':'')+vidBox(p,'pph-v');st.appendChild(ph);st.classList.add('has-ph');}else st.classList.remove('has-ph');
  const T=(k,v,acc)=>'<div class="tile'+(acc?' acc':'')+'"><span>'+esc2(k)+'</span><b>'+esc2(v)+'</b></div>';
  const rows=pRows(pTx(p,'t',L));
  Q('#zoom .tiles').innerHTML=T(tr('dt1'),AX[p.a])+T(tr('d_ca'),pCA(p).map(i=>CA[i]).join(', '))+T(tr('dt4'),p.open?tr('z_open'):tr('dd4'),true)+(rows.length?rows.map(r=>T(r[0]||tr('tab1'),r[1])).join(''):T(tr('tab1'),tr('z_notech')));
  const docs=(p.docs||[]).filter(d=>d&&d.n),DTN=['ifu','tds','bro','cert','pub'];
  const li=d=>'<li><span class="fi">PDF</span><div><b>'+esc2(d.n)+'</b><small>'+esc2(tr('dt_'+DTN[+d.ty||0]))+'</small></div>'+(d.url?'<a class="gbtn lt" href="'+esc2(d.url)+'" target="_blank" rel="noopener">'+esc2(tr('d_dl'))+'</a>':'<button class="gbtn lt" type="button" data-mailjump>'+esc2(tr('d_get'))+'</button>')+'</li>';
  const nd=docs.filter(d=>+d.ty!==4),pd=docs.filter(d=>+d.ty===4);
  Q('#zoom .docs').innerHTML=nd.length?nd.map(li).join(''):'<li class="none"><div><b>'+esc2(tr('z_nodoc'))+'</b></div></li>';
  if(pd.length)Q('#zoom [data-pane="2"]').innerHTML='<ul class="docs">'+pd.map(li).join('')+'</ul>';
  if(window.IF&&IF.setInds)IF.setInds();};
}

/* Bölüm görselleri (panel): klinik alan görselleri ve üretim fotoğrafları */
{const O2=(window.IF_CMS&&window.IF_CMS.orn)||{},al=Array.isArray(O2.alan)?O2.alan:[],ur=Array.isArray(O2.uretim)?O2.uretim:[],K=['ortopedi','spor-hekimligi','estetik','uroloji','kadin-sagligi','veteriner'];
 const sw=()=>{$$('img[src*="media/alan/"]').forEach(im=>{const m=im.getAttribute('src').match(/media\/alan\/([a-z-]+)\.webp/);const i=m?K.indexOf(m[1]):-1;if(i>=0&&al[i])im.src=al[i];});$$('.ur-f img').forEach((im,i)=>{if(ur[i])im.src=ur[i];});};
 if(al.some(Boolean)||ur.some(Boolean)){sw();if(IF.onLang)IF.onLang.push(sw);}}

/* telefonda "Test sürümü" etiketi yalnız sayfanın başında görünür */
if(matchMedia('(max-width:640px)').matches){addEventListener('scroll',()=>{const d=document.querySelector('.draft-chip');if(d)d.classList.toggle('dc-hide',scrollY>140);},{passive:true});}

/* ===================== Revize 1 (19.11): firmanın yorumlarına göre eklenenler ===================== */
/* site araması: sağ üstteki büyüteç ya da "/" tuşu; ürün, ürün grubu ve uzmanlık alanı arar */
{const D=window.IFD;const box=document.createElement('div');box.className='srch-o';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','srchL');
 box.innerHTML='<div class="srch-p"><label class="srch-f" id="srchL"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4.5 4.5"/></svg><input type="search" id="srchQ" autocomplete="off" enterkeyhint="search"></label><button type="button" class="srch-x" data-tl="close"><span aria-hidden="true">×</span></button><div class="srch-r" id="srchR"></div></div>';
 document.body.appendChild(box);
 const q=box.querySelector('input'),R=box.querySelector('.srch-r'),btn=$('#nvSrch');let back=null;
 const norm=s=>String(s).toLocaleLowerCase('tr').replace(/ı/g,'i').normalize('NFD').replace(/[̀-ͯ]/g,'');
 function run(){const L=IF.lang||'tr',v=norm(q.value.trim()),AXl=D.AX[L]||D.AX.en,CAl=D.CA[L]||D.CA.en;q.placeholder=tr('srch_ph');q.setAttribute('aria-label',tr('srch'));
  if(!v){const pr=D.PRODS.filter(p=>p.pr||p.nw).slice(0,6);
   R.innerHTML=(pr.length?'<h3>'+esc2(tr('srch_pop'))+'</h3><ul class="srch-p1">'+pr.map(p=>'<li><a href="'+esc2(IFU.prod(p))+'">'+(p.img?'<img src="'+esc2(p.img)+'" alt="" loading="lazy">':'<i aria-hidden="true"></i>')+'<b>'+esc2(p.n)+'</b><small>'+esc2(AXl[p.a]||'')+'</small></a></li>').join('')+'</ul>':'')
    +'<h3>'+esc2(tr('srch_g'))+'</h3><ul class="srch-sg">'+AXl.map((n,i)=>'<li><a href="'+esc2(IFU.ax(i))+'">'+esc2(n)+'</a></li>').join('')+'</ul>';return;}
  const P=D.PRODS.filter(p=>norm(p.n).includes(v)||norm(AXl[p.a]||'').includes(v)).slice(0,9),G=AXl.map((n,i)=>({n,i})).filter(o=>norm(o.n).includes(v)),A=CAl.map((n,i)=>({n,i})).filter(o=>norm(o.n).includes(v));
  let h='';
  if(P.length)h+='<h3>'+esc2(tr('nav3'))+'</h3><ul class="srch-p1">'+P.map(p=>'<li><a href="'+esc2(IFU.prod(p))+'">'+(p.img?'<img src="'+esc2(p.img)+'" alt="" loading="lazy">':'<i aria-hidden="true"></i>')+'<b>'+esc2(p.n)+'</b><small>'+esc2(AXl[p.a]||'')+'</small></a></li>').join('')+'</ul>';
  if(G.length)h+='<h3>'+esc2(tr('srch_g'))+'</h3><ul class="srch-p2">'+G.map(o=>'<li><a href="'+esc2(IFU.ax(o.i))+'">'+esc2(o.n)+'</a></li>').join('')+'</ul>';
  if(A.length)h+='<h3>'+esc2(tr('n_uzm'))+'</h3><ul class="srch-p2">'+A.map(o=>'<li><a href="'+esc2(IFU.alan(o.i))+'">'+esc2(o.n)+'</a></li>').join('')+'</ul>';
  R.innerHTML=h||'<p class="srch-0">'+esc2(tr('srch_none'))+'</p>';}
 function open(){back=document.activeElement;box.hidden=false;document.documentElement.classList.add('srch-on');run();setTimeout(()=>q.focus(),30);}
 function close(){if(box.hidden)return;box.hidden=true;document.documentElement.classList.remove('srch-on');if(back&&back.focus)back.focus();}
 q.addEventListener('input',run);box.querySelector('.srch-x').addEventListener('click',close);box.addEventListener('click',e=>{if(e.target===box)close();});
 q.addEventListener('keydown',e=>{if(e.key==='Enter'){const a=R.querySelector('a');if(a){e.preventDefault();location.href=a.href;}}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close();else if(e.key==='/'&&box.hidden&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')&&!document.documentElement.classList.contains('pro-on')){e.preventDefault();open();}});
 if(btn){btn.addEventListener('click',open);btn.setAttribute('aria-label',tr('srch'));}
 $$('[data-srch]').forEach(x=>x.addEventListener('click',()=>{const st=document.querySelector('.site');if(st&&st.classList.contains('nav-open')){const bg=$('#nvBurger');if(bg)bg.click();}open();}));
 IF.onLang.push(()=>{if(btn)btn.setAttribute('aria-label',tr('srch'));if(!box.hidden)run();});}

/* ana sayfa: premium kitler ürün portföyü bölümünün görselinde reklam gibi döner (panelde "premium bant" kutusu) */
{const F=$('section.hp .hp-f');if(F&&window.IFD){const K=IFD.PRODS.filter(p=>p.pr&&p.img);let cur=0,tm=null;
 if(K.length){F.classList.add('kb-on');F.setAttribute('aria-live','polite');
 const draw=()=>{const L=IF.lang||'tr',ey=tr('kb_ey').replace(/^\/\s*/,'');
  F.innerHTML=K.map((p,i)=>'<a class="kb-c'+(i===cur?' on':'')+'" href="'+esc2(IFU.prod(p))+'"'+(i===cur?'':' tabindex="-1" aria-hidden="true"')+'><img src="'+esc2(p.img)+'" alt="" decoding="async"'+(i?' loading="lazy"':'')+'><span class="kb-tx"><small>'+esc2(ey)+'</small><b>'+esc2(p.n)+'</b><span class="kb-go">'+esc2(tr('kb_go'))+' →</span></span></a>').join('')+(K.length>1?'<div class="kb-dots" role="group">'+K.map((p,i)=>'<button type="button" aria-label="'+esc2(p.n)+'" aria-pressed="'+(i===cur)+'"></button>').join('')+'</div>':'');
  F.querySelectorAll('.kb-dots button').forEach((b,i)=>b.addEventListener('click',e=>{e.preventDefault();go(i);stop();}));};
 const go=i=>{cur=(i+K.length)%K.length;F.querySelectorAll('.kb-c').forEach((c,j)=>{const on=j===cur;c.classList.toggle('on',on);if(on){c.removeAttribute('tabindex');c.removeAttribute('aria-hidden');}else{c.setAttribute('tabindex','-1');c.setAttribute('aria-hidden','true');}});F.querySelectorAll('.kb-dots button').forEach((b,j)=>b.setAttribute('aria-pressed',j===cur));};
 const play=()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches||K.length<2||tm)return;tm=setInterval(()=>go(cur+1),5200);};
 const stop=()=>{clearInterval(tm);tm=null;};
 draw();play();F.addEventListener('mouseenter',stop);F.addEventListener('mouseleave',play);F.addEventListener('focusin',stop);IF.onLang.push(draw);}}}

/* yukarı kaydırırken girişler daha hızlı ve yarı büyüklükte (aşağı inerken büyük hareket kalır) */
{let y0=scrollY,up=false;const H=document.documentElement;
 addEventListener('scroll',()=>{const y=scrollY,d=y-y0;if(Math.abs(d)<6)return;const u=d<0;if(u!==up){up=u;H.classList.toggle('rv-up',u);}y0=y;},{passive:true});}

/* ana sayfa: bilimsel danışma kurulundan bir kesit (Bölüm görselleri → Danışma kurulu ile aynı veriler) */
{const g=$('#krG');if(g){const O=(window.IF_CMS&&IF_CMS.orn)||{},ON=O.tag!==false,v=parseInt(O.n_kurul,10),N=isNaN(v)?4:Math.max(0,Math.min(4,v));
 const AV='<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="45" r="20"/><path d="M17 121c2-27 19-41 43-41s41 14 43 41z"/><path class="c" d="M47 81l13 17 13-17"/></svg>';
 if(!N)$('#kurul-ozet').hidden=true;
 g.innerHTML=Array.from({length:N},(_,j)=>{const i=j+1,ph=(Array.isArray(O.kurul)&&O.kurul[j]||{}).img;return '<figure data-rv="up" style="--i:'+j+'"><div class="mk-av a'+i+(ph?' has-img':'')+'">'+(ph?'<img src="'+esc2(ph)+'" alt="" loading="lazy" decoding="async">':AV)+(ON?'<em class="ornek" data-t="ornek">'+esc2(tr('ornek'))+'</em>':'')+'</div><figcaption><b data-t="bk'+i+'_n">'+esc2(tr('bk'+i+'_n'))+'</b><span data-t="bk'+i+'_r">'+esc2(tr('bk'+i+'_r'))+'</span></figcaption></figure>';}).join('');
 g.querySelectorAll('[data-rv]').forEach(e=>io.observe(e));}}

/* Pro: ürün kataloğu yalnızca Pro alanında indirilir (WordPress → İletişim ve sosyal medya → Ürün kataloğu) */
{const k=$('#katDl');if(k){const S=(window.IF_CMS&&IF_CMS.set)||{},ok=u=>/^(https?:)?\/\/|^\//i.test(String(u||''));
 const ln=(u,key)=>ok(u)?'<a class="gbtn lt" href="'+esc2(u)+'" target="_blank" rel="noopener" download><span data-t="'+key+'">'+esc2(tr(key))+'</span></a>':'';
 const L=ln(S.katalog_tr,'kat_tr')+ln(S.katalog_en,'kat_en');
 k.innerHTML='<div class="kat-c lg"><span class="fi">PDF</span><div><b data-t="kat_h">'+esc2(tr('kat_h'))+'</b><small data-t="kat_p">'+esc2(tr('kat_p'))+'</small></div><div class="kat-b">'+(L||'<small class="kat-soon" data-t="kat_soon">'+esc2(tr('kat_soon'))+'</small>')+'</div></div>';}}

/* uzmanlık alanı sayfası: başlık bandının sağındaki videonun yerine alanın fotoğrafı (Bölüm görselleri → Klinik alan görselleri) */
{const draw=()=>{const pg=$('#vAlan .pg');if(!pg)return;const i=IFU.AL.indexOf(new URLSearchParams(location.search).get('alan')||'');
  const O=(window.IF_CMS&&IF_CMS.orn)||{},u=i<0?'':((Array.isArray(O.alan)&&O.alan[i])||(UA_IMG[i]?(window.IF_BASE||'')+'media/banner/'+UA_IMG[i]+'.webp':''));
  pg.classList.toggle('al-ph',!!u);pg.classList.toggle('al-noimg',i>=0&&!u);let f=pg.querySelector('.pg-vid');
  if(!u){if(f&&i>=0)f.remove();return;}
  if(!f){f=document.createElement('figure');f.className='pg-vid';f.setAttribute('aria-hidden','true');pg.appendChild(f);pg.classList.add('has-vid');}
  if(f.dataset.u===u)return;f.dataset.u=u;f.querySelectorAll('video,img.pl').forEach(v=>{try{v.pause&&v.pause();}catch(e){}v.remove();});f.classList.remove('pg-loop','pg-alan');
  const old=f.querySelector('img.al-img');if(old)old.remove();const im=document.createElement('img');im.className='al-img';im.alt='';im.decoding='async';im.src=u;f.insertBefore(im,f.firstChild);
  const cap=f.querySelector('.pg-cap span');if(cap){cap.removeAttribute('data-t');cap.textContent=(IFD.CA[IF.lang||'tr']||IFD.CA.en)[i]||'';}};
 draw();setTimeout(draw,400);setTimeout(draw,1500);addEventListener('popstate',()=>setTimeout(draw,50));IF.onLang.push(()=>setTimeout(draw,30));}

/* formlar: iletişim, bayilik başvurusu, iş birliği başvurusu → WordPress Talepler + e-posta (otomatik yanıt yok) */
/* ürün seçim listeleri (yan etki bildirimi) */
$$('select[data-urun]').forEach(sel=>{const add=(v,t,k)=>{const o=document.createElement('option');o.value=v;o.textContent=t;if(k)o.dataset.t=k;sel.appendChild(o);};(IFD.PRODS||[]).forEach(p=>add(p.n,p.n));add('diger',tr('f_r5'),'f_r5');});
const fErr=(x,k)=>{x.classList.add('err');x.setAttribute('aria-invalid','true');const l=x.closest('.fld2');if(l&&!l.querySelector('.f-er')){const e=document.createElement('small');e.className='f-er';e.dataset.t=k;e.textContent=tr(k);e.id='er'+Math.random().toString(36).slice(2,8);x.setAttribute('aria-describedby',e.id);l.appendChild(e);}};
const fOk=x=>{x.classList.remove('err');x.removeAttribute('aria-invalid');const l=x.closest('.fld2'),e=l&&l.querySelector('.f-er');if(e)e.remove();x.removeAttribute('aria-describedby');};
$$('.if-fm-f').forEach(f=>{f.querySelectorAll('input,textarea,select').forEach(x=>x.addEventListener(x.tagName==='SELECT'?'change':'input',()=>{if(x.classList.contains('err')&&x.value.trim())fOk(x);}));
 f.addEventListener('submit',e=>{e.preventDefault();const m=f.querySelector('.if-fm-m'),d={tur:f.dataset.tur};
 let bad=null;f.querySelectorAll('input,textarea,select').forEach(x=>{if(x.type==='checkbox')return;const v=x.value.trim();fOk(x);if(x.required&&!v){fErr(x,'f_er_req');bad=bad||x;}d[x.name]=v;});
 const em=f.querySelector('input[type=email]');if(em&&em.value&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim())){fErr(em,'f_er_mail');bad=bad||em;}
 const ok=f.querySelector('input[name=onay]');m.classList.remove('ok');
 if(bad){m.textContent=tr('f_req');bad.scrollIntoView({block:'center',behavior:'smooth'});setTimeout(()=>bad.focus({preventScroll:true}),250);return;}
 if(!ok.checked){m.textContent=tr('e_kvkk');ok.closest('.chk').classList.add('err');ok.focus();return;}ok.closest('.chk').classList.remove('err');
 d.onay=1;const b=f.querySelector('button[type=submit]');b.disabled=true;m.textContent='…';
 IF_SEND(d).then(r=>{m.classList.add('ok');m.textContent=IF_OKTX('f_ok',r);f.querySelectorAll('input:not([type=checkbox]),textarea,select').forEach(x=>{if(x.name!=='web')x.value='';});},()=>{m.textContent=tr('rq_fail');}).finally(()=>{b.disabled=false;});});});

/* üst çubuk sığma denetimi: dil değişince ya da pencere boyutu değişince */
{const top=document.querySelector('.site-top'),H=document.documentElement;
 const CS5=['nv-c1','nv-c2','nv-c3','nv-c4','nv-c5'];
 const fit=()=>{if(!top)return;H.classList.remove(...CS5);if(innerWidth<=1100)return;const over=()=>{const r=top.getBoundingClientRect(),cs=getComputedStyle(top),rtl=cs.direction==='rtl',k=[...top.children,...top.querySelectorAll('.nv')].filter(c=>c.offsetWidth&&getComputedStyle(c).position!=='fixed').map(c=>c.getBoundingClientRect());if(!k.length)return false;
   if(rtl?Math.min(...k.map(b=>b.left))<r.left+parseFloat(cs.paddingLeft)-1:Math.max(...k.map(b=>b.right))>r.right-parseFloat(cs.paddingRight)+1)return true;
   /* Revize 3: tek satırda menü kendi alanından taşıp dil/Pro/arama düğmelerine binmesin */
   const nv=top.querySelector('.pub-nav');if(!nv)return false;const nr=nv.getBoundingClientRect(),q=[...nv.children].filter(c=>c.offsetWidth&&getComputedStyle(c).position!=='fixed').map(c=>c.getBoundingClientRect());if(!q.length)return false;
   return rtl?Math.min(...q.map(b=>b.left))<nr.left+4:Math.max(...q.map(b=>b.right))>nr.right-4;};
  for(const c of CS5){if(!over())break;H.classList.add(c);}};
 /* kaydırma çubuğu sonradan çıkınca da (genişlik değişir, resize olayı gelmez) yeniden hesapla */
 if(top&&window.ResizeObserver){let w0=0;new ResizeObserver(es=>{const w=Math.round(es[0].contentRect.width);if(w!==w0){w0=w;requestAnimationFrame(fit);}}).observe(top);}
 fit();addEventListener('resize',fit);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);IF.onLang.push(()=>requestAnimationFrame(fit));}

/* ürünler sayfası filtresi: ürün grubu satırına da etiket (klinik alan satırıyla aynı hizada) */
{const bar=$('#ucBar');if(bar&&!bar.querySelector('.uf-lab')){const l=document.createElement('span');l.className='uf-lab';l.setAttribute('data-t','srch_g');l.textContent=tr('srch_g');bar.insertBefore(l,bar.firstChild);}}

/* ürünler sayfası: grup ve klinik alan seçimi iki açılır kutuda (tek satır); kutular mevcut bağlantıları kullanır */
{const bar=$('#ucBar'),ax=$('#ucAx'),ca=$('#ucCa');
 if(bar&&ax&&ca){const row=document.createElement('div');row.className='uf-row';
  const mk=(lab)=>{const w=document.createElement('label');w.className='uf-sel';w.innerHTML='<span></span><select></select>';w.firstChild.textContent=lab;return w;};
  const sA=mk(''),sC=mk('');row.appendChild(sA);row.appendChild(sC);bar.insertBefore(row,bar.firstChild);
  const fill=(w,src,labKey)=>{w.firstChild.textContent=tr(labKey);const s=w.lastChild,ch=[...src.querySelectorAll('.chip')];
   s.innerHTML=ch.map((c,i)=>'<option value="'+i+'"'+(c.getAttribute('aria-pressed')==='true'||c.classList.contains('on')||c.getAttribute('aria-current')?' selected':'')+'>'+esc2(c.textContent)+'</option>').join('');
   s.onchange=()=>{const c=src.querySelectorAll('.chip')[+s.value];if(c)c.click();};};
  const sync=()=>{fill(sA,ax,'srch_g');fill(sC,ca,'cat_ca');};
  sync();new MutationObserver(sync).observe(ax,{childList:true,subtree:true,attributes:true});new MutationObserver(sync).observe(ca,{childList:true,subtree:true,attributes:true});}}

/* Medya: içerik gelene kadar tek satırlık not yerine "Yakında" iskelet kartları */
function soonCards(){['#haberler','#etkinlikler','#duyurular','#kurul','#blog'].forEach(id=>{const pc=$(id+' > .pend-card');if(!pc)return;const sp=pc.querySelector('span[data-t]'),k=sp?sp.dataset.t:'';
 const d=document.createElement('div');d.className='soon-w';
 const kk=id==='#kurul';d.className='soon-w'+(kk?' soon-kur':'');d.innerHTML='<div class="soon-g" aria-hidden="true">'+(kk?[0,1,2,3]:[0,1,2]).map(j=>'<div class="soon-c" style="--i:'+j+'"><span class="soon-im"><em data-t="soon_t">'+esc2(tr('soon_t'))+'</em></span><i></i><i></i><i class="s"></i></div>').join('')+'</div><p class="soon-n"><span'+(k?' data-t="'+k+'"':'')+'>'+esc2(k?tr(k):'')+'</span></p>';
 pc.replaceWith(d);});}
soonCards();
/* Hakkımızda: tanıtım filmi/basın içeriği yoksa tek satırlık notla bölüm açmayalım */
{const pc=$('.hk-med .pend-card');if(pc){const sec=pc.closest('section')||pc.parentElement;if(sec)sec.hidden=true;}}
/* Telefon: alt gezinme çubuğu (ürünler, arama, Pro) — iletişim çağrısı içermez */
{const nb=document.createElement('nav');nb.className='mb-bar';nb.setAttribute('aria-label',tr('mb_lab'));
 nb.innerHTML='<a href="'+esc2(IFU.U.urunler)+'"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/></svg><span data-t="nav3">'+esc2(tr('nav3'))+'</span></a>'
  +'<a href="'+esc2(IFU.U.uzmanlik||'uzmanlik.html')+'" class="mb-uz"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M10 3v14M3 10h14"/></svg><span data-t="n_uzm">'+esc2(tr('n_uzm'))+'</span></a>'
  +'<button type="button" data-srch><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4.5 4.5"/></svg><span data-t="srch">'+esc2(tr('srch'))+'</span></button>'
  +'<button type="button" class="mb-pro"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="9" width="12" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9"/></svg><span data-t="mb_pro">'+esc2(tr('mb_pro'))+'</span></button>';
 document.body.appendChild(nb);
 const sb=nb.querySelector('[data-srch]');sb.addEventListener('click',()=>{const b=$('#nvSrch');if(b)b.click();});
 nb.querySelector('.mb-pro').addEventListener('click',()=>{if(IF.openGate)IF.openGate();});
 if(P==='urunler')nb.querySelector('a').setAttribute('aria-current','page');if(P==='uzmanlik')nb.querySelector('.mb-uz').setAttribute('aria-current','page');
 IF.onLang.push(()=>{nb.setAttribute('aria-label',tr('mb_lab'));nb.querySelectorAll('[data-t]').forEach(e=>e.textContent=tr(e.dataset.t));});}
/* Revize 2 · mega menü: her başlık tam genişlikte, yukarıdan açılan panel; alt öğeler görselli kart.
   Görseli olmayan kart nötr yer tutucuyla görünür (gerçek fotoğraf gelince MG_IMG'ye ya da panelden IF_CMS.orn.menu'ya eklenir). */
{const MG_IMG={nv_urg:'genis/regenyal-laboratuvar.webp',nv_urs:'genis/hero-uretim.webp',kurumsal:'genis/hero-uretim.webp'};
 const MG_MAX=5,MG_AX=[0,1,2,5];/* öne çıkan ürün grupları: Hücresel Tedaviler, Kök Hücre ve Eksozom Kitleri, Hyaluronik Asitler, PRP Kitleri */
 const B=()=>window.IF_BASE||'',mgO=()=>(window.IF_CMS&&IF_CMS.orn&&IF_CMS.orn.menu)||{};
 const im=(s,u,fit)=>{s.classList.toggle('mg-ph',!u);s.classList.toggle('mg-fit',!!(u&&fit));s.innerHTML=u?'<img src="'+esc2(u)+'" alt="" loading="lazy" decoding="async">':'';
  const g=s.firstChild;if(g)g.addEventListener('error',()=>{g.remove();s.classList.remove('mg-fit');s.classList.add('mg-ph');},{once:true});};
 const card=(href,txt,u,fit)=>{const a=document.createElement('a');a.className='mg-c';a.href=href;a.innerHTML='<span class="mg-im" aria-hidden="true"></span><span class="mg-tx"></span>';a.lastChild.textContent=txt;im(a.firstChild,u,fit);return a;};
 const ua=$('#nvUa'),hp=$('#nvHp');
 function megaBuild(){const D=window.IFD;if(!D)return;const L=IF.lang||'tr',O=mgO();
  $$('.mg-c[data-mg]').forEach(a=>{const k=a.dataset.mg,u=O[k]||(MG_IMG[k]?B()+'media/'+MG_IMG[k]:''),s=a.querySelector('.mg-im');if(s&&s.dataset.u!==u){s.dataset.u=u;im(s,u);}});
  $$('.mg-im[data-mgk]').forEach(s=>{const k=s.dataset.mgk,u=O[k]||(MG_IMG[k]?B()+'media/'+MG_IMG[k]:'');if(s.dataset.u!==u){s.dataset.u=u;im(s,u);}});
  /* Revize 3: her panel tek sıra, en fazla 5 kart. Uzmanlık: ilk 5 alan (Diğer Alanlar "Tümünü Görüntüle" altında); kart görseli alanın başlık fotoğrafının kare kırpımı */
  if(ua){const CA=D.CA[L]||D.CA.en;ua.replaceChildren(...CA.slice(0,MG_MAX).map((n,i)=>card(IFU.alan(i),n,(Array.isArray(O.alanKart)&&O.alanKart[i])||(UA_IMG[i]?B()+'media/alan/'+UA_IMG[i]+'.webp':''))));}
  /* Ürünler: menüde görünecek gruplar (WordPress'te grup başına "Menüde göster" → IF_CMS.menuAx) */
  if(hp){const AX=D.AX[L]||D.AX.en,S=(window.IF_CMS&&Array.isArray(IF_CMS.menuAx)&&IF_CMS.menuAx.length?IF_CMS.menuAx:MG_AX).map(Number).filter(i=>i>=0&&i<AX.length).slice(0,MG_MAX);
   hp.replaceChildren(...S.map(i=>{const G=(D.PRODS||[]).filter(q=>q.a===i&&q.img),p=G.find(q=>!/^(https?:)?\/\//.test(q.img))||G[0];return card(IFU.ax(i),AX[i],p?p.img:'',1);}));}}
 /* eski çizim (düz bağlantılar) araya girerse kartlara geri dön */
 [ua,hp].forEach(el=>{if(el)new MutationObserver(()=>{if([...el.children].some(c=>!c.classList.contains('mg-c')))megaBuild();}).observe(el,{childList:true});});
 megaBuild();IF.onLang.push(()=>setTimeout(megaBuild,0));
 /* aynı anda tek panel: başka başlığın üzerine gelince tıklamayla açık kalan kapanır; Esc kapatır */
 const shut=x=>{x.classList.remove('open');x.firstElementChild.setAttribute('aria-expanded','false');};
 $$('.site-top .nv').forEach(nv=>nv.addEventListener('mouseenter',()=>{if(innerWidth>1100)$$('.site-top .nv.open').forEach(x=>{if(x!==nv)shut(x);});}));
 addEventListener('keydown',e=>{if(e.key!=='Escape'||innerWidth<=1100)return;const a=document.activeElement,nv=a&&a.closest&&a.closest('.site-top .nv');$$('.site-top .nv.open').forEach(shut);if(nv)nv.firstElementChild.focus();});}

/* İletişim sayfası: tek form kartı (sekmeli), solda sonraki adımlar, altta bilgi kartları ve harita */
function ctBuild(){const v=$('#vIletisim');if(!v||v.querySelector('.ct'))return;
 const secs=[...v.querySelectorAll('section.if-fm')],g=v.querySelector('.il-g'),soc=v.querySelector('.il-soc');if(secs.length<2)return;
 const T=k=>esc2(tr(k));
 const w=document.createElement('div');w.className='ct';
 w.innerHTML='<aside class="ct-st" data-rv="up"><h2 data-t="ct_sh">'+T('ct_sh')+'</h2><p data-t="ct_sp">'+T('ct_sp')+'</p><ol>'+[1,2,3].map(i=>'<li><b data-t="ct_s'+i+'">'+T('ct_s'+i)+'</b><span data-t="ct_s'+i+'p">'+T('ct_s'+i+'p')+'</span></li>').join('')+'</ol></aside>'
  +'<div class="ct-card" data-rv="up"><div class="ct-tabs" role="tablist">'+secs.map(x=>{const k={form:'nv_ilf',bayilik:'nv_bay','yan-etki':'nv_ae'}[x.id]||'nv_ilf';return '<button type="button" role="tab" data-p="'+x.id+'" data-t="'+k+'"'+(x.id==='yan-etki'?' class="ct-ae"':'')+'>'+T(k)+'</button>';}).join('')+'</div><div class="ct-panes"></div></div>';
 const panes=w.querySelector('.ct-panes');
 secs.forEach(sec=>{const pn=document.createElement('div');pn.className='ct-pane';pn.id=sec.id;sec.removeAttribute('id');const hp=sec.querySelector('.if-fm-h p');if(hp){hp.className='ct-lede';pn.appendChild(hp);}const fm=sec.querySelector('form');if(fm)pn.appendChild(fm);else [...sec.children].filter(x=>!x.classList.contains('if-fm-h')).forEach(x=>pn.appendChild(x));panes.appendChild(pn);sec.remove();});
 const sec=g?g.closest('section'):v.querySelector('.pg-sec');sec.insertBefore(w,sec.firstChild);
 if(soc)soc.hidden=true;
 if(g){g.classList.add('ct-info');[['il_t','tel'],['il_m','mail'],['il_a','pin']].forEach(([k,ic],i)=>{});const ord=['il_t','il_m','il_a'],ics={il_t:'<path d="M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',il_m:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',il_a:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'};
  ord.forEach(k=>{const h=g.querySelector('h3[data-t="'+k+'"]');if(!h)return;const d=h.parentElement;d.removeAttribute('data-rv');d.classList.add('in');if(!d.querySelector('svg')){const s2=document.createElementNS('http://www.w3.org/2000/svg','svg');s2.setAttribute('viewBox','0 0 24 24');s2.setAttribute('aria-hidden','true');s2.innerHTML=ics[k];d.insertBefore(s2,d.firstChild);}g.appendChild(d);});
  w.after(g);
  const adr=(g.querySelector('[data-t="il_av"]')||{}).textContent||'Intrafarma Beylikdüzü İstanbul';
  const m=document.createElement('a');m.className='ct-map';m.target='_blank';m.rel='noopener';m.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('Intrafarma '+adr.replace(/\s+/g,' '));
  m.innerHTML='<span class="ct-pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></span><span class="ct-mapb" data-t="ct_map">'+T('ct_map')+' →</span>';
  g.after(m);}
 const tabs=[...w.querySelectorAll('.ct-tabs button')],ps=[...w.querySelectorAll('.ct-pane')];
 const sel=id=>{tabs.forEach(b=>{const on=b.dataset.p===id;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;});ps.forEach(p=>p.hidden=p.id!==id);};
 tabs.forEach(b=>b.addEventListener('click',()=>{sel(b.dataset.p);history.replaceState(history.state,'','#'+b.dataset.p);}));
 const fromHash=()=>{const h=location.hash.slice(1);if(ps.some(p=>p.id===h)){sel(h);requestAnimationFrame(()=>w.scrollIntoView({block:'start'}));}else sel('form');};
 fromHash();addEventListener('hashchange',fromHash);
 v.querySelectorAll('.ct [data-rv]').forEach(e=>e.classList.add('in'));
 IF.onLang.push(()=>{w.querySelectorAll('[data-t]').forEach(e=>{const k=e.dataset.t;e.textContent=tr(k)+(k==='ct_map'?' →':'');});const mb=document.querySelector('.ct-mapb');if(mb)mb.textContent=tr('ct_map')+' →';});}
ctBuild();
/* Pro / katalog tam ekran: sahne yüksekliğini pencereye piksel olarak sabitle (Safari'de alt kısım beyaz kalıyordu) */
{const st=$('#stage'),H=document.documentElement;let on=false;
 const fit=()=>{if(!st)return;const full=H.classList.contains('stage-full');
  if(full){const vv=window.visualViewport,h=Math.max(innerHeight||0,H.clientHeight||0,vv?Math.round(vv.height*(vv.scale||1)):0);st.style.setProperty('height',h+'px','important');st.style.setProperty('top','0','important');st.style.setProperty('bottom','auto','important');}
  else{st.style.removeProperty('height');st.style.removeProperty('top');st.style.removeProperty('bottom');}
  if(full!==on){on=full;requestAnimationFrame(()=>dispatchEvent(new Event('resize')));setTimeout(()=>dispatchEvent(new Event('resize')),350);}};
 new MutationObserver(fit).observe(H,{attributes:true,attributeFilter:['class']});
 addEventListener('resize',()=>{if(on)fit();});if(window.visualViewport)visualViewport.addEventListener('resize',()=>{if(on)fit();});fit();}
/* KVKK sayfası: içindekiler, metindeki başlıklardan üretilir (metin WordPress'te değişse de güncel kalır) */
{const nav=document.querySelector('#vYasal .ys-toc'),doc=document.querySelector('#vYasal .ys-doc');
 if(nav&&doc){let n=0;doc.querySelectorAll('h2,h3').forEach(h=>{const t=(h.dataset.toc||h.textContent).trim();if(!t)return;
  if(!h.id)h.id='ys-b'+(++n);const a=document.createElement('a');a.href='#'+h.id;a.textContent=t;if(h.tagName==='H3')a.className='ys-sub';
  const art=h.tagName==='H2'&&h.closest('article');if(art&&art.id&&art.firstElementChild===h)a.href='#'+art.id;nav.appendChild(a);});}}

/* Pro telefon: hücre sayfayla birlikte kayar (kaydırma miktarı hücre çizimine iletilir) */
{const pu=$('.pro-ui');if(pu)pu.addEventListener('scroll',()=>{IF.proSY=innerWidth<760?pu.scrollTop:0;},{passive:true});}
/* Pro genel bakış: katalog şeridi aramanın altına, başlık bloğunun içine */
{const k=$('#katDl'),h=$('.pro-hero');if(k&&h&&k.parentElement!==h)h.appendChild(k);}

/* Üretim: iş birliği formu İletişim düzeninde (bant + bindirmeli kart + süreç adımları) */
function urBuild(){const v=$('#vUretim');if(!v||v.querySelector('.ur-ct'))return;const sec=v.querySelector('section.if-fm#isbirligi');if(!sec)return;
 const T=k=>esc2(tr(k)),h=sec.querySelector('.if-fm-h'),fm=sec.querySelector('form');if(!fm)return;
 const w=document.createElement('section');w.className='ur-cta';w.id='isbirligi';sec.removeAttribute('id');
 const img=new URL((window.IF_BASE||'')+'media/gorsel/regenyal-laboratuvar.jpg',location.href).href;
 w.innerHTML='<div class="ur-band" style="--im:url(&quot;'+img+'&quot;)"><div class="ur-band-in"><p class="eyebrow" data-t="ur_ey">'+T('ur_ey')+'</p><h2 data-t="isb_h">'+T('isb_h')+'</h2><p data-t="isb_p">'+T('isb_p')+'</p></div></div>'
  +'<div class="ct ur-ct"><aside class="ct-st"><h2 data-t="ur_sh">'+T('ur_sh')+'</h2><p data-t="ur_sp">'+T('ur_sp')+'</p><ol>'+[1,2,3].map(i=>'<li><b data-t="ur_s'+i+'">'+T('ur_s'+i)+'</b><span data-t="ur_s'+i+'p">'+T('ur_s'+i+'p')+'</span></li>').join('')+'</ol></aside>'
  +'<div class="ct-card"><div class="ct-pane"></div></div></div>';
 w.querySelector('.ct-pane').appendChild(fm);sec.replaceWith(w);}
urBuild();
{const st=$('#stage');if(st)st.addEventListener('scroll',()=>{if(st.scrollLeft)st.scrollLeft=0;if(st.scrollTop)st.scrollTop=0;},{passive:true});}

/* Revize 3 · görsel odak noktası: başlık, alan ve menü görselleri dosya adına göre kırpılır ("yatay% dikey%").
   Varsayılan CSS'te 50% 25%. WordPress'te her görselin "Odak noktası" alanı IF_CMS.odak olarak gelir ve bu listenin üzerine yazar. */
{const IF_ODAK={};
 const all=()=>Object.assign({},IF_ODAK,(window.IF_CMS&&IF_CMS.odak)||{});
 const key=u=>String(u||'').split(/[?#]/)[0].split('/').pop().replace(/\.[a-z0-9]+$/i,'');
 const ok=v=>/^\s*-?\d+(\.\d+)?%\s+-?\d+(\.\d+)?%\s*$/.test(String(v||''));
 const apply=el=>{const f=all()[key(el.getAttribute('src')||el.getAttribute('poster')||'')];if(ok(f))el.style.setProperty('--fp',f.trim());};
 const SEL='.vh-media video,.pg-vid img,.pg-vid video,.mg-im img,.mg-fig img,.ua-c img';
 const scan=r=>{if(r.matches&&r.matches(SEL))apply(r);if(r.querySelectorAll)r.querySelectorAll(SEL).forEach(apply);};
 scan(document);
 new MutationObserver(ms=>ms.forEach(m=>{if(m.type==='attributes'){if(m.target.matches(SEL))apply(m.target);}else m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n);});}))
  .observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});}

labels();
})();

/* ===== Çerez onayı (KVKK Çerez Rehberi + Google Consent Mode v2, temel mod) =====
   - Zorunlu dışındaki hiçbir çerez/etiket, ziyaretçi izin vermeden yüklenmez.
   - Kabul ve Reddet eşit ağırlıkta; tercih her an alt bilgideki "Çerez tercihleri"nden değişir.
   - Google etiketleri yalnızca canlı alan adında yüklenir (IF_CK.live); test ve önizlemede bant çalışır, etiket yüklenmez.
   - YouTube videoları tıklanınca yüklenir (youtube-nocookie). */
(function(){
const C=Object.assign({ga:'',ads:'',live:[],log:'',policy:'',nec:[],simple:false},window.IF_CK||{});
const CK='if_consent',AGE=15552000; /* 180 gün */
const host=location.hostname.replace(/^www\./,'');
const LIVE=C.live.some(h=>String(h).trim().replace(/^www\./,'')===host);
const CATS=['an'].concat(C.ads?['mk']:[]).concat(['md']);
const ROWS={
 nec:[['if_consent','Intrafarma','ck_m6'],['if_lang','Intrafarma','ck_ls']].concat(C.nec||[]),
 an:[['_ga','Google','ck_y2'],['_ga_'+(C.ga||'G-').replace(/^G-/,''),'Google','ck_y2']],
 mk:[['_gcl_au','Google','ck_d90'],['IDE · test_cookie (doubleclick.net)','Google','ck_m13']],
 md:[['YSC','YouTube (Google)','ck_ses'],['VISITOR_INFO1_LIVE','YouTube (Google)','ck_m6'],['yt-remote-*','YouTube (Google)','ck_ls']]};
const t=k=>IF.tr(k);
const esc=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function read(){try{const m=document.cookie.match(/(?:^|;\s*)if_consent=([^;]+)/);if(!m)return null;const o=JSON.parse(decodeURIComponent(m[1]));return o&&o.c?o:null;}catch(e){return null;}}
function uid(){try{return crypto.randomUUID();}catch(e){return 'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);}}
let S=read();
const has=k=>!!(S&&S.c&&S.c[k]);
const complete=()=>S&&CATS.every(k=>k in S.c);

function delCookies(re){
 const parts=location.hostname.split('.');const doms=[''];for(let i=0;i<parts.length-1;i++)doms.push('; domain=.'+parts.slice(i).join('.'));
 document.cookie.split(';').map(x=>x.split('=')[0].trim()).filter(n=>re.test(n)).forEach(n=>doms.forEach(d=>{document.cookie=n+'=; max-age=0; path=/'+d;}));
}
function save(c,src){
 const prev=S;S={id:(prev&&prev.id)||uid(),t:Date.now(),v:1,c:{}};CATS.forEach(k=>{S.c[k]=c[k]?1:0;});
 document.cookie=CK+'='+encodeURIComponent(JSON.stringify(S))+'; max-age='+AGE+'; path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');
 if(C.log){try{fetch(C.log,{method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({id:S.id,c:S.c,src:src||'',lang:IF.lang,page:location.pathname})});}catch(e){}}
 hideBanner();say(t('ck_saved'));
 /* daha önce verilmiş bir izin geri alındıysa: çerezleri sil, yüklenmiş betikler gitsin diye sayfayı yenile */
 const lost=prev&&Object.keys(prev.c).some(k=>prev.c[k]&&!S.c[k]);
 if(lost){if(!S.c.an)delCookies(/^_ga/);if(!S.c.mk)delCookies(/^_gcl/);setTimeout(()=>location.reload(),300);return;}
 google();if(S.c.md)document.querySelectorAll('.yt[data-yt]').forEach(el=>ytEmbed(el));
}

/* ---- Google etiketi: yalnızca canlıda ve yalnızca izin varsa (temel mod) ---- */
let gLoaded=false;const gConf={};
function google(){
 const an=has('an')&&C.ga,mk=has('mk')&&C.ads;
 if(!an&&!mk)return;
 if(!LIVE){console.info('[çerez] canlı alan adı değil: Google etiketi yüklenmedi',{analitik:!!an,pazarlama:!!mk});return;}
 window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};
 if(!gLoaded){
  gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted'});
  gtag('set','ads_data_redaction',true);gtag('js',new Date());
  const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(an?C.ga:C.ads);document.head.appendChild(s);gLoaded=true;
 }
 gtag('consent','update',{analytics_storage:an?'granted':'denied',ad_storage:mk?'granted':'denied',ad_user_data:mk?'granted':'denied',ad_personalization:mk?'granted':'denied'});
 if(an&&!gConf.ga){gtag('config',C.ga,{allow_google_signals:false});gConf.ga=1;}
 if(mk&&!gConf.ads){gtag('config',C.ads);gConf.ads=1;}
}

/* ---- canlı bölge (ekran okuyucu) ---- */
const live=document.createElement('p');live.className='vh-hid';live.setAttribute('aria-live','polite');document.body.appendChild(live);
function say(m){live.textContent='';setTimeout(()=>{live.textContent=m;},50);}

/* ---- bant ---- */
let bar=null;
function banner(){
 if(bar)return;bar=document.createElement('section');bar.className='ck-bar';bar.setAttribute('aria-labelledby','ckT');
 if(C.simple){bar.className='ck-bar ck-simple';bar.innerHTML='<div class="ck-tx"><p data-t="ck_ps"></p></div><div class="ck-bt"><button type="button" class="ck-b ck-pri" data-ck="none" data-t="ck_ok"></button></div>';fill(bar);document.body.appendChild(bar);document.documentElement.classList.add('ck-on');return;}
 bar.innerHTML='<div class="ck-tx"><h2 id="ckT" data-t="ck_t"></h2><p data-t="ck_p"></p></div>'+
  '<div class="ck-bt"><button type="button" class="ck-b ck-pri" data-ck="all" data-t="ck_acc"></button><button type="button" class="ck-b ck-pri" data-ck="none" data-t="ck_rej"></button><button type="button" class="ck-b" data-ck="prefs" data-t="ck_set"></button></div>';
 fill(bar);document.body.appendChild(bar);document.documentElement.classList.add('ck-on');
}
function hideBanner(){if(bar){bar.remove();bar=null;}document.documentElement.classList.remove('ck-on');}
function fill(root){root.querySelectorAll('[data-t]').forEach(el=>{el.innerHTML=t(el.dataset.t);});}
const all=v=>{const o={};CATS.forEach(k=>{o[k]=v;});return o;};

/* ---- tercihler penceresi ---- */
let dlg=null;
function table(k){return '<details class="ck-det"><summary><span data-t="ck_list"></span> ('+ROWS[k].length+')</summary><table><thead><tr><th data-t="ck_name"></th><th data-t="ck_prov"></th><th data-t="ck_dur"></th></tr></thead><tbody>'+
 ROWS[k].map(r=>'<tr><td><code>'+esc(r[0])+'</code></td><td>'+esc(r[1])+'</td><td data-t="'+esc(r[2])+'"></td></tr>').join('')+'</tbody></table></details>';}
function prefs(){
 if(!dlg){
  dlg=document.createElement('dialog');dlg.className='ck-dlg';dlg.setAttribute('aria-labelledby','ckH');
  const cat=(k,fixed)=>'<div class="ck-cat"><div class="ck-row"><h3 id="ckc_'+k+'" data-t="ck_c_'+k+'"></h3>'+
   (fixed?'<span class="ck-on" data-t="ck_on"></span>':'<label class="ck-sw"><input type="checkbox" role="switch" name="'+k+'" aria-labelledby="ckc_'+k+'"><i aria-hidden="true"></i></label>')+
   '</div><p data-t="ck_d_'+k+'"></p>'+table(k)+'</div>';
  dlg.innerHTML='<form method="dialog"><div class="ck-hd"><h2 id="ckH" data-t="ck_h"></h2><button type="button" class="ov-x ck-x" data-ck="close"><span data-t="close"></span><i aria-hidden="true">×</i></button></div>'+
   '<div class="ck-bd"><p class="ck-in" data-t="ck_in"></p>'+cat('nec',1)+CATS.map(k=>cat(k,0)).join('')+'<p class="ck-ab" data-t="ck_abroad"></p>'+
   (C.policy?'<p class="ck-ab"><a href="'+esc(C.policy)+'" data-t="ck_pol"></a></p>':'')+'</div>'+
   '<div class="ck-ft"><button type="button" class="ck-b ck-pri" data-ck="none" data-t="ck_rej"></button><button type="button" class="ck-b" data-ck="save" data-t="ck_save"></button><button type="button" class="ck-b ck-pri" data-ck="all" data-t="ck_acc"></button></div></form>';
  document.body.appendChild(dlg);
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
 }
 fill(dlg);CATS.forEach(k=>{dlg.querySelector('input[name="'+k+'"]').checked=has(k);});
 if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
}
function closePrefs(){if(dlg&&dlg.open)dlg.close();}

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-ck]');if(b){
  const a=b.dataset.ck;
  if(a==='all'){save(all(1),'all');closePrefs();}
  else if(a==='none'){save(all(0),'none');closePrefs();}
  else if(a==='prefs')prefs();
  else if(a==='close')closePrefs();
  else if(a==='save'){const o={};CATS.forEach(k=>{o[k]=dlg.querySelector('input[name="'+k+'"]').checked;});save(o,'save');closePrefs();}
  return;}
 if(e.target.closest('.ck-open')&&!C.simple){e.preventDefault();prefs();}
});

/* ---- YouTube: tıklayınca yükle ----
   Kullanım: <div class="yt" data-yt="VIDEO_KIMLIGI" data-title="Başlık" data-poster="media/....jpg"></div> */
function ytEmbed(el){
 if(el.querySelector('iframe'))return;
 const f=document.createElement('iframe');
 f.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(el.dataset.yt)+'?autoplay=1&rel=0&modestbranding=1&hl='+(IF.lang||'tr');
 f.title=el.dataset.title||'YouTube';f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;f.loading='lazy';
 el.innerHTML='';el.appendChild(f);el.classList.add('yt-on');
}
function ytInit(){
 document.querySelectorAll('.yt[data-yt]').forEach(el=>{
  if(el.dataset.ready)return;el.dataset.ready='1';
  const poster=el.dataset.poster?(/^(https?:|\/)/.test(el.dataset.poster)?el.dataset.poster:(window.IF_BASE||'')+el.dataset.poster):'';
  el.innerHTML=(poster?'<img src="'+esc(poster)+'" alt="" loading="lazy">':'')+
   '<button type="button" class="yt-play"><i aria-hidden="true"></i><span class="vh-hid" data-t="v_play"></span>'+(el.dataset.title?'<b>'+esc(el.dataset.title)+'</b>':'')+'</button>'+
   '<div class="yt-ask" hidden><p class="yt-h" data-t="yt_h"></p><p data-t="yt_p"></p><div class="yt-bt"><button type="button" class="ck-b ck-pri" data-yt-go="1" data-t="yt_once"></button><button type="button" class="ck-b" data-yt-go="2" data-t="yt_always"></button></div>'+
   '<a class="yt-ext" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v='+encodeURIComponent(el.dataset.yt)+'" data-t="yt_open"></a></div>';
  fill(el);
  el.querySelector('.yt-play').addEventListener('click',()=>{if(has('md')||C.simple)ytEmbed(el);else{el.querySelector('.yt-play').hidden=true;el.querySelector('.yt-ask').hidden=false;el.querySelector('[data-yt-go]').focus();}});
  el.querySelectorAll('[data-yt-go]').forEach(b=>b.addEventListener('click',()=>{
   if(b.dataset.ytGo==='2'){const o={};CATS.forEach(k=>{o[k]=has(k);});o.md=1;save(o,'yt');}
   ytEmbed(el);}));
 });
}
IF.ytInit=ytInit;IF.cookiePrefs=prefs;IF.consent=()=>S&&Object.assign({},S.c);

/* dil değişince açık bant/pencere/video kutuları kendini çevirir: applyLang zaten [data-t] öğelerini doldurur */
ytInit();
if(complete())google();else banner();
})();


