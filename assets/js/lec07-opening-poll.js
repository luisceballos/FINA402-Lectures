/* Lec07 opening poll. Uses only this lecture's session participation records. */
(function(){
'use strict';
const P=LecturePlatform,choices={under:'Undervalued',over:'Overvalued',depends:'Not enough information'};
let unsubscribe=null,rows=[],busy=false,message='',signature='';
const teacher=()=>S.role==='instructor'&&P.teacher(firebase.auth().currentUser);
const section=()=>teacher()?(window.lectureTeachingSection?.()||S.section):S.section;
function stop(){unsubscribe?.();unsubscribe=null;rows=[];signature='';message='';render();}
function render(){
 const chart=document.getElementById('citi-poll-chart');if(!chart)return;
 const isTeacher=teacher(),sec=section(),live=S.role==='student'&&S.open&&!!S.sessionId;
 const mine=rows.find(r=>r.id===S.studentId)?.citiVote;
 document.querySelectorAll('[data-citi-vote]').forEach(b=>{b.disabled=!live||busy;b.setAttribute('aria-pressed',String(b.dataset.citiVote===mine));b.classList.toggle('btn-gold',b.dataset.citiVote===mine);});
 const reveal=document.getElementById('citi-economics');reveal.hidden=!isTeacher;
 if(!isTeacher)document.getElementById('citi-reveal').hidden=true;
 const status=document.getElementById('citi-poll-status');
 status.textContent=message||(isTeacher?'Live responses · '+sec+' · No points.':live?(mine?'Your vote is saved. You can change it. No points.':'Choose one answer. No points.'):'Review only — voting is closed.');
 const selected=rows.filter(r=>r.section===sec&&choices[r.citiVote]),total=selected.length;
 const counts=Object.keys(choices).map(k=>selected.filter(r=>r.citiVote===k).length),key=JSON.stringify([sec,counts,S.role]);
 if(key===signature)return;signature=key;
 chart.innerHTML='<p class="tiny muted">'+(isTeacher?P.esc(sec||'Selected section'):'Your vote · Class totals are on the instructor screen')+' · '+total+' response'+(total===1?'':'s')+'</p><svg viewBox="0 0 460 142" role="img" aria-label="'+P.esc(Object.values(choices).map((label,i)=>label+': '+counts[i]).join('; '))+'">'+Object.entries(choices).map(([k,label],i)=>{const y=12+i*44,width=total?210*counts[i]/total:0;return '<text x="0" y="'+(y+15)+'" font-size="13" fill="var(--text)">'+label+'</text><rect x="173" y="'+y+'" width="210" height="24" rx="4" fill="var(--border)"/><rect x="173" y="'+y+'" width="'+width+'" height="24" rx="4" fill="var(--gold)"/><text x="393" y="'+(y+16)+'" font-size="13" fill="var(--text)">'+counts[i]+'</text>';}).join('')+'</svg>';
}
function start(){
 stop();if(!['student','instructor'].includes(S.role)||!S.sessionId||S.sessionId==='offline')return;
 let ref=P.sessions('lec07').doc(S.sessionId).collection('participants');
 if(!teacher())ref=ref.doc(S.studentId);
 unsubscribe=ref.onSnapshot(snapshot=>{rows=snapshot.docs?snapshot.docs.map(d=>({id:d.id,...d.data()})):(snapshot.exists?[{id:snapshot.id,...snapshot.data()}]:[]);render();},e=>{rows=[];message='Poll unavailable: '+e.message;render();});
}
async function vote(choice){
 if(busy||!choices[choice])return;
 if(S.role!=='student'||!S.open){message='Join the live lecture to vote.';render();return;}
 busy=true;message='Saving vote…';render();
 try{
  const user=firebase.auth().currentUser,sid=S.studentId,sessionId=S.sessionId;
  if(!user||P.teacher(user))throw Error('Join as a student first.');
  const participant=P.sessions('lec07').doc(sessionId).collection('participants').doc(sid);
  await P.init().runTransaction(async tx=>{
   const [hs,cs,ls,ps]=await Promise.all([tx.get(P.hub()),tx.get(P.claimRef('lec07',sid)),tx.get(P.lecture('lec07')),tx.get(participant)]);
   const claim=cs.data(),config=ls.data();
   if(!claim||claim.ownerUid!==user.uid||!ps.exists||ps.data().ownerUid!==user.uid)throw Error('Rejoin with your reserved name.');
   P.assertOpen((hs.data()?.lectures||[]).find(r=>r.id==='lec07'),claim.section);
   if(config?.sessionId!==sessionId||!config.sessionActive||!config.activeSections?.[claim.section])throw Error('This session is closed. Rejoin from the Hub.');
   tx.update(participant,{citiVote:choice,citiVoteAt:P.stamp()});
  });
  message='Vote saved. You can change it. No points.';
 }catch(e){message='Vote not saved: '+e.message;}
 finally{busy=false;render();}
}
document.querySelectorAll('[data-citi-vote]').forEach(b=>b.onclick=()=>vote(b.dataset.citiVote));
document.getElementById('citi-economics').onclick=()=>{if(!teacher())return;const el=document.getElementById('citi-reveal');el.hidden=!el.hidden;document.getElementById('citi-economics').setAttribute('aria-expanded',String(!el.hidden));};
document.addEventListener('change',e=>{if(e.target.id==='platform-teaching-section')render();});
window.Lec07Poll={start,stop,render};
})();
