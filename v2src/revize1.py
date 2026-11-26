import io, os
# Revize 1 (19.11.2026): firmanın "Website örnekleri ve yorumları" belgesine göre yapı değişiklikleri.
# transform.py'nin sonunda, son eklerden sonra app.html metnine (_h) uygulanır. Eşleşmezse derleme durur.
import re as _re

def _r1(old, new, h, count=1):
    n = h.count(old)
    if n != count:
        raise SystemExit('REVİZE 1 EŞLEŞMEDİ (%d): %s' % (n, old[:90]))
    return h.replace(old, new)

def _rx(pat, new, h, flags=0):
    h2, n = _re.subn(pat, new, h, count=1, flags=flags)
    if n != 1:
        raise SystemExit('REVİZE 1 DESENİ EŞLEŞMEDİ: ' + pat[:90])
    return h2

def revize1(h):
    # ---------- 1) ürün grupları (10), uzmanlık alanları (6 + tüm alanlar), ürün listesi ----------
    AX = {
        'tr': ['Hücresel Tedaviler (Allojenik)', 'Kök Hücre ve Eksozom Ayrıştırma Kitleri (Otolog)', 'Hyaluronik Asitler', 'Genital Estetik Hyaluronik Asit Ürünleri', 'Kolajen Ürünleri', 'PRP Kitleri', 'Gıda Takviyeleri', 'Biodekontaminant Sistemleri', 'Hipsafe', 'Taşınabilir Ultrason Cihazı'],
        'en': ['Cellular Therapies (Allogeneic)', 'Stem Cell & Exosome Isolation Kits (Autologous)', 'Hyaluronic Acids', 'Genital Aesthetic Hyaluronic Acids', 'Collagen Products', 'PRP Kits', 'Food Supplements', 'Biodecontamination Systems', 'Hipsafe', 'Portable Ultrasound Device'],
        'ar': ['العلاجات الخلوية (خيفية)', 'مجموعات فصل الخلايا الجذعية والإكسوسومات (ذاتية)', 'أحماض الهيالورونيك', 'منتجات حمض الهيالورونيك للتجميل التناسلي', 'منتجات الكولاجين', 'مجموعات البلازما الغنية بالصفائح', 'المكملات الغذائية', 'أنظمة إزالة التلوث الحيوي', 'Hipsafe', 'جهاز الموجات فوق الصوتية المحمول'],
        'it': ['Terapie cellulari (allogeniche)', 'Kit di isolamento di cellule staminali ed esosomi (autologhi)', 'Acidi ialuronici', 'Acidi ialuronici per estetica genitale', 'Prodotti al collagene', 'Kit PRP', 'Integratori alimentari', 'Sistemi di biodecontaminazione', 'Hipsafe', 'Ecografo portatile'],
        'ru': ['Клеточная терапия (аллогенная)', 'Наборы для выделения стволовых клеток и экзосом (аутологичные)', 'Гиалуроновые кислоты', 'Гиалуроновая кислота для интимной эстетики', 'Коллагеновые продукты', 'Наборы PRP', 'Пищевые добавки', 'Системы биодеконтаминации', 'Hipsafe', 'Портативный УЗИ-аппарат'],
        'es': ['Terapias celulares (alogénicas)', 'Kits de aislamiento de células madre y exosomas (autólogos)', 'Ácidos hialurónicos', 'Ácidos hialurónicos para estética genital', 'Productos de colágeno', 'Kits de PRP', 'Complementos alimenticios', 'Sistemas de biodescontaminación', 'Hipsafe', 'Ecógrafo portátil'],
        'fr': ['Thérapies cellulaires (allogéniques)', 'Kits d’isolement de cellules souches et d’exosomes (autologues)', 'Acides hyaluroniques', 'Acides hyaluroniques pour l’esthétique génitale', 'Produits à base de collagène', 'Kits PRP', 'Compléments alimentaires', 'Systèmes de biodécontamination', 'Hipsafe', 'Échographe portable'],
    }
    CA = {
        'tr': ['Ortopedi ve Fiziksel Tıp', 'Üroloji ve Androloji', 'Kadın Hastalıkları ve Doğum', 'Nöroloji, Beyin ve Sinir Cerrahisi', 'Dermatoloji ve Medikal Estetik', 'Diğer Alanlar'],
        'en': ['Orthopaedics & Physical Medicine', 'Urology & Andrology', 'Obstetrics & Gynaecology', 'Neurology & Neurosurgery', 'Dermatology & Medical Aesthetics', 'Other Specialties'],
        'ar': ['جراحة العظام والطب الطبيعي', 'المسالك البولية وأمراض الذكورة', 'أمراض النساء والتوليد', 'الأعصاب وجراحة المخ والأعصاب', 'الأمراض الجلدية والتجميل الطبي', 'تخصصات أخرى'],
        'it': ['Ortopedia e medicina fisica', 'Urologia e andrologia', 'Ginecologia e ostetricia', 'Neurologia e neurochirurgia', 'Dermatologia e medicina estetica', 'Altre specialità'],
        'ru': ['Ортопедия и физическая медицина', 'Урология и андрология', 'Акушерство и гинекология', 'Неврология и нейрохирургия', 'Дерматология и медицинская эстетика', 'Другие направления'],
        'es': ['Traumatología y medicina física', 'Urología y andrología', 'Ginecología y obstetricia', 'Neurología y neurocirugía', 'Dermatología y medicina estética', 'Otras especialidades'],
        'fr': ['Orthopédie et médecine physique', 'Urologie et andrologie', 'Gynécologie et obstétrique', 'Neurologie et neurochirurgie', 'Dermatologie et médecine esthétique', 'Autres spécialités'],
    }
    import json as _j
    js = lambda v: _j.dumps(v, ensure_ascii=False)
    h = _rx(r"const AX=\{tr:\[.*?\]\};\nconst CA=\{tr:\[.*?\]\};\n.*?CA\.ro=\[[^\]]*\];",
            "const AX=%s;\nconst CA=%s;" % (js(AX), js(CA)), h, _re.S)
    # ürünler firmanın 19.11 listesinden (sıra belgedeki gibi). pr: ana sayfadaki premium kit bandı
    G = [
        ['Mezenkimal Kök Hücre', 'Vivexo', 'PEXT'],
        ['Lipocell-Mini + SVF', 'MILLIEXO', 'SW-ABMC'],
        ['Regenflex Starter', 'İnartro', 'Regenflex Bio-Plus', 'Synchro Forte', 'Hyanish', 'Regenflex T&M', 'Regenflex Kit', 'ArthroPlus Kit', 'PlusFlex Kit'],
        ['Chronohyal Volume', 'Chronohyal Time'],
        ['Biyoaktif Kolajen Peptitleri', 'Kolajen Membran', 'Kolajen Shot'],
        ['Seawon ACP', 'Intrakin', 'Easy PRP Kit', 'IF PRP Kit', 'Intranova PRP'],
        ['Osblass', 'Collpeak', 'IMAG', 'Atrofit', 'Nemact', 'Intra Type II'],
        ['Nuvohla', 'Wellisair'],
        ['Hipsafe'],
        ['Taşınabilir Ultrason Cihazı'],
    ]
    PREM = {'ArthroPlus Kit', 'Regenflex Kit', 'PlusFlex Kit'}
    rows = ','.join("[%s,%d%s]" % (js(n), a, ',1' if n in PREM else '') for a, g in enumerate(G) for n in g)
    # teknik detayı herkese açık gruplar: gıda takviyeleri, biodekontaminant, Hipsafe
    h = _rx(r"const AXCA=\[\[0,1,2\].*?\]\.map\(\(\[n,a\]\)=>\(\{n,a,open:a===3\}\)\);",
            "const AXCA=[[0,1,3,4],[0,3,4],[0],[2,4],[0,4,5],[0,1,2,4],[0,5],[5],[0],[0,5]],"
            "AXC=['#2F6E9E','#3FA9B0','#1F8F98','#8A7FB0','#7FB8A8','#4F8FC0','#6FA86A','#5A7FA6','#9A8A6E','#47788A'];\n"
            "const PRODS=[" + rows + "].map(([n,a,pr])=>({n,a,open:a>=6&&a<=8,pr:!!pr}));", h, _re.S)
    h = _rx(r"var AL=\[[^\]]*\];", "var AL=['ortopedi-fiziksel-tip','uroloji-androloji','kadin-hastaliklari-dogum','noroloji','dermatoloji-medikal-estetik','diger'];", h)
    h = _rx(r"var AXS=\[[^\]]*\];", "var AXS=['hucresel-tedaviler','ayristirma-kitleri','hyaluronik-asitler','genital-estetik','kolajen','prp-kitleri','gida-takviyeleri','biodekontaminant','hipsafe','tasinabilir-ultrason'];", h)
    h = _rx(r"const UA_IMG=\[[^\]]*\];", "const UA_IMG=['ortopedi','uroloji','kadin-sagligi','noroloji','estetik','diger'];", h)
    # simgeler: 4. alan nöroloji (beyin), 6. alan diğer (artı)
    m = _re.search(r"const UA_IC=\[(.*?)\];\n", h, _re.S)
    ic = _re.findall(r"'([^']*)'", m.group(1))
    if len(ic) != 6: raise SystemExit('UA_IC sayısı %d' % len(ic))
    ic[3] = '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>'
    ic[5] = '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'
    h = h[:m.start()] + "const UA_IC=[" + ','.join("'" + x + "'" for x in ic) + "];\n" + h[m.end():]
    # iki haneli sıra numarası (10 grup)
    h, n1 = _re.subn(r">0'\+\(([\w.]+)\+1\)", r">'+String(\1+1).padStart(2,'0')", h)
    h, n2 = _re.subn(r"'0'\+\(([\w.]+)\+1\)", r"String(\1+1).padStart(2,'0')", h)
    h = _r1("const SEC={uzmanlik:'urunler',urunler:'urunler',uretim:'uretim',hakkimizda:'kurumsal',bilim:'bilim',guncel:'kurumsal',iletisim:'iletisim'}",
            "const SEC={uzmanlik:'uzmanlik',urunler:'urunler',uretim:'uretim',hakkimizda:'kurumsal',bilim:'bilim',guncel:'kurumsal',iletisim:'iletisim'}", h)

    # ---------- 2) üst menü ----------
    a = h.index('<nav class="pub-nav" id="pubNav" aria-label="Menü">')
    b = h.index('<button type="button" class="nv-hcp" data-gate data-t="hcp"></button>', a)
    # Revize 2: mega menü. Her başlık tam genişlikte, yukarıdan açılan bir panel; alt öğeler görselli kart, altta "Tümünü Görüntüle".
    # Kart görselleri JS'te (v2c2.js → MG_IMG) atanır; görseli olmayan kart nötr yer tutucuyla görünür.
    ARW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>'
    def nv(sec, key, cards, allhref, gid=''):
        g = '<div class="mg-g"%s>%s</div>' % ((' id="%s"' % gid) if gid else '', cards)
        return ('<div class="nv nv-mg" data-sec="%s"><button type="button" class="nv-t" aria-expanded="false" data-t="%s"></button>'
                '<div class="nv-m"><div class="mg-in">%s<a class="mg-all" href="%s"><span data-t="mg_all"></span>%s</a></div></div></div>' % (sec, key, g, allhref, ARW))
    lk = lambda pairs: ''.join('<a class="mg-c" href="%s" data-mg="%s"><span class="mg-im" aria-hidden="true"></span><span class="mg-tx" data-t="%s"></span></a>' % (u, k, k) for u, k in pairs)
    menu = ('<nav class="pub-nav" id="pubNav" aria-label="Menü">\n        <a class="nv-home" href="index.html" data-t="pg_home"></a>\n        '
            + nv('kurumsal', 'n_kur', lk([('hakkimizda.html', 'nv_hak'), ('hakkimizda.html#vizyon', 'nv_viz'), ('hakkimizda.html#degerler', 'nv_deg'), ('hakkimizda.html#is-ortaklari', 'nav_ort'), ('hakkimizda.html#kalite', 'nv_kal'),
                                          ('guncel.html#basinda-biz', 'nv_bas'), ('guncel.html#haberler', 'nv_hab'), ('guncel.html#videolar', 'nv_vid')]), 'hakkimizda.html')
            + nv('uzmanlik', 'n_uzm', '', 'uzmanlik.html', 'nvUa')
            + nv('urunler', 'nav3', '', 'urunler.html', 'nvHp')
            + nv('bilim', 'n_bil', lk([('bilim.html#kurul', 'nav_kurul'), ('bilim.html#yayinlar', 'nv_yay'), ('bilim.html#sss', 'ft_sss')]), 'bilim.html')
            + nv('uretim', 'nav_ozel', lk([('uretim.html#gelistirme', 'nv_urg'), ('uretim.html#surec', 'nv_urs'), ('uretim.html#isbirligi', 'nv_isb')]), 'uretim.html')
            + '<a class="nv-a nv-ct" href="iletisim.html" data-sec="iletisim" data-t="nav5"></a>'
            + '<button type="button" class="nv-sr2" data-srch><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4.5 4.5"/></svg><span data-t="srch"></span></button>'
            + '\n        ')
    h = h[:a] + menu + h[b:]
    # arama düğmesi (masaüstünde dil seçicinin solunda, telefonda menü düğmesinin solunda)
    h = _r1('<button class="nv-burger" id="nvBurger"',
            '<button type="button" class="nv-srch" id="nvSrch" data-tl="srch"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4.5 4.5"/></svg></button>\n      <button class="nv-burger" id="nvBurger"', h)

    # ---------- 3) ana sayfa: premium kit bandı, danışma kurulu kesiti ----------
    # premium kitler ayrı bölüm değil: ürün portföyü bölümünün görselinde döner (v2c2.js)
    h = _r1('<section class="hs lbs band tint"',
            '<section class="hs kr" id="kurul-ozet" aria-labelledby="krH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="bk_ey"></p><h2 id="krH" data-t="kr_h"></h2><p data-t="kr_p"></p></div><div class="kr-g bk-g mk-bk" id="krG"></div><a class="hc-m kr-cta" href="bilim.html#kurul"><span data-t="kr_cta"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></a></section>\n    <section class="hs lbs band tint"', h)

    # ---------- 4) Pro: ürün kataloğu (yalnızca Pro alanında indirilir) ----------
    h = _r1('<div class="cards">', '<div class="kat-dl rv" style="--d:5" id="katDl"></div>\n          <div class="cards">', h)

    # ---------- 5) Kurumsal: vizyon ve misyon, değerler, kalite politikası ----------
    h = _r1('<section class="hs hk-val"',
            '<section class="hs hk-viz" id="vizyon" aria-labelledby="hkVizH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="hk_viz_ey"></p><h2 id="hkVizH" data-t="nv_viz"></h2></div><div class="hk-g2"><article data-rv="up"><h3 data-t="hk_vz"></h3><p data-t="hk_vzp"></p></article><article data-rv="up"><h3 data-t="hk_ms"></h3><p data-t="hk_msp"></p></article></div></section>\n    <section class="hs hk-val" id="degerler"', h)
    h = _r1('<section class="hs hk-pt" id="is-ortaklari"',
            '<section class="hs hk-kal" id="kalite" aria-labelledby="hkKalH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="hk_kal_ey"></p><h2 id="hkKalH" data-t="nv_kal"></h2></div><div class="hk-kal-b" data-rv="up"><p data-t="hk_kalp"></p><ul class="hk-kal-l"><li data-t="hk_k1"></li><li data-t="hk_k2"></li><li data-t="hk_k3"></li><li data-t="hk_k4"></li></ul></div><div class="hk-cert" data-rv="up"><h3 data-t="cert_h"></h3><div class="soon-g cert-g" aria-hidden="true"><div class="soon-c"><span class="soon-im"><em data-t="cert_c"></em></span><i></i><i class="s"></i></div><div class="soon-c"><span class="soon-im"><em data-t="cert_c"></em></span><i></i><i class="s"></i></div><div class="soon-c"><span class="soon-im"><em data-t="cert_c"></em></span><i></i><i class="s"></i></div><div class="soon-c"><span class="soon-im"><em data-t="cert_c"></em></span><i></i><i class="s"></i></div></div><p class="soon-n" data-t="cert_n"></p></div></section>\n    <section class="hs hk-pt" id="is-ortaklari"', h)

    # ---------- 6) Bilimsel platform: yazılar "Yayınlar" olarak Bilim sayfasına taşınır ----------
    a = h.index('<section class="hs bl" id="blog"'); b = h.index('</section>', a) + len('</section>')
    blog = h[a:b]; h = h[:a] + h[b:]
    h = _r1('<section class="hs fq" id="sss"', '<div id="yayinlar">' + blog + '</div>\n    <section class="hs fq" id="sss"', h)

    # ---------- 7) Medya: haberler, kongre ve etkinlikler, duyurular ----------
    PEND = lambda sid, cls, ey, hk, soon: '<section class="hs %s" id="%s" aria-labelledby="%sH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="%s"></p><h2 id="%sH" data-t="%s"></h2></div><p class="pend-card"><i aria-hidden="true"></i><span data-t="%s"></span></p></section>\n    ' % (cls, sid, cls, ey, cls, hk, soon)
    h = _r1('<section class="hs ev" id="etkinlikler"',
            PEND('basinda-biz', 'bs', 'bs_ey', 'nv_bas', 'bs_soon') + '<section class="hs hb" id="haberler" aria-labelledby="hbH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="hb_ey"></p><h2 id="hbH" data-t="nv_hab"></h2></div><p class="pend-card"><i aria-hidden="true"></i><span data-t="hb_soon"></span></p></section>\n    ' + PEND('videolar', 'vd', 'vd_ey', 'nv_vid', 'vd_soon') + '<section class="hs ev" id="etkinlikler"', h)
    a = h.index('<section class="hs ev" id="etkinlikler"'); b = h.index('</section>', a) + len('</section>')
    h = h[:b] + '\n    <section class="hs dy" id="duyurular" aria-labelledby="dyH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="dy_ey"></p><h2 id="dyH" data-t="nv_duy"></h2></div><p class="pend-card"><i aria-hidden="true"></i><span data-t="dy_soon"></span></p></section>' + h[b:]

    # ---------- 8) Özel üretim: bölüm bağlantıları ve iş birliği başvurusu ----------
    h = _r1('<div class="ur-g">', '<div class="ur-g" id="gelistirme">', h)
    h = _r1('<div class="ur-f">', '<div class="ur-f" id="surec">', h)
    a = h.index('<p class="ur-cap" data-t="lb_cap"></p>'); b = h.index('</section>', a)
    h = h[:b] + FORM('isbirligi', 'isb') + h[b:]

    # ---------- 9) İletişim: iletişim formu ve bayilik başvurusu ----------
    a = h.index('<div class="il-soc">'); b = h.index('</section>', a)
    h = h[:b] + FORM('form', 'ilf') + FORM('bayilik', 'bay') + AE() + h[b:]
    # ---------- 10) diller: TR · EN · ES · FR · AR · IT · RU (Romence çıkarıldı) ----------
    h = h.replace('<button type="button" data-lang="ro" lang="ro">RO</button>', '').replace('<option value="ro" lang="ro">RO</option>', '')
    h = h.replace('<button type="button" data-lang="en" lang="en">EN</button>', '<button type="button" data-lang="en" lang="en">EN</button><button type="button" data-lang="es" lang="es">ES</button><button type="button" data-lang="fr" lang="fr">FR</button>')
    h = h.replace('<option value="en" lang="en">EN</option>', '<option value="en" lang="en">EN</option><option value="es" lang="es">ES</option><option value="fr" lang="fr">FR</option>')
    if 'data-lang="ro"' in h or 'data-lang="fr"' not in h: raise SystemExit('dil düğmeleri')
    h = _r1("if(q&&T[q])return q;", "if(q&&T[q]&&q!=='ro')return q;", h)
    h = _r1("if(s&&T[s])return s;", "if(s&&T[s]&&s!=='ro')return s;", h)
    h = _rx(r'(<div><b>)05(</b><span data-t="s2"></span></div>\s*<div><b>)06(</b><span data-t="s3"></span></div>)', r'\g<1>10\g<2>07\g<3>', h)
    # üst menü 1100 px'e kadar açık kalır (eski 1180 kırılımındaki menü kuralları 1100'e iner)
    i = h.index('.nv-burger{display:grid;order:9}'); j = h.rfind('@media (max-width:1180px){', 0, i)
    if j < 0 or i - j > 400: raise SystemExit('eski menü kırılımı bulunamadı')
    h = h[:j] + '@media (max-width:1100px){' + h[j + len('@media (max-width:1180px){'):]
    # ---------- 11) Uzmanlık alanı sayfası: süreç, SSS ve tek son çağrı (Pro) ----------
    a = h.index('id="vAlan"'); a = h.index('<aside class="al-side">', a); b = h.index('</section>', a) + len('</section>')
    blk = ('<section class="hs hk-how band tint al-how" aria-labelledby="alHowH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="hk_how_ey"></p><h2 id="alHowH" data-t="hk_how_h"></h2></div>'
           '<ol class="hk-steps">' + ''.join('<li data-rv="up"><i>0%d</i><h3 data-t="hk_s%d"></h3><p data-t="hk_s%dp"></p></li>' % (i, i, i) for i in range(1, 5)) + '</ol></section>'
           '<section class="hs fq al-fq" aria-labelledby="alFqH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="fq_ey"></p><h2 id="alFqH" data-t="ft_sss"></h2></div><div class="fq-l">'
           + ''.join('<details><summary data-t="fq%d"></summary><p data-t="fq_a"></p></details>' % i for i in (1, 3, 4)) + '</div></section>'
           '<section class="hs al-end" aria-labelledby="alEndH"><div class="al-end-in" data-rv="up"><div><h2 id="alEndH" data-t="al_pro"></h2><p data-t="al_pro_p"></p></div>'
           '<button class="b-pri" type="button" data-gate><span data-t="cta1"></span><span class="o"></span></button></div></section>')
    h = h[:b] + blk + h[b:]
    # alan içindeki küçük Pro şeridi kalkar (tek son çağrı sayfanın sonunda)
    a = h.index('id="vAlan"'); x = h.index('<div class="al-pro">', a); y = h.index('</button></div>', x) + len('</button></div>')
    h = h[:x] + h[y:]
    # ---------- 12) KVKK aydınlatma metni ve çerez politikası (Intrafarma onayı: 19.11.2026, Hatice Korkmaz) ----------
    yas = io.open(os.path.join(HERE, 'yasal_tr.html'), encoding='utf-8').read()
    a = h.index('<div class="view" id="vUretim"')
    h = h[:a] + yas + '\n' + h[a:]
    return h

