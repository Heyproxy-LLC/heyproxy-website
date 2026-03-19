// /api/fetch-site.js
// Vercel serverless function to fetch and analyze a website

const TIMEOUT_MS = 10000; // 10 second timeout

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

function extractHeaders(headers) {
  const result = {};
  headers.forEach((value, key) => {
    result[key.toLowerCase()] = value;
  });
  return result;
}

function detectStack(html, headers) {
  const signals = [];
  const htmlLower = html.toLowerCase();

  // CMS detection - more specific patterns to avoid false positives
  if ((htmlLower.includes('wp-content/') || htmlLower.includes('wp-includes/')) &&
      (htmlLower.includes('wordpress') || htmlLower.includes('/wp-json/'))) {
    signals.push('WordPress');
  }
  if (htmlLower.includes('cdn.shopify.com') || htmlLower.includes('shopify.com/s/files')) signals.push('Shopify');
  if (html.includes('__NEXT_DATA__') || htmlLower.includes('_next/static')) signals.push('Next.js');
  if (html.includes('__NUXT__') || htmlLower.includes('_nuxt/')) signals.push('Nuxt.js');
  if (htmlLower.includes('gatsby')) signals.push('Gatsby');
  if (htmlLower.includes('squarespace-cdn.com')) signals.push('Squarespace');
  if (htmlLower.includes('wix.com') || htmlLower.includes('parastorage.com')) signals.push('Wix');
  if (htmlLower.includes('webflow.com') || htmlLower.includes('webflow.io')) signals.push('Webflow');
  if (htmlLower.includes('ghost.io') || htmlLower.includes('ghost.org')) signals.push('Ghost');
  if (htmlLower.includes('/sites/all/') || htmlLower.includes('drupal')) signals.push('Drupal');
  if (htmlLower.includes('joomla')) signals.push('Joomla');

  // Web3 / blockchain signals - case insensitive
  if (htmlLower.includes('hedera') || htmlLower.includes('hashgraph')) signals.push('Hedera/Hashgraph');
  if (htmlLower.includes('ethereum') || htmlLower.includes('web3.js') || htmlLower.includes('ethers.js')) signals.push('Ethereum/Web3');
  if (htmlLower.includes('solana')) signals.push('Solana');
  if (htmlLower.includes('metamask') || htmlLower.includes('wagmi') || htmlLower.includes('rainbowkit') ||
      htmlLower.includes('walletconnect')) signals.push('Web3 Wallet Integration');
  if (htmlLower.includes('nft')) signals.push('NFT Project');
  if (htmlLower.includes('opensea') || htmlLower.includes('thirdweb')) signals.push('NFT Marketplace Integration');

  // JS Frameworks - look for more specific signals
  if (html.includes('<div id="root">') || html.includes('react') || html.includes('React')) signals.push('React');
  if (htmlLower.includes('vue') || html.includes('Vue')) signals.push('Vue.js');
  if (htmlLower.includes('angular')) signals.push('Angular');
  if (htmlLower.includes('svelte')) signals.push('Svelte');

  // Build tools
  if (htmlLower.includes('/assets/index-') && htmlLower.includes('.js')) signals.push('Vite');
  if (htmlLower.includes('webpack')) signals.push('Webpack');

  // Hosting signals from headers
  const server = (headers['server'] || '').toLowerCase();
  const xPoweredBy = (headers['x-powered-by'] || '').toLowerCase();
  const via = (headers['via'] || '').toLowerCase();

  if (server.includes('cloudflare') || headers['cf-ray']) signals.push('Cloudflare');
  if (server.includes('vercel') || headers['x-vercel-id']) signals.push('Vercel');
  if (server.includes('netlify') || headers['x-nf-request-id']) signals.push('Netlify');
  if (server.includes('railway') || headers['x-railway-edge'] || headers['x-railway-request-id']) signals.push('Railway');
  if (server.includes('nginx')) signals.push('Nginx');
  if (server.includes('apache')) signals.push('Apache');
  if (xPoweredBy.includes('php')) signals.push(`PHP`);
  if (xPoweredBy.includes('next.js')) signals.push('Next.js (confirmed)');

  // CDN signals
  if (headers['x-cache'] || via.includes('CloudFront')) signals.push('AWS CloudFront');

  return [...new Set(signals)]; // dedupe
}

function checkSecurityHeaders(headers) {
  return {
    csp: headers['content-security-policy'] || null,
    hsts: headers['strict-transport-security'] || null,
    xFrameOptions: headers['x-frame-options'] || null,
    xContentType: headers['x-content-type-options'] || null,
    referrerPolicy: headers['referrer-policy'] || null,
    permissionsPolicy: headers['permissions-policy'] || headers['feature-policy'] || null,
    cors: headers['access-control-allow-origin'] || null,
    xXssProtection: headers['x-xss-protection'] || null,
    server: headers['server'] || null,
    xPoweredBy: headers['x-powered-by'] || null, // Info leakage
  };
}

