/* Sitenin varsayılan içeriğini (metinler, ürünler, iş ortakları) WordPress paneli için JSON'a döker.
   Kullanım: derlenmiş siteyi 127.0.0.1:8770'te sun, sonra: NODE_PATH=$(npm root -g) node dump_cms.js */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
 await p.goto(process.argv[2]||'http://127.0.0.1:8770/index.html');await p.waitForTimeout(1800);
 const out=await p.evaluate(()=>{
  const T=IF.T,D=window.IFD,langs=Object.keys(T);
  const tx={};langs.forEach(l=>{tx[l]={};Object.keys(T.tr).forEach(k=>{tx[l][k]=typeof T[l][k]==='string'?T[l][k]:String(T.tr[k]);});
   D.AX.tr.forEach((_,i)=>{tx[l]['ax_'+i]=(D.AX[l]||D.AX.en)[i];});D.CA.tr.forEach((_,i)=>{tx[l]['ca_'+i]=(D.CA[l]||D.CA.en)[i];});});
  /* her metnin sitede nerede durduğu */
  const G=[['header.site-top','Menü'],['footer','Alt bilgi'],['.ck-bar,.ck-dlg','Çerez bandı ve video'],['#gate','Sağlık çalışanı girişi'],
   ['.pro,#cat,#zoom,.pro-top','Sağlık çalışanları alanı (Pro)'],['#vUzmanlik,#vAlan','Uzmanlık'],['#vUrunler','Ürünler'],['#vHakkimizda','Hakkımızda'],
   ['#vUretim','Üretim'],['#vIletisim','İletişim'],['#vBilim','Bilim'],['#vGuncel','Güncel'],['#vHome','Ana sayfa']];
  const grp={};
  document.querySelectorAll('[data-t],[data-tl],[data-tp]').forEach(el=>{const k=el.dataset.t||el.dataset.tl||el.dataset.tp;
   for(const [sel,name] of G){if(el.closest(sel)){if(!grp[k]||name==='Menü')grp[k]=name;break;}}});
  const PF=[[/^(ax|ca)_/,'Ürünler'],[/^(ck_|yt_)/,'Çerez bandı ve video'],[/^hk_/,'Hakkımızda'],[/^(al_|ua_)/,'Uzmanlık'],[/^(uc_|cat_|d_ax|d_ca|d_lang|d_lede|op_|lk_|hp_)/,'Ürünler'],
   [/^(ur\d|ur_|lb_)/,'Üretim'],[/^(il_|pgi_)/,'İletişim'],[/^(ev_|bl_|gn_|pgg_)/,'Güncel'],[/^(bk_|fq|pgb_)/,'Bilim'],[/^(g_|p[1-7]$|c[1-6]$|e_)/,'Sağlık çalışanı girişi'],
   [/^(rq_|dt_|dq|d_|d\d|s_|m_|pub_|ps_|k\d|z_|tab|dd|dt\d|pn|pc_|pd_|pr_|p_|via|logout|pro_)/,'Sağlık çalışanları alanı (Pro)'],
   [/^(ft_)/,'Alt bilgi'],[/^(nav|hcp|pg_home|all_|bc|ov$|close|totop|draft|pend|prog)/,'Menü'],[/./,'Ana sayfa']];
  Object.keys(tx.tr).forEach(k=>{if(!grp[k]){for(const [re,name] of PF){if(re.test(k)){grp[k]=name;break;}}}});
  const prods=D.PRODS.map(p=>({n:p.n,a:p.a,open:!!p.open}));
  return {langs,tx,grp,prods,axca:D.AXCA};});
 /* iş ortakları kaynak koddan */
 const src=fs.readFileSync(path.join(__dirname,'app.html'),'utf8');const m=/\|\|(\[\[.*?\]\]);\s*\nconst track/s.exec(src);
 out.partners=(m?eval(m[1]):[]).map(([f,n,u,dk])=>({f,n,u:u||'',dk:!!dk}));
 fs.writeFileSync(path.join(__dirname,'cms_defaults.json'),JSON.stringify(out));
 const c={};Object.values(out.grp).forEach(g=>{c[g]=(c[g]||0)+1;});
 console.log('metin',Object.keys(out.tx.tr).length,'× dil',out.langs.length,'| ürün',out.prods.length,'| ortak',out.partners.length);console.log(c);
 await b.close();})();
