(() => {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#navLinks a').forEach(link => {
    if (link.getAttribute('href') === page) link.setAttribute('aria-current', 'page');
  });
  document.querySelectorAll('[data-nav-page]').forEach(link => {
    if (link.dataset.navPage === page) link.setAttribute('aria-current', 'page');
    if (page === 'product.html' && link.dataset.navPage === 'shop.html') link.classList.add('is-section');
  });
  const more = document.getElementById('moreDialog');
  const moreOpen = document.getElementById('moreOpen');
  if (['about.html', 'contact.html'].includes(page)) moreOpen.classList.add('is-section');
  more.querySelectorAll('a').forEach(link => {
    if (link.getAttribute('href') === page) link.setAttribute('aria-current', 'page');
  });
  moreOpen.addEventListener('click', () => { more.showModal(); moreOpen.setAttribute('aria-expanded', 'true'); });
  document.getElementById('moreClose').addEventListener('click', () => more.close());
  more.addEventListener('close', () => moreOpen.setAttribute('aria-expanded', 'false'));
  more.addEventListener('click', event => {
    const r = more.getBoundingClientRect();
    if (event.target === more && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) more.close();
  });
  matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches && more.open) more.close(); });
  const edit = document.getElementById('homeEdit');
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  if (edit) {
    const products = window.PD_PRODUCTS.filter(p => p.id && p.name && p.image && Number.isFinite(p.price));
    const picks = [...products.filter(p => p.featured), ...products.filter(p => !p.featured)].slice(0, 3);
    edit.innerHTML = picks.map(p => `<a class="related-card" href="product.html?id=${encodeURIComponent(p.id)}"><div class="related-image"><img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy"></div><div class="related-meta"><div><small>${safe(p.category)}</small><h3>${safe(p.name)}</h3></div><span class="related-price">${window.PD_COMMERCE.priceHTML(p)}</span></div></a>`).join('');
  }
  document.getElementById('contactForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const name = String(values.get('name')).trim();
    const message = String(values.get('message')).trim();
    if (!name || !message) { form.querySelector(!name ? '[name="name"]' : '[name="message"]').focus(); return; }
    const text = window.PD_MESSAGES.contact({ ...Object.fromEntries([...values].map(([key, value]) => [key, String(value).trim()])), name, message });
    location.href = `https://wa.me/94719891483?text=${encodeURIComponent(text)}`;
  });
})();
