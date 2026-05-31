---
title: "AI That Plays to Test: Razer QA Companion-AI at GDC 2026"
url: "https://www.razer.com/blog/ai-that-plays-to-test-razer-qa-companion-ai-at-gdc-2026"
collected_at: "2026-05-31T15:29:46+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, qa, ai-agent, gameplay-agent, automation]
---

## raw_excerpt

Razer の 2026-03-09 GDC 2026 向け記事。ゲーム QA は同じシナリオを何百回も実行し、通常経路だけでなく奇妙な入力やシステム間の予想外の相互作用も確認する作業として説明されている。Razer QA Companion-AI は、前年の QA Copilot から拡張され、コード変更や追加統合なしに導入できること、録画 gameplay footage から rendering、physics、animation、collision の異常を見つける vision-based bug detection、prompt や game design document から structured gameplay checks を生成する AI-generated test planning を主な更新点として挙げている。

記事の後半では AI gameplay agents が紹介される。これらは gameplay test を選択し、sequence を自律的にプレイし、expected results と actual outcomes を比較し、pass/fail summary を返すものとして書かれている。単に gameplay data を分析するだけでなく、テストそのものを実行する方向へ進む、という位置づけ。live-service content や継続アップデートでゲームが変化し続ける状況では、manual testing だけでは届きにくいスケールでの検証を支援できる可能性がある、と記事は説明している。

## why_relevant_to_games

Nao_u_BOT の headless route / bad-policy 検証を、録画・GDD・期待結果・pass/fail summary まで含む QA workflow として見直す時の外部事例になる。
