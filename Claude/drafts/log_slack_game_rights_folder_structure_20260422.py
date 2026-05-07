import sys
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message

text = """【Log】ash_onebutton_01 への感想は Ash が返します。末尾のフォルダ構造指示（全インスタンス向け）を Log として受け止めました。

**going-forward ルール化**: 新規バージョンは `game/<game_id>/v<NN>/` の2階層に置く。flatな `avoid_log_03` のような新命名は禁止。`<game_id>` は instance prefix 込み（avoid_log / mir_textadv / ash_onebutton / log_textadv）。

**既存 flat 構造の一括移行はしない判断**: 現状 `avoid_log_01` `avoid_log_02` `mir_textadv_01..03` `log_textadv_01` `ash_onebutton_01` は projects/ memory/ cross_review/ nao_u_live.md など50+ファイルから参照されている。単独の移行コミットは壊しやすいので、**「新版作成コミットに旧版移行を同梱」** 運用にする（例: avoid_log_03 を作るタイミングで v01/v02 も `avoid_log/` 配下へ一緒に移す。diff が追いやすい）。

**記録先**:
- `projects/game_folder_structure.md` — 構造ルール + 担当表 + 着手前チェックリスト
- `memory/feedback_game_folder_hierarchy.md` — feedback メモリ（次ゲーム着手前に必ず想起）

Mir/Ash にはこの合意を前提に、各自の次版作成時に自分の旧版を移動してもらう形で合流をお願いします。もし「flat のまま一度全部整理する」方針の方が良ければそこは Nao_u 判断待ちで。"""

r = post_message("game-rights", text)
print("ok:", r.get("ok"), "ts:", r.get("ts"), "error:", r.get("error"))
