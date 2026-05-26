# Pulse Relay v008 設計ログ

## 対象指示

継続対象は `memory/slack_directives.jsonl` の `log-cdx-1779668181-d295d8ddd5`。原文は v006 で全文保持済み。要点は、Pulse Relay を自律サイクルで v006 / v007 / 以降へ進め、細かい UI 調整ではなく「pulse 的な仕様をシューティングゲームに足すなら何が一番良いか」を大胆に試し、headless で測りながら良いものを拾うこと。

今回の v008 は Slack pending はないが、Phase Game Start の local continuous game directive 相当としてこの継続指示を扱った。

## 実装前判断

v007 は「Pulse で敵を味方砲台へ支配する」版として成立した。ただし、人間側の理解としてはまだ「黄色い敵が撃つ」だけに見えやすく、自機位置と支配対象の関係が薄い。そこで v008 では Pulse の主語をさらに変えた。

採用案: Pulse で味方化した敵と自機の間に `relay tether` を張る。敵弾がその線を横切ると relay 弾へ変換される。これにより、プレイヤーは「どの敵を味方化するか」だけでなく「その敵と自機の線をどこへ通すか」を考える。

使った過去知見:

- `game_design_rules.md`: 見えているルールから入力結果を予測できること。説明で支えないこと。
- `game_memory_task_lens_index.md`: headless では route / camper / lane-holder / blind-sweeper を分けること。
- `memory/game_special_system_hud_affordance_lesson_20260525.md`: 特殊システムは常時説明文ではなく対象物側の記号で教えること。
- `memory/game_supervised_delta_autonomous_creation_lesson_20260525.md`: 「UI 改善」「敵を自然にする」のような要約に圧縮せず、何が画面上で起きるべきかへ戻すこと。

なお、`memory/game_autonomous_creation_metaprompt_20260525.md` と `memory/game_creation_human_gap_metaprompt_20260525.md` は index 上では参照指示があったが、現時点の GPT 側 `memory/` には存在しなかった。代替として同じ内容を再アンカーしている上記 2 ファイルを読んだ。

## 設計サイクル

### Cycle 1

良いところ/悪いところ30件:
v007 は、黄色い敵が残る、味方弾を撃つ、赤弾を止める、横移動で強い Pulse になる、route が clear する、camper が落ちる、lane-holder が落ちる、offscreenShots が 0、overlap が 0、検証指標がある。一方で、黄色い敵が多弾を撃つだけに見えやすい、自機位置との関係が薄い、Pulse 後にプレイヤーが何をするかが弱い、味方化対象選択が最適化しにくい、blind-sweeper が一部強い、allyShots が多く読みにくい、rewriteKills が低い、field と ally の違いが曖昧、boss では支配の意味が薄い、支配終了の理解に依存する、弾量で成立しているように見える、説明なしの体感差が不十分、shot と Pulse の役割分担が薄い、敵弾を消すだけの快感へ戻りやすい、中央待ち対策が commandFocus 依存、視線誘導がまだ弱い、タイムラインが長大、bad policy 指標の読みが難しい、fieldConversions が主役ではない、v006 との差分が言語化しづらい。

改善案30件:
味方化敵と自機を線で結ぶ、線を横切る敵弾を relay 化する、線を黄色で見せる、線の変換数を測る、線の有効時間を測る、field とは別指標にする、支配敵を即死させない、支配中は線を維持する、route policy は線を敵弾へ通す、camper は線を作れない、lane-holder は低出力で届きにくい、blind-sweeper の score を比較する、boss phase で tether が残るか見る、fieldConversions は下限だけ残す、tetherConversions を hard 条件にする、tetherActiveTime を hard 条件にする、描画は説明文ではなく線にする、HUD は増やさない、mechanic check で人工的に線変換を起こす、enemy audit に線指標を足す、timeline aggregate に線指標を足す、README に「線を通す」体験を書く、既存 wave は壊さない、画面外射撃は禁止継続、敵移動ジャンプ禁止継続、overlap 禁止継続、route clear 継続、noPulse/camper/lane-holder fail 継続、blind-sweeper は残課題として見る、次回は線が強すぎる場合に範囲を絞る。

筋の良い案: `relay tether`。解決できる問題は、Pulse 後の自機位置に意味が出ること、黄色い敵が画面内に残る理由が増えること、敵弾をただ円で消すだけではなく線で拾う遊びになること。懸念は、線の判定が広すぎると自動変換になり、雑な移動でも勝てること。

### Cycle 2

