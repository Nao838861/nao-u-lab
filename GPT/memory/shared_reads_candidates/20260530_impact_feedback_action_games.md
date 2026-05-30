---
title: "What Features Influence Impact Feel? A Study of Impact Feedback in Action Games"
url: "https://arxiv.org/abs/2208.06155"
collected_at: "2026-05-30T12:29:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-feel, action, feedback, impact, juice]
evaluated_at: "2026-05-30T12:36:46+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
posted:
  ts: "1780112562.220929"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780112562220929"
  char_count: 3911
  posted_at: "2026-05-30T13:02:43+09:00"
stale_after: "2026-06-29"
supersedes: []
gate_reason: >
  impact feel という具体的な問題設定、Steam comment + NLP による性能順位付け、
  top/bottom game の 19-feature 比較、hit stop / sound coherence / camera control という結論が抽出できる。
  Nao_u_BOT の action prototype で被弾・衝突・近接ヒットの feedback checklist に直結するため pass。
suggested_post_outline:
  overview_angle: "impact feel を単なる演出量ではなく、プレイヤーコメントから抽出した特徴セットと top/bottom 比較で扱う研究として書く。"
  analysis_axis: "Steam comments の NLP ranking、19-feature framework、hit stop / sound coherence / camera control の寄与、feature 欠落が手応えを損なう構造。"
  application_target: "弾・近接・被弾・破壊演出の実装時に、ヒットストップ、音の一貫性、カメラ制御、視覚効果を checklist 化して playable diff の評価軸にする。"
  pros_cons: "利点は低コストで実装レビューへ落とせる点。弱点はコメント由来で因果実験ではなく、ジャンル外への転用は慎重にする必要がある点。"
  verdict_pre: "部分採用。action feedback の最小評価表として採用し、過剰な juice 追加ではなく欠落検出に使う。"
---

## raw_excerpt
原文短句: "hit stop, sound coherence, and camera control"

著作権配慮のため、abstract の逐語引用ではなく要点メモとして保存する。Lin / Duan / Wen / Cai による 2022 年の impact feedback 研究。action game の hit effect がなぜ気持ちよく感じられるのかを、impact feel という言葉で扱う。Steam の top seller action game へのプレイヤーコメントを集め、NLP モデルで impact feel の性能を順位付けし、上位 8 本と下位 8 本のゲームに対して 19-feature framework を当てて比較している。abstract では、特に hit stop、sound coherence、camera control が player impact feel に強く影響しうること、これらの専用設計を欠くと impact feel を損ねる可能性があることが示されている。

## why_relevant_to_games
弾・衝突・被弾・近接ヒットの気持ちよさを、単なる演出量ではなく feature checklist として拾う候補になる。
