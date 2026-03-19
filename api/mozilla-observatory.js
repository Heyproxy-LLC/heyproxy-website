// Mozilla Observatory API Integration
// Provides industry-standard security header analysis and scoring
// API Docs: https://github.com/mozilla/http-observatory/blob/master/httpobs/docs/api.md
// Cost: FREE - No API key required!

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Domain parameter required' });
  }

  console.log('[Mozilla Observatory] Analyzing domain:', domain);

  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // Step 1: Initiate scan
    const scanResponse = await fetch(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${cleanDomain}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!scanResponse.ok) {
      throw new Error(`Observatory API error: ${scanResponse.status}`);
    }

    const scanData = await scanResponse.json();
    console.log('[Mozilla Observatory] Scan initiated:', scanData.state);

    // Step 2: Poll for results (Observatory scans can take a few seconds)
    let attempts = 0;
    const maxAttempts = 20; // 20 attempts × 2 seconds = 40 seconds max wait
    let results = null;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      const resultResponse = await fetch(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${cleanDomain}`);
      const resultData = await resultResponse.json();

      console.log('[Mozilla Observatory] Scan state:', resultData.state, 'Attempt:', attempts + 1);

      if (resultData.state === 'FINISHED') {
        results = resultData;
        break;
      }

      if (resultData.state === 'FAILED') {
        throw new Error('Observatory scan failed');
      }

      attempts++;
    }

    if (!results) {
      return res.status(200).json({
        inProgress: true,
        message: 'Scan in progress. This can take up to 60 seconds.',
      });
    }

    // Step 3: Get detailed test results
    const testsResponse = await fetch(`https://http-observatory.security.mozilla.org/api/v1/getScanResults?scan=${results.scan_id}`);
    const testsData = await testsResponse.json();

    // Parse and return results
    const response = {
      score: results.score,
      grade: results.grade,
      state: results.state,
      testsQuantity: results.tests_quantity,
      testsPassed: results.tests_passed,
      testsFailed: results.tests_failed,
      likelihood: results.likelihood_indicator,
      scanId: results.scan_id,
      tests: Object.entries(testsData).map(([key, test]) => ({
        name: test.name,
        pass: test.pass,
        score: test.score_modifier,
        description: test.score_description,
      })),
    };

    console.log('[Mozilla Observatory] Scan complete. Grade:', response.grade, 'Score:', response.score);

    return res.status(200).json(response);

  } catch (error) {
    console.error('[Mozilla Observatory] Error:', error.message);
    return res.status(200).json({
      error: error.message,
      fallback: true,
    });
  }
}

