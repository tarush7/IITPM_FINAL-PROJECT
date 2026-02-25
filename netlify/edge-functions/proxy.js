export default async (request, context) => {
  const tunnelBase = Deno.env.get("N8N_TUNNEL_URL"); 
  
  if (!tunnelBase) {
    return new Response("N8N_TUNNEL_URL environment variable is missing", { status: 500 });
  }
// Strip the local proxy path and append the actual webhook path
const targetUrl = tunnelBase + new URL(request.url).pathname.replace('/n8n-webhook', '');

// Clone headers and explicitly inject the Ngrok bypass header
const proxyHeaders = new Headers(request.headers);
proxyHeaders.set('ngrok-skip-browser-warning', 'true');

return fetch(targetUrl, {
method: request.method,
headers: proxyHeaders,
body: request.body,
});
};

// Bind this function to the local proxy route
export const config = { path: "/n8n-webhook/*" };
