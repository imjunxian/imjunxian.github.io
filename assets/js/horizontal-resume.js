(() => {
  const section = document.querySelector('#resume');
  if (!section) return;
  const source = section.querySelector('.section-content');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pin = matchMedia('(min-width: 901px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)');
  section.classList.add('horizontal-rail', 'resume-rows');
  const shell = document.createElement('div');
  shell.className = 'resume-shell';
  const heading = document.createElement('header');
  heading.className = 'work-heading resume-heading';
  const title = source.querySelector('h2');
  title.innerHTML = title.innerHTML.replace('<br>', ' ');
  heading.append(section.querySelector('.chapter-marker'), title);
  shell.append(heading);
  const rows = [];
  const arrow = direction => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction < 0 ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'}"/></svg>`;

  for (const group of source.querySelectorAll('.resume-group')) {
    const name = group.querySelector('h3').textContent;
    const key = name.toLowerCase();
    const row = document.createElement('section');
    row.className = 'resume-row';
    row.setAttribute('aria-labelledby', `resume-${key}-label`);
    const stage = document.createElement('div');
    stage.className = 'resume-row-stage';
    const rowHeading = document.createElement('header');
    rowHeading.className = 'resume-row-heading';
    rowHeading.innerHTML = `<h3 id="resume-${key}-label">${name}</h3>`;
    const cards = [...group.querySelectorAll('.entry')];
    for (const card of cards) {
      card.classList.add('work-card', 'resume-card');
      card.setAttribute('aria-label', card.querySelector('h3').textContent);
    }
    const controls = document.createElement('div');
    controls.className = 'work-controls';
    controls.innerHTML = `<span class="work-position" aria-live="polite" aria-atomic="true">01 / ${String(cards.length).padStart(2,'0')}</span><button type="button" data-step="-1" aria-label="Previous ${key} item">${arrow(-1)}</button><button type="button" data-step="1" aria-label="Next ${key} item">${arrow(1)}</button>`;
    rowHeading.append(controls);
    const viewport = document.createElement('div');
    viewport.className = 'work-viewport';
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-label', `${name} cards`);
    viewport.tabIndex = 0;
    const track = document.createElement('div');
    track.className = 'work-track';
    track.append(...cards);
    viewport.append(track);
    const footer = document.createElement('div');
    footer.className = 'work-footer';
    footer.innerHTML = '<p class="work-scroll-hint" aria-hidden="true"></p><div class="work-meter" aria-hidden="true"><span></span></div>';
    stage.append(rowHeading, viewport, footer);
    row.append(stage);
    shell.append(row);
    const state = {row, stage, viewport, track, cards, name, key, travel: 0, active: 0, pinned: false,
      position: controls.querySelector('.work-position'),
      previous: controls.querySelector('[data-step="-1"]'),
      next: controls.querySelector('[data-step="1"]'),
      hint: footer.querySelector('.work-scroll-hint')};
    rows.push(state);
    controls.addEventListener('click', event => {
      const button = event.target.closest('[data-step]');
      if (button) goTo(state, state.active + Number(button.dataset.step));
    });
    viewport.addEventListener('keydown', event => {
      if (event.defaultPrevented || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      goTo(state, event.key==='Home' ? 0 : event.key==='End' ? cards.length-1 : state.active+(event.key==='ArrowRight'?1:-1));
    });
    viewport.addEventListener('scroll', () => {if (!state.pinned) queue()}, {passive: true});
  }
  source.replaceWith(shell);
  let frame = 0;
  function draw() {
    frame = 0;
    for (const state of rows) {
      const {row, viewport, cards, travel} = state;
      if (state.pinned) viewport.scrollLeft = Math.max(0, Math.min(travel, 112-row.getBoundingClientRect().top));
      const left = viewport.scrollLeft;
      let closest = 0;
      for (let i=1; i<cards.length; i++) {
        if (Math.abs(cards[i].offsetLeft-left)<Math.abs(cards[closest].offsetLeft-left)) closest=i;
      }
      if (closest!==state.active) {
        state.active=closest;
        state.position.textContent=`${String(closest+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
      }
      row.style.setProperty('--work-progress', travel ? left/travel : 0);
      state.previous.disabled=left<2;
      state.next.disabled=left>=travel-2;
    }
  }
  function queue() {if (!frame) frame=requestAnimationFrame(draw)}
  function refresh() {
    for (const state of rows) {
      state.row.classList.remove('resume-row-pinned');
      state.pinned=pin.matches && state.stage.offsetHeight<=innerHeight-112;
      state.row.classList.toggle('resume-row-pinned',state.pinned);
      state.travel=Math.max(0,state.track.scrollWidth-state.viewport.clientWidth);
      state.row.style.height=state.pinned ? `${state.stage.offsetHeight+state.travel}px` : '';
      state.hint.textContent=state.pinned ? `SCROLL TO EXPLORE ${state.name.toUpperCase()} →` : 'SWIPE OR USE THE ARROWS TO EXPLORE →';
    }
    queue();
  }
  function goTo(state,index) {
    index=Math.max(0,Math.min(state.cards.length-1,index));
    const left=Math.min(state.travel,state.cards[index].offsetLeft);
    if (state.pinned) window.scrollTo({top:state.row.getBoundingClientRect().top+scrollY-112+left,behavior:'smooth'});
    else state.viewport.scrollTo({left,behavior:motion.matches?'instant':'smooth'});
  }
  const observer=new ResizeObserver(refresh);
  for (const {track,viewport} of rows) {observer.observe(track);observer.observe(viewport)}
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',refresh);
  pin.addEventListener('change',refresh);
  document.fonts.ready.then(refresh);
  refresh();
})();
