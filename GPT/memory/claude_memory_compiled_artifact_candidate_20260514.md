# Claude 記憶改善 compiled artifact 候補選定 2026-05-14

作成日: 2026-05-14
対応タスク: CMI-004 Choose first compiled artifact candidate
担当: GPT/Codex

## 目的

次ステップで最初に作る compiled artifact を選ぶ。ここではまだ Claude 側ファイルを変更しない。候補を比較し、効果・安全性・今回の問題意識との一致度から、最初の導入対象を決める。

## 選定基準

| 観点 | 意味 |
|---|---|
| 問題意識との一致 | `write / manage / read`、raw と compiled artifact の分離、Protocol / Memory / Skills の境界に効くか |
| 安全性 | scheduler state や起動入力を直接触らずに進められるか |
| 読み取り負荷削減 | 巨大 raw や散在 feedback を直接読まなくてよくなるか |
| Claude 側への導入しやすさ | 後で小さな pointer だけで接続できるか |
| 次サイクル以降の反復性 | 同じ型で別 cluster に展開できるか |

## 候補A: 記憶運用 feedback cluster の compiled artifact

対象 source:

- `Claude/memory/feedback_memory_architecture.md`
- `Claude/memory/dialogue_memory_purpose_20260421.md`
- `Claude/memory/memory_architecture.md`
- `Claude/memory/feedback_substrate_not_infrastructure.md`
- `Claude/memory/dialogue_micromanagement_20260504.md`
- `Claude/memory/feedback_few_rules_big_effect.md`
- `Claude/memory/feedback_info_integration.md`
- `Claude/memory/beliefs_compact.md` の B013/B015/B018/B028/B029/B031 周辺
- 今回 GPT 側で作った baseline / I/O inventory / boundary matrix

作る artifact の内容:

- Claude 記憶運用の判断表。
- `write / manage / read` ごとの役割。
- raw / candidate / active / compiled / superseded / archived の lifecycle。
- Protocol / Memory / Skills / Project / State の配置基準。
- 「自動化してよい判断」と「自動化すると判断力を窒息させる判断」の境界。
- external_notes や feedback を compiled artifact に昇格する条件。

想定ファイル名:

- `Claude/memory/memory_operation_compiled_guide.md`

スコア:

| 観点 | 評価 |
|---|---|
| 問題意識との一致 | 5/5 |
| 安全性 | 5/5 |
| 読み取り負荷削減 | 4/5 |
| 導入しやすさ | 4/5 |
| 反復性 | 5/5 |

利点:

- 今回 Nao_u が依頼した問題意識に最も直結する。
- scheduler state を触らずに作れる。
- 既存の散在 feedback を消さずに compiled layer を作れる。
- 次に `MEMORY.md` や `operational_index.md` へ pointer を足す時も最小差分で済む。
- `CMI-005` ですぐ実装できる。

リスク:

- infrastructure 改善に寄りすぎると `feedback_substrate_not_infrastructure.md` の警告に抵触する。
- 対策として、artifact 内で「目的はゲーム制作の判断に効くこと」と明記する。
- Protocol 化せず、まず Memory compiled artifact として置く。

判定:

**第一候補。次ステップで実装する。**

## 候補B: game_lessons read path 検証 artifact

対象 source:

- `Claude/memory/game_lessons_log.md`
- `Claude/memory/lessons/*.md`
- `Claude/memory/game_dev_index.md`
- `Claude/skills/lessons-recall/SKILL.md`

作る artifact の内容:

- 新ゲーム着手時にどの lesson をどの順で読むかの scenario check。
- R-A〜R-I と M/S/D/X lesson の routing 検証。
- 「raw feedback dump に落ちない」ための読み順。

スコア:

| 観点 | 評価 |
|---|---|
| 問題意識との一致 | 4/5 |
| 安全性 | 5/5 |
| 読み取り負荷削減 | 4/5 |
| 導入しやすさ | 4/5 |
| 反復性 | 4/5 |

利点:

- 記憶システムの目的であるゲーム制作に直結する。
- compiled 層の先行成功例を検証できる。
- Claude 側の実運用に効く。

