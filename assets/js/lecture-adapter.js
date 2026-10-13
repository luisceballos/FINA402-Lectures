(function(){
  'use strict';
  const id=document.currentScript.dataset.lecture,P=LecturePlatform,modern=['lec05','lec06','lec07','lec08','lec09'].includes(id),legacy=id==='lec04';
  let hubEntry;try{hubEntry=JSON.parse(sessionStorage.getItem('lecture-hub-entry')||'null');}catch{}
  if(!hubEntry||hubEntry.lectureId!==id||Date.now()-hubEntry.issuedAt>12*60*60*1000){document.documentElement.style.visibility='hidden';location.replace('Lecture-hub.html');return;}
  const layout=document.createElement('style');layout.textContent='#settings-panel{width:min(900px,96vw)!important;max-height:calc(100dvh - 100px);overflow-y:auto!important;box-sizing:border-box;padding-bottom:55px!important}.platform-roster-scroll{max-height:50vh;overflow:auto;scrollbar-gutter:stable;border:1px solid #ccd3dc}.platform-roster-scroll th{position:sticky;top:0;background:white;color:#142c46}.platform-roster-scroll td{padding:8px}';document.head.append(layout);
  function hubIdentity(){if(!hubEntry.student)return;const section=document.getElementById(modern?'gate-section':legacy?'gate-sec':'platform-section'),name=document.getElementById(modern?'gate-student':legacy?'gate-name':'platform-name');if(!section||!name)return;section.value=hubEntry.student.section;section.dispatchEvent(new Event('change'));name.value=legacy?hubEntry.student.name:hubEntry.student.id;section.disabled=true;name.disabled=true;}
  let state=null,stopBeat=null,claims=[],claimStop=null,legacySession=null,joinBusy=false,genericJoined=false;
  const instructor=()=>P.teacher(firebase.auth().currentUser);
  const hubLink='Lecture-hub.html';
  const banner=document.createElement('div');banner.id='platform-banner';banner.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:10000;background:#142c46;color:white;padding:7px 16px;font:12px Arial;display:none';document.body.append(banner);
  const say=t=>{banner.textContent=t;banner.style.display=t?'block':'none';};
  const initialGate=document.getElementById('gate');if(initialGate)initialGate.style.visibility='hidden';
  if(modern){document.getElementById('instructor-tab').hidden=true;gateRole('student');}
  if(legacy){document.querySelector('#gate .pill-tab[onclick*="prof"]').style.display='none';gateTab('student');document.getElementById('gate-code').type='password';}
  function activeSections(){
    const select=document.getElementById(modern?'gate-section':legacy?'gate-sec':'platform-section');if(!select)return;
    const value=select.value,ids=['S01','S02','S03','S04'].filter(s=>state?.hubStatus==='student'&&state.hubSections?.[s]);
    const signature=ids.join(',');if(select.dataset.sections===signature)return;select.dataset.sections=signature;
    select.innerHTML='<option value="">— Select section —</option>'+ids.map(s=>`<option value="${s}">Section ${s.slice(1)}</option>`).join('');
    select.value=ids.includes(value)?value:'';select.dispatchEvent(new Event('change'));locks();
  }
  function locks(){const uid=firebase.auth().currentUser?.uid,select=document.getElementById(modern?'gate-student':legacy?'gate-name':'platform-name');if(!select)return;[...select.options].forEach(o=>{const c=claims.find(c=>c.studentId===o.value);o.disabled=!!c&&c.ownerUid!==uid;if(o.disabled&&o.selected)select.value='';});}
  async function watchClaims(){if(claimStop||(modern&&S.role==='student'))return;if(!firebase.auth().currentUser)await firebase.auth().signInAnonymously();claimStop=P.hub().collection('claims').where('lectureId','==',id).onSnapshot(s=>{claims=s.docs.map(d=>d.data());locks();},e=>say('Name availability could not be loaded. Entry will be verified when you join. '+e.message));}
  function readonly(){
    if(instructor())return;
    if(modern){document.querySelectorAll('.activity-slide input,.activity-slide select,.activity-slide button[type="submit"]').forEach(e=>e.disabled=true);document.querySelectorAll('.activity-message').forEach(e=>e.textContent='Review only — assignments are closed.');}
    if(legacy){['p1-er','p1-sig','p2-er','sr-input'].forEach(k=>{const e=document.getElementById(k);if(e)e.disabled=true;});document.querySelectorAll('button[onclick*="submitP"],button[onclick*="submitSR"]').forEach(e=>e.disabled=true);}
  }
  function stopPresence(){stopBeat?.();stopBeat=null;}
  function startPresence(sid,session){stopPresence();stopBeat=P.heartbeat(id,sid,session,e=>{if(modern)S.open=false;say(e.message);});}
  function requireLive(){if(state?.hubStatus!=='student')throw Error('Assignments are closed. Review is read-only.');}
  let teachingSection='';
  try{teachingSection=localStorage.getItem(id+'-teaching-section')||'';}catch{}
  function selectedSection(){if(!teachingSection)teachingSection=['S01','S02','S03','S04'].find(s=>state?.hubSections?.[s])||'S01';return teachingSection;}
  window.lectureTeachingSection=selectedSection;
  function sectionPicker(){return `<label>Section <select id="platform-teaching-section">${['S01','S02','S03','S04'].map(s=>`<option value="${s}" ${s===selectedSection()?'selected':''}>${s}</option>`).join('')}</select></label>`;}
  function bindSectionPicker(redraw){document.getElementById('platform-teaching-section').onchange=e=>{teachingSection=e.target.value;try{localStorage.setItem(id+'-teaching-section',teachingSection);}catch{}if(modern){S.section=teachingSection;S.previewId='';S.localResults={};S.messages={};renderToolbar();if(isActivity())renderActivity();}redraw();};}
  function renderPanel(){
    if(!modern||S.role!=='instructor')return;const panel=document.getElementById('settings-panel');if(!panel)return;
    const oldScroll=panel.querySelector('.platform-roster-scroll')?.scrollTop||0;const students=(S.students||[]).filter(s=>s.section===selectedSection()).sort(P.compareStudents),parts=S.participants||[],results=S.results||[];
    panel.innerHTML=`<div style="display:flex;justify-content:space-between"><h3>Attendance & scores</h3><button id="platform-close-panel">Close</button></div><p>Manage passwords, sections, sessions and history in the <a href="${hubLink}" target="_blank" rel="noopener">Lecture Hub</a>.</p>${sectionPicker()}<p>Current session: ${P.esc(S.sessionId||'Not started')}. Entries and correct submissions are stored in Firebase. Connected = seen within 90 seconds; Joined / offline = attended earlier; Not joined = no recorded attendance. Scores are out of 5.</p><p>After class: open Lecture Hub → Attendance, scores & history for earlier sessions and CSV export. Instructor demonstrations do not create student submissions.</p><p>${students.length} students · Scroll the table to see the full list.</p><div class="platform-roster-scroll" tabindex="0" aria-label="Full student list"><table style="font-size:12px;width:100%"><thead><tr><th>Student</th><th>Status</th><th>Score</th><th>Activity 1 / 2</th><th>Missing</th></tr></thead><tbody>${students.filter(s=>s.section===selectedSection()).sort(P.compareStudents).map(s=>{const p=parts.find(p=>p.id===s.id),r=results.find(r=>r.id===s.id)||{};return `<tr><td>${P.esc(s.name)}<br>${P.esc(s.section)}</td><td>${p?Date.now()-P.millis(p.lastSeen)<90000?'Connected':'Joined / offline':'Not joined'}</td><td>${P.score(id,r)}/5</td><td>${[1,2].map(a=>r['activity'+a]?'Saved ✓':r['attempts'+a]?'Attempted ('+r['attempts'+a]+')':'Not submitted').join(' / ')}</td><td>${P.esc(P.missing(id,r).join(', ')||'Complete')}</td></tr>`;}).join('')}</tbody></table></div>`;
    document.getElementById('platform-close-panel').onclick=()=>panel.hidden=true;bindSectionPicker(renderPanel);panel.querySelector('.platform-roster-scroll').scrollTop=oldScroll;
  }
  let legacyPanelStops=[];
  async function otherInstructorPanel(){
    if(!instructor())return;legacyPanelStops.forEach(f=>f());legacyPanelStops=[];
    let panel=document.getElementById('platform-live-panel');if(!panel){panel=document.createElement('div');panel.id='platform-live-panel';panel.style.cssText='position:fixed;right:0;top:50px;bottom:35px;width:600px;max-width:95vw;z-index:9999;overflow:auto;background:white;color:#142c46;padding:24px;box-shadow:0 0 20px #0004;font:13px Arial';document.body.append(panel);}
    panel.hidden=false;panel.innerHTML=`<button id="platform-close-live">Close</button><h2>Live participation</h2>${sectionPicker()}<p>Settings and history: <a href="${hubLink}" target="_blank">Lecture Hub</a></p><div id="platform-live-table">Loading…</div>`;document.getElementById('platform-close-live').onclick=()=>{panel.hidden=true;legacyPanelStops.forEach(f=>f());legacyPanelStops=[];};
    try{const ref=P.lecture(id),cfg=await ref.get(),sessionId=cfg.data()?.sessionId;if(!sessionId)throw Error('Activate this lecture in the hub first.');
      const students=legacy?Object.entries(STU_DATA.students).map(([name,s])=>({id:name,name,section:s.section})):(await P.init().collection('fina402_free/course/students').get()).docs.map(d=>({id:d.id,...d.data()}));let parts=[],results=[];
      const draw=()=>{document.getElementById('platform-live-table').innerHTML=`<table style="width:100%;font-size:12px"><thead><tr><th>Student</th><th>Status</th><th>Score / 5</th><th>Missing</th></tr></thead><tbody>${students.filter(s=>s.section===selectedSection()).sort(P.compareStudents).map(s=>{const p=parts.find(r=>r.id===s.id),r=results.find(r=>r.id===s.id)||{};return `<tr><td>${P.esc(s.name)}<br>${P.esc(s.section)}</td><td>${p?Date.now()-P.millis(p.lastSeen)<90000?'Connected':'Joined / offline':'Not joined'}</td><td>${legacy?P.score(id,r):'N/A'}</td><td>${legacy?P.esc(P.missing(id,r).join(', ')||'Complete'):'No assignment'}</td></tr>`;}).join('')}</tbody></table>`;};
      bindSectionPicker(draw);const session=P.sessions(id).doc(sessionId),error=e=>document.getElementById('platform-live-table').textContent='Could not load records: '+e.message;
      legacyPanelStops.push(session.collection('participants').onSnapshot(s=>{parts=s.docs.map(d=>({id:d.id,...d.data()}));draw();},error));legacyPanelStops.push(session.collection('results').onSnapshot(s=>{results=s.docs.map(d=>({id:d.id,...d.data()}));draw();},error));const timer=setInterval(draw,15000);legacyPanelStops.push(()=>clearInterval(timer));
    }catch(e){document.getElementById('platform-live-table').textContent=e.message;}
  }
  async function enterInstructor(){
    if(!instructor())throw Error('Sign in as instructor in the Lecture Hub first.');
    if(modern){setupFirebase();applyInstructorState(await api(id+'InstructorState'));S.role='instructor';S.section=selectedSection();S.name='Instructor';document.getElementById('gate').hidden=true;document.getElementById('settings-btn').hidden=false;document.getElementById('logout-btn').textContent='Sign out';document.getElementById('user-label').textContent='Instructor';goSlide(0);startPolling();}
    else if(legacy){ROLE='professor';SECTION='ALL';STUDENT_NAME='Instructor';ACTIVE_SECTION=null;finalizeLogin();}
    say('Instructor · settings and history are managed in the Lecture Hub.');
    if(!modern){const b=document.createElement('button');b.textContent='Live participation';b.style.marginLeft='15px';b.onclick=otherInstructorPanel;banner.append(b);}
  }
  if(modern){
    const oldApi=api,oldRender=renderActivity,oldLogout=logout;
    api=async function(name,d={}){
      if(name===id+'Settings')throw Error('Manage settings in the Lecture Hub.');
      if(name===id+'InstructorState'){if(!instructor())throw Error('Sign in through the Lecture Hub.');return oldApi(name,d);}
      if(name===id+'Submit'){
        requireLive();if(S.role!=='student')throw Error('Student login required.');
        const grade=practiceGrade(S.assignment,d.activity,d.answer);
        return P.submit(id,S.studentId,S.sessionId,d.activity,grade,S.assignment.caseId);
      }
      return oldApi(name,d);
    };
    renderActivity=function(){oldRender();if(state?.hubStatus!=='student')readonly();};
    renderSettings=renderPanel;renderParticipation=renderPanel;
    login=async function(){
      if(S.gateRole==='instructor'){window.open(hubLink,'_blank');document.getElementById('gate-status').textContent='Sign in in the hub, then open this lecture using Open instructor view.';return;}
      if(joinBusy)return;
      const status=document.getElementById('gate-status'),button=document.getElementById('login-button'),selection=document.getElementById('gate-student'),section=document.getElementById('gate-section').value,code=document.getElementById('gate-secret').value;
      if(!selection.value||!section||!code.trim()){status.textContent='Choose your section and name, and enter the class password.';return;}
      if(document.getElementById('gate-confirm-step').hidden){document.getElementById('gate-confirm-name').textContent=selection.selectedOptions[0].text+' · '+section;document.getElementById('gate-confirm-step').hidden=false;button.textContent='Yes, that is me — Join class';return;}
      joinBusy=true;button.disabled=true;status.textContent='Reserving your name…';
      try{
        requireLive();setupFirebase();const student=LOGIN_ROSTER.find(s=>s.id===selection.value&&s.section===section);if(!student)throw Error('Select a valid student.');
        const studentDoc=await COURSE.collection('students').doc(student.id).get();if(!studentDoc.exists)throw Error('The course roster record is missing. Ask your instructor.');const joined=await P.join(id,student,code);
        claimStop?.();claimStop=null;claims=[];Object.assign(S,joined);S.assignment=id==='lec05'?(studentDoc.data().assignment&&Number.isFinite(studentDoc.data().assignment.muA2)?studentDoc.data().assignment:offlineAssignment(student.id)):id==='lec06'?lec06Assignment(student.id):id==='lec07'?lec07Assignment(student.id):id==='lec08'?lec08Assignment(student.id):lec09Assignment(student.id);
        S.role='student';S.open=true;S.previewId='';S.results=[];S.localResults={};S.messages={};document.getElementById('gate-secret').value='';document.getElementById('gate').hidden=true;document.getElementById('settings-btn').hidden=true;document.getElementById('user-label').textContent=S.name+' · '+S.section;document.getElementById('logout-btn').textContent='Sign out';goSlide(0);startPolling();startPresence(S.studentId,S.sessionId);say('Connected · your name is reserved for this lecture.');
      }catch(e){status.textContent=e.message;}finally{joinBusy=false;button.disabled=false;document.getElementById('gate-confirm-step').hidden=true;button.textContent='Join class';}
    };
    logout=async function(){stopPresence();if(S.role==='instructor'){location.href=hubLink;return;}/* Keep anonymous identity so the same browser can resume its reservation. */stopLive();clearInterval(S.poll);S.role=null;S.open=false;S.studentId='';S.sessionId='';S.assignment=null;S.results=[];S.name='';S.section='';S.previewId='';S.localResults={};S.messages={};document.getElementById('settings-panel').hidden=true;document.getElementById('gate').hidden=false;document.getElementById('gate-status').textContent='Signed out. Your name remains reserved to this browser.';say('');};
    document.getElementById('login-button').onclick=login;document.getElementById('logout-btn').onclick=logout;
    document.getElementById('settings-btn').onclick=()=>{document.getElementById('settings-panel').hidden=false;renderPanel();};
    document.getElementById('gate-section').addEventListener('change',locks);
    setInterval(()=>{if(S.role==='instructor'&&!document.getElementById('settings-panel').hidden)renderPanel();},15000);
    /* The old save/reset actions are no longer exposed inside lectures. */
    saveSetting=async()=>{throw Error('Use Lecture Hub settings.');};
    resetAll=resetSubmissionsOnly=async()=>{location.href=hubLink;};
  }else if(legacy){
    submitGate=async function(){
      if(GATE_MODE!=='student'){location.href=hubLink;return;}
      const err=document.getElementById('gate-err');err.style.display='none';
      try{requireLive();const section=document.getElementById('gate-sec').value,name=document.getElementById('gate-name').value,info=STU_DATA.students[name];if(!name||!info||info.section!==section)throw Error('Choose your section and name.');if(!document.getElementById('gate-code').value.trim())throw Error('Enter the class password.');_pendingLogin={role:'student',section,name,info};document.getElementById('confirm-info').textContent=name+' · '+section;document.getElementById('confirm-modal').style.display='flex';}catch(e){err.textContent=e.message;err.style.display='block';}
    };
    confirmLogin=async function(){if(joinBusy)return;joinBusy=true;const pending=_pendingLogin;try{requireLive();const j=await P.join(id,{id:pending.name,name:pending.name,section:pending.section},document.getElementById('gate-code').value);legacySession=j.sessionId;document.querySelectorAll('#p1-er,#p1-sig,#p2-er,#sr-input,button[onclick*="submitP"],button[onclick*="submitSR"]').forEach(e=>e.disabled=false);ROLE='student';SECTION=pending.section;STUDENT_NAME=pending.name;STUDENT_INFO=pending.info;STUDENT_WEIGHTS=pending.info.weights;document.getElementById('confirm-modal').style.display='none';document.getElementById('gate-code').value='';finalizeLogin();startPresence(STUDENT_NAME,legacySession);}catch(e){document.getElementById('confirm-modal').style.display='none';const el=document.getElementById('gate-err');el.textContent=e.message;el.style.display='block';}finally{joinBusy=false;}};
    saveToStore=async function(col,key,data){requireLive();await P.legacySubmit(key,legacySession,col.replace('lec04_',''),data);};
    const p1=submitP1,p2=submitP2,sr=submitSR;
    const guard=(fn,msg)=>async()=>{try{requireLive();await fn();}catch(e){showMsg(msg,'Not saved: '+e.message,'err');}};
    submitP1=guard(p1,'p1-msg');submitP2=guard(p2,'p2-msg');submitSR=guard(sr,'sr-msg');
    ['saveCode','savePin','toggleSession','toggleSection','resetAll','updateCode','updatePin'].forEach(n=>{window[n]=()=>{location.href=hubLink;};});
    document.getElementById('gate-sec').addEventListener('change',()=>setTimeout(locks,0));
  }
  async function apply(c){
    const previous=state;state=c;
    if(instructor())return;if(!hubEntry.student||c.hubStatus==='closed'||(c.hubStatus==='student'&&!c.hubSections?.[hubEntry.student.section])){location.replace(hubLink);return;}activeSections();hubIdentity();
    if(c.hubStatus==='guest'){
      stopPresence();genericJoined=false;
      if(modern){if(S.role!=='preview'){previewLecture();}document.getElementById('user-label').textContent='Review · read only';readonly();}
      else if(legacy){ROLE='guest';SECTION='Review';STUDENT_NAME='Guest';ACTIVE_SECTION=null;finalizeLogin();readonly();}
      else document.getElementById('platform-gate')?.remove();
      say('Review · lecture content is available; assignments and submissions are disabled.');
    }else if(c.hubStatus==='closed'){
      stopPresence();genericJoined=false;if(modern){stopLive();S.role=null;S.open=false;document.getElementById('gate').hidden=false;document.getElementById('gate-status').textContent='This lecture is closed. Return to the hub.';document.getElementById('login-button').disabled=true;}
      else if(legacy){ROLE=null;document.getElementById('gate').style.display='flex';document.getElementById('gate-err').textContent='This lecture is closed.';document.getElementById('gate-err').style.display='block';}
      else simpleGate();say('Lecture closed.');
    }else{
      if(modern){document.getElementById('login-button').disabled=false;if(S.role!=='student'&&S.role!=='instructor')document.getElementById('gate').hidden=false;S.open=!!c.hubSections?.[S.section];}
      else if(legacy){SESSION_ACTIVE=true;ACTIVE_SECTIONS={...c.hubSections};if(ROLE!=='student'&&ROLE!=='professor')document.getElementById('gate').style.display='flex';}
      else if(!genericJoined&&!document.getElementById('platform-gate'))simpleGate();
      await watchClaims();if(previous?.hubStatus==='guest')say('Lecture is Live. Join with your section, name and password.');
    }
  }
  function simpleGate(){
    if(document.getElementById('platform-gate'))return;const el=document.createElement('div');el.id='platform-gate';el.style.cssText='position:fixed;inset:0;z-index:9999;background:#132941;display:grid;place-items:center';el.innerHTML=`<div style="background:white;color:#142c46;padding:28px;border-radius:12px;width:360px;font:15px Arial"><h2>FINA 402 · ${id.toUpperCase()}</h2><p>Choose your name and enter the class password.</p><select id="platform-section"><option value="">Section</option>${['S01','S02','S03','S04'].map(s=>`<option>${s}</option>`).join('')}</select><select id="platform-name"><option>Choose section first</option></select><p><input type="password" id="platform-password" placeholder="Class password"></p><button id="platform-join">Join class</button><p id="platform-error"></p><a href="${hubLink}">Lecture Hub / Instructor</a></div>`;document.body.append(el);
    let roster=[];P.init().collection('fina402_free/course/students').get().then(s=>{roster=s.docs.map(d=>({id:d.id,...d.data()}));hubIdentity();}).catch(e=>document.getElementById('platform-error').textContent=e.message);
    document.getElementById('platform-section').onchange=e=>{document.getElementById('platform-name').innerHTML='<option value="">Choose your name</option>'+roster.filter(s=>s.section===e.target.value).sort(P.compareStudents).map(s=>`<option value="${P.esc(s.id)}">${P.esc(s.name)}</option>`).join('');locks();};
    document.getElementById('platform-join').onclick=async()=>{if(joinBusy)return;const student=roster.find(s=>s.id===document.getElementById('platform-name').value),error=document.getElementById('platform-error');if(!student){error.textContent='Select your name.';return;}if(!confirm('Confirm: '+student.name+' · '+student.section+'?'))return;joinBusy=true;try{requireLive();const j=await P.join(id,student,document.getElementById('platform-password').value);genericJoined=true;el.remove();startPresence(j.studentId,j.sessionId);say('Connected · '+student.name);}catch(e){error.textContent=e.message;}finally{joinBusy=false;}};
    activeSections();
  }
  async function boot(){
    try{
      await P.ready();if(modern)setupFirebase();if(legacy){buildProgressDots();await initFirebase();}
      const c=(id==='lec09'&&instructor()&&hubEntry.role==='instructor')?((await P.hub().get()).data()?.lectures||[]).find(x=>x.id===id)||{id,hubStatus:'closed',hubSections:{}}:await P.config(id);
      if(instructor()&&hubEntry.role==='instructor'){state=c;await enterInstructor();}else if(hubEntry.role==='instructor'){location.replace(hubLink);return;}
      else await apply(c);
      P.hub().onSnapshot(s=>{const c=(s.data()?.lectures||[]).find(x=>x.id===id);if(c)apply(c).catch(e=>say(e.message));},e=>{state=null;if(modern)S.open=false;say('Connection unavailable. Submissions paused. '+e.message);});
      if(legacy){const btn=document.getElementById('settings-btn');if(btn)btn.onclick=otherInstructorPanel;}
    }catch(e){say('Unable to load access settings: '+e.message);if(id==='lec09'&&hubEntry.role==='instructor'){document.getElementById('gate').hidden=false;document.getElementById('gate-box').innerHTML='<h2>Instructor view could not load</h2><p>'+P.esc(e.message)+'</p><p>No student code is needed. Return to the Hub to verify your instructor sign-in, then reopen this lecture.</p><a href="Lecture-hub.html">Return to Lecture Hub</a>';}else if(modern){document.getElementById('gate').hidden=false;document.getElementById('gate-status').textContent=e.message;}else if(!legacy)simpleGate();}finally{if(initialGate)initialGate.style.visibility='';}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
