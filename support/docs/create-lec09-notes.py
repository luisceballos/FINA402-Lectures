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
 para(f'LECTURE 09 · REVIEW NOTES · {n}','Kicker');heading(title)


para('LECTURE 09 · REVIEW NOTES','Kicker');para('What Is a Comparable Dollar Worth?','TitleNew')
para('Valuation by multiples, followed by a short introduction to price trends and moving averages.','Sub')
para('Luis Ceballos, PhD · FINA 402 · Fall 2026','SmallText')
sub('1. Price is not the same as cheapness')
para('A $30 stock with $1 of forward EPS trades at 30 times expected earnings. A $90 stock with $6 of forward EPS trades at 15 times expected earnings. The second costs less per dollar of expected earnings. It is not necessarily the better investment: growth, risk, capital requirements and the reliability of earnings may differ. All numerical examples in this lecture are simulated teaching cases.')
formula('P/E = Price / EPS<br/>P/B = Price / Book value per common share')
para('Relative valuation estimates what the market would pay if a target were priced like comparable assets. DCF estimates value under explicit cash-flow and discount-rate assumptions. Both require judgment. An entire peer group can trade at prices unsupported by fundamentals.')
sub('A multiple contains assumptions')
formula('P<sub>0</sub> = D<sub>1</sub> / (k − g)<br/>Forward P/E = Payout ratio / (k − g)')
para('The second equation follows from Gordon by dividing price by next-year EPS and assuming next-year dividends equal the payout ratio times next-year earnings. The model requires sustainable stable growth and k greater than g. Forward and trailing P/E have different earnings denominators. A higher multiple can reflect stronger growth, lower required return or a higher sustainable payout.')
table([['Multiple','Match and limitation'],['P/E','Common equity with common earnings. Negative earnings make ordinary P/E rankings unhelpful.'],['P/B','Common equity with common book equity. Interpret with expected ROE and asset quality.'],['EV/EBITDA','Enterprise value with operating earnings before D&A. EBITDA omits investment needs and is not free cash flow.']],[130,386])
page(2,'2. Selecting peers and estimating a price')
para('Use comparable businesses with similar growth, risk, profitability and reinvestment needs. An industry label alone is insufficient. Align valuation dates, forecast periods, diluted share counts and accounting adjustments. Treat leases consistently in both enterprise value and operating earnings.')
sub('Mean versus median')
para('For peer P/Es of 14, 16 and 18, both the mean and median are 16. Including an outlier at 60 raises the mean to 27, while the median becomes (16 + 18)/2 = 17. With target forward EPS of $4, these imply $108 and $68 respectively. The median limits outlier influence but cannot repair a poorly chosen peer group.')
sub('Worked example: the equity multiple route')
formula('Implied price = Peer median P/E × Target forward EPS')
para('Using the original median of 16 and EPS of $4, the implied price is <b>$64</b>. If the target quote is $50, implied upside is 64/50 − 1 = <b>28%</b>. This comparison is conditional on the multiple; it does not guarantee a future return.')
sub('Worked example: the enterprise multiple route')
para('Assume comparable forward EV/EBITDA multiples of 7, 8 and 10. Target forward EBITDA is $100m, debt is $200m, excess cash is $40m and diluted common shares are 20m. No preferred shares, noncontrolling interests or other claims/assets are included.')
table([['Step','Calculation','Result'],['Median multiple','Middle of 7, 8 and 10','8×'],['Enterprise value','8 × 100','$800m'],['Common equity','800 − 200 + 40','$640m'],['Price per share','640 / 20','$32']],[150,251,115])
para('Do not multiply EBITDA by P/E, and do not divide enterprise value directly by shares. A difference between the $64 P/E estimate and the $32 EV/EBITDA estimate is a reason to investigate peers, leverage, depreciation, margins and investment needs. It is not a reason to average the estimates automatically.')
page(3,'3. A short technical-analysis laboratory')
para('Valuation asks what a price is supported by. Technical analysis studies patterns in past prices and trading activity. In this lecture, the five-day simple moving average is a transparent descriptive tool. It smooths recent prices and reacts with a lag; it does not establish intrinsic value or guarantee a profitable trade.')
formula('SMA<sub>5</sub> = (P<sub>1</sub> + P<sub>2</sub> + P<sub>3</sub> + P<sub>4</sub> + P<sub>5</sub>) / 5')
para('For five closes of $40, $41, $42, $41 and $46, the average is <b>$42</b>. The last close is above that average. This describes information available after day 5 closes. A strategy using that closing signal cannot assume an earlier execution price.')
sub('The next execution and later outcome')
para('Suppose a hypothetical trade enters at the next session’s open of $43 and exits later at $44. Transaction cost is 0.10% of traded value on each side. Assume one share, no dividends and split-consistent prices. The exit price is not known at the time of the signal.')
formula('Net return = [Exit(1 − c) / (Entry(1 + c)) − 1] × 100%')
table([['Quantity','Calculation','Result'],['Gross return','(44/43 − 1) × 100','2.3256%'],['Entry cash cost','43 × 1.001','$43.043'],['Net exit proceeds','44 × 0.999','$43.956'],['Net return','(43.956/43.043 − 1) × 100','2.1211%']],[130,270,116])
para('The 0.10% cost is 0.001 in decimal form, charged separately on entry and exit. A negative answer is a loss. A small gross profit can disappear after costs; subtracting 0.20 percentage points is only an approximation to the exact formula.')
sub('How to avoid a misleading demonstration')
para('Reveal one day at a time and make decisions before showing the next observation. Define rules before testing, reserve unseen data, and include execution costs and slippage. Avoid selecting only survivors or successful windows. One winning trade is not evidence of a reliable predictive rule.')
page(4,'4. Activities, mistakes and self-check')
table([['Activity','Required outputs','Points'],['1 · Relative valuation','P/E implied stock price and EV/EBITDA implied stock price','3'],['2 · Technical-analysis arithmetic','Five-day SMA and realized net trade return','2']],[140,326,50])
para('Each student has distinct, repeatable simulated inputs. Activity 1 uses the median of each three-firm peer set and consistent forward fundamentals. Complete Activity 1 before Activity 2. Prices and SMA allow ±1%; net return allows ±0.05 percentage points. Both outputs must pass to complete the activity.')
para('Only correct saved outputs appear in the instructor’s section dashboard. Attempts and attendance are tracked separately. Instructor demonstrations do not change student scores. Review mode disables submissions.')
sub('Frequent errors')
table([['Error','Correction'],['Equating a low share price with cheapness','Scale price by a relevant fundamental and inspect comparability.'],['Mixing trailing and forward inputs','Use the same earnings period for target and peers.'],['Treating EBITDA as cash available','Remember taxes, CapEx and working-capital needs.'],['Dividing EV by shares','Subtract debt and add excess cash first in the simplified case.'],['Seeing the future in the chart','Form the signal only with data available at that time.'],['Entering return as a decimal','The answer box requests percent: enter 2.12, not 0.0212.']],[245,271])
sub('Self-check')
para('<b>1.</b> Peer P/Es are 12, 15 and 30. Target EPS is $3. What price follows from the median?<br/><b>2.</b> EV is $600m, debt $150m, excess cash $30m and shares 20m. What is the price?<br/><b>3.</b> If the stock is above its five-day average, does that prove it is undervalued?')
para('<b>Answers:</b> (1) 15 × 3 = <b>$45</b>. (2) (600 − 150 + 30)/20 = <b>$24</b>. (3) No. The average describes historical price behavior and does not determine intrinsic value.')
sub('Conceptual sources')
para('<link href="https://people.stern.nyu.edu/adamodar/New_Home_Page/lectures/multintr.htm" color="#ac832c">Aswath Damodaran, NYU Stern: The Anatomy of a Multiple</link>.<br/><link href="https://www.fidelity.com/learning-center/trading-investing/technical-analysis/what-is-technical-analysis" color="#ac832c">Fidelity: What is technical analysis?</link>','SmallText')
def furniture(c,doc):
 c.setStrokeColor(gold);c.setLineWidth(.6);c.line(48,747,564,747);c.setFont('BodyBold',8);c.setFillColor(navy);c.drawString(48,762,'FINA 402 · INVESTMENTS · UNIVERSITY OF SAN DIEGO');c.setFont('Body',8);c.setFillColor(muted);c.drawString(48,28,'Lecture 09 Review Notes · Multiples and Technical Analysis');c.drawRightString(564,28,f'Page {doc.page}')
out=root/'Review_Notes_Lec09.pdf';SimpleDocTemplate(str(out),pagesize=(612,792),leftMargin=48,rightMargin=48,topMargin=62,bottomMargin=48,title='Lecture 09 Review Notes - Multiples and Technical Analysis',author='Luis Ceballos').build(flow,onFirstPage=furniture,onLaterPages=furniture)
print(out)
