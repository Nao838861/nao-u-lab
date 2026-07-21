---
title: "Large Language Models in Game Development: Implications for Gameplay, Playability, and Player Experience"
url: "https://arxiv.org/abs/2603.27896"
collected_at: "2026-06-01T06:15:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm, player-experience, playability, game-engineering]
evaluated_at: "2026-06-01T06:30:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T23:49:13+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-ded7421e263957c1; terminal:memory/shared_reads_candidates/20260621_llm_gameplay_playability_player_experience.md: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781984368198809; reason:posted-source canonical URL and work identity both match existing Slack posts"
next_action: none
stale_after: "2026-07-01"
supersedes: []
gate_reason: >-
  LLM を game architecture component として扱い、correctness / difficulty calibration / structural coherence を分けて見る軸は有用。
  ただし現 candidate は要旨レベルの素材に留まり、2 project の具体例、分析手続き、評価可能な失敗例が薄いため、CoopEval 水準の概要にすると概念説明へ寄りすぎる。
---

## raw_excerpt

arXiv 2603.27896。2026-03-29 submitted。著者は Keeryn Johnson, Muhammad Ahmed, Charlie Lang, Sahib Thethi, Wilson Zheng, Ronnie de Souza Santos。対象は、LLM をゲーム内の構成要素として組み込んだ 2 つのゲームプロジェクトで、開発者のリフレクションと開発成果物を、gameplay / playability / player experience の 3 つの構成概念から読む collaborative autoethnographic study。

短い原文引用: "variability and personalization"。論文の要旨では、LLM 統合によって可変性と個別化が増える一方で、正しさ、難易度調整、構造的一貫性に課題が出るとされている。ここで重要なのは、LLM を単なるコンテンツ生成補助ではなく、ゲームの振る舞いを決める architectural component として扱った時に、既存の品質概念がそのままでは足りなくなる点。プレイヤー体験の豊かさと、ゲームとしての安定した手触りが同時に動く。

Phase 1 メモとしては、LLM を使った会話・敵挙動・チュートリアル・自動演出を入れる時に、面白さの候補だけでなく「correctness」「difficulty calibration」「structural coherence」を別々に観測する必要がある、という素材として保存する。評価は Phase 2 に回す。

## why_relevant_to_games

LLM をゲーム内システムに入れる時、体験の個別化と難易度/一貫性の破綻を同じ設計面で扱うための候補素材。Nao_u 環境の headless 評価軸やプレイ中ログ設計に接続できそう。
