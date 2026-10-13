"""実ROMの直接表示・画素一致・完成画像の提示間隔を検証する。"""
import argparse,hashlib,json,os,re,struct,subprocess
from pathlib import Path
from build_bitmap import ROOT,faces
from native_lock import core_lock


def reference(config,phase):
    if config['kind']=='polygon':
        from polygon_reference import reference as polygon_reference
        pixels,image,_,_=polygon_reference(config,phase)
        return pixels,image
    from PIL import Image
    w,h=config['width'],config['height'];pixels=bytearray(w*h)
    if config['kind']=='pattern':
        for y in range(h):
            for x in range(w):pixels[y*w+x]=((x>>3)^(x>>6)^(y>>3)^(y>>6))&3
    else:
        matrix=config['matrices'][phase];v=config['vertices'];face=faces(phase)
        for cx,cy,ymin,nrows in config['positions']:
            xy=[(cx+(sum(p[k]*matrix[k] for k in range(3))>>7),cy+(sum(p[k]*matrix[3+k] for k in range(3))>>7)) for p in v]
            for f in range(3):
                record=face[f*9:(f+1)*9];color=record[0];spans={}
                for edge in range(4):
                    a=(record[1+edge*2]-0x8040)//4;b=(record[2+edge*2]-0x8040)//4
                    x,y=xy[a];x1,y1=xy[b];dx=abs(x1-x);sx=1 if x<x1 else -1;dy=-abs(y1-y);sy=1 if y<y1 else -1;error=dx+dy
                    while True:
                        lo,hi=spans.get(y,(32767,0));spans[y]=(min(lo,x),max(hi,x))
                        if (x,y)==(x1,y1):break
                        twice=error*2
                        if twice>=dy:error+=dy;x+=sx
                        if twice<=dx:error+=dx;y+=sy
                for y,(lo,hi) in spans.items():
                    if not (0<=lo<=hi<w and 0<=y<h):raise RuntimeError('reference outside screen')
                    pixels[y*w+lo:y*w+hi+1]=bytes([color])*(hi-lo+1)
    rgb=[(0,0,0),(255,254,255),(72,205,222),(160,26,204)]
    image=Image.new('RGB',(w,h));image.putdata([rgb[c] for c in pixels])
    return pixels,image


def pixel_byte(x,y,plane):
    tile=((y&128)<<2)+((x&128)<<1)+((y&120)<<1)+((x&120)>>3)
    return tile*16+(y&7)*2+plane


