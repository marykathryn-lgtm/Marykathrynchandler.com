(function () {
  'use strict';

  // Footer year
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    var icon = toggle.querySelector('.material-symbols-outlined');

    var setOpen = function (open) {
      menu.classList.toggle('hidden', !open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (icon) icon.textContent = open ? 'close' : 'menu';
    };

    toggle.addEventListener('click', function () {
      setOpen(menu.classList.contains('hidden'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
        setOpen(false);
        toggle.focus();
      }
    });
    // Close the menu if the window is resized up to the desktop layout
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  }

  // Scroll reveal for sections that start below the fold
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      // threshold 0 so very tall sections (large image galleries) still reveal
      { threshold: 0, rootMargin: '0px 0px -8% 0px' }
    );

    document.querySelectorAll('main section').forEach(function (section) {
      if (section.getBoundingClientRect().top > window.innerHeight * 0.9) {
        section.classList.add('reveal');
        observer.observe(section);
      }
    });
  }
})();
