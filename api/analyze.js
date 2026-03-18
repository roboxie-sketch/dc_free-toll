export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'OPENAI_API_KEY not set.' } });
  }

  try {
    console.log('WEBHOOK URL:', process.env.SHEET_WEBHOOK_URL || 'NOT SET');
    console.log('LEAD DATA:', JSON.stringify(req.body.leadData || 'MISSING'));
    console.log('BODY KEYS:', Object.keys(req.body || {}));

    // Fire lead to Google Sheets (non-blocking)
    const { email, company, website, icp } = req.body.leadData || {};
    if (email && process.env.SHEET_WEBHOOK_URL) {
      fetch(process.env.SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, website, icp, score: '' })
      }).catch(() => {});
    }

    // Strip leadData before sending to OpenAI
    const { leadData, ...openAIBody } = req.body;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(openAIBody)
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
}