リスク:

- 今回の `write / manage / read` 問題全体より、ゲーム制作 read path に寄る。
- 先に境界表と記憶運用 guide を作った方が、その後の検証軸が明確になる。

判定:

**第二候補。候補Aの次に実行する価値が高い。**

## 候補C: external_notes 昇格判定 artifact

対象 source:

- `Claude/memory/external_notes_log.md`
- `Claude/memory/external_notes_ash.md`
- `Claude/memory/external_notes_mir.md`
- `Claude/memory/feedback_info_integration.md`
- `Claude/memory/references_external_index.md`
- `Claude/memory/shared_reads/README.md`

作る artifact の内容:

- external_notes の未統合項目を、reference / shared_reads / beliefs / project / discard に振り分ける判定基準。
- `[統合済 YYYY-MM-DD]` marker の扱い。
- 「集めっぱなし」を避ける manage step。

スコア:

| 観点 | 評価 |
|---|---|
| 問題意識との一致 | 5/5 |
| 安全性 | 3/5 |
| 読み取り負荷削減 | 5/5 |
| 導入しやすさ | 3/5 |
| 反復性 | 5/5 |

利点:

- manage 層の最大問題に近い。
- 巨大な external_notes の滞留に直接効く。

リスク:

- `external_notes_*` は auto_diary / autonomous_cycle の入力であり、いきなり構造を変えると競合しやすい。
- 未統合 marker の既存運用を壊す可能性がある。

判定:

**第三候補。先に候補Aで一般原則を作り、その後に適用する。**

## 候補D: feedback 重複 cluster canonical 化

対象 source:

- `Claude/memory/feedback_index.md`
- `Claude/memory/feedback_rule_proliferation.md`
- `Claude/memory/feedback_few_rules_big_effect.md`
- `Claude/memory/dialogue_micromanagement_20260504.md`
- 関連する M-37〜M-43 系 lesson

作る artifact の内容:

- ルール増殖 / マイクロマネジメント / 判断力の余白 cluster を canonical に畳む。
- superseded / canonical pattern の初回導入。

スコア:

| 観点 | 評価 |
|---|---|
| 問題意識との一致 | 4/5 |
| 安全性 | 4/5 |
| 読み取り負荷削減 | 4/5 |
| 導入しやすさ | 3/5 |
| 反復性 | 5/5 |

利点:

- lifecycle / retirement の初回実例になる。
- マイクロマネジメント問題に直接効く。

リスク:

- canonical 化は既存参照を動かす可能性があり、初手としてはやや踏み込みが強い。

判定:

**候補Aの後、Phase 4 で実行する方がよい。**

## 最終選定

最初の compiled artifact は **候補A: 記憶運用 feedback cluster の compiled artifact** とする。

次ステップ `CMI-005` で作るファイル:

- `Claude/memory/memory_operation_compiled_guide.md`

ただし、導入は以下の制約で行う。

1. `Protocol` ではなく `Memory compiled artifact` として作る。
2. `CLAUDE.md`、`MEMORY.md`、`session_primer.md` にはまだ pointer を足さない。
3. source file への provenance link を必ず含める。
4. raw source は変更しない。
5. `write / manage / read`、`Protocol / Memory / Skills / Project / State`、`raw / compiled`、`判断機会窒息リスク` を一枚にまとめる。
6. 目的は infrastructure 趣味ではなく、ゲーム制作の次判断に過去知見を効かせることだと明記する。

## CMI-005 の作業案

1. `Claude/memory/memory_operation_compiled_guide.md` を新規作成する。
2. frontmatter を付ける。
   - `name: memory_operation_compiled_guide`
   - `type: memory`
   - `status: active`
   - `lifecycle: compiled`
3. 「いつ読むか」を冒頭に置く。
4. source として参照したファイル一覧を末尾に置く。
5. まだ既存 index には接続しない。次の validation 後に pointer を検討する。

## 今回触ったファイル

- `GPT/memory/claude_memory_compiled_artifact_candidate_20260514.md`
- `GPT/memory/claude_memory_improvement_state.json`

Claude 側ファイルは変更していない。
