import {MAX_FRAMES,MAX_STATE,compress,sha256} from './replay-format.js';
import {REPLAY} from './replay-version.js';
import {CONFIG} from './config.js';
import {replayProducer} from './replay-producer.js';
export function captureState(core){const size=core._web_state_size();if(size<1||size>MAX_STATE)throw Error('リプレイの開始状態を保存できません。');const p=core._malloc(size);try{if(!core._web_state_save(p,size))throw Error('state');return core.HEAPU8.slice(p,p+size);}finally{core._free(p);}}
export function loadState(core,bytes){const p=core._malloc(bytes.length);try{core.HEAPU8.set(bytes,p);if(!core._web_state_load(p,bytes.length))throw Error('リプレイの開始状態を復元できません。');}finally{core._free(p);}}
export class ReplayRecorder {
  constructor({producer={app:CONFIG.app||'mmc5racing-web',version:CONFIG.version,variant:CONFIG.variant||'2d'},engine=REPLAY}={}){this.producer=replayProducer(producer);this.engine=Object.fromEntries(['epoch','compat','rom','core'].map(key=>[key,engine[key]]));}
  begin(core,mode){this.abort();try{this.state=captureState(core);this.mode=mode;this.inputs=new Uint8Array(MAX_FRAMES);this.count=0;}catch{this.abort();}}
  input(mask){if(!this.inputs)return;if(this.count===MAX_FRAMES){this.abort();return;}this.inputs[this.count++]=mask;}
  abort(){this.state=null;this.inputs=null;this.count=0;}
  finish(core,race){
    if(!this.state||!this.count||this.mode!==race.mode)return Promise.resolve(null);
    const state=this.state,inputs=this.inputs.slice(0,this.count),pixels=core.HEAPU8.slice(core._web_pixels(),core._web_pixels()+256*240*4);this.abort();
    const frames=inputs.length,presentation=this.presentation;
    return Promise.all([compress(state),compress(inputs),sha256(pixels)]).then(([state,inputs,finalHash])=>({version:1,...this.engine,producer:this.producer,...(presentation?{presentation}:{}),mode:race.mode,ticks:race.ticks,lapTicks:race.lapTicks,frames,state,inputs,finalHash}));
  }
}
