(() => {
  'use strict';
  const key = 'pd-clothes-appearance';
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try { const saved = localStorage.getItem(key); if (['light', 'dark'].includes(saved)) preference = saved; } catch {}
  function apply() {
    const mode = preference || (system.matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = mode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? '#101b17' : '#f5faf7');
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(mode === 'dark'));
      button.setAttribute('aria-label', 'Dark mode');
      button.title = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      const icon = mode === 'dark'
        ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'
        : '<path d="M20 14a8 8 0 0 1-10-10A8.5 8.5 0 1 0 20 14Z"/>';
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + icon + '</svg><span class="theme-label">' + (mode === 'dark' ? 'Light mode' : 'Dark mode') + '</span>';
    });
  }
  apply(); // Runs before stylesheets paint to avoid a light flash on dark visits.
  system.addEventListener('change', () => { if (!preference) apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
    apply();
  });
  document.addEventListener('DOMContentLoaded', () => {
    for (const target of ['.nav-actions', '.mobile-wordmark']) {
      const parent = document.querySelector(target);
      if (!parent) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-toggle';
      button.dataset.themeToggle = '';
      button.addEventListener('click', () => {
        preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(key, preference); } catch {}
        apply();
      });
      if (target === '.mobile-wordmark') {
        parent.parentNode.insertBefore(button, parent.nextSibling);
        button.classList.add('mobile-theme-toggle');
      } else parent.prepend(button);
    }
    apply();
  });
})();
