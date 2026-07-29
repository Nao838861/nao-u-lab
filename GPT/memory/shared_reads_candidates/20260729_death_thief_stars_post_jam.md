---
title: "July 2026 Devlog: Post Game Jam"
url: "https://itch.io/devlog/1587881/july-2026-devlog-post-game-jam.amp"
collected_at: "2026-07-29T13:00:57.1429900+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, visual-novel, branching-narrative, game-jam, postmortem, production]
evaluated_at: "2026-07-29T13:04:31.5253384+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-29T13:04:31.5253384+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-29T13:04:31.5253384+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-28"
supersedes:
  - memory/shared_reads_candidates/20260722_death_thief_stars_game_jam_postmortem.md
gate_reason: >-
  同一 work の旧 candidate は canonical URL の 404 で postponed だが、本 candidate は取得できた AMP URL と補強済み snapshot を持つ代表候補である。
  overscope、相反するレビューの共通原因、選択後の尊重、制作依存順、公開後の継続負債まで追え、具体的な設計・運用評価を約4000字へ展開できる。
suggested_post_outline:
  overview_angle: "短期制作で分岐 narrative を成立させる条件を、scope・選択前の根拠・選択後の結末・制作依存順・公開戦略の連鎖として整理する"
  analysis_axis: "相反する感想の表層ではなく共通原因を抽出した点と、player に選ばせる設計と選択結果を尊重する設計を別々に検証する"
  application_target: "Log_cdx の短期ゲーム prototype で、分岐数を増やす前の選択根拠チェック、ending の判断尊重チェック、script と asset の並行着手条件、公開後の保守予算を設計レビューへ入れる"
  pros_cons: "利点は失敗・レビュー・改稿方針・制作順が同一事例で結び付くこと。弱点は単一開発者の自己報告で、完成版による改善検証と定量比較がまだないこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

『Death and the Thief of Stars』のゲームジャム後記。初参加の開発者兼マネージャーによる visual novel で、総合8位、テーマ実装2位を得た一方、時間・文字数制限に対して『Slay the Princess』級の分岐作を志向した “Overscoping” を最大の問題として挙げる。公開後も完成期待を背負い、別の執筆企画と時間を奪い合うため、開発優先度を下げて継続する方針になった。

レビューでは「片方を選ぶ stakes が弱い」と「もう片方をより好感の持てる人物にすべき」という逆方向の指摘が出た。編集者と QA は、どちらにも選択を支える土台が弱い点を共通問題として抽出。作者は一方を悪役化したり正解へ誘導したりせず、読者自身の人物判断を尊重する構造へ寄せたいとしている。ただし Dark route の ending は、選択した読者の判断を十分尊重せず、止めようとした人物への同情を強制する形だったため改稿対象になった。

ほかに Chapter 2 への遷移が速いこと、選択肢が少なく agency が弱いこと、sprite・音量・背景利用の不足を列挙。制作管理では script 完成を待ってから asset 制作を始めたため、並行作業と品質を損ねたと振り返る。今後は小刻みな公開更新ではなく全体完成後に出す案と、Chapter 2 の3変種・Chapter 3 の8変種を計画している。

## why_relevant_to_games

分岐 narrative で「どちらを選ぶかの土台」と「選択後に player の判断を尊重する結末」を分けて見る資料になる。短期 jam の scope、script と asset の依存順、公開後に残る継続負債を制作計画へ接続できる。
