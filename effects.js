(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = false, frame = 0, x = 0, y = 0;
  try { paused = localStorage.getItem('pd-effects-paused') === 'true'; } catch {}
  const backdrop = document.createElement('div');
  backdrop.className = 'ambient-lights';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.innerHTML = '<i></i><i></i>';
  document.body.prepend(backdrop);
  const halo = document.createElement('div');
  halo.className = 'cursor-halo';
  halo.setAttribute('aria-hidden', 'true');
  document.body.append(halo);
  const control = document.createElement('button');
  control.type = 'button';
  control.className = 'effects-control';
  document.querySelector('.presence-row')?.append(control);
  function enabled() { return !paused && !reduced.matches; }
  function hideCursor() { halo.classList.remove('is-visible'); cancelAnimationFrame(frame); frame = 0; }
  function sync() {
    document.documentElement.classList.toggle('effects-paused', !enabled());
    control.textContent = reduced.matches ? 'Motion reduced by device' : paused ? 'Resume visual effects' : 'Pause visual effects';
    control.disabled = reduced.matches;
    hideCursor();
  }
  control.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('pd-effects-paused', String(paused)); } catch {}
    sync();
  });
  reduced.addEventListener('change', sync);
  pointer.addEventListener('change', hideCursor);
  window.addEventListener('storage', event => {
    if (event.key === 'pd-effects-paused' || event.key === null) { paused = event.newValue === 'true'; sync(); }
  });
  document.addEventListener('pointermove', event => {
    if (!enabled() || !pointer.matches || event.pointerType !== 'mouse' ||
        event.target.closest('input,textarea,select')) { hideCursor(); return; }
    x = event.clientX; y = event.clientY;
    halo.classList.toggle('is-interactive', Boolean(event.target.closest('a,button,summary')));
    if (!frame) frame = requestAnimationFrame(() => {
      halo.style.transform = `translate3d(${x}px,${y}px,0)`;
      halo.classList.add('is-visible');
      frame = 0;
    });
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hideCursor);
  document.addEventListener('pointerdown', () => {
    if (enabled()) halo.classList.add('is-pressed');
  }, { passive:true });
  document.addEventListener('pointerup', () => halo.classList.remove('is-pressed'), { passive:true });
  window.addEventListener('blur', hideCursor);
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('effects-backgrounded', document.hidden);
    if (document.hidden) hideCursor();
  });
  const observed = new WeakSet();
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.remove('reveal-ready');
    if (enabled()) entry.target.classList.add('lux-reveal');
    observer.unobserve(entry.target);
  }), { threshold:.1, rootMargin:'0px 0px -5% 0px' });
  function observe(root) {
    if (!enabled()) return;
    root.querySelectorAll('.product-card,.related-card,.value-grid article,.market-section-heading,.personal-service,.contact-card,.about-layout,.page-intro,.detail-gallery,.detail-information,.contact-help,.service-line,.arrival-gallery,.edit-copy').forEach((element, i) => {
      if (observed.has(element)) return;
      observed.add(element);
      const card = element.matches('.product-card,.related-card,.value-grid article');
      const fromLeft = element.matches('.about-layout,.detail-gallery,.edit-copy');
      const fromRight = element.matches('.contact-card,.contact-help,.detail-information,.arrival-gallery');
      element.dataset.reveal = card ? (i % 2 ? 'right' : 'left') : fromLeft ? 'left' : fromRight ? 'right' : 'up';
      element.classList.add('reveal-ready');
      element.style.setProperty('--reveal-delay', `${(i % 4) * 65}ms`);
      observer.observe(element);
    });
  }
  observe(document);
  document.querySelectorAll('#productGrid,#relatedGrid').forEach(grid => new MutationObserver(() => observe(grid)).observe(grid, { childList:true }));
  sync();
})();
