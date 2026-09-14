// Native navigation remains independent of the optional visual story.
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.navlinks');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.textContent = 'Menu';
  nav.classList.remove('open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.textContent = open ? 'Close' : 'Menu';
  nav.classList.toggle('open', open);
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    closeMenu();
    menu.focus();
  }
});

// The dialog sits outside moving wrappers. Keep the full original photograph visible.
const galleryButtons = [...document.querySelectorAll('[data-image]')];
const lightbox = document.querySelector('.lightbox');
const fullPhoto = lightbox.querySelector('img');
const photoCaption = lightbox.querySelector('p');
let currentPhoto = 0;
let lastTrigger;
let previousOverflow = '';
function showPhoto(index) {
  currentPhoto = (index + galleryButtons.length) % galleryButtons.length;
  const button = galleryButtons[currentPhoto];
  fullPhoto.src = button.dataset.image;
  fullPhoto.alt = button.dataset.alt;
  photoCaption.textContent = `${button.dataset.caption} · ${currentPhoto + 1} of ${galleryButtons.length}`;
}
galleryButtons.forEach((button, index) => button.addEventListener('click', () => {
  lastTrigger = button;
  showPhoto(index);
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  lightbox.showModal();
}));
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.photo-previous').addEventListener('click', () => showPhoto(currentPhoto - 1));
lightbox.querySelector('.photo-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(currentPhoto + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener('close', () => {
  document.body.style.overflow = previousOverflow;
  lastTrigger?.focus();
});

// Paths remember the furthest reading position; photo drift remains reversible.
// No wheel interception, sticky hold, scroll easing or continuous animation loop.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop = window.matchMedia('(min-width: 761px)');
const scenes = [...document.querySelectorAll('[data-journey-scene]')];
const revealTargets = [...document.querySelectorAll('[data-journey-reveal]')];
const heroPhotos = [...document.querySelectorAll('.parallax')].map(image => ({ image, frame: image.parentElement }));
const sceneProgress = new WeakMap();
const seen = new WeakSet();
const activeScenes = new Set();
const activePhotos = new Set();
const photoByFrame = new Map(heroPhotos.map(photo => [photo.frame, photo]));
const progressBar = document.querySelector('.progress');
const clamp = value => Math.max(0, Math.min(1, value));
const hasSize = rect => rect.width > 0 && rect.height > 0;
let framePending = false;
let revealObserver;

function reveal(element) {
  seen.add(element);
  element.classList.remove('journey-pending');
  element.classList.add('journey-seen');
  revealObserver?.unobserve(element);
}

function renderStory() {
  framePending = false;
  const height = window.innerHeight;
  const scrollTop = window.scrollY;
  const pageRange = document.documentElement.scrollHeight - height;
  // Complete all geometry reads before writing path, image or progress styles.
  const sceneBounds = [...activeScenes].map(element => [element, element.getBoundingClientRect()]);
  const photoBounds = !reducedMotion.matches && desktop.matches
    ? [...activePhotos].map(photo => [photo, photo.frame.getBoundingClientRect()])
    : [];
  const updates = sceneBounds.filter(([, rect]) => hasSize(rect) && rect.bottom > 0 && rect.top < height).map(([element, rect]) => {
    const progress = reducedMotion.matches ? 1 : Math.max(sceneProgress.get(element) || 0, clamp((height * .85 - rect.top) / rect.height));
    const drift = reducedMotion.matches ? 0 : Math.max(-1, Math.min(1, (height / 2 - rect.top - rect.height / 2) / ((height + rect.height) / 2))) * 18;
    return { element, progress, drift };
  });
  const photoUpdates = photoBounds.map(([photo, rect]) => {
    const progress = clamp((height - rect.top) / (height + rect.height));
    return { photo, y: (.5 - progress) * 2 * Math.min(18, rect.height * .015) };
  });
  progressBar.style.transform = `scaleX(${pageRange > 0 ? clamp(scrollTop / pageRange) : 0})`;
  updates.forEach(({ element, progress, drift }) => {
    sceneProgress.set(element, progress);
    element.style.setProperty('--journey-progress', String(progress));
    element.style.setProperty('--journey-drift', `${drift.toFixed(2)}px`);
  });
  photoUpdates.forEach(({ photo, y }) => photo.image.style.setProperty('--photo-y', `${y.toFixed(3)}px`));
}

