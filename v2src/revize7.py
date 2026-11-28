import io, os, json, re
# Revize 7 (28.11.2026): firmanın "Website Çalışması 2" belgesi (yalnızca firmadan cevap beklemeyen maddeler).
# transform.py'nin sonunda, revize1'den sonra app.html metnine (_h) uygulanır. Eşleşmezse derleme durur.

def _r7(old, new, h, count=1):
    n = h.count(old)
    if n != count:
        raise SystemExit('REVİZE 7 EŞLEŞMEDİ (%d): %s' % (n, old[:100]))
    return h.replace(old, new)

def _x7(pat, new, h, flags=0, count=1):
    h2, n = re.subn(pat, new, h, flags=flags)
    if n != count:
        raise SystemExit('REVİZE 7 DESENİ EŞLEŞMEDİ (%d): %s' % (n, pat[:100]))
    return h2

_js = lambda v: json.dumps(v, ensure_ascii=False)

# ---------- 2) klinik alanlar: 8 alan, iki satırlı başlık (CA: ilk satır, CA2: ikinci satır) ----------
CA = {
    'tr': ['Ortopedi ve Travmatoloji', 'Nöroloji', 'Üroloji & Androloji', 'Kadın Doğum ve Üreme Sağlığı', 'Dermatoloji ve Medikal Estetik', 'Göğüs Hastalıkları', 'Oftalmoloji', 'Diğer'],
    'en': ['Orthopaedics & Traumatology', 'Neurology', 'Urology & Andrology', 'Obstetrics & Reproductive Health', 'Dermatology & Medical Aesthetics', 'Pulmonology', 'Ophthalmology', 'Other'],
    'es': ['Traumatología y Ortopedia', 'Neurología', 'Urología y Andrología', 'Obstetricia y Salud Reproductiva', 'Dermatología y Medicina Estética', 'Neumología', 'Oftalmología', 'Otras'],
    'fr': ['Orthopédie et Traumatologie', 'Neurologie', 'Urologie et Andrologie', 'Obstétrique et Santé Reproductive', 'Dermatologie et Médecine Esthétique', 'Pneumologie', 'Ophtalmologie', 'Autres'],
    'ar': ['جراحة العظام والرضوح', 'طب الأعصاب', 'المسالك البولية وأمراض الذكورة', 'التوليد والصحة الإنجابية', 'الأمراض الجلدية والتجميل الطبي', 'الأمراض الصدرية', 'طب العيون', 'أخرى'],
    'it': ['Ortopedia e Traumatologia', 'Neurologia', 'Urologia e Andrologia', 'Ostetricia e Salute Riproduttiva', 'Dermatologia e Medicina Estetica', 'Pneumologia', 'Oftalmologia', 'Altre'],
    'ru': ['Ортопедия и травматология', 'Неврология', 'Урология и андрология', 'Акушерство и репродуктивное здоровье', 'Дерматология и медицинская эстетика', 'Пульмонология', 'Офтальмология', 'Другие направления'],
}
CA2 = {
    'tr': ['Fizik Tedavi ve Rehabilitasyon', 'Beyin ve Sinir Cerrahisi', '', '', 'Plastik Cerrahi', '', '', 'Kardiyoloji, İç Hastalıkları, Kulak Burun Boğaz, Yara Bakımı, Veteriner Hekimlik'],
    'en': ['Physical Therapy & Rehabilitation', 'Neurosurgery', '', '', 'Plastic Surgery', '', '', 'Cardiology, Internal Medicine, ENT, Wound Care, Veterinary Medicine'],
    'es': ['Fisioterapia y Rehabilitación', 'Neurocirugía', '', '', 'Cirugía Plástica', '', '', 'Cardiología, Medicina Interna, Otorrinolaringología, Cuidado de Heridas, Medicina Veterinaria'],
    'fr': ['Médecine Physique et Réadaptation', 'Neurochirurgie', '', '', 'Chirurgie Plastique', '', '', 'Cardiologie, Médecine Interne, ORL, Soin des Plaies, Médecine Vétérinaire'],
    'ar': ['العلاج الطبيعي وإعادة التأهيل', 'جراحة المخ والأعصاب', '', '', 'الجراحة التجميلية', '', '', 'أمراض القلب، الطب الباطني، الأنف والأذن والحنجرة، العناية بالجروح، الطب البيطري'],
    'it': ['Medicina Fisica e Riabilitazione', 'Neurochirurgia', '', '', 'Chirurgia Plastica', '', '', 'Cardiologia, Medicina Interna, Otorinolaringoiatria, Cura delle Ferite, Medicina Veterinaria'],
    'ru': ['Физическая терапия и реабилитация', 'Нейрохирургия', '', '', 'Пластическая хирургия', '', '', 'Кардиология, терапия, оториноларингология, лечение ран, ветеринария'],
}
AL = ['ortopedi-fiziksel-tip', 'noroloji', 'uroloji-androloji', 'kadin-hastaliklari-dogum', 'dermatoloji-medikal-estetik', 'gogus-hastaliklari', 'oftalmoloji', 'diger']
# fotoğraflar: yeni iki alan ve Diğer (veteriner · at görseli gelecek) "görsel yakında" düzeniyle
UA_IMG = ['ortopedi', 'noroloji', 'uroloji', 'kadin-sagligi', 'estetik', None, None, None]

