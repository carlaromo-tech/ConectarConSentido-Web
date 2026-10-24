(() => {
  /* --- ¿Hasta dónde llega la conversación? (colegios) ------------------------ */
  /* Tres puntos dibujados a mano: el adolescente, la IA y alguien de confianza.
     Cada uso de la IA es un hilo distinto que sale del adolescente; el diagrama
     no juzga el uso, solo muestra si la conversación llega a una persona.
     Sin JavaScript se ven los cinco usos uno debajo del otro. */
  const camino = document.getElementById('camino');
  if (!camino) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const angosto = window.matchMedia('(max-width: 620px)');
  const NS = 'http://www.w3.org/2000/svg';
  const TEAL = '#3E8DA1';
  const CORAL = '#EA8672';
  const GRIS = '#8FA6A3';

  const svg = camino.querySelector('.camino-mapa svg');
  const mapa = camino.querySelector('.camino-mapa');
  const tabs = [...camino.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));

  /* Coordenadas en horizontal (1000 × 300). En pantallas angostas el mismo
     dibujo se gira: x pasa a ser el eje vertical. */
  const NODOS = { ado: [110, 150], ia: [500, 150], per: [890, 150] };

  // hilos de cada uso: [trazo, grosor, punteado], notas [x, y, texto] y si llega
  const USOS = [
    { // Complementa: roza la IA y sigue
      hilos: [['M146 150 C 260 150, 380 84, 500 82 C 620 80, 740 150, 852 150', 3.4]],
      notas: [[500, 52, 'una mirada más']],
      llega: 1
    },
    { // Prepara: da una vuelta en la IA, ordenando, y llega
      hilos: [['M146 150 C 280 150, 400 160, 478 138 C 498 108, 470 72, 510 60 C 556 48, 562 100, 520 100 C 488 100, 494 70, 526 68 C 562 68, 562 138, 602 154 C 700 160, 760 150, 852 150', 3.4]],
      notas: [[690, 108, 'encuentra las palabras']],
      llega: 1
    },
    { // Facilita: pasa por la IA y llega con más fuerza
      hilos: [
        ['M146 150 C 290 152, 400 148, 500 150', 2.6],
        ['M500 150 C 640 152, 750 148, 852 150', 6.5]
      ],
      notas: [[690, 108, 'se anima a pedir ayuda']],
      llega: 1
    },
    { // Posterga: gira alrededor de la IA y llega tarde
      hilos: [
        ['M146 150 C 300 152, 400 148, 452 150 C 466 92, 566 92, 566 150 C 566 210, 436 210, 440 150 C 444 104, 552 104, 550 150 C 548 192, 466 190, 470 150', 3.4],
        ['M560 158 C 680 162, 760 152, 852 150', 3, [10, 14]]
      ],
      notas: [[640, 106, 'mañana…'], [760, 124, 'otro día…']],
      llega: .55
    },
    { // Desplaza: se queda en la IA
      hilos: [['M146 150 C 300 152, 410 148, 492 150', 3.4]],
      notas: [[500, 52, 'aquí se queda']],
      llega: 0
    }
  ];

  let girado = false;
  // en vertical: x → y, y → x (viewBox 400 × 640)
  const pt = (x, y) => (girado ? [(y - 150) * 1.25 + 200, 40 + x * .62] : [x, y]);
  const pathPt = (d) => d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (_, x, y) => {
    const [a, b] = pt(+x, +y);
    return `${a.toFixed(1)} ${b.toFixed(1)}`;
  });

  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    (parent || svg).appendChild(n);
    return n;
  };

  let rc = null;
  let capaHilos;
  let persona;
  let actual = 0;

  const trazo = (g, d, opts) => {
    let node;
    if (rc) {
      node = rc.path(d, Object.assign({ roughness: 1.1, bowing: .7 }, opts));
    } else {
      node = document.createElementNS(NS, 'path');
      node.setAttribute('d', d);
      node.setAttribute('fill', opts.fill || 'none');
      node.setAttribute('stroke', opts.stroke);
      node.setAttribute('stroke-width', opts.strokeWidth);
    }
    g.appendChild(node);
    return node;
  };

  // una persona simple: cabeza y hombros dentro de un círculo
  const figura = (g, [cx, cy], color, fondo, seed) => {
    if (rc) g.appendChild(rc.circle(cx, cy, 72, { stroke: color, strokeWidth: 2.2, fill: fondo, fillStyle: 'solid', roughness: 1.2, seed }));
    else el('circle', { cx, cy, r: 36, fill: fondo, stroke: color, 'stroke-width': 2.2 }, g);
    trazo(g, `M${cx - 9} ${cy - 8} a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0`, { stroke: color, strokeWidth: 2.2, roughness: .6, seed: seed + 1 });
    trazo(g, `M${cx - 18} ${cy + 22} C ${cx - 16} ${cy + 6}, ${cx + 16} ${cy + 6}, ${cx + 18} ${cy + 22}`, { stroke: color, strokeWidth: 2.2, roughness: .6, seed: seed + 2 });
  };

  const etiqueta = (g, [x, y], lineas, ancla) => {
    const t = el('text', { x, y, class: 'camino-etiqueta', 'text-anchor': ancla || (girado ? 'start' : 'middle') }, g);
    lineas.forEach((l, i) => {
      const s = el('tspan', { x, dy: i ? '1.2em' : 0 }, t);
      s.textContent = l;
    });
  };

  /* dibuja el mapa completo (se rehace si cambia la orientación) */
  const dibujar = () => {
    girado = angosto.matches;
    svg.setAttribute('viewBox', girado ? '0 0 400 680' : '0 0 1000 300');
    svg.textContent = '';
    rc = window.rough ? window.rough.svg(svg) : null;

    // degradé del hilo: turquesa al salir, coral al llegar a la persona
    const defs = el('defs', {});
    const [gx1, gy1] = pt(146, 150);
    const [gx2, gy2] = pt(852, 150);
    const grad = el('linearGradient', { id: 'camino-color', gradientUnits: 'userSpaceOnUse', x1: gx1, y1: gy1, x2: gx2, y2: gy2 }, defs);
    el('stop', { offset: 0, 'stop-color': TEAL }, grad);
    el('stop', { offset: 1, 'stop-color': CORAL }, grad);

    const ado = el('g', { class: 'camino-nodo' });
    figura(ado, pt(...NODOS.ado), TEAL, '#E9F3F5', 3);

    // los hilos van debajo del globo: entran a la IA y salen de ella
    capaHilos = el('g', { class: 'camino-hilos' });

    // la IA: un globo de chat con tres puntos
    const ia = el('g', { class: 'camino-nodo' });
    const [ix, iy] = pt(...NODOS.ia);
    const globo = `M${ix - 46} ${iy - 30} Q ${ix - 50} ${iy - 34}, ${ix - 40} ${iy - 34} L ${ix + 40} ${iy - 34} Q ${ix + 50} ${iy - 34}, ${ix + 48} ${iy - 24} L ${ix + 48} ${iy + 20} Q ${ix + 48} ${iy + 30}, ${ix + 38} ${iy + 30} L ${ix - 14} ${iy + 30} L ${ix - 30} ${iy + 46} L ${ix - 28} ${iy + 30} L ${ix - 38} ${iy + 30} Q ${ix - 48} ${iy + 30}, ${ix - 48} ${iy + 20} Z`;
    el('path', { d: globo, fill: '#FFFFFF' }, ia); // base blanca: tapa los hilos que entran
    trazo(ia, globo, { stroke: GRIS, strokeWidth: 2.2, roughness: 1, seed: 21 });
    [-18, 0, 18].forEach((dx) => el('circle', { cx: ix + dx, cy: iy - 2, r: 4.5, fill: GRIS }, ia));

    persona = el('g', { class: 'camino-persona' });
    const [px, py] = pt(...NODOS.per);
    el('circle', { cx: px, cy: py, r: 52, class: 'camino-halo' }, persona);
    figura(persona, [px, py], CORAL, '#FDEEE9', 40);

    if (girado) {
      etiqueta(svg, [262, pt(...NODOS.ado)[1] + 6], ['adolescente']);
      etiqueta(svg, [262, iy + 6], ['IA']);
      etiqueta(svg, [262, py - 4], ['alguien de', 'confianza']);
    } else {
      etiqueta(svg, [110, 222], ['adolescente']);
      etiqueta(svg, [500, 222], ['IA']);
      etiqueta(svg, [890, 222], ['alguien de confianza']);
    }

    mostrar(actual, false);
  };

  /* traza el recorrido de un uso */
  let animado = false;
  const mostrar = (i, animar) => {
    const uso = USOS[i];
    capaHilos.textContent = '';
    const g = el('g', {}, capaHilos);
    uso.hilos.forEach(([d, w, dash], k) => {
      const node = trazo(g, pathPt(d), { stroke: 'url(#camino-color)', strokeWidth: w, roughness: .9, seed: 60 + i * 5 + k });
      const partes = node.tagName === 'path' ? [node] : [...node.querySelectorAll('path')];
      partes.forEach((p) => {
        p.setAttribute('stroke', 'url(#camino-color)');
        p.setAttribute('stroke-linecap', 'round');
        if (dash) p.dataset.dash = dash.join(' ');
      });
    });
    const notas = el('g', { class: 'camino-notas' }, capaHilos);
    // en vertical las notas van a la derecha del hilo, en dos líneas si hace falta
    uso.notas.forEach(([x, y, texto]) => {
      const [a, b] = girado ? [240, 40 + x * .62 + 46] : [x, y];
      const t = el('text', { x: a, y: b, class: 'camino-nota', 'text-anchor': girado ? 'start' : 'middle', transform: `rotate(-4 ${a} ${b})` }, notas);
      const lineas = girado && texto.length > 12 ? texto.replace(/^(.{1,12})\s/, '$1|').split('|') : [texto];
      lineas.forEach((l, k) => {
        const s = el('tspan', { x: a, dy: k ? '1.05em' : 0 }, t);
        s.textContent = l;
      });
    });

    persona.classList.toggle('encendida', uso.llega === 1);
    persona.style.opacity = uso.llega === 0 ? .3 : (uso.llega < 1 ? .75 : 1);

    const paths = [...g.querySelectorAll('path')];
    if (!animar || reduced) {
      paths.forEach((p) => { if (p.dataset.dash) p.setAttribute('stroke-dasharray', p.dataset.dash); });
      return;
    }
    // cada hilo se dibuja de izquierda a derecha, uno después del otro
    let delay = 0;
    persona.classList.remove('encendida');
    paths.forEach((p) => {
      const largo = p.getTotalLength() || 1;
      const dur = Math.min(Math.max(largo / 520, .5), 1.6);
      p.style.strokeDasharray = largo;
      p.style.strokeDashoffset = largo;
      p.style.transition = `stroke-dashoffset ${dur}s cubic-bezier(.65,0,.35,1) ${delay}s`;
      p.addEventListener('transitionend', () => {
        if (p.dataset.dash) { p.style.strokeDasharray = ''; p.setAttribute('stroke-dasharray', p.dataset.dash); }
      }, { once: true });
      delay += dur * .92;
    });
    notas.style.opacity = '0';
    notas.style.transition = `opacity .5s ease-out ${delay * .7}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      paths.forEach((p) => { p.style.strokeDashoffset = '0'; });
      notas.style.opacity = '1';
      setTimeout(() => persona.classList.toggle('encendida', uso.llega === 1), delay * 1000);
    }));
  };

  /* elegir un uso: chip, frase y recorrido */
  const elegir = (i, foco) => {
    actual = (i + tabs.length) % tabs.length;
    tabs.forEach((t, j) => {
      const on = j === actual;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    if (foco) tabs[actual].focus();
    if (capaHilos) mostrar(actual, animado);
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => elegir(i));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); elegir(actual + 1, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); elegir(actual - 1, true); }
    });
  });

  camino.classList.add('listo');
  mapa.hidden = false;
  elegir(0);
  dibujar();
  angosto.addEventListener('change', dibujar);

  // el primer recorrido se dibuja cuando el mapa aparece en pantalla
  if (reduced || !('IntersectionObserver' in window)) {
    animado = true;
    return;
  }
  capaHilos.style.visibility = 'hidden';
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    animado = true;
    capaHilos.style.visibility = '';
    mostrar(actual, true);
    io.disconnect();
  }, { threshold: .5 });
  io.observe(mapa);
})();
