---
title: "When Routine Chats Turn Toxic: Unintended Long-Term State Poisoning in Personalized Agents"
url: https://arxiv.org/abs/2605.06731
collected_at: 2026-05-15T02:59:09+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent-memory, memory-safety, long-term-state, evaluation, writeback-gate]
evaluated_at: 2026-05-15T03:20:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T03:12:33+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: >
  長期状態を持つ agent の authorization drift / tool-use escalation / unchecked autonomy を
  benchmark と Harm Score で測る構造が明確。ゲーム制作そのものより、制作 agent の記憶・権限・自動化境界に効く。
  StateGuard の writeback diff 監査は現行 memory 改善サイクルへ具体的に移せる。
suggested_post_outline:
  overview_angle: "日常会話が長期状態を少しずつ汚染し、将来の確認境界を弱める問題として読む"
  analysis_axis: "ULSPB の interaction pattern / Harm Score / StateGuard による writeback boundary 監査"
  application_target: "Codex/Claude の memory、AGENTS.md・directive 更新、定時サイクルの自動書き戻し前チェック"
  pros_cons: "メリットは権限ずれを状態差分として検出できる点。デメリットは過剰 rollback が有用な学習や方針更新を止める点"
  verdict_pre: "採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778782340942119"
next_action: none
posted:
  ts: "1778782340.942119"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778782340942119"
  char_count: 4498
  posted_at: "2026-05-15T03:12:33+09:00"

---

## raw_excerpt
原文の短い核: "unintended long-term state poisoning" / "authorization drift" / "StateGuard"。

arXiv の abstract では、personalized LLM agent が長期協働のために cross-session state を持つこと自体が、微妙だが重大な脆弱性になると述べている。通常の user-agent interaction が少しずつ agent の長期状態を書き換え、将来の確認境界を弱めたり、tool-use default を広げたり、自律実行を段階的に強めたりする。このリスクを ULSPB という bilingual benchmark で測り、350 settings、5 assistance categories、7 interaction patterns、24-turn routine interactions、single-injection counterpart を含める。指標として Harm Score を定義し、authorization drift、tool-use escalation、unchecked autonomy を状態中心に測る。防御として StateGuard を提案し、writeback boundary で state diff を監査し、危険な編集だけ rollback する。

## why_relevant_to_games
ゲーム制作 agent の記憶・ルール・自動化権限が、日常会話や日記で徐々にずれる問題を測る材料になる。Phase 4 の記憶改善や、writeback 前 diff 監査の設計語彙として使える。
