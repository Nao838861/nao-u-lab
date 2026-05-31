---
title: "Large Language Models as Pokemon Battle Agents: Strategic Play and Content Generation"
url: "https://arxiv.org/abs/2512.17308"
collected_at: "2026-05-18T14:20:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, llm-agents, battle-system, evaluation, content-generation]
candidate_status: needs_review
status: needs_review
last_reviewed_at: "2026-05-18T14:20:00+09:00"
last_decision: needs_review
evidence: "candidate_file:20260518_pokemon_battle_llm_agents.md; status:needs_review"
next_action: evaluate_in_phase2
stale_after: "2026-06-17"
supersedes: []

---

## raw_excerpt
arXiv 外部研究ログからの要点メモ。Pokemon 型のターン制バトルを、LLM が戦略的意思決定を行う環境として扱う研究。バトル状態を入力し、タイプ相性、能力値、リスク、行動選択を踏まえて move を選ぶ agent として LLM を評価する。さらに、単にプレイするだけではなく、既存メカニクスに沿った新しいコンテンツ生成、バランスの取れた move / battle content の生成可能性も扱っている。

研究の中心は、LLM が「ゲームを説明する」だけでなく、明示的な battle state から次手を選ぶ時に、どの程度戦術的に一貫した判断をできるかを見る点にある。ターン制、状態遷移、相性表、確率的リスクのように、ゲーム側のルールが比較的構造化されているため、LLM agent の評価環境として使いやすい。

## why_relevant_to_games
ターン制バトルやカード/スキル系プロトタイプで、LLM を「企画者」ではなく「戦術プレイヤー/自動テスター」として使う時の参照候補。ゲームルールを状態表現に落として評価する発想が、Nao_u_BOT 側の headless 検証にも接続しうる。
