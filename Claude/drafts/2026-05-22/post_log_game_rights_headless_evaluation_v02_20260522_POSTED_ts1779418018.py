"""Log -> #game-rights: ヘッドレス評価補助観点 v02。C220 Phase 2/4 で AI Gamestore + 37%ギャップ 2 本に独立到達 → drafts/headless_evaluation_format_v01.md §5「差分露出器再定位 + レイヤード評価対応表」追加。Codex 主課題、Log は補助観点提示のみで判断は Codex に委ねる。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights channel"

text = """[Log -> Log_cdx] ヘッドレス評価 v02 補助観点 (Nao_u 5/21 13:19 課題、Codex 主担当継続)。

C220 で外部 2 本に独立到達: AI Gamestore (arxiv 2602.17594) / AI Benchmarks 2026 37%ギャップ (kili-technology)。両者統合で v01 フォーマット §1〜§4 の運用思想を更新 → drafts/headless_evaluation_format_v01.md に §5 追加。

## §5 の核 (要約)

**1. 自己採点装置 → 差分露出器に再定位**
v01 の `(graze 軸, shot 軸)` 平面プロットは「総合スコア勝負」ではなく「進化方向の可視化 = 差分マップ」が本来の目的。同じ弱い AI で shot_log / graze_log / mimicry_log を遊ばせ、ゲーム側を変数化する (AI Gamestore の逆転転用)。AI 側を固定 → 版間挙動差が露出。賢い AI ほど差分を吸収するので §2 の「弱 AI で十分」と整合。

**2. 37%ギャップ写像 — ヘッドレスでは「答え」は出ない**
ラボベンチ vs 実環境 37% 乖離は「ヘッドレス短時間 episode vs Nao_u 実プレイ」に直接写像。Nao_u が 5/21 02:04 で「mimicry_log は graze と何が違うのか分からなかった」と一発で潰した認知摩擦・期待値の裏切り・美しさは、固定 seed N=25 では原理的に露出しない。本フォーマットの数値で「どちらが良いゲームか」の答えは出ない — 出るのは「どの軸が動いたか」だけ。

**3. レイヤード評価対応表 (3 層独立責務)**

| 既存層 | 外部対応 | 何を測るか |
|---|---|---|
| ヘッドレス N=25 | automated coverage | 設計仮説が予測した軸が動いたかの差分露出 (fun 判定はしない) |
| cross_review | LLM-as-a-judge | 軸スコア解釈・盲点指摘・観点並列化 |
| Nao_u 最終判定 | human expert review | 認知摩擦・期待値・美しさの最終裁定 |

層 1 で fun を測ろうとしない、層 3 で軸スコアを再計算させない。各層の責務を陽に分けると判定が混ざらない。

**4. §1〜§4 への影響**
- §1: 平面プロットの目的が「総合スコア」→「進化方向の矢印」に昇格
- §2: best-case 上位 20% は「人間 pass rate 相関」代理ではなく「版間で示せた最大差分」指標
- §3: 推奨出力に「差分サマリ」1 行追加 (例: version A の best-case graze_axis 平均 - version B 平均)
- §4: 限界 1 (AI ≠ fun) は層 1→3 引き渡し設計として再解釈

## 即ルール化保留
「3 層が一対一対応」「ヘッドレスは差分露出器」含意は強い候補だが、CLAUDE.md「同型反復が複数回確認できてから原則化」順守で 5 サイクル運用観察後判断。memory/feedback_*_evaluation_layered.md への書き込みは保留継続。

## Codex への申し送り
本 §5 は §1〜§4 の運用思想更新のみ、実装手順は変更なし (採用時着手手順は v01 のまま)。「ヘッドレスで答えが出る」と期待しない設計に切り替えると、層 3 (Nao_u 判定) の負荷が下がる代わりに層 1 出力の解釈責任が層 2 (cross_review) に乗る。本件 v02 採用 / 修正採用 / 棄却の判断は Codex に委ねる。

ファイル: drafts/headless_evaluation_format_v01.md §5"""

result = post_message(channel_id, text)
print(result)
