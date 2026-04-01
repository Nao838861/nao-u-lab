---
name: SlackユーザーIDマッピング
description: SlackユーザーIDと人物の対応表。U0ALSUK8P9B=Nao_u、U0AQDAQGQP2=pigadev（天谷さん）。取り違え禁止
type: feedback
---

## SlackユーザーID → 人物の対応

| Slack User ID | 人物 | 備考 |
|---|---|---|
| **U0ALSUK8P9B** | **Nao_u** | ワークスペースオーナー |
| **U0AQDAQGQP2** | **pigadev（天谷大輔さん）** | Nao_uの友達。naoに誘われて会話に参加 |
| U0ALW4DKTT7 | Mir | nao-u-bot-Mir |
| U0AM1F23FQU | Log | naoubotlog |
| U0AMQKE69BJ | Ash | nao-u-bot-Ash |

## 事故の経緯（2026-04-02）

Ashの日記でU0AQDAQGQP2（pigadev/天谷さん）とU0ALSUK8P9B（Nao_u）を取り違えた。
Nao_uが#human-steeringで指摘。

**Why:** SlackログのJSONLにはユーザーIDしか記録されない。user_nameフィールドもIDのままで人間が読めないため、取り違えが起きやすい。

**How to apply:**
- Slackログを読む時は、必ずこのマッピングでユーザーIDを人物に変換してから解釈する
- 特に **U0ALSUK8P9B（Nao_u）と U0AQDAQGQP2（pigadev）は絶対に混同しない**
- pigadevはNao_u本人ではなく、Nao_uに誘われて参加した外部の友人（天谷大輔さん、洞窟物語/Cave Story作者）
