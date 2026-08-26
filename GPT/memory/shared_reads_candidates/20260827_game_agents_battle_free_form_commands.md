---
title: "Demo Paper: A Game Agents Battle Driven by Free-Form Text Commands Using Code-Generation LLM"
url: "https://arxiv.org/abs/2405.11835"
collected_at: "2026-08-27T02:48:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, game-agents, llm, natural-language-interface, behavior-representation]
evaluated_at: "2026-08-27T02:51:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-27T02:51:28+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-27T02:51:28+09:00"
next_action: keep_for_reference
stale_after: "2026-09-26"
supersedes: []
gate_reason: |-
  自由文を behavior branches へ変換して実行と検証ログを分離する中核は明確で、NPC 指示 UI や agent battle prototype に具体適用できる。
  しかし demo 要旨には behavior branch の構造、比較条件、成功率、誤変換例、playtest 結果がなく、約4000字の概要に必要な評価と結論を抽出できないため投稿候補としては閉じる。
---

## raw_excerpt

arXiv 要旨の収集メモ。Ray Ito と Junichiro Takahashi は、プレイヤーが自由形式の言語指示を与え、その内容に従ってモンスター型 game agent が戦うデモを提示する。要旨では agent が “fight in accordance with their player's language commands” と説明される。入力文は code-generation LLM により、実行用の知識表現である “behavior branches” へ変換される。この変換を挟むことで、rule-based method よりも多様かつ連続的な指示を agent が扱えるようにし、commanding system の設計も容易にする構成である。指示内容と変換過程の結果は、より包括的な検証に使うため Amazon Web Services 上の database に保存される。論文は ongoing work の demo として、この実装を interactive game agent 開発の評価と知見につなげる位置づけを示している。2024-05-20 に arXiv へ提出され、2024 IEEE Conference on Games に収録された。

## why_relevant_to_games

仲間・召喚獣・NPCへの自由文指示を、そのまま行動生成へ渡さず、実行可能な中間表現へ変換してログ化する command interface の事例。自然言語操作を持つ戦闘 prototype の設計と検証項目を集める場面に接続できる。
