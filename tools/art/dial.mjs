import fs from 'fs';
const P=(r,a)=>{const t=(a-90)*Math.PI/180;return [1024+r*Math.cos(t),1024+r*Math.sin(t)].map(v=>v.toFixed(1))};
let ticks='';
for(let a=0;a<360;a+=2){const L=a%30===0?44:a%10===0?30:16, w=a%10===0?3.2:1.8;const [x1,y1]=P(930,a),[x2,y2]=P(930-L,a);ticks+=`<path d="M${x1} ${y1}L${x2} ${y2}" stroke-width="${w}"/>`;}
const star=(n,R,r,rot)=>'M'+Array.from({length:n*2},(_,i)=>P(i%2?r:R,rot+i*180/n).join(' ')).join('L')+'Z';
const letters=[['N',0],['E',90],['S',180],['W',270]].map(([t,a])=>{const [x,y]=P(800,a);return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" style="font:900 120px Cinzel" fill="#3a2414">${t}</text>`}).join('');
const dots=[45,135,225,315].map(a=>{const [x,y]=P(800,a);return `<circle cx="${x}" cy="${y}" r="10" fill="#3a2414"/>`}).join('');
const FONT=fs.readFileSync('/home/claude/art/node_modules/@fontsource/cinzel/files/cinzel-latin-900-normal.woff2').toString('base64');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048">
<defs><radialGradient id="bg"><stop offset="0" stop-color="#efe3c4"/><stop offset=".85" stop-color="#e6d6b0"/><stop offset="1" stop-color="#d9c494"/></radialGradient></defs>
<rect width="2048" height="2048" fill="#d9c494"/><circle cx="1024" cy="1024" r="1000" fill="url(#bg)"/>
<circle cx="1024" cy="1024" r="975" fill="none" stroke="#3a2414" stroke-width="7"/>
<circle cx="1024" cy="1024" r="945" fill="none" stroke="#3a2414" stroke-width="2.5"/>
<g stroke="#3a2414" stroke-linecap="round">${ticks}</g>
<circle cx="1024" cy="1024" r="700" fill="none" stroke="#3a2414" stroke-width="2.5"/>
<circle cx="1024" cy="1024" r="686" fill="none" stroke="#3a2414" stroke-width="1.2" opacity=".6"/>
${letters}${dots}
<path d="${star(4,620,110,0)}" fill="none" stroke="#8a6a44" stroke-width="3" stroke-linejoin="round" opacity=".55"/>
<path d="${star(4,430,90,45)}" fill="none" stroke="#8a6a44" stroke-width="2.4" stroke-linejoin="round" opacity=".45"/>
<circle cx="1024" cy="1024" r="210" fill="none" stroke="#8a6a44" stroke-width="2" opacity=".45"/>
</svg>`;
fs.writeFileSync('/home/claude/art/dial.html',`<!doctype html><html><head><style>@font-face{font-family:Cinzel;font-weight:900;src:url(data:font/woff2;base64,${FONT})}html,body{margin:0}</style></head><body>${svg}</body></html>`);
