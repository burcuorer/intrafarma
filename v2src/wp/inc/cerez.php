<?php
if (!defined('ABSPATH')) { exit; }
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

