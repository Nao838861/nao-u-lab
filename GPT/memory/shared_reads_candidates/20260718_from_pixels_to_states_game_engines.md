---
title: "From Pixels to States: Rethinking Interactive World Models as Game Engines"
url: "https://arxiv.org/abs/2607.14076"
collected_at: "2026-07-18T00:30:13+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-engine, world-model, game-state, player-action, dataset, evaluation]
evaluated_at: "2026-07-18T00:32:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-18T00:32:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-18T00:32:00+09:00"
next_action: revise_or_research
stale_after: "2026-08-17"
supersedes: []
gate_reason: >-
  action-state-observation loop と4評価軸はゲーム制作への接続が明確だが、候補本文には比較評価の設計・定量結果・限界・結論を支える根拠が不足している。
  現状では問題設定と着想の紹介に偏り、CoopEval 水準の約4000字を重複なく構成できないため、原論文から評価内容を補うまで保留する。
---

## raw_excerpt

論文は、生成映像をプレイヤー入力で動かせることと、ゲームエンジンとして成立することを分けて扱う。通常のゲームエンジンを action-state-observation の再帰ループとして捉え、入力が明示的な状態をルールに従って更新し、その結果が観測映像へ描画される構造を基準に置く。interactive game world model を、(1) player action control、(2) game state dynamics、(3) state-observation persistence、(4) real-time interactive generation の4軸で整理する。

状態表現は、pixels 内に状態を暗黙化する方式、learned latent state を再帰更新する方式、symbolic/textual な explicit state を保つ方式に分類される。pixels のみではルールが相関に埋まり、latent は注釈なしで拡張しやすい一方で解釈しにくく、explicit state は検証可能だが大規模な状態注釈データを要する。長期持続性については、過去観測を保存する memory と、画面外でも変化する現在状態を推定する memory を分け、不可逆な損傷や boss phase のような結果を再登場時にも維持する必要を挙げる。

補完的成果として、Black Myth: Wukong の boss encounter から90時間超の gameplay を収集する data engine を示す。30 FPS の映像に keyboard/mouse input、engine から得た ground-truth game state、RGB、depth map をframe単位で整列し、action/state の slot-structured annotation と semantic caption も付与する。

## why_relevant_to_games

生成映像の見栄えではなく、入力・明示状態・永続する結果・応答遅延を一つのゲームループとして観測する整理は、game world model の設計資料と、headless/telemetry用ログ項目を決める場面に接続できる。
