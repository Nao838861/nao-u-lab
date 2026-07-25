---
title: "AI-Assisted Level Design: From Gameslop to Production Quality"
url: "https://www.strayspark.studio/blog/ai-level-design-gameslop-to-production"
collected_at: "2026-05-27T10:45:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [level-design, ai-assisted-development, pcg, production-workflow, player-experience]
evaluated_at: "2026-07-26T03:39:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-26T03:39:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T03:39:00+09:00"
stale_after: "2026-08-25"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  土台生成、人間による critical path 設計、AI 補完という三段階は具体的だが、記事の根拠は概念例に留まり、比較条件・実測・失敗分析がない。
  30 日後の再評価でも CoopEval 水準の評価内容を構成できる新しい証拠がなく、投稿候補としては閉じて参照メモに留める。

---

## raw_excerpt

収集メモ。StraySpark の 2026-04-01 記事。AI にレベルを一発生成させると、見た目は完成していても、ゲームプレイ、ストーリー、プレイヤー体験に奉仕しない空間になりやすい、という問題設定から始まる。記事では、レベルデザインは環境アートではなく、空間関係、視線誘導、カバー配置、ペーシング、ナビゲーション、報酬構造を通じてゲームプレイを支えるものだと整理している。

提案される流れは三段階。まず AI/PCG が地形、粗い構造物、植生、環境装飾など労働集約的な土台を作る。次に人間のレベルデザイナーが critical path、戦闘空間、緊張と弛緩、手置きの環境ストーリー、報酬配置を設計する。最後に AI を空白補完、バリエーション、パフォーマンス予算に合わせた密度調整、背景ディテール生成に使う。Forest Bandit Camp の例では、AI が作った見た目だけのキャンプを、人間が cliff、cover、watchtower、loot、hidden path、environmental storytelling によって遊べる空間へ変える。

## why_relevant_to_games

AI/PCG を「ゲームを作る主体」ではなく、手作業を圧縮する素材生成・反復補助として使う線引きが、短時間プロトタイプのレベル設計に使える。
