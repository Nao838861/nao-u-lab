---
title: "Praise the Architect and Pass the Ammunition: Health & Damage in 'The Outer Worlds 2'"
url: "https://gdcvault.com/play/1035682/Praise-the-Architect-and-Pass"
collected_at: "2026-07-18T14:01:54.4475084+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, balance, combat, fps, rpg, postmortem]
evaluated_at: "2026-08-17T03:34:44+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-17T03:34:44+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-17T03:34:44+09:00"
next_action: revise_or_research
stale_after: "2026-09-16"
supersedes: []
gate_reason: >-
  FPSの射撃感とRPGの成長曲線をHP・damageで両立させる問題は具体的だが、再読時点でも公開概要以上の根拠が候補にない。
  改訂前後の数値、破棄した設計思想、評価方法と結論がなく、約4000字の概要を事例と検証結果で支えられないため保留を継続する。
---

## raw_excerpt

GDC Vault 公式概要からの採録メモ。講演は「敵に何Hit Pointsを持たせるか」「プレイヤーのdamageをいくつにするか」「その計算へ影響するゲーム設計上の基礎構造は何か」という問いから、ゲームbalanceを扱う。対象の『The Outer Worlds 2』は、gunsによる射撃とleveling-upを同時に持つhybrid FPS/RPGで、このgenre mashupがhealthとdamageの調整に固有の難しさを生んだ。開発中にはNPC Hit Pointsとplayer damageを複数回改訂し、その都度、一部のdesign philosophyは明確になり、別のものは捨てられたとされる。講演は、game balanceについてのdesign theoryを提示し、その理由を説明したうえで、FPSとRPG双方のgenre expectationsによって単純な理論がどう複雑になるかを扱う。最終的にはHit Pointsとdamageを用いて「balanced」なゲームをどう作るかを検討し、全体を『The Outer Worlds 2』の具体例で支える構成である。登壇者はObsidian EntertainmentのRobert Donovan、GDC 2026のDesign枠。公開概要ではrevisionの回数、数式、実測値、破棄されたphilosophyの内容までは示されておらず、これらは講演本編で確認すべき一次情報として残る。

## why_relevant_to_games

アクションの瞬間的な手触りとRPG成長曲線が同居する場合に、HP・damageの数値調整をgenre expectationsや設計思想の改訂履歴と結びつけて収集できる。
