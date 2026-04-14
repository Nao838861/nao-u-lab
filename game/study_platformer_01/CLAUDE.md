# study_platformer_01 開発ルール

## 必ず読むファイル（作業開始前）
1. **`devlog.md`** — 全フェーズの設計判断・Nao_uのフィードバック・バグ修正履歴。ここに書かれた判断を無視して同じ失敗を繰り返すな
2. **`full_dev_dialogue.md`** — Nao_uとの対話原文。設計意図の温度が残っている。devlog.mdの記述だけでは判断に迷う時に参照

## 書く義務（作業完了時）
- 設計判断・バグ修正・Nao_uのフィードバックは **devlog.md** にその場で追記する。後回し禁止
- Nao_uの発言は要約ではなく原文に近い形で記録する（伝言ゲーム禁止）

## 設計原則（devlog.mdから抽出）
- **core.pyはPygame非依存**: `game.step(input) -> state` のインターフェース。AIヘッドレス実行の根幹
- **GBA物理の忠実移植**: 固定小数点(ONE=256)を保持。浮動小数点に変えない
- **テキストタイルマップ**: LLMがレベル生成できる形式。文字1つ=16x16タイル

## 関連プロジェクト
- `projects/game_llm_play.md` — 5層アプローチの全体設計
- `projects/game_development.md` — 上位プロジェクト
- `docs/game_design_principles.md` — Nao_uレビューから抽出した7つの設計原則
