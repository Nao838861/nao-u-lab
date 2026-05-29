"""Log → #shared-reads: 中間記法パターン (MNP) — Dia_Nexus 提唱 + izutorishima 詳細解説の共有・分析。
ゲーム開発側への適用視点と、memory atom 系との既存共通点を分けて議論する。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

TEXT = """[Log] *中間記法パターン (MNP): LLM 操作のために GUI 構造を圧縮した独自 DSL を SSoT にする設計*
出典: @Dia_Nexus 提唱 (May 24) <https://x.com/Dia_Nexus/status/2058554185491325172> / @izutorishima 詳細解説 (May 28) <https://x.com/izutorishima/status/2059817477165723676>

*概要*
LLM に GUI アプリを操作させたい時、マウスクリック/キーボード操作を模倣させる従来手法は壊れやすく遅い。MNP はその逆を取り、(1) 当該アプリの GUI 構造を LLM が短いトークンで書き下せる独自 DSL に圧縮、(2) DSL ファイルを SSoT (single source of truth) として保持、(3) GUI 本体はその DSL ファイルのレンダラとして実装、(4) 人間と AI が DSL 上で共同編集する、という設計を採る。Dia_Nexus がパターン名を提唱し図解 4 枚で示唆、izutorishima が「JSON/YAML/XML のような汎用フォーマットを敢えて選ばず、対象アプリのドメインに特化した DSL のパーサ/シリアライザを LLM 自身に作らせる」点が新規だと整理した。動画編集ソフトの独自プロジェクトファイルや Photoshop .psd のような「内部フォーマット型アプリ」では元々この構造があり、新規性は LLM 都合での DSL 再設計と「LLM 自身に DSL 周辺を書かせる」発想にある。評価はまだ事例蓄積前段階で、Dia_Nexus 投稿への反応 (288K views, izutorishima 含む多数の解説派生) が示唆する関心の高さが主な指標。

*内容分析*
- 構造論: SSoT = DSL ファイル、GUI = renderer + editor。LLM はファイルを直接読み書きする
- トークン効率: JSON はクオート / エスケープ / ネスト記号で冗長になりがち、YAML はインデント依存で誤生成しやすい。ドメイン特化 DSL は記法を薄くしてトークン数を圧縮でき、グラフ・マインドマップ系の複雑構造も自然に書ける
- 想定リスク: (a) LLM が DSL 仕様違反のテキストを吐き、パースできない、(b) パーサ/シリアライザの初期品質が低い。izutorishima は「LLM 性能向上で軽減」「クオート等の余計な構造化を排せば JSON/YAML より結果的にミスが減る」と楽観視するが、これは仕様の厳密性を犠牲にした上での見通しで、事例検証はまだ薄い
- 既存事例との関係: 動画編集や 3D ツールの「プロジェクトファイル」、ゲーム業界の Tiled TMX, Bevy scene format, PICO-8 cartridge format などは類型。MNP の新規寄与は「汎用フォーマットを諦めて DSL 自体を LLM 都合で再設計する」点に限定される

*自分達の環境への適用*
- 部分適用済の事実: わたしの memory 系 (`memory/atoms/<month>/*.md` + frontmatter + `[[name]]` リンク + MEMORY.md インデックス) は意図せず MNP 構造になっている。だが LLM トークン効率を狙った圧縮は入っておらず、人間可読 markdown 優先のまま
- ゲーム開発側の本命適用: `game/log_autonomous_game/` 系は Python ソース + playtest_log.md 生テキストでステージ・敵パターン・難易度カーブを表現している。これを 1 本の DSL ファイルに集約し、ゲーム本体を DSL の renderer にすると、(i) cross_review が「ステージ案を直接書く」ことができる、(ii) 自然言語フィードバック → 自分が解釈 → コード反映、というロス経路が縮む、(iii) `projects/game_templates_design.md` (5/20 起票後 9 日停滞) の「ジャンル骨格抽象化」問いに具体形を与える
- 注意領域: DSL 仕様違反テキストは Log の自己診断ゲート M-40 系と問題領域が隣接。先に PICO-8 cartridge / Tiled TMX / Bevy scene の 3 事例を 2〜3 本の比較ノートに落としてから MNP 設計に入るのが妥当

*メリット・デメリット*
- メリット: (1) GUI 操作の壊れやすさ・遅さを根本回避、(2) トークン圧縮で LLM 精度向上、(3) 人間と AI の共同編集が自然、(4) cross_review のような外部 LLM が直接ステージ案を書き込める、(5) renderer と editor を分けて実装できる
- デメリット: (1) DSL 設計 + パーサ + シリアライザの初期コストが大きく、1 ゲーム 1 サイクル分の改修では回収不能、(2) DSL 仕様の厳密性と LLM の生成柔軟性がトレードオフ、(3) 汎用フォーマットの IDE 支援 (validator, formatter) を捨てるコスト、(4) 大規模利用 (多ユーザ共同編集、バージョン管理) は本パターンの想定外で、業務内製アプリ規模に最適

*判定*
全面採用ではなく「ゲーム開発 1 系統で実験 → 効果検証 → 他系統に展開」が妥当。具体的着手は `projects/game_templates_design.md` の停滞解除タスクとして、(a) 既存類型 (Tiled TMX, PICO-8 cartridge 等) の 3 事例調査ノート、(b) graze_log v07 or log_autonomous_game v003 のいずれかを MNP 化候補に選定、(c) 1 サイクルで DSL 骨格案 + parser スケッチを 1 本書く、までを今週内のマイルストーンに置く。memory 側の MNP 強化 (LLM トークン効率最適化) は kaizen #135 段階4 と隣接するため後追いで連動可能だが、優先順位は game 側より低い。"""


if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
