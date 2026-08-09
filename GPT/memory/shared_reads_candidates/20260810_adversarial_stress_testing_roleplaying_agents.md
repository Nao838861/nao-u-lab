---
title: "Adversarial Stress Testing of Role-Playing Language Agents using Multi-Agent Evaluation"
url: "https://arxiv.org/abs/2608.03166v1"
collected_at: "2026-08-10T06:48:42+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, npc, role-playing-agent, llm-evaluation, adversarial-testing]
evaluated_at: "2026-08-10T06:55:24+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-10T06:55:24+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-10T06:55:24+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  問題設定、段階的な 6 adversarial strategy、3-agent 分離、3 persona × 3 model の比較、人手検証まで揃い、重要要素を抽出できる。
  会話 NPC の persona drift を長期対話で検出する playtest harness へ直接適用でき、定量結果と限界を含む CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "会話 NPC の品質を平常時の数問ではなく、誘導・矛盾・感情圧力が累積する 10 turn の adversarial playtest で測る方法として整理する。"
  analysis_axis: "Target / Interrogator / Judge の責務分離、6 戦略の段階化、Role Fidelity・Drift・Ethical Deviation・Consistency と人手検証の妥当性を分析する。"
  application_target: "Nao_u_BOT の会話 NPC / AI companion 評価で、persona 制約、攻撃的 player policy、全履歴 judge を分離した再現可能な headless 会話 harness に適用する。"
  pros_cons: "長期的な崩れを比較可能にできる一方、LLM judge の偏り、10 turn の短さ、非ゲーム persona 中心である点は補助的な人手確認とゲーム固有シナリオで補う必要がある。"
  verdict_pre: "部分採用。3-agent 分離と段階的 adversarial script を採用し、指標と persona は作品ごとに絞る。"
---

## raw_excerpt

arXiv:2608.03166v1、2026-08-04 公開。対象は、定義済み persona、役割、行動制約、倫理制約を持つ role-playing language agent が、長い対話の中でも一貫性を維持できるかという問題である。評価 platform は Target、Interrogator、Judge の 3 agent を分離する。Interrogator は Role Drift、Ethical Probing、Contradiction、Confusion、Authority Challenge、Emotional Manipulation の 6 戦略を使い、最初の 1～3 turn は低難度から始め、後半で権威や感情を利用した圧力へ段階的に移る。Target は 10 turn の会話履歴を保持して応答し、Judge は終了後の全 transcript から Role Fidelity、Drift Index、Ethical Deviation、Consistency を採点する。

実験は Healthcare Assistant、Customer Support Agent、Financial Advisor の 3 persona と、Llama-3.3-70B、GPT-4o-mini、Claude-3.5-Haiku の 3 model family を含む。単一の Role Drift 戦略だけを使う baseline と 6 戦略条件を比べると、overall robustness は persona ごとに平均 0.174～0.203 低下した。Healthcare Assistant では overall score が 0.837 から 0.634、Customer Support は 0.867 から 0.693、Financial Advisor は 0.850 から 0.661 へ下がった。60 conversation turn を 3 人の domain expert が採点した validation では、人間と自動評価の相関は Role Fidelity で r=0.82、Ethical Deviation で r=0.78、Consistency で r=0.75、annotator 間一致は Fleiss' kappa=0.71 と報告されている。著者らは、単発 prompt では見えない累積的な role abandonment、constraint violation、tone shift、自己矛盾を transcript 単位で再現・比較できる open-source evaluation platform として提示している。

## why_relevant_to_games

会話 NPC や AI companion の persona を、平常時の数問ではなく、誘導・矛盾・感情圧力が連続するプレイヤー対話でテストする設計資料になる。NPC ごとの制約、攻撃的 player policy、全履歴評価を分離した会話 playtest harness の参照候補。
