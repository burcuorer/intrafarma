#!/usr/bin/env python3
"""app.html'den WordPress teması (intrafarma-2026) üretir. Kullanım: python3 build_wp.py SURUM CIKTI_KLASORU"""
import io, os, re, sys, shutil, hashlib
HERE = os.path.dirname(os.path.abspath(__file__))
VER = sys.argv[1] if len(sys.argv) > 1 else '0.2.0'
DEST = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'dist')
SLUG = 'intrafarma-2026'
OUT = os.path.join(DEST, SLUG)
NM = '/tmp/claude-0/-home-claude/06ad3418-85a2-578d-a5ea-e5e40f6a3e32/scratchpad/i18n/fonts/node_modules'
PAGES = ['home', 'uzmanlik', 'urunler', 'uretim', 'bilim', 'guncel', 'iletisim', 'hakkimizda']
TITLES = {'uzmanlik': 'Uzmanlık', 'urunler': 'Ürünler', 'uretim': 'Üretim ve özel marka', 'bilim': 'Bilim', 'guncel': 'Güncel', 'iletisim': 'İletişim', 'hakkimizda': 'Hakkımızda'}
def need(c, m):
    if not c: sys.exit('TEMA HATASI: ' + m)
s = io.open(os.path.join(HERE, 'app.html'), encoding='utf-8').read()
if os.path.isdir(OUT): shutil.rmtree(OUT)
for d in ['assets/fonts', 'assets/vendor/addons/environments', 'parts']: os.makedirs(os.path.join(OUT, d))
def W(rel, txt):
    io.open(os.path.join(OUT, rel), 'w', encoding='utf-8', newline='\n').write(txt)

styles = re.findall(r'<style>(.*?)</style>', s, re.S); need(len(styles) == 1, 'stil')
W('assets/app.css', styles[0])
sc = list(re.finditer(r'<script([^>]*)>(.*?)</script>', s, re.S)); need(len(sc) == 4, 'betik')
c1, c2, imap, mod = sc
W('assets/app1.js', c1.group(2)); W('assets/app2.js', c2.group(2)); W('assets/cell.js', mod.group(2))
body = s[s.index('<body>') + 6:c1.start()]
body = body.replace('{{BASE}}', '{{THEME}}/')
n = 0
def link(m):
    global n; n += 1
    page = 'home' if m.group(1) == 'index' else m.group(1)
    need(page in PAGES, 'bilinmeyen sayfa ' + page)
    return 'href="{{U:%s}}%s"' % (page, m.group(2) or '')
body = re.sub(r'href="([a-z]+)\.html(#[\w-]+)?"', link, body)
need('.html"' not in body and '.html#' not in body, '.html bağlantısı kaldı')
need('<?' not in body, 'gövdede <?')
W('parts/body.html', body)
fav = re.search(r'<link rel="icon" type="image/png" href="(data:image/png;base64,[^"]+)">', s); need(fav, 'favicon')

# fontlar, three.js, medya
FONTS = {'ibm-plex-mono': [400, 500], 'ibm-plex-sans': [400, 500, 600], 'ibm-plex-sans-arabic': [400, 500, 600, 700], 'schibsted-grotesk': [500, 600, 700, 800]}
fcss = []
for pkg, ws in FONTS.items():
    for w in ws:
        t = io.open('%s/@fontsource/%s/%d.css' % (NM, pkg, w), encoding='utf-8').read()
        t = re.sub(r",\s*url\(\./files/[^)]+\.woff\) format\('woff'\)", '', t)
        for f in set(re.findall(r'url\(\./files/([^)]+\.woff2)\)', t)):
            shutil.copy('%s/@fontsource/%s/files/%s' % (NM, pkg, f), os.path.join(OUT, 'assets/fonts', f))
        fcss.append(t.replace('url(./files/', 'url(fonts/'))
W('assets/fonts.css', re.sub(r'/\*.*?\*/\s*', '', '\n'.join(fcss), flags=re.S))
shutil.copy(NM + '/three/build/three.module.js', os.path.join(OUT, 'assets/vendor/three.module.js'))
shutil.copy(NM + '/three/examples/jsm/environments/RoomEnvironment.js', os.path.join(OUT, 'assets/vendor/addons/environments/RoomEnvironment.js'))
shutil.copy(NM + '/three/LICENSE', os.path.join(OUT, 'assets/vendor/THREE-LICENSE.txt'))
shutil.copytree(os.path.join(HERE, '..', 'media'), os.path.join(OUT, 'media'))
import base64
open(os.path.join(OUT, 'assets', 'favicon.png'), 'wb').write(base64.b64decode(fav.group(1).split(',', 1)[1]))

# PHP, şablonlar ve panel dosyaları v2src/wp/ altında elle yazılır; burada kopyalanır
SRC = os.path.join(HERE, 'wp')
for d, _, fs in os.walk(SRC):
    for f in fs:
        rel = os.path.relpath(os.path.join(d, f), SRC)
        os.makedirs(os.path.dirname(os.path.join(OUT, rel)) or OUT, exist_ok=True)
        txt = io.open(os.path.join(d, f), encoding='utf-8').read()
        W(rel, txt.replace('__VER__', VER))
for slug in [p for p in PAGES if p != 'home']:
    W('page-%s.php' % slug, "<?php if (!defined('ABSPATH')) { exit; } intrafarma_render('%s');\n" % slug)
W('front-page.php', "<?php if (!defined('ABSPATH')) { exit; } intrafarma_render(intrafarma_view() !== '' ? intrafarma_view() : 'home');\n")
# panelin varsayılan içeriği: derlenmiş siteden dump_cms.js ile çıkarılır
CD = os.path.join(HERE, 'cms_defaults.json')
need(os.path.exists(CD) and os.path.getmtime(CD) >= os.path.getmtime(os.path.join(HERE, 'app.html')), 'cms_defaults.json eski: önce dump_cms.js çalıştır')
os.makedirs(os.path.join(OUT, 'data'), exist_ok=True)
shutil.copy(CD, os.path.join(OUT, 'data', 'varsayilan.json'))
for f in ['functions.php', 'sayfa.php', 'index.php', 'style.css', 'inc/icerik.php', 'inc/cerez.php', 'inc/yonlendirme.php', 'inc/admin.js', 'inc/admin.css']:
    need(os.path.exists(os.path.join(OUT, f)), 'eksik ' + f)
tot = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(OUT) for f in fs)
print('tema %s hazır: %.1f MB, %d sayfa bağlantısı' % (VER, tot / 1e6, n))
