---
title: "ChatGPT and Other Large Language Models as Evolutionary Engines for Online Interactive Collaborative Game Design"
url: https://arxiv.org/abs/2303.02155
collected_at: 2026-05-16T11:29:17+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mixed-initiative, co-creation, evolutionary-search, llm]
source_note: "新規検索: site:arxiv.org/abs game development large language model playtesting 2026; related older paper surfaced and arXiv page checked 2026-05-16"
evaluated_at: 2026-05-16T11:33:56+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-16T11:41:36+09:00"
last_decision: posted
stale_after: "2026-06-15"
supersedes: []
gate_reason: |-
  interactive evolution と LLM を組み合わせ、候補生成・選好・交叉/変異・再評価のループとして手法の中核を説明できる。
  Nao_u_BOT の brainstorm -> playable diff -> review 循環へ、候補を増やすだけでなく「選ぶ/混ぜる/捨てる」を制度化する材料として具体的に適用できる。
suggested_post_outline:
  overview_angle: "LLM を単発アイデア生成器ではなく、interactive genetic algorithm の variation/recombination エンジンとして使う共同ゲーム設計ループとして整理する。"
  analysis_axis: "初期 brief、複数 candidate design、人間の選好フィードバック、promising design の選択、LLM による変異・再結合、3 種の game design task での評価という流れを軸にする。"
  application_target: "Nao_u_BOT のゲーム制作で、brainstorm 候補を playable diff 前に評価・交叉・棄却する小さな設計ループへ適用する。"
  pros_cons: "長所は発散と選別を同じプロトコルに載せられる点。短所は評価者の選好が曖昧だと探索が偏り、LLM 出力の品質管理が別途必要な点。"
  verdict_pre: "部分採用。実装自動化より、候補設計ログと選好フィードバックの型として使う。"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778899287487259"
next_action: none
posted:
  ts: "1778899287.487259"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778899287487259"
  char_count: 3719
  posted_at: "2026-05-16T11:41:36+09:00"

---

## raw_excerpt

arXiv abstract short quotes:

> "a collaborative game design framework that combines interactive evolution and large language models"

> "users collaborate on the design process by providing feedback"

採取メモ: Lanzi / Loiacono による 2023 年の paper。LLM を単発のアイデア生成器として扱うのではなく、interactive genetic algorithm と組み合わせ、ユーザーのフィードバックで候補案を選択し、LLM が recombination / variation を担当する共同設計フレームワークとして提示している。開始点は brief と複数の candidate designs。そこから human designer が選好を返し、システムが promising designs を選び、交叉・突然変異に近い形で新案を出す。3 つの game design task で remote human designers と評価したとされる。

## why_relevant_to_games

候補案を大量に出すだけでなく、ユーザーの「選ぶ/捨てる/混ぜる」を設計ループへ入れる発想が、Nao_u_BOT の brainstorm -> playable diff -> review 循環に近い。Phase 2 以降で候補生成と選別の役割分担を考える材料になる。
