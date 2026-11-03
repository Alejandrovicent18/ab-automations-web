// Worker de ab-automations-web: recibe el formulario y lo reenvía a Make.
// Secreto requerido en Cloudflare (tipo Secret): MAKE_WEBHOOK = URL del webhook de Make
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/auditoria") return new Response("Not found", { status: 404 });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
    if (!env.MAKE_WEBHOOK) return new Response("Servicio no configurado", { status: 503 });

    let d;
    try { d = await request.json(); } catch { return new Response("bad request", { status: 400 }); }

    if (d.web) return Response.json({ ok: true }); // campo trampa: es un bot

    const obligatorios = ["industria", "puesto", "empresa", "nombre", "email", "whatsapp"];
    if (obligatorios.some(k => !d[k] || String(d[k]).length > 300)) {
      return new Response("bad request", { status: 400 });
    }
    delete d.web;

    const r = await fetch(env.MAKE_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    return Response.json({ ok: r.ok }, { status: r.ok ? 200 : 502 });
  },
};
