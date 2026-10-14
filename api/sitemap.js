/**
 * Vercel serverless proxy → live backend sitemap.
 * Keeps https://charlie-bells.com/sitemap.xml always in sync with the catalog.
 *
 * Set Vercel env: API_ORIGIN=https://your-backend-host (no trailing slash)
 * Example: https://charlie-bells-api.onrender.com
 */
export default async function handler(req, res) {
  const apiOrigin = (process.env.API_ORIGIN || process.env.VITE_API_URL || '')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');

  if (!apiOrigin) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('API_ORIGIN is not configured for dynamic sitemap');
    return;
  }

  try {
    const upstream = await fetch(`${apiOrigin}/sitemap.xml`, {
      headers: { Accept: 'application/xml' },
    });
    const xml = await upstream.text();
    res.statusCode = upstream.status;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.end(xml);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`Sitemap upstream failed: ${error.message}`);
  }
}
