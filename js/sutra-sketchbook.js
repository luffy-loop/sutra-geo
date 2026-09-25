
(() => {
  const intro = document.getElementById('sutraBookIntro');
  if (!intro) return;

  const svgPage = (title, place, symbol, accent) => {
    const safe = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1760" height="1240" viewBox="0 0 1760 1240">' +
      '<rect width="1760" height="1240" fill="#f4ecdb"/>' +
      '<rect x="42" y="42" width="1676" height="1156" rx="8" fill="none" stroke="' + accent + '" stroke-opacity=".22" stroke-width="3"/>' +
      '<circle cx="880" cy="540" r="300" fill="none" stroke="' + accent + '" stroke-opacity=".13" stroke-width="2"/>' +
      '<circle cx="880" cy="540" r="220" fill="none" stroke="' + accent + '" stroke-opacity=".1" stroke-width="10"/>' +
      '<path d="M880 210v660M550 540h660" stroke="' + accent + '" stroke-opacity=".08" stroke-width="2"/>' +
      '<text x="880" y="485" text-anchor="middle" font-size="170" fill="' + accent + '" opacity=".52">' + safe(symbol) + '</text>' +
      '<text x="880" y="690" text-anchor="middle" font-family="Georgia,serif" font-size="66" fill="#2b2721">' + safe(title) + '</text>' +
      '<text x="880" y="750" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" letter-spacing="8" fill="#776d61">' + safe(place).toUpperCase() + '</text>' +
      '<path d="M620 835h520" stroke="' + accent + '" stroke-opacity=".35"/>' +
      '<text x="880" y="900" text-anchor="middle" font-family="Georgia,serif" font-size="25" fill="#776d61">A page from my India journey</text>' +
      '<text x="880" y="1130" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" letter-spacing="5" fill="#9a6a3e">SUTRA-GEO · LIVING HERITAGE</text></svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  const PAGES = [
    {title:'SUTRA-GEO', place:'India · Living Heritage', file:svgPage('भारत','SUTRA-GEO Heritage Scrapbook','✦','#9a6a3e')},
    {title:'Charminar', place:'Hyderabad · Telangana', file:'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=85'},
    {title:'Amber Fort', place:'Jaipur · Rajasthan', file:'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=85'},
    {title:'Hampi', place:'Vijayanagara · Karnataka', file:'https://images.unsplash.com/photo-1600112356915-089abb8fc71a?auto=format&fit=crop&w=1600&q=85'},
    {title:'Sun Temple, Konark', place:'Konark · Odisha', file:'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85'},
    {title:'Kutch Craft Trail', place:'Kutch · Gujarat', file:'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1600&q=85'},
    {title:'Taj Mahal', place:'Agra · Uttar Pradesh', file:svgPage('Taj Mahal','Agra · Uttar Pradesh','☾','#a74e35')},
    {title:'Red Fort', place:'Delhi · India', file:svgPage('Red Fort','Old Delhi · India','◆','#8b542d')},
    {title:'Golden Temple', place:'Amritsar · Punjab', file:svgPage('Golden Temple','Amritsar · Punjab','✺','#b78b43')}
  ];

  const book=document.getElementById('sutraBook'),stage=document.getElementById('sutraBookStage'),book3d=document.getElementById('sutraBook3d');
  const caption=document.getElementById('sutraBookCaption'),index=document.getElementById('sutraBookIndex'),introOpen=document.getElementById('sutraOpenBook');
  const skip=document.getElementById('sutraBookSkip'),left=document.getElementById('sutraBookPrev'),right=document.getElementById('sutraBookNext');
  const loupe=document.getElementById('sutraLoupe'),loupeZoom=document.getElementById('sutraLoupeZoom'),loupeBtn=document.getElementById('sutraLoupeBtn');
  const zoomInBtn=document.getElementById('sutraZoomIn'),zoomOutBtn=document.getElementById('sutraZoomOut'),zoomRead=document.getElementById('sutraZoomRead');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,M=PAGES.length,N=18;
  let idx=0,turn=null,strips=[],spring=null,raf=null,last=0,drag=null,lx=null,ly=null,lgrab=null,loupeOn=true,lTarget=null;
  const view={rx:2.5,ry:-4,z:1,trx:2.5,try_:-4,tz:1};let viewActive=false;

  function el(t,c){const e=document.createElement(t);if(c)e.className=c;return e}
  function half(pos,i){
    const d=el('div','sutra-book-half '+pos),im=new Image();im.src=PAGES[i].file;im.alt=PAGES[i].title;im.draggable=false;
    d.appendChild(im);d.appendChild(el('div','sutra-book-gutter '+pos));return d;
  }
  function buildCurl(dir,from,to){
    strips=[];const c=el('div','sutra-curl '+dir);c.style.setProperty('--n',N);let host=c;
    for(let i=0;i<N;i++){
      const s=el('div','sutra-strip'),f=el('div','sutra-face front'),b=el('div','sutra-face back');
      const sw='calc(var(--bw) * .449 / '+N+')',gut='calc(var(--bw) * .5)',A='calc(-1 * ('+gut+' + '+i+' * '+sw+'))',B='calc('+(i+1)+' * '+sw+' - '+gut+')';
      f.style.backgroundImage='url("' + PAGES[from].file + '")';b.style.backgroundImage='url("' + PAGES[to].file + '")';
      f.style.backgroundPositionX=dir==='next'?A:B;b.style.backgroundPositionX=dir==='next'?B:A;
      s.appendChild(f);s.appendChild(b);host.appendChild(s);host=s;strips.push(s);
    }
    return c;
  }
  function applyTurn(t){
    const th=Math.PI*t,beta=.60*Math.sin(Math.PI*t),D=180/Math.PI,tt=th+beta,td=2*beta/N;
    book3d.style.setProperty('--tt',(tt*D).toFixed(2)+'deg');book3d.style.setProperty('--td',(td*D).toFixed(3)+'deg');book3d.style.setProperty('--shade',Math.sin(Math.PI*t).toFixed(3));
    for(let i=0;i<strips.length;i++){const l1=Math.abs(Math.cos(tt-i*td)),l2=Math.abs(Math.cos(tt-(i+1)*td)),st=strips[i].style;st.setProperty('--a1',((1-l1)*.62).toFixed(3));st.setProperty('--a2',((1-l2)*.62).toFixed(3))}
    updateCaption();
  }
  function updateCaption(){
    const p=turn?PAGES[turn.to]:PAGES[idx];caption.textContent=p.title+' · '+p.place;
    index.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-current',String(i===(turn?turn.to:idx))));
  }
  function layout(){book3d.style.setProperty('--bw',book.clientWidth+'px')}
  function syncLoupe(){
    loupeZoom.textContent='';[...book.children].filter(c=>!c.classList.contains('sutra-zone')).forEach(c=>loupeZoom.appendChild(c.cloneNode(true)));placeLoupe();
  }
  function paint(){
    book.textContent='';
    if(!turn){
      const f=el('div','sutra-book-full'),im=new Image();im.src=PAGES[idx].file;im.alt=PAGES[idx].title;im.draggable=false;f.appendChild(im);book.appendChild(f);book3d.style.setProperty('--shade','0');
    }else{
      const next=turn.dir==='next';book.appendChild(half(next?'left':'right',next?turn.from:turn.to));book.appendChild(half(next?'right':'left',next?turn.to:turn.from));book.appendChild(buildCurl(turn.dir,turn.from,turn.to));applyTurn(turn.t);
    }
    const a=el('button','sutra-zone left'),b=el('button','sutra-zone right');a.setAttribute('aria-label','Previous page');b.setAttribute('aria-label','Next page');book.appendChild(a);book.appendChild(b);
    layout();updateCaption();syncLoupe();
  }
  function kick(){if(raf===null){last=performance.now();raf=requestAnimationFrame(tick)}}
  function tick(now){
    raf=null;const dt=Math.min(.032,(now-last)/1000||.016);last=now;
    if(spring&&turn){
      const s=spring;
      if(s.kind==='tween'){s.e+=dt;const k=Math.min(1,s.e/s.dur);turn.t=s.from+(s.target-s.from)*k;applyTurn(turn.t);if(k>=1){spring=null;const done=s.done;done&&done()}}
      else{const x=turn.t-s.target;s.v+=(-s.k*x-s.c*s.v)*dt;turn.t+=s.v*dt;if(Math.abs(turn.t-s.target)<.002&&Math.abs(s.v)<.02){turn.t=s.target;spring=null;applyTurn(turn.t);const done=s.done;done&&done()}else applyTurn(turn.t)}
    }
    viewSpring();const lm=loupeEase();if((spring||viewActive||lm)&&raf===null)raf=requestAnimationFrame(tick);
  }
  function animateTo(target,done,k=170,c=26){spring={kind:'spring',v:0,target,done,k,c};kick()}
  function startTurn(dir,t=0){spring=null;if(turn){idx=turn.to;turn=null}turn={dir,from:idx,to:dir==='next'?(idx+1)%M:(idx-1+M)%M,t};paint()}
  function commit(){if(!turn)return;if(reduced){idx=turn.to;turn=null;paint();return}animateTo(1,()=>{idx=turn.to;turn=null;paint()})}
  function cancel(){if(!turn)return;animateTo(0,()=>{turn=null;paint()},150,24)}
  function step(dir){if(turn){idx=turn.to;turn=null}shoveLoupe(dir);startTurn(dir);commit()}
  function goTo(i){if(i===idx)return;if(turn){idx=turn.to;turn=null}idx=i;paint()}

  function setView(rx,ry,z){view.trx=Math.max(-4.5,Math.min(4.5,rx));view.try_=Math.max(-7,Math.min(7,ry));view.tz=Math.max(.9,Math.min(1.5,z));viewActive=true;kick();syncZoomRead()}
  function viewSpring(){
    let moved=false;for(const [k,t] of [['rx','trx'],['ry','try_'],['z','tz']]){const d=view[t]-view[k];if(Math.abs(d)>.0006){view[k]+=d*.14;moved=true}else view[k]=view[t]}
    book3d.style.setProperty('--rx',view.rx.toFixed(2)+'deg');book3d.style.setProperty('--ry',view.ry.toFixed(2)+'deg');book3d.style.setProperty('--zoom',view.z.toFixed(3));viewActive=moved;
  }
  function tiltTo(x,y){
    if(drag)return;const r=book.getBoundingClientRect();if(!r.width)return;
    const nx=Math.max(-1,Math.min(1,(x-(r.left+r.width/2))/(r.width*.62))),ny=Math.max(-1,Math.min(1,(y-(r.top+r.height/2))/(r.height*.9)));setView(-ny*4.5,nx*7,view.tz);
  }
  function syncZoomRead(){zoomRead.textContent=Math.round(view.tz*100)+'%'}
  function bookBox(){return{x:0,y:0,w:book.clientWidth,h:book.clientHeight}}
  function loupeSize(){return Math.round(Math.max(145,Math.min(230,book.clientWidth*.21)))}
  function placeLoupe(){
    if(lx===null)return;const b=bookBox(),R=loupeSize()/2,z=view.z,cx=b.w/2,cy=b.h/2;
    loupe.style.width=R*2+'px';loupe.style.height=R*2+'px';loupe.style.transform='translate3d('+(lx-R)+'px,'+(ly-R)+'px,0)';loupe.classList.toggle('on',loupeOn);
    const x0=cx+(b.w*.05-cx)*z,x1=cx+(b.w*.95-cx)*z,y0=cy+(b.h*.04-cy)*z,y1=cy+(b.h*.96-cy)*z;
    const inside=(lx>x0&&lx<x1&&ly>y0&&ly<y1)?Math.min(lx-x0,x1-lx,ly-y0,y1-ly):-1,k=Math.max(0,Math.min(1,(inside+R*.3)/(R*.55)));
    loupeZoom.style.opacity=(loupeOn?k:0).toFixed(3);if(k<=.002)return;
    const px=cx+(lx-cx)/z,py=cy+(ly-cy)/z,s=2.3*z;loupeZoom.style.transform='translate('+(lx-px*s)+'px,'+(ly-py*s)+'px) scale('+s+')';
  }
  function restLoupe(){const b=bookBox();lx=b.w*.87;ly=b.h*.84;placeLoupe()}
  function shoveLoupe(dir){if(!loupeOn||lx===null||lgrab)return;lTarget={x:book.clientWidth*(dir==='next'?.12:.88),y:book.clientHeight*.84};kick()}
  function loupeEase(){
    if(!lTarget)return false;if(lgrab){lTarget=null;return false}const dx=lTarget.x-lx,dy=lTarget.y-ly;
    if(Math.abs(dx)<.5&&Math.abs(dy)<.5){lx=lTarget.x;ly=lTarget.y;lTarget=null;placeLoupe();return false}
    lx+=dx*.17;ly+=dy*.17;placeLoupe();return true;
  }

  PAGES.forEach((p,i)=>{const b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0');b.setAttribute('aria-label','Open '+p.title);b.onclick=()=>goTo(i);index.appendChild(b)});

  stage.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;const target=e.target.closest('.sutra-zone');if(!target)return;e.preventDefault();stage.setPointerCapture(e.pointerId);
    const r=book.getBoundingClientRect(),dir=(e.clientX-r.left)/r.width>.5?'next':'prev';shoveLoupe(dir);startTurn(dir);drag={dir,x0:e.clientX,w:r.width,moved:0,vel:0,tPrev:performance.now()};
  });
  stage.addEventListener('pointermove',e=>{
    if(!drag)return;const dx=e.clientX-drag.x0,now=performance.now();drag.moved=Math.max(drag.moved,Math.abs(dx));
    const raw=(drag.dir==='next'?-dx:dx)/(drag.w*.62),t=Math.max(0,Math.min(1,raw));drag.vel=(t-(turn?turn.t:0))/Math.max(.001,(now-drag.tPrev)/1000);drag.tPrev=now;if(turn){turn.t=t;applyTurn(t)}
  });
  stage.addEventListener('pointerup',()=>{if(!drag)return;const d=drag;drag=null;if(!turn)return;if(d.moved<6){commit();return}d.vel>1.1||turn.t>.42?commit():cancel()});
  stage.addEventListener('pointercancel',()=>{drag=null;cancel()});stage.addEventListener('dragstart',e=>e.preventDefault());stage.addEventListener('dblclick',()=>setView(view.trx,view.try_,1));
  addEventListener('pointermove',e=>{if(e.pointerType!=='touch')tiltTo(e.clientX,e.clientY)},{passive:true});addEventListener('blur',()=>setView(0,0,view.tz));addEventListener('resize',()=>{layout();restLoupe()});
  left.onclick=()=>step('prev');right.onclick=()=>step('next');
  addEventListener('keydown',e=>{if(!intro.classList.contains('is-open')||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();step(e.key==='ArrowRight'?'next':'prev')});
  loupeBtn.onclick=()=>{loupeOn=!loupeOn;loupeBtn.setAttribute('aria-pressed',String(loupeOn));placeLoupe()};zoomInBtn.onclick=()=>setView(view.trx,view.try_,view.tz*1.16);zoomOutBtn.onclick=()=>setView(view.trx,view.try_,view.tz/1.16);

  function closeIntro(){
    intro.classList.add('is-closing');setTimeout(()=>{intro.remove();document.body.classList.remove('sutra-scrapbook-lock');document.getElementById('scrapbookContent')?.scrollIntoView({behavior:'smooth',block:'start'})},700);
  }
  function openBook(){
    intro.classList.add('is-open');
    if(idx===0 && !turn){shoveLoupe('next');startTurn('next');commit()}
  }
  function autoEnter(){
    if(intro.classList.contains('is-closing')) return;
    intro.classList.add('is-open');
    if(idx===0 && !turn){shoveLoupe('next');startTurn('next');commit()}
    setTimeout(()=>{
      if(intro.classList.contains('is-closing')) return;
      intro.classList.add('is-closing');
      document.body.classList.remove('sutra-scrapbook-lock');
      setTimeout(()=>{
        intro.remove();
        const target=document.getElementById('scrapbookContent');
        if(target) window.scrollTo({top:Math.max(0,target.offsetTop-18),behavior:'smooth'});
      },520);
    },1150);
  }
  introOpen.addEventListener('click',openBook);skip.addEventListener('click',closeIntro);
  document.body.classList.add('sutra-scrapbook-lock');paint();restLoupe();syncZoomRead();
  setTimeout(autoEnter,420);
})();
