from pathlib import Path
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT
import math
root=Path(r'C:\Users\luisceballos\My Drive\Classes\FINA402\AI-powered\Lectures')
for name,file in [('Body','arial.ttf'),('BodyBold','arialbd.ttf'),('BodyItalic','ariali.ttf'),('Display','georgiab.ttf')]:pdfmetrics.registerFont(TTFont(name,str(Path('C:/Windows/Fonts')/file)))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='BodyBold',italic='BodyItalic',boldItalic='BodyBold')
navy=colors.HexColor('#172f49');gold=colors.HexColor('#ac832c');green=colors.HexColor('#357757');light=colors.HexColor('#f4f3ee');muted=colors.HexColor('#566879')
styles=getSampleStyleSheet();styles.add(ParagraphStyle(name='Text',fontName='Body',fontSize=10,leading=13.4,spaceAfter=7,textColor=navy));styles.add(ParagraphStyle(name='Heading',fontName='Display',fontSize=18,leading=23,spaceBefore=7,spaceAfter=13,textColor=navy));styles.add(ParagraphStyle(name='Sub',fontName='BodyBold',fontSize=12,leading=16,spaceBefore=8,spaceAfter=6,textColor=navy));styles.add(ParagraphStyle(name='SmallText',parent=styles['Text'],fontSize=8.6,leading=10.8,textColor=muted));styles.add(ParagraphStyle(name='Formula',fontName='BodyBold',fontSize=12.5,leading=19,textColor=navy,backColor=light,borderPadding=9,spaceBefore=8,spaceAfter=15));styles.add(ParagraphStyle(name='Kicker',fontName='BodyBold',fontSize=9,leading=13,textColor=gold,spaceAfter=7));styles.add(ParagraphStyle(name='TitleNew',fontName='Display',fontSize=25,leading=31,textColor=navy,spaceAfter=14))
flow=[]
def para(s,style='Text'):flow.append(Paragraph(s,styles[style]))
def heading(s):para(s,'Heading')
def sub(s):para(s,'Sub')
def formula(s):para(s,'Formula')
def table(rows,widths=None):
 values=[[Paragraph(str(v),styles['SmallText'] if i else ParagraphStyle('th',parent=styles['SmallText'],fontName='BodyBold',textColor=colors.white)) for v in row] for i,row in enumerate(rows)]
 t=Table(values,colWidths=widths or [516/len(rows[0])]*len(rows[0]),hAlign='LEFT',repeatRows=1);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),navy),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,light]),('LINEBELOW',(0,-1),(-1,-1),.5,colors.HexColor('#d5dce1'))]));flow.extend([t,Spacer(1,9)])
def page(n,title):
 if flow:flow.append(PageBreak())
 para(f'LECTURE 07 · REVIEW NOTES · {n}','Kicker');heading(title)
