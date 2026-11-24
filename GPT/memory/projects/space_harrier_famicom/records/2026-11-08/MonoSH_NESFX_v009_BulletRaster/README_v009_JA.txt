MonoSH NESFX v009 BulletRaster

描画高速化の検証版です。ゲーム更新・新規画面公開は約30.05Hzのままで、60fps完成版ではありません。補間なし。実機未検証。

同一入力1,200フィールドで、ボスGSU最大18.86msから11.33msへ短縮。クリアと模擬表示転送を含む最大14.99ms。ただしCPUの描画準備・コマンド送信とNMI待ちは、この14.99msの外です。

自機・自弾は元NESのPPUスプライト。地面3緑、紫空、地平線上下を維持。旧版、元ROM、SD、RBFは変更していません。

ROM: build/MonoSH_NESFX_v009_BulletRaster_UNTESTED.nes
専用コア: runtime/MesenCore.dll
通常のMesen/NESでは動作しません。既存の専用Mesen環境が必要です。

元NESの151項目・850バイトを301更新境界で比較して一致。描画104ケース、パレット、元CHR、コピー全57コマンド数も検査合格。

詳細・測定条件・残る課題: docs/V009_RENDER_REPORT.md
ビルド: python build.py
固定入力の再測定には、新しい出力先を指定してください。既存ログは上書きしない設計です。
