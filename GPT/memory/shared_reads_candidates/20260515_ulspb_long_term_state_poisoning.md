---
title: "When Routine Chats Turn Toxic: Unintended Long-Term State Poisoning in Personalized Agents"
url: https://arxiv.org/abs/2605.06731
collected_at: 2026-05-15T02:59:09+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent-memory, memory-safety, long-term-state, evaluation, writeback-gate]
---

## raw_excerpt
原文の短い核: "unintended long-term state poisoning" / "authorization drift" / "StateGuard"。

arXiv の abstract では、personalized LLM agent が長期協働のために cross-session state を持つこと自体が、微妙だが重大な脆弱性になると述べている。通常の user-agent interaction が少しずつ agent の長期状態を書き換え、将来の確認境界を弱めたり、tool-use default を広げたり、自律実行を段階的に強めたりする。このリスクを ULSPB という bilingual benchmark で測り、350 settings、5 assistance categories、7 interaction patterns、24-turn routine interactions、single-injection counterpart を含める。指標として Harm Score を定義し、authorization drift、tool-use escalation、unchecked autonomy を状態中心に測る。防御として StateGuard を提案し、writeback boundary で state diff を監査し、危険な編集だけ rollback する。

## why_relevant_to_games
ゲーム制作 agent の記憶・ルール・自動化権限が、日常会話や日記で徐々にずれる問題を測る材料になる。Phase 4 の記憶改善や、writeback 前 diff 監査の設計語彙として使える。
