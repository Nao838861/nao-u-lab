"""検証用Mode7コアを旧版とは別の実行フォルダーへ配置する。"""
import argparse,hashlib,json,shutil
from pathlib import Path
from setup_runtime import file_version
ROOT=Path(__file__).resolve().parents[1]

def main():
    p=argparse.ArgumentParser();p.add_argument('--core',type=Path,default=ROOT/'.cache/Mesen2_host/bin/win-x64/Release/MesenCore.dll')
    p.add_argument('--mesen-dir',type=Path,default=ROOT/'runtime');a=p.parse_args()
    assert file_version(a.mesen_dir/'Mesen.exe')[:3]==(2,1,1)
    assert a.core.is_file(),'Build the custom Mode7 core first'
    out=ROOT/'runtime_mode7';out.mkdir(exist_ok=True)
    for name in ['Mesen.exe','libSkiaSharp.dll','libHarfBuzzSharp.dll','MesenNesDB.txt','Mesen-LICENSE.txt']:
        source=a.mesen_dir/name
        if source.exists() and source.resolve()!=(out/name).resolve():shutil.copy2(source,out/name)
    if a.core.resolve()!=(out/'MesenCore.dll').resolve():shutil.copy2(a.core,out/'MesenCore.dll')
    settings=out/'settings.json'
    if not settings.exists():
        src=a.mesen_dir/'settings.json';config=json.loads(src.read_text(encoding='utf-8-sig')) if src.exists() else {}
        config={'Preferences':{'SingleInstance':False},'Nes':{'Port1':config.get('Nes',{}).get('Port1',{})}}
        settings.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    manifest={f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in out.iterdir() if f.is_file() and f.suffix in ['.exe','.dll']}
    (out/'runtime_manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps(manifest))

if __name__=='__main__':main()
