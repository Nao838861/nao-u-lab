---
title: "Who embraces AI in play? Exploratory modeling of player preference profiles toward game AI"
url: "https://arxiv.org/abs/2605.09550"
collected_at: "2026-05-16T13:29:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-ai, player-research, player-segmentation, ai-in-games]
evaluated_at: "2026-05-16T13:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-16T13:36:23+09:00"
last_decision: posted
stale_after: "2026-06-15"
supersedes: []
gate_reason: |-
  game AI 受容を単一賛否ではなく cross-context な態度 profile として扱う問題設定、771名調査、Archetypal Analysis、7 profile、関連要因探索まで手法の重要要素が揃っている。
  LLM NPC や AI 補助生成をプレイヤー層別に設計する判断へ直結し、約4000字の概要でも問題設定・手法・分類・適用・限界を具体的に展開できる。
suggested_post_outline:
  overview_angle: "game AI への受容を「AI 好き/嫌い」ではなく、用途横断の態度 profile として分解し、どの AI 機能を誰に見せるべきかを考える材料として整理する。"
  analysis_axis: "8つの game AI application context、centered acceptance ratings、Archetypal Analysis による7 profile、logistic regression による AI literacy・遊び方・背景・性格・用途優先度との関連を軸にする。"
  application_target: "Nao_u_BOT の LLM NPC、AI 生成補助、AI game master 的要素で、プレイヤー層ごとに露出する AI 機能・隠す AI 機能・説明すべき価値を分ける設計に使う。"
  pros_cons: "長所は AI 機能単位ではなくプレイヤー態度の束として設計できる点。短所は探索的 profile であり、個別作品にそのまま当てはめるには小規模な観察やテストが必要な点。"
  verdict_pre: "採用。AI 要素を入れる前の player model と feature exposure の評価軸として使う。"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778906173600739"
next_action: none
posted:
  ts: "1778906173.600739"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778906173600739"
  char_count: 4120
  posted_at: "2026-05-16T13:36:23+09:00"

---

## raw_excerpt

著作権配慮のため、arXiv abstract の長文引用ではなく要点メモとして保存する。対象は Ting-Chen Hsu ほかによる 2026-05-10 submitted の HCI 論文。ゲーム AI への受容は用途依存であることが知られているが、この研究は「個別機能への賛否」ではなく、複数文脈にまたがる受容パターンを profile としてモデル化する。

短い原文句: "cross-context AI acceptance" / "Archetypal Analysis" / "context-sensitive"

質問紙データは 771 名の digital game players。8 つの代表的な game AI application context に対する acceptance ratings を centered し、Archetypal Analysis で解釈可能な態度プロファイルを抽出している。抽出された profile は AI-Skeptics, Broad AI-Supporters, Creative-Play Explorers, Experience-Oriented Supporters, Systemic Order Advocates, Emotion-Centered Supporters, Governance-Skeptics の 7 種。さらに one-vs-rest logistic regression で、profile membership と perceived AI literacy, gaming habits, disciplinary background, personality traits, application-specific priorities との関連を探索している。

## why_relevant_to_games

LLM NPC や AI 補助生成を「良い/悪い」で一括判断せず、プレイヤー層ごとに受け入れられる AI 機能が違う前提で設計するための候補。Nao_u 作品で AI 要素を入れる場合、どのプレイヤーに何を見せ、何を隠すかを考える材料になる。
