<?php
/**
 * Talepler: numune, belge, fiyat teklifi ve bilgi istekleri.
 * Site formu -> WordPress'e kaydedilir -> paneldeki adres(ler)e e-posta gider -> firma elle yanıtlar.
 * Otomatik belge gönderimi yoktur; belgeyi indirilebilir yapmak için ürüne PDF yüklemek yeterlidir.
 */
if (!defined('ABSPATH')) { exit; }

define('INTRAFARMA_TALEP_TUR', array('numune' => 'Numune', 'belge' => 'Belge', 'teklif' => 'Fiyat teklifi', 'bilgi' => 'Bilgi', 'bayilik' => 'Bayilik başvurusu', 'isbirligi' => 'İş birliği başvurusu', 'yanetki' => 'Yan etki bildirimi'));

add_action('init', function () {
    register_post_type('if_talep', array(
        'label' => 'Talepler', 'public' => false, 'show_ui' => false, 'show_in_rest' => false,
        'exclude_from_search' => true, 'publicly_queryable' => false, 'supports' => array('title'),
    ));
});

function intrafarma_talep_alicilar() {
    // adres ayrı bir ayarda durur; siteye (window.IF_CMS) hiç gönderilmez
    $s = get_option('intrafarma_set'); $s = is_array($s) ? $s : array();
    $own = trim((string) get_option('intrafarma_talep_eposta', ''));
    $raw = $own !== '' ? $own : (isset($s['eposta']) && $s['eposta'] !== '' ? (string) $s['eposta'] : get_option('admin_email'));
    $out = array();
    foreach (preg_split('/[\s,;]+/', $raw) as $e) { $e = sanitize_email($e); if ($e && is_email($e)) { $out[] = $e; } }
    return array_values(array_unique($out));
}

add_action('rest_api_init', function () {
    register_rest_route('intrafarma/v1', '/talep', array('methods' => 'POST', 'permission_callback' => '__return_true', 'callback' => function ($req) {
        $g = function ($k, $n = 300) use ($req) { return mb_substr(sanitize_text_field((string) $req->get_param($k)), 0, $n); };
        if ($g('web') !== '') { return array('ok' => true, 'ref' => 'IF-0'); }               // bot tuzağı: sessizce yok say
        $tur = $g('tur', 20); if (!isset(INTRAFARMA_TALEP_TUR[$tur])) { $tur = 'bilgi'; }
        $mail = sanitize_email((string) $req->get_param('eposta'));
        if (!$mail || !is_email($mail)) { return new WP_Error('eposta', 'E-posta geçersiz', array('status' => 400)); }
        if (!$req->get_param('onay')) { return new WP_Error('onay', 'Onay gerekli', array('status' => 400)); }
        // aynı adresten saatte en çok 8 talep
        $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
        $key = 'if_tlp_' . md5($ip . wp_salt('nonce'));
        $n = (int) get_transient($key);
        if ($n >= 8) { return new WP_Error('sinir', 'Çok fazla talep', array('status' => 429)); }
        set_transient($key, $n + 1, HOUR_IN_SECONDS);

        $f = array(
            'tur' => $tur, 'urun' => $g('urun', 120), 'kurum' => $g('kurum', 160), 'ad' => $g('ad', 120), 'unvan' => $g('unvan', 120),
            'tel' => $g('tel', 40), 'eposta' => $mail, 'adet' => $g('adet', 10), 'not' => mb_substr(sanitize_textarea_field((string) $req->get_param('not')), 0, 2000),
            'meslek' => $g('meslek', 80), 'ulke' => $g('ulke', 80), 'sehir' => $g('sehir', 120), 'site' => esc_url_raw($g('site', 190)), 'dil' => $g('dil', 5), 'sayfa' => $g('sayfa', 190), 'lot' => $g('lot', 60), 'tarih' => $g('tarih', 20), 'bulten' => $req->get_param('bulten') ? 1 : 0,
        );
        $title = INTRAFARMA_TALEP_TUR[$tur] . ($f['urun'] !== '' ? ' · ' . $f['urun'] : '') . ' · ' . ($f['kurum'] !== '' ? $f['kurum'] : $mail);
        $id = wp_insert_post(array('post_type' => 'if_talep', 'post_status' => 'private', 'post_title' => $title), true);
        if (is_wp_error($id)) { return new WP_Error('kayit', 'Kaydedilemedi', array('status' => 500)); }
        foreach ($f as $k => $v) { update_post_meta($id, '_if_' . $k, $v); }
        update_post_meta($id, '_if_durum', 'yeni');
        $ref = 'IF-' . gmdate('Y') . '-' . str_pad((string) $id, 4, '0', STR_PAD_LEFT);
        update_post_meta($id, '_if_ref', $ref);

        $etiket = array('tur' => 'Talep türü', 'urun' => 'Ürün', 'kurum' => 'Kurum', 'ad' => 'Ad soyad', 'unvan' => 'Unvan', 'tel' => 'Telefon', 'eposta' => 'E-posta',
            'adet' => 'Adet', 'sehir' => 'Şehir / ülke', 'site' => 'Web sitesi', 'not' => 'Not', 'meslek' => 'Beyan edilen meslek', 'ulke' => 'Ülke', 'dil' => 'Site dili', 'sayfa' => 'Gönderildiği sayfa', 'lot' => 'Lot / seri no', 'tarih' => 'Olay tarihi', 'bulten' => 'Bülten izni');
        $body = "Sitede yeni bir talep var. Referans: $ref\n\n";
        foreach ($etiket as $k => $lab) {
            $v = $k === 'tur' ? INTRAFARMA_TALEP_TUR[$tur] : ($k === 'bulten' ? ($f['bulten'] ? 'Evet' : 'Hayır') : $f[$k]);
            if ($v !== '' && $v !== null) { $body .= $lab . ': ' . $v . "\n"; }
        }
        $body .= "\nYanıtlamak için bu e-postayı doğrudan yanıtlayabilirsiniz; yanıt talep sahibine gider.\nTüm talepler: " . admin_url('admin.php?page=intrafarma-talepler') . "\n";
        $to = intrafarma_talep_alicilar();
        $sent = $to ? wp_mail($to, '[Intrafarma] ' . $title . ' · ' . $ref, $body, array('Reply-To: ' . ($f['ad'] !== '' ? $f['ad'] : $mail) . ' <' . $mail . '>')) : false;
        update_post_meta($id, '_if_eposta_gitti', $sent ? 1 : 0);
        return array('ok' => true, 'ref' => $ref);
    }));
});

