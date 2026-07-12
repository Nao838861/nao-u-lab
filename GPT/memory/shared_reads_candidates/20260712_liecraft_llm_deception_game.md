---
title: "LieCraft: A Multi-Agent Framework for Evaluating Deceptive Capabilities in Language Models"
url: "https://arxiv.org/abs/2603.06874"
collected_at: "2026-07-12T13:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-games, multi-agent, hidden-role, evaluation, long-horizon]
---

## raw_excerpt

arXiv の要旨では、LLM の agency が増し、人間の監督が薄くなる状況で deception の評価が重要になるという問題設定から始まる。LieCraft は、その評価用 sandbox として設計された multiplayer hidden-role game である。各 player は ethical alignment を選び、長い時間幅で mission を遂行する。cooperator は event challenge を共同で解きながら bad actor を見つけ、対立側には別の目的が与えられる。著者らはこのゲームを、単発の虚偽回答ではなく、複数 agent の相互作用、役割、継続する戦略、途中の行動履歴を含む形で deception capability を測る枠組みとして提示している。

要旨の短い原文断片は “multiplayer hidden-role game”、 “long time-horizon”、 “measuring LLM deception”。外部研究結果には、一般的な game-based evaluation が持つ制約を補い、協力者と bad actor が同じ環境内で mission と event challenge を扱う構成だと記録されている。

## why_relevant_to_games

hidden-role game のルール設計と、長期戦略・協力・裏切りを行動ログから観測する AI playtest / NPC 評価の場面に接続しうる。
