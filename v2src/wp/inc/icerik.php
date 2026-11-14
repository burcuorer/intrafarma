<?php
if (!defined('ABSPATH')) { exit; }
/* ===================== İçerik yönetimi =====================
 * Yönetim panelinde "Intrafarma" menüsü: Metinler (6 dil), Ürünler, İş ortakları, İletişim ve sosyal medya.
 * Burada kaydedilen her şey sitedeki varsayılan içeriğin üzerine yazılır; hiçbir şey kaydedilmemişse
 * tema kendi varsayılanlarıyla (data/varsayilan.json) çalışır. Kod bilgisi gerekmez.
 */
define('INTRAFARMA_CAP', 'edit_pages');
define('INTRAFARMA_LANG_NAMES', array('tr' => 'Türkçe', 'en' => 'English', 'ar' => 'العربية', 'it' => 'Italiano', 'ru' => 'Русский', 'ro' => 'Română'));
define('INTRAFARMA_GROUPS', array('Ana sayfa', 'Menü', 'Uzmanlık', 'Ürünler', 'Üretim', 'Bilim', 'Güncel', 'İletişim', 'Hakkımızda',
    'Sağlık çalışanı girişi', 'Sağlık çalışanları alanı (Pro)', 'Alt bilgi', 'Çerez bandı ve video'));
/* iletişim bilgileri ayrı sayfadan yönetilir */
define('INTRAFARMA_TX_SKIP', array('il_av', 'il_tv', 'il_mv'));

/* ---------- veri ---------- */
function intrafarma_cms_defaults() {
    static $d = null; if ($d !== null) { return $d; }
    $f = get_template_directory() . '/data/varsayilan.json';
    $d = is_readable($f) ? json_decode((string) file_get_contents($f), true) : array();
    if (!is_array($d)) { $d = array(); }
    $d += array('langs' => INTRAFARMA_LANGS, 'tx' => array(), 'grp' => array(), 'prods' => array(), 'partners' => array(), 'axca' => array());
    return $d;
}
function intrafarma_cms_tx() { $o = get_option('intrafarma_tx'); return is_array($o) ? $o : array(); }
/** Bir metnin şu anki değeri (panelde değiştirilmişse o, değilse varsayılan) */
function intrafarma_cms_text($lang, $key) {
    $o = intrafarma_cms_tx(); if (isset($o[$lang][$key])) { return $o[$lang][$key]; }
    $d = intrafarma_cms_defaults(); return isset($d['tx'][$lang][$key]) ? $d['tx'][$lang][$key] : '';
}
function intrafarma_cms_prods() {
    $o = get_option('intrafarma_prods'); if (is_array($o) && $o) { return array_values($o); }
    $d = intrafarma_cms_defaults(); return $d['prods'];
}
function intrafarma_cms_partners() {
    $o = get_option('intrafarma_partners'); if (is_array($o) && $o) { return array_values($o); }
    $d = intrafarma_cms_defaults(); return $d['partners'];
}
function intrafarma_cms_set_defaults() {
    return array('adres' => '', 'telefon' => '', 'eposta' => '',
        'instagram' => 'https://www.instagram.com/intrafarma.official/', 'facebook' => 'https://www.facebook.com/intrafarma.com.tr/',
        'linkedin' => 'https://www.linkedin.com/company/intrafarma-ila-/', 'youtube' => 'https://www.youtube.com/@intrafarmasaglik');
}
function intrafarma_cms_set() { $o = get_option('intrafarma_set'); return is_array($o) ? $o + intrafarma_cms_set_defaults() : intrafarma_cms_set_defaults(); }
/** İş ortağı logosunun adresi: tema dosyası anahtarı ya da ortam kütüphanesi adresi */
function intrafarma_partner_img($f) {
    return preg_match('/^[a-z0-9-]+$/', (string) $f) ? intrafarma_uri() . '/media/ortaklar/' . $f . '.jpg' : (string) $f;
}

/** Siteye gönderilen içerik (window.IF_CMS). Panelde hiçbir şey değişmemişse boş döner. */
function intrafarma_cms_payload() {
    $out = array();
    $tx = array_filter(array_map(function ($a) { return is_array($a) ? array_filter($a, 'strlen') : array(); }, intrafarma_cms_tx()));
    if ($tx) { $out['tx'] = $tx; }
    $p = get_option('intrafarma_prods');
    if (is_array($p) && $p) { $out['prods'] = array_values($p); }
    $pt = get_option('intrafarma_partners');
    if (is_array($pt) && $pt) {
        $out['partners'] = array_values(array_map(function ($x) { return array($x['f'], $x['n'], isset($x['u']) ? $x['u'] : '', !empty($x['dk'])); }, $pt));
    }
    $s = get_option('intrafarma_set');
    if (is_array($s)) { $out['set'] = $s; }
    return $out;
}