def AE():
    """Ürün güvenliği / yan etki: onaylı aydınlatma metnine göre sitede form yok; yalnızca e-posta ve telefon."""
    return ('<section class="if-fm ae" id="yan-etki" aria-labelledby="yanH"><div class="if-fm-h"><h2 id="yanH" data-t="yan_h"></h2><p data-t="yan_p2"></p></div>'
            '<div class="ae-ch"><a class="ae-c" href="tel:+902124385760"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg><span><small data-t="f_tel"></small><b>0 (212) 438 57 60</b></span></a>'
            '<a class="ae-c" href="mailto:info@intrafarma.com.tr?subject=%C3%9Cr%C3%BCn%20g%C3%BCvenli%C4%9Fi%20bildirimi"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><span><small data-t="rq_mail"></small><b>info@intrafarma.com.tr</b></span></a></div>'
            '<p class="ae-list" data-t="yan_bil"></p><p class="f-note" data-t="yan_note"></p></section>')

def FORM(anchor, k):
    """Talep formu: site → WordPress (Talepler) + e-posta. Ortak form sistemi: etiket üstte, zorunlu (*) / isteğe bağlı işareti, alan altında hata."""
    f = {
        'ilf': [('ad', 'f_ad', 'text', 1), ('kurum', 'f_kurum', 'text', 0), ('eposta', 'rq_mail', 'email', 1), ('tel', 'f_tel', 'tel', 0)],
        'bay': [('kurum', 'f_firma', 'text', 1), ('ad', 'f_ad', 'text', 1), ('eposta', 'rq_mail', 'email', 1), ('tel', 'f_tel', 'tel', 1)],
        'isb': [('kurum', 'f_firma', 'text', 1), ('ad', 'f_ad', 'text', 1), ('eposta', 'rq_mail', 'email', 1), ('tel', 'f_tel', 'tel', 0)],
        'yan': [('meslek', 'f_bildiren', 'sel-rol', 1), ('ad', 'f_ad', 'text', 1), ('eposta', 'rq_mail', 'email', 1), ('tel', 'f_tel', 'tel', 0), ('urun', 'f_urun', 'sel-urun', 1), ('lot', 'f_lot', 'text', 0), ('tarih', 'f_tarih', 'date', 0)],
    }[k]
    tur = {'ilf': 'bilgi', 'bay': 'bayilik', 'isb': 'isbirligi', 'yan': 'yanetki'}[k]
    ac = {'ad': 'name', 'eposta': 'email', 'tel': 'tel', 'kurum': 'organization', 'sehir': 'address-level2', 'web': 'url'}
    def fld(n, lab, t, req):
        nm = n if n != 'web' else 'site'
        mk = '<i class="rq" aria-hidden="true">*</i>' if req else '<i class="op" data-t="f_opt"></i>'
        rq = ' required aria-required="true"' if req else ''
        if t == 'sel-rol':
            ctl = '<select name="%s"%s><option value="" data-t="f_sec"></option>%s</select>' % (nm, rq, ''.join('<option value="%s" data-t="f_r%d"></option>' % (v, i) for i, v in enumerate(['hekim', 'eczaci', 'saglik', 'hasta', 'diger'], 1)))
        elif t == 'sel-urun':
            ctl = '<select name="%s" data-urun%s><option value="" data-t="f_sec"></option></select>' % (nm, rq)
        else:
            ctl = '<input name="%s" type="%s"%s%s%s>' % (nm, t, rq, (' autocomplete="%s"' % ac[n]) if n in ac else '', ' autocapitalize="off" spellcheck="false"' if t in ('email', 'url') else '')
        return '<label class="fld2"><span class="lb"><span data-t="%s"></span>%s</span>%s</label>' % (lab, mk, ctl)
    fl = ''.join(fld(*x) for x in f)
    ta_req = k == 'yan'
    ta = '<label class="fld2 full"><span class="lb"><span data-t="%s"></span>%s</span><textarea name="not" rows="4"%s></textarea></label>' % ('f_olay' if k == 'yan' else 'f_not', '<i class="rq" aria-hidden="true">*</i>' if ta_req else '<i class="op" data-t="f_opt"></i>', ' required aria-required="true"' if ta_req else '')
    note = '<p class="f-note full" data-t="yan_note"></p>' if k == 'yan' else ''
    return ('<section class="if-fm" id="%s" aria-labelledby="%sH"><div class="if-fm-h"><h2 id="%sH" data-t="%s_h"></h2><p data-t="%s_p"></p></div>'
            '<form class="if-fm-f" data-tur="%s" novalidate>%s%s%s'
            '<input name="web" type="text" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">'
            '<label class="chk full"><input type="checkbox" name="onay"><span data-t="rq_kvkk"></span></label><p class="f-pr full" data-t="f_pr"></p>'
            '<div class="full if-fm-a"><button class="b-pri" type="submit"><span data-t="f_send"></span><span class="o"></span></button><p class="if-fm-m" role="status"></p></div></form></section>'
            % (anchor, k, k, k, k, tur, fl, ta, note))
