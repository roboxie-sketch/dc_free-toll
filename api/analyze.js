export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Debug — remove after fixing
  return res.status(200).json({
    keyExists: !!process.env.OPENAI_API_KEY,
    keyPreview: process.env.OPENAI_API_KEY?.slice(0, 10) || 'undefined',
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('OPENAI'))
  });
}
