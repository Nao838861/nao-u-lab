---
title: "Hunter Diorama GMTK 2026 Postmortem"
url: "https://itch.io/devlog/1609220/hunter-diorama-gmtk-2026-postmortem.amp"
collected_at: "2026-08-24T01:30:36+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, tactical-rpg, mechanics, onboarding, balancing, postmortem, game-jam]
evaluated_at: "2026-08-24T01:34:12.0635746+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-24T01:40:52+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787503228368619"
next_action: none
posted:
  ts: "1787503228.368619"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787503228368619"
  char_count: 4499
  posted_at: "2026-08-24T01:40:52+09:00"
stale_after: "2026-09-23"
supersedes: []
gate_reason: >-
  短期制作で機構を削った過程と、charge damage、turn skip、RNG、逆向きの時間表示、tutorial 過密が生んだ問題を具体例と結果まで追える。
  制作中の mechanic audit、支配戦術の探索、UI の対応関係、段階的 onboarding、作者バイアスを横断して約4000字の独立した分析へ展開できるため pass とする。
suggested_post_outline:
  overview_angle: "6-slot timeline と 3 lane へ絞った短期設計が、情報圧縮と相互作用の検証不足を同時に生んだ postmortem として整理する"
  analysis_axis: "各 mechanic の面白さではなく、被弾コスト・待機・予測可能性・表示方向・学習順序が一つの decision loop として整合していたかを分析する"
  application_target: "Log_cdx の短期ゲーム prototype で、Day 1 の interaction map、無行動を含む支配戦術 probe、UI 数値と時間軸の方向確認、mechanic 一個ずつの onboarding fight に適用する"
  pros_cons: "利点は4日間の実装判断と失敗が具体的で小さな検証項目へ落とせること。限界は定量 playtest がなく、単一作者・単一 jam 作品の事後分析で一般化範囲が狭いこと"
  verdict_pre: "部分採用。個別 mechanic の処方箋ではなく、短期 prototype の相互作用・表示・学習順序を同時監査するチェックとして採用する"
---

## raw_excerpt

原文の要点を日本語で採録する。『Hunter Diorama』は、Star Renegades の timeline を 60 単位から 6 slot へ縮約し、Front / Middle / Back の 3 lane を加えた tactical RPG である。行動の charge に使う slot 数だけ damage を受け、敵を攻撃すると行動を遅らせ、十分な stagger で turn から押し出せる。制作初期には grid tactics、card chain、chess piece 別移動、部位破壊まで同居していたが、4日間 jam の Day 2 に大半を削り、3 lane の side-by-side combat へ作り直した。完成版では、charge damage が被弾を二重に罰する一方、player が「何もしない turn」で health を温存する未想定の戦術を発見した。boss attack の RNG は学習可能な puzzle 性を弱め、急造した forecast はほぼ使われなかったという。tutorial は 3 turn に情報を詰め、slot は 6→1 と数えるのに skill は time cost で示すため、cost 5 が slot 2 に置かれる逆向きの表現になった。stagger pushback、time cost、turn skip の説明も欠け、作者自身が対象 genre を好む前提で playtest した結果、一般 audience には難しすぎた。記事は、攻撃 pattern を固定 chain にして予測と習熟を支える案、mechanic ごとに fight を 3 段階へ分ける onboarding 案も記している。

## why_relevant_to_games

複数 mechanic を短期 prototype へ畳む際の削減単位、timeline UI の表現方向、未想定の「何もしない」支配戦術、作者自身による playtest の偏りを、具体的な tactical RPG の失敗例として参照できる。
