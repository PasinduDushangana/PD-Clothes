(() => {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#navLinks a').forEach(link => {
    if (link.getAttribute('href') === page) link.setAttribute('aria-current', 'page');
  });
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
