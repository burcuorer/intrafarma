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
    wp_add_inline_script('intrafarma-app1', 'window.IF_BASE=' . wp_json_encode($u . '/') . ';window.IF_URLS=' . wp_json_encode(intrafarma_urls()) . ';window.IF_CK=' . wp_json_encode(intrafarma_ck_config(), JSON_UNESCAPED_SLASHES) . ';', 'before');
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

/* ===================== Çerez onayı =====================
 * Ayarlar: Görünüm → Özelleştir → "Intrafarma · Çerezler"
 * Google etiketleri yalnızca "Canlı alan adları"nda ve ziyaretçi izin verdikten sonra yüklenir.
 * Onay kayıtları: Araçlar → Çerez onayları (IP adresi tutulmaz).
 */
function intrafarma_ck_opt($k) {
    $d = array('ga' => 'G-DNHVY79BSW', 'ads' => '', 'live' => 'intrafarma.com.tr, www.intrafarma.com.tr', 'policy' => '');
    $v = get_theme_mod('intrafarma_ck_' . $k, $d[$k]);
    return is_string($v) ? trim($v) : $d[$k];
}
function intrafarma_ck_config() {
    $nec = array();
    if (function_exists('pll_current_language')) { $nec[] = array('pll_language', 'Intrafarma (Polylang)', 'ck_m13'); }
    return array(
        'ga' => preg_match('/^G-[A-Z0-9]+$/', intrafarma_ck_opt('ga')) ? intrafarma_ck_opt('ga') : '',
        'ads' => preg_match('/^AW-[0-9]+$/', intrafarma_ck_opt('ads')) ? intrafarma_ck_opt('ads') : '',
        'live' => array_values(array_filter(array_map('trim', explode(',', strtolower(intrafarma_ck_opt('live')))))),
        'log' => esc_url_raw(rest_url('intrafarma/v1/consent')),
        'policy' => esc_url_raw(intrafarma_ck_opt('policy')),
        'nec' => $nec,
    );
}
add_action('customize_register', function ($wpc) {
    $wpc->add_section('intrafarma_ck', array('title' => 'Intrafarma · Çerezler', 'priority' => 160,
        'description' => 'Google etiketleri yalnızca aşağıdaki canlı alan adlarında ve ziyaretçi izin verdikten sonra yüklenir. Test adresinde bant çalışır, etiket yüklenmez.'));
    $f = array(
        'ga' => array('Google Analytics ölçüm kimliği', 'G-XXXXXXXXXX'),
        'ads' => array('Google Ads etiket kimliği (boş bırakılırsa Pazarlama kategorisi görünmez)', 'AW-1234567890'),
        'live' => array('Canlı alan adları (virgülle)', 'intrafarma.com.tr, www.intrafarma.com.tr'),
        'policy' => array('Çerez politikası sayfası adresi (isteğe bağlı)', 'https://'),
    );
    foreach ($f as $k => $l) {
        $wpc->add_setting('intrafarma_ck_' . $k, array('default' => intrafarma_ck_opt($k), 'sanitize_callback' => 'sanitize_text_field'));
        $wpc->add_control('intrafarma_ck_' . $k, array('section' => 'intrafarma_ck', 'label' => $l[0], 'type' => 'text', 'input_attrs' => array('placeholder' => $l[1])));
    }
});

/* onay kaydı tablosu */
function intrafarma_ck_table() { global $wpdb; return $wpdb->prefix . 'intrafarma_consent'; }
function intrafarma_ck_install() {
    global $wpdb; require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta('CREATE TABLE ' . intrafarma_ck_table() . " (
 id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 consent_id varchar(40) NOT NULL,
 choices varchar(80) NOT NULL,
 source varchar(10) NOT NULL DEFAULT '',
 lang varchar(5) NOT NULL DEFAULT '',
 page varchar(190) NOT NULL DEFAULT '',
 created datetime NOT NULL,
 PRIMARY KEY  (id),
 KEY consent_id (consent_id),
 KEY created (created)
) " . $wpdb->get_charset_collate() . ';');
    update_option('intrafarma_ck_db', '1');
}
add_action('after_switch_theme', 'intrafarma_ck_install');
add_action('init', function () { if (get_option('intrafarma_ck_db') !== '1') { intrafarma_ck_install(); } });

