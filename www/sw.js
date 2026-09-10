// 麻雀点数電卓 — service worker
//
// アプリを更新した時は CACHE_NAME の末尾の数字を必ず上げてください
// (v1 -> v2 など)。上げないと、古いバージョンを開いたことがある端末には
// 新しい内容が届かず、キャッシュされた古い計算ロジックのまま使われ続けます。
const CACHE_NAME = 'mahjong-score-v14';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // HTML(ページ本体)はネット優先: オンライン中は常に最新の計算ロジックを
  // 取得し、オフライン時だけキャッシュへフォールバックする。
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // それ以外(アイコン等)はキャッシュ優先。
  event.respondWith(
    caches.match(req).then((r) => r || fetch(req))
  );
});
