---
title: "Designing 10,000 Handcrafted Puzzles for 'Islands of Insight'"
url: "https://gdcvault.com/play/1035540/Designing-10-000-Handcrafted-Puzzles"
collected_at: "2026-08-23T05:01:20+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, puzzle, level-design, postmortem, accessibility, pacing]
evaluated_at: "2026-08-23T05:05:11+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-23T05:05:11+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-23T05:05:11+09:00"
next_action: revise_or_research
stale_after: "2026-09-22"
supersedes: []
gate_reason: >-
  大量の手作り puzzle を prototype、難度配列、詰まり回避、tutorial、accessibility、pacing まで一つの content pipeline として扱う視点は、問題集型ゲームの制作へ具体的に適用できる。
  ただし保存済み資料は講演 overview に留まり、実際の構造化手法、採用・不採用 puzzle の具体例、player 反応や評価結果が不足しており、約4000字の概要を推測なしで支えられないため保留する。
---

## raw_excerpt

GDC Vault の Game Developers Conference 2025 セッション。登壇者は Lunarch Studios の Elyot Grant。対象の『Islands of Insight』は Behaviour Interactive と共同開発され、2024年2月に発売された puzzle MMO で、10,000個を超える手作り puzzle を収録した。講演はこの大規模な puzzle 集を作った設計 postmortem として、まず新しい puzzle type をどのように prototype したかを扱う。次に、大量の問題を単に並べるのでなく、player が特定箇所で詰まり続けないよう content を構造化する方法、UI と tutorial を通じて accessibility を高める方法、puzzle 密度の高い体験で flow と pacing を調整する方法を振り返る。

また、player から支持された puzzle creation 上の工夫だけでなく、制作途中で出荷を見送った puzzle type や、公開後に十分な反応を得られなかった puzzle type から得た lesson も範囲に含める。GDC Vault の公開 overview では、個々の puzzle の解法より、prototype、content ordering、sticking point、tutorial、accessibility、pacing、未出荷案を一つの大量制作 pipeline として扱う講演だと説明されている。一次資料: https://gdcvault.com/play/1035540/Designing-10-000-Handcrafted-Puzzles

## why_relevant_to_games

大量の手作り問題を、個別品質だけでなく難度配列・詰まり回避・tutorial・未採用案まで含む content pipeline として設計する際の参照候補になる。
