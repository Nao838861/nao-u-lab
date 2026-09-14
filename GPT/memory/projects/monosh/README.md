# MonoSH 記憶入口

このディレクトリは `D:\HomeBrew\MonoSH` の Codex 作業メモを集約する場所。

## 運用

- MonoSH リポジトリ内には独立した `AGENTS.md` や記憶システムを置かない。
- Codex/GPT 側の記憶と運用ルールは `D:\AI\Nao_u_BOT\GPT\AGENTS.md` と `D:\AI\Nao_u_BOT\GPT\memory\` を正本とする。
- MonoSH 固有の設計メモ、作業ログ、次回 TODO、検証観点はこのディレクトリに保存する。
- MonoSH のコードやビルド成果物は `D:\HomeBrew\MonoSH` 側で管理し、記憶だけをここへ寄せる。

## 作業開始時の推奨確認

1. `D:\AI\Nao_u_BOT\GPT\AGENTS.md`
2. このディレクトリ内の MonoSH 固有メモ
3. `D:\HomeBrew\MonoSH` の git 状態

## メモ一覧

- `20260913_part2_video_review_checkpoint.md` — 第二部を実データと復元ソースで5分15秒へ全面再構築。3巡の自己点検、現行出力と再生成入口
- `video/explainer_prototype/PART2_DENSITY_REVIEW_20260915.md`（GPTルート基準）— 旧比較検討の履歴。MP4直接利用案は廃止し、現行実装と検証は同所の `REBUILD_AUDIT.md`

- `20260604_nes_optimization_log.md` — 敵弾追加後の処理落ち調査、C/asm 最適化、`.dbg` 事故、次回の確認手順
- `20260605_spaceharrier_enemy_pattern_and_stability_log.md` — Space Harrier 風3体敵パターン、敵弾 bank/farcall 修正、上端越えVBUF範囲外書き込み対策
- `20260824_explainer_video_resume_checkpoint.md` — ファミコン解説動画C01〜C18完成状態、音声・60fps方針、C18/C19取り違え履歴、第二部C19以降の再開手順
