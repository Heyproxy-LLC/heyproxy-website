// DataForSEO API Integration
// Provides real keyword search volume, difficulty, CPC, and related keywords
// API Docs: https://docs.dataforseo.com/v3/keywords_data/google/search_volume/live/
// Cost: ~$0.001 per keyword (pay-as-you-go)

// ⚠️ SETUP REQUIRED:
// 1. Sign up at https://dataforseo.com/
// 2. Get your API credentials (login:password)
// 3. Add to Vercel Environment Variables:
//    - DATAFORSEO_LOGIN (your email)
//    - DATAFORSEO_PASSWORD (your API password)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { keyword, location = 'United States' } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword parameter required' });
  }

  // Check for API credentials
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    console.error('[DataForSEO] API credentials not configured');
    return res.status(200).json({
      error: 'DataForSEO API not configured. Add DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD to environment variables.',
      configured: false,
    });
  }

  console.log('[DataForSEO] Analyzing keyword:', keyword);

  try {
    // Create Basic Auth header
    const auth = Buffer.from(`${login}:${password}`).toString('base64');

    // Request payload for search volume + related keywords
    const payload = [
      {
        keywords: [keyword],
        location_name: location,
        language_name: 'English',
        include_serp_info: true,
        include_clickstream_data: true,
      }
    ];

    // Call DataForSEO Keywords Data API
    const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google/search_volume/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status_code !== 20000) {
      throw new Error(data.status_message || 'DataForSEO API error');
    }

    const result = data.tasks?.[0]?.result?.[0];

    if (!result) {
      throw new Error('No data returned from DataForSEO');
    }

    // Extract keyword data
    const keywordData = {
      keyword: result.keyword,
      searchVolume: result.search_volume || 0,
      competition: result.competition || 'N/A',
      competitionIndex: result.competition_index || 0, // 0-100
      cpc: result.cpc || 0,
      lowTopOfPageBid: result.low_top_of_page_bid || 0,
      highTopOfPageBid: result.high_top_of_page_bid || 0,
      monthlySearches: result.monthly_searches || [],
      serpInfo: result.serp_info ? {
        hasFeatureSnippet: result.serp_info.se_results_count > 0,
        organicResults: result.serp_info.se_results_count || 0,
      } : null,
    };

    console.log('[DataForSEO] Success. Search volume:', keywordData.searchVolume);

    return res.status(200).json(keywordData);

  } catch (error) {
    console.error('[DataForSEO] Error:', error.message);
    return res.status(200).json({
      error: error.message,
      configured: true,
      failed: true,
    });
  }
}

