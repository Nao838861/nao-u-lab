# 録画からの自機差し替え

2026年10月7日。[依頼原文・処理・自己評価](../../../projects/monosh_fx2/game/v001/RESULTS_20261007_PLAYER_RECORDING.md)に記録した。0:58以降のボス戦で飛行4姿勢、冒頭1秒の走行4姿勢を抽出。960×672の画面領域は320×224の3倍格子。中央飛行の抽出範囲36×61を75%で27×46へ縮め、既存32×48のcanvasへ収めた。RGB5の透明1＋不透明15色。元動画がなくても通常ビルドできる。

今回の教師差分：前回はNES CHRの絵へ色を付けたが、ユーザーが求めたのは録画の輪郭と陰影への修正だった。「カラー化」で要約すると原画の修正意図を落とす。元の格子を調べる前にAIで描き直すことや、原寸をそのまま置いてSNES画面を過度に占有させることを避けた。弾の白・橙・黄は保存し、死亡・つまずきは録画不足を明示して旧輪郭を共通パレットへ合わせた。

Mesenの85 OBJ場面、66実PPU画面15,313画素、不透明15色、17ポーズ・四反転・弾16サイズを照合。三カメラ・通常入力・左上Y900field、全12KiB＋最大12 OBJも通過。転送は最遅20行完了、OAM68bytes・CHR15,104bytesを保存。

最初の基準は独立リポジトリmainの`03d3ac1`。[別名ROM](../../../projects/monosh_fx2/releases/MonoSHFX2_player_20261007.sfc)のSHA-256は`071f69723001628c931939ce3e6d841825bc859c10d4b154276a3536fc1d719a`。同時進行の高速化が公開された後に`fa7e0fb`へ統合し、親・独立MonoSH_FX2双方の[通常ROM](../../../projects/monosh_fx2/releases/MonoSHFX2_v001.sfc)を更新した。現行SHA-256は`e301b0bca97df4bd4039307fdb39cb5b12c6bbb7ccd10f7828370fa8718f77aa`。高速化版との全ROM比較で差分は静的PPU・OBJパレット・checksumだけ。CPU/GSU・ロジックはbyte一致し、objects360・display720・play360・held900も再検証した。[統合集計](../../../projects/monosh_fx2/game/v001/results/player_recording_20261007/integrated/summary.json)。以後の再生成では録画由来の固定OBJ画像を維持する。

次回入口は[素材](../../../projects/monosh_fx2/game/v001/assets/player_recording/README.md)と`tools/import_recorded_player.py`。原寸16色の`native16_pose*.png`と32×48版の両方を保存した。原寸の値は不可逆圧縮動画から得た範囲で、元ROMのsprite矩形や正確なパレットを断定しない。
