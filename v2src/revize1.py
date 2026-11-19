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
        'tr': ['Hücresel tedaviler (allojenik)', 'Kök hücre ve eksozom ayrıştırma kitleri (otolog)', 'Hyaluronik asitler', 'Genital estetik hyaluronik asit ürünleri', 'Kolajen ürünleri', 'PRP kitleri', 'Gıda takviyeleri', 'Biodekontaminant sistemleri', 'Hipsafe', 'Taşınabilir ultrason cihazı'],
        'en': ['Cellular therapies (allogeneic)', 'Stem cell & exosome isolation kits (autologous)', 'Hyaluronic acids', 'Genital aesthetic hyaluronic acids', 'Collagen products', 'PRP kits', 'Food supplements', 'Biodecontamination systems', 'Hipsafe', 'Portable ultrasound device'],
        'ar': ['العلاجات الخلوية (خيفية)', 'مجموعات فصل الخلايا الجذعية والإكسوسومات (ذاتية)', 'أحماض الهيالورونيك', 'منتجات حمض الهيالورونيك للتجميل التناسلي', 'منتجات الكولاجين', 'مجموعات البلازما الغنية بالصفائح', 'المكملات الغذائية', 'أنظمة إزالة التلوث الحيوي', 'Hipsafe', 'جهاز الموجات فوق الصوتية المحمول'],
        'it': ['Terapie cellulari (allogeniche)', 'Kit di isolamento di cellule staminali ed esosomi (autologhi)', 'Acidi ialuronici', 'Acidi ialuronici per estetica genitale', 'Prodotti al collagene', 'Kit PRP', 'Integratori alimentari', 'Sistemi di biodecontaminazione', 'Hipsafe', 'Ecografo portatile'],
        'ru': ['Клеточная терапия (аллогенная)', 'Наборы для выделения стволовых клеток и экзосом (аутологичные)', 'Гиалуроновые кислоты', 'Гиалуроновая кислота для интимной эстетики', 'Коллагеновые продукты', 'Наборы PRP', 'Пищевые добавки', 'Системы биодеконтаминации', 'Hipsafe', 'Портативный УЗИ-аппарат'],
        'es': ['Terapias celulares (alogénicas)', 'Kits de aislamiento de células madre y exosomas (autólogos)', 'Ácidos hialurónicos', 'Ácidos hialurónicos para estética genital', 'Productos de colágeno', 'Kits de PRP', 'Complementos alimenticios', 'Sistemas de biodescontaminación', 'Hipsafe', 'Ecógrafo portátil'],
        'fr': ['Thérapies cellulaires (allogéniques)', 'Kits d’isolement de cellules souches et d’exosomes (autologues)', 'Acides hyaluroniques', 'Acides hyaluroniques pour l’esthétique génitale', 'Produits à base de collagène', 'Kits PRP', 'Compléments alimentaires', 'Systèmes de biodécontamination', 'Hipsafe', 'Échographe portable'],
    }
    CA = {
        'tr': ['Ortopedi ve fiziksel tıp', 'Üroloji ve androloji', 'Kadın hastalıkları ve doğum', 'Nöroloji, beyin ve sinir cerrahisi', 'Dermatoloji ve medikal estetik', 'Diğer alanlar'],
        'en': ['Orthopaedics & physical medicine', 'Urology & andrology', 'Obstetrics & gynaecology', 'Neurology & neurosurgery', 'Dermatology & medical aesthetics', 'Other specialties'],
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
    h = _rx(r"const UA_IMG=\[[^\]]*\];", "const UA_IMG=['ortopedi','uroloji','kadin-sagligi','','estetik',''];", h)
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
            "const SEC={uzmanlik:'uzmanlik',urunler:'urunler',uretim:'uretim',hakkimizda:'kurumsal',bilim:'bilim',guncel:'guncel',iletisim:'iletisim'}", h)

    # ---------- 2) üst menü ----------
    a = h.index('<nav class="pub-nav" id="pubNav" aria-label="Menü">')
    b = h.index('<button type="button" class="nv-hcp" data-gate data-t="hcp"></button>', a)
    nv = lambda sec, key, links, cls='nv': ('<div class="%s" data-sec="%s"><button type="button" class="nv-t" aria-expanded="false" data-t="%s"></button><div class="nv-m">%s</div></div>' % (cls, sec, key, links))
    lk = lambda pairs: ''.join('<a href="%s" data-t="%s"></a>' % p for p in pairs)
    menu = ('<nav class="pub-nav" id="pubNav" aria-label="Menü">\n        <a class="nv-home" href="index.html" data-t="pg_home"></a>\n        '
            + nv('kurumsal', 'n_kur', lk([('hakkimizda.html', 'nv_hak'), ('hakkimizda.html#vizyon', 'nv_viz'), ('hakkimizda.html#degerler', 'nv_deg'), ('hakkimizda.html#is-ortaklari', 'nav_ort'), ('hakkimizda.html#kalite', 'nv_kal')]))
            + nv('uzmanlik', 'n_uzm', '<div class="nv-l" id="nvUa"></div>')
            + nv('urunler', 'nav3', '<div class="nv-l nv-l2" id="nvHp"></div>', 'nv nv-2')
            + nv('bilim', 'n_bil', lk([('bilim.html', 'ov'), ('bilim.html#kurul', 'nav_kurul'), ('bilim.html#yayinlar', 'nv_yay'), ('bilim.html#sss', 'ft_sss')]))
            + nv('uretim', 'nav_ozel', lk([('uretim.html', 'ov'), ('uretim.html#gelistirme', 'nv_urg'), ('uretim.html#surec', 'nv_urs'), ('uretim.html#isbirligi', 'nv_isb')]))
            + nv('guncel', 'nav6', lk([('guncel.html#haberler', 'nv_hab'), ('guncel.html#etkinlikler', 'nv_kon'), ('guncel.html#duyurular', 'nv_duy')]))
            + nv('iletisim', 'nav5', lk([('iletisim.html', 'nv_ilb'), ('iletisim.html#form', 'nv_ilf'), ('iletisim.html#bayilik', 'nv_bay')]))
            + '<button type="button" class="nv-sr2" data-srch><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4.5 4.5"/></svg><span data-t="srch"></span></button>'
            + '\n        ')
    h = h[:a] + menu + h[b:]
    # arama düğmesi (masaüstünde dil seçicinin solunda, telefonda menü düğmesinin solunda)
    h = _r1('<button class="nv-burger" id="nvBurger"',
            '<button type="button" class="nv-srch" id="nvSrch" data-tl="srch"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4.5 4.5"/></svg></button>\n      <button class="nv-burger" id="nvBurger"', h)

    # ---------- 3) ana sayfa: premium kit bandı, danışma kurulu kesiti ----------
    h = _r1('<section class="hs ua" id="uzmanlik"',
            '<section class="hs kb band dark" id="premium" aria-labelledby="kbH"><div class="kb-in"><div class="kb-t" data-rv="rise"><p class="eyebrow" data-t="kb_ey"></p><h2 id="kbH" data-t="kb_h"></h2><p data-t="kb_p"></p><div class="kb-dots" id="kbDots" role="group"></div></div><div class="kb-s" id="kbS" aria-live="polite"></div></div></section>\n    <section class="hs ua" id="uzmanlik"', h)
    h = _r1('<section class="hs lbs band tint"',
            '<section class="hs kr" id="kurul-ozet" aria-labelledby="krH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="bk_ey"></p><h2 id="krH" data-t="kr_h"></h2><p data-t="kr_p"></p></div><div class="kr-g bk-g mk-bk" id="krG"></div><a class="hc-m kr-cta" href="bilim.html#kurul"><span data-t="kr_cta"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></a></section>\n    <section class="hs lbs band tint"', h)

    # ---------- 4) Pro: ürün kataloğu (yalnızca Pro alanında indirilir) ----------
    h = _r1('<div class="cards">', '<div class="kat-dl rv" style="--d:5" id="katDl"></div>\n          <div class="cards">', h)

    # ---------- 5) Kurumsal: vizyon ve misyon, değerler, kalite politikası ----------
    h = _r1('<section class="hs hk-val"',
            '<section class="hs hk-viz" id="vizyon" aria-labelledby="hkVizH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="hk_viz_ey"></p><h2 id="hkVizH" data-t="nv_viz"></h2></div><div class="hk-g2"><article data-rv="up"><h3 data-t="hk_vz"></h3><p data-t="hk_vzp"></p></article><article data-rv="up"><h3 data-t="hk_ms"></h3><p data-t="hk_msp"></p></article></div></section>\n    <section class="hs hk-val" id="degerler"', h)
    h = _r1('<section class="hs hk-pt" id="is-ortaklari"',
            '<section class="hs hk-kal" id="kalite" aria-labelledby="hkKalH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="hk_kal_ey"></p><h2 id="hkKalH" data-t="nv_kal"></h2></div><div class="hk-kal-b" data-rv="up"><p data-t="hk_kalp"></p><ul class="hk-kal-l"><li data-t="hk_k1"></li><li data-t="hk_k2"></li><li data-t="hk_k3"></li><li data-t="hk_k4"></li></ul></div></section>\n    <section class="hs hk-pt" id="is-ortaklari"', h)

    # ---------- 6) Bilimsel platform: yazılar "Yayınlar" olarak Bilim sayfasına taşınır ----------
    a = h.index('<section class="hs bl" id="blog"'); b = h.index('</section>', a) + len('</section>')
    blog = h[a:b]; h = h[:a] + h[b:]
    h = _r1('<section class="hs fq" id="sss"', '<div id="yayinlar">' + blog + '</div>\n    <section class="hs fq" id="sss"', h)

    # ---------- 7) Medya: haberler, kongre ve etkinlikler, duyurular ----------
    h = _r1('<section class="hs ev" id="etkinlikler"',
            '<section class="hs hb" id="haberler" aria-labelledby="hbH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="hb_ey"></p><h2 id="hbH" data-t="nv_hab"></h2></div><p class="pend-card"><i aria-hidden="true"></i><span data-t="hb_soon"></span></p></section>\n    <section class="hs ev" id="etkinlikler"', h)
    a = h.index('<section class="hs ev" id="etkinlikler"'); b = h.index('</section>', a) + len('</section>')
    h = h[:b] + '\n    <section class="hs dy" id="duyurular" aria-labelledby="dyH"><div class="hs-h" data-rv="rise"><p class="eyebrow" data-t="dy_ey"></p><h2 id="dyH" data-t="nv_duy"></h2></div><p class="pend-card"><i aria-hidden="true"></i><span data-t="dy_soon"></span></p></section>' + h[b:]

    # ---------- 8) Özel üretim: bölüm bağlantıları ve iş birliği başvurusu ----------
    h = _r1('<div class="ur-g">', '<div class="ur-g" id="gelistirme">', h)
    h = _r1('<div class="ur-f">', '<div class="ur-f" id="surec">', h)
    a = h.index('<p class="ur-cap" data-t="lb_cap"></p>'); b = h.index('</section>', a)
    h = h[:b] + FORM('isbirligi', 'isb') + h[b:]

    # ---------- 9) İletişim: iletişim formu ve bayilik başvurusu ----------
    a = h.index('<div class="il-soc">'); b = h.index('</section>', a)
    h = h[:b] + FORM('form', 'ilf') + FORM('bayilik', 'bay') + h[b:]
    # ---------- 10) diller: TR · EN · ES · FR · AR · IT · RU (Romence çıkarıldı) ----------
    h = h.replace('<button type="button" data-lang="ro" lang="ro">RO</button>', '').replace('<option value="ro" lang="ro">RO</option>', '')
    h = h.replace('<button type="button" data-lang="en" lang="en">EN</button>', '<button type="button" data-lang="en" lang="en">EN</button><button type="button" data-lang="es" lang="es">ES</button><button type="button" data-lang="fr" lang="fr">FR</button>')
    h = h.replace('<option value="en" lang="en">EN</option>', '<option value="en" lang="en">EN</option><option value="es" lang="es">ES</option><option value="fr" lang="fr">FR</option>')
    if 'data-lang="ro"' in h or 'data-lang="fr"' not in h: raise SystemExit('dil düğmeleri')
    h = _r1("if(q&&T[q])return q;", "if(q&&T[q]&&q!=='ro')return q;", h)
    h = _r1("if(s&&T[s])return s;", "if(s&&T[s]&&s!=='ro')return s;", h)
    h = _rx(r'(<div><b>)05(</b><span data-t="s2"></span></div>\s*<div><b>)06(</b><span data-t="s3"></span></div>)', r'\g<1>10\g<2>07\g<3>', h)
    return h

