// 表示側（2D/3D）と独立した、再生済みの位置・角度の読み出し。
export const POSE_STRIDE=4; // worldX, worldY, heading (0..65535), elapsed ticks
export function readPose(core){
 const rd=(a,n)=>{let value=0;for(let i=0;i<n;i++)value+=core._web_peek(a+i)*2**(8*i);return value;};
 const signed=value=>value>=0x800000?value-0x1000000:value;
 return [signed(rd(0x41,3))/256,signed(rd(0x44,3))/256,rd(0x48,2),rd(0x6726,3)];
}
export function decodeReplayTrajectory(replay,{signal,onProgress=()=>{}}={}){
 return new Promise((resolve,reject)=>{
  let worker,timer,settled=false;
  const finish=(error,result)=>{if(settled)return;settled=true;worker?.terminate();clearTimeout(timer);signal?.removeEventListener('abort',abort);error?reject(error):resolve(result);};
  const abort=()=>finish(new DOMException('Aborted','AbortError'));
  if(signal?.aborted){abort();return;}
  signal?.addEventListener('abort',abort,{once:true});
  try{
   worker=new Worker(new URL('./replay-worker.js',import.meta.url),{type:'module'});
   timer=setTimeout(()=>finish(Error('Replay trajectory timed out')),120000);
   worker.onerror=()=>finish(Error('Replay trajectory failed'));
   worker.onmessage=({data})=>{
    if(data.type==='progress')onProgress(data.percent);
    if(data.type==='error')finish(Error(data.message));
    if(data.type==='trajectory')finish(null,{...data,samples:new Float64Array(data.samples)});
   };
   worker.postMessage({type:'trajectory',replay});
  }catch(error){finish(error);}
 });
}
