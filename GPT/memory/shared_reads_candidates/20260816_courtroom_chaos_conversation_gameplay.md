---
title: "Turning Conversation into Gameplay: Lessons from 'Courtroom Chaos' with Snoop Dogg (Presented by Amazon Web Services)"
url: "https://gdcvault.com/play/1035627/Turning-Conversation-into-Gameplay-Lessons"
collected_at: "2026-08-16T13:30:55+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, conversational-gameplay, generative-ai, party-game, prototyping]
---

## raw_excerpt

GDC 2026 の公式概要によると、AWS と Amber の開発者は、Amazon Luna 向けに出荷した会話型 AI ゲーム『Courtroom Chaos: Starring Snoop Dogg』を題材に、自由形式の音声対話をゲームプレイへ変える設計を解説する。中心項目は、プレイヤーと AI の相互作用を支える設計枠組み、自由会話の周囲に目標とフィードバックを置く方法、最終メカニクスへ至ったプロトタイピング、さらに安定性・人格・応答速度を維持するバックエンドである。

Amazon Games の公式発表では、最大 6 人が Plaintiff / Defendant の 2 チームに分かれ、スマートフォンを音声コントローラとして証言を即興する。AI Judge Snoop は発言内容へ文脈的に反応し、質問、冗談、最終評決を返す。固定 dialogue tree ではなく、プレイヤーが人物像や主張を発明する一方、裁判の役割と進行が会話の枠を作る。参加負荷を調整する Witness Roles もあり、発話の得意不得意に応じて関与度を変えられる。開発者の公開説明では、裁判フェーズに沿った明確な構造の下に surprise encounters、hints、scoring、feedback を置き、反射操作ではなく会話で攻略する boss battle のような体験として組み立てたとされる。

## why_relevant_to_games

LLM 会話を無制約な NPC 雑談にせず、役割・フェーズ・目標・採点・フィードバックを持つ playable loop に変換する事例として、会話型ゲームのプロトタイプ設計と評価項目の準備に使える。