良いところ/悪いところ30件:
tether は画面上の因果が見える、敵と自機の関係が線になる、支配対象選びと位置取りが同時に要る、弾を横切らせる余地がある、field より読みやすい、既存 v007 に小さく足せる、headless 指標化が容易、route の laneSwitches と相性が良い、画面外射撃を増やさない、敵 path を変えない。一方で、変換数が多すぎる危険、blind-sweeper も拾う危険、fieldConversions が下がる、allyShots と重なって画面が明るすぎる、線が常時強いとノイズ、敵が多いと線が多い、boss 周辺で自動処理化する、mechanic check が自然プレイと違う、score が上がりすぎる、tether があるだけで防御が強い、route damage が 0 になりすぎる、bad policy clear を厳しく見直す必要、視覚確認未実施、音なし、モバイル未確認、説明なしで線の意味が伝わるか未確認、線の太さが仮、変換粒子が小さい、tetherActiveTime の単位が線本数秒、README で誤解を避ける必要。

改善案30件:
線判定は 22px に限定、画面内の支配敵だけ線を張る、H*0.84 より下の敵は対象外、変換時は relay 弾へする、変換元へ resonance を返す、converted に加算する、field とは別に `tetherConversions`、線本数秒を `tetherActiveTime`、draw は enemies より前に線を描く、粒子を黄色にする、timeline hard 条件は tether 主役へ変える、field 下限は 3 に下げる、verify は mechanic tether を見る、enemy audit は tether を見る、blind-sweeper clear は残課題として記録、score 差で支配的かを見る、camper/lane-holder fail は維持、README に bad policy 結果を書く、design_log に懸念を書く、staging に path と検証を書く、root wrapper を作る、timeline 結果を JSON 保存する、commit 前に差分確認、既存 v007 は触らない、directive は handled 済みなので更新しない、metaprompt 欠落を記録、次回は blind-sweeper 対策を検討、線判定をさらに狭める候補を残す、tether と allyShots の比率を見る、route と blind-sweeper の質差を読む。

筋の良い案: `tetherConversions` と `tetherActiveTime` を v008 の中心検証にする。解決できる問題は、主観的な「線が意味を持つか」を数値へ落とせること。懸念は、数値が高くても人間に読めるとは限らないこと。

### Cycle 3

良いところ/悪いところ30件:
実装範囲が狭い、既存検証を流用できる、v008 の違いが一文で言える、線が視覚記号になる、Pulse 後の位置取りが増える、route は clear、camper は fail、lane-holder は fail、noPulse は fail、offscreenShots 0、lingering 0、maxEnemyStep 12.52、overlap 0、wave hard issues 0、tetherConversions 269、tetherActiveTime 40.5。一方で、blind-sweeper は clear する、route と marksman が同じ軌跡に近い、tetherConversions が高すぎる可能性、score が上がった、fieldConversions は 4 へ下がった、rewriteKills は 0、allyShots はまだ多い、画面が黄色過多の可能性、線が複数出ると見づらい可能性、boss-rush も clear、視覚確認未実施、プレイヤー説明なし検証未実施、音なし、tether 判定幅は仮、v008 は完成ではなく仮説確認、次回は bad policy と視認性を詰める必要。

採用案: `relay tether` を playable diff として実装し、v008 は「敵を味方化して弾を撃たせる」から「味方化した敵と自機の線で敵弾を変換する」版として固定する。

## 実装内容

- `segmentDistance2` を追加し、敵弾が自機-味方化敵の線を横切ったか判定する。
- 味方化中の敵と自機を結ぶ `activeTethers()` を追加した。
- 線を横切った敵弾を relay 弾へ変換し、`tetherConversions` を加算する。
- 線の存在時間を `tetherActiveTime` として記録する。
- 画面上に黄色い tether line と変換粒子を描画する。
- `verify.js`, `timeline_eval.js`, `enemy_behavior_audit.js` に tether 指標を追加した。
- root から実行できる `tools/headless_pulse_relay_v008_check.js` を追加した。

## 検証

- `node verify.js`: pass
- `node timeline_eval.js > timeline_eval_result.json`: pass
- `node enemy_behavior_audit.js`: pass
- `node wave_grammar_check.js`: pass
- `node enemy_overlap_check.js`: pass
- `node tools/headless_pulse_relay_v008_check.js`: pass

主要結果:

- route clearRate: 1
- route meanConverted: 323
- route meanRelayHits: 301
- route meanTetherConversions: 269
- route meanTetherActiveTime: 40.5
- route meanRewrittenEnemies: 8
- route meanRewriteActiveTime: 48.83
- route meanAlliedShots: 392
- route meanAlliedHits: 279
- route meanAlliedKills: 22
- noPulse / camper / lane-holder clearRate: 0
- offscreenShots: 0
- lingeringEnemies: 0
- maxEnemyStep: 12.52
- pairOverlaps: 0

## 懸念

`blind-sweeper` は clearRate 1 で、score は route より低いが「雑な移動でも最後まで行ける」余地が残った。v008 の目的は tether 仮説の playable 化なので通すが、次回は tether 判定幅、支配敵数、blind-sweeper の Pulse 条件を絞り、route は clear / blind-sweeper は fail へ戻す検証を優先する。
