(() => {
  const products = window.PD_PRODUCTS || [];
  const motion=matchMedia('(prefers-reduced-motion:no-preference) and (hover:hover) and (pointer:fine)');
  document.querySelectorAll('.campaign .pill-button,.personal-service .pill-button').forEach(button=>{button.addEventListener('pointermove',event=>{if(!motion.matches||document.documentElement.classList.contains('effects-paused'))return;const r=button.getBoundingClientRect();button.style.translate=((event.clientX-r.left-r.width/2)*.07)+'px '+((event.clientY-r.top-r.height/2)*.1)+'px';});button.addEventListener('pointerleave',()=>button.style.translate='');});
  const dialog = document.createElement('dialog');
  dialog.className = 'quick-view-dialog';
  dialog.setAttribute('aria-label','Product quick view');
  const close = document.createElement('button'); close.type='button'; close.className='icon-button'; close.textContent='×'; close.setAttribute('aria-label','Close quick view');
  const content=document.createElement('div'); content.className='quick-view-content';
  dialog.append(close,content); document.body.append(dialog);
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();});
  function show(product) {
    const img=document.createElement('img');img.src=product.image;img.alt=product.name;
    const info=document.createElement('div');
    const name=document.createElement('h2');name.textContent=product.name;
    const price=document.createElement('p');price.textContent=window.PD_COMMERCE.money(product.price);
    const desc=document.createElement('p');desc.textContent=product.description;
    const link=document.createElement('a');link.href='product.html?id='+encodeURIComponent(product.id);link.className='text-link';link.textContent='VIEW FULL DETAILS';
    const add=document.createElement('button');add.type='button';add.className='pill-button dark-button';add.textContent=window.PD_COMMERCE.available(product)?'ADD TO BAG':'SOLD OUT';add.disabled=!window.PD_COMMERCE.available(product);add.addEventListener('click',()=>{dialog.close();window.dispatchEvent(new CustomEvent('pd:add-to-cart',{detail:{id:product.id,quantity:1}}));});
    info.append(name,price,desc,link,add);content.replaceChildren(img,info);dialog.showModal();
  }
  function decorate() {
    document.querySelectorAll('.product-card').forEach(card=>{
      if(card.querySelector('.quick-view-trigger'))return;
      const id=card.querySelector('[data-add]')?.dataset.add;
      const product=products.find(p=>p.id===id);if(!product)return;
      const button=document.createElement('button');button.type='button';button.className='quick-view-trigger';button.textContent='Quick view';button.setAttribute('aria-label','Quick view '+product.name);button.addEventListener('click',()=>show(product));card.querySelector('.product-image-wrap').append(button);
    });
  }
  decorate();const grid=document.getElementById('productGrid');if(grid)new MutationObserver(decorate).observe(grid,{childList:true});
  const menu=document.createElement('details');menu.className='collections-menu';
  const summary=document.createElement('summary');summary.textContent='COLLECTIONS';menu.append(summary);
  const links=document.createElement('div');links.className='collections-panel';
  [...new Set(products.map(p=>p.category))].forEach(category=>{const item=products.find(p=>p.category===category);const a=document.createElement('a');a.href='shop.html?category='+encodeURIComponent(category);const img=document.createElement('img');img.src=item.image;img.alt='';const label=document.createElement('span');label.textContent=category;a.append(img,label);links.append(a);});menu.append(links);document.querySelector('#navLinks')?.append(menu);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;summary.focus();}});
  document.addEventListener('click',event=>{if(!menu.contains(event.target))menu.open=false;});
  const more=document.getElementById('moreDialog');
  if(more){['Home','Shop','Collections','New arrivals','Saved bags'].forEach((name,index)=>{const a=document.createElement('a');a.textContent=name;a.href=['index.html','shop.html','index.html#collections','index.html#new-arrivals','favorites.html'][index];more.append(a);});}
  document.querySelector('.browse-section')?.setAttribute('id','collections');document.querySelector('.new-edit')?.setAttribute('id','new-arrivals');
  const gallery=document.querySelector('.detail-gallery');
  if(gallery){let touchX=0;function step(direction){const buttons=[...gallery.querySelectorAll('[data-image-index]')];if(buttons.length<2)return;const index=buttons.findIndex(button=>button.getAttribute('aria-pressed')==='true');buttons[(index+direction+buttons.length)%buttons.length].click();}gallery.tabIndex=0;gallery.setAttribute('aria-label','Product gallery. Use arrow keys to change photos.');gallery.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowRight'?1:-1);}});gallery.addEventListener('touchstart',event=>touchX=event.changedTouches[0].clientX,{passive:true});gallery.addEventListener('touchend',event=>{const dx=event.changedTouches[0].clientX-touchX;if(Math.abs(dx)>50)step(dx<0?1:-1);},{passive:true});}
  document.addEventListener('pointerover',event=>{const halo=document.querySelector('.cursor-halo');if(halo)halo.dataset.label=event.target.closest('.product-view-link,.detail-image-frame')?'VIEW':event.target.closest('#galleryStage')?'DRAG':'';});
  const top=document.createElement('a');top.href='#top';top.className='back-to-top';top.textContent='↑';top.setAttribute('aria-label','Back to top');document.querySelector('.footer-bottom')?.append(top);
  const canonical=document.createElement('link');canonical.rel='canonical';canonical.href='https://pasindudushangana.github.io/PD-Clothes/'+(location.pathname.split('/').pop()||'index.html')+(location.pathname.endsWith('product.html')?location.search:'');document.head.append(canonical);
})();
