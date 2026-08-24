---
title: "Tree-of-Concerns: Hierarchical Multi-Agent Debate for Unstated-Limitation Extraction in Scientific Critique"
url: "https://arxiv.org/abs/2608.20777v1"
collected_at: "2026-08-24T18:21:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, multi-agent, critique, game-design-research, playtesting]
evaluated_at: "2026-08-24T18:22:56.6076764+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787563773.446379"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787563773446379"
  char_count: 3965
  posted_at: "2026-08-24T18:29:33.446379+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-24T18:29:33.446379+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787563773446379"
next_action: none
stale_after: "2026-09-23"
supersedes: []
gate_reason: >-
  問題設定、専門観点別の debate tree、証拠接続、Panel Review、414 論文・1,905 limitation の評価と改善幅まで抽出でき、CoopEval 水準の概要へ展開できる。
  playtest・設計資料・postmortem の未記載失敗条件を観点別に探索し、カテゴリずれと深刻度を横断校正する具体的なレビュー手順として適用可能である。
suggested_post_outline:
  overview_angle: "未記載の失敗条件を、専門観点別の探索と横断校正で証拠付き concern に変える手法として解説する"
  analysis_axis: "debate tree の探索分担、証拠への接続、Panel Review による category drift と severity miscalibration の補正、ToC-Bench の評価妥当性"
  application_target: "Log_cdx がゲーム設計資料・playtest 報告・postmortem を点検し、操作理解・支配戦略・難度曲線・技術制約ごとの未記載失敗条件を抽出するレビュー工程"
  pros_cons: "観点漏れと根拠のない一般論を減らせる一方、persona 分割の設計コスト、同質な批判の重複、科学論文からゲーム資料への外的妥当性に注意が必要"
  verdict_pre: "部分採用"
---

## raw_excerpt

科学論文では、著者が限界を十分に明記しない場合があり、後続研究や査読で初めて失敗条件が見つかる。Tree-of-Concerns は、そのような未記載の limitation を抽出するため、異なる観点を持つ specialist skeptic persona を並列の debate tree として配置する multi-agent framework である。各 persona は担当カテゴリに沿って、本文の証拠に接続した懸念を段階的に組み立てる。残った主張は Panel Review が五つの観点から再検討し、途中で論点カテゴリがずれる category drift や、問題の深刻度を過大・過小評価する severity miscalibration を補正する。

評価用の ToC-Bench は 414 本の研究論文と 1,905 件の unstated limitation からなり、正解側の懸念は reviewer が報告した weakness と後続 citation による critique から構成される。著者らは、最強 baseline と比べて precision が 79%、coverage が 11%向上したと報告し、単に反対意見を増やすのではなく、具体的かつ evidence-grounded な concern を抽出できると説明する。対象は科学論文批評だが、専門観点ごとの探索、主張を証拠へ結ぶ手順、最後に横断 review でカテゴリずれと深刻度を直す構成が中核である。

## why_relevant_to_games

ゲーム設計資料、playtest 報告、postmortem の「書かれていない失敗条件」を、操作理解・支配戦略・難度・技術制約などの観点別に拾う review 手順へ転用できる可能性がある。
