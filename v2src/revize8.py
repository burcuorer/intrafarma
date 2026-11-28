import io, os, re
# Revize 8 (28.11.2026): eksozom videosundaki hücre. Organel kartları ve hücre turu kalkar; hücreye tıklayınca eksozom
# tomurcuklanıp kopar, eksozoma tıklayınca büyüteçte içindekiler görünür. Pro geçişindeki bölünme ve Pro alanındaki hücre de aynı hücre.
# Hücre modülü cell3.js'tedir (mkcell3.py ile üretilir). transform.py'nin sonunda revize7'den sonra uygulanır.

_R8_CSS = '''
/* Revize 8: eksozom hücresi */
html[data-page=home] #hucre .stage{height:clamp(560px,70vh,660px)!important}
html.c3 #hucre :is(.oc,.oc-tabs,.ocs,.tour-bar,.mk,.ll){display:none!important}
html.c3:not(.stage-full) #stage{cursor:grab}
html.c3:not(.stage-full) #stage :is(button,a,label){cursor:pointer}
html.c3:not(.stage-full) #stage .lens{display:none!important}
#stage .btns{transition:opacity .3s}
#stage.x-open .btns{opacity:0;pointer-events:none}
.x-ring{position:absolute;z-index:6;border-radius:50%;border:1.5px solid rgba(255,255,255,.85);box-shadow:0 0 0 7px rgba(255,255,255,.07),0 22px 60px rgba(0,0,0,.4);pointer-events:none;opacity:0;transform:scale(.85);transition:opacity .35s,transform .5s cubic-bezier(.2,.8,.2,1)}
.x-ring.on{opacity:1;transform:none}
.x-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:6;opacity:0;overflow:visible}
.x-lbl{position:absolute;z-index:6;font:500 13px/1.25 var(--f-b);color:#fff;padding:6px 9px;border:1px solid rgba(255,255,255,.8);background:rgba(4,34,44,.6);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transform:translateY(-50%);opacity:0;transition:opacity .4s .15s;pointer-events:none;width:max-content}
.x-lbl.l{transform:translate(-100%,-50%)}
.x-lbl.on{opacity:1}
.x-info{position:absolute;z-index:7;width:380px;padding:16px 18px 18px;border-radius:16px;background:rgba(5,32,42,.82);border:1px solid rgba(255,255,255,.16);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);color:#ecf8f5;opacity:0;transform:translateY(8px);transition:opacity .35s,transform .35s;cursor:auto;text-align:start}
.x-info.on{opacity:1;transform:none}
.x-info h3{font:600 22px/1.1 var(--f-d);margin:0 40px 4px 0;color:#fff;letter-spacing:-.01em}
.x-info .x-size{margin:0 0 8px;color:#a6f3cf;font-size:14px}
.x-info .x-t{margin:0 0 14px;font-size:15px;line-height:1.45;color:#d6ebe8}
.x-cargo{display:none;flex-wrap:wrap;gap:6px;list-style:none;margin:0 0 14px;padding:0}
.x-cargo li{font-size:13px;padding:4px 9px;border:1px solid rgba(255,255,255,.35);border-radius:99px;color:#fff}
.x-cta{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:99px;background:#a6f3cf;color:#05202a!important;font:600 15px/1 var(--f-d);text-decoration:none}
.x-cta:hover{background:#c8fbe2}
.x-x{position:absolute;top:10px;right:10px;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:transparent;color:#fff;font-size:22px;line-height:1;display:grid;place-items:center;padding:0}
.x-x:hover{background:rgba(255,255,255,.1)}
html[dir=rtl] .x-x{right:auto;left:10px}
html[dir=rtl] .x-info h3{margin:0 0 4px 40px}
@media (max-width:760px){.x-info{left:10px;right:10px;bottom:10px;top:auto;width:auto}.x-cargo{display:flex}}
'''

def revize8(h):
    here = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else HERE
    cell = io.open(os.path.join(HERE, 'cell3.js'), encoding='utf-8').read()
    m = re.search(r'(<script type="text/x-cell-module" id="cellMod"[^>]*>)(.*?)(</script>)', h, re.S)
    if not m:
        raise SystemExit('REVİZE 8: hücre modülü bulunamadı')
    h = h[:m.start(2)] + '\n' + cell + '\n' + h[m.end(2):]
    if h.count('</style>') != 1:
        raise SystemExit('REVİZE 8: stil bloğu sayısı')
    h = h.replace('</style>', _R8_CSS + '</style>')
    return h
