"""配布用Mesen.exeのLua経路でも、同じROMと選択の有無を確認する。"""
import json
import os
import subprocess
from pathlib import Path

from verify import ROOT, digest, LOCK
from native_lock import core_lock


def run_tests():
    from PIL import Image
    rom=ROOT/'runtime/gsu-selftest.nes'
    if digest(rom)!=LOCK['diagnostic_sha256']: raise RuntimeError('診断ROMのhash不一致')
    for name,expected in (('enabled',0),('disabled',1)):
        out=ROOT/'build/frontend'/name
        out.mkdir(parents=True,exist_ok=True)
        script='''local frame=0
emu.addEventCallback(function()
  frame=frame+1
  if frame~=12 then return end
  local ok,err=pcall(function()
    assert(emu.read(0,emu.memType.nesMemory)==EXPECTED,'result')
    assert(emu.read(0x2188,emu.memType.nesPpuMemory)==0x30+EXPECTED,'result tile')
    assert(emu.read(0x3F00,emu.memType.nesPpuMemory)==BACKGROUND,'background')
    local screen=assert(io.open(OUT..'/screen.png','wb'))
    screen:write(emu.takeScreenshot());screen:close()
    local report=assert(io.open(OUT..'/pass.txt','w'))
    report:write('pass');report:close()
  end)
  if not ok then
    local report=assert(io.open(OUT..'/error.txt','w'))
    report:write(tostring(err));report:close();emu.stop(1)
  else emu.stop(0) end
end,emu.eventType.endFrame)
'''.replace('EXPECTED',str(expected)).replace('BACKGROUND',str(0x1A if expected==0 else 0x16)).replace('OUT',json.dumps(out.as_posix()))
        lua=out/'test.lua'; lua.write_text(script,encoding='utf-8')
        marker=out/'pass.txt'
        if marker.exists(): marker.unlink()
        env=os.environ.copy()
        if expected==0: env['NES_GSU_MAPPER']='n8pro-gsu-abi1'
        else: env.pop('NES_GSU_MAPPER',None)
        before=digest(ROOT/'runtime/MesenCore.dll')
        with core_lock(ROOT/'runtime/MesenCore.dll'):
            run=subprocess.run([str(ROOT/'runtime/Mesen.exe'),'--testRunner','--timeout=20','--doNotSaveSettings',
                                '--enableStdout',str(rom),str(lua)],cwd=ROOT/'runtime',env=env,
                               capture_output=True,timeout=30,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
        if digest(ROOT/'runtime/MesenCore.dll')!=before: raise RuntimeError('専用DLLが上書きされた')
        (out/'emulator.log').write_bytes(run.stdout+run.stderr)
        if run.returncode or not marker.exists():
            raise RuntimeError(f'Mesen UI実行失敗: {out}/emulator.log')
        with Image.open(out/'screen.png') as image:
            rgb=(12,147,0) if expected==0 else (181,49,32)
            if image.convert('RGB').getpixel((0,0))!=rgb: raise RuntimeError('Mesen UI描画の色不一致')
        print(f'Mesen.exe {name}: result {expected}, image verified')


def main():
    # Only this controlled test script needs Lua file output; restore UI preferences.
    settings=ROOT/'runtime/settings.json'
    before=settings.read_bytes()
    config=json.loads(before)
    config.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True
    settings.write_text(json.dumps(config),encoding='utf-8')
    try: run_tests()
    finally: settings.write_bytes(before)


if __name__=='__main__': main()