# ---------- 3) ürün grupları: 9 grup (Drive: 00 · Ürün Listesi) ----------
AX = {
    'tr': ['Allojenik Kök Hücre ve Eksozom Ürünleri', 'Otolog Kök Hücre ve Eksozom Kitleri', 'Hyaluronik Asitler', 'Kolajen Ürünleri', 'PRP Kitleri', 'Takviye Edici Gıdalar', 'Biyo-dekontaminasyon Sistemleri', 'Hipsafe', 'Taşınabilir Ultrason Cihazı'],
    'en': ['Allogeneic Stem Cell & Exosome Products', 'Autologous Stem Cell & Exosome Kits', 'Hyaluronic Acids', 'Collagen Products', 'PRP Kits', 'Food Supplements', 'Bio-Decontamination Systems', 'Hipsafe', 'Portable Ultrasound Device'],
    'es': ['Productos alogénicos de células madre y exosomas', 'Kits autólogos de células madre y exosomas', 'Ácidos hialurónicos', 'Productos de colágeno', 'Kits de PRP', 'Complementos alimenticios', 'Sistemas de biodescontaminación', 'Hipsafe', 'Ecógrafo portátil'],
    'fr': ["Produits allogéniques de cellules souches et d'exosomes", "Kits autologues de cellules souches et d'exosomes", 'Acides hyaluroniques', 'Produits à base de collagène', 'Kits PRP', 'Compléments alimentaires', 'Systèmes de biodécontamination', 'Hipsafe', 'Échographe portable'],
    'ar': ['منتجات الخلايا الجذعية والإكسوسومات الخيفية', 'مجموعات الخلايا الجذعية والإكسوسومات الذاتية', 'أحماض الهيالورونيك', 'منتجات الكولاجين', 'مجموعات البلازما الغنية بالصفائح', 'المكملات الغذائية', 'أنظمة إزالة التلوث الحيوي', 'Hipsafe', 'جهاز الموجات فوق الصوتية المحمول'],
    'it': ['Prodotti allogenici di cellule staminali ed esosomi', 'Kit autologhi di cellule staminali ed esosomi', 'Acidi ialuronici', 'Prodotti al collagene', 'Kit PRP', 'Integratori alimentari', 'Sistemi di biodecontaminazione', 'Hipsafe', 'Ecografo portatile'],
    'ru': ['Аллогенные продукты стволовых клеток и экзосом', 'Аутологичные наборы стволовых клеток и экзосом', 'Гиалуроновые кислоты', 'Коллагеновые продукты', 'Наборы PRP', 'Пищевые добавки', 'Системы биодеконтаминации', 'Hipsafe', 'Портативный УЗИ-аппарат'],
}
# adresler eski bağlantılar çalışsın diye korunur (genital-estetik → hyaluronik-asitler&alt=genital-estetik, v2c2.js)
AXS = ['hucresel-tedaviler', 'ayristirma-kitleri', 'hyaluronik-asitler', 'kolajen', 'prp-kitleri', 'gida-takviyeleri', 'biodekontaminant', 'hipsafe', 'tasinabilir-ultrason']
# grubun varsayılan klinik alanları (ürüne özel alan yoksa). Alan sırası: 0 ortopedi, 1 nöroloji, 2 üroloji, 3 kadın doğum, 4 dermatoloji, 5 göğüs, 6 oftalmoloji, 7 diğer
AXCA = [[0, 1, 2, 4], [0, 1, 4], [0], [0], [0, 2, 3, 4], [0, 7], [7], [0], [0, 7]]
AXC = ['#2F6E9E', '#3FA9B0', '#1F8F98', '#7FB8A8', '#4F8FC0', '#6FA86A', '#5A7FA6', '#9A8A6E', '#47788A']
# alt kategoriler: adres → [grup, metin anahtarı]
AXSUB = {'eksozom-formlari': [0, 'sub_eks'], 'kas-iskelet-sistemi': [2, 'sub_kas'], 'genital-estetik': [2, 'sub_gen']}
# ürünler (sıra listedeki gibi). s: alt kategori · ca: ürüne özel klinik alanlar · xa: ek grup · k: görsel anahtarı · pr: premium · gz: gizli
# Exonish Nazal → Göğüs Hastalıkları, Göz Damlası → Oftalmoloji: tabloda alan boştu; eşleştirme firma onayı bekliyor (sayfada not var)
E = 'eksozom-formlari'; K = 'kas-iskelet-sistemi'; G = 'genital-estetik'
PR = [
    ('Mezenkimal Kök Hücre', 0, {}),
    ('Vivexo · 5 milyar / 5 ml', 0, {'s': E}),
    ('Vivexo · 5 milyar / 2 ml', 0, {'s': E}),
    ('Exonish · 20 milyar / 5 ml', 0, {'s': E}),
    ('Exonish Nazal · 5 milyar / 5 ml', 0, {'s': E, 'ca': [5]}),
    ('Göz Damlası · 10 milyar / 5 ml', 0, {'s': E, 'ca': [6]}),
    ('PEXT', 0, {}),
    ('Lipocell Mini + SVF', 1, {}),
    ('SW-ABMC (BMAC)', 1, {'k': 'sw-abmc'}),
    ('Milliexo', 1, {}),
    ('Regenflex Starter', 2, {'s': K}),
    ('Inartro', 2, {'s': K}),
    ('Regenflex Bio-Plus', 2, {'s': K}),
    ('Regenflex T&M', 2, {'s': K}),
    ('Synchro Forte', 2, {'s': K}),
    ('Regenflex Kit', 2, {'s': K, 'pr': 1}),
    ('ArthroPlus Kit', 2, {'s': K, 'pr': 1}),
    ('PlusFlex Kit', 2, {'s': K, 'pr': 1}),
    ('Hyanish', 2, {'s': K, 'gz': 1}),
    ('Chronohyal Time', 2, {'s': G, 'ca': [3, 4]}),
    ('Chronohyal Volume', 2, {'s': G, 'ca': [3, 4]}),
    ('Arthrys 2 mg', 3, {'k': 'arthrys'}),
    ('Arthrys 5 mg', 3, {}),
    ('Arthrys Regain', 3, {}),
    ('Collygen Membran', 3, {'k': 'collygen', 'ca': [0, 4, 7]}),
    ('Collpeak', 5, {'xa': [3]}),
    ('Biyoaktif Kolajen Peptitleri', 3, {'gz': 1}),
    ('Kolajen Shot', 3, {'gz': 1}),
    ('Seawon ACP', 4, {}),
    ('Intrakin', 4, {}),
    ('Easy PRP', 4, {'k': 'easy-prp-kit'}),
    ('IF PRP Kit', 4, {}),
    ('Intranova PRP', 4, {}),
    ('Osblass', 5, {}),
    ('Imag', 5, {}),
    ('Atrofit', 5, {}),
    ('Nemact', 5, {}),
    ('Intra Type II', 5, {}),
    ('Wellisair', 6, {}),
    ('Nuvohla', 6, {}),
    ('Hipsafe', 7, {'k': 'hip-safe'}),
    ('Taşınabilir Ultrason Cihazı', 8, {}),
]
OPEN = (5, 6, 7)  # teknik detayı herkese açık gruplar: takviye edici gıdalar, biyo-dekontaminasyon, Hipsafe

