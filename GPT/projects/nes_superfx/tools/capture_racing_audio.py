"""専用コアの実APU出力をWAVへ記録し、PCMが無音でないことを確認する。"""
import ctypes as C
import json
import os
from pathlib import Path
import re
import time
import wave
from array import array
from host import Host

ROOT=Path(__file__).resolve().parents[1]


def main():
    os.environ.update(NES_GSU_MAPPER='n8pro-racing-gsu',NES_GSU_CLOCK_HZ='50000000')
    out=ROOT/'demos/racing/v002/results';out.mkdir(exist_ok=True)
    labels={n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(ROOT/'build/racing/v002/cpu.lbl').read_text())}
    h=Host(ROOT/'runtime/MesenCore.dll',ROOT/'build/racing/v002/wave-home')
    wav=out/'engine_tire.wav'
    try:
        h.load(ROOT/'releases/GSU_MMC5Racing3D_v002.nes')
        h.dll.LoadScript.argtypes=[C.c_char_p,C.c_char_p,C.c_char_p,C.c_int32]
        h.dll.LoadScript.restype=C.c_int32
        h.dll.WaveRecord.argtypes=[C.c_char_p];h.dll.WaveRecord.restype=None
        h.dll.WaveStop.argtypes=[];h.dll.WaveStop.restype=None
        code='''emu.addMemoryCallback(function()
local t=emu.read(0x448,emu.memType.nesMemory)+256*emu.read(0x449,emu.memType.nesMemory)
local p=0
if t>=80 and t<620 then p=1 end
if t>=400 and t<620 then p=p+128 end
if t>=620 and t<850 then p=66 end
emu.write(0x16,p,emu.memType.nesMemory)
end,emu.callbackType.exec,ADDRESS)'''.replace('ADDRESS',str(labels['sim_begin']))
        assert h.dll.LoadScript(b'audio-preview',str(out).encode(),code.encode(),-1)>=0
        h.dll.WaveRecord(str(wav.resolve()).encode())
        deadline=time.monotonic()+45
        while h.read(0x448)+256*h.read(0x449)<1000:
            if time.monotonic()>deadline:raise RuntimeError('recording timed out')
            time.sleep(.05)
        h.dll.WaveStop()
    finally:
        h.close()
    with wave.open(str(wav),'rb') as f:
        assert f.getsampwidth()==2
        samples=array('h',f.readframes(f.getnframes()))
        report={'sample_rate':f.getframerate(),'channels':f.getnchannels(),'seconds':f.getnframes()/f.getframerate(),
                'peak':max(abs(x) for x in samples),'nonzero_samples':sum(x!=0 for x in samples)}
    assert report['peak']>100 and report['nonzero_samples']>1000,report
    (out/'wave.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))


if __name__=='__main__':main()
