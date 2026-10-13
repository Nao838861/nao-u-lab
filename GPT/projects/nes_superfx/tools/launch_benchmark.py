"""検証済みのサイズ別ROMを選んで、専用Mesenで表示する。"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--edge', type=int, help='投影前のモデル辺長。省略時は対話メニュー')
    parser.add_argument('--list', action='store_true', help='ROM一覧だけ表示')
    args = parser.parse_args()
    entries = json.loads((ROOT/'releases/bitmap_benchmark.json').read_text(encoding='utf-8'))['results']
    for i, item in enumerate(entries, 1):
        print(f"{i}: edge={item['model_edge']:2d}  cubes={item['count_at_30fps']:2d}  GSU max={item['max_gsu_ms']:.3f}ms")
    print('30fps within the emulator timing model. FPGA / hardware performance is unverified.')
    if args.list:
        return
    if args.edge is not None:
        selected = next((e for e in entries if e['model_edge'] == args.edge), None)
        if selected is None:
            parser.error('一覧にある辺長を指定してください')
    else:
        while True:
            try:
                choice = input(f'Select number [1-{len(entries)}], q=quit: ').strip()
                if choice.lower() == 'q':
                    return
                index = int(choice)-1
                if 0 <= index < len(entries):
                    selected = entries[index]
                    break
            except (ValueError, EOFError):
                if not sys.stdin.isatty():
                    return
    subprocess.run([sys.executable, str(ROOT/'tools/launch.py'), '--mapper', 'n8pro-gsu-abi2',
                    str(ROOT/selected['rom'])], check=True)


if __name__ == '__main__':
    main()