/* ---------- menü ---------- */
add_action('admin_menu', function () {
    add_menu_page('Intrafarma', 'Intrafarma', INTRAFARMA_CAP, 'intrafarma', 'intrafarma_admin_home', 'dashicons-edit-page', 3);
    add_submenu_page('intrafarma', 'Başlangıç ve yardım', 'Başlangıç ve yardım', INTRAFARMA_CAP, 'intrafarma', 'intrafarma_admin_home');
    add_submenu_page('intrafarma', 'Metinler', 'Metinler', INTRAFARMA_CAP, 'intrafarma-metinler', 'intrafarma_admin_tx');
    add_submenu_page('intrafarma', 'Ürünler', 'Ürünler', INTRAFARMA_CAP, 'intrafarma-urunler', 'intrafarma_admin_prods');
    add_submenu_page('intrafarma', 'İş ortakları', 'İş ortakları', INTRAFARMA_CAP, 'intrafarma-ortaklar', 'intrafarma_admin_partners');
    add_submenu_page('intrafarma', 'İletişim ve sosyal medya', 'İletişim ve sosyal medya', INTRAFARMA_CAP, 'intrafarma-iletisim', 'intrafarma_admin_set');
});
add_action('admin_enqueue_scripts', function ($hook) {
    if (strpos((string) $hook, 'intrafarma') === false) { return; }
    wp_enqueue_media();
    wp_enqueue_style('intrafarma-admin', intrafarma_uri() . '/inc/admin.css', array(), INTRAFARMA_VER);
    wp_enqueue_script('intrafarma-admin', intrafarma_uri() . '/inc/admin.js', array('jquery'), INTRAFARMA_VER, true);
});

function intrafarma_admin_url($page, $args = array()) { return add_query_arg(array('page' => $page) + $args, admin_url('admin.php')); }
function intrafarma_admin_head($title, $lede) {
    echo '<div class="wrap if-wrap"><h1>' . esc_html($title) . '</h1><p class="if-lede">' . wp_kses_post($lede) . '</p>';
    if (isset($_GET['kayit'])) {
        $m = array('1' => 'Kaydedildi. Değişiklik sitede yayında.', 'sifir' => 'Varsayılan içeriğe dönüldü.');
        $k = sanitize_key($_GET['kayit']);
        echo '<div class="notice notice-success is-dismissible"><p><b>' . esc_html(isset($m[$k]) ? $m[$k] : $m['1']) . '</b> <a href="' . esc_url(home_url('/')) . '" target="_blank" rel="noopener">Siteyi aç ↗</a></p></div>';
    }
}
function intrafarma_admin_guard($action) {
    if (!current_user_can(INTRAFARMA_CAP)) { wp_die('Bu işlem için yetkiniz yok.'); }
    check_admin_referer($action);
}
function intrafarma_admin_back($page, $args = array()) {
    intrafarma_purge_cache();
    wp_safe_redirect(intrafarma_admin_url($page, $args)); exit;
}

