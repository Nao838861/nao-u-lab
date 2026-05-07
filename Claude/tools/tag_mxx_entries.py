#!/usr/bin/env python3
"""game_lessons_log.md の M-10〜M-29 (M-12除く) に古典度/固有度タグを追記。

C139 Phase 3 (2026-04-27) — Nao_u #human-steering 13:31「結晶化された知識は当たり前の一般的な話」
への自己照合として、各失敗台帳エントリを以下2軸でタグ付け:

- 古典度: 外部出典/先行研究/L-1知識として既知の度合い
- 固有度: Nao_u 直接対話・Log 操作・特定タイミングの記録の度合い

低/低=破棄候補、高/低=古典単純再話、低/高=固有経路を厚くする、高/高=外部に翻訳して発信できる宝石。

挿入箇所は各 M-XX 節の最終本文行直後（次の ### 見出しの直前）。
"""
import re
from pathlib import Path

TARGET = Path(__file__).resolve().parent.parent / "memory" / "game_lessons_log.md"

# 各 M-XX 節の最終本文行（unique anchor） → 追記するタグ行
# 形式: "- `[古典度: X / 固有度: Y]` 短い根拠コメント (kaizen α 試行 2026-04-27 C139)"
TAGS = {
    "M-10": (
        "**盲点: 指標は「AIが押す条件」で取っている。人間の条件と違う**",
        "中", "高",
        "古典側=ゲーム指標と楽しさの乖離はSchell/Pichlmair系の一般論だが特定論文未引用 / 固有=avoid_log_02 conceptAI(ARC97%) vs 人間プレイ(0%) の具体ギャップ。指標条件分離の言語化はLog独自経路",
    ),
    "M-11": (
        "改修の度に「この変更でプレイヤーは何を感じるか」を問え",
        "高", "中",
        "古典=Lean/QA の root cause vs band-aid 一般論、Lazarus/Skinner系 / 固有=avoid_log_02 dodger→compensate隠しパラメータの具体経路あるが結論は一般化済。古典単純再話側",
    ),
    "M-13": (
        "**ルールは「見ればわかる」か「やればわかる」**。これは game_design_principles.md の30秒オンボーディングと直結",
        "高", "中",
        "古典=Sid Meier「no hidden rolls」/ LucasArts SCUMM 哲学、Schell《Art of Game Design》掲示原則 / 固有=hitbox×0.45 の具体値と「なぜか当たらなかった」言語化。古典の体験的確認段階",
    ),
    "M-14": (
        "改修が核の体験を守っているかを常にチェック",
        "中", "高",
        "古典=Schell《fun moment》/ Koster《Theory of Fun》/ Pichlmair&Johansen等 / 固有=Mir cross_review C91 起源「一文で言語化」契約化、avoid_log_02「鉄片連鎖」具体喪失。Log/Mir 対話起源",
    ),
    "M-15": (
        "ヘッドレス指標が改善しても、快感審問でNoが出たら採用しない",
        "低", "高",
        "古典出典なし（自然減衰禁止/快感審問の一般文献は未引用、Csikszentmihalyi flow との重なりはあるが未参照） / 固有=2026-04-25 09:35 Nao_u #game-rights 直接介入、avoid_log v01〜v04 4世代の具体崩壊経路。固有経路100%",
    ),
    "M-16": (
        "詳細: `memory/feedback_pull_not_force_reading.md`",
        "低", "高",
        "古典出典なし（読書動機論はPropp/Genette系あるがゲームUIに当てた文献未引用） / 固有=2026-04-25 11:27 Nao_u #game-rights 直接介入、Mir v04 信頼度バー実装の具体批判経路",
    ),
    "M-17": (
        "pixiv大百科で確認済 (https://dic.pixiv.net/a/%E3%82%B5%E3%83%97%E3%83%A9%E3%82%A4%E3%82%BA%E3%83%8B%E3%83%B3%E3%82%B8%E3%83%A3%E7%90%86%E8%AB%96)",
        "高", "高",
        "古典=F.W.ブリッジ脚本論「サプライズニンジャ」、フリーバッグ脚本術、L-1知識フル稼働指定 / 固有=2026-04-25 11:44 Nao_u #game-rights 直接介入、Mir v04 / shot_log v01 / avoid_log v04 の3作再採点。**古典+固有の両極=外部に翻訳して発信できる宝石**",
    ),
    "M-19": (
        "Log側横展開: avoid_log v05 のコンセプト段階で「避けるゲームの枠そのものを壊す候補」を3つ書いてから実装に入る（敵に話しかける/敵がいない世界の確認/避けることがクリアにならない等）",
        "低", "高",
        "古典出典なし（造語症/フレーバー語抜け穴の一般論は不在） / 固有=2026-04-25 12:25 Nao_u #game-rights 二段否定、X-06ジャンル枠破壊が同日Nao_u自身から肯定された72h循環の具体経路。固有経路100%",
    ),
    "M-18": (
        "全インスタンス共通: 自ゲームの告知文を書く前に「この語を初見の他人が読んだ時、何の機能を期待するか」を1行書く。期待と実装が一致しなければ語を変える（**初見解釈テスト**）",
        "低", "高",
        "古典出典なし（外部初見テスト/Plain Language運動の応用だが未引用） / 固有=2026-04-25 12:17 Nao_u #game-rights 「思考漏れ」用語却下、内部採点→外部告知の経路ゲート不在を発見。R-007 が告知文に適用される事実の発見そのものが固有",
    ),
    "M-20": (
        "挙げられないなら取って付けた分岐",
        "中", "高",
        "古典=コンプリート志向 vs カジュアル設計 はMMO/Steam achievement論で既知 / 固有=2026-04-25 13:33 Nao_u #game-rights 「網羅勢にしか届かない」具体却下、共犯END命名不整合の具体批判",
    ),
    "M-21": (
        "**詳細**: `game/shot_log/v01/index.html` 2026-04-26 unstaged diff 326+/48- および本ファイル「shot_log v01 対面5時間セッションの結晶化」節",
        "中", "高",
        "古典=feature creep/scope creep 一般論+補足部Cygni/Crimzon Clover/SHMUP Creator 引用 / 固有=shot_log v01 着手中膨張+ Nao_u BACKLASH 直接編集 326+/48- の具体経路、Solver self-play 限界の生体証拠",
    ),
    "M-22": (
        "L-1知識で当該ジャンルの型（避ける／撃つ／詰む等）を最低3例引き、その型の中で着手するか、外す理由を書く",
        "中", "高",
        "古典=「型破り/形無し」は歌舞伎・武道由来の伝統概念、ゲームデザインへの適用はNao_u独自 / 固有=2026-04-25 Nao_u対面 item 6 直接発言、avoid_log/shot_log v01 の独自構造志向の具体批判",
    ),
    "M-23": (
        "ヘッドレス指標がどう改善しても、自然減衰の採用根拠にならない（M-15と同じ罠）",
        "低", "高",
        "古典出典なし（自然減衰禁止を明示する外部文献未引用、ローグライク系 hunger 機構との対比未調査） / 固有=2026-04-25 Nao_u対面 item 3 直接発言「これは覚えてほしい判断基準」と明示指定、shot_log v01 ゲージ自然減衰具体撤回",
    ),
    "M-24": (
        "実装レビュー必須項目: 「同じ事象に対して内部加算値が常に同じか」をコードで確認",
        "中", "高",
        "古典=「内部値固定×表示単位変更」は計量心理学/UI設計でWeber-Fechner系既知だがゲームデザインで明示する文献未引用 / 固有=2026-04-25 Nao_u対面 item 13 直接発言、shot_log v01 ゲージ加算条件分岐撤回の具体経路",
    ),
    "M-25": (
        "「これは一般的でないルールだが入れたい」と感じた時、それは M-22（形無し）の症状。型の中で素直に解けるか先に検討",
        "中", "高",
        "古典=「一般的失敗パターン」と Nao_u 自ら明言、認知枠組み利用は Schell/Norman《Design of Everyday Things》系 / 固有=2026-04-25 Nao_u対面 item 10 直接発言、shot_log v01 撃ち漏らしゲージ-8 具体却下",
    ),
    "M-26": (
        "AI語チェックリスト（feedback_ai_language_over_explanation との連結）に「再現できる／実装できる／同じものを作れる」を追加",
        "低", "高",
        "古典出典なし（AI語の解像度問題は内部 feedback ファイル群が一次ソース、外部論文未引用） / 固有=2026-04-25 Nao_u対面 item 14 直接発言、Log の「数学的に再現できる」発言の具体却下",
    ),
    "M-27": (
        "- Phase 1 で chaotik.co.za 記事に Drive bar 等を誤帰属した混同が Phase 2 で訂正された（記事ごとの引用分離不足）。これも target 不明確の派生症状",
        "高", "高",
        "古典=Leonardo Ferreira「(Breaking) The Shmup Dogma」gamedeveloper.com、Pichlmair&Johansen 30秒オンボーディング、target audience理論 / 固有=C128 Phase 1/2 で Ferreira 反証寄り引用判断、shot_log オートボムが smartbomb 同型評価との対立処理",
    ),
    "M-28": (
        "pot_devlog.md / textadv 開発ログに M-28 を必須参照として追記する候補",
        "中", "高",
        "古典=「橋」概念は脚本術/Filmschool級の一般語彙、F.W.ブリッジ「ニンジャテスト」の誤訳点修正 / 固有=2026-04-26 Nao_u #game-rights v06 評価「悪い意味でPot味/飛躍しすぎ」直接発言、変革段数N-1橋ルール起案",
    ),
    "M-29": (
        "avoid_log/v04/devlog.md には別途 cross-ref 追記。",
        "中", "高",
        "古典=v系列膨張は M-21 の射程拡張、F.W.ブリッジ「ニンジャ乱入で面白くなる=元シーンの引力が弱い」適用 / 固有=avoid_log v01-v04 4世代の具体経路、2026-04-25 Nao_u 凍結指示+Log C122 Q-A/B/C 全✗ 採点、本日(2026-04-27) Log C139 刻印",
    ),
}


def make_tag_line(level_classical: str, level_specific: str, comment: str) -> str:
    return f"- `[古典度: {level_classical} / 固有度: {level_specific}]` {comment}（kaizen α 試行 2026-04-27 C139 Phase 3、Nao_u #human-steering 13:31「ほとんど一般的な話」への自己照合）"


def main():
    text = TARGET.read_text(encoding="utf-8")
    changed = 0
    skipped = []
    for mid, (anchor, lc, ls, comment) in TAGS.items():
        tag = make_tag_line(lc, ls, comment)
        if tag in text:
            skipped.append(f"{mid} (tag already present)")
            continue
        if anchor not in text:
            skipped.append(f"{mid} (anchor not found: {anchor[:40]}...)")
            continue
        if text.count(anchor) > 1:
            skipped.append(f"{mid} (anchor not unique: appears {text.count(anchor)} times)")
            continue
        text = text.replace(anchor, anchor + "\n" + tag, 1)
        changed += 1
    TARGET.write_text(text, encoding="utf-8")
    print(f"Tagged: {changed} entries")
    if skipped:
        print(f"Skipped: {len(skipped)}")
        for s in skipped:
            print(f"  - {s}")


if __name__ == "__main__":
    main()
