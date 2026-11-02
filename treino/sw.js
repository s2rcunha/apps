// Mude o número da versão (plano-corrida-vN) sempre que atualizar o treino.html no servidor
const V='plano-corrida-v10';
const ASSETS=['./treino.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all(ASSETS.map(a=>c.add(a).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>(k.startsWith('plano-corrida-')&&k!==V)||k==='corrida-v1').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// Abre instantâneo do cache e atualiza em segundo plano (funciona offline)
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(V),hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>null);
    e.waitUntil(net);
    return hit||await net||(r.mode==='navigate'?await c.match('./treino.html'):Response.error());
  })());
});
