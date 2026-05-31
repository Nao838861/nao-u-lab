---
title: "RuleSmith: Multi-Agent LLMs for Automated Game Balancing"
url: "https://arxiv.org/abs/2602.06232"
collected_at: "2026-05-16T21:29:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, balancing, llm-agents, playtesting, multiagent]
evaluated_at: "2026-05-16T21:33:15+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T09:08:30+09:00"
last_decision: posted
stale_after: "2026-06-15"
supersedes: []
gate_reason: |
  問題設定、LLM self-play と Bayesian optimization の組み合わせ、CivMini 上の評価指標、返される rule adjustments が候補メモだけでも分離できる。
  Nao_u_BOT の小規模対戦/資源管理プロトタイプで、勝率差や行動分布を deterministic probe にして数値調整へ接続できるため、ゲーム制作への適用が具体的。
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778803710961519"
next_action: none
posted:
  ts: "1778803710.961519"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778803710961519"
  char_count: 3594
  posted_at: "2026-05-15T09:08:30+09:00"
  note: "2026-05-16 Phase 3 で同一 URL の既存 #shared-reads 投稿を検出したため、重複投稿せず既存投稿へ紐付け。"
suggested_post_outline:
  overview_angle: "手作業の感覚的バランス調整を、LLM self-play による高速評価と Bayesian optimization に分けて扱う研究として書く。"
  analysis_axis: "agent が評価者、optimizer が探索者、game engine が検証環境になる三層構造と、win-rate disparity などの metric が設計判断をどう制約するか。"
  application_target: "Nao_u_BOT の対戦・資源管理系プロトタイプで、面白さ判断の前段に balance probe を置き、調整候補を少数に絞る工程。"
  pros_cons: "利点は調整反復を速くし、変更理由を rule adjustment として残せる点。弱点は LLM agent のプレイ傾向が人間とずれる点と、metric を誤ると最適化が作品意図を潰す点。"
  verdict_pre: "部分採用。自動バランス決定ではなく、数値調整候補を出す検査工程として使う。"

---

## raw_excerpt
arXiv:2602.06232。Ziyao Zeng ほか。2026-02-05 submitted。

抄録メモ: ゲームバランス調整を、手作業の反復 playtesting と expert intuition だけに寄せず、game engine、multi-agent LLM self-play、Bayesian optimization を組み合わせる枠組みとして扱う。実験対象は CivMini という簡略化された civilization-style game で、異なる faction、economy、production rules、combat mechanics を持ち、それぞれに tunable parameter がある。LLM agent は textual rulebook と game state を読み、action を生成し、win-rate disparity などの balance metrics を高速評価する。探索側は multi-dimensional rule space に対して Bayesian optimization、acquisition-based adaptive sampling、discrete projection を使い、有望な候補には評価ゲームを多く、探索的候補には少なく割り当てる。結果として balanced configuration へ収束し、downstream game systems に適用できる interpretable rule adjustments を返す、という主張。

## why_relevant_to_games
ゲーム制作で「面白いが数値調整が詰め切れない」段階に、LLM self-play と deterministic metric を組み合わせる候補。特に小規模シミュレーションや対戦/資源管理プロトタイプの balance probe に接続できる。
