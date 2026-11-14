<?php
if (!defined('ABSPATH')) { exit; }
/* ===================== Eski sayfaları yeni tasarıma yönlendirme =====================
 * Eski temadan kalan adresler (Ürünlerimiz, /project/..., kategori sayfaları, İş Ortaklarımız...) yeni tasarımdaki
 * karşılığına gönderilir. Eski içerik silinmez.
 * Ayar: Görünüm → Özelleştir → "Intrafarma · Yönlendirme". Yönetici eski sayfayı görmek isterse adrese ?eski=1 ekler.
 * Tasarım sayfalarına (ana sayfa, /uzmanlik/, /urunler/ ...) hiçbir zaman dokunmaz.
 */
add_action('customize_register', function ($wpc) {
    $wpc->add_section('intrafarma_rd', array('title' => 'Intrafarma · Yönlendirme', 'priority' => 161,
        'description' => 'Eski temadan kalan sayfalara gelen ziyaretçiler yeni tasarımdaki karşılık gelen sayfaya gönderilir. Eski içerik silinmez. Yönetici olarak eski bir sayfayı görmek için adresin sonuna ?eski=1 ekleyin.'));
    $wpc->add_setting('intrafarma_rd_on', array('default' => 1, 'sanitize_callback' => 'absint'));
    $wpc->add_control('intrafarma_rd_on', array('section' => 'intrafarma_rd', 'type' => 'checkbox', 'label' => 'Eski sayfaları yeni tasarıma yönlendir'));
    $wpc->add_setting('intrafarma_rd_301', array('default' => 0, 'sanitize_callback' => 'absint'));
    $wpc->add_control('intrafarma_rd_301', array('section' => 'intrafarma_rd', 'type' => 'checkbox', 'label' => 'Kalıcı yönlendirme (301) — yalnızca canlı yayın günü açın; testte geçici (302) kalsın'));
});

/** Sitedeki slug() ile aynı sonucu verir: "Regenflex T&M" → "regenflex-t-m" */
function intrafarma_slug($s) {
    $s = str_replace(array('İ', 'I'), array('i', 'ı'), (string) $s);
    $s = function_exists('mb_strtolower') ? mb_strtolower($s, 'UTF-8') : strtolower($s);
    $s = strtr($s, array('ç' => 'c', 'ğ' => 'g', 'ı' => 'i', 'ö' => 'o', 'ş' => 's', 'ü' => 'u', 'â' => 'a', 'î' => 'i', 'û' => 'u'));
    return trim(preg_replace('/[^a-z0-9]+/', '-', $s), '-');
}

