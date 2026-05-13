/* Layer Up — main.js */

// ── Header scroll shadow
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── Mobile menu
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    }
  });
});

// ── Carousel section (horizontal product list) nav buttons
document.querySelectorAll('.carousel-section').forEach(section => {
  const track = section.querySelector('.carousel-track');
  if (!track) return;
  section.querySelector('[data-dir="prev"]')?.addEventListener('click', () => {
    const card = track.querySelector('.product-card');
    track.scrollBy({ left: -(card ? card.offsetWidth + 24 : 300), behavior: 'smooth' });
  });
  section.querySelector('[data-dir="next"]')?.addEventListener('click', () => {
    const card = track.querySelector('.product-card');
    track.scrollBy({ left: card ? card.offsetWidth + 24 : 300, behavior: 'smooth' });
  });
});

// ── Product card image slideshow
function initCardSlideshow(card) {
  const slides = card.querySelector('.product-card__slides');
  if (!slides) return;
  const total = slides.querySelectorAll('.product-card__slide').length;
  if (total <= 1) return;

  let current = 0;
  const dots = card.querySelectorAll('.product-card__dot');

  function goTo(index) {
    current = (index + total) % total;
    slides.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  card.querySelector('.product-card__slide-btn--prev')?.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    goTo(current - 1);
  });
  card.querySelector('.product-card__slide-btn--next')?.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    goTo(current + 1);
  });

  // Swipe (touch)
  let touchStartX = 0;
  slides.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slides.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });

  // Drag (mouse)
  let dragStartX = 0, dragging = false;
  slides.addEventListener('mousedown', e => { dragStartX = e.clientX; dragging = true; });
  slides.addEventListener('mouseup', e => {
    if (!dragging) return;
    dragging = false;
    const diff = dragStartX - e.clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });
  slides.addEventListener('mouseleave', () => { dragging = false; });
}

document.querySelectorAll('.product-card').forEach(initCardSlideshow);

// ── Wishlist toggle
document.addEventListener('click', e => {
  const btn = e.target.closest('.product-card__wish');
  if (!btn) return;
  e.preventDefault(); e.stopPropagation();
  btn.classList.toggle('active');
  const path = btn.querySelector('path');
  if (path) path.setAttribute('fill', btn.classList.contains('active') ? 'currentColor' : 'none');
});

// ── AJAX Add to cart
window.addToCartAjax = function(btn) {
  if (btn.classList.contains('loading') || btn.classList.contains('disabled')) return;
  const variantId = parseInt(btn.dataset.variantId);
  if (!variantId) return;

  const originalHTML = btn.innerHTML;
  btn.classList.add('loading');
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" opacity=".3"/><path d="M12 3a9 9 0 019 9" style="animation:spin .7s linear infinite;transform-origin:center"/></svg>';

  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity: 1 })
  })
  .then(r => {
    if (!r.ok) throw new Error('error');
    return r.json();
  })
  .then(() => {
    btn.classList.remove('loading');
    btn.classList.add('added');
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    updateCartCount();
    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = originalHTML;
    }, 1800);
  })
  .catch(() => {
    btn.classList.remove('loading');
    btn.innerHTML = originalHTML;
  });
};

function updateCartCount() {
  fetch('/cart.js')
    .then(r => r.json())
    .then(cart => {
      let badge = document.querySelector('.cart-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        document.querySelector('.cart-btn')?.appendChild(badge);
      }
      badge.textContent = cart.item_count;
      badge.style.display = cart.item_count > 0 ? 'flex' : 'none';
      badge.style.transform = 'scale(1.5)';
      badge.style.transition = 'transform .2s';
      setTimeout(() => { badge.style.transform = ''; }, 250);
    });
}

// ── Scroll fade-up animations
const ioObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-up');
      ioObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card, .cat-card, .process__step, .ig-post').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.animationFillMode = 'forwards';
  el.style.animationDuration = `${0.45 + (i % 4) * 0.07}s`;
  el.style.animationDelay = `${(i % 4) * 0.06}s`;
  ioObserver.observe(el);
});

// Spin keyframe for loading state
const style = document.createElement('style');
style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
document.head.appendChild(style);
