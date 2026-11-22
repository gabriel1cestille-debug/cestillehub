/* Serialized owner saves. Each transaction checks the colony's server commit. */
(function(root){'use strict';
let pending=null,again=false,retry=0;
const copy=x=>JSON.parse(JSON.stringify(x)),col=d=>d?.ruaLayout?.orbitGame?.colony;
async function once(ref){
 const source=copy(state),sent=col(source),base=root.__ruaCloudCol?copy(root.__ruaCloudCol):null;
 const guard=root.ruaColonySave,sv=root.__ruaSave=root.__ruaSave||{ok:0,err:'',n:0};sv.n++;sv.last=Date.now();
 try{
  const result=await root.firebase.firestore().runTransaction(async tx=>{
   const snap=await tx.get(ref),cloud=snap.exists?root.ruaFs.dec(snap.data()):null;
   const out=cloud?root.ruaMergeOwner(source,cloud):copy(source),remote=col(cloud);
   const pick=root.ruaImporting?.()?{col:sent,lost:remote,conflict:false}:guard.forWrite(sent,remote,base);
   out.ruaLayout=out.ruaLayout||{};const og=out.ruaLayout.orbitGame=out.ruaLayout.orbitGame||{};
   og.colony=copy(pick.col);
   if(pick.lost&&pick.conflict){const json=JSON.stringify(pick.lost);og.colonyBk=[{at:Date.now(),n:pick.lost.pcs?.length||0,nuc:pick.lost.nuc||1,json},...(og.colonyBk||[])].filter((x,i,a)=>a.findIndex(y=>y.json===x.json)===i).slice(0,6);}
   out._compensations=guard.receipts(source._compensations,cloud?._compensations,og.colony);
   // Rejected writes keep the server commit unchanged.
   if(pick.col===sent)guard.commit(og.colony);
   let encoded=root.ruaFs.enc(out);
   const bytes=()=>new TextEncoder().encode(JSON.stringify(encoded)).length;
   while(bytes()>950000&&og.colonyBk?.length>1){og.colonyBk.pop();encoded=root.ruaFs.enc(out);}
   if(bytes()>1000000)throw Object.assign(new Error('Documento excede o limite da nuvem'),{code:'resource-exhausted'});
   tx.set(ref,encoded,{mergeFields:Object.keys(encoded)});
   return{out,rejected:pick.conflict,notify:pick.conflict&&guard.pick(sent,remote)?.conflict};
  });
  const saved=col(result.out),live=col(state);root.__ruaCloudCol=copy(saved);
  if(result.rejected){guard.checkpoint(sent,'sync-conflict');root.__ruaColonyConflict=Date.now();
   // Keep edits made during upload in recovery, then follow the committed server.
   guard.checkpoint(live,'sync-conflict-live');state.ruaLayout.orbitGame.colony=copy(saved);
   if(result.notify&&Date.now()-(root.__ruaConflictToast||0)>30000){root.__ruaConflictToast=Date.now();root.showToast?.('Outro aparelho salvou primeiro. Carreguei a versão da nuvem e guardei a cópia deste aparelho em Recuperar progresso.');}
  }else guard.advance(live,sent,saved);
  state._compensations=guard.receipts(state._compensations,result.out._compensations,col(state));
  if(result.out.ruaLayout?.orbitGame?.colonyBk)state.ruaLayout.orbitGame.colonyBk=result.out.ruaLayout.orbitGame.colonyBk;
  try{localStorage.setItem('CESTILLE_SECOND_BRAIN_V4',JSON.stringify(state));}catch(e){}
  if(result.rejected)root.dispatchEvent(new Event('cestille-colony-synced'));
  sv.ok=Date.now();sv.err='';root.__ruaSaveErr='';root.dispatchEvent(new Event('cestille-cloud-saved'));return true;
 }catch(e){sv.err=e.code||'sync-failed';sv.errAt=Date.now();root.__ruaSaveErr=sv.err;throw e;}
 finally{sv.n=Math.max(0,sv.n-1);}
}
root.ruaOwnerCloudSave=function(ref){
 if(pending){again=true;return pending;}
 clearTimeout(retry);
 pending=(async()=>{let n=0;do{again=false;await once(ref);}while(again&&++n<2);})().finally(()=>{pending=null;if(again)retry=setTimeout(()=>root.ruaOwnerCloudSave(ref).catch(()=>{}),800);});
 pending.catch(()=>{retry=setTimeout(()=>root.ruaOwnerCloudSave(ref).catch(()=>{}),15000);});
 return pending;
};
})(window);
