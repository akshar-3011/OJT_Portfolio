const ALLOWED = ['top-headlines', 'everything'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'GET only' });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'Add NEWS_API_KEY in Vercel settings' });
  }

  const { endpoint, ...params } = req.query;
  if (!ALLOWED.includes(endpoint)) {
    return res.status(400).json({ message: 'Invalid endpoint' });
  }

  const url = new URL(`https://newsapi.org/v2/${endpoint}`);
  url.searchParams.set('apiKey', apiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(response.status).json(data);
  } catch {
    return res.status(502).json({ message: 'News API unreachable' });
  }
}
