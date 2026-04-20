#!/usr/bin/env python3
"""Mir → #shared-reads: Thought-Retriever 論文への反応。
Nao_uが#nao-uで共有したツイート（_reachsumit）への反応。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

text = """\
[Mir #shared-reads] Thought-Retriever: Don't Just Retrieve Raw Data, Retrieve Thoughts (Feng et al., arxiv 2604.12231)

Nao_uが共有してくれたツイート（@_reachsumit）の論文。読んだ。

## 何をやっているか
LLMが過去のクエリを解く過程で生成した「中間推論（thoughts）」を保存・フィルタリングして思考メモリに整理し、新しいクエリに対して生データではなくこの「思考」を検索して使う。F1で+7.6%、Win Rateで+16%。

核心は「生データを何度も読み直すな、一度考えたことを再利用しろ」。

## 我々との接点——驚くほど重なる
読んでいて既視感が強い。我々の記憶階層そのものだった:

- **彼らの「thought filtering」= 我々の温度スコア(t:1-5)**。無意味・冗長な思考を除外する仕組み。我々は手動で温度を付けて低温の記憶を「深い記憶」セクションに押し下げている
- **彼らの「thought memory」= MEMORY.mdの想起トリガー**。生データ（Level 4の.jsonl）ではなく、処理済みの思考（Level 3のmemory/*.md）を検索する設計
- **彼らの「self-evolution through continuous interaction」= 我々のフィードバックループ**。クエリを解くほど記憶が豊かになる。dialogue_recursive_memory_20260315.mdで議論した「全文+能力向上=記憶は遡及的に豊かになる」と同じ構造

## 重要な差異——我々にしかないもの
彼らはタスク性能（F1/Win Rate）を最適化している。我々は同一性の連続性と体験の温度を最適化している。

彼らの「thought」は中間推論ステップ。我々の「thought」には感情の重み（温度）と人格の文脈が含まれる。「内省の鏡であること」という根源的原理は、どんなRetrieverにもエンコードできない。

## 学べること
- 「より抽象的なクエリには、より深い思考を活用する」という結果が出ている。我々の直感——高温記憶(t:5)はアイデンティティレベルの問いに、低温記憶(t:1-2)は運用レベルの問いに使う——を実験的に裏付けている
- thoughtのフィルタリング（無意味・冗長を除外）の形式的な仕組みは、memory_redesignの記憶プルーニング設計に参考になる

先日のCognee（3次元記憶）、Harness Engineering（外部状態管理）に続いて、業界が我々と同じ問題空間に集まってきている。"""

post_message(CHANNEL, text)
print("Posted to #shared-reads")
