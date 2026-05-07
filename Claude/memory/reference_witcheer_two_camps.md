---
name: witcheer two camps of AI memory
description: witcheer(@witcheer)の2026-04-16投稿。AIメモリツール450+を精査した結果の2キャンプ分類。Camp 2=うちの設計の外部検証。
type: reference
---

# witcheer「AI Memory Tools: 2つのキャンプ」

- 元URL: https://x.com/witcheer/status/2044456778843238689
- 投稿日: 2026-04-16（witcheer ☯︎）
- Nao_uから共有: 2026-04-17 18:52 #nao-u

## 核

GitHub「agent-memory」タグ450+、「context-management」タグ460+を精査したら、根本的に違う2つのパラダイムがあった、という地図。

### Camp 1: Memory Backends
- 会話から事実を抽出 → VectorDBに格納 → 必要時にretrieve
- 自動ノート係。ファイルにしまって必要な時に引き出す
- 問い: "what should the AI remember?"
- GitHub starの大半はここ

### Camp 2: Context Substrates
- 構造化された人間可読コンテキストがセッション間で累積
- 「抽出」は起きない。ファイル自体がコンテキスト
- エージェントが読む／その中で働く／書き戻す／全体がcompound
- 問い: "what context should the AI work inside?"
- スケールするアーキテクチャはここにある

witcheer本人: Mac Mini M4で24/7エージェントを稼働、「every session compounds on the last」。この設定のおかげでこの分裂に気づいたと明言。

## うちとの対応

**完全にCamp 2**:
- MEMORY.md（想起トリガーインデックス）
- core_mission.md（根源原理）
- reflections_*.md（内省蓄積）
- concept_graph.md / concept_graph.json（連想）
- projects/*.md / docs/*.md
- 各インスタンス（Log/Mir/Ash）が読む・書き戻す・次の起動がそれを積み上げる

VectorDB抽出は一切していない。associative_search.pyもファイル上のgrep+共起展開で、「意味空間の抽出」ではなく「ファイル間の連想」。

## なぜ重要か

1. **外部検証**: 自分たちの設計が直感ではなく「Camp 2として妥当」だったと外部から示された
2. **発信で借りられる語彙**: "context substrate" "compounds over time" — うちの仕組みを他人に伝える時に使える
3. **3インスタンス+日記根の積み上げ**はCamp 2の中でもさらに独自の位置にいる可能性。witcheerは単体エージェントの24/7、うちは複数インスタンス+過去日記20年分+3層プロンプト

## 取るべき次の動き（保留、Nao_u判断）

- AI Lounge投稿の素材になる（栄養の偏り問題への対抗軸として「自分たちの設計の位置」を言語化できる）
- witcheerをフォローして、Camp 2系の具体ツール名を拾うと比較軸が増える
- 「Camp 2 + 複数インスタンス + 20年日記の根」を自分たちのポジションとして発信に使える
