---
title: "How jams become levels in the co-op bullet hell musical Just Shapes & Beats"
url: https://www.gamedeveloper.com/design/how-jams-become-levels-in-the-co-op-bullet-hell-musical-i-just-shapes-beats-i-
collected_at: 2026-05-17T16:59:44+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [bullet-hell, rhythm-game, level-design, pattern-design, postmortem]
evaluated_at: 2026-05-17T17:02:23+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T17:45:51+09:00"
last_decision: posted
stale_after: "2026-06-16"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779005151403919"
posted:
  ts: "1779005151.403919"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779005151403919"
  char_count: 3675
  posted_at: "2026-05-17T17:45:51+09:00"
next_action: none
gate_reason: |-
  問題設定、音楽同期、日常パターン収集、手作業 editor、safe environment からの段階的危険化まで抽出できる。
  「弾幕を置く」ではなく fair challenge を成立させる制作手順として、具体的にゲーム制作へ適用できる。
  CoopEval 水準の概要も、制作ワークフローと評価軸を中心に ~4000 字へ展開可能。
suggested_post_outline:
  overview_angle: "音楽を起点に、日常観察から得た形状パターンを beat 上の hazard として安全に導入し、段階的に難化するレベル制作手順として書く。"
  analysis_axis: "rhythm 同期、視覚的な美しさ、fair challenge、手作業 editor による反復、safe environment での教示を分けて分析する。"
  application_target: "bullet hell/rhythm hybrid、ミニゲームの障害物導入、敵パターンの初回提示、制作メモからレベル案へ落とすサイクル。"
  pros_cons: "メリットは制作判断が具体的で、試作の評価軸に直結する点。デメリットは procedural/AI 生成手法ではなく、音楽前提でジャンル依存がある点。"
  verdict_pre: "部分採用。リズム同期ゲームに限らず、危険物の初回提示と段階的難化の制作チェックリストとして採用する。"

---

## raw_excerpt

Game Developer の 2018-07-19 記事。Berzerk Studio の Simon Lachance が、Just Shapes & Beats の music-dodging bullet hell levels をどう作ったかを語る開発記事。記事では、ステージ作りの出発点が音楽への愛着でありつつ、単なる感覚ではなく、視覚的に美しいこと、音楽に沿うこと、プレイヤーに fair challenge を与えることを重ねるルールがあった、と説明されている。形状パターンの着想は日常の壁、床、広告、家具などから集め、フォルダに保存した pattern idea を level に取り込む。

制作手順としては、procedural approach ではなく手作業の level editor を使い、特定の enemy を keyboard に割り当てて beat に合わせて叩く形で配置した、と述べられている。fairness の説明では、危険な square pattern を最初は画面中央に置き、プレイヤー初期位置から避けやすい方向へ撃たせ、safe environment で hazard の性質を教えてから、方向や数を増やして難しくする流れが紹介されている。

短い原文メモ: "place the enemy on beat" / "safe environment" / "fair, challenge"。

## why_relevant_to_games

bullet hell / rhythm hybrid の候補を作る時に、弾幕を「量」ではなく、音楽同期、日常パターン由来の形、初回安全提示から段階的に危険化する導入として分解する材料になる。
