/**
 * HayClima.am - Premium Motion & Scroll Interaction System
 * Hardware-accelerated, WCAG prefers-reduced-motion compliant,
 * progressive-enhancement safe (never leaves content invisible if JS fails or delays).
 */

(function () {
  'use strict';

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Keep standard static layout with zero animations for accessibility
    return;
  }

  // Mark HTML root as supporting animations
  document.documentElement.classList.add('has-animations');

  // 1. Scroll Reveal Observer
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
      // If element is already in or above the viewport on page load (e.g. hero section)
      if (rect.top <= winHeight * 0.95 && rect.bottom >= 0) {
        el.classList.add('active');
      } else {
        revealObserver.observe(el);
      }
    });
  };

  // 2. Animated Numerical Counters (e.g. 10+ years, 12,000+ projects)
  const counterCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetValue = parseInt(el.getAttribute('data-target'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = parseInt(el.getAttribute('data-duration'), 10) || 1600;

        if (!isNaN(targetValue)) {
          animateCounter(el, targetValue, duration, prefix, suffix);
        }
        observer.unobserve(el);
      }
    });
  };

  const counterObserver = new IntersectionObserver(counterCallback, { threshold: 0.25 });

  function animateCounter(el, target, duration, prefix, suffix) {
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * target);
      el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
      }
    }

    requestAnimationFrame(frame);
  }

  // 3. Subtle 3D Card Tilt Effect on Hover (Desktop only)
  function initCardTilt() {
    if (window.innerWidth < 1024) return;

    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotX = (y / rect.height) * -6;
        const rotY = (x / rect.width) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // 4. Header Scroll State
  function initHeaderScroll() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollReveals();
      document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
      initCardTilt();
      initHeaderScroll();
    });
  } else {
    initScrollReveals();
    document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
    initCardTilt();
    initHeaderScroll();
  }
})();
