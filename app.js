import { wordCloudMarkup, cloudFieldMarkup, cloudImage, setupCloudMotion } from './clouds.js';
import { renderRisograph } from './riso.js';
import { WORDS } from './words.js';
import { recommend, countRecommendations, explanation, THEME_NAMES } from './engine.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEYS=['feelings','stuck','needs'];
const copy={feelings:{title:'How are you feeling, really?',subtitle:'You can be more than one thing. Pick every word that feels like you.',search:'Find a feeling',noun:'feelings'},stuck:{title:'What do you feel stuck with?',subtitle:'Big things, little things, the things that keep coming back.',search:'Find what feels stuck',noun:'stuck points'},needs:{title:'What do you need right now?',subtitle:'Not what you should need. What would feel good, just for you?',search:'Find what you need',noun:'needs'}};
const state={step:'feelings',selected:{feelings:new Set(),stuck:new Set(),needs:new Set()},expanded:{},query:'',catalog:[],loaded:false,loadError:false,kind:'All',time:'any',offset:0,excluded:[],hasResults:false,saved:loadSaved()};
function loadSaved(){try{const ids=JSON.parse(localStorage.getItem('resonance-shelf-v1')||'[]');return new Set(Array.isArray(ids)?ids.filter(x=>typeof x==='string'):[]);}catch{return new Set();}}
function selected(){return Object.fromEntries(KEYS.map(k=>[k,WORDS[k].filter(w=>state.selected[k].has(w.label))]));}
function total(){return KEYS.reduce((n,k)=>n+state.selected[k].size,0);}
function announce(message){$('#announcement').textContent=message;}
let toastTimer;
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,3200);}
function renderCloud(){
  const words=WORDS[state.step],query=state.query.trim().toLocaleLowerCase();
  const matches=words.filter(w=>w.label.toLocaleLowerCase().includes(query));
  const visible=query||state.expanded[state.step]?matches:matches.slice(0,24);
  $('#word-cloud').innerHTML=cloudFieldMarkup(state.step,visible.length)+(visible.length?visible.map((w,i)=>wordCloudMarkup(w,i,state.selected[state.step].has(w.label),escape)).join(''):'<p class="empty-cloud">No words quite like that yet.<br>Try a shorter search, or explore another cloud.</p>');
  $('#word-cloud').setAttribute('aria-label',`Select your ${copy[state.step].noun}`);
  $('#cloud-counter').textContent=query?`${matches.length} matching ${matches.length===1?'word':'words'}`:`${visible.length} of ${words.length} ${copy[state.step].noun}`;
  $('#show-all').hidden=!!query;
  $('#show-all').innerHTML=state.expanded[state.step]?'Show fewer words <span aria-hidden="true">↑</span>':`Explore all ${words.length} <span aria-hidden="true">↗</span>`;
  $('#show-all').setAttribute('aria-expanded',String(!!state.expanded[state.step]));
}
function renderSelection(){
  const count=total();
  $$('.step').forEach(tab=>{const k=tab.dataset.step,n=state.selected[k].size;tab.querySelector('.step-count').textContent=n;tab.querySelector('.step-count').hidden=!n;tab.setAttribute('aria-label',`${copy[k].noun}, ${n} selected`);});
  $('#selection-area').hidden=!count;
  $('#selected-words').innerHTML=KEYS.flatMap(k=>[...state.selected[k]].map(label=>`<button class="selected-chip" data-category="${k}" data-remove="${escape(label)}" aria-label="Remove ${escape(label)} from ${copy[k].noun}">${escape(label)}<span aria-hidden="true">×</span></button>`)).join('');
  $('#find-media').disabled=!count||!state.loaded;
  $('#moment-title').textContent=count?`${count} ${count===1?'word':'words'}. One beautifully human moment.`:'A little check-in. A new possibility.';
  $('#moment-copy').textContent=state.loadError?'The library couldn’t load. Use the retry button to reconnect.':!state.loaded?'Opening the library…':count?'Ready when you are. You can keep exploring or find your picks.':'Choose a few words, and see where they take you.';
  if(state.hasResults) renderResults();
}
function switchStep(step,{focus=false}={}){
  state.step=step;state.query='';$('#word-search').value='';document.body.dataset.sky=step;
  document.querySelector('meta[name=theme-color]').content={feelings:'#ffc0df',stuck:'#dfd5e5',needs:'#fff1a8'}[step];
  const c=copy[step],index=KEYS.indexOf(step);
  $('#cloud-title').textContent=c.title;$('#cloud-subtitle').textContent=c.subtitle;$('#word-search').placeholder=c.search;$('#word-search').setAttribute('aria-label',`Search ${c.noun}`);
  $$('.step').forEach(tab=>{const active=tab.dataset.step===step;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
  $('#cloud-panel').setAttribute('aria-labelledby',`tab-${step}`);
  $('#back-step').hidden=index===0;
  $('#step-note').textContent=index===2?'Take what resonates. Leave the rest.':'Start anywhere. You can skip a step.';
  $('#next-step').innerHTML=index===0?'Next: what feels stuck <span aria-hidden="true">→</span>':index===1?'Next: what you need <span aria-hidden="true">→</span>':'Back to your feelings <span aria-hidden="true">↺</span>';
  renderCloud();if(focus)$(`#tab-${step}`).focus();
}
function toggleWord(label){
  const set=state.selected[state.step];set.has(label)?set.delete(label):set.add(label);
  const button=$$('.word').find(b=>b.dataset.word===label);if(button)button.setAttribute('aria-pressed',String(set.has(label)));
  state.offset=0;renderSelection();announce(`${label} ${set.has(label)?'selected':'removed'}. ${total()} words selected.`);
}
function artwork(item){
  return `<div class="card-art" data-art-id="${escape(item.id)}">${renderRisograph(item)}<span class="art-label">${escape(THEME_NAMES[item.themes[0]]||'a little possibility')}</span><span class="print-edition" aria-hidden="true">a little resonance</span></div>`;
}
const bookmark='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4z"/></svg>';
const actions={Video:'Watch',Music:'Listen',Podcast:'Listen',Book:'Explore book',Poem:'Read',Article:'Read',Newsletter:'Read'};
function renderResults(){
  const picks=recommend(state.catalog,selected(),{kind:state.kind,time:state.time,excluded:state.excluded,offset:state.offset});
  $('#recommendations').innerHTML=picks.length?picks.map((item,i)=>{
    const saved=state.saved.has(item.id),duration=item.minutes?`≈ ${item.minutes} min${item.durationType==='reading estimate'?' read':''}`:'Take your time';
    return `<article class="media-card">${artwork(item)}<button class="save-button" data-save="${escape(item.id)}" aria-pressed="${saved}" aria-label="${saved?'Unsave':'Save'} ${escape(item.title)}">${bookmark}</button><div class="card-body"><div class="card-meta"><span>${escape(item.kind)}</span><span>${duration}</span></div><h3>${escape(item.title)}</h3><p class="card-creator">${escape(item.creator)}</p><p class="card-description">${escape(item.description)}</p><p class="card-reason">${escape(explanation(item))}</p><div class="card-actions"><a class="media-link" href="${escape(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="${actions[item.kind]||'Open'} ${escape(item.title)} (opens in a new tab)">${actions[item.kind]||'Open'} <span aria-hidden="true">↗</span></a><button class="dismiss-button" data-dismiss="${escape(item.id)}" aria-label="Dismiss ${escape(item.title)}">Not for me</button></div>${item.access!=='Free'?`<div class="access-label">${escape(item.access)}</div>`:''}</div></article>`;
  }).join(''):`<div class="empty-state"><h3>${total()?'A little more room to explore.':'Start with a word.'}</h3><p>${total()?'No matching picks with these filters in the library.<br>Try another format, more time, or a different word.':'Choose a feeling, a stuck point, or a need to find your next piece of media.'}</p>${total()?'<button class="outline-button" id="reset-filters">Show all formats and times</button>':''}</div>`;
  $('#library-note').textContent=`${state.catalog.length.toLocaleString()} pieces from publisher pages, official catalogs, and feeds. Times are approximate; unknown lengths are excluded by time filters. New tabs open the original source.`;
  $$('.filter').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.kind===state.kind)));
  const available=countRecommendations(state.catalog,selected(),{kind:state.kind,time:state.time,excluded:state.excluded});
  $('#another-mix').disabled=available<=6;
  $('#another-mix').title=available<=6?'All matching picks are shown':'Discover more matching picks';
}
function findMedia(){
  if(!total()||!state.loaded)return;
  state.hasResults=true;state.offset=0;$('#results').hidden=false;renderResults();
  $('#results-title').focus({preventScroll:true});$('#results').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});announce('Your media picks are ready.');
}
function saveItem(id){
  if(!state.catalog.some(x=>x.id===id))return;
  const saving=!state.saved.has(id);saving?state.saved.add(id):state.saved.delete(id);
  let persisted=true;try{localStorage.setItem('resonance-shelf-v1',JSON.stringify([...state.saved]));}catch{persisted=false;}
  updateShelfCount();
  $$('[data-save]').filter(b=>b.dataset.save===id).forEach(button=>{button.setAttribute('aria-pressed',String(saving));const item=state.catalog.find(x=>x.id===id);button.setAttribute('aria-label',`${saving?'Unsave':'Save'} ${item.title}`);});
  if($('#shelf-dialog').open)renderShelf();
  toast(persisted?(saving?'Saved to your little shelf.':'Removed from your shelf.'):'Saved for this session. Browser storage is unavailable.');
}
function updateShelfCount(){$('#shelf-count').textContent=state.saved.size;}
function renderShelf(){
  const items=state.catalog.filter(item=>state.saved.has(item.id));
  $('#shelf-items').innerHTML=items.length?items.map(item=>`<article class="shelf-item"><div><small>${escape(item.kind)}</small><h3><a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">${escape(item.title)} ↗</a></h3><p>${escape(item.creator)}</p></div><button class="text-button small" data-shelf-remove="${escape(item.id)}" aria-label="Remove ${escape(item.title)} from shelf">Remove</button></article>`).join(''):'<div class="empty-state"><h3>A little space for later.</h3><p>Tap the bookmark on any recommendation<br>to keep it here for another day.</p></div>';
}
function renderLibraryStats(){
  const counts=Object.fromEntries(['Video','Article','Newsletter','Book','Music','Poem','Podcast'].map(kind=>[kind,state.catalog.filter(item=>item.kind===kind).length]));
  const labels={Video:'videos',Article:'articles',Newsletter:'newsletter posts',Book:'books',Music:'music tracks',Poem:'poems',Podcast:'podcast episodes'};
  $('#library-stats').innerHTML=Object.entries(counts).map(([kind,count])=>`<div><strong>${count.toLocaleString()}</strong><span>${labels[kind]}</span></div>`).join('');
  $('#library-size').textContent=`${state.catalog.length.toLocaleString()} pieces. Many ways to meet a moment.`;
  $$('.filter').forEach(button=>{const kind=button.dataset.kind;button.title=kind==='All'?`${state.catalog.length} pieces in the library`:`${counts[kind]} ${labels[kind]} in the library`;});
}
async function loadCatalog(){
  state.loadError=false;$('#retry-library')?.remove();renderSelection();
  try{const response=await fetch('./media.json');if(!response.ok)throw new Error('Could not load library');const catalog=await response.json();if(!Array.isArray(catalog)||!catalog.length)throw new Error('Empty library');state.catalog=catalog;state.loaded=true;renderLibraryStats();state.saved=new Set([...state.saved].filter(id=>catalog.some(item=>item.id===id)));updateShelfCount();if($('#shelf-dialog').open)renderShelf();}
  catch{state.loadError=true;state.loaded=false;const retry=document.createElement('button');retry.id='retry-library';retry.className='outline-button';retry.textContent='Retry library';retry.onclick=loadCatalog;$('.moment-bar').append(retry);}
  renderSelection();
}
$('#word-cloud').addEventListener('click',event=>{const button=event.target.closest('[data-word]');if(button)toggleWord(button.dataset.word);});
$('#word-search').addEventListener('input',event=>{state.query=event.target.value;renderCloud();announce($('#cloud-counter').textContent);});
$('#show-all').addEventListener('click',()=>{state.expanded[state.step]=!state.expanded[state.step];renderCloud();});
$$('.step').forEach(button=>button.addEventListener('click',()=>switchStep(button.dataset.step)));
$('.step-nav').addEventListener('keydown',event=>{const i=KEYS.indexOf(state.step);let next;if(event.key==='ArrowRight')next=(i+1)%3;if(event.key==='ArrowLeft')next=(i+2)%3;if(event.key==='Home')next=0;if(event.key==='End')next=2;if(next!==undefined){event.preventDefault();switchStep(KEYS[next],{focus:true});}});
$('#next-step').addEventListener('click',()=>{switchStep(KEYS[(KEYS.indexOf(state.step)+1)%3],{focus:true});if(window.innerWidth<701)$('.step-nav').scrollIntoView({block:'start'});});
$('#back-step').addEventListener('click',()=>switchStep(KEYS[Math.max(0,KEYS.indexOf(state.step)-1)],{focus:true}));
$('#selected-words').addEventListener('click',event=>{const button=event.target.closest('[data-remove]');if(!button)return;const label=button.dataset.remove;state.selected[button.dataset.category].delete(label);state.offset=0;renderCloud();renderSelection();announce(`${label} removed. ${total()} words selected.`);});
$('#clear-all').addEventListener('click',()=>{KEYS.forEach(k=>state.selected[k].clear());state.offset=0;state.excluded=[];renderCloud();renderSelection();$('#word-search').focus();announce('All selected words cleared.');});
$('#find-media').addEventListener('click',findMedia);
$('#another-mix').addEventListener('click',()=>{const available=countRecommendations(state.catalog,selected(),{kind:state.kind,time:state.time,excluded:state.excluded});state.offset=state.offset+6>=available?0:state.offset+6;renderResults();announce('A different mix of picks is ready.');});
$('#kind-filters').innerHTML=['All','Video','Article','Newsletter','Book','Music','Poem','Podcast'].map(kind=>`<button class="filter" data-kind="${kind}" aria-pressed="${kind==='All'}">${kind==='All'?'Everything':kind==='Newsletter'?'Newsletters':kind==='Music'?'Music':`${kind}s`}</button>`).join('');
$('#kind-filters').addEventListener('click',event=>{const button=event.target.closest('[data-kind]');if(!button)return;state.kind=button.dataset.kind;state.offset=0;renderResults();announce(`${state.kind} filter selected.`);});
$('#time-filter').addEventListener('change',event=>{state.time=event.target.value;state.offset=0;renderResults();announce('Recommendations updated for your time.');});
$('#recommendations').addEventListener('click',event=>{const save=event.target.closest('[data-save]');if(save)saveItem(save.dataset.save);const dismiss=event.target.closest('[data-dismiss]');if(dismiss){state.excluded.push(dismiss.dataset.dismiss);renderResults();toast('Set aside for this check-in.');}if(event.target.closest('#reset-filters')){state.kind='All';state.time='any';state.offset=0;state.excluded=[];$('#time-filter').value='any';renderResults();}});
for(const id of ['#how-button','#about-library'])$(id).addEventListener('click',()=>$('#info-dialog').showModal());
$('#shelf-button').addEventListener('click',()=>{renderShelf();$('#shelf-dialog').showModal();});
$('#shelf-items').addEventListener('click',event=>{const button=event.target.closest('[data-shelf-remove]');if(button)saveItem(button.dataset.shelfRemove);});
$$('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}}));
window.addEventListener('storage',event=>{if(event.key==='resonance-shelf-v1'){state.saved=loadSaved();updateShelfCount();if(state.hasResults)renderResults();if($('#shelf-dialog').open)renderShelf();}});
$$('.ambient-cloud').forEach((cloud,i)=>cloud.innerHTML=cloudImage(i));
setupCloudMotion();switchStep('feelings');renderSelection();updateShelfCount();loadCatalog();
