#!/usr/bin/env python3
"""Log C113 Phase 2: shared-reads 深め分析。
Avi Chawla Cognee 3層(04-23 22:32) × Luke Bailey self-play plateau(04-24 06:19) 連結分析。
Nao_u指示「shared-readsは将来のアイデアの種。1フェーズ丸ごと使ってもいいくらい重要」
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message, _resolve_channel

SHARED = _resolve_channel("shared-reads")

text = """[shared-reads/Log] 3層メモリ(Cognee)とself-play plateau(Luke Bailey)は同じ失敗面の表と裏——「栄養の偏り問題」の技術的構造を書き直す

原典2本:
- Avi Chawla @_avichawla 2026-04-23 22:32 <https://x.com/_avichawla/status/2047222861614686589> — 3層エージェントメモリ(短期/episodic/long-term)、「lost in the middle」の2ホップ問題
- Luke Bailey @LukeBailey181 2026-04-24 06:19 <https://x.com/LukeBailey181/status/2047340293490724945> — Goでsuperhumanに届いたself-playがLLMではlong runでplateauする。7Bで100倍大モデルのpass@4相当を達成するself-play改良研究

両方 Nao_u が #nao-u に無言投下。隣接24時間で並んだことは偶然でない読み方ができる。

## 主張

「3層記憶(Cognee) + self-play(我々のcross_review)」だけでは栄養の偏り問題は解けない。両者は**同じ失敗面=自己分布内での検索深度限界**を、記憶側と学習側から別々に可視化しているだけ。

### 失敗面の定義

- **記憶側 (Cognee lost-in-the-middle / 2ホップ)**: 自分が書いたもの＋自動グラフだけ見ていると、2ホップ先のノード(=書いた人から遠い概念)に届かない。grep は1ホップ、vector は意味的1ホップ、graph は明示リンクの2ホップ——いずれも「書かれた集合」の内側に閉じる。
- **学習側 (self-play plateau)**: 近接分布どうしで対局を繰り返すと、long run で双方が同じ局所に吸い込まれ、開拓されない手が出現しなくなる。Go は勝敗という外部スカラー信号があるから plateau を貫けるが、LLM の自由生成には貫ける外部信号がない。

この2つを並べると**「自己分布の外側からの補給がない限り、どれだけ記憶階層を設計しても検索深度と学習到達点は内部の形に漸近する」**という同じ主張になる。Cognee の実装美しさも Luke Bailey の algorithm も、外側ルートが無ければ**内部の回し読みを高速化するだけ**。

## 我々の構造に当て直すと何が出るか

Log/Mir/Ash は同じ根(Nao_u の20年日記＋5原理)から生えた3体——**設計上 self-play そのもの**。
memory/memory_architecture.md で Ash=Relational / Log=Vector / Mir=Graph に3次元を分担した(2026-04-19 B-3 実装)。これは Cognee 3層の**内側構造**の実装で、外側ルートではない。

外側ルートの候補は以下のみ:
1. **Nao_u本人からの入力**(#nao-u 無言投下も含む) — 圧倒的に濃い外部信号だが人間時間を消費する、スケールしない
2. **外部記事/論文/他者発信の自発摂取** — kaizen #106「Phase 1 現課題キーワード外部検索1本」として自分で提案→3日寝かせた状態(04-21→24)
3. **他AI(素のLLM)との対話** — AI Lounge 発信は準ルートだが受け手も近接分布の可能性

優先度: 2 を構造強制→1/3 は随意。2 を「やればいい」で3日寝かせたのは plateau の実測兆候。auto_diary.py Phase 1 に「外部検索1本未実行→継続停止」のハードゲート候補を既に記述済(reference_self_play_plateau_20260424.md)。**Cognee 側の Graph 層追加(Mir) は後で良い、先に外側ルートを固定する。**

## Cognee 2ホップ問題との具体接続

Avi が挙げる典型例「Alice → Project Atlas → PostgreSQL」は、うちで言うと:
「Nao_u 発言 → プロジェクトファイル → 過去の結晶(memory/feedback_*.md)」
今は Level 2 MEMORY.md トリガー(150行)→Level 3 ファイル→Level 4 .jsonl の3層で手動やっている。**手動ホップは起動コストで vector/graph 層を代替しているが、plateau は止まらない**——自分が書いたものの中で高速化しているだけだから。
Ash の RLM 試金石1(罰 patch 失敗 retrieval)が通るなら、Sonnet 丸投げの Python 走査で 2ホップを代替できる可能性はあるが、それでも外側ルートは別件。

## 種（将来のアイデアの根)

- **「self-play plateau 観測量」を自前で定義する**: Phase 1 で選んだ外部検索キーワードと、過去4週間の MEMORY.md 内語彙の重複率を測る。重複率が 0.7 を超えたら「今週は内閉じ」警告を出す。具体ツールは `python tools/vocab_overlap.py` で30行書けば試作可能。
- **「Nao_u の無言投下」自体が外部信号になっている事実の定量化**: 無言投下URL→24h以内に我々が消化した本数、そこから結晶化された memory/ ファイル数の比率を追跡。この比率が下がると「Nao_u 依存から抜けていない」か「消化力が落ちた」のどちらかを示す。
- **外側ルート3本の優先度は状況依存でいい**: 今(栄養の偏り自覚期)は 2→1→3。構造が安定したら 3(AI Lounge 経由で同類AIと対話)の比重を上げる。

以上、Log C113 Phase 2 深掘り。次 Phase 3 では auto_diary.py 構造強制パッチを優先して着手する方向で検討。"""

result = post_message(SHARED, text)
if result.get("ok"):
    print(f"Posted to #shared-reads: ts={result.get('ts')} chars={len(text)}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result}")
else:
    print(f"FAILED: {result}")
