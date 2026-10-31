import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// The HTML remains the complete, usable fallback if motion or WebGL is unavailable.
const motion = matchMedia('(prefers-reduced-motion: reduce)');
if (!motion.matches) start().catch(error => {
  document.body.classList.remove('webgl-ready');
  document.querySelector('.glass-headlines')?.remove();
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
  const brandPaths=[...brandLogo.querySelectorAll('path')].map(path=>new Path2D(path.getAttribute('d')));
  let lightTheme=document.documentElement.dataset.theme==='light';
  let introReady=false;
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
  const headline=panel.querySelector('.code-headline');
  const headlineOverlay=document.createElement('div');
  headlineOverlay.className='glass-headlines';headlineOverlay.setAttribute('aria-hidden','true');
  document.body.append(headlineOverlay);
  let headlineMarkup='';

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(5,5);
  const localPointer = new THREE.Vector3(1e5,1e5,0);
  const glowPosition = {value:new THREE.Vector3(1e5,1e5,0)};
  const glowStrength = {value:0};
  let W,H,bw,bh,nh,ph,gap,scale,portrait,metrics,mobileContentBottom=0,mobileFooterCut=.9;
  let pieces=[], textures=[], active=false, hovered=-1, lastBuild=0, lastTime=performance.now();
  let flight=1, targetFlight=window.portfolioProgress||0;
  let textHover=null, focusLink=null, disposed=false, headlineDirty=false;
  let navInkDirty=false,panelInkDirty=false,pointerClient=null,linkTargets=[];
  const navHighlight={x:0,y:0,w:0,h:0,opacity:0};
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
    if(element===nav && navHighlight.opacity>.002){
      const {x,y,w,h,opacity}=navHighlight,corner=6;
      ctx.save();ctx.globalAlpha=opacity;
      ctx.beginPath();ctx.moveTo(x+corner,y);ctx.lineTo(x+w-corner,y);ctx.lineTo(x+w,y+corner);ctx.lineTo(x+w,y+h-corner);ctx.lineTo(x+w-corner,y+h);ctx.lineTo(x+corner,y+h);ctx.lineTo(x,y+h-corner);ctx.lineTo(x,y+corner);ctx.closePath();
      ctx.fillStyle=lightTheme?'rgba(101,82,145,.09)':'rgba(185,171,255,.10)';ctx.fill();
      ctx.strokeStyle=lightTheme?'rgba(101,82,145,.35)':'rgba(185,171,255,.42)';ctx.lineWidth=1;ctx.stroke();
      ctx.strokeStyle=lightTheme?'#75609e':'#c5baff';ctx.beginPath();ctx.moveTo(x+9,y+h-1);ctx.lineTo(x+w-9,y+h-1);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x+w-7,y+4);ctx.lineTo(x+w-7,y+10);ctx.moveTo(x+w-10,y+7);ctx.lineTo(x+w-4,y+7);ctx.stroke();ctx.restore();
    }
    // Read the real HTML layout, so texture and accessible hit areas share typography.
    element.querySelectorAll('[data-print]').forEach(el=>{
      if(el.closest('.code-headline'))return;
      if(getComputedStyle(el).display==='none'||!el.getClientRects().length||el.closest('.coordinates'))return;
      const r=el.getBoundingClientRect(),cs=getComputedStyle(el),x=r.left-rect.left,y=r.top-rect.top;
      if(el.classList.contains('primary')) {
        ctx.fillStyle=textHover===el?(lightTheme?'#28664f':'#36d67e'):(lightTheme?'#252d31':'#dedee2');ctx.beginPath();ctx.roundRect(x,y,r.width,r.height,6);ctx.fill();
      }
      ctx.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.letterSpacing=cs.letterSpacing==='normal'?'0px':cs.letterSpacing;
      ctx.textBaseline='alphabetic';
      ctx.globalAlpha=parseFloat(cs.opacity);
      let color=cs.color;
      // Link color transitions can still be transparent while theme ink is measured.
      // The navigation group owns the stable theme color; hover ink is drawn below.
      const navLinks=el.closest('.nav-links');
      if(navLinks){color=getComputedStyle(navLinks).color;el.dataset.ink=color}
      else if(el.dataset.ink)color=el.dataset.ink;
      else el.dataset.ink=color;
      ctx.fillStyle=color;
      if((textHover===el||focusLink===el) && !el.classList.contains('primary'))ctx.fillStyle=lightTheme?'#493b77':'#e5e1f2';
      if(el.classList.contains('panel-footer')){
        // Follow the actual HTML line wraps instead of drawing one overflowing line.
        const words=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
        let textNode;
        while((textNode=words.nextNode())){
          let line='',lineX=0,lineY=0;
          const flush=()=>{if(line)ctx.fillText(line,lineX,lineY+parseFloat(cs.fontSize)*.82)};
          for(const word of textNode.textContent.matchAll(/\S+/g)){
            const range=document.createRange();range.setStart(textNode,word.index);range.setEnd(textNode,word.index+word[0].length);
            const position=range.getBoundingClientRect(),top=position.top-rect.top;
            if(line && Math.abs(top-lineY)>1){flush();line=''}
            if(!line){lineX=position.left-rect.left;lineY=top;line=word[0]}
            else line+=' '+word[0];
          }
          flush();
        }
        return;
      }
      // Draw text nodes with Range coordinates to preserve padding, gaps and nested arrows.
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
      let inkEnd=x+(parseFloat(cs.paddingLeft)||0), node;while((node=walker.nextNode())) {
        if(!node.textContent.length || (!node.textContent.trim() && !el.classList.contains('type-line')))continue;
        const range=document.createRange();range.selectNodeContents(node);const tr=range.getBoundingClientRect();
        const parentStyle=getComputedStyle(node.parentElement);
        ctx.font=`${parentStyle.fontWeight} ${parentStyle.fontSize} ${parentStyle.fontFamily}`;
        const fontSize=parseFloat(parentStyle.fontSize);
        let baseline=tr.top-rect.top+fontSize*.82;
        if(node.parentElement.dataset.syntaxKey){
          // Read palette values from the root, independently of transparent WebGL DOM ink.
          const key=node.parentElement.dataset.syntaxKey;
          const palette=getComputedStyle(document.documentElement);
          ctx.fillStyle=palette.getPropertyValue(`--syntax-${key}`).trim() || (lightTheme?'#000000':'#d4d4d4');
        }
        ctx.fillText(el.classList.contains('type-line') ? node.textContent : node.textContent.replace(/\s+/g,' '),tr.left-rect.left,baseline);
        inkEnd=tr.right-rect.left;
      }
      if(el.dataset.caret==='true'){const size=parseFloat(cs.fontSize);ctx.fillStyle=lightTheme?'#353b42':el.closest('.code-headline')?'#aeafad':'#b9abff';ctx.fillRect(inkEnd+size*.08,y+size*.14,Math.max(2,size*.02),size*.74)}
      if(focusLink===el && el.classList.contains('primary')){ctx.strokeStyle=lightTheme?'#655291':'#b9abff';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x-4,y-4,r.width+8,r.height+8,9);ctx.stroke()}
      if((textHover===el||focusLink===el) && el.classList.contains('text-link')) {ctx.fillRect(x,y+r.height-1,r.width,1);}
    });
    ctx.globalAlpha=1;
    if(element===nav) {
      const m=brandLogo.getBoundingClientRect(),box=brandLogo.viewBox.baseVal;
      ctx.save();ctx.translate(m.left-rect.left,m.top-rect.top);ctx.scale(m.width/box.width,m.height/box.height);ctx.translate(-box.x,-box.y);
      ctx.fillStyle=getComputedStyle(brandLogo).color;brandPaths.forEach(path=>ctx.fill(path));ctx.restore();

    } else {
      const coordinates=element.querySelector('.coordinates'),c=coordinates.getBoundingClientRect(),style=getComputedStyle(coordinates);
      const label=coordinates.querySelector('[data-print]'),labelRect=label.getBoundingClientRect();
      const cross=coordinates.querySelector('.tiny-cross').getBoundingClientRect(),dot=coordinates.querySelector('.location-dot').getBoundingClientRect();
      const centerY=c.top-rect.top+c.height/2;
      ctx.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      ctx.letterSpacing=style.letterSpacing==='normal'?'0px':style.letterSpacing;
      const ink=ctx.measureText(label.textContent);
      ctx.fillStyle=style.color;
      ctx.fillText(label.textContent,labelRect.left-rect.left,centerY+(ink.actualBoundingBoxAscent-ink.actualBoundingBoxDescent)/2);
      const crossX=cross.left-rect.left+cross.width/2;
      ctx.strokeStyle=style.color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(crossX-4,centerY);ctx.lineTo(crossX+4,centerY);ctx.moveTo(crossX,centerY-4);ctx.lineTo(crossX,centerY+4);ctx.stroke();
      ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--location-dot').trim();
      ctx.beginPath();ctx.arc(dot.left-rect.left+dot.width/2,centerY,dot.width/2,0,Math.PI*2);ctx.fill();
    }
    if(existingTexture){existingTexture.needsUpdate=true;return existingTexture}
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return texture;
  }
  function makePiece(index,texture) {
    const group=new THREE.Group();root.add(group);
    const glass=new THREE.Mesh(new THREE.BufferGeometry(),material());
    const ink=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1}));
    group.add(glass,ink);ink.userData.pieceIndex=index;
    let headlineLayer=null;
    if(index>0){
      headlineLayer=document.createElement('div');headlineLayer.className='glass-headline-layer';
      const copy=headline.cloneNode(true);copy.removeAttribute('aria-label');
      const cs=getComputedStyle(headline);
      Object.assign(copy.style,{position:'absolute',left:`${headline.offsetLeft}px`,top:`${headline.offsetTop}px`,margin:'0',width:`${headline.offsetWidth}px`,fontSize:cs.fontSize,lineHeight:cs.lineHeight,letterSpacing:cs.letterSpacing});
      headlineLayer.append(copy);headlineOverlay.append(headlineLayer);
      Object.assign(headlineLayer.style,{width:`${bw}px`,height:`${ph}px`});
    }
    const axis=new THREE.Vector3(Math.sin(index*2.4+.4),Math.cos(index*3.1),.3).normalize();
    return {group,glass,ink,index,axis,headlineLayer,z:0,velocity:0,rx:0,ry:0,cx:0,cy:0,baseX:0,baseY:0};
  }
  function geometry(piece,points,textureHeight,isNav) {
    const cx=points.reduce((s,p)=>s+p.x,0)/points.length,cy=points.reduce((s,p)=>s+p.y,0)/points.length;
    piece.cx=cx;piece.cy=cy;
    const pts=inset(points,isNav?1:7*scale).map(p=>new THREE.Vector2(p.x-cx,p.y-cy));
    const shape=rounded(pts,20*scale);
    if(piece.headlineLayer){
      const top=bh/2-nh-gap;
      piece.headlineLayer.style.clipPath=`polygon(${shape.getPoints(5).map(p=>`${p.x+cx+bw/2}px ${top-p.y-cy}px`).join(',')})`;
    }
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
    if(portrait){
      // Reserve the lower face for the wrapped quote, clear of the cut lines.
      const footer=Math.min(.92,Math.max(.72,mobileFooterCut));
      const cut=Math.min(footer-.12,Math.max(.47,mobileContentBottom/ph));
      const band=footer-cut;
      const points={tl:[0,0],tr:[1,0],l:[0,cut],r:[1,Math.max(.28,cut-.16)],m:[.57,cut+.035],j:[.30+Math.sin(t*.4)*.008,cut+band*.70],n:[.76+Math.sin(t*.35+2)*.008,cut+band*.30],k:[.72,footer],fl:[0,footer],fr:[1,footer],bl:[0,1],br:[1,1]};
      const cells=[['tl','tr','r','m','l'],['l','m','j','fl'],['m','r','n','j'],['fl','j','k','fr','br','bl'],['r','fr','k','j','n']];
      cells.forEach((names,i)=>geometry(pieces[i+1],names.map(n=>new THREE.Vector2((points[n][0]-.5)*bw,bh/2-nh-gap-points[n][1]*ph)),ph,false));
      return;
    }
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
    const actions=panel.querySelector('.hero-actions'),location=panel.querySelector('.coordinates'),footer=panel.querySelector('.panel-footer.right');mobileContentBottom=Math.max(actions.offsetTop+actions.offsetHeight,location.offsetTop+location.offsetHeight)+26;
    mobileFooterCut=(footer.offsetTop-12)/ph;
    renderer.setSize(W,H);camera.aspect=W/H;camera.position.z=H/2/Math.tan(THREE.MathUtils.degToRad(15));camera.updateProjectionMatrix();
    root.position.set(metrics.left+bw/2-W/2,H/2-metrics.top-bh/2,0);
    pieces.forEach(p=>{p.headlineLayer?.remove();root.remove(p.group);p.glass.geometry.dispose();p.ink.geometry.dispose();p.glass.material.dispose();p.ink.material.dispose()});textures.forEach(t=>t.dispose());
    cacheLinkTargets();
    textures=[paint(nav),paint(panel)];pieces=[makePiece(0,textures[0]),...Array.from({length:5},(_,i)=>makePiece(i+1,textures[1]))];
    geometry(pieces[0],[[-bw/2,bh/2],[bw/2,bh/2],[bw/2,bh/2-nh],[-bw/2,bh/2-nh]].map(([x,y])=>new THREE.Vector2(x,y)),nh,true);
    pattern(performance.now()/1000);
  }
  function repaint() {
    if (!pieces.length || document.querySelector('#home').offsetWidth === 0) return;
    slab.style.transform='';cacheLinkTargets();paint(nav,textures[0]);paint(panel,textures[1]);
  }
  function applyTheme(){
    lightTheme=document.documentElement.dataset.theme==='light';
    renderer.setClearColor(lightTheme?0xf4f3ee:0x050507);
    renderer.toneMappingExposure=lightTheme?1.05:1.1;
    scene.environmentIntensity=lightTheme?.65:.42;
    key.color.set(lightTheme?0xfffaf0:0xdde5ff);key.intensity=lightTheme?3:2.4;
    fill.color.set(lightTheme?0xdce5ed:0xaaa0bf);fill.intensity=lightTheme?.65:.35;
    const update=mat=>{
      mat.color.set(lightTheme?0xdde2df:0x17171b);
      mat.roughness=lightTheme?.3:.36;mat.metalness=lightTheme?.025:.12;
      mat.iridescence=lightTheme?.18:.55;
    };
    update(baseMaterial);pieces.forEach(p=>update(p.glass.material));
    // Re-read opaque HTML colors before refreshing the printed text textures.
    const enhanced=document.body.classList.contains('webgl-ready');
    document.body.classList.remove('webgl-ready');slab.style.transform='';
    slab.querySelectorAll('[data-ink]').forEach(el=>delete el.dataset.ink);
    repaint();
    if(enhanced)document.body.classList.add('webgl-ready');
    headlineDirty=true;panelInkDirty=true;navInkDirty=true;
  }
  // Exact plane-to-screen projective mapping for the selectable DOM hit layer.
  function mapHTML() {
    root.updateMatrixWorld();
    const corners=[[-bw/2,bh/2],[bw/2,bh/2],[bw/2,-bh/2],[-bw/2,-bh/2]].map(([x,y])=>{
      const v=root.localToWorld(new THREE.Vector3(x,y,16*scale)).project(camera);return [(v.x+1)*W/2-metrics.left,(1-v.y)*H/2-metrics.top];
    });
    slab.style.transform=projectPlane(bw,bh,corners);
  }
  function projectPlane(width,height,corners){
    const src=[[0,0],[width,0],[width,height],[0,height]],A=[],B=[];
    for(let i=0;i<4;i++){const [x,y]=src[i],[u,v]=corners[i];A.push([x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]);B.push(u,v)}
    for(let i=0;i<8;i++){let pivot=i;for(let j=i+1;j<8;j++)if(Math.abs(A[j][i])>Math.abs(A[pivot][i]))pivot=j;[A[i],A[pivot]]=[A[pivot],A[i]];[B[i],B[pivot]]=[B[pivot],B[i]];const d=A[i][i];for(let k=i;k<8;k++)A[i][k]/=d;B[i]/=d;for(let j=0;j<8;j++)if(j!==i){const f=A[j][i];for(let k=i;k<8;k++)A[j][k]-=f*A[i][k];B[j]-=f*B[i]}}
    const [a,b,c,d,e,f,g,h]=B;return `matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,1)`;
  }
  function mapHeadlines(){
    root.updateMatrixWorld(true);
    const markup=headline.innerHTML,changed=markup!==headlineMarkup;headlineMarkup=markup;
    const top=bh/2-nh-gap;
    for(const piece of pieces){
      if(!piece.headlineLayer)continue;
      if(changed)piece.headlineLayer.firstElementChild.innerHTML=markup;
      const corners=[[-bw/2,top],[bw/2,top],[bw/2,top-ph],[-bw/2,top-ph]].map(([x,y])=>{
        const v=piece.group.localToWorld(new THREE.Vector3(x-piece.cx,y-piece.cy,16*scale)).project(camera);
        return [(v.x+1)*W/2,(1-v.y)*H/2];
      });
      piece.headlineLayer.style.transform=projectPlane(bw,ph,corners);
      piece.headlineLayer.style.zIndex=String(Math.round(piece.group.position.z));
    }
  }

  function cacheLinkTargets(){
    linkTargets=[];
    for(const [layer,element] of [['nav',nav],['panel',panel]]){
      const origin=element.getBoundingClientRect();
      element.querySelectorAll('a[href]').forEach(link=>{
        if(!link.getClientRects().length || getComputedStyle(link).display==='none')return;
        const r=link.getBoundingClientRect();
        linkTargets.push({link,layer,x:r.left-origin.left,y:r.top-origin.top,w:r.width,h:r.height});
      });
    }
  }
  function linkAt(clientX,clientY){
    if(flight>.05 || targetFlight>.015 || !root.visible)return null;
    root.updateMatrixWorld(true);camera.updateMatrixWorld();
    raycaster.setFromCamera(new THREE.Vector2(clientX/W*2-1,1-clientY/H*2),camera);
    const hit=raycaster.intersectObjects(pieces.map(piece=>piece.ink))[0];
    if(!hit?.uv)return null;
    const layer=hit.object.userData.pieceIndex===0?'nav':'panel';
    const x=hit.uv.x*bw,y=(1-hit.uv.y)*(layer==='nav'?nh:ph);
    const candidates=linkTargets.filter(target=>{
      if(target.layer!==layer)return false;
      const pad=layer==='nav'?(portrait?3:10):target.link.classList.contains('primary')?0:4;
      return x>=target.x-pad && x<=target.x+target.w+pad && y>=target.y-8 && y<=target.y+target.h+8;
    });
    candidates.sort((a,b)=>Math.hypot(x-a.x-a.w/2,y-a.y-a.h/2)-Math.hypot(x-b.x-b.w/2,y-b.y-b.h/2));
    return {hit,link:candidates[0]?.link||null};
  }
  function setHover(link){
    if(link===textHover)return;
    textHover=link;navInkDirty=true;panelInkDirty=true;
  }
  function updateNavHighlight(dt){
    const target=linkTargets.find(item=>item.layer==='nav' && item.link.closest('.nav-links') && item.link===(textHover||focusLink));
    if(target && navHighlight.opacity<.005){navHighlight.x=target.x-11;navHighlight.y=target.y-8;navHighlight.w=target.w+22;navHighlight.h=target.h+16}
    const next=target?{x:target.x-11,y:target.y-8,w:target.w+22,h:target.h+16,opacity:1}:{...navHighlight,opacity:0};
    for(const key of ['x','y','w','h','opacity']){
      const previous=navHighlight[key];
      navHighlight[key]=THREE.MathUtils.damp(previous,next[key],13,dt);
      if(Math.abs(navHighlight[key]-next[key])<.0005)navHighlight[key]=next[key];
      if(Math.abs(previous-navHighlight[key])>.0001)navInkDirty=true;
    }
  }
  window.addEventListener('pointermove',event=>{
    pointer.set(event.clientX/W*2-1,1-event.clientY/H*2);active=true;
    pointerClient={x:event.clientX,y:event.clientY};
  });
  function clearPointer(){active=false;hovered=-1;pointerClient=null;pointer.set(5,5);setHover(null);document.documentElement.style.cursor=''}
  document.documentElement.addEventListener('pointerleave',clearPointer);
  window.addEventListener('blur',clearPointer);
  document.addEventListener('focusin',event=>{
    const link=event.target.closest('a[href]');
    focusLink=link&&slab.contains(link)?link:null;navInkDirty=true;panelInkDirty=true;
  });
  document.addEventListener('focusout',()=>{focusLink=null;navInkDirty=true;panelInkDirty=true});
  // Capture trusted pointer clicks before an offset HTML link can activate.
  // Keyboard activation and forwarded clicks still use the real accessible anchors.
  function activatePrintedLink(event){
    if(!event.isTrusted || event.detail===0 || (event.button!==0 && event.button!==1) || flight>.05 || targetFlight>.015)return;
    const control=event.target.closest('a,button,input,textarea,select');
    if(control && !slab.contains(control))return;
    const result=linkAt(event.clientX,event.clientY);
    if(!result && !slab.contains(event.target))return;
    event.preventDefault();event.stopImmediatePropagation();
    if(!result?.link)return;
    if(event.metaKey || event.ctrlKey || event.shiftKey || event.button===1)window.open(result.link.href,'_blank','noopener');
    else result.link.click();
  }
  window.addEventListener('click',activatePrintedLink,true);
  window.addEventListener('auxclick',activatePrintedLink,true);
  window.addEventListener('resize',resize);

  window.addEventListener('portfolio-theme',applyTheme);
  window.addEventListener('portfolio-scroll',e=>{targetFlight=e.detail.progress;if(targetFlight>.015){active=false;hovered=-1;setHover(null);document.documentElement.style.cursor=''}});
  applyTheme();resize();document.body.classList.add('webgl-ready');window.glassReady=true;
  function frame(now) {
    if(disposed)return;
    const dt=Math.min(.035,(now-lastTime)/1000);lastTime=now;const t=now/1000;
    flight=THREE.MathUtils.damp(flight,targetFlight,7,dt);
    if(Math.abs(flight-targetFlight)<.001)flight=targetFlight;
    const visible=flight<1 || targetFlight===0;
    root.visible=visible;
    renderer.domElement.style.opacity=Math.max(0,Math.min(1,(1-flight)/.22));
    headlineOverlay.style.opacity=renderer.domElement.style.opacity;
    headlineOverlay.style.display=visible?'':'none';
    if(visible) {
      root.rotation.y=THREE.MathUtils.damp(root.rotation.y,active&&!portrait?pointer.x*.122-.021:-.021,3.3,dt);
      root.rotation.x=THREE.MathUtils.damp(root.rotation.x,active&&!portrait?pointer.y*.096+.014:.014,3.3,dt);
      scene.updateMatrixWorld();
      raycaster.setFromCamera(pointer,camera);
      const hits=active&&!portrait&&targetFlight<.015?raycaster.intersectObjects(pieces.map(p=>p.glass)):[];
      hovered=hits.length?pieces.findIndex(p=>p.glass===hits[0].object):-1;
      if(hits.length){glowPosition.value.copy(hits[0].point);localPointer.copy(hits[0].point);root.worldToLocal(localPointer)}
      glowStrength.value=THREE.MathUtils.damp(glowStrength.value,hovered>=0&&!textHover?.classList.contains('brand')?1:0,7,dt);
      if(now-lastBuild>1000/45 && flight<.05){pattern(t);lastBuild=now}
      pieces.forEach((p,i)=>{
        const over=i===hovered&&flight<.05&&!(i===0&&textHover?.classList.contains('brand')),target=over?(i===0?32:50)*scale:0;
        p.velocity+=(170*(target-p.z)-19*p.velocity)*dt;p.z+=p.velocity*dt;
        const rx=over?THREE.MathUtils.clamp((localPointer.y-p.cy)/ph,-.24,.24):0;
        const ry=over?THREE.MathUtils.clamp(-(localPointer.x-p.cx)/bw,-.24,.24):0;
        p.rx=THREE.MathUtils.damp(p.rx,rx,9,dt);p.ry=THREE.MathUtils.damp(p.ry,ry,9,dt);
        // Each textured face travels with its extruded shard during the transition.
        const f=THREE.MathUtils.clamp((flight-i*.025)/.875,0,1),ease=f*f*f;
        const outward=p.cx>=0?1:-1;
        p.group.position.set(p.cx+ease*(p.cx*.9+outward*200*scale),p.cy-ease*(300*scale+Math.abs(p.cy)*1.2),p.z+ease*(500+i*57)*scale);
        p.group.rotation.set(p.rx+ease*p.axis.x*(2+i*.25),p.ry+ease*p.axis.y*2.8,ease*p.axis.z*3);
        p.glass.material.iridescence=THREE.MathUtils.damp(p.glass.material.iridescence,over?(lightTheme?.55:1):(lightTheme?.18:.55),8,dt);
        p.glass.material.envMapIntensity=THREE.MathUtils.damp(p.glass.material.envMapIntensity,over?(lightTheme?1.5:1.9):1,8,dt);
      });
      mapHeadlines();
      const printed=pointerClient?linkAt(pointerClient.x,pointerClient.y):null;
      setHover(printed?.link||null);
      document.documentElement.style.cursor=printed?.link?'pointer':'';
      updateNavHighlight(dt);
      if((headlineDirty||panelInkDirty||navInkDirty) && flight<.02 && targetFlight<.015){
        slab.style.transform='';
        if(navInkDirty)paint(nav,textures[0]);
        if(headlineDirty||panelInkDirty)paint(panel,textures[1]);
        headlineDirty=false;panelInkDirty=false;navInkDirty=false;
      }
      if(flight<.01){mapHTML();if(!introReady){introReady=true;window.dispatchEvent(new Event('hero-render-ready'))}}
    }
    renderer.render(scene,camera);requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  motion.addEventListener('change',()=>location.reload(),{once:true});
  window.addEventListener('pagehide',()=>{disposed=true;headlineOverlay.remove();document.documentElement.style.cursor='';renderer.dispose();environment.dispose()},{once:true});
}
