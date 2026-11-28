# Revize 9 (28.11.2026): ana sayfa video geçişinde alt yazılar kalkar; Ürünler sayfası başlık görsellerinde
# geçiş sırasında soldan taşan açık renkli şerit kapatılır (büyütülmüş görsel çerçevenin dışına taşıyordu).
_R9_CSS = '''
/* Revize 9 */
.vh .vh-cap{display:none!important}
.pg-loop{overflow:hidden;clip-path:inset(0)}
'''
def revize9(h):
    if h.count('</style>') != 1:
        raise SystemExit('REVİZE 9: stil bloğu sayısı')
    return h.replace('</style>', _R9_CSS + '</style>')
