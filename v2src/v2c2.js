
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
