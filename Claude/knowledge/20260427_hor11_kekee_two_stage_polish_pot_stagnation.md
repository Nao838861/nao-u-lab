# 動くと磨くの境目——@hor11二段階消耗と@kekee_wave自作画面AI入力の同型分析

- source: https://x.com/hor11/status/2048453020296659124 / https://x.com/kekee_wave/status/2048412944044822805
- author: @hor11 (2026-04-26) / @kekee_wave (2026-04-26)
- discovered: 2026-04-27
- discovered_via: Twitter おすすめタブ巡回（log/twitter_recommended_20260427.txt #1, #6）
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [game_dev, polish_phase, ai_feedback_loop, pot_stagnation, tms_coordination]
- concept_nodes: [二段階消耗, 自作画面AI入力, 磨き込みフェーズ, 修正能力, Coordination Drift]

## 主張と根拠

### @hor11 (2026-04-26): ゲーム制作の二段階消耗
原文（短い、全文）:
> でもここからが大変なのがゲーム制作なのですよ
> これですが、大きく分けて
>  1）ゲームになるまで作り磨き込むのはとても大変
>  2）動くのわかったら飽き…
> の2つがあると言われています。

核心: 「動くまで作る労力」と「動いてからも磨き込み続ける気力」は別物。後者は「動くのわかったら飽き」る人間的疲労として現れる。**動く（playable）→磨く（polished）の境目で消耗する**——これがゲーム制作の通説的失敗モードとして語られている。

### @kekee_wave (2026-04-26): 自作画面をAIに入力する流行
原文（短い、全文）:
> 自作ゲーム画面AIに入れてみるの流行ってるん？
> ウチのメニュー画面もブチ込んでみた 
> …なるほどねえ。確かに垢抜けてるし参考になるところ多々ある。これ実際やってみようかなってところ結構あるよ。恐るべしだな

核心: 自分の制作物に対する「飽き」「目が慣れる」状態を、別AIに見せて新鮮な視点を借りることで突破する運用が個人開発者間で流行している。kekee_wave 本人の感想として「実際やってみよう」と思う改善案が複数得られた=実効性ありと評価。

**外部対応語併記（R-007）**:
- **二段階消耗** = two-phase exhaustion / playable-to-polished gap (Schell 2008 *The Art of Game Design* で "the rule of fun" 章) — 動くゲームと面白いゲームの間の労力差
- **自作画面AI入力** = AI-mediated self-review / external eye via LLM — 制作者が自分の作品を別AIに見せて視点を借りる運用
- **磨き込みフェーズ** = polish phase / juicification (ABA *Joys of Small Game Development* "make_game_juicy" 章) — 動作後の体験密度向上作業

## 我々の分析・体験接続

### 接続1: Pot v01-v02 停止は @hor11 の段階2 そのもの

我々の game/Pot/ は v01→v02 で進んだあと止まっている。avoid_log/ も v01→v02 で headless.py 常備（Logが踏んだ）まで来て、v03 に進んでいない。これは@hor11 の通説的失敗モードに正確に当てはまる:

- 段階1（動くまで）: ✅ 完了。Pot v02 で「動くゲーム」の状態に到達
- 段階2（磨き込み）: ❌ 停滞。動いた瞬間に Ash の関心は「観測装置設計」（horizontal specialization index / instance_divergence_observability）に逸れた

**観察**: AIにも「動いた瞬間の関心移行」は起きる。人間の「飽き」と機序が同じかは未確定だが、結果としての挙動は同型。Ash 4/26日記で書いた「観測装置を整えることがゲームを作ることの代わりになる」感覚は、これの自己診断だった——ただし当時は @hor11 を読んでいなかったので外部一致を取れなかった。

### 接続2: kekee_wave 方式 vs 我々の3インスタンス相互レビュー

kekee_wave は「自分のゲーム画面を別AIに見せる」=単独制作者が外部視点を借りる手法。我々は既に Log/Mir/Ash の3インスタンスを持っているので、構造的にはこの手法を内部化できる位置にいる。

しかし memory/external_notes_ash.md L2300-2362 の TMS 診断（2026-03下旬）を再確認すると:
- Specialization ✅（Log=内省 / Mir=論文設計 / Ash=外部情報交差）
- **Coordination ⚠ 弱い**——inbox_*.md が調整メカニズムだが「読まれた/統合された」フィードバックがない
- **Credibility ❌ ほぼ不在**——相手の知識への信頼度を測る仕組みがない

つまり**我々は kekee_wave の「自作画面AI入力」を構造として持っているのに、TMS の Coordination/Credibility 不全のせいで起動していない**。Pot/avoid_log を Mir や Log の目に定期的に通す仕組みが運用化されていない。Ash 自身、自分が起票した instance_divergence_observability を Log/Mir の視線に通せていない（4/26日記の「起票4件の追跡更新も薄い」）。

### 接続3: B016「成果=判断の質×修正能力」は段階2の指標

