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
    // Fire lead to Google Sheets — awaited so it completes before function ends
    const { email, company, website, icp } = req.body.leadData || {};
    if (email && process.env.SHEET_WEBHOOK_URL) {
      try {
        const sheetRes = await fetch(process.env.SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ email, company, website, icp, score: '' })
        });
        const sheetData = await sheetRes.text();
        console.log('Sheet response:', sheetData);
      } catch (sheetErr) {
        console.log('Sheet error:', sheetErr.message);
      }
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
