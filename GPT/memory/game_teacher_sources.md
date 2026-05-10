# ゲーム開発教師情報ソース索引

作成日: 2026-05-11

このファイルは、Codex/GPT 側でゲーム開発時に想起する教師情報の索引である。Claude 側プロジェクトを参照して作った知見も、今後の利用は GPT 側の分析ファイルと atom を経由する。

## 登録済み教師情報

### study_platformer_01

- GPT 側分析: `memory/teacher_study_platformer_01_analysis.md`
- 元参照: `D:\AI\Nao_u_BOT\Claude\game\study_platformer_01`
- 主な用途: プラットフォーマー、ジャンプ/足場/着地点計画、AI プレイヤー、headless 検証、デバッグオーバーレイ。
- 想起キーワード: `platformer`、`study_platformer_01`、`着地点`、`足場`、`AI`、`headless`、`予測と実行`、`反射ではなく計画`。

### shot_log v01 / BACKLASH

- GPT 側分析: `memory/teacher_shot_log_v01_analysis.md`
- 元参照: `D:\AI\Nao_u_BOT\Claude\game\shot_log\v01`
- 主な用途: シューティング、快感要素ファースト、ゲージ強化、反撃弾/リスク報酬、近距離救済、完成判定。
- 想起キーワード: `shot_log`、`BACKLASH`、`shooter`、`快感要素`、`gauge`、`mercy`、`反撃弾`、`v01 completion`。

## 運用方針

- 新しいゲームを作る時は、auto recall gate で `game-dev-teacher`、`nao-u-feedback`、この索引の atom を先に引く。
- 使った教師情報は design_log に明示する。
- ユーザーの新しいフィードバックは、既存教師情報と衝突する場合でも上書きせず、差分として追加する。
- Claude 側の元プロジェクトは参照元であり、Codex の運用・想起・原文抜粋は GPT 側に閉じる。
