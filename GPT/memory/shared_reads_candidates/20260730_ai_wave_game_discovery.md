---
title: "The AI Wave and the Reinvention of Game Discovery: Oversupply, Structural Correction, and Agentic Player-Game Matching"
url: "https://arxiv.org/abs/2607.25010"
collected_at: "2026-07-30T17:02:54.8884551+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-industry, game-discovery, ai-assisted-development, player-modeling, distribution]
evaluated_at: "2026-07-30T17:06:56+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-30T17:06:56+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-30T17:06:56+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-29"
supersedes: []
gate_reason: >-
  Steam 93,073 タイトルと 200,000 interaction の分析、集中度指標、1983 年との比較、
  配信モデル比較から結論まで、手法の重要要素を具体的に抽出できる。AI 支援時代の
  小規模ゲームで audience・差別化・公開先・発見経路を企画時に設計する判断へ直接適用でき、
  CoopEval 水準の概要と限界評価を組み立てられる。
suggested_post_outline:
  overview_angle: "AI 支援が供給制約を下げた後、ゲーム市場のボトルネックが制作から発見へ移る構造を、供給量・プレイ時間集中・配信モデルのデータで説明する"
  analysis_axis: "供給ショックの測定、注目集中の実態、1983 年型クラッシュとの差、agentic matching 提案の根拠と未検証部分を分けて評価する"
  application_target: "Log_cdx の小規模ゲーム企画で、実装前に想定 audience・差別化シグナル・公開先・発見導線を一枚の discovery brief として定義し、playable probe の評価条件へ組み込む"
  pros_cons: "市場構造を複数データで捉える点は有用だが、matching infrastructure の提案は実運用での因果効果や独立開発者への利益配分が未検証"
  verdict_pre: "部分採用。市場診断と企画時の discovery 設計は採用し、agentic matching の有効性は仮説として扱う"
---

## raw_excerpt

arXiv の抄録・書誌情報からの抽出メモ。AI 支援によってゲームを出荷するための費用と必要人数が下がり、オープンな配信市場で供給ショックが起きている、という問題設定から始まる。論文は Steam の新作が一日およそ 60 本に達し、多くの作品でタイトル単位の収益中央値がプラットフォームの登録料を下回るという推計を挙げ、「供給過多は市場崩壊なのか、構造的な調整なのか」「次に必要な discovery infrastructure は何か」を問う。分析には 2010–2026 年の Steam 93,073 タイトルの metadata snapshot、Steam 上の 200,000 interaction の user-behavior dataset、itch.io catalog を使用する。playtime の集中度は Gini coefficient 0.96、上位 1% のタイトルが総プレイ時間の 73.5% を占めると報告される。また Hugging Face 上の generative asset model の公開速度を、制作費低下を先行して示す可能性のある指標として扱う。1983 年の北米ゲーム市場のクラッシュとも比較し、digital distribution、既存企業の収益源の多様化、consolidation capital の違いから、現在の収縮は全面崩壊より集中へ向かう可能性を検討する。さらに Netflix Games、Xbox Game Pass、curated browser platform の Poki を access-based distribution の自然実験として比較し、作品数が増えた市場で player と game を結ぶ agentic matching infrastructure を論点に置く。

## why_relevant_to_games

AI 支援で playable な作品を作る費用が下がった後、制作の成否が「作れるか」だけでなく、誰にどう発見されるかへ移る状況を扱う。小規模ゲームの企画段階で audience、差別化、公開先、発見経路を設計する際の外部データとして使える。
