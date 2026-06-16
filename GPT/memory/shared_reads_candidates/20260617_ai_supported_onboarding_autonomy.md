---
title: "Support Autonomy: Exploring Player Perspectives on AI-Supported Onboarding in Video Games"
url: "https://dl.acm.org/doi/10.1145/3706598.3713576"
collected_at: "2026-06-17T05:16:01+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, onboarding, player-experience, ai-assistance, gur]
evaluated_at: "2026-06-17T05:36:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-17T05:26:32+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781641586967299"
next_action: none
posted:
  ts: "1781641586.967299"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781641586967299"
  char_count: 3523
  posted_at: "2026-06-17T05:26:32+09:00"
stale_after: "2026-07-17"
supersedes: []
gate_reason: |-
  onboarding の過補助 / 補助不足という問題設定、AI suggestion の実験条件、agency / transparency / active learning という結論軸が揃っている。
  チュートリアルや初回導線の AI 補助量を設計する場面に直接つながり、4000 字程度の概要も構成可能。
suggested_post_outline:
  overview_angle: "AI が正解行動を教えるほど良いのではなく、学習感・操作感・選択権を残す onboarding 設計として読む。"
  analysis_axis: "cognitive load 低減、too much / too little guidance、within-subjects study、control / support level / transparency / active learning。"
  application_target: "新規プレイヤー向けチュートリアル、初回ステージ、AI advisor、戦術ゲームの行動候補提示 UI。"
  pros_cons: "メリットは初心者の詰まりを減らせること。デメリットは負荷を下げすぎると学習機会と agency を奪うこと。"
  verdict_pre: "採用。AI 補助は常時提示ではなく、選択式・説明付き・フェードアウト可能な支援として扱う。"
---

## raw_excerpt

CHI 2025 paper / UWSpace thesis page / HCI Games project page から拾った候補メモ。関連する thesis は、AI-supported onboarding system を持つ turn-based strategy game "Joker" を設計し、AI がプレイヤーのターンで action suggestion を出す条件を使って、new players の cognitive load と player experience を調べている。混合手法の within-subjects study は n=20。短い原文断片: "players strongly value interaction, agency, and personalization"。

検索結果と repository abstract では、video game onboarding は新規プレイヤーに mechanics を教えつつ、情報処理容量を超えないようにする課題として置かれる。too much guidance は frustration / boredom、too little guidance は overwhelm を生みうる。AI-supported suggestions は cognitive load を下げたが、負荷が低すぎると suggestion から学ぶ力を損なう可能性が報告される。CHI paper 側の要旨では、プレイヤーは lived game experience を通じて学び、AI support については control、support level の選択、transparency、active learning を重視する、という方向で整理されている。

## why_relevant_to_games

チュートリアルや初回導線を AI に任せる時、補助量を増やすだけでなく、プレイヤーが自分で学んだ感覚と agency を残す必要があるという設計メモにできる。
