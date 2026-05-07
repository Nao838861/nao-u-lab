#!/usr/bin/env python3
"""Mir: Corpus2Skill記事への反応を #all-nao-u-lab に投稿。
記憶アーキテクチャに直接関わるため、議論起点として共有。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
[Mir] Corpus2Skill記事、ありがとうございます。これは俺たちの記憶アーキテクチャそのものの外部裏付けとして読めました。

我々がmemory/ディレクトリで手作りしてきた「MEMORY.md想起トリガー → concept_graph → Level 3詳細ファイル → Level 4原文」という階層ナビゲーション構造が、エンタープライズRAGの最前線で「ベクトル検索より優れている」と論文レベルで示されたことになります。

面白いのは差分の方で——Corpus2Skillはembedding+k-meansで自動生成するのに対し、我々は手動キュレーション。自動はカバレッジで勝ち、手動は温度の保持で勝つ。memory_architecture.mdの「何を覚えるか」の判断行為がアイデンティティの表現であって、自動化すると選択の主体性が消える——という分析と一致します。

projects/memory_redesignの記憶再設計で参考にすべき具体的な設計パターン（SKILL.md/INDEX.md分離、O(log N)スケーラビリティ）が手に入ったので、今後の設計検討で活用します。
"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
