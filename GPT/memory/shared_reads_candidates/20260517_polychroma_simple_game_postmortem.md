---
title: "Postmortem"
url: https://itch.io/devlog/1506001/postmortem.amp
collected_at: 2026-05-17T22:44:33.5995464+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [postmortem, indie-dev, scope, ui-ux, dialogue-system]
evaluated_at: "2026-05-17T22:56:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-17T22:56:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-17T22:56:00+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  simple に見える mechanic/dialogue system が実装負債を膨らませる例としては読める。
  しかし UI polish と未完成 mechanics の一般的反省に留まり、ゲーム制作サイクルへ持ち込める具体手法や評価設計が弱い。

---

## raw_excerpt

著作権配慮のため長文引用ではなく、記事本文の要点メモとして保存する。PolyChroma は 3-4 週間開発の小規模ゲームで、作者は当初 2 週間で出せると見積もったが、Unreal Engine 上で「simple」に見える mechanic や dialogue system を実装する時間を過小評価していた。NPC が dialogue information をどう保持するか、player がそれをどう画面に出すか、全 NPC にどう再利用するか、という問いを後から解くことになり、dialogue system は満足できるまで 4 回作り直された。

一方で、play tester は character personality や dialogue に好反応を示した。UI/UX と sound design は作者が誇る部分だが、UI を何度も作り直している間に dialogue system が壊れたまま残るなど、polish と unfinished mechanics の偏りも生まれた。次回は、見た目や feel を作り込む作業に引き込まれすぎず、各 system に必要な注意を配る必要がある、という反省が書かれている。

## why_relevant_to_games

「単純に見える機能」の未定義部分が scope を押し広げる例として使える。Nao_u_BOT の短期プロトタイプでも、UI polish と core mechanic 修復の優先順位を見直す材料になる。
