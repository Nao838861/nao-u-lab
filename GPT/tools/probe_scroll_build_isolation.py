"""隔離SDKで共通スクロールを改変し、保存済みシューティングへの影響を調べる。"""
import argparse
from contextlib import ExitStack
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import time
from unittest.mock import patch


def digest(data):
    return hashlib.sha256(data).hexdigest()


def files_hash(root):
    return {str(p.relative_to(root)).replace('\\', '/'): digest(p.read_bytes())
            for p in sorted(root.rglob('*')) if p.is_file()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sdk', type=Path, required=True)
    parser.add_argument('--project', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--fresh', action='store_true', help='新規作成と同じ最新版を入力にする')
    args = parser.parse_args()
    sdk, project_dir, out = (p.resolve() for p in (args.sdk, args.project, args.output))
    out.mkdir(parents=True, exist_ok=False)
    snapshot = out / 'sdk'
    for folder in ('famibasic', 'runtime'):
        shutil.copytree(sdk / folder, snapshot / folder,
                        ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    # 製品ファイルは変更せず、通常と同じコンパイラを隔離資源に対して使う。
    sys._famibasic_resource_root = str(snapshot)
    sys.path[:0] = [str(snapshot), str(sdk)]
    from famibasic import bg_scroll, initial_graphics, project_folder
    from famibasic.build_service import BuildService, snapshot_hash
    from famibasic.project_background import prepare
    from famibasic.project_templates import create_template

    before_files = files_hash(project_dir)
    if args.fresh:
        from tools.latest_flight_lab import fresh_project
        project = fresh_project(out / 'fresh_inputs', preview=False)
    else:
        project = project_folder.load(project_dir)
    project_hash = snapshot_hash(project)
    prepared = prepare(project)
    summary = {
        'version': 1, 'physical_hardware': False,
        'purpose': '共通側の変更が保存済み最新版ROMへ混入しないかを確認。新機能の実装試験ではない。',
        'sdk': str(sdk),
        'sdk_head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=sdk, text=True).strip(),
        'sdk_dirty': subprocess.check_output(['git', 'status', '--short', '--untracked-files=no'], cwd=sdk, text=True).splitlines(),
        'project': 'fresh_project' if args.fresh else str(project_dir), 'project_sha256': project_hash,
        'source_sha256': digest(project['source'].encode('utf-8')),
        'route': {
            'side_art_b': bool(project.get('background_capabilities', {}).get('side_art_b')),
            'initial_graphics_before': initial_graphics.enabled(project),
            'initial_graphics_prepared': initial_graphics.enabled(prepared),
            'selected_before': bg_scroll.selected(project) is not None,
            'selected_prepared': bg_scroll.selected(prepared) is not None,
        },
        'builds': {},
    }
    service = BuildService()

    def build(label, p):
        print('BUILD ' + label, flush=True)
        start = time.perf_counter()
        result = service.build(deepcopy(p), out / label / 'game.nes')
        main_s = result.rom_path.parent / 'game_build/main.s'
        info = {
            'rom_sha256': result.rom_sha256,
            'rom_bytes': result.rom_path.stat().st_size,
            'input_sha256': result.input_sha256,
            'elapsed_seconds': round(time.perf_counter() - start, 3),
            'common_define': 'COMMON_BG_SCROLL=1' in main_s.read_text(encoding='utf-8'),
            'initial_save_sha256': digest(result.rom_path.with_suffix('.initial.sav').read_bytes())
                if result.rom_path.with_suffix('.initial.sav').exists() else None,
        }
        summary['builds'][label] = info
        print(json.dumps({label: info}, ensure_ascii=False), flush=True)
        return result

    base = build('shooter_before', project)
    control_project = create_template('scroll-horizontal')
    control = build('common_before', control_project)
    # 作動する対照：新ドライバ用のコードを増やしても、非採用ROMには組み込まれない。
    driver = snapshot / 'runtime/bg_scroll.s'
    driver.write_text(driver.read_text(encoding='utf-8') +
                      '\n; 隔離試験専用：配置への影響を検出する64バイト\n.res 64,$EA\n', encoding='utf-8')
    kernel = snapshot / 'runtime/kernel.s'
    anchor = '.ifdef COMMON_BG_SCROLL\n ldy #0\n jmp bg_scroll_bridge'
    kernel_text = kernel.read_text(encoding='utf-8')
    assert kernel_text.count(anchor) == 1
    kernel.write_text(kernel_text.replace(anchor, '.ifdef COMMON_BG_SCROLL\n nop\n ldy #0\n jmp bg_scroll_bridge'), encoding='utf-8')
    summary['mutations'] = {
        'runtime/bg_scroll.s': 'IR末尾に64バイト追加（隔離SDKのみ）',
        'runtime/kernel.s': 'COMMON_BG_SCROLL条件内へNOPを1命令追加（隔離SDKのみ）',
    }
    after = build('shooter_after', project)
    control_after = build('common_after', control_project)
    summary['comparisons'] = {
        'shooter_rom_identical': base.rom_path.read_bytes() == after.rom_path.read_bytes(),
        'shooter_labels_identical': base.report['labels'] == after.report['labels'],
        'shooter_initial_save_identical': summary['builds']['shooter_before']['initial_save_sha256'] ==
                                         summary['builds']['shooter_after']['initial_save_sha256'],
        'control_rom_changed': control.rom_path.read_bytes() != control_after.rom_path.read_bytes(),
    }
    # 未使用経路を検出する対照：共通描画生成を禁止し、専用経路が独立か確認する。
    def forbidden(*_args, **_kwargs):
        raise RuntimeError('COMMON_SCROLL_ISOLATION_TRIPWIRE')
    with ExitStack() as stack:
        stack.enter_context(patch.object(bg_scroll, 'assembly', forbidden))
        stack.enter_context(patch.object(initial_graphics, 'assembly', forbidden))
        guarded = build('shooter_tripwire', project)
        try:
            build('common_tripwire', control_project)
        except RuntimeError as error:
            assert str(error) == 'COMMON_SCROLL_ISOLATION_TRIPWIRE', str(error)
            summary['comparisons']['control_tripwire_triggered'] = True
        else:
            raise AssertionError('対照が共通生成経路へ到達しなかった')
    summary['comparisons']['shooter_tripwire_rom_identical'] = base.rom_path.read_bytes() == guarded.rom_path.read_bytes()
    summary['comparisons']['input_project_unchanged'] = snapshot_hash(project) == project_hash
    summary['comparisons']['saved_project_files_unchanged'] = files_hash(project_dir) == before_files
    summary['passed'] = all(summary['comparisons'].values())
    (out / 'result.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'passed': summary['passed'], 'comparisons': summary['comparisons'],
                      'report': str(out / 'result.json')}, ensure_ascii=False), flush=True)
    if not summary['passed']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