UA_IC = [
    '<circle cx="12" cy="12" r="9"/><path d="M8 8.5c2 1 2 3 0 4M16 11.5c-2 1-2 3 0 4M9 12.5h6"/>',
    '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M5 9c4 1 10 1 14 0M5 15c4-1 10-1 14 0"/>',
    '<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z"/>',
    '<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>',
    '<path d="M12 3v8M12 11c-1 1.2-2.4 1.8-3.6 2M12 11c1 1.2 2.4 1.8 3.6 2"/><path d="M8.6 6.5C6 6.5 4 10.5 4 15.5c0 2.2 1.1 3.5 2.6 3.5 2 0 3.4-1.2 3.4-3.5V9.2c0-1.7-.5-2.7-1.4-2.7zM15.4 6.5C18 6.5 20 10.5 20 15.5c0 2.2-1.1 3.5-2.6 3.5-2 0-3.4-1.2-3.4-3.5V9.2c0-1.7.5-2.7 1.4-2.7z"/>',
    '<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="3"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
]


def revize7(h):
    # ---------- veri: gruplar, alanlar, ürünler ----------
    rows = []
    for n, a, o in PR:
        x = {'n': n, 'a': a}
        x.update(o)
        rows.append(x)
    data = ("const AX=%s;\nconst CA=%s;\nconst CA2=%s;\n" % (_js(AX), _js(CA), _js(CA2))
            + "const AXCA=%s,AXC=%s,AXSUB=%s;\n" % (_js(AXCA), _js(AXC), _js(AXSUB))
            + "const HIDDEN=[];\nconst PRODS=%s.map(r=>({...r,open:[%s].includes(r.a),pr:!!r.pr})).filter(p=>{if(p.gz){HIDDEN.push(p);return false;}return true;});"
            % (_js(rows), ','.join(map(str, OPEN))))
    h = _x7(r"const AX=\{\"tr\".*?\};\nconst CA=\{\"tr\".*?\};\nconst AXCA=.*?\.map\(\(\[n,a,pr\]\)=>\(\{n,a,open:a>=6&&a<=8,pr:!!pr\}\)\);", lambda m: data, h, re.S)
    # ürün başka bir grupta da görünebilir (Collpeak: Takviye Edici Gıdalar + Kolajen Ürünleri)
    h = _r7("window.IFD={AX,CA,PRODS,AXCA};",
            "window.IFD={AX,CA,CA2,PRODS,AXCA,AXSUB,HIDDEN};window.pIn=(p,ax)=>!!p&&(p.a===ax||(Array.isArray(p.xa)&&p.xa.includes(ax)));", h)
    h = _x7(r"var AL=\[[^\]]*\];", "var AL=%s;" % _js(AL).replace('"', "'"), h)
    h = _x7(r"var AXS=\[[^\]]*\];", "var AXS=%s;" % _js(AXS).replace('"', "'"), h)
    h = _x7(r"const UA_IMG=\[[^\]]*\];", "const UA_IMG=%s;" % _js(UA_IMG).replace('"', "'"), h)
    m = re.search(r"const UA_IC=\[(.*?)\];\n", h, re.S)
    h = h[:m.start()] + "const UA_IC=[" + ','.join("'" + x + "'" for x in UA_IC) + "];\n" + h[m.end():]
    # grup süzgeçleri ek grubu da sayar
    h = _r7("(CS.ax<0||p.a===CS.ax)", "(CS.ax<0||pIn(p,CS.ax))", h)
    h = _r7("const c=D.PRODS.filter(p=>p.a===i).length;", "const c=D.PRODS.filter(p=>pIn(p,i)).length;", h)
    h = _r7("if(!D.PRODS.some(p=>p.a===ax&&pCA(p).includes(alanI)))return;", "if(!D.PRODS.some(p=>pIn(p,ax)&&pCA(p).includes(alanI)))return;", h)
    h = _r7(".filter(o=>o.p.a===ax&&pCA(o.p).includes(alanI))", ".filter(o=>pIn(o.p,ax)&&pCA(o.p).includes(alanI))", h)
    h = _r7("(UC.ax<0||p.a===UC.ax)", "(UC.ax<0||pIn(p,UC.ax))&&(!UC.s||p.s===UC.s)", h)

    # ---------- 2) ana sayfa kartları: fotoğraf + ikon + iki satırlı başlık ----------
    h = _r7("""'<span class="ua-n">'+String(i+1).padStart(2,'0')+'</span><span class="ua-x"><b></b><i aria-hidden="true">→</i></span>';
  a.querySelector('b').textContent=n;""",
            """'<span class="ua-n">'+String(i+1).padStart(2,'0')+'</span><span class="ua-x"><svg class="ua-i" viewBox="0 0 24 24" aria-hidden="true">'+UA_IC[i]+'</svg><span class="ua-tt"><b></b><small></small></span><i aria-hidden="true">→</i></span>';
  a.querySelector('b').textContent=n;{const s2=((D.CA2||{})[L]||(D.CA2||{}).en||[])[i]||'',sm=a.querySelector('.ua-tt small');if(s2)sm.textContent=s2;else sm.remove();}""", h)
    # alan sayfası başlığı iki satır
    h = _r7(" $('#alH').textContent=CA[alanI];", " {const s2=((D.CA2||{})[L]||(D.CA2||{}).en||[])[alanI]||'',hh=$('#alH');hh.textContent=CA[alanI];if(s2){const sp=document.createElement('span');sp.className='al-h2';sp.textContent=s2;hh.appendChild(sp);}}", h)

    # ---------- 4) rakamlar: 15 · 20+ · ürün sayısı (otomatik) · 35+ · 200+ (WordPress: IF_CMS.orn.rakam) ----------
    h = _x7(r'<div><b data-n="6" data-pad="2">06</b><span data-t="st1"></span></div>\s*<div><b data-n="28">28</b><span data-t="st2"></span></div>\s*<div><b data-n="19">19</b><span data-t="st3"></span></div>\s*<div><b data-n="5">5</b><span data-t="st4"></span></div>\s*<div><b data-n="50" data-suf="\+">50\+</b><span data-t="st5"></span></div>',
            '<div><b data-n="15">15</b><span data-t="st1"></span></div>\n          <div><b data-n="20" data-suf="+">20+</b><span data-t="st2"></span></div>\n          <div><b data-n="39" data-auto="urun">39</b><span data-t="st3"></span></div>\n          <div><b data-n="35" data-suf="+">35+</b><span data-t="st4"></span></div>\n          <div><b data-n="200" data-suf="+">200+</b><span data-t="st5"></span></div>', h)
    h = _r7("if(_s[1]&&_P.length){_s[1].dataset.n=_P.length;_s[1].textContent=_P.length;}if(_s[2]&&_o.size){_s[2].dataset.n=_o.size;_s[2].textContent=_o.size;}}",
            "const _R=(window.IF_CMS&&IF_CMS.orn&&Array.isArray(IF_CMS.orn.rakam))?IF_CMS.orn.rakam:[];"
            "_s.forEach((b,i)=>{const r=_R[i]||{};let n=parseInt(r.n,10);if(isNaN(n)&&b.dataset.auto==='urun'&&_P.length)n=_P.length;if(!isNaN(n)){b.dataset.n=n;if(r.suf!==undefined)b.dataset.suf=r.suf;b.textContent=n+(b.dataset.suf||'');}});}", h)

    # ---------- 5) ana sayfa: Özel Üretim bandı ("Kendi markanızı birlikte üretelim" yerine) ----------
    a = h.index('<section class="hs lbs band tint" aria-labelledby="lbH">'); b = h.index('</section>', a) + len('</section>')
    h = h[:a] + ('<section class="hs pl" id="ozel-uretim" aria-labelledby="plH"><div class="pl-in" data-rv="rise">'
                 '<p class="pl-ey" data-t="pl_ey"></p><h2 id="plH"><span data-t="pl_h1"></span> <em data-t="pl_h2"></em></h2>'
                 '<p class="pl-p" data-t="pl_p"></p>'
                 '<a class="pl-cta" href="uretim.html#isbirligi"><span data-t="pl_cta"></span><i aria-hidden="true">→</i></a></div></section>') + h[b:]

    # ---------- 6) açılış slaytları: premium kit karesi (sloganlı) ----------
    h = _r7('<video class="vh-v" muted playsinline preload="none" poster="{{BASE}}media/hero-urun.jpg" data-cap="v_cap4"><source src="{{BASE}}media/hero-urun.mp4" type="video/mp4"></video>',
            '<video class="vh-v" muted playsinline preload="none" poster="{{BASE}}media/hero-urun.jpg" data-cap="v_cap4"><source src="{{BASE}}media/hero-urun.mp4" type="video/mp4"></video>\n'
            '        <video class="vh-v" muted playsinline preload="none" poster="{{BASE}}media/video/premium-poster.jpg" data-cap="v_cap5" data-lv="premium" data-copy="kit"><source src="{{BASE}}media/video/premium-loop.mp4" type="video/mp4"></video>', h)
    a = h.index('<div class="vh-copy">'); b = h.index('<p class="vh-cap"', a)
    h = h[:b] + ('<div class="vh-copy vh-kit" aria-hidden="true"><p class="eyebrow" data-t="vk_ey"></p><p class="big vk-h" data-t="kb_slogan"></p><p class="lede" data-t="vk_p"></p>'
                 '<div class="btns"><a class="b-pri" href="urunler.html?eksen=hyaluronik-asitler&amp;alt=kas-iskelet-sistemi" tabindex="-1"><span data-t="vk_cta"></span><span class="o"></span></a></div></div>\n      ') + h[b:]
    h = _r7('<b id="vhNum">01 / 04</b>', '<b id="vhNum">01 / 05</b>', h)

    # ---------- 8) numune ve fiyat teklifi talebi kalkar; belge ve bilgi talebi kalır ----------
    h = _x7(r'\s*<button class="card rv" style="--d:7" type="button" data-k="k3t">.*?</button>', '', h, re.S)
    h = _r7('<button class="card rv" style="--d:8" type="button" data-k="k4t">', '<button class="card rv" style="--d:7" type="button" data-k="k4t">', h)
    h = _r7('<button type="button" data-tab="3" data-t="tab4"></button>', '', h)
    h = _x7(r'\s*<div class="tpane" data-pane="3" hidden>\s*<form class="sform" id="sForm".*?</form>\s*</div>', '', h, re.S)
    h = _r7("$('#sOrg').addEventListener('input',", "if($('#sForm'))$('#sOrg').addEventListener('input',", h)
    h = _r7("$('#sForm').addEventListener('submit',", "($('#sForm')||document.createElement('form')).addEventListener('submit',", h)
    h = _x7(r"""'<div class="full fld2"><span>'\+IF\.tr\('rq_type'\)\+'</span><div class="rqt" role="group">'.*?</div></div>'\+\n""", '', h, re.S)
    h = _x7(r"""\s*'<label class="fld2" for="rqQ">.*?</select></label>'\+""", '', h, re.S)
    h = _r7("""'<label class="fld2" for="rqM">""", """'<label class="fld2 full" for="rqM">""", h)
    h = _r7("tur:['numune','teklif','bilgi'][CS.rqT]||'bilgi',", "tur:'bilgi',", h)
    h = _r7("adet:$('#rqQ').value,", "", h)
    h = _x7(r'\s*<details><summary data-t="fq3"></summary><p data-t="fq_a"></p></details>', '', h, count=1)
    if 'data-t="fq3"' in h or 'data-tab="3"' in h:
        raise SystemExit('REVİZE 7: numune kalıntısı')
    return h
