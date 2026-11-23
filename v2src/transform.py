import sys
#!/usr/bin/env python3
"""v1 prototipinden (v1-index.html) v2 kaynağını (app.html) üretir.
Her değişiklik birebir eşleşmeyle yapılır; eşleşme sayısı tutmazsa betik durur.
Kullanım: python3 transform.py"""
import io, os, re, sys, json, math
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'v1-index.html')
s = io.open(SRC, encoding='utf-8').read()
LOG = []

def rep(old, new, count=1, where=None):
    global s
    tgt = s if where is None else where
    n = tgt.count(old)
    if n != count:
        sys.exit('ESLESME HATASI (%d != %d): %r' % (n, count, old[:120]))
    out = tgt.replace(old, new)
    if where is None:
        s = out
    return out

def cut(a, b, src=None, incl_b=True):
    """a ile başlayıp b ile biten ilk bloğu döndürür (b dahil)."""
    t = s if src is None else src
    i = t.index(a)
    j = t.index(b, i + len(a))
    return t[i:j + (len(b) if incl_b else 0)]

def block(start, tag):
    """start ile açılan <tag> öğesini, iç içe aynı etiketleri sayarak bütün olarak döndürür."""
    i = s.index(start)
    depth = 0
    for m in re.finditer(r'<(/?)%s\b[^>]*>' % tag, s[i:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return s[i:i + m.end()]
    sys.exit('blok kapanmadı: ' + start)

# ---------------------------------------------------------------- BODY
# 1) pilot çubuğu: işaretleme kalır (JS bağları kopmasın), görünmez
rep('<div class="bar">', '<div class="bar" hidden>')

# 2) logo her yerde ana sayfaya bağlantı
rep('<header class="site-top">\n      <span class="logo" role="img" aria-label="Intrafarma"></span>',
    '<header class="site-top">\n      <a class="logo-a" href="index.html" data-tl="pg_home"><span class="logo" aria-hidden="true"></span></a>')
rep('<div class="sf-brand"><span class="logo" role="img" aria-label="Intrafarma"></span>',
    '<div class="sf-brand"><a class="logo-a" href="index.html" data-tl="pg_home"><span class="logo" aria-hidden="true"></span></a>')

# 3) ana menü: gerçek sayfa adresleri, her açılır menüde "tümü" bağlantısı, mobilde Ana sayfa + dil satırı
nav_old = block('<nav class="pub-nav" id="pubNav"', 'nav')
LANGS = [('tr','TR'),('en','EN'),('ar','AR'),('it','IT'),('ru','RU'),('ro','RO')]
lang_btns = ''.join('<button type="button" data-lang="%s" lang="%s">%s</button>' % (c, c, t) for c, t in LANGS)
nav_new = ('<nav class="pub-nav" id="pubNav" aria-label="Menü">\n'
 '        <a class="nv-home" href="index.html" data-t="pg_home"></a>\n'
 '        <div class="nv nv-2" data-sec="urunler"><button type="button" class="nv-t" aria-expanded="false" data-t="nav3"></button><div class="nv-m"><div class="nv-c"><span class="nv-h" data-t="nv_alan"></span><div class="nv-l" id="nvUa"></div></div><div class="nv-c"><span class="nv-h" data-t="nv_grup"></span><div class="nv-l" id="nvHp"></div></div></div></div>\n'
 '        <a class="nv-a" href="uretim.html" data-sec="uretim" data-t="nav_ozel"></a>\n'
 '        <div class="nv" data-sec="bilim"><button type="button" class="nv-t" aria-expanded="false" data-t="nav4"></button><div class="nv-m"><a href="bilim.html" data-t="ov"></a><a href="bilim.html#kurul" data-t="nav_kurul"></a><a href="bilim.html#sss" data-t="ft_sss"></a></div></div>\n'
 '        <div class="nv" data-sec="kurumsal"><button type="button" class="nv-t" aria-expanded="false" data-t="nav1"></button><div class="nv-m"><a href="hakkimizda.html" data-t="nv_sirket"></a><a href="hakkimizda.html#is-ortaklari" data-t="nav_ort"></a><a href="guncel.html" data-t="nav6"></a></div></div>\n'
 '        <a class="nv-a" href="iletisim.html" data-sec="iletisim" data-t="nav5"></a>\n'
 '        <div class="lsw-m" role="group" data-tl="d_lang">' + lang_btns + '</div>\n'
 '      </nav>')
rep(nav_old, nav_new)

# 4) dil seçici: tek yuvarlak düğme, üzerine gelince diğer diller soldan sağa açılır
lsw = ('<div class="lsw" id="lsw"><button type="button" class="lsw-cur" id="lswCur" aria-haspopup="true" aria-expanded="false" data-tl="d_lang"><span id="lswCode">TR</span></button>'
       '<div class="lsw-opts" id="lswOpts" role="group">' + lang_btns + '</div></div>\n      ')
rep('<button class="hcp lg btn" type="button" data-gate data-t="hcp"></button>\n      <button class="nv-burger"',
    lsw + '<button class="hcp lg btn" type="button" data-gate data-t="hcp"></button>\n      <button class="nv-burger"')
# mobil menü düğmesi: simgenin yanında yazı (Menü / Kapat)
burger = block('<button class="nv-burger" id="nvBurger"', 'button')
rep(burger, burger.replace('</button>', '<span class="nb-o" data-t="nav_menu"></span><span class="nb-c" data-t="close"></span></button>'))

# 5) ana sayfa yeni sıra: video > uzmanlık > hücre > ürünler > rakamlar+ortaklar > üretim şeridi > (güncel, gizli)
VH   = block('<section class="vh" id="vh"', 'section')
CELL = cut('<div class="cell-sec band dark" id="hucre">', '<section class="hs ua"', incl_b=False)
UA   = block('<section class="hs ua" id="uzmanlik"', 'section')
HP   = block('<section class="hs hp band ice" id="urunler"', 'section')
LB   = block('<section class="hs lb band dark2"', 'section')
ST   = block('<section class="hs st band tint"', 'section')
GN   = block('<section class="hs gn"', 'section')
PT   = block('<section class="pt" aria-labelledby="ptH">', 'section')
home_old = s[s.index(VH):s.index(GN) + len(GN)]
assert home_old.startswith(VH) and home_old.endswith(GN)

vh2 = rep('<button class="b-pri" type="button" data-cat><span data-t="cta2"></span><span class="o"></span></button>',
          '<a class="b-pri" href="urunler.html"><span data-t="cta2"></span><span class="o"></span></a>', where=VH)
cell2 = rep('<div class="hs-h c" data-rv="rise"><p class="eyebrow" data-t="c_ey"></p>',
            '<div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="c_ey"></p>', where=CELL)
hp2 = HP.replace('class="hs hp band ice"', 'class="hs hp band tint"')
hp2 = re.sub(r'\s*<span class="hp-3d">.*?</span></span>', '', hp2, count=1, flags=re.S)
assert 'hp-3d' not in hp2
hp2 = rep('<button class="b-pri" type="button" data-cat><span data-t="hp_cta"></span><span class="o"></span></button>',
          '<a class="b-pri" href="urunler.html"><span data-t="hp_cta"></span><span class="o"></span></a>', where=hp2)
pt_inner = PT[PT.index('<div class="pt-head"'):PT.rindex('</section>')]
pt_inner = pt_inner.replace('<div class="pt-head" data-rv="rise">', '<div class="pt-head">')
st2 = ST.replace('class="hs st band tint"', 'class="hs st"')
st2 = rep('\n        <p class="st-note" data-t="st_note"></p>', '', where=st2)
st2 = st2[:st2.rindex('</section>')] + '  <div class="pt st-pt">' + pt_inner + '</div>\n    </section>'
lbs = ('<section class="hs lbs band tint" aria-labelledby="lbH">\n'
       '      <div class="lbs-in" data-rv="rise"><div class="lbs-t"><p class="eyebrow" data-t="lb_ey"></p><h2 id="lbH" data-t="lb_h"></h2><p data-t="lb_p"></p></div>'
       '<a class="b-sec" href="uretim.html"><span data-t="hc_more"></span><i aria-hidden="true">→</i></a></div>\n    </section>')
gn2 = GN.replace('<section class="hs gn"', '<section class="hs gn" hidden', 1)
home_new = '\n    '.join([vh2, UA, cell2, hp2, st2, lbs, gn2])
rep(home_old, home_new)
rep(PT, '')

# 6) alt sayfalar
rep('<a class="hc-m" href="#iletisim"><span data-t="lb_cta"></span>', '<a class="hc-m" href="iletisim.html"><span data-t="lb_cta"></span>')
rep('<nav class="sub" aria-label="Bilim"><a href="#hucre" data-t="nav_cell"></a>', '<nav class="sub" aria-label="Bilim"><a href="index.html#hucre" data-t="nav_cell"></a>')
PEND = lambda key: '<p class="pend-card"><i aria-hidden="true"></i><span data-t="%s"></span></p>' % key
bk = block('<div class="bk-g">', 'div'); rep(bk, PEND('bk_soon'))
rep('<section class="hs bk band ice" id="kurul" aria-labelledby="bkH">\n      <div class="hs-h c" data-rv="rise">',
    '<section class="hs bk" id="kurul" aria-labelledby="bkH">\n      <div class="hs-h" data-rv="rise">')
rep('<div class="sub" id="gnF" role="group">', '<div class="sub" id="gnF" role="group" hidden>')
evg = block('<div class="ev-g">', 'div'); rep(evg, PEND('ev_soon'))
blg = block('<div class="bl-g">\n        <article data-rv="up" data-k="c1">', 'div'); rep(blg, PEND('bl_soon'))
rep('<div><p class="eyebrow" data-t="bl_ey"></p><h2 id="blH" data-t="bl_h"></h2></div><a class="b-link" href="#" data-t="bl_all"></a>',
    '<div><p class="eyebrow" data-t="bl_ey"></p><h2 id="blH" data-t="bl_h"></h2></div>')
rep('<section class="hs bl band tint" id="blog"', '<section class="hs bl" id="blog"')

# yeni görünümler: Uzmanlık genel bakış, Ürünler (sayfa içi katalog), Hakkımızda
V_UZ = ('<div class="view" id="vUzmanlik" hidden>\n'
 '    <section class="pg band tint" aria-labelledby="uzH"><div class="pg-in" data-rv="rise"><p class="eyebrow" data-t="ua_ey"></p><h1 id="uzH" data-t="nav2"></h1><p data-t="ua_p"></p></div></section>\n'
 '    <section class="hs uz"><div class="ua-g uz-g" id="uzG"></div></section>\n'
 '    </div>\n    ')
V_UC = ('<div class="view" id="vUrunler" hidden>\n'
 '    <section class="pg band tint" aria-labelledby="ucH"><div class="pg-in" data-rv="rise"><p class="eyebrow" id="ucEy" data-t="hp_ey"></p><h1 id="ucH"></h1><p id="ucP" data-t="uc_p"></p></div></section>\n'
 '    <section class="hs uc" aria-labelledby="ucH">\n'
 '      <div class="uc-bar" id="ucBar">\n'
 '        <div class="uc-ax" id="ucAx" role="group"></div>\n'
 '        <label class="uc-q"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg><input id="ucQ" type="search" autocomplete="off" data-tp="cat_q"></label>\n'
 '      </div>\n'
 '      <div class="uc-ca" id="ucCa" role="group"></div>\n'
 '      <p class="uc-n" id="ucN" aria-live="polite"></p>\n'
 '      <div class="uc-g" id="ucG"></div>\n'
 '      <div class="uc-d" id="ucD" hidden></div>\n'
 '    </section>\n'
 '    </div>\n    ')
V_HK = ('<div class="view" id="vHakkimizda" hidden>\n'
 '    <section class="pg band tint" aria-labelledby="hkH"><div class="pg-in" data-rv="rise"><p class="eyebrow" data-t="hk_ey"></p><h1 id="hkH" data-t="nav1"></h1><p data-t="hk_lede"></p></div></section>\n'
 '    <section class="hs hk-pos" aria-labelledby="hkPosH"><div class="hk-pos-in">'
 '<div data-rv="rise"><p class="eyebrow" data-t="hk_pos_ey"></p><h2 id="hkPosH" data-t="hk_pos_h"></h2><p class="hk-lead" data-t="hk_pos_p"></p></div>'
 '<figure class="hk-fig" data-rv="up"><img src="media/hero-bilim.jpg" alt="" loading="lazy" decoding="async"></figure></div></section>\n'
 '    <section class="hs hk-val" aria-labelledby="hkValH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="hk_val_ey"></p><h2 id="hkValH" data-t="hk_val_h"></h2></div>'
 '<div class="hk-g4">' + ''.join('<article data-rv="up"><h3 data-t="hk_v%d"></h3><p data-t="hk_v%dp"></p></article>' % (i, i) for i in range(1, 5)) + '</div></section>\n'
 '    <section class="hs hk-how band tint" aria-labelledby="hkHowH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="hk_how_ey"></p><h2 id="hkHowH" data-t="hk_how_h"></h2></div>'
 '<ol class="hk-steps">' + ''.join('<li data-rv="up"><i>0%d</i><h3 data-t="hk_s%d"></h3><p data-t="hk_s%dp"></p></li>' % (i, i, i) for i in range(1, 5)) + '</ol></section>\n'
 '    <section class="hs hk-pt" id="is-ortaklari" aria-labelledby="hkPtH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="pt_ey"></p><h2 id="hkPtH" data-t="pt_h"></h2></div><div class="hk-ptg" id="hkPt"></div></section>\n'
 '    <section class="hs hk-med" aria-labelledby="hkMedH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="hk_med_ey"></p><h2 id="hkMedH" data-t="hk_med_h"></h2></div>' + PEND('pend') + '</section>\n'
 '    <section class="hs hk-end" aria-labelledby="hkEndH"><h2 class="vh-hid" id="hkEndH" data-t="hk_end_h"></h2><div class="hk-end-g">'
 '<a class="hk-card" href="iletisim.html"><b data-t="nav5"></b><span data-t="hk_c1p"></span><i aria-hidden="true">→</i></a>'
 '<button class="hk-card" type="button" data-gate><b data-t="hcp"></b><span data-t="hk_c2p"></span><i aria-hidden="true">→</i></button>'
 '</div></section>\n'
 '    </div>\n    ')
rep('<div class="view" id="vAlan" hidden>', V_UZ + V_UC + V_HK + '<div class="view" id="vAlan" hidden>')

# gizli/eski geri bağlantıları da geçerli adreslere
rep('<a class="pg-back" href="#top">', '<a class="pg-back" href="index.html">', count=4)
rep('<a class="pg-back" href="#uzmanlik">', '<a class="pg-back" href="uzmanlik.html">')
rep('<a class="b-link" href="#guncel" data-t="gn_all"></a>', '<a class="b-link" href="guncel.html" data-t="gn_all"></a>')

# 7) alt bilgi: gerçek adresler, SSS "Yasal"dan çıkıp siteye; yasal sayfalar henüz yok
rep('<a href="hakkimizda.html" data-t="nav1"></a><a href="#uzmanlik" data-t="nav2"></a><a href="#urunler" data-t="nav3"></a><a href="#bilim" data-t="nav4"></a><a href="#uretim" data-t="nav_ur"></a><a href="#guncel" data-t="nav6"></a><a href="#iletisim" data-t="nav5"></a></nav>',
    '<a href="index.html" data-t="pg_home"></a><a href="hakkimizda.html" data-t="nav1"></a><a href="uzmanlik.html" data-t="nav2"></a><a href="urunler.html" data-t="nav3"></a><a href="bilim.html" data-t="nav4"></a><a href="bilim.html#sss" data-t="ft_sss"></a><a href="uretim.html" data-t="nav_ur"></a><a href="guncel.html" data-t="nav6"></a><a href="iletisim.html" data-t="nav5"></a><button type="button" data-gate data-t="hcp"></button></nav>')
rep('<a href="#sss" data-t="ft_sss"></a><a href="#" data-t="ft_kvkk"></a><a href="#" data-t="ft_cookie"></a><a href="#" data-t="ft_ae"></a>',
    '<a href="kvkk.html" data-t="ft_kvkk"></a><a href="kvkk.html#cerez" data-t="ft_cookie"></a><a href="iletisim.html#yan-etki" data-t="ft_ae"></a>')

# 8) alt bilginin altındaki tasarım notları (iki dünya tablosu, erişim katmanları, sonra eklenecekler, etkileşim dili)
i0 = s.index('<section class="sec">'); i1 = s.index('<p class="draft-chip" id="draftChip"')
tail = s[i0:i1]; j = tail.rindex('</section>') + len('</section>')
rep(tail[:j], '')

# 8b) Pro hücresi: sol tarafa iki sade etiket daha (çizgi + nokta)
rep('<div class="anno" id="an2"><i></i><s></s><span></span></div>',
    '<div class="anno" id="an2"><i></i><s></s><span></span></div>\n    <div class="anno l" id="an5"><i></i><s></s><span></span></div>\n    <div class="anno l" id="an6"><i></i><s></s><span></span></div>')
# 8c) hücre modülünde etiket yerleşimi
rep("const an1=document.getElementById('an1'), an2=document.getElementById('an2');",
               "const an1=document.getElementById('an1'), an2=document.getElementById('an2'), an5=document.getElementById('an5'), an6=document.getElementById('an6');")
rep("[[an1,-1.12,'an1','an3'],[an2,0.98,'an2','an4']].forEach(([el,ang,a,b])=>{",
               "[[an1,-1.12,'an1','an3'],[an2,0.98,'an2','an4'],[an5,2.35,'an1','an1'],[an6,-2.25,'an2','an2']].forEach(([el,ang,a,b])=>{const lf=el.classList.contains('l');")
rep("const ok=showA&&p.x<W-210&&isPro;el.style.opacity=ok?1:0;\n  el.style.transform='translate('+p.x.toFixed(1)+'px,'+(p.y-5).toFixed(1)+'px)';});",
               "const ok=showA&&(lf?p.x>230:p.x<W-210)&&isPro;el.style.opacity=ok?1:0;\n  el.style.transform='translate('+p.x.toFixed(1)+'px,'+(p.y-5).toFixed(1)+'px)'+(lf?' translate(-100%,0)':'');});")
# 8d) sosyal medya: YouTube tanıtıcı adresi; İletişim'de ikon + platform adı
rep('https://www.youtube.com/channel/UCh5m38jB7y87zfRq7AktcEA', 'https://www.youtube.com/@intrafarmasaglik', count=2)
i0 = s.index('<div class="il-soc">'); i1 = s.index('</div>', i0)
blk = s[i0:i1]
for nm in ('Instagram', 'Facebook', 'LinkedIn', 'YouTube'):
    blk = blk.replace('aria-label="%s">' % nm, 'aria-label="%s">' % nm, 1)
    k = blk.index('aria-label="%s">' % nm); e = blk.index('</svg></a>', k)
    blk = blk[:e] + '</svg><span>%s</span></a>' % nm + blk[e+len('</svg></a>'):]
rep(s[i0:i1], blk)
# 9) katmanlarda yazılı "Kapat" düğmesi
rep('<button class="cat-x" id="catClose" type="button" aria-label="Kapat" data-magnet>×</button>',
    '<button class="cat-x ov-x" id="catClose" type="button" data-magnet><span data-t="close"></span><i aria-hidden="true">×</i></button>')
rep('<button class="z-x lg btn" id="zClose" type="button" aria-label="Kapat" data-magnet>×</button>',
    '<button class="z-x ov-x lg btn" id="zClose" type="button" data-magnet><span data-t="close"></span><i aria-hidden="true">×</i></button>')
rep('<div class="gate" id="gate" hidden>',
    '<div class="gate" id="gate" hidden>\n      <button class="g-x ov-x" id="gX" type="button"><span data-t="close"></span><i aria-hidden="true">×</i></button>')
# Pro üst çubuğu: logo siteye döner; çıkış düğmesi ne yaptığını söyler
rep('<div class="brand-pro"><span class="logo" role="img" aria-label="Intrafarma"></span><span class="pill">PRO</span></div>',
    '<div class="brand-pro"><button class="pro-home" id="proHome" type="button" data-tl="pro_site"><span class="logo" aria-hidden="true"></span></button><span class="pill">PRO</span></div>')
rep('<button class="ghost" id="logout" type="button" data-magnet data-t="logout"></button>',
    '<button class="ghost pro-out" id="logout" type="button" data-magnet><i aria-hidden="true">←</i><span data-t="pro_site"></span></button>')

# 10) hücre modülü dış dosyadan; three.js ve fontlar yerel
rep('<script type="text/x-cell-module" id="cellMod">', '<script type="text/x-cell-module" id="cellMod" data-src="assets/cell.js">')
rep('"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"',
    '"three":"./assets/vendor/three.module.js","three/addons/":"./assets/vendor/addons/"')
fl = re.search(r'<link rel="preconnect" href="https://fonts.googleapis.com">\s*<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\s*<link rel="stylesheet" href="https://fonts.googleapis.com/css2\?[^"]+">', s)
assert fl, 'google fonts link'
rep(fl.group(0), '<link rel="stylesheet" href="assets/fonts.css">')

# medya yolları (sayfalar /v2/ altında, medya bir üst klasörde)
_b0 = s.index('<body>'); _b1 = s.index('<script>', _b0)
_body = s[_b0:_b1]
n_media = len(re.findall(r'(src|poster)="media/', _body))
s = s[:_b0] + re.sub(r'(src|poster)="media/', r'\1="{{BASE}}media/', _body) + s[_b1:]
LOG.append('medya yolu: %d' % n_media)

# Pro: hücre metne yaklaşır (sağda boş alan kalmasın)
rep("place(L.pro,n?.66:.74,n?.29:.42,n?.15:.23);", "if(n)place(L.pro,.5,Math.min(.33,260/H),Math.min(.15,96/H));else place(L.pro,.63,.44,.23);")

# ---------------------------------------------------------------- JS
scripts = list(re.finditer(r'<script>(.*?)</script>', s, re.S))
assert len(scripts) == 2
c1, c2 = scripts[0].group(1), scripts[1].group(1)
c1n, c2n = c1, c2
def jrep(src, old, new, count=1):
    n = src.count(old)
    if n != count:
        sys.exit('JS ESLESME HATASI (%d != %d): %r' % (n, count, old[:140]))
    return src.replace(old, new)

PRE = io.open(os.path.join(HERE, 'v2pre.js'), encoding='utf-8').read()
# 8j) Drive fotoğraflarında bulunan, katalogda olmayan 11 ürün (grup önerisi; firma panelden düzeltir)
_pk = "['Regenflex T&M',0],['İnartro',0],"
_px = "['Regenflex T&M',0],['ArthroPlus Kit',0],['PlusFlex Kit',0],['İnartro',0],['Hyaluzen',0],['Hyaluaura',0],['Moveura',0],['Hyalint',0],['Synchro Forte',0],"
_bk = "['Osblass Saşe',3],['Atrofit',3],['Nemact',3],"
_bx = "['Osblass Saşe',3],['Atrofit',3],['Nemact',3],['NemPlus',3],['IMAG',3],['Aurmag',3],['Kaseon',3],"
if _pk in c1:
    c1n = jrep(c1n, _pk, _px); c1n = jrep(c1n, _bk, _bx)
else:
    c2n = jrep(c2n, _pk, _px); c2n = jrep(c2n, _bk, _bx)
# 8k) ana sayfa sayaçları: ürün ve iş ortağı sayısı elle değil, katalogdan ve logo listesinden
c2n = jrep(c2n, "const nums=$$('.st-g b[data-n]')", "{const _P=(window.IFD&&IFD.PRODS)||[],_s=$$('.st-g b[data-n]'),_o=new Set($$('#ptTrack .pt-l').map(a=>a.getAttribute('href')||(a.querySelector('img')||{}).src));if(_s[1]&&_P.length){_s[1].dataset.n=_P.length;_s[1].textContent=_P.length;}if(_s[2]&&_o.size){_s[2].dataset.n=_o.size;_s[2].textContent=_o.size;}}\nconst nums=$$('.st-g b[data-n]')")
# 8m) ürüne özel klinik alanlar (p.ca), ürün sayfası ekleri, Pro ürün sayfası, ürün belgeleri
c1n = jrep(c1n, "window.IFD={AX,CA,PRODS,AXCA};", "window.IFD={AX,CA,PRODS,AXCA};window.pCA=p=>(p&&Array.isArray(p.ca)&&p.ca.length?p.ca:AXCA[p.a]||[]);")
c1n = jrep(c1n, "AXCA[p.a].includes(CS.ca)", "pCA(p).includes(CS.ca)")
c1n = jrep(c1n, "cas=AXCA[p.a].map(", "cas=pCA(p).map(")
c1n = jrep(c1n, "function openZoom(card){", "function openZoom(card){if(window.proRestore)proRestore();")
c1n = PRE + c1n
keys = json.load(io.open(os.path.join(HERE, 'v2keys.json'), encoding='utf-8'))
inj = 'for(const [l,o] of Object.entries(%s))Object.assign(T[l]=T[l]||{},o);\n' % json.dumps(keys, ensure_ascii=False)
c1n = jrep(c1n, 'const IF=window.IF=', inj + 'const IF=window.IF=')
c1n = jrep(c1n, "m.textContent=src.textContent;", "if(src.dataset.src)m.src=src.dataset.src;else m.textContent=src.textContent;")
c1n = jrep(c1n, "new IntersectionObserver((es,ob)=>{if(es.some(e=>e.isIntersecting)){ob.disconnect();IF.loadCell();}},{rootMargin:'700px 0px'}).observe(document.getElementById('hucre'));",
               "if(IFU.page==='home'){const _h=document.getElementById('hucre'),_st=document.getElementById('stage'),_c=navigator.connection;"
               "if(_st&&(matchMedia('(max-width:760px)').matches||(_c&&_c.saveData))){"   # mobil: önce hafif görsel, 3B hücre dokununca yüklenir
               "const f=document.createElement('div');f.className='cell-poster';f.innerHTML='<img src=\"'+(window.IF_BASE||'')+'media/cell-poster.webp\" alt=\"\" decoding=\"async\" loading=\"lazy\"><button type=\"button\" class=\"cell-go\"><span class=\"cg-ring\" aria-hidden=\"true\"></span><span data-t=\"c_go\">'+((T[IF.lang]||T.tr).c_go||'')+'</span></button>';_st.appendChild(f);"
               "f.querySelector('button').addEventListener('click',()=>{f.classList.add('busy');IF.loadCell();});"
               "new MutationObserver((m,o)=>{if(_st.classList.contains('gl-on')||_st.classList.contains('gl-off')){o.disconnect();f.classList.add('gone');setTimeout(()=>f.remove(),700);}}).observe(_st,{attributes:true,attributeFilter:['class']});"
               "}else new IntersectionObserver((es,ob)=>{if(es.some(e=>e.isIntersecting)){ob.disconnect();IF.loadCell();}},{rootMargin:'700px 0px'}).observe(_h);}")
# ziyaretçi kataloğu artık bir sayfa: eski tam ekran katman yalnızca Pro'da açılır
c1n = jrep(c1n, "IF.openCatAx=i=>{openCat();if(IF.mode==='public'){CS.ax=i;CS.det=-1;renderCat();}};",
               "IF.openCatAx=i=>{if(IF.mode==='public')location.href=IFU.ax(i);};")
c1n = jrep(c1n, "function openCat(){if(IF.mode!=='public')return;", "function openCat(){if(IF.mode==='public')location.href=IFU.ax(-1);return;")
# giriş kapısı tarayıcı geçmişine girer: geri tuşu kapıyı kapatır
c1n = jrep(c1n, "function openGate(){if(IF.mode!=='public')return;setFull(true);gate.hidden=false;",
               "function openGate(){if(IF.mode!=='public')return;setFull(true);gate.hidden=false;if(!(history.state&&history.state.ifgate))history.pushState({ifgate:1},'');")
# dil adresi: ?dil=en (Polylang'ın ?lang= parametresiyle çakışmasın); eski ?lang= de okunur
c1n = jrep(c1n, "const q=new URLSearchParams(location.search).get('lang');", "const _sp=new URLSearchParams(location.search),q=_sp.get('dil')||_sp.get('lang')||window.IF_DIL;")
c1n = jrep(c1n, "$('#gBack').addEventListener('click',hideGate);", "$('#gBack').addEventListener('click',()=>IF.closeGate());")
c1n = jrep(c1n, "else if(!gate.hidden)hideGate();", "else if(!gate.hidden)IF.closeGate();")
c1n = jrep(c1n, "if(location.hash!=='#pro')history.pushState({ifpro:1},'','#pro');", "if(location.hash!=='#pro')IF.pushPro();", count=2)
# medya yolu (JS içinde)
V2C1 = io.open(os.path.join(HERE, 'v2c1.js'), encoding='utf-8').read()
c1n = jrep(c1n, "resize();applyLang();\nrequestAnimationFrame(loop);\n})();", V2C1 + "\nresize();applyLang();\nrequestAnimationFrame(loop);\n})();")

c2n = jrep(c2n, "const UA_IMG=['ortopedi','spor',null,null,null,null];", "const UA_IMG=['ortopedi','spor-hekimligi','estetik','uroloji','kadin-sagligi','veteriner'];")
c2n = jrep(c2n, "'<img src=\"media/gorsel/'+UA_IMG[i]+'.jpg\" alt=\"\" loading=\"lazy\" decoding=\"async\">'", "'<img src=\"'+(window.IF_BASE||'')+'media/alan/'+UA_IMG[i]+'.webp'+'\" alt=\"\" loading=\"lazy\" decoding=\"async\" width=\"800\" height=\"755\">'")
c2n = jrep(c2n, "'</svg><span class=\"ua-tb\">'+tr('ua_photo')+'</span>'", "'</svg>'")
c2n = jrep(c2n, "a.href='#alan-'+i;a.className='ua-c'", "a.href=IFU.alan(i);a.className='ua-c'")
c2n = jrep(c2n, "const li=document.createElement('li');li.innerHTML='<i>0'+(i+1)+'</i><b></b><span></span>';li.querySelector('b').textContent=n;li.querySelector('span').textContent=c+' '+tr('hp_n');",
               "const li=document.createElement('li');li.innerHTML='<a href=\"'+IFU.ax(i)+'\"><i>0'+(i+1)+'</i><b></b><span aria-hidden=\"true\">→</span></a>';li.querySelector('b').textContent=n;")
c2n = jrep(c2n, "a.href='#alan-'+i;a.textContent=n;nu.appendChild(a);});}",
               "a.href=IFU.alan(i);a.textContent=n;nu.appendChild(a);});const al=document.createElement('a');al.href=IFU.alan(-1);al.className='nv-all';al.textContent=tr('all_areas');nu.appendChild(al);}")
nh_old = c2n[c2n.index("const nh=$('#nvHp');"):c2n.index("if(typeof renderAlan==='function')renderAlan();")]
c2n = jrep(c2n, nh_old, "const nh=$('#nvHp');if(nh){nh.innerHTML='';AX.forEach((n,i)=>{const a=document.createElement('a');a.href=IFU.ax(i);a.textContent=n;nh.appendChild(a);});const al=document.createElement('a');al.href=IFU.ax(-1);al.className='nv-all';al.textContent=tr('all_prods');nh.appendChild(al);}\n ")
c2n = jrep(c2n, "li.textContent=p.n;ul.appendChild(li);", "const pa=document.createElement('a');pa.href=IFU.prod(p);pa.textContent=p.n;li.appendChild(pa);ul.appendChild(li);")
c2n = jrep(c2n, "a.href='#alan-'+i;a.innerHTML='<span></span>", "a.href=IFU.alan(i);a.innerHTML='<span></span>")
c2n = jrep(c2n, "im.src='media/ortaklar/'+f+'.jpg'", "im.src=/^(https?:)?\\/\\//.test(f)||f.charAt(0)==='/'?f:(window.IF_BASE||'')+'media/ortaklar/'+f+'.webp'")
# iş ortakları WordPress panelinden gelebilir
c2n = jrep(c2n, "const PT=[[", "const PT=(window.IF_CMS&&Array.isArray(window.IF_CMS.partners)&&window.IF_CMS.partners.length&&window.IF_CMS.partners)||[[")
c2n = jrep(c2n, "addEventListener('hashchange',()=>route(false));route(true);", "")
V2C2 = io.open(os.path.join(HERE, 'v2c2.js'), encoding='utf-8').read()
# 8e) alan sayfası: her alanın kendi açıklaması (al_p0..5)
c2n = jrep(c2n, " $('#alH').textContent=CA[alanI];", " $('#alH').textContent=CA[alanI];{const ap=$('#alH').nextElementSibling;if(ap&&ap.tagName==='P'){ap.removeAttribute('data-t');const t=tr('al_p'+alanI);ap.textContent=t&&t!=='al_p'+alanI?t:tr('ua_p');}}")
# 8h) mobil menü: sağlık çalışanı girişi menünün içinde de olsun
rep('<div class="lsw-m" role="group" data-tl="d_lang">', '<button type="button" class="nv-hcp" data-gate data-t="hcp"></button><div class="lsw-m" role="group" data-tl="d_lang">')
# 8i) hücre: retina ekranlarda daha net (çözünürlük sınırı 1 → 1.5; yavaş cihazda kendiliğinden düşer), zemin bir kademe koyu ve canlı
rep("let DPR=Math.min(window.devicePixelRatio||1,1);", "let DPR=Math.min(window.devicePixelRatio||1,1.5);")
rep("vec3 c=mix(vec3(0.972,0.976,0.988),vec3(0.925,0.945,0.965),clamp(1.0-uv.y*0.9,0.0,1.0)*0.6);", "vec3 c=mix(vec3(0.600,0.745,0.800),vec3(0.330,0.520,0.610),clamp(1.0-uv.y*0.9,0.0,1.0)*0.85);")
rep("c=mix(c,vec3(0.76,0.88,0.93),smoothstep(0.85,0.05,distance(uv*vec2(uRes.x/uRes.y,1.0),vec2(0.88*uRes.x/uRes.y,0.92)))*0.6*(0.55+0.45*f));", "c=mix(c,vec3(0.42,0.66,0.76),smoothstep(0.85,0.05,distance(uv*vec2(uRes.x/uRes.y,1.0),vec2(0.88*uRes.x/uRes.y,0.92)))*0.6*(0.55+0.45*f));")
rep("c=mix(c,vec3(0.56,0.75,0.84),smoothstep(0.62,0.06,dc)*0.58*(0.8+0.2*f));", "c=mix(c,vec3(0.62,0.80,0.88),smoothstep(0.55,0.04,dc)*0.55*(0.8+0.2*f));")
# 8l) hücre zemini: dalga çizgileri görünür, yavaş akar (koyu zeminde kontrast)
rep("c+=waves(uv,f,f*0.7,pl)*0.03*vec3(0.9,1.0,1.0);", "c+=waves(uv,f,f*0.7,pl)*0.11*vec3(0.80,0.97,1.0);")
# 8g) alt sayfalarda ana sayfa videoları indirilmesin (mobil veri)
rep('<video class="vh-v on" muted playsinline preload="auto"', '<video class="vh-v on" muted playsinline preload="none"')
c2n = jrep(c2n, ".observe($('#vh'));\ngo(0);", ".observe($('#vh'));\nif(!window.IFU||IFU.page==='home')go(0);")
# 8f) alan sayfası: ürünler Ürünler sayfasındaki kartlarla
c2n = jrep(c2n, "const h=document.createElement('h3');h.textContent='0'+(ax+1)+' · '+AX[ax];g.appendChild(h);const ul=document.createElement('ul');\n  D.PRODS.filter(p=>p.a===ax).forEach(p=>{const li=document.createElement('li');const pa=document.createElement('a');pa.href=IFU.prod(p);pa.textContent=p.n;li.appendChild(pa);ul.appendChild(li);});g.appendChild(ul);});",
 "const h=document.createElement('h3');h.textContent='0'+(ax+1)+' · '+AX[ax];g.appendChild(h);const gr=document.createElement('div');gr.className='uc-g al-cards';\n  gr.innerHTML=D.PRODS.map((p,i)=>({p,i})).filter(o=>o.p.a===ax&&pCA(o.p).includes(alanI)).map(o=>ucCard(o.p,o.i,L,AX)).join('');g.appendChild(gr);});")
c2n = jrep(c2n, "D.AXCA.forEach((areas,ax)=>{if(!areas.includes(alanI))return;", "D.AXCA.forEach((areas,ax)=>{if(!D.PRODS.some(p=>p.a===ax&&pCA(p).includes(alanI)))return;")
c2n = jrep(c2n, "labels();\n})();", V2C2 + "\nlabels();\n})();")
CONSENT = io.open(os.path.join(HERE, 'v2consent.js'), encoding='utf-8').read()
c2n = c2n.rstrip() + '\n' + CONSENT
for chk, src in (('c1', c1n), ('c2', c2n)):
    left = re.findall(r"""['"]#(?:alan-|uretim|iletisim|guncel|bilim|urunler|uzmanlik|top)\b""", src)
    if left: sys.exit('%s içinde eski # bağlantısı kaldı: %s' % (chk, left[:5]))
s = s.replace(c1, c1n, 1).replace(c2, c2n, 1)

left = re.findall(r'href="#(?!pro\b)[^"]*"', s[s.index('<body>'):s.index('<script>')])
allowed = {'href="#kurul"', 'href="#sss"', 'href="#top"'}  # #top: sayfa başına dön düğmesi
bad = [h for h in left if h not in allowed]
if bad: sys.exit('gövdede eski # bağlantısı kaldı: %s' % bad)


# ---------------------------------------------------------------- CSS ölçek düzeltmesi
def _lab(h):
    h=h.lstrip('#')
    if len(h)==3: h=''.join(c*2 for c in h)
    r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
    r,g,b=f(r),f(g),f(b)
    x=(r*0.4124+g*0.3576+b*0.1805)/0.95047; y=(r*0.2126+g*0.7152+b*0.0722); z=(r*0.0193+g*0.1192+b*0.9505)/1.08883
    F=lambda v: v**(1/3) if v>0.008856 else 7.787*v+16/116
    return (116*F(y)-16, 500*(F(x)-F(y)), 200*(F(y)-F(z)))
def _split_top(v):
    out,dep,cur=[],0,''
    for ch in v:
        if ch=='(':dep+=1
        if ch==')':dep-=1
        if ch==',' and dep==0: out.append(cur);cur=''
        else: cur+=ch
    out.append(cur);return out
def norm_css(css, R):
    datas=[]
    def keep(m): datas.append(m.group(0)); return '@@D%d@@' % (len(datas)-1)
    css=re.sub(r'url\("data:[^"]*"\)',keep,css)
    def distinct(pat,c=None): return len(set(re.findall(pat,c if c is not None else css)))
    FS=r'(?:font-size:\s*|font:\s*(?:[\w-]+\s+)*?)(\d+(?:\.\d+)?)px'
    before={'yazı boyu':distinct(FS),'köşe':distinct(r'border-radius:\s*([^;}]+)'),'gölge':distinct(r'box-shadow:\s*([^;}]+)'),
            'renk (hex)':distinct(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b'),'süre':distinct(r'(?:transition|animation)[^:;{}]*:[^;}]*?(\d*\.?\d+m?s)\b'),
            'eğri':distinct(r'cubic-bezier\([^)]+\)'),'boşluk':distinct(r'(?:padding|margin|gap)[\w-]*:\s*([^;}]+)'),'kırılma noktası':distinct(r'@media[^{]*max-width:\s*(\d+)px')}
    SC=[12,14,16,18,24,36,56]
    def fs(m):
        v=float(m.group(2)); n=min(SC,key=lambda s:(abs(s-v),-s))
        return m.group(1)+('%d' % n)+'px'
    css=re.sub(r'(font-size:\s*)(\d+(?:\.\d+)?)px',fs,css)
    css=re.sub(r'(font:\s*(?:[\w-]+\s+)*?)(\d+(?:\.\d+)?)px',fs,css)
    def rad_tok(m):
        v=float(m.group(1))
        if v<=3 or v>=100: return m.group(0)
        n=8 if v<12 else 16 if v<20 else 24 if v<40 else int(v)
        return '%dpx' % n
    css=re.sub(r'(border-radius:\s*)([^;}]+)',lambda m:m.group(1)+re.sub(r'(\d+(?:\.\d+)?)px',rad_tok,m.group(2)),css)
    def dur(ms): return ms if ms>=1000 else (150 if ms<225 else 300 if ms<450 else 600)
    def tms(tok):
        mm=re.match(r'(\d*\.?\d+)(ms|s)$',tok); v=float(mm.group(1))*(1 if mm.group(2)=='ms' else 1000); return v
    def fix_list(val, first_only):
        items=_split_top(val); out=[]
        for it in items:
            seen=[0]
            def sub(m):
                if first_only and seen[0]>0: seen[0]+=1; return m.group(0)
                seen[0]+=1; v=tms(m.group(0)); n=dur(v)
                return m.group(0) if n==v else ('%dms' % n)
            out.append(re.sub(r'(?<![\w.-])\d*\.?\d+m?s\b',sub,it))
        return ','.join(out)
    css=re.sub(r'((?:transition|animation)\s*:\s*)([^;}]+)',lambda m:m.group(1)+fix_list(m.group(2),True),css)
    css=re.sub(r'((?:transition|animation)-duration\s*:\s*)([^;}]+)',lambda m:m.group(1)+fix_list(m.group(2),False),css)
    for spr in ('cubic-bezier(.3,1.3,.5,1)','cubic-bezier(.3,1.7,.5,1)'):
        css=css.replace(spr,'cubic-bezier(.2,.7,.2,1)')
    def sp_tok(m):
        sign,v=m.group(1),float(m.group(2))
        if v<=2: return m.group(0)
        n=int(round(v/4.0)*4) or 4
        return '%s%dpx' % (sign,n)
    css=re.sub(r'((?:padding|margin|gap|row-gap|column-gap)(?:-[a-z-]+)?\s*:\s*)([^;}]+)',lambda m:m.group(1)+re.sub(r'(-?)(\d+(?:\.\d+)?)px',sp_tok,m.group(2)),css)
    def bp(m):
        v=int(m.group(2)); n=640 if v<=680 else 900 if v<=1000 else 1180 if v<=1200 else v
        return m.group(1)+str(n)+'px'
    css=re.sub(r'(max-width:\s*)(\d+)px(?=\s*\))',bp,css)
    nsh=[0]
    def sh(m):
        v=m.group(2)
        if 'var(' in v or 'inset' in v or 'none' in v: return m.group(0)
        items=_split_top(v); blurs=[]
        for it in items:
            cols=re.findall(r'rgba?\(([^)]+)\)',it)
            if not cols: return m.group(0)
            for c in cols:
                p=[x.strip() for x in c.split(',')]
                if len(p)<4: return m.group(0)
                r,g,b,a=float(p[0]),float(p[1]),float(p[2]),float(p[3])
                if r+g+b>200 or a>0.3: return m.group(0)
            lens=[x for x in re.sub(r'rgba?\([^)]*\)','',it).split() if re.fullmatch(r'-?\d*\.?\d+(px)?',x)]
            lens=[x[:-2] if x.endswith('px') else x for x in lens]
            if len(lens)<3: return m.group(0)
            blurs.append(float(lens[2]))
        mb=max(blurs); nsh[0]+=1
        return m.group(1)+('var(--sh-1)' if mb<=16 else 'var(--sh-2)' if mb<=40 else 'var(--sh-3)')
    css=re.sub(r'(box-shadow:\s*)([^;}]+)',sh,css)
    hexes=re.findall(r'#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b',css)
    from collections import Counter
    cnt=Counter(h.upper() for h in hexes); reps=[]; mp={}
    for h,_ in cnt.most_common():
        L=_lab(h); hit=None
        for r in reps:
            Lr=_lab(r)
            if math.dist(L,Lr)<3.5: hit=r;break
        if hit: mp[h]=hit
        else: reps.append(h)
    if mp:
        css=re.sub(r'#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b',lambda m:mp.get(m.group(0).upper(),m.group(0)),css)
    after={'yazı boyu':distinct(FS),'köşe':distinct(r'border-radius:\s*([^;}]+)'),'gölge':distinct(r'box-shadow:\s*([^;}]+)'),
            'renk (hex)':distinct(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b'),'süre':distinct(r'(?:transition|animation)[^:;{}]*:[^;}]*?(\d*\.?\d+m?s)\b'),
            'eğri':distinct(r'cubic-bezier\([^)]+\)'),'boşluk':distinct(r'(?:padding|margin|gap)[\w-]*:\s*([^;}]+)'),'kırılma noktası':distinct(r'@media[^{]*max-width:\s*(\d+)px')}
    R['once']=before;R['sonra']=after;R['ortak gölgeye bağlanan']=nsh[0];R['birleşen renk']={k:v for k,v in mp.items()}
    R['kırılma noktaları']=sorted(set(int(x) for x in re.findall(r'@media[^{]*max-width:\s*(\d+)px',css)))
    for i,d in enumerate(datas): css=css.replace('@@D%d@@' % i,d)
    return css

styles=list(re.finditer(r'<style>(.*?)</style>', s, re.S))
assert len(styles)>=1
allcss='\n'.join(m.group(1) for m in styles)
R={}
ncss=norm_css(allcss,R)
v2css=io.open(os.path.join(HERE,'v2.css'),encoding='utf-8').read()
first=styles[0]
s=s[:first.start()]+'<style>'+ncss+'\n'+v2css+'</style>'+''.join('' for _ in styles[1:])+s[first.end():]
for m in list(re.finditer(r'<style>(.*?)</style>', s, re.S))[1:]:
    s=s.replace(m.group(0),'',1)
json.dump(R,io.open(os.path.join(HERE,'norm_report.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
LOG.append('ölçek: '+', '.join('%s %s→%s' % (k,R['once'][k],R['sonra'][k]) for k in R['once']))

io.open(os.path.join(HERE, 'app.html'), 'w', encoding='utf-8').write(s)
# Elle yapılan düzeltmeler (17.11): app.html üzerinde doğrudan yapılan değişiklikler burada yeniden uygulanır.
# Yama tutmazsa durur; o zaman app.html'e elle bakılmalı, üzerine yazılmamalı.
import subprocess
_pf = os.path.join(HERE, 'el-duzeltmeleri.patch')
if os.path.exists(_pf):
    _r = subprocess.run(['patch', '--no-backup-if-mismatch', '-s', '-p0', os.path.join(HERE, 'app.html'), _pf], capture_output=True, text=True)
    if _r.returncode != 0:
        sys.exit('EL DÜZELTMELERİ UYGULANAMADI:\n' + _r.stdout + _r.stderr)
    LOG.append('el düzeltmeleri uygulandı')
# yamadan SONRA: yamanın değiştirdiği bölgelere dokunan ekler (Pro ürün sayfası ve belge kütüphanesi)
_POST = [
    (" if(!fromHistory)history.pushState({ifpro:1,ifproduct:n},'','#pro');", " if(window.proExtra)proExtra(p);\n if(!fromHistory)history.pushState({ifpro:1,ifproduct:n},'','#pro');"),
    ("const DOCS=[", "let DOCS=["),
    ("function renderDocs(){", "function renderDocs(){if(window.IF_DOCS&&IF_DOCS.length)DOCS=IF_DOCS;"),
    ("function docTitle(d){", "function docTitle(d){if(d.length>2)return d[0];"),
    # talepler: formlar IF_SEND ile gönderilir (WordPress'te e-posta + panel kaydı)
    ("""<label class="fld2" for="sQty"><span data-t="s_qty"></span><select id="sQty"><option>1</option><option>2</option><option>5</option><option>10</option></select></label>""",
     """<label class="fld2" for="sQty"><span data-t="s_qty"></span><select id="sQty"><option>1</option><option>2</option><option>5</option><option>10</option></select></label><label class="fld2 full" for="sMail"><span data-t="rq_mail"></span><input id="sMail" type="email" autocomplete="email" data-tp="m_ph"></label><label class="chk full" for="sKvkk"><input type="checkbox" id="sKvkk"><span data-t="rq_kvkk"></span></label>"""),
    ("""$('#sErr').textContent='';const ok=$('#sOk');ok.textContent=IF.tr('s_ok');ok.hidden=false;});""",
     """const sm=$('#sMail').value.trim();if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(sm)){$('#sErr').textContent=IF.tr('e_mail');$('#sOk').hidden=true;return;}if(!$('#sKvkk').checked){$('#sErr').textContent=IF.tr('e_kvkk');$('#sOk').hidden=true;return;}$('#sErr').textContent='';IF_SEND({tur:'numune',urun:window.IF_CUR||$('#zTitle').textContent,kurum:$('#sOrg').value,adet:$('#sQty').value,eposta:sm,onay:1}).then(r=>{const ok=$('#sOk');ok.textContent=IF_OKTX('s_ok',r);ok.hidden=false;},()=>{$('#sErr').textContent=IF.tr('rq_fail');});});"""),
    ("""$('#mErr').textContent='';const ok=$('#mOk');ok.textContent=IF.tr('m_ok').replace('{e}',v);ok.hidden=false;""",
     """$('#mErr').textContent='';IF_SEND({tur:'belge',urun:window.IF_CUR||'',eposta:v,onay:1,bulten:$('#zNews').checked?1:0}).then(r=>{const ok=$('#mOk');ok.textContent=IF_OKTX('m_ok',r,v);ok.hidden=false;},()=>{$('#mErr').textContent=IF.tr('rq_fail');});"""),
    ("""CS.rqProd=$('#rqP').value;CS.rqDone='IF-2026-'+String(140+Math.floor(Math.random()*60)).padStart(4,'0');renderCat();const o=$('.rqok');if(o)o.scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'});});""",
     """CS.rqProd=$('#rqP').value;$('#rqE').textContent='';IF_SEND({tur:['numune','teklif','bilgi'][CS.rqT]||'bilgi',urun:CS.rqProd,kurum:$('#rqO').value,ad:$('#rqN').value,unvan:$('#rqR').value,tel:$('#rqTel').value,eposta:$('#rqM').value.trim(),adet:$('#rqQ').value,not:$('#rqMsg').value,onay:1}).then(r=>{CS.rqDone=r.ref+(r.demo?' · '+IF.tr('pv_note'):'');renderCat();const o=$('.rqok');if(o)o.scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'});},()=>{$('#rqE').textContent=IF.tr('rq_fail');});});"""),
    ("<span class=\"ty\">'+IF.tr('dt_'+DT.at(o.d[1]))+'</span>'", "<span class=\"ty\">'+IF.tr('dt_'+DT.at(o.d[1]))+'</span>'+(o.d[2]?'<a class=\"dl\" href=\"'+esc(o.d[2])+'\" target=\"_blank\" rel=\"noopener\">'+IF.tr('d_dl')+'</a>':'')"),
]
_ap = os.path.join(HERE, 'app.html'); _h = io.open(_ap, encoding='utf-8').read()
for _a, _b in _POST:
    if _h.count(_a) != 1: sys.exit('SON EK EŞLEŞMEDİ (' + str(_h.count(_a)) + '): ' + _a)
    _h = _h.replace(_a, _b)
exec(io.open(os.path.join(HERE, 'revize1.py'), encoding='utf-8').read()); _h = revize1(_h)
io.open(_ap, 'w', encoding='utf-8').write(_h)
print('app.html yazıldı', len(s), '|', '; '.join(LOG))