/* ---------- panel: Talepler ---------- */
add_action('admin_menu', function () {
    $c = (int) (new WP_Query(array('post_type' => 'if_talep', 'post_status' => 'private', 'meta_key' => '_if_durum', 'meta_value' => 'yeni', 'fields' => 'ids', 'posts_per_page' => 99, 'no_found_rows' => true)))->post_count;
    add_submenu_page('intrafarma', 'Talepler', 'Talepler' . ($c ? ' <span class="awaiting-mod">' . $c . '</span>' : ''), INTRAFARMA_CAP, 'intrafarma-talepler', 'intrafarma_admin_talep');
}, 20);

function intrafarma_admin_talep() {
    intrafarma_admin_head('Talepler', 'Sitedeki numune, belge, fiyat teklifi ve bilgi talepleri ile bayilik ve iş birliği başvuruları. Her talep aşağıdaki adreslere e-postayla da gelir; yanıtı siz elle gönderirsiniz. Yanıtladığınız talebi “Yanıtlandı” olarak işaretleyin.');
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" class="if-form">';
    wp_nonce_field('intrafarma_save_talep_set');
    echo '<input type="hidden" name="action" value="intrafarma_save_talep_set"><table class="form-table"><tbody><tr><th><label for="if_te">Taleplerin gideceği e-posta</label></th><td><input id="if_te" type="text" class="large-text" name="talep_eposta" value="' . esc_attr((string) get_option('intrafarma_talep_eposta', '')) . '" placeholder="' . esc_attr(implode(', ', intrafarma_talep_alicilar())) . '"><p class="description">Birden çok adres için virgülle ayırın. Boşsa İletişim ekranındaki e-posta kullanılır. Şu an: <b>' . esc_html(implode(', ', intrafarma_talep_alicilar())) . '</b></p></td></tr></tbody></table><p><button class="button button-primary">Adresi kaydet</button></p></form>';

    $q = new WP_Query(array('post_type' => 'if_talep', 'post_status' => 'private', 'posts_per_page' => 200, 'orderby' => 'date', 'order' => 'DESC'));
    echo '<h2>Son talepler <span class="if-sub">(' . (int) $q->found_posts . ')</span></h2>';
    if (!$q->have_posts()) { echo '<p>Henüz talep yok.</p></div>'; return; }
    echo '<table class="widefat striped if-talep"><thead><tr><th>Tarih</th><th>Tür</th><th>Ürün</th><th>Kişi</th><th>İletişim</th><th>Not</th><th>Durum</th></tr></thead><tbody>';
    foreach ($q->posts as $p) {
        $m = function ($k) use ($p) { return (string) get_post_meta($p->ID, '_if_' . $k, true); };
        $tur = $m('tur'); $durum = $m('durum') === 'yanit' ? 'yanit' : 'yeni';
        $kisi = trim($m('ad') . ($m('unvan') !== '' ? ' · ' . $m('unvan') : '') . ($m('kurum') !== '' ? '<br><small>' . esc_html($m('kurum')) . '</small>' : ''));
        echo '<tr class="' . ($durum === 'yeni' ? 'if-new' : '') . '"><td>' . esc_html(get_date_from_gmt($p->post_date_gmt, 'd.m.Y H:i')) . '<br><small>' . esc_html($m('ref')) . '</small></td>';
        echo '<td>' . esc_html(isset(INTRAFARMA_TALEP_TUR[$tur]) ? INTRAFARMA_TALEP_TUR[$tur] : $tur) . ($m('adet') !== '' ? '<br><small>' . esc_html($m('adet')) . ' adet</small>' : '') . '</td>';
        echo '<td>' . esc_html($m('urun')) . '</td><td>' . wp_kses($kisi, array('br' => array(), 'small' => array())) . ($m('meslek') !== '' ? '<br><small>Beyan: ' . esc_html($m('meslek')) . ($m('ulke') !== '' ? ', ' . esc_html($m('ulke')) : '') . '</small>' : '') . '</td>';
        echo '<td><a href="mailto:' . esc_attr($m('eposta')) . '">' . esc_html($m('eposta')) . '</a>' . ($m('tel') !== '' ? '<br><small>' . esc_html($m('tel')) . '</small>' : '') . ($m('eposta_gitti') === '0' ? '<br><small class="if-warn">E-posta bildirimi gönderilemedi</small>' : '') . '</td>';
        echo '<td>' . nl2br(esc_html($m('not'))) . '</td><td><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        wp_nonce_field('intrafarma_talep_durum');
        echo '<input type="hidden" name="action" value="intrafarma_talep_durum"><input type="hidden" name="id" value="' . (int) $p->ID . '"><input type="hidden" name="durum" value="' . ($durum === 'yeni' ? 'yanit' : 'yeni') . '">';
        echo '<span class="if-st ' . $durum . '">' . ($durum === 'yeni' ? 'Yeni' : 'Yanıtlandı') . '</span> <button class="button-link">' . ($durum === 'yeni' ? 'Yanıtlandı yap' : 'Yeniye al') . '</button></form></td></tr>';
    }
    echo '</tbody></table></div>';
}
add_action('admin_post_intrafarma_save_talep_set', function () {
    intrafarma_admin_guard('intrafarma_save_talep_set');
    update_option('intrafarma_talep_eposta', sanitize_text_field(wp_unslash(isset($_POST['talep_eposta']) ? $_POST['talep_eposta'] : '')), false);
    intrafarma_admin_back('intrafarma-talepler', array('kayit' => 1));
});
add_action('admin_post_intrafarma_talep_durum', function () {
    intrafarma_admin_guard('intrafarma_talep_durum');
    $id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
    if ($id && get_post_type($id) === 'if_talep') { update_post_meta($id, '_if_durum', (isset($_POST['durum']) && $_POST['durum'] === 'yanit') ? 'yanit' : 'yeni'); }
    intrafarma_admin_back('intrafarma-talepler', array());
});
