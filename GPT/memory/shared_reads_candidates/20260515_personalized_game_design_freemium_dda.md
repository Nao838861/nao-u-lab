---
title: "Personalized game design for improved user retention and monetization in freemium games"
url: "https://www.hbs.edu/ris/Publication%20Files/Personalized%20Game%20Design_628b85ef-5028-4032-a0b7-4d0f3edf33a1.pdf"
collected_at: "2026-05-15T10:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, dynamic-difficulty, retention, monetization, field-experiment, mobile-games]
evaluated_at: "2026-05-15T11:01:51+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T11:06:07+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778810807521139"
posted:
  ts: "1778810807.521139"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778810807521139"
  char_count: 3509
  posted_at: "2026-05-15T11:06:07+09:00"
next_action: none
gate_reason: |
  離脱リスクに応じた DDA、完全ランダム holdout、大規模 field experiment、retention/engagement/monetization の評価という重要要素が揃っている。
  monetization は Nao_u 環境では主目的ではないが、初回継続・到達保証・再挑戦導線の設計に具体的に置換でき、CoopEval 水準の概要が書ける。
suggested_post_outline:
  overview_angle: "難易度を下げることを甘やかしではなく、離脱リスクを下げて進行経験を保証する設計介入として書く。"
  analysis_axis: "対象者選別、介入設計、holdout 比較、短期購買低下と長期継続改善のトレードオフを軸に分析する。"
  application_target: "初回プレイの Lv3 到達、被弾後の復帰、再挑戦導線、序盤 wave 調整の評価指標。"
  pros_cons: "長所は大規模実験と retention 指標の明確さ。短所は F2P 商用文脈、収益指標の価値観差、難易度低下の体験劣化リスク。"
  verdict_pre: "部分採用。課金最適化ではなく、序盤離脱を防ぐ到達保証の評価設計として採用する。"

---

## raw_excerpt

Eva Ascarza, Oded Netzer, Julian Runge による F2P モバイルゲームの DDA フィールド実験。Columbia Business School の研究紹介では 2025-08-19 に紹介され、論文 PDF は International Journal of Research in Marketing 掲載版。

短い原文抜粋: "over 300,000 players" / "12 weeks" / "at higher risk of churning"。

内容メモ: 人気 F2P モバイルゲームで、離脱リスクが高いユーザーに対してパズルを段階的に易しくする DDA を導入し、完全ランダム holdout と比較した研究。難易度低下は短期的には「攻略補助アイテムを買う理由」を弱め得るが、進行・当日 engagement・将来 retention を高めることで、長期的には IAP spending にも正の効果が出るという構図を扱う。論文中では 329,999 人規模の観測や D1/D7/D14 retention などが示されている。

## why_relevant_to_games

商用 F2P の話だが、制作上は「難しくして価値を作る」だけでなく「進行を保証して継続意欲を作る」設計軸として使える。Nao_u 作品では monetization ではなく、初回プレイ継続・Lv3 到達・再挑戦導線の設計材料になる。
