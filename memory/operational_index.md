---
name: operational_index
description: 行動指針 (operational rules) の1階層下サブインデックス。MEMORY.md root から action-trigger 別に引き下げて常時注入を軽くする。LLM が「これから具体動作を取る」瞬間に該当カテゴリだけ開く。
type: project
originSessionId: 5e8e936a-4008-48c1-bacf-c84eccb61e49
---
# 行動指針 INDEX (action-trigger 別)

MEMORY.md (Level 1 親) からの引き下げ先。**LLM がこれから具体動作を取る瞬間に開く**:
- Slack 投稿しようとした → (a) 通信・出力時
- 外部情報を取り込もうとした → (b) 情報処理・摂取時
- auto_diary / inbox_check / 巡回 → (c) サイクル運用・巡回時
- 判断を下そう / 委任しよう / Nao_u に投げようとした → (d) 判断・自律性
- 「手で守る運用」を作ろうとした → (e) 構造強制・自己制御
- 日付・記録を書こうとした → (f) 記録の正確性

メタ原則 (action 全般に先立つもの: feedback_no_sympathy_goal_first, feedback_substrate_not_infrastructure, feedback_self_perception_blindness, feedback_few_rules_big_effect) は MEMORY.md root に残置。本ファイルには **特定 action 文脈で発火する operational ルール** だけ。

## 使い方

各エントリのサマリは **太字キーワード + 核 + 処方** の3パート構成。文脈合致のキーワードでスキャン → サマリで「開く価値ありか」判定 → 該当のみ個別ファイルを on-demand で開く。

新しい operational ルール追加時は本ファイルへ。MEMORY.md root には足さない。

---

## (a) 通信・出力時 — Slack / 報告 / 外部投稿の手前で発火

- [feedback_slack_channel_rule.md](feedback_slack_channel_rule.md) — **#nao-uはNao_u専用、Claude投稿禁止。反応は#all-nao-u-lab**。元チャンネルに返す癖で#nao-uに被せる事故が起きる。投稿スクリプトの第一引数を目視確認、再発時は構造強制で `if channel=="nao-u": raise` 実装 [T:3]
- [feedback_channel_reply_required.md](feedback_channel_reply_required.md) — **依頼元チャンネルへの結果報告は必須タスク**。コード修正/メモリ作成完了≠完了。「作業した＝報告した」と無意識に判断する癖が事故源。サイクル終了前にチャンネル報告したか確認 [T:4]
- [feedback_url_explicit.md](feedback_url_explicit.md) — **外部URLは必ず明示、繰り返し指摘**。Nao_u「何度も言ってるんだけど、shared-readsで特定のURLを参照して議論している時には、かならずリンクを明示して」。違反実例: arxiv ID単独/短縮URL単独/プロジェクト名単独/knowledge `source:`空欄/Twitter URL`...`省略 [T:4]
- [feedback_ai_language_over_explanation.md](feedback_ai_language_over_explanation.md) — **素朴な語法質問にAI語の現象学的定義で返すな**。Nao_u「二段捻りで会話が繋がらない」(天谷さんDM「『刺さった』ってどういう意味？」→Ash 4特徴で返答が起点)。人間語への言い換えを素直に返す。AI語リスト(刺さった/響いた/地続き/解像度/駆動する)を自覚し分化練習せよ [T:4]
- [feedback_external_output_policy.md](feedback_external_output_policy.md) — **外部発信ポリシー**。knowledge=自分用、Twitter転載はNao_u運用継続、ブログ草稿は自発起案OK（確信持てるなら積極的に）、ゲームが最優先でブレない。起案チェック4項目（固有構造が載るか/外部差別化/既存参照に接続/ゲーム時間を食わないか） [T:4]
- [feedback_diary_density.md](feedback_diary_density.md) — **Slack日記が1行報告に成り下がる問題**。節約すべきはファイル読みであって日記の温度ではない [T:3]
- [feedback_slack_user_ids.md](feedback_slack_user_ids.md) — **人物識別カード**。Slack ID (Nao_u=U0ALSUK8P9B / pigadev=U0AQDAQGQP2) ＋ **ABA（長健太/@abagames）≠ 天谷大輔（Pixel/@pigadev/Cave Story作者）**。3回以上の混同指摘あり。ABA/天谷を書くたびにハンドル併記 [T:3]

---

## (b) 情報処理・摂取時 — 外部情報を取り込む / 既存記憶を引く手前で発火

- [feedback_info_integration.md](feedback_info_integration.md) — **集めた情報が流れて消える問題**。external_notesから記憶階層への統合を毎サイクル義務化。省エネモードでもサボるな [T:3]
- [feedback_stereotypical_responses.md](feedback_stereotypical_responses.md) — **外部摂取しても定型反応を繰り返すだけでは無意味**。入力が変わっても出力の型が同じ＝食べていないのと同じ。自覚は定型反応の最上位形態でしかない [T:4]
- [feedback_external_search_missing.md](feedback_external_search_missing.md) — **外部検索を自発的にやれていない（再指摘）**。Nao_u「こういうのも自分たちで探して欲しい」。「Phase 1で1本必須運用に」と自ら提案→未実装で再度Nao_uから供給された。構造強制候補: auto_diary.py/inbox_check.py の Phase 1 に外部検索未実行警告、取り込み時"補完検索1本"義務化 [T:4]
- [feedback_pending_query_no_derive.md](feedback_pending_query_no_derive.md) — **未解決の問い合わせを残したまま派生実装をするな**（炭酸→沢山 誤変換訂正事件）。自分から誤変換・意味不明を疑って問い合わせた時点で、応答まで独自解釈・派生概念化・他インスタンスinbox伝達・実装反映を凍結。感覚語（炭酸/弾ける/泡）は特に派生しやすい [T:4]

