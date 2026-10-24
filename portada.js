(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const CORAL = '#EA8672';
  const TEAL = '#3E8DA1';

  /* --- Dibujo a mano sobre la foto: dos hilos que se entrelazan ------------ */
  /* Cada portada elige su dibujo con data-dibujo en el <svg>. Las coordenadas
     están en píxeles de la foto (el viewBox del svg = tamaño de la foto).
     Si se cambia una foto, hay que reubicar sus trazos y su nota. */
  const DIBUJOS = {
    // assets/fotoportada.png (1122 × 777): un hilo coral sale de ella y uno turquesa de él
    inicio: {
      hilos: [
        ['M300 560 C 330 650, 450 700, 560 690 C 640 684, 650 640, 600 630 C 540 620, 520 690, 590 718 C 450 762, 250 742, 30 700', CORAL],
        ['M850 540 C 820 640, 700 700, 590 700 C 520 702, 510 652, 560 642 C 620 634, 640 700, 570 730 C 430 772, 240 758, 20 722', TEAL]
      ],
      notaTam: 42,
      nota: [[360, 58, '¿tiene a quién'], [420, 104, 'contarle?']],
      flecha: ['M596 100 C 640 150, 652 220, 616 292', 'M598 266 L 615 294 L 636 270']
    },
    // assets/colegios-portada.jpg (1536 × 1024): la pregunta va en el telón en blanco;
    // un hilo turquesa baja desde la expositora y uno coral desde el público
    colegios: {
      hilos: [
        ['M1250 720 C 1235 815, 1120 845, 990 826 C 905 814, 890 770, 940 770 C 1010 772, 1000 862, 920 892 C 760 958, 520 985, 300 975', CORAL],
        ['M1335 530 C 1310 650, 1160 770, 1000 812 C 900 838, 880 782, 930 767 C 1000 747, 1010 842, 930 872 C 770 940, 540 962, 320 950', TEAL]
      ],
      notaTam: 50,
      nota: [[1282, 222, '¿y en casa,'], [1290, 280, 'cómo lo'], [1300, 338, 'hablamos?']],
      flecha: ['M1292 362 C 1340 372, 1410 360, 1478 368']
    },
    // assets/familias-portada.jpg (1536 × 1024): la pregunta va en la puerta lisa;
    // un hilo coral sale de ella y uno turquesa de la luz bajo la puerta
    familias: {
      hilos: [
        ['M900 800 C 905 880, 820 930, 720 925 C 650 921, 640 880, 690 875 C 750 870, 745 950, 680 968 C 560 1000, 440 1000, 300 985', CORAL],
        ['M1120 985 C 1000 1000, 860 960, 730 935 C 660 922, 655 880, 700 880 C 760 882, 740 960, 670 978 C 560 1005, 450 1010, 320 1000', TEAL]
      ],
      notaTam: 58,
      nota: [[1082, 120, '¿en qué'], [1074, 186, 'momento'], [1092, 252, 'pasó?']],
      flecha: ['M1090 276 C 1140 288, 1205 274, 1262 282']
    }
  };
  const svg = document.getElementById('hero-trazos');
  const dibujo = svg && DIBUJOS[svg.dataset.dibujo || 'inicio'];

  if (dibujo) {
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
      t.setAttribute('font-size', dibujo.notaTam);
      t.setAttribute('transform', `rotate(-3 ${x} ${y})`);
      t.textContent = text;
      g.appendChild(t);
    };

    // los hilos se anudan y siguen juntos hacia el texto
    const threads = layer();
    dibujo.hilos.forEach(([d, color]) => stroke(threads, d, { stroke: color, strokeWidth: 3.2 }));

    // la pregunta, escrita a mano
    const notes = layer();
    dibujo.nota.forEach(([x, y, text]) => note(notes, x, y, text));

    const arrow = layer();
    dibujo.flecha.forEach((d) => stroke(arrow, d, { stroke: CORAL, strokeWidth: 2.6, roughness: 1 }));

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
  /* baja a la sección que sigue a la portada */
  const cue = document.getElementById('hero-cue');
  cue?.addEventListener('click', () => {
    cue.closest('section')?.nextElementSibling?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
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

  /* --- Espectro (colegios): de "abre" a "no llega" la conversación con alguien --- */
  /* Una línea hecha a mano que se traza al aparecer; los puntos 01–05 calzan con
     las tarjetas de abajo. */
  const espectro = document.getElementById('espectro');
  const linea = document.getElementById('espectro-linea');

  if (espectro && linea) {
    const rc = window.rough ? window.rough.svg(linea) : null;
    const d = 'M6 20 C 200 12, 420 28, 600 18 S 880 14, 994 20';
    let path;
    if (rc) {
      path = rc.path(d, { stroke: TEAL, strokeWidth: 2.4, roughness: 1.1, bowing: .6, seed: 3 });
    } else {
      path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', TEAL);
      path.setAttribute('stroke-width', 2.4);
    }
    linea.appendChild(path);
    // el trazo cambia de turquesa a coral a medida que avanza
    linea.querySelectorAll('path').forEach((p) => {
      p.setAttribute('stroke', 'url(#espectro-color)');
      p.setAttribute('vector-effect', 'non-scaling-stroke');
    });

    // se revela de izquierda a derecha (clip-path en styles.css) al entrar en pantalla
    const show = () => espectro.classList.add('on');
    if (reduced || !('IntersectionObserver' in window)) {
      show();
    } else {
      const io = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        show();
        io.disconnect();
      }, { threshold: .4 });
      io.observe(espectro);
    }
  }
})();
