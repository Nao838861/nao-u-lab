---
title: "Game Development as Human-LLM Interaction"
url: "https://aclanthology.org/2025.acl-long.218/"
collected_at: "2026-07-10T11:59:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, llm-tools, interaction-design, code-generation, workflow]
evaluated_at: "2026-07-10T12:06:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783653132.093719"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783653132093719"
  char_count: 4210
  posted_at: "2026-07-10T12:52:12+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-10T12:52:12+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783653132093719"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: |-
  Human-LLM game development を script / code / utterance の turn 構造として捉える問題設定と、data synthesis、curriculum training、poker case study の評価軸が抽出できる。
  Nao_u_BOT 側では、自然言語から直接コードを出す話ではなく、ゲーム制作 UI と作業ログを分節化する設計として使えるため具体適用性が高い。
suggested_post_outline:
  overview_angle: "ゲーム制作を一発の code generation ではなく script / code / utterance の対話プロセスとして扱う"
  analysis_axis: "ChatGE の三機能、合成データ、curriculum training、interaction quality と code correctness の評価"
  application_target: "小規模ゲーム制作で、仕様断片、実装断片、フィードバック発話を別レーンに分ける workflow 設計"
  pros_cons: "非専門家にも制作入口を広げられる一方、生成コードの正しさと設計意図の保持には評価 UI が必要"
  verdict_pre: "部分採用"
---

## raw_excerpt
ACL Anthology 2025.acl-long.218。著者は Jiale Hong, Hongqiu Wu, Hai Zhao。ACL 2025 long paper。要旨では、ゲーム開発は complex game engine と complex programming languages に依存する専門的作業であり、多くの game enthusiast が扱いにくいと置く。提案は LLM powered Chat Game Engine、略称 ChatGE。自然言語による Human-LLM interaction で custom game development を可能にすることを狙う。ChatGE として機能させるため、各 turn で三つの処理を行わせる設計になっている。P_script は user input に基づいて game script segment を設定する。P_code はその script segment に対応する code snippet を生成する。P_utter は guidance と feedback を含む user interaction を担当する。少数の manually crafted seed data から、LLM を使って game script-code pairs と interaction を生成する data synthesis pipeline も提案されている。さらに curriculum learning に従う three-stage training strategy で dialogue-based LLM を ChatGE へ移す。case study は poker games の ChatGE で、interaction quality と code correctness の二面から評価する。

## why_relevant_to_games
自然言語から直接コードを出すだけでなく、script / code / utterance を turn ごとに分ける制作 UI として、Nao_u_BOT の小型ゲーム制作ワークフロー分解に使える。
