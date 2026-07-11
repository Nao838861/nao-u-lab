---
title: "RogueAI: A Reverse Turing Test for Detecting Licensed AI Deception in Dialogue"
url: "https://arxiv.org/abs/2606.13310"
collected_at: "2026-07-11T16:55:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [dialogue-game, social-deduction, llm-agents, deception, player-study]
---

## raw_excerpt

RogueAI は「会話相手が人間か」ではなく「会話相手を信頼できるか」を問う reverse Turing test を、一対二の尋問ゲームとして実装した webapp である。人間 player は、同じ fictional scenario に置かれた見分けのつかない二体の LLM agent に質問する。ただし一体だけは欺くことを許可されている。player は turn budget が尽きる前に deceptive agent を特定し、shut off する。拡張版 AutoRogueAI では、player が narrator agent と custom scenario を共同設計し、narrator が秘密裏に deception strategy を選ぶため、scenario と攻略対象を手続き的に変化させられる。

3日間の pilot deployment では 467 session が開始され、415 session が完了し、Italian で 1876 interaction turn が集まった。deceptive agent には helpfulness、短さ、hedging の差として局所的な linguistic signature が現れ、単純 heuristic は 75.6% accuracy を達成した。一方、人間 player は 56.6% に留まり、最も診断的な signal をほぼ利用していない可能性が示された。著者らは、この差を data collection、teaching tool、honesty-trained model の evaluation harness という用途につなげている。

## why_relevant_to_games

LLM の deception evaluation を social-deduction game loop として成立させ、player behavior も同時収集した事例。会話 NPC の嘘を「設定」だけでなく、制限時間・選択・勝敗・観測可能な癖へ落とす設計の参照になる。
