/* gaind ADG 2026: Offline-Cache für die Messe-App */
var CACHE='gaind-adg-93f1ea67d2';
var ASSETS=['./','manifest.json','icon-180.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k.indexOf('gaind-adg-')===0&&k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
/* Netz zuerst (max. 4 s), sonst Cache: Updates kommen an, offline läuft es trotzdem */
self.addEventListener('fetch',function(e){
  var req=e.request; if(req.method!=='GET')return;
  var u=new URL(req.url); if(u.origin!==location.origin)return;
  var key=(req.mode==='navigate'||/\/(index\.html)?$/.test(u.pathname))?'./':req.url;
  e.respondWith(new Promise(function(resolve){
    var done=false;
    function fromCache(){return caches.open(CACHE).then(function(c){return c.match(key,{ignoreSearch:true})})}
    var t=setTimeout(function(){fromCache().then(function(r){if(r&&!done){done=true;resolve(r)}})},4000);
    fetch(req,{cache:'no-store'}).then(function(res){
      if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(key,copy)})}
      if(!done){done=true;clearTimeout(t);resolve(res)}
    }).catch(function(){
      fromCache().then(function(r){if(!done){done=true;clearTimeout(t);resolve(r||new Response('Offline',{status:503}))}});
    });
  }));
});
