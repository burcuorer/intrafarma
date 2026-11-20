
/* ===================== v2: sayfa yönlendirme, sayfa yolu, ürün sayfası, dil seçici ===================== */
const P=IFU.page,D2=()=>window.IFD;
const esc2=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const VMAP={uzmanlik:'vUzmanlik',urunler:'vUrunler',uretim:'vUretim',bilim:'vBilim',guncel:'vGuncel',iletisim:'vIletisim',hakkimizda:'vHakkimizda'};
const SEC={uzmanlik:'urunler',urunler:'urunler',uretim:'uretim',hakkimizda:'kurumsal',bilim:'bilim',guncel:'kurumsal',iletisim:'iletisim'};
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
   '<div class="uc-dg"><div class="uc-vis'+(p.img?' has-img':'')+'" style="--tc:'+(AXC[p.a]||'#17707A')+(p.img?';--im:url(&quot;'+esc2(encodeURI(p.img))+'&quot;)':'')+'">'+(p.img?'<img src="'+esc2(p.img)+'" alt="'+esc2(p.n)+'" loading="lazy">':'')+'<small>0'+(p.a+1)+' · '+esc2(axn)+'</small><span>'+esc2(p.n)+'</span></div>'+
   '<div class="uc-info"><dl class="uc-meta"><div><dt>'+esc2(tr('d_ax'))+'</dt><dd><a href="'+ucHref({ax:p.a,ca:-1})+'">0'+(p.a+1)+' '+esc2(axn)+'</a></dd></div>'+
   '<div><dt>'+esc2(tr('d_ca'))+'</dt><dd class="uc-areas">'+areas+'</dd></div><div><dt>'+esc2(tr('d_lang'))+'</dt><dd>TR · EN</dd></div></dl>'+
   (open?'<div class="uc-box open"><h2>'+tr('op_t')+'</h2><p>'+tr('op_b')+'</p></div>'
        :'<div class="uc-box lock"><h2>'+tr('lk_t')+'</h2><p>'+tr('lk_b')+'</p><button type="button" class="b-pri" id="ucGate"><span>'+esc2(tr('cta1'))+'</span><span class="o"></span></button></div>')+
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
 $('#ucQ').addEventListener('input',e=>{UC.q=e.target.value;renderUC();});
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
/* başlık boyu: büyük video yalnız Hakkımızda ve Üretim'de; ürün ayrıntısında video yok (ürünün kendi görseli hemen altta) */
function pgMode(){const pg=curView&&$('#'+curView+' .pg');if(!pg)return;pg.classList.toggle('pg-tall',P==='hakkimizda'||P==='uretim');pg.classList.toggle('pg-det',P==='urunler'&&UC.urun>=0);}
/* alt sayfa başlıkları: aynı videolar yerine sayfaya uygun görsellerin yavaş geçişli döngüsü (firma videoları gelene kadar) */
const PGI={urunler:['genis/hero-urun.webp','genis/portfolio-regenflex-studio.webp','genis/regenyal-siringhe.webp'],
 uretim:['genis/hero-uretim.webp','genis/regenyal-laboratuvar.webp','genis/hero-laboratuvar.webp'],
 bilim:['genis/hero-bilim.webp','genis/hero-laboratuvar.webp','genis/regenyal-laboratuvar.webp'],
 guncel:['genis/hero-bilim.webp','genis/regenyal-laboratuvar.webp','genis/hero-laboratuvar.webp'],
 uzmanlik:['banner/ortopedi.webp','banner/uroloji.webp','banner/kadin-sagligi.webp','banner/noroloji.webp','banner/estetik.webp','banner/diger.webp'],
 hakkimizda:['genis/hero-laboratuvar.webp','genis/hero-uretim.webp','genis/regenyal-laboratuvar.webp'],
 iletisim:['genis/hero-laboratuvar.webp','genis/regenyal-laboratuvar.webp']};
function pgVideo(){const L=PGI[P];if(!L||!curView)return;const pg=$('#'+curView+' .pg');if(!pg||pg.querySelector('.pg-vid'))return;
 const f=document.createElement('figure');f.className='pg-vid pg-loop'+(P==='uzmanlik'?' pg-alan':'');f.setAttribute('aria-hidden','true');
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
 const c=document.createElement('figcaption');c.innerHTML='<i>0'+(i+1)+'</i><span data-t="ur_f'+(i+1)+'"></span>';c.lastChild.textContent=tr('ur_f'+(i+1));
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
$$('.if-fm-f').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const m=f.querySelector('.if-fm-m'),d={tur:f.dataset.tur};
 let bad=null;f.querySelectorAll('input,textarea').forEach(x=>{if(x.type==='checkbox')return;const v=x.value.trim();x.classList.remove('err');if(x.required&&!v){x.classList.add('err');bad=bad||x;}d[x.name]=v;});
 const em=f.querySelector('input[type=email]');if(em&&em.value&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim())){em.classList.add('err');bad=bad||em;}
 m.classList.remove('ok');if(bad){m.textContent=tr('f_req');bad.focus();return;}
 if(!f.querySelector('input[name=onay]').checked){m.textContent=tr('e_kvkk');return;}
 d.onay=1;const b=f.querySelector('button[type=submit]');b.disabled=true;m.textContent='…';
 IF_SEND(d).then(r=>{m.classList.add('ok');m.textContent=IF_OKTX('f_ok',r);f.querySelectorAll('input:not([type=checkbox]),textarea').forEach(x=>{if(x.name!=='web')x.value='';});},()=>{m.textContent=tr('rq_fail');}).finally(()=>{b.disabled=false;});}));

/* üst çubuk sığma denetimi: dil değişince ya da pencere boyutu değişince */
{const top=document.querySelector('.site-top'),H=document.documentElement;
 const fit=()=>{if(!top)return;H.classList.remove('nv-c1','nv-c2','nv-c3','nv-c4');if(innerWidth<=1100)return;const over=()=>{const r=top.getBoundingClientRect(),cs=getComputedStyle(top),rtl=cs.direction==='rtl',k=[...top.children].filter(c=>c.offsetWidth&&getComputedStyle(c).position!=='fixed').map(c=>c.getBoundingClientRect());if(!k.length)return false;return rtl?Math.min(...k.map(b=>b.left))<r.left+parseFloat(cs.paddingLeft)-1:Math.max(...k.map(b=>b.right))>r.right-parseFloat(cs.paddingRight)+1;};
  for(const c of ['nv-c1','nv-c2','nv-c3','nv-c4']){if(!over())break;H.classList.add(c);}};
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
function soonCards(){['#haberler','#etkinlikler','#duyurular'].forEach(id=>{const pc=$(id+' > .pend-card');if(!pc)return;const sp=pc.querySelector('span[data-t]'),k=sp?sp.dataset.t:'';
 const d=document.createElement('div');d.className='soon-w';
 d.innerHTML='<div class="soon-g" aria-hidden="true">'+[0,1,2].map(j=>'<div class="soon-c" style="--i:'+j+'"><span class="soon-im"><em data-t="soon_t">'+esc2(tr('soon_t'))+'</em></span><i></i><i></i><i class="s"></i></div>').join('')+'</div><p class="soon-n"><span'+(k?' data-t="'+k+'"':'')+'>'+esc2(k?tr(k):'')+'</span></p>';
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
