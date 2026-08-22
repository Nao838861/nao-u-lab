---
title: "Persistent Recursive Worlds Enable Autonomous Software Evolution"
url: https://arxiv.org/abs/2608.10450v3
collected_at: "2026-08-22T16:30:50+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, long-horizon-development, software-evolution, multi-agent, game-development-workflow]
evaluated_at: "2026-08-22T16:35:02+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-22T16:35:02+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-22T16:35:02+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-21"
supersedes: []
gate_reason: >-
  agent の寿命を越える開発という問題設定、accepted version と repository path を核にした構成、
  formation／continuation／redevelopment の評価と長時間 run の定量結果まで揃い、約4000字の概要へ展開できる。
  ゲーム制作でも、担当 agent の記憶ではなく検証済み project state を継続単位にする運用へ具体適用できる。
suggested_post_outline:
  overview_angle: "永続 agent を作るのではなく、有限寿命 agent が検証済み project state を受け渡す persistent recursive world として長期開発を組み直す"
  analysis_axis: "accepted version・repository path・局所 world・recursive delegation が、形成・継続・再開発の各局面で連続性と検証可能性をどう支えるか"
  application_target: "Log_cdx の複数 cycle にまたがるゲーム制作で、機能ごとの repository path と受入 test を作業境界にし、agent 交代時は会話履歴ではなく accepted commit・未解決 issue・再現手順から再開する"
  pros_cons: "利点は長大な会話や単一 agent の永続性に依存せず、局所差分と受入結果を監査できること。欠点は大規模 compiler／数値計算再実装の成功をゲームの遊び品質へ直接一般化できず、受入 test が弱い領域では誤った state も永続化しうること"
  verdict_pre: "部分採用。project state と受入 gate の永続化は採用し、recursive delegation の深さや粒度は小規模 prototype で検証する"
---

## raw_excerpt

複雑な software project は単一 coding agent の寿命を越えて続くため、従来は session、memory、manager、shared context を永続化して連続性を保ってきた。本論文の EvoX Genesis は逆に、agent は有限寿命のまま、project 自体を persistent recursive world として保持する。各 local world は accepted version と repository path によって位置づけられ、agent は局所変更を提案し、recursive delegation が path 間の作業を移送し、受理された結果だけが永続 version history を前進させる。

著者らは formation、continuation、redevelopment の三局面で構成を評価した。compiler 実装を持たない repository から DeepSeek V4 Flash を用いて約25万 tracked lines の Rust 製 C compiler を構築した run は120時間超、1,000超の agent episode、model token 費用44米ドルで、完全な c-testsuite と LLVM／Csmith test の大半を通過した。別の GLM 5.2 compiler world では agent を繰り返し交換しても test performance を維持した。また、13個の MESA module、Fortran 10万行超を Rust workspace 約9万行へ再実装し、6つの numerical workload で median 1.55〜6.87倍の speedup を報告する。論文は、長期 software development の連続性を persistent agent ではなく persistent project を中心に構成できると述べている。

## why_relevant_to_games

複数 cycle・複数 agent にまたがるゲーム制作で、担当 agent の文脈保持ではなく repository path、accepted version、局所 world、検証済み差分を継続単位にする方法を検討する素材になる。
