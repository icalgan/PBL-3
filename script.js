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

  // Five visual layers are staged on one sticky timeline:
  // stage -> performers -> audience -> back cloud -> larger front cloud.
  const updateScenes = () => {
    const vh = window.innerHeight || 1;

    if (hero) {
      const stickyScene = hero.querySelector('.concert-sticky-scene');
      const travel = Math.max(hero.offsetHeight - (stickyScene ? stickyScene.offsetHeight : vh), 1);
      const rect = hero.getBoundingClientRect();
      const progress = clamp(-rect.top / travel, 0, 1);

      // First sequence: the audience rises, followed by the performers and stage.
      const concertReveal = clamp(progress / .27, 0, 1);
      hero.style.setProperty('--scene-progress', progress.toFixed(3));
      hero.style.setProperty('--back-scroll', (-concertReveal * vh * .08).toFixed(1) + 'px');
      hero.style.setProperty('--middle-scroll', (-concertReveal * vh * .22).toFixed(1) + 'px');
      hero.style.setProperty('--front-scroll', (-concertReveal * vh * .86).toFixed(1) + 'px');

      // Cloud back rises in front of the audience. Its path starts fully below
      // the viewport and ends flush with the sticky stage.
      const backPhase = clamp((progress - .06) / .28, 0, 1);
      const cloudBack = hero.querySelector('.scene-cloud-back');
      if (cloudBack) {
        cloudBack.style.setProperty('--cloud-back-y', ((1 - backPhase) * vh * 1.55).toFixed(1) + 'px');
      }

      // The larger foreground cloud follows after the back cloud has entered.
      const frontPhase = clamp((progress - .32) / .30, 0, 1);
      const cloudFront = hero.querySelector('.scene-cloud-front');
      if (cloudFront) {
        cloudFront.style.setProperty('--cloud-front-y', ((1 - frontPhase) * vh * 1.78).toFixed(1) + 'px');
      }

      hero.style.setProperty('--scene-caption-opacity', clamp(progress * 2, 0, 1).toFixed(3));
      const cue = hero.querySelector('.hero-scroll-cue');
      if (cue) cue.style.opacity = String(clamp(1 - progress * 2.8, 0, 1));
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

  // Scroll choreography remains available for this interaction; reduced-motion
  // only disables the continuous floating/bobbing animations in CSS.
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
      hero.style.setProperty('--mouse-x', (x * 100).toFixed(1) + '%');
      hero.style.setProperty('--mouse-y', (y * 100).toFixed(1) + '%');
      hero.style.setProperty('--duo-x', ((x - .5) * 13).toFixed(1) + 'px');
      hero.style.setProperty('--duo-y', ((y - .5) * 9).toFixed(1) + 'px');
      const duo = hero.querySelector('.concert-duo');
      if (duo) duo.style.marginLeft = ((x - .5) * 18).toFixed(1) + 'px';
    }, { passive: true });
    pointerScene.addEventListener('pointerleave', () => {
      hero.style.setProperty('--mouse-x', '50%');
      hero.style.setProperty('--mouse-y', '42%');
      hero.style.setProperty('--duo-x', '0px');
      hero.style.setProperty('--duo-y', '0px');
      const duo = hero.querySelector('.concert-duo');
      if (duo) duo.style.marginLeft = '0px';
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