export default async (req: Request) => {
  const url = new URL(req.url);
  const eonetPath = url.searchParams.get('path') || '/events/geojson?status=open&days=7&bbox=85.77,21.38,89.99,27.05';
  
  try {
    const res = await fetch(`https://eonet.gsfc.nasa.gov/api/v3${eonetPath}`, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'EONET fetch failed', status: res.status }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Proxy error', message: String(e) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

export const config = {
  path: '/api/eonet',
  method: 'GET',
};
