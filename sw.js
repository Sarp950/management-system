const CACHE_NAME = 'management-system-v1';
const urlsToCache = [
  './mkaa.html',
  './manifest.json',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// استرجاع الملفات من الكاش
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // إرجاع الملف من الكاش إذا وُجد
        if (response) {
          return response;
        }
        
        // إذا لم يوجد في الكاش، جلبه من الشبكة
        return fetch(event.request).then(
          function(response) {
            // التحقق من صحة الاستجابة
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // نسخ الاستجابة
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// تحديث الكاش
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// معالجة الإشعارات
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من نظام الإدارة',
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'عرض التفاصيل',
        icon: 'icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: 'icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('نظام الإدارة', options)
  );
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'explore') {
    // فتح التطبيق
    event.waitUntil(
      clients.openWindow('./mkaa.html')
    );
  } else if (event.action === 'close') {
    // إغلاق الإشعار فقط
    event.notification.close();
  } else {
    // النقر على الإشعار نفسه
    event.waitUntil(
      clients.openWindow('./mkaa.html')
    );
  }
});

// مزامنة البيانات في الخلفية
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return new Promise(function(resolve, reject) {
    // مزامنة البيانات مع الخادم
    console.log('Background sync triggered');
    resolve();
  });
}