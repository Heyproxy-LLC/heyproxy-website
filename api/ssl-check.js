// /api/ssl-check.js
// Fetches real SSL/TLS grade from SSL Labs API (Qualys)

const TIMEOUT_MS = 60000; // SSL Labs can take up to 60 seconds

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain } = req.body;

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    // Clean the domain
    const cleanedDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .toLowerCase()
      .trim();

    // SSL Labs API endpoint (free, no API key needed)
    // fromCache=on means we'll accept cached results (faster)
    // all=done means we only want completed assessments
    const apiUrl = `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(cleanedDomain)}&fromCache=on&all=done`;

    console.log('Fetching SSL Labs data for:', cleanedDomain);

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'SearchIQ-Scanner/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`SSL Labs API returned ${response.status}`);
    }

    const data = await response.json();

    // Check status
    if (data.status === 'ERROR') {
      return res.status(200).json({
        sslData: {
          error: data.statusMessage || 'SSL Labs could not analyze this domain',
          grade: null,
          hasSSL: false
        }
      });
    }

    // If scan is in progress, return partial data
    if (data.status === 'IN_PROGRESS' || data.status === 'DNS') {
      return res.status(200).json({
        sslData: {
          inProgress: true,
          status: data.status,
          message: 'SSL scan in progress. This can take up to 2 minutes. Try again shortly.',
          grade: null,
          hasSSL: null
        }
      });
    }

    // If ready, extract the grade
    if (data.status === 'READY' && data.endpoints && data.endpoints.length > 0) {
      // Get the worst grade from all endpoints
      const grades = data.endpoints
        .filter(ep => ep.grade)
        .map(ep => ep.grade);

      const worstGrade = grades.length > 0 ? grades.sort().reverse()[0] : null;

      // Extract detailed info from first endpoint
      const firstEndpoint = data.endpoints[0];
      const details = firstEndpoint.details || {};

      const sslData = {
        hasSSL: true,
        grade: worstGrade,
        gradeTrustIgnored: firstEndpoint.gradeTrustIgnored || null,
        
        // Certificate info
        certExpiry: details.cert?.notAfter ? new Date(details.cert.notAfter).toISOString() : null,
        certIssuer: details.cert?.issuerLabel || null,
        certSubject: details.cert?.subject || null,
        
        // Protocol support
        supportsHTTP2: details.supportsAlpn || false,
        supportsTLS13: details.protocols?.some(p => p.name === 'TLS' && p.version === '1.3') || false,
        supportsOldTLS: details.protocols?.some(p => p.name === 'TLS' && parseFloat(p.version) < 1.2) || false,
        
        // Vulnerabilities
        vulnerableToBeast: details.vulnBeast || false,
        vulnerableToHeartbleed: details.heartbleed || false,
        vulnerableToPoodle: details.poodle || false,
        vulnerableToFreak: details.freak || false,
        
        // HSTS
        hstsPreload: details.hstsPreloads?.length > 0 || false,
        hstsMaxAge: details.hstsPolicy?.maxAge || null,
        
        // Overall assessment
        forwardSecrecy: details.forwardSecrecy >= 2 ? 'Yes' : 'No',
        
        // All endpoints
        endpoints: data.endpoints.map(ep => ({
          ipAddress: ep.ipAddress,
          grade: ep.grade,
          statusMessage: ep.statusMessage
        }))
      };

      return res.status(200).json({ sslData });
    }

    // If we get here, status is unknown
    return res.status(200).json({
      sslData: {
        error: 'Unable to determine SSL status',
        status: data.status,
        grade: null,
        hasSSL: null
      }
    });

  } catch (error) {
    console.error('SSL Labs API error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch SSL data',
      domain
    });
  }
};

