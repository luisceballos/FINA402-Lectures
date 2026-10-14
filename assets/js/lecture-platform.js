/* Shared course access. No writes happen merely by loading this file. */
(function (root) {
  'use strict';
  const PATHS = {lec04:'lec04/publicConfig',lec05:'fina402_free/course/lectures/lec05',lec06:'lec06/publicConfig',lec07:'lec07/publicConfig'};
  const EMAIL = 'luisceballos@gmail.com';
  const cfg = {apiKey:'AIzaSyAjHL3MztreUN7J7QKW3q_nRbiNoxLwA0E',authDomain:'fina402-60e86.firebaseapp.com',projectId:'fina402-60e86',storageBucket:'fina402-60e86.firebasestorage.app',messagingSenderId:'1058911893067',appId:'1:1058911893067:web:0ab85f8a600d4fb8d2ffce'};
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function compareStudents(a,b) { const name=x=>String(x.name||'').trim(),surname=x=>String(x.lastName||x.last_name||name(x).split(',')[0]).trim();return surname(a).localeCompare(surname(b),'en',{sensitivity:'base'})||name(a).localeCompare(name(b),'en',{sensitivity:'base'}); }
  const millis = v => v?.toMillis ? v.toMillis() : typeof v === 'number' ? v : v?.seconds ? v.seconds*1000 : 0;
  function score(id,r) { if(id==='lec08'&&r.fcfeActivity?.model==='fcfe-unified-v3'){const a=r.fcfeActivity;return ['fcfe','g','k',a.valuationBasis==='per-share'?'price':'equity'].filter(k=>a.correct?.[k]===true).length+(a.reviewPoints===1?1:0);} return id==='lec04' ? (r.p1?3:0)+(r.p2?1:0)+(r.sr?1:0) : (r.activity1?3:0)+(r.activity2?2:0); }
  function missing(id,r) { if(id==='lec08'&&r.fcfeActivity?.model==='fcfe-unified-v3'){const a=r.fcfeActivity;return [...[['fcfe','a: FCFE'],['g','b: growth'],['k','c: cost of equity'],[a.valuationBasis==='per-share'?'price':'equity',a.valuationBasis==='per-share'?'d: price per share':'d: equity value']].filter(([k])=>!a.correct?.[k]).map(([,v])=>v),...(a.reviewPoints===null?['e: instructor review pending']:a.reviewPoints===0?['e: 0 points']:[])];}if(id==='lec08'&&!r.activity1&&!r.activity2)return ['FCFE activity']; return (id==='lec04' ? [['p1','P1'],['p2','P2'],['sr','Sharpe']] : [['activity1','Activity 1'],['activity2','Activity 2']]).filter(([k])=>!r[k]).map(([,v])=>v); }
  function teacher(user) { return !!user && user.email===EMAIL && user.emailVerified===true; }
  function init() { if(!root.firebase)throw Error('Firebase is unavailable. Reconnect and reload.');if(!firebase.apps.length)firebase.initializeApp(cfg);return firebase.firestore(); }
  function hub() { return init().doc('lectures_hub/config'); }
  function lecture(id) { if(!/^lec0[1-9]$/.test(id))throw Error('Unknown lecture.');return init().doc(PATHS[id]||'lectures_hub/config/lectures/'+id); }
  function sessions(id) { return (id==='lec04'?hub().collection('lectures').doc(id):lecture(id)).collection('sessions'); }
  function stamp() { return firebase.firestore.FieldValue.serverTimestamp(); }
  async function hash(code) { const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code.trim()));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); }
  async function ready() { init();await new Promise(resolve=>{const off=firebase.auth().onAuthStateChanged(()=>{off();resolve();});}); }
  async function studentAuth() { await ready();if(teacher(firebase.auth().currentUser))throw Error('Instructor account is active. Use a separate browser profile for a real student; use instructor preview for demonstrations.');if(!firebase.auth().currentUser)await firebase.auth().signInAnonymously();return firebase.auth().currentUser; }
  async function instructor(password) { await ready();if(!teacher(firebase.auth().currentUser)){await firebase.auth().signInWithEmailAndPassword(EMAIL,password.trim());if(!teacher(firebase.auth().currentUser)){const user=firebase.auth().currentUser;if(user?.email===EMAIL&&!user.emailVerified)throw Error('Your password is correct. Verify your instructor email to access lecture settings.');await firebase.auth().signOut();throw Error('An instructor account is required.');}} }
  async function config(id) { const s=await hub().get();const c=(s.data()?.lectures||[]).find(x=>x.id===id);if(!c)throw Error('This lecture has not been configured in the hub.');return c; }
  function claimRef(id,sid) { if(!sid||sid.includes('/'))throw Error('Invalid student identifier.');return hub().collection('claims').doc(id+'--'+sid); }
  function assertOpen(c,section) { if(c?.hubStatus!=='student')throw Error('This lecture is not Live. Assignments are closed.');if(!c.hubSections?.[section])throw Error('Your section is closed.');if(!c.hubCodeHash)throw Error('The instructor must set a class password in the hub.'); }
  async function join(id,student,code) {
    const user=await studentAuth(), codeHash=await hash(code), claim=claimRef(id,student.id), ref=lecture(id), database=init();
    let sessionId;
    await database.runTransaction(async tx=>{
      const [hs,cs,ls]=await Promise.all([tx.get(hub()),tx.get(claim),tx.get(ref)]);
      const c=(hs.data()?.lectures||[]).find(x=>x.id===id);assertOpen(c,student.section);
      if(c.hubCodeHash!==codeHash)throw Error('Incorrect class password.');
      if(cs.exists&&cs.data().ownerUid!==user.uid)throw Error('This name is already reserved for this lecture. Ask your instructor to release it if needed.');
      sessionId=ls.data()?.sessionId;if(!sessionId)throw Error('The instructor must activate this lecture in the hub first.');
      const session=sessions(id).doc(sessionId);
      tx.set(claim,{ownerUid:user.uid,studentId:student.id,name:student.name,section:student.section,lectureId:id,sessionId,lastSeen:stamp(),...(cs.exists?{}:{firstSeen:stamp()}),codeHash},{merge:true});
      tx.set(session.collection('access').doc(student.id),{ownerUid:user.uid,studentId:student.id,section:student.section,codeHash,joinedAt:stamp()},{merge:true});
      tx.set(session.collection('participants').doc(student.id),{ownerUid:user.uid,name:student.name,section:student.section,lastSeen:stamp(),...(cs.exists&&cs.data().sessionId===sessionId?{}:{firstSeen:stamp()})},{merge:true});
    });
    return {studentId:student.id,name:student.name,section:student.section,sessionId};
  }
  async function submit(id,studentId,sessionId,activity,grade,caseId) {
    const user=firebase.auth().currentUser;if(!user||teacher(user))throw Error('Join as a student first.');
    const ref=lecture(id), result=sessions(id).doc(sessionId).collection('results').doc(studentId);
    await init().runTransaction(async tx=>{
      const [hs,cs,ls,rs]=await Promise.all([tx.get(hub()),tx.get(claimRef(id,studentId)),tx.get(ref),tx.get(result)]);
      const claim=cs.data();if(!claim||claim.ownerUid!==user.uid)throw Error('This name is reserved by another login.');
      assertOpen((hs.data()?.lectures||[]).find(x=>x.id===id),claim.section);
      if(ls.data()?.sessionId!==sessionId)throw Error('The session changed. Rejoin from the hub.');
      if(id==='lec07'||id==='lec08'){const pacing=ls.data()?.activityPacing;if(pacing?.sessionId!==sessionId||pacing.sections?.[claim.section]?.['activity'+activity]!==true)throw Error('Wait for your instructor to open this activity.');}
      const prior=rs.data()||{};if(activity===2&&!prior.activity1)throw Error('Complete Activity 1 first.');
      const update={section:claim.section,caseId,ownerUid:user.uid,updatedAt:stamp(),['attempts'+activity]:(prior['attempts'+activity]||0)+1};
      if(id==='lec08'&&activity===1&&grade.result?.model==='fcfe-unified-v3'){
        const previous=prior.fcfeActivity,next={...grade.result};
        if(previous?.model===next.model&&previous.valuationBasis===next.valuationBasis&&previous.leverageBasis===next.leverageBasis&&previous.reflection===next.reflection){next.reviewPoints=previous.reviewPoints;if(previous.reviewedAt)next.reviewedAt=previous.reviewedAt;}
        if(previous&&previous.valuationBasis!==next.valuationBasis){if(previous.valuationBasis==='per-share')update.fcfeActivityPriorPerShare=previous;else update.fcfeActivityPriorTotal=previous;}
        if(previous&&previous.leverageBasis!==next.leverageBasis)update.fcfeActivityPriorLeverage=previous;
        delete update.attempts1;update.attemptsUnified=(prior.attemptsUnified||0)+1;
        update.fcfeActivity=next;grade.result=next;
      }else if(grade.ok)update['activity'+activity]=grade.result;
      tx.set(result,update,{merge:true});
    });
    return grade;
  }
  async function legacySubmit(studentId,sessionId,kind,entry) {
    const user=firebase.auth().currentUser,ref=lecture('lec04'),result=sessions('lec04').doc(sessionId).collection('results').doc(studentId);
    if(!user)throw Error('Join first.');
    await init().runTransaction(async tx=>{
      const [hs,cs,ls]=await Promise.all([tx.get(hub()),tx.get(claimRef('lec04',studentId)),tx.get(ref)]);
      const c=cs.data();if(!c||c.ownerUid!==user.uid)throw Error('This login does not own the selected name.');
      assertOpen((hs.data()?.lectures||[]).find(x=>x.id==='lec04'),c.section);
      if(ls.data()?.sessionId!==sessionId)throw Error('The session changed. Please rejoin.');
      tx.set(init().collection('lec04_'+kind).doc(studentId),entry,{merge:true});
      tx.set(result,{[kind]:entry,section:c.section,ownerUid:user.uid,updatedAt:stamp()},{merge:true});
    });
  }
  function heartbeat(id,studentId,sessionId,onError) {
    let stopped=false;
    const ping=async()=>{if(stopped||document.hidden)return;try{const user=firebase.auth().currentUser,ref=claimRef(id,studentId);await init().runTransaction(async tx=>{const s=await tx.get(ref);if(!s.exists||s.data().ownerUid!==user?.uid)throw Error('Name reservation changed. Rejoin from the hub.');tx.update(sessions(id).doc(sessionId).collection('participants').doc(studentId),{lastSeen:stamp()});});}catch(e){onError?.(e);}};
    const timer=setInterval(ping,60000);ping();return()=>{stopped=true;clearInterval(timer);};
  }
  root.LecturePlatform={PATHS,EMAIL,cfg,esc,compareStudents,millis,score,missing,teacher,init,hub,lecture,sessions,stamp,hash,ready,instructor,config,claimRef,assertOpen,join,submit,legacySubmit,heartbeat};
})(typeof window!=='undefined'?window:globalThis);
