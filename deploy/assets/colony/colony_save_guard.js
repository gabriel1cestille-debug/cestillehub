/* Durable colony revisions and account-scoped recovery snapshots. No inventory merging. */
(function(root){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)),prefix='CESTILLE_COLONY_CHECKPOINTS_V1:';
function uid(){try{return root.ruaAuth?.state().uid||''}catch{return ''}}
function scope(){return uid()||('unbound-'+(root.ruaProfile||'owner'))}
function read(key){try{const a=JSON.parse(root.localStorage.getItem(key)||'[]');return Array.isArray(a)?a:[]}catch{return []}}
const PIN='CESTILLE_COLONY_PINS_V1:';
/* 2026-11-16: marcos. Quando aparece um dragão Lendário ou Épico que nunca apareceu antes, essa versão da colônia é guardada à parte e NÃO é trocada pelas cópias de rotina (que giram em minutos: só as últimas 12). */
function pinRare(col){try{const rk=root.ruaRarityOf;if(typeof rk!=='function')return;const sp=[...new Set((col?.zoo?.an||[]).map(a=>a.sp).filter(id=>(rk(id)|0)>=3))];if(!sp.length)return;const key=PIN+scope(),list=read(key),seen=new Set(list.flatMap(x=>x.sp||[]));const fresh=sp.filter(id=>!seen.has(id));if(!fresh.length)return;list.unshift({at:Date.now(),uid:uid(),kind:'marco: novo dragão raro ('+fresh.join(', ')+')',seed:col.seed,sp,json:JSON.stringify(col)});while(list.length>10||JSON.stringify(list).length>1800000){if(list.length<=1)break;list.pop()}root.localStorage.setItem(key,JSON.stringify(list))}catch(e){root.__ruaPinError=String(e?.name||e)}}
function checkpoint(col,kind){if(!col||!Array.isArray(col.pcs))return;try{const key=prefix+scope(),json=JSON.stringify(col),list=read(key);pinRare(col);if(list[0]?.json===json)return;list.unshift({at:Date.now(),uid:uid(),kind:kind||'save',seed:col.seed,json});while(list.length>12||JSON.stringify(list).length>1600000){if(list.length<=1)break;list.pop()}root.localStorage.setItem(key,JSON.stringify(list));}catch(e){root.__ruaCheckpointError=String(e?.name||e)}}
function revise(col,kind,meta){const old=col._save||{},at=Date.now(),id=(root.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+'-'+at),pinAt=kind==='restore'?at:(Number(old.pinAt)||0);col._save={v:1,id,parent:old.id||'',anc:[old.id,...(old.anc||[])].filter(Boolean).slice(0,24),rev:(Number(old.rev)||0)+1,at,kind:kind||'action',pinAt,commit:old.commit||''};if(kind==='restore'&&meta){col._save.restoreOf=String(meta.restoreOf||'');col._save.restoreCommit=String(meta.restoreCommit||'')}col.u=at;return col._save}
function stamp(col,kind,meta){const revision=revise(col,kind,meta);checkpoint(col,kind);return revision}
// Reads preserve a pending descendant action. Divergent branches follow the server,
// never a device clock. The losing branch remains recoverable.
function descends(x,y){return !!(x?.id&&y?.id&&x.id!==y.id&&(x.parent===y.id||x.anc?.includes(y.id)))}
function pick(a,b){
 if(!a)return{col:b,lost:null};if(!b)return{col:a,lost:null};
 const x=a._save,y=b._save;
 const local=descends(x,y);
 return{col:local?a:b,lost:x?.id===y?.id||JSON.stringify(a)===JSON.stringify(b)?null:(local?b:a),conflict:!!(x?.id&&y?.id&&x.id!==y.id&&!descends(x,y)&&!descends(y,x))};
}
// A write is accepted only against the server version from which it was made.
function forWrite(a,b,base){
 if(!b)return{col:a,lost:null};if(!a)return{col:b,lost:null};
 const x=a._save,y=b._save,commit=x?.commit||'',remote=y?.commit||'';
 const compatible=descends(x,y)||(commit||remote?commit===remote:(base?JSON.stringify(base)===JSON.stringify(b):false));
 const related=x?.id===y?.id||descends(x,y)||(!y?.id&&a.seed===b.seed);
 const explicit=x?.kind==='restore'&&x.id!==y?.id&&!!x.restoreOf&&x.restoreOf===y?.id&&(x.restoreCommit||'')===remote;
 const local=explicit||(compatible&&related);
 return{col:local?a:b,lost:JSON.stringify(a)===JSON.stringify(b)?null:(local?b:a),conflict:!local};
}
function commit(col){if(col){if(!col._save?.id)revise(col,'sync-migration');col._save.commit=root.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now();}return col}
function advance(live,sent,saved){if(live&&sent&&saved&&(live._save?.commit||'')===(sent._save?.commit||'')&&(live._save?.id===sent._save?.id||descends(live._save,sent._save))){live._save.commit=saved._save?.commit||'';}}
function receipts(local,cloud,col){
 const out={...(local||{}),...(cloud||{})};
 for(const [id,r] of Object.entries(out)){
  if(r?.status==='hatched'||r?.status==='cancelled')continue;
  const redeemed=col?._grants?.[id];
  if(redeemed?.status==='hatched'){out[id]={...r,...redeemed};continue;}
  const animal=col?.zoo?.an?.find(a=>a.grantId===id);
  if(animal)out[id]={...r,status:'hatched',animalId:animal.id,hatchedAt:Date.now()};
 }
 return out;
}
function list(seed){const own=read(prefix+scope());const unbound=uid()?read(prefix+'unbound-'+(root.ruaProfile||'owner')).filter(x=>x.seed===seed&&!x.uid):[];const pins=read(PIN+scope()).filter(x=>!seed||x.seed===seed);return own.concat(unbound,pins).sort((a,b)=>b.at-a.at)}

