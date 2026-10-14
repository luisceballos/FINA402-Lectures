from pathlib import Path
import json,html,re,base64,textwrap
r=Path(r'C:\Users\luisceballos\My Drive\Classes\FINA402\AI-powered\Lectures')
d=json.loads((r/'support/sources/lec08-sp500-nonpayers.json').read_text(encoding='utf8'));rows=d['companies'];assert len(rows)==95
W,H=1800,1170
def t(x,y,s,size=22,color='#18283c',weight='400'):
 return f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{size}" fill="{color}" font-weight="{weight}">{html.escape(str(s))}</text>'
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><rect width="{W}" height="{H}" rx="22" fill="#f7f4f0"/>'
svg+=t(30,42,'95 S&P 500 companies screened with no dividend yield',34,weight='700')+t(30,75,'Snapshot: October 14, 2026 · Ordered by market capitalization · Current status, not lifetime dividend history',21,color='#6b6461')
for i,x in enumerate(rows):
 col=i//16;row=i%16;xx=30+col*294;yy=100+row*62
 name=re.sub(r'\s+(Inc|Corp|Ltd|Plc|Company)(\.|oration)?$','',x['name'])
 name=name.replace(' Holdings','').replace(' International',' Intl.').replace(' Technologies',' Tech.').replace(' Pharmaceuticals',' Pharma').replace(' Laboratories',' Labs').replace(' Entertainment',' Ent.').replace(' Automotive',' Auto').replace('Interactive Software','Interactive')
 lines=textwrap.wrap(name,width=28)[:2]
 svg+=f'<rect x="{xx}" y="{yy}" width="280" height="57" rx="7" fill="white"/>'
 svg+=t(xx+10,yy+23,x['ticker'],23,'#6b1a2b','700')
 for j,line in enumerate(lines):svg+=t(xx+90,yy+20+j*20,line,17)
