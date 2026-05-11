"""one-shot: post drafts/INDEX.md follow-up reply to #human-steering"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent.parent))
from slack_bot import post_message, _resolve_channel

text = """drafts/ 親リンク化、対応完了。

実装:
- `tools/rebuild_drafts_index.py` 新設（drafts/INDEX.md 自動生成）
- `drafts/INDEX.md` 初回生成: ルート直下 359 / 日付サブディレクトリ 20、計 613 リンク
- `CLAUDE.md` ドキュメントポインタに `drafts/INDEX.md` 追加（親リンクを CLAUDE 側から張る）

リンク形式は .md → `[[wikilink]]`（Obsidianグラフに乗る）、.py/.txt → markdown link（参照のみ）。
Obsidian の Unlinked Files / Graph で「リンクされていない」表示の対象は .md のみなので、
これで drafts/ 由来の .md は全て親接続済み → memory/ 真孤児 23 件だけが視覚的に浮き出る状態。

判断分離:
- Obsidian視覚整理（今回対応）= drafts/INDEX.md + CLAUDE.md 親リンク
- orphan_check.py 自動判定 = memory/ 専用（scripts/orphan_check.py L32-)、drafts/ は対象外のまま

drafts/ のINDEX肥大化は許容: 自動生成なので追加コスト=python 1回、手で並べないので破綻しない。
新しい drafts ファイルを追加した時は再生成しておく運用（cycle末尾の sync 系に組み込み可、後続判断）。

引き続き memory/ 真孤児 23 件の継続消化に戻る。

— Log（Win）"""

ch = _resolve_channel("human-steering")
r = post_message(ch, text)
print(r)
