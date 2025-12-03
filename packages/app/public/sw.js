const CACHE_NAME = 'beatschain-v1'
const STATIC_CACHE = 'beatschain-static-v1'
const DYNAMIC_CACHE = 'beatschain-dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/offline.html'
]

const CACHE_STRATEGIES = {
  beats: 'cache-first',
  api: 'network-first',
  static: 'cache-first',
  images: 'cache-first'
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Handle Web3 wallet connections - always network
  if (url.pathname.includes('/api/auth') || url.pathname.includes('wallet')) {
    return
  }
  
  // Handle beat audio files - cache first
  if (url.pathname.includes('/beats/') && request.destination === 'audio') {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE))
    return
  }
  
  // Handle API calls - network first with fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
    return
  }
  
  // Handle static assets - cache first
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }
  
  // Handle navigation - network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/offline.html'))
    )
  }
})

async function cacheFirst(request, cacheName) {
  // Early validation for unsupported schemes
  const url = typeof request === 'string' ? request : (request && request.url)
  if (typeof url === 'string' && !/^https?:\/\//i.test(url)) {
    // For unsupported schemes, try to fetch directly without caching
    try {
      return await fetch(request)
    } catch (error) {
      return new Response('Unsupported scheme', { status: 400 })
    }
  }

  const cached = await caches.match(request)
  if (cached) return cached
  
  try {
    const response = await fetch(request)
    if (response.ok && response.status < 400) {
      const cache = await caches.open(cacheName)
      try {
        // Double-check URL scheme before caching
        if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
          await cache.put(request, response.clone())
        }
      } catch (err) {
        // Silently skip cache errors to prevent breaking the response
        console.warn('sw: cache.put failed (skipping):', err && err.message)
      }
    }
    return response
  } catch (error) {
    console.warn('sw: fetch failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request, cacheName) {
  // Early validation for unsupported schemes
  const url = typeof request === 'string' ? request : (request && request.url)
  if (typeof url === 'string' && !/^https?:\/\//i.test(url)) {
    // For unsupported schemes, try to fetch directly without caching
    try {
      return await fetch(request)
    } catch (error) {
      return new Response('Unsupported scheme', { status: 400 })
    }
  }

  try {
    const response = await fetch(request)
    if (response.ok && response.status < 400) {
      const cache = await caches.open(cacheName)
      try {
        // Double-check URL scheme before caching
        if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
          await cache.put(request, response.clone())
        }
      } catch (err) {
        // Silently skip cache errors to prevent breaking the response
        console.warn('sw: cache.put failed (skipping):', err && err.message)
      }
    }
    return response
  } catch (error) {
    console.warn('sw: network request failed, trying cache:', error)
    const cached = await caches.match(request)
    return cached || new Response('Offline', { status: 503 })
  }
}

// Background sync for Web3 transactions
self.addEventListener('sync', event => {
  if (event.tag === 'web3-transaction') {
    event.waitUntil(syncWeb3Transactions())
  }
})

async function syncWeb3Transactions() {
  // Handle pending Web3 transactions when back online
  const pendingTxs = await getStoredTransactions()
  for (const tx of pendingTxs) {
    try {
      await retryTransaction(tx)
    } catch (error) {
      console.error('Transaction retry failed:', error)
    }
  }
}

async function getStoredTransactions() {
  // Service workers cannot access localStorage in most browsers/environments.
  // Return an empty array if storage isn't available. If a proper implementation
  // is required, replace with IndexedDB access (IDB) or postMessage to client.
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem) {
      return JSON.parse(localStorage.getItem('pending_web3_transactions') || '[]')
    }
  } catch (err) {
    // localStorage not available in SW — fall through to empty array
    console.warn('sw: localStorage not available in getStoredTransactions:', err && err.message)
  }
  return []
}

async function retryTransaction(tx) {
  // Retry Web3 transaction logic
  console.log('Retrying transaction:', tx.hash)
}