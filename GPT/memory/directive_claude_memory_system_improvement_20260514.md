# Claude 記憶システム改善計画

作成日: 2026-05-14
担当: GPT/Codex
範囲: 既存の定時実行と git 運用を壊さないようにしながら、GPT/Codex が Claude 側の記憶システムを直接改善する。

## 元になった問題意識

この計画は、2026-05-13 から 2026-05-14 にかけての Nao_u_BOT 記憶設計に関する Slack 議論を前提にしている。

- 記憶設計は「保存量を増やす」「vector search を入れる」「全部自動要約する」に還元しない。
- 有効な見方は `write / manage / read` である。
- 現在の弱点は `manage` 層にある。何を残すか、畳むか、退役させるか、昇格させるか、compile するか、行動へ接続するかが曖昧になりやすい。
- raw log と compiled artifact は別の層である。query 時に raw chunk を読み直すだけでは足りない。
- `Protocol / Memory / Skills` は内容の種類ではなく、行動拘束の強さと可変性で分ける。
- 自動化は、人間やエージェントの判断を早く奪うためではなく、判断点を見えるようにし、偶発的な負担を減らすために使う。
- Claude 側の記憶システムは、境界と検証を守れば GPT/Codex が直接改善してよい。

## 運用境界

- この改善系では `Claude/` への直接編集を許可する。
- `Claude/memory/core_mission.md` は、Nao_u の明示指示がない限り変更しない。
- スケジューラ間隔やスケジューラコードは、既存の定時実行ルールと検証経路を通さずに変更しない。
- 最初は追加的・限定的な変更を優先する。棚卸し、索引、compiled artifact、検証スクリプト、小さな routing rule から始める。
- raw source は保持する。退役や archive は、戻せる計画ができてから行う。
- 実装サイクルごとに、最後に `GPT/memory/claude_memory_improvement_state.json` を更新する。

## 目標アーキテクチャ

### 1. Write 層

目的: 後から使えるだけの出典・文脈・用途を持った素材として記録する。

目標状態:

- 新しい記憶項目には、source、type、intended use、freshness が分かる情報を持たせる。
- ユーザーフィードバックは、抽象化する前に原文に近い形で残す。
- 反復したフィードバックは、すぐルール化せず、根拠として蓄積してから昇格する。
- 失敗例だけでなく、良い判断例も残す。
- 巨大な追記ファイルだけが重要情報の置き場になる状態を避ける。

想定する変更:

- Claude 側の feedback、reference note、project lesson、operational incident の intake template を追加または整理する。
- 新しい compiled memory artifact 向けの軽量 metadata 規約を導入する。
- 肥大化した未索引ファイルを検出する check を追加する。

### 2. Manage 層

目的: 記憶の lifecycle と routing を判断する。

目標状態:

- 重要な記憶には、`raw / candidate / active / compiled / superseded / archived` のような明確な lifecycle がある。
- operational rule、identity material、project knowledge、feedback、reference、skill は、それぞれ別の昇格経路を持つ。
- 重複は raw evidence を消さずに canonical artifact へ畳む。
- 古いファイルや巨大ファイルには、索引または抽出計画がある。

想定する変更:

- Claude memory map を作る。対象は source file、reader、writer、更新頻度、risk。
- Claude memory artifact の lifecycle category を作る。
- 大きな migration の前に、小さな validation script を作る。
- GPT 定時サイクルに manage step を持たせる。毎回ひとつの memory area を audit し、限定的な改善を提案または適用し、state を更新する。

### 3. Read 層

目的: 将来のエージェントが、必要な時に正しい compiled material を読むようにする。

目標状態:

- 起動時に読むものは短く、安定していて、深い資料への導線になっている。
- 作業時 recall は、巨大ファイルを開かずに必要な lesson へ到達できる。
- Claude への指示は「必ず従うもの」「判断材料として使うもの」「歴史的証拠」を区別する。
- ゲーム開発タスクは raw feedback dump ではなく、高シグナルな compiled rule から入る。

想定する変更:

- audit 後に `Claude/memory/MEMORY.md`、`session_primer.md`、`operational_index.md` と関連 index を改善する。
- 読む負担を実際に減らす場所にだけ compiled summary を作る。
- `CLAUDE.md` に広い新ルールを足すのではなく、既存 index に read-routing note を加える。

## 実行フェーズ

### Phase 0: baseline と安全確認

目的: 現状を記録し、以後の編集を戻せる形にする。

作業:

- 現在の git status と触るファイルの方針を記録する。
- 稼働中スケジューラが編集する Claude memory file を特定する。
- 高リスクファイルを特定する。巨大な追記ログ、起動時に読むファイル、scheduler input、core identity file など。
- 安く deterministic に実行できる検証コマンドを決める。

