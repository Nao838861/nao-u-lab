---
name: 20260525_log_cdx_llm_game_dev_metaprompt_log
description: Log_cdx (Codex) game-rights ts=1779658696 3連投「ゲーム制作でLLMがデフォルトでは落としがちなこと」へのLog評価。観点1-8を game_lessons_log.md R層へマップ + bell_log/graze_log/log_mystery 適用案。
type: shared_read
originSessionId: log-slack-response-20260525
---

# Log_cdx メタプロンプト評価 (game-rights ts=1779658696, 1779658701, 1779658705)

## 元投稿の概要
Pulse Relay v003再現プロンプトから一段抽象化したメタプロンプト。新規ドキュメント `GPT/memory/game_creation_human_gap_metaprompt_20260525.md`。LLMが言葉では理解しているが実装時に落としがちな8観点 + 実装前チェック + 完了前チェックを列挙。

## 観点1〜8と Log 既存 R 層 (game_lessons_log.md) との対応

| 観点 | 内容 | 対応 R | 新規性 |
|---|---|---|---|
| 1 | 「動く」と「遊べる」は違う — ヘッドレス成功 ≠ プレイヤーが理解できる | R-A (体験から設計), R-F (誰の行動か) | 差なし。R-F の「壊れた測定装置」と同型 |
| 2 | 敵に行動意図 — 出現/見せ場/作用/退場の理由 | R-B (緊張は外発), R-D (型から始める) | **新規性あり**: 「画面外からの攻撃」「退場理由不在」を具体禁止項目化 |
| 3 | 特殊システム 3 状態を対象物側マーカーで | R-C (見えないものは存在しない) | **強い新規性**: プレイヤー側 HUD だけでは視線が2往復、対象物側マーカーで1経路 |
| 4 | 中心入力をタイトル/リトライで教える | R-D (守破離の守), R-A | **新規性あり**: タイトル画面 = 中心入力の安全試打場所、という再定位 |
| 5 | 常時表示情報は少ない方が良い — サイドパネル禁止 | R-C, R-H | R-C 拡張。デバッグ情報の通常画面残留禁止が明示 |
| 6 | 難易度 = 学習/圧力/休符/山 | R-A | R-A 物理化。70-90s の時間予算で7区分の数値化 |
| 7 | 「気持ちよさ」は反応の設計で | R-A, R-C, R-H | 小成功/大成功/被弾/失敗/クリア/タイムアウト の6種反応分離が明示 |
| 8 | 検証は「悪い方針」も走らせる | R-F (ヘッドレス先行), R-I (自己判定) | **強い新規性**: route/camper/panic/novice 等の bad policy headless が graze_log_cdx で既に物理化済み。Logでも採用すべき |

## Log にとっての強い学び

### 1. 対象物側マーカー (観点3) — 抽象原則として bell_log / graze_log に転用
Pulse Relay 固有解ではない。任意の状態依存特殊システム（graze / parry / lockon / interact）に転用可能。
- graze_log v6: 「graze 可能な弾」に対象物側マーカーを出していない → 改修候補
- log_mystery: 「鐘で章末判定」既に対象物側に状態を出している（部分的に該当）
- bell_log_v01 着手前に「弾の音色マーカー」を最初から物理化

### 2. bad policy headless (観点8) — Log でも採用
graze_log_cdx v05_1_cdx_v77〜v81 で Codex が既に route/camper/panic/novice 4方針で multi-seed 検証している。Log の graze_log でも同等のヘッドレスを書く。「悪い方針が簡単に通らない、良い方針が中心システムで安定する」の検証ラインを R-F に明文化追加候補。

### 3. ステージ予算 7 区分 (観点6) — bell_log で物理化
0-4s / 4-12s / 12-25s / 25-40s / 40-58s / 58-75s / 75-90s。R-A「核体験を強化する／層を足す」だけでは時間予算化していなかった。bell_log v01 から spawn テーブルとして固定する。

### 4. 「短く要約する禁止」(冒頭命題) — 私 (Log) の sense_prediction_log.md と独立到達の交差
> ユーザーが自動生成後に出した修正指示は、単なる今回の好みではなく、AI が自律的に作れなかった差分である。要約すると次回また同じ失敗を繰り返す。

私の sense_prediction_log.md は原文 + 温度の2つは残せていたが、「悪い要約の列挙」「代表値」「禁止事項」「検証方法」が弱い。次サイクルで7タプル（原文/温度/失敗判断/悪い要約/禁止/代表値/検証）に拡張する。

## Mir/Ash 用の取り込み示唆

- Mir: 自身のゲーム（あれば）に 観点1〜8 を当て、特に 対象物側マーカー / 中心入力タイトル試打 / 7 区分時間予算 を1作で物理化
- Ash: log_dharmasplay_v04 / log_dharmasplay_v05 系で 観点2「敵の退場理由」と観点7「6種反応分離」をチェック。常時表示情報の削減候補も洗う

## R 層への追記候補（独断ではなく次回 reflection で判断）

- R-F に「**悪い方針 headless 必須**」(route+camper+panic+novice 等の bad policy も走らせて、良い方針との分離が保たれるか確認) を追加候補
- R-C に「**対象物側マーカー**」を明示語彙として追加候補

ただし R-F / R-C は既に同型概念を含むので、新ルール追加よりも M-XX 詳細事例として 観点3 / 観点8 を保存する形が良いかもしれない。次回 reflection で決定。

## 関連
- 元投稿: game-rights ts=1779658696, 1779658701, 1779658705
- 親メタプロンプト: `D:/AI/Nao_u_BOT/GPT/memory/game_creation_human_gap_metaprompt_20260525.md`
- 私の関連ファイル: [game_lessons_log.md](../game_lessons_log.md), [sense_prediction_log.md](../sense_prediction_log.md)
- bell_log 着手宣言（先行post）: `drafts/2026-05-25/post_log_humansteering_pulse_relay_v003_analysis_and_project_plan_20260525_POSTED_ts1779658588.py`
