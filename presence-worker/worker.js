// One shared room makes the count consistent across all storefront pages.
const ACTIVE_WINDOW_MS = 60_000;
const validVisitor = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
    if (!origin || !allowed.includes(origin)) return new Response('Origin not allowed', { status: 403 });
    const headers = { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
    const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' } });
    if (request.method !== 'POST') return reply({ error: 'Use POST' }, 405);
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply({ error: 'Use JSON' }, 415);
    try {
      // Read a bounded body before parsing, even when Content-Length is omitted.
      const reader = request.body?.getReader();
      if (!reader) return reply({ error: 'Missing body' }, 400);
      const chunks = []; let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 256) { await reader.cancel(); return reply({ error: 'Body too large' }, 413); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const data = JSON.parse(new TextDecoder().decode(bytes));
      if (!validVisitor(data?.visitorId)) return reply({ error: 'Invalid visitor ID' }, 400);
      const room = env.PRESENCE.get(env.PRESENCE.idFromName('pd-clothes-store'));
      const result = await room.fetch(new Request('https://presence.internal/heartbeat', { method: 'POST', body: JSON.stringify({ visitorId: data.visitorId }) }));
      if (!result.ok) return reply({ error: 'Presence temporarily unavailable' }, 503);
      return new Response(result.body, { headers });
    } catch (error) {
      return reply({ error: error instanceof SyntaxError ? 'Invalid JSON' : 'Presence temporarily unavailable' }, error instanceof SyntaxError ? 400 : 503);
    }
  }
};

export class PresenceRoom {
  constructor(state) {
    this.storage = state.storage;
    this.sql = state.storage.sql;
    this.sql.exec('CREATE TABLE IF NOT EXISTS visitors (id TEXT PRIMARY KEY, seen_at INTEGER NOT NULL)');
    this.sql.exec('CREATE INDEX IF NOT EXISTS visitors_seen ON visitors(seen_at)');
  }
  async fetch(request) {
    const { visitorId } = await request.json();
    if (!validVisitor(visitorId)) return new Response('Invalid ID', { status: 400 });
    const now = Date.now();
    this.sql.exec('DELETE FROM visitors WHERE seen_at <= ?', now - ACTIVE_WINDOW_MS);
    this.sql.exec('INSERT INTO visitors (id, seen_at) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET seen_at = excluded.seen_at', visitorId, now);
    const count = this.sql.exec('SELECT COUNT(*) AS count FROM visitors').one().count;
    if (await this.storage.getAlarm() === null) await this.storage.setAlarm(now + ACTIVE_WINDOW_MS);
    return Response.json({ count });
  }
  async alarm() {
    this.sql.exec('DELETE FROM visitors WHERE seen_at <= ?', Date.now() - ACTIVE_WINDOW_MS);
    if (this.sql.exec('SELECT COUNT(*) AS count FROM visitors').one().count > 0) await this.storage.setAlarm(Date.now() + ACTIVE_WINDOW_MS);
  }
}
