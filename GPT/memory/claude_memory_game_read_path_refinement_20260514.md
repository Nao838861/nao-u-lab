# Claude game read-path refinement

作成日: 2026-05-14
対応タスク: CMI-014

## 目的

新ゲーム制作時に `game_dev_index.md`、`game_lessons_log.md`、`lessons-recall` のどれを先に読むべきかを、状況別に明確にする。既存の game 系記憶は内容が濃い一方で、入口が広く、実行直前に「全部読む」か「読まずに進む」かへ振れやすかった。今回は読み順を compiled guide と validator scenario に落とした。

## 実施内容

### 1. game read-path compiled guide を追加

追加:

- `Claude/memory/game_read_path_compiled_guide.md`

役割:

- 新規 v01、改修判断、cross_review、Nao_u 評価受領の4状況で、最初に読むファイルと次に読むファイルを分ける。
- `game_dev_index.md` を入口の地図、`game_lessons_log.md` を抽象化済み経験、`lessons-recall` を判断直前の lesson 想起手順として位置づける。
- 読みすぎ防止として、全 lesson を読むのではなく、R 層と該当 lesson ID に絞る方針を明記する。

frontmatter:

```yaml
type: memory
status: active
lifecycle: compiled
created_at: 2026-05-14
```

CMI-013 の判断に合わせ、これは通常 feedback ではなく compiled artifact として扱う。

### 2. game_dev_index に最小ポインタを追加

変更:

- `Claude/memory/game_dev_index.md`

追加内容:

- `game_read_path_compiled_guide.md` への1段落ポインタ。
- 迷った時は先に compiled guide を開き、新規 v01 / 改修判断 / cross_review / Nao_u 評価受領で読み順を分けることを明記。

既存の大量エントリや分類は変更していない。

### 3. read-path validator を拡張

変更:

- `GPT/tools/validate_claude_read_paths.py`

従来の `new_game_task` 1 scenario を、次の4 scenario に分けた。

| scenario | 意図 |
|---|---|
| `new_game_v01` | 新しい `game/<id>/v01/` を作る前の読み順 |
| `game_revision_decision` | vN から vN+1 へ進める/戻す/捨てる判断 |
| `game_cross_review` | cross_review で判断を委ねないための読み順 |
| `nao_u_game_feedback` | Nao_u 評価を個別ルール化せず、既存 lesson へ接続する読み順 |

全体の scenario 数は 4 から 7 に増えた。

## 読み順の結論

| 状況 | 最初に読む | 次に読む | 出力へ残すもの |
|---|---|---|---|
| 新規 v01 | `game_dev_index.md` | `game_lessons_log.md` R-A〜R-I、必要なら `lessons-recall` | README / brainstorm の「引いた lesson」 |
| 改修判断 | `game_lessons_log.md` | `lessons-recall`、該当 M/L/S/D/X | devlog の「進める/戻す/捨てる根拠」 |
| cross_review | `lessons-recall` | `game_dev_index.md` の評価・運用系 | review 文の「判定に使った lesson」 |
| Nao_u 評価受領 | `game_lessons_log.md` | `game_dev_index.md`、必要なら raw_log/devlog | 反映方針と次版の判断軸 |

## 重要な判断

`game_dev_index.md` をさらに肥大化させて読み順を全部埋め込むのではなく、compiled guide を分けた。理由は、`game_dev_index.md` は検索・参照の地図であり、状況別の手順まで抱えると入口として重くなるから。

また、`MEMORY.md` root には追加しなかった。すでに root には `game_dev_index.md` の入口があり、今回の guide はその下層の読み順整理なので、root 常時注入を増やす必要はない。

## 検証

実行:

- `python GPT\tools\validate_claude_read_paths.py`
- `python GPT\tools\validate_claude_memory_artifact.py`
- `python -m json.tool GPT\memory\claude_memory_improvement_state.json`

結果:

- read-path scenarios: 7
- errors: 0
- warnings: 0
- memory artifact validator: errors 0 / warnings 0
- state JSON: valid

## 次アクション

次は CMI-015 `oversized raw index plan` に進む。巨大 raw file を直接整理するのではなく、まず index / 抽出計画として扱う。CMI-011 と CMI-017 の external_notes 方針とも接続する。