async function checkExposedFiles(baseUrl) {
  const sensitiveFiles = [
    { path: '/.env', key: 'dotenv' },
    { path: '/wp-config.php', key: 'wpConfig' },
    { path: '/wp-login.php', key: 'wpLogin' },
    { path: '/.git/config', key: 'gitConfig' },
    { path: '/config.php', key: 'configPhp' },
    { path: '/phpinfo.php', key: 'phpinfo' },
    { path: '/admin', key: 'adminEndpoint' },
    { path: '/administrator', key: 'adminJoomla' },
    { path: '/.htaccess', key: 'htaccess' },
    { path: '/server-status', key: 'serverStatus' },
    { path: '/api/config', key: 'apiConfig' },
    { path: '/api/env', key: 'apiEnv' },
  ];

  const results = {};

  await Promise.allSettled(
    sensitiveFiles.map(async ({ path, key }) => {
      try {
        const res = await fetchWithTimeout(baseUrl + path, { method: 'HEAD' });
        // 200 = exposed, 403 = exists but protected, 404 = not found
        results[key] = res.status === 200;
      } catch {
        results[key] = false;
      }
    })
  );

  return results;
}

function extractMetaInfo(html) {
  const meta = {};

  // Generator tag (often reveals CMS)
  const generatorMatch = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i);
  if (generatorMatch) meta.generator = generatorMatch[1];

  // Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();

  // Description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (descMatch) meta.description = descMatch[1].trim();

  // Open Graph
  const ogTypeMatch = html.match(/<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']+)["']/i);
  if (ogTypeMatch) meta.ogType = ogTypeMatch[1];

  // Check for inline scripts that might expose keys (rough heuristic)
  const inlineScripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  const suspiciousPatterns = [
    /api[_-]?key\s*[:=]\s*["'][a-zA-Z0-9_\-]{20,}/i,
    /secret\s*[:=]\s*["'][a-zA-Z0-9_\-]{10,}/i,
    /token\s*[:=]\s*["'][a-zA-Z0-9_\-]{20,}/i,
    /NEXT_PUBLIC_[A-Z_]+\s*[:=]\s*["'][^"']{10,}/,
  ];

  let exposedKeySignals = [];
  inlineScripts.forEach(script => {
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(script)) {
        exposedKeySignals.push(pattern.source.split('\\')[0]);
      }
    });
  });

  if (exposedKeySignals.length > 0) {
    meta.exposedKeySignals = exposedKeySignals.join(', ');
  }

  return meta;
}

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain } = req.body;

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Domain is required' });
  }

  // Clean the domain
  const cleanedDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()
    .trim();

  const baseUrl = `https://${cleanedDomain}`;

  console.log('🔍 [fetch-site] Analyzing domain:', cleanedDomain);

  try {
    // ── 1. Fetch the main page ──
    let mainRes;
    let html = '';
    let finalUrl = baseUrl;
    let redirectedToHttps = false;
    let httpStatusCode = 0;

    try {
      // First try HTTP to check redirect behavior
      const httpRes = await fetchWithTimeout(`http://${cleanedDomain}`, {
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SearchIQ-Scanner/1.0)' }
      });

      if (httpRes.status >= 300 && httpRes.status < 400) {
        const location = httpRes.headers.get('location') || '';
        redirectedToHttps = location.startsWith('https://');
      }
    } catch {
      // HTTP might be blocked, that's fine
    }

    // Now fetch HTTPS version
    mainRes = await fetchWithTimeout(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SearchIQ-Scanner/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    httpStatusCode = mainRes.status;
    finalUrl = mainRes.url || baseUrl;
    html = await mainRes.text();
    html = html.substring(0, 50000); // Cap at 50kb to keep prompt reasonable

    const rawHeaders = extractHeaders(mainRes.headers);
    const securityHeaders = checkSecurityHeaders(rawHeaders);
    const detectedStack = detectStack(html, rawHeaders);
    const metaInfo = extractMetaInfo(html);

    // ── 2. Check for exposed sensitive files ──
    const exposedFiles = await checkExposedFiles(baseUrl);

    // ── 3. Check robots.txt ──
    let robotsTxt = '';
    try {
      const robotsRes = await fetchWithTimeout(`${baseUrl}/robots.txt`);
      if (robotsRes.ok) robotsTxt = await robotsRes.text();
    } catch { /* ignore */ }

    // ── 4. Check sitemap ──
    let hasSitemap = false;
    try {
      const sitemapRes = await fetchWithTimeout(`${baseUrl}/sitemap.xml`, { method: 'HEAD' });
      hasSitemap = sitemapRes.ok;
    } catch { /* ignore */ }

    // ── 5. Build the intelligence report ──
    const siteIntelligence = {
      domain: cleanedDomain,
      finalUrl,
      httpStatusCode,
      redirectedToHttps,
      detectedStack,
      metaInfo,
      securityHeaders,
      exposedFiles,
      robotsTxt: robotsTxt.substring(0, 500),
      hasSitemap,
      rawHeaders: Object.fromEntries(
        Object.entries(rawHeaders).filter(([k]) =>
          ['server', 'x-powered-by', 'x-frame-options', 'content-security-policy',
           'strict-transport-security', 'x-content-type-options', 'referrer-policy',
           'permissions-policy', 'access-control-allow-origin', 'x-xss-protection',
           'cache-control', 'set-cookie'].includes(k)
        )
      )
    };

    return res.status(200).json({ siteIntelligence });

  } catch (error) {
    console.error('fetch-site error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch site data',
      domain: cleanedDomain
    });
  }
};

