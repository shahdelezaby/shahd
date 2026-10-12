const fs=require('fs');
const C='#B18B58';
const wrap=b=>`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="${C}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const icons={
 car:`<path d="M19 70H10a4 4 0 0 1-4-4V52c0-4 3-7 7-8l8-14c2-3 5-5 9-5h28c3 0 6 1 8 4l11 13 11 3c3 1 5 4 5 7v12a4 4 0 0 1-4 4h-9"/><circle cx="26" cy="70" r="7"/><circle cx="70" cy="70" r="7"/><path d="M33 70h30"/>`,
 phone:`<rect x="28" y="6" width="40" height="84" rx="6"/><circle cx="48" cy="77" r="1" fill="${C}"/>`,
 home:`<path d="M10 42 48 8l38 34v42a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z"/><path d="M38 90V54h20v36"/>`,
 bell:`<path d="M48 8c-14 0-24 11-24 25v18c0 9-4 17-10 25h68c-6-8-10-16-10-25V33C72 19 62 8 48 8z"/><path d="M42 86a6 6 0 0 0 12 0"/>`,
 scan:`<path d="M10 28V16a6 6 0 0 1 6-6h12M68 10h12a6 6 0 0 1 6 6v12M86 68v12a6 6 0 0 1-6 6H68M28 86H16a6 6 0 0 1-6-6V68"/><circle cx="45" cy="45" r="12"/><path d="m54 54 10 10"/>`,
 store:`<path d="M18 8h60l12 16v8H6v-8z"/><path d="M6 32a7 7 0 0 0 14 0a7 7 0 0 0 14 0a7 7 0 0 0 14 0a7 7 0 0 0 14 0a7 7 0 0 0 14 0a7 7 0 0 0 14 0"/><path d="M14 44v40a4 4 0 0 0 4 4h60a4 4 0 0 0 4-4V44"/><path d="M38 88V68a10 10 0 0 1 20 0v20"/>`,
 card:`<rect x="6" y="18" width="84" height="60" rx="6"/><path d="M6 38h84"/>`,
 parking:`<circle cx="48" cy="48" r="42"/><path d="M38 72V24h14a12 12 0 0 1 0 24H38"/>`,
 pin:`<path d="M48 90S16 58 16 38a32 32 0 0 1 64 0c0 20-32 52-32 52z"/><circle cx="48" cy="38" r="11"/>`,
};
// Wide canvas matching the original Mailchimp image blocks: 4:1, icon right-aligned with space beside it.
const wide=b=>`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100"><g transform="translate(272 0) scale(${100/96})" fill="none" stroke="${C}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${b}</g></svg>`;
fs.mkdirSync('square',{recursive:true});
for(const [k,v] of Object.entries(icons)){fs.writeFileSync('square/'+k+'.svg',wrap(v));fs.writeFileSync(k+'.svg',wide(v));}
const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
const p=await b.newPage({deviceScaleFactor:2,viewport:{width:400,height:100}});
for(const [dir,w,h] of [['',400,100],['square/',96,96]]) for(const k of Object.keys(icons)){await p.setContent(`<html><body style="margin:0;background:transparent">${fs.readFileSync(dir+k+'.svg')}</body></html>`);
await p.screenshot({path:dir+k+'.png',omitBackground:true,clip:{x:0,y:0,width:w,height:h}});}
// preview sheet
await p.setViewportSize({width:1300,height:400});
await p.setContent(`<body style="margin:0;background:#F8F2E8;display:grid;grid-template-columns:repeat(3,400px);gap:20px;padding:20px">${Object.keys(icons).map(k=>`<img src="data:image/svg+xml;base64,${Buffer.from(fs.readFileSync(k+'.svg')).toString('base64')}" width=400 style="outline:1px dashed #ccc">`).join('')}</body>`);
await p.screenshot({path:'preview.png',fullPage:true});await b.close();})();