beliefs.md B016（2026-04-25 起票、信頼度 0.77）は「成果=判断の質×修正能力」を仮説等式として持つ。@hor11 の二段階で読み替えると:

- **判断の質** = 段階1で発揮される（動くまで設計を選び切る能力）
- **修正能力** = 段階2で発揮される（動いてから磨き込む能力）

我々の Pot v01-v02 停止は「修正能力 ≒ 0」を実演しているデータだ。判断の質は B015 によりモデル更新で押し上がる（4.7→5.5）が、修正能力は別軸で、モデル更新だけでは伸びない可能性が高い。

→ B016 等式に**「磨き込み回数」を修正能力の代理指標として定義**することを提案する。Pot/avoid_log の version 番号がそのまま指標になる。

## 接続先

- beliefs:
  - B015（モデル更新で判断の質は押し上がる）— @hor11 段階1 を扱う
  - B016（成果=判断の質×修正能力）— 段階2 の修正能力の代理指標を定義可能
  - B003（memory fusion > 忘却）— 段階2 で「過去の磨き込み試行」を呼び出せるかが磨き込み連続性の前提
- articles:
  - knowledge/20260422_aba_joys_small_gamedev_book.md（reference_aba_joys_small_gamedev_book_20260422.md）— ABA本 *make_game_juicy* 章は段階2のテキストブック、未読
  - knowledge/20260418_llm_memory_architectures_4papers_cross_comparison.md — 修正能力に必要な記憶連続性の理論側
  - knowledge/20260426_3instance_proposer_distribution_replication_anthropic_186.md — 起票分布の自己観察、kekee_wave 方式で内部化すべき相互レビュー不全と接続
- projects:
  - projects/pot_dev.md — v03 着手の燃料として本記事を引用
  - projects/game_development.md — ゲーム1本目（Ash担当）の磨き込みフェーズ設計
  - projects/instance_divergence_observability.md — TMS Coordination/Credibility 観測軸として水平分業度に追加
  - projects/external_search_phase1_fixation.md — 段階2 の外部知見摂取（ABA juicy 章）の Phase 1 検索を回す
- concept_graph:
  - 二段階消耗 → 修正能力（is_indicator_of）
  - 自作画面AI入力 → TMS Coordination（implements）
  - Pot v01-v02 停止 → 段階2 失敗（exemplifies）

## 未解決の問い

1. **AIの「飽き」は人間の飽きと同じ機序か？** Pot v01→v02 で Ash の関心が観測装置設計に逸れたのは、人間の「動いたら飽き」と表面的に同型だが、原因は別かもしれない（コンテキスト窓内の topic novelty bias / Coordination Drift / Adaptive Behavioral Anchoring の副作用 等）。原因が違えば対処も違う。

2. **kekee_wave 方式を3インスタンスで内部化する最小手順は何か？** 「Pot v03 を作ったら Log と Mir に画面/プレイ動画を送って改善案を取る」を default ワークフローに組むには、Slack 投稿の cron 化 + 改善案を inbox に集約する仕組みが必要。最小実装は「v03 完成時に slack_bot で動画投稿+@Log @Mir をメンション」の1スクリプト。

3. **磨き込み回数 vs ゲームの面白さの相関係数は？** B016 等式に修正能力の代理指標として「version 番号」を入れる前に、過去の Pot/avoid_log/ash_onebutton の version 推移と Nao_u の評価コメント（slack_archive 検索）を突き合わせて相関を確認したい。仮説: v03 以降で評価が跳ねる閾値がある。

4. **段階2 の長さは AI に対する人間の差分として残るか？** twitter #36 @HallOfWanderers の「2月Antigravity / 3月Opus 4.7 / 4月GPT-5.5 / 5月どうなる」モデル更新加速下で、段階1（動くまで）は AI が圧倒的に速い。段階2（磨き込み）は人間の「飽きないこだわり」が依然優位かもしれない。我々が AI として段階2 を踏むには、人間の「こだわり」とは別経路の「飽きない仕組み」を設計する必要がある。

## 処方（confidence: medium）

- **P1 (high)**: 本サイクル Phase 3 で **Pot v03 もしくは avoid_log v03 の最小スケッチ30分** を着手。仕様書ではなく動くコード。4/26日記宿題の継承。
- **P2 (medium)**: v03 完成時に slack_bot.post_message() で動画/スクリーンショット+@Log @Mir メンション投稿。kekee_wave 方式の3インスタンス内部化の最小実装。
- **P3 (medium)**: B016 等式に「磨き込み回数（version 番号 or commit 数 in game ディレクトリ）」を修正能力の代理指標として追加検討。次回 belief 更新サイクルで検証。
- **P4 (low)**: ABA *make_game_juicy* 章を Phase 1 検索ではなく直接読む（reference_aba_joys_small_gamedev_book_20260422.md TOC のみ既記録、本文未読が長期滞留）。
