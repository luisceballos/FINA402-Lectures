from pathlib import Path
import re,html,base64
r=Path(r'C:\Users\luisceballos\My Drive\Classes\FINA402\AI-powered\Lectures');p=r/'Lec08_FCF.html';s=p.read_text(encoding='utf8')
old=re.search(r'<main id="deck">([\s\S]*?)</main>',s)[1]
sections=re.findall(r'<section\b[\s\S]*?</section>',old)
def eq(t):return '<div class="fcfe-equation" data-tex="'+html.escape(t,quote=True)+'"></div>'
def grid(a,b):return '<div class="fcf-grid"><div class="card">'+a+'</div><div class="card">'+b+'</div></div>'
def slide(id,title,body,extra=''):return f'<section class="slide" id="{id}" {extra}><div class="slide-header"><div class="eyebrow"></div><h2>{title}</h2></div>{body}</section>'
def image(name,alt,cls='fcfe-visual'):
 src='data:image/svg+xml;base64,'+base64.b64encode((r/'assets/images'/name).read_bytes()).decode()
 return f'<img class="{cls}" src="{src}" alt="{alt}">'
out=[sections[0]]
out.append(slide('fcfe-motivation','No dividend. A valuable equity claim.',image('lec08-amazon-motivation.svg','Amazon has paid zero cash dividends; non-affiliate voting stock alone was worth $2.118 trillion on June 30, 2025.')+'<div class="note-box">Zero dividends today does not mean zero future distributions. Cash may eventually reach shareholders through dividends, buybacks or liquidation.</div><p class="source-note">Sources: <a target="_blank" href="https://ir.aboutamazon.com/faqs/default.aspx">Amazon dividend FAQ</a> · <a target="_blank" href="https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm">2025 Form 10-K</a>. Value is dated, not a live quote.</p>'))
out.append(sections[1])
out.append(slide('fcfe-data','Dividends are smoother than earnings',image('lec08-shiller-updated.svg','Real S&P composite trailing four-quarter earnings and dividends, January 2000 to June 2026. Earnings 295.39, dividends 81.70 at the endpoint.')+'<div class="note-box">Earnings belong to shareholders; the board decides how much to distribute. FCFE asks how much cash remains after reinvestment and financing.</div><p class="source-note">Source: <a target="_blank" href="https://shillerdata.com/">Robert Shiller dataset</a>, downloaded October 14, 2026. Monthly interpolation of four-quarter totals, CPI-adjusted to June 2026. Later months have no paired earnings/dividend data. Dividends exclude repurchases.</p>'))
out.append(slide('fcfe-identities','The ingredients: accounting first, valuation second',grid(
 '<h3>Accounting and cash-flow identities</h3>'+eq(r'A=\text{Liabilities}+E_{\mathrm{book}}')+eq(r'NI=(EBIT-\text{Interest})(1-T)')+'<p class="source-note">Simplified income statement: no other nonoperating items.</p>'+eq(r'\text{Net CapEx}=CapEx-D\&A')+eq(r'WC=\text{Noncash operating CA}-\text{Operating CL}')+eq(r'FCFE_0=NI-\text{Net CapEx}-\Delta WC+\Delta D'),
 '<h3>Growth and risk assumptions</h3>'+eq(r'ER=NI-FCFE_0,\qquad ERR=\frac{ER}{NI}')+eq(r'ROE=\frac{NI}{E_{\mathrm{book,begin}}}')+eq(r'g=ERR\times ROE')+eq(r'k_e=r_f+\beta\,ERP')+'<p>Stable reinvestment and ROE support the growth relation. CAPM estimates the required return. These are modeling assumptions, not accounting identities.</p>')+'<div class="note-box">ΔD means new debt issued less principal repaid. Operating working capital excludes cash and interest-bearing debt.</div>'))
out.append(sections[3])
out.append(sections[4])
out.append(slide('fcfe-leverage','Leverage: the denominator changes the formula',grid(
 '<h3>Use L for debt / equity</h3>'+eq(r'L=\frac{D}{E_{\mathrm{book}}}')+eq(r'\frac{D}{D+E}=\frac{L}{1+L}')+eq(r'\frac{E}{D+E}=\frac{1}{1+L}')+'<p>D is interest-bearing debt. These financing ratios use consistent book values in our reinvestment example, not total liabilities divided by total assets.</p>',
 '<h3>Equity finances the remaining share</h3>'+eq(r'ER=\frac{\text{Net CapEx}+\Delta WC}{1+L}')+eq(r'FCFE=NI-ER')+'<p>Assume the same financing mix funds new investment and maturing debt is refinanced.</p>'+eq(r'L=0.50\;\Rightarrow\;\frac{D}{D+E}=33.33\%')+eq(r'\text{Equity-funded share}=66.67\%'))+'<p class="source-note">The shortcut using (1 − debt/capital) is equivalent. With L defined as D/E, use 1/(1+L), not (1−L). <a target="_blank" href="https://pages.stern.nyu.edu/~adamodar/New_Home_Page/AppldCF/derivn/ch11deriv.html">Method reference</a>.</p>'))
