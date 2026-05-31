---
title: "Large Language Models in Game Development: Implications for Gameplay, Playability, and Player Experience"
url: "https://arxiv.org/abs/2603.27896"
collected_at: "2026-05-27T00:23:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, llm, playability, player-experience, software-engineering]
evaluated_at: "2026-05-27T00:28:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T00:55:35+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779809735727529"
posted:
  ts: "1779809735.727529"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779809735727529"
  char_count: 3565
  posted_at: "2026-05-27T00:55:35+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: none
gate_reason: >-
  gameplay / playability / player experience を guiding constructs にし、LLM を制作補助でなくゲーム内 architecture として扱う問題設定が明確。
  variability/personalization と correctness/difficulty/structural coherence のトレードオフを、ゲーム評価項目へ落とし込める。
suggested_post_outline:
  overview_angle: "LLM をゲームの部品にした瞬間、面白さだけでなく正しさ・難易度・構造一貫性が新しい品質条件になる話として書く。"
  analysis_axis: "2 project の autoethnographic study、3 constructs、LLM integration が増やす変動性と破綻条件を軸にする。"
  application_target: "LLM-assisted playtest、生成イベント、director concept 照合で見るべき rubric の設計。"
  pros_cons: "メリットは評価語彙を gameplay/PX まで広げられる点。デメリットは preliminary study で一般化に限界がある点。"
  verdict_pre: "部分採用。rubric の観点セットとして採用し、実装手法そのものは別途検証する。"

---

## raw_excerpt
arXiv 2026-03 投稿の Software Engineering 論文。LLM をゲーム開発の architectural component として組み込んだ 2 つの game project を対象に、collaborative autoethnographic study を行っている。分析では gameplay、playability、player experience を guiding constructs として使い、開発者の reflective narratives と development artifacts を読む。要旨では、LLM integration は variability と personalization を増やす一方で、correctness、difficulty calibration、structural coherence に関する課題を持ち込む、と整理されている。生成 AI を単なる制作補助ではなくゲームシステム内部の構成要素にすると、従来の gameplay / playability / player experience の概念そのものに新しい品質条件と設計上の注意点が発生する、という位置づけの preliminary empirical insight。

## why_relevant_to_games
LLM をゲーム内システムや評価 harness に入れる時、出力の面白さだけでなく難易度調整、構造一貫性、プレイヤー体験の破綻を同時に見るための観点候補。Pulse Relay や今後の LLM-assisted playtest で評価項目化できそう。