const VULCAO_GRANT='flavia-vulcao-restitution-20261114-v1';
function compensateVulcao(data,cloud,user){
 if(!user?.uid||String(user.email||'').trim().toLowerCase()!=='flavia.bocoen123@gmail.com')return false;
 const col=data?.ruaLayout?.orbitGame?.colony;if(!col||!Array.isArray(col.pcs)||!col.pcs.some(p=>p[0]==='incubadora'))return false;
 data._compensations={...(data._compensations||{}),...(cloud?._compensations||{})};
 let receipt=data._compensations[VULCAO_GRANT];if(receipt&&receipt.uid!==user.uid)return false;
 if(receipt?.status==='hatched')return false;
 const zoo=col.zoo=col.zoo||{};if(!Array.isArray(zoo.an))zoo.an=[];if(!Array.isArray(zoo.eggs))zoo.eggs=[];
 const animal=zoo.an.find(a=>a.grantId===VULCAO_GRANT);
 if(animal){data._compensations[VULCAO_GRANT]={...(receipt||{}),uid:user.uid,sp:'vulcao',status:'hatched',hatchedAt:Date.now()};return false;}
 if(zoo.eggs.some(e=>e.grantId===VULCAO_GRANT)){
  if(!receipt)data._compensations[VULCAO_GRANT]={uid:user.uid,sp:'vulcao',status:'ready',at:Date.now()};return false;
 }
 // This compensation may temporarily exceed nest capacity; existing eggs are kept intact.
 zoo.eggs.unshift({sp:'vulcao',el:1,tot:1,by:[],grantId:VULCAO_GRANT,manualHatch:true});
 revise(col,'vulcao-restitution');data._compensations[VULCAO_GRANT]={...(receipt||{}),uid:user.uid,sp:'vulcao',status:'ready',at:receipt?.at||Date.now(),revision:col._save.id};return true;
}
root.ruaColonySave={stamp,revise,checkpoint,pick,forWrite,commit,advance,receipts,descends,list,uid,compensateVulcao,VULCAO_GRANT};
})(typeof window==='undefined'?globalThis:window);
