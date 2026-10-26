/* Lecture 10 uses the shared Hub identity, reservations, sessions and Firebase. */
(function(root){
'use strict';
const fields=['coupon','periods','price','ytm'];
const points={coupon:1,periods:1,price:1,ytm:1,classification:1};
function assignment(id){let n=2166136261;for(const c of id)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;const F=1000,c=6,T=2,m=2;const spots=Array.from({length:4},(_,i)=>+(4.5+(n%30)*.15+i*.25).toFixed(2));return {caseId:'B10-SPOT-'+n.toString(16),F,c,T,m,spots};}
function bondPrice(F,c,y,T,m){let p=0;for(let k=1;k<=T*m;k++)p+=(F*c/100/m+(k===T*m?F:0))/(1+y/100/m)**k;return p;}
function yieldFromPrice(d){let lo=-99,hi=200;for(let i=0;i<120;i++){const mid=(lo+hi)/2;if(bondPrice(d.F,d.c,mid,d.T,d.m)>d.quotePrice)lo=mid;else hi=mid;}return (lo+hi)/2;}
function answer(d){const coupon=d.F*d.c/100/d.m,periods=d.T*d.m;let price=0;for(let k=1;k<=periods;k++)price+=(coupon+(k===periods?d.F:0))/(1+d.spots[k-1]/100/d.m)**k;return {coupon,periods,price,ytm:yieldFromPrice({...d,quotePrice:price}),classification:Math.abs(price-d.F)<.005?'par':price>d.F?'premium':'discount'};}
function grade(d,submitted){const truth=answer(d),correct={};for(const k of fields){if(!Number.isFinite(submitted[k]))throw Error('Enter all four numerical answers.');correct[k]=Math.abs(submitted[k]-truth[k])<=Math.abs(truth[k])*.01+1e-10;}if(!['premium','par','discount'].includes(submitted.classification))throw Error('Choose premium, par or discount.');correct.classification=submitted.classification===truth.classification;return {model:'bond-spot-five-v5',submitted,correct,numericScore:(correct.classification?1:0)+fields.reduce((sum,k)=>sum+(correct[k]?points[k]:0),0)};}
function opened(config,section,session,key){return !!session&&config?.activityPacing?.sessionId===session&&config.activityPacing.sections?.[section]?.[key]===true;}
root.Lec10Model={assignment,answer,grade,opened};
if(typeof module!=='undefined')module.exports=root.Lec10Model;
if(typeof document==='undefined')return;
const P=LecturePlatform,$=id=>document.getElementById(id),esc=P.esc,fmt=x=>Number(x).toFixed(2),ID='lec10';
const state={role:'review',section:'S01',session:null,student:null,roster:[],participants:[],results:[],config:{},policy:{},busy:false,preview:false,previewId:null};
let stops=[],beat,entry;
const scenarioViews={};let pollMessage='';
const scenarioKey=k=>[state.session,state.section,k].join(':');
const teacher=()=>state.role==='instructor'&&P.teacher(firebase.auth().currentUser);
const live=()=>state.policy.hubStatus==='student'&&state.policy.hubSections?.[state.section]&&state.config.sessionActive&&state.config.activeSections?.[state.section]&&state.session===state.config.sessionId;
const allowed=key=>live()&&opened(state.config,state.section,state.session,key);
const feedback=text=>{$('lecture10-status').textContent=text;};
function row(){return state.results.find(r=>r.id===state.student?.id)?.bondActivity;}
function render(){
 FIDraft.connect({role:teacher()?'instructor':'student',section:state.section,activity:renderActivity,settings:renderSettings,polls:renderPolls});
 $('mode-label').textContent=(teacher()?'Instructor':state.role==='student'?state.student.name:'Review')+' · '+state.section;
 $('settings-btn').hidden=!teacher();
 if(state.role==='review'){document.querySelectorAll('.worked-answer').forEach(e=>e.hidden=false);document.querySelectorAll('#pricing-example [data-solution]').forEach(e=>e.textContent=e.dataset.solution);}
}
function inputs(d){return [['Face value ($)',d.F],['Annual coupon rate (%)',d.c],['Years to maturity',d.T],['Payments per year',d.m]].map(([k,v])=>'<tr><td>'+k+'</td><td>'+fmt(v)+'</td></tr>').join('');}
function renderActivity(){
 const h=$('activity-root');if(!h)return;
 if(teacher()&&!state.preview){
  h.innerHTML='<div class="draft-toolbar"><h3>Bond pricing activity · '+esc(state.section)+'</h3><button class="btn btn-accent" id="l10-open">'+(allowed('activity1')?'Close activity':'Open activity')+'</button><button class="btn btn-ghost" id="l10-preview">View student</button></div><p>Five questions, one point each: coupon, number of payments, price, YTM, and premium/par/discount. Activity access is closed by default and isolated by section and session.</p>'+resultsTable();
  $('l10-open').onclick=()=>control('activity1',!allowed('activity1'));$('l10-preview').onclick=()=>{state.preview=true;state.previewId=state.roster.filter(r=>r.section===state.section).sort(P.compareStudents)[0]?.id||null;renderActivity();};return;
 }
 if(!state.preview&&(state.role!=='student'||!allowed('activity1'))){h.innerHTML='<div class="note-box"><h3>Activity not open yet</h3><p>'+(state.role==='review'?'Review mode: submissions are disabled. Use the Excel example to practice.':'Wait for the instructor to open the activity for your section.')+'</p></div>';return;}
 const selected=state.preview?state.roster.find(r=>r.id===state.previewId&&r.section===state.section):state.student;
 if(!selected){h.innerHTML='<p>No students in this section.</p><button class="btn btn-ghost" id="l10-back">Return to dashboard</button>'; $('l10-back').onclick=()=>{state.preview=false;renderActivity();};return;}
 const d=assignment(selected.id),saved=state.preview?state.results.find(r=>r.id===selected.id)?.bondActivity:row();
 const legacy=!!saved&&saved.model!=='bond-spot-five-v5';
 const labels=['a) Coupon per payment ($)','b) Number of remaining payments','c) Bond price ($)','d) Annual YTM implied by your price in c (%)'];
 h.innerHTML=(state.preview?'<p>View student (read only): saved answers and assigned case. Unsubmitted typing is not visible. <button id="l10-back" class="btn btn-ghost">Return to dashboard</button></p>':'')+(state.preview?'<label>Student<select id="l10-student-view">'+state.roster.filter(r=>r.section===state.section).sort(P.compareStudents).map(r=>'<option value="'+esc(r.id)+'" '+(r.id===selected.id?'selected':'')+'>'+esc(r.name)+'</option>').join('')+'</select></label>':'')+'<div class="activity-grid"><div><h3>'+esc(d.caseId)+'</h3><table>'+inputs(d)+'</table><table class="spot-inputs"><thead><tr><th>Maturity (years)</th><th>Annual spot rate (%)</th></tr></thead><tbody>'+d.spots.map((r,i)=>'<tr><td>'+((i+1)/d.m).toFixed(1)+'</td><td>'+fmt(r)+'</td></tr>').join('')+'</tbody></table><p>Hypothetical market spot curve. Annual rates use semiannual compounding. Settlement on a coupon date; no default or optional redemption.</p><p>Discount each payment using its matching spot rate. Sum the PVs for c, then find the single annual YTM that reproduces that price for d. Download the Excel workbook and open the Activity tab. Copy YOUR four spot rates from this screen into cells B21:B24 (enter percentages, e.g. 6%). The shared workbook does not load your assigned rates automatically. Then complete the yellow answer cells and submit your answers here.</p></div><form id="l10-answer"><p>Enter percentages such as 4, not 0.04. Keep full precision. Tolerance: ±1%.</p>'+fields.map((k,i)=>'<label>'+labels[i]+'<input type="number" step="any" required id="l10-'+k+'" value="'+esc((legacy?null:saved)?.submitted?.[k]??'')+'"></label><p id="l10-feedback-'+k+'"></p>').join('')+'<label>e) Does the bond trade at premium, par, or discount?<select id="l10-classification" required><option value="">Choose…</option>'+['premium','par','discount'].map(v=>'<option value="'+v+'" '+(!legacy&&saved?.submitted?.classification===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label><p id="l10-feedback-classification"></p><button class="btn btn-accent">'+(state.preview?'Read only':'Save answers')+'</button><p id="l10-result"></p></form></div>';
 if(state.preview){$('l10-back').onclick=()=>{state.preview=false;renderActivity();};$('l10-student-view').onchange=e=>{state.previewId=e.target.value;renderActivity();};$('l10-answer').querySelectorAll('input,select,button').forEach(e=>e.disabled=true);}
 $('l10-answer').onsubmit=async e=>{e.preventDefault();if(state.preview||teacher()||state.busy)return;const button=e.target.querySelector('button');button.disabled=true;state.busy=true;try{const submitted={...Object.fromEntries(fields.map(k=>[k,$('l10-'+k).valueAsNumber])),classification:$('l10-classification').value},g=grade(d,submitted);if(!state.preview)await studentWrite('activity',g,d.caseId);displayGrade(g,state.preview);}catch(e){$('l10-result').textContent=e.message;}finally{state.busy=false;button.disabled=false;}};
 if(saved&&!legacy)displayGrade(saved,state.preview);if(legacy){$('l10-result').textContent='Previous version: '+saved.numericScore+'/5. Its saved result is preserved; these fields belong to the new spot-rate exercise.';}
}
function displayGrade(g,demo){const hints={classification:'Compare the unrounded price with face value.',coupon:'Face × annual coupon / payments per year.',periods:'Years × payments per year.',price:'Sum each cash flow multiplied by its discount factor.',ytm:'Find the periodic RATE from your spot-discounted price, coupon, principal and payment count. Multiply by payments per year × 100.'};[...fields,'classification'].forEach(k=>{const e=$('l10-feedback-'+k);if(e)e.textContent=g.correct[k]?'Correct · '+points[k]+(points[k]===1?' point':' points'):'Review: '+hints[k];});if($('l10-result'))$('l10-result').textContent=(demo?'Saved student result (read only)':'Saved')+' · '+g.numericScore+'/5';}
function resultsTable(){return '<div style="overflow:auto;max-height:46vh"><table><thead><tr><th>Student</th><th>Attendance</th><th>Score / 5</th><th>Missing</th></tr></thead><tbody>'+state.roster.filter(r=>r.section===state.section).sort(P.compareStudents).map(s=>{const p=state.participants.find(x=>x.id===s.id),r=state.results.find(x=>x.id===s.id)||{};return '<tr><td>'+esc(s.name)+'</td><td>'+(p?(Date.now()-P.millis(p.lastSeen)<90000?'Connected':'Joined / offline'):'Not joined')+'</td><td>'+P.score(ID,r)+'</td><td>'+esc(P.missing(ID,r).join(', ')||'Complete')+'</td></tr>';}).join('')+'</tbody></table></div>';}
function renderSettings(){const h=$('settings-panel');h.innerHTML='<button class="btn btn-ghost" id="l10-close">Close</button><h3>Lecture settings</h3><p>Manage Live / Review / Closed access, class password, sections and archived sessions in the <a href="Lecture-hub.html">Lecture Hub</a>.</p><label>Teaching section<select id="l10-section">'+['S01','S02','S03','S04'].map(s=>'<option '+(state.section===s?'selected':'')+'>'+s+'</option>').join('')+'</select></label><p>Session: '+esc(state.session||'Not activated in the hub')+'. Activity and surveys must be opened separately.</p>'+resultsTable();$('l10-close').onclick=()=>h.hidden=true;$('l10-section').onchange=e=>{state.section=e.target.value;state.preview=false;render();};}
function renderPolls(){for(const k of ['A','B']){
 const h=$('bond-poll-'+k.toLowerCase());if(!h)continue;
 const open=allowed('poll'+k),reveal=state.role==='review'||scenarioViews[scenarioKey(k)]===true,mine=state.participants.find(r=>r.id===state.student?.id)?.['bondVote'+k];
 const voters=state.participants.filter(r=>r.section===state.section&&Number.isInteger(r['bondVote'+k]));
 const counts=FIDraft.bondOptions.map((_,i)=>voters.filter(r=>r['bondVote'+k]===i).length);
 h.innerHTML='<p class="survey-note" data-poll-status role="status">'+esc(pollMessage)+'</p><div class="bond-poll-grid"><div><h3>What is your total return if you '+(k==='A'?'sell in one year?':'hold to maturity in two years?')+'</h3><p>Total holding-period return, not annualized.</p>'+(teacher()?'<div class="bond-controls"><button class="btn btn-accent" data-open>'+ (open?'Close survey':'Open survey')+'</button><button class="btn btn-ghost" data-reveal>'+(reveal?'Hide scenarios':'Reveal scenarios')+'</button></div>':'')+'<div class="bond-choices">'+FIDraft.bondOptions.map((t,i)=>'<button class="bond-choice '+(mine===i?'selected':'')+'" data-choice="'+i+'" '+(state.role!=='student'||!open||state.busy?'disabled':'')+'>'+String.fromCharCode(65+i)+'. '+esc(t)+'</button>').join('')+'</div><p>'+(mine!==undefined?'Saved choice: '+String.fromCharCode(65+mine):open?'Survey open':'Survey closed: instructor activation required')+'</p>'+((teacher()||reveal)?'<p>Responses (%) · '+esc(state.section)+' · not graded</p>'+counts.map((n,i)=>'<div class="vote-row"><span>'+String.fromCharCode(65+i)+'</span><div><div class="vote-fill" style="width:'+(voters.length?100*n/voters.length:0)+'%"></div></div><span>'+n+'</span></div>').join(''):'')+'</div><div>'+(reveal?'<div class="bond-scenario-charts">'+FIDraft.bondPlot(k.toLowerCase())+FIDraft.bondReturnPlot(k.toLowerCase())+'</div><p>'+(k==='A'?'E: the future resale price depends on the market rate. The one-year return is unknown today.':'C: ($1,100 − $1,000) / $1,000 = 10.00% total; annualized return = 4.88%.')+'</p><p>Same 100 scenarios in both charts. Total return = (ending value / $1,000 − 1) × 100%; not annualized. No default, fees, taxes or interim coupons.</p>':'<div class="bond-placeholder">The instructor can reveal scenarios independently of voting.</div>')+'</div></div>';
 if(teacher()){h.querySelector('[data-open]').onclick=()=>control('poll'+k,!open);h.querySelector('[data-reveal]').onclick=()=>{scenarioViews[scenarioKey(k)]=!reveal;renderPolls();};h.querySelector('[data-open]').disabled=state.busy;}
 h.querySelectorAll('[data-choice]').forEach(b=>b.onclick=async()=>{if(state.busy)return;state.busy=true;renderPolls();try{await studentWrite('poll'+k,+b.dataset.choice);feedback('Vote saved.');}catch(e){feedback(e.message);}finally{state.busy=false;renderPolls();}});
}}
async function control(key,value){
 if(!teacher()||state.busy)return;state.busy=true;pollMessage=value?'Opening for '+state.section+'…':'Closing for '+state.section+'…';renderPolls();
 try{const session=state.session,section=state.section;let updated;
 await P.init().runTransaction(async tx=>{
 const ref=P.lecture(ID),[ls,hs]=await Promise.all([tx.get(ref),tx.get(P.hub())]);
 const c=ls.data(),policy=(hs.data()?.lectures||[]).find(l=>l.id===ID);
 if(!session||c?.sessionId!==session)throw Error('In Hub Settings, set Lecture 10 to Live, enable '+section+' and save settings first.');
 P.assertOpen(policy,section);
 if(!c.sessionActive||!c.activeSections?.[section])throw Error('Enable '+section+' in Lecture 10 Hub Settings and save.');
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
 await P.init().runTransaction(async tx=>{const [hs,cs,ls,ps,rs]=await Promise.all([tx.get(P.hub()),tx.get(P.claimRef(ID,sid)),tx.get(P.lecture(ID)),tx.get(part),tx.get(result)]);const claim=cs.data(),config=ls.data();if(!claim||claim.ownerUid!==user.uid||!ps.exists||ps.data().ownerUid!==user.uid)throw Error('Rejoin with your reserved name.');P.assertOpen((hs.data()?.lectures||[]).find(l=>l.id===ID),claim.section);if(config?.sessionId!==session||!config.sessionActive||!config.activeSections?.[claim.section])throw Error('Session is closed or changed.');const key=kind==='activity'?'activity1':kind;if(!opened(config,claim.section,session,key))throw Error('The instructor has not opened this activity or survey.');if(kind==='activity')tx.set(result,{ownerUid:user.uid,section:claim.section,caseId,bondActivity:value,attemptsBond:(rs.data()?.attemptsBond||0)+1,updatedAt:P.stamp()},{merge:true});else{const k=kind.slice(-1);if(!Number.isInteger(value)||value<0||value>4)throw Error('Voting is closed.');tx.update(part,{['bondVote'+k]:value,['bondVote'+k+'At']:P.stamp()});}});
}
function subscribe(){stops.forEach(f=>f());stops=[];beat?.();state.participants=[];state.results=[];
 if(!state.session||!['instructor','student'].includes(state.role))return;
 for(const collection of ['participants','results']){let ref=P.sessions(ID).doc(state.session).collection(collection);if(!teacher())ref=ref.doc(state.student.id);stops.push(ref.onSnapshot(s=>{state[collection]=s.docs?s.docs.map(d=>({id:d.id,...d.data()})):(s.exists?[{id:s.id,...s.data()}]:[]);if(collection==='participants'){renderSettings();renderPolls();}else{renderSettings();if(teacher())renderActivity();else if(row()&&$('l10-result'))displayGrade(row(),false);}},e=>feedback('Firebase '+collection+': '+e.message)));}
 if(state.role==='student')beat=P.heartbeat(ID,state.student.id,state.session,e=>feedback(e.message));
}
async function begin(){
 const status=document.createElement('p');status.id='lecture10-status';status.setAttribute('role','status');status.style.cssText='margin:8px 22px;font-size:13px';$('deck').before(status);
 try{entry=JSON.parse(sessionStorage.getItem('lecture-hub-entry')||'null');if(!entry||entry.lectureId!==ID||Date.now()-entry.issuedAt>12*3600000){location.replace('Lecture-hub.html');return;}await P.ready();
 const hs=await P.hub().get();state.policy=(hs.data()?.lectures||[]).find(l=>l.id===ID)||{};
 if(entry.role==='instructor'&&P.teacher(firebase.auth().currentUser)){
  state.role='instructor';const roster=await P.init().collection('fina402_free/course/students').get();state.roster=roster.docs.map(d=>({id:d.id,...d.data()}));state.section=['S01','S02','S03','S04'].find(s=>state.policy.hubSections?.[s])||'S01';
 }else if(state.policy.hubStatus==='guest'){state.role='review';}
 else{if(!entry.student)throw Error('Select your name in the Lecture Hub.');state.student=entry.student;state.section=entry.student.section;P.assertOpen(state.policy,state.section);$('lecture10-gate-message').textContent=entry.student.name+' · '+state.section+' — enter the class password.';$('lecture10-login').hidden=false;$('lecture10-login').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{const joined=await P.join(ID,state.student,$('lecture10-code').value);state.role='student';state.session=joined.sessionId;$('lecture10-code').value='';await watch();}catch(e){$('lecture10-gate-message').textContent=e.message;}finally{b.disabled=false;}};return;}
 await watch();
 }catch(e){$('lecture10-gate-message').textContent='Could not open Lecture 10: '+e.message;}
}
async function watch(){const ls=await P.lecture(ID).get();state.config=ls.data()||{};state.session=state.config.sessionId||null;subscribe();$('lecture10-gate').remove();render();
 P.lecture(ID).onSnapshot(s=>{const previous=state.session;state.config=s.data()||{};state.session=state.config.sessionId||null;if(previous!==state.session){state.preview=false;subscribe();if(state.role==='student'){state.role='review';beat?.();feedback('Session changed. Rejoin through the Hub.');}}render();},e=>feedback('Configuration unavailable: '+e.message));
 P.hub().onSnapshot(s=>{state.policy=(s.data()?.lectures||[]).find(l=>l.id===ID)||{};render();},e=>feedback('Hub access unavailable: '+e.message));
}
begin();
})(typeof window!=='undefined'?window:globalThis);
