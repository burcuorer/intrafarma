
/* ===== Çerez onayı (KVKK Çerez Rehberi + Google Consent Mode v2, temel mod) =====
   - Zorunlu dışındaki hiçbir çerez/etiket, ziyaretçi izin vermeden yüklenmez.
   - Kabul ve Reddet eşit ağırlıkta; tercih her an alt bilgideki "Çerez tercihleri"nden değişir.
   - Google etiketleri yalnızca canlı alan adında yüklenir (IF_CK.live); test ve önizlemede bant çalışır, etiket yüklenmez.
   - YouTube videoları tıklanınca yüklenir (youtube-nocookie). */
(function(){
const C=Object.assign({ga:'',ads:'',live:[],log:'',policy:'',nec:[]},window.IF_CK||{});
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
 if(e.target.closest('.ck-open')){e.preventDefault();prefs();}
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
  el.querySelector('.yt-play').addEventListener('click',()=>{if(has('md'))ytEmbed(el);else{el.querySelector('.yt-play').hidden=true;el.querySelector('.yt-ask').hidden=false;el.querySelector('[data-yt-go]').focus();}});
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
