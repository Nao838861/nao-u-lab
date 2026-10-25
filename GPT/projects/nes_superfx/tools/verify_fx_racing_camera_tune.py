"""視点②/④の実PPU表示と同一入力のゲーム状態を両モードで比較。"""
import hashlib
import json
from launch_fx_racing_pc import ROOT, prepare_runtime
from build_fx_racing_camera_tune import OUTPUT, SOURCE_ROM
from verify_fx_racing_camera_fix import run_case
from py65.devices.mpu6502 import MPU


def signed_words(data):
    return [int.from_bytes(bytes(data[i:i+2]),'little',signed=True)for i in range(0,len(data),2)]


def verify_offset_arithmetic():
    rom=OUTPUT.read_bytes();memory=[0]*65536
    memory[0xe000:]=rom[16:8208]
    memory[0xa000:0xc000]=rom[16+4*8192:16+5*8192]
    count=0
    for target,source in [(0xe3f5,0x6000),(0xbd9c,0x077a)]:
        memory[0x700:0x704]=[0x20,target&255,target>>8,0xea]
        for scalar in range(14):
            for coefficient in range(-256,257):
                memory[0x35b]=0;memory[0x35c]=scalar
                memory[source+14]=coefficient&255;memory[source+15]=(coefficient>>8)&255
                cpu=MPU(memory=memory,pc=0x700);cpu.x=14;cpu.sp=0xfd
                for _ in range(300):
                    cpu.step()
                    if cpu.pc==0x703:break
                else:raise AssertionError('camera offset did not return')
                result=int.from_bytes(bytes(memory[0x356:0x35a]),'little',signed=True)
                assert result==coefficient*scalar*256,(hex(target),scalar,coefficient,result)
                count+=1
    return dict(status='pass',cases=count,coefficient_range=[-256,256],distance_factors=[0,13],paths=['foreground','NMI cache'])


def main():
    runtime=prepare_runtime();reports=[]
    arithmetic=verify_offset_arithmetic()
    (ROOT/'build/fx_racing_camera_tune/arithmetic.json').write_text(json.dumps(arithmetic,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(arithmetic),flush=True)
    for mode in [0,1]:
        before,base=run_case(runtime,SOURCE_ROM,mode,True,f'tune_base_{mode}')
        after,out=run_case(runtime,OUTPUT,mode,True,f'tune_new_{mode}')
        raw_before=(base/'native_trace.jsonl').read_bytes()
        raw_after=(out/'native_trace.jsonl').read_bytes()
        assert raw_before==raw_after,'同じ入力でゲーム状態が変化しています'
        center=signed_words(next(r['camera']for r in after['rows']if r['view']==0))[:2]
        for a,b in zip(before['rows'],after['rows']):
            if b['view'] in (0,2):assert a['camera']==b['camera'],'視点①/③が変化しています'
            words=signed_words(b['camera'])
            if b['view']==1:assert words[2]==448 and words[5:]==[252,46],words
            if b['view']==3:assert words[2]==3277 and words[5:]==[0,256],words
            back={0:0,1:768,2:2304,3:0}[b['view']]
            assert words[0]==center[0]-back*words[4]//256 and words[1]==center[1]-back*words[3]//256,words
        after['canonical_game_state_comparison']=dict(trace_equal=True,ticks=len(raw_after.splitlines()),
                   trace_sha256=hashlib.sha256(raw_after).hexdigest())
        after['camera_words']=[dict(view=r['view'],words=signed_words(r['camera']))for r in after['rows']]
        (out/'verification.json').write_text(json.dumps(after,indent=2)+'\n',encoding='utf-8')
        reports.append(after)
        print(json.dumps({k:v for k,v in after.items()if k not in ['rows','camera_words']}),flush=True)
    (ROOT/'build/fx_racing_camera_fix/camera_tune_verification.json').write_text(json.dumps(reports,indent=2)+'\n',encoding='utf-8')


if __name__=='__main__':main()
