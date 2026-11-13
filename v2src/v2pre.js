/* v2: sayfa adresleri. Her sayfanın kendi adresi var; bölümler arası geçiş bağlantıyla yapılır. */
window.IFU=(function(){
 var page=document.documentElement.getAttribute('data-page')||'home';
 var AL=['ortopedi','spor-hekimligi','estetik','uroloji','kadin-sagligi','veteriner'];
 var AXS=['ortobiyolojikler','hucresel-tedaviler','rejeneratif-teknolojiler','biyoaktif-beslenme','ozel-cozumler'];
 var TRM={'ç':'c','ğ':'g','ı':'i','i̇':'i','ö':'o','ş':'s','ü':'u','â':'a','î':'i','û':'u'};
 function slug(s){return String(s).toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g,function(c){return TRM[c]||c;}).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}
 return {page:page,AL:AL,AXS:AXS,slug:slug,
  home:function(){return 'index.html';},
  alan:function(i){return 'uzmanlik.html'+(i>=0?'?alan='+AL[i]:'');},
  ax:function(i){return 'urunler.html'+(i>=0?'?eksen='+AXS[i]:'');},
  prod:function(p){return 'urunler.html?urun='+slug(p.n);}
 };
})();
