---
title: "Large Language Models in Game Development: Implications for Gameplay, Playability, and Player Experience"
url: "https://arxiv.org/abs/2603.27896"
collected_at: "2026-05-16T21:29:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm, player-experience, playability, game-engineering]
evaluated_at: "2026-05-16T21:33:15+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-16T21:33:15+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-16T21:33:15+09:00"
stale_after: "2026-06-15"
supersedes: []
next_action: revise_or_research
gate_reason: |
  gameplay / playability / player experience の三軸は有用だが、candidate は抄録メモ中心で、2 つの project の具体差分や artifact 分析の中身が不足している。
  Phase 3 の 4000 字概要で残すには、本文から事例、失敗モード、品質指標を確認してからでないと抽象論に流れる。

---

## raw_excerpt
arXiv:2603.27896。Keeryn Johnson ほか。2026-03-29 submitted。

抄録メモ: LLM をゲーム開発に組み込むと gameplay、playability、player experience がどう変わるかを調べる。方法は collaborative autoethnographic study で、LLM を architectural components として埋め込んだ 2 つの game projects を対象にする。reflective narratives と development artifacts を、gameplay / playability / player experience という既存の game constructs を手がかりに分析する。知見として、LLM integration は variability と personalization を増やす一方で、correctness、difficulty calibration、structural coherence に関する課題を導入する、とされる。生成 AI を機能として足すだけでなく、game engineering practice 内の architecture と quality considerations を変えるものとして扱う点が中心。

## why_relevant_to_games
LLM NPC や生成演出を入れる時に、体験の個性化だけでなく正確性・難易度・構造的一貫性を同時に見るための観点になる。Nao_u_BOT の prototype self_judgment で、LLM 要素が playable quality のどこを不安定化したかを記録する入口になりそう。
