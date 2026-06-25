---
title: "Mind-Studio: Executable World Models with Lookahead Evaluation for Partially Observable Games"
url: "https://arxiv.org/abs/2606.16070"
collected_at: "2026-06-26T07:45:27+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, world-model, agent-evaluation, planning, harness]
evaluated_at: "2026-06-26T07:50:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782428089.831069"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782428089831069"
  char_count: 4224
  posted_at: "2026-06-26T07:54:47+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-26T07:54:47+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782428089831069"
next_action: none
stale_after: "2026-07-26"
supersedes: []
gate_reason: |-
  replay から executable world model を作り、lookahead preview と実環境 rollout で評価する構造が明確。
  部分観測ゲームの rule extraction、branch preview、headless 検証に直結し、4000字級の概要で問題設定から評価まで展開できる。
suggested_post_outline:
  overview_angle: "trajectory から実行可能な world model を合成し、LLM planner の lookahead に使うという軸で書く。"
  analysis_axis: "入力表現、entropy-based selection、transition program、Real-ALE との rollout 比較を分けて見る。"
  application_target: "Nao_u_BOT の小規模ゲームで replay から接触・spawn・状態遷移を抽出し、分岐プレビュー型の検証 harness に落とす。"
  pros_cons: "利点は自然言語説明より検証しやすい executable model に寄せる点。弱点は Atari/OC-state 前提と hidden rule 抽出の失敗時の保守。"
  verdict_pre: "部分採用。完全自動生成ではなく、ログ採取点と小さな transition model の設計指針として採用。"
---

## raw_excerpt
arXiv 2606.16070。2026-06-16 v2。Mind-Studio は、部分観測ゲームのプレイ経験から、独立して実行できる pygame 風の world model プログラムを合成する研究。短い原文句では "executable pygame-style world models" と説明されている。入力は state-action-next-state trajectory で、そこから OC-Atari の object-centric state、action semantics、static scene layout、ゲーム固有の skill file を組み合わせる。全遷移をそのまま詰め込むのではなく、entropy-based selection で contact、spawn、object attribute change、rare event など「ルールを露出しやすい行」を優先して、LLM が transition program を生成しやすい圧縮形式にする。

評価は、生成 world model の次状態予測だけでなく、LLM planner がその model の per-action preview を見て実ゲーム上で進めるかを測る。Real-ALE と world model の rollouts を同じ snapshot から比較し、player xy の一致を NSP として見る。対象は Montezuma's Revenge、Alien、Assault、Skiing。論文は、free-form language で次状態を想像するより、object identity、collision priority、hidden boundary condition、spawn / death / pickup の順序を control flow として持つ executable program の方が、lookahead source として検査しやすい、という立場を取っている。

## why_relevant_to_games
ゲーム制作後の headless / replay 評価を、単なるログ採点ではなく「小さな実行可能 world model に落として branch preview を検査する」発想として使える。特に敵・弾・接触・状態遷移のルール抽出に効きそう。