add_action('rest_api_init', function () {
    register_rest_route('intrafarma/v1', '/consent', array('methods' => 'POST', 'permission_callback' => '__return_true', 'callback' => function ($req) {
        global $wpdb;
        $id = substr(preg_replace('/[^a-zA-Z0-9-]/', '', (string) $req->get_param('id')), 0, 40);
        $c = $req->get_param('c');
        if ($id === '' || !is_array($c)) { return new WP_Error('bad', 'bad', array('status' => 400)); }
        $out = array();
        foreach (array('an', 'mk', 'md') as $k) { if (isset($c[$k])) { $out[] = $k . '=' . ($c[$k] ? 1 : 0); } }
        $wpdb->insert(intrafarma_ck_table(), array(
            'consent_id' => $id, 'choices' => implode(' ', $out),
            'source' => substr(preg_replace('/[^a-z]/', '', (string) $req->get_param('src')), 0, 10),
            'lang' => substr(preg_replace('/[^a-z]/', '', (string) $req->get_param('lang')), 0, 5),
            'page' => substr(sanitize_text_field((string) $req->get_param('page')), 0, 190),
            'created' => current_time('mysql', true),
        ));
        return array('ok' => true);
    }));
});

add_action('admin_menu', function () {
    add_management_page('Çerez onayları', 'Çerez onayları', 'manage_options', 'intrafarma-ck', function () {
        global $wpdb; $t = intrafarma_ck_table();
        $rows = $wpdb->get_results("SELECT consent_id, choices, source, lang, page, created FROM $t ORDER BY id DESC LIMIT 200");
        $n = (int) $wpdb->get_var("SELECT COUNT(*) FROM $t");
        echo '<div class="wrap"><h1>Çerez onayları</h1><p>Toplam kayıt: ' . $n . '. Her kayıt, ziyaretçinin çerez seçimini ve zamanını gösterir (UTC). IP adresi tutulmaz. an = analitik, mk = pazarlama, md = medya; 1 = izin verdi, 0 = reddetti.</p>';
        echo '<p><a class="button" href="' . esc_url(wp_nonce_url(admin_url('admin-post.php?action=intrafarma_ck_csv'), 'intrafarma_ck_csv')) . '">Tümünü CSV olarak indir</a></p>';
        echo '<table class="widefat striped"><thead><tr><th>Zaman (UTC)</th><th>Onay kimliği</th><th>Seçim</th><th>Nasıl</th><th>Dil</th><th>Sayfa</th></tr></thead><tbody>';
        foreach ($rows as $r) { echo '<tr><td>' . esc_html($r->created) . '</td><td><code>' . esc_html($r->consent_id) . '</code></td><td>' . esc_html($r->choices) . '</td><td>' . esc_html($r->source) . '</td><td>' . esc_html($r->lang) . '</td><td>' . esc_html($r->page) . '</td></tr>'; }
        echo '</tbody></table></div>';
    });
});
add_action('admin_post_intrafarma_ck_csv', function () {
    if (!current_user_can('manage_options') || !check_admin_referer('intrafarma_ck_csv')) { wp_die('Yetki yok'); }
    global $wpdb; $t = intrafarma_ck_table();
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=cerez-onaylari.csv');
    $o = fopen('php://output', 'w'); fputcsv($o, array('created_utc', 'consent_id', 'choices', 'source', 'lang', 'page'));
    foreach ($wpdb->get_results("SELECT created, consent_id, choices, source, lang, page FROM $t ORDER BY id", ARRAY_N) as $r) { fputcsv($o, $r); }
    exit;
});

