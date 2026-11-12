export function seedWord(text) {
  let n=2166136261;
  for(const c of text){n^=c.codePointAt(0);n=Math.imul(n,16777619);}
  return n>>>0;
}
const CLOUD_ART={
  feelings:['ethereal-cloud','cloud-azure-feather'],
  stuck:['cloud-peach','cloud-peach-tower'],
  needs:['cloud-lavender-islet','ethereal-cloud']
};
export function cloudImage(variant=0,sky='feelings',art=0) {
  const files=CLOUD_ART[sky]||CLOUD_ART.feelings;
  const file=files[Math.abs(art)%files.length];
  const tint=sky==='needs'&&file==='ethereal-cloud'?' cloud-lavender-billows':'';
  return `<img class="cloud-texture cloud-variant-${Math.abs(variant)%4}${tint}" src="assets/${file}.png" alt="" aria-hidden="true" draggable="false" decoding="async">`;
}

// Each sky has a distinct composition. Geometry is [x%, y%, width%, aspect].
// Mobile positions keep the same variety throughout the taller word field.
const CLOUD_LAYOUTS={
  feelings:[
    {art:1,at:[-13,-19,94,1.8],mobile:[-30,-5,165,1.9],angle:-12,opacity:.65,blur:.8,time:97},
    {art:0,at:[-14,-13,64,1.7],mobile:[-42,3,125,1.4],angle:-7,opacity:.96,blur:0,time:81},
    {art:0,at:[57,-4,46,1.55],mobile:[41,19,87,1.5],angle:11,opacity:.92,blur:0,time:69},
    {art:1,at:[17,22,76,1.85],mobile:[-30,30,165,2.1],angle:6,opacity:.94,blur:0,time:103},
    {art:0,at:[3,39,43,1.65],mobile:[-20,48,103,1.45],angle:4,opacity:.97,blur:0,time:76},
    {art:0,at:[49,48,60,1.75],mobile:[36,65,102,1.55],angle:-11,opacity:1,blur:0,time:88},
    {art:1,at:[-19,38,88,2.2],mobile:[-36,78,170,2.2],angle:-5,opacity:.93,blur:0,time:94},
    {art:0,at:[31,17,31,1.4],mobile:[-13,90,90,1.7],angle:13,opacity:.7,blur:.4,time:112}
  ],
  stuck:[
    {art:1,at:[-27,-30,88,1.35],mobile:[-57,-7,150,1.15],angle:-5,opacity:.98,blur:0,time:110},
    {art:0,at:[23,-12,84,2.1],mobile:[4,9,136,1.9],angle:7,opacity:.83,blur:.5,time:83},
    {art:1,at:[50,18,67,1.4],mobile:[24,29,139,1.25],angle:4,opacity:.98,blur:0,time:93},
    {art:0,at:[-14,42,75,2.35],mobile:[-41,40,164,1.85],angle:-8,opacity:1,blur:0,time:74},
    {art:1,at:[10,28,43,1.3],mobile:[-50,61,139,1.2],angle:9,opacity:.88,blur:0,time:123},
    {art:0,at:[55,0,49,2.4],mobile:[17,74,132,1.95],angle:-6,opacity:.81,blur:0,time:97},
    {art:0,at:[25,73,67,2.5],mobile:[-31,91,155,2.2],angle:3,opacity:.98,blur:0,time:87}
  ],
  needs:[
    {art:0,at:[-9,-12,64,1.65],mobile:[-18,-8,119,1.4],angle:-7,opacity:.94,blur:0,time:103},
    {art:1,at:[24,-24,83,2.7],mobile:[-8,8,143,2.1],angle:9,opacity:.91,blur:0,time:127},
    {art:2,at:[55,23,49,1.4],mobile:[-20,25,105,1.3],angle:-11,opacity:.98,blur:0,time:74},
    {art:1,at:[-17,4,109,2.4],mobile:[-35,37,170,2],angle:-5,opacity:.95,blur:0,time:116},
    {art:0,at:[39,40,75,1.65],mobile:[15,54,123,1.35],angle:12,opacity:.9,blur:0,time:95},
    {art:2,at:[-1,53,43,1.4],mobile:[-28,71,107,1.35],angle:6,opacity:1,blur:0,time:82},
    {art:1,at:[4,45,73,2.2],mobile:[-31,80,163,2.1],angle:-10,opacity:.88,blur:0,time:108},
    {art:2,at:[35,-8,30,1.5],mobile:[37,83,80,1.5],angle:-2,opacity:.67,blur:.6,time:91}
  ]
};

