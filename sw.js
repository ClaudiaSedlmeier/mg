// Mein Geld: App-Dateien für den Offline-Betrieb zwischenspeichern. Deine Daten liegen NICHT hier, sondern im Gerätespeicher der App.
const CACHE = "mein-geld-2026-11-11c";
const DATEIEN = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  // Seite: erst Internet (für Updates), sonst gespeicherte Fassung. Rest: erst gespeichert.
  if (r.mode === "navigate") {
    // Nur eine gute Antwort übernehmen; bei Fehlerseite (z. B. 404) oder ohne Internet die gespeicherte App zeigen
    e.respondWith(fetch(r).then(res => {
      if (!res.ok) return caches.match("./index.html").then(hit => hit || res);
      const k = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", k)); return res;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r)));
});
