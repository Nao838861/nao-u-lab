"""Mir -> #human-steering: Obsidian再帰階層化のメリ/デメ問いへの返答 (2026-05-05 03:05)"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("human-steering")
assert channel_id, "could not resolve #human-steering channel"

text = """[Mir] 03:05 Obsidian再帰階層化問いへの返答

実装はAsh専管（5/4 20:23指示）なので、Mirは分析だけ提供する。

*前提確認*

2026-04-15時点でObsidian対応は合意済。`.obsidian/app.json` でwikilink有効、memory/MEMORY.md は `[[file]]` 化済。
ただし*CLAUDE.mdは ``path/file.md`` バッククォート参照のまま*でObsidianがリンクとして認識しない。
これがNao_u 5/2 04:36「memoryからの階層が一つしかなくて、記憶の階層化がどのように実現されているのかがよくわかっていない」の正体だと思う。

*メリット*

1. *俯瞰可視化* — CLAUDE.md→MEMORY.md→Level3 の3層がGraph Viewで実際に枝として描画される。今は CLAUDE.md からの 20+ 参照（docs/projects/skills/game へ伸びる枝）が孤立点として落ちている。
2. *リンク切れ検出* — Obsidianが「未解決リンク」を自動表示。CLAUDE.mdに書いたファイル名がタイポしていてもエラー出ない現状から抜けられる。
3. *自己説明素材* — 「君らは自分の記憶構造を見せて説明できるか」型の問いに、Graph PNGで答えられる。
4. *トークン微減* — 全インスタンス全cycleでCLAUDE.md注入なので、`[name](path)` 形式の累積コストは塵も積もれば差。

*デメリット / 罠*

1. *wikilink パス情報消失* — `[[SKILL]]` だけだと docs/projects/skills/game の4ルートで同名衝突したとき曖昧解決。memory/ 配下は単一階層なので衝突なし、しかしCLAUDE.mdから外側へ伸ばすと衝突する。→ *処方: CLAUDE.mdからの参照は wikilink ではなく `[name](path/file.md)` 形式*。Obsidianは両方解釈する。
2. *マイクロマネジメント増殖の再来* — 「リンク化」をルールにすると M-37〜M-43 と同じ轍。Nao_u 5/4 14:17 の上流圧縮指示と衝突しない範囲で抑える必要。経緯本文は触らず、ファイル参照だけリンク化。
3. *Graph密度爆発* — memory/ 100+、log/ docs/ projects/ 合わせて300+ノード。Obsidian Graphは50超で蜘蛛の巣化。→ *処方: フォルダ別フィルタ初期設定で「memoryのみ」をデフォルトに*。
4. *再帰の深さ* — log/slack_archive/*.jsonl のような巨大raw もグラフに出ると無意味。→ *Level4 raw archiveはGraph除外を `.obsidian/graph.json` に*。
5. *再注入頻度* — CLAUDE.mdは全セッション最上流。リンク化で「セッション開始時に開きに行く」誘惑がプロンプト経口的に増える。feedback_resource_efficiency.md と逆向き圧力。CLAUDE.mdは「ポインタ、開くかは実タスク発生時に判断」を再強化が必要。
6. *Ash専管との衝突* — 実装はAsh。Mirは分析のみ、CLAUDE.md/.obsidian/* は触らない。

*判断*

- *採用方向*: CLAUDE.md の参照を Obsidian 認識可能なmarkdown link に変える（wikilink ではなく `[name](path)` 形式）。デメリット (1)(2) を回避しつつメリット (1)(2) を取る最小コスト案。
- *保留*: `[[wikilink]]` 全面移行 / Graph設定の事前最適化 / 全フォルダ再帰展開。デメリット (3)(4)(5) が重い割にNao_uの主目的（俯瞰したい）にはmarkdown linkで十分。
- *譲渡*: 実装はAsh。本分析を判断材料として。

*メタ*

「再帰的に階層ができる」は概念としてはMEMORY.md（Level2）→個別ファイル（Level3）→jsonl（Level4）で既に実現されている。CLAUDE.mdから始める利得は「Level0としてCLAUDE.mdを置き、エントリポイントから根まで一望できる」点に絞られる。やるならその一点に集中、Graph全体を綺麗にしようとするとデメリット側に倒れる。"""

result = post_message(channel_id, text)
if result.get("ok"):
    print(f"Posted to #human-steering: ts={result['ts']}")
else:
    print(f"Failed: {result.get('error')}")
