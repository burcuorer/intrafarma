# Intrafarma Web Sitesi — Proje Kuralları

Bu repo, Intrafarma (rejeneratif tıp şirketi) web sitesi yenileme projesinin GitHub prototipidir.
Kurumsal site + sağlık profesyonellerine özel **Pro platformu**. Nihai site WordPress üzerinde çalışacak.

Benimle Türkçe konuş. Açıklamaları kısa ve net tut.

## Çalışma akışı (sabit)
1. Değişiklikleri bu repoda yap.
2. Her yeni versiyon önce **GitHub Pages'te canlı** görülür: https://burcuorer.github.io/intrafarma
3. Ben GitHub'da onay verene kadar **WordPress tema paketi hazırlama**.
4. Onaydan sonra WordPress aşamasına geçilir. Bu aşama GitHub'dan bağımsızdır: WordPress tema/dosyaları doğrudan **test.intrafarma.com.tr** test alan adı üzerinde hazırlanır ve test edilir.
5. Canlıya geçiş en son yapılır. Özel veriler (erişim bilgileri, iletişim bilgileri, takip/analitik kodları vb.) repoda tutulmaz; ayrı saklanır ve yalnızca bu son yayın adımında, doğrudan WordPress tarafında eklenir.

## Asla yapma
- Prototip adresini değiştirme, silme veya yeni bir adrese taşıma. Bu link müşteriyle paylaşıldı, yeni versiyonlar hep aynı adreste yayınlanmalı.
- Mevcut çalışan versiyonu habersiz bozma. Büyük yapı değişikliklerinde önce planı göster, onay bekle.
- Pro alanının işleyişini/kullanılabilirliğini bozacak değişiklik yapma.
- Repoya şifre, erişim bilgisi, müşteri iletişim bilgisi veya API anahtarı ekleme.

## Revize geldiğinde
1. Revize listesini maddelere ayır, her madde için ne yapacağını kısaca yaz (plan).
2. Belirsiz maddeleri sor, tahminle uygulama.
3. Onaydan sonra uygula, commit mesajında hangi revize maddesi olduğunu belirt.
4. Sonunda: ne değişti, GitHub Pages'te nereden kontrol edilir — kısa özet.

## Tasarım ilkeleri
- Kurumsal, açık tonlu (fazla koyu değil), minimal ve klinik görünüm. Uçuk deneysel konseptler yok.
- Ana sayfa gereksiz uzun olmasın, bilgi tekrarlanmasın.
- Ana sayfada açıklamalı interaktif hücre kalacak; sayaç (counting number) animasyonu olacak.
- Şirket videoları ana sayfaya değil, Hakkımızda ve "Basında Biz" bölümlerine. Videolar YouTube embed.
- Ürün fotoğrafları: tüm ürünler aynı düz önden açıyla.

## Site yapısı
- Kurumsal site: ürün sayfaları **sağlık profesyoneli onayı** olmadan açılmaz.
- Pro alanı: aynı ürünler, daha detaylı açıklamalar. Ürün katalog PDF'i sadece Pro alanında indirilebilir.
- Ürün sayısı ~35'e çıkabilir; yapı buna göre ölçeklenmeli.
- Numune/doküman talep formları e-postaya düşer, otomatik gönderim yok.
- Diller (7): Türkçe, İngilizce, İspanyolca, Fransızca, Arapça, İtalyanca, Rusça. Arapça için RTL düzenini unutma.
- Aşamalı yayın: önce kurumsal vitrin → ürün kataloğu → en son Pro alanı.

## WordPress'e geçiş için
- Müşteri ekibi metin, görsel, ürün verisi ve ürün videolarını kendisi ekleyip düzenleyebilmeli.
- Ana iskelet, tasarım ve büyük videolar kilitli kalmalı (müşteri bozamamalı).
- Çerez/KVKK metinleri tek site için, en sade ve en az onay gerektiren hâliyle.
- Google Analytics canlıya geçişten sonra eklenecek.
