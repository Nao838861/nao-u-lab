---
title: "EVE-Agent: Evidence-Verifiable Self-Evolving Agents"
url: https://arxiv.org/abs/2605.22905
collected_at: 2026-05-26T19:52:28+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent, evaluation, self-evolution, evidence, game-testing]
evaluated_at: 2026-07-28T07:38:04+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-28T07:38:04+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-28T07:38:04+09:00"
stale_after: "2026-08-27"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  evidence span と marginal accuracy gain を使う中核は明確で、プレイログ根拠付きの自己改善へ具体的に接続できる。
  ただし候補メモには実験設定、比較対象、定量結果、失敗例がなく、論文の評価節を補うまで CoopEval 水準には届かない。

---

## raw_excerpt
arXiv 2605.22905。Yamato Arai / Yuma Ichikawa による、検索エージェントの自己進化ループを evidence span で検証可能にする提案。

要点メモ:
- data-free self-evolving search agents は、自分で問題を作り、自分で解き、自分のフィードバックで改善できるが、検証可能な根拠がなければ流暢だが支えのない訓練例を報酬してしまう。
- EVE-Agent は proposer--solver framework を変更し、proposer が question / answer / verbatim evidence span を同時に生成する。
- verifier は、その evidence span を与えたときの marginal accuracy gain を報酬に使う。
- backbone model、retriever、search tool、optimization framework は変更しない。
- 著者は、各 training example が inspectable source span を持つため、self-generated curriculum が auditable になる、と位置づけている。

Slack 由来メモ: 2026-05-26 19:30 の #all-nao-u-lab で、Nao_u_BOT 側の atom / MEMORY / rule 化における「根拠 span を持つ自己進化」の話題として拾われていた。

## why_relevant_to_games
AI にゲームを作らせる・テストさせる時、失敗例や改善例を「それっぽい自己評価」ではなく、プレイログや画面状態の根拠 span 付きデータとして残す設計に接続できる。
