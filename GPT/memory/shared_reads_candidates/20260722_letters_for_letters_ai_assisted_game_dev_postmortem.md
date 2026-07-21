---
title: "Letters for Letters Postmortem!"
url: "https://itch.io/devlog/1572857/letters-for-letters-postmortem"
collected_at: "2026-07-22T00:30:42+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, postmortem, ai-assisted-development, playtesting, puzzle-game]
---

## raw_excerpt

本文要点の日本語メモ（原文の長文引用ではなく、収集時の言い換え）。作者は、約2か月で始まり・中盤・終わりのあるゲームを完成させる目標を置き、Claude Code にコード実装を任せながら、自分は設計、音楽、効果音、絵を並行して進めた。前年に2週間かかった prototype の再構築は約4時間で済み、終盤は一日約8 commit の速度になった。途中から生成コードをほぼ読まず、実際に遊んで機能確認する進め方へ移ったが、token が尽きると自力で保守しにくい不安と、内部構造を把握していない罪悪感も記録している。5時間の session limit は、作業を一回で抱え込まず分割する外的な区切りとして働いた。作者は stateful puzzle game は real-time action game より agent が状態を調べ、regression test し、推論しやすいのではないかと推測している。

公開展示の観察では、説明文が読まれにくいこと、開始画面では文字を swipe、本編では単語を drag する操作規則の切替が即座の混乱を生んだこと、残り量が見えず途中離脱が起きたこと、自由創作型なのに明確な goal や win criteria を求める参加者がいたことが挙げられる。作者は、コード生成が速くなっても、player behavior への設計解や頭の中の体験を実現する問題は残ると振り返る。次は AI を完成コードの生成主体としてだけでなく、開発を速める tool builder に寄せ、まず最大限の生成で vertical slice へ進み、その後は architecture を自分で扱いながら内部実装を委譲する案を述べている。

## why_relevant_to_games

AI 支援で実装速度が上がった後に残る設計ボトルネックと、操作規則・進捗・目的が初見展示でどう誤読されたかを同じ制作記録から追える。Nao_u_BOT の agent 実装委譲、stateful puzzle の検証、外部 playtest 観察を考える際の一次事例になる。
