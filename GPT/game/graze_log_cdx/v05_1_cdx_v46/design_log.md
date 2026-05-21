# graze_log v05.2_cdx_v46 design_log

## 対象 directive

Slack pending の game directive は今回なし。`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。

Nao_u 指示原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

直近 directive の焦点:

> 次は latest2 compare の route/aggressive では pressure / movementSwitches が変わらなかった点を見て、cue volley を「避ける判断」に接続するか、道中敵配置の本質変更へ戻る。

## 実装前判断

v45 は `bossCueVolley` により final cue の圧を trace に入れたが、route bot は cue 後すぐ BOMB するため、GAP 表示が「避ける判断」に接続した証拠がなかった。今回は道中敵配置を変えず、boss cue 周辺だけに絞って `bossCueSteer` を追加する。目的は「final cue を見たら、短い間 GAP 側へ寄ってから BOMB する」入力判断を trace に残すこと。

使った過去知見:

- `Playable / Headless 評価`: clear 可否だけでなく、操作判断が trace に残るかを見る。
- `Balance / Rule Space`: pressure / movementSwitches の変化は楽しさの判定ではなく比較補助として扱う。
- `Repair / Iterative Improvement`: v45 から小さい差分にし、latest2 compare で原因を追えるようにする。
- `Feedback / Rights / Human Judgment`: headless は人間の納得感を代替しない。今回の判定は「cue が入力判断へ接続したか」までに限定する。

## 設計サイクル 1

良いところ / 悪いところ 30 件:

1. 良い: v45 は route clear と S grade を維持している。
2. 良い: `bossCue` と `bossCueVolley` が trace digest にある。
3. 良い: 変更箇所が final boss cue に限定されている。
4. 良い: latest2 compare の比較対象が既にある。
5. 良い: policy split に route / aggressive / defensive / panic がある。
6. 良い: GAP 表示は画面上で読める位置に出る。
7. 良い: cue bullet は短命で、理不尽な事故源になりにくい。
8. 良い: BOMB prompt と GAP が同時に出る。
9. 良い: route bot は clear capable なので regression を検出しやすい。
10. 良い: event trace は人間評価前の観察項目として使える。
11. 悪い: route bot が cue 直後に BOMB すると GAP を読む時間がない。
12. 悪い: `bossCueVolley` は圧の生成であり、入力判断ではない。
13. 悪い: pressure が変わっても、操作意図が変わったとは限らない。
14. 悪い: movementSwitches は stage 全体の集計で final cue の局所差分が薄まりやすい。
15. 悪い: panic policy は端逃げなので、人間の焦りの再現ではない。
16. 悪い: aggressive policy は敵狙いが強く、GAP cue を無視しやすい。
17. 悪い: defensive policy は安全寄りで cue 反応が見えにくい可能性がある。
18. 悪い: BOMB が強いため、cue 回避の価値が BOMB に消されやすい。
19. 悪い: GAP が左右 2 択だけだと判断が単純すぎる可能性がある。
20. 悪い: final cue だけ改善しても道中配置の手作り感は増えない。
21. 良い: 今回は道中に触らないことで差分が読める。
22. 良い: cue age を使えば BOMB を数十 frame 遅らせられる。
23. 良い: `bossCueSteer` event を入れれば局所判断を確認できる。
24. 良い: `bossCueGapX` を state に残せば bot と評価が同じ cue を参照できる。
25. 悪い: bot 専用の steer は人間操作の証明ではない。
26. 悪い: steer が強すぎると自動運転感が増える。
27. 悪い: BOMB delay が長すぎると clear regression になる。
28. 良い: 46 frame 程度なら cue を読ませつつ BOMB できる可能性が高い。
29. 良い: source path / version を更新すれば ledger の混線を避けられる。
30. 悪い: v45 の style compare スクリプトを上書きすると過去比較を壊す。

改善案 30 件:

1. `bossCueGapX` を state に保存する。
2. `bossCueT` を state に保存する。
3. cue 後 56 frame だけ route bot を GAP へ寄せる。
4. defensive bot も GAP へ寄せるが panic は端逃げのままにする。
5. aggressive bot は弱めに GAP を混ぜる。
6. `bossCueSteer` event を 1 回だけ記録する。
7. `traceDigest.bossCueSteer` を追加する。
8. route bot の BOMB は cue 後 46 frame まで遅らせる。
9. panic は従来どおり即時 BOMB を許す。
10. BOMB 遅延は boss final cue 後だけに限定する。
11. v46 専用 headless check を作る。
12. v46 専用 style compare を作る。
13. latest2 compare に `bossCueSteer` を追加する。
14. v45 スクリプトは残し、v006 を追加する。
15. `exportEvalLedger().source` を v46 path にする。
16. README は今回は変えず、design_log/devlog に差分を集約する。
17. headless check は `bossCueSteer === 1` を必須にする。
18. style compare も route ledger の `bossCueSteer === 1` を必須にする。
19. compare は古い record の missing field を 0 と扱う。
20. route clear / S grade / BOMB 使用は維持する。
21. boss part 構造は触らない。
22. midboss 以前の route timeline は触らない。
23. cue bullet の速度と本数は v45 のままにする。
24. GAP 表示の位置は v45 のままにする。
25. steer の evidence は event trace に残す。
26. pressure / movementSwitches は結果として見るだけにする。
27. 失敗時は BOMB delay を短く戻せるようにする。
28. next task には「人間に読めるか」を残す。
29. continuous directive の last_result を更新する。
30. staging に verification と commit を残す。

筋の良い案:

`bossCueVolley` に続けて、cue 後の短い steer window と `bossCueSteer` event を追加する。これで「圧が出た」から「入力判断が出た」へ評価単位を一段進められる。懸念は、bot 専用の判断であり人間の面白さを証明しないこと、BOMB delay が長すぎると clear を壊すこと。

## 設計サイクル 2

良いところ / 悪いところ 30 件:

1. 良い: steer window は局所変更なので原因追跡が容易。
2. 良い: cue age を使えば BOMB delay の根拠が明確。
3. 良い: GAP は既に表示されているので新 UI が不要。
4. 良い: event count の増加は 1 件に抑えられる。
5. 良い: compare JSONL に v46 record を残せる。
6. 良い: v45 record と同一 seed / policy で比較できる。
7. 悪い: movementSwitches は steer しても増えない場合がある。
8. 悪い: route bot の位置次第で steer 方向が目立たない場合がある。
9. 悪い: aggressive bot は target aim が強く cue に逆らう可能性がある。
10. 悪い: defensive bot は元から安全側なので差分が薄い可能性がある。
11. 悪い: panic を変えると既存 policy split の意味が崩れる。
12. 良い: panic を除外すれば policy の役割を維持できる。
13. 良い: route / aggressive / defensive で `bossCueSteer` が出れば十分。
14. 悪い: route だけ必須にすると他 policy の劣化を見落とす。
15. 良い: style compare は全 policy の digest を保存する。
16. 悪い: headless check を厳しくしすぎると将来調整が詰まる。
17. 良い: v46 check は route ledger の最小保証に絞れる。
18. 良い: source note に設計意図を短く残せる。
19. 悪い: `stageFlags.bossCueSteered` は mark 名と event 名が近く紛らわしい。
20. 良い: mark は flag、event は digest と役割を分けられる。
21. 悪い: state に cue 専用値が増える。
22. 良い: boss cue の状態なので scope は妥当。
23. 悪い: cue 後 56 frame は固定値で、難易度差には未対応。
24. 良い: 固定値の方が latest2 比較では読みやすい。
25. 悪い: BOMB delay 46 frame は人間には短い可能性がある。
26. 良い: headless では clear regression を避ける優先度が高い。
27. 悪い: cue steer が面白いかはまだ判断できない。
28. 良い: その限界を design_log に明記できる。
29. 良い: 次サイクルで人間向けの見た目か道中 wave へ移れる。
30. 悪い: 継続改善が cue 周辺に偏りすぎるリスクがある。

改善案 30 件:

1. steer window を 56 frame にする。
2. BOMB unlock を 46 frame にする。
3. route/defensive は GAP mix 0.72 にする。
4. aggressive は GAP mix 0.45 にする。
5. y 方向は `H-116` へ寄せる。
6. panic は変更しない。
7. `bossCueSteer` は最初の steer 時だけ記録する。
8. event extra に style / gap / age を入れる。
9. digest には count だけ入れる。
10. check は count 1 を要求する。
11. style compare は route ledger を安定条件にする。
12. latest2 compare の condition は cue / volley / steer のいずれか増加で通す。
13. 古い record 互換のため null ではなく 0 扱いにする。
14. v46 の `ROUTE_SOURCE_NOTES` を更新する。
15. title / h1 / version を更新する。
16. devlog に戻し方を書く。
17. design_log に限界を書く。
18. continuous directive に結果を追記する。
19. staging に path と検証を追記する。
20. `memory/raw/game_eval` は style compare 実行結果だけ stage 対象にする。
21. 自動サイクル由来の unrelated memory 差分は stage しない。
22. headless v45 は残す。
23. v006 compare は追加にする。
24. latest2 compare は共通なので更新する。
25. `README.md` も v46 の検証手順に合わせて更新する。
26. 必要なら次回 README を集約更新する。
27. clear / S / route coverage を regress させない。
28. pressure 差分は観察に留める。
29. movementSwitches 差分も観察に留める。
30. commit は v46 playable diff 単位にする。

筋の良い案:

steer は短く、BOMB delay はさらに短くする。GAP を読ませるが、BOMB prompt の価値は壊さない。解決できる問題は `bossCueVolley` が入力判断へ接続していない点。新しい懸念は bot が cue に反応するだけで、人間にとっての読みやすさや快感はまだ未検証な点。

## 設計サイクル 3

良いところ / 悪いところ 30 件:

1. 良い: v46 は playable diff として明確。
2. 良い: final cue の局所評価が一段増える。
3. 良い: headless check が操作判断まで検査する。
4. 良い: style compare の JSONL record が将来比較に使える。
5. 良い: latest2 に cue / volley / steer が並ぶ。
6. 良い: route clear を維持すれば人間プレイ候補として残る。
7. 悪い: BOMB delay は実プレイでは見えない内部ルール。
8. 悪い: bot の steer は表示を見ているわけではなく state を参照する。
9. 悪い: 人間が GAP を自然に読むかは未確認。
10. 悪い: boss cue 改善が続くと道中 wave の課題が先送りになる。
11. 良い: 今回の directive は cue volley の判断接続を明示している。
12. 良い: 1 サイクル 1 diff の範囲に収まる。
13. 悪い: event trace の追加だけでは遊びの厚みは増えにくい。
14. 良い: 実際の steer window が入るので event だけではない。
15. 悪い: GAP が左右固定なので毎回同じ印象になりやすい。
16. 良い: seed 固定比較では固定の方が変化を読める。
17. 悪い: route bot が既に GAP 側にいる時は移動量が小さい。
18. 良い: event age / gap は後で局所ログを調べる入口になる。
19. 悪い: localStorage などは使わないため手動プレイログは残らない。
20. 良い: まず headless の最低保証を優先する。
21. 良い: v46 directory で v45 を壊さない。
22. 悪い: copied README の表記が古い可能性がある。
23. 良い: design_log/devlog が正本として今回差分を記録する。
24. 悪い: compare latest2 は既存 JSONL の状態に依存する。
25. 良い: style compare 実行で v46 record を追記する。
26. 良い: push できれば運用ゲートを満たせる。
27. 悪い: 既存 ahead 5 の未 push commit があるため push 結果はそれも含む。
28. 良い: commit は今回 touched files だけに絞る。
29. 悪い: 既存の大量未コミット差分は今回とは無関係に残る。
30. 良い: final report でその前提を明示できる。

改善案 30 件:

1. v46 を v45 派生として作る。
2. `GAME_VERSION` を v46 にする。
3. `source` を v46 path にする。
4. `bossCueGapX` / `bossCueT` を追加する。
5. startGame reset に cue state を含める。
6. cue volley 発火時に gap と時刻を保存する。
7. updateBot で cue window を読む。
8. route/defensive/aggressive だけ steer する。
9. steer event は 1 回だけ記録する。
10. BOMB は cue 46 frame 後に許可する。
11. panic は即時 BOMB を維持する。
12. digest に `bossCueSteer` を追加する。
13. v46 check に version / digest 条件を入れる。
14. v006 style compare を追加する。
15. latest2 compare に `bossCueSteer` delta を入れる。
16. design_log を日本語で更新する。
17. devlog を日本語で更新する。
18. continuous directive を更新する。
19. staging に記録する。
20. headless v46 check を実行する。
21. style compare v006 を実行する。
22. latest2 compare を実行する。
23. 結果 JSONL の v46 record を確認する。
24. stage 対象を限定する。
25. commit message は v46 の実装内容にする。
26. push する。
27. push 後 status を確認する。
28. 残課題は人間の読みやすさと道中 wave にする。
29. 次回は cue 周辺を続けるか、道中の手作り wave に戻るかを latest2 delta で判断する。
30. 深追い停止ではなく、今回は directive の明示焦点を1段進める。

採用案:

v46 は `bossCueSteer` を追加し、route bot が final cue 後に GAP へ寄る短い steer window を持つ。BOMB は cue 直後ではなく 46 frame 後に許可する。これにより v45 の `bossCueVolley` を「画面に圧が出た」から「少なくとも headless policy が避ける判断を出した」へ進める。

## 懸念

- bot は state の GAP 座標を直接参照するため、人間が表示を読める証拠ではない。
- BOMB delay は内部調整であり、実プレイ時の自然な操作感は別評価。
- pressure / movementSwitches の delta は stage 全体集計なので、final cue の局所変化を過小評価する可能性がある。
- boss cue 周辺の改善が続いており、次サイクルでは道中 wave の手作り感へ戻る判断も必要。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v46_check.js
node tools\headless_game_style_compare_v006.js
node tools\compare_graze_log_style_latest2.js
```

期待条件:

- route は clear / grade S / BOMB 使用を維持する。
- v46 summary は `version: v05_1_cdx_v46` と `evalMethod: graze-ledger-v002` を持つ。
- `exportEvalLedger()` の trace digest に `bossCue: 1` / `bossCueVolley: 1` / `bossCueSteer: 1` が入る。
- style compare v006 が v46 record を JSONL に追記する。
- latest2 compare が v45 -> v46 の delta を出し、`bossCueSteer` が最新側で 1 になっている。

## 次の作業

次版では latest2 compare の pressure / movementSwitches と、人間が cue を見た時の読みやすさを分けて扱う。cue 周辺を続ける場合は GAP の視認性を検証し、道中へ戻る場合は具体 wave、敵数、座標、duration、実装後 trace を design_log に明記する。
