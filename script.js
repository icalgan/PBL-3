(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

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

  // Reveal editorial content as each scene enters the viewport.
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
    }, { threshold: 0.18 });
    brandObserver.observe(brandSection);
  } else if (brandSection) {
    brandSection.classList.add('in-frame');
  }

  // Active navigation follows the section currently being read.
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.main-nav a')];
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-38% 0px -52% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }

  const hero = document.querySelector('.hero-concert');
  const cloud = document.querySelector('.cloud-transition');
  const after = document.querySelector('.after-concert-section');
  let ticking = false;

  // Firewatch-inspired parallax: far background, performers, crowd and cloud
  // move at different rates to create a layered sense of depth.
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const updateScrollScenes = () => {
    const vh = window.innerHeight || 1;
    const y = window.scrollY || window.pageYOffset;

    if (hero) {
      const rect = hero.getBoundingClientRect();
      const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      const travel = clamp(y - (rect.top + y), 0, rect.height + vh);
      hero.style.setProperty('--hero-scroll', (progress * 165).toFixed(1) + 'px');
      hero.style.setProperty('--hero-progress', progress.toFixed(3));
    }

    if (cloud) {
      const rect = cloud.getBoundingClientRect();
      const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      cloud.style.setProperty('--cloud-progress', progress.toFixed(3));
      cloud.style.setProperty('--cloud-drift', ((progress - .5) * -34).toFixed(1) + 'px');
    }

    if (after) {
      const rect = after.getBoundingClientRect();
      const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      after.style.setProperty('--waste-drift', ((.5 - progress) * 28).toFixed(1) + 'px');
    }
    ticking = false;
  };

  const onScroll = () => {
    if (reduceMotion || ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollScenes);
  };
  if (!reduceMotion) {
    updateScrollScenes();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateScrollScenes, { passive: true });
  }

  // Dogstudio-inspired subtle pointer response for the central concert artwork.
  if (hero && finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      hero.style.setProperty('--pointer-x', (x * 18).toFixed(1) + 'px');
      hero.style.setProperty('--pointer-y', (y * 12).toFixed(1) + 'px');
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--pointer-x', '0px');
      hero.style.setProperty('--pointer-y', '0px');
    }, { passive: true });
  }

  // Small card tilt: restrained, only on mouse/trackpad layouts.
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.idea-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty('--card-rx', (-y * 2.2).toFixed(2) + 'deg');
        card.style.setProperty('--card-ry', (x * 2.2).toFixed(2) + 'deg');
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--card-rx', '0deg');
        card.style.setProperty('--card-ry', '0deg');
      }, { passive: true });
    });
  }

  // Ensure scroll values are correct after fonts and images settle.
  window.addEventListener('load', updateScrollScenes, { once: true });
})();