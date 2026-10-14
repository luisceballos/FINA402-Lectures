from pathlib import Path
import sys,html,json,base64,zipfile,datetime,re
r=Path(r'C:\Users\luisceballos\My Drive\Classes\FINA402\AI-powered\Lectures');sys.path.insert(0,str(r/'support/vendor'));import xlrd
files=['Lec08_FCF.html','Review_Notes_Lec08.pdf','assets/js/lec08-classroom.js','assets/js/lec08-pacing.js','assets/js/lecture-platform.js','assets/js/lecture-adapter.js','assets/js/hub-platform.js']
backup=r/'support/backups'/('lec08-unified-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'.zip')
with zipfile.ZipFile(backup,'w',zipfile.ZIP_DEFLATED) as z:
 for f in files:z.write(r/f,f)
sheet=xlrd.open_workbook(r/'support/sources/shiller-ie-data-20261014.xls').sheet_by_name('Data')
rows=[]
for i in range(8,sheet.nrows):
 x=sheet.row_values(i)
 if isinstance(x[0],(float,int)) and 2000<=x[0]<=2026.06 and all(isinstance(x[k],(float,int)) for k in [2,3,4]):
  year=int(x[0]);month=round((x[0]-year)*100)
  rows.append({'date':f'{year}-{month:02}', 'year':year+(month-1)/12,'D':x[2],'E':x[3],'CPI':x[4]})
cpi=rows[-1]['CPI']
for x in rows:
 x['realD']=x['D']*cpi/x['CPI'];x['realE']=x['E']*cpi/x['CPI']
(r/'support/sources/lec08-shiller-series.json').write_text(json.dumps({'source':'https://shillerdata.com/','retrieved':'2026-10-14','realDollarBase':rows[-1]['date'],'method':'Trailing four-quarter dividends and earnings; monthly interpolation supplied by Shiller. CPI adjustment uses last complete paired observation, not estimated later CPI.','rows':rows},indent=2),encoding='utf8')
def txt(x,y,s,size=22,color='#18283c',weight='400',anchor='start'):
 return f'<text x="{x}" y="{y}" fill="{color}" font-family="Arial,sans-serif" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}">{html.escape(str(s))}</text>'
W,H=1200,490
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><rect width="{W}" height="{H}" rx="16" fill="#fff"/>'
svg+=txt(70,37,'S&P composite: earnings and dividends',25,weight='700')+txt(70,65,'Trailing four-quarter amounts per index unit · June 2026 dollars',17,color='#667085')
xmin=rows[0]['year'];xmax=rows[-1]['year'];ymax=320
X=lambda x:75+(x-xmin)/(xmax-xmin)*930
Y=lambda y:395-y/ymax*290
for y in [0,80,160,240,320]:
 svg+=f'<line x1="75" x2="1005" y1="{Y(y)}" y2="{Y(y)}" stroke="#e3e7ed"/>'+txt(62,Y(y)+6,y,17,anchor='end')
for y in [2000,2005,2010,2015,2020,2025]:
 svg+=txt(X(y),425,y,17,anchor='middle')
for key,color,name in [('realE','#6B1A2B','Earnings'),('realD','#207A75','Dividends')]:
 pts=' '.join(f'{X(x["year"]):.2f},{Y(x[key]):.2f}' for x in rows)
 svg+=f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="3.5"/>'
 last=rows[-1];svg+=f'<circle cx="{X(last["year"])}" cy="{Y(last[key])}" r="5" fill="{color}"/>'+txt(1020,Y(last[key])-7,name,19,color,'700')+txt(1020,Y(last[key])+18,f'{last[key]:.2f}',21,color)
svg+=txt(75,465,'2000–June 2026 · Last month with both series available in the downloaded workbook.',17,color='#667085')+'</svg>'
(r/'assets/images/lec08-shiller-updated.svg').write_text(svg,encoding='utf8')
# Conceptual balance sheet: accounting categories are distinct from valuation.
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 620"><rect width="1200" height="620" rx="22" fill="#faf8f5"/>'
svg+=txt(55,55,'ONE BUSINESS. TWO CLAIMS.',21,'#9b7625','700')+txt(55,92,'Where does the equity valuation belong?',32,weight='700')
svg+='<rect x="55" y="140" width="420" height="340" rx="16" fill="#e5ecef"/><rect x="515" y="140" width="300" height="120" rx="16" fill="#d8dce2"/><rect x="515" y="280" width="300" height="200" rx="16" fill="#6B1A2B"/>'
svg+=txt(83,185,'ASSETS',24,weight='700')+txt(83,230,'Cash and working capital',21)+txt(83,265,'Property and equipment',21)+txt(83,300,'Other assets',21)+txt(83,425,'Book assets',26,weight='700')
svg+=txt(540,185,'LIABILITIES',24,weight='700')+txt(540,222,'Debt + other obligations',18)
svg+=txt(540,330,'EQUITY',30,'#ffffff','700')+txt(540,371,'Shareholder claim',21,'#ffffff')+txt(540,439,'Book equity ≠ intrinsic value',16,'#f5e9c8')
svg+='<path d="M 995 325 L 835 365 M 995 425 L 835 385" stroke="#b8962e" stroke-width="4" fill="none"/><path d="M850 353 L835 365 L854 370 M854 377 L835 385 L850 397" stroke="#b8962e" stroke-width="4" fill="none"/>'
svg+=txt(1000,307,'FCFE',26,'#6B1A2B','700')+txt(1000,337,'Cash available',18)+txt(1000,416,'DDM',26,'#207A75','700')+txt(1000,446,'Dividends paid',18)
svg+=txt(55,535,'Assets = liabilities + book equity',25,weight='700')+txt(55,578,'Both valuation approaches estimate the intrinsic value of the equity claim, not total assets.',20)+'</svg>'
(r/'assets/images/lec08-equity-balance.svg').write_text(svg,encoding='utf8')
# Numeric editorial graphic from Amazon primary sources. Bound is deliberate: float alone exceeds $2.1tn.
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 430"><rect width="1200" height="430" rx="22" fill="#172b3f"/>'
svg+=txt(55,57,'AMAZON',24,'#ffb653','700')+txt(55,125,'$0',76,'#ffffff','700')+txt(55,170,'Cash dividends ever paid',24,'#e4ebf0')
svg+='<line x1="570" y1="70" x2="570" y2="310" stroke="#546577" stroke-width="2"/>'
svg+=txt(635,125,'>$2.1 trillion',65,'#ffb653','700')+txt(635,170,'Equity market value',24,'#e4ebf0')
svg+=txt(55,250,'Can zero dividends today mean zero value?',34,'#ffffff','700')
svg+=txt(55,300,'The valuation question concerns future cash shareholders can receive.',24,'#e4ebf0')
svg+=txt(55,367,'Value bound: non-affiliate voting shares alone were worth $2.118tn on June 30, 2025.',18,'#c6d0da')
svg+=txt(55,397,'Amazon 2025 Form 10-K; dividend history verified against Amazon Investor Relations FAQ.',17,'#c6d0da')+'</svg>'
(r/'assets/images/lec08-amazon-motivation.svg').write_text(svg,encoding='utf8')
print('Shiller observations:',len(rows),'last:',rows[-1]);print('Backup:',backup)
