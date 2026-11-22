/* Retired one-time Nimbo grant: reconcile existing receipts, never issue another egg.
   A restored backup is authoritative. Preserve any pending replacement unless the
   exact original animal is already back in the same colony. */
(function(root){'use strict';
const OWNER='k0rq9QyD37QUoGD2kacrcyX7b523',ID='owner-nimbo-authoral-rehatch-20261114-v1';
const copy=x=>JSON.parse(JSON.stringify(x));
function transform(col,receipt,uid){
 if(uid!==OWNER||!col?.zoo||!Array.isArray(col.zoo.an)||!Array.isArray(col.zoo.eggs))return null;
 if(receipt&&receipt.uid!==uid)return null;
 if(receipt?.status==='hatched'||receipt?.status==='cancelled')return null;
 const born=col.zoo.an.find(a=>a.grantId===ID),redeemed=col._grants?.[ID];
 if(born||redeemed?.status==='hatched')return{col,changedCol:false,receipt:{...receipt,uid,sp:'nimbo',status:'hatched',animalId:born?.id??redeemed.animalId,hatchedAt:redeemed?.hatchedAt||Date.now()}};
 const pending=col.zoo.eggs.find(e=>e.grantId===ID);
 const original=receipt?.original||pending?.restoreAnimal;
 const restored=original&&col.zoo.an.find(a=>a.sp==='nimbo'&&a.id===original.id&&!a.grantId);
 if(pending&&!restored)return null; // This egg holds the original animal; keep it safe.
 if(!receipt&&!pending)return null; // Retired: no new grants, even when Nimbo is present.
 const out=copy(col);
 if(pending&&restored){out.zoo.eggs=out.zoo.eggs.filter(e=>e.grantId!==ID);root.ruaColonySave?.revise(out,'nimbo-duplicate-reconciled');}
 return{col:out,changedCol:!!(pending&&restored),receipt:{...receipt,uid,sp:'nimbo',status:'cancelled',reason:'legacy-grant-retired-after-restore',cancelledAt:Date.now()}};
}
root.ruaNimboRehatch={ID,OWNER,transform};
let running=false,done=false;
async function check(){
 if(running||done||!root.firebase?.auth||!root.ruaDataReady||root.ruaColony?.isVisiting?.())return;
 const user=root.firebase.auth().currentUser;
 if(user?.uid!==OWNER||root.ruaProfile==='guest')return;
 running=true;
 try{
  const ref=root.firebase.firestore().collection('workspaces').doc('cestille_hub'),fs=root.ruaFs;
  const result=await root.firebase.firestore().runTransaction(async tx=>{
   const snap=await tx.get(ref);if(!snap.exists)return null;
   const cloud=fs.dec(snap.data()),server=cloud.ruaLayout?.orbitGame?.colony,receipt=cloud._compensations?.[ID];
   if(receipt?.status==='hatched'||receipt?.status==='cancelled')return{done:true};
   const plan=transform(server,receipt,user.uid);if(!plan)return null;
   const update={['_compensations.'+ID]:fs.enc(plan.receipt)};
   if(plan.changedCol){
    root.ruaColonySave?.commit(plan.col);
    update['ruaLayout.orbitGame.colony']=fs.enc(plan.col);
    const json=JSON.stringify(server);
    update['ruaLayout.orbitGame.colonyBk']=[{at:Date.now(),n:server.pcs?.length||0,nuc:server.nuc||1,json},...(cloud.ruaLayout.orbitGame.colonyBk||[])].slice(0,3);
   }
   tx.update(ref,update);return plan;
  });
  if(result?.done||result?.receipt?.status==='hatched'||result?.receipt?.status==='cancelled')done=true;
  // onSnapshot owns applying the confirmed colony. Never replace in-flight local edits here.
  root.__ruaNimboRehatchError='';
 }catch(e){root.__ruaNimboRehatchError=e.code||e.message;console.warn('Nimbo receipt reconciliation pending',e);}
 finally{running=false;}
}
root.ruaNimboRehatch.check=check;
if(typeof document!=='undefined'){
 setTimeout(check,1800);
 root.addEventListener('online',check);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
}
})(window);
