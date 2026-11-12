export const THEME_NAMES = {calm:'calm',grief:'space for sadness',joy:'joy',connection:'connection',confidence:'confidence',motivation:'momentum',clarity:'perspective',rest:'rest',creativity:'inspiration',acceptance:'acceptance',boundaries:'boundaries',awe:'wonder',catharsis:'emotional release',play:'play',hope:'hope',focus:'focus',selfcompassion:'self-compassion',change:'a fresh perspective'};
function rankCandidates(catalog,selections,{kind='All',time='any',excluded=[]}={}) {
  const weights={feelings:1,stuck:1.7,needs:3};
  const chosen=Object.entries(selections).flatMap(([category,words])=>words.map(word=>({...word,category,weight:weights[category]})));
  if(!chosen.length)return [];
  const profile={};
  for(const word of chosen)for(const theme of word.themes)profile[theme]=(profile[theme]||0)+word.weight/Math.sqrt(selections[word.category].length);
  const omitted=new Set(excluded);
  return catalog.filter(item=>!omitted.has(item.id)&&(kind==='All'||item.kind===kind)&&(time==='any'||(Number.isFinite(item.minutes)&&item.minutes>0&&item.minutes<=Number(time)))).map(item=>{
    const matches=chosen.filter(w=>w.themes.some(t=>item.themes.includes(t))).sort((a,b)=>b.weight-a.weight);
    const matchedThemes=item.themes.filter(t=>profile[t]).sort((a,b)=>profile[b]-profile[a]);
    const score=matchedThemes.reduce((n,t)=>n+profile[t],0)/Math.sqrt(Math.max(item.themes.length,1));
    return {...item,score,matches,matchedThemes};
  }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
export function countRecommendations(catalog,selections,options={}) {
  return rankCandidates(catalog,selections,options).length;
}
export function recommend(catalog,selections,{kind='All',time='any',excluded=[],offset=0,limit=6}={}) {
  const pool=rankCandidates(catalog,selections,{kind,time,excluded});
  if(!pool.length||limit<=0)return [];
  const start=Math.max(0,Math.floor(offset))%pool.length;
  const end=Math.min(pool.length,start+Math.floor(limit));
  const result=[],kinds={},creators={},sources={};
  // A deterministic, diverse ordering over the entire eligible library. Paging
  // reaches every match, instead of endlessly rotating the top few candidates.
  for(let position=0;position<end;position++){
    let bestIndex=0,best=-Infinity;
    pool.forEach((item,i)=>{
      const creator=item.creator?.trim().toLocaleLowerCase();
      const source=item.sourceName;
      const penalty=1+(kinds[item.kind]||0)*0.32+(creator?(creators[creator]||0)*0.8:0)+(source?(sources[source]||0)*0.08:0);
      const adjusted=item.score/penalty;
      if(adjusted>best){best=adjusted;bestIndex=i;}
    });
    const [item]=pool.splice(bestIndex,1);
    kinds[item.kind]=(kinds[item.kind]||0)+1;
    if(item.creator){const key=item.creator.trim().toLocaleLowerCase();creators[key]=(creators[key]||0)+1;}
    if(item.sourceName)sources[item.sourceName]=(sources[item.sourceName]||0)+1;
    if(position>=start)result.push(item);
  }
  return result;
}
export function explanation(item) {
  const labels=[...new Set(item.matches.map(x=>x.label))].slice(0,2);
  const themes=item.matchedThemes.slice(0,2).map(t=>THEME_NAMES[t]||t);
  return `For your ${labels.map(t=>`“${t}”`).join(' + ')} moment. This pick explores ${themes.join(' and ')}.`;
}
