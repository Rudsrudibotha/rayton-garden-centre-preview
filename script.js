document.documentElement.classList.add('js');
const menu=document.querySelector('.menu-toggle'), nav=document.querySelector('.navlinks');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',open);menu.textContent=open?'Close':'Menu';nav.classList.toggle('open',open)});
nav?.addEventListener('click',e=>{if(e.target.closest('a')){menu.setAttribute('aria-expanded','false');menu.textContent='Menu';nav.classList.remove('open')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){menu.click();menu.focus()}});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('seen');observer.unobserve(e.target)}}),{threshold:.09});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),scenes=[...document.querySelectorAll('.story')],bar=document.querySelector('.progress');let ticking=false;
function renderScroll(){const top=window.scrollY,total=document.documentElement.scrollHeight-innerHeight;bar.style.width=(total>0?top/total*100:0)+'%';if(!reduced.matches&&innerWidth>760){scenes.forEach(s=>{let box=s.getBoundingClientRect(),range=s.offsetHeight-innerHeight;let p=range>0?Math.max(0,Math.min(1,-box.top/range)):0;s.style.setProperty('--p',p)})}ticking=false}
function schedule(){if(!ticking){requestAnimationFrame(renderScroll);ticking=true}}window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);renderScroll();
const lightbox=document.querySelector('.lightbox');let lastTrigger;
document.querySelectorAll('[data-image]').forEach(b=>b.addEventListener('click',()=>{lastTrigger=b;lightbox.querySelector('img').src=b.dataset.image;lightbox.querySelector('img').alt=b.dataset.alt||'';lightbox.querySelector('p').textContent=b.dataset.caption||'';lightbox.showModal()}));
lightbox.querySelector('button').addEventListener('click',()=>lightbox.close());lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});lightbox.addEventListener('close',()=>lastTrigger?.focus());