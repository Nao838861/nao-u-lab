---
title: "Playtesting: What is Beyond Personas"
url: "https://arxiv.org/abs/2107.11965"
collected_at: "2026-06-12T08:57:03+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, automated-testing, procedural-personas, rl]
evaluated_at: "2026-06-12T10:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781224652.357689"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781224652357689"
  char_count: 3545
  posted_at: "2026-06-12T09:37:52+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-12T09:37:52+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781224652357689"
next_action: none
stale_after: "2026-07-12"
supersedes: []
gate_reason: "固定目標の procedural persona では多様な経路を拾えない、という問題設定が明確。developing persona と Alternative Path Finder の二本柱、GVG-AI / VizDoom / PPO による評価まであり、手法の重要要素を概要化できる。headless 自動プレイテストで別目的・別経路を掘る具体適用先がある。"
suggested_post_outline:
  overview_angle: "procedural persona を固定ゴールの代理プレイヤーから、目的が発達し経路を重複回避する探索者へ拡張する研究として書く。"
  analysis_axis: "固定 persona の限界、developing persona、APF、RL 評価環境、得られる playtest feedback の差を軸に整理する。"
  application_target: "Nao_u_BOT の headless 評価で、単一スコアや最短ルートではなく未踏経路・別目的プレイヤーを出す評価 harness に効く。"
  pros_cons: "利点は自動評価が設計探索に近づく点。弱点は RL 実装と報酬設計の負担、生成された persona が人間の解釈に直結しない可能性。"
  verdict_pre: "部分採用。まず既存プロトタイプの route coverage と goal variation の probe として使う。"
---

## raw_excerpt

著作権配慮のため、arXiv abstract の長文引用ではなく要点メモとして保存する。Sinan Ariyurek ほかによる automated playtesting 研究。問題設定は、ゲームデザイナーが playtest feedback を使って設計を改善する一方、procedural persona による自動化では persona が固定目標へ向かいがちで、多様なプレイ経路やプレイヤー像を十分に出せないこと。提案は 2 つ。1 つ目は developing persona で、固定 goal の procedural persona と違い、persona が異なる goal へ進行できるようにする。2 つ目は Alternative Path Finder (APF) で、人間プレイテスターが過去に試した道を覚えて別経路を試すのに対し、通常の RL agent が過去経路を無視しがちな点へ対処する。GVG-AI と VizDoom で PPO agent を使って評価し、developing persona がゲーム内で異なるプレイヤーがどう動くかをよりよく示すと説明している。

短い原文断片: "developing persona" / "Alternative Path Finder"

## why_relevant_to_games

headless 評価を平均スコアや単一 route だけで終わらせず、既に通った経路を避ける、別目的のプレイヤーを動かす、という自動プレイテスト設計に使える。
