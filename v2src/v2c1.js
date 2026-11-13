
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
