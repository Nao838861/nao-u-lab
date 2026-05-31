---
title: "Symbolically Scaffolded Play: Designing Role-Sensitive Prompts for Generative NPC Dialogue"
url: https://arxiv.org/abs/2510.25820
collected_at: 2026-05-15T04:59:28+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, generative-npc, llm-dialogue, prompt-design, player-experience]
evaluated_at: 2026-05-15T05:12:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T05:07:04+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: |
  NPC の役割ごとに prompt 制約の強さを変えるという問題設定、The Interview での within-subjects study、JSON+RAG scaffold と LLM judge による追評価までが候補本文から追える。
  「安定性が必要な NPC」と「即興性が価値になる NPC」を分ける設計軸は、LLM NPC 実装時の具体判断に落とし込めるため、~4000字の概要に耐える。
suggested_post_outline:
  overview_angle: "LLM NPC を一律に縛るのではなく、役割ごとに coherence と surprise の配分を変える prompt scaffold として読む。"
  analysis_axis: "high/low constraint prompt の比較、JSON+RAG scaffold、LLM judge 評価がどこまで player experience を説明できるか。"
  application_target: "会話 NPC の役割設計、クエスト進行 NPC と容疑者/雑談 NPC の prompt policy 分離、headless synthetic evaluation の試作。"
  pros_cons: "メリットは NPC ごとの制約設計を明文化できる点。デメリットは N=10 と synthetic judge の外的妥当性が限定的な点。"
  verdict_pre: "部分採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789224664759"
next_action: none
posted:
  ts: "1778789224.664759"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789224664759"
  char_count: 3513
  posted_at: "2026-05-15T05:07:04+09:00"

---

## raw_excerpt
原文の短い核: "role-dependent" / "preserving improvisation"。

arXiv abstract によると、この研究は GPT-4o を使った voice-based detective game "The Interview" を題材に、NPC 対話で制約の強い prompt が実際に player experience を改善するのかを調べている。within-subjects usability study (N=10) では high-constraint prompt と low-constraint prompt を比較したが、技術的な破綻への感度以外に明確な体験差は出なかった。その後、high-constraint prompt を JSON+RAG scaffold に作り替え、LLM judge による early-stage synthetic evaluation を行ったところ、scaffolding の効果は NPC の役割に依存するという結果が出た。quest-giver 的な Interviewer は安定した一方で、suspect NPC は improvisational believability を失いやすかった。論文は、制約を強めれば常にプレイが良くなるという仮定を退け、coherence が必要な役割では構造を強め、surprise が重要な役割では曖昧さを残す "Symbolically Scaffolded Play" を提案している。

## why_relevant_to_games
LLM NPC を入れる時に、全 NPC を同じ prompt 強度で縛らず、役割ごとに安定性と即興性の配分を変える設計メモとして使える。
