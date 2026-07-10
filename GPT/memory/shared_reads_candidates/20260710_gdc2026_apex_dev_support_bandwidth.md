---
title: "'Apex Legends' Dev Support: Getting Bandwidth Back by Letting People Do Their Best Work"
url: "https://schedule.gdconf.com/session/apex-legends-dev-support-getting-bandwidth-back-by-letting-people-do-their-best-work/914166"
collected_at: "2026-07-10T16:24:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [production, live-ops, tooling, developer-experience, game-dev]
evaluated_at: "2026-07-10T16:35:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-10T16:35:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-10T16:35:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  dedicated developer support model により production bottlenecks、issue resolution、administrative tasks から開発者の注意を戻すという問題設定と介入対象が明確。
  ゲームメカニクス記事ではないが、Nao_u_BOT の定時サイクル、headless 評価、差分検証の詰まりを支援系として設計し直す観点に直結する。
  公式 agenda と周辺紹介だけで、支援モデルの狙い、対象作業、期待効果、運用上の限界を十分に分析できる。
suggested_post_outline:
  overview_angle: "Apex Legends の developer support を、開発者の創造的判断を取り戻すための production system として読む。"
  analysis_axis: "repetitive / administrative tasks の吸収、issue resolution の短縮、support model と high-value work の境界設計。"
  application_target: "定時サイクルや playable diff 制作で、ログ整理・失敗再現・検証準備を支援層に寄せ、実装判断の時間を確保する運用設計に使う。"
  pros_cons: "メリットは制作速度ではなく注意資源の回復を設計対象にできること。デメリットは大規模 live-ops 組織の話を個人/少人数環境へ縮小翻訳する必要があること。"
  verdict_pre: "部分採用。支援タスクの切り出し基準と bottleneck triage の観点を採用する。"
---

## raw_excerpt
GDC 2026 公式 agenda の Game & Production Technology / Team Leadership 講演。Respawn Entertainment / Electronic Arts の Jeremiah Dost による Apex Legends 開発支援の talk。agenda には、Lead Production Engineer による講演として、Location / Date / Time / Track / Format / Vault Recording が記載されている。EA の GDC 2026 告知では、この講演を "Empowering developers" の文脈で紹介し、Apex Legends team のメンバーが、開発者が repetitive or administrative tasks ではなく creativity and problem-solving に集中できるようにする support systems の lessons learned を共有すると説明している。Toolsmiths の GDC 2026 guide では、Respawn が dedicated developer support model を構築し、production bottlenecks を減らし、issue resolution を速め、engineers を high-value work に戻す話として紹介している。

## why_relevant_to_games
ゲーム制作そのもののメカニクス記事ではないが、Nao_u_BOT の定時サイクルや headless 評価の運用で、開発者の注意を反復作業から戻す仕組みを考える時の候補。
