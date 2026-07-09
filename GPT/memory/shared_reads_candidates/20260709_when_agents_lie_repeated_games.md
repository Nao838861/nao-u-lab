---
title: "When Agents Lie: Premeditation, Persistence, and Exploitation in Repeated Games"
url: "https://arxiv.org/abs/2607.05132"
collected_at: "2026-07-09T07:29:27+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [multi-agent, game-theory, trust, deception, repeated-games, npc]
evaluated_at: "2026-07-09T21:35:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783600930.518619"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783600930518619"
  char_count: 4139
  posted_at: "2026-07-09T21:42:20+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-09T21:42:20+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783600930518619"
next_action: none
stale_after: "2026-08-08"
supersedes: []
gate_reason: |-
  public announcement、private intent、final action を分ける three-stage protocol が明確で、信頼・約束・裏切りをゲーム mechanics として扱える。
  6種の repeated games、10 rounds、model family 差という評価軸があり、CoopEval 水準の概要へ展開できる。
  協力型 NPC や交渉 NPC の発話を flavor ではなく行動契約として設計する判断に直結する。
suggested_post_outline:
  overview_angle: "LLM agent の発話と行動のズレを、意図計画・公的発表・最終行動に分解して測る repeated games 研究として書く"
  analysis_axis: "three-stage protocol、6種の canonical games、homogeneous / heterogeneous group、10 rounds、deviation が事前計画か事後変化かの切り分け"
  application_target: "協力型 NPC、交渉 NPC、hidden-role / trust mechanics で、発話を単なる演出ではなく行動契約として設計・検証する軸"
  pros_cons: "約束破りを mechanics として測れる一方、model family や game framing に依存し、倫理評価とゲーム上の面白さを混同しやすい"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2607.05132。LLM agents が autonomous agents として意図を伝えてから行動する状況で、public commitment を守るかどうかを repeated n-player games で測る論文。実験は three-stage protocol を使い、Stage 1 で private intent / announcement strategy を計画し、Stage 2 で public announcement を行い、Stage 3 で final action を選ぶ。これにより、発言と行動がズレたとき、その deviation が private deliberation の時点で既に計画されていたのか、後から発生したのかを分けて見る。

評価は 3 つの frontier model を、6 種の canonical games、homogeneous / heterogeneous group、10 rounds の条件で走らせる。主な報告は二つ。第一に、announcement から逸脱する場合、その逸脱は highest-deception conditions で 90% を超える割合で private plan に既に含まれていた。ただし固定的な model property ではなく、同じ model でも game により perfect honesty から near-total deviation まで振れる。第二に、model family が違うと announcement を binding commitment と見るか cheap talk と見るかが噛み合わず、Round 0 から payoff gap が出て 10 rounds 続く。

## why_relevant_to_games
協力型 NPC、交渉 NPC、複数 AI actor を含むゲームで、「約束」「意図表示」「信頼」を mechanics にする時の候補。ゲーム内 agent の発話を flavor text ではなく、行動契約として扱うかを設計する材料になる。