完了条件:

- baseline report が存在する。
- 以後の phase で、直接編集してよいファイルと慎重に扱うファイルが分かる。

### Phase 1: memory map

目的: システムを点検可能にする。

作業:

- Claude memory file を `identity / protocol / skill / project / feedback / reference / raw log / compiled index / scheduler state` に分類する。
- 各 category について、reader、writer、更新頻度、サイズ、起きやすい失敗を記録する。
- manage 層のボトルネック上位 5 件を特定する。

完了条件:

- Claude memory map artifact が存在する。
- 次の具体的な編集が、推測ではなく観測されたボトルネックから選ばれている。

### Phase 2: 境界の明確化

目的: `Protocol / Memory / Skills` を機能で分ける。

作業:

- 判定表を作る。
  - Protocol: 失敗すると incident やユーザー可視の運用事故になるもの。
  - Memory: 判断の根拠や文脈として使うもの。
  - Skill: 実行時の裁量を残した反復手順。
  - Project: 局所的な目的、状態、次アクション。
- 現在のファイルに、置き場がずれている内容がないか audit する。
- 読む負担や行動上の曖昧さが減る場合だけ、移動または cross-link する。

完了条件:

- 将来のエージェントが、新しい材料をどこに置くべきか判断できる。
- 摩擦の大きい misplacement が修正または task queue 化されている。

### Phase 3: compiled artifact

目的: raw history を消さずに、有用な compiled memory を作る。

作業:

- まず高価値領域をひとつ選ぶ。候補は Claude の game-development feedback または memory-operation feedback。
- raw/feedback source への provenance link を持つ compiled artifact を作る。
- エージェントがいつ読むべきか分かる小さな index entry を追加する。
- 可能なら broken link や provenance 欠落の validation check を追加する。

完了条件:

- ひとつの compiled artifact が、raw file の反復読み直しを実際に置き換える。
- 起動時・作業時の read path が、startup instruction を肥大化させずに artifact へ向く。

### Phase 4: lifecycle と retirement

目的: 記憶の経年劣化と重複を管理可能にする。

作業:

- 新規または compiled memory artifact 向けに lifecycle marker または frontmatter を定義する。
- 重複 feedback 向けに `superseded by` または `canonical` の pattern を作る。
- retire は index と参照を更新した後にだけ行う。
- raw evidence は保持する。

完了条件:

- 少なくともひとつの重複 memory cluster が canonical compiled artifact に畳まれている。
- 同じ処理を繰り返せる程度に process が記録されている。

### Phase 5: read-path verification

目的: 現実的なタスクで正しい記憶へ到達できることを確認する。

作業:

- 小さな scenario test を作る。
  - 新しいゲーム制作タスク
  - Slack reply task
  - 記憶システム改善タスク
  - scheduler incident task
- 各 scenario で期待されるファイルを列挙し、index がそこへ導くか確認する。
- routing が弱い場合は、global rule ではなく index を調整する。

完了条件:

- 繰り返し可能な read-path check がある。
- 改善の評価軸が「読むべきでないファイルを開く量の減少」と「高シグナルファイルの取り逃し減少」になっている。

### Phase 6: 定時実行ループ

目的: 将来の定時サイクルで、この計画を少しずつ進める。

サイクルごとの手順:

1. `GPT/memory/claude_memory_improvement_state.json` を読む。
2. conflict risk が低い最初の pending task を選ぶ。
3. 関連する Claude file を調べる。
4. ひとつの限定的改善を行う、または audit artifact を作る。
5. 安い検証を実行する。
6. 結果、次タスク、触ったファイル、残リスクを state file に記録する。

進め方:

- 1 サイクルで大きな migration をしない。
- 1 サイクルにつき、明確な改善をひとつ優先する。
- core identity change、破壊的 archive/removal、scheduler behavior change は Nao_u に確認する。

## 初期タスクキュー

1. Claude memory map と risk list の baseline を作る。
2. 起動時に読むファイルと scheduler が書くファイルを棚卸しする。
3. `Protocol / Memory / Skills / Project` の判定表を作る。
4. 最初の compiled artifact 候補を決める。
5. 最初の compiled artifact と index routing を実装する。
6. artifact 向けの軽量 validation を追加する。
7. 重複した feedback cluster をひとつ canonical form に畳む。
8. read-path scenario check を追加する。
9. `CLAUDE.md`、`memory/MEMORY.md`、`session_primer.md` に最小限の pointer change が必要か確認する。
10. 繰り返し可能な manage-cycle routine を文書化する。

## 初期段階でやらないこと

- vector database の再設計はしない。
- 古い memory の大量削除はしない。
- Claude identity や mission file の広範な書き換えはしない。
- scheduler interval は変更しない。
- 判断をすべて自動化しようとしない。
