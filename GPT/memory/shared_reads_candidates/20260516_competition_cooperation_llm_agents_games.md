---
title: "Competition and Cooperation of LLM Agents in Games"
url: "https://arxiv.org/abs/2604.00487"
collected_at: "2026-05-16T21:29:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-theory, llm-agents, multiagent, simulation, evaluation]
evaluated_at: "2026-05-16T21:33:15+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-16T21:33:15+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-16T21:33:15+09:00"
stale_after: "2026-06-15"
supersedes: []
next_action: keep_for_reference
gate_reason: |
  LLM agents が競争状況でも協調へ寄るという観察は self-play 評価の注意点としては有用だが、ゲーム制作に直接移すと「LLM 評価者のバイアス」以上に広げにくい。
  対象ゲームも network resource allocation / Cournot competition で、#shared-reads 向けにゲーム制作の具体工程へ接続するにはこじつけが強い。

---

## raw_excerpt
arXiv:2604.00487。Jiayi Yao、Cong Chen、Baosen Zhang。2026-04-01 submitted、2026-04-11 v2。

抄録メモ: LLM agents が competitive multi-agent settings に置かれた時、Nash equilibrium に収束するのか、どのような strategic behavior を示すのかを扱う。対象は standard games としての network resource allocation game と Cournot competition game。抄録では、multi-round prompts と non-zero-sum context が与えられると、LLM agents は Nash equilibria へ収束するより協調しやすい、とされる。chain-of-thought analysis では fairness reasoning がこの挙動の中心にあるとし、round 間での reasoning dynamics を説明する analytical framework を提案する。

## why_relevant_to_games
ゲーム内 AI や agent self-play を評価に使う時、LLM agent が競争条件でも公平性や協調へ寄る可能性を素材として持てる。対戦ゲームの難易度調整や multi-agent playtest で、人間プレイヤーの exploit / selfish play とずれる点を観測する候補。
