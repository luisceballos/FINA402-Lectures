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
 para(f'LECTURE 08 · REVIEW NOTES · {n}','Kicker');heading(title)



para('LECTURE 08 · REVIEW NOTES','Kicker');para('Equity valuation: FCFE','TitleNew')
para('Luis Ceballos, PhD · FINA 402 · Fall 2026','SmallText')
sub('1. Why value cash available to shareholders?')
para('Amazon states that it has never paid cash dividends. Yet its non-affiliate voting shares alone had a market value of $2.118 trillion on June 30, 2025. Zero dividends today do not imply zero future distributions. Shareholders may receive cash through dividends, buybacks or liquidation.')
para('Sources: <link href="https://ir.aboutamazon.com/faqs/default.aspx">Amazon investor FAQ</link> and <link href="https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm">2025 Form 10-K</link>. The valuation observation is dated, not a live quote.','SmallText')
para('The updated earnings/dividends chart uses the Shiller S&amp;P composite series from January 2000 through June 2026. June is the last month with both observations in the workbook retrieved October 14, 2026. Values are trailing four-quarter amounts per index unit, adjusted to June 2026 dollars. Shiller interpolates quarterly observations to monthly frequency; dividends exclude buybacks.')
para('Endpoint: real earnings 295.39; real dividends 81.70. Earnings are more volatile than distributions. Source: <link href="https://shillerdata.com/">Robert Shiller dataset</link>.','SmallText')
para('Dividend policy varies: mature cash-generating firms such as Coca-Cola and P&amp;G pay regular dividends; Amazon and Berkshire retain cash or use repurchases. Microsoft shows that growth and dividends can coexist. The October 14, 2026 Finviz screen identifies 95 S&amp;P 500 companies with no reported dividend yield, including possible suspensions; it is not a list of firms that never paid dividends.','SmallText')
sub('2. DDM recap')
formula('One stage: P0 = DPS1 / (ke - g)<br/>Two stages: P0 = sum of discounted DPS for years 1 to N<br/>+ terminal price at year N / (1 + ke)^N<br/>Terminal price = DPS(N+1) / (ke - stable growth)')
para('Gordon assumes stable growth, payout and risk, with cost of equity above growth. For two stages, forecast the first stage explicitly and use Gordon only once the stable stage begins. A DDM can value a firm with no current dividend if future distributions are forecast consistently.')
sub('3. Accounting ingredients')
formula('Assets = Liabilities + Book equity<br/>NI = (EBIT - Interest) x (1 - tax rate)<br/>Net CapEx = CapEx - Depreciation<br/>Operating WC = Noncash operating current assets - operating current liabilities')
para('The net-income expression is a simplified income statement without other nonoperating items. Operating working capital excludes cash and interest-bearing debt.')
page(2,'4. FCFE, reinvestment and leverage')
formula('FCFE0 = NI - Net CapEx - change in WC + net debt issued<br/>ER = Net CapEx + change in WC - net debt issuance<br/>FCFE0 = NI - ER')
para('Net debt issued equals new borrowing minus principal repayments. An increase in working capital uses cash; a decrease releases cash. Borrowing raises current cash available but also creates future obligations.')
sub('Use L = book debt / assets (D/A)')
formula('A = D + E (simplified balance)<br/>L = D / A = D / (D + E)<br/>ER = (1 - L) x (Net CapEx + change in WC)')
para('Assume A = D + E, omitting other liabilities. D is interest-bearing debt and E is book equity. With stable proportional financing, debt funds L of reinvestment and equity funds 1 - L. If other liabilities are present, D/A need not equal D/(D+E).')
para('If D = 50 and A = 150, L = 1/3. Equity funds 2/3 of new investment. This differs from defining leverage as D/E.')
para('Method reference: <link href="https://pages.stern.nyu.edu/~adamodar/New_Home_Page/AppldCF/derivn/ch11deriv.html">Damodaran, FCFE under stable leverage</link>.','SmallText')
sub('5. Growth and required return are model assumptions')
formula('Equity reinvestment rate = ER / NI<br/>ROE = NI / beginning book equity<br/>g = (ER / NI) x ROE<br/>ke = risk-free rate + beta x equity risk premium')
para('The growth relation requires stable reinvestment, profitability and leverage. CAPM estimates the equity required return. These are valuation assumptions, not accounting identities. A high implied near-term growth rate is not automatically sustainable forever.')
sub('Illustrative reinvestment example')
para('NI = 2,177; net CapEx = 468; increase in WC = 852; net debt issued = -104 ($m). ROE = 23.12%. ER = 1,424, so the reinvestment rate is 65.41% and implied growth is 15.12%. Reassess ROE and reinvestment before using that growth in perpetuity.')
page(3,'6. Same equity claim, two cash-flow approaches')
formula('FCFE total equity value: VE,0 = FCFE0 x (1 + g) / (ke - g)<br/>DDM price per share: P0 = DPS0 x (1 + g) / (ke - g)<br/>Per-share price: P0 = total equity value / shares outstanding (FCFE approach)')
para('DDM using DPS directly produces price per share; do not divide by shares again. FCFE in total dollars produces total equity value, which must be divided by shares. Both methods estimate the intrinsic value of the shareholder claim. Neither produces total asset value or book equity. FCFE already reflects financing, so do not subtract debt again. Use the same total or per-share basis when comparing valuations.')
table([['FCFE','DDM'],['Cash available after reinvestment and financing','Expected dividends actually distributed'],['Useful when payout differs from cash capacity','Useful when stable payout reflects cash capacity'],['Discount at cost of equity','Discount at cost of equity'],['Model retained cash and investment consistently','Model retained cash and eventual payouts consistently']],[258,258])
para('The methods can reconcile under consistent assumptions. A gap may reflect different payout, reinvestment, retained-cash, terminal-value or risk assumptions. Do not automatically select the higher result. Our numerical exercises assume no separately valued nonoperating assets.')
sub('Illustrative airline')
para('NI = 1,164; CapEx = 1,520; depreciation = 1,205; increase in WC = 303 ($m). Book D/A = 5.44%; ROE = 10%; beta = 0.83; risk-free rate = 6%; equity risk premium = 5%.')
table([['Calculation','Result'],['Reinvestment total','1,520 - 1,205 + 303 = 618'],['Equity reinvestment','(1 - 0.0544) x 618 = 584.38'],['Current FCFE','1,164 - 584.38 = 579.62'],['Growth','(584.3808 / 1,164) x 10% = 5.02045%'],['Cost of equity','6% + 0.83 x 5% = 10.15%'],['Total equity value','$11,866.91 million']],[240,276])
para('Keep full intermediate precision. The simplified balance assumes A = D + E. These are illustrative assumptions, not current market data.')
page(4,'7. One activity, five questions')
table([['Question','Output','Points'],['a','Current FCFE ($m)','1'],['b','Sustainable growth (%)','1'],['c','Cost of equity (%)','1'],['d','FCFE total intrinsic equity value ($m)','1'],['e','Compare total FCFE and DDM equity values; identify the higher estimate and justify your preferred approach','1']],[60,406,50])
para('Each student receives a deterministic individual case. The instructor opens the activity for the chosen section. Enter percentages such as 3.25, not 0.0325. Numerical tolerance is 1%; keep full precision while calculating. Partial numerical answers and the explanation are saved.')
para('Question e is reviewed by the instructor, not automatically judged correct. Either model can receive credit with a reasoned explanation tied to cash available, payout, retained cash and valuation assumptions. Numerical points total 4; the explanation adds 0 or 1. Revising the explanation returns it to review. Review mode disables submissions.')
sub('Self-check')
para('NI = 100, net CapEx = 40, increase in WC = 10 ($m); L = D/A = 0.20, ROE = 10%, risk-free rate = 4%, beta = 1.6, equity risk premium = 5%. Shares = 10 million.')
formula('ER = (1 - 0.20) x (40 + 10) = 40<br/>FCFE0 = 100 - 40 = 60<br/>g = (40 / 100) x 10% = 4%<br/>ke = 4% + 1.6 x 5% = 12%<br/>Total equity value = 60 x 1.04 / (0.12 - 0.04) = 780 ($m)<br/>FCFE price per share = 780 / 10 = $78')
para('For this activity, compare total equity values: if DDM gives $650m, do not choose FCFE at $780m just because it is larger. Investigate whether the dividend forecast captures cash retained today and eventually distributed, and whether both forecasts use consistent growth and risk.')
sub('Class highlights')
para('FCFE measures ability to distribute; DDM forecasts distributions. Both value equity and use the cost of equity. Growth requires reinvestment. The leverage denominator matters. Zero dividends today do not prove zero value. Compare values only after aligning units, retained cash and assumptions.')
def furniture(c,doc):
 c.setStrokeColor(gold);c.setLineWidth(.6);c.line(48,747,564,747);c.setFont('BodyBold',8);c.setFillColor(navy);c.drawString(48,762,'FINA 402 · INVESTMENTS · UNIVERSITY OF SAN DIEGO');c.setFont('Body',8);c.setFillColor(muted);c.drawString(48,28,'Lecture 08 Review Notes · Equity Valuation: FCFE');c.drawRightString(564,28,f'Page {doc.page}')
out=root/'Review_Notes_Lec08.pdf';SimpleDocTemplate(str(out),pagesize=(612,792),leftMargin=48,rightMargin=48,topMargin=62,bottomMargin=48,title='Lecture 08 Review Notes - Equity Valuation: FCFE',author='Luis Ceballos').build(flow,onFirstPage=furniture,onLaterPages=furniture)
print(out)
