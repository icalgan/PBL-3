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

  // Tiny sparkle trail and click burst using the user's original star emblem.
  const sparkleAsset = 'assets/1000045836%20-%20Copy.png';
  const canSparkle = !reduceMotion && window.matchMedia('(pointer: fine)').matches;
  if (canSparkle) {
    let lastTrail = 0;
    const makeSparkle = (x, y, size, extraClass = '') => {
      const star = document.createElement('span');
      star.className = 'cursor-sparkle ' + extraClass;
      star.style.left = x + 'px';
      star.style.top = y + 'px';
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.setProperty('--sparkle-image', 'url("' + sparkleAsset + '")');
      document.body.appendChild(star);
      star.addEventListener('animationend', () => star.remove(), { once: true });
    };

    document.addEventListener('pointermove', event => {
      const now = performance.now();
      if (now - lastTrail < 65) return;
      lastTrail = now;
      makeSparkle(event.clientX, event.clientY, 13 + Math.random() * 9, 'trail-sparkle');
    }, { passive: true });

    document.addEventListener('click', event => {
      for (let i = 0; i < 7; i++) {
        const angle = (Math.PI * 2 * i) / 7 + Math.random() * 0.25;
        const distance = 18 + Math.random() * 24;
        const star = document.createElement('span');
        star.className = 'cursor-sparkle click-sparkle';
        star.style.left = event.clientX + 'px';
        star.style.top = event.clientY + 'px';
        star.style.width = (15 + Math.random() * 10) + 'px';
        star.style.height = star.style.width;
        star.style.setProperty('--sparkle-image', 'url("' + sparkleAsset + '")');
        star.style.setProperty('--sparkle-x', Math.cos(angle) * distance + 'px');
        star.style.setProperty('--sparkle-y', Math.sin(angle) * distance + 'px');
        document.body.appendChild(star);
        star.addEventListener('animationend', () => star.remove(), { once: true });
      }
    });
  }
})();