function schedule() {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(renderStory);
  }
}

if ('IntersectionObserver' in window && 'requestAnimationFrame' in window) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      // A fast jump past a photograph must not leave it hidden on the return journey.
      if (entry.isIntersecting || entry.boundingClientRect.bottom <= 0) reveal(entry.target);
    });
  }, { rootMargin: '72px 0px' });

  const sceneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const rect = entry.boundingClientRect;
      if (!hasSize(rect)) {
        activeScenes.delete(entry.target);
        return; // Hidden desktop/phone connectors have not been read yet.
      }
      if (entry.isIntersecting) activeScenes.add(entry.target);
      else {
        activeScenes.delete(entry.target);
        if (rect.bottom <= 0) {
          sceneProgress.set(entry.target, 1);
          entry.target.style.setProperty('--journey-progress', '1');
        }
      }
    });
    schedule();
  });

  const photoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const photo = photoByFrame.get(entry.target);
      if (entry.isIntersecting) activePhotos.add(photo);
      else activePhotos.delete(photo);
      photo.image.classList.toggle('motion-active', entry.isIntersecting && desktop.matches && !reducedMotion.matches);
    });
    schedule();
  });

  function refreshLayout() {
    const height = window.innerHeight;
    const revealBounds = revealTargets.map(element => [element, element.getBoundingClientRect()]);
    const sceneBounds = scenes.map(element => [element, element.getBoundingClientRect()]);
    document.documentElement.dataset.motion = reducedMotion.matches ? 'off' : 'on';
    revealBounds.forEach(([element, rect]) => {
      if (reducedMotion.matches || seen.has(element) || !hasSize(rect) || rect.top < height) reveal(element);
      else {
        element.classList.add('journey-pending');
        revealObserver.observe(element);
      }
    });
    sceneBounds.forEach(([element, rect]) => {
      if (!hasSize(rect)) return;
      if (reducedMotion.matches || rect.bottom <= 0) sceneProgress.set(element, 1);
      element.style.setProperty('--journey-progress', String(sceneProgress.get(element) || 0));
      if (rect.bottom > 0 && rect.top < height) activeScenes.add(element);
      else activeScenes.delete(element);
      if (reducedMotion.matches) element.style.setProperty('--journey-drift', '0px');
    });
    heroPhotos.forEach(photo => {
      if (reducedMotion.matches || !desktop.matches) photo.image.style.removeProperty('--photo-y');
      photo.image.classList.toggle('motion-active', activePhotos.has(photo) && desktop.matches && !reducedMotion.matches);
    });
    schedule();
  }

  // Focus reveals immediately, including when Tab skips through off-screen photos.
  document.addEventListener('focusin', event => {
    let target = event.target;
    while (target instanceof Element) {
      if (target.matches('[data-journey-reveal]')) reveal(target);
      target = target.parentElement;
    }
  });
  scenes.forEach(element => sceneObserver.observe(element));
  heroPhotos.forEach(photo => photoObserver.observe(photo.frame));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', refreshLayout, { passive: true });
  reducedMotion.addEventListener('change', refreshLayout);
  desktop.addEventListener('change', refreshLayout);
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.querySelector('main'));
    scenes.forEach(element => resizeObserver.observe(element));
  }
  refreshLayout();
} else {
  // Without optional animation APIs, the complete story is still visible and usable.
  document.documentElement.dataset.motion = 'off';
  revealTargets.forEach(reveal);
}
