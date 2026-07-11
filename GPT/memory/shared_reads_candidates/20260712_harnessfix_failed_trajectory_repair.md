---
title: "From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws"
url: "https://arxiv.org/abs/2606.06324"
collected_at: "2026-07-12T08:40:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-dev, agent, harness, evaluation, debugging, automated-testing]
---

## raw_excerpt

LLM agent の失敗を最終成否だけで扱うと、どの実行ステップに原因証拠があり、prompt・tool interface・context・verification など harness のどの実装要素を直すべきかを特定できず、広すぎる修正になりやすい。HarnessFix は raw execution trace と harness artifact を Harness-aware Trace Intermediate Representation (HTIR) に変換し、断片化した証拠を正規化する。HTIR は step-level の data-flow / control-flow と、各 runtime step に影響した harness artifact の対応を保持する。

その表現を使って、失敗を責任のある step と artifact に帰属し、繰り返し現れる診断を repair-oriented flaw record に統合する。さらに flaw ごとの scoped repair operator と修正仕様から patch を生成し、regression-aware validation を通ったものだけ受理する。4つの benchmark で初期 harness より 6.3%〜18.4%改善し、人手設計および self-evolution baseline を上回ったと報告されている。論文の中心は、失敗 trajectory を単なる feedback signal ではなく、harness mechanism を診断・修復するための構造化証拠として扱うことにある。

## why_relevant_to_games

headless bot や自動テストプレイが失敗した時、ゲーム側の難度・bot policy・観測・入力変換・判定器のどこが原因かを trace と実装要素の対応から切り分ける設計に活用できる。
