from pathlib import Path
import re, zipfile
root=Path(r'C:/Users/luisceballos/My Drive/Classes/FINA402/AI-powered/Lectures')
with zipfile.ZipFile(root/'support/backups/lec07-before-ddm-refinement.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in ['Lec07_DCF.html','assets/js/lec07-classroom.js','support/tests/lec07-classroom-tests.cjs']:
  z.write(root/name,name)
p=root/'Lec07_DCF.html';s=p.read_text(encoding='utf-8')
def section(id): return re.search(r'<section\b[^>]*id="'+id+r'"[\s\S]*?</section>',s).group()
s=s.replace('What Is a Share Worth?','Equity Valuation: DDM models')
s=s.replace('70-minute class · Citi &amp; NVIDIA → predict → value → compare → stress-test.','Citi &amp; NVIDIA → predict → value → compare.')
old=section('intro-citi')
left=old[old.index('<div class="col-l card">'):old.index('<div class="col-r">')]
new='''<section class="slide" id="intro-citi"><div class="slide-header"><div class="eyebrow">Predict → discuss → reveal</div><h2>Is Citi undervalued or overvalued?</h2><p>Citigroup · December 31, 2024 · USD per common share</p></div><div class="slide-body">'''+left+'''<div class="col-r"><div class="card"><h3>What does a price below book tell you?</h3><div class="quick-weights" id="citi-poll-options"><button class="btn btn-ghost" data-citi-vote="under" disabled>Undervalued</button><button class="btn btn-ghost" data-citi-vote="over" disabled>Overvalued</button><button class="btn btn-ghost" data-citi-vote="depends" disabled>Not enough information</button></div><p id="citi-poll-status" class="tiny muted" role="status">Join the live lecture to vote. No points.</p><div id="citi-poll-chart" aria-live="polite"></div></div><button class="btn btn-gold" id="citi-economics" hidden>Reveal economics</button><div id="citi-reveal" class="note-box" hidden><b>Not necessarily undervalued.</b> It depends on expected returns, growth and risk—not book value alone.</div></div></div></section>'''
s=s.replace(old,new)
old=section('s6')
# Keep formulas on left; replace right with compact life-cycle chart and notes.
idx=old.index('<div class="col-r">')
right='''<div class="col-r card life-compact"><h3>Which stage fits Gordon?</h3><p class="small">Stable dividends and growth: start with stage C.</p><canvas id="life-chart" aria-label="Illustrative earnings and growth across firm life-cycle stages"></canvas><div class="quick-weights"><button class="btn btn-ghost" data-stage="A">A · Start-up</button><button class="btn btn-ghost" data-stage="B">B · Consolidation</button><button class="btn btn-gold" data-stage="C">C · Maturity</button><button class="btn btn-ghost" data-stage="D">D · Decline</button></div><div id="stage-info"></div><p class="tiny muted">Illustrative life cycle. Earnings and growth use separate normalized scales.</p></div></div></section>'''
s=s.replace(old,old[:idx]+right)
old=section('s7')
s=s.replace(old,old.replace('<div class="math-label">Fundamental growth in earnings</div>','<div class="math-label">Dividends and fundamental growth</div><div class="formula">DPS = EPS × δ</div><p class="small">δ is the dividend payout ratio.</p>',1))
s=s.replace(section('rate-shock'),'').replace(section('s4'),'')
old=section('s10')
new='''<section class="slide" id="s10"><div class="slide-header"><div class="eyebrow">From growth to maturity</div><h2>Two stages. Gordon begins at maturity.</h2><p>Same life cycle as slide 5: forecast the transition, then value the stable firm.</p></div><div class="slide-body"><div class="col-l card"><div class="chart-heading">Follow the firm into maturity <span>illustrative path</span></div><svg class="stage-bridge" viewBox="0 0 640 285" role="img" aria-label="A growing firm moves from consolidation to maturity. Forecast early dividends, then apply Gordon at the transition."><rect x="35" y="28" width="270" height="185" rx="10" fill="var(--gold-lt)"/><rect x="305" y="28" width="300" height="185" rx="10" fill="var(--green)" opacity=".10"/><text x="55" y="53" fill="var(--gold)" font-size="17" font-weight="700">B · Consolidation</text><text x="328" y="53" fill="var(--green)" font-size="17" font-weight="700">C · Maturity</text><path d="M55 188 C150 180 205 92 305 90 S500 80 585 72" stroke="var(--accent)" stroke-width="5" fill="none"/><line x1="305" x2="305" y1="65" y2="229" stroke="var(--muted)" stroke-dasharray="5 4"/><text x="55" y="243" fill="var(--text)" font-size="15">Today</text><text x="305" y="243" text-anchor="middle" fill="var(--text)" font-size="15">End of year 3</text><text x="525" y="243" fill="var(--text)" font-size="15">Year 4 onward</text><text x="55" y="272" fill="var(--muted)" font-size="13">Schematic earnings path · time →</text></svg><div class="stage-pair"><div><b>Forecast individually</b><p>Years 1–3: dividends may grow unevenly.</p></div><div><b>Use Gordon here</b><p>Year 4 onward: one stable growth rate.</p></div></div></div><div class="col-r"><div class="card"><h3>Two pieces of today's value</h3><div class="stage-step"><span class="step-number">1</span><div><b>Early dividends</b><p>Bring each forecast dividend back to today.</p><div class="math-line">D₁, D₂, D₃</div></div></div><div class="stage-step"><span class="step-number">2</span><div><b>The mature business</b><p>Gordon gives its value at year 3. Discount that value back too.</p><div class="math-line">TV₃ = D₄ / (k − gₛ)</div></div></div></div><div class="note-box"><b>Where does the terminal value sit?</b><p>At the end of year 3—not today. It captures dividends from year 4 onward.</p></div><p class="small muted">Activity 2 uses one required return in both stages. A more general model can use different rates.</p></div></div></section>'''
s=s.replace(old,new)
s=s.replace('s4:drawLifecycle','s6:drawLifecycle')
s=s.replace('function stopLive(){','function stopLive(){window.Lec07Poll?.stop();',1)
s=s.replace("const session=LECTURE.collection('sessions').doc(S.sessionId);\n const onError", "const session=LECTURE.collection('sessions').doc(S.sessionId);\n window.Lec07Poll?.start();\n const onError",1)
s=s.replace("window.lec07ClassroomDraw?.(id);","window.lec07ClassroomDraw?.(id);window.Lec07Poll?.render();",1)
s=s.replace('<script src="assets/js/lecture-adapter.js" data-lecture="lec07">','<script src="assets/js/lec07-opening-poll.js"></script>\n<script src="assets/js/lecture-adapter.js" data-lecture="lec07">')
css='''<style id="lec07-ddm-refinement">
#s6 .slide-body{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}
#life-chart{height:220px!important;min-height:0!important}
.life-compact .quick-weights{gap:5px;flex-wrap:wrap}.life-compact .btn{font-size:11px;padding:7px}
.life-compact #stage-info .step-number{display:none}.life-compact #stage-info h3{font-size:17px;margin:12px 0 5px}
.life-compact #stage-info p,.life-compact #stage-info .math-line{font-size:13px;line-height:1.5}
.stage-bridge{width:100%;height:auto;max-height:310px}.stage-pair{display:grid;grid-template-columns:1fr 1fr;gap:18px;font-size:15px}
.stage-pair>div{border-top:3px solid var(--gold);padding-top:12px}.stage-pair>div+div{border-color:var(--green)}
.stage-step{display:flex;gap:15px;margin:14px 0}.stage-step p{margin:5px 0}.stage-step .step-number{font-size:26px}
#citi-poll-chart svg{display:block;width:100%;max-height:180px;margin-top:12px}
#citi-poll-options{flex-wrap:wrap}#citi-poll-options .btn{font-size:12px;padding:9px}
#citi-economics[hidden],#citi-reveal[hidden]{display:none!important}
@media(max-width:850px){#s6 .slide-body{display:block}.life-compact{margin-top:12px}}
</style>'''
s=s.replace('</head>',css+'</head>',1)
p.write_text(s,encoding='utf-8')
p=root/'assets/js/lec07-classroom.js';s=p.read_text(encoding='utf-8')
s=re.sub(r"\$\('nvda-quarter'\)\.oninput=nvidia;.*?document\.querySelectorAll\('\[data-predict\]'\)", "$('nvda-quarter').oninput=nvidia;document.querySelectorAll('[data-predict]')",s,count=1)
p.write_text(s,encoding='utf-8')
print('Updated slides; moved life cycle; removed two slides; preserved assignments.')
