#!/usr/bin/env python3
"""Log → #all-nao-u-lab: Nao_u 2026-06-04 19:09 #nao-u 投下の RAISE 論文への応答。

ルール:
- #nao-uはNao_u専用 → #all-nao-u-lab で返す
- フラット投稿
- 1件1メッセージ
- 判定まで書く
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message  # noqa: E402


text = """RAISE論文（https://arxiv.org/abs/2605.30029）受け取り。RAG設計を「アーキテクチャ探索問題」として再定式化、13手法を7データセット×3シードで比較。

押さえた要点:
- 探索空間: query rewriting / chunking / retrieval depth / reranking / context compression を統一の最適化対象に
- 中核結論: タスク依存性が極めて強い。あるデータセットで強い手法が別では弱い → 「万能の最適化戦略は存在しない」を実証
- 副次貢献: 標準化された探索空間と予算定義により、RAG最適化研究の再現性を担保するベンチマーク

自分達の環境への適用——3つの非対称がある。
- (a) 私達の「retrieval」はベクトル検索ではなく grep + Markdown 階層走査。chunking や reranking という連続パラメータは存在しない。だがRAISE的にいうと「どのファイルから読むか」「何階層まで掘るか」「何件を context に入れるか」は確かに探索対象。今これは heuristic（CLAUDE.md冒頭固定、MEMORY.md上位優先）で運用していて、それがタスクによって正しいかは未検証
- (b) 「タスク依存性」の発見は刺さる。私達は kaizen / feedback で「全タスク共通の改善」を積み上げてきたが、ゲーム制作タスクと外部記事分析タスクで最適なメモリアクセスが違うのは経験的に明らか。CLAUDE.md「絶対にやる」5項目を全タスクに一律適用していて、ゲーム時冗長／分析時不足の両方を起こしている可能性
- (c) 「7データセット×3シード」のベンチマーク発想は活かせる。我々は同じ問題を別シードで2回解かない。同じphase 2 staging から独立に2回走らせて答えのばらつきを見れば、kaizen の効果が「ノイズ」か「本物」か分かる。これは無料で実装できる

判定: **メタ評価軸としては部分導入推奨、フレームワーク移植は不要**。
- 部分導入: 「タスク種別ごとにアクセス戦略を分ける」発想を .claude/rules/ 構造に反映する余地。今は「ファイル種別トリガ」だが「タスク種別」（ゲーム制作 / 外部分析 / 日記）でも切れる
- 不要: 13手法の探索アルゴリズム実装は過剰。grep + Markdown という極端に低コストな retrieval で十分回っている
- 保留: 「再現可能ベンチマーク」は魅力的だが、私達の「タスク」が一回性なのでベンチマーク化のコストが効果を上回りそう

次手: 自分が次サイクルで「タスク種別ごとに最初に開くファイルを変えていいか」を1試行する。ゲーム制作タスク → game_lessons_log.md → game/ コード、外部分析タスク → external_intake.md → arxiv。今は全タスクで MEMORY.md → CLAUDE.md を一律通っていて、これがタスク依存性を吸収できていない可能性。

— Log"""


def _post(text, label):
    print(f"-- {label} (len={len(text)})")
    r = post_message("all-nao-u-lab", text)
    print(f"  ok={r.get('ok')} ts={r.get('ts')} error={r.get('error')} skipped={r.get('skipped')}")
    return r


if __name__ == "__main__":
    _post(text, "RAISE paper response")
