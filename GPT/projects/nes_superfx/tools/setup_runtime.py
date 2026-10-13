"""検証したDLLと同じ2.1.1のMesen UIを専用フォルダーへ複製する。"""
import argparse
import ctypes as C
import hashlib
import json
import shutil
from pathlib import Path

from verify import ROOT, LOCK, DEFAULT_ROM, digest


def file_version(path):
    version=C.WinDLL('version',use_last_error=True)
    version.GetFileVersionInfoSizeW.argtypes=[C.c_wchar_p,C.c_void_p]
    size=version.GetFileVersionInfoSizeW(str(path),None)
    if not size: raise RuntimeError('Mesen UIのバージョン情報がない')
    data=C.create_string_buffer(size)
    version.GetFileVersionInfoW.argtypes=[C.c_wchar_p,C.c_uint32,C.c_uint32,C.c_void_p]
    if not version.GetFileVersionInfoW(str(path),0,size,data): raise C.WinError(C.get_last_error())
    ptr=C.c_void_p(); length=C.c_uint32()
    version.VerQueryValueW.argtypes=[C.c_void_p,C.c_wchar_p,C.POINTER(C.c_void_p),C.POINTER(C.c_uint32)]
    if not version.VerQueryValueW(data,'\\',C.byref(ptr),C.byref(length)): raise C.WinError(C.get_last_error())
    words=C.cast(ptr,C.POINTER(C.c_uint32))
    return (words[2]>>16,words[2]&65535,words[3]>>16,words[3]&65535)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--mesen-dir',type=Path,default=Path(r'D:\HomeBrew\Mesen'))
    parser.add_argument('--rom',type=Path,default=DEFAULT_ROM)
    args=parser.parse_args()
    if file_version(args.mesen_dir/'Mesen.exe')[:3]!=(2,1,1):
        raise RuntimeError('UIはMesen 2.1.1を指定してください')
    if digest(args.rom)!=LOCK['diagnostic_sha256']: raise RuntimeError('診断ROMのhashが異なる')
    runtime=ROOT/'runtime'
    if not (runtime/'MesenCore.dll').is_file(): raise RuntimeError('先にtools/build.pyを実行')
    for name in ('Mesen.exe','libSkiaSharp.dll','libHarfBuzzSharp.dll'):
        shutil.copy2(args.mesen_dir/name,runtime/name)
    # Restore the custom core if the stock UI had previously extracted its own DLL.
    shutil.copy2(ROOT/'.cache/Mesen2_host/bin/win-x64/Release/MesenCore.dll',runtime/'MesenCore.dll')
    shutil.copy2(args.rom,runtime/'gsu-selftest.nes')
    settings=runtime/'settings.json'
    config=json.loads(settings.read_text(encoding='utf-8-sig')) if settings.exists() else {}
    config.setdefault('Preferences',{})['SingleInstance']=False
    settings.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    manifest={p.name:digest(p) for p in runtime.iterdir() if p.is_file() and p.suffix in ('.dll','.exe','.nes')}
    (runtime/'runtime_manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    print(f'専用Mesen UI: {runtime}/Mesen.exe')


if __name__=='__main__': main()
