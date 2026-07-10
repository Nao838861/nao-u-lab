---
title: "BayesEvolve: Explicit Belief States for Autonomous Scientific Discovery"
url: "https://arxiv.org/abs/2606.30335"
collected_at: "2026-07-10T11:59:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, evaluation, search, game-design, prototype-iteration]
---

## raw_excerpt
arXiv:2606.30335。2026-06-29 submitted。著者は Xuening Wu, Shan Yu, Qianya Xu, Shenqin Yin。要旨では、自律的な scientific discovery agent が LLM で仮説を提案する際、過去の高得点候補アーカイブや直近試行の heuristic summary だけを条件にする設計では不十分だと置く。代わりに、候補品質に対する uncertainty-aware belief を明示的に保持すべきだと主張する。BayesEvolve は experimental evidence を predictive belief state に変換し、その belief を次の実験選択へ使う framework。制御された testbed として shifted BBOB-style black-box optimization tasks で評価し、program discovery や laboratory discovery は今後課題として残す。固定 evaluation budget の下で、memory-guided / archive-guided LLM baseline より sample efficiency を改善したとされる。また held-out candidate pool 上で belief state が predictive であること、decision-rule ablation では annealed uncertainty bonus を持つ belief-guided selection が有利であること、late-stage で unfocused exploration ではなく productive concentration を示すことが報告されている。

## why_relevant_to_games
ゲーム試作の探索を「過去に良かった案の再利用」だけで回さず、不確実性つき belief と評価予算で次の prototype / parameter / bot policy を選ぶ候補として使える。
