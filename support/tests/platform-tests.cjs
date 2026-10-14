const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const path=require('path');
const base=path.resolve(__dirname,'../..');
for(const file of fs.readdirSync(path.join(base,'assets/js')).filter(x=>/\.js$/.test(x))){new vm.Script(fs.readFileSync(path.join(base,'assets/js',file),'utf8'),{filename:file});}
for(const file of fs.readdirSync(base).filter(x=>/\.html$/.test(x))){const html=fs.readFileSync(path.join(base,file),'utf8');for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){if(m[1].trim())new vm.Script(m[1],{filename:file});}}
const records=new Map(),listeners=[];let uid='alice-browser',writes=0,queue=Promise.resolve();
const snap=p=>({exists:records.has(p),data:()=>records.get(p)});
const ref=p=>({path:p,collection:n=>({doc:id=>ref(p+'/'+n+'/'+id)}),get:async()=>snap(p)});
const db={doc:ref,runTransaction(fn){const user=uid;const run=queue.then(async()=>{const pending=[];const tx={get:async r=>snap(r.path),set:(r,d,o)=>pending.push(()=>records.set(r.path,o?.merge?{...records.get(r.path),...d}:d)),update:(r,d)=>pending.push(()=>records.set(r.path,{...records.get(r.path),...d}))};await fn(tx);pending.forEach(f=>f());writes+=pending.length;});queue=run.catch(()=>{});return run;}};
const auth={get currentUser(){return {uid,isAnonymous:true}},onAuthStateChanged(cb){queueMicrotask(cb);return()=>{}},signInAnonymously:async()=>{}};
const firebase={apps:[{}],firestore:()=>db,auth:()=>auth};firebase.firestore.FieldValue={serverTimestamp:()=>123456};
const ctx={firebase,crypto:crypto.webcrypto,TextEncoder,globalThis:null,setInterval,clearInterval,document:{hidden:false}};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(base,'assets/js/lecture-platform.js'),'utf8'),ctx);const P=ctx.LecturePlatform;
(async()=>{
 assert.equal(P.lecture('lec01').path,'lectures_hub/config/lectures/lec01');assert.equal(P.sessions('lec04').doc('s').path,'lectures_hub/config/lectures/lec04/sessions/s');assert.throws(()=>P.lecture('portfolio'),/Unknown/);assert.ok(!fs.readFileSync(path.join(base,'assets/js/hub-platform.js'),'utf8').includes('updatePassword'));
 assert.equal([{name:'Zarcone, Isabella'},{name:'Garcia Gonzalez, Marco'},{name:'Acuna, Angelica'},{name:'Garcia Franco, Jesus'}].sort(P.compareStudents).map(s=>s.name).join('|'),'Acuna, Angelica|Garcia Franco, Jesus|Garcia Gonzalez, Marco|Zarcone, Isabella');
 const hash=await P.hash('class-password');records.set('lectures_hub/config',{lectures:[{id:'lec06',hubStatus:'student',hubSections:{S01:true},hubCodeHash:hash}]});records.set('lec06/publicConfig',{sessionId:'s1'});
 const student={id:'student1',name:'Test Student',section:'S01'};
 await assert.rejects(()=>P.join('lec06',student,'wrong'),/Incorrect/);assert.equal(writes,0);
 const joined=await P.join('lec06',student,'class-password');assert.equal(joined.sessionId,'s1');assert.equal(records.get('lectures_hub/config/claims/lec06--student1').ownerUid,uid);
 uid='second-browser';await assert.rejects(()=>P.join('lec06',student,'class-password'),/already reserved/);
 uid='alice-browser';await P.join('lec06',student,'class-password');
 const otherAuth={currentUser:{uid:'competing-browser'},onAuthStateChanged(cb){queueMicrotask(cb);return()=>{}}};
 const otherFirebase={...firebase,auth:()=>otherAuth};
 const other={...ctx,firebase:otherFirebase,globalThis:null};other.globalThis=other;vm.createContext(other);vm.runInContext(fs.readFileSync(path.join(base,'assets/js/lecture-platform.js'),'utf8'),other);
 const raceStudent={id:'race-student',name:'Race Student',section:'S01'};
 const race=await Promise.allSettled([P.join('lec06',raceStudent,'class-password'),other.LecturePlatform.join('lec06',raceStudent,'class-password')]);
 assert.equal(race.filter(r=>r.status==='fulfilled').length,1);assert.equal(race.filter(r=>r.status==='rejected').length,1);
 await assert.rejects(()=>P.submit('lec06','student1','s1',2,{ok:true,result:{alpha:1}},'case'),/Activity 1/);
 await P.submit('lec06','student1','s1',1,{ok:false,hint:'Retry'},'case');assert.equal(records.get('lec06/publicConfig/sessions/s1/results/student1').attempts1,1);assert.equal(P.score('lec06',records.get('lec06/publicConfig/sessions/s1/results/student1')),0);
 await P.submit('lec06','student1','s1',1,{ok:true,result:{er:10}},'case');assert.equal(P.score('lec06',records.get('lec06/publicConfig/sessions/s1/results/student1')),3);
 await P.submit('lec06','student1','s1',2,{ok:true,result:{alpha:1}},'case');assert.equal(P.score('lec06',records.get('lec06/publicConfig/sessions/s1/results/student1')),5);
 const count=writes;records.get('lectures_hub/config').lectures[0].hubStatus='guest';await assert.rejects(()=>P.submit('lec06','student1','s1',1,{ok:true,result:{}},'case'),/not Live/);assert.equal(writes,count);
 records.get('lectures_hub/config').lectures[0].hubStatus='student';records.set('lec06/publicConfig',{sessionId:'s2'});await assert.rejects(()=>P.submit('lec06','student1','s1',1,{ok:true,result:{}},'case'),/session changed/);
 assert.equal(P.score('lec04',{p1:{},p2:{},sr:{}}),5);assert.equal(P.score('lec04',{p1:{}}),3);assert.equal(P.missing('lec04',{p1:{}}).join(','),'P2,Sharpe');
 console.log('PASS: JS parsing; wrong password; concurrent name reservation; name ownership; same-browser resume; activity order; attempts; 3+2 and 3+1+1 scores; Review write rejection; stale session rejection. No Firebase network calls.');
})().catch(e=>{console.error(e);process.exitCode=1;});
