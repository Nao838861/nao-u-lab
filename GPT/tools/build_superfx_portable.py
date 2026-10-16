"""展開済みMSVCと固定Mesenソースから、このPC用の専用DLLを生成する。"""
import concurrent.futures
import os
from pathlib import Path
import subprocess
import shutil
import xml.etree.ElementTree as ET

BASE = Path(__file__).resolve().parents[1]
ROOT = BASE / '.tmp/superfx-local/GPT/projects/nes_superfx'
HOST = ROOT / '.cache/Mesen2_host'
SDK = BASE / '.tmp/msvc'
OUT = ROOT / 'build/portable'
NS = {'m': 'http://schemas.microsoft.com/developer/msbuild/2003'}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    env = {k.upper(): v for k, v in os.environ.items()}
    setup = subprocess.check_output(f'cmd /d /c "call {SDK / "setup_x64.bat"} && set"', text=True)
    for line in setup.splitlines():
        if '=' in line:
            key, value = line.split('=', 1)
            env[key.upper()] = value
    tasks = []
    for name in ['Core', 'Utilities', 'Windows', 'Lua', 'SevenZip', 'InteropDLL']:
        project = ET.parse(HOST / name / f'{name}.vcxproj')
        for node in project.findall('.//m:ClCompile[@Include]', NS):
            source = HOST / name / node.attrib['Include']
            obj = OUT / (name + '_' + node.attrib['Include'].replace('\\', '_').replace('/', '_') + '.obj')
            tasks.append((source, obj))

    def compile_one(task):
        source, obj = task
        if obj.exists():
            return
        cmd = [shutil.which('cl', path=env['PATH']), '/nologo', '/c', '/O2', '/MT', '/EHsc', '/std:c++17', '/utf-8', '/w',
               '/DWIN32', '/DNDEBUG', '/D_WINDOWS', '/DUNICODE', '/D_UNICODE',
               '/D_CRT_SECURE_NO_WARNINGS', '/D_WINSOCK_DEPRECATED_NO_WARNINGS',
               '/DINTEROPDLL_EXPORTS']
        for folder in [HOST, HOST/'Core', HOST/'Utilities', HOST/'Windows', source.parent]:
            cmd.append('/I' + str(folder))
        result = subprocess.run(cmd + [str(source), '/Fo' + str(obj)], env=env, capture_output=True)
        (OUT / (obj.name + '.log')).write_bytes(result.stdout + result.stderr)
        if result.returncode:
            raise RuntimeError(result.stdout.decode(errors='replace') + result.stderr.decode(errors='replace'))

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for i, _ in enumerate(pool.map(compile_one, tasks), 1):
            if i % 40 == 0:
                print(f'{i}/{len(tasks)} compiled', flush=True)
    runtime = ROOT / 'runtime'
    runtime.mkdir(exist_ok=True)
    libs = 'dinput8 Xinput9_1_0 d3d11 d3dcompiler dxguid winmm comctl32 kernel32 user32 gdi32 winspool comdlg32 advapi32 shell32 ole32 oleaut32 uuid odbc32 odbccp32 ws2_32'.split()
    response = OUT / 'link.rsp'
    response.write_text('\n'.join(['/DLL', '/MACHINE:X64', '/OUT:"' + str(runtime/'MesenCore.dll') + '"'] + ['"' + str(obj) + '"' for _, obj in tasks] + [x + '.lib' for x in libs]))
    subprocess.run([shutil.which('link', path=env['PATH']), '@' + str(response)], env=env, check=True)


if __name__ == '__main__':
    main()
