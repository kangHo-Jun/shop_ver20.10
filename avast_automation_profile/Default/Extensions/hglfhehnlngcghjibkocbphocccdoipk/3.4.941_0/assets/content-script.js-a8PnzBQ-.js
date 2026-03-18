(function(){const p=[];let l=!1;document.body.setAttribute("data-smart-converter-loaded","true");const y=["\\$","€","£","¥","₹","₽","₩","฿","₫","₴","₸","₼","₺","₾","₦","R\\$","kr","CHF","Kč","zł","Rs\\.?","руб\\.?","грн\\.?","p\\.","z[łl]\\.?","K[čc]\\.?","лв\\.?"],R=["USD","EUR","GBP","JPY","CAD","AUD","CHF","CNY","HKD","NZD","SGD","CZK","DKK","NOK","SEK","PLN","HUF","RON","BGN","HRK","ISK","KRW","INR","IDR","MYR","PHP","THB","VND","ILS","SAR","AED","ZAR","NGN","MXN","BRL","ARS","CLP","COP","PEN","RMB","NTD","EURO","Euros"],U=["元","円","圓","圆","원","฿","₫","৳","௹","૱","೩","฿","៛","₭","₮","₯","₱","₲","₳","₴","₵"],f="\\d+(?:[\\s\\.,]?\\d*){0,3}(?:[,.][0-9]{1,4})?(?:\\s*[-,][-–]?)?",A=new RegExp([`(?:\\b|^)(${y.join("|")})\\s*${f}(?!\\d)`,`(?:\\b|^)${f}(?:\\s*|\\-|\\/|,|\\.|\\*)(${y.join("|")})(?!\\d)`,`(?:\\b|^)${f}(?:\\s+(?:${R.join("|")})(?!\\d))`,`(?:\\b|^)(?:${R.join("|")})\\s+${f}(?!\\d)`,`(?:\\b|^)${f}(?:${U.join("|")})(?!\\d)`,`(?:\\b|^)${f}(?:,-|-,|,--|--,)(?:${y.join("|")})?(?!\\d)`].join("|"),"gi"),D=/(\$|€|£|¥|Kč|kr|\bCHF\b|руб\.|R\$)(?:\s*)\d+(?:[,.]\d+)?|\d+(?:[,.]\d+)?(?:\s*)(\$|€|£|¥|Kč|kr|\bCHF\b|руб\.|R\$)|\b\d+(?:[,.]\d+)?(?:\s*)(?:USD|EUR|GBP|JPY|CZK|PLN|HUF|SEK|NOK|DKK)(?:\b|$)|\b\d+[,.](?:-|--|-,|,-|,-)(?!\d)/gi,v={USD:1,EUR:.93,GBP:.8,JPY:139.5,CHF:.9,CAD:1.35,AUD:1.5,CNY:7.15,HKD:7.83,NZD:1.62,SGD:1.34,CZK:22,DKK:6.88,NOK:10.79,SEK:10.33,PLN:4.18,HUF:340.87,RON:4.6,BGN:1.82,HRK:7.01,ISK:139.13,KRW:1335.47,INR:82.42,IDR:14870.35,MYR:4.57,PHP:55.61,THB:34.71,VND:23509,ILS:3.67,SAR:3.75,AED:3.67,ZAR:18.99,NGN:460.83,MXN:17.6,BRL:5.06,ARS:231.69,CLP:797.55,COP:4615,PEN:3.69,RMB:7.15,NTD:30.92},w=["USD","EUR","GBP","JPY","CNY","CZK"],H=2,M={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function E(t){return String(t).replace(/[&<>"']/g,e=>M[e])}function s(t,e=1){H>=e&&console.log(`[Smart Unit Converter] ${t}`)}function O(){if(document.getElementById("smart-unit-converter-styles"))return;const t=`
    .smart-unit-converter-highlight {
      border: 2px dashed #3498db !important;
      border-radius: 3px !important;
      padding: 0 2px !important;
      cursor: pointer !important;
      position: relative !important;
    }
    
    .smart-unit-converter-highlight:hover {
      border-color: #2980b9 !important;
      background-color: rgba(52, 152, 219, 0.1) !important;
    }
    
    .smart-unit-converter-popup {
      position: fixed !important;
      z-index: 9999999 !important;
      background-color: white !important;
      border: 1px solid #ddd !important;
      border-radius: 4px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
      padding: 8px 12px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      font-size: 13px !important;
      line-height: 1.4 !important;
      max-width: 300px !important;
      min-width: 200px !important;
      color: #333 !important;
      transition: opacity 0.2s !important;
      pointer-events: none !important;
      opacity: 0 !important;
    }
    
    .smart-unit-converter-popup.visible {
      opacity: 1 !important;
    }
    
    .smart-unit-converter-popup-title {
      font-weight: bold !important;
      margin-bottom: 6px !important;
      padding-bottom: 4px !important;
      border-bottom: 1px solid #eee !important;
      color: #2c3e50 !important;
    }
    
    .smart-unit-converter-popup-conversions {
      max-height: 200px !important;
      overflow-y: auto !important;
    }
    
    .smart-unit-converter-conversion-item {
      display: flex !important;
      justify-content: space-between !important;
      margin: 3px 0 !important;
    }
    
    .smart-unit-converter-conversion-item-currency {
      font-weight: 600 !important;
      color: #333 !important;
    }
    
    .smart-unit-converter-conversion-item-value {
      color: #27ae60 !important;
    }
    
    .smart-unit-converter-conversion-item-rate {
      font-size: 11px !important;
      color: #7f8c8d !important;
      margin: 0 0 8px 12px !important;
      font-style: italic !important;
    }
    
    .smart-unit-converter-popup-footer {
      font-size: 10px !important;
      color: #7f8c8d !important;
      margin-top: 6px !important;
      text-align: right !important;
      border-top: 1px solid #eee !important;
      padding-top: 4px !important;
    }
  `,e=document.createElement("style");e.id="smart-unit-converter-styles",e.setAttribute("data-smart-converter-element","true"),e.textContent=t,document.head.appendChild(e)}function B(t){if(!t)return 0;const e=t.replace(/[^\d.,]/g,"").replace(/(\d)[.,](\d{1,2})(?=[.,]|$)/,"$1.$2").replace(/,/g,"");return parseFloat(e)||0}function P(t){if(!t)return"Neznámý";const e={$:"USD","€":"EUR","£":"GBP","¥":"JPY","₹":"INR","₽":"RUB","₩":"KRW","฿":"THB","₫":"VND","₴":"UAH","₸":"KZT","₺":"TRY",R$:"BRL",kr:"SEK",CHF:"CHF",Kč:"CZK",zł:"PLN",Ft:"HUF",元:"CNY",円:"JPY",원:"KRW",руб:"RUB",грн:"UAH"};for(const n of R)if(t.includes(n))return n;for(const[n,r]of Object.entries(e))if(t.includes(n))return r;return t.match(/\d+\s*,[-–]/)||t.match(/\d+\s*[,.][-–]{1,2}/)?(t.includes("Kč")||t.includes("CZK"),"CZK"):"Neznámý"}function I(t,e){if(!t||!e||!v[e])return{};const n=t/v[e],r={};return w.forEach(i=>{i!==e&&v[i]&&(r[i]=n*v[i])}),r}function F(t,e){return typeof t!="number"?"":new Intl.NumberFormat("en-US",{style:"currency",currency:e,minimumFractionDigits:2,maximumFractionDigits:2}).format(t)}function G(t,e,n){K();const r=document.createElement("div");r.className="smart-unit-converter-popup",r.id="smart-unit-converter-popup",r.setAttribute("data-smart-converter-element","true");const i=document.createElement("div");i.className="smart-unit-converter-popup-title",i.textContent=`Převod: ${t}`,r.appendChild(i);const o=document.createElement("div");o.className="smart-unit-converter-popup-conversions";const a=I(n,e);for(const[u,c]of Object.entries(a)){const m=document.createElement("div");m.className="smart-unit-converter-conversion-item";const g=document.createElement("span");g.className="smart-unit-converter-conversion-item-currency",g.textContent=u;const h=document.createElement("span");h.className="smart-unit-converter-conversion-item-value",h.textContent=F(c,u);const b=document.createElement("div");b.className="smart-unit-converter-conversion-item-rate";const C=v[e]||1,T=(v[u]||1)/C;b.textContent=`1 ${e} = ${T.toFixed(4)} ${u}`,m.appendChild(g),m.appendChild(h),o.appendChild(m),o.appendChild(b)}r.appendChild(o);const d=document.createElement("div");return d.className="smart-unit-converter-popup-footer",d.textContent="Přibližné kurzy k aktuálnímu datu",r.appendChild(d),document.body.appendChild(r),r}function K(){const t=document.getElementById("smart-unit-converter-popup");t&&t.remove()}function j(t,e){if(!t||!e)return;const n=e.getBoundingClientRect();window.innerWidth-n.right>220?(t.style.left=n.right+10+"px",t.style.top=n.top-5+"px"):(t.style.left=n.left-220+"px",t.style.top=n.top-5+"px")}function Y(t){const e=[];for(;t&&t.nodeType===Node.ELEMENT_NODE;){let n=t.nodeName.toLowerCase();if(t.id){n+="#"+t.id,e.unshift(n);break}else{let r=t.parentNode?t.parentNode.childNodes:[],i=0;for(let o=0;o<r.length;o++){let a=r[o];if(a===t){n+=":nth-child("+(i+1)+")";break}a.nodeType===Node.ELEMENT_NODE&&a.nodeName.toLowerCase()===n&&i++}}e.unshift(n),t=t.parentNode}return e.join(" > ")}function k(t,e,n,r=30){const i=Math.max(0,e-r),o=Math.min(t.length,e+n+r);let a=i>0?"...":"",d=o<t.length?"...":"";return a+t.substring(i,e)+"<HIGHLIGHT>"+t.substring(e,e+n)+"</HIGHLIGHT>"+t.substring(e+n,o)+d}function _(){if(p.length===0){console.log("[Smart Unit Converter] Žádné měny nenalezeny na této stránce.");return}const t={};p.forEach(e=>{const n=P(e.value);t[n]||(t[n]=[]),t[n].push(e)}),console.log(`%c[Smart Unit Converter] Nalezeno ${p.length} měnových hodnot na stránce ${window.location.href}`,"font-weight: bold; font-size: 14px; color: #2c3e50;");for(const[e,n]of Object.entries(t))console.group(`%cMěna: ${e} (${n.length} hodnot)`,"font-weight: bold; color: #2980b9;"),console.table(n.map(r=>({Hodnota:r.value,Kontext:r.context||"N/A","DOM cesta":r.domPath.length>100?r.domPath.substring(0,100)+"...":r.domPath}))),console.groupEnd();console.group("Podrobný výpis všech nalezených měn:"),p.forEach((e,n)=>{console.log(`%c${n+1}. ${e.value}`,"font-weight: bold;"),console.log(`   Kontext: ${e.context||"N/A"}`),console.log(`   DOM cesta: ${e.domPath}`),console.log(`
`)}),console.groupEnd()}function L(t){if(!t||t.trim()==="")return[];try{const e=t.match(A);return e&&e.length>0?e:t.match(D)||[]}catch(e){s(`Error in regex: ${e.message}`,2);try{return t.match(D)||[]}catch(n){return s(`Error in simple regex: ${n.message}`,2),[]}}}function z(t){const e=t.target;if(!e||!e.getAttribute("data-currency-value"))return;const n=e.getAttribute("data-currency-value"),r=e.getAttribute("data-currency-type"),i=parseFloat(e.getAttribute("data-numeric-value")||"0"),o=G(n,r,i);j(o,e),setTimeout(()=>{o.classList.add("visible")},50)}function V(t){const e=document.getElementById("smart-unit-converter-popup");e&&(e.classList.remove("visible"),setTimeout(()=>{K()},300))}function $(t){var e;if(t&&!(t.nodeType===Node.ELEMENT_NODE&&(t.hasAttribute("data-smart-converter-processed")||(e=t.classList)!=null&&e.contains("smart-unit-converter-highlight")||t.hasAttribute("data-smart-converter-element")))){if(t.nodeType===Node.TEXT_NODE){const n=t.textContent;if(!n||n.trim()===""||t.parentElement&&t.parentElement.querySelector(".smart-unit-converter-highlight"))return;const r=L(n);if(r&&r.length>0){const i=document.createElement("span");i.setAttribute("data-smart-converter-processed","true");let o=0,a="";const d=new RegExp(A);let u;for(s(`Found ${r.length} matches in text: ${n.substring(0,50)}...`,2),d.lastIndex=0;(u=d.exec(n))!==null;){a+=E(n.substring(o,u.index));const c=u[0],m=P(c),g=B(c),h=E(c),b=E(String(m)),C=E(String(g));a+=`<span class="smart-unit-converter-highlight" data-currency-value="${h}" data-currency-type="${b}" data-numeric-value="${C}">${h}</span>`,o=d.lastIndex;const S=k(n,u.index,c.length);p.push({value:c,domPath:Y(t.parentElement)+" > textNode("+Array.from(t.parentNode.childNodes).indexOf(t)+")",context:S,currencyType:m,numericValue:g})}a+=E(n.substring(o)),i.innerHTML=a,t.parentNode&&(t.parentNode.replaceChild(i,t),i.querySelectorAll(".smart-unit-converter-highlight").forEach(c=>{c.addEventListener("mouseenter",z),c.addEventListener("mouseleave",V)}))}}else if(t.nodeType===Node.ELEMENT_NODE){const n=t.nodeName.toLowerCase();if(n==="script"||n==="style"||n==="noscript"||n==="iframe"||n==="object"||n==="embed")return;t.setAttribute("data-smart-converter-processed","true"),Array.from(t.childNodes).forEach($)}}}function N(){if(!l){s("Smart Unit Converter je vypnutý - neprovádím skenování stránky",1);return}if(document.body.hasAttribute("data-smart-converter-processing")){s("Page is currently being processed, skipping",1);return}document.body.setAttribute("data-smart-converter-processing","true"),s("Starting page scan for currencies",1),s(`Current URL: ${window.location.href}`,2),s(`Current page state: ${document.readyState}`,2);const t=["$10.99","€20","100 USD","50EUR","5.99 GBP","35 Kč","35Kč","35,-","35,–","35,-Kč","35,- Kč","10,99 €","1.000,00 €","1 000 €","1.000 kr","CHF 99,95","£10.99","£10,99","£1,000.00","¥1000","₩10000","1000元","₹499","R$50,00","MX$100","CLP 1.000","$1,000.00","€1.000,00","1 000 Kč"];s("Testing currency detection with various formats:",2),t.forEach(e=>{const n=L(e),r=n&&n.length>0?`✓ MATCHED: ${n.join(", ")}`:"❌ NO MATCH";s(`  "${e}": ${r}`,2)}),O(),p.length=0;try{$(document.body),s(`Found ${p.length} currencies on the page`,1),_(),chrome.runtime.sendMessage({action:"currenciesFound",currencies:p})}finally{document.body.removeAttribute("data-smart-converter-processing")}}function x(){if(!l)return;s("Setting up MutationObserver for dynamic content",1);const t=new MutationObserver(e=>{let n=[];e.forEach(r=>{if(!(r.target.hasAttribute&&(r.target.hasAttribute("data-smart-converter-element")||r.target.hasAttribute("data-smart-converter-processed")||r.target.closest(".smart-unit-converter-popup")||r.target.closest(".smart-unit-converter-highlight")))&&r.type==="childList"&&r.addedNodes.length>0)for(let i=0;i<r.addedNodes.length;i++){const o=r.addedNodes[i];if(o.nodeType===Node.ELEMENT_NODE){if(o.classList&&(o.classList.contains("smart-unit-converter-popup")||o.classList.contains("smart-unit-converter-highlight")||o.hasAttribute("data-smart-converter-element")||o.hasAttribute("data-smart-converter-processed")))continue;const a=o.tagName.toLowerCase();["div","section","article","main","tr","li"].includes(a)&&n.push(o)}}}),n.length>0&&(s(`Processing ${n.length} new nodes from DOM mutations`,1),n.forEach(r=>{$(r)}))});return t.observe(document.body,{childList:!0,subtree:!0,characterData:!0}),t}chrome.storage.local.get(["smartUnitConverterEnabled"],function(t){l=t.smartUnitConverterEnabled||!1,s(`Smart Unit Converter initialized with state: ${l}`,1),l&&(document.readyState==="loading"?(s("Document still loading, waiting for DOMContentLoaded",1),document.addEventListener("DOMContentLoaded",()=>{setTimeout(N,500),x()})):(s("Document already loaded, processing immediately",1),setTimeout(N,500),x()),window.addEventListener("load",function(){s("Window load event fired",1),setTimeout(N,1e3)})),chrome.runtime.sendMessage({action:"smartUnitConverterInjected"})});chrome.runtime.onMessage.addListener(function(t){if(t.action==="smartUnitConverterStateChanged"){const e=l;l=t.enabled,s(`State changed: ${l}`,1),l&&!e&&document.readyState==="complete"&&(N(),x())}});s("Content script loaded",1);
})()
