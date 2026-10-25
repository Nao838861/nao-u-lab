"""独立したMesenビルドへABI1マッパーを追加する。既存インストールは変更しない。"""
import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

from prepare import ROOT, SOURCE, LOCK, OUT, run, replace


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--fetch',action='store_true')
    parser.add_argument('--fx-racing-pc',action='store_true',help='2026-10-25実機ROM用のPC機能モデルを追加')
    args=parser.parse_args()
    run(sys.executable,str(ROOT/'tools/prepare.py'),*(['--fetch'] if args.fetch else []))
    host=ROOT/'.cache/Mesen2_host'
    if not host.exists():
        run('git','clone','--shared',str(SOURCE),str(host))
        run('git','-C',str(host),'checkout','--detach',LOCK['revision'])
    revision=subprocess.check_output(['git','-C',str(host),'rev-parse','HEAD'],text=True).strip()
    if revision!=LOCK['revision']:
        raise RuntimeError('Mesenホストの版が異なる')
    # The entire generated host is disposable, but do not reset/clean unrelated files.
    factory_rel='Core/NES/MapperFactory.cpp'
    factory=subprocess.check_output(['git','-C',str(host),'show',f'HEAD:{factory_rel}']).decode('utf-8-sig')
    factory=replace(factory,'#include "NES/MapperFactory.h"',
                    '#include "NES/MapperFactory.h"\n#include <cstdlib>\n#include "NES/Mappers/Homebrew/NesFx/NesSuperFx.h"\n#include "NES/Mappers/Homebrew/NesFx/NesBitmapFx.h"\n#include "NES/Mappers/Homebrew/NesFx/NesRacingFx.h"')
    factory=replace(factory,'\t\tcase 0: return new NROM();','''\t\tcase 0: {
            const char* selected = std::getenv("NES_GSU_MAPPER");
            if(selected && std::string(selected) == "n8pro-racing-gsu") {
                if((romData.PrgRom.size()!=1048576 && romData.PrgRom.size()!=2097152) || romData.ChrRom.size()!=8192) return nullptr;
                return new NesRacingFx();
            }
            if(selected && std::string(selected) == "n8pro-gsu-abi2") {
                if(romData.PrgRom.size()!=32768 || romData.ChrRom.size()!=8192) return nullptr;
                MessageManager::Log("[NES GSU] n8pro-gsu-abi2; PPU bitmap; model timing only");
                return new NesBitmapFx();
            }
            if(selected && std::string(selected) == "n8pro-gsu-abi1") {
                if(romData.PrgRom.size()!=32768 || romData.ChrRom.size()!=8192) {
                    MessageManager::DisplayMessage("Error", "N8 Pro GSU ABI1 needs 32KiB PRG and 8KiB CHR ROM");
                    return nullptr;
                }
                MessageManager::Log("[NES GSU] n8pro-gsu-abi1; functional timing; CPU IRQ disconnected");
                return new NesSuperFx();
            }
            return new NROM();
        }''')
    if args.fx_racing_pc:
        factory=factory.replace('#include <cstdlib>', '#include <cstdlib>\n#include "NES/Mappers/Homebrew/NesFx/NesFxRacingPc.h"')
        factory=factory.replace('            if(selected && std::string(selected) == "n8pro-racing-gsu") {', '''            if(selected && std::string(selected) == "fx-racing-pc-20261025") {
                if(romData.PrgRom.size()!=1048576 || romData.ChrRom.size()!=131072) return nullptr;
                return new NesFxRacingPc();
            }
            if(selected && std::string(selected) == "n8pro-racing-gsu") {''')
    (host/factory_rel).write_text(factory,encoding='utf-8')
    palette_source=(SOURCE/'UI/Config/NesConfig.cs').read_text(encoding='utf-8-sig')
    palette=re.search(r'UserPalette.*?new UInt32\[64\] \{([^}]+)\}',palette_source)[1]
    api_rel='InteropDLL/EmuApiWrapper.cpp'
    api=subprocess.check_output(['git','-C',str(host),'show',f'HEAD:{api_rel}']).decode('utf-8-sig')
    defaults='''
    // Standalone Python host initialization; stock Mesen UI sets these itself.
    DllExport void __stdcall InitializeNesFxHost() {
        NesConfig config = _emu->GetSettings()->GetNesConfig();
        const uint32_t palette[64] = {''' + palette + '''};
        for(unsigned i=0;i<512;++i) config.UserPalette[i]=palette[i&63];
        config.Region=ConsoleRegion::Ntsc;
        config.RamPowerOnState=RamState::AllZeros;
        config.DisableGameDatabase=true;
        for(auto &volume : config.ChannelVolumes) volume = 100;
        _emu->GetSettings()->SetNesConfig(config);
    }
'''
    api=replace(api,'extern "C" {','extern "C" {\n'+defaults)
    (host/api_rel).write_text(api,encoding='utf-8')
    dest=host/'Core/NES/Mappers/Homebrew/NesFx'
    dest.mkdir(parents=True,exist_ok=True)
    for source in (ROOT/'src/NesSuperFx.h',ROOT/'src/Board.hpp',ROOT/'src/NesBitmapFx.h',ROOT/'src/NesRacingFx.h',ROOT/'src/BitmapBoard.hpp',ROOT/'src/Mode7Ground.hpp',OUT/'NesFxGsu.hpp'):
        shutil.copy2(source,dest/source.name)
    if args.fx_racing_pc:
        for name in ('NesFxRacingPc.h','FxRacingBoard.hpp'):
            shutil.copy2(ROOT/'src'/name,dest/name)
    # Full source diff is retained as reproducible evidence alongside the DLL.
    build=ROOT/'build'
    build.mkdir(exist_ok=True)
    vswhere=Path('C:/Program Files (x86)/Microsoft Visual Studio/Installer/vswhere.exe')
    installation=subprocess.check_output([str(vswhere),'-latest','-version','[17.0,18.0)',
                                         '-property','installationPath'],text=True).strip()
    msbuild=str(Path(installation)/'MSBuild/Current/Bin/amd64/MSBuild.exe')
    command=[msbuild,str(host/'InteropDLL/InteropDLL.vcxproj'),'/m:2','/p:Configuration=Release',
             '/p:Platform=x64','/p:PlatformTarget=x64',f'/p:SolutionDir={host}\\',
             '/p:RunCodeAnalysis=false','/v:minimal','/nologo']
    with (build/'mesen_build.log').open('w',encoding='utf-8') as log:
        result=subprocess.run(command,stdout=log,stderr=subprocess.STDOUT)
    if result.returncode:
        print((build/'mesen_build.log').read_text(encoding='utf-8')[-14000:])
        raise SystemExit(result.returncode)
    dll=host/'bin/win-x64/Release/MesenCore.dll'
    runtime=ROOT/('runtime_fx_racing_pc' if args.fx_racing_pc else 'runtime')
    runtime.mkdir(exist_ok=True)
    shutil.copy2(dll,runtime/dll.name)
    shutil.copy2(SOURCE/'LICENSE',runtime/'Mesen-LICENSE.txt')
    shutil.copy2(OUT/'source_manifest.json',runtime/'source_manifest.json')
    print(f'Mesen GSU core built: {runtime/dll.name}')


if __name__=='__main__':
    main()
