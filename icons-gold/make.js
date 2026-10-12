const fs=require('fs');
const C='#B18B58';
const wrap=b=>`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="${C}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const icons={
 car:`<path d="M20 63H10a4 4 0 0 1-4-4V44l10-18a5 5 0 0 1 4.3-2.5H50a6 6 0 0 1 4.6 2.1L64 35l19.6 4.2A8 8 0 0 1 90 47v12a4 4 0 0 1-4 4h-9.3"/><path d="M36 63h24.7"/><circle cx="28" cy="63" r="8"/><circle cx="68.7" cy="63" r="8"/>`,
 phone:`<rect x="19" y="6" width="58" height="84" rx="8"/><circle cx="48" cy="73" r="2.4" fill="${C}" stroke="none"/>`,
 home:`<path d="M8 40q0-4 3-6.5L45 8q3-2.4 6 0l34 25.5q3 2.5 3 6.5v44a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6z"/><path d="M36 90V56a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v34"/>`,
 bell:`<path d="M12 69c8-7 11-17 11-29v-8C23 17 34 6 48 6s25 11 25 26v8c0 12 3 22 11 29z"/><path d="M41 85q7 4 14 0"/>`,
 scan:`<path d="M10 28V16a6 6 0 0 1 6-6h12M68 10h12a6 6 0 0 1 6 6v12M86 68v12a6 6 0 0 1-6 6H68M28 86H16a6 6 0 0 1-6-6V68"/><circle cx="45" cy="45" r="12"/><path d="m54 54 9 9"/>`,
 store:`<path d="M22 6h52a4 4 0 0 1 3 1.5L90 25v9a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-9L19 7.5A4 4 0 0 1 22 6z"/><path d="M6 25h84"/><path d="M10 38q5.33 5 10.67 0q5.33 5 10.67 0q5.33 5 10.67 0q5.33 5 10.67 0q5.33 5 10.67 0q5.33 5 10.67 0q5.33 5 10.67 0"/><path d="M14 42v44a4 4 0 0 0 4 4h60a4 4 0 0 0 4-4V42"/><path d="M36 90V69a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v21"/>`,
 card:`<rect x="6" y="18.5" width="84" height="59" rx="8"/><path d="M6 40h84"/>`,
 parking:`<circle cx="48" cy="48" r="42"/><path d="M36 69V28h16a12.75 12.75 0 0 1 0 25.5H36"/>`,
 pin:`<path d="M48 90C40 82 13.5 60 13.5 40.5a34.5 34.5 0 0 1 69 0C82.5 60 56 82 48 90z"/><circle cx="48" cy="40" r="12"/>`,
};
fs.mkdirSync('square',{recursive:true});
for(const [k,v] of Object.entries(icons)) fs.writeFileSync('square/'+k+'.svg',wrap(v));
const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
// Wide canvas matching the original Mailchimp image blocks (~3.6:1). Icons share one scale, sit almost
// flush with the right edge (like the column text) and are centred vertically, filling ~82% of the height.
const W=360,H=100,BAND=82,SW=4.2,scale=BAND/(84+SW);
const p=await b.newPage({deviceScaleFactor:2,viewport:{width:W,height:H}});
for(const [k,v] of Object.entries(icons)){
 await p.setContent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><g id="g">${v}</g></svg>`);
 const bb=await p.evaluate(()=>{const r=document.getElementById('g').getBBox();return {x:r.x,y:r.y,w:r.width,h:r.height};});
  const sc=scale, sw=SW;
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
