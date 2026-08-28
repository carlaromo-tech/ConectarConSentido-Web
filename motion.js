(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Menú móvil ------------------------------------------------------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });

    nav.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* --- Header al hacer scroll ------------------------------------------- */
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 32);
  }, { passive: true });

  /* --- Brillo de borde en tarjetas (sigue el cursor) ---------------------- */
  const spotCards = document.querySelectorAll('.path-card, .service-grid article, .five-grid article');

  spotCards.forEach((card) => {
    card.classList.add('spot-card');
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });

  /* --- Titulos revelados por palabra -------------------------------------- */
  const splitTargets = document.querySelectorAll('main h1, main h2');

  splitTargets.forEach((el) => {
    const tokens = [];
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.trim().split(/\s+/).filter(Boolean).forEach((word) => tokens.push(word));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        tokens.push(node.outerHTML);
      }
    });
    el.innerHTML = tokens
      .map((token, i) => `<span class="split-word" style="--d:${(i * 0.045).toFixed(3)}s"><span>${token}</span></span>`)
      .join(' ');
    el.classList.add('reveal-text');
  });

  const textTargets = document.querySelectorAll('.reveal-text');

  if (reduced || !('IntersectionObserver' in window)) {
    textTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          textObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -10%' });

    textTargets.forEach((el) => textObserver.observe(el));
  }

  /* --- Revelado progresivo ---------------------------------------------- */
  const sections = document.querySelectorAll('main > section, main > .credential-bar, footer');
  const grids = document.querySelectorAll('.path-grid, .five-grid, .service-grid, .nido-grid, .format-grid');

  sections.forEach((el) => el.classList.add('reveal'));
  grids.forEach((el) => el.classList.add('reveal-stagger'));

  const targets = document.querySelectorAll('.reveal, .reveal-stagger');

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px' });

  targets.forEach((el) => observer.observe(el));
})();
