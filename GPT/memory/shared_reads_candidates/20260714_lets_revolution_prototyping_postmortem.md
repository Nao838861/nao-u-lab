---
title: "Postmortem: Prototyping Let’s! Revolution! to transform Minesweeper into a turn-based strategy roguelike"
url: "https://www.gamedeveloper.com/production/prototyping-i-let-s-revolution-i-transforming-i-minesweeper-i-into-a-turn-based-strategy-roguelike"
collected_at: "2026-07-14T10:00:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, prototyping, puzzle, roguelike, procedural-generation]
evaluated_at: "2026-08-13T04:23:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-13T04:23:00+09:00"
last_decision: postpone
duplicate_reason: duplicate_of_terminal_sibling
evidence: "gate_decision:postpone; evaluated_at:2026-08-13T04:23:00+09:00; duplicate_of_posted:memory/shared_reads_candidates/20260526_lets_revolution_minesweeper_prototyping.md; permalink:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779769858830679"
next_action: none
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  canonical URL と work identity が 2026-05-26 の既投稿 candidate に一致し、再投稿に値する分析差分がない。
  内容品質の再評価は行わず、Phase 3 対象から除外する。
---

## raw_excerpt

4 人の小規模チームが一年以内の商用完成を目標に、Minesweeper の規則と turn-based tactics を組み合わせた過程を追う postmortem。出発点は「Minesweeper の規則を一本の path に適用したら何が起きるか」で、remote 環境の digital whiteboard 上に grid、隠し layer、emoji placeholder を置き、コードを書く前に検証した。初期 Unity build では tile reveal の回数を energy にしたが、checkerboard 状に開ける単調な最適行動が生じたため、health と danger に変更した。さらに 50/50 の blind guess が agency を損なう問題から、隣接移動する pawn と Mana ability を導入し、tile reveal を空間探索へ変換した。安全 tile で Mana を得て、推測した危険 tile を ability で処理する loop が形成された。その後は enemy attack clock、異なる Mana economy を持つ class、dead-end shop、trait を組み替える ScriptableObject 構成へ展開。maze は perfect maze 生成後に dead-end を刈り込み、enemy placement は challenge rating と saturation を目標に組合せを探索する。記事は、既知 mechanic の新しい組合せ、短い期限、incremental な改良、完成優先が scope 維持に寄与したと記録する。

## why_relevant_to_games

紙相当の最小 probe から支配戦略・不公平な推測・player fantasy を順に発見し、既知 mechanic の組合せを完成可能な core loop に育てる具体的な制作記録として使える。
