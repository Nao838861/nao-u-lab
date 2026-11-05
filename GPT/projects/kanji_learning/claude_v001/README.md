# カンジ工房（Claude版 claude_v001）

`memory/projects/kanji_learning/20261105_claude_handoff.md` を起点に、Claude が作り直したコンセプト確認用の試作。GPT 版（`../v001`）のコードは改修せず、収録データ・字形・手書きの形チェックだけを再利用した。

## 起動

```powershell
cd D:\AI\Nao_u_BOT\GPT\projects\kanji_learning\claude_v001
python serve.py        # http://127.0.0.1:8765/
```

`run_kanji_kobo_claude.cmd` をダブルクリックしても起動する。Windows の `python -m http.server` は `.js` を text/plain で返し、ES Modules が読み込めないため、MIME を固定した `serve.py` を使う。

## 学年別データ（小1〜小6・1026字）

起動すると最初に学年（1〜6年）を選ぶ。選んだ学年は保存され、ホームの「学年をかえる」で変えられる。

`web/grades/g1.json`〜`g6.json` は `tools/build_grades.py` が公開データから作る。

```powershell
python tools/build_grades.py <データフォルダ>
```

データフォルダに置くもの：
- `kanjivg.xml`（https://github.com/KanjiVG/kanjivg/releases の `kanjivg-*.xml.gz` を展開）
- `kanjidic2-en-*.json` と `jmdict-eng-common-*.json`（https://github.com/scriptin/jmdict-simplified/releases）
- `JMdict_e`（http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz を展開。語の頻度順位 nf に使う）
- `JmdictFurigana.txt`（https://github.com/Doublevil/JmdictFurigana/releases）

学年の割り当ては2020年度の学年別漢字配当表（80/160/200/202/193/191字）と一致することを確認済み。部品の分け方・名前・お題の作り方は `design_log.md` の「学年別」節。`web/grades/build_report.txt` に公開資料の唱え方との照合結果が出る。

## 遊び方（中心の流れ）

### 部品クイズ（handoff 第4節の要望）

1. 部品の**形**を見て、**なまえを6択**で答える。誤答はその候補だけ消え、正解するまで後半へ進まない。
2. 正解すると、同じ部品の**なまえ → 形**の問題になる。形は **12個から直接タップ**、または **ペンで書く**。
3. 3部品で一区切り。まとめから「つぎの3部品」に続けられる。
4. 出題は、未挑戦・誤答の多い部品を優先する。

### 漢字をつくる（handoff 第3節）

1. ミチムラ式のタイトルの書式でお題を出す（例：「労ドウ の ドウ　はたら_く」と、□に読みを添えた語例「労□者」）。答えの字は見せない。
2. **ひらがなの部品名**を書き順に唱える（ミチムラ式）。例：「にんべん、おもい、ちから」。
3. 形を出す：**12個の部品の形**から①②③の順に一つずつ選ぶ（公式カードのように、足した部品が赤で字に加わる）、または**見本なしでペンで書く**。
4. 一回3文字。ずかんから一文字だけでも遊べる。

### 共通

- 「12個から選ぶ／ペンで書く」は**暗黙のモード**。毎問は聞かず、問題の中でいつでも切り替えられる。切り替えても選んだ形・筆跡は消えない。最後のモードは次回起動にも引き継ぐ。
- ヒントは場所ごと（ひだり／みぎ等）に「なまえ＋読み上げ → その部品の形 → その部品の書き順」と段階的に開く。そこから**その部品のクイズ**へ行き、終わると元のお題に戻る。
- 「見本を見る」で漢字全体の書き順を確認できる。見本の後は「見本を消してもう一度」か「見本を見たので次へ」を選ぶ。見本で進んだ場合は成功として記録しない。
- ずかん：18部品を一画面（9列）、12のお題を一覧。タップでその部品のクイズ／その字のお題を始める。途中の問題からずかんを開いた時は「とちゅうの問題にもどる」で戻れる。

## 記録（localStorage `kanji-kobo-claude-v1`）

- `kanji[字]` / `parts[部品ID]` に `name` / `shape` / `pen` を別々に `{ok, miss}` で記録。`hinted`（ヒント使用）、`model`（見本を見た）も別に数える。
- `settings.mode` は `shape` または `pen`。
- 筆跡は一問の中だけで保持し、保存・送信しない。

## ファイル

| ファイル | 内容 |
|---|---|
| `web/index.html` | 入口 |
| `web/app.js` | 画面・状態・記録・ペン入力（Claude 作成） |
| `web/style.css` | 画面（Claude 作成） |
| `web/grades/g1〜g6.json` | 学年ごとの漢字（筆画・部品・お題・語例）と部品（派生データ、CC BY-SA） |
| `tools/build_grades.py` | 学年データを作る |
| `web/handwriting.mjs` | 筆画パスのサンプリング等（v001 からコピー） |
| `web/recognize.js` | 手書きの形チェック（候補の中で一番近いか） |
| `eval_handwriting.mjs` / `tools_synth.mjs` | 合成筆跡による手書き判定の評価 |
| `web/ATTRIBUTION.txt` | 出典 |
| `serve.py` / `run_kanji_kobo_claude.cmd` | ローカル配信 |
| `test_flow.mjs` | 実ブラウザー（Chrome + Playwright）でのクリック・ペン入力による流れの検証。`shots/` に画面を保存 |
| `design_log.md` | 設計判断の記録 |

## 検証

```powershell
node test_flow.mjs
```

`D:\AI\Nao_u_BOT\Claude\node_modules\playwright` と Chrome を使う。30項目（6択→12択の順番、誤答で先へ進まない、モード切替で筆跡・選択が消えない、モードの永続化、ヒント→部品クイズ→復帰、ずかん往復、見本どおりの線はペン判定を通り一本線は通らない、記録の区別、コンソールエラーなし）が通過。

未確認：iPad・ペンタブでの実際の書き心地、子供の実筆跡でのペン判定、読み上げ音声の品質。

## スマホから開く

claude.ai の非公開artifactとして公開済み（所有者のみ閲覧可）：https://claude.ai/artifact/2C41hEj21aLPJsmkYPvu8K
slug `09a42d23-1a42-4be2-88e9-4c5c346d7bc0`。`web/` を更新したら同じ slug へ再公開する。
