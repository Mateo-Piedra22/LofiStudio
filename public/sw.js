const CACHE_NAME = 'lofi-studio-cache-v2'
const PRECACHE = ['/', '/manifest.json', '/icon.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

async function networkFirst(req) {
  try {
    const fresh = await fetch(req)
    const cache = await caches.open(CACHE_NAME)
    cache.put(req, fresh.clone())
    return fresh
  } catch (e) {
    const cached = await caches.match(req)
    return cached || new Response('', { status: 503 })
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(req)
  try {
    const resp = await fetch(req)
    cache.put(req, resp.clone())
    return resp
  } catch (e) {
    return cached || new Response('', { status: 503 })
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET') return
  if (event.request.destination === 'document') {
    event.respondWith(networkFirst(event.request))
    return
  }
  if (url.origin === location.origin) {
    if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/_next/image') || url.pathname.startsWith('/images/') || url.pathname === '/icon.png') {
      event.respondWith(staleWhileRevalidate(event.request))
      return
    }
  }
  // Do not intercept cross-origin requests to avoid CORS/opaque response issues
})
