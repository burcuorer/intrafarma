<?php
/**
 * Intrafarma 2026 teması.
 * parts/, assets/ ve data/ altındaki dosyalar v2src/build_wp.py ile üretilir; elle düzenlenmez.
 * İçerik (metinler, ürünler, iş ortakları, iletişim) yönetim panelindeki "Intrafarma" menüsünden düzenlenir.
 */
if (!defined('ABSPATH')) { exit; }
define('INTRAFARMA_VER', wp_get_theme()->get('Version'));
define('INTRAFARMA_PAGES', array('uzmanlik' => 'Uzmanlık', 'urunler' => 'Ürünler', 'uretim' => 'Üretim ve özel marka', 'bilim' => 'Bilim', 'guncel' => 'Güncel', 'iletisim' => 'İletişim', 'hakkimizda' => 'Hakkımızda'));
define('INTRAFARMA_LANGS', array('tr', 'en', 'ar', 'it', 'ru', 'ro'));

function intrafarma_uri() { return untrailingslashit(get_template_directory_uri()); }

/** Tasarım sayfasının WordPress'teki kaydı (yalnızca üst düzey, yayımlanmış sayfa) */
function intrafarma_page($slug) {
    $p = get_page_by_path($slug);
    return ($p && $p->post_status === 'publish') ? $p : null;
}

/** Sayfa adresleri. Sayfa kaydı olsun olmasın her zaman çalışan bir adres döner. */
function intrafarma_urls() {
    static $u = null; if ($u !== null) { return $u; }
    $pretty = (string) get_option('permalink_structure') !== '';
    $u = array('home' => home_url('/'));
    foreach (INTRAFARMA_PAGES as $slug => $title) {
        if ($pretty) { $u[$slug] = home_url(user_trailingslashit('/' . $slug)); continue; }
        $p = intrafarma_page($slug);
        $u[$slug] = $p ? get_permalink($p) : add_query_arg('if_sayfa', $slug, home_url('/'));
    }
    return $u;
}

