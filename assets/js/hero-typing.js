(() => {
  const lines = [...document.querySelectorAll('h1 .type-line')];
  if (lines.length !== 2) return;
  const phrases = ['Lee Jun\nXian.', 'a.k.a.\nJax.'];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let timer, blinkTimer, phrase = 0, position = 0, deleting = false, caret = true;
  const paused = () => document.hidden || (window.portfolioProgress || 0) > .015;
  const notify = () => window.dispatchEvent(new Event('hero-type'));
  function render() {
    const text = phrases[phrase].slice(0,position);
    const parts = text.split('\n');
    lines.forEach((line,index) => {
      line.textContent = parts[index] || '';
      line.dataset.caret = String(caret && index === (parts.length > 1 ? 1 : 0));
    });
    notify();
  }
  function tick() {
    if (paused()) { timer = setTimeout(tick,200); return; }
    caret = true;
    position += deleting ? -1 : 1;
    render();
    if (!deleting && position === phrases[phrase].length) {
      deleting = true;
      timer = setTimeout(tick,2600);
    } else if (deleting && position === 0) {
      deleting = false;
      phrase = (phrase + 1) % phrases.length;
      timer = setTimeout(tick,400);
    } else {
      const character = phrases[phrase][position-1];
      timer = setTimeout(tick,deleting ? 55 : /[.\n]/.test(character) ? 170 : 110);
    }
  }
  function configure() {
    clearTimeout(timer);
    clearInterval(blinkTimer);
    if (reducedMotion.matches) {
      lines[0].textContent = 'Lee Jun';
      lines[1].textContent = 'Xian.';
      lines.forEach(line=>delete line.dataset.caret);
      notify();
      return;
    }
    phrase = 0; position = 0; deleting = false; caret = true;
    timer = setTimeout(() => { render(); tick(); },700);
    blinkTimer = setInterval(() => {
      if (!paused() && deleting && position === phrases[phrase].length) {
        caret = !caret;
        render();
      }
    },500);
  }
  document.fonts.ready.then(configure);
  reducedMotion.addEventListener('change',configure);
  window.addEventListener('pagehide',()=>{clearTimeout(timer);clearInterval(blinkTimer)},{once:true});
})();
