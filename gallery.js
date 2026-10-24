(() => {
  'use strict';
  const root = document.getElementById('arrivalGallery');
  if (!root) return;
  const all = Array.isArray(window.PD_PRODUCTS) ? window.PD_PRODUCTS : [];
  // Newest explicit dates first; undated products use their insertion order.
  const newest = all.map((product, index) => ({ product, index, date: Date.parse(product.addedAt) || 0 }))
    .filter(({ product }) => product.id && product.name && product.image && Number.isFinite(product.price))
    .sort((a, b) => b.date - a.date || b.index - a.index).slice(0, 5).map(item => item.product);
  const $ = id => document.getElementById(id);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const money = price => 'Rs. ' + price.toLocaleString('en-LK');
  if (!newest.length) { root.hidden = true; return; }
  $('galleryStage').innerHTML = newest.map((p, index) => `<article class="arrival-slide" role="group" aria-roledescription="slide" aria-label="${index + 1} of ${newest.length}: ${safe(p.name)}"><a href="product.html?id=${encodeURIComponent(p.id)}"><div class="arrival-photo"><img src="${safe(p.image)}" alt="${safe(p.name)} in ${safe(p.color)}" ${index === 0 ? 'fetchpriority="high"' : ''}><span class="arrival-tag">THE NEW EDIT</span><span class="arrival-open" aria-hidden="true">↗</span></div><div class="arrival-card-info"><div><small>${safe(p.category)} / ${safe(p.color)}</small><h2>${safe(p.name)}</h2></div><span>${money(p.price)}</span></div></a></article>`).join('');
  $('galleryDots').innerHTML = newest.map((p, index) => `<button type="button" data-slide="${index}" aria-label="Show ${safe(p.name)}"></button>`).join('');
  const slides = [...root.querySelectorAll('.arrival-slide')];
  root.querySelectorAll('.arrival-open').forEach(icon => { icon.innerHTML = '<svg><use href="#i-arrow"/></svg>'; });
  const sizeGallery = () => { $('galleryStage').style.height = `${Math.max(...slides.map(slide => slide.offsetHeight)) + 12}px`; };
  const sizeObserver = new ResizeObserver(sizeGallery);
  slides.forEach(slide => sizeObserver.observe(slide));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0, paused = reduced.matches, hovering = false, focused = false, visible = true, explicitPlay = false, timer;
  function schedule() {
    clearTimeout(timer);
    if (!paused && (explicitPlay || (!hovering && !focused)) && visible && !document.hidden && newest.length > 1) timer = setTimeout(() => show(active + 1, false), 5000);
  }
  function show(index, announce = true) {
    active = (index + newest.length) % newest.length;
    slides.forEach((slide, i) => {
      let offset = (i - active + newest.length) % newest.length;
      if (offset > newest.length / 2) offset -= newest.length;
      slide.dataset.position = String(offset);
      slide.setAttribute('aria-hidden', String(i !== active));
      slide.inert = i !== active;
      slide.querySelector('a').tabIndex = i === active ? 0 : -1;
    });
    document.querySelectorAll('[data-slide]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.slide) === active)));
    $('galleryCount').textContent = `0${active + 1} / 0${newest.length}`;
    if (announce) $('galleryStatus').textContent = `${newest[active].name}, ${money(newest[active].price)}`;
    schedule();
  }
  function togglePause() { paused = !paused; explicitPlay = !paused; updatePause(); schedule(); }
  function updatePause() { $('galleryPause').innerHTML = paused ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>'; $('galleryPause').setAttribute('aria-label', paused ? 'Play product gallery' : 'Pause product gallery'); }
  $('galleryPrev').addEventListener('click', () => show(active - 1));
  $('galleryNext').addEventListener('click', () => show(active + 1));
  $('galleryPause').addEventListener('click', togglePause);
  document.querySelectorAll('[data-slide]').forEach(button => button.addEventListener('click', () => show(Number(button.dataset.slide))));
  root.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  root.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  root.addEventListener('focusin', event => { focused = true; if (event.target !== $('galleryPause')) explicitPlay = false; schedule(); });
  root.addEventListener('focusout', () => setTimeout(() => { focused = root.contains(document.activeElement); schedule(); }, 0));
  root.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); show(active + (event.key === 'ArrowRight' ? 1 : -1)); } });
  let touchX;
  $('galleryStage').addEventListener('touchstart', event => { touchX = event.changedTouches[0].clientX; }, { passive: true });
  $('galleryStage').addEventListener('touchend', event => { const delta = event.changedTouches[0].clientX - touchX; if (Math.abs(delta) > 45) show(active + (delta < 0 ? 1 : -1)); }, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { paused = reduced.matches; updatePause(); schedule(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }).observe(root);
  if (newest.length === 1) { $('galleryPrev').disabled = true; $('galleryNext').disabled = true; $('galleryPause').hidden = true; }
  updatePause(); show(0, false);
})();
