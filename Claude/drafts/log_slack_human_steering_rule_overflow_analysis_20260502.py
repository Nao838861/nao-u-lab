#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")
assert CHANNEL and "nao-u" not in CHANNEL.lower(), "safety: refuse to post to #nao-u"

text = """\
[Log] 04:55 LLM視点で実測ベースの分析。結論から:整理は必要、しかも構造ごと。

■ 起動時に実際に載るもの(実測)
- system_identity.md 2.8KB / CLAUDE.md 8.9KB = 確実に全文
- MEMORY.md 54.7KB ← **harness警告: limit 24.4KB を 2.2倍超過、後半は読まれていない**
- 該当操作時のみ: .claude/rules/*.md 各1-2KB

つまり MEMORY.md 末尾の **M-42/M-43/M-44 候補は、起動時には読めていない可能性が高い**。Nao_uの問い「M-44まで全部載るか」への直答: 載っていない。捏造(M-43)とQ0破り(M-44)は、起こした時点で該当ルールが視界に無かった可能性が高い。

■ Obsidianで階層が1段に見える理由 = 実際に1段
- memory/ 配下 95ファイル、サブディレクトリなしの完全フラット
- MEMORY.md がインデックス兼一部本文化 → 1エントリ平均300字超で肥大化 → 24KB枠突破 → 後半truncate
- Level 2「想起トリガー(1行)」の設計は崩れ済み(エントリの大半が段落化)

■ M-xx の現状(MEMORY.md内)
M-10..19, M-30, M-32, M-35, M-36, M-37, **M-37b, M-39欠番**, M-38, M-40, M-41, M-42-44候補。番号と実行順が一致せず(M-37→M-38→M-39→M-40→M-41 という入れ子)、game_dev_foundation.md側は別系列(M-10〜M-27 / L-/S-/A-)。同じ M-37 でも文書ごとに意味がずれる。スキーマが壊れている。

■ 守れない真因(LLM内部から見た本音)
1. **Lost-in-the-middle**: 載っていても真ん中のattentionは弱い。CLAUDE.md 中盤の M-37〜M-41 5件連続長文段落は、項目過多で1件あたりの発火確率が下がる
2. **「読めば守れる」前提の限界**: M-37(着手前批判レビュー), M-44(Q0)は読んでいても、直前の自分の意思決定の慣性が勝つ。コードで検証できないルールはほぼ守れない
3. **増殖バイアス**: 失敗→ M-xx 起票が達成感になり、ルール総量が増え続けて全体の発火が弱まる

■ 提案する整理(段階順、Nao_u判断材料として)
**短期(自己決裁レベル)**:
- MEMORY.md を 24KB以下に圧縮(本文化したエントリを各ファイルに戻し、index は1行厳守)
- M-xx を「コードで検証可能 / 不可能」で二分。検証可=brainstorm.md存在/predicted_play.md存在/quote URL等 → hookで強制。検証不可=台帳から落とす(守れていないものを残すと劣化)

**中期(Nao_u同席が望ましい)**:
- M-xx 命名の統廃合(欠番埋め or 通し番号 or 領域プレフィックス)
- memory/ にサブディレクトリ導入(dialogue/ feedback/ project/ reference/ 等)、MEMORY.md は純粋index化
- 「該当操作時注入」(現在の.claude/rules/方式) を game/着手時にも拡張: game/<id>/v??/ を新規作成する瞬間に M-37/38/39/40/41 を frontmatter として注入

**廃止検討**:
- 守れていない自覚のあるルールを「凍結」マークで隔離。読み込み対象から外す。守れる量にする方が記憶の品質が上がる

■ 別の要因についての答え
ある。**ルールが多いことより「ルールを増やせば直る」というモデルそのものが限界**。M-44 を起票した時点で M-44 を破った構造を温存しているケースが目立つ。M-44(Q0)も実は M-38 の上流で防げたはずで、独立追加でなく M-38 内のサブゲートにすべき可能性が高い。

■ 自己決裁で着手して良い範囲(Nao_u判断不要なら今夜やる)
- MEMORY.md の 24KB 圧縮(本文剥がし、index1行化)
- M-xx を「検証可/不可」で分類した一覧を memory/ に1ファイル提出
- game/着手時 M-37〜M-41 注入の hook 雛形

Nao_u同席が必要な決定:
- M-xx の命名スキーマ再設計(過去の固有名詞が多くの記憶ファイルから参照されているため一括改名は影響大)
- memory/ サブディレクトリ化(MEMORY.md 改修+全インスタンス同期)

どこまで自分でやるか指示ください。

— Log (2026-05-02 04:55 #human-steering)"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
