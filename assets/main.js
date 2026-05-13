/* Layer Up — main.js */

// ── Header scroll shadow
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile menu
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  nav.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
});

// Close mobile menu when a link is clicked
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Scroll-triggered fade-up animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-up');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.product-card, .cat-card, .process__step, .about__content > *, .ig-post'
).forEach((el, i) => {
  el.style.opacity = '0';
  el.style.animationFillMode = 'forwards';
  el.style.animationDuration = `${0.5 + (i % 4) * 0.08}s`;
  el.style.animationDelay = `${(i % 4) * 0.07}s`;
  observer.observe(el);
});

// ── Wishlist toggle
document.querySelectorAll('.product-card__wish').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    btn.classList.toggle('active');
    const svg = btn.querySelector('svg');
    if (btn.classList.contains('active')) {
      svg.setAttribute('fill', 'currentColor');
    } else {
      svg.setAttribute('fill', 'none');
    }
  });
});

// ── Cart badge pulse on add
document.querySelectorAll('.btn--primary').forEach(btn => {
  if (btn.textContent.includes('carrito')) {
    btn.addEventListener('click', () => {
      const badge = document.querySelector('.cart-badge');
      if (badge) {
        const count = parseInt(badge.textContent) + 1;
        badge.textContent = count;
        badge.style.transform = 'scale(1.4)';
        setTimeout(() => { badge.style.transform = ''; }, 300);
      }
    });
  }
});

// ── Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
