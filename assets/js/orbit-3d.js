import * as THREE from './vendor/three.module.min.js';

const host = document.querySelector('.orbital-scene');
if (host) enhanceOrbit().catch(() => {
  host.classList.remove('orbit-webgl-ready');
  host.querySelector('.orbit-canvas')?.remove();
});

async function enhanceOrbit() {
  const canvas = document.createElement('canvas');
  canvas.className = 'orbit-canvas';
  canvas.setAttribute('aria-hidden','true');
  host.querySelector('.orbit-assembly').before(canvas);
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.setClearColor(0x000000,0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38,1,.1,30);
  camera.position.set(0,0,6.8);
  const root = new THREE.Group();
  scene.add(root);

  // A generated studio environment gives the actual curved surface broad reflections.
  const studio = document.createElement('canvas');
  studio.width=1024;studio.height=512;
  const lightMap=studio.getContext('2d');
  lightMap.fillStyle='#56616a';lightMap.fillRect(0,0,1024,512);
  const glow=lightMap.createRadialGradient(260,150,5,260,150,340);
  glow.addColorStop(0,'#ffffff');glow.addColorStop(.35,'#e9eee7');glow.addColorStop(1,'#56616a');
  lightMap.fillStyle=glow;lightMap.fillRect(0,0,1024,512);
  lightMap.fillStyle='#dce4ee';lightMap.fillRect(700,70,90,300);
  const studioTexture=new THREE.CanvasTexture(studio);
  studioTexture.mapping=THREE.EquirectangularReflectionMapping;
  studioTexture.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer);
  const environment=pmrem.fromEquirectangular(studioTexture);
  scene.environment=environment.texture;
  studioTexture.dispose();pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xf5ffeb,0x253b35,2));
  const key=new THREE.DirectionalLight(0xfffcf1,3.5);key.position.set(-3,4,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xbfcfff,.85);fill.position.set(4,-1,3);scene.add(fill);
  const rim=new THREE.PointLight(0xbfc5ff,24,20);rim.position.set(3,2,-3);scene.add(rim);

  // Longitude/latitude and the JaX mark are mapped onto the sphere, so they curve
  // with its surface and rotate behind it rather than behaving like a flat overlay.
  const ink=document.createElement('canvas');ink.width=1024;ink.height=512;
  const ctx=ink.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1024,512);
  ctx.strokeStyle='#233d2425';ctx.lineWidth=1;
  for(let i=0;i<=32;i++){ctx.beginPath();ctx.moveTo(i*32,0);ctx.lineTo(i*32,512);ctx.stroke()}
  for(let i=0;i<=16;i++){ctx.beginPath();ctx.moveTo(0,i*32);ctx.lineTo(1024,i*32);ctx.stroke()}
  const logo=new Image();
  const loaded=await new Promise(resolve=>{logo.onload=()=>resolve(true);logo.onerror=()=>resolve(false);logo.src='assets/img/jax-logo.svg'});
  for(const center of [256,768]){
    if(loaded){ctx.globalAlpha=.84;ctx.drawImage(logo,center-135,194,270,126);ctx.globalAlpha=1}
    else{ctx.fillStyle='#173023';ctx.font='bold 160px Arial';ctx.textAlign='center';ctx.fillText('JX',center,310)}
  }
  const texture=new THREE.CanvasTexture(ink);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const globeMaterial=new THREE.MeshPhysicalMaterial({map:texture,color:0xb9df82,metalness:.2,roughness:.29,clearcoat:1,clearcoatRoughness:.22,envMapIntensity:.55});
  const globe=new THREE.Mesh(new THREE.SphereGeometry(1.25,80,56),globeMaterial);
  root.add(globe);
  const haloMaterial=new THREE.ShaderMaterial({
    uniforms:{tint:{value:new THREE.Color(0xb7dc78)},strength:{value:.16}},
    vertexShader:'varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
    fragmentShader:'uniform vec3 tint;uniform float strength;varying vec3 n;varying vec3 v;void main(){float a=pow(1.0-max(dot(normalize(n),normalize(v)),0.0),3.0);gl_FragColor=vec4(tint,a*strength);}',
    transparent:true,depthWrite:false
  });
  root.add(new THREE.Mesh(new THREE.SphereGeometry(1.275,56,40),haloMaterial));

  const ringMaterial=new THREE.MeshStandardMaterial({color:0x75846c,metalness:.55,roughness:.35,transparent:true,opacity:.72,depthWrite:false});
  const satelliteMaterial=new THREE.MeshPhysicalMaterial({color:0xe3f5b4,emissive:0x5f793c,emissiveIntensity:.18,metalness:.45,roughness:.23,clearcoat:1});
  const orbitSpecs=[{radius:1.88,x:1.08,y:.25,z:-.4,speed:.33,size:.10},
    {radius:2.1,x:.7,y:-.8,z:.75,speed:-.24,size:.075},
    {radius:2.0,x:1.78,y:.45,z:1.25,speed:.19,size:.065}];
  const rings=orbitSpecs.map((spec,i)=>{
    const group=new THREE.Group();group.rotation.set(spec.x,spec.y,spec.z);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(spec.radius,i===2?.005:.009,8,180),ringMaterial);
    group.add(ring);
    const satellite=new THREE.Mesh(new THREE.SphereGeometry(spec.size,20,16),satelliteMaterial);
    group.add(satellite);
    root.add(group);
    return {...spec,group,satellite,phase:i*2.2};
  });
  const waveMaterial=new THREE.MeshBasicMaterial({color:0xb7dc78,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false});
  const wave=new THREE.Mesh(new THREE.RingGeometry(1.63,1.65,120),waveMaterial);
  wave.visible=false;root.add(wave);

  const presets={ai:{body:0xb9df82,ring:0x71865b,satellite:0xe0f5b0,speed:1},
    software:{body:0xbba1e8,ring:0x8773a9,satellite:0xeadbff,speed:1.4},
    data:{body:0x81d4c4,ring:0x548e87,satellite:0xc3fff0,speed:.78}};
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let state=host.orbitState||{},frame=0,visible=true,lastTime=0,time=0,lastMode='',pulseAt=-Infinity,failed=false;
  function requestRender(){if(!frame&&visible&&!document.hidden&&!failed)frame=requestAnimationFrame(render)}
  function render(now){
    frame=0;if(!visible||document.hidden||failed)return;
    const still=motion.matches;
    const dt=Math.min(.04,(now-lastTime)/1000||0);lastTime=now;
    if(!still)time+=dt;
    const mode=presets[state.mode]||presets.ai;
    if(lastMode!==state.mode){
      lastMode=state.mode;
      globeMaterial.color.setHex(mode.body);ringMaterial.color.setHex(mode.ring);
      satelliteMaterial.color.setHex(mode.satellite);satelliteMaterial.emissive.setHex(mode.ring);
      haloMaterial.uniforms.tint.value.setHex(mode.body);waveMaterial.color.setHex(mode.body);
    }
    root.rotation.set(THREE.MathUtils.degToRad(still?8:8+(state.tilt||0)+(state.scrollDepth||0)*18-(state.y||0)*10),
      THREE.MathUtils.degToRad(still?0:(state.turn||0)+(state.x||0)*12+(state.scrollDepth||0)*30),-.12);
    root.scale.setScalar(still?1:1+(state.scrollDepth||0)*.07);
    const hovered=host.matches(':hover,:focus-within');
    haloMaterial.uniforms.strength.value=state.charged ? .48 : hovered ? .28 : .15;
    globeMaterial.emissive.setHex(mode.body);globeMaterial.emissiveIntensity=state.charged ? .14 : .025;
    key.position.x=-3+(state.x||0)*1.7;key.position.y=4-(state.y||0)*1.5;
    rings.forEach((ring,i)=>{
      const angle=time*ring.speed*mode.speed+ring.phase;
      ring.satellite.position.set(Math.cos(angle)*ring.radius,Math.sin(angle)*ring.radius,0);
      ring.group.rotation.z=ring.z+(still?0:(state.scrollDepth||0)*(.7-i*.5)+Math.sin(time*.11+i)*.05);
    });
    const elapsed=(now-pulseAt)/1000;
    wave.visible=!still&&elapsed>=0&&elapsed<1.2;
    if(wave.visible){wave.scale.setScalar(.8+elapsed*.65);waveMaterial.opacity=(1-elapsed/1.2)*.5;wave.rotation.x=.3}
    renderer.render(scene,camera);
    if(!still)requestRender();
  }
  function resize(){
    const rect=host.getBoundingClientRect();
    renderer.setSize(rect.width,rect.height,false);
    camera.aspect=rect.width/Math.max(1,rect.height);camera.updateProjectionMatrix();requestRender();
  }
  host.addEventListener('orbit-state',event=>{state=event.detail;requestRender()});
  host.addEventListener('orbit-pulse',()=>{pulseAt=performance.now();requestRender()});
  window.addEventListener('portfolio-theme',requestRender);
  motion.addEventListener('change',()=>{lastTime=0;requestRender()});
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;lastTime=0;
    if(visible)requestRender();else{cancelAnimationFrame(frame);frame=0}
  },{rootMargin:'-100px 0px 0px 0px'});
  observer.observe(document.querySelector('.hero-stage'));
  const sizing=new ResizeObserver(resize);sizing.observe(host);
  document.addEventListener('visibilitychange',()=>{
    lastTime=0;if(document.hidden){cancelAnimationFrame(frame);frame=0}else requestRender();
  });
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();failed=true;cancelAnimationFrame(frame);frame=0;
    host.classList.remove('orbit-webgl-ready');canvas.remove();observer.disconnect();sizing.disconnect();
  });
  host.classList.add('orbit-webgl-ready');canvas.dataset.renderer='three-webgl';resize();requestRender();
}
