import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker, { PresenceRoom } from './worker.js';
const ACTIVE_WINDOW_MS = 60_000;

const first = '12345678-1234-4123-8123-123456789abc';
const second = '87654321-4321-4321-9321-cba987654321';
const origin = 'https://pasindudushangana.github.io';
function fixture() {
  const db = new DatabaseSync(':memory:');
  let alarm = null;
  const storage = {
    sql: { exec(query, ...params) { const stmt = db.prepare(query); if (query.startsWith('SELECT')) return { one: () => stmt.get(...params) }; stmt.run(...params); } },
    getAlarm: async () => alarm, setAlarm: async value => { alarm = value; }
  };
  const room = new PresenceRoom({ storage });
  return { room, db, env: { ALLOWED_ORIGINS: origin, PRESENCE: { idFromName: name => name, get: () => room } } };
}
const request = (visitorId = first, requestOrigin = origin) => new Request('https://example.workers.dev/', { method: 'POST', headers: { Origin: requestOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorId }) });

test('presence deduplicates a browser across pages, counts new browsers, and expires inactive browsers', async () => {
  const { env, db, room } = fixture();
  let response = await worker.fetch(request(), env);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await response.json(), { count: 1 });
  assert.deepEqual(await (await worker.fetch(request(), env)).json(), { count: 1 });
  assert.deepEqual(await (await worker.fetch(request(second), env)).json(), { count: 2 });
  db.prepare('UPDATE visitors SET seen_at = ? WHERE id = ?').run(Date.now() - ACTIVE_WINDOW_MS - 1, first);
  assert.deepEqual(await (await worker.fetch(request(second), env)).json(), { count: 1 });
  db.prepare('UPDATE visitors SET seen_at = ?').run(Date.now() - ACTIVE_WINDOW_MS - 1);
  await room.alarm();
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM visitors').get().count, 0);
  db.close();
});

test('presence rejects unapproved origins, invalid IDs, methods, oversized bodies and invalid JSON', async () => {
  const { env, db } = fixture();
  assert.equal((await worker.fetch(request(first, 'https://unapproved.example'), env)).status, 403);
  assert.equal((await worker.fetch(request('not-an-id'), env)).status, 400);
  assert.equal((await worker.fetch(new Request('https://example.workers.dev/', { headers: { Origin: origin } }), env)).status, 405);
  for (const [body, status] of [['{', 400], ['x'.repeat(300), 413]]) {
    assert.equal((await worker.fetch(new Request('https://example.workers.dev/', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body }), env)).status, status);
  }
  const preflight = await worker.fetch(new Request('https://example.workers.dev/', { method: 'OPTIONS', headers: { Origin: origin } }), env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');
  db.close();
});
