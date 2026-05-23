# self judgment

完成時に、問題を「自分で未然に見つけたか」と「人間指摘がないと見落としそうか」で分ける。

## self_detected_before_user

- v002 作業開始前に、v001 参照なしで作る制約と、記憶から持ち込む blocker を `design_trace.md` に具体化した。
- 実装前に `wave_intent_table.md` を作り、各 wave に `player_intent / failure_pressure / exit_reason / bad_policy_check / telemetry` を持たせた。
- 初期 draft をそのまま採用せず、`delete-and-redesign pass` で wave の完全分離を破棄し、重なりのある構成へ変えた。

## found_by_metrics

- 初回 verify で全 policy が boss 前後で落ち、boss phase3 と HP/危険度を調整した。
- 初回 overlap check で sideArc の exit/entry overlap を検出した。直角 offset ではなく、spawn order と side 切替が原因だと見て修正した。
- 二回目 overlap check で、bridge lance と diver の交差を検出した。原因は lane と入退場先だったため、bridge lance の rail を変更した。
- timeline で 38-44 秒の空白を検出し、pre-boss cuts と boss warning bridge を追加した。
- boss ideal TTK を計算し、3 秒瞬殺ではない HP にした。最終値は normal 15.97 秒、pulse burst 11.77 秒。

## found_by_visual_review

- sideArc の左右交互出現は、数値上の出現間隔だけでなく、退出先と入場側が同じ画面端になると不自然に重なると判断した。
- bridge lance と diver は、同時に見える route sample で左側の軌跡が近すぎると判断し、offset ではなく rail の役割を変えた。
- isolated boring seconds と連続 boring runs を分けた。目的は単発の息継ぎを消すことではなく、退屈な連続区間を防ぐことだと整理した。

## found_after_user_feedback

この v002 作業中はまだなし。

## still_suspect

- v001 を参照しないため、v001 との直接比較はできない。
- 音なしのため、テンションは視覚だけに依存する。
- conservative policy は boss で落ちる。全 policy clear を必須にはしていないが、避け重視で火力不足/被弾が出る余地がある。
- headless と route sample は通ったが、人間が遊んだ時の「あと少しメリハリが足りない」感は残る可能性がある。
