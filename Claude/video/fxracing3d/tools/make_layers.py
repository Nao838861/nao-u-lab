"""録画した層（通常／FXなし）と8ドットごとの合成情報から、解説用の画像を作る。
出力（public/img/layer_<コマ>_*.png、すべて256×240の実画素）:
  full   … 実際の画面
  ground … Mode7の地面だけ（同じ入力のもう1台のコアでFXを消したもの）
  fx     … SuperFXが描いた部分だけ（合成情報の不透明マスクで切り抜き、ほかは透明）
  blocks … 8×1ドットごとに選ばれた色の組（0地面／1空／2地面＋FX／3空＋FX）を色分けした地図
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
src = root / 'rec/main/layers'
out = root / 'public/img'
out.mkdir(parents=True, exist_ok=True)
MAP = {0: (70, 78, 96), 1: (150, 200, 255), 2: (255, 181, 71), 3: (255, 91, 200)}
for f in map(int, sys.argv[1:]):
    full = np.fromfile(src / f'{f}_full.rgb', np.uint8).reshape(240, 256, 3)
    ground = np.fromfile(src / f'{f}_ground.rgb', np.uint8).reshape(240, 256, 3)
    info = np.fromfile(src / f'{f}_info.bin', np.uint8).reshape(240, 34, 4)
    mask = np.zeros((240, 256), bool)
    blocks = np.zeros((240, 256, 3), np.uint8)
    for tx in range(32):
        for bit in range(8):
            mask[:, tx * 8 + bit] = (info[:, tx, 0] >> (7 - bit)) & 1
        for p, c in MAP.items():
            blocks[info[:, tx, 2] == p, tx * 8:tx * 8 + 8] = c
    mask[192:] = False
    blocks[192:] = (0, 0, 0)
    fx = np.zeros((240, 256, 4), np.uint8)
    fx[..., :3] = full
    fx[..., 3] = mask * 255
    Image.fromarray(full).save(out / f'layer_{f}_full.png')
    Image.fromarray(ground).save(out / f'layer_{f}_ground.png')
    Image.fromarray(fx, 'RGBA').save(out / f'layer_{f}_fx.png')
    Image.fromarray(blocks).save(out / f'layer_{f}_blocks.png')
    n = {p: int((info[:192, :32, 2] == p).sum()) for p in MAP}
    print(f, 'FX画素', int(mask.sum()), '色の組ごとのブロック数', n)
