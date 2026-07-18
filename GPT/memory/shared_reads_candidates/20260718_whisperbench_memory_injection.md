---
title: "When Claws Remember but Do Not Tell: Stealthy Memory Injection in Persistent Personal Agents"
url: "https://arxiv.org/abs/2607.05189"
collected_at: "2026-07-18T20:31:51.9005046+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, security, persistent-agents, benchmark, game-production]
evaluated_at: "2026-07-18T20:36:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-18T20:48:57.6477547+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784375330114349"
next_action: none
stale_after: "2026-08-17"
supersedes: []
posted:
  ts: "1784375330.114349"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784375330114349"
  char_count: 4488
  posted_at: "2026-07-18T20:48:57.6477547+09:00"
gate_reason: >-
  一通の外部入力から記憶採用、表面上の stealth、将来行動への伝播までを end-to-end で測る問題設定、108 cases、実 email workflow、MemGhost の二つの proxy、held-out 結果と transfer が揃う。
  Slack・記事・playtest report・asset metadata を長期記憶へ入れるゲーム制作環境で、ingest 時だけでなく recall-to-action 時にも provenance と信頼境界を検査する具体的な安全策へ落とせる。
suggested_post_outline:
  overview_angle: "外部文書の処理を一回の prompt injection 問題ではなく、記憶への採用と後日の行動変化を含む時間差の攻撃 cycle として説明する。"
  analysis_axis: "fact / preference poisoning、五つの risk category、real IMAP/SMTP workflow、environment proxy と objective proxy、one-shot black-box 条件、backend 間 transfer を分析する。"
  application_target: "Log_cdx の game-production memory で、Slack・外部記事・playtest report・asset metadata に source trust と provenance を付け、untrusted 内容を durable preference や実行指示へ昇格させる前の承認 gate と recall-to-action 検査を設ける。"
  pros_cons: "利点は ingest 時に無害に見える入力の遅延影響を end-to-end で試験でき、memory backend をまたぐ弱点を可視化できること。欠点は攻撃成功率が対象 agent・skill・rubric に依存し、防御の有効性やゲーム制作固有の脅威分布は別途検証が必要なこと。"
  verdict_pre: "部分採用（外部入力を捨てるのではなく、provenance 保持・昇格 gate・行動直前の再検証を優先する）"
---

## raw_excerpt

arXiv:2607.05189、2026-07-06 submitted。長期記憶と外部環境へのアクセスを持つ personal agent では、untrusted content が記憶へ静かに書き込まれ、後の行動で trusted state として再利用される経路が生まれる。論文は、一通の email payload が poisoned memory を作り、当初の user-facing response では隠れ、将来行動へ影響する stealth memory injection を定義する。WhisperBench は fact / preference poisoning と5 risk categories を含む108 case で、real IMAP/SMTP workflow と実際の email-agent skill を用い、攻撃の全 cycle を評価する。one-shot かつ runtime feedback なしの black-box 条件に対し、MemGhost は environment proxy で persistent agent の実行を模倣し、objective proxy で memory adoption と conversational stealth を密な rubric reward に変換して attacker policy を訓練する。56 held-out cases で、OpenClaw + GPT-5.4 に87.5%、Claude Code SDK + Sonnet 4.6 に71.4%の end-to-end success を報告し、異なる agent architecture と filesystem / vector memory backend への transfer も調べている。原文は persistent memory が “ordinary external processing” を長期 compromise の経路へ変えうると述べる。

## why_relevant_to_games

外部記事、Slack、playtest report、asset metadata を制作 agent の長期記憶へ取り込む運用で、収集時と recall-to-action 時の信頼境界を検討する材料になる。
