(() => {
  'use strict';
  const { money, savings, percent, available } = window.PD_COMMERCE;
  const url = message => `https://wa.me/94719891483?text=${encodeURIComponent(message)}`;
  const productUrl = product => new URL(`product.html?id=${encodeURIComponent(product.id)}`, location.href).href;
  const productLines = (product, quantity) => [
    `*${product.name}*  × ${quantity}`,
    `Style: ${product.category}  •  Color: ${product.color}`,
    `Unit price: ${money(product.price)}`,
    ...(savings(product) ? [`Offer: ${percent(product)}% off (was ${money(product.originalPrice)})`, `You save: ${money(savings(product) * quantity)}`] : []),
    `Line total: *${money(product.price * quantity)}*`,
    `Product ID: ${product.id}`,
    `View: ${productUrl(product)}`
  ];
  const buildOrder = (entries, details = {}, reference = '') => {
    const subtotal = entries.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
    const saved = entries.reduce((sum, { product, quantity }) => sum + savings(product) * quantity, 0);
    return [
      '*PD CLOTHES*',
      'ORDER REQUEST',
      '────────────────────',
      'Hello! I would love to order these bags. Please confirm availability and the final total.',
      ...(reference ? [`Reference: *${reference}*`] : []),
      '', '*YOUR ITEMS*',
      ...entries.flatMap(({ product, quantity }, index) => [`${index + 1}. ${productLines(product, quantity).join('\n')}`, '']),
      '────────────────────',
      `Quantity: ${entries.reduce((sum, item) => sum + item.quantity, 0)} item(s)`,
      `Bag subtotal: *${money(subtotal)}*`,
      ...(saved ? [`Offer savings: ${money(saved)}`] : []),
      'Delivery: to be confirmed',
      'Final payable total: to be confirmed', '',
      '*CUSTOMER & DELIVERY*',
      `Name: ${details.name || 'To be shared in chat'}`,
      `Phone: ${details.phone || 'To be shared in chat'}`,
      `City / district: ${details.city || 'To be shared in chat'}`,
      `Delivery address: ${details.address || 'To be shared in chat'}`,
      ...(details.notes ? [`Order notes: ${details.notes}`] : []), '',
      'Please share the delivery fee and timing, final amount, and payment instructions. Thank you!',
      '_No payment has been made on the website._'
    ].join('\n');
  };
  const inquiry = product => ['*PD CLOTHES | AVAILABILITY REQUEST*', 'Hello! Please let me know when this bag is available again.', '', `Bag: ${product.name}`, `Product ID: ${product.id}`, `Style: ${product.category}`, `Color: ${product.color}`, `Listed price: ${money(product.price)}`, `Product: ${productUrl(product)}`, '', 'Could you confirm restock timing, similar bags, delivery options, and payment arrangements?'].join('\n');
  const contact = details => ['*PD CLOTHES | CUSTOMER MESSAGE*', `Topic: ${details.topic}`, `Name: ${details.name}`, ...(details.phone ? [`Phone: ${details.phone}`] : []), ...(details.reference ? [`Order / request reference: ${details.reference}`] : []), ...(details.product ? [`Product name or link: ${details.product}`] : []), '', '*MESSAGE*', details.message, '', `Sent from: ${new URL('contact.html', location.href).href}`].join('\n');
  window.PD_MESSAGES = { url, buildOrder, inquiry, contact };

  const dialog = document.createElement('dialog');
  dialog.id = 'orderDialog';
  dialog.className = 'order-dialog';
  dialog.setAttribute('aria-labelledby', 'orderTitle');
  dialog.innerHTML = `<button type="button" class="order-close icon-button" aria-label="Close order details">×</button>
    <span class="small-index">ONE STEP CLOSER</span><h2 id="orderTitle">Make it <em>yours.</em></h2>
    <p class="order-intro">Add your details, review your request, then send it on WhatsApp. We’ll confirm everything with you there.</p>
    <form id="orderForm"><div class="checkout-layout"><div class="order-fields">
      <label>Your name<input name="name" autocomplete="name" maxlength="80" placeholder="Full name" required></label>
      <label>Contact number<input name="phone" type="tel" autocomplete="tel" maxlength="30" placeholder="07X XXX XXXX" required></label>
      <label class="field-wide">City / district<input name="city" autocomplete="address-level2" maxlength="100" placeholder="Where should we deliver?" required></label>
      <label class="field-wide">Delivery address <span>(optional)</span><textarea name="address" autocomplete="street-address" rows="2" maxlength="400" placeholder="You can also share this in WhatsApp"></textarea></label>
      <label class="field-wide">Order notes <span>(optional)</span><textarea name="notes" rows="2" maxlength="500" placeholder="A delivery request or a question about your bags"></textarea></label>
    </div><div class="checkout-review"><div class="order-summary" id="orderSummary"></div><div id="checkoutItems"></div></div></div>
    <details class="message-preview"><summary>Preview your WhatsApp message</summary><pre id="orderPreview"></pre></details>
    <p class="order-privacy">Your details are used only to prepare this message and are not saved by this website. No online payment is collected.</p>
    <button class="pill-button dark-button" type="submit">CONTINUE TO WHATSAPP <svg><use href="#i-arrow"/></svg></button></form>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  let selected = [], reference = '', pendingSignature = '';
  const back = document.createElement('button');
  back.type = 'button'; back.className = 'pill-button checkout-back'; back.textContent = 'BACK TO SHOPPING';
  back.addEventListener('click', () => dialog.close()); form.append(back);
  const details = () => Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, String(value).trim()]));
  function refresh() {
    document.getElementById('orderPreview').textContent = buildOrder(selected, details(), reference);
  }
  function open(entries) {
    selected = entries.filter(item => available(item.product) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99);
    if (!selected.length) return;
    const signature = JSON.stringify(selected.map(item => [item.product.id, item.quantity, item.product.price]).sort());
    if (signature !== pendingSignature || !reference) reference = 'PD-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    pendingSignature = signature;
    back.textContent = document.getElementById('cartDrawer')?.classList.contains('open') ? 'BACK TO SHOPPING BAG' : 'BACK TO SHOPPING';
    form.reset();
    const total = selected.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    document.getElementById('orderSummary').textContent = `${selected.reduce((sum, item) => sum + item.quantity, 0)} item(s) · ${money(total)} subtotal · Delivery confirmed in chat`;
    document.getElementById('orderSummary').textContent += ' · Reference: ' + reference;
    const items = document.getElementById('checkoutItems');
    items.replaceChildren(...selected.map(({ product, quantity }) => {
      const row = document.createElement('div'); row.className = 'checkout-item';
      const img = document.createElement('img'); img.src = product.image; img.alt = product.name;
      const copy = document.createElement('div');
      const name = document.createElement('strong'); name.textContent = product.name;
      const detail = document.createElement('span'); detail.textContent = (product.color || product.category) + ' · Qty ' + quantity;
      const price = document.createElement('span'); price.textContent = money(product.price * quantity);
      copy.append(name, detail, price); row.append(img, copy); return row;
    }));
    refresh();
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('order-is-open');
  }
  form.addEventListener('input', refresh);
  form.addEventListener('submit', event => {
    event.preventDefault();
    for (const field of ['name', 'phone', 'city']) {
      if (!details()[field]) { form.elements[field].focus(); return; }
    }
    location.href = url(buildOrder(selected, details(), reference));
  });
  dialog.querySelector('.order-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('order-is-open'); form.reset(); document.getElementById('orderPreview').textContent = ''; });
  window.PD_ORDERS = { open };
})();
