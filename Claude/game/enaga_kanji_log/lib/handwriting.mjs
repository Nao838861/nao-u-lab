// KanjiVG の同梱パスを端末内でサンプリングする。外部認識APIは使用しない。
export function samplePath(d){
  const tokens=d.match(/[MmCcSsLlHhVvZz]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g)||[];
  let i=0,command='',x=0,y=0,cx=0,cy=0,last='',start=[0,0];const out=[];
  const num=()=>Number(tokens[i++]);
  while(i<tokens.length){
    if(/[A-Za-z]/.test(tokens[i]))command=tokens[i++];
    const relative=command===command.toLowerCase(),cmd=command.toUpperCase(),ox=x,oy=y;
    const point=()=>{const a=num(),b=num();return [a+(relative?ox:0),b+(relative?oy:0)];};
    if(cmd==='M'){[x,y]=point();start=[x,y];out.push([x,y]);command=relative?'l':'L';}
    else if(cmd==='C'||cmd==='S'){
      const a=cmd==='C'?point():['C','S'].includes(last)?[2*x-cx,2*y-cy]:[x,y],b=point(),end=point();
      for(let n=1;n<=24;n++){const t=n/24,u=1-t;out.push([u*u*u*ox+3*u*u*t*a[0]+3*u*t*t*b[0]+t*t*t*end[0],u*u*u*oy+3*u*u*t*a[1]+3*u*t*t*b[1]+t*t*t*end[1]]);}
      [cx,cy]=b;[x,y]=end;
    }else if(cmd==='L'){[x,y]=point();out.push([x,y]);}
    else if(cmd==='H'){x=num()+(relative?ox:0);out.push([x,y]);}
    else if(cmd==='V'){y=num()+(relative?oy:0);out.push([x,y]);}
    else if(cmd==='Z'){[x,y]=start;out.push([x,y]);command='';}
    else throw new Error('未対応の筆画コマンド');
    last=cmd;
  }
  return resample(out);
}
export function resample(points,step=2){
  if(!points?.length)return [];
  const out=[points[0]];let carry=0;
  for(let i=1;i<points.length;i++){
    let [x,y]=points[i-1];const [bx,by]=points[i];let length=Math.hypot(bx-x,by-y);
    if(!Number.isFinite(length))return [];
    while(carry+length>=step&&length>0){const ratio=(step-carry)/length;x+=(bx-x)*ratio;y+=(by-y)*ratio;out.push([x,y]);length=Math.hypot(bx-x,by-y);carry=0;}
    carry+=length;
  }
  const end=points.at(-1);if(Math.hypot(out.at(-1)[0]-end[0],out.at(-1)[1]-end[1])>.1)out.push(end);
  return out;
}
export function bounds(strokes){
  const pts=strokes.flat();if(!pts.length)return null;
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return {left:Math.min(...xs),top:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
}
export function fitStrokes(strokes){
  const b=bounds(strokes);if(!b)return [];
  const scale=88/Math.max(b.width,b.height,1),dx=54.5-(b.left+b.width/2)*scale,dy=54.5-(b.top+b.height/2)*scale;
  return strokes.map(s=>s.map(([x,y])=>[x*scale+dx,y*scale+dy]));
}
export function compareInk(ink,template){
  const fail={ok:false,coverage:0,precision:0};
  if(!Array.isArray(ink)||!template?.length||ink.flat().length<4)return fail;
  if(ink.length>100||ink.reduce((n,s)=>n+(Array.isArray(s)?s.length:10001),0)>10000)return fail;
  if(ink.flat().some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)))return fail;
  const original=bounds(ink),expected=bounds(template);
  if(!original||Math.max(original.width,original.height)<18||ink.length<Math.ceil(template.length*.55)||ink.length>template.length*2+3)return fail;
  if(Math.abs(Math.log((original.width+4)/(original.height+4)/((expected.width+4)/(expected.height+4))))>.42)return fail;
  const as=fitStrokes(ink).map(s=>resample(s)),bs=fitStrokes(template).map(s=>resample(s)),a=as.flat(),b=bs.flat();
  const distances=(from,to)=>from.map(p=>Math.sqrt(Math.min(...to.map(q=>(p[0]-q[0])**2+(p[1]-q[1])**2))));
  const da=distances(a,b),db=distances(b,a),precision=da.filter(d=>d<7).length/da.length,coverage=db.filter(d=>d<7).length/db.length;
  const mean=[...da,...db].reduce((s,d)=>s+d,0)/(da.length+db.length);
  const lengthRatio=a.length/b.length;
  // 重なる場所に線があるだけでは通さず、個々の筆画の形・端点も照合する。
  // 筆順は問わず、逆方向に書いた線も同じ形として扱う。
  const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
  const pairs=as.flatMap((s,i)=>bs.map((t,j)=>{
    const endpoints=Math.min(dist(s[0],t[0])+dist(s.at(-1),t.at(-1)),dist(s[0],t.at(-1))+dist(s.at(-1),t[0]))/2;
    const ds=[...distances(s,t),...distances(t,s)];return {i,j,cost:endpoints*.5+ds.reduce((n,d)=>n+d,0)/ds.length*.5};
  })).sort((p,q)=>p.cost-q.cost);
  const usedA=new Set(),usedB=new Set(),matches=[];
  for(const p of pairs){if(!usedA.has(p.i)&&!usedB.has(p.j)){usedA.add(p.i);usedB.add(p.j);matches.push(p.cost);}}
  const strokeCoverage=matches.filter(v=>v<9).length/Math.max(as.length,bs.length);
  const strokeMean=matches.reduce((n,v)=>n+v,0)/matches.length;
  return {ok:coverage>=.82&&precision>=.8&&mean<5.3&&lengthRatio>.57&&lengthRatio<1.65&&strokeCoverage>=.75&&strokeMean<6.5,coverage,precision,strokeCoverage,strokeMean};
}
export function strokePath(stroke){return stroke.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');}
