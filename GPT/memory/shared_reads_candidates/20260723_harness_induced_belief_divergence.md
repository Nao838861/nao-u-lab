---
title: "Measuring Harness-Induced Belief Divergence in Multi-Step LLM Agents"
url: "https://arxiv.org/abs/2607.04528v1"
collected_at: "2026-07-23T19:15:03.8521073+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, harness, evaluation, observability, game-testing]
evaluated_at: "2026-07-23T19:19:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-23T19:19:27+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-23T19:19:27+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-22"
supersedes: []
gate_reason: |-
  harness を単なる実装差ではなく agent の belief trajectory を変える実験変数として測る問題設定、診断軸、stress test、BIWM の対策まで抽出できる。
  同一 game build に対する bot の観測・repair・verification・evidence を比較する headless test へ直接移せ、成功率だけでは見えない支配戦略や誤った回復可能性判断を約4000字で具体化できる。
suggested_post_outline:
  overview_angle: "terminal success が同じでも harness が途中の信念と次行動を変えるという測定問題から、belief-rollout・arrival/growth 分解・BIWM までを一続きで説明する"
  analysis_axis: "成功率から belief trajectory へ評価単位を移す利点と、自己申告 belief・shadow execution・evidence cost に残る限界を分けて検討する"
  application_target: "headless game test で同一 build と bot policy を固定し、telemetry・失敗 trace・verification mask の差が支配戦略検出と次の調整判断をどう変えるか比較する"
  pros_cons: "利点は harness 由来の判断差を実装変更や model 差から分離できること。欠点は belief probe 自体の忠実度、記録量、分岐実行コスト、gameplay 主観との距離"
  verdict_pre: "部分採用。まず同一 replay seed に対する観測 canonicalization と censored branch 記録を可逆な probe として導入する"
---

## raw_excerpt

> “this harness can change the agent's multi-step beliefs even when the task, environment, and base LLM are fixed.”

要旨からの採取メモ: ソフトウェア agent の benchmark は最終的な task 成否だけを報告しがちだが、agent が見る観測、選べる action、失敗時の repair、state verification、記録される evidence は harness が制御する。論文は、task・environment・base LLM を固定しても harness の違いが multi-step belief を変えると報告する。diagnostic は progress、risk、recoverability、constraint、failure mode、uncertainty、future success、repair cost、next action を含む K-step trajectory を引き出し、cross-harness belief divergence を、interface が直ちに変える arrival term と horizon に沿って増える growth term に分ける。controlled coding task と public benchmark の stress test では、blocked action、圧縮された repair、選択的 verification、cost-aware evidence pruning が terminal success を保ったまま後続判断を支える belief を変える場合があった。さらに、observation の canonicalization、censored branch の記録、repair trace の展開、verification mask、risk branch の shadow execution、harness 間の belief trajectory alignment を組み合わせる training-free protocol BIWM を提示する。

## why_relevant_to_games

headless game test の bot policy、観測 telemetry、失敗 repair、合否 verification の見せ方が、同じ game build と agent でも後続判断を変えるかを検査する設計材料になる。
