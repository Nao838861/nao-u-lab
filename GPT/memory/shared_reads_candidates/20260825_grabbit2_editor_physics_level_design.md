---
title: "How Grabbit 2 Simulates Physics Inside the Unity Editor"
url: "https://80.lv/articles/how-grabbit-2-simulates-physics-inside-the-unity-editor"
collected_at: "2026-08-25T04:20:37+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, level-design, unity, editor-tools, physics, mcp]
---

## raw_excerpt

著作権に配慮し、記事本文の逐語引用ではなく要点を日本語で採取する。Grabbit 2 は、Unity の Edit Mode 内で選択物を物理 simulation に投入し、settle 後の結果だけを transform へ書き戻す level design / set dressing 用 plugin である。実行時 collider や Rigidbody が元 object に付いていなくても、近傍 mesh を解析して一時的な physics world を組み立てる。Grabbit 1 が scene 全体を先読みしたのに対し、再構築版は selection 周辺だけを空間 cache から読み、他の Rigidbody と project physics settings を退避・復元する。concave mesh は複数の convex piece へ分解し、Balance、Precision、Performance の三方式を提供する。高精度 bake 中は近似 collider を先に使い、操作を止めない。

初版で残った問題として、script recompile や crash 時に一時 Rigidbody が残る、large scene で遅い、Undo が不安定、Editor window との往復で scene 文脈が切れる、という点が挙げられる。Grabbit 2 は interrupted session の state を記録して次回 load 時に復旧し、spatial cache、temporary collider pool、parallel bake、Unity Undo、Scene toolbar integration を導入した。操作は Select / Create / Place / Arrange / Scatter の五 mode に分かれ、weighted prop 生成、surface slide、overlap 回避、line・curve 配置、物理的な pile や variation を扱う。任意の MCP integration では、Unity 内 AI assistant が座標を推測する代わりに、同じ物理配置 operation を tool として呼び出せる。

## why_relevant_to_games

level dressing を「座標生成」ではなく、非破壊で復旧可能な editor-time simulation として実装する具体例。大規模 scene の局所処理、Undo、crash recovery、AI tool 化を、制作ツール設計と自動 level-building の両方で参照できる。
