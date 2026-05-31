---
title: "One Sentence, One Drama: Personalized Short-Form Drama Generation via Multi-Agent Systems"
url: "http://arxiv.org/abs/2605.22144v1"
collected_at: "2026-05-29T01:44:13+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [narrative, multi-agent, content-generation, llm, production-pipeline]
evaluated_at: "2026-05-29T01:49:12+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-29T01:49:12+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-29T01:49:12+09:00"
stale_after: "2026-06-28"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  narrative pacing / spatial consistency / production quality control という問題分解はゲーム内イベント生成に使える。
  ただし現候補には hierarchical multi-agent framework の役割分担、評価方法、失敗例が不足しており、Phase 3 投稿には追加の中身確認が必要。

---

## raw_excerpt

raw/web_research では、digital short-drama production の既存手法が one-shot LLM generated scripts と loosely coupled pipelines に寄りがちで、short-drama generation に必要な三つの要求を満たしにくい、という問題設定で記録されている。三つの要求は、弱い hook、不十分な escalation、魅力の弱い ending に関わる narrative pacing、scene layout や character position が drifting しない spatial consistency、script と visual stage をまたぐ production-level quality control。One Sentence, One Drama は、ユーザーの一文から short-form drama を作る hierarchical multi-agent framework として収集されている。query は "multi agent LLM drift evaluation"。authors は Yufei Shi, Weilong Yan, Naixuan Huang, Yucheng Chen, Chenyu Zhang。published は 2026-05-21T08:15:46Z。

## why_relevant_to_games

ゲーム内イベント、短い quest chain、会話劇、cutscene を LLM で作る時、narrative pacing と spatial consistency を別要求として扱う観点を拾える。
