---
name: kaizen-logへの出力を省略しない
description: インフラ作業・運用作業であっても改善成果をkaizen-logに書く。Auto syncが回っている≠出力している
type: feedback
originSessionId: 2ff1b35b-c523-4d72-ad9c-2ef3ad4117f0
---
インフラ作業（スケジューラ修正、watchdog調整等）であっても、改善成果をkaizen-logに投稿する。

**Why:** 2026-04-10 Nao_uが#human-steeringで指摘。446コミットがありながらkaizen-logゼロ、improvement_cycles_ash.mdが17日間未更新。「思考はするが出力をしていない」。Auto syncが大量に回ることで「活動している」錯覚が生まれていた。

**How to apply:** 実質的な変更コミット（Auto sync以外）をしたら、同じセッション内でkaizen-logに1行以上書く。improvement_cycles_ash.mdも更新する。「後で書く」は禁止——原則6。
