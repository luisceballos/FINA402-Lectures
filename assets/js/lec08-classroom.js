/* Lec08 unified FCFE activity. Existing legacy result fields are retained. */
const FCFE_MODEL='fcfe-unified-v3';
const directPriceBasis='total-equity';
const LEVERAGE_BASIS='debt-assets';
const f8ddmPrice=d=>d.ddmEquity/d.shares;
lec08Assignment=function(id){
 let h=2166136261;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;
 const pick=(a,b)=>{h=(Math.imul(h,1664525)+1013904223)>>>0;return Math.round(a+h/4294967296*(b-a));};
 const index=LOGIN_ROSTER.findIndex(s=>s.id===id),ni=pick(160,420)+(index+1)/100;
 const d={model:FCFE_MODEL,caseId:'L8-'+String(index+1).padStart(3,'0')+'-DA',ni,da:pick(12,25),netCapex:Math.round(ni*.30),wc:Math.round(ni*.12),leverage:pick(28,47)/100,leverageBasis:LEVERAGE_BASIS,roe:pick(10,14),rf:pick(30,40)/10,beta:pick(80,130)/100,erp:5,shares:pick(25,70),payout:pick(65,85)};
 d.capex=d.netCapex+d.da;const r=fcfeAnswer(d);d.ddmEquity=Math.round(r.equity*d.payout/100);return d;
};
function fcfeAnswer(d){const er=(1-d.leverage)*(d.capex-d.da+d.wc),fcfe=d.ni-er,g=er/d.ni*d.roe,k=d.rf+d.beta*d.erp,equity=fcfe*(1+g/100)/((k-g)/100);return {er,fcfe,g,k,equity,price:equity/d.shares};}
const EXAMPLE=lec08Assignment('guided-example');
act1Answer=fcfeAnswer;
act2Answer=fcfeAnswer;
const f8money=v=>Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const f8fields=()=>[['fcfe','a) Current FCFE ($m)'],['g','b) Sustainable growth (%)'],['k','c) Cost of equity (%)'],['equity','d) FCFE total intrinsic equity value ($m)']];
const f8hints={fcfe:'Find net CapEx, add the increase in working capital, multiply by (1 − L), then subtract equity reinvestment from net income.',g:'Growth = (equity reinvestment / net income) × ROE. Enter the result as a percent.',k:'Cost of equity = risk-free rate + beta × equity risk premium. Enter a percent.',equity:'Grow FCFE once and divide by (cost of equity − growth), using decimal rates. Report total equity value in $m; do not divide by shares.'};
practiceGrade=function(d,a,answer){
 if(a!==1)return {ok:false,hint:'This lecture has one combined activity.'};
 const truth=fcfeAnswer(d),submitted={},correct={};
 for(const [key] of f8fields()){if(!Number.isFinite(answer[key]))return {ok:false,hint:'Enter a finite number for '+key+'.'};submitted[key]=answer[key];correct[key]=Math.abs(answer[key]-truth[key])<=Math.abs(truth[key])*.01 + Number.EPSILON*Math.abs(truth[key])*8;}
 const reflection=String(answer.reflection||'').trim();
 if(reflection.length<20||reflection.length>3000)return {ok:false,hint:'Explain your comparison in 20–3,000 characters.'};
 const numericScore=Object.values(correct).filter(Boolean).length;
 return {ok:true,result:{model:FCFE_MODEL,valuationBasis:directPriceBasis,leverageBasis:LEVERAGE_BASIS,submitted,correct,numericScore,reflection,reviewPoints:null,ddmEquity:d.ddmEquity,ddmPrice:f8ddmPrice(d),shares:d.shares,...truth}};
};
function f8record(){return S.role==='preview'||S.previewId?S.localResults[1]:S.results.find(x=>x.id===S.studentId)?.fcfeActivity;}
const f8params=d=>[['Net income ($m)',d.ni],['Depreciation ($m)',d.da],['Cash CapEx ($m)',d.capex],['Increase in operating WC ($m)',d.wc],['L = book debt / assets (D/A)',d.leverage],['ROE (%)',d.roe],['Risk-free rate (%)',d.rf],['Equity beta',d.beta],['Equity risk premium (%)',d.erp],['Given DDM total equity value ($m)',d.ddmEquity]];
renderActivity=function(){
 const host=$('activity-1');if(!host)return;
 if(S.role==='instructor'&&!S.previewId){renderDashboard(1,host);return;}
 const st=currentStudent();if(!st?.assignment){host.innerHTML='<div class="card">Enter through the Hub to receive your case.</div>';return;}
 const d=st.assignment,demo=S.role==='preview'||!!S.previewId,saved=f8record(),r=saved?.valuationBasis===directPriceBasis&&saved.leverageBasis===LEVERAGE_BASIS?saved:null;
 host.innerHTML=(demo?'<div class="demo-banner">Demonstration only. No attendance or scores are recorded.</div>':'')+
 '<div class="fcf-grid"><div class="card"><h3>'+esc(st.name)+' · '+esc(d.caseId)+'</h3><p>Fictional mature company. Assume A = D + E; other liabilities are omitted. L = D/A. The financing mix, ROE and reinvestment rate remain stable. No separately valued nonoperating assets. Compare both total equity valuations in $m.</p><div class="param-grid fcfe-inputs">'+f8params(d).map(([k,v])=>'<div class="param"><span>'+esc(k)+'</span><strong>'+f8money(v)+'</strong></div>').join('')+
 '</div><div class="note-box">The supplied DDM estimate uses a different payout forecast. Consider whether it captures retained cash and eventual distributions before choosing an approach.</div><p>Use full precision. Enter percentages such as 3.25, not 0.0325. Report total equity value in $m for both methods. No division by shares is needed.</p></div>'+
 '<form class="card activity-form" id="answer-form-1"><h3>One point per question</h3><div class="fcfe-question-grid">'+f8fields().map(([key,label])=>'<div class="fcfe-question"><label for="answer-'+key+'">'+label+'</label><input id="answer-'+key+'" type="number" step="any" required value="'+(r?esc(r.submitted[key]):'')+'"><div class="fcfe-check" id="feedback-'+key+'"></div></div>').join('')+
 '</div><label for="answer-reflection">e) Compare your FCFE total equity value with the given DDM total equity value. Which is higher? Which approach is more appropriate for equity valuation in your opinion, and why?</label><textarea class="fcfe-response" id="answer-reflection" minlength="20" maxlength="3000" required placeholder="State both values and which is higher. Then justify the more appropriate approach using payout, cash availability and the assumptions.">'+esc(r?.reflection||'')+'</textarea><p class="small">a–d: automatically checked, ±1% tolerance. e: instructor review, 0 or 1 point.</p><button class="btn btn-accent" id="submit-answer-1" type="submit">'+(demo?'Check demonstration':'Save & check all answers')+'</button><div class="activity-message" id="activity-message-1" role="status"></div></form></div>';
 $('answer-form-1').onsubmit=e=>submitAnswer(e,1);updateSavedMessage();
};
updateSavedMessage=function(){
 const r=f8record(),el=$('activity-message-1');if(!el)return;
 if(r&&(r.valuationBasis!==directPriceBasis||r.leverageBasis!==LEVERAGE_BASIS)){el.textContent='Earlier submission remains saved. This revised case uses L = D/A and asks for total equity value.';return;}
 el.textContent=r?(S.role==='preview'||S.previewId?'Demonstration · '+r.numericScore+'/4 numerical points; explanation not graded or saved.':f8status(r)):(S.messages[1]?.text||'');
 if(r)for(const [key]of f8fields()){const f=$('feedback-'+key);if(f){f.textContent=r.correct[key]?'Correct · 1 point':'Needs revision · '+f8hints[key];f.style.color=r.correct[key]?'var(--green)':'var(--red)';}}
};
function f8status(r){return 'Saved · '+r.numericScore+'/4 numerical points. '+(r.reviewPoints===null?'Question e awaits instructor review.':'Question e: '+r.reviewPoints+'/1. Total: '+(r.numericScore+r.reviewPoints)+'/5.');}
submitAnswer=async function(e,a){
 e.preventDefault();const btn=$('submit-answer-1');if(!btn||btn.disabled)return;
 const demo=S.role==='preview'||!!S.previewId;
 if(!demo&&(S.role!=='student'||!S.open)){message(1,'Assignments are closed.','error');return;}
 const answer=Object.fromEntries(f8fields().map(([k])=>[k,$('answer-'+k).valueAsNumber]));answer.reflection=$('answer-reflection').value;
 btn.disabled=true;try{
 const res=demo?practiceGrade(currentStudent().assignment,1,answer):await api('lec08Submit',{activity:1,answer});
 if(!res.ok){message(1,res.hint,'error');return;}
 if(demo)S.localResults[1]=res.result;
 else{let row=S.results.find(r=>r.id===S.studentId);if(!row){row={id:S.studentId,section:S.section};S.results.push(row);}row.fcfeActivity=res.result;}
 message(1,demo?'Demonstration · '+res.result.numericScore+'/4 numerical points; explanation not graded or saved.':f8status(res.result),res.result.numericScore===4?'success':'error');updateSavedMessage();
 }catch(err){message(1,errorText(err),'error');}finally{btn.disabled=false;}
};
async function f8review(studentId,points,expectedReflection){
 if(![0,1].includes(points)||S.role!=='instructor'||S.previewId||!LecturePlatform.teacher(firebase.auth().currentUser))return;
 try{const sessionId=S.sessionId,section=window.lectureTeachingSection?.()||S.section,ref=LecturePlatform.sessions('lec08').doc(sessionId).collection('results').doc(studentId);
 await LecturePlatform.init().runTransaction(async tx=>{
 const [doc,cfg]=await Promise.all([tx.get(ref),tx.get(LecturePlatform.lecture('lec08'))]);const row=doc.data(),r=row?.fcfeActivity;
 if(cfg.data()?.sessionId!==sessionId||row?.section!==section||r?.model!==FCFE_MODEL)throw Error('The session or selected response changed. Reload the activity.');
 if(r.reflection!==expectedReflection)throw Error('The student revised the explanation. Review the updated text before scoring.');
 tx.set(ref,{fcfeActivity:{...r,reviewPoints:points,reviewedAt:LecturePlatform.stamp()},updatedAt:LecturePlatform.stamp()},{merge:true});
 });
 notify('Explanation score saved.');}catch(e){notify(e.message,true);}
}
function f8dashboard(a,host){
 const sec=window.lectureTeachingSection?.()||S.section,students=S.students.filter(s=>s.section===sec).sort(LecturePlatform.compareStudents);
 const rows=students.map(s=>({s,r:S.results.find(r=>r.id===s.id)?.fcfeActivity})).filter(x=>x.r?.model===FCFE_MODEL),correct=rows.filter(x=>x.r.numericScore===4);
 host.innerHTML='<div class="card"><h3>'+esc(sec)+' · '+rows.length+'/'+students.length+' submitted · '+correct.length+' numerically complete</h3><p>Correct numerical outputs appear below. Review explanations separately. Attendance and missing work remain in Settings.</p><div class="fcf-scroll"><table class="fcf-result-table"><thead><tr><th>Student</th><th>FCFE ($m)</th><th>g (%)</th><th>k (%)</th><th>FCFE equity ($m)</th><th>Score / 5</th></tr></thead><tbody>'+correct.map(({s,r})=>'<tr><td>'+esc(s.name)+'</td>'+['fcfe','g','k','equity'].map(k=>'<td>'+f8money(k==='equity'&&r.valuationBasis==='per-share'?r.submitted.price*(r.shares||s.assignment.shares):r.submitted[k])+'</td>').join('')+'<td>'+(r.numericScore+(r.reviewPoints||0))+(r.reviewPoints===null?' · e pending':'')+'</td></tr>').join('')+'</tbody></table></div></div>'+
 '<div class="card" style="margin-top:16px"><h3>Question e · instructor review</h3><p>1 point: correctly identifies the higher total equity value and justifies the more appropriate approach using payout policy, retained cash or valuation assumptions. Either model can earn credit with a defensible explanation. A higher value alone is not a justification.</p>'+rows.map(({s,r})=>'<details class="card" style="margin:10px 0"><summary>'+esc(s.name)+(r.leverageBasis!==LEVERAGE_BASIS?' [earlier leverage definition]':'')+(r.valuationBasis==='per-share'?' [earlier per-share question]':'')+' · '+r.numericScore+'/4 numerical · '+(r.reviewPoints===null?'Review pending':r.reviewPoints+'/1 explanation')+'</summary><p>FCFE total equity ($m): '+f8money(r.equity)+' · Given DDM total equity ($m): '+f8money(r.ddmEquity)+'</p><p class="fcfe-review">'+esc(r.reflection)+'</p><div class="fcfe-review-controls"><button class="btn btn-accent" data-review-student="'+esc(s.id)+'" data-points="1">Award 1 point</button><button class="btn btn-ghost" data-review-student="'+esc(s.id)+'" data-points="0">Award 0 points</button></div></details>').join('')+(rows.length?'':'<p>No submissions yet.</p>')+'</div>';
 host.querySelectorAll('[data-review-student]').forEach(b=>b.onclick=()=>f8review(b.dataset.reviewStudent,+b.dataset.points,rows.find(x=>x.s.id===b.dataset.reviewStudent).r.reflection));
}
renderDashboard=f8dashboard;drawActivityChart=function(){};
function f8waterfall(d){const vals=[['Net income',d.ni],['D&A',d.da],['CapEx',-d.capex],['ΔWC',-d.wc],['Net debt',d.netDebt]];let sum=0;const levels=vals.map(([label,v])=>{const from=sum;sum+=v;return {label,v,from,to:sum};});const min=Math.min(0,...levels.map(x=>Math.min(x.from,x.to))),max=Math.max(...levels.map(x=>Math.max(x.from,x.to)),1),range=max-min;return levels.map(x=>'<div class="fcf-water-row"><span>'+x.label+'</span><div class="fcf-water-track"><i style="left:'+((Math.min(x.from,x.to)-min)/range*100)+'%;width:'+(Math.abs(x.v)/range*100)+'%;background:'+(x.v<0?'#bb5555':'#438769')+'"></i></div><b>'+(x.v>0?'+':'')+f8money(x.v)+'</b></div>').join('')+'<div class="math-line">FCFE = '+f8money(sum)+' ($m)</div>';}
window.lec08Draw=function(){const slide=document.querySelectorAll('#deck .slide')[S.slide];if(slide?.querySelector('#cash-waterfall'))$('cash-waterfall').innerHTML=f8waterfall({ni:100,da:20,capex:+$('lab-capex').value,wc:+$('lab-wc').value,netDebt:+$('lab-debt').value});};
['lab-capex','lab-wc','lab-debt'].forEach(id=>$(id).oninput=()=>window.lec08Draw());

function f8enlarge(){const d=document.getElementById('payout-dialog');if(!d)return;const img=document.getElementById('payout-companies').cloneNode();img.removeAttribute('id');img.removeAttribute('class');d.querySelector('.payout-zoom-scroll').replaceChildren(img);d.showModal();document.getElementById('payout-close').onclick=()=>d.close();}
document.getElementById('payout-enlarge').onclick=f8enlarge;document.getElementById('payout-companies').onclick=f8enlarge;
