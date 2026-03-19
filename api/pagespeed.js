// /api/pagespeed.js
// Fetches real Core Web Vitals and performance data from Google PageSpeed Insights API

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Get API key from environment variable
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

  if (!apiKey) {
    console.error('GOOGLE_PAGESPEED_API_KEY not set');
    return res.status(500).json({ error: 'PageSpeed API key not configured' });
  }

  try {
    // Clean the URL
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

    console.log('⚡ [pagespeed] Analyzing URL:', cleanUrl);

    // Fetch both mobile and desktop
    const [mobileRes, desktopRes] = await Promise.all([
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(cleanUrl)}&strategy=mobile&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo`),
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(cleanUrl)}&strategy=desktop&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo`)
    ]);

    if (!mobileRes.ok || !desktopRes.ok) {
      const errorText = await (mobileRes.ok ? desktopRes : mobileRes).text();
      console.error('PageSpeed API error:', errorText);
      return res.status(500).json({ error: 'PageSpeed API request failed', details: errorText });
    }

    const mobileData = await mobileRes.json();
    const desktopData = await desktopRes.json();

    // Extract the important metrics
    const extractMetrics = (data) => {
      const lighthouse = data.lighthouseResult;
      const audits = lighthouse.audits;

      return {
        performanceScore: Math.round((lighthouse.categories.performance?.score || 0) * 100),
        accessibilityScore: Math.round((lighthouse.categories.accessibility?.score || 0) * 100),
        bestPracticesScore: Math.round((lighthouse.categories['best-practices']?.score || 0) * 100),
        seoScore: Math.round((lighthouse.categories.seo?.score || 0) * 100),
        
        // Core Web Vitals
        fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
        lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
        cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
        tbt: audits['total-blocking-time']?.displayValue || 'N/A',
        si: audits['speed-index']?.displayValue || 'N/A',
        tti: audits['interactive']?.displayValue || 'N/A',

        // Numeric values for scoring
        fcpNumeric: audits['first-contentful-paint']?.numericValue || 0,
        lcpNumeric: audits['largest-contentful-paint']?.numericValue || 0,
        clsNumeric: audits['cumulative-layout-shift']?.numericValue || 0,
        tbtNumeric: audits['total-blocking-time']?.numericValue || 0,

        // Pass/Fail assessments
        fcpScore: audits['first-contentful-paint']?.score || 0,
        lcpScore: audits['largest-contentful-paint']?.score || 0,
        clsScore: audits['cumulative-layout-shift']?.score || 0,
        tbtScore: audits['total-blocking-time']?.score || 0,
      };
    };

    const pageSpeedData = {
      mobile: extractMetrics(mobileData),
      desktop: extractMetrics(desktopData),
      finalUrl: mobileData.lighthouseResult?.finalUrl || cleanUrl,
    };

    return res.status(200).json({ pageSpeedData });

  } catch (error) {
    console.error('PageSpeed API error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch PageSpeed data',
      url
    });
  }
};

