const CACHE_NAME = 'prayer-weather-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800&display=swap'
];

// تثبيت ملفات الكاش الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// استراتيجية (Stale-While-Revalidate) لعرض البيانات المحفوظة فوراً ثم تحديثها في الخلفية
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // تحديث الكاش بالبيانات الجديدة (للأوقات والطقس)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // تجاهل الخطأ عند انقطاع الإنترنت والاعتماد على الكاش
      });

      // إرجاع النسخة المحفوظة فوراً إن وجدت، أو انتظار استجابة الإنترنت
      return cachedResponse || fetchPromise;
    })
  );
});
