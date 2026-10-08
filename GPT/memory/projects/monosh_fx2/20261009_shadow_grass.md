# 影と草のパレット共通化

2026年10月9日。[原文と結果](../../../projects/monosh_fx2/game/v001/RESULTS_20261009_SHADOW_GRASS.md)。ユーザーは影を草と同じパレットの最暗色にし、草が重なっても色が壊れないよう依頼。

影asset38はindex1だけの原画だが、palette0（敵の灰色・赤）を使っていた。草asset0/1はpalette1。影の4セルをpalette1へ変え、再取込とrepair_color_silhouettes.pyのfallbackも修正。RGB5(1,7,2)、表示RGB(8,57,16)。原画・輪郭・描画順・runtimeコード・DMA量は変わらない。

verify_shadow_grass.pyで影単独＋草2種類×両順序×8タイル位置＝33場面の実PPU31,396画素を照合。実際の不透明重なり5,248点を含み、旧版色エラー8,475→新0、bitmap0。SELECTカラー→二値→カラーも確認。新ROMと既存の自弾時間色・地面clip・遠景復元・BGMを保持する。
