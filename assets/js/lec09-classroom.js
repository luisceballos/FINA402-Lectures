/* Lecture 09 self-paced edition. Hub access preserved; no graded activity. */
lec09Assignment=function(){return {caseId:'L9-SELF-STUDY',selfStudy:true};};
const EXAMPLE=lec09Assignment();
practiceGrade=function(){return {ok:false,hint:'No lecture assignment. Complete the Canvas feedback survey.'};};
submitAnswer=async function(e){e?.preventDefault();return {ok:false};};
renderActivity=function(){};drawActivityChart=function(){};window.lec09Draw=function(){};
const l9Panel=document.getElementById('settings-panel');
if(l9Panel)new MutationObserver(()=>{
const title=l9Panel.querySelector('h3');if(title?.textContent==='Attendance & scores')title.textContent='Attendance - self-paced lecture';
l9Panel.querySelectorAll('table tr').forEach(row=>{[...row.children].forEach((cell,i)=>{if(i>=2)cell.hidden=true;});});
l9Panel.querySelectorAll('p').forEach(p=>{if(p.textContent.includes('Scores are out of 5.'))p.textContent='Lecture 9 is self-paced. No lecture assignment or score is required. The Canvas feedback survey is Quiz 9. Historical records remain in the Hub.';});
}).observe(l9Panel,{childList:true,subtree:true});
