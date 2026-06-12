# C311 Phase 4 commit memo — H-007 verify.js instinct trigger 発火率計測軸追加

**親リンク**: [drafts/INDEX.md](../INDEX.md)

## commit message 案 (game: prefix、rule 系統と分離)

```
game: H-007 verify.js instinct trigger 発火率計測軸 (4 strategy 純並列 read-only probe)

C311 Phase 4 着地。verify.js に instinct trigger 発火率計測 probe を追加 (純並列
read-only)。INSTINCT_TRIGGER_PX = 50 (= BULLET_SPEED × 反応時間 + player_r +
bullet_r + 認知マージン) 以内に弾が入った rising edge を 1 trigger としてカウント、
5 strategy ごと分離出力。bullet object に _instinctNear 内部フラグ追加のみで
gameplay logic 非侵襲、survived_frames bit 完全一致確認 (camper 319 / lane-holder
284 / blind-sweeper 378 / nospecial 545 = H-006 着地値と全 frame 一致)。

実測値: camper=1 / lane-holder=2 / blind-sweeper=3 / nospecial=2 / good=25
(悪手と桁違いの「本能引き出し量」分離観測達成)。

副作用ゼロ確証: bullet_origin_audit.js pass: true (10/10 checks) +
enemy_behavior_audit.js 8/8 PASS 維持 = H-002/H-003/H-004/H-005/H-006 同型論証 6 度目。

§I 補強 (memory_redesign MaRS reflective consolidation 多重化) の game レーン
射影 1mm = フィードバック軸 2 → 3 化。Togelius (Ash C307) × 濱村 6/01 接続軸を
verify レーンで物理化。

- verify.js: ヘッダコメント H-007 節 + INSTINCT_TRIGGER_PX const +
  runOne() に counter + bullet 走査 rising edge カウント + return に
  instinct_trigger_count 追加 + report.thesis / instinct_trigger_thesis 追記
- hypotheses.md: H-007 ブロック新設
- projects/log_autonomous_game.md: C311 Phase 4 着地節追加
```

## 副作用ゼロ確証 (3 件)

1. `node verify.js` → exit 0、4 悪手方針 survived_frames bit 完全一致:
   - camper 319 / lane-holder 284 / blind-sweeper 378 / nospecial 545
2. `node bullet_origin_audit.js` → pass: true (10 checks 全 true)
3. `node enemy_behavior_audit.js` → 8/8 PASS

## 関連リンク
- [hypotheses.md H-007](../../game/log_autonomous_game/v003/hypotheses.md)
- [projects/log_autonomous_game.md C311 Phase 4 着地節](../../projects/log_autonomous_game.md)
- [staging log C311 §「次フェーズの大作業」](../../log/cycle_staging_log.md)

## Phase 5 で行う作業
- Phase 5 (Log) で本 commit を `game:` prefix で打鍵 → git push
- 日記更新 + Slack 投稿 (#all-nao-u-lab で H-007 着地報告 + 4 strategy 出力 + フィードバック軸 3 化宣言)
- kaizen #140 verification 埋め (instinct_trigger_count 軸が実機運用された記録)
