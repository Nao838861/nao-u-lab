# Pulse Relay v001 チェックリスト検証ログ

## Cycle 1: 正本照合

- 照合対象: `checklist_noncompression_protocol`, `game_shmup_enemy_design_noncompression_protocol`, `game_2d_shmup_reproduction_packet`, M-44, M-45, M-30, M-31。
- 発見した不足: 既存 checklist は敵配置の原文保持、8 wave schema、bad-policy policy、Boghog hard assertion を一部しか明示できていなかった。
- 修正: `completion_checklist.md` を再構築し、`enemy_rebuild_packet.md` を追加した。

## Cycle 2: 要約劣化検査

- 検査: 各 checklist 項目が一行見出しだけになっていないか、`出典 / 元の意図 / 達成条件 / 未達判定 / 証跡 / 状態` を持つかを確認。
- 発見した不足: 敵種の役割と登場順設計を同一項目にまとめると、また M-45 が落ちる。
- 修正: 「敵 wave 設計」「敵種と弾の役割」「Wave grammar assertion」「Headless と時系列評価」を分けた。

## Cycle 3: 実装可能性と検査可能性

- 検査: 各項目に対応する成果物またはコマンドがあるかを確認。
- 発見した不足: 「完成まで loop」をチェックするための最終証跡が必要。
- 修正: `self_judgment.md` と `checklist_validation.md` に最終状態とコマンド結果を書く完成判定を追加した。

## Cycle 4: 実装後検証

- 実行した検証:
  - `node wave_grammar_check.js`
  - `node verify.js`
  - `node timeline_eval.js`
- 結果: 3 コマンドすべて通過。
- 発見した不足: 最初の実装後検証では route が中盤で落ち、camper が強く残っていた。下端で待つ方針に対して、敵弾圧と下端撃破の得点低下を入れた。
- 発見した不足: 次の実装後検証では route がボス前に間に合わず、ボス前の硬い敵とボス出現待ちが「弾だけ残る時間」を作っていた。終盤 armored の shield / fireCd と boss 出現時刻、boss HP / fireRate を調整した。
- 発見した不足: 射線警告を減らそうとして hard target へ寄せすぎると、通常ショットだけで押し切れて Pulse Relay の必然性が落ち、noPulse が route より強くなった。これは測定値を良くするための誤調整なので戻した。
- 最終確認: wave grammar は hard issue なし。verify は 3 run すべて `state clear`。timeline は route / marksman が 5 seed で全クリアし、camper / lane-holder / blind-sweeper / noPulse は route より明確に弱い。
- v002 に残す弱点: route の `shootable_gap` と `bullets_without_targets` は残る。これは「Pulse Relay を使って硬い敵と弾圧を処理する」場面でもあるため v001 blocker にはしないが、次回は撃つ気持ちよさを切らさずに同じ役割を作る必要がある。
