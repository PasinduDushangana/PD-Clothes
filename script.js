(() => {
  'use strict';
  const products = Array.isArray(window.PD_PRODUCTS) ? window.PD_PRODUCTS.filter(p => p && p.id && p.name && Number.isFinite(p.price) && p.image) : [];
  const { savings, percent, available, priceHTML } = window.PD_COMMERCE;
  const byId = new Map(products.map(p => [p.id, p]));
  const $ = id => document.getElementById(id);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const money = value => 'Rs. ' + Number(value).toLocaleString('en-LK');
  const readStored = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const saveStored = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  let cart = readStored('pd-clothes-cart-v1', {});
  if (!cart || typeof cart !== 'object' || Array.isArray(cart)) cart = {};
  cart = Object.fromEntries(Object.entries(cart).filter(([id, qty]) => byId.has(id) && available(byId.get(id)) && Number.isInteger(qty) && qty > 0).map(([id, qty]) => [id, Math.min(qty, 99)]));
  let favorites = readStored('pd-clothes-favorites-v1', []);
  if (!Array.isArray(favorites)) favorites = [];
  favorites = favorites.filter(id => byId.has(id));
  const query = new URLSearchParams(location.search);
  let activeCategory = products.some(p => p.category === query.get('category')) ? query.get('category') : 'All bags';
  let searchTerm = (query.get('q') || '').trim().toLowerCase().slice(0, 120);
  const favoritesPage = document.body.dataset.page === 'favorites';
  const homePage = document.body.dataset.page === 'home';
  let saleOnly = query.get('sale') === '1', savedOnly = favoritesPage, availableOnly = false;
  let lastFocus = null;
  let toastTimer;

  function toast(message) { const el = $('toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 2500); }
  function renderFilters() {
    if (!$('filters')) return;
    const categories = ['All bags', ...new Set(products.map(p => p.category).filter(Boolean))];
    $('filters').innerHTML = categories.map(c => `<button class="filter-button ${c === activeCategory ? 'active' : ''}" type="button" data-category="${escapeHTML(c)}" aria-pressed="${c === activeCategory}">${escapeHTML(c)}</button>`).join('');
  }
  function visibleProducts() {
    let list = products.filter(p => (activeCategory === 'All bags' || p.category === activeCategory) && (!saleOnly || savings(p) > 0) && (!savedOnly || favorites.includes(p.id)) && (!availableOnly || available(p)) && [p.name,p.category,p.color,p.description].join(' ').toLowerCase().includes(searchTerm));
    const sort = $('sortSelect')?.value || 'featured';
    if (sort === 'featured') list.sort((a,b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    if (sort === 'price-asc') list.sort((a,b) => a.price-b.price);
    if (sort === 'price-desc') list.sort((a,b) => b.price-a.price);
    if (sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name));
    if (sort === 'discount') list.sort((a,b) => percent(b)-percent(a));
    return homePage ? list.slice(0, 4) : list;
  }
  function renderProducts() {
    const list = visibleProducts();
    if ($('resultCount')) $('resultCount').textContent = `${list.length} ${list.length === 1 ? 'style' : 'styles'}`;
    $('emptyResults').hidden = list.length !== 0;
    $('productGrid').innerHTML = list.map(p => `<article class="product-card"><div class="product-image-wrap"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)} in ${escapeHTML(p.color)}" loading="lazy"><a class="product-view-link" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="View details for ${escapeHTML(p.name)}"></a>${p.badge ? `<span class="product-badge">${escapeHTML(p.badge)}</span>` : ''}<button class="heart-button ${favorites.includes(p.id) ? 'saved' : ''}" type="button" data-favorite="${escapeHTML(p.id)}" aria-label="${favorites.includes(p.id) ? 'Remove' : 'Save'} ${escapeHTML(p.name)} ${favorites.includes(p.id) ? 'from' : 'to'} favorites" aria-pressed="${favorites.includes(p.id)}"><svg><use href="#i-heart"/></svg></button><button class="quick-add" type="button" data-add="${escapeHTML(p.id)}" ${available(p) ? '' : 'disabled'}>${available(p) ? 'BUY' : 'SOLD OUT'}</button></div><div class="product-meta"><div><div class="product-category">${escapeHTML(p.category)} · ${escapeHTML(p.color)}</div><h3 class="product-name"><a href="product.html?id=${encodeURIComponent(p.id)}">${escapeHTML(p.name)}</a></h3></div><div class="product-price">${priceHTML(p)}</div><p class="product-order-note">${available(p) ? 'Order via WhatsApp' : 'Ask about availability'}</p></div><div class="card-actions"><button class="mobile-add" type="button" data-add="${escapeHTML(p.id)}" ${available(p) ? '' : 'disabled'}>${available(p) ? 'BUY' : 'SOLD OUT'}</button><button class="card-cart-add" type="button" data-cart-add="${escapeHTML(p.id)}" ${available(p) ? '' : 'disabled'} aria-label="Add ${escapeHTML(p.name)} to cart"><svg aria-hidden="true"><use href="#i-bag"/></svg><span>Add to cart</span></button></div></article>`).join('');
  }
  function updateCart() { saveStored('pd-clothes-cart-v1', cart); document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = Object.values(cart).reduce((sum,qty) => sum+qty, 0)); renderCart(); }
  function renderCart() {
    const entries = Object.entries(cart).filter(([id]) => byId.has(id));
    if (!entries.length) {
      $('cartItems').innerHTML = `<div class="cart-empty"><svg><use href="#i-bag"/></svg><h3>Your bag is waiting.</h3><p>Explore the collection and choose Buy to send us an order request on WhatsApp.</p><button class="pill-button dark-button" type="button" id="continueShopping">EXPLORE BAGS <svg><use href="#i-arrow"/></svg></button></div>`;
      $('cartFooter').innerHTML = '';
      return;
    }
    $('cartItems').innerHTML = entries.map(([id,qty]) => { const p = byId.get(id); return `<div class="cart-item"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}"><div class="cart-item-content"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.color)}</p><div class="cart-item-bottom"><div class="qty-control"><button type="button" data-decrease="${escapeHTML(id)}" aria-label="Decrease quantity of ${escapeHTML(p.name)}"><svg><use href="#i-minus"/></svg></button><span>${qty}</span><button type="button" data-increase="${escapeHTML(id)}" aria-label="Increase quantity of ${escapeHTML(p.name)}"><svg><use href="#i-plus"/></svg></button></div><span class="item-price">${money(p.price*qty)}</span></div><button class="remove-item" type="button" data-remove="${escapeHTML(id)}">Remove</button></div></div>`; }).join('');
    const saved = entries.reduce((sum,[id,qty]) => sum + savings(byId.get(id)) * qty, 0);
    const total = entries.reduce((sum,[id,qty]) => sum + byId.get(id).price * qty,0);
    $('cartFooter').innerHTML = `<div class="subtotal"><span>Subtotal</span><span>${money(total)}</span></div>${saved ? `<p class="cart-savings">You save ${money(saved)}</p>` : ''}<p class="drawer-note">Delivery and payment details will be confirmed with you on WhatsApp. No online payment is taken here.</p><a class="pill-button dark-button checkout-button" id="checkoutLink" href="${escapeHTML(orderUrl())}" target="_blank" rel="noopener noreferrer">ORDER ON WHATSAPP <svg><use href="#i-arrow"/></svg></a>`;
  }
  function orderUrl() {
    return window.PD_MESSAGES.url(window.PD_MESSAGES.buildOrder(Object.entries(cart).filter(([id]) => byId.has(id)).map(([id, quantity]) => ({ product: byId.get(id), quantity }))));
  }
  $('cartFooter').addEventListener('click', event => {
    if (!event.target.closest('#checkoutLink')) return;
    event.preventDefault();
    window.PD_ORDERS.open(Object.entries(cart).filter(([id]) => byId.has(id)).map(([id, quantity]) => ({ product: byId.get(id), quantity })));
  });
  function openCart() { lastFocus = document.activeElement; $('cartDrawer').inert = false; document.querySelectorAll('.site-header, main, .footer, .mobile-dock').forEach(el => el.inert = true); $('scrim').hidden = false; requestAnimationFrame(() => $('scrim').classList.add('show')); $('cartDrawer').classList.add('open'); $('cartDrawer').setAttribute('aria-hidden','false'); document.querySelectorAll('[data-cart-open]').forEach(button => button.setAttribute('aria-expanded', 'true')); document.body.classList.add('no-scroll'); $('cartClose').focus(); }
  function closeCart() { $('cartDrawer').inert = true; document.querySelectorAll('.site-header, main, .footer, .mobile-dock').forEach(el => el.inert = false); $('scrim').classList.remove('show'); $('cartDrawer').classList.remove('open'); $('cartDrawer').setAttribute('aria-hidden','true'); document.querySelectorAll('[data-cart-open]').forEach(button => button.setAttribute('aria-expanded', 'false')); document.body.classList.remove('no-scroll'); setTimeout(() => { if (!$('cartDrawer').classList.contains('open')) $('scrim').hidden = true; },300); lastFocus?.focus(); }
  function addToCart(id, quantity = 1) {
    if (!byId.has(id) || !available(byId.get(id))) return;
    if (!Number.isInteger(quantity) || quantity < 1) return;
    cart[id] = Math.min((cart[id] || 0) + quantity, 99);
    updateCart();
    toast(`${byId.get(id).name} added to your bag`);
  }
  window.addEventListener('pd:add-to-cart', event => { addToCart(event.detail.id, event.detail.quantity); openCart(); });
  if ($('productGrid') && !homePage) {
    const options = document.createElement('div');
    options.className = 'shopping-options';
    options.innerHTML = '<label><input type="checkbox" id="saleOnly"> On sale</label><label><input type="checkbox" id="savedOnly"> My favorites</label><label><input type="checkbox" id="availableOnly"> Available only</label>';
    $('productGrid').before(options);
    $('saleOnly').checked = saleOnly;
    $('searchInput').value = searchTerm;
    $('savedOnly').checked = favoritesPage;
    if (favoritesPage) $('savedOnly').parentElement.hidden = true;
    options.addEventListener('change', () => { saleOnly = $('saleOnly').checked; savedOnly = $('savedOnly').checked; availableOnly = $('availableOnly').checked; renderProducts(); });
    $('sortSelect').add(new Option('Biggest discount', 'discount'));
    $('filters').addEventListener('click', event => { const button = event.target.closest('[data-category]'); if (!button) return; activeCategory = button.dataset.category; renderFilters(); renderProducts(); });
  }
  if ($('productGrid')) {
    $('productGrid').addEventListener('click', event => {
      const cartAdd = event.target.closest('[data-cart-add]');
      if (cartAdd) { addToCart(cartAdd.dataset.cartAdd); openCart(); return; }
      const add = event.target.closest('[data-add]');
      if (add) { const product = byId.get(add.dataset.add); if (product && available(product)) window.PD_ORDERS.open([{ product, quantity: 1 }]); return; }
      const favorite = event.target.closest('[data-favorite]');
      if (favorite) { const id = favorite.dataset.favorite; favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites,id]; saveStored('pd-clothes-favorites-v1',favorites); renderProducts(); toast(favorites.includes(id) ? 'Saved to your favorites' : 'Removed from favorites'); }
      else if (!event.target.closest('a,button,input,select,textarea')) {
        const link = event.target.closest('.product-card')?.querySelector('.product-view-link');
        if (link) location.href = link.href;
      }
    });
  }
  $('cartItems').addEventListener('click', event => {
    if (event.target.closest('#continueShopping')) { closeCart(); location.href = 'shop.html'; return; }
    for (const [attribute, change] of [['data-increase',1],['data-decrease',-1],['data-remove',0]]) { const button = event.target.closest(`[${attribute}]`); if (!button) continue; const id = button.getAttribute(attribute); if (!byId.has(id)) return; if (change === 0 || cart[id]+change <= 0) delete cart[id]; else cart[id] = Math.min(cart[id]+change,99); updateCart(); return; }
  });
  document.querySelectorAll('[data-cart-open]').forEach(button => button.addEventListener('click', openCart));
  $('cartClose').addEventListener('click',closeCart);
  $('scrim').addEventListener('click',closeCart);
  $('cartDrawer').addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...$('cartDrawer').querySelectorAll('button:not(:disabled), a[href]')].filter(el => el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener('keydown',event => { if (event.key === 'Escape' && $('cartDrawer').classList.contains('open') && !document.querySelector('dialog[open]')) closeCart(); });
  if ($('productGrid') && !homePage) {
    $('searchToggle')?.addEventListener('click',() => { $('searchInput').focus(); $('searchWrap').scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); });
    $('searchInput').addEventListener('input',event => { searchTerm = event.target.value.trim().toLowerCase(); renderProducts(); });
    $('clearSearch').addEventListener('click',() => { $('searchInput').value=''; searchTerm=''; renderProducts(); $('searchInput').focus(); });
    $('resetFilters').addEventListener('click',() => { activeCategory='All bags'; searchTerm=''; saleOnly=availableOnly=false; savedOnly=favoritesPage; ['saleOnly','savedOnly','availableOnly'].forEach(id => $(id).checked=false); $('savedOnly').checked=favoritesPage; $('searchInput').value=''; renderFilters(); renderProducts(); });
    $('sortSelect').addEventListener('change',renderProducts);
  }


  $('year').textContent = new Date().getFullYear();
  if ($('productGrid')) { renderFilters(); renderProducts(); }
  updateCart();
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();
