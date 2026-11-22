// Service worker Klipku: aplikasi bisa dibuka tanpa internet setelah kunjungan pertama.
// Naikkan angka VERSI setiap kali Anda mengubah file aplikasi agar cache lama diganti.
const VERSI = 'klipku-v5';
const ASET = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSI).then(c => c.addAll(ASET)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;

  // Halaman utama: coba jaringan dulu, jika offline pakai cache.
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r)
        .then(res => {
          const salinan = res.clone();
          caches.open(VERSI).then(c => c.put('index.html', salinan));
          return res;
        })
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  // File lain: tampilkan dari cache lebih dulu, lalu perbarui di latar belakang.
  e.respondWith(
    caches.match(r).then(hit => {
      const jaringan = fetch(r)
        .then(res => {
          if (res.ok) {
            const salinan = res.clone();
            caches.open(VERSI).then(c => c.put(r, salinan));
          }
          return res;
        })
        .catch(() => hit);
      return hit || jaringan;
    })
  );
});
