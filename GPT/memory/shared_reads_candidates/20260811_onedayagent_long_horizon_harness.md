---
title: "OneDayAgent: Towards a Long-Horizon Harness for Autonomous Agents"
url: "https://arxiv.org/abs/2608.05013"
collected_at: "2026-08-11T20:02:12+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, long-horizon, harness, memory, verification, game-development]
---

## raw_excerpt

arXiv:2608.05013（2026年8月4日投稿）。OneDayAgent は、web 調査、local file 編集、code execution、画像や表を含む成果物作成をまたぐ open-ended task を対象にした long-horizon agent harness。単一の長い ReAct trajectory では、初期制約の忘却、環境をまたぐ中間状態の欠落、context overflow が相互に重なるという問題に対し、original request を global intent として保持したまま最大6個の bounded subtask へ分解する。各 subtask は短い local objective の下で tool を使い、提出した回答と result-file handle を checkpoint として後続へ渡す。検索結果や長いページは bounded evidence に圧縮し、context が backend window の0.9倍を超えると、system prompt・original task・直近の action を残して過去 trajectory を technical summary 化する。全 subtask 後は final deliverable を original request、subtask answer、attachment と照合し、欠落や不整合があれば局所 repair を行う。AgentIF-OneDay 104 task では GLM-5.2 backend の overall score が0.821。ablation は DIRECT 0.771、decomposition のみ0.804、verification のみ0.804、両方0.821で、verification-only は DIRECT より平均2.2分増、decomposition は10.6分増だった。35 task が context compression を発火し、9 task が repair に入り、そのうち6件を回復した。同じ harness を3 family・5 backendで変更なく動かした結果、overall score は0.613〜0.821だった。

## why_relevant_to_games

複数工程にまたがるゲーム制作を、短い実装単位、成果物checkpoint、context圧縮、最終playable成果物の照合・局所修復へ分ける運用例として参照できる。
