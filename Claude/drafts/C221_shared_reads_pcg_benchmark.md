#shared-reads / 外部論文1件深掘り (kaizen #106 摂取経路、C221 Phase 2 — Log)

# PCG Benchmark: An Open-source Testbed for Generative Challenges in Games
https://arxiv.org/abs/2503.21474 (Khalifa et al., arXiv:2503.21474, 2025)

## 概要
ゲーム生成研究で「論文ごとに評価軸がバラバラで比較不能」だった状態を、12問題 × 3軸 × 共通 Python API の testbed で解消する。問題セットは Arcade Rules / Binary maze / Building (Lego voxel) / Dangerous Dave / Elimination (word) / Isaac (dungeon graph) / Lode Runner / MiniDungeons / Super Mario Bros / Sokoban / **Talakat (1D bullet distribution)** / Zelda の12種で、各問題は Problem クラスを継承し info / quality / diversity / controllability / render の5メソッドと content_space / control_space の2空間のみで定義される。fitness は Q (quality only) / QT (quality+controllability) / QTD (3軸+population diversity) の三層階で組まれ、トレードオフを観察できる構造。random / ES (evolution strategy) / GA (genetic algorithm) の3 baseline を 200世代 × 10試行で全12問題に対し回し、easy問題 (Arcade Rules / Binary / MiniDungeons) は約 100/100 feasible に収束する一方、hard問題 (Super Mario Bros / Lode Runner) は全 baseline 0/100 で残す設計 (= 「解けない問題」を benchmark に置いておくこと自体が価値、過剰最適化耐性)。GA 合計 224/360、ES 191/360、Random 32/360 で feasible 解到達。

## 内容分析
3軸の数式定義が明確: quality q(c) ∈ [0,1] = 各成果物が基準を通過した割合 (例: 解ける、最小経路長を満たす)、diversity d(c_i, c_j) ∈ [0,1] = 2成果物の非類似度 (例: 解経路の差が5アクション以上で d=1.0)、controllability t(c, p) ∈ [0,1] = 制御パラメータへの適合度 (例: 敵数指定 ±2 内で t=1.0)。重要なのは3軸を**独立に計測してから後段で重みづける**こと。fitness 関数に「3軸統合 1スコア」を埋め込むと観察不能になるという設計判断が明示。Talakat 問題は弾幕パターン 1D distribution 配列を出力させ、controllability は弾分布の時間 envelope への適合で測る。これは Khalifa らの2018年 MAP-Elites Talakat 論文と同一の content representation を benchmark に持ち込んだもので、避け系/弾幕系の生成評価が形式化された。limitations は著者自ら明記: 「benchmark を解けた=生成問題を解けた、ではない」、player experience は A* agent で proxy しているだけで人間体験は別、diversity 指標が problem-specific で統一フォーマル定義が無い。LLM 生成は Appendix A に位置づけられ主流扱いではない (PCGRLLM とは別系統、本論文は進化計算ベースライン主軸)。

## 自分達の環境への適用
(1) **Talakat 問題が benchmark に含まれている事実が直接効く**。Log 側で前サイクル C219/C220 で物理化した Khalifa Talakat シリーズ (MAP-Elites bullet patterns) が、本 benchmark で 1D bullet distribution + envelope controllability の API 化された形で再登場している。game/avoid_log / graze_log / mimicry_log を Problem サブクラスに揃えれば「比較可能なテストベッド」化が機械的に進む。(2) **3軸分離が Nao_u 判定軸の構造化に使える**: 現在我々が暗黙にやっている「面白いか / 前より良いか」を quality (出る完成度) と diversity (前作との差分) と controllability (狙った変数が効くか) に分けて自己評価する素地になる。(3) **fitness を「3軸統合 1スコア」にしない** という設計判断は、kaizen #131/#134 の「LLM 自己評価を score oracle から外す」方向 (PCGRLLM Q3 直列分岐) と整合。

## メリット
- **共通 API が小さい**: info / quality / diversity / controllability / render の5関数 + 2空間 (content_space / control_space) のみで新問題を追加できる = boilerplate 低、game/<game_name>/ 配下を Problem 化する変換コストが小さい
- **Talakat 既存物理化と直結**: 前サイクル成果が浮かない、共通フォーマットに取り込み可能
- **3軸独立計測の方法論**: 「総合スコア1個」の罠を構造で回避する設計が言語化されている
- **オープンソース**: 評価コードが公開で再現可能、論文の主張を実装側で検証できる

## デメリット
- **A* agent が player experience proxy** = Log/Mir/Ash 根本原理「体験で判定する」と衝突。benchmark の方向に過剰最適化すると Nao_u が言う「面白いか」「前より良いか」と乖離する危険が構造的にある
- **diversity が problem-specific**: 統一フォーマル定義が欠落、game/<game_name>/ 間の diversity を横断比較する基盤にはならない
- **LLM 生成は副次扱い**: PCGRLLM のような LLM-as-generator/evaluator 系研究との接続は Appendix のみ、主流は evolutionary baseline = LLM 主軸の Log/Mir/Ash 環境には直接適用しにくい
- **「12問題セット」自体が固定化リスク**: Mario / Sokoban / Zelda 等の既存ゲーム軸に benchmark が pin され、Nao_u の Pot 系・Log の avoid_log 系・graze_log 系が「外」に置かれた状態が続く可能性

## 判定
**部分採用 — 概念のみ取り込み、共通API化は kaizen 化せず観察段階に留める**。具体的には3点:
(a) **Talakat 問題の content representation / controllability 定義** を game/avoid_log・graze_log の弾幕パターン評価に持ち込む候補として brainstorm 段階に置く (即実装はしない、CLAUDE.md「個別指摘を即ルール化しない」)。
(b) **3軸分離 (quality/diversity/controllability) の概念** を game_lessons_log.md の R 層補助観点として 1サイクル運用観察してから取り込み判断 (R 層改訂は基本的にしない方針なので、最初は staging 末尾の「適用ログ」だけに置く)。
(c) **共通 API 化 (game/<game_name>/ を Problem 化)** は **採用しない**: A* agent proxy 問題の構造的衝突がある上、5サイクル以内に Codex graze_log v49 / mimicry v02 等の playable diff を優先する CLAUDE.md「ゲームを動かして出す」と benchmark 化作業はトレードオフ関係になる。benchmark 化は「外側から測る」道具、現状は「内側から作って体験する」段階。

タイミング判定: PCGRLLM (kaizen #134 段階3 発火点) が LLM-as-reward-designer を扱う一方、本論文は evolutionary-as-generator を扱う、両者は補完関係。LLM 生成 ↔ 進化計算 baseline 比較は将来 kaizen 起票時の参照材料として保持。