/* onaysız Google etiketi basan eklenti açıksa yöneticiyi uyar */
add_action('admin_notices', function () {
    if (!current_user_can('activate_plugins')) { return; }
    include_once ABSPATH . 'wp-admin/includes/plugin.php';
    if (is_plugin_active('ga-google-analytics/ga-google-analytics.php')) {
        echo '<div class="notice notice-warning"><p><b>Intrafarma teması:</b> "GA Google Analytics" eklentisi açık. Bu eklenti Google Analytics kodunu ziyaretçi onayı olmadan ekler ve her ziyareti iki kez saydırır. Tema bunu çerez bandının arkasında zaten yüklüyor; lütfen eklentiyi etkisizleştirin.</p></div>';
    }
});

/* ===================== Eski sayfaları yeni tasarıma yönlendirme =====================
 * Eski temadan kalan sayfalar (Ürünlerimiz, /project/..., kategori sayfaları, İş Ortaklarımız...) silinmez;
 * ziyaretçi bu adreslere gelirse yeni tasarımdaki karşılığına gönderilir.
 * Ayar: Görünüm → Özelleştir → "Intrafarma · Yönlendirme". Yönetici eski sayfayı görmek isterse adrese ?eski=1 ekler.
 */
add_action('customize_register', function ($wpc) {
    $wpc->add_section('intrafarma_rd', array('title' => 'Intrafarma · Yönlendirme', 'priority' => 161,
        'description' => 'Eski temadan kalan sayfalara gelen ziyaretçiler yeni tasarımdaki karşılık gelen sayfaya gönderilir. Eski içerik silinmez. Yönetici olarak eski bir sayfayı görmek için adresin sonuna ?eski=1 ekleyin.'));
    $wpc->add_setting('intrafarma_rd_on', array('default' => 1, 'sanitize_callback' => 'absint'));
    $wpc->add_control('intrafarma_rd_on', array('section' => 'intrafarma_rd', 'type' => 'checkbox', 'label' => 'Eski sayfaları yeni tasarıma yönlendir'));
    $wpc->add_setting('intrafarma_rd_301', array('default' => 0, 'sanitize_callback' => 'absint'));
    $wpc->add_control('intrafarma_rd_301', array('section' => 'intrafarma_rd', 'type' => 'checkbox', 'label' => 'Kalıcı yönlendirme (301) — yalnızca canlı yayın günü açın; testte geçici (302) kalsın'));
});

