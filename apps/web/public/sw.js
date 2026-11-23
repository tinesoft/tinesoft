// Offline support: pages are network-first (fresh after each daily build), everything else
// is cache-first, since Astro fingerprints its assets.
const CACHE = 'tinesoft-v1'
const SHELL = ['/', '/manifest.webmanifest', '/icon.svg', '/favicon.svg', '/favicon-terracotta.svg']

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const copy = res.clone()
          caches.open(CACHE).then(cache => cache.put(request, copy))
          return res
        })
        .catch(() => caches.match(request).then(hit => hit || caches.match('/'))),
    )
    return
  }

  event.respondWith(
    caches.match(request).then(
      hit =>
        hit ||
        fetch(request).then(res => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then(cache => cache.put(request, copy))
          }
          return res
        }),
    ),
  )
})
