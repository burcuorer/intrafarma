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

W('style.css', """/*
Theme Name: Intrafarma 2026
Theme URI: https://test.intrafarma.com.tr
Author: Burcu Örer
Description: Intrafarma kurumsal site teması (v2). Ana sayfa, Uzmanlık, Ürünler, Üretim, Bilim, Güncel, İletişim ve Hakkımızda sayfalarıyla birlikte Sağlık çalışanları (Pro) alanını içerir. Fontlar ve three.js tema içinden sunulur.
Version: %s
Requires at least: 6.0
Requires PHP: 7.4
Text Domain: intrafarma
*/
.if-plain{margin:0;font-family:"IBM Plex Sans",system-ui,sans-serif;color:#10162e;background:#f6f8fb;line-height:1.65}
.if-plain-top{padding:20px clamp(18px,4vw,48px);border-bottom:1px solid rgba(16,22,46,.08);background:#fff}
.if-plain-top a{font-weight:700;font-size:18px;color:#104068;text-decoration:none}
.if-plain-main{max-width:760px;margin:0 auto;padding:clamp(32px,6vw,72px) clamp(18px,4vw,48px)}
.if-plain-main img{max-width:100%%;height:auto}
""" % VER)

slugs_php = ','.join("'%s'=>'%s'" % (k, v) for k, v in TITLES.items())
W('functions.php', r"""<?php
/**
 * Intrafarma 2026 teması. parts/ ve assets/ altındaki dosyalar v2src/build_wp.py ile üretilir; elle düzenlenmez.
 */
if (!defined('ABSPATH')) { exit; }
define('INTRAFARMA_VER', wp_get_theme()->get('Version'));
define('INTRAFARMA_PAGES', array(%s));

function intrafarma_uri() { return untrailingslashit(get_template_directory_uri()); }

/** Sayfa adresleri: varsa WordPress sayfasının bağlantısı, yoksa /slug/ */
function intrafarma_urls() {
    static $u = null; if ($u !== null) { return $u; }
    $u = array('home' => home_url('/'));
    foreach (INTRAFARMA_PAGES as $slug => $title) {
        $p = get_page_by_path($slug);
        $u[$slug] = $p ? get_permalink($p) : home_url('/' . $slug . '/');
    }
    return $u;
}

/** Bu istek hangi tasarım sayfası: 'home', slug ya da '' */
function intrafarma_view() {
    if (is_front_page()) { return 'home'; }
    foreach (array_keys(INTRAFARMA_PAGES) as $slug) { if (is_page($slug)) { return $slug; } }
    return '';
}

add_action('after_setup_theme', function () { add_theme_support('title-tag'); });

add_action('wp_enqueue_scripts', function () {
    $v = intrafarma_view(); $u = intrafarma_uri();
    wp_enqueue_style('intrafarma-fonts', $u . '/assets/fonts.css', array(), INTRAFARMA_VER);
    if ($v === '') { wp_enqueue_style('intrafarma-plain', get_stylesheet_uri(), array('intrafarma-fonts'), INTRAFARMA_VER); return; }
    wp_enqueue_style('intrafarma-app', $u . '/assets/app.css', array('intrafarma-fonts'), INTRAFARMA_VER);
    wp_enqueue_script('intrafarma-app1', $u . '/assets/app1.js', array(), INTRAFARMA_VER, true);
    wp_enqueue_script('intrafarma-app2', $u . '/assets/app2.js', array('intrafarma-app1'), INTRAFARMA_VER, true);
    wp_add_inline_script('intrafarma-app1', 'window.IF_BASE=' . wp_json_encode($u . '/') . ';window.IF_URLS=' . wp_json_encode(intrafarma_urls()) . ';', 'before');
}, 20);

/* Tasarım sayfalarında yalnızca tema dosyaları yüklenir; diğer eklentilerin stil ve betikleri tasarımı bozmasın */
add_action('wp_print_styles', function () {
    if (intrafarma_view() === '' || is_admin()) { return; }
    global $wp_styles;
    foreach ((array) $wp_styles->queue as $h) { if (strpos($h, 'intrafarma-') !== 0) { wp_dequeue_style($h); } }
}, 999);
add_action('wp_print_scripts', function () {
    if (intrafarma_view() === '' || is_admin()) { return; }
    global $wp_scripts;
    foreach ((array) $wp_scripts->queue as $h) { if (strpos($h, 'intrafarma-') !== 0) { wp_dequeue_script($h); } }
}, 999);
add_action('wp_print_footer_scripts', function () {
    if (intrafarma_view() === '') { return; }
    global $wp_scripts;
    foreach ((array) $wp_scripts->queue as $h) { if (strpos($h, 'intrafarma-') !== 0) { wp_dequeue_script($h); } }
}, 1);

/* Hücre modülü: three.js tema içinden, içe aktarma haritasıyla */
add_action('wp_footer', function () {
    if (intrafarma_view() === '') { return; }
    $u = intrafarma_uri();
    $map = array('imports' => array('three' => $u . '/assets/vendor/three.module.js', 'three/addons/' => $u . '/assets/vendor/addons/'));
    echo '<script type="importmap" data-no-optimize="1">' . wp_json_encode($map, JSON_UNESCAPED_SLASHES) . "</script>\n";
    echo '<script type="text/x-cell-module" id="cellMod" data-no-optimize="1" data-src="' . esc_url($u . '/assets/cell.js?v=' . INTRAFARMA_VER) . '"></script>' . "\n";
}, 99);

add_filter('script_loader_tag', function ($tag, $handle) {
    if (strpos($handle, 'intrafarma-') === 0) { $tag = str_replace('<script ', '<script data-no-optimize="1" data-no-minify="1" data-cfasync="false" ', $tag); }
    return $tag;
}, 10, 2);
foreach (array('rocket_exclude_js', 'rocket_exclude_defer_js', 'rocket_delay_js_exclusions', 'litespeed_optimize_js_excludes', 'litespeed_optm_js_defer_exc') as $intrafarma_f) {
    add_filter($intrafarma_f, function ($list) { $list = is_array($list) ? $list : array(); $list[] = 'themes/intrafarma-2026/assets/'; $list[] = 'cellMod'; return $list; });
}

add_filter('show_admin_bar', function ($show) { return is_admin() ? $show : false; });
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');

/* test adresinde arama motorlarına kapalı */
add_filter('wp_robots', function ($r) {
    $host = isset($_SERVER['HTTP_HOST']) ? strtolower($_SERVER['HTTP_HOST']) : '';
    if (strpos($host, 'test.') === 0 || strpos($host, 'localhost') === 0) { $r['noindex'] = true; $r['nofollow'] = true; }
    return $r;
});

/* tema etkinleşince eksik sayfalar oluşturulur (var olanlara dokunulmaz) */
add_action('after_switch_theme', function () {
    foreach (INTRAFARMA_PAGES as $slug => $title) {
        if (!get_page_by_path($slug)) {
            wp_insert_post(array('post_type' => 'page', 'post_status' => 'publish', 'post_title' => $title, 'post_name' => $slug));
        }
    }
});

/** Tasarım sayfasını basar */
function intrafarma_render($page) {
    $body = file_get_contents(get_template_directory() . '/parts/body.html');
    $u = intrafarma_urls();
    $body = str_replace('{{THEME}}', esc_url(intrafarma_uri()), $body);
    $body = preg_replace_callback('/\{\{U:([a-z]+)\}\}/', function ($m) use ($u) { return esc_url(isset($u[$m[1]]) ? $u[$m[1]] : home_url('/')); }, $body);
    ?><!doctype html>
<html lang="tr" data-page="<?php echo esc_attr($page); ?>">
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" type="image/png" href="<?php echo esc_url(intrafarma_uri() . '/assets/favicon.png'); ?>">
<?php wp_head(); ?>
</head>
<body>
<?php echo $body; ?>
<?php wp_footer(); ?>
</body>
</html>
<?php
}
""" % slugs_php)
W('front-page.php', "<?php if (!defined('ABSPATH')) { exit; } intrafarma_render('home');\n")
for slug in TITLES:
    W('page-%s.php' % slug, "<?php if (!defined('ABSPATH')) { exit; } intrafarma_render('%s');\n" % slug)
W('index.php', r"""<?php
/** Tasarımı olmayan sayfalar için sade görünüm */
if (!defined('ABSPATH')) { exit; }
?><!doctype html><html <?php language_attributes(); ?>><head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class('if-plain'); ?>>
<header class="if-plain-top"><a href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a></header>
<main class="if-plain-main">
<?php if (have_posts()) : while (have_posts()) : the_post(); ?><article><h1><?php the_title(); ?></h1><?php the_content(); ?></article><?php endwhile; endif; ?>
</main>
<?php wp_footer(); ?></body></html>
""")
tot = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(OUT) for f in fs)
print('tema %s hazır: %.1f MB, %d sayfa bağlantısı' % (VER, tot / 1e6, n))
