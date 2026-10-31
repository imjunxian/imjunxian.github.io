(() => {
  const headline = document.querySelector('.code-headline');
  if (!headline) return;
  const lines = [...headline.querySelectorAll('.type-line')];
  const tokens = [
    [['def','keyword'],[' ','plain'],['Lee_Jun_Xian','function'],['():','plain']],
    [['return','return'],[' ','plain'],['"a.k.a. JaX."','string']]
  ];
  const text = tokens.map(row=>row.map(([value])=>value).join('')).join('\n');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frameId=0, position=0, lastStep=0, caretTime=0, running=false, ready=false;
  const notify = () => window.dispatchEvent(new Event('hero-type'));
  function render(position,caret=false) {
    const typed=text.slice(0,position).split('\n');
    lines.forEach((line,index)=>{
      let remaining=(typed[index]||'').length;
      const fragment=document.createDocumentFragment();
      tokens[index].forEach(([value,kind])=>{
        const shown=value.slice(0,Math.max(0,remaining));remaining-=value.length;
        if(!shown)return;
        const token=document.createElement('span');
        token.className='code-token';token.dataset.syntaxKey=kind;
        token.style.setProperty('--syntax-color',`var(--syntax-${kind})`);token.textContent=shown;
        fragment.append(token);
      });
      line.replaceChildren(fragment);
      line.dataset.caret=String(caret&&index===(typed.length>1?1:0));
    });
    notify();
  }
  function tick(now) {
    if(!running)return;
    if(!lastStep)lastStep=now;
    if(position<text.length){
      const delay=text[position]==='\n'?240:60;
      if(now-lastStep>=delay){
        position++;lastStep=now;caretTime=now;
        render(position,true);
        if(position===text.length)headline.dataset.state='complete';
      }
    }else{
      const caret=Math.floor((now-caretTime)/500)%2===0;
      if(lines[1].dataset.caret!==String(caret))render(position,caret);
    }
    frameId=requestAnimationFrame(tick);
  }
  function start() {
    if(ready)return;
    ready=true;
    if(reducedMotion.matches){position=text.length;render(position,true);headline.dataset.state='complete';return}
    headline.dataset.state='typing';running=true;position=1;
    render(position,true);
    frameId=requestAnimationFrame(tick);
  }
  // One animation clock owns the text. Rendering, fonts, scrolling and themes never reset it.
  render(0,true);
  const fallback=setTimeout(start,1000);
  window.addEventListener('hero-render-ready',()=>{clearTimeout(fallback);start()},{once:true});
  if(reducedMotion.matches)start();
  reducedMotion.addEventListener('change',()=>{
    if(!reducedMotion.matches)return;
    cancelAnimationFrame(frameId);running=false;ready=true;position=text.length;
    render(position,true);headline.dataset.state='complete';
  });
  window.addEventListener('portfolio-theme',notify);
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frameId);running=false});
  window.addEventListener('pageshow',()=>{
    if(ready&&!running&&!reducedMotion.matches){running=true;lastStep=0;frameId=requestAnimationFrame(tick)}
  });
})();
