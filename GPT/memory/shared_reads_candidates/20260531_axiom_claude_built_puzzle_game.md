---
title: "Axiom - The Game Claude Built"
url: "https://penguinboisoftware.com/blog/axiom.html"
collected_at: "2026-05-31T11:14:47+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-game-dev, puzzle, headless, playtesting, emergent-systems]
evaluated_at: "2026-05-31T11:18:36+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-05-31T11:18:36+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-05-31T11:18:36+09:00"
next_action: post_to_shared_reads
stale_after: "2026-06-30"
supersedes: []
gate_reason: |
  問題設定、AI 主導制作、headless simulation、corner trap、brute force 解、winnability test の偽陽性まで重要要素が具体的に残っている。
  Nao_u_BOT の headless 評価で「通った理由が設計意図と一致するか」を見る評価軸へ直接接続でき、4000字級の概要にも耐える。
suggested_post_outline:
  overview_angle: "AI が作ったパズルを、実プレイ破綻と headless simulation で設計し直す制作記録として読む"
  analysis_axis: "winnability test、失敗再現、偶然通るテスト、設計意図とエンジン合格のずれ"
  application_target: "Nao_u_BOT の headless 評価、bad-policy 分離、devlog 保存、AI 制作物の自己検証"
  pros_cons: "具体的な失敗事例が強い一方、単一開発記録なので一般化は評価軸へ抽象する必要がある"
  verdict_pre: "採用"
---

## raw_excerpt
著作権配慮のため長文引用ではなく、記事本文の要点メモとして保存する。Penguinboi Software の 2026-04 記事。Axiom は、Claude が自律的に設計・実装したとされる grid puzzle game で、プレイヤーが WHEN-THEN 形式の行動ルールを組み、エンティティの emergent behavior を観察して目的状態を作る。人間側の役割は主に blind playtest と破綻報告で、Claude は設計・コード・テスト・devlog を担当したという構成。

重要部分は、設計問題が実プレイで露出し、それを headless simulation とルール改修で閉じていくループ。Level 2 では flee ルールが bounded rectangular grid の corner trap に収束し、100 trials の pure engine simulation で毎回 tick 34 に失敗することを確認。修正は toroidal grid 化。Level 7 では brute force が意図解と同じ結果を出すため puzzle になっていない問題が出て、goal に上限を設けることで population-gated creation を必要にした。さらに rule ordering を教える level の後で、Claude 自身が preset rules の順序を間違え、winnability tests が「正しい理由」ではなく偶然通る問題も記録されている。

## why_relevant_to_games
AI にゲームを作らせる時、headless test は必要だが「合格理由が設計意図と一致しているか」を別に見る必要がある。Nao_u_BOT の headless 評価・bad-policy 分離・devlog 保存の参照候補。
