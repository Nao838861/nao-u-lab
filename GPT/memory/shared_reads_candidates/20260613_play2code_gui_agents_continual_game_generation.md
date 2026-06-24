---
title: "GUI Agents for Continual Game Generation"
url: "https://arxiv.org/html/2605.28258v1"
collected_at: "2026-06-13T01:59:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, playtesting, procedural-generation, evaluation]
evaluated_at: "2026-06-13T02:02:21+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-13T02:04:25+09:00"
last_decision: postponed_duplicate
evidence: "Phase 3 duplicate check: same arXiv paper already posted to #shared-reads at https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779979770780529"
next_action: none
stale_after: "2026-07-13"
supersedes: []
gate_reason: "問題設定、従来法との差分、GUI agent による実プレイ feedback、比較評価の数字が候補段階で揃っている。Nao_u_BOT の headless/screenshot 評価ループへ直接接続でき、CoopEval 水準の概要を構成できる。"
postpone_reason: "Phase 3 duplicate check: same paper was already posted to #shared-reads; do not repost."
suggested_post_outline:
  overview_angle: "生成したゲームを build 成功ではなく実プレイ feedback で閉じる continual generation 論文として書く。"
  analysis_axis: "Direct LLM / OpenGame / Play2Code の評価差、GUI agent が検出する code-level signal では拾えない mismatch、prescriptive feedback の粒度。"
  application_target: "Nao_u_BOT の playable diff 検証、screenshot/play trace ベースの自己評価、Phase 3b probe の評価設計。"
  pros_cons: "メリットは実プレイを生成ループに戻す設計が明確なこと。デメリットは GUI agent backbone と対象ゲーム範囲への依存、評価が自動観測に偏る可能性。"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv 2605.28258。Play2Code は、LLM にゲームを一括生成させる、または build / compile / inspect だけを反復する従来型の agentic game generation に、実際に GUI agent が生成物を遊ぶ段階を足す研究。論文は Direct LLM と OpenGame を比較対象にし、OpenGame は構文・コンパイル水準の inspect を反復するが、生成されたゲームを player として触る feedback が欠けると整理している。Play2Code は各生成 build を GUI agent にプレイさせ、その観測から prescriptive feedback を次の生成ラウンドへ戻す。検索結果と本文抜粋では、Claude Sonnet 4.6、GPT-5.4、Kimi K2.5 を game agent / GUI agent の backbone として使い、Direct LLM 29.7、OpenGame 52.2、Play2Code 66.8 という比較で、playtesting が code-level signal では拾えない mismatch を露出すると説明されている。

## why_relevant_to_games
Nao_u_BOT の headless / screenshot / bot policy 評価を、build 成功の確認から「実際に遊んだ feedback が次生成へ戻る」ループへ寄せる材料になる。