# 1
para('LECTURE 07 · REVIEW NOTES','Kicker');para('What Is a Share Worth?','TitleNew');para('Book equity, market equity, discounted cash flows and dividend discount models.','Sub');para('Luis Ceballos, PhD · Knauss School of Business · Fall 2026','SmallText')
sub('1. Begin with Citi and NVIDIA')
para('The market price of a share is not the same as its book value. Book equity is the accounting residual after recorded liabilities are subtracted from recorded assets. Market equity is the price investors currently pay for all common shares outstanding. Compare common equity with common equity, using a consistent date and share basis.')
formula('Book equity = Assets − Liabilities<br/>Market equity = Share price × Common shares outstanding')
table([['Historical snapshot','Book measure','Market measure','Market / book'],['Citi · Dec. 31, 2024','$101.62 per share','$70.39 per share','0.69×'],['NVIDIA · Jan. 26, 2025','$79.327bn common equity','$3,490.91bn market equity','44.0×']],[151,123,142,100])
para('NVIDIA: 24.477 billion shares × $142.62 = $3,490.91 billion. The price is the Jan. 24, 2025 close, the last trading day before its fiscal close. Its assets were $111.601bn and liabilities $32.274bn. Citi and NVIDIA have different fiscal closing dates; these are labeled historical examples, not current quotations.','SmallText')
para('<b>Below book does not automatically mean cheap.</b> A discount can reflect low expected profitability relative to the required return, anticipated losses or other risks. <b>Above book does not automatically mean expensive.</b> Expected growth, competitive advantages and internally developed capabilities can support value that is not fully reflected in recorded net assets.')
para('The central question is: <b>what future cash flows and risk assumptions would justify the market price?</b> Neither ratio proves that the market is right or wrong. These notes use fictional mature companies to practice DDM; NVIDIA’s current dividend alone is not a sufficient one-stage valuation model.')
#2
page(2,'2. Three questions behind every DCF')
para('A discounted cash flow model connects expected future payments to value today. Discounting reflects both the time value of money and the return required for the cash flows’ risk. The model is an estimate conditional on its assumptions, not a promise of the future trading price.')
formula('Value today = CF<sub>1</sub>/(1 + r) + CF<sub>2</sub>/(1 + r)² + … + CF<sub>n</sub>/(1 + r)ⁿ')
table([['Question','Equity valuation in this lecture'],['Which cash flows?','Dividends available to common shareholders.'],['Which discount rate?','Cost of equity k: the return shareholders require.'],['Which horizon?','One stable-growth stage, or explicit early dividends followed by stable growth.']],[145,371])
sub('Connecting Lecture 06 to valuation')
formula('k = r<sub>f</sub> + β × [E(r<sub>M</sub>) − r<sub>f</sub>]')
para('If the risk-free rate is 4%, beta is 1.20 and the market risk premium is 5%, then k = 4% + 1.20 × 5% = <b>10%</b>. The premium is already the excess return; do not subtract the risk-free rate a second time.')
sub('Worked example: a finite stream')
div=[2,2.2,2.4];pv=[d/1.1**(i+1) for i,d in enumerate(div)]
table([['Year','Cash flow','Discounting at 10%','Present value']]+[[str(i+1),f'${d:.2f}',f'{d:.2f} / 1.10^{i+1}',f'${v:.4f}'] for i,(d,v) in enumerate(zip(div,pv))]+[['Total','','',f'${sum(pv):.4f}']],[58,104,240,114])
para('This sum values only the three displayed payments. If the business continues afterward, omitting later distributions understates its value. A terminal value represents those later payments.')
sub('Match the cash flow and the discount rate')
para('Dividends go to shareholders, so use the cost of equity. Free cash flow to the firm goes to debt and equity providers, so an enterprise-value model uses WACC. Enterprise value and market equity are different measures. Do not discount dividends using WACC merely because it is called a cost of capital.')
#3
page(3,'3. Gordon growth and the sources of growth')
para('For a mature dividend-paying firm, the Gordon model assumes dividends grow at a constant rate forever and the required return remains constant. D<sub>0</sub> is the dividend just paid; D<sub>1</sub> is next year’s expected dividend.')
formula('D<sub>1</sub> = D<sub>0</sub>(1 + g)<br/>P<sub>0</sub> = D<sub>1</sub> / (k − g), with k > g')
para('Use decimals in the denominator: 10% − 4% is 0.10 − 0.04 = 0.06. The formula requires a positive spread k − g. If g approaches k, the valuation becomes extremely sensitive; g ≥ k does not produce a valid finite Gordon value.')
sub('Growth from reinvestment')
formula('Retention b = 1 − payout ratio δ<br/>g = b × ROE<br/>D<sub>0</sub> = EPS<sub>0</sub> × δ')
para('This growth relation assumes stable profitability and reinvestment policies. ROE measures earnings relative to book equity. Reinvestment supports growth, but growth alone does not guarantee value creation: the return on the additional investment matters.')
sub('Worked example: growth, value and a trading signal')
table([['Input','Value'],['EPS<sub>0</sub>; payout ratio','$5.00; 60%'],['ROE; required return k','10%; 10%'],['Market quote','$48.00']],[300,216])
table([['Step','Calculation'],['Retention','b = 1 − 0.60 = 0.40'],['Growth','g = 0.40 × 10% = 4%'],['Dividend just paid','D<sub>0</sub> = $5.00 × 0.60 = $3.00'],['Next dividend','D<sub>1</sub> = $3.00 × 1.04 = $3.12'],['Model value','P<sub>0</sub> = $3.12 / (0.10 − 0.04) = $52.00'],['Model-relative signal','$52.00 > $48.00: undervalued under these assumptions.']],[150,366])
para('The implied upside is 52/48 − 1 = <b>8.33%</b>. This is a comparison between model and quote, not a guaranteed investment return. Challenge the growth and discount-rate assumptions before treating the signal as compelling.','SmallText')
#4
page(4,'4. Same cash flows, different required return')
para('A valuation can change even when the dividend forecast stays fixed. Higher required returns lower present value. Changes in risk-free rates, systematic risk or the market risk premium can all affect k. In the classroom experiment, only k changes; the market quote is deliberately held fixed to isolate the mechanism.')
formula('Classroom experiment: D<sub>1</sub> = $3.00; g = 3%; market quote = $55.00')
table([['Required return','Gordon value','Compared with $55'],['8%','$3 / (0.08 − 0.03) = $60.00','Model above quote'],['9%','$3 / (0.09 − 0.03) = $50.00','Model below quote'],['10%','$3 / (0.10 − 0.03) = $42.86','Model below quote']],[135,225,156])
para('A <b>one-percentage-point</b> increase in k, from 8% to 9%, lowers value by $10 or <b>16.67%</b>. The dividend and growth forecast did not change. A model-relative buy signal became a sell signal at the unchanged $55 quote.')
sub('Worked example from the lecture')
d0=2.86;g=.0307;k=.0646;d1=d0*(1+g);val=d1/(k-g);implied=d1/75.77+g
para('The guided example uses D<sub>0</sub> = $2.86, g = 3.07%, k = 6.46%, and a market price of $75.77. Keep intermediate precision:')
table([['Step','Result'],['D<sub>1</sub> = 2.86 × 1.0307',f'${d1:.6f}'],['P<sub>0</sub> = D<sub>1</sub> / (0.0646 − 0.0307)',f'${val:.4f}'],['Implied k = D<sub>1</sub> / 75.77 + 0.0307',f'{implied*100:.4f}%']],[350,166])
para('The market price can be reconciled with the same dividend-growth forecast by requiring about 6.96%, rather than 6.46%. That small difference is enough to explain the valuation gap. This inversion is useful: ask what the price implies before declaring it wrong.')
sub('Discussion habits')
para('Predict direction first, calculate second. State what is held fixed. Distinguish percentage points from percentage changes. Finally, ask whether the new assumption is economically reasonable rather than choosing an assumption merely to obtain a preferred price.')
#5
page(5,'5. Two stages: value the transition and maturity')
para('A young or rapidly changing business may not be well represented by a single perpetual growth rate. A two-stage DDM forecasts early dividends explicitly and applies stable growth only after that transition. In Activity 2, the first three dividends are given and stable growth begins with year 4.')
formula('TV<sub>3</sub> = D<sub>4</sub> / (k − g<sub>S</sub>) = D<sub>3</sub>(1 + g<sub>S</sub>) / (k − g<sub>S</sub>)<br/>P<sub>0</sub> = D<sub>1</sub>/(1+k) + D<sub>2</sub>/(1+k)² + D<sub>3</sub>/(1+k)³ + TV<sub>3</sub>/(1+k)³')
para('<b>Timing matters:</b> TV<sub>3</sub> is a value at year 3, immediately after the third dividend. It summarizes dividends from year 4 onward. It is not a cash flow at time 0 and must be discounted three years. D<sub>3</sub> belongs in the explicit stage and is not the numerator of TV<sub>3</sub> without first growing it to D<sub>4</sub>.')
sub('Worked example: independent practice case')
d=[2,2.4,2.88];k=.10;gs=.03;d4=d[2]*(1+gs);tv=d4/(k-gs);pvs=[v/(1+k)**(i+1) for i,v in enumerate(d)];pvtv=tv/(1+k)**3;p0=sum(pvs)+pvtv
para('Assume D<sub>1</sub> = $2.00, D<sub>2</sub> = $2.40, D<sub>3</sub> = $2.88, k = 10% and stable growth g<sub>S</sub> = 3%. These are practice inputs, not an individual graded case.')
table([['Step','Calculation','Result'],['First stable dividend','D<sub>4</sub> = 2.88 × 1.03',f'${d4:.4f}'],['Value at year 3','TV<sub>3</sub> = D<sub>4</sub> / (0.10 − 0.03)',f'${tv:.4f}'],['Year 1 dividend','2.00 / 1.10',f'${pvs[0]:.4f}'],['Year 2 dividend','2.40 / 1.10²',f'${pvs[1]:.4f}'],['Year 3 dividend','2.88 / 1.10³',f'${pvs[2]:.4f}'],['PV of terminal value','TV<sub>3</sub> / 1.10³',f'${pvtv:.4f}'],['Value today','Sum of the four present values',f'${p0:.4f}']],[141,251,124])
para(f'The share is worth <b>${p0:.2f}</b> under these assumptions. Notice that ${tv:.2f} is the future terminal value, not today’s total share value. Rounding each intermediate value too early can distort the final answer.')
#6
page(6,'6. Why terminal value deserves scrutiny')
share=pvtv/p0*100
para(f'In the practice case, PV(TV) is ${pvtv:.4f} of a total value of ${p0:.4f}: <b>{share:.2f}%</b>. This is not automatically a modeling mistake. A continuing firm may pay dividends for decades after a short explicit forecast. But it means long-run assumptions deserve close attention.')
formula('Terminal-value share = PV(TV<sub>n</sub>) / P<sub>0</sub><br/>P<sub>0</sub> = PV(explicit dividends) + PV(terminal value)')
rows=[['Scenario','k','Stable g','P<sub>0</sub>','PV(TV) / P<sub>0</sub>']]
for label,kk,gg in [('Base case',.10,.03),('Higher required return',.11,.03),('Higher stable growth',.10,.04)]:
 tt=d[2]*(1+gg)/(kk-gg);pvt=tt/(1+kk)**3;total=sum(v/(1+kk)**(i+1) for i,v in enumerate(d))+pvt;rows.append([label,f'{kk:.0%}',f'{gg:.0%}',f'${total:.2f}',f'{pvt/total:.1%}'])
