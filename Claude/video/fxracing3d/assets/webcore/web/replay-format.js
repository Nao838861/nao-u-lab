export const MAX_FRAMES=216000,MAX_STATE=2097152,MAX_PACKED=524288;
export const base64=bytes=>{let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);};
export function unbase64(s,max=MAX_PACKED){if(typeof s!=='string'||s.length>Math.ceil(max/3)*4||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))throw Error('replay encoding');const b=Uint8Array.from(atob(s),c=>c.charCodeAt(0));if(b.length>max)throw Error('replay size');return b;}
export async function limitedBytes(stream,max){const reader=stream.getReader(),parts=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max)throw Error('replay size');parts.push(value);}}catch(e){await reader.cancel().catch(()=>{});throw e;}const out=new Uint8Array(size);let i=0;for(const p of parts){out.set(p,i);i+=p.length;}return out;}
export const compress=async bytes=>base64(await limitedBytes(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip')),MAX_PACKED));
export const expand=async (text,max)=>limitedBytes(new Blob([unbase64(text)]).stream().pipeThrough(new DecompressionStream('gzip')),max);
export const sha256=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
export async function unpackReplay(value,config){
  if(!value||value.version!==1||value.rom!==config.rom||value.core!==config.core)throw Error('replay engine');
  if(!Number.isSafeInteger(value.epoch)||value.epoch<1||typeof value.compat!=='string'||value.compat.length<1||value.compat.length>128)throw Error('replay metadata');
  if(!['grip','drift'].includes(value.mode)||!Number.isInteger(value.frames)||value.frames<1||value.frames>MAX_FRAMES
    ||!Number.isInteger(value.ticks)||value.ticks<300||value.ticks>MAX_FRAMES||!Array.isArray(value.lapTicks)||value.lapTicks.length!==5
    ||value.lapTicks.some(n=>!Number.isInteger(n)||n<1)||value.lapTicks.reduce((a,b)=>a+b,0)!==value.ticks||!/^[a-f0-9]{64}$/.test(value.finalHash))throw Error('replay metadata');
  const [state,inputs]=await Promise.all([expand(value.state,MAX_STATE),expand(value.inputs,MAX_FRAMES)]);
  if(inputs.length!==value.frames||state.length<58||state[0]!==77||state[1]!==83||state[2]!==84)throw Error('replay data');
  return {state,inputs};
}
