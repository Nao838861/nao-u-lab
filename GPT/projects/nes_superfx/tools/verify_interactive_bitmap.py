"""実コントローラーのA入力で10構成を切替え、各64姿勢と長押し・一周を検査。"""
import argparse,json, os, re, subprocess
from pathlib import Path
from PIL import Image
from build_bitmap import ROOT, FONT
from run_bitmap import reference, pixel_byte
from native_lock import core_lock


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--directory',type=Path,default=ROOT/'build/bitmap/interactive_v001')
    args=parser.parse_args();directory=args.directory.resolve()
    out=directory/'verification';out.mkdir(exist_ok=True)
    config=json.loads((directory/'config.json').read_text())
    profile_count=len(config['profiles'])
    labels={n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(directory/'cpu.lbl').read_text())}
    code=r'''local L=LABELS local out=OUTDIR
local frame=0 local previous=-1 local stable=0 local done=false local pressUntil=-1
local wanted=0 local captured=0 local wrappedAt=nil
local trace=assert(io.open(out..'/trace.jsonl','w'))
local captures=assert(io.open(out..'/captures.jsonl','w'))
local function word(a) return emu.read(a,emu.memType.nesMemory)+256*emu.read(a+1,emu.memType.nesMemory) end
emu.addEventCallback(function() emu.setInput({a=frame<pressUntil},0) end,emu.eventType.inputPolled)
emu.addEventCallback(function()
  if done then return end
  local ok,err=pcall(function()
    frame=frame+1
    assert(frame<2500,'timeout')
    assert(emu.read(0x5fe3,emu.memType.nesMemory)==0,'bitmap fault')
    local u=word(L.updates) local p=emu.read(L.displayed_profile,emu.memType.nesMemory)
    local phase=emu.read(L.displayed_phase,emu.memType.nesMemory)
    if u~=previous then
      trace:write(string.format('{"frame":%d,"updates":%d,"profile":%d,"phase":%d,"switches":%d,"missed":%d}\n',
        frame,u,p,phase,word(L.switches),word(L.missed)));trace:flush()
      stable=0;previous=u
    else stable=stable+1 end
    if wanted==PROFILECOUNT then
      if p==0 and word(L.switches)==PROFILECOUNT then
        if not wrappedAt then wrappedAt=frame end
        assert(word(L.switches)==PROFILECOUNT,'held A repeated')
        if frame-wrappedAt>=16 then done=true;trace:close();captures:close();emu.stop(0) end
      end
      return
    end
    if p==wanted and u>0 and stable==1 then
      assert(word(L.switches)==wanted,'held A repeated')
      local image=emu.getScreenBuffer() local rgb={}
      for i=1,#image do local c=image[i];rgb[i]=string.char(math.floor(c/65536)%256,math.floor(c/256)%256,c%256) end
      local name=string.format('/p%02d_%02d',p,captured)
      local f=assert(io.open(out..name..'.rgb','wb'));f:write(table.concat(rgb));f:close()
      local front=emu.read(0x5fe2,emu.memType.nesMemory) local ram={}
      for i=0,16383 do ram[#ram+1]=string.char(emu.read(front*16384+i,emu.memType.nesMapperRam)) end
      f=assert(io.open(out..name..'.ram','wb'));f:write(table.concat(ram));f:close()
      captures:write(string.format('{"profile":%d,"sample":%d,"phase":%d,"frame":%d,"updates":%d}\n',p,captured,phase,frame,u));captures:flush()
      captured=captured+1
      if captured==64 then wanted=wanted+1;captured=0;pressUntil=frame+8 end
    end
  end)
  if not ok then local f=assert(io.open(out..'/error.txt','w'));f:write(tostring(err));f:close();emu.stop(1) end
end,emu.eventType.endFrame)
'''.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in labels.items())+'}').replace('OUTDIR',json.dumps(out.as_posix())).replace('PROFILECOUNT',str(profile_count))
    script=out/'test.lua';script.write_text(code,encoding='utf-8')
    settings=ROOT/'runtime/settings.json';before=settings.read_bytes();cfg=json.loads(before)
    cfg.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True
    cfg.setdefault('Nes',{}).setdefault('Port1',{})['Type']='NesController'
    settings.write_text(json.dumps(cfg),encoding='utf-8')
    env=os.environ.copy();env['NES_GSU_MAPPER']='n8pro-gsu-abi2'
    try:
        with core_lock(ROOT/'runtime/MesenCore.dll'):
            result=subprocess.run([str(ROOT/'runtime/Mesen.exe'),'--testRunner','--timeout=90',
                '--doNotSaveSettings','--enableStdout',str(next(directory.glob('*.nes'))),str(script)],
                cwd=ROOT/'runtime',env=env,capture_output=True,timeout=100,
                creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    finally:settings.write_bytes(before)
    (out/'emulator.log').write_bytes(result.stdout+result.stderr)
    if result.returncode:raise RuntimeError(f"controller test failed: {(out/'error.txt').read_text() if (out/'error.txt').exists() else result.stdout!r}")
    captures=[json.loads(line) for line in (out/'captures.jsonl').read_text().splitlines()]
    trace=[json.loads(line) for line in (out/'trace.jsonl').read_text().splitlines()]
    report=[];previews=[]
    for p,profile in enumerate(config['profiles']):
        samples=[r for r in captures if r['profile']==p]
        assert len(samples)==64 and sorted(r['phase'] for r in samples)==list(range(64))
        intervals=sorted(set(samples[i]['frame']-samples[i-1]['frame'] for i in range(1,64)))
        assert intervals==[2],(p,intervals)
        for s in samples:
            stem=out/f"p{p:02d}_{s['sample']:02d}"
            actual=Image.frombytes('RGB',(256,240),stem.with_suffix('.rgb').read_bytes())
            pixels,expected=reference(profile,s['phase'])
            ram=stem.with_suffix('.ram').read_bytes()
            for y in range(240):
                for x in range(256):
                    off=pixel_byte(x,y,0);shift=7-(x&7)
                    color=((ram[off]>>shift)&1)|(((ram[off+1]>>shift)&1)<<1)
                    assert color==pixels[y*256+x],(p,s['phase'],x,y)
            lines=profile.get('hud_lines',[(8,216,f"N={profile['count']:02d}"),(8,224,f"S={profile['half']*2:02d}")])
            font=config.get('font',FONT)
            for x0,y0,text in lines:
                for col,c in enumerate(text):
                    for y,bits in enumerate(font[c]):
                        for x,bit in enumerate(bits):
                            if bit=='1':expected.putpixel((x0+col*8+x+1,y0+y+1),(255,254,255))
            assert actual.tobytes()==expected.tobytes(),(p,s['phase'],'PPU/HUD mismatch')
            actual.save(stem.with_suffix('.png'))
            if s['sample']<20:previews.append(actual)
        report.append({'profile':p,'count':profile['count'],'model_edge':profile['half']*2,
                       'phases':64,'intervals':intervals,'status':'pass'})
    assert trace[-1]['switches']==profile_count and trace[-1]['profile']==0
    assert all(r['missed']==0 for r in trace), 'deadline missed'
    summary={'status':'pass','profiles':report,'wraparound':True,'held_a_repeats':False,
             'controller':'emu.setInput A on NES port 1; ROM reads $4016',
             'gsu_pixels_checked':profile_count*64*61440,'ppu_rgb_pixels_checked':profile_count*64*61440,
             'trace':trace,'timing_model':'emulator only; hardware unverified'}
    (out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    previews[0].save(out/'interactive.gif',save_all=True,append_images=previews[1:],
                     duration=[30 if i%3 else 40 for i in range(len(previews))],loop=0,optimize=False)
    print(json.dumps({k:v for k,v in summary.items() if k!='trace'}))


if __name__=='__main__':main()
