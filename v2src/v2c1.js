
/* ===== WordPress panelinden gelen içerik (window.IF_CMS). Yoksa (GitHub önizlemesi) varsayılanlar kullanılır ===== */
(function(){
 const C=window.IF_CMS;if(!C)return;
 const escH=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 /* metinler: {dil:{anahtar:metin}} */
 if(C.tx)Object.keys(C.tx).forEach(l=>{if(!T[l])return;const o=C.tx[l]||{};Object.keys(o).forEach(k=>{
   const m=/^(ax|ca)_(\d+)$/.exec(k);
   if(m){const A=m[1]==='ax'?AX:CA;if(A[l]&&A[l][+m[2]]!==undefined)A[l][+m[2]]=o[k];}
   else T[l][k]=o[k];});});
 /* iletişim bilgileri tüm dillerde aynı */
 const S=C.set||{};
 Object.keys(T).forEach(l=>{
  if(S.adres)T[l].il_av=escH(S.adres).replace(/\n/g,'<br>');
  if(S.telefon)T[l].il_tv='<a href="tel:'+escH(S.telefon.replace(/[^+\d]/g,''))+'">'+escH(S.telefon)+'</a>';
  if(S.eposta)T[l].il_mv='<a href="mailto:'+escH(S.eposta)+'">'+escH(S.eposta)+'</a>';});
 /* ürünler: [{n,a,open,img,d:{dil:açıklama}}] */
 if(Array.isArray(C.prods)&&C.prods.length){PRODS.length=0;C.prods.forEach(p=>{if(p&&p.n)PRODS.push({n:String(p.n),a:Math.max(0,Math.min(AXCA.length-1,+p.a||0)),open:!!p.open,img:p.img||'',d:p.d||{}});});}
})();

/* ===== v2 (çekirdek): Pro işleyişi aynı; yalnızca çıkış yolları ve geri tuşu ===== */
IF.openGate=openGate;IF.hideGate=hideGate;IF.goPublic=goPublic;IF.T=T;IF.AXC=AXC;IF.onLang=IF.onLang||[];
/* giriş kapısı: Kapat, Esc, arka plana tıklama ve tarayıcının geri tuşu aynı şeyi yapar */
IF.closeGate=function(){if(gate.hidden)return;if(history.state&&history.state.ifgate)history.back();else hideGate();};
/* kapıdan Pro'ya geçerken kapının geçmiş kaydı Pro kaydıyla değişir: geri tuşu doğrudan siteye döner */
IF.pushPro=function(){const st={ifpro:1};if(history.state&&history.state.ifgate)history.replaceState(st,'','#pro');else history.pushState(st,'','#pro');};
addEventListener('popstate',()=>{if(!gate.hidden&&!(history.state&&history.state.ifgate))hideGate();});
$('#gX').addEventListener('click',()=>IF.closeGate());
gate.addEventListener('click',e=>{if(e.target===gate)IF.closeGate();});
$('#proHome').addEventListener('click',()=>goPublic());
/* sayfa #pro ile yenilenirse Pro durumu yoktur: adresi temizle */
if(location.hash==='#pro')history.replaceState(null,'',location.pathname+location.search);
/* dokunmatik ekranda "imleci getirin" yerine "numaralara dokunun" */
if(matchMedia('(hover: none)').matches){for(const L of Object.keys(T)){if(T[L].c_lede_t)T[L].c_lede=T[L].c_lede_t;if(T[L].c_hint_t)T[L].c_hint=T[L].c_hint_t;}}
{const f=applyLang;applyLang=function(){f.apply(this,arguments);for(const fn of IF.onLang){try{fn();}catch(e){console.error(e);}}};}
