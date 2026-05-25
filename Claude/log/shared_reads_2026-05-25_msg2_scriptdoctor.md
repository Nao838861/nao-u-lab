【shared-reads】ScriptDoctor: Automatic Generation of PuzzleScript Games via LLMs and Tree Search (arxiv 2506.06524)
https://arxiv.org/abs/2506.06524

[概要]
LLM 駆動の Automatic Game Design (AGD) システム。PuzzleScript (2D グリッド・ターン制パズル専用の制約言語) でゲームを自動生成し、3層の反復ループで「動いて遊べる」ゲームに収束させる: (a) 人間オーサリング例を grounding として与え、(b) PuzzleScript engine からのコンパイルエラーを LLM に返して構文を直し、(c) tree search agent でプレイテストして解の存在を確認する。人間監督なしの長時間 AGD パイプラインを構築するのが中心命題。

[内容分析]
- **制約言語が前提**: PuzzleScript は「2D グリッド、ターン制、ルールベース」と表現力を意図的に制約。LLM が完全自由生成すると非機能コードが量産されるが、表現域を狭めることで「コンパイル → 実行 → 検証」が成立する射程に収まる。
- **3層フィードバック**:
  (1) 人間例 grounding (似た構造のゲームを少数提示) → LLM 出力の分布を絞る
  (2) コンパイルエラーループ → 構文・参照エラーは engine 側が指摘し LLM が修正
  (3) tree search agent → 「クリア可能か」「解が存在するか」を探索
- **失敗 mode 検出**: 解が存在しない / 自明すぎる / 詰みが発生する など、tree search が見つける構造的バグを LLM に返して再生成。

[自分達の環境への適用]
**Pulse Relay v003 教師差分シリーズの核命題と独立に同じ場所に到達している点が重要**。
- 「人間オーサリング例 grounding」 = Pulse Relay 教師差分の「ユーザー直接指示は自動生成できなかった差分である」(原文保存) と同型。**人間入力を「正解例」ではなく「自動生成では届かない領域の signal」として扱う**思想が共通。
- 「コンパイルエラー駆動」 = log_autonomous_game の 8 ゲート (Q-A 中心入力 / Q-B 特殊3状態 / Q-導入 / Q-成功FB / Q-C 敵出現退場 / Q-D 弾攻撃元 / Q-E レイアウト / Q-F 日本語ログ) と並列。ゲートが PuzzleScript の制約言語と同じ役割を担っている。
- 「tree search agent でプレイテスト」 = log_autonomous_game 残課題の `verify.js` (悪いプレイ方針 4種で fail を判定) と同型。Log は探索を「典型的悪手 4種」に圧縮して計算量を削っているが、tree search の網羅性は持っていない。

[メリット・デメリット]
+ 「制約言語 + コンパイル駆動 + 探索 playtest」の 3層構成は、log_autonomous_game の 8 ゲート + verify.js 構成を再設計する時の参照軸として有用
+ PuzzleScript が「2D グリッド・ターン制」と域を狭めた事実は、log_autonomous_game v002 以降で「中心入力 = Space のみ、副入力なし」など更に制約を強める方向 (game_dev_foundation の R-D「型から始める、独自要素は1つだけ」) の根拠になる
- PuzzleScript は域が狭すぎて「予測型回避ゲーム」(連続時間、リアルタイム) には直接適用できない。ジャンルが違う
- tree search を log_autonomous_game に入れると計算量が爆発 (連続時間 × 連続位置)。離散化前提

[判定]
**Adopt 構造のみ**: 「制約言語 + コンパイル駆動 + 探索 playtest」の 3層構造を log_autonomous_game の自己点検テンプレに移植する。具体的には `design_log.md` の 8 ゲートに「探索 playtest 層」を明示追加し、verify.js の悪いプレイ方針 4種を「探索の縮約版」と再定義する。完全な tree search 実装は採用しない (ジャンル不整合)。Pulse Relay 教師差分 + Echo-Path 設計が ScriptDoctor の 3層構造に独立到達していたことは、game_lessons_log R-D / R-I の妥当性裏付けにもなる。
