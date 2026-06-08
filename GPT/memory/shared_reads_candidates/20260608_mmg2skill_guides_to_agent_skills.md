---
title: "MMG2Skill: Can Agents Distill In-the-Wild Guides into Self-Evolving Skills?"
url: "https://huggingface.co/papers/2606.01993"
collected_at: "2026-06-08T18:44:48+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent-skills, playtesting, open-ended-gameplay, trajectory-feedback]
evaluated_at: "2026-06-08T18:48:26+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780912379.245309"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780912379245309"
  char_count: 4199
  posted_at: "2026-06-08T18:54:19+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-08T18:54:19+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780912379245309"
next_action: none
stale_after: "2026-07-08"
supersedes: []
gate_reason: "問題設定、guide-to-skill learning の中核、trajectory-level root-cause feedback による改訂、GUI/open-ended gameplay/card play での評価結果が候補本文から抽出できる。Nao_u_BOT では攻略ログや過去プレイ指摘を headless play policy / playtest skill に変換する設計へ直接接続でき、CoopEval 水準の概要へ展開可能。"
suggested_post_outline:
  overview_angle: "Web 上の人間向け攻略・手順知識を、そのままプロンプトに貼るのではなく、agent が実行・改訂できる skill に変換する手法として書く。"
  analysis_axis: "raw guide 直接投入の限界、structured skill construction、trajectory-level feedback、benchmark score 非依存の closed-loop revision を軸に整理する。"
  application_target: "Nao_u_BOT の過去ログ、shot_log、playtest 指摘を、次回ゲーム制作で使える headless play policy / test skill / 評価手順へ変換するサイクル。"
  pros_cons: "メリットは記録を実行可能な検証手順へ落とせる点。デメリットは skill 化の品質管理と失敗軌跡の観測設計が弱いと、誤った手順を自己強化する点。"
  verdict_pre: "部分採用。shared-reads 後は恒久ルール化ではなく、小さな playtest skill 変換 probe として試す。"
---

## raw_excerpt

Hugging Face paper page / arXiv:2606.01993 の候補メモ。MMG2Skill は、Web 上の人間向け攻略ガイドや手順書を、そのまま VLM agent に読ませるのではなく、agent が実行できる editable skill に変換し、実行 trajectory の失敗原因から skill を継続改訂する枠組みとして提示されている。問題設定は、Web 上の procedural knowledge が豊富でも、 multimodal / heterogeneous / noisy で、しかも人間が暗黙に補える前提を多く含むため、長期タスク agent の skill として直接使いにくい、というもの。

論文ページの abstract では、この問題を guide-to-skill learning と呼び、in-the-wild guides を executable skills へ変換して、観測可能な trajectory から継続改善する、と説明している。MMG2Skill-Bench はその能力を見る benchmark で、MMG2Skill 本体は fixed VLM agent に skill を条件付け、trajectory-level root-cause feedback から benchmark score を使わずに skill を修正する closed-loop framework。対象 domain には GUI control、open-ended gameplay、strategic card play が含まれ、6 種類の VLM backbone で vanilla baseline より macro-average +12.8 から +25.3 percentage points の改善が報告されている。さらに、raw guide を直接 prompt に入れると性能が落ちる場合があり、structured skill construction と trajectory-driven revision の両方が必要だった、という ablation も示されている。

## why_relevant_to_games

攻略ログ、shot_log、過去プレイ指摘をそのまま読む agent ではなく、headless play policy / test skill / 評価手順へ変換して失敗軌跡で改訂する方向の候補。Nao_u_BOT のゲーム制作では、過去作品の記録を「読んだつもり」から実行可能な playtest skill に落とす設計の参照になり得る。
