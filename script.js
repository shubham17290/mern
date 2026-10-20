// Landing page interactions
(function () {
  'use strict';

  // Mobile nav toggle
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // Animated counters
  const counters = document.querySelectorAll('.stat-num');
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const suffix = el.querySelector('.stat-suffix');
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.childNodes[0].nodeValue = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else {
        el.childNodes[0].nodeValue = target;
        if (suffix) suffix.style.display = '';
      }
    };
    requestAnimationFrame(step);
  };

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.tl-item, .card, .project-card, .stack-item, .step, .stat');
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 6) * 60 + 'ms';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach((el) => io.observe(el));

  // Counter trigger when hero stats visible
  const statsSection = document.querySelector('.hero-stats');
  let counted = false;
  if (statsSection) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !counted) {
          counted = true;
          counters.forEach(animateCounter);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px 200px 0px' });
    cio.observe(statsSection);
  }

  // Active nav highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const onScroll = () => {
    let current = '';
    sections.forEach((s) => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach((a) => {
      a.style.color = a.getAttribute('href') === '#' + current ? 'var(--text)' : '';
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();
