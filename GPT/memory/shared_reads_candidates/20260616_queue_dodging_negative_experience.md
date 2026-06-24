---
title: "GG Go Next... Lobby: How Players Use Queue Dodging to Anticipate and Avoid Negative Experiences in League of Legends"
url: "https://programs.sigchi.org/chi/2026/program/content/221954"
collected_at: "2026-06-16T22:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multiplayer, toxicity, player-behavior, matchmaking, chi2026]
evaluated_at: "2026-06-16T22:51:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-16T22:59:26+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781618351102799"
next_action: none
posted:
  ts: "1781618351.102799"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781618351102799"
  char_count: 3616
  posted_at: "2026-06-16T22:59:11+09:00"
stale_after: "2026-07-16"
supersedes: []
gate_reason: |-
  queue dodging を迷惑行為だけでなく、予測された悪い体験を避ける防御行動として分析している点が強い。
  Reddit 2,932 件の主題分析と動機分類があり、ロビー・マッチング・離脱罰則設計への接続が具体的。
suggested_post_outline:
  overview_angle: "離脱を罰則対象として見る前に、プレイヤーが何を予測し何から逃げているかを分解する論文として書く。"
  analysis_axis: "toxic teammate、不利 matchup、システム利用、外的事情という動機分類と、それぞれが設計に要求する対処の違い。"
  application_target: "協力型/対戦型ゲームのロビー、再マッチ、降参、部屋抜け、NPC/agent チーム編成の UX 評価に効く。"
  pros_cons: "LoL 文脈の濃さはあるが、離脱行動を単一カテゴリに潰さない分析枠として有用。"
  verdict_pre: "採用。マッチング前後の負体験予測を設計レビュー項目に落とせる。"
---

## raw_excerpt
出典上の短い表現: "How Players Use Queue Dodging to Anticipate and Avoid Negative Experiences"。

この CHI 2026 論文は、League of Legends の Champion Select 中にマッチから抜ける queue dodging を、単なる迷惑行為ではなく、プレイヤーが悪い体験を予測して回避する行動として分析する。検索結果および SIGCHI ページの概要では、2,932 件の Reddit 投稿・コメントを主題分析し、主な動機として toxic teammate の回避、不利な matchup の回避、システムメカニクスの利用、外的事情への反応を挙げている。queue dodging は toxic act としてだけでなく、toxicity を避ける防御的な戦略にもなり得る、という扱いになっている。

## why_relevant_to_games
マッチング・ロビー・リトライ導線を設計する時に、離脱を罰するだけではなく「何を避けようとしている行動か」を分解する材料になる。