function intrafarma_old_target() {
    $U = intrafarma_urls();
    $q = function ($base, $args) { return add_query_arg($args, $base); };
    $path = trim(strtolower(rawurldecode((string) wp_parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH))), '/');
    $path = preg_replace('#^index\.php/?#', '', $path);
    $seg = $path === '' ? array() : explode('/', $path);

    // dil: /language/en/... → ana sayfa, İngilizce
    if (isset($seg[0], $seg[1]) && $seg[0] === 'language' && preg_match('/^(en|ar|it|ru|ro|tr)$/', $seg[1])) { return $q($U['home'], array('lang' => $seg[1])); }

    // tek ürün: /project/<slug>/
    $prod = array('regenflex-kit-3' => 'regenflex-kit', 'regenflex-tm' => 'regenflex-t-m', 'eksozom-3' => 'eksozom', 'lipocell' => 'lipocell-mini', 'collygen-2' => 'collygen');
    $known = array('regenflex-bio-plus','regenflex-starter','regenflex-kit','regenflex-t-m','inartro','easy-prp-kit','intra-prp','well-prp','eksozom','mezenkimal-kok-hucre','kondroblast','kondromembran','amniongraft','milliexo','lipocell-mini','milligraft','sw-abmc','osblass-sase','atrofit','nemact','intra-type-ii','collygen','konted-us','hip-safe','arthrys-regain','arthrys','innprost','innpeak');
    $slug = '';
    if (is_singular('project') || (isset($seg[0]) && $seg[0] === 'project' && isset($seg[1]))) {
        $slug = is_singular('project') ? get_post_field('post_name', get_queried_object_id()) : $seg[1];
        $slug = isset($prod[$slug]) ? $prod[$slug] : $slug;
        return in_array($slug, $known, true) ? $q($U['urunler'], array('urun' => $slug)) : $U['urunler'];
    }

    // ürün kategorileri (eski portföy filtreleri) → eksen ya da klinik alan
    $term = '';
    if (is_tax() || is_category()) { $o = get_queried_object(); $term = $o && isset($o->slug) ? $o->slug : ''; }
    elseif (count($seg) >= 2 && preg_match('/(categor|kategori|portfolio|project_|project-)/', $seg[0])) { $term = end($seg); }
    if ($term !== '') {
        $map = array('hucresel' => array('eksen' => 'hucresel-tedaviler'), 'ortobiyolojik' => array('eksen' => 'ortobiyolojikler'),
            'biyoaktif' => array('eksen' => 'biyoaktif-beslenme'), 'gida' => array('eksen' => 'biyoaktif-beslenme'), 'kolajen' => array('eksen' => 'biyoaktif-beslenme'),
            'rejeneratif' => array('eksen' => 'rejeneratif-teknolojiler'), 'ayristirma' => array('eksen' => 'rejeneratif-teknolojiler'),
            'kadin' => array('alan' => 'kadin-sagligi'), 'ortopedi' => array('alan' => 'ortopedi'), 'travmatoloji' => array('alan' => 'ortopedi'),
            'uroloji' => array('alan' => 'uroloji'), 'veteriner' => array('alan' => 'veteriner'), 'estetik' => array('alan' => 'estetik'), 'spor' => array('alan' => 'spor-hekimligi'));
        foreach ($map as $k => $a) { if (strpos($term, $k) !== false) { return $q($U['urunler'], $a); } }
        return $U['urunler'];
    }

    // bilinen eski sayfalar
    $pages = array('urunlerimiz' => $U['urunler'], 'e-katalog' => $U['urunler'], 'urunler-2' => $U['urunler'],
        'is-ortaklarimiz' => $U['hakkimizda'] . '#is-ortaklari', 'kurumsal' => $U['hakkimizda'],
        'insan-kaynaklari' => $U['iletisim'], 'kariyer' => $U['iletisim'], 'e-bulten' => $U['guncel'], 'haberler' => $U['guncel'], 'blog' => $U['guncel'],
        'homepage' => $U['home'], 'anasayfa' => $U['home']);
    if (is_page()) { $pn = get_post_field('post_name', get_queried_object_id()); if (isset($pages[$pn])) { return $pages[$pn]; } }
    if (isset($seg[0]) && isset($pages[$seg[0]])) { return $pages[$seg[0]]; }
    if (isset($_GET['page_id']) && (int) $_GET['page_id'] === 8008) { return $U['urunler']; }
    if (is_singular('post') || is_home() || is_archive()) { return $U['guncel']; }
    return $U['home'];
}

add_action('template_redirect', function () {
    if (!get_theme_mod('intrafarma_rd_on', 1)) { return; }
    if (is_admin() || wp_doing_ajax() || (defined('REST_REQUEST') && REST_REQUEST) || is_feed() || is_robots() || is_preview() || is_customize_preview()) { return; }
    if (function_exists('is_favicon') && is_favicon()) { return; }
    if (isset($_GET['eski']) && current_user_can('edit_pages')) { return; }
    if (intrafarma_view() !== '') { return; }           // yeni tasarım sayfası: dokunma
    if (is_404() && preg_match('#\.(xml|txt|ico|png|jpe?g|webp|svg|pdf|css|js|map|woff2?)$#i', (string) wp_parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH))) { return; }
    if (is_search()) { wp_safe_redirect(intrafarma_urls()['urunler'], 302); exit; }
    $to = intrafarma_old_target();
    if (!$to) { return; }
    $here = (is_ssl() ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    if (untrailingslashit(strtok($to, '#')) === untrailingslashit($here)) { return; }
    wp_safe_redirect($to, get_theme_mod('intrafarma_rd_301', 0) ? 301 : 302, 'Intrafarma');
    exit;
}, 1);

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