/** İstek yolunun parçaları: site kökü, index.php ve dil öneki (Polylang) ayıklanmış */
function intrafarma_segments() {
    static $s = null; if ($s !== null) { return $s; }
    $path = (string) wp_parse_url(isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/', PHP_URL_PATH);
    $base = (string) wp_parse_url(home_url('/'), PHP_URL_PATH);
    if ($base !== '' && $base !== '/' && stripos($path, $base) === 0) { $path = substr($path, strlen($base)); }
    $path = trim(strtolower(rawurldecode($path)), '/');
    $path = preg_replace('#^index\.php/?#', '', $path);
    $seg = $path === '' ? array() : explode('/', $path);
    $s = array('all' => $seg, 'lang' => '');
    if (isset($seg[0], $seg[1]) && $seg[0] === 'language' && in_array($seg[1], INTRAFARMA_LANGS, true)) { $s['lang'] = $seg[1]; $seg = array_slice($seg, 2); }
    elseif (isset($seg[0]) && in_array($seg[0], INTRAFARMA_LANGS, true)) { $s['lang'] = $seg[0]; $seg = array_slice($seg, 1); }
    $s['rest'] = array_values($seg);
    return $s;
}

/**
 * Bu istek hangi tasarım sayfası: 'home', slug ya da ''.
 * Önce adres yoluna bakılır; böylece WordPress'te sayfa kaydı eksik olsa da, dil eklentisi sayfayı gizlese de tasarım açılır.
 */
function intrafarma_view() {
    static $v = null; if ($v !== null) { return $v; }
    if (is_admin()) { return ''; }
    $r = '';
    $q = isset($_GET['if_sayfa']) ? sanitize_key(wp_unslash($_GET['if_sayfa'])) : '';
    $seg = intrafarma_segments(); $rest = $seg['rest'];
    if ($q !== '' && ($q === 'home' || isset(INTRAFARMA_PAGES[$q]))) { $r = $q; }
    elseif (count($rest) === 1 && isset(INTRAFARMA_PAGES[$rest[0]])) { $r = $rest[0]; }
    if (!did_action('wp')) { return $r; }                 // ana sorgu henüz çalışmadı: yalnızca yol bilgisi
    if ($r === '') {
        foreach (array_keys(INTRAFARMA_PAGES) as $slug) { if (is_page($slug)) { $r = $slug; break; } }
    }
    if ($r === '' && is_front_page()) { $r = 'home'; }
    if ($r === '' && !$rest && is_home() && !is_paged()) { $r = 'home'; }
    if ($r === '' && !$rest && is_404() && empty($_GET)) { $r = 'home'; }   // kök adres her koşulda ana sayfadır
    $v = $r;
    return $v;
}

add_action('after_setup_theme', function () { add_theme_support('title-tag'); });

/* Yol üzerinden bulunan sayfa WordPress'e göre "bulunamadı" ise durumu düzelt */
add_action('template_redirect', function () {
    if (intrafarma_view() === '') { return; }
    global $wp_query;
    if ($wp_query->is_404) { $wp_query->is_404 = false; status_header(200); }
}, 0);
add_filter('template_include', function ($t) {
    return intrafarma_view() === '' ? $t : get_template_directory() . '/sayfa.php';
}, 99);
/* Tasarım sayfalarında WordPress ve Polylang adres "düzeltmesi" yapmasın (benzer adlı eski sayfaya atlama, dil öneki ekleme) */
add_filter('redirect_canonical', function ($to) { return intrafarma_view() === '' ? $to : false; }, 99);
add_filter('pll_check_canonical_url', function ($to) { return intrafarma_view() === '' ? $to : false; }, 99);
add_filter('do_redirect_guess_404_permalink', '__return_false');
add_filter('pre_get_document_title', function ($t) {
    $v = intrafarma_view(); if ($v === '') { return $t; }
    return $v === 'home' ? 'Intrafarma' : INTRAFARMA_PAGES[$v] . ' · Intrafarma';
}, 99);

add_action('wp_enqueue_scripts', function () {
    $v = intrafarma_view(); $u = intrafarma_uri();
    wp_enqueue_style('intrafarma-fonts', $u . '/assets/fonts.css', array(), INTRAFARMA_VER);
    if ($v === '') { wp_enqueue_style('intrafarma-plain', get_stylesheet_uri(), array('intrafarma-fonts'), INTRAFARMA_VER); return; }
    wp_enqueue_style('intrafarma-app', $u . '/assets/app.css', array('intrafarma-fonts'), INTRAFARMA_VER);
    wp_enqueue_script('intrafarma-app1', $u . '/assets/app1.js', array(), INTRAFARMA_VER, true);
    wp_enqueue_script('intrafarma-app2', $u . '/assets/app2.js', array('intrafarma-app1'), INTRAFARMA_VER, true);
    $js = 'window.IF_BASE=' . wp_json_encode($u . '/') . ';window.IF_URLS=' . wp_json_encode(intrafarma_urls())
        . ';window.IF_CK=' . wp_json_encode(intrafarma_ck_config(), JSON_UNESCAPED_SLASHES) . ';';
    $cms = intrafarma_cms_payload();
    $sg = intrafarma_segments();
    if ($sg['lang'] !== '') { $js .= 'window.IF_DIL=' . wp_json_encode($sg['lang']) . ';'; }   // /en/... gibi dil önekli adres
    if ($cms) { $js .= 'window.IF_CMS=' . wp_json_encode($cms, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ';'; }
    wp_add_inline_script('intrafarma-app1', $js, 'before');
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

/**
 * Tasarım sayfalarının WordPress kayıtları: eksik olan oluşturulur, var olana dokunulmaz.
 * Tema ilk etkinleştiğinde ve her sürüm güncellemesinde bir kez çalışır.
 */
function intrafarma_ensure_pages() {
    $made = array();
    foreach (INTRAFARMA_PAGES as $slug => $title) {
        $p = intrafarma_page($slug);
        $id = $p ? $p->ID : 0;
        if (!$id) {
            $id = wp_insert_post(array('post_type' => 'page', 'post_status' => 'publish', 'post_title' => $title, 'post_name' => $slug,
                'post_content' => '<!-- Bu sayfanın içeriği Intrafarma menüsünden düzenlenir. -->'));
            if ($id && !is_wp_error($id)) { $made[] = $slug; } else { $id = 0; }
        }
        // Polylang: dili atanmamış sayfa gizlenir; varsayılan dili ata
        if ($id && function_exists('pll_get_post_language') && function_exists('pll_set_post_language') && function_exists('pll_default_language')) {
            if (!pll_get_post_language($id)) { $d = pll_default_language(); if ($d) { pll_set_post_language($id, $d); } }
        }
    }
    update_option('intrafarma_pages_ver', INTRAFARMA_VER);
    return $made;
}
add_action('after_switch_theme', 'intrafarma_ensure_pages');
add_action('init', function () { if (get_option('intrafarma_pages_ver') !== INTRAFARMA_VER) { intrafarma_ensure_pages(); } }, 20);

/** Önbellek eklentilerini temizler (içerik kaydedilince site hemen güncellensin) */
function intrafarma_purge_cache() {
    if (function_exists('wpo_cache_flush')) { wpo_cache_flush(); }
    if (function_exists('rocket_clean_domain')) { rocket_clean_domain(); }
    if (function_exists('w3tc_flush_all')) { w3tc_flush_all(); }
    if (function_exists('wp_cache_clear_cache')) { wp_cache_clear_cache(); }
    if (class_exists('autoptimizeCache')) { autoptimizeCache::clearall(); }
    do_action('litespeed_purge_all');
    wp_cache_flush();
}

require get_template_directory() . '/inc/cerez.php';
require get_template_directory() . '/inc/icerik.php';
require get_template_directory() . '/inc/yonlendirme.php';

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
