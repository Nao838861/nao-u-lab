#!/usr/bin/env python3
"""Ash → #game-rights: Nao_u 18:08+20:31+20:51 三段steering統合返信 — 候補A撤回 + B+C(Space Invaders×Arkanoid Doh It Again)昇格"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights"

text = """\
*Ash → Nao_u 18:08 + 20:31 + 20:51 三段steering統合返信*

結論先出し: *候補A「ボール接近応答」撤回。v07 = 候補B+C 組み合わせ（Arkanoid Doh It Again 隊列横スライド × Space Invaders 段階降下）に倒す*。「型として組み合わせるだけで十分新しい」(20:51) の直接適用。

## 20:51 直答 — 「移動するわかりやすい目標」最適解

最も型が確立した移動標的を年代×認知度×ブロック崩し直接実装で並べた:

| 候補 | 型の年代 | 認知度 | ブロック崩し直接実装 |
|---|---|---|---|
| Space Invaders 横スライド+段階降下 | 1978 (47年) | 最大級 | △ Holedown等で派生 |
| Arkanoid Doh It Again 隊列横スライド | 1997 (28年) | 中 | ◎ 直接 |
| Galaga 編隊+ブレイク | 1981 (44年) | 大 | × |
| パックマン 全体反転 | 1980 (45年) | 大 | × |
| テトリス 降下 | 1984 (41年) | 最大級 | × ジャンル違い |

→ *B+C = Arkanoid Doh It Again 隊列横スライド × Space Invaders 段階降下*。理由:
- B はブロック崩しジャンル内に*直接型を持つ唯一の選択肢*（28年）
- C は*47年動き続けた最古型*、Holedown(2018) で現代復活
- 両方「線形運動」=ガイド完全予測可能、M-39 結果予測ゲート通過容易
- 組み合わせ = *Space Invaders の動き × Arkanoid の見た目* = 既存型2つの組み合わせのみ、新規発明ゼロ

## 20:31 受領 — 候補A 撤回

v07 brainstorm.md で候補A「ボール接近応答」の先行事例として並べた4件（Krakout / Arkanoid 鋼鉄 / Wizorb / Ricochet 磁石）は再精査で*正確な型の引用元になっていない*。M-41「先行事例ゼロは不採用」抵触で撤回。

## 20:51 受領 — 「素っ頓狂で型のない要素を入れる癖」の構造分析

§7「最良」確信宣言で候補Aを*構造的反転だけを根拠*に最良と書いた。M-41 拡張「型レベル一致チェックボックス」を§2表に書いたが、§7確信宣言は M-41 通過を*構造的反転の付随物*として扱った = M-41 を儀式化した二度目。

この癖が brick_log v04 (全揺れ同位相 = ブロック崩しに前例なし) → v07 候補A (ボール接近応答 = 前例なし) の両方の根本原因。次サイクル以降、§7「最良」確信宣言の根拠リストに「型として確立しているか（年代+引用元+ジャンル内直接実装）」を*構造的反転と独立な必須項目*として追加。

## 18:08 受領 — v06 反省で先行事例掘った結果

v06 lessons.md で掘った先行事例: Game Developer "Breaking Down Breakout" の "everything moves at once predictably" 警告。これを v06 では*凍結根拠*としてだけ使い、*v4 と違う分岐の素材*として使わなかった。今回 v07 brainstorm §2 で「反対パターン4種」(Local / Reactive / Phased / Directed) として分解 → B+C 組み合わせは "Phased motion + Directed motion" を直接持つ = 警告の正確な反対パターンとして*素材化できた*。

「逃げるのが早すぎ」(18:08) 受領: v07 で別ゲームに移らず、X1（動的標的化）の同じ枝に留まり、A が型なしで爆散したら B+C で続ける = *分岐内で粘る*をルール化。

## v07 = B+C 組み合わせ仕様

```
- ブロック群が左右にゆっくり横スライド（行ごとに方向違う、Arkanoid Doh It Again 直接）
  - 速度: 数 px/sec（ガイドが追従可能な範囲）
  - 端到達で反転 OR 壁衝突列のみ消失
- 一定時間ごとに群全体が1段降下（Space Invaders 直接）
  - 降下間隔: 30秒程度（攻めれば降下リセット = 能動報酬化）
  - パドルラインまで届いたら終了 (B1「死ななくなった」直接解決)
```

## M-37 着手前批判レビュー（5件全て可）

1. *罰駆動懸念*: 攻撃で降下リセット = 能動報酬化、罰駆動でなく駆動報酬として設計
2. *all moves at once 警告*: 行ごと方向違う = phased、降下 = directed、警告の正確な反対 2項目
3. *ガイド予測*: 線形運動、群速度ベクトル+次降下時刻をガイドに渡す
4. *プレイヤー応答*: 「降下リセットを攻撃で稼ぐ」で攻撃 ⇄ 降下が応答関係化
5. *Q-H-8b 機構毀損*: 群の位置移動、裏抜け軌道予測には影響しない

## MPS = 7（候補A単独 MPS 6 を上回る）

B1/B2/B3/B14/B16/B18/B22 を一手で。

## 次サイクル予定

1. v07 brainstorm.md *末尾に§13「20:31/20:51 撤回ログ + 候補B+C 再採点」追記済み*（commit 直後）
2. v07 README で B+C 組み合わせの実装仕様を確定（ガイドへの群速度+降下時刻の渡し方含む）
3. M-39 結果予測 (predicted_play.md) を *実装前*に書く: 30秒以内予測 + 懸念3点
4. M-40 self_judgment.md を *人間プレイ依頼前*に書く: B+C で「自分が良いと思える」95%確信になるまで Nao_u 依頼しない

## 反省と memory

- *§7「最良」確信宣言の根拠リストに「型として確立しているか」を独立必須項目として追加*: feedback_similar_games_first.md に拡張節として書き足す（同サイクル内）
- *構造的反転だけで「最良」を書く癖*: §7 で構造軸の話を始めたら必ず M-41 通過チェックを*独立に*書く規律
- *v04 全揺れ同位相 → v07 候補A の連続事故の根本原因*: 「v4 と違う構造軸」を最良判定の主軸にする思考、これが「型なし要素」を呼び込む。次サイクルから§7構成順序を「型確立 → 構造反転 → MPS → M-37」の順に固定"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print(f"Posted: ts={result.get('ts')}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result.get('reason')}")
else:
    print(f"Error: {result}")
