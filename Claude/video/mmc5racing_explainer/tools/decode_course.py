"""MMC5Racing の配布ROMから、角度ごとの回転済みコースとタイル・ブロック辞書の統計を復号する。

開発リポジトリは読み取りのみ。出力は public/gen/ へ書く。
復号手順は開発リポジトリ verification/scenery/map_view.py と同じ:
  角度ごとに 29x29 ブロック、1ブロック = 4x4 タイル (NT 1byte + ExRAM 1byte = 2byte x16 = 32byte)。
  タイル語 = ExRAM<<8 | NT。下位14bitがCHR内のタイル番号、上位2bitがパレット。
  CHR は 1MiB を 256KiB x 4 に分け、angle % 4 で選ぶ。
"""
from pathlib import Path
from collections import Counter
import argparse
import json
import re

from PIL import Image, ImageDraw

DEV = Path(r'D:\HomeBrew\MMC5Racing')
OUT = Path(__file__).resolve().parents[1] / 'public' / 'gen'

# 録画から採取した実画面の色（パレット0=道路, 1=木, 2=建物, 3=予備）
GRASS = (56, 135, 0)
PALETTES = [
    [GRASS, (116, 116, 116), (236, 238, 236), (176, 40, 40)],
    [GRASS, (0, 84, 0), (56, 180, 76), (152, 232, 136)],
    [GRASS, (120, 40, 20), (200, 96, 60), (252, 200, 150)],
    [GRASS, (116, 116, 116), (236, 238, 236), (176, 40, 40)],
]


def load(rom_path, lbl_path):
    rom = rom_path.read_bytes()
    labels = {n: int(v, 16) for v, n in re.findall(
        r'al ([0-9A-Fa-f]+) \.(\w+)', lbl_path.read_text())}
    return rom, labels


def rd(rom, bank, address):
    return rom[16 + (bank & 127) * 8192 + (address & 8191)]


def cells(rom, labels, angle, tb=116):
    bank = rd(rom, tb, labels['angle_banks'] + angle)
    header = rd(rom, tb, labels['angle_low'] + angle) | rd(rom, tb, labels['angle_high'] + angle) << 8
    grid = []
    for y in range(29):
        left, right, lo, hi = [rd(rom, bank, header + y * 4 + j) for j in range(4)]
        ptr = lo | hi << 8
        grid.append([(rd(rom, bank, ptr + 2 * x), rd(rom, bank, ptr + 2 * x + 1))
                     if left <= 2 * x < right else (0x00, 0x01) for x in range(29)])
    return grid


def block_words(rom, cell):
    slot, tag = cell
    if tag & 128:
        at = 16 + ((tag & 127) * 256 + slot) * 32
        return [rom[at + j] | rom[at + j + 16] << 8 for j in range(16)], ('dict', (tag & 127) * 256 + slot)
    return [slot | tag << 8] * 16, ('uniform', slot | tag << 8)


def tile_pixels(rom, word, angle):
    at = 1048592 + (angle % 4) * 262144 + (word & 16383) * 16
    b = rom[at:at + 16]
    return [(b[y] >> (7 - x) & 1) | (b[y + 8] >> (7 - x) & 1) << 1 for y in range(8) for x in range(8)]


class Decoder:
    def __init__(self, rom_path, lbl_path, table_bank=127):
        self.rom, self.labels = load(rom_path, lbl_path)
        self.tb = table_bank
        self.tile_cache = {}

    def tile_image(self, word, angle):
        key = (word, angle % 4)
        if key not in self.tile_cache:
            img = Image.new('RGB', (8, 8))
            pal = PALETTES[word >> 14]
            img.putdata([pal[v] for v in tile_pixels(self.rom, word, angle)])
            self.tile_cache[key] = img
        return self.tile_cache[key]

    def words(self, angle):
        out = [[0] * 116 for _ in range(116)]
        kinds = [[None] * 29 for _ in range(29)]
        for by, row in enumerate(cells(self.rom, self.labels, angle, self.tb)):
            for bx, cell in enumerate(row):
                ws, kind = block_words(self.rom, cell)
                kinds[by][bx] = kind
                for j, w in enumerate(ws):
                    out[by * 4 + j // 4][bx * 4 + j % 4] = w
        return out, kinds

    def course(self, angle):
        ws, _ = self.words(angle)
        img = Image.new('RGB', (928, 928))
        for y, row in enumerate(ws):
            for x, w in enumerate(row):
                img.paste(self.tile_image(w, angle), (x * 8, y * 8))
        return img


def main():
    ap = argparse.ArgumentParser()
    # 最新配布ROM(136x184)は辞書が起動時展開の実行コード形式で静的復号できないため、
    # コース・木・建物の配置が同じ 144x176 版(10/15)と対応ラベルを使う
    ap.add_argument('--rom', type=Path, default=DEV / 'releases/MMC5Racing_AllIntegrated_144x176.nes')
    ap.add_argument('--lbl', type=Path, default=DEV / 'build/direct/kernel/prepare.lbl')
    ap.add_argument('--table-bank', type=int, default=116)
    ap.add_argument('--name', default='course')
    ap.add_argument('--angles', default='all')
    args = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / args.name).mkdir(exist_ok=True)
    dec = Decoder(args.rom, args.lbl, args.table_bank)
    angles = range(128) if args.angles == 'all' else [int(a) for a in args.angles.split(',')]

    stats = {'angles': {}, 'quarters': {}}
    quarter_tiles = {q: set() for q in range(4)}
    dict_blocks, uniform_values = set(), Counter()
    positions = 0
    for a in angles:
        ws, kinds = dec.words(a)
        dec.course(a).save(OUT / args.name / f'angle_{a:03d}.png')
        flat = [w for row in ws for w in row]
        positions += len(flat)
        quarter_tiles[a % 4].update(w & 16383 for w in flat)
        k = Counter(kind[0] for row in kinds for kind in row)
        for row in kinds:
            for kind in row:
                if kind[0] == 'dict':
                    dict_blocks.add(kind[1])
                else:
                    uniform_values[kind[1]] += 1
        stats['angles'][a] = {'dict_blocks': k['dict'], 'uniform_blocks': k['uniform'],
                              'unique_tiles': len(set(flat))}
    stats['tile_positions_total'] = positions
    stats['quarters'] = {q: len(s) for q, s in quarter_tiles.items()}
    stats['unique_tiles_total'] = sum(stats['quarters'].values())
    stats['dict_blocks_used'] = len(dict_blocks)
    stats['uniform_kinds'] = len(uniform_values)
    stats['uniform_blocks_total'] = sum(uniform_values.values())
    (OUT / f'{args.name}_stats.json').write_text(json.dumps(stats, indent=1), encoding='utf-8')
    print(json.dumps({k: v for k, v in stats.items() if k != 'angles'}, indent=1))


if __name__ == '__main__':
    main()
