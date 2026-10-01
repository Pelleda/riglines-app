var CACHE = "riglines-v4";
var CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./favicon.png",
  "./riglines-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(CORE);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var fetchPromise = fetch(e.request).then(function (networkResp) {
        if (networkResp && networkResp.ok && e.request.url.indexOf("chrome-extension") === -1) {
          var respClone = networkResp.clone();
          caches.open(CACHE).then(function (cache) { cache.put(e.request, respClone); });
        }
        return networkResp;
      }).catch(function () { return cached; });
      return cached || fetchPromise;
    })
  );
});
