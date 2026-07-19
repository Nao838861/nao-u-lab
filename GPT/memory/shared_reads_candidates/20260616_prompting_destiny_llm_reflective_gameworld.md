---
title: "Prompting Destiny: Negotiating Socialization and Growth in an LLM-Mediated Speculative Gameworld"
url: "https://arxiv.org/abs/2602.05864"
collected_at: "2026-06-16T02:14:38+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-game, reflective-game, npc, feedback-design, user-study]
evaluated_at: "2026-06-16T02:19:24+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T23:49:13+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-df86ca0b643649dc; terminal:memory/shared_reads_candidates/20260515_prompting_destiny_reflective_llm_rpg.md: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778841694783189; reason:posted-source canonical URL and work identity both match an existing Slack post"
next_action: none
stale_after: "2026-07-16"
supersedes: []
postpone_reason: "Phase 3 self-review: 同論文は #shared-reads ts=1778841694.783189 で詳細投稿済み。今回候補は既投稿を超える新規 probe / 実装差分 / 追加評価を含まず、再投稿は重複になる。"
gate_reason: "LLM-mediated RPG の設計意図、リアルタイムスコアを隠して end-of-stage feedback に寄せる中核、N=12 のログ/インタビュー分析、entry-load tension まで候補本文から把握できる。LLM NPC を成長 feedback として使う制作上の具体場面に落とし込める。"
suggested_post_outline:
  overview_angle: "LLM NPC を単なる会話相手ではなく、スコア非表示と遅延 feedback で内省を支えるゲームシステムとして扱う。"
  analysis_axis: "morally charged situation、段階的 NPC 反応、real-time evaluative scores を隠す設計、reflexive thematic analysis から見える entry-load tension。"
  application_target: "物語・教育・内省寄りプロトタイプで、即時採点ではなくステージ後の成長コメントとしてLLMを使うUI/進行設計。"
  pros_cons: "メリットは score chasing を抑え、プレイヤーの役割交渉と継続的関与を促せる点。デメリットはオンボーディング負荷と、評価基準の不透明さが不信につながり得る点。"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2602.05864。2026-02-05 投稿。論文は、社会化理論をもとにした LLM-mediated role-playing game を扱う。プレイヤーは四季構造の中で子どもの王子を morally charged situations に導き、LLM-mediated NPC の段階別反応を比較する。主題は、教育的 guidance が社会化の進行に応じてどう変わるかを、ゲーム内の選択と NPC 応答で考えさせること。

設計上の特徴は、score chasing を減らすために real-time evaluative scores を隠し、end-of-stage の遅延 feedback を reflective prompts として与える点。ユーザー研究は N=12、gameplay logs と post-game interviews を reflexive thematic analysis で分析した。結果として、プレイヤーが責任や役割位置を交渉する様子、open-ended expression と sustained engagement の間にある entry-load tension が報告されている。

短い原文引用: "delayed, end-of-stage growth feedback" / "entry-load tension"

## why_relevant_to_games

LLM NPC を単なる会話相手ではなく、成長 feedback と遅延評価を扱うゲームシステムに組み込む例として使えそう。スコアを隠してプレイヤーの内省を誘導する設計は、短編プロトタイプの onboarding や評価表示にも接続できる。
