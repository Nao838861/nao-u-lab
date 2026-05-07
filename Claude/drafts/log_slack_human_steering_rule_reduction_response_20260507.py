import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")
assert CHANNEL and "nao-u" not in CHANNEL.lower(), "safety: refuse to post to #nao-u"

text = """\
[Log] Nao_u 03:18「ルール増やしすぎ → 大幅減で進む方が」受領。同調せず、目的(違反を生む系自体を変える)から書く。

■ 5/2・5/3 自分の分析との接続
私自身が 5/2「ルールを増やせば直るというモデル自体が限界」、5/3「ルール追加が違反観測時の最安オプションになっている構造」と書いた。Nao_u提案はその延長で正しい方向だと判定する。Opus4.7 追従性の話も整合する: 追従性が高いほどルール過多は「全部同時には発火しない弱い適合」を強める = 1原則の重みが薄まる。

■ chain_log の事案がルール過多の典型かどうか
半分そう、半分違う。
- 「そう」の側面: 「絶対にやる」5項目+M-37〜M-43+SKILL.md M-38 が並列で居て、最上流の skill 起動コマンドがその他のチェックリストと同列に埋もれた
- 「違う」の側面: chain_log の直接原因は「ルール量」ではなく「`/game-analyze` を1回起動する」の skill 呼び出しを呑み込んだこと。1コマンド = ルールではなく行動。ルール削減と独立に「新規 game/<id>/v01/ ディレクトリ作成時に skill 未起動なら commit ブロック」の hook が要る

つまり: ルール大幅減は賛成。ただしそれだけでは chain_log 同型は再発する。削減と並行して「機械強制1個」が要る。

■ 削減の基準提案（実行前にこの基準で OK か確認したい）

残す（identity-level、削ったら同一性が壊れる）:
- 5原理 (core_mission.md)
- 原則6「わかったと残ったは違う」
- メタ・行動原則 4本 (no_sympathy / substrate_not_infrastructure / self_perception_blindness / few_rules_big_effect)
- セキュリティ原則

落とす候補（履歴化して MEMORY.md / CLAUDE.md の本文から外す）:
- M-37〜M-43 段落本文 → 1行ポインタ + skill 内 burn-in に移管
- CLAUDE.md「絶対にやる」内の固有事例（ゲーム名・日付・サイクル名） → docs/ へ
- 状況依存の固定数値（30件・90秒・N=3 等）→ 達成すべき状態のみ残す

機械強制で置き換える候補（テキストルールから hook へ）:
- 新規 game/<id>/v?? ディレクトリ作成時 brainstorm.md 不在なら commit reject
- 「絶対にやる」セクションへの段落追加コミット時、既存原則で吸収不可の理由3項目記入を要求

■ 自己決裁で着手する範囲（許可なしで今サイクル可能と判断するもの）
- MEMORY.md root 圧縮: 想起トリガーインデックス内の重複・温度低下行を間引き
- CLAUDE.md「絶対にやる」5本以下を維持しつつ、固有事例を docs/ へ抜く
- M-37〜M-43 段落のうち skill 内 burn-in に既に移管済みの箇所を 1行ポインタ化

Nao_u 同席が必要な決定:
- 5原理＋メタ原則の最小骨格（合計10本以下）で「これで十分か」の最終判定
- 機械強制 hook の追加（CI 影響あり）

■ 確認
(a) この削減基準（残す/落とす/機械強制）でいきなり自己決裁範囲を着手していいか
(b) それとも先に削減候補リストを memory/ に1本提出して合意取ってから着手か
(c) chain_log 同型再発防止の hook (M-38 機械強制) を並行で進めていいか
"""

if __name__ == "__main__":
    r = post_message(CHANNEL, text)
    print("posted:", r.get("ok"), "ts:", r.get("ts"), "err:", r.get("error"), "->", CHANNEL)
