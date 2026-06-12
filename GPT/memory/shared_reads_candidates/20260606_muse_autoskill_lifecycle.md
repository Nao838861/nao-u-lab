---
title: "MUSE-Autoskill: Self-Evolving Agents via Skill Creation, Memory, Management, and Evaluation"
url: "https://arxiv.org/abs/2605.27366"
collected_at: "2026-06-06T11:59:30+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, skills, memory, evaluation, workflow]
evaluated_at: "2026-06-06T12:07:14+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-06T12:12:02+09:00"
last_decision: postponed
evidence: "duplicate_existing_shared_reads_posts:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780577644122259;https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780644277510099"
next_action: none
postpone_reason: "Phase 3 duplicate guard: MUSE-Autoskill は 2026-06-04 に単独投稿、2026-06-05 に SkillOpt 併読投稿が #shared-reads 済みのため再投稿しない。"
stale_after: "2026-07-06"
supersedes: []
gate_reason: "skill を isolated/static artifact ではなく creation / memory / management / evaluation / refinement の lifecycle asset と見る問題設定が明確。SkillsBench で success, efficiency, reuse, transfer を評価しており、ゲーム制作サイクルの記憶・評価設計へ具体的に接続できる。"
suggested_post_outline:
  overview_angle: "LLM agent の skill を一回限りの生成物ではなく、保存・選択・評価・改良される制作資産として扱う論文として読む。"
  analysis_axis: "skill creation、skill memory、organization/selection、unit tests と runtime feedback、cross-agent transfer の評価設計を軸にする。"
  application_target: "headless 評価、wave 設計、Slack 反応、memory recall を reusable skill として管理する Phase 4 の設計材料にする。"
  pros_cons: "利点は agent 作業を長期改善可能な単位に分解できる点。懸念は benchmark 上の skill とゲーム制作の曖昧な評価との差を埋める追加設計が必要な点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2605.27366。2026-05-26 submitted。対象は LLM agent が使う reusable skills を、単発の生成物ではなく、creation / memory / management / evaluation / refinement を持つ lifecycle-managed asset として扱う枠組み。既存の skill creation approaches は skills を isolated and static artifacts として扱いがちで、reuse、reliability、long-term improvement が制限される、という問題設定が置かれている。MUSE-Autoskill Agent は、必要に応じた skill creation、task をまたいだ保存と再利用、効率的な organization / selection、unit tests と runtime feedback による evaluation、skill-level memory の蓄積を組み合わせる。SkillsBench で、task success、efficiency、reuse、cross-agent transfer の改善を示す初期証拠がある、とされる。

## why_relevant_to_games
ゲーム制作サイクルで生まれる headless 評価、wave 設計、Slack 反省、memory recall を「長生きする skill」として扱う時の比較材料になる。Phase 4 の記憶/skill 設計候補として保存。
