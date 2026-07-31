/* ==========================================================================
   MAIN.JS
   General site interactions: scroll-reveal, animated counters, accordions,
   gallery lightbox, the video teaser modal, and bill-status trackers.
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Scroll reveal ---------------- */
  function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!targets.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-visible'); });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(function (t) { observer.observe(t); });
  }

  /* ---------------- Animated counters (ledger stat-strip + stat-dark) ---------------- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || '0');
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion) { el.textContent = target + suffix; return; }
    const duration = 1400;
    let start = null;
    function step(timestamp) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;
    if (!('IntersectionObserver' in window)) { counters.forEach(animateCounter); return; }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { observer.observe(c); });
  }

  /* ---------------- Accordion ---------------- */
  function initAccordions() {
    document.querySelectorAll('.accordion__trigger').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel) panel.hidden = expanded;
      });
    });
  }

  /* ---------------- Generic modal helper ---------------- */
  function openModal(contentHtml) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">' +
        '<button class="modal__close" type="button" aria-label="Close">&times;</button>' +
        contentHtml +
      '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });

    function close() {
      overlay.classList.remove('is-open');
      setTimeout(function () { overlay.remove(); }, 250);
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.modal__close').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    overlay.querySelector('.modal__close').focus();
  }

  /* ---------------- Gallery lightbox ---------------- */
  function initGallery() {
    document.querySelectorAll('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () {
        const img = item.querySelector('img');
        if (!img) return;
        openModal(
          '<div class="modal__media"><img src="' + img.getAttribute('src') + '" alt="' + img.getAttribute('alt') + '"></div>' +
          '<p class="modal__caption">' + (item.dataset.caption || img.getAttribute('alt')) + '</p>'
        );
      });
    });
  }

  /* ---------------- Video teaser ---------------- */
  function initVideoTeaser() {
    const trigger = document.querySelector('[data-video-trigger]');
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      const videoId = trigger.dataset.videoId;
      if (!videoId) {
        if (window.PLSToast) window.PLSToast('Video content will be added soon — check back shortly.', 'success');
        return;
      }
      openModal(
        '<div class="modal__media"><iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1" title="Video message from the Chairman" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>'
      );
    });
  }

  /* ---------------- Bill tracker: derive step classes from data-status ---------------- */
  function initBillTrackers() {
    const order = ['reading', 'committee', 'passed', 'assented'];
    document.querySelectorAll('.tracker[data-status]').forEach(function (tracker) {
      const status = (tracker.dataset.status || '').toLowerCase();
      const currentIndex = order.indexOf(status);
      tracker.querySelectorAll('.tracker__step').forEach(function (step, index) {
        step.classList.remove('is-complete', 'is-current');
        if (currentIndex === -1) return;
        if (index < currentIndex) step.classList.add('is-complete');
        if (index === currentIndex) step.classList.add(status === 'assented' ? 'is-complete' : 'is-current');
      });
    });
  }

  /* ---------------- Back to top ---------------- */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-visible', window.scrollY > 480);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  function initAll() {
    initScrollReveal();
    initCounters();
    initAccordions();
    initGallery();
    initVideoTeaser();
    initBillTrackers();
    initBackToTop();
  }

  document.addEventListener('DOMContentLoaded', initAll);
  // Back-to-top button lives in the injected footer, so also (re)bind it once ready.
  document.addEventListener('pls:chrome-ready', initBackToTop);
})();
