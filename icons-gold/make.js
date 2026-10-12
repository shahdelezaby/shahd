const fs=require('fs');
const C='#B18B58';
const wrap=b=>`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="${C}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const icons={
 car:`<path d="M20 63H10a4 4 0 0 1-4-4V44l10-18a5 5 0 0 1 4.3-2.5H50a6 6 0 0 1 4.6 2.1L64 35l19.6 4.2A8 8 0 0 1 90 47v12a4 4 0 0 1-4 4h-9.3"/><path d="M36 63h24.7"/><circle cx="28" cy="63" r="8"/><circle cx="68.7" cy="63" r="8"/>`,
 phone:`<rect x="19" y="6" width="58" height="84" rx="6"/><circle cx="48" cy="73" r="1.6" fill="${C}"/>`,
 home:`<path d="M10 42 48 8l38 34v42a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z"/><path d="M38 90V54h20v36"/>`,
 bell:`<path d="M48 8c-14 0-24 11-24 25v18c0 9-4 17-10 25h68c-6-8-10-16-10-25V33C72 19 62 8 48 8z"/><path d="M42 86a6 6 0 0 0 12 0"/>`,
 scan:`<path d="M10 28V16a6 6 0 0 1 6-6h12M68 10h12a6 6 0 0 1 6 6v12M86 68v12a6 6 0 0 1-6 6H68M28 86H16a6 6 0 0 1-6-6V68"/><circle cx="45" cy="45" r="12"/><path d="m54 54 10 10"/>`,
 store:`<path d="M18 8h60l12 16v8H6v-8z"/><path d="M6 32a7 7 0 0 0 14 0a7 7 0 0 0 14 0a7 7 0 0 0 14 0a7 7 0 0 0 14 0a7 7 0 0 0 14 0a7 7 0 0 0 14 0"/><path d="M14 44v40a4 4 0 0 0 4 4h60a4 4 0 0 0 4-4V44"/><path d="M38 88V68a10 10 0 0 1 20 0v20"/>`,
 card:`<rect x="6" y="19" width="84" height="58" rx="9"/><path d="M6 40h84"/>`,
 parking:`<circle cx="48" cy="48" r="42"/><path d="M38 72V24h14a12 12 0 0 1 0 24H38"/>`,
 pin:`<path d="M48 90S16 58 16 38a32 32 0 0 1 64 0c0 20-32 52-32 52z"/><circle cx="48" cy="38" r="11"/>`,
};
fs.mkdirSync('square',{recursive:true});
for(const [k,v] of Object.entries(icons)) fs.writeFileSync('square/'+k+'.svg',wrap(v));
const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
// Wide canvas matching the original Mailchimp image blocks (~3.6:1). Icons share one scale, sit almost
// flush with the right edge (like the column text) and are centred vertically, filling ~82% of the height.
const W=360,H=100,BAND=82,SW=3.5,scale=BAND/85.5;
const p=await b.newPage({deviceScaleFactor:2,viewport:{width:W,height:H}});
for(const [k,v] of Object.entries(icons)){
 await p.setContent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><g id="g">${v}</g></svg>`);
 const bb=await p.evaluate(()=>{const r=document.getElementById('g').getBBox();return {x:r.x,y:r.y,w:r.width,h:r.height};});
 // Wide icons (car, card) are scaled up to the full band height; stroke is thinned to keep the same line weight.
 const sc=['car','card'].includes(k)?(BAND-SW*scale)/bb.h:scale, sw=SW*scale/sc;
 const right=(bb.x+bb.w+sw/2)*sc, cy=(bb.y+bb.h/2)*sc;
 const tx=W-2-right, ty=H/2-cy;
 fs.writeFileSync(k+'.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${sc.toFixed(4)})" fill="none" stroke="${C}" stroke-width="${sw.toFixed(3)}" stroke-linecap="round" stroke-linejoin="round">${v}</g></svg>`);
}
for(const [dir,w,h] of [['',W,H],['square/',96,96]]) for(const k of Object.keys(icons)){await p.setContent(`<html><body style="margin:0;background:transparent">${fs.readFileSync(dir+k+'.svg')}</body></html>`);
await p.screenshot({path:dir+k+'.png',omitBackground:true,clip:{x:0,y:0,width:w,height:h}});}
// preview sheet
await p.setViewportSize({width:1300,height:400});
await p.setContent(`<body style="margin:0;background:#F8F2E8;display:grid;grid-template-columns:repeat(3,360px);gap:20px;padding:20px">${Object.keys(icons).map(k=>`<img src="data:image/svg+xml;base64,${Buffer.from(fs.readFileSync(k+'.svg')).toString('base64')}" width=360 style="outline:1px dashed #ccc">`).join('')}</body>`);
await p.screenshot({path:'preview.png',fullPage:true});await b.close();})();
