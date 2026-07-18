---
title: "Zero2Skill: Bootstrapping Robot Skills through Autonomous Data Collection, Training, and Deployment"
url: "https://arxiv.org/abs/2607.14047v2"
collected_at: "2026-07-19T03:30:53+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, corrective-memory, human-feedback, automated-testing, skill-learning]
---

## raw_excerpt

実環境の manipulation policy を学習するデータ収集では、self-reset、VLM verifier、言語による修正を導入しても、同じ失敗が再発するたびに人間が episode 単位で指示し直すため、監督コストがセッション長に比例して増える。Zero2Skill は、収集・検証・reset を自律実行し、明示した retry budget を使い切った時だけ remote operator に停止して確認を求める。人間の自然言語修正は LLM parser が構造化 adjustment に変換し、Corrective Memory に保存して次 round 以降に再利用する。

実 robot の desktop-clearing testbed では、teleoperation と同程度の episode success を保ちながら、人間の作業時間を 16% に削減した。言語修正を加えると四つの評価設定すべてで verifier と人間の一致度が改善し、single-attempt success は平均 12.5% から 47.5% へ、arm-selection は 20.0% から 50.0% へ上昇した。収集データで fine-tune した policy も、teleoperation data で学習した policy と同程度の成功率に達したと報告される。

## why_relevant_to_games

自動 playtest や bot 操作で同じ失敗を人間が何度も直す代わりに、修正を条件付きの再利用可能な記録へ変換し、retry budget と人間への escalation を組み合わせる制作ループの参考になる。
