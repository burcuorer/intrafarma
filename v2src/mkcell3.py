# Revize 8: yeni hücre modülünü (cell3.js) eski modülün arka plan / ürün görüntüleyici parçalarıyla birleştirir.
import io,re,sys
old=io.open('cell2_base.js',encoding='utf-8').read().split('\n')
head='\n'.join(old[0:97])           # 1..96: içe aktarımlar, renderer, arka plan, kopya katmanı
noisef='\n'.join(old[99:104])        # snoise fonksiyonları
prod='\n'.join(old[282:372])         # ürün 3B görüntüleyici
assert old[97].startswith('const U='), old[97][:40]
assert old[282].startswith('/* product 3D'), old[282][:40]
assert old[371].strip()=='}', repr(old[371])
head=head.replace("const RTS=0.6;","let RTS=0.6;",1)
i=head.index(' vec3 pubCol(vec2 uv,vec2 px,float pl){'); j=head.index(' vec3 proCol(vec2 uv,float pl){')
PUB=''' vec3 pubCol(vec2 uv,vec2 px,float pl){
  float t=uTime*0.012;vec2 q=uv*vec2(uRes.x/uRes.y,1.0)*1.7;
  float n=fbm(q+vec2(t,-t*0.6)+fbm(q*1.3-t)*1.2);float m=fbm(q*0.7+vec2(-t*0.5,t)+3.1);
  vec3 c=mix(vec3(0.07,0.23,0.40),vec3(0.09,0.44,0.48),smoothstep(0.22,0.62,m));
  c=mix(c,vec3(0.26,0.66,0.53),smoothstep(0.40,0.74,n)*0.8);
  c=mix(c,vec3(0.58,0.87,0.73),smoothstep(0.62,0.86,n)*0.42);
  float dc=distance(px,uCell)/uRes.y;
  c=mix(c,vec3(0.55,0.86,0.80),smoothstep(0.55,0.04,dc)*0.16);
  c+=waves(uv,n,m,pl)*0.045*vec3(0.80,1.0,0.95);
  c+=pl*0.02;
  c*=1.0-0.28*smoothstep(0.45,0.95,distance(uv,vec2(0.5)));
  return c;}
'''
head=head[:i]+PUB+head[j:]
mid=io.open('cell3_mid.js',encoding='utf-8').read().replace('const NOISEF=SNOISE_FN;','const NOISEF=`'+noisef+'`;')
lay=io.open('cell3_layout.js',encoding='utf-8').read()
loop=io.open('cell3_loop.js',encoding='utf-8').read()
out=head+'\n'+mid+'\n'+lay+'\n'+prod+'\n'+loop
io.open('cell3.js','w',encoding='utf-8',newline='\n').write(out)
print('cell3.js',len(out))