out.append(sections[6])
out.append(slide('fcfe-equity-value','FCFE and DDM both value equity',image('lec08-equity-balance.svg','Conceptual balance sheet: assets equal liabilities plus book equity. FCFE and DDM estimate the intrinsic value of the equity claim, not book equity or total assets.')+grid(
 '<h3>FCFE approach · total equity</h3>'+eq(r'V_{E,0}=\frac{FCFE_0(1+g)}{k_e-g}')+'<p>Cash available to all common shareholders, in $m.</p>',
 '<h3>DDM · same claim, different cash flow</h3>'+eq(r'V_{E,0}^{DDM}=\sum_{t=1}^{\infty}\frac{\text{Total dividends}_t}{(1+k_e)^t}')+eq(r'P_0=\frac{V_{E,0}}{\text{Shares}}')+'<p>Per-share DDM produces P₀. Multiply by shares before comparing total values.</p>')+'<div class="note-box">Both use the cost of equity. Do not subtract debt again from FCFE value. Values reconcile when payout, retained cash, growth and risk assumptions are consistent.</div>'))
air=sections[8].replace('Book debt / capital','Book debt / equity (L)').replace('5.44%','5.75296%')
# Rewrite the worked example reinvestment equation using D/E, keeping source numeric outputs.
air=re.sub(r'<div class="fcfe-equation" data-tex="ER=.*?</div>',lambda m:eq(r'ER=\frac{1520-1205+303}{1+0.0575296}\approx584.38'),air,count=1)
out.append(air)
out.append(slide('fcfe-activity','Your valuation · five questions, five points','<p class="activity-intro">One individual case. Four numerical answers and one explanation. Each question is worth 1 point.</p><div id="activity-1"></div>','data-activity="1"'))
out[-1]=out[-1].replace('class="slide"','class="slide activity-slide"',1)
out.append(slide('fcfe-highlights','Class highlights · FCFE versus DDM',grid(
 '<h3>FCFE: ability to distribute</h3><p>Start with net income. Deduct equity reinvestment. Match growth to reinvestment and ROE.</p>'+eq(r'FCFE=NI-ER')+'<p>Useful when dividends differ materially from cash available to shareholders.</p>',
 '<h3>DDM: expected distributions</h3><p>Forecast dividends and the stable-stage payout. A zero dividend today does not imply zero future payouts.</p>'+eq(r'P_0=\sum_{t=1}^{\infty}\frac{DPS_t}{(1+k_e)^t}')+'<p>Useful when dividend policy is stable and reflects sustainable distributable cash.</p>')+'<div class="note-box"><b>Same equity claim. Same cost of equity.</b> Compare on the same total or per-share basis. A valuation gap calls for checking assumptions, not choosing the larger number.</div><p class="lead">Before accepting a value: is growth sustainable, is reinvestment funded, and have retained cash and future payouts been counted consistently?</p><p><a href="Review_Notes_Lec08.pdf">FCFE review notes</a></p>'))
for i,v in enumerate(out):
 v=v.replace('DCF2 · Example 2','A reinvestment example').replace('DCF2 · Example 3','Airline assumptions').replace('DCF2, Example 1.','Illustrative example.').replace('Source example · $m','Illustrative example · $m').replace('Source teaching example with historical assumptions.','Illustrative assumptions, not a current market valuation.')
 v=re.sub(r'<div class="eyebrow">.*?</div>',f'<div class="eyebrow">LECTURE 08 · {i+1:02} / {len(out)}</div>',v)
 out[i]=v
assert len(out)==13
s=re.sub(r'<main id="deck">[\s\S]*?</main>',lambda m:'<main id="deck">'+'\n'.join(out)+'</main>',s)
s=s.replace('</head>','<style>.fcfe-visual{width:100%;max-height:410px;object-fit:contain;display:block;margin:8px auto 16px}#fcfe-equity-value .fcfe-visual{max-height:330px}#fcfe-equity-value .fcf-grid{margin:4px 0;gap:16px}#fcfe-equity-value .fcfe-equation{margin:9px 0}#fcfe-identities .fcfe-equation{font-size:1.05rem;margin:14px 0}.fcfe-response{width:100%;min-height:105px;padding:12px;font:inherit;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:6px}.fcfe-check{font-size:.85rem;margin:6px 0 14px}.fcfe-review{white-space:pre-wrap;overflow-wrap:anywhere}.fcfe-inputs{grid-template-columns:repeat(3,minmax(0,1fr))}.fcfe-question{margin:14px 0}.fcfe-question label{font-size:.9rem}.fcfe-review-controls{display:flex;gap:10px;margin:10px 0}@media(max-width:760px){.fcfe-inputs{grid-template-columns:repeat(2,minmax(0,1fr))}}</style></head>')
p.write_text(s,encoding='utf8')
print('13 slides; no old-material references in deck')
