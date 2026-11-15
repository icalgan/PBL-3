(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  // Mobile navigation
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Tutup navigasi' : 'Buka navigasi');
      toggle.textContent = open ? '×' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    }));
  }

  // Reveal content as the reader moves through the story.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -45px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  const brandSection = document.querySelector('.brand-intro-section');
  if (brandSection && 'IntersectionObserver' in window) {
    const brandObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) brandSection.classList.add('in-frame');
      });
    }, { threshold: 0.2 });
    brandObserver.observe(brandSection);
  } else if (brandSection) {
    brandSection?.classList.add('in-frame');
  }

  // Active navigation follows the section currently in view.
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.main-nav a')];
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-38% 0px -52% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }

  const hero = document.querySelector('.hero-concert');
  const after = document.querySelector('.after-concert-section');
  let ticking = false;
  const updateScenes = () => {
    const vh = window.innerHeight || 1;

    if (hero) {
      const sticky = hero.querySelector('.concert-sticky-scene');
      const travel = Math.max(hero.offsetHeight - (sticky ? sticky.offsetHeight : vh), 1);
      const rect = hero.getBoundingClientRect();
      const progress = clamp(-rect.top / travel, 0, 1);

      // Layers 1–3 travel upward at slightly different rates.
      const concertExit = clamp(progress / .58, 0, 1);
      const stage = hero.querySelector('.scene-layer-back');
      const idols = hero.querySelector('.scene-layer-middle');
      const audience = hero.querySelector('.scene-layer-front');
      const finale = hero.querySelector('.scene-layer-crowd-finale');

      if (stage) stage.style.setProperty('--stage-y', (-concertExit * vh * 1.10).toFixed(1) + 'px');
      if (idols) idols.style.setProperty('--idol-y', (-concertExit * vh * 1.24).toFixed(1) + 'px');
      if (audience) audience.style.setProperty('--audience-y', (-concertExit * vh * 1.38).toFixed(1) + 'px');

      // Layer 4 enters from below after the concert layers begin to leave,
      // covers the scene, then travels upward to reveal the plain purple canvas.
      const finaleIn = clamp((progress - .34) / .30, 0, 1);
      const finaleOut = clamp((progress - .74) / .20, 0, 1);
      const finaleY = (1 - finaleIn) * vh * 1.12 - finaleOut * vh * 1.18;
      if (finale) finale.style.setProperty('--finale-y', finaleY.toFixed(1) + 'px');

      hero.style.setProperty('--scene-caption-opacity', clamp(progress * 1.8, 0, 1).toFixed(3));
      const cue = hero.querySelector('.hero-scroll-cue');
      if (cue) cue.style.opacity = String(clamp(1 - progress * 2.5, 0, 1));
    }

    if (after) {
      const rect = after.getBoundingClientRect();
      const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      after.style.setProperty('--waste-drift', ((.5 - progress) * 24).toFixed(1) + 'px');
    }
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScenes);
  };

  updateScenes();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateScenes, { passive: true });
  window.addEventListener('load', updateScenes, { once: true });


  // Pointer spotlight and performer depth response.
  const pointerScene = hero ? (hero.querySelector('.concert-sticky-scene') || hero) : null;
  if (pointerScene && finePointer && !reduceMotion) {
    pointerScene.addEventListener('pointermove', event => {
      const rect = pointerScene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const stickyRect = pointerScene.getBoundingClientRect();
      hero.style.setProperty('--mouse-x', (x * 100).toFixed(1) + '%');
      hero.style.setProperty('--mouse-y', (y * 100).toFixed(1) + '%');
      const duo = hero.querySelector('.concert-duo');
      if (duo) duo.style.filter = 'drop-shadow(' + ((x - .5) * 8).toFixed(1) + 'px 14px 18px #40335a25)';
    }, { passive: true });
    pointerScene.addEventListener('pointerleave', () => {
      hero.style.setProperty('--mouse-x', '50%');
      hero.style.setProperty('--mouse-y', '42%');
      hero.style.setProperty('--mouse-x', '50%');
      hero.style.setProperty('--mouse-y', '42%');
      const duo = hero.querySelector('.concert-duo');
      if (duo) duo.style.filter = '';
    }, { passive: true });
  }

  // Restrained tilt on the DIY cards, only where a mouse/trackpad is available.
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.idea-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty('--card-rx', (-y * 2.4).toFixed(2) + 'deg');
        card.style.setProperty('--card-ry', (x * 2.4).toFixed(2) + 'deg');
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--card-rx', '0deg');
        card.style.setProperty('--card-ry', '0deg');
      }, { passive: true });
    });
  }
})();