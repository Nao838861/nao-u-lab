---
title: "An Empirical Evaluation of AI-Powered Non-Player Characters' Perceived Realism and Performance in Virtual Reality Environments"
url: "https://arxiv.org/abs/2507.10469"
collected_at: "2026-05-26T00:51:01+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, vr, user-study, llm, latency]
evaluated_at: "2026-05-26T01:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-26T01:05:54+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779725154850429"
posted:
  ts: "1779725154.850429"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779725154850429"
  char_count: 3527
  posted_at: "2026-05-26T01:05:54+09:00"
stale_after: "2026-06-25"
supersedes: []
next_action: none
gate_reason: |-
  VR interrogation simulator、GPT-4 Turbo NPC、18人 user study、SUS/GEQ/believability/latency 測定、約7秒 latency と emotion/personality の弱さという結論が揃っている。
  会話 NPC の品質を「賢さ」だけでなく待ち時間、believability、感情・人格の薄さへ分解でき、ゲーム制作の評価ログ設計へ具体的に適用できる。
suggested_post_outline:
  overview_angle: "LLM NPC を VR で動かした時、リアリズムと性能を同時に測る実証研究として整理する。"
  analysis_axis: "体験評価尺度、会話サイクル latency、believability の内訳、usable だが感情・人格と応答待ちが課題という結果を軸に読む。"
  application_target: "会話 NPC、チュートリアル役、推理・尋問・案内役の headless/人手評価で、遅延と人格評価を別ログに分ける設計。"
  pros_cons: "利点は実装時に見るべき測定項目が明確な点。弱点は参加者数とシナリオが限定的で、非 VR や高速アクションへの一般化には注意が必要な点。"
  verdict_pre: "部分採用。LLM NPC の実装方式そのものより、評価項目と失敗検出のチェックリストとして採用候補。"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv metadata / abstract の要点メモとして保存する。

論文は、VR interrogation simulator に AI-powered NPC を組み込み、perceived realism、usability、system performance を評価する。シナリオには suspect と partner の2体の NPC が登場し、GPT-4 Turbo を使って参加者と会話し、参加者は suspect の有罪・無罪を判断する。評価は 18 participants の user study で、System Usability Scale、Game Experience Questionnaire、Virtual Agent Believability Questionnaire、さらに speech-to-text、text-to-speech、LLM 応答、全体 cycle latency の測定を含む。結果として、平均 cycle latency は約 7 秒で、会話 context が増えるほど影響を受ける。believability は 10点中 6.67 とされ、behavior、social relationships、intelligence は高めだが、emotion と personality は中程度。SUS は 79.44 で、usable だが、latency reduction と emotional depth が課題として残る、という構成。

## why_relevant_to_games
LLM NPC の「賢そうに話す」だけではなく、遅延、信頼感、感情・人格の薄さをユーザー評価で分けて見る材料。会話NPCやチュートリアル役を作る時、面白さ以前に何秒待たせると体験が崩れるか、どの項目を評価ログに入れるかの候補になる。
