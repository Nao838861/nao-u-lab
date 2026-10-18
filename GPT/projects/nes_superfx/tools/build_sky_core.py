"""既存の portable MSVC オブジェクトを使い、mapper の翻訳単位を必ず再構築する。"""
import argparse,hashlib,json,os,shutil,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def main():
    p=argparse.ArgumentParser();p.add_argument('--base-project',type=Path,required=True)
    p.add_argument('--sdk',type=Path,required=True);a=p.parse_args()
    host=a.base_project/'.cache/Mesen2_host';previous=a.base_project/'build/portable'
    out=ROOT/'build/sky-core';out.mkdir(parents=True,exist_ok=True)
    env={k.upper():v for k,v in os.environ.items()}
    setup=subprocess.check_output(f'cmd /d /c "call {a.sdk / "setup_x64.bat"} && set"',text=True)
    for line in setup.splitlines():
        if '=' in line:
            k,v=line.split('=',1);env[k.upper()]=v
    dest=host/'Core/NES/Mappers/Homebrew/NesFx'
    for name in ['NesSuperFx.h','Board.hpp','NesBitmapFx.h','BitmapBoard.hpp']:
        assert (ROOT/'src'/name).read_bytes()==(dest/name).read_bytes(),f'Unexpected stale dependency: {name}'
    for name in ['Mode7Ground.hpp','NesRacingFx.h']:shutil.copy2(ROOT/'src'/name,dest/name)
    cl=shutil.which('cl',path=env['PATH']);link=shutil.which('link',path=env['PATH'])
    common=[cl,'/nologo','/O2','/MT','/EHsc','/std:c++17','/utf-8','/w']
    def run(cmd,name):
        r=subprocess.run(cmd,env=env,cwd=out,capture_output=True)
        (out/name).write_bytes(r.stdout+r.stderr)
        if r.returncode:raise RuntimeError((r.stdout+r.stderr).decode(errors='replace'))
    contract=out/'mode7_contract.exe'
    run(common+[str(ROOT/'src/mode7_contract.cpp'),'/Fe'+str(contract)],'contract-build.log')
    run([str(contract)],'contract.log')
    obj=out/'Core_NES_MapperFactory.cpp.obj'
    cmd=common+['/c','/DWIN32','/DNDEBUG','/D_WINDOWS','/DUNICODE','/D_UNICODE',
                '/D_CRT_SECURE_NO_WARNINGS','/D_WINSOCK_DEPRECATED_NO_WARNINGS','/DINTEROPDLL_EXPORTS']
    cmd+=['/I'+str(d) for d in [host,host/'Core',host/'Utilities',host/'Windows',host/'Core/NES']]
    run(cmd+[str(host/'Core/NES/MapperFactory.cpp'),'/Fo'+str(obj)],'mapper-build.log')
    rsp=(previous/'link.rsp').read_text().splitlines();replacement=[]
    for line in rsp:
        if line.startswith('/OUT:'):line='/OUT:"'+str(out/'MesenCore.dll')+'"'
        elif 'Core_NES_MapperFactory.cpp.obj' in line:line='"'+str(obj)+'"'
        replacement.append(line)
    response=out/'link.rsp';response.write_text('\n'.join(replacement))
    run([link,'@'+str(response)],'link.log')
    files=[ROOT/'src/Mode7Ground.hpp',ROOT/'src/NesRacingFx.h',host/'Core/NES/MapperFactory.cpp',out/'MesenCore.dll']
    report={'files':{str(f):hashlib.sha256(f.read_bytes()).hexdigest() for f in files},
            'reused_object_directory':str(previous),'recompiled':'Core/NES/MapperFactory.cpp'}
    (out/'build-manifest.json').write_text(json.dumps(report,indent=2)+'\n');print((out/'contract.log').read_text())

if __name__=='__main__':main()
