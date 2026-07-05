// True masonry via CSS Grid: each item spans a computed number of the
// grid's tiny implicit rows, based on its own rendered height. This
// packs images tightly (like Pinterest) instead of the "read down one
// column first" look you get from CSS multi-column layouts.
function layoutMasonry(grid) {
  const styles = getComputedStyle(grid);
  const rowHeight = parseFloat(styles.getPropertyValue('grid-auto-rows'));
  const rowGap = parseFloat(styles.getPropertyValue('row-gap'));

  grid.querySelectorAll('.masonry-item').forEach(item => {
    const contentHeight = item.querySelector('.masonry-inner').getBoundingClientRect().height;
    const rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
    item.style.gridRowEnd = `span ${rowSpan}`;
  });
}

function initMasonry(selector) {
  const grid = document.querySelector(selector);
  if (!grid) return;

  const images = Array.from(grid.querySelectorAll('img'));
  let loaded = 0;

  function onEachLoaded() {
    loaded++;
    if (loaded === images.length) {
      layoutMasonry(grid);
      // Layout is final now, so start observing for scroll-reveal
      const items = grid.querySelectorAll('.masonry-item.reveal');
      items.forEach(el => revObs.observe(el));
      // ...and reveal whatever's already in view immediately
      requestAnimationFrame(() => {
        items.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.94) el.classList.add('in');
        });
      });
    }
  }

  images.forEach(img => {
    if (img.complete) {
      onEachLoaded();
    } else {
      img.addEventListener('load', onEachLoaded);
      img.addEventListener('error', onEachLoaded);
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => layoutMasonry(grid), 150);
  });
}
