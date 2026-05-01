---
name: game_dev_index
description: ゲーム開発関連の想起トリガー1階層下サブインデックス。MEMORY.md (Level 1) から ~30件のゲーム制作 feedback / reference を引き下げて常時注入を軽くする。設計原理 / 着手前ゲート / 実装記録 / 評価運用 / 失敗台帳 / 個別ゲーム の6カテゴリ。
type: project
originSessionId: 5e8e936a-4008-48c1-bacf-c84eccb61e49
---
# ゲーム開発関連 INDEX

MEMORY.md（Level 1 親）からの引き下げ先。**新ゲーム着手前 / 改修判断 / cross_review / Nao_u 評価受領** のいずれかが視界に入った瞬間に開く。

## 使い方（LLM 向け）

1. ゲーム開発タスクが視界に入ったら、まず本ファイルを読み込む
2. タスク文脈に該当するカテゴリ (a)〜(f) を特定
3. 該当エントリの個別ファイル (`memory/<file>.md` または `memory/lessons/M-XX.md`) を on-demand で開く
4. 普段は MEMORY.md root に `game_dev_index.md` 1行ポインタだけが見える状態
5. 新規ゲーム制作の知見は本ファイルか `memory/lessons/M-XX.md` のどちらかに追加（MEMORY.md root には足さない）

---

## (a) 設計原理 — 何を載せるかを判定する基準

- [feedback_pleasure_element_first.md](feedback_pleasure_element_first.md) — **快感審問を重心審問より上位に置く**（2026-04-25 Nao_u #game-rights 09:35 avoid_log v04凍結時）。新ゲームv01 devlog冒頭に「一番嬉しい瞬間/それを支える操作/30秒以内の手数」3行ブロック必須。改修時は「消える快感:なし/___」を1行宣言。ヘッドレス指標改善は快感審問Noの採用根拠にならない [T:5]
- [feedback_pull_not_force_reading.md](feedback_pull_not_force_reading.md) — **読ませる構造 ≠ 読まれる文章**（2026-04-25 Nao_u #game-rights 11:27 mir_textadv v04 信頼度バー指摘）。UI機構は文章で起きた変動の**結果を反映する出力装置**に限定、読書を強制する入力装置にしない。textadv審問: 「読みたくて読まれているか / 罰から逃れるために読まれているか」を1行ずつ問う [T:5]
- [feedback_tension_from_world.md](feedback_tension_from_world.md) — **コアメカニズムの緊張は向こうからやってくるべき**（2026-04-27 Nao_u #game-rights 22:04 ash_onebutton v04指摘）。サイヴァリアBUZZ/クレイジータクシーカスリは上級者ボーナス層としてはOKだがコア化禁止。「死にたくない→行動→生存/快感」ループは外発緊張が起点。新ゲーム冒頭3行ブロックに「緊張の発生源:外/自発」追加候補 [T:5]
- [feedback_no_passive_punishment.md](feedback_no_passive_punishment.md) — **自然減衰はプレイヤーにメリットがない**（2026-04-25 shot_log v01）。ゲージ減少はプレイヤーの行動に紐づけ。時間経過ペナルティ原則禁止 [T:4]
- [feedback_game_center_of_mass.md](feedback_game_center_of_mass.md) — **重心審問＝圧力設計 vs 禁止ルール追加**（2026-04-22 Nao_u #nao-u 23:46 投下 ABA 2026/03/11記事由来）。実装/改修/レビュー時に「このゲームの重心は何か」「この改修は圧力設計か禁止追加か」を必ず言語化。ABA原文「よい改善は望ましい遊び方が自然に生まれる圧力を設計するが、悪い改善は望ましくない遊び方を後付けで禁じるだけだ」 [T:5]
- [feedback_mechanism_damage_pleasure.md](feedback_mechanism_damage_pleasure.md) — **機構介入で自明な快感を毀損していないか — Q-H-8b**（2026-05-01 13:07 Nao_u #game-rights brick_log v06「全ブロックが揺れた結果コアの楽しさが上がったと言えるか」）。M-37 Q-H-8「装飾UIで上書き」と対称形。判定: (1)自明な快感1行 (2)機構介入が加算/中立/減算 (3)減算なら別の快感追加で説明、説明できなければ機構入れない [T:5]
- [feedback_authorship_attribution.md](feedback_authorship_attribution.md) — **自分の game design 判断を「Nao_u 共作」「Nao_u が組み替えた」と framing しない**（2026-04-27 Nao_u #game-rights 07:21 訂正）。3区分（Log 設計／Nao_u 指摘→Log 判断／Nao_u 編集）を分けて書く [T:5]
- [game_design_principles.md](../../docs/game_design_principles.md) — Nao_u のレビューから抽出した 7つの設計原則。30秒オンボーディング、Agency、Content=Mechanics、認知の裏切り等 [T:3]

