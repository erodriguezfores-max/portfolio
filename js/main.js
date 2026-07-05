// -- SCROLL REVEAL (shared by every page) ------------------
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.06 });
// Elements marked data-lazy-reveal (e.g. masonry grid items) aren't
// observed here — their layout isn't final yet at this point, so
// whoever positions them calls revObs.observe() on them once it's done.
document.querySelectorAll('.reveal:not([data-lazy-reveal])').forEach(el => revObs.observe(el));

// Elements already in view on first load should appear immediately
setTimeout(() => {
  document.querySelectorAll('.reveal:not([data-lazy-reveal])').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.94) el.classList.add('in');
  });
}, 50);

// -- EROFO NAME EFFECT (home page only) ---------------------
const heroName = document.getElementById('heroName');
if (heroName) {
  const nameStr = 'Eric Rodríguez Forés,';
  const keepIdx = new Set([0,5,6,15,16]);
  const spans = [];
  const nbsp = String.fromCharCode(160);

  Array.from(nameStr).forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ltr ' + (keepIdx.has(i) ? 'keep' : 'to-hide');
    s.textContent = ch === ' ' ? nbsp : ch;
    s.dataset.normal = ch === ' ' ? nbsp : ch;
    s.dataset.upper  = keepIdx.has(i) ? ch.toUpperCase() : ch;
    heroName.appendChild(s);
    spans.push(s);
  });

  heroName.addEventListener('mouseenter', () => {
    heroName.classList.add('erofo-on');
    spans.forEach((s,i) => { if (keepIdx.has(i)) s.textContent = s.dataset.upper; });
    requestAnimationFrame(() => {
      const keeps = [...keepIdx].map(i => spans[i]);
      const boxes = keeps.map(s => s.getBoundingClientRect());
      const nameBox = heroName.getBoundingClientRect();
      const currentPositions = boxes.map(b => b.left - nameBox.left);
      const widths = keeps.map(s => s.offsetWidth);
      let targetX = currentPositions[0];
      const targets = [];
      widths.forEach(w => { targets.push(targetX); targetX += w; });
      keeps.forEach((s, idx) => {
        s.style.setProperty('--tx', (targets[idx] - currentPositions[idx]) + 'px');
      });
    });
  });

  heroName.addEventListener('mouseleave', () => {
    heroName.classList.remove('erofo-on');
    spans.forEach((s,i) => {
      s.textContent = s.dataset.normal;
      s.style.removeProperty('--tx');
    });
  });
}

// -- CAFLER PREVIEW: hover the pill to preview the theme (home page only) --
const workPill = document.getElementById('workPill');
if (workPill) {
  let pillTimer;

  workPill.addEventListener('mouseenter', () => {
    clearTimeout(pillTimer);
    workPill.classList.add('transitioning');
    document.body.classList.add('cafler-preview');
    pillTimer = setTimeout(() => workPill.classList.remove('transitioning'), 350);
  });

  workPill.addEventListener('mouseleave', () => {
    clearTimeout(pillTimer);
    workPill.classList.add('transitioning');
    document.body.classList.remove('cafler-preview');
    pillTimer = setTimeout(() => workPill.classList.remove('transitioning'), 350);
  });

}

// -- LANDING INTRO: small logo grows, then reveals the pill nav + identity (new home page only) --
const landing = document.getElementById('landing');
const heroLogo = document.getElementById('heroLogo');
const heroLogoImg = document.getElementById('heroLogoImg');
if (landing && heroLogo) {
  heroLogo.addEventListener('click', () => {
    if (landing.classList.contains('expanded')) return;
    landing.classList.add('expanded');
    heroLogo.disabled = true;
    // Swap to the big artwork while the logo is at its blurriest mid-grow,
    // so the hard cut between the two images is masked by the blur.
    setTimeout(() => { if (heroLogoImg) heroLogoImg.src = 'assets/landing-icon-big.webp'; }, 500);
    setTimeout(() => landing.classList.add('revealed'), 550);
  });
}

// -- PARALLAX -- Cafler hero (cafler page only) --------------
const caflerBg     = document.querySelector('.cafler-bg');
const caflerHeroEl = document.getElementById('caflerHero');
if (caflerBg && caflerHeroEl) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateParallax() {
    if (reducedMotion) return;
    const rect   = caflerHeroEl.getBoundingClientRect();
    const offset = -rect.top * 0.35;
    caflerBg.style.transform = `translateY(${offset}px)`;
  }
  window.addEventListener('scroll', updateParallax, { passive: true });
}
