/* Intrafarma içerik paneli: liste düzenleme (ekle, sil, sırala), görsel seçici, metinlerde ilk hale dönme */
(function ($) {
  'use strict';
  // metinler: ilk haline dön
  $(document).on('click', '.if-reset', function () {
    var t = $(this).closest('td').find('textarea'); t.val(t.data('def')).trigger('focus');
  });

  // listeler (ürünler, iş ortakları)
  $('.if-list-form').each(function () {
    var form = $(this), list = form.find('.if-list'), tpl = form.find('template.if-tpl').get(0);
    function count() { form.find('.if-total').text(list.children('.if-item').length); }
    form.on('click', '.if-add', function () {
      var el = $(tpl.content ? tpl.content.firstElementChild.cloneNode(true) : $(tpl).html());
      list.append(el); el.attr('open', 'open'); el.find('.if-name').trigger('focus'); count();
      el.get(0).scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    form.on('click', '.if-del', function (e) {
      e.preventDefault(); var it = $(this).closest('.if-item');
      var name = it.find('.if-name').val() || 'Bu satır';
      if (window.confirm('"' + name + '" listeden silinsin mi? Kaydet\'e basana kadar kalıcı olmaz.')) { it.remove(); count(); }
    });
    form.on('click', '.if-up,.if-down', function (e) {
      e.preventDefault(); var it = $(this).closest('.if-item');
      if ($(this).hasClass('if-up')) { it.prev('.if-item').before(it); } else { it.next('.if-item').after(it); }
    });
    form.on('change', 'select[data-f="a"]', function () { $(this).closest('.if-item').find('> summary .if-sub').text($(this).find('option:selected').text().replace(/^\d+\s·\s/, '')); });
    form.on('input', '.if-name', function () { $(this).closest('.if-item').find('> summary .if-title').text(this.value || '—'); });
    // gönderirken tüm satırları tek bir JSON alanına topla (satır sayısı sınırına takılmasın)
    form.on('submit', function () {
      var rows = [];
      list.children('.if-item').each(function () {
        var o = {};
        $(this).find('[data-f]').each(function () {
          var k = String($(this).data('f')), v = this.type === 'checkbox' ? this.checked : $(this).val();
          if (k.indexOf('.') > 0) { var p = k.split('.'); o[p[0]] = o[p[0]] || {}; o[p[0]][p[1]] = v; } else { o[k] = v; }
        });
        rows.push(o);
      });
      form.find('input[name=json]').val(JSON.stringify(rows));
    });
  });

  // görsel seçici (WordPress ortam kütüphanesi)
  $(document).on('click', '.if-pick', function (e) {
    e.preventDefault(); var box = $(this).closest('.if-media'), item = $(this).closest('.if-item');
    var frame = wp.media({ title: 'Görsel seç', button: { text: 'Bu görseli kullan' }, library: { type: 'image' }, multiple: false });
    frame.on('select', function () {
      var a = frame.state().get('selection').first().toJSON();
      var url = (a.sizes && a.sizes.large ? a.sizes.large.url : a.url);
      box.find('input[type=hidden]').val(url);
      box.find('.if-prev').html($('<img alt="">').attr('src', url));
      item.find('> summary .if-thumb').html($('<img alt="">').attr('src', url));
    });
    frame.open();
  });
  $(document).on('click', '.if-clear', function (e) {
    e.preventDefault(); var box = $(this).closest('.if-media');
    box.find('input[type=hidden]').val(''); box.find('.if-prev').html('<span>Görsel yok</span>');
  });
})(jQuery);
