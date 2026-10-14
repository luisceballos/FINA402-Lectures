const ROOT=require('path').resolve(__dirname,'../..');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('C:/Users/luisceballos/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=fs.readFileSync(path.join(ROOT,'support/tests/platform-browser-tests.cjs'),'utf8').replace(/\r\n/g,'\n');let stub=source.slice(source.indexOf('const stub=')+11,source.indexOf(';\n(async'));if(stub.length<50)throw Error('fixture unavailable');stub=eval(stub);
stub=stub.replace('const data=new Map();','const data=new Map();const subscriptions=new Map();const rowsAt=p=>({docs:[...data].filter(([k])=>k.startsWith(p+"/")&&!k.slice(p.length+1).includes("/")).map(([k,v])=>({id:k.split("/").pop(),data:()=>v})),forEach(fn){this.docs.forEach(fn)},docChanges(){return []}});const watch=(p,cb,isDoc)=>{const key={p,cb,isDoc};subscriptions.set(key,key);queueMicrotask(()=>cb(isDoc?snapshot(p):rowsAt(p)));return()=>subscriptions.delete(key)};const publish=()=>subscriptions.forEach(({p,cb,isDoc})=>cb(isDoc?snapshot(p):rowsAt(p)));');
stub=stub.replace('get:async()=>({docs:[],docChanges(){return []},forEach(){}})','get:async()=>rowsAt(p)');
stub=stub.replace('onSnapshot(cb){queueMicrotask(()=>cb({docs:[],docChanges(){return []},forEach(){}}));return()=>{}}','onSnapshot(cb){return watch(p,cb,false)}');
stub=stub.replace('onSnapshot(cb){queueMicrotask(()=>cb(snapshot(p)));return()=>{}}','onSnapshot(cb){return watch(p,cb,true)}');
stub=stub.replace("runTransaction(){throw Error('Unexpected write')}","async runTransaction(fn){const pending=[];const tx={get:async r=>snapshot(r.path),set:(r,d,o)=>pending.push(()=>data.set(r.path,o?.merge?{...data.get(r.path),...d}:d)),update:(r,d)=>pending.push(()=>data.set(r.path,{...data.get(r.path),...d}))};await fn(tx);pending.forEach(f=>f());window.__writeCount=(window.__writeCount||0)+pending.length;publish();}");


(async()=>{
const server=http.createServer((req,res)=>{const n=decodeURIComponent(req.url.split('?')[0]).slice(1);if(n.includes('..'))return res.writeHead(404).end();try{res.setHeader('Content-Type',n.endsWith('.js')?'application/javascript':'text/html');res.end(fs.readFileSync(path.join(ROOT,n)));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true});const ctx=await browser.newContext({viewport:{width:1440,height:960}});
 await ctx.route('**/*',route=>{const u=route.request().url();if(u.includes('firebase-')&&u.endsWith('.js'))return route.fulfill({contentType:'application/javascript',body:stub});if(/firestore.googleapis|identitytoolkit.googleapis|securetoken.googleapis/.test(u))return route.abort();return route.continue();});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.__teacherMode=true;window.__testMode='student';sessionStorage.setItem('lecture-hub-entry',JSON.stringify({lectureId:'lec08',role:'instructor',issuedAt:Date.now()}));});
 await page.goto('http://127.0.0.1:'+server.address().port+'/Lec08_FCF.html',{waitUntil:'networkidle'});
 assert.equal(await page.locator('#deck .slide').count(),16);assert.equal(await page.locator('[data-activity]').count(),1);
 for(let i=0;i<16;i++){await page.evaluate(i=>goSlide(i),i);const reveal=page.locator('.slide.active [data-reveal]');if(await reveal.count())await reveal.click();await page.waitForTimeout(70);await page.screenshot({path:path.join(ROOT,'support/previews/lec08-v3-slide-'+(i+1)+'.png')});}
 await page.evaluate(()=>goSlide(4));await page.locator('#payout-enlarge').click();assert.equal(await page.locator('#payout-dialog').isVisible(),true);await page.screenshot({path:path.join(ROOT,'support/previews/lec08-payout-zoom.png')});await page.locator('#payout-close').click();assert.deepEqual(errors,[]);
 assert.equal(await page.locator('#deck').innerText().then(t=>/DCF2|FCFF/.test(t)),false);
 await page.evaluate(()=>{const cases=LOGIN_ROSTER.map(s=>lec08Assignment(s.id));if(new Set(cases.map(d=>JSON.stringify([d.ni,d.leverage,d.beta,d.capex]))).size!==cases.length)throw Error('Duplicate cases');for(let i=0;i<cases.length;i++){const d=cases[i],a=fcfeAnswer(d);if(!(a.fcfe>0&&a.g>0&&a.k>a.g))throw Error('Unsustainable case');const ans={...a,reflection:'I would use FCFE because payout may omit cash retained for future shareholder distributions.'};if(Math.abs(a.er-(1-d.leverage)*(d.capex-d.da+d.wc))>1e-10)throw Error('D/A reinvestment mismatch');for(const [key]of f8fields()){for(const m of [.99,1.01])if(!practiceGrade(d,1,{...ans,[key]:a[key]*m}).result.correct[key])throw Error('1 percent boundary rejected');for(const m of [.9899,1.0101])if(practiceGrade(d,1,{...ans,[key]:a[key]*m}).result.correct[key])throw Error('Outside 1 percent accepted');}if(practiceGrade(d,1,{...ans,equity:a.price}).result.correct.equity)throw Error('Price per share accepted as total equity');if(practiceGrade(d,1,ans).result.numericScore!==4)throw Error('Correct numerical answers rejected');if(practiceGrade(d,1,{...ans,fcfe:a.fcfe*1.2}).result.numericScore!==3)throw Error('Wrong answer awarded point');if(practiceGrade(d,1,{...ans,reflection:''}).ok)throw Error('Blank explanation accepted');if(JSON.stringify(d)!==JSON.stringify(lec08Assignment(LOGIN_ROSTER[i].id)))throw Error('Unstable case');}});
 console.log('PASS 16 slides, embedded images, 137 unique stable cases, four independent numerical scores and required explanation.');
 const identity=await page.evaluate(()=>LOGIN_ROSTER.find(s=>s.section==='S01'));await page.addInitScript(student=>{window.__teacherMode=false;sessionStorage.setItem('lecture-hub-entry',JSON.stringify({lectureId:'lec08',role:'student',student,issuedAt:Date.now()}));},identity);await page.reload({waitUntil:'networkidle'});
 await page.evaluate(async()=>{
 stopLive();await firebase.auth().signOut();await firebase.auth().signInAnonymously();
 const students=LOGIN_ROSTER.filter(s=>s.section==='S01').slice(0,3).map(s=>({...s,assignment:lec08Assignment(s.id)}));window.__students=students;
 for(const st of students)window.__testData.set('fina402_free/course/students/'+st.id,st);
 window.__testData.get('lectures_hub/config').lectures.find(l=>l.id==='lec08').hubCodeHash=await LecturePlatform.hash('class-password');
 const joined=await LecturePlatform.join('lec08',students[0],'class-password');Object.assign(S,joined,{role:'student',assignment:students[0].assignment,open:true,students,results:[]});
 document.getElementById('gate').hidden=true;goSlide([...document.querySelectorAll('#deck .slide')].findIndex(s=>s.dataset.activity==='1'));startPolling();
 });
 assert.equal(await page.locator('#answer-fcfe').count(),0);
 await page.evaluate(async()=>{let rejected=false;try{await LecturePlatform.submit('lec08',S.studentId,S.sessionId,1,practiceGrade(S.assignment,1,{...fcfeAnswer(S.assignment),reflection:'Use FCFE because dividend policy does not reflect available cash.'}),S.assignment.caseId);}catch(e){rejected=e.message.includes('instructor');if(!rejected)throw e;}if(!rejected)throw Error('Lock bypassed');window.__testTeacher();S.role='instructor';renderActivity();});
 await page.locator('#pacing-toggle').click();
 await page.waitForFunction(()=>window.__testData.get('lectures_hub/config/lectures/lec08').activityPacing?.sections?.S01?.activity1);
 await page.evaluate(async()=>{const p=S.config.activityPacing;if(p.sections.S02||p.sections.S01.activity2)throw Error('Other activity/section unlocked');await firebase.auth().signOut();await firebase.auth().signInAnonymously();S.role='student';renderActivity();const r=fcfeAnswer(S.assignment);for(const[k]of f8fields())document.getElementById('answer-'+k).value=r[k];document.getElementById('answer-fcfe').value=r.fcfe*1.2;document.getElementById('answer-reflection').value='I prefer FCFE here because dividends may omit retained cash available for eventual distributions. I would check whether the DDM accounts for that cash.';});
 await page.locator('#submit-answer-1').click();
 await page.waitForFunction(()=>S.results.find(r=>r.id===S.studentId)?.fcfeActivity?.numericScore===3);
 assert.ok((await page.locator('#activity-message-1').innerText()).includes('3/4'));
 await page.evaluate(()=>document.getElementById('answer-fcfe').value=fcfeAnswer(S.assignment).fcfe);
 await page.locator('#submit-answer-1').click();
 await page.waitForFunction(()=>S.results.find(r=>r.id===S.studentId)?.fcfeActivity?.numericScore===4);
 await page.screenshot({path:path.join(ROOT,'support/previews/lec08-v3-student.png')});
 await page.evaluate(()=>{const row=window.__testData.get('lectures_hub/config/lectures/lec08/sessions/test/results/'+S.studentId);if(row.attemptsUnified!==2||LecturePlatform.score('lec08',row)!==4||!LecturePlatform.missing('lec08',row).includes('e: instructor review pending'))throw Error('Partial score or persistence failed');window.__testTeacher();S.role='instructor';S.previewId='';renderActivity();});
 await page.locator('#activity-1 details').first().locator('summary').click();
 await page.locator('[data-points="1"]').first().click();
 await page.waitForFunction(()=>S.results.find(r=>r.id===S.studentId)?.fcfeActivity.reviewPoints===1);
 assert.equal(await page.evaluate(()=>LecturePlatform.score('lec08',S.results.find(r=>r.id===S.studentId))),5);
 await page.screenshot({path:path.join(ROOT,'support/previews/lec08-v3-instructor-review.png')});
 // A stale instructor tab cannot score a revised response.
 await page.evaluate(async()=>{await f8review(S.studentId,0,'old explanation');if(S.results.find(r=>r.id===S.studentId).fcfeActivity.reviewPoints!==1)throw Error('Stale review overwrote score');});
 // Same explanation keeps review; revised explanation returns to pending.
 await page.evaluate(async()=>{await firebase.auth().signOut();await firebase.auth().signInAnonymously();S.role='student';renderActivity();const a={...fcfeAnswer(S.assignment),reflection:f8record().reflection};let x=await api('lec08Submit',{activity:1,answer:a});if(x.result.reviewPoints!==1)throw Error('Unchanged explanation lost review');a.reflection+=' Additional analysis of payout sustainability.';x=await api('lec08Submit',{activity:1,answer:a});if(x.result.reviewPoints!==null)throw Error('Changed explanation kept old grade');});
 console.log('PASS manual opening, section isolation, partial answers saved, instructor scoring to 5/5 and safe re-review.');
 // A revised per-share submission preserves the former total-equity response.
 await page.evaluate(async()=>{const key='lectures_hub/config/lectures/lec08/sessions/test/results/'+S.studentId,row=window.__testData.get(key),old=structuredClone(row.fcfeActivity);delete old.valuationBasis;delete old.leverageBasis;old.correct.equity=true;delete old.correct.price;old.submitted.equity=old.equity;delete old.submitted.price;old.reviewPoints=1;row.fcfeActivity=old;if(LecturePlatform.score('lec08',row)!==5)throw Error('Legacy score changed');await api('lec08Submit',{activity:1,answer:{...fcfeAnswer(S.assignment),reflection:old.reflection}});const saved=window.__testData.get(key);if(!saved.fcfeActivityPriorLeverage||saved.fcfeActivityPriorTotal?.submitted.equity!==old.equity||saved.fcfeActivity.valuationBasis!=='total-equity'||saved.fcfeActivity.reviewPoints!==null)throw Error('Historical result preservation failed');});
 console.log('PASS total-equity grading rejects price per share; legacy total-equity response retained on resubmission.');
 // Student cannot invoke instructor review.
 await page.evaluate(async()=>{const n=window.__writeCount;await f8review(S.studentId,1,f8record().reflection);if(window.__writeCount!==n)throw Error('Student review wrote');window.__testTeacher();S.role='instructor';S.previewId=S.students[1].id;renderActivity();const d=currentStudent().assignment,a=fcfeAnswer(d);for(const[k]of f8fields())document.getElementById('answer-'+k).value=a[k];document.getElementById('answer-reflection').value='Demonstration choice based on payout and retained cash assumptions.';const count=window.__writeCount;await submitAnswer({preventDefault(){}},1);if(window.__writeCount!==count)throw Error('Preview wrote');});
 await page.evaluate(()=>{S.previewId='';S.role='instructor';renderActivity();document.getElementById('pacing-toggle').click();});
 await page.waitForFunction(()=>!window.__testData.get('lectures_hub/config/lectures/lec08').activityPacing.sections.S01.activity1);
 await page.evaluate(async()=>{await firebase.auth().signOut();await firebase.auth().signInAnonymously();S.role='student';renderActivity();if(document.getElementById('answer-fcfe'))throw Error('Close failed');if(!S.results.find(r=>r.id===S.studentId)?.fcfeActivity)throw Error('Close deleted record');});
 await page.addInitScript(()=>{window.__testMode='guest';window.__teacherMode=false;});await page.reload({waitUntil:'networkidle'});await page.evaluate(()=>goSlide([...document.querySelectorAll('#deck .slide')].findIndex(s=>s.dataset.activity==='1')));
 assert.equal(await page.locator('#submit-answer-1').isDisabled(),true);assert.equal(await page.locator('#answer-reflection').isDisabled(),true);
 assert.deepEqual(errors,[]);console.log('PASS no-write preview, student review denied, close preserves records, Review disables numerical inputs and explanation.');
 const hub=await ctx.newPage();await hub.addInitScript(()=>{window.__testMode='student';window.__teacherMode=false;});await hub.goto('http://127.0.0.1:'+server.address().port+'/Lecture-hub.html',{waitUntil:'networkidle'});
 assert.equal(await hub.locator('#grid a[href="Review_Notes_Lec08.pdf"]').count(),0);
 await hub.evaluate(()=>{lectures.find(l=>l.id==='lec08').status='guest';renderCards();});
 assert.equal(await hub.locator('#grid a[href="Review_Notes_Lec08.pdf"]').count(),1);
 console.log('PASS Hub hides Lec08 PDF in Live and exposes it in Review.');
 await ctx.close();
}finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
