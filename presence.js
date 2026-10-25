(() => {
  'use strict';
  const badge = document.getElementById('livePresence');
  const label = document.getElementById('livePresenceText');
  if (!badge || !label) return;
  const endpoint = window.PD_CONFIG?.presenceEndpoint;
  if (!endpoint) return;
  let service;
  try { service = new URL(endpoint); if (service.protocol !== 'https:' && service.hostname !== 'localhost' && service.hostname !== '127.0.0.1') return; } catch { return; }
  const key = 'pd-presence-browser-v1';
  let visitorId;
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    if (stored && /^[a-f0-9-]{36}$/.test(stored.id) && Date.now() - stored.createdAt < 86400000) visitorId = stored.id;
  } catch {}
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    try { localStorage.setItem(key, JSON.stringify({ id: visitorId, createdAt: Date.now() })); } catch {}
  }
  let pending = false;
  async function heartbeat() {
    if (document.hidden || pending) return;
    pending = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(service.href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorId }), signal: controller.signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error('Presence unavailable');
      const data = await response.json();
      if (!Number.isSafeInteger(data.count) || data.count < 1) throw new Error('Invalid count');
      label.textContent = `${data.count.toLocaleString()} ${data.count === 1 ? 'visitor' : 'visitors'} online`;
      badge.classList.add('is-live');
    } catch {
      label.textContent = 'Live visitors · unavailable';
      badge.classList.remove('is-live');
    } finally { clearTimeout(timeout); pending = false; }
  }
  heartbeat();
  setInterval(heartbeat, 20000);
  document.addEventListener('visibilitychange', () => {
    // Never show a stale number when a background tab becomes active again.
    label.textContent = 'Live visitors · updating';
    badge.classList.remove('is-live');
    heartbeat();
  });
  window.addEventListener('pageshow', event => { if (event.persisted) heartbeat(); });
})();
