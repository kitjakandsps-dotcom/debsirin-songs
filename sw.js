/* เก็บหน้าเว็บไว้ในเครื่อง เปิดได้แม้สัญญาณอินเทอร์เน็ตในสนามไม่ดี
   แก้ไฟล์หน้าเว็บเมื่อไร ให้เปลี่ยนเลขเวอร์ชันด้านล่างด้วย */
var VERSION = 'songbook-v2';
var SHELL = [
  './', 'index.html', 'assets/style.css', 'assets/app.js', 'assets/qrcode.js', 'assets/logo.png',
  'assets/favicon.png', 'assets/icon-192.png', 'manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;          // ฟอนต์ YouTube ปล่อยเบราว์เซอร์จัดการ
  if (url.pathname.indexOf('/audio/') !== -1) return;   // ไฟล์เสียงโหลดตรงจากเว็บ

  if (url.pathname.indexOf('/data/') !== -1) {
    // ข้อมูลเพลง: เอาของใหม่ก่อน ถ้าออฟไลน์ใช้ของเดิม
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(VERSION).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () { return caches.match(req); }));
    return;
  }

  // ไฟล์หน้าเว็บ: ใช้ของในเครื่องทันที แล้วอัปเดตเบื้องหลัง
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return hit || caches.match('index.html'); });
    return hit || net;
  }));
});
