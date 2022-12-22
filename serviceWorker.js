const static3hree = "3hree-v1"
const assets = [
  "/",
  "./index.html",
  "./style.css",
  "./script.js",
  "./assets/img/logo.png",
  "./assets/img/favicon.ico",
  "./assets/img/apple-touch-icon-57x57.png",
  "./assets/img/apple-touch-icon-72x72.png",
  "./assets/img/favicon-128.png",
  "./assets/img/apple-touch-icon-144x144.png",
  "./assets/img/apple-touch-icon-152x152.png",
  "./assets/img/favicon-196x196.png",
]

// Don't cache till app is done
// self.addEventListener("install", installEvent => {
//   installEvent.waitUntil(
//     caches.open(static3hree).then(cache => {
//       cache.addAll(assets)
//     })
//   )
// })

// self.addEventListener("fetch", fetchEvent => {
//   fetchEvent.respondWith(
//     caches.match(fetchEvent.request).then(res => {
//       return res || fetch(fetchEvent.request)
//     })
//   )
// })
