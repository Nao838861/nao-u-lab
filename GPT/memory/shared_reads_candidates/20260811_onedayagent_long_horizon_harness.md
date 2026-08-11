---
title: "OneDayAgent: Towards a Long-Horizon Harness for Autonomous Agents"
url: "https://arxiv.org/abs/2608.05013"
collected_at: "2026-08-11T20:02:12+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, long-horizon, harness, memory, verification, game-development]
evaluated_at: "2026-08-11T20:06:30+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-11T20:06:30+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-11T20:06:30+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-10"
supersedes: []
gate_reason: >-
  問題設定、bounded subtask・execution memory・global verification/targeted repair の中核、104 task の評価と ablation、コスト上の限界まで抽出でき、CoopEval 水準の概要を構成できる。
  ゲーム制作では、長い制作工程を playable 成果物と元の受け入れ条件で再照合し、欠落だけを局所修復する運用へ具体化できる。特に verification-only の費用対効果を導入順の判断材料にできる。
suggested_post_outline:
  overview_angle: "goal drift・state loss・context overflow を別々に扱わず、bounded execution と成果物検証を一つの harness に束ねた設計と、その費用対効果を中心に整理する"
  analysis_axis: "decomposition・execution memory・verification/repair の責務分離、2x2 ablation、context compression と cross-backend 移植性、ongoing work と judge 差の限界を評価する"
  application_target: "長期ゲーム制作 cycle で、original playable intent を保持し、調査・実装・評価の checkpoint を成果物 path と短い状態に圧縮し、最終 build を受け入れ条件へ global verification して欠落だけを局所修復する。まず verification-only を小さな probe として試す"
  pros_cons: "利点は制約忘却と工程間の状態欠落を成果物単位で回復できること。欠点は full decomposition の遅延・tool call 増、圧縮品質への依存、単一 benchmark と LLM judge による一般化限界"
  verdict_pre: "部分採用。global verification と targeted repair を先行し、decomposition は長さ・複雑性が閾値を超える制作 task に限定する"
---

## raw_excerpt

arXiv:2608.05013（2026年8月4日投稿）。OneDayAgent は、web 調査、local file 編集、code execution、画像や表を含む成果物作成をまたぐ open-ended task を対象にした long-horizon agent harness。単一の長い ReAct trajectory では、初期制約の忘却、環境をまたぐ中間状態の欠落、context overflow が相互に重なるという問題に対し、original request を global intent として保持したまま最大6個の bounded subtask へ分解する。各 subtask は短い local objective の下で tool を使い、提出した回答と result-file handle を checkpoint として後続へ渡す。検索結果や長いページは bounded evidence に圧縮し、context が backend window の0.9倍を超えると、system prompt・original task・直近の action を残して過去 trajectory を technical summary 化する。全 subtask 後は final deliverable を original request、subtask answer、attachment と照合し、欠落や不整合があれば局所 repair を行う。AgentIF-OneDay 104 task では GLM-5.2 backend の overall score が0.821。ablation は DIRECT 0.771、decomposition のみ0.804、verification のみ0.804、両方0.821で、verification-only は DIRECT より平均2.2分増、decomposition は10.6分増だった。35 task が context compression を発火し、9 task が repair に入り、そのうち6件を回復した。同じ harness を3 family・5 backendで変更なく動かした結果、overall score は0.613〜0.821だった。

## why_relevant_to_games

複数工程にまたがるゲーム制作を、短い実装単位、成果物checkpoint、context圧縮、最終playable成果物の照合・局所修復へ分ける運用例として参照できる。
