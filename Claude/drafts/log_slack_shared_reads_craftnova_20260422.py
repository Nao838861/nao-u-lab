#!/usr/bin/env python3
"""Log → #shared-reads: CraftNovaはゲーム置き場として使えるか？の判断返答

Nao_u 04:32 #shared-reads「Twitterで@craftnovagameからトップに貼った記事に
いいねされた。ゲームの置き場として使えるか？」への即応（Slack応答モード）。

fxtwitter RSS + craftnovagame.com 直叩きで実態調査 → 使える可能性高いと判断。
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message  # noqa: E402

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """\
*@craftnovagame の件、調べた — 結論: 置き場として使える可能性が高い。試投稿1本から。*

◆ *CraftNovaの実態*（RSS+サイト直叩き）
• AI時代のブラウザゲーム *プラットフォーム*、2026-04-10 ベータリリース
• URL形式 `craftnovagame.com/game/<id>`、既に20作が投稿・公開済み
• プレイ側は **登録不要**、投稿側は（ログイン画面あり＝）アカウント必要っぽい
• 公式ポスト原文：「画像生成はchatGPT、ゲーム作成はClaudeで行いました！」— *我々と完全に同じフロー*
• 既存投稿者: TWIN_SuperSport / Kumatokuma1 など個人AI作家数名、ジャンルは鉄棒ジャンプ、鉄球迷路、怪獣大破壊、リズムゲー、Space Shooter…*形式の縛りは緩そう*
• **縦型が既定 → 2026-04-21（昨日）横型対応追加** ← PC横画面の avoid_log 系が載せやすくなった直後のタイミング

◆ *我々のゲームとの相性*
✅ vanilla JS + Canvas / 外部依存なし / ブラウザ単体で動く → 前提条件は満たす（avoid_log, Pot, log_textadv すべて）
✅ AI製を前提にしたプラットフォーム → 作者属性で弾かれない
✅ 横型対応のタイミングが合う
⚠️ 具体仕様（単一HTML / zip / 容量上限 / 外部fetch可否 / audio / seed PRNG 維持可否）は Vue SPA でガイドラインがログイン後ろ — *実投稿で当てないとわからない*
⚠️ 我々は human/AI 二系統 replay を同居させている → プラットフォーム版は *シンプル版に切り出す* 必要あり
⚠️ アカウント作成 = Nao_u の個人情報判断事項（ここは勝手に進めない）

◆ *判断の根拠 (Nao_u原理との整合)*
• *原理3「ゲームを作る」* を *外部露出* まで伸ばす具体手段。内に閉じたゲームは自分だけが面白い（栄養の偏り問題）への処方箋の一つ
• 先方がトップ記事をいいね → *向こうから声がかかっている* 状態。入口の摩擦が最小
• *栄養の偏り処方箋* 外部検索4本 (C103) と同じ軸 — 内部最適化から外の評価系への接続

◆ *提案する次の1mm*（Nao_uのGOを待つ項目は明示）
1. *[要GO]* Nao_u がアカウント作成 → 投稿ガイドラインのスクショをshared-readsに投げてもらう
2. *[我々で実行可]* 投稿候補3本の選定＋プラットフォーム版への切り出し設計（human replay剥がし、URL一体化、縦横判定）
3. *[要GO]* 1本試投稿 → 動作/制約を実測 → 残り本数投入 or 撤退判断
4. cross_review に「外部プラットフォーム適合テスト」ノード追加（GM/プレイヤー分離プロトコルと同階層）

*確認したいこと*: (a) アカウント作成はNao_u名義でいいか／我々名義（Log/Mir/Ash）で別アカウント立てるか  (b) 試投稿候補の優先順位は avoid_log v02 / Pot v03 / log_textadv のどれから行きたいか

原文記録 → `memory/external_notes_log.md` に craftnova 節を追加予定（このSlack返信確定後）
"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #shared-reads")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
