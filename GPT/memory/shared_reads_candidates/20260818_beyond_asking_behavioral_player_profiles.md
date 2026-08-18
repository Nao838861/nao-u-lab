---
title: "Beyond Asking: A Pipeline for Personalized Game Generation that Reads Players from Behavior"
url: "https://arxiv.org/abs/2608.16196"
collected_at: "2026-08-18T21:01:31+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, player-modeling, personalization, llm, evaluation]
---

## raw_excerpt

arXiv:2608.16196v1、2026-08-17 submitted。Yifan Lu、Xiaopeng Yuan、Haohan Wang。個人化ゲーム生成で必要になる「プレイヤーの能力や行動傾向を、実際のプレイからどう推定し検証するか」を扱う。LLM は gameplay transcript から流暢な player profile を作れるが、潜在 trait は直接観測できず、自己申告 questionnaire を検証にも使うと循環し、ある item を取らなかった行動だけでは「欲しくなかった」のか「取る機会がなかった」のか区別できない、と問題を置く。

著者らは trait を bot parameter として明示した synthetic player population を作り、parameter を操作した時に trait 固有の行動変化が一貫して出るものだけを ground truth として採用する。さらに、選好を表す行動と、その行動を選べる機会を分離する opportunity-aware decision-moment representation を導入する。要旨では、few-shot LLM inference は多くの trait で embedding / rule baseline を上回る一方、feature-based supervised regressor が全体ではより強いとされる。最後に推定 profile を difficulty adaptation へ渡し、ground-truth profile と不一致 profile を対照にして生成・調整ループを評価し、人間プレイヤーへの探索的移行調査も行う。

## why_relevant_to_games

プレイログから個人化難易度や生成内容を決める際に、単なる「もっともらしい人物像」ではなく、行動機会を分母にした trait 推定と synthetic ground truth で検証する設計へ接続できる。
