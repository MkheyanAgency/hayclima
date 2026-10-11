/**
 * HayClima.am - Root animation entry point (Self-contained)
 */
(function () {
  'use strict';
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  document.documentElement.classList.add('has-animations');

  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealCallback, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  });

  const initScrollReveals = () => {
    const targets = document.querySelectorAll(
      '.reveal, .reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-scale, .stagger-card'
    );
    const winHeight = window.innerHeight || document.documentElement.clientHeight;
    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= winHeight * 0.95 && rect.bottom >= 0) {
        el.classList.add('active');
      } else {
        revealObserver.observe(el);
      }
    });
  };

  const counterCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetValue = parseInt(el.getAttribute('data-target'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = parseInt(el.getAttribute('data-duration'), 10) || 1600;

        if (!isNaN(targetValue)) {
          const startTime = performance.now();
          function frame(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(ease * targetValue);
            el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
            if (progress < 1) {
              requestAnimationFrame(frame);
            } else {
              el.textContent = `${prefix}${targetValue.toLocaleString()}${suffix}`;
            }
          }
          requestAnimationFrame(frame);
        }
        observer.unobserve(el);
      }
    });
  };

  const counterObserver = new IntersectionObserver(counterCallback, { threshold: 0.25 });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollReveals();
      document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
    });
  } else {
    initScrollReveals();
    document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
  }
})();