function intrafarma_old_target() {
    $U = intrafarma_urls();
    $q = function ($base, $args) { return add_query_arg($args, $base); };
    $S = intrafarma_segments(); $seg = $S['all']; $rest = $S['rest'];

    // tek ürün: /project/<slug>/
    if (is_singular('project') || (isset($seg[0], $seg[1]) && $seg[0] === 'project')) {
        $slug = is_singular('project') ? (string) get_post_field('post_name', get_queried_object_id()) : $seg[1];
        $alias = array('regenflex-kit-3' => 'regenflex-kit', 'regenflex-tm' => 'regenflex-t-m', 'eksozom-3' => 'eksozom', 'lipocell' => 'lipocell-mini', 'collygen-2' => 'collygen');
        $slug = isset($alias[$slug]) ? $alias[$slug] : $slug;
        $known = array_map(function ($p) { return intrafarma_slug($p['n']); }, intrafarma_cms_prods());
        if (!in_array($slug, $known, true)) { $t = preg_replace('/-\d+$/', '', $slug); if (in_array($t, $known, true)) { $slug = $t; } }
        return in_array($slug, $known, true) ? $q($U['urunler'], array('urun' => $slug)) : $U['urunler'];
    }

    // ürün kategorileri (eski portföy filtreleri) → eksen ya da klinik alan
    $term = '';
    if (is_tax() || is_category()) { $o = get_queried_object(); $term = ($o && isset($o->slug)) ? $o->slug : ''; }
    elseif (count($seg) >= 2 && preg_match('/(categor|kategori|portfolio|project_|project-)/', $seg[0])) { $term = end($seg); }
    if ($term !== '') {
        $map = array('hucresel' => array('eksen' => 'hucresel-tedaviler'), 'ortobiyolojik' => array('eksen' => 'ortobiyolojikler'),
            'biyoaktif' => array('eksen' => 'biyoaktif-beslenme'), 'gida' => array('eksen' => 'biyoaktif-beslenme'), 'kolajen' => array('eksen' => 'biyoaktif-beslenme'),
            'rejeneratif' => array('eksen' => 'rejeneratif-teknolojiler'), 'ayristirma' => array('eksen' => 'rejeneratif-teknolojiler'),
            'kadin' => array('alan' => 'kadin-sagligi'), 'ortopedi' => array('alan' => 'ortopedi'), 'travmatoloji' => array('alan' => 'ortopedi'),
            'uroloji' => array('alan' => 'uroloji'), 'veteriner' => array('alan' => 'veteriner'), 'estetik' => array('alan' => 'estetik'), 'spor' => array('alan' => 'spor-hekimligi'));
        foreach ($map as $k => $a) {
            if (strpos($term, $k) !== false) { return $q($U['urunler'], $a); }
        }
        return $U['urunler'];
    }

    // bilinen eski sayfalar
    $pages = array('urunlerimiz' => $U['urunler'], 'e-katalog' => $U['urunler'], 'urunler-2' => $U['urunler'], 'products' => $U['urunler'],
        'is-ortaklarimiz' => $U['hakkimizda'] . '#is-ortaklari', 'kurumsal' => $U['hakkimizda'], 'about-us' => $U['hakkimizda'],
        'insan-kaynaklari' => $U['iletisim'], 'kariyer' => $U['iletisim'], 'contact' => $U['iletisim'],
        'e-bulten' => $U['guncel'], 'haberler' => $U['guncel'], 'blog' => $U['guncel']);
    if (is_page()) { $pn = (string) get_post_field('post_name', get_queried_object_id()); if (isset($pages[$pn])) { return $pages[$pn]; } }
    $last = $rest ? end($rest) : '';
    if ($last !== '' && isset($pages[$last])) { return $pages[$last]; }
    if (isset($_GET['page_id']) && (int) $_GET['page_id'] === 8008) { return $U['urunler']; }
    // adında konu geçen diğer eski sayfalar (ör. "uzmanlik-alanlarimiz", "rejeneratif-urunler")
    $hint = $last !== '' ? $last : (is_page() ? (string) get_post_field('post_name', get_queried_object_id()) : '');
    if ($hint !== '') {
        $kw = array('hucresel' => $q($U['urunler'], array('eksen' => 'hucresel-tedaviler')), 'ortobiyolojik' => $q($U['urunler'], array('eksen' => 'ortobiyolojikler')),
            'rejeneratif' => $q($U['urunler'], array('eksen' => 'rejeneratif-teknolojiler')), 'biyoaktif' => $q($U['urunler'], array('eksen' => 'biyoaktif-beslenme')),
            'ozel-cozum' => $q($U['urunler'], array('eksen' => 'ozel-cozumler')), 'urun' => $U['urunler'], 'product' => $U['urunler'], 'katalog' => $U['urunler'],
            'uzman' => $U['uzmanlik'], 'alan' => $U['uzmanlik'], 'uretim' => $U['uretim'], 'ozel-marka' => $U['uretim'], 'fason' => $U['uretim'],
            'bilim' => $U['bilim'], 'kurul' => $U['bilim'], 'sss' => $U['bilim'], 'haber' => $U['guncel'], 'etkinlik' => $U['guncel'], 'bulten' => $U['guncel'],
            'iletisim' => $U['iletisim'], 'kariyer' => $U['iletisim'], 'hakkimizda' => $U['hakkimizda'], 'kurumsal' => $U['hakkimizda'], 'ortak' => $U['hakkimizda'] . '#is-ortaklari');
        foreach ($kw as $k => $to) { if (strpos($hint, $k) !== false) { return $to; } }
    }
    if (is_singular('post') || is_archive() || (is_home() && $rest)) { return $U['guncel']; }

    // geri kalan her şey ana sayfaya; dil önekiyle gelindiyse o dilde
    return $S['lang'] !== '' && $S['lang'] !== 'tr' ? $q($U['home'], array('dil' => $S['lang'])) : $U['home'];
}

add_action('template_redirect', function () {
    if (!get_theme_mod('intrafarma_rd_on', 1)) { return; }
    if (is_admin() || wp_doing_ajax() || (defined('REST_REQUEST') && REST_REQUEST) || is_feed() || is_robots() || is_preview() || is_customize_preview()) { return; }
    if (function_exists('is_favicon') && is_favicon()) { return; }
    if (intrafarma_view() !== '') { return; }           // yeni tasarım sayfası: dokunma
    if (isset($_GET['eski']) && current_user_can('edit_pages')) { return; }
    $path = (string) wp_parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (preg_match('#\.(xml|xsl|txt|ico|png|jpe?g|gif|webp|svg|pdf|css|js|map|json|woff2?|mp4|webm)$#i', $path)) { return; }
    if (preg_match('#/(wp-json|wp-admin|wp-login\.php|wp-cron\.php|xmlrpc\.php)(/|$)#', $path)) { return; }
    $to = is_search() ? intrafarma_urls()['urunler'] : intrafarma_old_target();
    if (!$to) { return; }
    // döngü koruması: hedef, bulunduğumuz yolun kendisiyse yönlendirme yapma
    $norm = function ($u) { $p = (string) wp_parse_url($u, PHP_URL_PATH); return untrailingslashit(strtolower($p)); };
    $qs = function ($u) { $a = array(); wp_parse_str((string) wp_parse_url($u, PHP_URL_QUERY), $a); ksort($a); return $a; };
    if ($norm($to) === $norm($_SERVER['REQUEST_URI']) && $qs($to) == $qs($_SERVER['REQUEST_URI'])) { return; }
    nocache_headers();
    wp_safe_redirect($to, get_theme_mod('intrafarma_rd_301', 0) ? 301 : 302, 'Intrafarma');
    exit;
}, 1);
