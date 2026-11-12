(() => {
  const carousel = document.querySelector('.about-stories');
  if (!carousel) return;

  const panels = [...carousel.querySelectorAll('.story-panel')];
  const pagination = carousel.querySelector('.story-pagination');
  const controls = [...pagination.querySelectorAll('button')];
  const status = carousel.querySelector('[data-story-status]');
  const stage = carousel.querySelector('.story-stage');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let transition = null;
  let gesture = null;

  function settle() {
    if (transition) {
      transition.cancel();
      transition = null;
    }
    panels.forEach((panel, index) => {
      panel.hidden = index !== current;
      panel.style.zIndex = '0';
      panel.removeAttribute('aria-hidden');
    });
  }

  function selectStory(requested, origin) {
    const next = (requested + panels.length) % panels.length;
    if (next === current) return;
    settle();

    const outgoing = panels[current];
    const incoming = panels[next];
    current = next;
    controls.forEach((control, index) => {
      control.setAttribute('aria-pressed', String(index === current));
    });
    status.textContent = incoming.getAttribute('aria-label');

    if (reducedMotion.matches || typeof incoming.animate !== 'function') {
      settle();
      return;
    }

    const bounds = carousel.getBoundingClientRect();
    const point = (origin || controls[next]).getBoundingClientRect();
    const x = point.left + point.width / 2 - bounds.left;
    const y = point.top + point.height / 2 - bounds.top;
    const radius = Math.hypot(Math.max(x, bounds.width - x), Math.max(y, bounds.height - y)) + 2;
    incoming.style.zIndex = '1';
    incoming.hidden = false;
    outgoing.setAttribute('aria-hidden', 'true');

    const animation = incoming.animate([
      { clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)' },
      { clipPath: 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)' }
    ], {
      duration: 700,
      easing: 'cubic-bezier(.65, 0, .25, 1)',
      fill: 'both'
    });
    transition = animation;
    animation.finished.then(() => {
      if (transition === animation) settle();
    }).catch(() => {});
  }

  controls.forEach((control, index) => {
    control.addEventListener('click', () => selectStory(index, control));
  });

  pagination.addEventListener('keydown', event => {
    const moves = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: panels.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = (moves[event.key] + panels.length) % panels.length;
    controls[next].focus();
    selectStory(next, controls[next]);
  });

  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
    const next = (current + (dx < 0 ? 1 : -1) + panels.length) % panels.length;
    selectStory(next, controls[next]);
  });
  stage.addEventListener('pointercancel', () => { gesture = null; });
  stage.addEventListener('lostpointercapture', () => { gesture = null; });
  reducedMotion.addEventListener('change', settle);
})();
