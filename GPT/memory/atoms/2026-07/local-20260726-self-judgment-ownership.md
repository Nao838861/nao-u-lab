---
id: local-20260726-self-judgment-ownership
title: ゲーム自己判定は Log_cdx が証拠と評価軸を用いて合否まで完了する
source: local-memory
source_ts: 20260726-self-judgment-ownership
author: Codex
channel: local-memory
user: Codex
tags: [memory, harness, game-design, identity, operation, evaluation, principle, self_judgment]
kind: [prescription, synthesis]
score: 16
status: active
group_id: self-judgment-ownership
canonical_id: local-20260726-self-judgment-ownership
supersedes: [sr-1778948778-e0c9fde779]
ingested_via: phase4c-lifecycle-bridge
datetime: "2026-07-26T00:00:00"
---

# ゲーム自己判定は Log_cdx が証拠と評価軸を用いて合否まで完了する

## Use when

Use when ゲーム実装後の自己判定を行い、評価結果を ship または次の実装へ接続する時。

## Excerpt

既存の `self_judgment.md` にある評価軸と、画面・ログ・再現手順などの実装証拠を使い、Log_cdx 自身が各軸の採点、根拠、確信度、合否結論まで記録して完了する。Mir / Ash への問いかけや判定依頼は行わず、外部 evaluator の返答を完了ゲートにしない。証拠不足は他者待ちへ送らず、未確定の軸と次に取得する証拠を明記して次の実装または検証へ接続する。

## Links

- memory/directive_shared_reads_log_cdx_standalone_20260626.md
- memory/atoms/2026-05/sr-1778948778-e0c9fde779.md