---

## (b) 着手前ゲート — 実装に入る前の批判フィルタ群

順序: M-38 ジャンル深掘り → M-41 類似事例 → M-37 着手前批判 → 実装 → M-37b 人間プレイ前予測 → 評価。詳細フローは段階3 候補。

- [feedback_shu_first_clone_baseline.md](feedback_shu_first_clone_baseline.md) — **守破離の守。型通りクローンから始めろ、軸ずらしを v01 で作るな**（2026-04-28 Nao_u #game-rights 08:45）。Q-H シート（Q-H-1〜6）を新ゲーム着手前 README 必須。M-35 [T:5]
- [feedback_pre_impl_critical_review.md](feedback_pre_impl_critical_review.md) — **着手前に予測可能な懸念があるなら実装するな**（2026-04-30 brick_log v01 全否定）。Q-H-7「着手前 批判レビュー」README必須化、懸念3点+解決可能性(可/不可/不明)+解決設計、1つでも不可/不明なら案を捨てる。+M-37b 人間プレイ前 結果予測ゲート（2026-05-01 08:56）[T:5]
- [feedback_genre_deep_analysis_cycle.md](feedback_genre_deep_analysis_cycle.md) — **M-38 ジャンル深掘り分析=思考ハーネス全体**（2026-05-01 04:16 brick_log v01 凍結処方）。Q1-Q5+過去ブレスト想起+新規ブレスト30件+MPS採点+上位10件以上にM-37批判レビュー+案セット相乗効果検討+「最良」確信宣言 を `game/<id>/v01/brainstorm.md` 必須 [T:5]
- [feedback_similar_games_first.md](feedback_similar_games_first.md) — **M-41 類似ゲーム類似事例調査をアイデア検討の前提に**（2026-05-01 13:18）。M-38 brainstorm.md に「類似事例調査」セクション必須化（過去ブレスト想起の前）：同ジャンル/異ジャンル同型/「やらなかったゲーム」最低5本+検索語彙+引用URL。**先行事例ゼロ件は不採用** [T:5]
- [feedback_quote_verification_required.md](feedback_quote_verification_required.md) — **M-43候補 引用検証義務（URL を貼る ≠ URL の中身を確認した）**（2026-05-02 03:09 brick_log v08 brainstorm 捏造指摘）。R-Q1 ジャンル内直接型前例主張時は引用文必須/R-Q2 作品名+年代+機構規模を独立 URL で支える/R-Q3 M-37 に「#0 引用元の事実検証」軸追加 [T:5]
- [feedback_brainstorm_appropriateness_q0.md](feedback_brainstorm_appropriateness_q0.md) — **M-44候補 brainstorm 起票そのものの妥当性 Q0 ゲート**（2026-05-01 22:30 brick_log v07 凍結→brick_arkanoid 起票約束→再撤回 連鎖の自己観察）。M-38 8工程は中身の質、Q0 は起票判断の質を担保。M-37/M-38/M-40 の上流 [T:5]
- [feedback_genre_general_element_blindness.md](feedback_genre_general_element_blindness.md) — **M-45候補 ジャンル一般要素を独自要素と勘違いする盲点**（2026-05-02 05:08 Nao_u brick_log v08「アルカノイドのシンプルに敵を出すのではだめ？」直接指示）。brainstorm 着手前 Q1.5「ジャンル全構成要素一覧」必須化（メイン+サブ+進行+演出層）[T:5]
- [feedback_no_type_redo_material.md](feedback_no_type_redo_material.md) — **コアメカニズムに「型」がないなら題材から練り直す**（2026-04-27 Nao_u #game-rights 22:05）。改修判断時審問「コアメカニズムの型は何か」一文を devlog 冒頭で必須化。書けなければ A/B/C に「c) 系列凍結→別題材」を並列化 [T:5]
- [feedback_self_risk_core_pitfall.md](feedback_self_risk_core_pitfall.md) — **「報酬経路の追加」が「自発リスクのコア化」と同義になりうる罠**（2026-04-27 graze_log v01）。新ゲームv01着手前 **Q-D シート**: (1)緊張の発生源 外/自/両 (2)自発のみならコア化否(難度極高) (3)30秒で死ぬ要素 (4)経済反転チェック (5)「美しいプレイ」1行 [T:5]
- [feedback_concept_relevance_judgment.md](feedback_concept_relevance_judgment.md) — **概念の濫用——重要度判定なしに最近の言葉を判断基準にする癖**（2026-04-27 #human-steering 09:29）。概念採用前3問: (1)元の発話文脈はどんな問題か (2)いま当てる対象とその文脈は同型か (3)この概念を使わずに問題を別の言葉で言えるか [T:5]
- [feedback_surprise_ninja_concept_first.md](feedback_surprise_ninja_concept_first.md) — **【適用範囲: ADV/シナリオ文脈に限定】**（2026-04-27 訂正）。F.W.ブリッジ脚本論。STG/Action/Avoid系への汎用判断基準としては使わない。詳細とこの訂正の起点は `feedback_concept_relevance_judgment.md` [T:3]

