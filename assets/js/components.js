/* ==========================================================================
   COMPONENTS.JS
   Injects the shared site header and footer into every page (so nav/footer
   only need editing in ONE place), wires the mobile menu, highlights the
   current page's nav link, and exposes a global toast() helper used by
   forms.js and main.js.

   TO EDIT SITE NAVIGATION: change the NAV_ITEMS array below — it updates
   every page at once. TO EDIT SOCIAL LINKS: change SOCIAL_LINKS.
   TO EDIT PHONE/EMAIL/ADDRESS: search for them below and in contact.html.
   ========================================================================== */

(function () {
  'use strict';

  const NAV_ITEMS = [
    { label: 'Home', href: 'index.html', page: 'home' },
    { label: 'About', href: 'about.html', page: 'about' },
    { label: 'Legislative Work', href: 'legislative-work.html', page: 'legislative' },
    { label: 'Achievements', href: 'achievements.html', page: 'achievements' },
    { label: 'Issues & Policy', href: 'issues-policy.html', page: 'issues' },
    { label: 'News & Media', href: 'news-media.html', page: 'news' },
    { label: 'Engagement', href: 'engagement.html', page: 'engagement' },
    { label: 'Get Involved', href: 'get-involved.html', page: 'get-involved' },
    { label: 'Contact', href: 'contact.html', page: 'contact', cta: true }
  ];

  // Placeholder hrefs ("#") — replace with verified, real profile URLs
  // before launch. See README.md > "Placeholder content to replace".
  const SOCIAL_LINKS = [
    { label: 'X (Twitter)', href: '#', icon: 'x' },
    { label: 'Instagram', href: '#', icon: 'instagram' },
    { label: 'Facebook', href: '#', icon: 'facebook' },
    { label: 'LinkedIn', href: '#', icon: 'linkedin' },
    { label: 'YouTube', href: '#', icon: 'youtube' }
  ];

  const ICONS = {
    x: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M18.9 2h3.3l-7.2 8.2L23.5 22h-6.7l-5.2-6.8L5.6 22H2.3l7.7-8.8L1 2h6.9l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.3 4h-2l12.4 16Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2c2.7 0 3 0 4.1.06 1.1.05 1.8.22 2.5.47.7.27 1.2.6 1.8 1.16.5.5.9 1.1 1.16 1.8.25.7.42 1.4.47 2.5.06 1.1.06 1.4.06 4.1s0 3-.06 4.1c-.05 1.1-.22 1.8-.47 2.5a5 5 0 0 1-1.16 1.8 5 5 0 0 1-1.8 1.16c-.7.25-1.4.42-2.5.47-1.1.06-1.4.06-4.1.06s-3 0-4.1-.06c-1.1-.05-1.8-.22-2.5-.47a5 5 0 0 1-1.8-1.16 5 5 0 0 1-1.16-1.8c-.25-.7-.42-1.4-.47-2.5C2 15 2 14.7 2 12s0-3 .06-4.1c.05-1.1.22-1.8.47-2.5.27-.7.6-1.2 1.16-1.8.5-.5 1.1-.9 1.8-1.16.7-.25 1.4-.42 2.5-.47C9 2 9.3 2 12 2Zm0 1.8c-2.66 0-2.97 0-4.02.06-.87.04-1.34.18-1.65.3-.42.16-.7.35-1.02.66-.32.32-.5.6-.66 1.02-.12.31-.26.78-.3 1.65C4.3 8.03 4.3 8.34 4.3 11s0 2.97.05 4.02c.04.87.18 1.34.3 1.65.16.42.34.7.66 1.02.32.32.6.5 1.02.66.31.12.78.26 1.65.3 1.05.05 1.36.05 4.02.05s2.97 0 4.02-.05c.87-.04 1.34-.18 1.65-.3.42-.16.7-.34 1.02-.66.32-.32.5-.6.66-1.02.12-.31.26-.78.3-1.65.05-1.05.05-1.36.05-4.02s0-2.97-.05-4.02c-.04-.87-.18-1.34-.3-1.65a2.75 2.75 0 0 0-.66-1.02 2.75 2.75 0 0 0-1.02-.66c-.31-.12-.78-.26-1.65-.3C14.97 3.8 14.66 3.8 12 3.8Zm0 3.15a5.05 5.05 0 1 1 0 10.1 5.05 5.05 0 0 1 0-10.1Zm0 1.8a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Zm5.25-1.98a1.18 1.18 0 1 1-2.36 0 1.18 1.18 0 0 1 2.36 0Z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8.4h2.8l.4-3.3h-3.2V8.1c0-.95.27-1.6 1.63-1.6H17V3.5C16.7 3.46 15.7 3.37 14.5 3.37c-2.44 0-4.11 1.49-4.11 4.22v2.35H7.6v3.3h2.79V22h3.11Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.66 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M22.5 7.2s-.22-1.57-.9-2.26c-.86-.9-1.82-.9-2.26-.96C16.2 3.7 12 3.7 12 3.7h-.01s-4.2 0-7.34.28c-.44.06-1.4.06-2.26.96-.68.69-.9 2.26-.9 2.26S1.2 9 1.2 10.8v1.4c0 1.8.28 3.6.28 3.6s.22 1.57.9 2.26c.86.9 1.98.87 2.48.97 1.8.17 7.14.27 7.14.27s4.2-.01 7.34-.28c.44-.06 1.4-.06 2.26-.96.68-.69.9-2.26.9-2.26s.28-1.8.28-3.6v-1.4c0-1.8-.28-3.6-.28-3.6ZM9.7 14.9V8.7l6 3.1-6 3.1Z"/></svg>'
  };

  // The "Seal of Service" brand mark — an engraved-seal motif used as the
  // site's signature visual element (header, footer, favicon share the idea).
  const SEAL_SVG =
    '<svg viewBox="0 0 64 64" role="img" aria-label="Seal of the Office of the Chairman">' +
      '<circle cx="32" cy="32" r="30" fill="#0B1E36"/>' +
      '<circle cx="32" cy="32" r="30" fill="none" stroke="#D4AF37" stroke-width="1.5"/>' +
      '<circle cx="32" cy="32" r="25" fill="none" stroke="#D4AF37" stroke-width="1"/>' +
      '<g stroke="#D4AF37" stroke-width="1">' +
        '<line x1="32" y1="4" x2="32" y2="8"/><line x1="32" y1="56" x2="32" y2="60"/>' +
        '<line x1="4" y1="32" x2="8" y2="32"/><line x1="56" y1="32" x2="60" y2="32"/>' +
        '<line x1="11.5" y1="11.5" x2="14.3" y2="14.3"/><line x1="49.7" y1="49.7" x2="52.5" y2="52.5"/>' +
        '<line x1="11.5" y1="52.5" x2="14.3" y2="49.7"/><line x1="49.7" y1="14.3" x2="52.5" y2="11.5"/>' +
      '</g>' +
      '<text x="32" y="39" font-family="Georgia, serif" font-weight="700" font-size="16" fill="#F6F1E4" text-anchor="middle">PLS</text>' +
    '</svg>';

  function iconSvg(name) { return ICONS[name] || ''; }

  function socialLinksHtml() {
    return SOCIAL_LINKS.map(function (s) {
      return '<a href="' + s.href + '" aria-label="' + s.label + ' (opens in a new tab)" target="_blank" rel="noopener noreferrer">' + iconSvg(s.icon) + '</a>';
    }).join('');
  }

  function navLinksHtml(activePage) {
    return NAV_ITEMS.map(function (item) {
      const isActive = item.page === activePage;
      const classes = ['nav__link'];
      if (item.cta) classes.push('nav__link--cta');
      if (isActive) classes.push('nav__link--active');
      const current = isActive ? ' aria-current="page"' : '';
      return '<li><a class="' + classes.join(' ') + '" href="' + item.href + '"' + current + '>' + item.label + '</a></li>';
    }).join('');
  }

  function renderHeader(activePage) {
    return (
      '<div class="top-bar">' +
        '<div class="top-bar__inner">' +
          '<div class="top-bar__contacts">' +
            '<a href="tel:+2348000000000">+234 800 000 0000</a>' +
            '<a href="mailto:info@princelanresanusi.example.ng">info@princelanresanusi.example.ng</a>' +
          '</div>' +
          '<div class="top-bar__social">' + socialLinksHtml() + '</div>' +
        '</div>' +
      '</div>' +
      '<header class="site-header" id="siteHeader">' +
        '<div class="header-bar">' +
          '<a class="brand" href="index.html">' +
            '<span class="brand__mark">' + SEAL_SVG + '</span>' +
            '<span class="brand__text">' +
              '<span class="brand__name">Prince Lanre Sanusi</span>' +
              '<span class="brand__title">Chairman, Amuwo-Odofin Local Government</span>' +
            '</span>' +
          '</a>' +
          '<button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="mainNav" aria-label="Open main menu">' +
            '<span class="nav-toggle__icon"></span>' +
          '</button>' +
          '<nav class="main-nav" id="mainNav" aria-label="Primary">' +
            '<ul class="nav__list">' + navLinksHtml(activePage) + '</ul>' +
          '</nav>' +
        '</div>' +
      '</header>' +
      '<div class="nav-overlay" id="navOverlay"></div>'
    );
  }

  function renderFooter() {
    const year = new Date().getFullYear();
    return (
      '<footer class="site-footer">' +
        '<div class="footer__top">' +
          '<div>' +
            '<span class="footer__brand-name">Prince Lanre Sanusi</span>' +
            '<p>Executive Chairman, Amuwo-Odofin Local Government, Lagos State &mdash; grassroots development, transparent leadership.</p>' +
            '<div class="footer__social">' + socialLinksHtml() + '</div>' +
          '</div>' +
          '<div>' +
            '<h2 class="footer__heading">Quick Links</h2>' +
            '<nav class="footer__links" aria-label="Quick links">' +
              '<a href="index.html">Home</a>' +
              '<a href="about.html">About</a>' +
              '<a href="legislative-work.html">Legislative Work</a>' +
              '<a href="achievements.html">Achievements</a>' +
            '</nav>' +
          '</div>' +
          '<div>' +
            '<h2 class="footer__heading">Explore</h2>' +
            '<nav class="footer__links" aria-label="More links">' +
              '<a href="issues-policy.html">Issues &amp; Policy</a>' +
              '<a href="news-media.html">News &amp; Media</a>' +
              '<a href="engagement.html">Committees &amp; Engagement</a>' +
              '<a href="get-involved.html">Get Involved</a>' +
            '</nav>' +
          '</div>' +
          '<div>' +
            '<h2 class="footer__heading">Stay Updated</h2>' +
            '<p>Get updates on projects, town halls and news across Amuwo-Odofin.</p>' +
            '<form class="footer-newsletter" id="footerNewsletterForm" novalidate>' +
              '<label class="sr-only" for="footerNewsletterEmail">Email address</label>' +
              '<input class="form-control" type="email" id="footerNewsletterEmail" name="email" placeholder="Your email address" required>' +
              '<div class="form-honeypot" aria-hidden="true"><label>Leave blank<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
              '<button class="btn btn--primary btn--block" type="submit" style="margin-top:0.75rem;">Subscribe</button>' +
            '</form>' +
          '</div>' +
        '</div>' +
        '<div class="footer__bottom">' +
          '<div class="footer__bottom-inner">' +
            '<span>&copy; ' + year + ' Office of the Executive Chairman, Amuwo-Odofin Local Government. All rights reserved.</span>' +
            '<span class="footer__tagline">Open, Transparent and Accountable</span>' +
          '</div>' +
        '</div>' +
      '</footer>' +
      '<div class="toast-container" id="toastContainer" aria-live="polite" aria-atomic="true"></div>' +
      '<button class="back-to-top" id="backToTop" type="button" aria-label="Back to top">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>' +
      '</button>'
    );
  }

  /* ---------------- Global toast helper (used by forms.js + main.js) ---------------- */
  function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    if (!container) { window.alert(message); return; }
    const toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'success');
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('toast--visible'); });
    setTimeout(function () {
      toast.classList.remove('toast--visible');
      setTimeout(function () { toast.remove(); }, 350);
    }, 5500);
  }
  window.PLSToast = showToast;

  function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const overlay = document.getElementById('navOverlay');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    function closeNav() {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function openNav() {
      document.body.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      const firstLink = nav.querySelector('a');
      if (firstLink) firstLink.focus();
    }

    toggle.addEventListener('click', function () {
      const isOpen = document.body.classList.contains('nav-open');
      if (isOpen) { closeNav(); toggle.focus(); } else { openNav(); }
    });
    if (overlay) overlay.addEventListener('click', closeNav);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { closeNav(); toggle.focus(); }
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 980) closeNav();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const headerMount = document.getElementById('site-header');
    const footerMount = document.getElementById('site-footer');
    const activePage = document.body.dataset.page || '';

    if (headerMount) headerMount.innerHTML = renderHeader(activePage);
    if (footerMount) footerMount.innerHTML = renderFooter();

    initHeaderScroll();
    initMobileNav();

    // Lets forms.js know the injected footer (with its newsletter form) exists.
    document.dispatchEvent(new CustomEvent('pls:chrome-ready'));
  });
})();
