MonoSH NESFX v022 PreciseMotion / 性能・同一性検証不合格の独立試作

結論
この試作をv021の代わりに使わないでください。岩の幅が止まって急に拡大する回数は減りましたが、CPU負荷により表示欠落が増え、入力取得タイミングからゲーム状態にも差が出ました。完成修正版ではありません。実機・FPGA未検証。

実装範囲
背景物体の未丸めワールド座標積、表示専用の連続寸法と地面位置を使い、Q8.8で補間して画素化時に一度丸めます。生存期間/スロット再利用/死亡/リセットの補間遮断は維持。既存パレット、空、地面、山、16段階敵弾回転、音源、元NESソースは同一です。
原データの量子化区間の中央をつないだ表示近似であり、失われた元の浮動小数データの復元ではありません。EM0のXは元の整数経路のまま。EM0の底辺で捨てていた1px精度と連続寸法を改善。EM1とボスは旧表示を維持しています。見た目の寸法は当たり判定用の元寸法と最大数pxずれます。

数値検証
・900シーン、6469 raw矩形の独立数式照合は差0。
・6339 current描画命令と6198 midpoint命令の照合は差0。生存期間遮断の15シーンと表示抑制25シーンは単純midpoint oracleから除外。
・高速乗算の全65536組の8bit入力と表示範囲の16bit×scale検証は差0。
・FlyStoneのZが1減る1034遷移で、幅の停滞794→285、4px以上の幅変化240→50。ただしこれは生成ジオメトリであり、実際の60fps提示を保証しません。
・背景物体3923矩形で旧表示との差は幅-7〜+7px、上辺-6〜+5px、底辺-3〜+2px。
・同じ900シーン入力スケジュール: v021 queue drop 2 / starvation 3、v022 drop 50 / starvation 51。表示抑制1→25シーン。
・1201 core_tick境界: 元ゲーム状態差941（frame_counterを除いても933）、元OAM差779、ラッチ入力差284。logic_tick/draw_count差0。元ソースが同じでも実行時同一性は不合格。
・reference 100ファイル、generated/nes_core 51ファイルはv021と完全同一。DLLも同一。

動画
results/deliverable_video/MonoSH_NESFX_v022_precision_motion_prototype.mp4
専用Mesenの実PPU録画1800field / 約29.95秒。SELECT入力で原ゲームの無敵をON、RAM書換なし。音声あり。動画上に性能不合格と実機未検証を明記。動画自体にも47回の提示更新なしが残っています。

保存先・再現
ROM: build/MonoSH_NESFX_v022_PreciseMotion_UNTESTED.nes
DLL: runtime/MesenCore.dll
最終判定: results/final_validation.json
数式: results/precision_model.json
新旧比較: results/motion_comparison.json
入力同一性: results/core_identity_v021_v022/comparison.json
ビルド: python -X utf8 build.py
検証: python -X utf8 tools/capture_precision_audit.py、tools/validate_precision_v022.py
ソース変更はこのv022フォルダー内のみ。既存v021、SD、RBF、元ROMは未変更です。

次に必要なこと
CPU側の追加処理をさらに減らすか描画側へ移す設計が必要です。ゲーム更新・入力サンプリングを変えて見かけの一致を作ることはしていません。現在のコードを採用するよりv021を保持してください。

ROM SHA256 48c7bb329e698f23436c6c34a9d077272918354d21ffcf2bf982d27507d5c640
DLL SHA256 7492983ad92de13fbf590d3f9baca2f575ad113b17c4e1ac92461b0595dd576b
