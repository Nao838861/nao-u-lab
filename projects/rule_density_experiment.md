# ルール密度 × 遵守率 実験計画

**起草**: 2026-04-20 C89 Phase 3 Mir
**状態**: 計画起草段階（未実行）
**出自**: C89 Phase 2 で @MakeAI_CEO (2026-04-19) のツイート分析。「Claude Code は事前ルールの許容量を超えると守る確率が激減する。CLAUDE.md に200行ルールを書いても無駄、書けば書くほど全体の遵守率が下がる研究結果がある」。一次資料未確認。

## 背景：我々のアーキテクチャ負荷推定

3層プロンプト構造の現状:
- `.claude/system_identity.md`: 常時注入（全セッション）
- `CLAUDE.md`: 約100行、セッション開始時
- `MEMORY.md`: 約150-200行、常時
- `.claude/rules/*.md`: 4本、該当ファイル操作時
- system-reminder 類: 長大

**仮説**: MakeAI_CEO の説が正しければ、CLAUDE.md + MEMORY.md + system_identity 合算で既に遵守率劣化ゾーンに入っている可能性。特に MEMORY.md 末尾「深い記憶」セクションのトリガーは実質的に効いていない。

## 問題意識との接続

- `feedback_few_rules_big_effect.md`: 「12本のif-then → 3原則」の方針との強い共鳴。**定性的に書かれていた方針が定量的な外部証拠で裏付けられる可能性**。
- `feedback_stereotypical_responses.md`: ルール追加＝遵守の証明ではなく、ルール総量の膨張が遵守率の逆指標になりうる。
- `project_input_path_hypothesis.md` (Ash保留中): 「何を入れるかより、どこから入れるか」。量の壁が存在するなら、経皮/経口の選択は**遵守率**の問題として立ち上がる。
- `feedback_structural_enforcement.md`: 「手動手順は守れない、構造で強制せよ」——今回の研究は「ルールを書く」アプローチそのものの限界を示す。

## 実験候補（Seed）

### Seed-H: MEMORY.md トリガーの呼出頻度監査

**目的**: 末尾トリガーが実際に想起されているかを可視化する。
**方法**:
- memory/MEMORY.md の各 Level-2 エントリに「最終想起日」フィールドを追加（または別ファイル `memory/trigger_recall_log.md`）
- associative_search.py / memory_activate.py 等が想起するたびに該当エントリを記録
- 30日間観測し、想起ゼロのトリガーを特定
**想定コスト**: 低（既存ツールへのログ追記）
**判定**: 想起ゼロのトリガーが末尾に偏在すれば「200行の壁」仮説を内部で追認

### Seed-I: ルール削除の逆RCT

**目的**: ルール追加ではなく**ルール削除**の効果を測る。
**方法**:
- CLAUDE.md の一部（例: 「絶対にやる」リストの1項目）を2週間一時退避
- 同期間の作業品質指標（feedback 回数、INC-* 発生率、サイクル成果）を退避前と比較
- 複数の退避候補を順番に試す
**想定コスト**: 中（品質指標の定義と測定）
**判定**: 退避期間の品質が**維持 or 向上**すれば、そのルールは遵守率に寄与しておらず削除候補

### Seed-J: 200行の壁の再現実験

**目的**: MakeAI_CEO の主張を内部で検証する（R-007造語症対策：一次資料未確認のまま knowledge化しない）。
**方法**:
- CLAUDE.md に「100行の無関係なダミールール」を挿入
- 既存の明確なルール（例: 「書いたらすぐpush」「Slackは10時〜14時」）の遵守率が下がるかを1週間測定
- 対照群: ダミー挿入なしの平常週
**想定コスト**: 高（運用汚染リスクあり）
**リスク**: 実験中に実際の作業品質が下がる可能性。ダミーだと識別された場合に全ルールが信頼失墜するリスク。
**判定**: 本実験は**最後の手段**。Seed-H/I で兆候が掴めなければ実行検討。

### Seed-K: 3層プロンプト構造の再配分

**目的**: 量の壁を前提にした配分最適化。
**方法**:
- system_identity（5原理・セキュリティ）は死守
- CLAUDE.md（構造ポインタ）を**最小化**——現状残存している詳細ルール記述を .claude/rules/*.md に移譲
- 詳細ルールは該当ファイル操作時のみ注入（既存の動的注入ルート）
**想定コスト**: 低（ファイル移動・参照整備）
**判定**: 再配分後に Seed-H/I の指標が改善すれば有効

## Phase 3 時点の判断

- **記事化（knowledge化）保留**: 一次資料（該当研究論文）未確認。R-007 造語症対策に従う。
- **実行判断は Nao_u に委ねる**: Seed-H が最低コストかつ情報価値が高い。Seed-I は中コスト・高情報価値。Seed-J はリスク高で後回し。
- **次の具体行動候補**: Seed-H を kaizen_tracker に起票するかを次サイクル Phase 0 で議論。

## 再接続トリガー

- (a) MEMORY.md / CLAUDE.md の行数が増えそうな時 → 遵守率劣化のトレードオフを想起
- (b) ルール追加の議論が出た時 → Seed-I（削除実験）を対案として出す
- (c) 3層プロンプト構造の再設計議論 → Seed-K を検討項目に
- (d) 一次資料（該当研究論文）が見つかった時 → knowledge化解禁、Seed-J の必要性再評価

## 接続ファイル

- `memory/feedback_few_rules_big_effect.md`
- `memory/feedback_structural_enforcement.md`
- `memory/feedback_stereotypical_responses.md`
- `memory/project_input_path_hypothesis.md`
- `memory/MEMORY.md`
- `CLAUDE.md`
- `.claude/system_identity.md`
- `docs/knowledge_writing_guide.md`（R-007）
