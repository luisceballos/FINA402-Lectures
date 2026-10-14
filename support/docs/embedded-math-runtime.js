/* Self-contained LaTeX -> SVG image layer. No network dependencies. */
(()=>{
 const cache=new Map(),escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const subs={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','ₙ':'n','ₑ':'e'},sup={'²':'2','³':'3','⁴':'4'};
 function textSource(el){const x=el.cloneNode(true);x.querySelectorAll('sub').forEach(n=>n.replaceWith(document.createTextNode('_{'+n.textContent+'}')));x.querySelectorAll('sup').forEach(n=>n.replaceWith(document.createTextNode('^{'+n.textContent+'}')));return x.textContent.trim();}
 function latex(raw){let s=raw.replace(/[₀₁₂₃₄ₙₑ]+/g,m=>'_{'+[...m].map(c=>subs[c]).join('')+'}').replace(/[²³⁴]/g,m=>'^{'+sup[m]+'}').replace(/\u00a0/g,' ');const norm=s.replace(/\s+/g,' ').trim();
 const fixed=[
 [/^P = CF/,String.raw`P=\frac{CF_1}{1+r}+\frac{CF_2}{(1+r)^2}+\cdots+\frac{CF_n}{(1+r)^n}`],
 [/^P_\{0\} = D_\{1\}\/\(1\+k\)/,String.raw`P_0=\frac{D_1}{1+k}+\frac{D_1(1+g)}{(1+k)^2}+\frac{D_1(1+g)^2}{(1+k)^3}+\cdots`],
 [/^P_\{0\} = D_\{1\} \/ \(k/,String.raw`P_0=\frac{D_1}{k-g}=\frac{D_0(1+g)}{k-g}`],
 [/^TV_\{n\} =/,String.raw`TV_n=\frac{D_{n+1}}{k_S-g_S}=\frac{D_n(1+g_S)}{k_S-g_S}`],
 [/^P_\{0\} = Σ/,String.raw`P_0=\sum_{t=1}^{n}\frac{D_t}{(1+k_H)^t}+\frac{TV_n}{(1+k_H)^n}`],
 [/^b = retention/,String.raw`b=\text{retention ratio}=1-\delta=\frac{\text{reinvested earnings}}{\text{earnings}}`],
 [/^ROE = earnings/,String.raw`ROE=\frac{\text{earnings}}{\text{book value of equity}}`],
 [/^g_\{H\} =/,String.raw`g_H=\left(\frac{1.40}{1.00}\right)^{1/3}-1=11.87\%`],
 [/^Equity_\{0\} = FCFE/,String.raw`\mathrm{Equity}_0=\frac{\mathrm{FCFE}_1}{k_e-g}`],
 [/^41.2 \/ \(0.11/,String.raw`\frac{41.2}{0.11-0.03}=\$515\,\mathrm{m}`],
 [/^Price = 515/,String.raw`\mathrm{Price}=\frac{515}{20}=\$25.75`],
 [/^Vops = 60/,String.raw`V_{\mathrm{ops}}=\frac{60(1.03)}{0.09-0.03}=1{,}030`]
 ];for(const [re,tex]of fixed)if(re.test(norm))return tex.replaceAll("\\frac", "\\dfrac");
 // Preserve prose as upright text and mathematical variables as math glyphs.
 const tokens=s.match(/[A-Za-z]+(?:[ -][A-Za-z]+)*|\d[\d,.]*|_\{[^}]*\}|\^\{[^}]*\}|[^\s]/g)||[];
 return tokens.map(t=>{if(t.startsWith('_{')||t.startsWith('^{'))return t;if(/^[A-Za-z]/.test(t)){if(/^[A-Za-z]$/.test(t))return t;return '\\text{'+t+'}';}return ({'−':'-','×':'\\times ','·':'\\quad ','δ':'\\delta ','β':'\\beta ','Δ':'\\Delta ','Σ':'\\sum ','σ':'\\sigma ','μ':'\\mu ','∞':'\\infty ','…':'\\cdots ','→':'\\rightarrow ','≥':'\\geq ','≤':'\\leq ','%':'\\%','$':'\\$','&':'\\&','#':'\\#'})[t]||t;}).join(' ');
 }
 function markup(raw,display=false){const tex=latex(raw),key=tex+'|'+display;if(cache.has(key))return cache.get(key);const node=MathJax.tex2svg(tex,{display}),svg=node.querySelector('svg');if(!svg||svg.querySelector('[data-mml-node="merror"]'))throw Error('Invalid formula: '+raw);svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('xmlns:xlink','http://www.w3.org/1999/xlink');svg.style.color='#18283c';const w=svg.getAttribute('width'),h=svg.getAttribute('height');const src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg.outerHTML)));const out=`<span class="latex-image-wrap"><img class="latex-image" src="${src}" alt="${escape(raw)}" data-latex="${escape(tex)}" style="width:${w};height:${h}" draggable="false"><span class="latex-readable">${escape(raw)}</span></span>`;cache.set(key,out);return out;}
 function replace(el){if(el.querySelector('img,input,select,button,canvas,svg,[id]'))return;const raw=textSource(el);if(!raw||!/[=×Σ]|Discount (FCFE|FCFF)/.test(raw)||raw.length>340)return;const pieces=raw.split(/\s+·\s+|\n/).filter(Boolean);try{el.innerHTML=pieces.map(t=>markup(t,el.matches('.formula,.large-formula,.math-line'))).join(' ');el.classList.add('latex-converted');}catch(e){console.warn(e.message);}}
 function scan(){observer?.disconnect();try{
  document.querySelectorAll('#deck .formula,#deck .math-line,#deck .large-formula,#deck .note-box,#deck p,#deck td,#deck .param span').forEach(el=>{if(el.closest('.latex-image-wrap')||el.querySelector('.latex-image-wrap'))return;const raw=textSource(el);if(el.matches('.formula,.math-line,.large-formula')||(/^[A-Za-zΔ][A-Za-z0-9_{}\s]*\s*=/.test(raw)&&raw.length<220))replace(el);});
  // Inline subscripts: replace only the symbol, preserving controls and surrounding prose.
  document.querySelectorAll('#deck sub,#deck sup').forEach(el=>{if(el.closest('.latex-image-wrap,svg'))return;const prev=el.previousSibling;if(!prev||prev.nodeType!==3)return;const m=prev.textContent.match(/([A-Za-z]+)$/);if(!m)return;const raw=m[1]+(el.tagName==='SUB'?'_{':'^{')+el.textContent+'}';try{const span=document.createElement('span');span.innerHTML=markup(raw);prev.textContent=prev.textContent.slice(0,-m[1].length);el.replaceWith(span);}catch{}});
  const walker=document.createTreeWalker(document.getElementById('deck'),NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const n of nodes){if(n.parentElement.closest('.latex-image-wrap,script,style,svg,canvas,option,input,textarea'))continue;const re=/(?:[A-Za-z]+[₀₁₂₃₄ₙₑ]+|[βδσμ])/g;if(!re.test(n.textContent))continue;re.lastIndex=0;const frag=document.createDocumentFragment();let end=0;for(const m of n.textContent.matchAll(re)){frag.append(n.textContent.slice(end,m.index));const span=document.createElement('span');span.innerHTML=markup(m[0]);frag.append(span);end=m.index+m[0].length;}frag.append(n.textContent.slice(end));n.replaceWith(frag);}
 }finally{observer?.observe(document.getElementById('deck'),{subtree:true,childList:true,characterData:true});}}
 let observer,timer;window.LectureMath={scan,markup,latex};MathJax.startup.promise.then(()=>{scan();observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(scan,35)});observer.observe(document.getElementById('deck'),{subtree:true,childList:true,characterData:true});});
})();
