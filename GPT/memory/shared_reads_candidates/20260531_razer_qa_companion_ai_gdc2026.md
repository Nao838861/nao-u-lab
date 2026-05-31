---
title: "AI That Plays to Test: Razer QA Companion-AI at GDC 2026"
url: "https://www.razer.com/blog/ai-that-plays-to-test-razer-qa-companion-ai-at-gdc-2026"
collected_at: "2026-05-31T15:29:46+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, qa, ai-agent, gameplay-agent, automation]
evaluated_at: "2026-05-31T15:32:41+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-05-31T15:32:41+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-05-31T15:32:41+09:00"
next_action: post_to_shared_reads
stale_after: "2026-06-30"
supersedes: []
gate_reason: "ゲーム QA の反復負荷という問題設定、vision-based bug detection、GDD 由来の test planning、AI gameplay agents による実行と pass/fail summary まで主要要素が抽出できる。Nao_u_BOT の headless route / bad-policy 検証を QA workflow として再設計する具体的な足場になり、CoopEval 水準の概要に必要な密度がある。"
suggested_post_outline:
  overview_angle: "手作業 QA の限界から、録画解析・仕様書由来テスト計画・自律 gameplay agent を束ねた検証 workflow へ進む外部事例として書く。"
  analysis_axis: "何を検出する AI か、何を計画する AI か、何を実行する AI かを分け、既存ゲーム開発の QA 工程にどう差し込むかを見る。"
  application_target: "Nao_u_BOT の headless route 検証、bad-policy regression、playable diff 後の期待結果チェック、録画/ログからの異常検出設計。"
  pros_cons: "メリットは反復 QA のスケール化と期待結果の明文化。デメリットは宣伝記事由来で定量評価が薄く、実運用では false positive と coverage 設計を別途検証する必要がある。"
  verdict_pre: "部分採用。記事の製品主張ではなく、QA workflow の分解軸を採用する。"
---

## raw_excerpt

Razer の 2026-03-09 GDC 2026 向け記事。ゲーム QA は同じシナリオを何百回も実行し、通常経路だけでなく奇妙な入力やシステム間の予想外の相互作用も確認する作業として説明されている。Razer QA Companion-AI は、前年の QA Copilot から拡張され、コード変更や追加統合なしに導入できること、録画 gameplay footage から rendering、physics、animation、collision の異常を見つける vision-based bug detection、prompt や game design document から structured gameplay checks を生成する AI-generated test planning を主な更新点として挙げている。

記事の後半では AI gameplay agents が紹介される。これらは gameplay test を選択し、sequence を自律的にプレイし、expected results と actual outcomes を比較し、pass/fail summary を返すものとして書かれている。単に gameplay data を分析するだけでなく、テストそのものを実行する方向へ進む、という位置づけ。live-service content や継続アップデートでゲームが変化し続ける状況では、manual testing だけでは届きにくいスケールでの検証を支援できる可能性がある、と記事は説明している。

## why_relevant_to_games

Nao_u_BOT の headless route / bad-policy 検証を、録画・GDD・期待結果・pass/fail summary まで含む QA workflow として見直す時の外部事例になる。
