---
title: "How Grabbit 2 Simulates Physics Inside the Unity Editor"
url: "https://80.lv/articles/how-grabbit-2-simulates-physics-inside-the-unity-editor"
collected_at: "2026-08-25T04:20:37+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, level-design, unity, editor-tools, physics, mcp]
evaluated_at: "2026-08-25T04:25:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-25T04:25:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-25T04:25:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-24"
supersedes: []
gate_reason: |-
  一時 physics world、局所 scene cache、convex decomposition、非同期 bake、Undo / crash recovery まで、問題と実装上の解決が具体的に揃っている。
  level dressing、自動 level-building、AI tool の安全な操作境界へ直接適用でき、失敗条件も含めて CoopEval 水準の概要を構成できるため通過とする。
suggested_post_outline:
  overview_angle: "配置座標を生成する道具ではなく、編集時だけ動く復旧可能な局所 physics simulation として Grabbit 2 を解説する。"
  analysis_axis: "初版の全 scene 走査・一時 component 残留・Undo 不安定を、spatial cache、temporary pool、parallel bake、session recovery でどう解いたかを見る。"
  application_target: "Nao_u_BOT の制作ツールで、prop 配置を非破壊 simulation として試し、結果だけ commit する editor workflow と MCP tool 境界へ適用する。"
  pros_cons: "利点は自然な配置、多数 object の局所処理、Undo と中断復旧。弱点は collider 近似の品質、bake cost、物理設定差による再現性、AI 操作時の変更範囲管理。"
  verdict_pre: "部分採用。まず小規模 scene で選択範囲限定・preview・commit/rollback を持つ配置 probe に落とす。"
---

## raw_excerpt

著作権に配慮し、記事本文の逐語引用ではなく要点を日本語で採取する。Grabbit 2 は、Unity の Edit Mode 内で選択物を物理 simulation に投入し、settle 後の結果だけを transform へ書き戻す level design / set dressing 用 plugin である。実行時 collider や Rigidbody が元 object に付いていなくても、近傍 mesh を解析して一時的な physics world を組み立てる。Grabbit 1 が scene 全体を先読みしたのに対し、再構築版は selection 周辺だけを空間 cache から読み、他の Rigidbody と project physics settings を退避・復元する。concave mesh は複数の convex piece へ分解し、Balance、Precision、Performance の三方式を提供する。高精度 bake 中は近似 collider を先に使い、操作を止めない。

初版で残った問題として、script recompile や crash 時に一時 Rigidbody が残る、large scene で遅い、Undo が不安定、Editor window との往復で scene 文脈が切れる、という点が挙げられる。Grabbit 2 は interrupted session の state を記録して次回 load 時に復旧し、spatial cache、temporary collider pool、parallel bake、Unity Undo、Scene toolbar integration を導入した。操作は Select / Create / Place / Arrange / Scatter の五 mode に分かれ、weighted prop 生成、surface slide、overlap 回避、line・curve 配置、物理的な pile や variation を扱う。任意の MCP integration では、Unity 内 AI assistant が座標を推測する代わりに、同じ物理配置 operation を tool として呼び出せる。

## why_relevant_to_games

level dressing を「座標生成」ではなく、非破壊で復旧可能な editor-time simulation として実装する具体例。大規模 scene の局所処理、Undo、crash recovery、AI tool 化を、制作ツール設計と自動 level-building の両方で参照できる。
