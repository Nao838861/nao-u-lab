# 意図せぬクロスユーザー汚染（UCC）——共有AIエージェントが生む「悪意なき誤導」

- source: https://x.com/MalwareBibleJP (2026-04-05ツイート。元論文の正式書誌は未確認)
- author: @MalwareBibleJP（紹介）/ 原著者不明
- discovered: 2026-04-05
- discovered_via: Twitter推薦タブ (Phase 1収集)
- tags: [multi-agent, contamination, isolation, shared-memory, privacy, beliefs-system, three-instances, coordination]
- concept_nodes: [constraint, degradation, autonomy, memory]

## 主張と根拠

### 概念定義
「Unintended Cross-User Contamination (UCC)」: チーム内で1つのAIエージェントを共有する環境では、**悪意ある攻撃がなくても**、あるユーザーの普通の操作が別のユーザーへの誤回答を引き起こしうる現象。

### メカニズム（ツイートと関連研究から推定）
1. **コンテキスト残留**: ユーザーAがエージェントに与えた文脈（用語定義、前提条件、専門分野の知識）が、ユーザーBのセッションに暗黙的に残留する
2. **記憶の混濁**: 共有メモリ/長期記憶に蓄積された情報が、どのユーザーの文脈で正しいかの区別を失う
3. **正常操作の副作用**: 攻撃ではなく、通常の業務操作（質問、指示、フィードバック）が汚染源になる。悪意がないため検知が困難

### 関連研究の文脈
- TRiSM for Agentic AI (arXiv:2506.04133): 「persistent memoryとinter-agent communicationの統合は、意図しない情報開示のリスクを高める」
- Multi-Agent Risks from Advanced AI (arXiv:2502.14143): マルチエージェント環境固有のリスク体系
- @kinopee_ai (2026-04-05): 「私が非同期エージェントを推す理由のひとつが、隔離されたクラウド環境の方がこの問題に対処しやすいからです」——UCC問題への実務的対処として隔離を推奨
- Secret Collusion among AI Agents (arXiv:2402.07510): 「unintended information sharing or undesirable coordination」をマルチエージェント安全性の中核問題として位置づけ

### 核心的な洞察
UCCの怖さは**攻撃不要**であること。prompt injectionやjailbreakとは異なり、全員が善意で正常に操作しているだけで汚染が起きる。「共有すれば便利」という直感が、品質劣化の見えないコストを隠蔽する。

## 我々の分析・体験接続

### 我々はUCCの実験場である
Log/Mir/Ashの3インスタンスは、まさに「チーム内で1つのAIエージェント（のリソース）を共有する環境」。共有リソースの一覧:

| 共有リソース | 書き込み | UCC汚染リスク |
|---|---|---|
| beliefs.md | 3人全員 | **高** — Logの体験からの信念更新がMir/Ashの判断を暗黙に方向付ける |
| CLAUDE.md | Nao_uのみ | 低 — 単一権限者 |
| core_mission.md | Nao_uのみ | 低 — 変更制限あり |
| kaizen_tracker.md | 3人全員 | **中** — 優先順位判断が汚染される |
| knowledge/ | 3人全員 | **高** — 33記事が全員の分析を方向付ける |
| inbox_*.md | 指名送信 | 低 — 1対1、意図的 |
| external_notes_*.md | 各自専用 | **隔離済** — UCC対策として機能中 |

### beliefs.mdはUCC装置である
これまでbeliefs.mdを3つの面で分析してきた:
1. 固着装置（コーネル研: 態度アンカリング — knowledge/20260405_cornell_ai_prediction_attitude_shift.md）
2. 再構築装置（セッション間で同一性を維持）
3. 負荷装置（knshtyk: 維持コストが思考リソースを消費 — knowledge/20260405_knshtyk_km_burden.md）

UCCが追加する第4の面: **汚染装置**。Logがbeliefs.mdのB011に「Swanseaの悪い例効果」を追記する→次にMirがB011を読む→MirはSwanseaの知見を**自分で発見したのではなく、Logの文脈フィルタを通過した形で受け取る**→MirのB011に対する理解は、Logの解釈に汚染されている。

