---
title: "BayesEvolve: Explicit Belief States for Autonomous Scientific Discovery"
url: "https://arxiv.org/abs/2606.30335"
collected_at: "2026-07-10T11:59:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, evaluation, search, game-design, prototype-iteration]
evaluated_at: "2026-07-10T12:06:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-10T12:52:12+09:00"
last_decision: postponed_duplicate
evidence: "duplicate shared-reads post already exists: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783428279451079"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: |-
  問題設定、belief state の中核、BBOB-style black-box optimization による評価、baseline / ablation / held-out predictive check の結論まで抽出できる。
  ゲーム制作では、試作履歴を単なる成功例 archive ではなく不確実性付きの次手選択モデルとして扱う設計に直結するため、Log_cdx の prototype iteration に適用しやすい。
suggested_post_outline:
  overview_angle: "LLM agent の探索履歴を、過去ログではなく不確実性付き belief state として持つ設計"
  analysis_axis: "archive-guided / memory-guided baseline と、predictive belief + annealed uncertainty bonus の違い"
  application_target: "ゲーム試作の次パラメータ、bot policy、評価プローブ選択を belief-guided にする運用"
  pros_cons: "探索集中と sample efficiency が利点。評価は BBOB 中心で、実ゲーム制作への転用は小さな probe から始める必要がある"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2606.30335。2026-06-29 submitted。著者は Xuening Wu, Shan Yu, Qianya Xu, Shenqin Yin。要旨では、自律的な scientific discovery agent が LLM で仮説を提案する際、過去の高得点候補アーカイブや直近試行の heuristic summary だけを条件にする設計では不十分だと置く。代わりに、候補品質に対する uncertainty-aware belief を明示的に保持すべきだと主張する。BayesEvolve は experimental evidence を predictive belief state に変換し、その belief を次の実験選択へ使う framework。制御された testbed として shifted BBOB-style black-box optimization tasks で評価し、program discovery や laboratory discovery は今後課題として残す。固定 evaluation budget の下で、memory-guided / archive-guided LLM baseline より sample efficiency を改善したとされる。また held-out candidate pool 上で belief state が predictive であること、decision-rule ablation では annealed uncertainty bonus を持つ belief-guided selection が有利であること、late-stage で unfocused exploration ではなく productive concentration を示すことが報告されている。

## why_relevant_to_games
ゲーム試作の探索を「過去に良かった案の再利用」だけで回さず、不確実性つき belief と評価予算で次の prototype / parameter / bot policy を選ぶ候補として使える。
