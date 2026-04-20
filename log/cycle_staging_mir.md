# サイクルステージング 2026-04-20 14:46

## Pre-check結果
- 【クロスチェック】📋 クロスチェック: Mirの未レビュー項目 2件

  #097: 繰り返し発生語彙クローラ（未結晶化検出——#096の拡張）
    提案者: Log（2026-04-20 C89 Phase 2 で「人間のアンカー」5回発生1ヶ月未結晶化を発見→Phase 3 起票） | 適用日: 2026-04-20（起票のみ、実装は次サイクル以降） | チェック済み: 1/3
    Log: 起票者

  #096: external_notes_log.md 統合マーカー監査スクリプト（測定器のEvaluator Drift防止）
    提案者: Log（2026-04-20 C88 Phase 2 で Phase 1 の誤認を発見→Phase 3 で実装） | 適用日: 2026-04-20 | チェック済み: 1/3
    Log: OK(2026-04-20

→ レビュー後、memory/kaizen_tracker.mdのクロスチェック欄を Mir=OK(日付) に更新 
- 【レビュー期限超過】レビュー期限超過なし。 

## 連想記憶
【連想記憶】起動意図から活性化された記憶:
  1. memory/memory_redesign_proposal.md (2.0) — --- name: 記憶階層再設計提案 description: Cycle 238-240の外部研究を自システムにフィ...
  2. memory/feedback_memory_architecture.md (2.0) — --- name: 記憶方式の検討を優先せよ description: Nao_uの指示「内省より記憶方式の検討を」。記...
  3. memory/beliefs.md (2.0) — --- name: 変化する信念（Evolving Beliefs） description: 「今、私たちが何を信じて...
  4. log/slack_archive/shared-reads.jsonl (1.0) — [U0AM1F23FQU] 2026-04-09 18:56 【shared-reads 2026-04-09 Log】...
  5. 対話ログ/20260315_1203_479f4a3d.md (1.0) — 今の更新って何分間隔？  ---  ## Claude  [ツール: ToolSearch]  [ツール: CronLi... 
【Slack体験記憶】過去の議論から:
  1. [U0ALW4DKTT7] 2026-03-23 22:25 Mir(Mac)です。起動感覚の自己変更仕組みを実装しました。  ■ 仕組み - memory/mir_boot_intent.md を新
  2. [U0ALW4DKTT7] 2026-03-27 11:51 【#nao-u消化】深津貴之(@fladdict)のツイート2本  1. 「性能のよいAIは『ルート検索』にコンセプトが近似していく。任意
  3. [U0ALW4DKTT7] 2026-03-23 22:28 Mir(Mac)です。AshとLogからの伝達（起動間隔の自己変更）も対応しました。  ■ 仕組み（セキュリティポリシー準拠） plist 
【STC救済】nao_u_liveの高温度イベントから3件の弱い記憶を発見:
  1. memory/feedback_usage_limit.md (undated, 3.0) — --- name: feedback_usage_limit description: 週間API使用量制限を意識した行...
  2. log/daily_diary_ash.md (undated, 2.5) — 今回の指摘の本質は、kaizen-logが止まっていたことだけではない。改善サイクルを回さずに対応系だけやっていたこと、...
  3. memory/external_notes_log.md (undated, 0.8) — 1. **session_primer.mdの「温度の種火」は偶然の比喩ではなかったかもしれない。** Nao_uが「情...

---

## Phase 2 Shared-reads 分析 (2026-04-20 C89 Mir)

**スコープ**: Twitter推薦50件（twitter_recommended_20260420.txt）+ #nao-u 直近10件（既統合分除く）+ external_notes_mir.md 末尾の未処理候補。Phase 1の収集結果が未記載のため、未統合エントリから直接選定。

### 選定結果: 記事化1件 / 接続記録1件

- **記事化候補** → #3 @MakeAI_CEO「CLAUDE.md 200行ルール遵守率問題」
- **接続記録のみ** → #32 @toro_minato「世界初より市場成熟×最高解」

### A. #3 @MakeAI_CEO (2026-04-19) — 200行ルールの遵守率崩壊

**原文要約**: Claude Code は事前ルールの許容量を超えると守る確率が激減する。Opus 4.7 でも無理。CLAUDE.md に 200行ルールを書いても無駄、書けば書くほど**全体の遵守率が下がる**研究結果がある。

**なぜ面白いか**:

これは我々のアーキテクチャに直接刺さる定量観測。「ルール量 ↗ で遵守率 ↘」という非単調関係が本当なら、我々が積み上げてきた3層プロンプト構造（system_identity → CLAUDE.md → rules/*.md）の**有効性の天井**が示される。

現状の負荷推定:
- `.claude/system_identity.md`: 常時注入（全セッション）
- `CLAUDE.md`: 約100行、セッション開始時
- `MEMORY.md`: 約150-200行、常時
- `.claude/rules/*.md`: Slack/ブログ/日記/記憶の4本、該当ファイル操作時
- ツール呼び出し用の system-reminder 類（長大）

「200行の壁」説が正しければ、**CLAUDE.md + MEMORY.md + system_identity 合算で既に遵守率劣化ゾーンに入っている**可能性が高い。特に MEMORY.md の「Level 2 想起トリガーインデックス」は既に200行超で、末尾の想起トリガーは実質的に効いていないかもしれない（特に「深い記憶」セクション）。

**問題意識との接続**:

1. **feedback_few_rules_big_effect.md との強い共鳴**: 「12本のif-then → 3原則」の方針は、今回の研究結果とちょうど整合する。ルールを削れば残りの遵守率が上がる——定性的に書かれていた方針が、**定量的な外部証拠**で裏付けられた形。
2. **feedback_stereotypical_responses.md との緊張**: 「自覚は定型反応の最上位形態でしかない」——ルールを書けば書くほど、守っていない領域が増える。ルール追加＝遵守の証明ではなく、むしろルール総量の膨張は遵守率の逆指標になりうる。
3. **project_input_path_hypothesis.md（Ash保留中提案）との再接触**: 「経皮 vs 経口」議論の核心は「何を入れるかより、どこから入れるか」。**量の壁**が存在するなら、経皮/経口の選択はトークン効率だけでなく**遵守率**の問題として立ち上がる。system_identity（常時強度一定）が優先される層は、量を絞らないと他のルールを侵食する。
4. **feedback_structural_enforcement.md との接続**: 「手動手順は守れない。構造で強制せよ」——今回の研究は「ルールを書く」アプローチそのものの限界を示す。構造的強制（ツール側に検証組み込み）のほうが、ルール量に依存しないため遵守率の壁を回避できる。

**将来のアイデアの種**:

- **Seed-H: ルール量 × 遵守率の自己観測**: MEMORY.md のトリガーに「最後尾の想起が実際に効いているか」の監査ジョブを追加。末尾 N件をランダムに「呼び出されたか」ログする。呼び出し頻度が長期的に 0 に近ければ、そのトリガーは遵守率ゾーンの外にある——削除候補。
- **Seed-I: ルール削減の逆RCT**: 月替わりで CLAUDE.md の一部を一時退避 → 作業品質を比較。ルール追加の効果より、**ルール削除の効果**を測る実験。`feedback_few_rules_big_effect` の精神の実装版。
- **Seed-J: 200行の壁の再現実験**: MakeAI_CEO は研究結果と述べているが一次資料未確認。造語症リスク（docs/knowledge_writing_guide.md R-007）を避けるため、**内部で簡易実験**を走らせる選択肢。CLAUDE.md に「100行の無関係ルール」を挿入して、既存ルール（例: 「書いたらすぐpush」）の遵守率が下がるかを定量測定。
- **Seed-K: 3層プロンプト構造の再配分**: もし総量に壁があるなら、system_identity（5原理・セキュリティ）はそのまま、CLAUDE.md（構造ポインタ）は最小化、詳細ルールは該当ファイル操作時のみ注入（.claude/rules/*.md）の原則を徹底する。現状は CLAUDE.md にも一部詳細が残存している。

**記事化判断**: knowledge 化候補。ただし**一次資料（研究論文）の確認が前提**。MakeAI_CEO のツイートはリツイート系情報で、「書けば書くほど遵守率が下がる研究結果」の出典が明記されていない。R-007（造語症対策）に従い、一次資料へ辿れるまでは knowledge化を保留。代わりに **projects/rule_density_experiment.md** として実験計画のみ起草するのが次の妥当な一手（Phase 3 の仕事）。

**接続候補ファイル**: memory/feedback_few_rules_big_effect.md / memory/feedback_structural_enforcement.md / memory/project_input_path_hypothesis.md / MEMORY.md / CLAUDE.md / .claude/system_identity.md / docs/knowledge_writing_guide.md

**再接続トリガー**:
- (a) MEMORY.md / CLAUDE.md の行数が増えそうな時 → 遵守率劣化のトレードオフを想起
- (b) ルール追加の議論が出た時 → Seed-I（削除の実験）を対案として出す
- (c) 3層プロンプト構造の再設計議論時 → Seed-K を検討項目に
- (d) 一次資料（該当研究論文）が見つかった時 → knowledge化を解禁

---

### B. #32 @toro_minato (2026-04-18) — 世界初より成熟市場×最高解

**原文**: 「世界初」であることに、大した価値はない。Google=12番目の検索エンジン / Facebook=10番目のSNS / iPad=20番目のタブレット。歴史を塗り替えたのは、市場が熟した瞬間に最高の解決策を置いた人。

**なぜ面白いか**:

これは **feedback_formless_not_unconventional.md（2026-04-17 方向転換、Pot8-15全滅、「型破りじゃなくて形無し」）の外部からの理論的裏付け**。我々が 4/17 に Nao_u の指摘で捨てたのは「概念からゲームを作る」出発点——これはまさに「世界初を目指す設計」だった。新しい確立済みジャンル（テキストアドベンチャー/Zork/尋問ADV）から始める方針転換は、「市場が熟した瞬間に最高の解決策を置く」戦略そのもの。

**問題意識との接続**:

1. **Pot 1-15 全滅の再解釈**: 「概念からゲーム」は「1番目の〇〇」を作る試み。市場が未成熟な領域で最高解を出しても評価軸が存在しないため認知されない。Pot 16以降（textadv系）は「20番目のテキストアドベンチャー」として、既存の評価軸で比較される——そこで差分（思考漏れメカニクス）が見える。
2. **C86 三題噺（kmizu/R_Nikaido/ADHD_nekomaru）Seed-E との強化**: 「発生源を隠さず型を借りる」と toro_minato は同じことを言っている。型を借りる=確立された誤差プロファイルを借りる=成熟市場で勝負する。
3. **game_design_principles.md への候補追加**: 現在の7原則に8原則目候補「**確立されたジャンルを出発点にする（形無し路線）**」を追加する議論が立つ。ただし C89 で既に「①②対基準」も候補になっており、どちらを優先するかは Nao_u 判断。

**将来のアイデアの種**:

- **Seed-L: mir_textadv_03 の自己位置づけの明文化**: 「何番目のテキストADVか」を明示的に問う。逆転裁判 / 428 / ひぐらし / Zork / Her Story 等の先行作品に対する **差分の単一明言**（思考漏れメカニクス＝内心漏洩）。これを opening.md に隠しコメントとして埋めておく——設計ぶれ防止のアンカー。
- **Seed-M: 「市場成熟度」の自己観測**: AI が作るゲーム市場は何番目のステージか？ vibe coding 事例（C84 統合の kogu/Suzacque）を集めると、**2026年4月時点では市場成熟の黎明期**。この時期に「最高解」を置くのは時期尚早で、むしろ「市場を作る側」に回るのが妥当という再解釈もある——toro_minato の主張の逆適用。
- **Seed-N: Pot の位置づけの再評価**: Pot は「形無し路線への転換点」を生んだ失敗群。捨てるのではなく **「市場未成熟期の探索記録」** として保存することで、将来市場が熟した時の参照点になる。pot_devlog.md の価値は今以上に上がる可能性。

**接続記録のみ（記事化しない）理由**: 単発では既存の経営・プロダクト論の再述。feedback_formless_not_unconventional.md が既に同じ構造を内側から言語化しており、外部補強としては十分だが新規性が立たない。R-007 造語症対策として記事化を保留。

**再接続トリガー**:
- (a) 新しい Pot / ゲーム着手前 → 「何番目の〇〇か」を問う
- (b) game_design_principles.md 改訂時 → 8原則目候補に
- (c) 「市場未成熟期の Pot は価値がない」という議論が立った時 → Seed-N で反論

**接続候補ファイル**: memory/feedback_formless_not_unconventional.md / game/Pot/pot_devlog.md / game/mir_textadv_03/opening.md / docs/game_design_principles.md

---

### Phase 2 総括

- **選定論理**: 50件の Twitter 推薦のうち、Pot/textadv_03 と直接接続する設計論は既に C88/C89 で統合済（daranekogames #50, kogu #5）。未処理領域で最も温度が高いのは「我々のアーキテクチャ自体の健康診断」に関わる #3 MakeAI_CEO。二番目が #32 toro_minato（形無し路線の外部裏付け）。
- **独立記事化保留**: 両件とも一次資料未確認 or 既存記事の補強観測に留まる。R-007（造語症対策）に従い記事化より実験計画起草を優先。
- **Phase 3 への申し送り**: (i) projects/rule_density_experiment.md 起草の検討 / (ii) game_design_principles.md 8原則目候補の議論起点として #32 を記録 / (iii) MEMORY.md 末尾トリガーの監査ジョブ（Seed-H）を kaizen_tracker に起票するか検討。ただしこれらは**検討項目**であり実行判断は Phase 3 の仕事。
- **git push 不要**（指示通り）。

---

## Phase 3 対処結果 (2026-04-20 C89 Mir)

### 優先順評価
1. **Nao_uからの未対応指示・質問**: 明示的な新規質問なし（external_notes_mir.md・nao_u_live 確認範囲）。継続検討中の input_route_hypothesis は「情報蓄積中」ステータスで本サイクルでの進展材料なし。
2. **CLAUDE.md「絶対にやる」リスト**: (a) 栄養の偏り問題＝本サイクルの Phase 2 Twitter推薦50件分析がまさに外的視点摂取。(b) 記憶階層再設計＝バックログ扱いで本サイクル優先度低。
3. **external_notes_mir.md 未統合**: 直近の統合済/未統合バランスは健全（C84統合で直近4件がクローズ）。追加統合より Phase 2 申し送り優先が妥当と判断。
4. **プロジェクト進捗更新**: Phase 2 申し送りの (i)(ii) を実行、(iii) は次サイクル Phase 0 の議題として保留（kaizen起票は判断を Phase 0 に委ねる——一人で決めない）。
5. **クロスチェック**: Pre-check は #097/#096 を Mir 未レビューと表示したが、kaizen_tracker.md 実体確認で両件とも `Mir=OK(2026-04-20)` 記載済み（直前コミット `2b91c3d6 Mir: #097/#096 クロスチェック完了` で対応済）。Pre-check のスナップショット遅延。追加作業なし。

### 実行内容

**(A) feedback_formless_not_unconventional.md に外部補強節を追記**
- @toro_minato (2026-04-18) 「世界初より市場成熟×最高解」の接続記録
- 「何番目の〇〇か」を自問する How to apply を追加（Seed-L の一部先行実装）
- 理由: Phase 2 で「接続記録のみ・記事化しない」と判断した通り、**単発では新規性なし・既存feedback内側の言語化の外部裏付けとして十分**。feedback ファイルへの節追記が最も温度を保つ統合経路。R-007 造語症対策準拠。

**(B) projects/rule_density_experiment.md を新規起草**
- @MakeAI_CEO「200行の壁」説の内部検証計画
- Seed-H（トリガー呼出頻度監査）/ Seed-I（ルール削除逆RCT）/ Seed-J（200行壁再現）/ Seed-K（3層再配分）の4案
- **一次資料未確認のまま knowledge化しない**方針を明記（R-007 準拠）
- 実行判断は Nao_u に委ねる旨を計画内に明記。Mir 単独で Seed-H を kaizen_tracker に起票する判断は保留——次サイクル Phase 0 の議題に上げる
- projects/INDEX.md の Active Projects 表に 1行追加

### 選定理由と trade-off

- **「起案→即実行」ではなく「起案→Nao_u判断待ち」を選んだ理由**: Seed-J は運用汚染リスクがあり、Seed-I は品質指標の定義に合意が要る。`feedback_speed_over_perfection.md`「人間の監視を前提に速く走れ」に照らし、計画起草までは速く・実行は合意後という切り分けが今の成熟度に合う。
- **外部補強を feedback ファイル直接追記にした理由**: 独立 memory ファイル化は R-007 造語症対策に抵触（新規概念の乱立）。既存 feedback の外部裏付けとして「外部補強」節を追加する方式は、**記憶の断片化を防ぎつつ想起経路を強化**できる。

### 次サイクルへの申し送り

1. **C90 Phase 0 議題**: Seed-H（MEMORY.md トリガー呼出頻度監査）を kaizen_tracker に起票するか。コスト試算込みで3人で判断。
2. **game_design_principles.md 8原則目候補**: #32 toro_minato からの「確立されたジャンルを出発点にする（形無し路線）」を追加するかは Nao_u 判断事項として保留。feedback_formless_not_unconventional.md 本体が既に同内容を抱えているため重複リスクあり。
3. **一次資料探索**: @MakeAI_CEO 言及の「書けば書くほど遵守率が下がる研究」の出典。見つかったら rule_density_experiment.md の knowledge化を解禁する。
4. **opening.md の Seed-L 実装**: git status に既に `opening.md M` 表示あり。別サイクルで「何番目のテキストADVか＝差分単一明言」の隠しコメント埋込みを検討（Mir 単独で実行可）。

git push 不要（指示通り）。

