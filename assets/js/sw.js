/* ============================================================================
   Farghar WordPress Academy - Service Worker
   Copyright (c) Farghar - All Rights Reserved.
   ----------------------------------------------------------------------------
   Features:
     - Offline caching with Cache API
     - Network-first strategy for HTML
     - Cache-first strategy for assets
     - Background sync support
     - Push notification ready
   ============================================================================ */

const CACHE_NAME = 'farghar-wp-academy-v1';
const STATIC_CACHE = 'farghar-static-v1';
const DYNAMIC_CACHE = 'farghar-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/style.css',
  '/assets/js/app.js',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => console.log('[SW] Install error:', err))
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  // Network-first for HTML pages
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) return cached;
        
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        });
      })
      .catch(() => {
        // Return offline fallback for CSS/JS
        if (request.url.endsWith('.css')) {
          return caches.match('/assets/css/style.css');
        }
        if (request.url.endsWith('.js')) {
          return caches.match('/assets/js/app.js');
        }
      })
  );
});

// Background sync support
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

async function syncProgress() {
  // Sync user progress when back online
  console.log('[SW] Syncing progress...');
}

// Push notification support
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'پیام جدید از وردپرس آکادمی',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { url: '/' },
    actions: [
      { action: 'open', title: 'باز کردن' },
      { action: 'dismiss', title: 'بستن' }
    ],
    dir: 'rtl',
    lang: 'fa'
  };

  event.waitUntil(
    self.registration.showNotification('وردپرس آکادمی فارغار', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        const url = event.notification.data?.url || '/';
        
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