def run(directory,samples=64,validate=True):
    from PIL import Image
    directory=Path(directory).resolve();config=json.loads((directory/'config.json').read_text())
    labels={n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(directory/'cpu.lbl').read_text())}
    out=directory/'verification';out.mkdir(exist_ok=True)
    samples=1 if config['kind']=='pattern' else samples
    code=r'''local L=LABELS local out=OUTDIR
local frames=0 local previous=-1 local stable=0 local images=0 local seen={} local done=false
local trace=assert(io.open(out..'/trace.jsonl','w'))
local function word(a) return emu.read(a,emu.memType.nesMemory)+256*emu.read(a+1,emu.memType.nesMemory) end
emu.addEventCallback(function()
  if done then return end
  local ok,err=pcall(function()
    frames=frames+1
    local u=word(L.updates) local p=emu.read(L.displayed_phase,emu.memType.nesMemory)
    local front=emu.read(0x5fe2,emu.memType.nesMemory)
    local fault=emu.read(0x5fe3,emu.memType.nesMemory)
    assert(emu.read(L.stage,emu.memType.nesMemory)~=0xe1,'ABI2 missing')
    assert(fault==0,'bitmap fault '..fault)
    local clocks=0 for i=3,0,-1 do clocks=clocks*256+emu.read(0x5fd0+i,emu.memType.nesMemory) end
    if u~=previous then
      trace:write(string.format('{"frame":%d,"updates":%d,"phase":%d,"front":%d,"missed":%d,"gsu_clocks":%d}\n',frames,u,p,front,word(L.missed),clocks));trace:flush()
      stable=0;previous=u
    else stable=stable+1 end
    if u>0 and stable==1 and not seen[u] then
      -- takeScreenshot() reads an asynchronously decoded, potentially older frame.
      -- getScreenBuffer() converts the current PPU buffer synchronously at endFrame.
      local screen=emu.getScreenBuffer() local rgb={}
      for i=1,#screen do
        local c=screen[i]
        rgb[i]=string.char(math.floor(c/65536)%256,math.floor(c/256)%256,c%256)
      end
      local s=assert(io.open(out..string.format('/screen_%03d.rgb',images),'wb'))
      s:write(table.concat(rgb));s:close()
      local data={}
      for i=0,16383 do data[#data+1]=string.char(emu.read(front*16384+i,emu.memType.nesMapperRam)) end
      local ram=assert(io.open(out..string.format('/ram_%03d.bin',images),'wb'))
      ram:write(table.concat(data));ram:close()
      local meta=assert(io.open(out..string.format('/phase_%03d.txt',images),'w'));meta:write(p);meta:close()
      seen[u]=true;images=images+1
      if images==SAMPLES then done=true;trace:close();emu.stop(0) end
    end
    assert(frames<3000,'display timeout')
  end)
  if not ok then local f=assert(io.open(out..'/error.txt','w'));f:write(tostring(err));f:close();emu.stop(1) end
end,emu.eventType.endFrame)
'''.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in labels.items())+'}').replace('OUTDIR',json.dumps(out.as_posix())).replace('SAMPLES',str(samples))
    script=out/'test.lua';script.write_text(code,encoding='utf-8')
    settings=ROOT/'runtime/settings.json';before=settings.read_bytes();cfg=json.loads(before)
    cfg.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True
    settings.write_text(json.dumps(cfg),encoding='utf-8');env=os.environ.copy();env['NES_GSU_MAPPER']='n8pro-gsu-abi2'
    try:
        with core_lock(ROOT/'runtime/MesenCore.dll'):
            result=subprocess.run([str(ROOT/'runtime/Mesen.exe'),'--testRunner','--timeout=90','--doNotSaveSettings','--enableStdout',
                                   str(next(directory.glob('*.nes'))),str(script)],cwd=ROOT/'runtime',env=env,capture_output=True,timeout=100,
                                  creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    finally:settings.write_bytes(before)
    (out/'emulator.log').write_bytes(result.stdout+result.stderr)
    if result.returncode:raise RuntimeError(f'NES run {result.returncode}: {out} '+((out/'error.txt').read_text() if (out/'error.txt').exists() else ''))
    trace=[json.loads(s) for s in (out/'trace.jsonl').read_text().splitlines()];trace=[s for s in trace if s['updates']>0]
    images=[];checked=0;phases=[]
    for i in range(samples):
        phase=int((out/f'phase_{i:03d}.txt').read_text())
        phases.append(phase)
        actual=Image.frombytes('RGB',(256,240),(out/f'screen_{i:03d}.rgb').read_bytes())
        actual.save(out/f'screen_{i:03d}.png')
        if validate:
            pixels,image=reference(config,phase);w,h=image.size;ram=(out/f'ram_{i:03d}.bin').read_bytes()
            for y in range(h):
                for x in range(w):
                    off=pixel_byte(x,y,0);color=((ram[off]>>(7-x%8))&1)|(((ram[off+1]>>(7-x%8))&1)<<1)
                    if color!=pixels[y*w+x]:raise RuntimeError(f'GSU pixel mismatch phase={phase} xy={x,y}: {color}!={pixels[y*w+x]}')
            x0,y0={1:(64,56),2:(0,88),3:(0,0)}[config['mode']]
            canvas=Image.new('RGB',(256,240));canvas.paste(image,(x0,y0))
            if actual.size!=(256,240) or actual.tobytes()!=canvas.tobytes():
                actual.save(out/'mismatch.png');canvas.save(out/'expected.png');raise RuntimeError(f'PPU mismatch phase {phase}: {out}')
            checked+=w*h
        images.append(actual)
    if config['kind'] in ('solid','polygon') and samples==64 and sorted(phases)!=list(range(64)):
        raise RuntimeError('64 distinct rotation phases were not captured')
    intervals=[trace[i]['frame']-trace[i-1]['frame'] for i in range(1,len(trace))]
    at30=bool(intervals) and all(x==2 for x in intervals) and trace[-1]['missed']==0
    if samples>1:
        durations=[(round((i+1)*3.32785)-round(i*3.32785))*10 for i in range(samples)]
        images[0].save(out/'demo.gif',save_all=True,append_images=images[1:],duration=durations,loop=0,optimize=False)
    summary={'status':'pass','kind':config['kind'],'mode':config['mode'],'count':config['count'],'half':config['half'],
             'images':samples,'gsu_pixels_checked':checked,'ppu_rgb_pixels_checked':samples*256*240 if validate else 0,
             'intervals':sorted(set(intervals)),'at_30fps':at30,'missed':trace[-1]['missed'],
             'gsu_max_clocks':max(s['gsu_clocks'] for s in trace),'trace':trace,
             'timing_model':'25MHz Mesen-derived GSU model; not RTL or hardware performance'}
    (out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    print(json.dumps({k:v for k,v in summary.items() if k!='trace'}));return summary


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('directory',type=Path);p.add_argument('--samples',type=int,default=64);p.add_argument('--no-validate',action='store_true');a=p.parse_args()
    run(a.directory,a.samples,not a.no_validate)