def FORM(anchor, k):
    """Talep formu: site → WordPress (Talepler) + e-posta. Alanlar dil anahtarlarıyla."""
    f = {
        'ilf': [('ad', 'f_ad', 'text', 1), ('eposta', 'rq_mail', 'email', 1), ('tel', 'f_tel', 'tel', 0), ('kurum', 'f_kurum', 'text', 0)],
        'bay': [('kurum', 'f_firma', 'text', 1), ('ad', 'f_ad', 'text', 1), ('sehir', 'f_sehir', 'text', 1), ('tel', 'f_tel', 'tel', 1), ('eposta', 'rq_mail', 'email', 1), ('web', 'f_webs', 'url', 0)],
        'isb': [('kurum', 'f_firma', 'text', 1), ('ad', 'f_ad', 'text', 1), ('eposta', 'rq_mail', 'email', 1), ('tel', 'f_tel', 'tel', 0)],
    }[k]
    tur = {'ilf': 'bilgi', 'bay': 'bayilik', 'isb': 'isbirligi'}[k]
    fl = ''.join('<label class="fld2"><span data-t="%s"></span><input name="%s" type="%s"%s></label>' % (lab, n if n != 'web' else 'site', t, ' required' if req else '') for n, lab, t, req in f)
    return ('<section class="if-fm" id="%s" aria-labelledby="%sH"><div class="if-fm-h"><h2 id="%sH" data-t="%s_h"></h2><p data-t="%s_p"></p></div>'
            '<form class="if-fm-f" data-tur="%s" novalidate>%s<label class="fld2 full"><span data-t="f_not"></span><textarea name="not" rows="4"></textarea></label>'
            '<input name="web" type="text" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">'
            '<label class="chk full"><input type="checkbox" name="onay"><span data-t="rq_kvkk"></span></label>'
            '<div class="full if-fm-a"><button class="b-pri" type="submit"><span data-t="f_send"></span><span class="o"></span></button><p class="if-fm-m" role="status"></p></div></form></section>'
            % (anchor, k, k, k, k, tur, fl))