/* ---------- Başlangıç ve yardım ---------- */
function intrafarma_admin_home() {
    intrafarma_admin_head('Intrafarma içerik yönetimi', 'Sitedeki yazıları, ürünleri, iş ortaklarını ve iletişim bilgilerini buradan değiştirirsiniz. Kod bilgisi gerekmez; kaydettiğiniz değişiklik hemen yayına girer.');
    $cards = array(
        array('intrafarma-metinler', 'Metinler', 'Sitedeki tüm başlık, paragraf ve düğme yazıları. Altı dilin her biri ayrı düzenlenir.', 'dashicons-editor-textcolor'),
        array('intrafarma-urunler', 'Ürünler', 'Ürün ekleme, silme, sıralama; ad, kategori, görsel ve açıklama.', 'dashicons-products'),
        array('intrafarma-ortaklar', 'İş ortakları', 'Ana sayfa ve Hakkımızda\'daki logo şeridi: logo, ad ve web adresi.', 'dashicons-groups'),
        array('intrafarma-iletisim', 'İletişim ve sosyal medya', 'Adres, telefon, e-posta ve sosyal medya bağlantıları.', 'dashicons-location'),
    );
    echo '<div class="if-cards">';
    foreach ($cards as $c) {
        echo '<a class="if-card" href="' . esc_url(intrafarma_admin_url($c[0])) . '"><span class="dashicons ' . esc_attr($c[3]) . '"></span><b>' . esc_html($c[1]) . '</b><span>' . esc_html($c[2]) . '</span></a>';
    }
    echo '</div>';
    $u = intrafarma_urls();
    echo '<h2>Sitenin sayfaları</h2><p>Sayfaların tasarımı temadan gelir; içerikleri bu menüden düzenlenir. <b>Sayfalar</b> menüsündeki aynı adlı kayıtları silmeyin, içlerine yazı yazmanıza gerek yoktur.</p><ul class="if-pages">';
    echo '<li><a href="' . esc_url($u['home']) . '" target="_blank" rel="noopener">Ana sayfa ↗</a></li>';
    foreach (INTRAFARMA_PAGES as $slug => $title) { echo '<li><a href="' . esc_url($u[$slug]) . '" target="_blank" rel="noopener">' . esc_html($title) . ' ↗</a></li>'; }
    echo '</ul>';
    ?>
    <h2>Nasıl yapılır</h2>
    <div class="if-help">
      <details open><summary>Sitedeki bir yazıyı değiştirmek</summary>
        <ol><li>Sitede değiştirmek istediğiniz cümleyi kopyalayın.</li><li><b>Intrafarma → Metinler</b>'e girin, üstteki <b>arama kutusuna</b> yapıştırıp Ara'ya basın.</li><li>Çıkan kutudaki yazıyı düzeltin ve <b>Kaydet</b>'e basın.</li><li>Diğer diller için üstteki dil sekmesini değiştirip aynı işlemi yapın. Soldaki sütun Türkçesini gösterir.</li></ol>
        <p>Kutuyu boşaltıp kaydederseniz yazı ilk haline döner. <code>{n}</code> gibi süslü parantezli parçalar otomatik dolan yerlerdir (sayı, ürün adı); silmeyin. <code>&lt;em&gt;sözcük&lt;/em&gt;</code> arasındaki sözcük başlıkta renkli görünür.</p></details>
      <details><summary>Ürün eklemek ya da düzenlemek</summary>
        <ol><li><b>Intrafarma → Ürünler</b>'e girin.</li><li>Yeni ürün için en alttaki <b>Ürün ekle</b>'ye basın; var olan ürünü düzenlemek için adına tıklayın.</li><li>Ad ve kategori zorunludur. Görsel ve açıklama isteğe bağlıdır; açıklama boşsa sitede genel bir tanıtım cümlesi görünür.</li><li><b>Erişim</b>: "Herkese açık" ürünlerin bilgisi tüm ziyaretçilere, diğerlerininki yalnızca sağlık çalışanı girişi yapanlara gösterilir.</li><li>Sırayı ↑ ↓ ile değiştirin, <b>Kaydet</b>'e basın.</li></ol>
        <p>Ürünün adı değişirse sayfa adresi de değişir (örnek: "Regenflex Kit" → <code>?urun=regenflex-kit</code>).</p></details>
      <details><summary>İş ortağı logosu eklemek</summary>
        <ol><li><b>Intrafarma → İş ortakları</b>'na girin, <b>İş ortağı ekle</b>'ye basın.</li><li><b>Logo seç</b> ile görseli yükleyin. Beyaz zeminli, yatay bir JPG ya da PNG en iyi sonucu verir.</li><li>Adı ve web adresini yazın, <b>Kaydet</b>'e basın.</li></ol></details>
      <details><summary>Telefon, adres ya da sosyal medya adresini değiştirmek</summary>
        <p><b>Intrafarma → İletişim ve sosyal medya</b>. Bir sosyal medya kutusunu boş bırakırsanız o simge sitede gizlenir.</p></details>
      <details><summary>Değişiklik sitede görünmüyorsa</summary>
        <p>Üst çubuktaki <b>Purge cache</b>'e basın, sonra siteyi <b>Ctrl/Cmd + Shift + R</b> ile yenileyin. Tarayıcı eski hali bir süre saklayabilir.</p></details>
      <details><summary>Çerez bandı ve eski adresler</summary>
        <p>Google Analytics / Ads kodları: <a href="<?php echo esc_url(admin_url('customize.php')); ?>">Görünüm → Özelleştir</a> → "Intrafarma · Çerezler". Onay kayıtları: <a href="<?php echo esc_url(admin_url('tools.php?page=intrafarma-ck')); ?>">Araçlar → Çerez onayları</a>. Eski site adreslerinin yönlendirmesi: Özelleştir → "Intrafarma · Yönlendirme".</p></details>
    </div>
    <p class="if-ver">Tema sürümü <?php echo esc_html(INTRAFARMA_VER); ?></p></div>
    <?php
}

