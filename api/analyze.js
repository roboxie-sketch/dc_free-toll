export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'OPENAI_API_KEY not set.' } });
  }

  // Capture lead details from request
  const { leadEmail, leadCompany, leadWebsite, leadICP, ...openaiBody } = req.body;

  // Send lead notification email (fire and forget — don't block the main request)
  if (leadEmail && process.env.RESEND_API_KEY) {
    fetch('https://api.resend.com/emails', {
      method:
