"""計測した6シーン×2クロック設定をAボタンで選ぶ、1本の実NES ROM。"""
import json,struct,subprocess
from pathlib import Path
from build_polygon import ROOT,DEMO
from build_bitmap import FONT


def main():
    summary=json.loads((ROOT/'build/polygon/benchmark/summary.json').read_text())
    assert summary['status']=='pass'
    records=[r for r in summary['results'] if r['renderer']=='fast']
    out=ROOT/'build/polygon/interactive';out.mkdir(exist_ok=True)
    first=ROOT/records[0]['directory']
    (out/'payload.bin').write_bytes((first/'payload.bin').read_bytes())
    (out/'config.inc').write_text(f'KIND=1\nMODE=3\nWIDTH=256\nHEIGHT=240\nMULTIPLIER_FAST=0\nCLOCK_SELECT=0\nINTERACTIVE=1\nPROFILE_COUNT={len(records)}\n')
    lines=[];configs=[];font=dict(FONT)
    font.update({'C':['111','100','100','100','111'],'I':['111','010','010','010','111']})
    for i,r in enumerate(records):
        directory=ROOT/r['directory'];config=json.loads((directory/'config.json').read_text())
        payload=(directory/'payload.bin').read_bytes()
        packet=payload[:16]+payload[0x40:0x140]+payload[0x200:0x200+config['count']*8]
        (out/f'profile_{i}.bin').write_bytes(packet)
        config['hud_lines']=[(8,216,f"N={config['count']:02d}"),(64,216,f"C={25 if r['clock_select'] else 12:02d}"),
                             (8,224,f"IN={r['at30']['submitted_triangles']:03d}")]
        data=bytearray()
        for x,y,text in config['hud_lines']:
            for col,c in enumerate(text):data.extend([y-1,ord(c),0,x+col*8])
        assert len(data)==56
        (out/f'hud_{i}.bin').write_bytes(data);configs.append(config)
    for prefix in ['profile','hud']:
        lines += [f'{prefix}_low: .lobytes '+','.join(f'{prefix}_{i}' for i in range(len(records))),
                  f'{prefix}_high: .hibytes '+','.join(f'{prefix}_{i}' for i in range(len(records)))]
        lines += [f'{prefix}_{i}: .incbin "{prefix}_{i}.bin"' for i in range(len(records))]
    lines += ['profile_clock: .byte '+','.join(str(r['clock_select']) for r in records),
              'profile_cfgr: .byte '+','.join(str(0xa0 if r['multiplier_fast'] else 0x80) for r in records)]
    (out/'profiles.inc').write_text('\n'.join(lines)+'\n')
    chrdata=bytearray(8192)
    for c,rows in font.items():
        for y,bits in enumerate(rows):chrdata[4096+ord(c)*16+y+1]=int(bits,2)<<4
    (out/'hud.chr').write_bytes(chrdata)
    subprocess.run(['ca65','-I',str(out),'-o',str(out/'cpu.o'),str(DEMO/'cpu.s')],cwd=out,check=True)
    rom=out/'GSU_PolygonBenchmark_A_v001.nes'
    subprocess.run(['ld65','-C',str(ROOT/'demos/cube/v001/rom.cfg'),'-o',str(rom),'-Ln',str(out/'cpu.lbl'),str(out/'cpu.o')],check=True)
    (out/'config.json').write_text(json.dumps({'kind':'interactive_polygon','profiles':configs,'font':font},indent=2)+'\n')
    print(rom)


if __name__=='__main__':main()
