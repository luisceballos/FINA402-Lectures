import fs from 'node:fs/promises';
import path from 'node:path';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const root=path.resolve('AI-powered/Lectures');
const wb=Workbook.create(),s=wb.worksheets.add('Terminal value');
s.showGridLines=false;s.tabColor='#18344F';
s.getRange('A1:E33').format.font={name:'Arial',size:11,color:'#18283C'};
s.getRange('A1:E33').format.rowHeight=24;
for(const [col,width] of [['A',37],['B',20],['C',3],['D',43],['E',38]])s.getRange(col+'1:'+col+'33').format.columnWidth=width;
const put=(cell,value)=>s.getRange(cell).values=[[value]];
put('A2','Lec07 | Terminal value');s.getRange('A2').format.font={size:16,bold:true};
put('A3','Activity 2 | 2 points');
put('D2','Complete the blank cells in column B.');
put('D3','Formula suggestions are text, not calculations.');
put('A5','Your name');put('D5','Your section');put('A6','Case ID');
for(const c of ['B5','B6','E5'])s.getRange(c).format.fill='#FFF1C2';
put('A8','1. Copy your individual case inputs');
put('D8','Source: your Lec07 Activity 2 case card.');
const inputs=[['D1 | Year 1 dividend',null,null,'Dollars per share'],['D2 | Year 2 dividend',null,null,'Dollars per share'],['D3 | Year 3 dividend',null,null,'Dollars per share'],['k | Required return',null,null,'Type the percentage, including the % sign.'],['gS | Stable growth rate',null,null,'Check that k is greater than gS.']];
s.getRange('A9:D13').values=inputs;
s.getRange('B9:B13').format.fill='#FFF1C2';s.getRange('B9:B13').format.font.color='#0000FF';
s.getRange('B9:B11').setNumberFormat('0.00');s.getRange('B12:B13').setNumberFormat('0.0%');
put('A15','2. Build your valuation');
put('A16','Calculation (dollars per share)');put('B16','Your formula / result');put('D16','Suggested Excel formula');put('E16','What it does');
const steps=[
['D4 | First stable dividend',null,null,"'=B11*(1+B13)",'Grow the year 3 dividend once.'],
['TV3 | Value at end of year 3',null,null,"'=B17/(B12-B13)",'Value dividends from year 4 onward.'],
['PV of D1',null,null,"'=B9/(1+$B$12)",'Discount the year 1 dividend.'],
['PV of D2',null,null,"'=B10/(1+$B$12)^2",'Discount the year 2 dividend.'],
['PV of D3',null,null,"'=B11/(1+$B$12)^3",'Discount the year 3 dividend.'],
['PV of terminal value',null,null,"'=B18/(1+$B$12)^3",'Bring TV3 back to today.'],
['P0 | Value today',null,null,"'=SUM(B19:B22)",'Add the four present values.']];
s.getRange('A17:E23').values=steps;s.getRange('B17:B23').format.fill='#E7EFFA';
s.getRange('B17:B23').setNumberFormat('0.00;[Red](0.00);"-"');
s.getRange('D17:D23').format.font={name:'Arial',size:11,color:'#42536B'};
put('A25','3. Submit in the lecture');
put('A26','TV3: use your result in B18.');put('D26','P0: use your result in B23.');
put('A28','Enter both answers in Activity 2 and click Submit.');
put('A29','Use two decimals when submitting; keep full precision in Excel.');
put('A30','TV3 is at year 3. P0 is at year 0. Do not confuse TV3 with its present value.');
put('A32','To use a suggestion: type the displayed formula in the matching blank B cell.');
put('A33','Complete every input and calculation. This workbook does not submit your work.');
for(const r of [8,15,25]){s.getRange('A'+r+':E'+r).format.fill='#E6EBF1';s.getRange('A'+r).format.font.bold=true;}
for(const range of ['A16:B16','D16:E16']){s.getRange(range).format.fill='#18344F';s.getRange(range).format.font={bold:true,color:'#FFFFFF'};}
for(const r of [18,23]){s.getRange('A'+r+':B'+r).format.font.bold=true;s.getRange('A'+r+':B'+r).format.borders={bottom:{style:'thin',color:'#9BACC0'}};}
// Exercise the suggested formulas in a disposable in-memory state, then clear answers.
s.getRange('B9:B13').values=[[3],[4],[5],[0.10],[0.03]];
for(let row=17;row<=23;row++)s.getRange('B'+row).formulas=[[s.getRange('D'+row).values[0][0]]];
wb.recalculate();
const expectedTV=5*1.03/(0.10-0.03), expectedP0=3/1.1+4/1.1**2+(5+expectedTV)/1.1**3;
if(Math.abs(s.getRange('B18').values[0][0]-expectedTV)>1e-8||Math.abs(s.getRange('B23').values[0][0]-expectedP0)>1e-8)throw Error('Suggested formulas failed valuation check');
s.getRange('B9:B13').clear({applyTo:'contents'});
s.getRange('B17:B23').clear({applyTo:'contents'});
wb.recalculate();
console.log('PASS suggested formulas calculate TV3 and P0; all inputs and answers cleared before export.');
console.log((await wb.inspect({kind:'table',range:"'Terminal value'!A16:E23",include:'values,formulas',tableMaxRows:8,tableMaxCols:5,maxChars:2500})).ndjson);
const blank=[...s.getRange('B9:B13').values,...s.getRange('B17:B23').values];
if(blank.some(row=>row.some(v=>v!==null&&v!==undefined&&v!=='')))throw Error('Student answer/input cell is not blank');
console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!',options:{useRegex:true,maxResults:10},summary:'Formula error scan'})).ndjson);
const out=path.join(root,'assets/templates/Lec07_Terminal_Value_Worksheet.xlsx');
await fs.mkdir(path.dirname(out),{recursive:true});
await (await SpreadsheetFile.exportXlsx(wb)).save(out);
const preview=await wb.render({sheetName:s.name,range:'A1:E33',scale:1.5,format:'png'});
await fs.writeFile(path.join(root,'support/previews/lec07-tv-template.png'),new Uint8Array(await preview.arrayBuffer()));
console.log('Saved '+out);
