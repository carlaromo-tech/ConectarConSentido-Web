(() => {
  /* --- Anillo de los 10 minutos (familias, Método NIDO) ---------------------- */
  /* Un círculo de 10 minutos dividido según el tiempo de cada paso. En el centro
     va la acuarela del paso elegido y al lado su detalle. Sin JavaScript se ven
     los cuatro pasos uno debajo del otro. */
  const ritual = document.getElementById('ritual');
  if (!ritual) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const C = 200;      // centro del viewBox 400 × 400
  const R = 150;      // radio del anillo
  const GAP = 2.5;    // grados libres entre tramos

  // [minuto de inicio, minuto de término, color, duración del trazo en segundos]
  const TRAMOS = [
    [0, 1.5, '#3E8DA1', .55],
    [1.5, 3, '#4F9AA0', .55],
    [3, 9, '#EA8672', 1.3],
    [9, 10, '#E07688', .45]
  ];

  const reloj = ritual.querySelector('.ritual-reloj');
  const svg = ritual.querySelector('.ritual-reloj svg');
  const tabs = [...ritual.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const escenas = [...ritual.querySelectorAll('.ritual-escena img')];

  const punto = (r, grados) => {
    const a = grados * Math.PI / 180;
    return [C + r * Math.sin(a), C - r * Math.cos(a)];
  };
  const arco = (r, desde, hasta) => {
    const [x1, y1] = punto(r, desde);
    const [x2, y2] = punto(r, hasta);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${hasta - desde > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };

  /* marco hecho a mano: un círculo exterior, una marca por minuto y la nota */
  const rc = window.rough ? window.rough.svg(svg) : null;
  if (rc) {
    svg.appendChild(rc.circle(C, C, 2 * (R + 24), { stroke: 'rgba(30,45,61,.28)', strokeWidth: 1.2, roughness: 1.4, seed: 4 }));
    for (let m = 0; m < 10; m++) {
      const [x1, y1] = punto(R + 30, m * 36);
      const [x2, y2] = punto(R + 40, m * 36);
      svg.appendChild(rc.line(x1, y1, x2, y2, { stroke: 'rgba(30,45,61,.4)', strokeWidth: 1.4, roughness: .8, seed: 10 + m }));
    }
    svg.appendChild(rc.path('M70 44 C 60 70, 66 92, 92 108', { stroke: '#EA8672', strokeWidth: 2, roughness: 1, seed: 30 }));
    svg.appendChild(rc.path('M80 104 L 93 109 L 90 95', { stroke: '#EA8672', strokeWidth: 2, roughness: .8, seed: 31 }));
  }
  const nota = document.createElementNS(NS, 'text');
  nota.setAttribute('x', 2);
  nota.setAttribute('y', 30);
  nota.setAttribute('class', 'ritual-nota');
  nota.setAttribute('transform', 'rotate(-8 2 30)');
  nota.textContent = 'sin pantallas';
  svg.appendChild(nota);

  /* los cuatro tramos, proporcionales al tiempo de cada paso */
  const arcos = TRAMOS.map(([desde, hasta, color], i) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', arco(R, desde * 36 + GAP / 2, hasta * 36 - GAP / 2));
    p.setAttribute('stroke', color);
    p.setAttribute('class', 'ritual-tramo');
    p.addEventListener('click', () => elegir(i, true));
    svg.appendChild(p);
    return p;
  });

  /* la sigla NIDO de arriba: cada letra abre su paso en el anillo */
  const sigla = document.getElementById('nido-sigla');
  const letras = sigla ? [...sigla.querySelectorAll('button[data-paso]')] : [];

  /* elegir un paso: resalta su tramo, cambia la acuarela y muestra su detalle */
  let actual = 0;
  const elegir = (i, foco) => {
    actual = (i + tabs.length) % tabs.length;
    tabs.forEach((t, j) => {
      const on = j === actual;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
      arcos[j].classList.toggle('on', on);
      escenas[j]?.classList.toggle('on', on);
      letras[j]?.setAttribute('aria-pressed', String(on));
    });
    if (foco) tabs[actual].focus();
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => elegir(i));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); elegir(actual + 1, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); elegir(actual - 1, true); }
    });
  });
  ritual.querySelectorAll('.ritual-sig').forEach((b) => {
    b.addEventListener('click', () => elegir(actual + 1, true));
  });

  letras.forEach((b, i) => {
    b.addEventListener('click', () => {
      elegir(i);
      // si el anillo no se ve completo, se acerca para mostrar el paso elegido
      const r = reloj.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        ritual.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }
    });
  });

  sigla?.classList.add('listo');
  ritual.classList.add('listo');
  reloj.hidden = false;
  // un enlace como familias.html#paso-d abre directamente ese paso
  const inicial = panels.findIndex((p) => p && '#' + p.id === location.hash);
  elegir(Math.max(inicial, 0));

  /* al aparecer, el anillo se traza tramo a tramo, como un reloj que avanza */
  if (reduced || !('IntersectionObserver' in window)) {
    ritual.classList.add('trazado');
    return;
  }
  let delay = .2;
  arcos.forEach((p, i) => {
    const largo = p.getTotalLength();
    p.style.strokeDasharray = largo;
    p.style.strokeDashoffset = largo;
    p.style.transition = `stroke-dashoffset ${TRAMOS[i][3]}s ease-in-out ${delay}s, stroke-width .35s, opacity .35s`;
    tabs[i].style.transitionDelay = `${delay + TRAMOS[i][3] * .8}s`;
    delay += TRAMOS[i][3];
  });
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    arcos.forEach((p) => { p.style.strokeDashoffset = '0'; });
    ritual.classList.add('trazado');
    // después del trazo, las transiciones vuelven a ser inmediatas al elegir
    setTimeout(() => {
      arcos.forEach((p) => { p.style.transition = 'stroke-width .35s, opacity .35s'; });
      tabs.forEach((t) => { t.style.transitionDelay = ''; });
    }, (delay + .6) * 1000);
    io.disconnect();
  }, { threshold: .35 });
  io.observe(reloj);
})();
