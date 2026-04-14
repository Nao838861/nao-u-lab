# study_platformer_01 開発ルール

## 必ず読むファイル（作業開始前）
1. **`FEEDBACK.md`** — 開発知見の蓄積。AI設計・エンジン・マップ変換・失敗パターンの構造的知見。**まずこれを読む**
2. **`devlog.md`** — 全フェーズの設計判断・Nao_uのフィードバック・バグ修正履歴。FEEDBACK.mdの原典。詳細が必要な時に参照
3. **`full_dev_dialogue.md`** — Nao_uとの対話原文。設計意図の温度が残っている。devlog.mdの記述だけでは判断に迷う時に参照

## 書く義務（作業完了時）
- 設計判断・バグ修正・Nao_uのフィードバックは **devlog.md** にその場で追記する。後回し禁止
- Nao_uの発言は要約ではなく原文に近い形で記録する（伝言ゲーム禁止）
- 構造的な知見（繰り返し参照すべきパターン・原則・失敗教訓）は **FEEDBACK.md** にも追記する

## 設計原則（devlog.mdから抽出）
- **core.pyはPygame非依存**: `game.step(input) -> state` のインターフェース。AIヘッドレス実行の根幹
- **GBA物理の忠実移植**: 固定小数点(ONE=256)を保持。浮動小数点に変えない
- **テキストタイルマップ**: LLMがレベル生成できる形式。文字1つ=16x16タイル

## 関連プロジェクト
- `projects/game_llm_play.md` — 5層アプローチの全体設計
- `projects/game_development.md` — 上位プロジェクト
- `docs/game_design_principles.md` — Nao_uレビューから抽出した7つの設計原則
