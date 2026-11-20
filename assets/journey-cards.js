(() => {
  const journey = document.querySelector('[data-journey]');
  if (!journey) return;
  const cards = [...journey.querySelectorAll('[data-journey-card]')];
  const choices = [...journey.querySelectorAll('[data-journey-choice]')];
  const deck = journey.querySelector('.journey-deck');
  const count = journey.querySelector('[data-journey-count]');
  const status = journey.querySelector('[data-journey-status]');
  if (cards.length !== 3 || choices.length !== cards.length || !deck || !count || !status) return;
  let current = 0;
  let gesture = null;
  const format = value => String(value + 1).padStart(2, '0');

  function select(index, announce = true) {
    current = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      card.dataset.slot = String((i - current + cards.length) % cards.length);
      card.setAttribute('aria-hidden', String(i !== current));
      card.inert = i !== current;
    });
    choices.forEach((choice, i) => choice.setAttribute('aria-pressed', String(i === current)));
    count.textContent = format(current);
    if (announce) status.textContent = `Card ${current + 1} of ${cards.length}: ${cards[current].querySelector('h3').textContent}`;
  }

  choices.forEach((choice, i) => choice.addEventListener('click', () => select(i)));
  journey.querySelector('[data-journey-prev]').addEventListener('click', () => select(current - 1));
  journey.querySelector('[data-journey-next]').addEventListener('click', () => select(current + 1));
  journey.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const direction = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: cards.length - 1 };
    if (!(event.key in direction)) return;
    event.preventDefault();
    select(direction[event.key]);
    if (event.target.matches('[data-journey-choice]')) choices[current].focus();
  });

  deck.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    deck.setPointerCapture(event.pointerId);
  });
  deck.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.25) select(current + (dx < 0 ? 1 : -1));
  });
  deck.addEventListener('pointercancel', () => { gesture = null; });
  deck.addEventListener('lostpointercapture', () => { gesture = null; });
  deck.tabIndex = 0;
  deck.setAttribute('aria-label', 'Journey cards. Use left and right arrow keys to explore.');
  select(0, false);
  journey.setAttribute('data-journey-enhanced', '');
})();