// Two additional layers fill the spaces between the larger signature formations.
// Center anchors keep coverage even when the word field grows taller on mobile.
function infillClouds(sky,count,section) {
  const rows=Math.ceil(count/4),mobileRows=Math.ceil(count/2);
  return Array.from({length:count},(_,i)=>{
    const seed=seedWord(`${sky}-infill-${section}-${i}`);
    const art=sky==='needs'?[2,1,2,0][i%4]:sky==='stuck'?(i%4===0?1:0):(i%3===0?1:0);
    const wide=sky==='needs'?art===1:sky==='feelings'?art===1:art===0;
    const width=(wide?64:51)+(seed%11)-5;
    const aspect=wide?1.9+(seed%4)*.12:1.35+(seed%3)*.1;
    return {
      art,centered:true,
      at:[12.5+(i%4)*25+(seed%9)-4,(Math.floor(i/4)+.5)*100/rows+(seed%7)-3,width,aspect],
      mobile:[i%2?76+(seed%13)-6:24+(seed%13)-6,(Math.floor(i/2)+.5)*100/mobileRows,wide?143+(seed%18):117+(seed%16),wide?1.95:1.4],
      angle:(seed%25)-12,opacity:i<count/2?.76:.92,blur:i<count/2?.45:0,time:86+(seed%43)
    };
  });
}
export function cloudFieldMarkup(sky='feelings',wordCount=24) {
  const sections=Math.max(1,Math.ceil(wordCount/30));
  const layout=CLOUD_LAYOUTS[sky]||CLOUD_LAYOUTS.feelings;
  return `<div class="cloud-field" aria-hidden="true" style="--cloud-sections:${sections}">${Array.from({length:sections},(_,section)=>{
    const banks=[...infillClouds(sky,layout.length*2,section),...layout].map((bank,i)=>{
      const [x,y,width,aspect]=bank.at,[mx,my,mw,ma]=bank.mobile;
      const variation=section?(seedWord(`${sky}-${section}-${i}`)%9)-4:0;
      const drift=(i%2?-1:1)*(sky==='stuck'?14:sky==='needs'?35:24);
      return `<span class="cloud-wisp${bank.centered?' cloud-wisp-infill':''}" style="--wisp-x:${x+variation}%;--wisp-y:${y+variation/2}%;--wisp-width:${width+variation}%;--wisp-aspect:${aspect};--mobile-x:${mx+variation}%;--mobile-y:${my}%;--mobile-width:${mw+variation}%;--mobile-aspect:${ma};--wisp-angle:${bank.angle}deg;--wisp-opacity:${bank.opacity};--wisp-blur:${bank.blur}px;--wisp-duration:${bank.time+section*3}s;--wisp-delay:-${i*11+section*7}s;--drift-x:${drift}px;--drift-y:${i%3===0?-13:8}px"><span class="wisp-body">${cloudImage(i+section,sky,bank.art)}</span></span>`;
    }).join('');
    return `<div class="cloud-bank-section${section%2?' cloud-bank-reversed':''}">${banks}</div>`;
  }).join('')}</div>`;
}
export function wordCloudMarkup(word,index,selected,escape) {
  const seed=seedWord(word.label),long=word.label.length>20;
  const size=long?15:word.label.length>13?17:[19,24,20,18,23,21][seed%6];
  return `<button class="word${long?' long-word':''}" style="--word-size:${size}px;--word-space:${118+seed%53}px;--word-offset:${seed%19-9}px" aria-pressed="${selected}" data-word="${escape(word.label)}"><span class="word-drift"><span class="word-label">${escape(word.label)}</span><span class="word-check" aria-hidden="true">✓</span></span></button>`;
}
export function setupCloudMotion() {
  const root=document.querySelector('#word-cloud');
  const toggle=document.querySelector('#motion-toggle');
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=false,releaseTimer;
  const activeWisps=new Set();
  function release() {
    clearTimeout(releaseTimer);
    activeWisps.forEach(wisp=>wisp.classList.remove('is-parted'));
    activeWisps.clear();
    root.querySelectorAll('.is-chased').forEach(word=>word.classList.remove('is-chased'));
  }
  function sync() {
    const off=paused||preference.matches;
    document.body.dataset.motion=off?'paused':'playing';
    toggle.setAttribute('aria-pressed',String(off));
    toggle.setAttribute('aria-label',off?'Resume cloud animation':'Pause cloud animation');
    toggle.querySelector('span').textContent=off?'Motion off':'Motion on';
    toggle.disabled=preference.matches;
    toggle.title=preference.matches?'Reduced motion follows your device setting':off?'Let the clouds drift':'Keep the clouds still';
    if(off)release();
  }
  function partMist(button,event) {
    release();
    if(paused||preference.matches)return;
    const word=button.getBoundingClientRect();
    const x=event?.clientX??word.x+word.width/2;
    const y=event?.clientY??word.y+word.height/2;
    const nearby=[...root.querySelectorAll('.cloud-wisp')].map(wisp=>{
      const bounds=wisp.getBoundingClientRect();
      const dx=bounds.x+bounds.width/2-x,dy=bounds.y+bounds.height/2-y;
      return {wisp,dx,dy,distance:Math.hypot(dx/(bounds.width/2),dy/(bounds.height/2))};
    }).sort((a,b)=>a.distance-b.distance).slice(0,2);
    nearby.forEach(({wisp,dx,dy})=>{
      const direction=wisp.closest('.cloud-bank-reversed')?-1:1;
      wisp.style.setProperty('--part-x',`${Math.sign(dx||1)*62*direction}px`);
      wisp.style.setProperty('--part-y',`${Math.sign(dy||-1)*25}px`);
      wisp.classList.add('is-parted');
      activeWisps.add(wisp);
    });
    button.classList.add('is-chased');
  }
  function settle(delay=500){clearTimeout(releaseTimer);releaseTimer=setTimeout(release,delay);}
  root.addEventListener('pointerover',event=>{
    const button=event.target.closest('.word');
    if(!button||button.contains(event.relatedTarget)||event.pointerType==='touch')return;
    partMist(button,event);
  });
  root.addEventListener('pointerout',event=>{
    const button=event.target.closest('.word');
    if(button&&!button.contains(event.relatedTarget))settle();
  });
  root.addEventListener('pointerleave',()=>settle());
  root.addEventListener('pointerdown',event=>{
    const button=event.target.closest('.word');
    if(button&&event.pointerType==='touch'){partMist(button,event);settle(1100);}
  });
  root.addEventListener('focusin',event=>{
    const button=event.target.closest('.word');
    if(button)partMist(button);
  });
  root.addEventListener('focusout',()=>settle());
  toggle.addEventListener('click',()=>{paused=!paused;sync();});
  preference.addEventListener('change',sync);
  sync();
}