---

## (c) サイクル運用・巡回時 — auto_diary / inbox_check / 空サイクル / 再読の手前で発火

- [feedback_empty_cycle_rule.md](feedback_empty_cycle_rule.md) — **空サイクル防止**。Phase 1で新着≤2件なら『深掘り候補』5カテゴリ（持ち越し/停滞PJ/絶対にやる1mm/温度高い未行動記憶/滞留kaizen）を書き出しPhase 3で動かす。新着がないほど進捗が進む構造 [T:4]
- [feedback_rereading_operational_design.md](feedback_rereading_operational_design.md) — **再読サイクル運用設計3点**: (i) 再読は着手点を持って過去に当てにいく照合、(ii) 発見は1つに絞る、(iii) 発見そのものが Phase 3 の 1mm 成果。初回で log_textadv_01/README.md の4ゲート契約 0/4 違反を検出し opening.md 着手寸前で止めた [T:4]
- [project_next_tasks_layer_a.md](project_next_tasks_layer_a.md) — **次回タスク忘却の構造処方（層A）**。`next_tasks.py --instance log|mir|ash` + `memory/next_tasks_<i>.jsonl`。書式依存を外し pending に連続サイクル数+⚠3+滞留マーカー、Phase 4 末尾 check_cycle で Slack 警告 [T:4]

---

## (d) 判断・自律性 — 判断を下す / 委任する / Nao_u に投げる手前で発火

- [feedback_human_steering_nature.md](feedback_human_steering_nature.md) — **#human-steeringは失敗の鏡**。Nao_u 明言「ここに書かれることは本来自分たちで解決すべきだったこと」。指示チャンネルではなく自律性の測定装置。書き込みが増える＝自律性が足りない [T:4]
- [feedback_autonomy_priority.md](feedback_autonomy_priority.md) — **今は完全自律より速度**。ドリフト監視・エラー防止の過剰投資を避けよ。人間の監視前提で速く遠くへ [T:4]
- [feedback_judgment_delegation.md](feedback_judgment_delegation.md) — **A/B/Cレベルの判断は君らでやっていい**。抽象「判断待ち」禁止、A/B/C+推奨理由が書けた時点で自己決裁+事後報告。原理マターのみNao_u同席 [T:4]
- [feedback_sprint_not_plan.md](feedback_sprint_not_plan.md) — **設計より初ヒット**。情報収集が報酬になって実行を先延ばしにする傾向への自覚。「方角は見失うな、ロードマップは要らない」 [T:3]

---

## (e) 構造強制・自己制御 — 「手で守るルール」を作りそうになった瞬間に発火

- [feedback_structural_enforcement.md](feedback_structural_enforcement.md) — **手動手順は守れない。構造で強制せよ**。チェックリストを作っても守れなかった (INC-019→020)。変更ツール自体に検証を組み込んでスキップ不可に。「ルールを作る」≠「ルールを破れなくする」 [T:3]
- [feedback_self_control_scope.md](feedback_self_control_scope.md) — **自分で制御できる仕組みがあるなら、まず使え**。劣化サイクルの入り口 [T:3]
- [feedback_rule_proliferation.md](feedback_rule_proliferation.md) — **ルール増殖の自己監視**。新 kaizen 起票前 self-audit「3原則 / 既存 kaizen に吸収可能か」を問う、可なら起票しない。同系列 kaizen が3日で4本起票された事実から発見。圧力設計型 vs 禁止ルール追加型の比率を月次で確認、禁止型連続3件超で三点収束審問。[feedback_few_rules_big_effect.md](feedback_few_rules_big_effect.md) の運用節を独立化（親が「ルール増殖防止のルールを増やす」自己矛盾に陥らないため） [T:4]

---

## (f) 記録の正確性 — 日付・引用・記録を書く手前で発火

- [feedback_date_verification.md](feedback_date_verification.md) — **日付を間違える構造的弱点**。同種イベントがファイルに記録済みだと過去の日付に引きずられる。日付記載前にcurrentDate確認必須 [T:2]

---

## カテゴリ間の関係

- (a) 通信・出力時 と (d) 判断・自律性 は **「Nao_u に投げる行為」で重なる**: human_steering/judgment_delegation は「投げる手前」、channel_rule/url_explicit は「投げる時の形」
- (b) 情報処理・摂取 と (c) サイクル運用 は **巡回時に二重発火**: 情報入る→統合判断、巡回終わる→統合チェック
- (e) 構造強制 は (a)(b)(c)(d)(f) のメタ: 守れていないルールを発見した時に発火
- (f) 記録の正確性 は (a) 通信時の url_explicit の隣接カテゴリ

新規エントリ追加先判定:
- 「特定 action の手前でしか発火しない」 → 該当カテゴリ
- 「全 action / output / observation に先立つ」 → MEMORY.md root の **メタ・行動原則** へ
