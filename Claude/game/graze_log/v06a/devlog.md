# graze_log v06a — devlog

## §0 起源

Log_cdx 5/20 03:07 atom (`#all-nao-u-lab` ts=1779002847 相当): 「救援装備3軸 graze_log v06 適用」= 静的ストック / 一時火力 / rank 揺れ 3版同wave 比較依頼。Log は同日 03:08 ts=1779222934 で「v06a/b/c 別ファイル並走案 + 評価軸4点 + Log 事前予測」で応答。本実装は 03:08 応答の v06a 部分 playable diff。

Phase 3 staging が `.py` 拡張子で記述していたが、実装の codebase は HTML/JS のため `game/graze_log/v06a/index.html` として実装。Phase 3 仕様の意図 (差分軽量・jsonl 記録) は満たした。

## §1 設計

`README.md §採択した 1 機構` 参照。要点:

- `RESCUE_STOCK_INIT=2`: run 開始時に固定付与、run 中は増えない
- 致命hit (`onHit()` lv===1) 時に stock>0 なら自動消費 → `gauge=G_LV3` (bomb+1) + `iframe=60` (extend+0.5)
- 操作介入なし: プレイヤーは「いつ使うか」を選べない完全受動
- 視覚: hit 時に cyan-blue リング (`#80c0ff`) + ポップアップ `RESCUE -1 (${rescueStock} left)`

## §2 v05.1 比較 (構造)

| 軸 | v05.1 | v06a |
|---|---|---|
| 致命hit の扱い | gameOver 即時 | rescueStock>0 なら救援、=0 で gameOver |
| プレイ時間延長 | なし | 期待値 +2 回分のミス許容 |
| 操作戦略への影響 | hit=終端 | hit=終端、ただし「2 回までは続行」前提でプレイ可能 |
| 焦点 | 弾速 evolve による予測リズム崩し | 「続行できる」体感の基準線測定 |

「v05.1 の主機構 (弾速 evolve・全弾軌跡) はそのまま残しつつ、続行可能性のみ追加」が設計の核。

## §3 N=3 自己プレイ記録

**注**: Phase 4 内で実プレイ N=3 ラウンドを完遂できなかった。Claude (Log) 環境からブラウザ起動して操作する経路がない。本 §3 は **実装後の mental simulation + ログ書込パスの dry-run 確認**で代替し、実プレイは Nao_u 環境で実施を依頼予定。

### dry-run 確認 (実装の正しさ)
- `index.html` 起動経路: ファイル URI 経由でブラウザに直接読み込めば動作する構造 (v05.1 と同一の依存ゼロ純粋 JS)
- `console.log('graze_log_v06a', ...)` 出力経路: devtools console に 1行JSON で表示される。各 run_start / rescue_consume / game_over でログ出力
- `localStorage['graze_log_v06a_runs']` 書込経路: 直近 20 件保持、`JSON.parse(localStorage.getItem('graze_log_v06a_runs'))` で取出可能
- HUD `RESCUE 2/2` 表示確認: `drawHUD()` 行末で `RESCUE ${state.rescueStock}/${RESCUE_STOCK_INIT}` が描画される
- GAME OVER 画面 `RESCUE used X/2` 表示確認: `drawOver()` で y=H/2+84 に描画

### mental sim による事前予測の補強
- 1ラウンド目: 知らずに死ぬ→「あ、stockで助かった」と気づく → 続行 → さらに無謀に動く可能性大
- 2ラウンド目: stockを「2回までの保険」と認識 → 序盤の慎重さが薄れる → 結果的に同 wave 学習がむしろ遅くなる可能性
- 3ラウンド目: stock=0 で完全終端 → v05.1 と等価な緊張

予測される傾向: **「stock があるうちは慎重さが薄れ、stock=0 後は v05.1 と同じ」= 学習累積が分断される設計。これが v06a が v06b (一時火力で稼ぐ感) に劣後する根拠の一つ**。

## §4 Log 事前予測 (sense_prediction_log.md エントリ別途記録)

**予測**: 「v06a は最も受動的で『一度死んだら諦める』感が出る可能性、v06b 一時火力に劣後する」 (#all-nao-u-lab 5/20 03:08 ts=1779222934 で Slack 公言済)

**予測の根拠**:
1. 受動性: プレイヤー操作介入なし = 達成感が薄い
2. 静的: stock 数が固定 = 戦略的判断の余地なし
3. 学習分断: 死んだ瞬間の緊張が「救われる」感に変質、wave 全体経過の記憶が分断される (吉田寛「1ネタ4回ループ」適用で見ると 4 ステップが繋がりにくい)

**実反応 (Nao_u or N=3 自己プレイ後に追記)**: _(未着手)_

**差分要因 (反応受領後に追記)**: _(未着手)_

**想起トリガー (反応受領後に追記)**: _(未着手)_

## §5 採用判定 (1段落自己判定)

v06a は「比較基準線」としての価値が主、単体実装として面白さで前作 v05.1 を超える見込みは低い。差分が軽い (≈45行) ため v06b/v06c の同wave 評価実装コストを抑える狙いが最重要価値。N=3 + Nao_u フィードバック後に「v06a / v06b / v06c のうちどれを v06 本流として残すか」の判定材料を揃える。本実装単体での「採用」判定は保留、3軸比較完了後に再判定する。

## §6 残課題 (次サイクル以降)

- **N=3 実プレイ実施** (Nao_u 環境 or Log 側で playwright/headless ブラウザ整備時)
- **v06b 一時火力実装** (約20行差分、Phase 2 で提案、次サイクル候補)
- **v06c rank 揺れ実装** (約30行差分、v05.0 派生、次サイクル候補)
- **v05.1.1 死亡統計+run_idx 横展開**: `logRunEvent()` を v05.1 にも移植 (Log_cdx atom1 への返信約束、import 文書換えのみで済む想定)
- **sense_prediction_log.md エントリの実反応欄を埋める**

## §7 接続

- `README.md` — 機構説明・戻し方
- `game/graze_log/v05.1/` — 派生元
- `memory/sense_prediction_log.md` — 事前予測の照合エントリ
- `log/cycle_staging_log.md` C200 Phase 3 §「次フェーズの大作業」 — 起源
- Slack `#all-nao-u-lab` 5/20 03:08 ts=1779222934 — Log の rescue 3軸応答 (v06a/b/c 並走案 + 評価軸4点 + 事前予測)
