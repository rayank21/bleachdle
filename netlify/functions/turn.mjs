// TURN relay credentials for online play.
// Players connect directly to each other; when that fails (two devices behind the same box that can't loop a
// connection back to itself, strict NATs, school or work Wi-Fi), their browsers fall back to a TURN relay.
// The relay is Cloudflare's (free tier). The API token stays here, the browser only gets short-lived credentials.
//
//   GET /api/turn  →  { iceServers: [{ urls, username, credential }, …] }   ([] when no relay is set up)
//
// Netlify environment variables: CF_TURN_KEY_ID and CF_TURN_API_TOKEN (Cloudflare dashboard → Realtime → TURN).

const TTL = 6 * 3600; // credentials valid 6 hours; the browser asks again after that

export default async () => {
  const keyId = process.env.CF_TURN_KEY_ID;
  const token = process.env.CF_TURN_API_TOKEN;
  if (!keyId || !token) return json({ iceServers: [] }, 60);
  try {
    const res = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(keyId)}/credentials/generate-ice-servers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ttl: TTL }),
    });
    if (!res.ok) throw new Error(`Cloudflare answered ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data.iceServers) ? data.iceServers : data.iceServers ? [data.iceServers] : [];
    // Browsers time out on port 53 (Cloudflare's own advice): keep the other URLs.
    const iceServers = list
      .map((s) => ({ ...s, urls: (Array.isArray(s.urls) ? s.urls : [s.urls]).filter((u) => typeof u === "string" && !/:53(\?|$)/.test(u)) }))
      .filter((s) => s.urls.length);
    return json({ iceServers }, 3600);
  } catch (e) {
    console.error("TURN credentials:", e);
    return json({ iceServers: [] }, 30);
  }
};

const json = (body, maxAge) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", "Cache-Control": `private, max-age=${maxAge}` },
  });

export const config = { path: "/api/turn" };
