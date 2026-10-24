(() => {
  'use strict';
  const products = Array.isArray(window.PD_PRODUCTS) ? window.PD_PRODUCTS : [];
  const id = new URLSearchParams(location.search).get('id');
  const product = products.find(item => item.id === id);
  const $ = name => document.getElementById(name);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const money = amount => 'Rs. ' + Number(amount).toLocaleString('en-LK');
  const productUrl = item => `product.html?id=${encodeURIComponent(item.id)}`;
  const images = product ? [product.image, ...(Array.isArray(product.images) ? product.images.filter(Boolean) : [])] : [];
  let quantity = 1;
  let currentImage = 0;

  if (!product || !product.name || !product.image || !Number.isFinite(product.price)) {
    document.title = 'Bag not found | PD Clothes';
    $('productContent').innerHTML = '<div class="product-not-found"><span class="small-index">THE COLLECTION</span><h1>We could not find that bag.</h1><p>The link may have changed, or this style may no longer be available.</p><a class="pill-button dark-button" href="index.html#collection">EXPLORE ALL BAGS <svg><use href="#i-arrow"/></svg></a></div>';
    return;
  }

  document.title = `${product.name} | PD Clothes`;
  document.querySelector('meta[name="description"]').content = `${product.name} in ${product.color}. ${product.description} Order from PD Clothes on WhatsApp.`;
  $('crumbName').textContent = product.name;
  const imageAlt = `${product.name} in ${product.color}`;
  $('productContent').innerHTML = `
    <section class="product-layout" aria-labelledby="detailTitle">
      <div class="detail-gallery">
        <div class="detail-image-frame">
          <img id="mainProductImage" src="${safe(images[0])}" alt="${safe(imageAlt)}" fetchpriority="high">
          ${product.badge ? `<span class="detail-badge">${safe(product.badge)}</span>` : ''}
          <button class="zoom-button" type="button" id="zoomButton" aria-label="View larger image of ${safe(product.name)}">⤢ <span>VIEW LARGER</span></button>
        </div>
        ${images.length > 1 ? `<div class="detail-thumbnails" id="detailThumbnails">${images.map((image, index) => `<button type="button" data-image-index="${index}" aria-label="View image ${index + 1} of ${safe(product.name)}" aria-pressed="${index === 0}"><img src="${safe(image)}" alt=""></button>`).join('')}</div>` : ''}
        <p class="image-caption">PD CLOTHES / THE BAG EDIT</p>
      </div>
      <div class="detail-information">
        <span class="small-index">THE BAG EDIT / ${safe(product.category)}</span>
        <h1 id="detailTitle">${safe(product.name)}</h1>
        <p class="detail-subtitle">${safe(product.category)} <span>✳</span> ${safe(product.color)}</p>
        <div class="detail-price">${money(product.price)}</div>
        <div class="detail-divider"></div>
        <p class="detail-description">${safe(product.description)}</p>
        <div class="detail-specs"><div><span>STYLE</span><strong>${safe(product.category)}</strong></div><div><span>COLOR</span><strong>${safe(product.color)}</strong></div></div>
        <div class="detail-purchase"><span class="detail-action-label">QUANTITY</span><div class="detail-quantity"><button type="button" id="qtyDecrease" aria-label="Decrease quantity"><svg><use href="#i-minus"/></svg></button><output id="detailQuantity" aria-live="polite">1</output><button type="button" id="qtyIncrease" aria-label="Increase quantity"><svg><use href="#i-plus"/></svg></button></div></div>
        <button class="pill-button dark-button detail-add" id="detailAdd" type="button">ADD TO BAG <svg><use href="#i-arrow"/></svg></button>
        <a class="pill-button detail-order" id="detailOrder" target="_blank" rel="noopener noreferrer">ORDER THIS BAG ON WHATSAPP <svg><use href="#i-arrow"/></svg></a>
        <div class="detail-utilities"><button type="button" id="detailFavorite" aria-pressed="false"><svg><use href="#i-heart"/></svg><span>SAVE THIS BAG</span></button><button type="button" id="detailShare"><svg><use href="#i-arrow"/></svg><span>SHARE THIS BAG</span></button></div>
        <div class="detail-accordions"><details><summary>ABOUT THIS STYLE <span>+</span></summary><p>${safe(product.description)} Please confirm the final product details with us before ordering.</p></details><details><summary>DELIVERY & PAYMENT <span>+</span></summary><p>Message us on WhatsApp to confirm availability, delivery options, and payment details. No online payment is collected on this website.</p></details><details><summary>HOW TO ORDER <span>+</span></summary><p>Choose a quantity and tap “Order this bag on WhatsApp.” Your message will include the product name, color, quantity, and estimated total.</p></details></div>
      </div>
    </section>`;

  function orderUrl() {
    const message = `Hi PD Clothes! I would like to order:\n\n• ${product.name} (${product.color}) × ${quantity} — ${money(product.price * quantity)}\n\nPlease confirm availability, delivery, and payment details.`;
    return `https://wa.me/94719891483?text=${encodeURIComponent(message)}`;
  }
  function refreshQuantity() { $('detailQuantity').textContent = quantity; $('detailOrder').href = orderUrl(); }
  $('qtyDecrease').addEventListener('click', () => { quantity = Math.max(1, quantity - 1); refreshQuantity(); });
  $('qtyIncrease').addEventListener('click', () => { quantity = Math.min(99, quantity + 1); refreshQuantity(); });
  $('detailAdd').addEventListener('click', () => window.dispatchEvent(new CustomEvent('pd:add-to-cart', { detail: { id: product.id, quantity } })));
  refreshQuantity();

  const favoritesKey = 'pd-clothes-favorites-v1';
  function favorites() { try { const value = JSON.parse(localStorage.getItem(favoritesKey)); return Array.isArray(value) ? value : []; } catch { return []; } }
  function refreshFavorite() { const saved = favorites().includes(product.id); $('detailFavorite').setAttribute('aria-pressed', String(saved)); $('detailFavorite').querySelector('span').textContent = saved ? 'SAVED TO FAVORITES' : 'SAVE THIS BAG'; }
  $('detailFavorite').addEventListener('click', () => { const saved = favorites(); const next = saved.includes(product.id) ? saved.filter(item => item !== product.id) : [...saved, product.id]; try { localStorage.setItem(favoritesKey, JSON.stringify(next)); } catch {} refreshFavorite(); });
  refreshFavorite();

  $('detailShare').addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: location.href });
      else { await navigator.clipboard.writeText(location.href); $('detailShare').querySelector('span').textContent = 'LINK COPIED'; setTimeout(() => $('detailShare').querySelector('span').textContent = 'SHARE THIS BAG', 2200); }
    } catch (error) { if (error.name !== 'AbortError') $('detailShare').querySelector('span').textContent = 'SHARE UNAVAILABLE'; }
  });

  if (images.length > 1) $('detailThumbnails').addEventListener('click', event => {
    const button = event.target.closest('[data-image-index]');
    if (!button) return;
    currentImage = Number(button.dataset.imageIndex);
    $('mainProductImage').src = images[currentImage];
    $('detailThumbnails').querySelectorAll('button').forEach((item, index) => item.setAttribute('aria-pressed', String(index === currentImage)));
  });
  $('zoomButton').addEventListener('click', () => { $('imageDialogImg').src = images[currentImage]; $('imageDialogImg').alt = imageAlt; $('imageDialog').showModal(); });
  $('imageDialogClose').addEventListener('click', () => $('imageDialog').close());
  $('imageDialog').addEventListener('click', event => { if (event.target === $('imageDialog')) $('imageDialog').close(); });

  const related = products.filter(item => item.id !== product.id).sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category)).slice(0, 3);
  if (related.length) {
    $('relatedSection').hidden = false;
    $('relatedGrid').innerHTML = related.map(item => `<a class="related-card" href="${productUrl(item)}"><div class="related-image"><img src="${safe(item.image)}" alt="${safe(item.name)}" loading="lazy"></div><div class="related-meta"><div><small>${safe(item.category)}</small><h3>${safe(item.name)}</h3></div><span>${money(item.price)}</span></div></a>`).join('');
  }
})();
