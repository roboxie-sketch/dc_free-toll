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
    // Send lead notification email
    const { email, company, website, icp } = req.body.leadData || {};
    if (email && process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'leads@demandcurvehub.com',
          to: 'roshanmt@demandcurvehub.com',
          subject: `New Lead: ${company || website}`,
          html: `
            <h2>New Revenue Leak Finder Lead</h2>
            <table style="border-collapse:collapse;width:100%">
              <tr><td style="padding:8px;border:1px solid #ddd"><strong>Email</strong></td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd"><strong>Company</strong></td><td style="padding:8px;border:1px solid #ddd">${company || '—'}</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd"><strong>Website</strong></td><td style="padding:8px;border:1px solid #ddd">${website}</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd"><strong>ICP</strong></td><td style="padding:8px;border:1px solid #ddd">${icp || '—'}</td></tr>
            </table>
            <p style="margin-top:16px"><a href="https://calendly.com/roshanmt074/30min">Book a demo with them →</a></p>
          `
        })
      });
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
