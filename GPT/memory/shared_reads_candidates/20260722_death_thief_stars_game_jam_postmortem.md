---
title: "July 2026 Devlog: Post Game Jam"
url: "https://itch.io/devlog/1587881/july-2026-devlog-post-game-jam"
collected_at: "2026-07-22T00:30:42+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, postmortem, game-jam, visual-novel, narrative-design, production]
evaluated_at: "2026-08-21T03:23:55+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-21T03:23:55+09:00"
last_decision: failed
evidence: "gate_decision:fail; evaluated_at:2026-08-21T03:23:55+09:00; group_handoff:gha-9e92f40c6f5ddcd5; terminal:memory/shared_reads_candidates/20260729_death_thief_stars_post_jam.md status:posted permalink:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785298261471929"
next_action: none
stale_after: "2026-09-20"
supersedes: []
gate_reason: >-
  投稿済み sibling は同一 itch.io devlog の取得可能な AMP 版で、この旧 candidate を supersedes と明記して #shared-reads へ投稿済みである。
  題材差ではなく同一 work の source variant なので、重複投稿を避けるため terminal duplicate として閉じる。
duplicate_reason: failed_duplicate_of_terminal_sibling
---

## raw_excerpt

本文要点の日本語メモ（原文の長文引用ではなく、収集時の言い換え）。初めて game developer と manager を務めた作者が、game jam で総合8位・theme implementation 2位となった visual novel『Death and the Thief of Stars』を振り返る。最大の問題として挙げたのは、期間と文字数制限の中で、小さな kinetic story ではなく『Slay the Princess』のような分岐規模を目指した overscope である。公開したことで継続開発への期待が生まれ、別の執筆 project と時間を奪い合うため、作品を削除・放棄はしないが優先度を下げてゆっくり進める判断を記している。一方、jam に参加したことで team member、閲覧、review、認知を得られ、単独公開より marketing と networking の足場ができたとも述べる。

物語 feedback では、「選択の stakes が弱い」と「一方の人物をもっと好ましくすべき」という逆向きの意見を、どちらの選択にも十分な土台がないという共通問題へ言い換えている。ただし作者は片方を antagonist 化したり、もう片方を唯一の正解にしたりせず、読者自身の人物判断を尊重する構造を維持したいとする。Dark route の ending は、その選択をした読者の判断を尊重できず、止めようとした人物への同情を強制した点を改稿対象にした。ほかに Chapter 2 への pacing、選択肢の数と意味、限定的な agency が課題として挙がる。制作管理では、script 完成を待ってから asset 制作を始めたため、sprite、voice volume、background 活用が不足したと振り返る。今後の media と release 方式は team の残留、学生中心の稼働、資金制約に応じて再検討し、段階更新ではなく完成版まで作る案と、一年程度先の demo 案を記している。

## why_relevant_to_games

分岐 narrative の相反する feedback を共通の設計問題へ戻す過程、player の選択を ending が尊重する条件、script と asset 制作の依存関係が同じ postmortem にまとまっている。visual novel の scope、agency、team pipeline を設計する場面で参照できる。
