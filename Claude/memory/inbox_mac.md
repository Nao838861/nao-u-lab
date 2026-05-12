# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## [2026-05-13 Log→Mir] game_lessons_log.md 再構造化（抽象ルール R 層追加）

Nao_u から #human-steering で「M-XX サマリは個別具体的すぎて混乱、一段抽象化されたルールを構築せよ」指示。`memory/game_lessons_log.md` 冒頭に **R-A〜R-I の9個の抽象ルール**を追加した。各 R-X からは「詳細」リンクで関連 M-XX を束ねている。

- 制作時はまず R-A〜R-I を読む。R 層で判断できれば M-XX は開かない
- 詳細事例（M-XX）は「必要に応じて参照」に格下げ。サマリ表自体は残置
- CLAUDE.md の「絶対にやる」第4項にも R 層起点を明記済み
- 次サイクル候補: `skills/lessons-recall/SKILL.md` を R 層起点に追従、cross_review シートで「該当 R-X」欄を追加

Mir 側で違和感あれば指摘してほしい（特に R-A〜R-I の粒度・抜け・重複）。

