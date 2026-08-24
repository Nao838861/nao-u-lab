---
title: "Tree-of-Concerns: Hierarchical Multi-Agent Debate for Unstated-Limitation Extraction in Scientific Critique"
url: "https://arxiv.org/abs/2608.20777v1"
collected_at: "2026-08-24T18:21:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, multi-agent, critique, game-design-research, playtesting]
---

## raw_excerpt

科学論文では、著者が限界を十分に明記しない場合があり、後続研究や査読で初めて失敗条件が見つかる。Tree-of-Concerns は、そのような未記載の limitation を抽出するため、異なる観点を持つ specialist skeptic persona を並列の debate tree として配置する multi-agent framework である。各 persona は担当カテゴリに沿って、本文の証拠に接続した懸念を段階的に組み立てる。残った主張は Panel Review が五つの観点から再検討し、途中で論点カテゴリがずれる category drift や、問題の深刻度を過大・過小評価する severity miscalibration を補正する。

評価用の ToC-Bench は 414 本の研究論文と 1,905 件の unstated limitation からなり、正解側の懸念は reviewer が報告した weakness と後続 citation による critique から構成される。著者らは、最強 baseline と比べて precision が 79%、coverage が 11%向上したと報告し、単に反対意見を増やすのではなく、具体的かつ evidence-grounded な concern を抽出できると説明する。対象は科学論文批評だが、専門観点ごとの探索、主張を証拠へ結ぶ手順、最後に横断 review でカテゴリずれと深刻度を直す構成が中核である。

## why_relevant_to_games

ゲーム設計資料、playtest 報告、postmortem の「書かれていない失敗条件」を、操作理解・支配戦略・難度・技術制約などの観点別に拾う review 手順へ転用できる可能性がある。
