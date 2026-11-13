/* v2: sayfa adresleri. GitHub'da .html dosyaları, WordPress'te sayfa bağlantıları (window.IF_URLS) kullanılır. */
window.IFU=(function(){
 var page=document.documentElement.getAttribute('data-page')||'home';
 var AL=['ortopedi','spor-hekimligi','estetik','uroloji','kadin-sagligi','veteriner'];
 var AXS=['ortobiyolojikler','hucresel-tedaviler','rejeneratif-teknolojiler','biyoaktif-beslenme','ozel-cozumler'];
 var U=window.IF_URLS||{home:'index.html',uzmanlik:'uzmanlik.html',urunler:'urunler.html',uretim:'uretim.html',bilim:'bilim.html',guncel:'guncel.html',iletisim:'iletisim.html',hakkimizda:'hakkimizda.html'};
 var TRM={'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u','â':'a','î':'i','û':'u'};
 function slug(s){return String(s).toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g,function(c){return TRM[c]||c;}).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}
 function q(base,o){var u=base,k;for(k in o){if(o[k]!=null)u+=(u.indexOf('?')<0?'?':'&')+k+'='+encodeURIComponent(o[k]);}return u;}
 /* bağlantı aynı sayfaya mı gidiyor (güzel bağlantı ya da ?page_id= biçimi) */
 function same(href,key){try{var a=new URL(href,location.href),b=new URL(U[key],location.href);return a.origin===b.origin&&a.pathname===b.pathname&&(a.searchParams.get('page_id')||'')===(b.searchParams.get('page_id')||'');}catch(e){return false;}}
 return {page:page,AL:AL,AXS:AXS,U:U,slug:slug,q:q,same:same,
  home:function(){return U.home;},
  alan:function(i){return i>=0?q(U.uzmanlik,{alan:AL[i]}):U.uzmanlik;},
  ax:function(i){return i>=0?q(U.urunler,{eksen:AXS[i]}):U.urunler;},
  prod:function(p){return q(U.urunler,{urun:slug(p.n)});}
 };
})();
