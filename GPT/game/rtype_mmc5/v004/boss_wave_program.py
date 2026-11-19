"""対空レーザーの疎なセル列をボス部屋用6502ルーチンに変換する。"""
import re

def compile_programs(out,labels):
    symbols={name:int(address,16) for address,name in re.findall(r'al (\w+) \.(_\w+)',labels)}
    row=symbols['_boss_wave_row'];cell=symbols['_boss_wave_cell'];cols=symbols['_boss_wave_cols']
    waves=(out/'waves.bin').read_bytes()
    code=bytearray(96)
    start=0
    for phase in range(32):
        rows={}
        while waves[start]!=255:
            x,y,ink=waves[start:start+3];start+=3
            rows.setdefault(y,[]).append((x,ink))
        start+=1
        body=bytearray()
        for y,points in rows.items():
            parts=bytearray()
            for dx,ink in points:
                # LDY col[dx] / BMI skip / LDA #ink / JSR paint_cell.
                parts.extend((0xa4,cols+dx,0x30,5,0xa9,ink,0x20,cell&255,cell>>8))
            body.extend((0xa9,y,0x20,row&255,row>>8,0x90,len(parts)))
            body.extend(parts)
        body.append(0x60)
        if len(code)%8192+len(body)>8192:code.extend(bytes(8192-len(code)%8192))
        addr=0xa000+len(code)%8192
        code[phase]=0xb0+len(code)//8192;code[phase+32]=addr&255;code[phase+64]=addr>>8
        code.extend(body)
    assert start==len(waves)
    return bytes(code)
