// Pocketboard offline shell. Caches only the app's own static files.
// Never touches task data (that stays encrypted in IndexedDB). No network calls to other origins.
const CACHE='pocketboard-shell-v1';
const FILES=['./','index.html','manifest.webmanifest','icon.svg','icon-maskable.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>fetch(new Request(f,{cache:'reload'})).then(r=>{if(!r.ok)throw new Error(f);return c.put(f,r)})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
// Network first (so updates arrive whenever online), cached copy when offline.
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin)return;
e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok&&res.type==='basic'){const a=res.clone(),b=res.clone();caches.open(CACHE).then(c=>{c.put(r,a);if(r.mode==='navigate')c.put('index.html',b)})}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):Response.error()))))});