table(rows,[190,55,70,90,111])
para('Only the stated rate changes; the first three dividends remain fixed. Raising k lowers the present value of both the explicit dividends and the terminal value. Raising stable growth changes D<sub>4</sub> and narrows k − g<sub>S</sub>, increasing terminal value through two channels.')
sub('Reading the classroom result charts')
para('<b>Activity 1:</b> each bar compares the calculated value of a student’s own case with its own market quote. A positive percentage gap is a model-relative buy signal; a negative gap is a sell signal. Comparing raw dollar values across different companies is less informative.')
para('<b>Activity 2:</b> the green component is PV of the explicit dividends; the gold component is PV of terminal value. Their sum is P<sub>0</sub>. Compare terminal-value shares and discuss which cases depend most heavily on the long run.')
sub('Avoid these common errors')
table([['Error','Correction'],['Using g = ROE','Multiply ROE by retention, not payout.'],['Putting percentages directly in a denominator','Convert 10% to 0.10 and 3% to 0.03.'],['Using D<sub>0</sub> in Gordon’s numerator','Grow it once to obtain D<sub>1</sub>.'],['Using TV<sub>3</sub> as today’s value','Discount TV<sub>3</sub> and add early-dividend PVs.'],['Treating k ≤ g as a meaningful negative valuation','Reassess the perpetual-growth assumptions.'],['Interpreting model upside as a promised return','The signal depends on forecasts and required returns.']],[248,268])
#7
page(7,'7. Activities and a final self-check')
para('The two graded activities total <b>5 points</b>. Each student has a distinct, repeatable set of fictional-company inputs. The method is shared; copying another case’s numerical answers will not solve your case.')
table([['Activity','Required outputs','Points'],['1 · Gordon + trading signal','g, k, P<sub>0</sub>, and undervalued/buy or overvalued/sell','3'],['2 · Two-stage valuation','TV<sub>3</sub> and P<sub>0</sub>','2']],[172,294,50])
para('For Activity 1, the stated tolerance is ±0.05 percentage points for g and k and ±1% for P<sub>0</sub>. Activity 2 permits ±1% for TV<sub>3</sub> and P<sub>0</sub>. Keep at least four decimals in intermediate calculations. Complete Activity 1 before Activity 2.')
para('Only correct, saved answers enter the instructor’s discussion charts. Attempts, participation and scores are separate records. Instructor previews and rate-shock demonstrations do not submit on a student’s behalf or change a score. In Review mode, graded submissions are closed.')
sub('Self-check: answer before reading the solutions')
para('<b>1.</b> Book value is $100 per share and market price is $70. Is the stock necessarily undervalued?<br/><b>2.</b> D<sub>0</sub> = $2, g = 4%, k = 9%. What is P<sub>0</sub>?<br/><b>3.</b> The same firm’s k rises to 10%, with dividends and growth unchanged. What happens?<br/><b>4.</b> A terminal value is calculated at year 3. How many years should it be discounted?')
para('<b>Solutions.</b> (1) No; the book-to-market gap alone does not identify mispricing. (2) D<sub>1</sub> = $2.08; P<sub>0</sub> = 2.08/(0.09 − 0.04) = <b>$41.60</b>. (3) P<sub>0</sub> = 2.08/(0.10 − 0.04) = <b>$34.67</b>, a 16.67% decrease. (4) Three years, adding separately the PV of dividends in years 1–3.')
sub('Sources and further review')
para('Lecture readings: Bodie, Kane and Marcus, Chapters 12.7, 13.2 and 13.3. Discover, the cash-flow-model comparison, the life-cycle illustration and an extra worked example are optional lecture appendices.','SmallText')
para('<link href="https://www.citigroup.com/rcs/citigpa/storage/public/Earnings/Q42024/4Q24-earnings-press-release.pdf" color="#ac832c">Citigroup: Fourth Quarter and Full Year 2024 Results</link> - book value per common share.<br/><link href="https://www.sec.gov/Archives/edgar/data/1045810/000104581025000023/nvda-20250126.htm" color="#ac832c">NVIDIA: FY2025 Form 10-K</link> - balance sheet and common shares.<br/><link href="https://finance.yahoo.com/quote/C/history/" color="#ac832c">Citi historical closing prices</link> and <link href="https://finance.yahoo.com/quote/NVDA/history/" color="#ac832c">NVIDIA historical closing prices</link>.<br/>The local lecture provides a CSV with each of NVIDIA’s 20 quarterly observations and filing sources. Prices and share counts use a consistent split-adjusted basis; dividends are not included in the price series.','SmallText')
def furniture(c,doc):
 c.setStrokeColor(gold);c.setLineWidth(.6);c.line(48,747,564,747);c.setFont('BodyBold',8);c.setFillColor(navy);c.drawString(48,762,'FINA 402 · INVESTMENTS · UNIVERSITY OF SAN DIEGO');c.setFont('Body',8);c.setFillColor(muted);c.drawString(48,28,'Lecture 07 Review Notes · Discounted Cash Flow Valuation');c.drawRightString(564,28,f'Page {doc.page}')
out=root/'Review_Notes_Lec07.pdf';SimpleDocTemplate(str(out),pagesize=(612,792),leftMargin=48,rightMargin=48,topMargin=62,bottomMargin=48,title='Lecture 07 Review Notes - Discounted Cash Flow Valuation',author='Luis Ceballos').build(flow,onFirstPage=furniture,onLaterPages=furniture)
print(out)
