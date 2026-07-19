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

// -- EROFO NAME EFFECT: "Eric Rodríguez Forés," -> "EROFO" on hover.
// `center: true` collapses the kept letters toward the element's own
// midpoint instead of sliding them to where the first kept letter
// originally sat — used on the landing page, where the name is
// centered rather than left-aligned. ---------------------------------
function setupErofoMorph(el, { center = false } = {}) {
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
    el.appendChild(s);
    spans.push(s);
  });

  el.addEventListener('mouseenter', () => {
    el.classList.add('erofo-on');
    spans.forEach((s,i) => { if (keepIdx.has(i)) s.textContent = s.dataset.upper; });
    requestAnimationFrame(() => {
      const keeps = [...keepIdx].map(i => spans[i]);
      const boxes = keeps.map(s => s.getBoundingClientRect());
      const nameBox = el.getBoundingClientRect();
      const currentPositions = boxes.map(b => b.left - nameBox.left);
      const widths = keeps.map(s => s.offsetWidth);
      const totalWidth = widths.reduce((a, w) => a + w, 0);
      let targetX = center ? (nameBox.width - totalWidth) / 2 : currentPositions[0];
      const targets = [];
      widths.forEach(w => { targets.push(targetX); targetX += w; });
      keeps.forEach((s, idx) => {
        s.style.setProperty('--tx', (targets[idx] - currentPositions[idx]) + 'px');
      });
    });
  });

  el.addEventListener('mouseleave', () => {
    el.classList.remove('erofo-on');
    spans.forEach((s,i) => {
      s.textContent = s.dataset.normal;
      s.style.removeProperty('--tx');
    });
  });
}

const heroName = document.getElementById('heroName');
if (heroName) setupErofoMorph(heroName);

const landingHeroName = document.getElementById('landingHeroName');
if (landingHeroName) setupErofoMorph(landingHeroName, { center: true });

// -- CAFLER PREVIEW: hover the pill to preview the theme (desktop only —
// on touch devices, attaching mouseenter/mouseleave here makes the first
// tap trigger the hover state instead of navigating, so the link needs a
// second tap to actually follow it. Skipping this on touch fixes that. --
const workPill = document.getElementById('workPill');
if (workPill && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
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

// -- PROJECT ROW PREVIEWS: hover a row to preview its key art (desktop only, same reason as above) --
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
function setupProjectPreview(rowId, previewClass) {
  const row = document.getElementById(rowId);
  if (row && canHover) {
    row.addEventListener('mouseenter', () => document.body.classList.add(previewClass));
    row.addEventListener('mouseleave', () => document.body.classList.remove(previewClass));
  }
}
setupProjectPreview('tlouRow', 'tlou-preview');
setupProjectPreview('capoeiraRow', 'capoeira-preview');
setupProjectPreview('joanasticRow', 'joanastic-preview');
setupProjectPreview('despiertaRow', 'despierta-preview');

// -- LANDING INTRO: mark, pill nav and identity fade in together on load (new home page only) --
const landing = document.getElementById('landing');
if (landing) {
  requestAnimationFrame(() => landing.classList.add('revealed'));
}

// -- PARALLAX -- Cafler hero (cafler / tloues / capoeira pages) --
const caflerBgs    = document.querySelectorAll('.cafler-bg');
const caflerHeroEl = document.getElementById('caflerHero');
if (caflerBgs.length && caflerHeroEl) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateParallax() {
    if (reducedMotion) return;
    const rect   = caflerHeroEl.getBoundingClientRect();
    const offset = -rect.top * 0.35;
    caflerBgs.forEach(bg => { bg.style.transform = `translateY(${offset}px)`; });
  }
  window.addEventListener('scroll', updateParallax, { passive: true });
}

// -- CAPOEIRA -- 2024/2025 year toggle -----------------------
const capoeiraYearButtons = document.querySelectorAll('.year-btn');
if (capoeiraYearButtons.length) {
  capoeiraYearButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.dataset.year = btn.dataset.year;
      capoeiraYearButtons.forEach(b => b.classList.toggle('active', b === btn));
    });
  });
}

// -- CAFLER -- commercial video sound toggle -------------------
const caflerCommercialVideo = document.getElementById('caflerCommercialVideo');
const caflerSoundBtn        = document.getElementById('caflerSoundBtn');
if (caflerCommercialVideo && caflerSoundBtn) {
  caflerSoundBtn.addEventListener('click', () => {
    caflerCommercialVideo.muted = !caflerCommercialVideo.muted;
    caflerSoundBtn.classList.toggle('is-muted', caflerCommercialVideo.muted);
  });
}

// -- DESPIERTA -- trailer sound + fullscreen controls ---------
const despiertaTrailer        = document.getElementById('despiertaTrailer');
const despiertaSoundBtn       = document.getElementById('despiertaSoundBtn');
const despiertaFullscreenBtn  = document.getElementById('despiertaFullscreenBtn');
if (despiertaTrailer && despiertaSoundBtn) {
  despiertaSoundBtn.addEventListener('click', () => {
    despiertaTrailer.muted = !despiertaTrailer.muted;
    despiertaSoundBtn.classList.toggle('is-muted', despiertaTrailer.muted);
  });
}
if (despiertaTrailer && despiertaFullscreenBtn) {
  despiertaFullscreenBtn.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      despiertaTrailer.requestFullscreen();
    }
  });
  document.addEventListener('fullscreenchange', () => {
    despiertaFullscreenBtn.classList.toggle('is-fullscreen', document.fullscreenElement === despiertaTrailer);
  });
}
