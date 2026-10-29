import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// The HTML remains the complete, usable fallback if motion or WebGL is unavailable.
const motion = matchMedia('(prefers-reduced-motion: reduce)');
if (!motion.matches) start().catch(error => {
  document.body.classList.remove('webgl-ready');
  document.querySelector('#slab').style.transform = '';
  document.querySelector('#glass').style.display = 'none';
  console.warn('Glass enhancement unavailable; using the HTML portfolio.', error);
});

async function start() {
  // Preload both families even when a direct link initially hides the hero.
  await Promise.allSettled([
    document.fonts.load('500 100px "JetBrains Mono"'),
    document.fonts.load('400 16px "Source Sans Pro"')
  ]);
  await document.fonts.ready;
  const brandLogo = document.querySelector('.brand-mark');
  await brandLogo.decode().catch(()=>{});
  const renderer = new THREE.WebGLRenderer({canvas:document.querySelector('#glass'),antialias:true,alpha:false});
  renderer.setClearColor(0x050507);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30,1,1,20000);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room,.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .42;
  room.dispose(); pmrem.dispose();
  const key = new THREE.DirectionalLight(0xdde5ff,2.4);key.position.set(-500,700,1000);scene.add(key);
  const fill = new THREE.DirectionalLight(0xaaa0bf,.35);fill.position.set(700,-200,400);scene.add(fill);
  const root = new THREE.Group();scene.add(root);
  const slab = document.querySelector('#slab');
  const nav = document.querySelector('.nav-slab');
  const panel = document.querySelector('.hero-panel');
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(5,5);
  const localPointer = new THREE.Vector3(1e5,1e5,0);
  const glowPosition = {value:new THREE.Vector3(1e5,1e5,0)};
  const glowStrength = {value:0};
  let W,H,bw,bh,nh,ph,gap,scale,portrait,metrics;
  let pieces=[], textures=[], active=false, hovered=-1, lastBuild=0, lastTime=performance.now();
  let flight=1, targetFlight=window.portfolioProgress||0;
  let textHover=null, disposed=false, headlineDirty=false;
  const baseMaterial = new THREE.MeshPhysicalMaterial({color:0x17171b,roughness:.36,metalness:.12,clearcoat:.7,clearcoatRoughness:.12,specularIntensity:.7,iridescence:.55,iridescenceIOR:1.3,iridescenceThicknessRange:[250,650],envMapIntensity:1});
  function material() {
    const mat=baseMaterial.clone();
    mat.onBeforeCompile = shader => {
      shader.uniforms.uPointer = glowPosition;shader.uniforms.uGlow = glowStrength;
      shader.uniforms.uRadius={value:300*scale};
      shader.vertexShader = 'varying vec3 vGlassWorld;\n'+shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGlassWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      shader.fragmentShader = 'uniform vec3 uPointer; uniform float uGlow; uniform float uRadius; varying vec3 vGlassWorld;\n'+shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat gd = length(vGlassWorld.xy-uPointer.xy)/uRadius;\ntotalEmissiveRadiance += vec3(.42,.37,.62)*.16*exp(-1.6*gd*gd)*uGlow;');
    };
    return mat;
  }
  function rounded(points,radius) {
    const shape = new THREE.Shape();
    points.forEach((p,i)=>{
      const prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];
      const d1=Math.hypot(prev.x-p.x,prev.y-p.y),d2=Math.hypot(next.x-p.x,next.y-p.y);
      const r=Math.min(radius,d1*.18,d2*.18);
      const a={x:p.x+(prev.x-p.x)*r/d1,y:p.y+(prev.y-p.y)*r/d1};
      const b={x:p.x+(next.x-p.x)*r/d2,y:p.y+(next.y-p.y)*r/d2};
      if(i===0) shape.moveTo(a.x,a.y);else shape.lineTo(a.x,a.y);
      shape.quadraticCurveTo(p.x,p.y,b.x,b.y);
    });shape.closePath();return shape;
  }
  function inset(points,d) {
    // Intersect adjacent offset lines, retaining uniform black gaps along oblique cuts.
    const area=points.reduce((sum,p,i)=>sum+p.x*points[(i+1)%points.length].y-p.y*points[(i+1)%points.length].x,0);
    const sign=area>0?1:-1;
    return points.map((p,i)=>{
      const prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];
      const u=new THREE.Vector2(p.x-prev.x,p.y-prev.y).normalize(),v=new THREE.Vector2(next.x-p.x,next.y-p.y).normalize();
      const n1=new THREE.Vector2(-u.y*sign,u.x*sign),n2=new THREE.Vector2(-v.y*sign,v.x*sign);
      const normal=n1.add(n2),den=1+u.dot(v);
      return new THREE.Vector2(p.x+normal.x*d/Math.max(.15,den),p.y+normal.y*d/Math.max(.15,den));
    });
  }
  function paint(element,existingTexture) {
    const rect=element.getBoundingClientRect(), ratio=Math.min(2,Math.max(1.5,devicePixelRatio));
    const canvas=existingTexture ? existingTexture.image : document.createElement('canvas');
    const pixelWidth=Math.ceil(rect.width*ratio),pixelHeight=Math.ceil(rect.height*ratio);
    if(canvas.width!==pixelWidth || canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight}
    const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,rect.width,rect.height);
    // Read the real HTML layout, so texture and accessible hit areas share typography.
    element.querySelectorAll('[data-print]').forEach(el=>{
      if(getComputedStyle(el).display==='none'||!el.getClientRects().length)return;
      const r=el.getBoundingClientRect(),cs=getComputedStyle(el),x=r.left-rect.left,y=r.top-rect.top;
      if(el.closest('.panel-footer.right') && portrait)return;
      if(el.classList.contains('primary')) {
        ctx.fillStyle=textHover===el?'#36d67e':'#dedee2';ctx.beginPath();ctx.roundRect(x,y,r.width,r.height,6);ctx.fill();
      }
      ctx.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.letterSpacing=cs.letterSpacing==='normal'?'0px':cs.letterSpacing;
      ctx.textBaseline='alphabetic';
      let color=cs.color;
      // The live HTML is transparent after enhancement; original colors are cached.
      if(el.dataset.ink) color=el.dataset.ink;else el.dataset.ink=color;
      ctx.fillStyle=color;
      if(el.closest('h1')) { const gradient=ctx.createLinearGradient(0,y,0,y+r.height);gradient.addColorStop(0,'#dcdce0');gradient.addColorStop(1,'#bdbdc3');ctx.fillStyle=gradient; }
      if(textHover===el && !el.classList.contains('primary'))ctx.fillStyle='#e5e1f2';
      // Draw text nodes with Range coordinates to preserve padding, gaps and nested arrows.
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
      let inkEnd=x, node;while((node=walker.nextNode())) {
        if(!node.textContent.trim())continue;
        const range=document.createRange();range.selectNodeContents(node);const tr=range.getBoundingClientRect();
        const parentStyle=getComputedStyle(node.parentElement);
        ctx.font=`${parentStyle.fontWeight} ${parentStyle.fontSize} ${parentStyle.fontFamily}`;
        const fontSize=parseFloat(parentStyle.fontSize);
        ctx.fillText(node.textContent.replace(/\s+/g,' '),tr.left-rect.left,tr.top-rect.top+fontSize*.82);
        inkEnd=tr.right-rect.left;
      }
      if(el.dataset.caret==='true'){const size=parseFloat(cs.fontSize);ctx.fillStyle='#b9abff';ctx.fillRect(inkEnd+size*.08,y+size*.14,Math.max(2,size*.02),size*.74)}
      if(textHover===el && el.classList.contains('text-link')) {ctx.fillRect(x,y+r.height-1,r.width,1);}
    });
    if(element===nav) {
      const m=brandLogo.getBoundingClientRect();if(brandLogo.naturalWidth)ctx.drawImage(brandLogo,m.left-rect.left,m.top-rect.top,m.width,m.height);
    } else {
      const c=element.querySelector('.coordinates').getBoundingClientRect();ctx.fillStyle='#858591';ctx.font='16px "Source Sans Pro", Arial, sans-serif';ctx.fillText('+',c.left-rect.left,c.top-rect.top+13);ctx.fillStyle='#8b9b89';ctx.beginPath();ctx.arc(c.right-rect.left-3,c.top-rect.top+9,2.5,0,Math.PI*2);ctx.fill();
    }
    if(existingTexture){existingTexture.needsUpdate=true;return existingTexture}
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return texture;
  }
  function makePiece(index,texture) {
    const group=new THREE.Group();root.add(group);
    const glass=new THREE.Mesh(new THREE.BufferGeometry(),material());
    const ink=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1}));
    group.add(glass,ink);
    const axis=new THREE.Vector3(Math.sin(index*2.4+.4),Math.cos(index*3.1),.3).normalize();
    return {group,glass,ink,index,axis,z:0,velocity:0,rx:0,ry:0,cx:0,cy:0,baseX:0,baseY:0};
  }
  function geometry(piece,points,textureHeight,isNav) {
    const cx=points.reduce((s,p)=>s+p.x,0)/points.length,cy=points.reduce((s,p)=>s+p.y,0)/points.length;
    piece.cx=cx;piece.cy=cy;
    const pts=inset(points,isNav?1:7*scale).map(p=>new THREE.Vector2(p.x-cx,p.y-cy));
    const shape=rounded(pts,20*scale);
    const geom=new THREE.ExtrudeGeometry(shape,{depth:13*scale,bevelEnabled:true,bevelSize:2.6*scale,bevelThickness:2.6*scale,bevelSegments:3,steps:1,curveSegments:5});
    piece.glass.geometry.dispose();piece.glass.geometry=geom;
    const face=new THREE.ShapeGeometry(shape,5),pos=face.attributes.position,uv=face.attributes.uv;
    for(let i=0;i<pos.count;i++) {
      const x=pos.getX(i)+cx,y=pos.getY(i)+cy;
      uv.setXY(i,(x+bw/2)/bw,isNav?(y-bh/2+nh)/nh:(y+bh/2)/ph);
    }
    piece.ink.geometry.dispose();piece.ink.geometry=face;piece.ink.position.z=16*scale;
  }
  function pattern(t) {
    const points={tl:[0,0],tr:[1,0],bl:[0,1],br:[1,1],a:[.22,0],b:[.515,0],c:[.84,0],d:[.34,1],e:[.865,1],j:[.385,.72],k:[.48,.62],l:[.716,.49]};
    Object.entries(points).forEach(([name,p],i)=>{
      if(name.length===2)return;
      p[0]+=.018*Math.sin(t*.38+i*1.8);
      if('jkl'.includes(name))p[1]+=.035*Math.sin(t*.46+i*2.4);
      let nx=(localPointer.x+bw/2)/bw,ny=(bh/2-nh-gap-localPointer.y)/ph;
      if(portrait){[nx,ny]=[ny,nx]}
      const dx=p[0]-nx,dy=p[1]-ny,d=Math.hypot(dx,dy);
      if(active&&d<.6&&d>.001){const push=.025*(1-d/.6);p[0]+=dx/d*push;if('jkl'.includes(name))p[1]+=dy/d*push;}
    });
    const cells=[['tl','a','j','d','bl'],['a','b','k','j'],['b','c','l','k'],['j','k','l','e','d'],['c','tr','br','e','l']];
    cells.forEach((names,i)=>geometry(pieces[i+1],names.map(n=>{let [x,y]=points[n];if(portrait)[x,y]=[y,x];return new THREE.Vector2((x-.5)*bw,bh/2-nh-gap-y*ph)}),ph,false));
  }
  function resize() {
    slab.style.transform='';
    W=innerWidth;H=innerHeight;portrait=W<=700;
    const slabRect=slab.getBoundingClientRect();metrics={left:slabRect.left,top:slab.offsetTop,width:slabRect.width,height:slabRect.height};bw=metrics.width;bh=metrics.height;nh=nav.getBoundingClientRect().height;ph=panel.getBoundingClientRect().height;gap=bh-nh-ph;scale=Math.max(.45,bw/1730);
    renderer.setSize(W,H);camera.aspect=W/H;camera.position.z=H/2/Math.tan(THREE.MathUtils.degToRad(15));camera.updateProjectionMatrix();
    root.position.set(metrics.left+bw/2-W/2,H/2-metrics.top-bh/2,0);
    pieces.forEach(p=>{root.remove(p.group);p.glass.geometry.dispose();p.ink.geometry.dispose();p.glass.material.dispose();p.ink.material.dispose()});textures.forEach(t=>t.dispose());
    textures=[paint(nav),paint(panel)];pieces=[makePiece(0,textures[0]),...Array.from({length:5},(_,i)=>makePiece(i+1,textures[1]))];
    geometry(pieces[0],[[-bw/2,bh/2],[bw/2,bh/2],[bw/2,bh/2-nh],[-bw/2,bh/2-nh]].map(([x,y])=>new THREE.Vector2(x,y)),nh,true);
    pattern(performance.now()/1000);
  }
  function repaint() {
    if (!pieces.length || document.querySelector('#home').offsetWidth === 0) return;
    const next=[paint(nav),paint(panel)];pieces.forEach(p=>{p.ink.material.map=next[p.index===0?0:1]});textures.forEach(t=>t.dispose());textures=next;
  }
  // Exact plane-to-screen projective mapping for the selectable DOM hit layer.
  function mapHTML() {
    root.updateMatrixWorld();
    const corners=[[-bw/2,bh/2],[bw/2,bh/2],[bw/2,-bh/2],[-bw/2,-bh/2]].map(([x,y])=>{
      const v=root.localToWorld(new THREE.Vector3(x,y,16*scale)).project(camera);return [(v.x+1)*W/2-metrics.left,(1-v.y)*H/2-metrics.top];
    });
    const src=[[0,0],[bw,0],[bw,bh],[0,bh]],A=[],B=[];
    for(let i=0;i<4;i++){const [x,y]=src[i],[u,v]=corners[i];A.push([x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]);B.push(u,v)}
    for(let i=0;i<8;i++){let pivot=i;for(let j=i+1;j<8;j++)if(Math.abs(A[j][i])>Math.abs(A[pivot][i]))pivot=j;[A[i],A[pivot]]=[A[pivot],A[i]];[B[i],B[pivot]]=[B[pivot],B[i]];const d=A[i][i];for(let k=i;k<8;k++)A[i][k]/=d;B[i]/=d;for(let j=0;j<8;j++)if(j!==i){const f=A[j][i];for(let k=i;k<8;k++)A[j][k]-=f*A[i][k];B[j]-=f*B[i]}}
    const [a,b,c,d,e,f,g,h]=B;slab.style.transform=`matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,1)`;
  }
  window.addEventListener('pointermove',e=>{pointer.set(e.clientX/W*2-1,1-e.clientY/H*2);active=true;const link=e.target.closest('a[data-print]');if(link!==textHover){textHover=link;slab.style.transform='';repaint();}});
  document.documentElement.addEventListener('pointerleave',()=>{active=false;hovered=-1;pointer.set(5,5);if(textHover){textHover=null;slab.style.transform='';repaint()}});
  window.addEventListener('blur',()=>{active=false;hovered=-1});
  window.addEventListener('resize',resize);
  window.addEventListener('hero-type',()=>{headlineDirty=true});
  window.addEventListener('portfolio-scroll',e=>{targetFlight=e.detail.progress;if(targetFlight>.015){active=false;hovered=-1}});
  resize();document.body.classList.add('webgl-ready');window.glassReady=true;
  function frame(now) {
    if(disposed)return;
    const dt=Math.min(.035,(now-lastTime)/1000);lastTime=now;const t=now/1000;
    flight=THREE.MathUtils.damp(flight,targetFlight,7,dt);
    if(Math.abs(flight-targetFlight)<.001)flight=targetFlight;
    const visible=flight<1 || targetFlight===0;
    root.visible=visible;
    renderer.domElement.style.opacity=Math.max(0,Math.min(1,(1-flight)/.22));
    if(visible) {
      root.rotation.y=THREE.MathUtils.damp(root.rotation.y,active?pointer.x*.122-.021:-.021,3.3,dt);
      root.rotation.x=THREE.MathUtils.damp(root.rotation.x,active?pointer.y*.096+.014:.014,3.3,dt);
      scene.updateMatrixWorld();
      raycaster.setFromCamera(pointer,camera);
      const hits=active&&targetFlight<.015?raycaster.intersectObjects(pieces.map(p=>p.glass)):[];
      hovered=hits.length?pieces.findIndex(p=>p.glass===hits[0].object):-1;
      if(hits.length){glowPosition.value.copy(hits[0].point);localPointer.copy(hits[0].point);root.worldToLocal(localPointer)}
      glowStrength.value=THREE.MathUtils.damp(glowStrength.value,hovered>=0?1:0,7,dt);
      if(now-lastBuild>1000/45 && flight<.05){pattern(t);lastBuild=now}
      pieces.forEach((p,i)=>{
        const over=i===hovered&&flight<.05,target=over?(i===0?32:50)*scale:0;
        p.velocity+=(170*(target-p.z)-19*p.velocity)*dt;p.z+=p.velocity*dt;
        const rx=over?THREE.MathUtils.clamp((localPointer.y-p.cy)/ph,-.24,.24):0;
        const ry=over?THREE.MathUtils.clamp(-(localPointer.x-p.cx)/bw,-.24,.24):0;
        p.rx=THREE.MathUtils.damp(p.rx,rx,9,dt);p.ry=THREE.MathUtils.damp(p.ry,ry,9,dt);
        // Each textured face travels with its extruded shard during the transition.
        const f=THREE.MathUtils.clamp((flight-i*.025)/.875,0,1),ease=f*f*f;
        const outward=p.cx>=0?1:-1;
        p.group.position.set(p.cx+ease*(p.cx*.9+outward*200*scale),p.cy-ease*(300*scale+Math.abs(p.cy)*1.2),p.z+ease*(500+i*57)*scale);
        p.group.rotation.set(p.rx+ease*p.axis.x*(2+i*.25),p.ry+ease*p.axis.y*2.8,ease*p.axis.z*3);
        p.glass.material.iridescence=THREE.MathUtils.damp(p.glass.material.iridescence,over?1:.55,8,dt);
        p.glass.material.envMapIntensity=THREE.MathUtils.damp(p.glass.material.envMapIntensity,over?1.9:1,8,dt);
      });
      if(headlineDirty && flight<.02 && targetFlight<.015){slab.style.transform='';paint(panel,textures[1]);headlineDirty=false}
      if(flight<.01)mapHTML();
    }
    renderer.render(scene,camera);requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  motion.addEventListener('change',()=>location.reload(),{once:true});
  window.addEventListener('pagehide',()=>{disposed=true;renderer.dispose();environment.dispose()},{once:true});
}
