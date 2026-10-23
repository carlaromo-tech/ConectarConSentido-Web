(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const CORAL = '#EA8672';
  const TEAL = '#3E8DA1';

  /* --- Dibujo a mano sobre la foto: dos hilos que se entrelazan ------------ */
  /* Coordenadas en píxeles de assets/fotoportada.png (1122 × 777).
     Si se cambia la foto, hay que reubicar los trazos y la nota. */
  const svg = document.getElementById('hero-trazos');

  if (svg) {
    const rc = window.rough ? window.rough.svg(svg) : null;
    let seed = 7;

    const layer = () => {
      const g = document.createElementNS(NS, 'g');
      svg.appendChild(g);
      return g;
    };

    // con Rough.js el trazo se ve hecho a mano; sin él, queda una línea limpia
    const stroke = (g, d, opts) => {
      let node;
      if (rc) {
        node = rc.path(d, Object.assign({ roughness: 1.2, bowing: .8, seed: ++seed }, opts));
      } else {
        node = document.createElementNS(NS, 'path');
        node.setAttribute('d', d);
        node.setAttribute('fill', 'none');
        node.setAttribute('stroke', opts.stroke);
        node.setAttribute('stroke-width', opts.strokeWidth);
        node.setAttribute('stroke-linecap', 'round');
      }
      g.appendChild(node);
    };

    const note = (g, x, y, text) => {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', x);
      t.setAttribute('y', y);
      t.setAttribute('class', 'nota');
      t.setAttribute('font-size', 42);
      t.setAttribute('transform', `rotate(-3 ${x} ${y})`);
      t.textContent = text;
      g.appendChild(t);
    };

    // un hilo coral sale de ella y uno turquesa de él; se anudan y siguen juntos hacia el texto
    const threads = layer();
    stroke(threads, 'M300 560 C 330 650, 450 700, 560 690 C 640 684, 650 640, 600 630 C 540 620, 520 690, 590 718 C 450 762, 250 742, 30 700', { stroke: CORAL, strokeWidth: 3.2 });
    stroke(threads, 'M850 540 C 820 640, 700 700, 590 700 C 520 702, 510 652, 560 642 C 620 634, 640 700, 570 730 C 430 772, 240 758, 20 722', { stroke: TEAL, strokeWidth: 3.2 });

    // la pregunta, escrita a mano donde la foto se disuelve
    const notes = layer();
    note(notes, 360, 58, '¿tiene a quién');
    note(notes, 420, 104, 'contarle?');

    const arrow = layer();
    stroke(arrow, 'M596 100 C 640 150, 652 220, 616 292', { stroke: CORAL, strokeWidth: 2.6, roughness: 1.1 });
    stroke(arrow, 'M598 266 L 615 294 L 636 270', { stroke: CORAL, strokeWidth: 2.6, roughness: 1 });

    // los trazos se dibujan solos; la nota aparece mientras los hilos terminan
    if (!reduced) {
      const draw = (group, duration, delay, stagger) => {
        group.querySelectorAll('path').forEach((p, i) => {
          const length = p.getTotalLength() || 1;
          p.style.strokeDasharray = length;
          p.style.strokeDashoffset = length;
          p.style.transition = `stroke-dashoffset ${duration}s ease-in-out ${delay + i * stagger}s`;
        });
      };
      draw(threads, 1.8, .9, .12);
      draw(arrow, .7, 2.4, .2);
      notes.style.opacity = '0';
      notes.style.transition = 'opacity .8s ease-out 1.8s';

      requestAnimationFrame(() => requestAnimationFrame(() => {
        svg.querySelectorAll('path').forEach((p) => { p.style.strokeDashoffset = '0'; });
        notes.style.opacity = '1';
      }));
    }
  }

  /* --- Indicador "Baja" ----------------------------------------------------- */
  const cue = document.getElementById('hero-cue');
  const frases = document.getElementById('frases');
  cue?.addEventListener('click', () => {
    frases?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });

  /* --- Al bajar: la foto va más lenta que el texto ---------------------------- */
  const hero = document.getElementById('portada');
  const canvas = document.getElementById('hero-lienzo');
  const copy = document.getElementById('hero-copy');

  if (hero && canvas && copy && !reduced) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const h = hero.offsetHeight;
      const y = Math.min(Math.max(window.scrollY, 0), h);
      canvas.style.transform = `translateY(${(y * .12).toFixed(1)}px)`;
      const p = Math.min(y / (h * .8), 1);
      copy.style.transform = `translateY(${(-80 * p).toFixed(1)}px)`;
      copy.style.opacity = (1 - .85 * p).toFixed(3);
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* --- Franja de frases: una a la vez, palabra por palabra -------------------- */
  const quote = document.getElementById('fr-t');
  const counter = document.getElementById('fr-n');
  const bar = document.getElementById('fr-bar');

  if (quote && counter && bar) {
    // [frase, primera y última palabra en coral (contando desde 0)]
    const PHRASES = [
      ['Cuando a este adolescente le pasa algo, ¿tiene a quién contarle?', 7, 10],
      ['Acompañar empieza por mirar de cerca.', 3, 5],
      ['Conversar antes de que el problema crezca.', 0, 0]
    ];
    const SHOW = 5500;
    const HIDE = 700;
    let index = 0;
    let visible = true;

    const paint = () => {
      const [text, from, to] = PHRASES[index];
      quote.innerHTML = text.split(' ').map((w, i) => {
        const isAccent = i >= from && i <= to;
        return `<span class="fw${isAccent ? ' acento' : ''}" style="--d:${(i * .07).toFixed(2)}s">${w}</span>`;
      }).join(' ');
      counter.textContent = String(index + 1).padStart(2, '0');
    };

    if (reduced) {
      paint();
      quote.classList.add('on');
      bar.style.transform = 'scaleX(1)';
    } else {
      const show = () => {
        paint();
        bar.style.transition = 'none';
        bar.style.transform = 'scaleX(0)';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          quote.classList.add('on');
          bar.style.transition = `transform ${SHOW}ms linear`;
          bar.style.transform = 'scaleX(1)';
        }));
        setTimeout(hide, SHOW);
      };
      const hide = () => {
        // fuera de pantalla no avanza: espera a que la franja vuelva a verse
        if (!visible) { setTimeout(hide, 600); return; }
        quote.classList.remove('on');
        setTimeout(() => { index = (index + 1) % PHRASES.length; show(); }, HIDE);
      };

      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
        }).observe(quote);
      }
      show();
    }
  }
})();
