#!/usr/bin/env python3
"""app.html'den depo köküne (sabit adres) sayfaları ve ortak dosyaları üretir. Kullanım: python3 build.py"""
import io, os, re, sys, shutil, hashlib, glob
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..')
NM = '/tmp/claude-0/-home-claude/06ad3418-85a2-578d-a5ea-e5e40f6a3e32/scratchpad/i18n/fonts/node_modules'
BASE = ''
s = io.open(os.path.join(HERE, 'app.html'), encoding='utf-8').read()

PAGES = [  # dosya, sayfa kimliği, ilk başlık (dil seçilince JS günceller)
 ('index.html', 'home', 'Intrafarma'),
 ('uzmanlik.html', 'uzmanlik', 'Uzmanlık · Intrafarma'),
 ('urunler.html', 'urunler', 'Ürünler · Intrafarma'),
 ('uretim.html', 'uretim', 'Üretim ve özel marka · Intrafarma'),
 ('bilim.html', 'bilim', 'Bilim · Intrafarma'),
 ('guncel.html', 'guncel', 'Güncel · Intrafarma'),
 ('iletisim.html', 'iletisim', 'İletişim · Intrafarma'),
 ('hakkimizda.html', 'hakkimizda', 'Hakkımızda · Intrafarma'),
]
def need(c, m):
    if not c: sys.exit('DERLEME HATASI: ' + m)

A = os.path.join(OUT, 'assets')
if os.path.isdir(A): shutil.rmtree(A)
os.makedirs(os.path.join(A, 'fonts')); os.makedirs(os.path.join(A, 'vendor', 'addons', 'environments'))
def W(rel, txt):
    p = os.path.join(A, rel); io.open(p, 'w', encoding='utf-8', newline='\n').write(txt)
    return hashlib.sha1(txt.encode()).hexdigest()[:8]

styles = re.findall(r'<style>(.*?)</style>', s, re.S); need(len(styles) == 1, 'stil sayısı %d' % len(styles))
h_css = W('app.css', styles[0])
sc = list(re.finditer(r'<script([^>]*)>(.*?)</script>', s, re.S)); need(len(sc) == 4, 'betik sayısı %d' % len(sc))
c1, c2, imap, mod = sc
need(c1.group(1) == '' and c2.group(1) == '' and 'importmap' in imap.group(1) and 'cellMod' in mod.group(1), 'betik sırası')
h_1 = W('app1.js', c1.group(2)); h_2 = W('app2.js', c2.group(2)); h_m = W('cell.js', mod.group(2))
need("'three'" in mod.group(2), 'modül three içe aktarımı')

head = s[:s.index('<body>')]
head = re.sub(r'<style>.*?</style>', '', head, flags=re.S)
need('<title>' in head or True, '')
head = re.sub(r'<title>.*?</title>', '', head, flags=re.S)
head = head.replace('<link rel="stylesheet" href="assets/fonts.css">', '')
need('fonts.googleapis' not in head, 'google fonts kaldı')
b0 = s.index('<body>') + len('<body>')
body = s[b0:c1.start()]
need('{{BASE}}media/' in body, 'medya yer tutucusu')
body = body.replace('{{BASE}}', BASE)
need('{{' not in body, 'çözülmemiş yer tutucu')
imap_txt = imap.group(0)
cellmod = '<script type="text/x-cell-module" id="cellMod" data-src="assets/cell.js?v=%s"></script>' % h_m

# fontlar yerel
FONTS = {'ibm-plex-mono': [400, 500], 'ibm-plex-sans': [400, 500, 600], 'ibm-plex-sans-arabic': [400, 500, 600, 700], 'schibsted-grotesk': [500, 600, 700, 800]}
fcss = []
for pkg, ws in FONTS.items():
    for w in ws:
        p = '%s/@fontsource/%s/%d.css' % (NM, pkg, w); need(os.path.exists(p), 'font ' + p)
        t = io.open(p, encoding='utf-8').read()
        t = re.sub(r",\s*url\(\./files/[^)]+\.woff\) format\('woff'\)", '', t)
        for f in set(re.findall(r'url\(\./files/([^)]+\.woff2)\)', t)):
            shutil.copy('%s/@fontsource/%s/files/%s' % (NM, pkg, f), os.path.join(A, 'fonts', f))
        fcss.append(t.replace('url(./files/', 'url(fonts/'))
h_f = W('fonts.css', re.sub(r'/\*.*?\*/\s*', '', '\n'.join(fcss), flags=re.S))
# three.js yerel
shutil.copy(NM + '/three/build/three.module.js', os.path.join(A, 'vendor', 'three.module.js'))
shutil.copy(NM + '/three/examples/jsm/environments/RoomEnvironment.js', os.path.join(A, 'vendor', 'addons', 'environments', 'RoomEnvironment.js'))
shutil.copy(NM + '/three/LICENSE', os.path.join(A, 'vendor', 'THREE-LICENSE.txt'))

for fn, pid, title in PAGES:
    h = re.sub(r'<html lang="tr"[^>]*>', '<html lang="tr" data-page="%s">' % pid, head, count=1)
    need('data-page="%s"' % pid in h, 'html etiketi')
    h = h.replace('</head>', '<title>%s</title>\n<link rel="stylesheet" href="assets/fonts.css?v=%s">\n<link rel="stylesheet" href="assets/app.css?v=%s">\n<script>window.IF_BASE=%r;</script>\n</head>' % (title, h_f, h_css, BASE))
    if '</head>' not in head:
        sys.exit('head kapanışı yok')
    html = (h + '<body>' + body +
            '<script src="assets/app1.js?v=%s"></script>\n<script src="assets/app2.js?v=%s"></script>\n' % (h_1, h_2) +
            imap_txt + '\n' + cellmod + '\n</body></html>\n')
    io.open(os.path.join(OUT, fn), 'w', encoding='utf-8', newline='\n').write(html)
tot = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(A) for f in fs)
print('v2 hazır: %d sayfa, %.1f MB, sayfa başına %.0f KB işaretleme' % (len(PAGES), tot / 1e6, len(body) / 1e3))

# eski /v2/ adresi sabit adrese yönlenir
os.makedirs(os.path.join(OUT, 'v2'), exist_ok=True)
for fn, _, _ in PAGES:
    io.open(os.path.join(OUT, 'v2', fn), 'w', encoding='utf-8').write('<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Intrafarma</title><script>location.replace("../%s"+location.search+location.hash)</script><a href="../%s">Intrafarma</a>\n' % (fn, fn))
