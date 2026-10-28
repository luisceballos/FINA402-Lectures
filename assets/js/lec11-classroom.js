/* Lecture 11 uses the shared Hub identity, reservations, sessions and Firebase. */
(function(root){
'use strict';
const fields=[...Array.from({length:5},(_,i)=>'spread'+i),...Array.from({length:5},(_,i)=>'yield'+i),'portfolioSpread','portfolioYield'];
const points=Object.fromEntries(fields.map((k,i)=>[k,i<10?.4:.5]));
function assignment(id){let n=2166136261;for(const c of id)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;const rf=+(3.5+(n%21)*.05).toFixed(2),bonds=Array.from({length:5},(_,j)=>({name:'Bond '+String.fromCharCode(65+j),pd:+(.5+j*.65+((n>>>(j*3))%41)*.03).toFixed(2),R:30+((n+j)%5)*5}));return {caseId:'C11-'+n.toString(16),rf,bonds};}
function answer(d){const spreads=d.bonds.map(b=>b.pd*(1-b.R/100)*100),ys=spreads.map(v=>d.rf+v/100);return Object.fromEntries(fields.map((k,i)=>[k,[...spreads,...ys,spreads.reduce((a,b)=>a+b)/5,ys.reduce((a,b)=>a+b)/5][i]]));}
function grade(d,submitted){const truth=answer(d),correct={};for(const k of fields){if(!Number.isFinite(submitted[k]))throw Error('Enter all twelve numerical answers.');correct[k]=Math.abs(submitted[k]-truth[k])<=Math.abs(truth[k])*.01+1e-10;}return {model:'credit-portfolio-v1',submitted,correct,numericScore:Math.round(fields.reduce((n,k)=>n+(correct[k]?points[k]:0),0)*10)/10};}
function opened(config,section,session,key){return !!session&&config?.activityPacing?.sessionId===session&&config.activityPacing.sections?.[section]?.[key]===true;}
root.Lec11Model={assignment,answer,grade,opened};
if(typeof module!=='undefined')module.exports=root.Lec11Model;
if(typeof document==='undefined')return;
const P=LecturePlatform,$=id=>document.getElementById(id),esc=P.esc,fmt=x=>Number(x).toFixed(2),ID='lec11';
const state={role:'review',section:'S01',session:null,student:null,roster:[],participants:[],results:[],config:{},policy:{},busy:false,preview:false,previewId:null};
let stops=[],beat,entry;
const scenarioViews={};let pollMessage='';
const scenarioKey=k=>[state.session,state.section,k].join(':');
const teacher=()=>state.role==='instructor'&&P.teacher(firebase.auth().currentUser);
const live=()=>state.policy.hubStatus==='student'&&state.policy.hubSections?.[state.section]&&state.config.sessionActive&&state.config.activeSections?.[state.section]&&state.session===state.config.sessionId;
const allowed=key=>live()&&opened(state.config,state.section,state.session,key);
const feedback=text=>{$('lecture11-status').textContent=text;};
function row(){return state.results.find(r=>r.id===state.student?.id)?.creditActivity;}
function render(){
 FIDraft.connect({role:teacher()?'instructor':'student',section:state.section,activity:renderActivity,settings:renderSettings,polls:renderPolls});
 $('mode-label').textContent=(teacher()?'Instructor':state.role==='student'?state.student.name:'Review')+' · '+state.section;
 $('settings-btn').hidden=!teacher();
 if(state.role==='review'){document.querySelectorAll('.worked-answer').forEach(e=>e.hidden=false);document.querySelectorAll('#pricing-example [data-solution]').forEach(e=>e.textContent=e.dataset.solution);}
}
function renderActivity(){
 const h=$('activity-root');if(!h)return;
 if(teacher()&&!state.preview){h.innerHTML='<div class="draft-toolbar"><h3>Credit portfolio · '+esc(state.section)+'</h3><button class="btn btn-accent" id="l11-open">'+(allowed('activity1')?'Close activity':'Open activity')+'</button><button class="btn btn-ghost" id="l11-preview">View student</button></div><p>Five spreads: 2 points · Five YTM: 2 points · Two portfolio averages: 1 point. Tolerance ±1%.</p>'+resultsTable();$('l11-open').onclick=()=>control('activity1',!allowed('activity1'));$('l11-preview').onclick=()=>{state.preview=true;state.previewId=state.roster.filter(r=>r.section===state.section).sort(P.compareStudents)[0]?.id||null;renderActivity();};return;}
 if(!state.preview&&(state.role!=='student'||!allowed('activity1'))){h.innerHTML='<div class="note-box">'+(state.role==='review'?'Review mode: submissions are disabled.':'Wait for the instructor to open the activity for your section.')+'</div>';return;}
 const selected=state.preview?state.roster.find(r=>r.id===state.previewId&&r.section===state.section):state.student;
 if(!selected){h.innerHTML='<p>No students in this section.</p>';return;}
 const d=assignment(selected.id),saved=state.results.find(r=>r.id===selected.id)?.creditActivity;
 const field=(k,label)=>'<input aria-label="'+esc(label)+'" id="l11-'+k+'" type="number" step="any" required value="'+esc(saved?.submitted?.[k]??'')+'"><div id="l11-feedback-'+k+'" class="answer-feedback"></div>';
 h.innerHTML=(state.preview?'<p>Student view: saved answers, read only. <button id="l11-back" class="btn btn-ghost">Return to dashboard</button></p><select id="l11-student-view">'+state.roster.filter(r=>r.section===state.section).sort(P.compareStudents).map(r=>'<option value="'+esc(r.id)+'" '+(r.id===selected.id?'selected':'')+'>'+esc(r.name)+'</option>').join('')+'</select>':'')+'<p><b>'+esc(selected.name)+' · '+d.caseId+' · Treasury YTM: '+fmt(d.rf)+'%</b><br>All bonds: USD, 3 years, semiannual yield convention; 20% market-value weight each. Copy YOUR Treasury yield and PD/recovery inputs into Excel Activity.</p><form id="l11-answer"><table style="width:100%"><thead><tr><th>Bond</th><th>Annual PD (%)</th><th>Recovery (%)</th><th>Spread (bp) · 0.4 pt</th><th>YTM (%) · 0.4 pt</th></tr></thead><tbody>'+d.bonds.map((b,i)=>'<tr><td>'+b.name+'</td><td>'+fmt(b.pd)+'</td><td>'+fmt(b.R)+'</td><td>'+field('spread'+i,b.name+' spread')+'</td><td>'+field('yield'+i,b.name+' YTM')+'</td></tr>').join('')+'</tbody></table><div class="fi-columns"><label>Portfolio average spread (bp) · 0.5 pt'+field('portfolioSpread','Portfolio spread')+'</label><label>Portfolio average YTM (%) · 0.5 pt'+field('portfolioYield','Portfolio YTM')+'</label></div><button class="btn btn-accent">Save answers</button><p id="l11-result" role="status"></p></form><p style="font-size:12px">Annual spread ≈ PD × (1 − R); other premiums = 0. Enter percentages as 4.25, not 0.0425. Weighted-average YTM is not the exact combined cash-flow IRR.</p>';
 if(state.preview){$('l11-back').onclick=()=>{state.preview=false;renderActivity();};$('l11-student-view').onchange=e=>{state.previewId=e.target.value;renderActivity();};$('l11-answer').querySelectorAll('input,button').forEach(e=>e.disabled=true);}
 $('l11-answer').onsubmit=async e=>{e.preventDefault();if(state.preview||teacher()||state.busy)return;const button=e.target.querySelector('button');button.disabled=true;state.busy=true;try{const submitted=Object.fromEntries(fields.map(k=>[k,$('l11-'+k).valueAsNumber])),g=grade(d,submitted);await studentWrite('activity',g,d.caseId);displayGrade(g,false);}catch(e){$('l11-result').textContent='Not saved: '+e.message;}finally{state.busy=false;button.disabled=false;}};
 if(saved)displayGrade(saved,state.preview);
}
function displayGrade(g,preview){for(const k of fields){const e=$('l11-feedback-'+k);if(e)e.textContent=g.correct[k]?'Correct · '+points[k]+' points':'Review your calculation.';}if($('l11-result'))$('l11-result').textContent=(preview?'Saved result (read only)':'Saved in Firebase')+' · '+P.score(ID,{creditActivity:g})+'/5';}
function resultsTable(){return '<div style="overflow:auto;max-height:46vh"><table><thead><tr><th>Student</th><th>Attendance</th><th>Score / 5</th><th>Missing</th></tr></thead><tbody>'+state.roster.filter(r=>r.section===state.section).sort(P.compareStudents).map(s=>{const p=state.participants.find(x=>x.id===s.id),r=state.results.find(x=>x.id===s.id)||{};return '<tr><td>'+esc(s.name)+'</td><td>'+(p?(Date.now()-P.millis(p.lastSeen)<90000?'Connected':'Joined / offline'):'Not joined')+'</td><td>'+P.score(ID,r)+'</td><td>'+esc(P.missing(ID,r).join(', ')||'Complete')+'</td></tr>';}).join('')+'</tbody></table></div>';}
function renderSettings(){const h=$('settings-panel');h.innerHTML='<button class="btn btn-ghost" id="l11-close">Close</button><h3>Lecture settings</h3><p>Manage Live / Review / Closed access, class password, sections and archived sessions in the <a href="Lecture-hub.html">Lecture Hub</a>.</p><label>Teaching section<select id="l11-section">'+['S01','S02','S03','S04'].map(s=>'<option '+(state.section===s?'selected':'')+'>'+s+'</option>').join('')+'</select></label><p>Session: '+esc(state.session||'Not activated in the hub')+'. Open the activity separately for each section.</p>'+resultsTable();$('l11-close').onclick=()=>h.hidden=true;$('l11-section').onchange=e=>{state.section=e.target.value;state.preview=false;render();};}
function renderPolls(){}
async function control(key,value){
 if(!teacher()||state.busy)return;state.busy=true;pollMessage=value?'Opening for '+state.section+'…':'Closing for '+state.section+'…';renderPolls();
 try{const session=state.session,section=state.section;let updated;
 await P.init().runTransaction(async tx=>{
 const ref=P.lecture(ID),[ls,hs]=await Promise.all([tx.get(ref),tx.get(P.hub())]);
 const c=ls.data(),policy=(hs.data()?.lectures||[]).find(l=>l.id===ID);
 if(!session||c?.sessionId!==session)throw Error('In Hub Settings, set Lecture 11 to Live, enable '+section+' and save settings first.');
 P.assertOpen(policy,section);
 if(!c.sessionActive||!c.activeSections?.[section])throw Error('Enable '+section+' in Lecture 11 Hub Settings and save.');
 const old=c.activityPacing?.sessionId===session?c.activityPacing:{sessionId:session,sections:{}};
 const pacing={sessionId:session,sections:{...old.sections,[section]:{...old.sections?.[section],[key]:value}}};
 tx.update(ref,{activityPacing:pacing});updated={...c,activityPacing:pacing};
 });
 state.config=updated;pollMessage=(key.startsWith('poll')?'Survey '+key.slice(-1):'Activity')+(value?' is open':' is closed')+' for '+section+'.';feedback(pollMessage);
 }catch(e){pollMessage='Could not change access: '+e.message;feedback(pollMessage);}
 finally{state.busy=false;render();}
}
async function studentWrite(kind,value,caseId){
 if(state.role!=='student'||!live())throw Error('Join the live lecture first.');
 const user=firebase.auth().currentUser,sid=state.student.id,session=state.session;if(!user||P.teacher(user))throw Error('A student login is required.');
 const result=P.sessions(ID).doc(session).collection('results').doc(sid),part=P.sessions(ID).doc(session).collection('participants').doc(sid);
 await P.init().runTransaction(async tx=>{const [hs,cs,ls,ps,rs]=await Promise.all([tx.get(P.hub()),tx.get(P.claimRef(ID,sid)),tx.get(P.lecture(ID)),tx.get(part),tx.get(result)]);const claim=cs.data(),config=ls.data();if(!claim||claim.ownerUid!==user.uid||!ps.exists||ps.data().ownerUid!==user.uid)throw Error('Rejoin with your reserved name.');P.assertOpen((hs.data()?.lectures||[]).find(l=>l.id===ID),claim.section);if(config?.sessionId!==session||!config.sessionActive||!config.activeSections?.[claim.section])throw Error('Session is closed or changed.');const key=kind==='activity'?'activity1':kind;if(!opened(config,claim.section,session,key))throw Error('The instructor has not opened this activity or survey.');if(kind==='activity')tx.set(result,{ownerUid:user.uid,section:claim.section,caseId,assignment:assignment(sid),creditActivity:value,attemptsCredit:(rs.data()?.attemptsCredit||0)+1,updatedAt:P.stamp()},{merge:true});else{const k=kind.slice(-1);if(!Number.isInteger(value)||value<0||value>4)throw Error('Voting is closed.');tx.update(part,{['bondVote'+k]:value,['bondVote'+k+'At']:P.stamp()});}});
}
function subscribe(){stops.forEach(f=>f());stops=[];beat?.();state.participants=[];state.results=[];
 if(!state.session||!['instructor','student'].includes(state.role))return;
 for(const collection of ['participants','results']){let ref=P.sessions(ID).doc(state.session).collection(collection);if(!teacher())ref=ref.doc(state.student.id);stops.push(ref.onSnapshot(s=>{state[collection]=s.docs?s.docs.map(d=>({id:d.id,...d.data()})):(s.exists?[{id:s.id,...s.data()}]:[]);if(collection==='participants'){renderSettings();renderPolls();}else{renderSettings();if(teacher())renderActivity();else if(row()&&$('l11-result'))displayGrade(row(),false);}},e=>feedback('Firebase '+collection+': '+e.message)));}
 if(state.role==='student')beat=P.heartbeat(ID,state.student.id,state.session,e=>feedback(e.message));
}
async function begin(){
 const status=document.createElement('p');status.id='lecture11-status';status.setAttribute('role','status');status.style.cssText='margin:8px 22px;font-size:13px';$('deck').before(status);
 try{entry=JSON.parse(sessionStorage.getItem('lecture-hub-entry')||'null');if(!entry||entry.lectureId!==ID||Date.now()-entry.issuedAt>12*3600000){location.replace('Lecture-hub.html');return;}await P.ready();
 const hs=await P.hub().get();state.policy=(hs.data()?.lectures||[]).find(l=>l.id===ID)||{};
 if(entry.role==='instructor'&&P.teacher(firebase.auth().currentUser)){
  state.role='instructor';const roster=await P.init().collection('fina402_free/course/students').get();state.roster=roster.docs.map(d=>({id:d.id,...d.data()}));state.section=['S01','S02','S03','S04'].find(s=>state.policy.hubSections?.[s])||'S01';
 }else if(state.policy.hubStatus==='guest'){state.role='review';}
 else{if(!entry.student)throw Error('Select your name in the Lecture Hub.');state.student=entry.student;state.section=entry.student.section;P.assertOpen(state.policy,state.section);$('lecture11-gate-message').textContent=entry.student.name+' · '+state.section+' — enter the class password.';$('lecture11-login').hidden=false;$('lecture11-login').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{const joined=await P.join(ID,state.student,$('lecture11-code').value);state.role='student';state.session=joined.sessionId;$('lecture11-code').value='';await watch();}catch(e){$('lecture11-gate-message').textContent=e.message;}finally{b.disabled=false;}};return;}
 await watch();
 }catch(e){$('lecture11-gate-message').textContent='Could not open Lecture 11: '+e.message;}
}
async function watch(){const ls=await P.lecture(ID).get();state.config=ls.data()||{};state.session=state.config.sessionId||null;subscribe();$('lecture11-gate').remove();render();
 P.lecture(ID).onSnapshot(s=>{const previous=state.session;state.config=s.data()||{};state.session=state.config.sessionId||null;if(previous!==state.session){state.preview=false;if(state.role==='student'){state.role='review';feedback('Session changed. Rejoin through the Hub.');}subscribe();}render();},e=>feedback('Configuration unavailable: '+e.message));
 P.hub().onSnapshot(s=>{state.policy=(s.data()?.lectures||[]).find(l=>l.id===ID)||{};render();},e=>feedback('Hub access unavailable: '+e.message));
}
begin();
})(typeof window!=='undefined'?window:globalThis);
