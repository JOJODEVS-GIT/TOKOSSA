/**
 * TOKOSSA - Service Worker
 *
 * Strategie de cache :
 * - Cache-first pour les assets statiques (images, CSS, JS, polices)
 * - Network-first pour les pages HTML et les appels API
 * - Fallback hors-ligne pour les pages non cachees
 *
 * Optimise pour les connexions 3G a Cotonou
 */

const CACHE_NAME = 'tokossa-v1'

// Assets statiques a pre-cacher lors de l'installation
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
]

// Patterns pour identifier les assets statiques (cache-first)
const STATIC_ASSET_PATTERNS = [
  /\.(js|css|woff|woff2|ttf|eot)(\?.*)?$/,
  /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)(\?.*)?$/,
  /\/_next\/static\//,
  /\/images\//,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /res\.cloudinary\.com/,
]

// Patterns pour les requetes API (network-first)
const API_PATTERNS = [
  /\/api\//,
  /\/_next\/data\//,
]

// Patterns a ne jamais cacher
const NEVER_CACHE_PATTERNS = [
  /\/api\/auth/,
  /\/api\/payment/,
  /\/api\/webhook/,
  /chrome-extension/,
  /\/sw\.js$/,
]

/**
 * Installation du Service Worker
 * Pre-cache les assets essentiels
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW TOKOSSA] Pre-cache des assets essentiels')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => {
        // Activer immediatement sans attendre la fermeture des onglets
        return self.skipWaiting()
      })
  )
})

/**
 * Activation du Service Worker
 * Nettoie les anciens caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW TOKOSSA] Suppression ancien cache:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => {
        // Prendre le controle de tous les clients immediatement
        return self.clients.claim()
      })
  )
})

/**
 * Verifie si une URL correspond a un pattern donne
 */
function matchesPattern(url, patterns) {
  return patterns.some((pattern) => pattern.test(url))
}

/**
 * Strategie Cache-First
 * Retourne le cache si disponible, sinon fait la requete reseau
 * Ideal pour les assets statiques qui changent rarement
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    // Mettre en cache seulement les reponses valides
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Hors-ligne et pas dans le cache : retourner une reponse d'erreur
    console.log('[SW TOKOSSA] Erreur reseau pour asset:', request.url)
    return new Response('Ressource non disponible hors-ligne', {
      status: 503,
      statusText: 'Service Unavailable',
    })
  }
}

/**
 * Strategie Network-First
 * Essaie le reseau d'abord, fallback sur le cache
 * Ideal pour les pages HTML et les donnees dynamiques
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    // Mettre en cache les reponses valides pour usage hors-ligne
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Reseau indisponible : chercher dans le cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      console.log('[SW TOKOSSA] Reponse depuis cache (hors-ligne):', request.url)
      return cachedResponse
    }

    // Ni reseau ni cache : page hors-ligne
    if (request.headers.get('accept')?.includes('text/html')) {
      return generateOfflinePage()
    }

    return new Response('Contenu non disponible hors-ligne', {
      status: 503,
      statusText: 'Service Unavailable',
    })
  }
}

/**
 * Genere une page HTML hors-ligne avec le design TOKOSSA
 */
function generateOfflinePage() {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta name="theme-color" content="#ed7420">
  <title>TOKOSSA - Hors-ligne</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Inter, system-ui, sans-serif;
      background: #faf8f5;
      color: #1e1b4b;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      text-align: center;
    }
    .logo {
      width: 80px;
      height: 80px;
      background: #ed7420;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 40px;
      font-weight: bold;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #1e1b4b;
    }
    p {
      font-size: 15px;
      color: #7d6e5d;
      line-height: 1.6;
      max-width: 320px;
      margin-bottom: 32px;
    }
    button {
      background: linear-gradient(135deg, #ed7420, #de5b12);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(237, 116, 32, 0.3);
      transition: transform 0.2s;
    }
    button:active { transform: scale(0.98); }
    .wifi-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <div class="logo">T</div>
  <div class="wifi-icon">&#128268;</div>
  <h1>Pas de connexion internet</h1>
  <p>
    Verifiez votre connexion et reessayez.
    Les pages que vous avez deja visitees restent accessibles hors-ligne.
  </p>
  <button onclick="window.location.reload()">Reessayer</button>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

/**
 * Interception des requetes reseau
 * Applique la strategie appropriee selon le type de requete
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = request.url

  // Ignorer les requetes non-GET
  if (request.method !== 'GET') {
    return
  }

  // Ne jamais cacher certaines requetes sensibles
  if (matchesPattern(url, NEVER_CACHE_PATTERNS)) {
    return
  }

  // Assets statiques : strategie cache-first
  if (matchesPattern(url, STATIC_ASSET_PATTERNS)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Requetes API : strategie network-first
  if (matchesPattern(url, API_PATTERNS)) {
    event.respondWith(networkFirst(request))
    return
  }

  // Pages HTML et autres : strategie network-first
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Par defaut : network-first
  event.respondWith(networkFirst(request))
})

/**
 * Gestion des notifications push
 * Affiche les notifications recues du serveur
 */
self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const options = {
      body: data.body || 'Nouvelle notification TOKOSSA',
      icon: '/images/icons/icon-192x192.png',
      badge: '/images/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      tag: data.tag || 'tokossa-notification',
      // Donnees supplementaires pour le clic
      data: {
        url: data.url || '/',
        timestamp: Date.now(),
      },
      // Actions rapides
      actions: data.actions || [],
    }

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'TOKOSSA',
        options
      )
    )
  } catch (error) {
    console.error('[SW TOKOSSA] Erreur notification push:', error)
  }
})

/**
 * Gestion du clic sur une notification
 * Ouvre l'URL associee ou ramene l'utilisateur sur TOKOSSA
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Si un onglet TOKOSSA est deja ouvert, le focus
      const existingClient = clients.find((client) =>
        client.url.includes(self.location.origin)
      )

      if (existingClient) {
        existingClient.navigate(targetUrl)
        return existingClient.focus()
      }

      // Sinon, ouvrir un nouvel onglet
      return self.clients.openWindow(targetUrl)
    })
  )
})
