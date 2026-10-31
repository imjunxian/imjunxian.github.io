(() => {
  const tags = values => `<div class="tags">${values.split(' · ').map(s => `<span>${s}</span>`).join('')}</div>`;
  const projects = [
    ['Agentic AI for Backend Operations Analytics','AI-powered analytics · AI, software & data engineering','Built an analytics agent that helps engineers explore manufacturing KPIs, investigate yield performance and summarize operational issues. Orchestrated tools with LangGraph, RAG-based routing, Text-to-SQL, conversational context and an LLM-as-a-Judge validation layer. Integrated Databricks Genie and connected the agent to a broader corporate agentic AI platform via MCP.','Python · FastAPI · LangGraph · ChromaDB · Databricks Genie · MCP',null,null,true],
    ['Wafer Quantity Auto Selection','Production planning · Software & operations research','Co-developed a production-planning application that automates substrate and wafer quantity selection while meeting production requirements and reducing material overallocation. Used Google OR-Tools CP-SAT to optimize allocation across manufacturing data sources, persistent run history and Redis caching. Exposed the optimization as an agent tool via MCP.','Python · React · FastAPI · Google OR-Tools · Redis · MySQL · Docker',null,null,true],
    ['SDES','Sustainability · Web development','Developed the Sustainability Data Entry System during industrial training to automate sustainability data collection for BURSA Malaysia audits. Covers electricity, water, factory output, waste and fuel usage, with data visualization using FusionChart.','ASP.NET C# · Microsoft SQL · JavaScript · FusionChart','assets/img/portfolio/iSDES/Dashboard.jpg'],
    ['Timex','Ecommerce · Full-stack development','A responsive ecommerce system built as my final year project. Integrates Google Analytics, Stripe payments, a Dialogflow chatbot, RSA encryption and Cloud Firestore.','PHP · JavaScript · Bootstrap · Cloud Firestore · Stripe','assets/img/portfolio/timex/home.jpg','https://github.com/imjunxian/timex'],
    ['Artistique','Art & ecommerce · Web development','A minimal artwork ecommerce system built with Laravel for a college group assignment. I developed the artworks module, allowing artists to manage artwork content, with real-time details fetched through jQuery AJAX.','Laravel · PHP · MySQL · JavaScript · Bootstrap','assets/img/portfolio/artistique/artistiqueHome.jpg','https://github.com/chuunfaii/ip-assignment'],
    ['After','Future bass · Music production','An exploration of future bass, created under my music alias JaX. Music is another way I express my creativity.','Music · Future bass','assets/img/portfolio/after/after.jpg','https://soundcloud.com/c411m3j4x'],
    ['JaX’s Logo','Visual identity · Design','A personal logo design for my creative identity, JaX.','Design · Visual identity','assets/img/portfolio/logo/logoDesign2.jpg']
  ];
  const projectImages = [
    [['company/agentic-ai.svg','Confidential company project · Generic illustration']],
    [['company/wafer-selection.svg','Confidential company project · Generic illustration']],
    [['iSDES/Dashboard.jpg','Sustainability dashboard'],['iSDES/Home.jpg','SDES home']],
    [['timex/home.jpg','Storefront'],['timex/adminHome.jpg','Admin dashboard'],['timex/adminLogin.jpg','Admin sign in'],['timex/chatbot.jpg','Dialogflow chatbot'],['timex/stripe.jpg','Stripe payments'],['timex/ga.jpg','Google Analytics'],['timex/firestore.jpg','Cloud Firestore']],
    [['artistique/artistiqueHome.jpg','Artwork storefront'],['artistique/artistiqueLogin.jpg','Sign in'],['artistique/artistiqueArtist.jpg','Artist profile'],['artistique/artistiqueArtwork.jpg','Artwork details'],['artistique/artistiqueMyArtwork.jpg','Manage artworks'],['artistique/artistiqueCart.jpg','Shopping cart']],
    [['after/after.jpg','After · Future bass']],
    [['logo/logoDesign2.jpg','JaX identity exploration'],['logo/logoDesign.jpg','Logo design study'],['logo/logo.jpg','JaX logo'],['logo/logo2.jpg','Alternate logo']]
  ];
  function gallery(project,index) {
    const images = projectImages[index];
    return `<section class="project-gallery" aria-roledescription="carousel" aria-label="${project[0]} images" tabindex="0" data-current="0">
      <div class="gallery-slides">${images.map(([path,caption],slide)=>`<figure class="gallery-slide" role="group" aria-roledescription="slide" aria-label="${slide+1} of ${images.length}" ${slide?'hidden':''}>
        <a class="gallery-image-link" href="assets/img/portfolio/${path}" target="_blank" rel="noopener noreferrer" aria-label="Open ${project[0]}: ${caption} at full size"><img src="assets/img/portfolio/${path}" alt="${project[0]} — ${caption}" loading="lazy" decoding="async" width="1200" height="700"></a>
        <figcaption>${caption}</figcaption>
      </figure>`).join('')}</div>
      ${images.length>1?`<div class="gallery-controls"><button type="button" class="gallery-arrow" data-direction="-1" aria-label="Previous image">←</button><div class="gallery-pagination"><div class="gallery-dots" role="group" aria-label="Choose an image">${images.map((image,slide)=>`<button type="button" class="gallery-dot" data-slide="${slide}" aria-label="Show image ${slide+1}: ${image[1]}" aria-current="${slide===0}"></button>`).join('')}</div><span class="gallery-status" aria-live="polite" aria-atomic="true">1 / ${images.length}</span></div><button type="button" class="gallery-arrow" data-direction="1" aria-label="Next image">→</button></div>`:''}
    </section>`;
  }
  function showSlide(carousel,index) {
    const slides = [...carousel.querySelectorAll('.gallery-slide')];
    index = (index + slides.length) % slides.length;
    carousel.dataset.current = index;
    slides.forEach((slide,i)=>slide.hidden=i!==index);
    carousel.querySelectorAll('.gallery-dot').forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));
    const status = carousel.querySelector('.gallery-status');
    if(status) status.textContent = `${index+1} / ${slides.length}`;
  }
  const entry = (date,title,org,description,stack='') => `<article class="entry"><time>${date}</time><h3>${title}</h3><h4>${org}</h4>${description ? `<p>${description}</p>` : ''}${stack ? tags(stack) : ''}</article>`;
  const contactIcons = {
    email: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="7.5" cy="7.4" r="1.1" fill="currentColor"/><path d="M7.5 11v6m4-6v6m0-3.5a2.5 2.5 0 0 1 5 0V17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    github: '<path fill="currentColor" d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.09c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.5-.28-5.12-1.25-5.12-5.54 0-1.22.43-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.62 5.25-5.13 5.53.4.35.76 1.03.76 2.08v3.09c0 .3.21.65.77.54A11.2 11.2 0 0 0 12 .8Z"/>',
    soundcloud: '<path d="M2 13v4m3-6v6m3-9v9m3-11v11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M14 17h5.2a3.8 3.8 0 0 0 .4-7.58A5.6 5.6 0 0 0 14 6.1Z" fill="currentColor"/>'
  };
  const contactLabel = (icon,label) => `<span class="contact-label"><svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${contactIcons[icon]}</svg><span>${label}</span></span>`;
  const views = {
    work: `<p class="section-kicker">03 / Selected work</p><h2>Intelligence, put to work.</h2><p class="lede">From manufacturing analytics to web applications. A selection of things I’ve built, and a little of my creative side.</p>${projects.map((p,i)=>`<details class="project"><summary><span class="project-number">0${i+1}</span><div><h3>${p[0]}</h3><p class="category">${p[1]}</p></div><span class="project-arrow">↗</span></summary><div class="project-body"><p>${p[2]}</p>${tags(p[3])}${gallery(p,i)}${p[6]?'<p class="confidential">Company project. Screenshots and source code are confidential.</p>':''}${p[5]?`<a href="${p[5]}" target="_blank" rel="noopener noreferrer">${i===5?'Listen on SoundCloud':'Explore the source'} ↗</a>`:''}</div></details>`).join('')}`,
    resume: `<p class="section-kicker">02 / Resume</p><h2>A little context.<br>A lot of curiosity.</h2><p class="lede">My path through AI, software and data engineering.</p><div class="resume-group"><h3>Experience</h3>${entry('Oct 2024 – Present','Automation Development Engineer (AI & Software)','SanDisk (SNDK)','- Transitioned from WDC to SanDisk in February 2025 following the spin-off.<br> - Built AI-powered analytics tools, Databricks ETL pipelines and manufacturing automation.<br> - Co-developed production-planning optimization and integrated it as an agent tool to broader agentic AI platform.','Python · TypeScript · LLM · Databricks · LangGraph · Docker · Kubernetes')}${entry('Oct 2023 – Oct 2024','Engineer, Data Management Engineering','Western Digital (WDC)','- Built manufacturing ETL pipelines and automated workflows. <br> - Developed computer vision inspection systems (UI & post-processing pipelines) and KPI dashboards.','Python · Oracle SQL · FastAPI · Vue.js · .NET C# · Apache Airflow · TIBCO Spotfire')}${entry('Feb 2023 – Jul 2023','Software Engineer (Intern)','Inari Technology Sdn Bhd','','ASP.NET C# · Laravel · Microsoft SQL · MySQL · HTML · CSS · JavaScript')}${entry('Oct 2020 – Dec 2020','Software Developer (Intern)','Operion Ecommerce & Software Sdn Bhd','','PHP · JavaScript · HTML · CSS · Bootstrap')}</div><div class="resume-group"><h3>Education</h3>${entry('Oct 2024 – Sep 2026','Master of Computer Science','Universiti Sains Malaysia (USM)','Research areas: NLP, GenAI, Aspect-Based Sentiment Analysis (ABSA), Multi-Task Learning and Transfer Learning.','Python · Machine Learning · Deep Learning')}${entry('Jun 2021 – Jul 2023','Bachelor of Information Technology (Honours) in Software Systems Development','Tunku Abdul Rahman University of Management and Technology (TARUMT)','','ASP.NET C# · Java · Kotlin · Microsoft SQL · Firebase')}${entry('May 2019 – May 2021','Diploma in Science (Information System Engineering)','Tunku Abdul Rahman University of Management and Technology (TARUMT)','','C · Java · PHP · MySQL · JavaScript')}</div>`,
    about: `<p class="section-kicker">01 / Behind the code</p><h2>Engineer.<br>Curious by nature.</h2><div class="about-copy"><p>I’m <strong>Lee Jun Xian</strong> (a.k.a. JaX), an AI, software and data engineer based in <strong>Penang, Malaysia</strong>.</p><p>My work connects AI-powered analytics, data pipelines and software to real manufacturing challenges. At SanDisk, I build tools for analytics and automation, and co-develop production-planning optimization.</p><p>My Master of Computer Science research at Universiti Sains Malaysia (USM) explores NLP, generative AI, aspect-based sentiment analysis, multi-task learning and transfer learning.</p><p>I started coding in college and keep learning new technologies. Outside engineering, I express myself through design and music. I explore music production with FL Studio and Logic Pro.</p></div>`,
    contact: `<p class="section-kicker">04 / Get in touch</p><h2>Let’s connect.</h2><p class="lede"></p><div class="contact-list"><a href="mailto:junxian010729@gmail.com">${contactLabel('email','Email')}<span>↗</span></a><a href="https://www.linkedin.com/in/imjunxian/" target="_blank" rel="noopener noreferrer">${contactLabel('linkedin','LinkedIn')}<span>↗</span></a><a href="https://github.com/imjunxian" target="_blank" rel="noopener noreferrer">${contactLabel('github','GitHub')}<span>↗</span></a><a href="https://soundcloud.com/c411m3j4x" target="_blank" rel="noopener noreferrer">${contactLabel('soundcloud','SoundCloud')}<span>↗</span></a></div><div class="certificates"><p class="section-kicker">Certifications</p><a href="https://www.credly.com/badges/72c394cc-0284-4eaa-a05f-e836d56a48d1/linked_in_profile" target="_blank" rel="noopener noreferrer">CCNA: Enterprise Networking, Security, and Automation ↗</a><a href="https://www.credly.com/badges/53ec610b-cbba-45de-9875-a5548153e161/linked_in_profile" target="_blank" rel="noopener noreferrer">AWS Academy Cloud Foundations ↗</a><a href="https://www.credly.com/badges/ad1d35de-301d-4d35-aaaf-4497b385c761/linked_in_profile" target="_blank" rel="noopener noreferrer">CCNA: Switching, Routing, and Wireless Essentials ↗</a><a href="https://www.credly.com/badges/2fa15e80-4187-4e76-a92c-752e2525753f/linked_in_profile" target="_blank" rel="noopener noreferrer">CCNA: Introduction to Networks ↗</a><a href="assets/img/cert/cert.jpg" target="_blank" rel="noopener">View certificates ↗</a></div>`
  };
  const home = document.querySelector('#home'), content = document.querySelector('#detail-content');
  content.addEventListener('click',event=>{
    const button = event.target.closest('button[data-direction],button[data-slide]');
    if(!button) return;
    const carousel = button.closest('.project-gallery');
    const next = button.hasAttribute('data-slide') ? Number(button.dataset.slide) : Number(carousel.dataset.current)+Number(button.dataset.direction);
    showSlide(carousel,next);
  });
  content.addEventListener('keydown',event=>{
    const carousel = event.target.closest('.project-gallery');
    if(!carousel || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const count = carousel.querySelectorAll('.gallery-slide').length;
    const next = event.key==='Home' ? 0 : event.key==='End' ? count-1 : Number(carousel.dataset.current)+(event.key==='ArrowRight'?1:-1);
    showSlide(carousel,next);
  });
  // Every section stays in the document: wheel, touch, keyboard and anchor links
  // all travel through the same scroll-driven glass transition.
  const sections = ['about','resume','work','contact'];
  content.innerHTML = sections.map(key=>`<section id="${key}" class="portfolio-section" aria-labelledby="${key}-title" tabindex="-1">${views[key].replace('<h2>',`<h2 id="${key}-title">`)}</section>`).join('');
  const stage = document.querySelector('.hero-stage');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  let currentSection = '';
  function updateScroll() {
    queued = false;
    const travel = Math.max(1,home.offsetHeight-stage.offsetHeight);
    const progress = Math.min(1,Math.max(0,window.scrollY/travel));
    window.portfolioProgress = progress;
    window.dispatchEvent(new CustomEvent('portfolio-scroll',{detail:{progress}}));
    document.body.classList.toggle('past-hero',progress>.96);
    stage.inert = progress>.15;
    stage.style.setProperty('--hero-dom-opacity',window.glassReady && progress>.015 ? 0 : Math.max(0,1-progress*2));
    stage.style.setProperty('--caption-opacity',Math.max(0,1-progress*3));
    let active = '';
    if(progress>.8) {
      active = sections[0];
      for(const key of sections) {
        if(document.getElementById(key).getBoundingClientRect().top < innerHeight*.4) active=key;
      }
    }
    if(active!==currentSection) {
      currentSection=active;
      document.querySelectorAll('.detail-nav a').forEach(a=>{
        if(a.dataset.view===active) a.setAttribute('aria-current','page');
        else a.removeAttribute('aria-current');
      });
      document.title=active ? `${active==='resume'?'Resume':active[0].toUpperCase()+active.slice(1)} — Lee Jun Xian` : 'Lee Jun Xian';
    }
  }
  function queueScroll() {
    if(!queued){queued=true;requestAnimationFrame(updateScroll)}
  }
  function goTo(key,smooth=true,focus=false) {
    const target=document.getElementById(key==='home'?'home':key);
    if(!target || !['home',...sections].includes(key)) return;
    const top=key==='home'?0:target.getBoundingClientRect().top+scrollY-75;
    window.scrollTo({top,behavior:smooth&&!reducedMotion.matches?'smooth':'instant'});
    if(focus && key!=='home')target.focus({preventScroll:true});
  }
  document.addEventListener('click',event=>{
    const anchor=event.target.closest('a[href^="#"]');
    if(!anchor || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button!==0)return;
    const key=anchor.hash.slice(1);
    if(!['home',...sections].includes(key))return;
    event.preventDefault();
    if(location.hash!==anchor.hash)history.pushState(null,'',anchor.hash);
    goTo(key,true,true);
  });
  document.querySelectorAll('.year').forEach(el=>el.textContent=new Date().getFullYear());
  document.querySelector('.back-sliver').addEventListener('click',()=>{
    history.pushState(null,'','#home');goTo('home');
  });
  window.addEventListener('hashchange',()=>goTo(location.hash.slice(1)||'home'));
  window.addEventListener('scroll',queueScroll,{passive:true});
  window.addEventListener('resize',queueScroll);
  window.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&window.scrollY>0)goTo('home');
  });
  updateScroll();
  const initialKey=location.hash.slice(1);
  if(initialKey && initialKey!=='home') document.fonts.ready.then(()=>goTo(initialKey,false));
})();
