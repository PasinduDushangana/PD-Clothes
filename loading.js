(() => {
  // Created by JavaScript so a disabled or failed script never blocks the page.
  const screen = document.createElement('div');
  screen.className = 'loading-screen';
  screen.setAttribute('role', 'status');
  screen.innerHTML = '<div class="loading-brand"><div class="loading-orbit" aria-hidden="true"></div><span class="loading-monogram" aria-hidden="true">PD<span>.</span></span><span class="loading-wordmark">PD CLOTHES</span><span class="loading-caption">Preparing your collection</span><span class="loading-line" aria-hidden="true"></span></div>';
  document.body.append(screen);
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    screen.classList.add('is-ready');
    setTimeout(() => screen.remove(), 450);
  };
  const ready = () => Promise.resolve(document.fonts?.ready).then(finish);
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready, { once: true });
  window.addEventListener('pageshow', event => { if (event.persisted) finish(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' || event.key === 'Tab') finish(); });
  setTimeout(finish, 2800);
})();
