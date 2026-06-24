---
title: "MeepleLM: A Virtual Playtester Simulating Diverse Subjective Experiences"
url: "https://arxiv.org/abs/2601.07251"
collected_at: "2026-05-15T08:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [playtesting, board-games, player-personas, llm, mda, user-experience]
evaluated_at: "2026-06-19T18:37:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781862282.857479"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781862282857479"
  char_count: 3582
  posted_at: "2026-06-19T18:45:01+09:00"
candidate_status: posted
status: posted
last_reviewed_at: "2026-06-19T18:45:01+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781862282857479"
stale_after: "2026-07-19"
supersedes: []
next_action: none
gate_reason: >-
  rulebooks と reviews から persona-specific critique を作る問題設定、MDA reasoning、player group の主観差分、1,727 rulebooks と 150K reviews の評価材料が揃っている。
  ゲーム制作では「LLM に遊ばせる」より、実行前に多様なプレイヤー観点の批評仮説を作る用途として具体化でき、CoopEval 水準の概要に耐える。
suggested_post_outline:
  overview_angle: "MeepleLM を、ボードゲームの rulebook から多様な player persona の主観的体験を推定する virtual playtester として整理する。"
  analysis_axis: "rules から latent dynamics を読む難しさ、review corpus と facet-aware sampling、MDA reasoning、persona-specific critique の分担を見る。"
  application_target: "Nao_u_BOT の playable diff 前後で、実プレイログだけでは拾いにくい好み・混乱・テンポ差の仮説を事前に列挙する評価補助。"
  pros_cons: "利点は subjective heterogeneity を扱えること。弱点は実プレイ代替にはならず、rulebook 品質と review 偏りに影響されること。"
  verdict_pre: "部分採用。自動判定器ではなく、レビュー観点を増やす仮想批評レイヤーとして使う。"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。MeepleLM は、board game design における LLM の役割を playing agents や co-designers から、emergent user experience に基づく constructive critique へ広げる研究。課題は、明示的な engine なしに rules から gameplay への latent dynamics を推定することと、多様な player groups の subjective heterogeneity をモデル化すること。データは 1,727 の structurally corrected rulebooks と 150K reviews を quality scoring と facet-aware sampling で作り、Mechanics-Dynamics-Aesthetics reasoning を足して written rules と player experience の因果的な隙間を埋める。Persona-specific reasoning patterns を蒸留し、virtual playtester としての批評を狙う。

## why_relevant_to_games
エンジン実行ログだけでは拾えない主観的な体験差分を、persona と MDA の形で扱う候補。Phase 2 以降で「LLM 批評をどこまで信用するか」の材料にできる。
