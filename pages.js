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
  document.querySelectorAll('.market-search input').forEach(input => { input.value = new URLSearchParams(location.search).get('q') || ''; });
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const categoryList = document.getElementById('marketCategories');
  if (categoryList) {
    const categories = [...new Set(window.PD_PRODUCTS.map(p => p.category).filter(Boolean))];
    categoryList.innerHTML = categories.map(category => {
      const items = window.PD_PRODUCTS.filter(p => p.category === category);
      return `<a href="shop.html?category=${encodeURIComponent(category)}"><img src="${safe(items[0].image)}" alt="" loading="lazy"><span>${safe(category)}<small>${items.length} ${items.length === 1 ? 'product' : 'products'}</small></span><span aria-hidden="true">›</span></a>`;
    }).join('');
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
