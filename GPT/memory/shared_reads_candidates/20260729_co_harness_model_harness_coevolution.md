---
title: "Co-Harness: Co-Evolving Harnesses and Model Weights for LLM Agents"
url: "https://arxiv.org/abs/2607.22688"
collected_at: "2026-07-29T04:01:13.6066683+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, ai-agent, playtesting, harness, evaluation]
---

## raw_excerpt

arXiv:2607.22688v1（2026-07-17 submitted）。著者は Zhengyu Chen、Teng Xiao、Huaisheng Zhu、Yige Yuan、Luan Zhang、Jingang Wang。論文は、agent の post-training で model parameter だけを更新し、trajectory を生成・実行・検証・記録する runtime harness を固定する不整合を扱う。harness は prompt、tool schema、reusable skill、middleware、context management、memory policy を含む。

Co-Harness は harness 改善と model 改善を交互に回す。HarnessCritic が失敗 trajectory を `prompt_ambiguity`、`tool_schema_error`、`skill_missing`、`middleware_mismatch`、`memory_overflow`、model 側の `agent_error` に帰属し、根拠と局所 diff を出す。candidate patch は対象失敗を改善し、held-out behavior を退行させない場合だけ registry に残す。改善後の harness で得た高品質 trajectory を次の model update に使う。本文の循環表現は “Better harness → better trajectories → stronger model → better harness”。

実験は tool-integrated mathematical reasoning が中心で、Qwen3-8B / 32B と AIME24、AIME25、HMMT25 を用いる。論文は2 round の平均で +20.4 percentage points、最大 +27.2 points を報告する。また AIME24 の200時間超・22 version の自律 case study では、system crash の回復、推論効率化、ensemble strategy の発見を記録する。

## why_relevant_to_games

headless playtest の失敗を game logic、bot policy、tool schema、retry/context、memory のどこへ帰属するかを記録し、局所修正を代表 scenario と held-out policy の両方で検証する収集軸に接続できる。
