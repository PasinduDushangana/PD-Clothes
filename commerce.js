(() => {
  const money = value => 'Rs. ' + Number(value).toLocaleString('en-LK');
  const savings = p => Number.isFinite(p.originalPrice) && p.originalPrice > p.price && p.price >= 0 ? p.originalPrice - p.price : 0;
  const percent = p => savings(p) ? Number((savings(p) / p.originalPrice * 100).toFixed(1)) : 0;
  const available = p => p.inStock !== false;
  const priceHTML = p => `<span class="current-price">${money(p.price)}</span>${savings(p) ? `<del class="original-price" aria-label="Original price">${money(p.originalPrice)}</del><span class="discount-label">${percent(p)}% OFF</span>` : ''}${!available(p) ? '<span class="stock-label">Sold out</span>' : ''}`;
  window.PD_COMMERCE = { money, savings, percent, available, priceHTML };
})();
