/* Lec07 instructor-paced activities. One configuration update when an activity opens. */
(function(){
'use strict';
const P=LecturePlatform,previousRender=renderActivity;
const pending=new Set();
function allowed(a){
 const p=S.config?.activityPacing;
 return p?.sessionId===S.sessionId&&p.sections?.[S.section]?.['activity'+a]===true;
}
async function setOpen(a,value){
 const sec=window.lectureTeachingSection?.()||S.section,session=S.sessionId;
 const key=session+'/'+sec+'/'+a;
 if(!session||pending.has(key)||!P.teacher(firebase.auth().currentUser))return;
 
 pending.add(key);renderActivity();
 try{
  await P.init().runTransaction(async tx=>{
   const ref=P.lecture('lec07'),[doc,hub]=await Promise.all([tx.get(ref),tx.get(P.hub())]);
   const cfg=doc.data(),policy=(hub.data()?.lectures||[]).find(l=>l.id==='lec07');
   if(cfg?.sessionId!==session)throw Error('Session changed. Reopen the lecture from the Hub.');
   if(policy?.hubStatus!=='student'||!policy.hubSections?.[sec]||!cfg.sessionActive||!cfg.activeSections?.[sec])throw Error('Set this lecture and section to Live in the Hub first.');
   const prior=cfg.activityPacing?.sessionId===session?cfg.activityPacing:{sessionId:session,sections:{}};
   if(prior.sections?.[sec]?.['activity'+a]===value)return;
   tx.update(ref,{activityPacing:{sessionId:session,sections:{...prior.sections,[sec]:{...prior.sections?.[sec],['activity'+a]:value}}}});
  });
 }catch(e){notify('Activity access could not change: '+e.message,true);}
 finally{pending.delete(key);if(isActivity())renderActivity();}
}
renderActivity=function(){
 const a=activityNumber();
 if(S.role==='student'&&!allowed(a)){
  $('activity-'+a).innerHTML='<div class="card"><h3>Activity '+a+' is not open yet</h3><p>Waiting for the instructor to open this activity for your section. Keep following the lecture.</p></div>';
  return;
 }
 previousRender();
 if(S.role==='instructor'&&P.teacher(firebase.auth().currentUser)){
  const sec=window.lectureTeachingSection?.()||S.section;
  const opened=S.config?.activityPacing?.sessionId===S.sessionId&&S.config.activityPacing.sections?.[sec]?.['activity'+a]===true;
  const busy=pending.has(S.sessionId+'/'+sec+'/'+a),bar=document.createElement('div');
  bar.className='card';bar.style.cssText='padding:12px 16px;margin-bottom:12px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;flex-shrink:0';
  bar.innerHTML='<strong>Activity '+a+' · '+P.esc(sec)+' · '+(opened?'Open':'Locked')+'</strong><button type="button" class="btn btn-gold" id="pacing-toggle" '+(busy?'disabled':'')+'>'+(busy?'Saving…':opened?'Close activity for this section':'Open activity for this section')+'</button><span class="small">Opening this slide does not unlock it. Closing keeps saved answers.</span>';
  bar.querySelector('button').onclick=()=>setOpen(a,!opened);
  $('activity-'+a).prepend(bar);
 }
};
window.Lec07Pacing={allowed,onConfig(){if(isActivity())renderActivity();}};
})();