/* ---------- Metinler ---------- */
function intrafarma_tx_allowed() {
    return array('em' => array(), 'strong' => array(), 'b' => array(), 'i' => array(), 'br' => array(), 'sup' => array(), 'sub' => array(),
        'span' => array('class' => true), 'a' => array('href' => true, 'target' => true, 'rel' => true));
}
function intrafarma_admin_tx() {
    $D = intrafarma_cms_defaults(); $O = intrafarma_cms_tx();
    $lang = isset($_GET['dil']) && in_array($_GET['dil'], INTRAFARMA_LANGS, true) ? $_GET['dil'] : 'tr';
    $grp = isset($_GET['grup']) ? sanitize_text_field(wp_unslash($_GET['grup'])) : 'Ana sayfa';
    if (!in_array($grp, INTRAFARMA_GROUPS, true)) { $grp = 'Ana sayfa'; }
    $ara = isset($_GET['ara']) ? trim(sanitize_text_field(wp_unslash($_GET['ara']))) : '';
    $low = function ($s) { return function_exists('mb_strtolower') ? mb_strtolower((string) $s, 'UTF-8') : strtolower((string) $s); };

    intrafarma_admin_head('Metinler', 'Sitedeki yazılar. Aradığınız cümleyi sitede kopyalayıp arama kutusuna yapıştırmak en hızlı yoldur. Kutuyu boş bırakıp kaydederseniz yazı ilk haline döner.');
    if (empty($D['tx']['tr'])) { echo '<div class="notice notice-error"><p>Varsayılan metin dosyası okunamadı (data/varsayilan.json). Temayı yeniden yükleyin.</p></div></div>'; return; }

    // dil sekmeleri
    echo '<nav class="nav-tab-wrapper if-tabs">';
    foreach (INTRAFARMA_LANG_NAMES as $l => $name) {
        $n = isset($O[$l]) ? count(array_filter($O[$l], 'strlen')) : 0;
        echo '<a class="nav-tab' . ($l === $lang ? ' nav-tab-active' : '') . '" href="' . esc_url(intrafarma_admin_url('intrafarma-metinler', array('dil' => $l, 'grup' => $grp, 'ara' => $ara))) . '">' . esc_html($name) . ($n ? ' <span class="if-n" title="Değiştirilen metin sayısı">' . (int) $n . '</span>' : '') . '</a>';
    }
    echo '</nav>';
    // bölüm ve arama
    echo '<form class="if-bar" method="get" action="' . esc_url(admin_url('admin.php')) . '"><input type="hidden" name="page" value="intrafarma-metinler"><input type="hidden" name="dil" value="' . esc_attr($lang) . '">';
    echo '<label>Bölüm <select name="grup" onchange="this.form.ara.value=\'\';this.form.submit()">';
    foreach (INTRAFARMA_GROUPS as $g) { echo '<option' . selected($g, $grp, false) . '>' . esc_html($g) . '</option>'; }
    echo '</select></label><label class="if-search">Sitede geçen yazıyı ara <input type="search" name="ara" value="' . esc_attr($ara) . '" placeholder="Örnek: Portföyü keşfet"></label><button class="button">Ara</button>';
    if ($ara !== '') { echo ' <a class="button-link" href="' . esc_url(intrafarma_admin_url('intrafarma-metinler', array('dil' => $lang, 'grup' => $grp))) . '">Aramayı temizle</a>'; }
    echo '</form>';

    // satırlar
    $rows = array();
    foreach ($D['tx']['tr'] as $k => $trdef) {
        if (in_array($k, INTRAFARMA_TX_SKIP, true)) { continue; }
        $g = isset($D['grp'][$k]) ? $D['grp'][$k] : 'Ana sayfa';
        if ($ara !== '') {
            $hay = $low($k . ' ' . intrafarma_cms_text($lang, $k) . ' ' . intrafarma_cms_text('tr', $k));
            if (strpos($hay, $low($ara)) === false) { continue; }
        } elseif ($g !== $grp) { continue; }
        $rows[$k] = $g;
        if (count($rows) >= 250) { break; }
    }
    if (!$rows) { echo '<p class="if-empty">Bu aramayla eşleşen yazı bulunamadı. Daha kısa bir parça deneyin ya da dil sekmesini değiştirin.</p></div>'; return; }

    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" class="if-form">';
    wp_nonce_field('intrafarma_save_tx');
    echo '<input type="hidden" name="action" value="intrafarma_save_tx"><input type="hidden" name="dil" value="' . esc_attr($lang) . '"><input type="hidden" name="grup" value="' . esc_attr($grp) . '"><input type="hidden" name="ara" value="' . esc_attr($ara) . '">';
    echo '<p class="if-count">' . count($rows) . ' yazı' . ($ara !== '' ? ' · “' . esc_html($ara) . '” araması' : ' · ' . esc_html($grp)) . ' · ' . esc_html(INTRAFARMA_LANG_NAMES[$lang]) . '</p>';
    echo '<table class="widefat if-tx"><thead><tr><th>' . ($lang === 'tr' ? 'İlk hali' : 'Türkçesi') . '</th><th>' . esc_html(INTRAFARMA_LANG_NAMES[$lang]) . ' — sitede görünen</th></tr></thead><tbody>';
    foreach ($rows as $k => $g) {
        $def = isset($D['tx'][$lang][$k]) ? $D['tx'][$lang][$k] : '';
        $cur = intrafarma_cms_text($lang, $k);
        $ref = $lang === 'tr' ? $def : intrafarma_cms_text('tr', $k);
        $changed = isset($O[$lang][$k]) && $O[$lang][$k] !== '';
        $len = function_exists('mb_strlen') ? mb_strlen($cur . $def, 'UTF-8') / 2 : strlen($cur);
        echo '<tr' . ($changed ? ' class="if-changed"' : '') . '><td class="if-ref"><div>' . esc_html($ref) . '</div><small>' . esc_html($g) . ' · <code>' . esc_html($k) . '</code></small></td><td>';
        echo '<textarea name="tx[' . esc_attr($k) . ']" rows="' . ($len > 150 ? 4 : ($len > 60 ? 2 : 1)) . '"' . ($lang === 'ar' ? ' dir="rtl"' : '') . ' data-def="' . esc_attr($def) . '">' . esc_textarea($cur) . '</textarea>';
        echo '<div class="if-row-meta">' . ($changed ? '<span class="if-badge">Değiştirildi</span> <button type="button" class="button-link if-reset">İlk haline dön</button>' : '');
        if (strpos($def, '<em>') !== false) { echo ' <span class="if-hint">&lt;em&gt;…&lt;/em&gt; arasındaki sözcük renkli görünür.</span>'; }
        if (preg_match('/\{[a-z]+\}/', $def)) { echo ' <span class="if-hint">Süslü parantezli parçaları ({n} gibi) silmeyin.</span>'; }
        echo '</div></td></tr>';
    }
    echo '</tbody></table><div class="if-save"><button class="button button-primary button-hero">Kaydet</button></div></form></div>';
}
add_action('admin_post_intrafarma_save_tx', function () {
    intrafarma_admin_guard('intrafarma_save_tx');
    $D = intrafarma_cms_defaults(); $O = intrafarma_cms_tx();
    $lang = isset($_POST['dil']) && in_array($_POST['dil'], INTRAFARMA_LANGS, true) ? $_POST['dil'] : 'tr';
    $tx = isset($_POST['tx']) && is_array($_POST['tx']) ? wp_unslash($_POST['tx']) : array();
    if (!isset($O[$lang]) || !is_array($O[$lang])) { $O[$lang] = array(); }
    foreach ($tx as $k => $v) {
        $k = (string) $k;
        if (!isset($D['tx']['tr'][$k]) || in_array($k, INTRAFARMA_TX_SKIP, true)) { continue; }
        $v = trim(str_replace(array("\r\n", "\r"), "\n", (string) $v));
        $def = isset($D['tx'][$lang][$k]) ? $D['tx'][$lang][$k] : '';
        if ($v === '' || $v === $def) { unset($O[$lang][$k]); continue; }
        $O[$lang][$k] = wp_kses($v, intrafarma_tx_allowed());
    }
    if (!$O[$lang]) { unset($O[$lang]); }
    update_option('intrafarma_tx', $O);
    intrafarma_admin_back('intrafarma-metinler', array('dil' => $lang, 'grup' => isset($_POST['grup']) ? sanitize_text_field(wp_unslash($_POST['grup'])) : '',
        'ara' => isset($_POST['ara']) ? sanitize_text_field(wp_unslash($_POST['ara'])) : '', 'kayit' => 1));
});

