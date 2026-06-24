---
title: "Draw2Think: Harnessing Geometry Reasoning through Constraint Engine Interaction"
url: "https://arxiv.org/abs/2605.20743"
collected_at: "2026-06-18T04:15:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [spatial-reasoning, tool-use, puzzle, game-design]
evaluated_at: "2026-06-18T04:30:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781722673.511989"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781722673511989"
  char_count: 3517
  posted_at: "2026-06-18T03:57:53.511989+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-18T03:57:53.511989+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781722673511989"
next_action: none
stale_after: "2026-07-18"
supersedes: []
gate_reason: "VLM の幾何推論を単なる説明生成ではなく、constraint engine 上の Propose-Draw-Verify loop として外部化する中核が明確。predicate-level と strict problem-level の construction check もあり、手法と評価を分解して概要化できる。ゲーム制作では puzzle、レベル設計、空間ルール検証の中間状態を constraint canvas に逃がす発想として具体的に使える。"
suggested_post_outline:
  overview_angle: "LLM/VLM に空間を頭の中で解かせず、制約エンジン付き canvas を shared workspace にする手法として紹介する。"
  analysis_axis: "Propose-Draw-Verify loop、typed action、engine feedback、construction fidelity と measurement faithfulness の分離を見る。"
  application_target: "パズル、レベル設計、当たり判定、空間制約つき生成物の検証 loop。"
  pros_cons: "利点は中間状態を検証可能にできる点。弱点は GeoGebra 的に表せる制約へ問題を落とす前処理が重い点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2605.20743。2026-05-20 submitted。Juncheng Hu ほかによる、VLM の幾何推論を GeoGebra constraint engine との相互作用に外部化する研究。問題設定は、テキスト推論や一回きりの drawing code では、中間状態が本当に制約を満たす構成になっているか保証できないこと。

Draw2Think は Propose-Draw-Verify loop を使う。モデルが仮説を typed action として提案し、constraint engine が実行または拒否し、正確な幾何量と制約状態を観測として返す。論文要旨では、canvas を shared workspace として使うことで、model-level の construction fidelity と engine-level の measurement faithfulness を分けて監査できるとされる。GeoGoal では predicate-level 95.9%、strict problem-level 84.0% の construction check を通し、planar / solid benchmark でも outcome accuracy の改善が報告されている。project page も公開されている。

## why_relevant_to_games
パズル、レベル設計、空間ルール、当たり判定のような「見た目ではなく制約が正しいか」を扱う場面に効く。LLM に盤面やレベルを説明させるだけでなく、制約エンジンを working memory にして playable な中間状態を検査する方向の材料。