svg+=t(30,1125,'Source: Finviz screener · Index = S&P 500 · Dividend Yield = None',21,color='#6b6461')
svg+=t(30,1153,'This group can include firms that suspended dividends. No cash dividend does not mean no buybacks or no shareholder value.',20,color='#6b6461')+'</svg>'
(r/'assets/images/lec08-sp500-nonpayers.svg').write_text(svg,encoding='utf8')
src='data:image/svg+xml;base64,'+base64.b64encode(svg.encode()).decode()
new='<section class="slide" id="fcfe-payout-types"><div class="slide-header"><div class="eyebrow"></div><h2>Who pays dividends, and who does not?</h2></div><div class="payout-types"><div class="card"><h3>Recurring cash and mature operations</h3><p>Stable cash generation can support regular dividends. Examples: Coca-Cola and P&amp;G.</p></div><div class="card"><h3>Reinvestment or repurchases</h3><p>Some firms retain cash to invest or use buybacks instead. Examples without dividends: Amazon and Berkshire Hathaway.</p></div><div class="card"><h3>These are tendencies, not rules</h3><p>Growth and dividends can coexist: Microsoft pays. Other firms suspend dividends to protect liquidity.</p></div></div><button class="btn btn-accent" id="payout-enlarge">Enlarge all 95 company names</button><img id="payout-companies" class="fcfe-visual" src="'+src+'" alt="95 S&P 500 companies with no reported dividend yield in the October 14, 2026 Finviz screening snapshot. Enlarge to read all company names."><p class="source-note">Screen: <a target="_blank" href="https://finviz.com/screener.ashx?v=111&amp;f=idx_sp500,fa_div_none&amp;o=-marketcap">Finviz, October 14, 2026</a>. Company examples: <a target="_blank" href="https://investors.coca-colacompany.com/stock-info/dividends">Coca-Cola</a> · <a target="_blank" href="https://www.pginvestor.com/stock-info/dividend-history/default.aspx">P&amp;G</a> · <a target="_blank" href="https://news.microsoft.com/source/2026/09/15/microsoft-announces-quarterly-dividend-increase-7/">Microsoft</a>. No current dividend is different from never having paid one.</p></section>'
p=r/'Lec08_FCF.html';s=p.read_text(encoding='utf8')
main=re.search(r'<main id="deck">([\s\S]*?)</main>',s)[1];slides=re.findall(r'<section\b[\s\S]*?</section>',main);slides.insert(2,new)
for i,v in enumerate(slides):slides[i]=re.sub(r'<div class="eyebrow">.*?</div>',f'<div class="eyebrow">LECTURE 08 · {i+1:02} / {len(slides)}</div>',v)
s=re.sub(r'<main id="deck">[\s\S]*?</main>',lambda m:'<main id="deck">'+'\n'.join(slides)+'</main>',s)
# Compact numerical questions and give balance-sheet image more useful area.
s=s.replace('</head>','<style>.payout-types{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:8px 0 12px}.payout-types h3{font-size:1rem}.payout-types p{font-size:.88rem}.payout-types .card{padding:12px 16px}#payout-enlarge{align-self:flex-start;margin:6px 0}#payout-companies{max-height:470px;cursor:zoom-in}.fcfe-question-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.fcfe-question-grid .fcfe-question{margin:4px 0}.fcfe-question-grid label{margin:4px 0;min-height:36px}.fcfe-question-grid .fcfe-check{min-height:20px;margin:6px 0}.fcfe-value-layout{display:grid;grid-template-columns:1.65fr 1fr;gap:20px;align-items:center}.fcfe-value-layout .fcfe-visual{max-height:none!important}.fcfe-value-layout .fcf-grid{grid-template-columns:1fr;gap:12px!important}.fcfe-value-layout .fcfe-equation{font-size:1.1rem}#payout-dialog{max-width:96vw;width:96vw;max-height:92vh;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;margin:auto}#payout-dialog::backdrop{background:#0009}.payout-zoom-scroll{overflow:auto;max-height:80vh}.payout-zoom-scroll img{width:1800px;max-width:none}@media(max-width:760px){.payout-types,.fcfe-value-layout,.fcfe-question-grid{grid-template-columns:1fr}}</style></head>')
# Wrap existing image and two valuation panels together.
s=s.replace('<section class="slide" id="fcfe-equity-value"', '<section class="slide" id="fcfe-equity-value"')
m=re.search(r'(<section class="slide" id="fcfe-equity-value"[\s\S]*?)(<img class="fcfe-visual"[\s\S]*?)(<div class="note-box">Both use)',s)
if m:
 middle=m[2];pos=middle.index('<div class="fcf-grid">')
 replacement=m[1]+'<div class="fcfe-value-layout"><div>'+middle[:pos]+'</div><div>'+middle[pos:]+'</div></div>'+m[3]
 s=s[:m.start()]+replacement+s[m.end():]
s=s.replace('</body>','<dialog id="payout-dialog"><button class="btn btn-accent" id="payout-close">Close company list</button><p>Scroll to read all names. October 14, 2026 snapshot.</p><div class="payout-zoom-scroll"></div></dialog></body>')
p.write_text(s,encoding='utf8')
p=r/'assets/js/lec08-classroom.js';s=p.read_text(encoding='utf8')
s=s.replace("'<form class=\"card activity-form\" id=\"answer-form-1\"><h3>One point per question</h3>'+f8fields()", "'<form class=\"card activity-form\" id=\"answer-form-1\"><h3>One point per question</h3><div class=\"fcfe-question-grid\">'+f8fields()")
s=s.replace("'<label for=\"answer-reflection\">e)", "'</div><label for=\"answer-reflection\">e)")
s+="\nfunction f8enlarge(){const d=document.getElementById('payout-dialog');if(!d)return;const img=document.getElementById('payout-companies').cloneNode();img.removeAttribute('id');img.removeAttribute('class');d.querySelector('.payout-zoom-scroll').replaceChildren(img);d.showModal();document.getElementById('payout-close').onclick=()=>d.close();}\ndocument.getElementById('payout-enlarge').onclick=f8enlarge;document.getElementById('payout-companies').onclick=f8enlarge;\n"
p.write_text(s,encoding='utf8')
p=r/'assets/js/hub-platform.js';s=p.read_text(encoding='utf8').replace("graded=!!HP.PATHS[id]","graded=!!HP.PATHS[id]||id==='lec08'");p.write_text(s,encoding='utf8')
print('Added 95-company image with zoom; now',len(slides),'slides')
