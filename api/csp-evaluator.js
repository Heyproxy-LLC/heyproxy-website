// CSP Evaluator API Integration
// Google's Content Security Policy analyzer
// Identifies CSP weaknesses and provides recommendations
// Cost: FREE - No API key required!

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { csp } = req.query;

  if (!csp) {
    return res.status(400).json({ error: 'CSP parameter required' });
  }

  console.log('[CSP Evaluator] Analyzing CSP policy');

  try {
    // CSP Evaluator API endpoint
    const response = await fetch('https://csp-evaluator.withgoogle.com/getCSP', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `csp=${encodeURIComponent(csp)}`,
    });

    if (!response.ok) {
      throw new Error(`CSP Evaluator API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse findings
    const findings = [];
    const severityCounts = {
      high: 0,
      medium: 0,
      syntax: 0,
      info: 0,
    };

    if (data.findings) {
      data.findings.forEach(finding => {
        const severity = finding.severity?.toLowerCase() || 'info';
        severityCounts[severity] = (severityCounts[severity] || 0) + 1;

        findings.push({
          severity: severity,
          directive: finding.directive,
          description: finding.description,
          value: finding.value,
        });
      });
    }

    // Calculate overall score
    let score = 100;
    score -= severityCounts.high * 20;
    score -= severityCounts.medium * 10;
    score -= severityCounts.syntax * 5;
    score = Math.max(0, score);

    const result = {
      score: score,
      grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
      findings: findings,
      summary: {
        total: findings.length,
        high: severityCounts.high,
        medium: severityCounts.medium,
        syntax: severityCounts.syntax,
        info: severityCounts.info,
      },
      hasCsp: true,
    };

    console.log('[CSP Evaluator] Analysis complete. Score:', result.score, 'Findings:', findings.length);

    return res.status(200).json(result);

  } catch (error) {
    console.error('[CSP Evaluator] Error:', error.message);
    return res.status(200).json({
      error: error.message,
      hasCsp: false,
    });
  }
}

