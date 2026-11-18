/* Lecture 14: local preview is isolated; hosted access uses the existing Hub. */
(function(root){
'use strict';
const QUOTE={S0:100,KP:90,KC:110,putPremium:5,callPremium:4,size:1};
const PROTECTIVE_QUOTE={asset:'Coca-Cola (KO)',S0:60,KP:55,putPremium:3,size:1};
const PROTECTIVE_PRICES=[35,40,45,50,55,60,65,70,75,80,85,90,95];
const PRICES=[60,70,80,85,90,95,100,105,110,115,120,130,140];
const hash=id=>{let h=2166136261;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;};
function assignment(id,kind){if(kind==='protective')return {...PROTECTIVE_QUOTE,caseId:'O14-KO-'+hash(id).toString(16),ST:PROTECTIVE_PRICES[hash(id)%PROTECTIVE_PRICES.length]};return {...QUOTE,caseId:'O14-'+hash(id).toString(16),ST:PRICES[hash(id)%PRICES.length]};}
const fields={protective:['portfolioValue','portfolioReturn'],collar:['collarPL','maxLoss','maxGain']};
function targets(d){const put=Math.max(d.KP-d.ST,0),call=Math.max(d.ST-d.KC,0),cost=d.S0+d.putPremium,collarCost=cost-d.callPremium;return {portfolioValue:d.ST+put,portfolioReturn:100*((d.ST+put)/cost-1),collarPL:d.ST+put-call-collarCost,maxLoss:collarCost-d.KP,maxGain:d.KC-collarCost};}
function grade(kind,d,values){if(!fields[kind])throw Error('Unknown activity.');const t=targets(d),submitted={},correct={};for(const k of fields[kind]){if(values[k]===''||values[k]==null||!Number.isFinite(Number(values[k])))throw Error('Complete every answer.');submitted[k]=Number(values[k]);correct[k]=Math.abs(submitted[k]-t[k])<=Math.max(.01,.01*Math.abs(t[k]))+1e-9;}return {submitted,correct};}
function partScore(r,kind){return fields[kind].filter(k=>r?.portfolioActivity?.model==='portfolio-options-v1'&&r.portfolioActivity[kind]?.correct?.[k]===true).length;}
function score(r){return partScore(r,'protective')+partScore(r,'collar');}
function opened(c,section,session,kind){return !!session&&c?.activityPacing?.sessionId===session&&c.activityPacing.sections?.[section]?.[kind==='survey'?'survey':kind==='protective'?'activity1':'activity2']===true;}
root.Lec14Model={assignment,targets,grade,score,partScore,opened,QUOTE,PRICES,PROTECTIVE_QUOTE,PROTECTIVE_PRICES};
if(typeof module!=='undefined')module.exports=root.Lec14Model;
if(typeof document==='undefined')return;
const P=root.LecturePlatform,$=id=>document.getElementById(id),esc=P.esc,ID='lec14',money=n=>'$'+Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const LOCAL=location.protocol==='file:'||(['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('preview')==='1');
const KEY='fina402-lec14-local-preview-portfolio-ko-v2';
const demos=[{id:'demo-alex',name:'Adams, Alex (demo)',section:'S01'},{id:'demo-jamie',name:'Brown, Jamie (demo)',section:'S01'},{id:'demo-sam',name:'Clark, Sam (demo)',section:'S02'},{id:'demo-robin',name:'Diaz, Robin (demo)',section:'S03'},{id:'demo-taylor',name:'Evans, Taylor (demo)',section:'S04'}];
const state={role:'review',section:'S01',student:null,session:null,config:{},policy:{},roster:[],participants:[],results:[],busy:false,preview:null};
let current=0,stops=[],heartbeat=null,lastSubscription='',line={protective:false,collar:false},drafts={},selected={},entry;
const teacher=()=>state.role==='instructor'&&(LOCAL||P.teacher(root.firebase?.auth().currentUser));
const live=()=>state.policy.hubStatus==='student'&&state.policy.hubSections?.[state.section]&&state.config.sessionActive&&state.config.activeSections?.[state.section]&&state.session===state.config.sessionId;
const allowed=kind=>live()&&opened(state.config,state.section,state.session,kind);
const people=()=>state.roster.filter(s=>s.section===state.section).sort(P.compareStudents);
const status=t=>{$('status').textContent=t;};
const result=id=>state.results.find(r=>r.id===id)||{};
const draftKey=(id,kind,st)=>[state.session,id,kind,st].join('|');
function baseDemo(){return {config:{sessionId:'local-demo',sessionActive:true,activeSections:{S01:true,S02:true,S03:true,S04:true},activityPacing:{sessionId:'local-demo',sections:{}}},results:[],participants:[]};}
function loadDemo(){let d;try{d=JSON.parse(localStorage.getItem(KEY));}catch{}if(!d?.config)d=baseDemo();state.config=d.config;state.session=d.config.sessionId;state.results=d.results||[];state.participants=d.participants||[];state.policy={hubStatus:state.role==='review'?'guest':'student',hubSections:{S01:true,S02:true,S03:true,S04:true}};}
function saveDemo(){try{localStorage.setItem(KEY,JSON.stringify({config:state.config,results:state.results,participants:state.participants}));}catch(e){throw Error('Local preview storage is unavailable: '+e.message);}}
function joinDemo(){const s=state.student;if(s&&!state.participants.find(p=>p.id===s.id)){state.participants.push({...s,lastSeen:Date.now()});saveDemo();}}
function go(i){current=Math.max(0,Math.min(Lec14Slides.length-1,i));document.querySelectorAll('.slide').forEach((s,j)=>s.classList.toggle('active',j===current));$('slide-ctr').textContent=(current+1)+' / '+Lec14Slides.length;$('jump-select').value=current;document.querySelectorAll('.pdot').forEach((b,j)=>b.classList.toggle('on',j===current));notes();}
function notes(){$('notes-panel').innerHTML=teacher()?'<button class="btn" id="notes-close">Close</button><h3>'+esc(Lec14Slides[current].title)+'</h3><p>'+esc(Lec14Slides[current].notes)+'</p>':'';$('notes-close')?.addEventListener('click',()=>$('notes-panel').hidden=true);}
function render(){
 $('mode-label').textContent=(LOCAL?'LOCAL PREVIEW · no Firebase writes · ':'')+(teacher()?'Instructor':state.role==='student'?state.student?.name:'Review')+' · '+state.section;
 $('settings-btn').hidden=!teacher()&&!LOCAL;$('notes-btn').hidden=!teacher();if(!teacher())$('notes-panel').hidden=true;
 document.querySelectorAll('.solution').forEach(b=>{b.hidden=!teacher();if(!teacher())b.nextElementSibling.hidden=state.role!=='review';b.textContent=b.nextElementSibling.hidden?'Show solution':'Hide solution';const blank=b.previousElementSibling;if(blank?.classList.contains('comparison-blank'))blank.hidden=!b.nextElementSibling.hidden;});
 renderQuiz('protective');renderQuiz('collar');renderSettings();notes();renderExample();renderSurvey();renderComponents();
}


const contracts=[['Call',130,12,true],['Call',150,7,true],['Call',170,3,false],['Put',150,8,false],['Put',170,14,true]];
let surveyReveal=false,surveyDraft=[];
function renderSurvey(){
 const host=$('nvda-survey');if(!host)return;
 const t=teacher(),saved=result(state.student?.id).portfolioActivity?.survey?.answers;
 const rows=state.results.filter(r=>r.section===state.section&&r.portfolioActivity?.survey?.answers);
 let body='<table><thead><tr><th>Contract</th><th>Strike K</th><th>Premium</th><th>Exercise at $160?</th>'+(t?'<th>Class responses</th>':'')+'</tr></thead><tbody>';
 contracts.forEach((c,i)=>{const yes=rows.filter(r=>r.portfolioActivity.survey.answers[i]==='YES').length,pct=rows.length?100*yes/rows.length:0;
 body+='<tr><td>'+(i+1)+'. Buy '+c[0]+'</td><td>$'+c[1]+'</td><td>$'+c[2]+'</td><td>'+(t?(surveyReveal?(c[3]?'YES':'NO'):'?'):state.role==='review'?(c[3]?'YES':'NO'):'<select id="nvda-'+i+'" '+(saved||!allowed('survey')?'disabled':'')+'><option value="">Choose</option>'+['YES','NO'].map(v=>'<option '+((saved?.[i]||surveyDraft[i])===v?'selected':'')+'>'+v+'</option>').join('')+'</select>')+'</td>'+(t?'<td><div style="display:flex;width:220px;height:12px;background:#ddd"><span style="width:'+pct+'%;background:#19764c"></span></div><small>YES '+pct.toFixed(0)+'% · NO '+(rows.length?100-pct:0).toFixed(0)+'% · n='+rows.length+'</small></td>':'')+'</tr>';
 });body+='</tbody></table>';
 if(t)body='<div class="toolbar"><button class="btn btn-accent" id="survey-open">'+(allowed('survey')?'Close':'Open')+' survey</button><button class="btn" id="survey-reveal">'+(surveyReveal?'Hide':'Reveal')+' answers</button><b>'+esc(state.section)+' · '+rows.length+' responses · 0 points</b></div>'+body;
 else if(state.role==='student')body+='<button class="btn btn-accent" id="survey-submit" '+(saved||!allowed('survey')?'disabled':'')+'>'+(saved?'Response submitted':allowed('survey')?'Submit survey':'Wait for instructor')+'</button><p id="survey-error" class="status"></p>';
 host.innerHTML=body;
 if(t){$('survey-open').onclick=()=>control('survey',!allowed('survey'));$('survey-reveal').onclick=()=>{surveyReveal=!surveyReveal;renderSurvey();};}
 else if(state.role==='student'){
 contracts.forEach((_,i)=>$('nvda-'+i).onchange=e=>surveyDraft[i]=e.target.value);
 $('survey-submit').onclick=async()=>{const answers=contracts.map((_,i)=>$('nvda-'+i).value);if(answers.some(a=>!['YES','NO'].includes(a))){$('survey-error').textContent='Choose YES or NO for all five contracts.';return;}$('survey-submit').disabled=true;try{await saveAnswer('survey',160,{answers});surveyDraft=[];renderSurvey();}catch(e){$('survey-error').textContent='Not saved: '+e.message;$('survey-submit').disabled=false;}};
 }
}
const componentStates={};
function renderComponents(){
 drawComponents('component-chart',[['stock','Stock','#777',x=>x-100],['put','Put','#1976a3',x=>Math.max(90-x,0)-5],['portfolio','Stock + put','#6b1a2b',x=>Math.max(x,90)-105]],'Portfolio P&amp;L = stock P&amp;L + put P&amp;L.');
 drawComponents('covered-component-chart',[['stock','Stock','#777',x=>x-100],['shortcall','Short call','#b36a12',x=>4-Math.max(x-110,0)],['covered','Covered call','#1976a3',x=>Math.min(x,110)-96]],'Covered-call P&amp;L = stock P&amp;L + short-call P&amp;L.');
 drawComponents('covered-comparison-chart',[['stock','Stock','#777',x=>x-100],['shortcall','Short call','#b36a12',x=>4-Math.max(x-110,0)],['covered','Covered call','#1976a3',x=>Math.min(x,110)-96]],'Compare stock alone with stock plus a short call, including the premium.');
 drawComponents('comparison-component-chart',[['protective','Protective put','#6b1a2b',x=>Math.max(x,90)-105],['covered','Covered call','#1976a3',x=>Math.min(x,110)-96],['collar','Collar','#19764c',x=>Math.min(Math.max(x,90),110)-101]],'Compare total portfolio P&amp;L, including premiums.');
}
function drawComponents(id,defs,note){
 const host=$(id);if(!host)return;const componentVisible=componentStates[id]||(componentStates[id]={});
 const X=x=>55+(x-40)*4,Y=y=>225-y*2.3;
 let svg='<svg viewBox="0 0 580 410" style="width:100%" role="img" aria-label="Toggle stock, put and portfolio profit and loss"><rect width="580" height="410" fill="white"/>';
 for(const y of [-60,-30,0,30,60])svg+='<path d="M55 '+Y(y)+' H540" stroke="#ddd"/><text x="45" y="'+(Y(y)+4)+'" text-anchor="end" font-size="13">'+y+'</text>';
 for(const x of [40,60,80,90,100,120,140,160])svg+='<text x="'+X(x)+'" y="380" text-anchor="middle" font-size="12">'+x+'</text>';
 svg+='<text x="55" y="30" font-size="18">P&amp;L ($), including premiums</text><text x="250" y="403" font-size="14">Stock price at expiration S_T</text>';
 for(const [k,label,color,fn] of defs)if(componentVisible[k])svg+='<path data-component="'+k+'" d="'+[40,90,100,110,160].map((x,i)=>(i?'L':'M')+X(x)+','+Y(fn(x))).join(' ')+'" fill="none" stroke="'+color+'" stroke-width="4" style="cursor:pointer"><title>'+label+' — click to hide</title></path>';
 host.innerHTML='<div class="toolbar">'+defs.map(([k,label,color])=>'<button class="btn" data-toggle="'+k+'" aria-pressed="'+componentVisible[k]+'" style="border:2px solid '+color+';opacity:'+(componentVisible[k]?1:.55)+'">'+(componentVisible[k]?'Hide ':'Add ')+label+'</button>').join('')+'</div>'+svg+'</svg><p class="small">Click a button to add/remove its line, or click a visible line to hide it. '+note+'</p>';
 host.querySelectorAll('[data-toggle],[data-component]').forEach(b=>b.onclick=()=>{const k=b.dataset.toggle||b.dataset.component;componentVisible[k]=!componentVisible[k];renderComponents();});
}
function responseChart(kind,records,reveal=false){
 const key=kind==='protective'?'portfolioValue':'collarPL',color=kind==='protective'?'#6b1a2b':'#19764c';
 const pts=records.filter(r=>r.portfolioActivity?.model==='portfolio-options-v1'&&(kind!=='protective'||r.portfolioActivity.protective?.assignment?.asset==='Coca-Cola (KO)')&&Number.isFinite(r.portfolioActivity[kind]?.submitted?.[key])).map(r=>({x:(r.portfolioActivity[kind].assignment||r.assignment).ST,y:r.portfolioActivity[kind].submitted[key],name:r.name||'Student',ok:r.portfolioActivity[kind].correct[key]}));
 const q=kind==='protective'?PROTECTIVE_QUOTE:QUOTE,xmin=kind==='protective'?30:40,xmax=kind==='protective'?100:160,knots=kind==='protective'?[30,55,100]:[40,90,110,160],expected=knots.map(ST=>targets({...q,ST})[key]),lo=Math.min(kind==='protective'?30:-20,...pts.map(p=>p.y),...expected),hi=Math.max(kind==='protective'?105:20,...pts.map(p=>p.y),...expected),pad=(hi-lo)*.08;
 const X=v=>65+(v-xmin)/(xmax-xmin)*505,Y=v=>255-(v-lo+pad)/(hi-lo+2*pad)*210;
 let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 310" role="img" aria-label="Student portfolio responses"><rect width="600" height="310" fill="white"/>';
 for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4;svg+='<path d="M65 '+Y(v)+' H570" stroke="#ddd"/><text x="55" y="'+(Y(v)+5)+'" text-anchor="end" font-size="12">'+v.toFixed(0)+'</text>';}
 for(const st of (kind==='protective'?[30,40,50,55,60,70,80,90,100]:[40,60,80,100,120,140,160]))svg+='<text x="'+X(st)+'" y="277" text-anchor="middle" font-size="12">'+st+'</text>';
 svg+='<text x="65" y="20" font-size="14">'+(kind==='protective'?'Portfolio value ($)':'Collar P/L ($)')+'</text><text x="320" y="302" text-anchor="middle" font-size="14">Stock price at expiration S_T ($)</text>';
 if(reveal){const path=knots.map((st,i)=>(i?'L':'M')+X(st)+','+Y(targets({...q,ST:st})[key])).join(' ');svg+='<path d="'+path+'" fill="none" stroke="'+color+'" stroke-width="3"/>';}
 for(const p of pts)svg+='<circle cx="'+X(p.x)+'" cy="'+Y(p.y)+'" r="6" fill="'+color+'" stroke="'+(p.ok?'white':'#d88b00')+'" stroke-width="2"><title>'+esc(p.name+' · '+money(p.y)+' · '+(p.ok?'Correct':'Revise'))+'</title></circle>';
 return '<div class="chart-box">'+svg+'</svg></div><p class="chart-legend">Saved responses · Hover for student and answer · Amber outline: revise.</p>';
}
function renderExample(){
 const select=$('pp-scenario'),host=$('pp-example');if(!select||!host)return;
 const prior=host.dataset.st,wasOpen=host.querySelector('.worked-answer')?.hidden===false;
 host.innerHTML=$('pp-template-'+select.value).innerHTML;host.dataset.st=select.value;const b=host.querySelector('.solution'),panel=b.nextElementSibling,blank=b.previousElementSibling;b.hidden=!teacher();panel.hidden=!(state.role==='review'||(teacher()&&prior===select.value&&wasOpen));blank.hidden=!panel.hidden;b.textContent=panel.hidden?'Show solution':'Hide solution';b.onclick=()=>{if(!teacher())return;panel.hidden=!panel.hidden;blank.hidden=!panel.hidden;b.textContent=panel.hidden?'Show solution':'Hide solution';};select.onchange=renderExample;
}

function renderQuiz(kind){
 const host=$('quiz-'+kind),isTeacher=teacher(),student=state.preview?state.roster.find(s=>s.id===state.preview):state.student,max=kind==='protective'?2:3,label=kind==='protective'?'protective put':'collar';
 if(isTeacher&&!state.preview){const records=state.results.filter(r=>r.section===state.section),complete=people().filter(s=>partScore(result(s.id),kind)===max).length;
 host.innerHTML='<div class="toolbar"><button class="btn btn-accent" id="open-'+kind+'">'+(allowed(kind)?'Close':'Open')+' activity</button><button class="btn" id="reveal-'+kind+'">'+(line[kind]?'Hide':'Show')+' solution line</button><button class="btn" id="preview-'+kind+'">View student</button><b>'+esc(state.section)+' · '+complete+'/'+people().length+' correct · '+max+' points</b></div><div class="cols"><div>'+responseChart(kind,records,line[kind])+'</div><div><p>Same strategy, assigned expiration prices. Answers appear here after saving.</p>'+resultsTable()+'</div></div>';
 $('open-'+kind).onclick=()=>control(kind,!allowed(kind));$('reveal-'+kind).onclick=()=>{line[kind]=!line[kind];renderQuiz(kind);};$('preview-'+kind).onclick=()=>{state.preview=people()[0]?.id||null;render();};return;}
 if(!isTeacher&&(state.role!=='student'||!allowed(kind))){host.innerHTML='<div class="note-box">'+(state.role==='review'?'Review mode: submissions are disabled.':'Wait for your instructor to open the '+label+' activity for '+esc(state.section)+'.')+'</div>'+(state.role==='review'?responseChart(kind,[],true):'');return;}
 if(!student){host.innerHTML='<p>No student selected.</p>';return;}
 const d=assignment(student.id,kind),r=result(student.id),saved=r.portfolioActivity?.model==='portfolio-options-v1'?r.portfolioActivity[kind]:null,key=draftKey(student.id,kind,d.ST),values=drafts[key]||saved?.submitted||{};
 const preview=isTeacher?'<div class="toolbar"><button class="btn" id="back-'+kind+'">Back to class graph</button><label>Read-only student view<select id="student-'+kind+'">'+people().map(s=>'<option value="'+esc(s.id)+'" '+(s.id===student.id?'selected':'')+'>'+esc(s.name)+'</option>').join('')+'</select></label></div>':'';
 const labels={portfolioValue:'1. Portfolio value at T ($) — 1 point',portfolioReturn:'2. Portfolio holding-period return (%) — 1 point',collarPL:'1. Collar P/L at your S_T ($) — 1 point',maxLoss:'2. Maximum possible dollar loss (positive amount) — 1 point',maxGain:'3. Maximum possible dollar gain ($) — 1 point'};
 const inputs=fields[kind].map(k=>'<label>'+labels[k]+'<input id="answer-'+kind+'-'+k+'" type="number" step="any" required value="'+esc(values[k]??'')+'" '+(isTeacher?'disabled':'')+'></label>').join('');
 host.innerHTML=preview+'<p><b>'+esc(student.name)+'</b> · '+max+' points · ±1% relative tolerance; near zero ±0.01.</p><div class="cols"><div><div class="note-box"><b>Buy one share of '+esc(kind==='protective'?d.asset:'the example stock')+' at '+money(d.S0)+' + buy one put: K_P = '+money(d.KP)+', premium '+money(d.putPremium)+'.</b>'+(kind==='collar'?'<br>Also sell one call: K_C = $110, premium received $4.':'')+'<br>All options expire at T. Your stock price at T: <b class="assigned-st">'+money(d.ST)+'</b>.</div><form id="form-'+kind+'">'+inputs+$('hints-'+kind).innerHTML+'<p class="small">Enter percentages as numbers: 5 for 5%. No dividends, fees, taxes or financing.</p><button class="btn btn-accent" '+(isTeacher||state.busy?'disabled':'')+'>Save answers</button><p class="status" id="feedback-'+kind+'">'+(saved?fields[kind].map(k=>labels[k].split(' — ')[0]+': '+(saved.correct[k]?'Correct':'Revise')).join(' · '):'')+'</p></form><b>Activity: '+partScore(r,kind)+'/'+max+' · Total: '+score(r)+'/5</b></div><div>'+responseChart(kind,[r])+'</div></div>';
 for(const k of fields[kind])$('answer-'+kind+'-'+k).oninput=()=>{drafts[key]=Object.fromEntries(fields[kind].map(f=>[f,$('answer-'+kind+'-'+f).value]));};
 if(isTeacher){$('back-'+kind).onclick=()=>{state.preview=null;render();};$('student-'+kind).onchange=e=>{state.preview=e.target.value;render();};}
 $('form-'+kind).onsubmit=async e=>{e.preventDefault();if(isTeacher||state.busy)return;state.busy=true;e.target.querySelector('button').disabled=true;try{const values=Object.fromEntries(fields[kind].map(k=>[k,$('answer-'+kind+'-'+k).value]));await saveAnswer(kind,d.ST,{...grade(kind,d,values),assignment:d});delete drafts[key];status(LOCAL?'Saved locally (demo only).':'Saved in Firebase.');}catch(err){$('feedback-'+kind).textContent='Not saved: '+err.message;state.busy=false;e.target.querySelector('button').disabled=false;return;}state.busy=false;render();};
}
function resultsTable(){return '<div class="scroll-table"><table><thead><tr><th>Student</th><th>Attendance</th><th>Score /5</th><th>A /2 · B /3</th></tr></thead><tbody>'+people().map(s=>{const r=result(s.id),p=state.participants.find(v=>v.id===s.id);return '<tr><td>'+esc(s.name)+'</td><td>'+(p?(Date.now()-P.millis(p.lastSeen)<90000?'Connected':'Joined / offline'):'Not joined')+'</td><td>'+score(r)+'</td><td>'+partScore(r,'protective')+' · '+partScore(r,'collar')+'</td></tr>';}).join('')+'</tbody></table></div>';}
function renderSettings(){
 if(!teacher()&&!LOCAL){$('settings-panel').hidden=true;return;}
 $('settings-panel').innerHTML='<button class="btn" id="settings-close">Close</button><h3>Lecture settings</h3><p>'+ (LOCAL?'Preview only. Demo records stay in this browser. No Firebase connection.':'Manage Live / Review / Closed, password and active sections in the Lecture Hub.')+'</p><label>Teaching section<select id="teaching-section">'+['S01','S02','S03','S04'].map(s=>'<option '+(s===state.section?'selected':'')+'>'+s+'</option>').join('')+'</select></label>'+(LOCAL?'<label>Demo student<select id="demo-student">'+people().map(s=>'<option value="'+esc(s.id)+'" '+(s.id===state.student?.id?'selected':'')+'>'+esc(s.name)+'</option>').join('')+'</select></label><button class="btn" id="reset-demo">Clear local demo answers</button>':'')+resultsTable();
 $('settings-close').onclick=()=>$('settings-panel').hidden=true;$('teaching-section').onchange=e=>{state.section=e.target.value;state.preview=null;line={protective:false,collar:false};if(LOCAL){state.student=people()[0];if(state.role==='student')joinDemo();}else subscribe();render();};
 if(LOCAL){$('demo-student').onchange=e=>{state.student=state.roster.find(s=>s.id===e.target.value);if(state.role==='student')joinDemo();render();};$('reset-demo').onclick=()=>{if(!confirm('Clear only local Lecture 14 demo answers and close its demo activities?'))return;const d=baseDemo();state.config=d.config;state.results=[];state.participants=[];drafts={};saveDemo();render();};}
}
async function control(kind,value){
 if(!teacher()||state.busy)return;state.busy=true;status('Updating access…');
 try{const session=state.session,section=state.section,key=kind==='survey'?'survey':kind==='protective'?'activity1':'activity2';
 const update=c=>{const old=c.activityPacing?.sessionId===session?c.activityPacing:{sessionId:session,sections:{}};return {...old,sections:{...old.sections,[section]:{...old.sections?.[section],[key]:value}}};};
 if(LOCAL){state.config.activityPacing=update(state.config);saveDemo();}
 else{let updated;await P.init().runTransaction(async tx=>{const ref=P.lecture(ID),[cs,hs]=await Promise.all([tx.get(ref),tx.get(P.hub())]),c=cs.data();P.assertOpen((hs.data()?.lectures||[]).find(l=>l.id===ID),section);if(!session||c?.sessionId!==session||!c.sessionActive||!c.activeSections?.[section])throw Error('Activate this lecture and section in Hub Settings first.');updated={...c,activityPacing:update(c)};tx.update(ref,{activityPacing:updated.activityPacing});});state.config=updated;}
 status(kind+' activity '+(value?'open':'closed')+' for '+section+'.');
 }catch(e){status('Could not change access: '+e.message);}finally{state.busy=false;render();}
}
async function saveAnswer(kind,st,g){
 if(state.role!=='student'||!allowed(kind))throw Error('The instructor has not opened this activity for your section.');
 const sid=state.student.id,session=state.session,section=state.section;
 const merge=prior=>({...(prior.portfolioActivity?.model==='portfolio-options-v1'?prior.portfolioActivity:{}),model:'portfolio-options-v1',[kind]:kind==='survey'?(prior.portfolioActivity?.survey||g):g});
 if(LOCAL){const prior=result(sid),next={...prior,id:sid,name:state.student.name,section,assignment:assignment(sid),portfolioActivity:merge(prior),updatedAt:Date.now()};state.results=state.results.filter(r=>r.id!==sid).concat(next);saveDemo();renderSettings();return;}
 const user=firebase.auth().currentUser;if(!user||P.teacher(user))throw Error('A student login is required.');
 const ref=P.sessions(ID).doc(session).collection('results').doc(sid),part=P.sessions(ID).doc(session).collection('participants').doc(sid);let next;
 await P.init().runTransaction(async tx=>{const [hs,cs,ls,ps,rs]=await Promise.all([tx.get(P.hub()),tx.get(P.claimRef(ID,sid)),tx.get(P.lecture(ID)),tx.get(part),tx.get(ref)]),claim=cs.data(),c=ls.data();
 if(!claim||claim.ownerUid!==user.uid||claim.sessionId!==session||claim.section!==section||!ps.exists||ps.data().ownerUid!==user.uid)throw Error('Rejoin through the Hub with your reserved name.');
 P.assertOpen((hs.data()?.lectures||[]).find(l=>l.id===ID),section);if(c?.sessionId!==session||!c.sessionActive||!c.activeSections?.[section]||!opened(c,section,session,kind))throw Error('This activity is closed or its session changed.');
 const prior=rs.data()||{};next={...prior,ownerUid:user.uid,name:state.student.name,section,caseId:assignment(sid).caseId,assignment:assignment(sid),portfolioActivity:merge(prior),attemptsPortfolio:(prior.attemptsPortfolio||0)+1,updatedAt:P.stamp()};tx.set(ref,next,{merge:true});});
 state.results=state.results.filter(r=>r.id!==sid).concat({id:sid,...next});renderSettings();
}
function subscribe(){
 const key=[state.role,state.section,state.session].join('|');if(key===lastSubscription)return;lastSubscription=key;stops.forEach(f=>f());stops=[];heartbeat?.();state.results=[];state.participants=[];
 if(!state.session||!['student','instructor'].includes(state.role))return;
 for(const collection of ['results','participants']){let ref=P.sessions(ID).doc(state.session).collection(collection);ref=teacher()?ref.where('section','==',state.section):ref.doc(state.student.id);stops.push(ref.onSnapshot(s=>{state[collection]=s.docs?s.docs.map(d=>({id:d.id,...d.data()})):(s.exists?[{id:s.id,...s.data()}]:[]);if(collection==='results'){renderQuiz('protective');renderQuiz('collar');renderSurvey();}renderSettings();},e=>status('Firebase '+collection+': '+e.message)));}
 if(state.role==='student')heartbeat=P.heartbeat(ID,state.student.id,state.session,e=>status(e.message));
}
function syncAccess(){
 if(state.role==='student'&&!live())status('Your section is closed. Submissions are disabled.');render();
}
async function watch(){const ls=await P.lecture(ID).get();state.config=ls.data()||{};state.session=state.config.sessionId||null;subscribe();$('lecture14-gate').remove();render();
 P.lecture(ID).onSnapshot(s=>{const prev=state.session;state.config=s.data()||{};state.session=state.config.sessionId||null;if(prev!==state.session){state.preview=null;line={protective:false,collar:false};if(state.role==='student'){state.role='review';status('Session changed. Rejoin through the Hub.');}subscribe();}syncAccess();},e=>status('Configuration unavailable: '+e.message));
 P.hub().onSnapshot(s=>{state.policy=(s.data()?.lectures||[]).find(l=>l.id===ID)||{};syncAccess();},e=>status('Hub unavailable: '+e.message));
}
async function loadScript(src){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('Could not load Firebase. Check your connection and reload.'));document.head.appendChild(s);});}
async function begin(){
 if(LOCAL){state.role='instructor';state.roster=demos;state.student=demos[0];loadDemo();$('preview-tools').hidden=false;$('preview-role').onchange=e=>{state.role=e.target.value;state.preview=null;line={protective:false,collar:false};loadDemo();if(state.role==='student')joinDemo();render();};window.addEventListener('storage',e=>{if(e.key===KEY){loadDemo();render();}});$('lecture14-gate').remove();render();return;}
 try{entry=JSON.parse(sessionStorage.getItem('lecture-hub-entry')||'null');if(!entry||entry.lectureId!==ID||Date.now()-entry.issuedAt>12*3600000||entry.issuedAt>Date.now()+60000){location.replace('Lecture-hub.html');return;}
 for(const name of ['app','auth','firestore'])await loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-'+name+'-compat.js');await P.ready();state.policy=( (await P.hub().get()).data()?.lectures||[]).find(l=>l.id===ID)||{};
 if(entry.role==='instructor'&&P.teacher(firebase.auth().currentUser)){state.role='instructor';const roster=await P.init().collection('fina402_free/course/students').get();state.roster=roster.docs.map(d=>({id:d.id,...d.data()}));state.section=['S01','S02','S03','S04'].find(s=>state.policy.hubSections?.[s])||'S01';}
 else if(state.policy.hubStatus==='guest')state.role='review';
 else{if(!entry.student)throw Error('Select your section and name in the Hub.');state.student=entry.student;state.section=entry.student.section;state.roster=[entry.student];P.assertOpen(state.policy,state.section);$('gate-message').textContent=entry.student.name+' · '+state.section+' — confirm this is your name, then enter the class password.';$('login').hidden=false;$('login').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{const joined=await P.join(ID,state.student,$('class-code').value);state.role='student';state.session=joined.sessionId;$('class-code').value='';await watch();}catch(err){$('gate-message').textContent=err.message;}finally{b.disabled=false;}};return;}
 await watch();
 }catch(e){$('gate-message').textContent='Could not open Lecture 14: '+e.message;}
}
// Navigation and teaching controls.
const slides=root.Lec14Slides;$('jump-select').innerHTML=slides.map((s,i)=>'<option value="'+i+'">'+(i+1)+'. '+esc(s.title)+'</option>').join('');$('jump-select').onchange=e=>go(+e.target.value);
 $('progress-dots').innerHTML=slides.map((_,i)=>'<button class="pdot" aria-label="Slide '+(i+1)+'"></button>').join('');document.querySelectorAll('.pdot').forEach((b,i)=>b.onclick=()=>go(i));$('prev-btn').onclick=()=>go(current-1);$('next-btn').onclick=()=>go(current+1);
 $('settings-btn').onclick=()=>{$('settings-panel').hidden=!$('settings-panel').hidden;$('notes-panel').hidden=true;};$('notes-btn').onclick=()=>{$('notes-panel').hidden=!$('notes-panel').hidden;$('settings-panel').hidden=true;};
 document.querySelectorAll('.solution').forEach(b=>b.onclick=()=>{if(!teacher())return;b.nextElementSibling.hidden=!b.nextElementSibling.hidden;b.textContent=b.nextElementSibling.hidden?'Show solution':'Hide solution';const blank=b.previousElementSibling;if(blank?.classList.contains('comparison-blank'))blank.hidden=!b.nextElementSibling.hidden;});
 document.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName))return;if(e.key==='ArrowRight')go(current+1);if(e.key==='ArrowLeft')go(current-1);});
 root.Lec14UI={go,getState:()=>({role:state.role,section:state.section,current,local:LOCAL})};go(0);begin();
})(typeof window!=='undefined'?window:globalThis);
