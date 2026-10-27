(() => {
  const products = window.PD_PRODUCTS || [];
  const motion=matchMedia('(prefers-reduced-motion:no-preference) and (hover:hover) and (pointer:fine)');
  document.querySelectorAll('.campaign .pill-button,.personal-service .pill-button').forEach(button=>{button.addEventListener('pointermove',event=>{if(!motion.matches||document.documentElement.classList.contains('effects-paused'))return;const r=button.getBoundingClientRect();button.style.translate=((event.clientX-r.left-r.width/2)*.07)+'px '+((event.clientY-r.top-r.height/2)*.1)+'px';});button.addEventListener('pointerleave',()=>button.style.translate='');});
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
  document.addEventListener('pointerover',event=>{const halo=document.querySelector('.cursor-halo');if(halo)halo.dataset.label=event.target.closest('.product-card,.detail-image-frame')?'EXPLORE':event.target.closest('#galleryStage')?'DRAG':'';});
  const top=document.createElement('a');top.href='#top';top.className='back-to-top';top.textContent='↑';top.setAttribute('aria-label','Back to top');document.querySelector('.footer-bottom')?.append(top);
  const canonical=document.createElement('link');canonical.rel='canonical';canonical.href='https://pasindudushangana.github.io/PD-Clothes/'+(location.pathname.split('/').pop()||'index.html')+(location.pathname.endsWith('product.html')?location.search:'');document.head.append(canonical);
})();
