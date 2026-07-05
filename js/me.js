// Fade + blur everything in gently on page load
requestAnimationFrame(() => {
  document.querySelectorAll('.me-fade-in').forEach(el => el.classList.add('in'));
});

// Pick the vertical video on small screens. Done here in JS rather than
// with <source media="..."> because that attribute is unreliable for
// <video> across browsers (notably Safari) — it was silently falling
// back to the horizontal source on mobile.
const videoFeelEl = document.getElementById('videoFeel');
if (videoFeelEl) {
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const source = document.createElement('source');
  source.type = 'video/mp4';
  source.src = isMobile ? 'assets/me-feel-it-real-vertical.mp4' : 'assets/me-feel-it-real.mp4';
  videoFeelEl.appendChild(source);
  videoFeelEl.load();
}

// Scroll is locked by intercepting user input (wheel/touch/keys) rather
// than by toggling `overflow`, which resets the scroll position in most
// browsers when it fights with an in-progress smooth-scroll animation.
// This way `scrollIntoView` is never interrupted by the lock.
const SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
function preventWheel(e) { e.preventDefault(); }
function preventTouch(e) { e.preventDefault(); }
function preventKeys(e) { if (SCROLL_KEYS.includes(e.key)) e.preventDefault(); }

function lockScroll() {
  window.addEventListener('wheel', preventWheel, { passive: false });
  window.addEventListener('touchmove', preventTouch, { passive: false });
  window.addEventListener('keydown', preventKeys, { passive: false });
}
function unlockScroll() {
  window.removeEventListener('wheel', preventWheel);
  window.removeEventListener('touchmove', preventTouch);
  window.removeEventListener('keydown', preventKeys);
}

function setupStoryVideo({ frame, video, introEl, volumeBtn, eyeBtn, textEl, skipBtn, scrollTriggerEl, scrollTriggerTarget }) {
  let hasEndedOnce = false;
  let videoRevealed = false;

  function markMuted(isMuted) {
    volumeBtn?.classList.toggle('is-muted', isMuted);
  }

  function settle() {
    if (hasEndedOnce) return;
    hasEndedOnce = true;
    frame.classList.add('settled');
    frame.parentElement.querySelector('.me-grain')?.classList.add('visible');
    volumeBtn?.classList.add('visible');
    markMuted(true);
    eyeBtn?.classList.add('visible');
    textEl?.classList.add('showing');
    scrollTriggerEl?.classList.add('visible');
    skipBtn?.classList.remove('visible');
  }

  video.addEventListener('ended', () => {
    settle();
    video.muted = true;
    video.currentTime = 0;
    video.play();
  });

  skipBtn?.addEventListener('click', () => {
    frame.classList.remove('pending');
    introEl?.classList.add('hidden');
    video.muted = true;
    if (video.paused) video.play();
    settle();
  });

  volumeBtn?.addEventListener('click', () => {
    video.muted = !video.muted;
    markMuted(video.muted);
    if (!video.muted && video.paused) video.play();
  });

  eyeBtn?.addEventListener('click', () => {
    videoRevealed = !videoRevealed;
    frame.classList.toggle('revealed', videoRevealed);
    textEl?.classList.toggle('showing', !videoRevealed);
    eyeBtn.classList.toggle('showing-video', videoRevealed);
  });

  scrollTriggerEl?.addEventListener('click', () => {
    unlockScroll();
    scrollTriggerTarget?.scrollIntoView({ behavior: 'smooth' });
  });

  function playWithSound() {
    frame.classList.remove('pending');
    introEl?.classList.add('hidden');
    video.muted = false;
    video.currentTime = 0;
    video.play();
  }

  return { playWithSound };
}

const frameFeel = document.getElementById('frameFeel');
if (frameFeel) {
  lockScroll();

  const feel = setupStoryVideo({
    frame: frameFeel,
    video: document.getElementById('videoFeel'),
    introEl: document.getElementById('introFeel'),
    volumeBtn: document.getElementById('volumeFeel'),
    eyeBtn: document.getElementById('eyeFeel'),
    textEl: document.getElementById('textFeel'),
    skipBtn: document.getElementById('skipFeel'),
    scrollTriggerEl: document.getElementById('lookCloserFeel'),
    scrollTriggerTarget: document.getElementById('section-selector')
  });
  document.getElementById('playFeel')?.addEventListener('click', feel.playWithSound);
}

// -- Film / Shots / Graphics pill selector --
// An infinite 3D picker wheel (like the iOS alarm-clock time picker):
// each pill sits on a virtual cylinder via rotateX/translateY, and the
// "offset" that drives it is never clamped, so spinning it never hits
// an end — it just keeps wrapping around the same 3 items.
const pillStack = document.getElementById('pillStack');
if (pillStack) {
  const pills = Array.from(pillStack.querySelectorAll('.me-pill'));
  const N = pills.length;
  const ITEM_ANGLE = 46;    // degrees between adjacent items on the wheel
  const ITEM_SPACING = 60;  // px of vertical travel between adjacent items (~10px visual gap)
  let offset = 1;           // start with "Shots" (index 1) centered

  // Shortest signed distance from item i to the current offset, wrapped
  // around a circle of N items (so it can never run out of items).
  function wrappedDelta(i) {
    let d = ((i - offset) % N + N) % N;
    if (d > N / 2) d -= N;
    return d;
  }

  function render() {
    const maxD = N / 2; // the point exactly opposite the centre (fully hidden)
    pills.forEach((p, i) => {
      const d = wrappedDelta(i);
      // t goes 0 (centred, fully visible) -> 1 (opposite side, fully hidden)
      const t = Math.min(Math.abs(d) / maxD, 1);
      const y = d * ITEM_SPACING;
      const angle = d * ITEM_ANGLE;
      const scale = 1 - t * 0.4;
      const opacity = 1 - t;
      const blur = t * 6;
      p.style.transform = `translate(-50%, calc(-50% + ${y}px)) rotateX(${angle}deg) scale(${scale})`;
      p.style.opacity = opacity;
      p.style.filter = `blur(${blur}px)`;
      p.style.zIndex = String(100 - Math.round(t * 100));
    });
  }
  render();

  // Scroll nudges it gently — a small, deltaY-proportional step rather
  // than a fixed jump, so a light touch only moves it a little.
  pillStack.addEventListener('wheel', (e) => {
    e.preventDefault();
    const step = Math.max(-1, Math.min(1, e.deltaY / 100)) * 0.06;
    offset += step;
    render();
  }, { passive: false });

  // Only clicking a pill (not hovering) brings it to the centre.
  pills.forEach((p, i) => {
    p.addEventListener('click', () => { offset = i; render(); });
  });
}
