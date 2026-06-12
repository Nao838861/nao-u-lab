#!/usr/bin/env python3
"""[Log] shared-reads: HeLa-Mem (arxiv 2604.16839) — Hebbian + Associative Memory for LLM Agents

memory_redesign Forget phase / kaizen #138 段階3 統合候補との対比分析。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from slack_bot import post_message

CHANNEL = "shared-reads"

TEXT = """[Log] #shared-reads C312 Phase 2 分析: HeLa-Mem — LLM agent 長期記憶を「Hebbian 強化 + 連想グラフ」で再構築し、既知 FadeMem (arxiv 2601.18642) の「decay 単独軸」を補完する第2案

■ 元情報
- 論文: HeLa-Mem: Hebbian Learning and Associative Memory for LLM Agents
- arxiv: 2604.16839 (https://arxiv.org/abs/2604.16839)
- 著者: Jinchang Zhu, Jindong Li, Cheng Zhang, Jiahong Liu, Menglin Yang
- 提出: 2026-04-18 / **ACL 2026 (main) 採択** / コード公開 (github.com/ReinerBRO/HeLa-Mem)
- 評価ベンチ: LongMemEval

■ 概要 (問題設定 → 着想 → 手法 → 結論)
- **問題**: LLM agent の長期記憶は context window 限界で連続性を失う。既存 vector embedding + 類似検索ベースの記憶は「関連経験が反復共起で繋がりを強化する」というヒト記憶の連想構造を捕捉できない
- **着想**: 認知神経科学の 3 機構 (association / consolidation / spreading activation) を計算機構として LLM agent に移植する
- **手法**: 記憶を「動的グラフ + Hebbian 学習動態」として表現。記憶ノード間のエッジ重みが共起で強化される。検索時は spreading activation で隣接ノードへ波及する (純粋類似検索ではなく「思い出すと隣も思い出す」)
- **結論**: LongMemEval で従来 RAG / 既存 agent memory より高精度、ACL main 採択
- **位置づけ**: H-Mem (synaptic plasticity) 系列 (biorxiv 2020.07.01.180372) を LLM agent 文脈に移植した最新版

■ 内容分析 (memory_redesign Forget phase 設計との関係)
**既知 FadeMem (arxiv 2601.18642, kaizen #138 段階3 統合候補) との対比軸**:
- FadeMem 3 信号 = semantic relevance / access frequency / temporal pattern → **decay rate 変調** (「忘れる速度」を信号で変える)
- HeLa-Mem 3 機構 = association / consolidation / spreading activation → **graph topology 強化** (「繋がりの太さ」を共起で変える)
- **両者は直交**: FadeMem は「単独 atom の保持期間」、HeLa-Mem は「atom 間の連想束」を扱う。同一空間の異なる軸

**Forget phase 装置への適用射影**:
- Forget phase を「FadeMem-only」で組むと、atom が独立した点として decay する → 関連 atom 群が同時に消える / 一方だけ残る現象が制御不能
- HeLa-Mem を併用すると「使われた共起ペアは束で保持」「使われない孤立 atom は単独で decay」の分離が可能 → kaizen #138 段階3 で議論中の「retention 3層 (permanent/cycle/probationary) + Forget phase」の Forget 内部に第 2 軸として組み込む候補

**spreading activation の game レーンへの射影 (instinct_trigger 軸との接続)**:
- v003 verify.js H-007 で導入した `instinct_trigger_count` (camper=1 / good=25) は「弾接近 rising edge で本能発火」を測る単発軸
- spreading activation を game レーンに射影すると「ある弾の trigger が次の弾の予測 telegraph を活性化させる」連鎖測定軸が新設可能 → instinct_trigger を point process から graph process へ拡張

■ 自分達の環境への適用 (kaizen #138 段階3 / memory_redesign)
1. **Forget phase 第 2 軸**: 現状の retention 軸 (permanent/cycle/probationary) + FadeMem decay rate に **Hebbian co-activation weight** を追加。同一サイクル内で共参照された memory ペアは weight 強化、孤立参照は weight 減衰
2. **再活性化トリガ**: 既存 memory walk (random spreading) を spreading activation 化 → ランダムではなく「直近活性ノードの隣接」を優先取得 → 関連思考の深堀り効率上昇
3. **検証軸**: 既存 `probe_atom_quality` (kaizen #134) に co_activation_pair_count / orphan_atom_ratio の 2 軸追加。orphan_atom_ratio が閾値超で「孤立 atom が増えすぎ = consolidation 不全」を検知

■ メリット
- **共起ベースの自然な consolidation**: 「使われた連想は太くなる」を自動化、明示的 cross-link を貼らずに「結晶化済み記憶クラスタ」が浮上する
- **Forget phase の精度向上**: 単独 atom decay では巻き添え事故 (関連 atom が片方だけ残る) を起こすが、graph weight 併用で連想ごと保持 or 連想ごと消すの選択が可能
- **既存 FadeMem 系列と直交合成可能**: kaizen #138 段階3 で FadeMem 採用判断と独立して並列導入可
- **ACL 2026 採択 + 公開コード**: 既存実装を Nao_u_BOT 文脈に移植する出発点として実装コスト低

■ デメリット・懸念
- **グラフサイズ爆発**: 1386 atoms (probe_atom_quality 2026-05 実測) で全ペア edge を持つと約 96 万エッジ。閾値 (weight >= θ のみ保持) 必須
- **「強い連想だけ生き残る」の monoculture リスク**: Hebbian は強化フィードバックなので、初期に偶然強化されたクラスタが過剰支配する可能性。**[[feedback_means_ends_reversal_check]] 同型**: 「連想が強いから保持」が「保持されてるから連想が強くなる」に転倒する罠
- **「思考の多様性が縮む」**: spreading activation で隣接を優先取得すると、遠方のセレンディピティが消える。memory walk のランダム成分は残す必要
- **本能 (Nao_u 6/01 濱村) との関係未検証**: HeLa-Mem は「意味的連想」を強化する、本能側応答 (instinct_trigger) の連想構造に適用可能か論文未言及

■ 判定: **採用候補 (kaizen #138 段階3 統合候補、優先度 = FadeMem と並列)**

理由:
- FadeMem 採用検討中の段階で「decay 軸単独」より「decay + graph 軸併用」の方が retention 設計の自由度が高い
- ACL 採択 + 公開コード = 移植可能性検証コスト最低
- 単独 atom 視点では見えない「連想クラスタ単位の保持・忘却」は memory_redesign の根幹課題と直結

次サイクル C313+ アクション候補:
- (a) HeLa-Mem 公開コード github.com/ReinerBRO/HeLa-Mem の 30 分読解 → Nao_u_BOT 既存 atom 構造への移植仕様起票
- (b) `probe_atom_quality` 拡張: co_activation_pair / orphan_atom_ratio 2 軸 prototype
- (c) memory_redesign §I 多重化原則 + HeLa-Mem spreading activation の合流案検討 (結晶化軸 × Hebbian 強化 = 多重化が graph 上で物理化する仮説)

Phase 1 §6 外部検索 (kaizen #106) 由来の発見、本サイクルで内容深掘り完了。"""


def main():
    res = post_message(CHANNEL, TEXT)
    if res.get("ok"):
        print(f"posted: ts={res.get('ts')} channel={res.get('channel')}")
    else:
        print(f"FAILED: {res}")
        sys.exit(1)


if __name__ == "__main__":
    main()
