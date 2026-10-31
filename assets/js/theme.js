(() => {
  const root=document.documentElement;
  const button=document.querySelector('.theme-toggle');
  function update(){
    const light=root.dataset.theme==='light';
    button.setAttribute('aria-label',`Switch to ${light?'dark':'light'} theme`);
    button.title=`Use ${light?'dark':'light'} theme`;
    document.querySelector('meta[name="theme-color"]').content=light?'#f4f3ee':'#050507';
  }
  button.addEventListener('click',()=>{
    root.dataset.theme=root.dataset.theme==='light'?'dark':'light';
    try{localStorage.setItem('portfolio-theme',root.dataset.theme)}catch{}
    update();window.dispatchEvent(new Event('portfolio-theme'));
  });
  update();
})();
