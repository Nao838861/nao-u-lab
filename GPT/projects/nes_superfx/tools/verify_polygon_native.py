"""GSU単体の全64姿勢を独立参照と照合し、負荷内訳を保存する。"""
import argparse,json,struct,subprocess
from pathlib import Path
from build_polygon import ROOT
from polygon_reference import reference
from run_bitmap import pixel_byte


def verify(directory):
    directory=Path(directory)
    config=json.loads((directory/'config.json').read_text())
    exe=ROOT/'build/Release/nesfx_polygon_probe.exe'
    flags=int(config.get('multiplier_fast',False))+2*config.get('clock_select',0)+4*int(config.get('hardware_clear',False))+8*int(config.get('reference_mhz',25)==50)
    r=subprocess.run([str(exe),str(directory),'dump',str(flags)],capture_output=True,check=True,timeout=90)
    native=json.loads(r.stdout);(directory/'native.json').write_bytes(r.stdout)
    stats=[]
    for phase in range(64):
        pixels,image,data,last=reference(config,phase)
        ram=(directory/f'native_{phase}.bin').read_bytes();work=(directory/f'work_{phase}.bin').read_bytes()
        assert list(struct.unpack_from('<4H',work,0x10))==[data[k] for k in ['vertices','submitted','visible','near_rejected']],phase
        assert list(struct.iter_unpack('<3h',work[0x140:0x140+len(last)*6]))==last,phase
        for y in range(240):
            for x in range(256):
                off=pixel_byte(x,y,0);shift=7-(x&7)
                actual=((ram[off]>>shift)&1)|(((ram[off+1]>>shift)&1)<<1)
                if actual!=pixels[y*256+x]:raise RuntimeError((directory.name,phase,x,y,actual,pixels[y*256+x]))
        data['phase']=phase;data['gsu_clocks']=native['frames'][phase]['clocks'];stats.append(data)
        if phase in (0,8,16,24):image.save(directory/f'preview_{phase}.png')
    report={'status':'pass','gsu_pixels_checked':64*61440,'frames':stats,'native':native}
    (directory/'native_verified.json').write_text(json.dumps(report,indent=2)+'\n')
    print(directory.name,'native 64 poses PASS','max ms',native['max_clocks']/(config.get('reference_mhz',25)*1000),flush=True)
    return report


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('directory',type=Path);a=p.parse_args();verify(a.directory)
