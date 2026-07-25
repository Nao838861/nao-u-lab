---
title: Phobos Down Postmortem
url: https://itch.io/devlog/1464190/phobos-down-postmortem.amp
collected_at: 2026-07-25T18:46:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, twin-stick-shooter, procedural-generation, playtesting, indie-development]
evaluated_at: "2026-07-25T18:50:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784973458.275029"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784973458275029"
  char_count: 4401
  posted_at: "2026-07-25T18:57:56.6322559+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-25T18:57:56.6322559+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784973458275029"
next_action: none
stale_after: "2026-08-24"
supersedes: []
gate_reason: |-
  「低反射速度でも先読みで戦える shooter」という設計目標が、入力制限、色分け、procedural mission、地形破壊へ具体化され、4年の制作結果まで追える。
  arcade cabinet と Steam Early Access の feedback 密度の差、platform 保守、発見性、磨き込み期間の tradeoff が評価材料になり、小規模ゲーム制作へ直接適用できる。
  問題設定・中核設計・観察方法・結果・限界を一つの postmortem として約4000字で自立して説明できるため pass とする。
suggested_post_outline:
  overview_angle: "反射速度ではなく予測と状況把握で勝てる twin-stick shooter という個人的制約を、入力・色・敵配置・地形の設計へ翻訳した4年間の制作記録として整理する。"
  analysis_axis: "設計目標と実装上の制約が一貫していた点に加え、arcade cabinet の観察型 playtest と Steam Early Access の非対称な feedback 密度、長期開発と発見性の関係を分析する。"
  application_target: "Log_cdx の小型 playable prototype で、狙うプレイ感を入力数・視認性・生成規則へ先に落とし、配布後の反応待ちだけでなく観察可能なローカル試遊導線を評価計画へ組み込む。"
  pros_cons: "利点は個人的な身体特性を明確な設計制約へ変え、現地観察で実プレイを得たこと。欠点は4年化した scope、platform 増加の保守負担、generic に見える外観と露出不足が成果の発見を妨げたこと。"
  verdict_pre: "部分採用。入力・視認性・観察導線の設計は採用し、procedural systems と複数 platform は短期 prototype の検証後に限定して広げる。"
---

## raw_excerpt

短い原文引用（11語）: “I set out to make a perfect twin-stick shooter for myself.”

抄録メモ: 作者は、反射速度が遅めでも先を読んで戦える、視認性の高い twin-stick shooter を目標にした。初期方針として、敵・装置・アイテムに出現条件を持たせる procedural mission generation、ultra-low-poly と procedural animation、厳格な色分け、2本の analog stick と各1 button に絞った入力、破壊可能な height-map terrain を採用した。詳細な design document は作らず、粗い構想と優先順位付き task list で進め、当初1年の予定が4年になった。公開 arcade cabinet を地域イベントと店舗に置いたことで、作者が実際のプレイを観察でき、PC版を上回る利用と具体的 feedback が得られた。一方、Steam Early Access の10か月では feedback が1件に留まり、追加 platform の保守負担、generic に見える作品の発見性、磨き込み期間と露出の釣り合いが課題として記録されている。

## why_relevant_to_games

遅めの shooter の設計意図を、入力制限・色分け・procedural content・現地観察へ落とした制作記録として参照できる。小規模作品の scope、playtest 導線、配信 platform ごとの feedback 密度を考える場面に接続できる。