/* ---------- ortak: tekrarlanan satırlar ---------- */
function intrafarma_row_tools() {
    return '<span class="if-tools"><button type="button" class="button if-up" title="Yukarı taşı" aria-label="Yukarı taşı">↑</button><button type="button" class="button if-down" title="Aşağı taşı" aria-label="Aşağı taşı">↓</button><button type="button" class="button-link-delete if-del">Sil</button></span>';
}
function intrafarma_reset_form($action, $label) {
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" class="if-resetform" onsubmit="return confirm(\'Bu sayfada yaptığınız tüm değişiklikler silinecek ve ilk listeye dönülecek. Emin misiniz?\')">';
    wp_nonce_field($action);
    echo '<input type="hidden" name="action" value="' . esc_attr($action) . '"><button class="button-link-delete">' . esc_html($label) . '</button></form>';
}

/* ---------- Ürünler ---------- */
function intrafarma_prod_row($i, $p, $axes) {
    $p += array('n' => '', 'a' => 0, 'open' => false, 'img' => '', 'd' => array());
    $h = '<details class="if-item"' . ($p['n'] === '' ? ' open' : '') . '><summary><span class="if-title">' . ($p['n'] !== '' ? esc_html($p['n']) : 'Yeni ürün') . '</span><span class="if-sub">' . esc_html(isset($axes[$p['a']]) ? $axes[$p['a']] : '') . '</span>' . intrafarma_row_tools() . '</summary><div class="if-body">';
    $h .= '<div class="if-grid"><label>Ürün adı<input type="text" class="if-name regular-text" data-f="n" value="' . esc_attr($p['n']) . '" required></label>';
    $h .= '<label>Kategori (eksen)<select data-f="a">';
    foreach ($axes as $ai => $an) { $h .= '<option value="' . (int) $ai . '"' . selected((int) $p['a'], $ai, false) . '>0' . ($ai + 1) . ' · ' . esc_html($an) . '</option>'; }
    $h .= '</select></label><label>Erişim<select data-f="open"><option value="0"' . selected(!empty($p['open']), false, false) . '>Yalnızca sağlık çalışanları</option><option value="1"' . selected(!empty($p['open']), true, false) . '>Herkese açık</option></select></label></div>';
    $h .= '<div class="if-media"><div class="if-prev">' . ($p['img'] ? '<img src="' . esc_url($p['img']) . '" alt="">' : '<span>Görsel yok</span>') . '</div><div><input type="hidden" data-f="img" value="' . esc_attr($p['img']) . '"><button type="button" class="button if-pick">Görsel seç</button> <button type="button" class="button-link if-clear">Görseli kaldır</button><p class="description">İsteğe bağlı. Beyaz ya da şeffaf zeminli ürün fotoğrafı.</p></div></div>';
    $h .= '<div class="if-desc"><label>Açıklama (Türkçe)<textarea rows="2" data-f="d.tr">' . esc_textarea(isset($p['d']['tr']) ? $p['d']['tr'] : '') . '</textarea></label><label>Açıklama (English)<textarea rows="2" data-f="d.en">' . esc_textarea(isset($p['d']['en']) ? $p['d']['en'] : '') . '</textarea></label></div>';
    $h .= '<details class="if-more"><summary>Diğer dillerde açıklama</summary><div class="if-desc">';
    foreach (array('ar', 'it', 'ru', 'ro') as $l) { $h .= '<label>' . esc_html(INTRAFARMA_LANG_NAMES[$l]) . '<textarea rows="2" data-f="d.' . $l . '"' . ($l === 'ar' ? ' dir="rtl"' : '') . '>' . esc_textarea(isset($p['d'][$l]) ? $p['d'][$l] : '') . '</textarea></label>'; }
    $h .= '</div><p class="description">Boş bırakılan dilde İngilizce, o da yoksa Türkçe açıklama gösterilir.</p></details></div></details>';
    return $h;
}
function intrafarma_admin_prods() {
    $axes = array(); for ($i = 0; $i < 5; $i++) { $axes[$i] = intrafarma_cms_text('tr', 'ax_' . $i); }
    $prods = intrafarma_cms_prods();
    intrafarma_admin_head('Ürünler', 'Ürünler sayfasında ve menüde görünen liste. Düzenlemek için ürünün adına tıklayın. Sıra, sitedeki sıradır.');
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" class="if-form if-list-form" data-name="prods">';
    wp_nonce_field('intrafarma_save_prods');
    echo '<input type="hidden" name="action" value="intrafarma_save_prods"><input type="hidden" name="json" value=""><p class="if-count"><span class="if-total">' . count($prods) . '</span> ürün</p><div class="if-list">';
    foreach ($prods as $i => $p) { echo intrafarma_prod_row($i, (array) $p, $axes); }
    echo '</div><template class="if-tpl">' . intrafarma_prod_row(0, array(), $axes) . '</template>';
    echo '<p><button type="button" class="button if-add">+ Ürün ekle</button></p><div class="if-save"><button class="button button-primary button-hero">Kaydet</button></div></form>';
    intrafarma_reset_form('intrafarma_reset_prods', 'İlk ürün listesine dön');
    echo '</div>';
}
add_action('admin_post_intrafarma_save_prods', function () {
    intrafarma_admin_guard('intrafarma_save_prods');
    $in = json_decode(isset($_POST['json']) ? wp_unslash($_POST['json']) : '', true);
    $out = array(); $seen = array();
    foreach (is_array($in) ? $in : array() as $p) {
        $n = isset($p['n']) ? sanitize_text_field($p['n']) : '';
        if ($n === '') { continue; }
        $sl = intrafarma_slug($n); if ($sl === '' || isset($seen[$sl])) { continue; } $seen[$sl] = 1;   // adresi aynı olan ikinci ürün alınmaz
        $d = array();
        foreach (INTRAFARMA_LANGS as $l) { $t = isset($p['d'][$l]) ? sanitize_textarea_field($p['d'][$l]) : ''; if ($t !== '') { $d[$l] = $t; } }
        $row = array('n' => $n, 'a' => max(0, min(4, isset($p['a']) ? (int) $p['a'] : 0)), 'open' => !empty($p['open']) && $p['open'] !== '0');
        $img = isset($p['img']) ? esc_url_raw($p['img']) : '';
        if ($img !== '') { $row['img'] = $img; }
        if ($d) { $row['d'] = $d; }
        $out[] = $row;
    }
    if ($out) { update_option('intrafarma_prods', $out); }
    intrafarma_admin_back('intrafarma-urunler', array('kayit' => 1));
});
add_action('admin_post_intrafarma_reset_prods', function () {
    intrafarma_admin_guard('intrafarma_reset_prods'); delete_option('intrafarma_prods');
    intrafarma_admin_back('intrafarma-urunler', array('kayit' => 'sifir'));
});

/* ---------- İş ortakları ---------- */
function intrafarma_partner_row($x) {
    $x += array('f' => '', 'n' => '', 'u' => '', 'dk' => false);
    $img = $x['f'] !== '' ? intrafarma_partner_img($x['f']) : '';
    $h = '<details class="if-item"' . ($x['n'] === '' ? ' open' : '') . '><summary><span class="if-thumb">' . ($img ? '<img src="' . esc_url($img) . '" alt="">' : '') . '</span><span class="if-title">' . ($x['n'] !== '' ? esc_html($x['n']) : 'Yeni iş ortağı') . '</span>' . intrafarma_row_tools() . '</summary><div class="if-body">';
    $h .= '<div class="if-media"><div class="if-prev">' . ($img ? '<img src="' . esc_url($img) . '" alt="">' : '<span>Logo yok</span>') . '</div><div><input type="hidden" data-f="f" value="' . esc_attr($x['f']) . '"><button type="button" class="button if-pick">Logo seç</button><p class="description">Zorunlu. Beyaz zeminli, yatay logo en iyi sonucu verir.</p></div></div>';
    $h .= '<div class="if-grid"><label>Ad<input type="text" class="if-name regular-text" data-f="n" value="' . esc_attr($x['n']) . '" required></label><label>Web adresi<input type="url" class="regular-text" data-f="u" value="' . esc_attr($x['u']) . '" placeholder="https://"></label>';
    $h .= '<label class="if-check"><input type="checkbox" data-f="dk"' . checked(!empty($x['dk']), true, false) . '> Logo koyu zemin için (beyaz logo)</label></div></div></details>';
    return $h;
}
function intrafarma_admin_partners() {
    $list = intrafarma_cms_partners();
    intrafarma_admin_head('İş ortakları', 'Ana sayfadaki kayan logo şeridi ve Hakkımızda sayfasındaki iş ortakları bölümü bu listeden oluşur.');
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" class="if-form if-list-form" data-name="partners">';
    wp_nonce_field('intrafarma_save_partners');
    echo '<input type="hidden" name="action" value="intrafarma_save_partners"><input type="hidden" name="json" value=""><p class="if-count"><span class="if-total">' . count($list) . '</span> iş ortağı</p><div class="if-list">';
    foreach ($list as $x) { echo intrafarma_partner_row((array) $x); }
    echo '</div><template class="if-tpl">' . intrafarma_partner_row(array()) . '</template>';
    echo '<p><button type="button" class="button if-add">+ İş ortağı ekle</button></p><div class="if-save"><button class="button button-primary button-hero">Kaydet</button></div></form>';
    intrafarma_reset_form('intrafarma_reset_partners', 'İlk iş ortağı listesine dön');
    echo '</div>';
}
add_action('admin_post_intrafarma_save_partners', function () {
    intrafarma_admin_guard('intrafarma_save_partners');
    $in = json_decode(isset($_POST['json']) ? wp_unslash($_POST['json']) : '', true);
    $out = array();
    foreach (is_array($in) ? $in : array() as $x) {
        $n = isset($x['n']) ? sanitize_text_field($x['n']) : '';
        $f = isset($x['f']) ? (string) $x['f'] : '';
        $f = preg_match('/^[a-z0-9-]+$/', $f) ? $f : esc_url_raw($f);
        if ($n === '' || $f === '') { continue; }                 // adı ya da logosu olmayan satır alınmaz
        $out[] = array('f' => $f, 'n' => $n, 'u' => isset($x['u']) ? esc_url_raw($x['u']) : '', 'dk' => !empty($x['dk']));
    }
    if ($out) { update_option('intrafarma_partners', $out); }
    intrafarma_admin_back('intrafarma-ortaklar', array('kayit' => 1));
});
add_action('admin_post_intrafarma_reset_partners', function () {
    intrafarma_admin_guard('intrafarma_reset_partners'); delete_option('intrafarma_partners');
    intrafarma_admin_back('intrafarma-ortaklar', array('kayit' => 'sifir'));
});

/* ---------- İletişim ve sosyal medya ---------- */
function intrafarma_admin_set() {
    $s = intrafarma_cms_set();
    intrafarma_admin_head('İletişim ve sosyal medya', 'İletişim sayfasındaki adres, telefon ve e-posta ile sitedeki sosyal medya simgelerinin bağlantıları. Bu bilgiler tüm dillerde aynıdır.');
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" class="if-form">';
    wp_nonce_field('intrafarma_save_set');
    echo '<input type="hidden" name="action" value="intrafarma_save_set"><h2>İletişim</h2><table class="form-table"><tbody>';
    echo '<tr><th><label for="if_adres">Adres</label></th><td><textarea id="if_adres" name="set[adres]" rows="3" class="large-text">' . esc_textarea($s['adres']) . '</textarea><p class="description">Boş bırakılırsa sitede "Hazırlanıyor" yazar.</p></td></tr>';
    echo '<tr><th><label for="if_tel">Telefon</label></th><td><input id="if_tel" type="text" name="set[telefon]" class="regular-text" value="' . esc_attr($s['telefon']) . '" placeholder="+90 212 000 00 00"><p class="description">Telefondan tıklanınca arama başlatır.</p></td></tr>';
    echo '<tr><th><label for="if_mail">E-posta</label></th><td><input id="if_mail" type="email" name="set[eposta]" class="regular-text" value="' . esc_attr($s['eposta']) . '" placeholder="info@intrafarma.com.tr"></td></tr>';
    echo '</tbody></table><h2>Sosyal medya</h2><p>Boş bırakılan hesabın simgesi sitede gizlenir.</p><table class="form-table"><tbody>';
    foreach (array('instagram' => 'Instagram', 'facebook' => 'Facebook', 'linkedin' => 'LinkedIn', 'youtube' => 'YouTube') as $k => $lab) {
        echo '<tr><th><label for="if_' . $k . '">' . $lab . '</label></th><td><input id="if_' . $k . '" type="url" name="set[' . $k . ']" class="large-text" value="' . esc_attr($s[$k]) . '" placeholder="https://"></td></tr>';
    }
    echo '</tbody></table><div class="if-save"><button class="button button-primary button-hero">Kaydet</button></div></form></div>';
}
add_action('admin_post_intrafarma_save_set', function () {
    intrafarma_admin_guard('intrafarma_save_set');
    $in = isset($_POST['set']) && is_array($_POST['set']) ? wp_unslash($_POST['set']) : array();
    $out = array(
        'adres' => isset($in['adres']) ? sanitize_textarea_field($in['adres']) : '',
        'telefon' => isset($in['telefon']) ? sanitize_text_field($in['telefon']) : '',
        'eposta' => isset($in['eposta']) ? sanitize_email($in['eposta']) : '',
    );
    foreach (array('instagram', 'facebook', 'linkedin', 'youtube') as $k) { $out[$k] = isset($in[$k]) ? esc_url_raw(trim($in[$k])) : ''; }
    update_option('intrafarma_set', $out);
    intrafarma_admin_back('intrafarma-iletisim', array('kayit' => 1));
});

/* ---------- Sayfalar listesinde ve düzenleyicide yönlendirici notlar ---------- */
function intrafarma_is_design_page($post) {
    if (!$post || $post->post_type !== 'page') { return false; }
    if ((int) get_option('page_on_front') === (int) $post->ID) { return true; }
    return !$post->post_parent && isset(INTRAFARMA_PAGES[$post->post_name]);
}
add_filter('display_post_states', function ($states, $post) {
    if (intrafarma_is_design_page($post)) { $states['intrafarma'] = 'Intrafarma tasarım sayfası'; }
    return $states;
}, 10, 2);
add_action('admin_notices', function () {
    $s = function_exists('get_current_screen') ? get_current_screen() : null;
    if (!$s || $s->base !== 'post' || $s->post_type !== 'page') { return; }
    global $post;
    if (!intrafarma_is_design_page($post)) { return; }
    echo '<div class="notice notice-info"><p><b>Bu sayfanın tasarımı ve içeriği temadan gelir.</b> Buraya yazılan yazı sitede görünmez. Yazıları değiştirmek için <a href="' . esc_url(intrafarma_admin_url('intrafarma-metinler')) . '">Intrafarma → Metinler</a>\'i kullanın. Bu sayfayı silmeyin.</p></div>';
});
