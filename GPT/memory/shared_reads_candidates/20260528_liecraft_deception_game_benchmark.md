---
title: "LieCraft: A Multi-Agent Framework for Evaluating Deceptive Capabilities in Language Models"
url: "https://arxiv.org/abs/2603.06874"
collected_at: "2026-05-28T21:29:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [hidden-role, social-deduction, agent-evaluation, deception, multi-agent, game-ai]
evaluated_at: "2026-05-28T21:32:16+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
stale_after: "2026-06-27"
supersedes: []
gate_reason: "hidden-role game benchmark として cooperator / defector、grounded scenario、deception skill、accusation accuracy、degenerate strategy 対策が揃い、ゲーム内 deception 評価の構成要素を抽出できる。social deduction や LLM NPC の設計・検証に具体的に使える。"
suggested_post_outline:
  overview_angle: "LLM の嘘検出という安全性話題だけでなく、hidden-role game mechanics を使って長期目標、疑い、告発、妨害を測る評価環境として読む。"
  analysis_axis: "役割分担、grounded scenario、reward structure、deception / accusation 指標、degenerate strategy 回避を分けて、評価設計としての強さを見る。"
  application_target: "social deduction prototype、秘密目標 NPC、協力ゲーム中の裏切り検出などで、振る舞いログと評価軸を作る時に効く。"
  pros_cons: "メリットは抽象的な deception を game mechanics に接地できること。デメリットは倫理的 scenario と報酬設計が強く、娯楽用 prototype に移す時は不快さや誘導の制御が必要なこと。"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv 2603.06874。LLM deception を測るための multi-agent hidden-role game benchmark。プレイヤーは ethical alignment を選び、long-horizon の mission を実行する。Cooperator は event challenge を解き bad actor を見つける側、Defector は疑いを避けながら sabotage する側。childcare、hospital resource allocation、loan underwriting など 10 の grounded scenario に mechanics を置き換え、単なる抽象ゲームではなく倫理的含意のある状況で評価する。12 種の LLM を、defect しやすさ、deception skill、accusation accuracy の軸で比較している。game mechanics と reward structure で degenerate strategy を避ける設計にも触れている。

## why_relevant_to_games

social deduction / hidden-role prototype の構造化と、LLM NPC が「嘘をつく・疑う・弁明する」時の評価軸を作る素材になりそう。
