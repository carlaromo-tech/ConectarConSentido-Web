(() => {
  /* --- Línea de tiempo de la Evaluación Familiar del Adolescente (familias) --- */
  /* Dos hilos recorren las paradas: coral (madre o padre) y turquesa (el hijo).
     En la sesión 1 van juntos; en la 2 el adulto espera (punteado) y en la
     devolución se vuelven a juntar. En pantallas angostas la línea es vertical
     y la dibuja el CSS. */
  const linea = document.getElementById('evaluacion');
  if (!linea) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svg = linea.querySelector('.eval-hilos');
  const NS = 'http://www.w3.org/2000/svg';

  // viewBox 1000 × 60: las paradas están en 125, 375, 625 y 875
  const HILOS = [
    // turquesa: el adolescente está en las tres sesiones
    ['M60 34 C 250 30, 400 38, 625 33 S 820 30, 875 31', '#3E8DA1', 0],
    // coral: el adulto en la sesión 1, espera en la 2, vuelve en la devolución
    ['M60 24 C 200 20, 300 28, 375 24', '#EA8672', 0],
    ['M375 24 C 450 18, 550 30, 625 25', '#EA8672', 1],
    ['M625 25 C 720 20, 800 28, 875 29', '#EA8672', 0]
  ];

  if (svg) {
    const rc = window.rough ? window.rough.svg(svg) : null;
    HILOS.forEach(([d, color, punteado], i) => {
      let node;
      if (rc) {
        node = rc.path(d, { stroke: color, strokeWidth: 2.6, roughness: .9, bowing: .5, seed: 50 + i });
      } else {
        node = document.createElementNS(NS, 'path');
        node.setAttribute('d', d);
        node.setAttribute('fill', 'none');
        node.setAttribute('stroke', color);
        node.setAttribute('stroke-width', 2.6);
      }
      svg.appendChild(node);
      const partes = node.tagName === 'path' ? [node] : [...node.querySelectorAll('path')];
      partes.forEach((p) => {
        p.setAttribute('vector-effect', 'non-scaling-stroke');
        p.setAttribute('stroke-linecap', 'round');
        if (punteado) p.setAttribute('stroke-dasharray', '6 9');
      });
    });
  }

  // al aparecer, los hilos se revelan de izquierda a derecha y las paradas se encienden
  const mostrar = () => linea.classList.add('on');
  if (reduced || !('IntersectionObserver' in window)) {
    mostrar();
    return;
  }
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    mostrar();
    io.disconnect();
  }, { threshold: .35 });
  io.observe(linea);
})();