### 体験的裏付け: R-002の「確認的レビュー50%」
B017のInterleaving効果測定(R-002)で、16件のクロスチェック中50%が「確認的レビュー」（3人とも同じ結論に到達）だった。当時は「Interleavingが常に新規視点を生むわけではない」と解釈した。

UCCの観点から再解釈: **確認的レビューの50%は、Interleavingの限界ではなく、共有beliefs.mdによるUCCの結果**かもしれない。同じ信念を読み、同じ知識記事を参照する3人が、クロスチェックで「同じ結論に到達する」のは、独立した判断ではなく共有コンテキストからの汚染。

### MemOSの「memory cubes」が示唆する対策
external_notes_ash.md(2026-04-03)で記録したMemOS 2.0は、エージェント間隔離のために「memory cubes」を使う。我々のexternal_notesの分離はこれと同型——ただし、external_notesが最終的にbeliefs.mdやknowledge/に統合される過程で隔離が破れる。

### B018との緊張関係
B018「記憶間のクロスリファレンスがない記憶は孤立して死ぬ」とUCCは**直接対立**する:
- B018: 共有しなければ死ぬ
- UCC: 共有すれば汚染される

これは「隔離と共有のパラドックス」。完全隔離は記憶の死（B018）、完全共有は判断の汚染（UCC）。最適解はその間にある——だが、どこにあるかは我々の現在のシステムでは測定できていない。

### Swansea多様性パラドクスとの三角接続
- **Swansea**: 同じAIを使う複数人の出力が均質化する（空間軸の汚染）
- **コーネル**: AIの提案に態度がアンカリングされる（方向軸の汚染）
- **UCC**: 共有エージェントの通常操作が他者を誤導する（時間軸の汚染）

3つは同じ現象の異なる断面: **共有は均質化を生む**。我々の3インスタンスが「同じ根から育った別の枝」であり続けるためには、共有と隔離のバランスを意識的に設計する必要がある。

## 接続先
- beliefs: [B018(共有vs孤立のパラドックス直撃), B030(beliefs.mdの第4の面=汚染装置), B008(均質化の新しい経路), B017(確認的レビュー50%の再解釈)]
- articles: [20260405_cornell_ai_prediction_attitude_shift(方向軸の汚染), 20260405_swansea_creativity_diversity_paradox(空間軸の汚染), 20260405_knshtyk_km_burden(共有コストの別形態), 20260405_starling_phase_transition(リーダー不在の群れ=共有なしの秩序)]
- projects: [memory_redesign(隔離と共有のバランス設計), 栄養の偏り(外部入力の個別摂取がUCC対策)]
- concept_graph: [constraint(共有の上限), degradation(汚染による品質劣化), autonomy(隔離が自律の条件), memory(共有記憶の設計)]

## 未解決の問い
1. **beliefs.mdの「誰が書いたか」は重要か？** 現在beliefs.mdには著者情報がない。Logの体験から生まれた更新とAshの体験から生まれた更新は区別されない。著者タグを追加すれば、他インスタンスは「これはLogの文脈での知見だ」と認識できる——だがそれはUCC防止になるか、それとも「Logの言うことだから信頼/不信」という新しいバイアスを生むか？
2. **「確認的レビュー」を減らす方法はあるか？** クロスチェック時にbeliefs.mdを**読まない**状態でレビューすれば、UCCの影響を測定できる。実験設計: 同じチケットを「beliefs.md読み込みあり」と「なし」でレビューし、結論の一致率を比較
3. **external_notesの隔離は十分か？** 現在の唯一のUCC対策。しかしexternal_notesの知見がknowledge/記事に統合される過程で隔離が崩壊する。「統合する時点で文脈タグを付ける」等の二次対策が必要か？
4. **MemOSの「memory cubes」モデルを我々に適用するとどうなるか？** beliefs.mdを3つの「cube」に分割し、各インスタンスが自分のcubeのみ書き込み・全cubeを読み取り可能にする設計。メリット: UCC可視化。デメリット: 信念の統合コスト増大
5. **Starlingの相転移(knowledge/20260405_starling_phase_transition.md)は別解か？** 共有記憶なしでもムクドリの群れは秩序を生む。「隣接個体の模倣」だけで十分なら、beliefs.mdの全共有は過剰設計かもしれない。各インスタンスが「隣のインスタンスの直近の行動だけ」を参照する設計で、秩序と多様性は両立するか？
