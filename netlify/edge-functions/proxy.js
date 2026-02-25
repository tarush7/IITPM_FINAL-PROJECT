export default async (request, context) => {
  const tunnelBase =
    (typeof Netlify !== 'undefined' && Netlify.env.get('N8N_TUNNEL_URL')) ||
    Deno.env.get('N8N_TUNNEL_URL')

  if (!tunnelBase) {
    return new Response('N8N_TUNNEL_URL environment variable is missing', { status: 500 })
  }

  const incomingUrl = new URL(request.url)
  const upstreamPath = incomingUrl.pathname.replace('/n8n-webhook', '')
  const targetUrl = new URL(`${upstreamPath}${incomingUrl.search}`, tunnelBase).toString()

  const proxyHeaders = new Headers(request.headers)
  proxyHeaders.set('ngrok-skip-browser-warning', 'true')

  // We must define duplex: 'half' to prevent mobile streams from hanging
  const init = {
    method: request.method,
    headers: proxyHeaders,
    duplex: 'half', 
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
  }

  try {
    return await fetch(targetUrl, init)
  } catch (error) {
    return new Response(
      `Proxy request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 502 },
    )
  }
}

export const config = { path: '/n8n-webhook/*' }