// DataForSEO Related Keywords API
// Gets related keywords with search volume data
// Cost: ~$0.001 per request

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { keyword, location = 'United States', limit = 10 } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword parameter required' });
  }

  // Check for API credentials
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    return res.status(200).json({
      error: 'DataForSEO API not configured',
      configured: false,
    });
  }

  console.log('[DataForSEO Related] Getting related keywords for:', keyword);

  try {
    const auth = Buffer.from(`${login}:${password}`).toString('base64');

    // Request related keywords
    const payload = [
      {
        keyword: keyword,
        location_name: location,
        language_name: 'English',
        limit: parseInt(limit),
        include_seed_keyword: false,
        include_serp_info: false,
      }
    ];

    const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google/keywords_for_keywords/live', {
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

    const results = data.tasks?.[0]?.result?.[0]?.items || [];

    // Format related keywords
    const relatedKeywords = results
      .filter(item => item.keyword_data)
      .map(item => ({
        keyword: item.keyword_data.keyword,
        searchVolume: item.keyword_data.search_volume || 0,
        competition: item.keyword_data.competition || 'N/A',
        competitionIndex: item.keyword_data.competition_index || 0,
        cpc: item.keyword_data.cpc || 0,
      }))
      .sort((a, b) => b.searchVolume - a.searchVolume) // Sort by search volume
      .slice(0, parseInt(limit));

    console.log('[DataForSEO Related] Found', relatedKeywords.length, 'related keywords');

    return res.status(200).json({
      keyword: keyword,
      relatedKeywords: relatedKeywords,
      count: relatedKeywords.length,
    });

  } catch (error) {
    console.error('[DataForSEO Related] Error:', error.message);
    return res.status(200).json({
      error: error.message,
      configured: true,
      failed: true,
    });
  }
}

