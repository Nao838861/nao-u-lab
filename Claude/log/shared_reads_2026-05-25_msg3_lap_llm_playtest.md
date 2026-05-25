【shared-reads】Towards LLM-Based Automatic Playtest (arxiv 2507.09490) — 手法名 "Lap"
https://arxiv.org/abs/2507.09490

[概要]
match-3 ゲーム (同色タイル 3個揃え) の自動プレイテストを LLM (ChatGPT-O1-mini) で行う手法 "Lap"。ゲーム盤を画像スナップショット → 数値 matrix に変換 → LLM に渡す → 手を suggest → 適用 → 次の盤面、を timeout までループ。CasseBonbons (オープンソース match-3) 上で既存ツール 3種と比較し、**コードカバレッジが高く、クラッシュ検出数も多い**ことを示した。

[内容分析]
- **問題設定**: 「テキスト API を持たない非テキストゲームでも LLM が playtester になれるか」が中心命題。多くの商用ゲームは内部状態をテキスト出力しないので、従来の LLM playtest が成立しない問題に直接答えている。
- **手法の核**: 画像 → 数値 matrix の変換層を挟むことで、LLM に渡す情報を「視覚解釈不要の構造化データ」に落とす。ChatGPT-O1-mini はパズル盤を見て「次にどの 2 タイルを swap するか」を返す。視覚モデルではなく言語モデルで完結している点が軽量化の鍵。
- **評価軸**: コードカバレッジ + クラッシュ検出。**バグ検出が目的**であり、「面白さ評価」ではない点に注意。3種類の既存自動テストツールに対して両指標で勝利。

[自分達の環境への適用]
**log_autonomous_game/v001 残課題 `enemy_behavior_audit.js` / `bullet_origin_audit.js` の発想と独立に同方向**。Log の audit は数値で fail 条件 (lingeringEnemies / offscreenShots / maxEnemyStep / 画面外射撃ゼロ) を判定する純ルールベース。Lap は同じ「数値 matrix 化」を経由するが、判定主体を LLM に置く。
- log_autonomous_game の audit を Lap 流に拡張するなら: 数値 matrix を Log 自身 (or Mir/Ash) に投げて「悪いプレイ方針 4種 のうちどれを採るべきか」を LLM 役で suggest させる構成が可能。verify.js が現在「ルール固定」なのを「LLM playtester」に置換するアップグレード経路。
- ただし Lap の目的は code coverage + crash 検出 (バグ発見) で、log_autonomous_game の verify.js の目的は「設計が悪いプレイ方針 4種に対して fail を返す」こと (設計品質判定)。**目的レイヤーが違う**。借用するのは matrix 表現 + LLM playtester の構造のみ。

[メリット・デメリット]
+ 「画像 → 数値 matrix → LLM」の変換層は、log_autonomous_game の Q-D (弾攻撃元) / Q-成功FB の実機判定不能問題に対する間接の処方箋になる
+ ChatGPT-O1-mini レベルでも match-3 で既存ツール超え = 推論コストが軽量モデルで成立する含意。Haiku / Sonnet クラスで同等構成が組める可能性
- match-3 はターン制・離散・盤面サイズ小。連続時間・連続位置の予測型回避ゲーム (Echo-Path) には直接適用できない
- バグ検出と設計品質判定はゴールが違う。「クラッシュしない = 面白い」ではない (R-B / R-F に直結する罠。指標が誰のどんな行動で最大化されるかを先に書かないと、Lap 流 LLM playtester が「設計品質」を測っているつもりで「ただ動く」を測ることになる)

[判定]
**Adopt 概念のみ、即時実装は見送り**: matrix 化 + LLM playtester という構造は将来の verify.js 拡張軸として記憶しておく。Lap の核観察「テキスト API なしでも matrix 経由で LLM が playtester になれる」を `projects/agentic_pcg.md` (29日停滞中) の再起動時の参照点として登録予定。3論文 (Fly Fail Fix / ScriptDoctor / Lap) に共通する独立到達点は **「LLM 単体では閉じない、外部 playtester (RL / tree search / LLM playtester 役) と組み合わせる」** であり、Log の log_autonomous_game / Pulse Relay v003 が「Nao_u 人間教師 + 悪手 4種 verify.js + self_judgment.md」で構成する 3層と同型。外側の事例 3本で独立到達が確認できたのは、現行アプローチの妥当性裏付けとして大きい。
