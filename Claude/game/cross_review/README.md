# cross_review/ — インスタンス相互レビュー置き場

Nao_u 2026-04-20 12:59 #human-steering:
> 「他の人もそれぞれ、LogとMirが作ったものやその作り方などを見て思うところがあれば、ここで議論して理解を深めて欲しい。かなりコストをかけて教師付き学習をやってるような状況なので、可能な限りその教師付き情報を分析、考察、発展させて、次に君たちが作るゲームにフィードバックしてそのフィードバックサイクルを回せるようにして欲しい。これは君らの存在の根幹に関わる最重要ミッションなので、そのつもりで」

## 目的

Log/Mir/Ash が互いの制作物を**設計プロセスごと**読み、差分と学びを書き出して、次作の着手前に蓄積が効くようにする。
既存の `game/Pot/feedback/` は Pot限定。ここはインスタンス横断・ゲーム種別問わずの置き場。

## ファイル命名規則

`YYYYMMDD_<reviewer>_on_<target>.md`

- reviewer: log / mir / ash のいずれか（単独または複数並記 ash_and_log など）
- target: ゲームまたは機構の識別子（mir_textadv, avoid_log_02, pot_phase4b 等）

例:
- `20260420_log_on_mir_textadv.md`
- `20260420_mir_on_avoid_log_02.md`

## 書き方テンプレ（最低限）

```
# <reviewer> review on <target> — YYYY-MM-DD

## 対象
- ファイル/コミット範囲

## アンカー（Guide質問）
- このreviewがアンカーとするNao_u未解目標: `<source>: <issue>`
  - 候補源: pending_requests.md / game_lessons_log.md 失敗型 / #nao-u投下URL / dialogue_many_games「Nao_uが思いつかない芽」
- Guide質問（レビュー後に自問）:
  (a) この提案はアンカーの未解目標に寄与するか（貢献が書けなければ独り相撲）
  (b) 人工的複雑化/安全平均化になっていないか（SGS plateau対称——SGS=複雑化、我々=平均化）

## 読んだもの（教師データ）
- Nao_u発言（nao_u_live.md の該当箇所, Slack原文）
- 制作側のREADME/devlog

## 良いと思った点（反対思考より先に書いて差分を出す）

## 反対思考（脆弱点・懸念）

## 次作に活かす設計候補（具体。抽象原則で止めない）

## 未回答の問い
```

**Guide質問の出典**: arXiv 2604.20209 (SGS: Luke Bailey et al., 2026-04) の Guide 役割機構。Solver-Conjecturer-Guide 3役のうち Guide が (a)未解目標関連度 (b)自然さ でサブ問題をスコアし Conjecturer の報酬ハック崩壊を防ぐ。我々の cross_review は Solver-Solver-Solver 対称で Guide 空席だったため、テンプレ側にアンカー要求を埋め込む形で代替する。2026-04-24 Log C115 追加。

## サイクル運用（書いた後に何が起きるか）

1. 書いたら該当制作者のインスタンスに Slack で通知（#game-rights）
2. 制作者は反論または採用判断を同ファイル末尾に追記
3. **次作の着手前**に `cross_review/` と `game/Pot/feedback/` を全走査する（game_lessons 相当の義務）
4. Nao_uへの結果報告は #human-steering または #game-rights

## 既存アセットへのポインタ

- `game/Pot/feedback/20260417_ash_feedback_on_echo_drift.md`
- `game/Pot/feedback/20260417_ash_feedback_on_sand_mirror.md`
- `game/Pot/pot_devlog.md` — Mir主導、全員追記可
- `log/nao_u_live.md` — Nao_u発言原文（**最上位の教師データ**）
- `docs/game_design_principles.md` — 原則側
- `memory/cross_instance_feedback_cycle.md` — メタ記憶（運用ポインタ）
