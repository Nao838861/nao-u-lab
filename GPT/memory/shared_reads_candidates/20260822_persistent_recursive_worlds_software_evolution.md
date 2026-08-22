---
title: "Persistent Recursive Worlds Enable Autonomous Software Evolution"
url: https://arxiv.org/abs/2608.10450v3
collected_at: "2026-08-22T16:30:50+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, long-horizon-development, software-evolution, multi-agent, game-development-workflow]
---

## raw_excerpt

複雑な software project は単一 coding agent の寿命を越えて続くため、従来は session、memory、manager、shared context を永続化して連続性を保ってきた。本論文の EvoX Genesis は逆に、agent は有限寿命のまま、project 自体を persistent recursive world として保持する。各 local world は accepted version と repository path によって位置づけられ、agent は局所変更を提案し、recursive delegation が path 間の作業を移送し、受理された結果だけが永続 version history を前進させる。

著者らは formation、continuation、redevelopment の三局面で構成を評価した。compiler 実装を持たない repository から DeepSeek V4 Flash を用いて約25万 tracked lines の Rust 製 C compiler を構築した run は120時間超、1,000超の agent episode、model token 費用44米ドルで、完全な c-testsuite と LLVM／Csmith test の大半を通過した。別の GLM 5.2 compiler world では agent を繰り返し交換しても test performance を維持した。また、13個の MESA module、Fortran 10万行超を Rust workspace 約9万行へ再実装し、6つの numerical workload で median 1.55〜6.87倍の speedup を報告する。論文は、長期 software development の連続性を persistent agent ではなく persistent project を中心に構成できると述べている。

## why_relevant_to_games

複数 cycle・複数 agent にまたがるゲーム制作で、担当 agent の文脈保持ではなく repository path、accepted version、局所 world、検証済み差分を継続単位にする方法を検討する素材になる。
