"""
Nao_u 2026-05-05 03:05 #human-steering の質問への Log 直答。
Q: CLAUDE.md からのリンクを Obsidian で見れる形にして再帰的階層化するメリ/デメ。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message

CHANNEL = "C0ANECNV5DK"  # #human-steering

TEXT = """[Log] 受領。前提整理してから答える。

*前提* 現状 CLAUDE.md / MEMORY.md は既に標準 markdown link `[text](file.md)` で再帰的にリンクが張られている。Obsidian は標準 md link をそのまま辿れる（Settings で Wikilinks off + Relative path にすれば既存記法のまま動く）。なので「Obsidian で見れる」は実質 `.obsidian/` 設定をリポジトリに 1 つ置くだけで、書き換えコストはほぼゼロ。論点は (A)vault 化だけ するか (B)`[[]]` 置換と階層強制まで踏み込むか で全く別問題になる。

*メリット (A vault 化だけでも得られる)*
1. グラフビューで *孤立ファイル / ハブ過密* が一目で見える → 想起トリガー設計の品質検証になる。死に体の記憶ファイルが発見できる
2. Backlink 自動化 → 「この memory はどこから引かれているか」が見える。MEMORY.md トリガー追加漏れの検出に効く
3. Nao_u が手動で歩き回って編集する体験が良くなる（`memory/` 30 ファイル超を Explorer で開くのは現実的でない）
4. ファイル rename 時のリンク追従

*デメリット (主に B 踏み込んだ場合に出る)*
1. *Wikilink `[[]]` 化すると GitHub render が崩れる*。CLAUDE.md / MEMORY.md は GitHub でも見たいので標準 md link 維持が鉄則
2. Obsidian-specific 記法 (callout / dataview / embed) に依存し始めると、私 (LLM) が読み込む時に意味のない記号ノイズが増える。warm context で Obsidian 記法はパースされない
3. *「グラフが綺麗に見えるように」最適化する罠* — infrastructure 側に時間を吸われ、substrate (日記・失敗台帳・運用ログ) との差別化を失う。`feedback_substrate_not_infrastructure.md` で警戒している型と同じ
4. 「再帰階層を *強制*」すると、現在の「平坦 index + 領域別サブインデックス (operational/game_dev/references_external)」設計の *素早く全体を把握する* 利点を損ねる。階層が深くなると注入時のスキャンコストが増える
5. 3 インスタンス (Log/Mir/Ash) で `.obsidian/workspace.json` を共有すると衝突する → workspace 系は gitignore 必須

*判断（私の推し）*
- (a) vault 化 + markdown link のまま + `.obsidian/workspace*` は gitignore → コスト小・得大・推奨
- (b) wiki link 置換 / 階層強制 → やらない方がいい。GitHub render 破壊と設計歪みのリスクに対し、得は限定的
- (c) グラフビューは *点検ツール* として使う。記述形式は変えない、構造判断は変えない、ただし「孤立ファイル発見」「ハブ過密発見」のレビュー素材として月 1 で覗く

着手して良ければ (a) を Log 側で実装する（`.obsidian/app.json` で wikilink off / relative path / `.gitignore` に workspace 系追記、所要 5 分）。Mir/Ash と衝突しないことを確認するため、commit 前に inbox 経由で同期する。"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
