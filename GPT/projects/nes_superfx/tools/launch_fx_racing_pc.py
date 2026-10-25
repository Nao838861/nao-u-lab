"""敵車・時間停止修正版の固定ROMを専用PC機能モデルで起動する。"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

from native_lock import core_lock

ROOT = Path(__file__).resolve().parents[1]
ROM_HASH = 'b893f680e22fbd38b5aa47516bc7aef3564fb8e292b0403ab38aa33cba3b74dc'
DEFAULT_ROM = Path(r'D:\HomeBrew\FxRacing\releases\FX_Racing_3D_20261025\FX_RACING_3D.nes')


def prepare_runtime():
    runtime = ROOT / 'runtime_fx_racing_pc'
    if not (runtime / 'MesenCore.dll').is_file():
        raise RuntimeError('先に python tools/build.py --fx-racing-pc を実行してください')
    source = ROOT / 'runtime_mode7'
    for name in ('Mesen.exe', 'libSkiaSharp.dll', 'libHarfBuzzSharp.dll', 'MesenNesDB.txt', 'Mesen-LICENSE.txt'):
        if not (runtime / name).exists():
            shutil.copy2(source / name, runtime / name)
    settings = runtime / 'settings.json'
    if not settings.exists():
        cfg = json.loads((source / 'settings.json').read_text(encoding='utf-8-sig'))
        cfg.setdefault('Preferences', {})['SingleInstance'] = False
        cfg.setdefault('Nes', {})['AutoConfigureInput'] = False
        port = cfg['Nes'].setdefault('Port1', {})
        port['Type'] = 'NesController'
        port['Mapping1'] = dict(A=69, B=67, Select=117, Start=6, Left=23, Right=25, Up=24, Down=26)
        settings.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return runtime


def checked_rom(path):
    data = path.read_bytes()
    if hashlib.sha256(data).hexdigest() != ROM_HASH:
        raise ValueError('対象はa8d2a2dの敵車・時間停止修正版ROMです。SHA256が一致しません')
    return path.resolve()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('rom', nargs='?', type=Path, default=DEFAULT_ROM)
    parser.add_argument('--check-only', action='store_true')
    parser.add_argument('--install-launcher', action='store_true',help='取得先にplay_latest.cmdを配置')
    args = parser.parse_args()
    rom = checked_rom(args.rom)
    runtime = prepare_runtime()
    if args.install_launcher:
        launcher = DEFAULT_ROM.parents[2] / 'play_latest.cmd'
        content = f'@echo off\ncd /d "{ROOT}"\npython tools\\launch_fx_racing_pc.py %*\n'
        if launcher.exists() and launcher.read_text(encoding='utf-8') != content:
            raise FileExistsError(f'既存の起動ファイルは置き換えません: {launcher}')
        launcher.write_text(content, encoding='utf-8')
        print(f'Launcher: {launcher}', flush=True)
    print(f'ROM: {rom}\nSHA256: {ROM_HASH}\nPC機能モデル（実機タイミング未再現）', flush=True)
    if not args.check_only:
        env = os.environ.copy()
        env['NES_GSU_MAPPER'] = 'fx-racing-pc-20261025'
        with core_lock(runtime / 'MesenCore.dll'):
            subprocess.run([str(runtime / 'Mesen.exe'), str(rom)], cwd=runtime, env=env, check=True)


if __name__ == '__main__':
    main()
