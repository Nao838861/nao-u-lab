---
title: "Market Design for AI: Beyond the Copyright Binary"
url: "https://arxiv.org/abs/2606.12260"
collected_at: "2026-06-25T11:30:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-creation, economics, originality, creative-pipeline, risk]
evaluated_at: "2026-06-25T11:33:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-25T11:33:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-25T11:33:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-25"
supersedes: []
gate_reason: "AI 支援創作の市場設計を、free-for-all と強い知的財産権の二分法では扱えないという問題設定が明確。originality penalty、curse of precision、人間生成コンテンツを AI 学習へ戻す時の均質化ループという中核があり、ゲーム素材生成の多様性管理に自然に接続できる。"
suggested_post_outline:
  overview_angle: "AI 生成を使うほど創作市場が均質化し得るという動学的リスクを、ゲーム制作パイプラインの素材・企画生成に引き寄せて概要化する。"
  analysis_axis: "市場設計の二分法批判、originality penalty、curse of precision、学習データへの再流入、制度設計と制作現場ルールの対応を整理する。"
  application_target: "キャラ案、テキスト、アセット案、レベル案を大量生成する時の探索多様性、採用基準、human contribution 記録、再学習素材の扱い。"
  pros_cons: "メリットは AI 利用を禁止論ではなく設計問題として扱える点。デメリットは経済モデル由来で、個別ゲーム制作では検証指標へ翻訳する必要がある点。"
  verdict_pre: "部分採用。生成物の量ではなく、候補分布の多様性と人間の選択理由を残す運用ルールへ落とす。"
---

## raw_excerpt
短い原文断片: "originality penalty" / "curse of precision"。

arXiv:2606.12260。2026-06-10 submitted。論文は、人間生成コンテンツを AI 学習に使う市場設計について、free-for-all と強い知的財産権の二分法だけでは高品質・独創的コンテンツへの誘因を保ちにくい、という問題を扱う。特に、AI 支援創作への依存が高まると、均質化したコンテンツが再び学習データへ入り、モデル性能を下げる動学的な失敗が起きる、という構図を示している。ゲーム制作文脈では、素材生成や企画案生成を大量に回すとき、短期効率と創作多様性の関係を見るための外部理論候補。

## why_relevant_to_games
AI 生成物をゲーム企画・キャラ・テキスト・アセット案へ使う時、似た案ばかり増えるリスクや、人間の独創的 contribution をどう残すかの議論に使える。
