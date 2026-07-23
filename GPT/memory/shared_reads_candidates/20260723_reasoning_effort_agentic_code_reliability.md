---
title: "Reasoning effort, not tool access, buys first-try reliability in agentic code generation: an observational study"
url: "https://arxiv.org/abs/2607.02436v1"
collected_at: "2026-07-23T10:47:11.6281902+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, game-development, coding-agent, evaluation, harness, visual-quality]
---

## raw_excerpt

Achint Mehta による観察研究。詳細な同一仕様からリアルタイムのレトロスペクティブボードを作る独立した90回の agent run を用意し、14項目・42点満点の機能 rubric と visual quality review で比較した。条件には複数世代のモデル、2種類の agent harness、2段階の reasoning effort、ブラウザベースの testing tool、2種類の design-oriented prompt が含まれる。frontier model は上限付近へ集まる一方、低価格の local model は24〜37点だった。初回失敗で最大だったのは container deployment で、全runの44%が失敗した。testing tool の追加はコストを42〜68%増やしたが、機能点や信頼性、UI上で見える項目の改善には結び付かなかった。reasoning effort を High から xHigh へ上げると、初回完全成功が28%から89%へ増え、修正promptは約5分の1になり、追加コストは9〜29%だった。design-oriented prompt は機能点を上げず、visual quality を5点満点の3.0から4.5へ上げたうえ、その効果はdirectiveを1段落に言い換えても再現した。論文は、失敗の種類に応じて対策を変える必要があり、観測された初回失敗の多くは表示確認toolで見つける問題より、推論の弱さに由来したと述べる。

## why_relevant_to_games

coding agent にゲーム試作を作らせる際、実装成功・見た目・デプロイ失敗を分離して測り、ブラウザ確認tool、推論強度、design promptのどれへ予算を配るか決める場面に接続できる。
