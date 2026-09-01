---
title: "Three games, 10 years, one Unity project: Piecing together The Immortal John Triptych"
url: "https://unity.com/blog/immortal-john-triptych-joe-richardson-interview"
collected_at: "2026-09-01T09:34:28+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, adventure-game, production, migration, accessibility, solo-dev]
evaluated_at: "2026-09-01T09:39:07+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-09-01T10:45:37.571019+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788223537571019"
next_action: none
stale_after: "2026-10-01"
supersedes: []
gate_reason: >-
  絵画断片から空間を作り、空間内の関係から puzzle、最後に story を接続する逆向き設計を、三作品統合時の ID 衝突・plugin 固定・入力再設計まで具体例で追える。
  創作上の制約と移行上の制約を「既存資産から関係を発見して再構成する」という一軸で分析でき、4000字級でも推測に頼らずゲーム制作への適用と限界を書ける。
suggested_post_outline:
  overview_angle: "art-first の創作考古学と、10年分の資産を壊さず統合する技術考古学を一続きの設計問題として解説する"
  analysis_axis: "先に仕様を固定せず既存素材の関係から構造を発見する利点と、ID・plugin・入力方式の暗黙依存が後年に課す移行コストの対照"
  application_target: "Log_cdx の adventure prototype で、visual motif 先行の puzzle 発見、project 統合前の namespace 棚卸し、controller 対応時の到達可能性テストに使う"
  pros_cons: "独自性と資産再利用を強める一方、後付け narrative の接続不良、古い plugin への固定、direct control 化に伴う hotspot 探索の再設計が必要"
  verdict_pre: "部分採用。art-first の探索手順と migration 棚卸しを採用し、技術依存と操作到達性には早期検証ゲートを置く"
posted:
  ts: "1788223537.571019"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788223537571019"
  char_count: 4455
  posted_at: "2026-09-01T10:45:37.571019+09:00"
---

## raw_excerpt

一次資料抜粋メモ（内容を日本語で要約）。Joe Richardson は、Renaissance / medieval painting の断片を先に集めて scene を組み、完成した空間を歩きながら物同士の関係から puzzle を見つけ、story は最後に接続するという、一般的な greybox-first と逆向きの制作順を説明している。三作品を一つの Unity project に統合した際は、Unity 本体の更新より Adventure Creator の movement system 変更の方が大きく壊れ、最新版 Unity と数年前の plugin を併用した。別 project 間では variable、dialogue ID、scene name が衝突し、同名の “Town” scene が三つある状態も解消対象になった。console 向け controller 対応では、容易な virtual cursor を避けて direct character control を採用したため、歩いて届かない hotspot を右 stick で探す仕組みまで必要になった。一方、旧作の読みにくい dialogue box を新作の表示へ統一することで、文章自体を変えずに可読性を改善した。

## why_relevant_to_games

art-first から puzzle / story を発見する逆向き設計と、長寿 project の統合で起きる ID・plugin・入力方式の migration 問題を同じ制作事例で追える。adventure prototype の空間先行設計や、既存作品を壊さず現代的操作へ移す場面の参照候補になる。
