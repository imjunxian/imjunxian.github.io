(() => {
  const scene = document.querySelector('.orbital-scene');
  if (!scene) return;
  const hero = document.querySelector('#home');
  const stage = hero.querySelector('.hero-stage');
  const core = scene.querySelector('.orb-core');
  const help = scene.querySelector('#orbit-help');
  const status = scene.querySelector('.orbit-status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0, visible = true, lastFrame = 0;
  let targetX = 0, targetY = 0, x = 0, y = 0, scrollDepth = 0;
  let turn = 0, tilt = 0, velocity = 0, drag = null, suppressClick = false;
  const bursts = new Set();
  const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
  const modes = {
    ai: {label: '01 / INTELLIGENCE', title: 'AI that connects the dots.', stack: 'LangGraph · RAG · MCP'},
    software: {label: '02 / ENGINEERING', title: 'From concept to code.', stack: 'APIs · Automation · Web'},
    data: {label: '03 / DATA', title: 'From raw data to insight.', stack: 'ETL · SQL · Analytics'}
  };
  scene.dataset.orbitMode = 'ai';
  scene.querySelector('.label-code>span').textContent='TOOLBOX';
  scene.querySelector('.label-code>strong').textContent=modes.ai.stack;

  function draw(now) {
    frame = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min(32, now-lastFrame || 16.67);
    lastFrame = now;
    const still = motion.matches;
    x = still ? 0 : x+(targetX-x)*.12;
    y = still ? 0 : y+(targetY-y)*.12;
    if (!drag && !still && Math.abs(velocity)>.002) {
      turn+=velocity*dt;
      velocity*=Math.pow(.9,dt/16.67);
    } else if (still) velocity=0;
    scene.style.setProperty('--pointer-x',x.toFixed(4));
    scene.style.setProperty('--pointer-y',y.toFixed(4));
    scene.style.setProperty('--manual-turn',`${still ? 0 : turn}deg`);
    scene.style.setProperty('--manual-tilt',`${still ? 0 : tilt}deg`);
    scene.style.setProperty('--depth-turn',`${still ? 0 : scrollDepth*65}deg`);
    scene.style.setProperty('--depth-tilt',`${still ? 0 : scrollDepth*18}deg`);
    scene.style.setProperty('--depth-scale',still ? 1 : 1+scrollDepth*.08);
    scene.style.setProperty('--light-x',`${40+x*22}%`);
    scene.style.setProperty('--light-y',`${28+y*20}%`);
    scene.orbitState={x,y,turn,tilt,scrollDepth,mode:scene.dataset.orbitMode,charged:scene.classList.contains('is-charged'),reduced:still};
    scene.dispatchEvent(new CustomEvent('orbit-state',{detail:scene.orbitState}));
    if (!still && (Math.abs(x-targetX)+Math.abs(y-targetY)>.001 || !drag&&Math.abs(velocity)>.002)) requestDraw();
  }
  function requestDraw() {
    if (!frame && visible && !document.hidden) frame=requestAnimationFrame(draw);
  }
  function scroll() {
    if (!visible) return;
    const travel=Math.max(1,hero.offsetHeight-stage.offsetHeight);
    scrollDepth=clamp(-hero.getBoundingClientRect().top/travel,0,1);
    requestDraw();
  }
  function resetPointer() {
    targetX=targetY=0;
    scene.classList.remove('is-hovered');
    requestDraw();
  }
  function resetView(announce=true) {
    turn=tilt=velocity=0;
    resetPointer();
    if (announce) status.textContent='Orbit view reset.';
    requestDraw();
  }
  stage.addEventListener('pointermove',event=>{
    if (drag || event.pointerType==='touch' || motion.matches || !finePointer.matches) return;
    const rect=scene.getBoundingClientRect();
    targetX=clamp((event.clientX-rect.left-rect.width/2)/(rect.width/2),-1,1);
    targetY=clamp((event.clientY-rect.top-rect.height/2)/(rect.height/2),-1,1);
    requestDraw();
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{if(!drag)resetPointer()});
  scene.addEventListener('pointerenter',event=>{
    if(event.pointerType!=='touch')scene.classList.add('is-hovered');
  });
  scene.addEventListener('pointerleave',()=>scene.classList.remove('is-hovered'));

  core.addEventListener('pointerdown',event=>{
    if(motion.matches || event.button!==0 || drag)return;
    velocity=0;
    drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,time:event.timeStamp,moved:false};
    suppressClick=false;
    core.setPointerCapture(event.pointerId);
  });
  core.addEventListener('pointermove',event=>{
    if(!drag || event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moved && Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>6){
      drag.moved=true;
      scene.classList.add('is-dragging');
    }
    if(drag.moved){
      turn+=dx*.42;
      tilt=clamp(tilt-dy*.18,-28,28);
      velocity=clamp(dx*.42/Math.max(8,event.timeStamp-drag.time),-.7,.7);
      requestDraw();
    }
    drag.x=event.clientX;drag.y=event.clientY;drag.time=event.timeStamp;
  });
  function stopDrag(event) {
    if(!drag || event && event.pointerId!==drag.id)return;
    const id=drag.id;
    suppressClick=drag.moved && event?.type!=='pointercancel';
    if(event?.type==='pointercancel' || !event || event.timeStamp-drag.time>100)velocity=0;
    drag=null;
    scene.classList.remove('is-dragging');
    if(core.hasPointerCapture(id))core.releasePointerCapture(id);
    requestDraw();
  }
  core.addEventListener('pointerup',stopDrag);
  core.addEventListener('pointercancel',stopDrag);
  core.addEventListener('lostpointercapture',stopDrag);
  core.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
    event.preventDefault();
    if(event.key==='Home'){resetView();return}
    if(motion.matches)return;
    velocity=0;
    if(event.key==='ArrowLeft')turn-=15;
    if(event.key==='ArrowRight')turn+=15;
    if(event.key==='ArrowUp')tilt=clamp(tilt+8,-28,28);
    if(event.key==='ArrowDown')tilt=clamp(tilt-8,-28,28);
    requestDraw();
  });

  function clearBursts() {
    for(const {element,animation} of bursts){animation.cancel();element.remove()}
    bursts.clear();
  }
  function pulse() {
    clearBursts();
    scene.dispatchEvent(new Event('orbit-pulse'));
    requestDraw();
    if(motion.matches)return;
    for(let i=0;i<2;i++){
      const element=document.createElement('span');
      element.className='orbit-pulse';element.setAttribute('aria-hidden','true');scene.append(element);
      const animation=element.animate([{transform:'scale(.55)',opacity:.6},{transform:'scale(1.28)',opacity:0}],
        {duration:1100,delay:i*130,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
      const burst={element,animation};bursts.add(burst);
      animation.finished.then(()=>{element.remove();bursts.delete(burst)}).catch(()=>{});
    }
  }
  core.addEventListener('click',event=>{
    if(suppressClick && event.detail!==0){suppressClick=false;return}
    suppressClick=false;
    const charged=scene.classList.toggle('is-charged');
    core.setAttribute('aria-pressed',String(charged));
    core.setAttribute('aria-label',charged?'Discharge the orbit':'Energize the orbit');
    help.textContent=charged?'ENERGIZED · DRAG TO SPIN':'DRAG TO ROTATE · CLICK TO ENERGIZE';
    pulse();
  });
  scene.querySelectorAll('button[data-orbit-mode]').forEach(button=>{
    button.addEventListener('click',()=>{
      const key=button.dataset.orbitMode,mode=modes[key];
      scene.dataset.orbitMode=key;
      scene.querySelectorAll('button[data-orbit-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      scene.querySelector('.label-ai>span').textContent=mode.label;
      scene.querySelector('.label-ai>strong').textContent=mode.title;
      scene.querySelector('.label-code>span').textContent='TOOLBOX';
      scene.querySelector('.label-code>strong').textContent=mode.stack;
      status.textContent=`${button.textContent} orbit mode. ${mode.title}`;
      pulse();
    });
  });
  scene.querySelector('.orbit-reset').addEventListener('click',()=>{stopDrag();resetView()});
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    scene.classList.toggle('is-offscreen',!visible);
    if(visible)scroll();
    else{cancelAnimationFrame(frame);frame=0;stopDrag();resetPointer();clearBursts();velocity=0}
  },{rootMargin:'-100px 0px 0px 0px'});
  observer.observe(stage);
  window.addEventListener('scroll',scroll,{passive:true});
  window.addEventListener('resize',scroll);
  motion.addEventListener('change',()=>{stopDrag();clearBursts();resetView(false);scroll()});
  document.addEventListener('visibilitychange',()=>{
    scene.classList.toggle('is-paused',document.hidden);
    if(document.hidden){cancelAnimationFrame(frame);frame=0;stopDrag();clearBursts();velocity=0}
    else scroll();
  });
  scroll();
})();
