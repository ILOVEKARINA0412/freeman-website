(() => {
  const header = document.getElementById('site-header');
  const hero = document.querySelector('.hero');
  const button = document.getElementById('menu');
  const icon = button.querySelector('span');
  const menuIsOpen = () => button.getAttribute('aria-expanded') === 'true';

  function setMenu(open) {
    header.classList.toggle('menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    icon.textContent = open ? '−' : '+';
    if (open) header.classList.remove('is-hidden');
  }

  button.addEventListener('click', () => setMenu(!menuIsOpen()));
  header.addEventListener('focusout', (event) => {
    if (menuIsOpen() && !header.contains(event.relatedTarget)) setMenu(false);
  });
  document.addEventListener('pointerdown', (event) => {
    if (menuIsOpen() && !header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuIsOpen()) {
      event.preventDefault();
      button.focus();
      setMenu(false);
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      target.focus({ preventScroll: true });
      setMenu(false);
    });
  });

  const threshold = 16;
  let previousY = Math.max(0, window.scrollY);
  let direction = 0;
  let distance = 0;
  let framePending = false;

  function updateHeader() {
    framePending = false;
    const y = Math.max(0, window.scrollY);
    const delta = y - previousY;
    const nextDirection = Math.sign(delta);
    if (delta) {
      distance = (nextDirection === direction ? distance : 0) + Math.abs(delta);
      direction = nextDirection;
      previousY = y;
    }

    const heroHeight = hero.offsetHeight;
    header.classList.toggle('has-brand', y >= heroHeight * .7);
    if (y < heroHeight + 24 || menuIsOpen() || header.querySelector(':focus-visible')) {
      header.classList.remove('is-hidden');
    } else if (distance >= threshold) {
      header.classList.toggle('is-hidden', direction > 0);
      distance = 0;
    }
  }

  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(updateHeader);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  updateHeader();
})();
