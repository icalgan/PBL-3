(() => {
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

  const items = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -35px 0px' });
    items.forEach(item => observer.observe(item));
  } else {
    items.forEach(item => item.classList.add('is-visible'));
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.main-nav a')];
  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => activeObserver.observe(section));
  }


  // Sparkle trail and click burst: use the uploaded star emblem PNG.
  const sparkleImage = 'https://raw.githubusercontent.com/icalgan/PBL-3/main/assets/1000045836%20-%20Copy.png';
  const addSparkle = (x, y, size, kind, dx = 0, dy = 0) => {
    const star = document.createElement('img');
    star.src = sparkleImage;
    star.alt = '';
    star.className = 'cursor-sparkle ' + kind;
    star.style.left = x + 'px';
    star.style.top = y + 'px';
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.setProperty('--sparkle-x', dx + 'px');
    star.style.setProperty('--sparkle-y', dy + 'px');
    document.body.appendChild(star);
    window.setTimeout(() => star.remove(), 900);
  };

  let lastSparkle = 0;
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const now = performance.now();
    if (now - lastSparkle < 55) return;
    lastSparkle = now;
    addSparkle(event.clientX, event.clientY, 16 + Math.random() * 10, 'trail-sparkle');
  }, { passive: true });

  document.addEventListener('click', event => {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 22 + Math.random() * 20;
      addSparkle(
        event.clientX,
        event.clientY,
        17 + Math.random() * 10,
        'click-sparkle',
        Math.cos(angle) * distance,
        Math.sin(angle) * distance
      );
    }
  });
})();