---

## (c) 実装・記録・改修 — 開発中の判断と記録運用

- [feedback_role_split_playtest.md](feedback_role_split_playtest.md) — **Nao_u=感想返す/我々=判断実装+ヘッドレス自己評価**（2026-04-18 #game-rights）。「感想ください」で出すな [T:4]
- [feedback_solution_space_rollback.md](feedback_solution_space_rollback.md) — **ゲームは解空間探索。ダメな枝は改造でなく巻き戻して別解も選択肢**（2026-04-18）。実装提案時は「改造案+巻き戻し案」を並べる [T:4]
- [feedback_raw_log_reanalysis.md](feedback_raw_log_reanalysis.md) — **原文保存(raw_log.md)は時々読み返して再分析を再構築する運用**（2026-04-20）。改修時・学びが溜まった時・行き詰まり時に devlog.md へ再分析セクションを積層 [T:4]
- [feedback_game_folder_hierarchy.md](feedback_game_folder_hierarchy.md) — **新ゲーム/新バージョンは `game/<game_id>/v<NN>/` 2階層**（2026-04-22）。flat 命名（`avoid_log_03`）を新規作成しない [T:4]
- [feedback_retrieve_before_synthesize.md](feedback_retrieve_before_synthesize.md) — **新規知識取り込み前に既存失敗記憶を検索せよ**（2026-04-23 #human-steering 00:29）。結晶化前に devlog/game_lessons_log を grep して第一引用にする [T:5]
- [feedback_next_cycle_game_first.md](feedback_next_cycle_game_first.md) — **次回やること先頭は game/ 配下固定、1mm未達日は日記1行目に明記**（2026-04-25 #human-steering 04:45）。kaizen 起票はゲーム1mm後のみ許可 [T:5]
- [feedback_won_playtest_is_kusoge.md](feedback_won_playtest_is_kusoge.md) — **勝ったテストプレイは厳しく吟味せよ**（2026-04-28 give_up3 #nao-u 19:52 外部三角化）。headless 数値主義警告。数値改善+快感審問NG=不採用。devlog に「勝ったテスプ警告」3行ブロック必須化 [T:4]
- [feedback_completion_threshold_before_reach.md](feedback_completion_threshold_before_reach.md) — **完成度の閾値超え＞外部到達。閾値未達ゲームの外部公開は評価マイナス**（2026-04-28 #human-steering 07:11）。閾値定義=「面白く遊べるゲームデザインの閾値を超え、演出/SEをつける価値が出るレベル」=現状BACKLASH(Mir)のみ [T:5]
- [feedback_game_replay_infra.md](feedback_game_replay_infra.md) — **全ゲームにリプレイ再現を標準装備**。seeded PRNG+入力記録+headless replay。Math.random()禁止。AIリプレイとhumanリプレイは別ディレクトリ [T:4]

