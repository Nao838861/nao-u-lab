"""最適化した6502カメラ計算を全1024方向・4視点で参照式と比較。"""
import json,random,re,struct,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'build/python'))
from py65.devices.mpu6502 import MPU
from mmc5_state import pose,snapshot
from build_ground import VIEWS

def main():
    labels={n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(ROOT/'build/racing/v003/cpu.lbl').read_text())}
    rom=(ROOT/'releases/GSU_MMC5Racing3D_v003.nes').read_bytes()
    mem=bytearray(65536);mem[0xe000:]=rom[16:16+8192];mem[0xa000:0xc000]=rom[16+4*8192:16+5*8192]
    entry=labels['render_from_mmc5_state'];mem[0x700:0x704]=bytes([0x20,entry&255,entry>>8,0xea])
    rng=random.Random(513);protected=bytes(rng.randrange(256) for _ in range(192));mem[0x40:0x100]=protected
    cases=[(snapshot(568*256+128,392*256,h*64,(h*64+8192)&65535,23),v) for v in range(4) for h in range(1024)]
    cases += [(snapshot(rng.randrange(-128*256,800*256),rng.randrange(-128*256,800*256),rng.randrange(65536),rng.randrange(65536)),rng.randrange(4)) for _ in range(1024)]
    cycles=[]
    for state,v in cases:
        mem[0x300:0x30c]=state;mem[labels['view']]=v
        cpu=MPU(memory=mem,pc=0x700);cpu.sp=255
        for _ in range(5000):
            cpu.step()
            if cpu.pc==0x703:break
        else:raise AssertionError('conversion timeout')
        assert not cpu.p&1
        assert list(struct.unpack('<11h',mem[0x6008:0x601e]))==pose(state,VIEWS[v]),(state,v)
        assert mem[0x40:0x100]==protected and mem[0x300:0x30c]==state
        cycles.append(cpu.processorCycles)
    report={'exact_pose_cases':len(cases),'directions':1024,'views':4,'random_cases':1024,'cpu_cycles_min':min(cycles),'cpu_cycles_max':max(cycles)}
    (ROOT/'demos/racing/v003/results/optimization/bridge.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))

if __name__=='__main__':main()
