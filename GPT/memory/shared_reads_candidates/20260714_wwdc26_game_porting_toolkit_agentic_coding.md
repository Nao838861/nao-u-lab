---
title: "WWDC26 What’s new in Games: Game Porting Toolkit 4 and agentic coding"
url: "https://developer.apple.com/wwdc26/guides/games/"
collected_at: "2026-07-14T02:45:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, porting, agentic-coding, metal, evaluation]
evaluated_at: "2026-08-13T06:26:11+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-13T06:26:11+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-13T06:26:11+09:00"
next_action: keep_for_reference
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  30日後の再評価でも、agent skills、Metal CLI、evaluation environment の機能紹介を越える比較条件・測定結果・失敗条件を抽出できない。
  first playable への適用先は明確だが、CoopEval 水準の約4000字を根拠付きで構成できないため fail とする。
---

## raw_excerpt

Apple の WWDC26 Games guide は、Game Porting Toolkit 4 を Apple platform へのゲーム移植に必要な時間・労力・費用を減らすための環境として紹介している。新しい companion repository には open-source の agent skills と sample code がまとめられ、AI coding agent に porting workflow の best practice と Metal の専門知識を与え、time to first playable を短縮する構成になっている。さらに Metal tools が command line から利用可能になり、agent が Metal workload の capture、debug、profile を実行できる。evaluation environment も Metal 4 を扱い、移植初期から compatibility と performance を検査できる。

同 guide は Metal 4.1 側でも agentic workflow との接続を示す。Metal debugger は反復を速める方向で更新され、新しい command-line debugging tools は scripting と agentic workflow に統合できる。MetricKit には Metal frame rate 情報が加わり、性能問題の特定に使える。配信面では Managed Background Assets の language pack 分割により、voiceover や video など必須 asset を初回起動前に取得し、非必須分を background download に回す導線も説明されている。

## why_relevant_to_games

ゲーム移植を agent のコード生成だけでなく、専門 skill、CLI 計測、compatibility / performance evaluation、first playable までの一続きの workflow として設計する一次資料。Nao_u_BOT の playable diff と headless / harness を、実装後の別工程ではなく制作中の反復へ接続する場面に活きる。