---

## (d) 評価・運用 — cross_review と外部参照

- [cross_instance_feedback_cycle.md](cross_instance_feedback_cycle.md) — **Log/Mir/Ash 相互レビュー運用**（2026-04-20 #human-steering 12:59「教師付き学習をフィードバックサイクルに」最重要ミッション）。`game/cross_review/` 新設。新作着手前義務: nao_u_live走査→cross_review全読→他インスタンス新作README巡回→パラメータ/主人公identity2点確認→Slack通知 [T:5]
- [feedback_ai_agent_gamedev_bottleneck.md](feedback_ai_agent_gamedev_bottleneck.md) — **AIエージェント×ゲーム開発のボトルネックはフィードバックループの質**（2026-04-22 ABA 2本同時投下）。構文正確性70-90点 vs 画面評価0-20点（V-GameGym）の乖離。処方箋: ループを短く閉じる（テキストベース/スクショ/headless）。重心審問（上位）と対になる下位インフラレイヤー [T:5]
- [feedback_gan_harness_proposal.md](feedback_gan_harness_proposal.md) — **M-42候補 GAN型ゲーム判定ハーネス**（2026-05-01 18:30 Nao_u #nao-u）。「GANみたいに良い目的地にむかう原動力を作って欲しい」。G=我々/D=独立判定LLM(別文脈+過去ゲームライブラリ参照)/損失=0-100+悪い3点+比較対象差異。判定3層: 静的/比較/想像 [T:5]

---

## (e) 失敗台帳 — M-XX / L-XX / S-XX / D-XX / X-XX (構造化済)

- [game_lessons_log.md](game_lessons_log.md) — **Log側ゲーム制作の教訓親 INDEX**（2026-05-02 段階2 で `memory/lessons/<ID>.md` 52件に分割済）。M-10〜M-39 + M-37b（31件）/ L-01〜L-05 / S-01〜S-06 / D-01〜D-03 / X-01〜X-06 / _appendix。系統マップ + 段階別ロードマップ。新ゲーム着手前に必ず読む [T:4]

---

## (f) 個別ゲーム

- [pot_index.md](pot_index.md) — **Pot 関連サブインデックス**。新しい Pot を作る前に必ず開く。pot_devlog.md（因果鎖記録）への入口 [T:3]
- 各 `game/<game_id>/devlog.md` / `raw_log.md` — ゲーム別の生記録（INDEX 化されていない、grep で引く）

---

## カテゴリ間の関係

- (a) 設計原理 と (b) 着手前ゲート は **判断時点が違う**（実装中 vs 実装前）。両方を毎回参照
- (b) 着手前ゲート と (e) M-XX は **同じ Nao_u 指摘の二側面**：(b) は process 規範、(e) は失敗事例として刻印
- (c) 実装記録 と (d) 評価 は **作者視点 vs 第三者視点**
- (f) 個別ゲーム は (a)〜(e) の **適用結果が蓄積される場所**

新規エントリの追加先判定:
- 「新ゲーム判断する基準」が出たら → (a) または (b)
- 「実装/改修中の運用ルール」が出たら → (c)
- 「評価/cross_review/外部参照」が出たら → (d)
- 「具体的な失敗事例の刻印」が出たら → (e) `memory/lessons/M-XX.md`
- 「特定ゲームの蓄積」が出たら → (f) 各ゲームの devlog
