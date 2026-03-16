/* ============================================
   WATERLOO ABC — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  /* ---- Scroll Reveal (IntersectionObserver) ---- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Sticky Nav ---- */
  function initNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    var scrolled = false;

    function onScroll() {
      var shouldBeScrolled = window.scrollY > 60;
      if (shouldBeScrolled !== scrolled) {
        scrolled = shouldBeScrolled;
        nav.classList.toggle('nav--scrolled', scrolled);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile Menu ---- */
  function initMobileMenu() {
    var hamburger = document.getElementById('navHamburger');
    var menu = document.getElementById('mobileMenu');
    if (!hamburger || !menu) return;

    var links = menu.querySelectorAll('.nav__mobile-link');
    var isOpen = false;

    function toggleMenu() {
      isOpen = !isOpen;
      hamburger.classList.toggle('is-active', isOpen);
      menu.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-hidden', String(!isOpen));
      document.body.classList.toggle('menu-open', isOpen);
    }

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      hamburger.classList.remove('is-active');
      menu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
    }

    hamburger.addEventListener('click', toggleMenu);

    links.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeMenu();
    });
  }

  /* ---- Smooth Scroll for Anchor Links ---- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        var navHeight = document.getElementById('nav').offsetHeight;
        var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ---- Generic Carousel ---- */
  function initCarousel(config) {
    var track = document.getElementById(config.trackId);
    var prevBtn = document.getElementById(config.prevId);
    var nextBtn = document.getElementById(config.nextId);
    var dotsContainer = document.getElementById(config.dotsId);
    if (!track || !prevBtn || !nextBtn) return;

    var slides = track.children;
    var current = 0;
    var autoPlayTimer = null;

    function getSlidesPerView() {
      if (window.innerWidth < 769) return config.mobilePerView || 1;
      if (window.innerWidth < 1025) return config.tabletPerView || 2;
      return config.desktopPerView || 3;
    }

    function getMaxIndex() {
      return Math.max(0, slides.length - getSlidesPerView());
    }

    function updateTrack() {
      var perView = getSlidesPerView();
      var gap = 24;
      var slideWidth = (track.parentElement.offsetWidth - gap * (perView - 1)) / perView;
      var offset = current * (slideWidth + gap);
      track.style.transform = 'translateX(-' + offset + 'px)';
      updateDots();
    }

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      var maxIdx = getMaxIndex();
      for (var i = 0; i <= maxIdx; i++) {
        var dot = document.createElement('button');
        dot.className = config.dotClass || 'gallery__dot';
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.dataset.index = i;
        if (i === current) dot.classList.add('is-active');
        dot.addEventListener('click', function () {
          current = parseInt(this.dataset.index);
          updateTrack();
          resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      var dots = dotsContainer.children;
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.toggle('is-active', i === current);
      }
    }

    function goNext() {
      current = current >= getMaxIndex() ? 0 : current + 1;
      updateTrack();
    }

    function goPrev() {
      current = current <= 0 ? getMaxIndex() : current - 1;
      updateTrack();
    }

    function resetAutoPlay() {
      if (!config.autoPlay) return;
      clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(goNext, config.autoPlayInterval || 5000);
    }

    nextBtn.addEventListener('click', function () { goNext(); resetAutoPlay(); });
    prevBtn.addEventListener('click', function () { goPrev(); resetAutoPlay(); });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (current > getMaxIndex()) current = getMaxIndex();
        buildDots();
        updateTrack();
      }, 150);
    });

    buildDots();
    updateTrack();

    if (config.autoPlay) {
      resetAutoPlay();
      track.parentElement.addEventListener('mouseenter', function () { clearInterval(autoPlayTimer); });
      track.parentElement.addEventListener('mouseleave', resetAutoPlay);
    }
  }

  /* ---- FAQ Accordion ---- */
  function initFAQ() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var btn = item.querySelector('.faq-item__question');
      if (!btn) return;

      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        // Close all
        items.forEach(function (other) {
          other.classList.remove('is-open');
          var otherBtn = other.querySelector('.faq-item__question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        // Open clicked (if was closed)
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---- Initialize Everything ---- */
  function init() {
    initReveal();
    initNav();
    initMobileMenu();
    initSmoothScroll();
    initFAQ();

    // Gallery Carousel
    initCarousel({
      trackId: 'galleryTrack',
      prevId: 'galleryPrev',
      nextId: 'galleryNext',
      dotsId: 'galleryDots',
      dotClass: 'gallery__dot',
      desktopPerView: 3,
      tabletPerView: 2,
      mobilePerView: 1,
      autoPlay: true,
      autoPlayInterval: 4000
    });

    // Testimonials Carousel
    initCarousel({
      trackId: 'testimonialsTrack',
      prevId: 'testimonialsPrev',
      nextId: 'testimonialsNext',
      dotsId: 'testimonialsDots',
      dotClass: 'testimonials__dot',
      desktopPerView: 1,
      tabletPerView: 1,
      mobilePerView: 1,
      autoPlay: true,
      autoPlayInterval: 6000
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
