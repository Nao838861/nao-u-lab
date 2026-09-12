# 第二部解説動画 初回レビュー制作

## 再開時に読む

- `video/explainer_prototype/指示書2.md` — 第二部の構成・音声・画面指示の正本
- `video/explainer_prototype/PART2_REVIEW_AND_CAPTURE.md` — 全体見直し、撮影素材の確保状況、再生成手順
- `video/explainer_prototype/APPLIED_CUT_DIRECTIVES.md` — 第一部と第二部の入口を分離

## 現在の構成

ユーザーと構成を相談後、全体レビューと動きのある映像化を依頼された。重複文を削り、実データと動く模式図による初回レビューを制作。

- 前半：タイトル、約8msの制約、背景の投影と表、描画順、敵の移動表、当たり判定、2フレーム配分とまとめ。
- 後半：C言語→AIによるアセンブリ化、8bit化、背景Xを16bitで残す理由、Houdiniでの軌跡作成、AIの全自動抽出が難しかった話。
- 暫定IDはC01〜C12、C14、C15とC08a・C08bの16件。第一部のカット番号とは別管理。
- AI抽出の改善策と全体の結末は未確定。未確定の結論は作っていない。

## 制作物

- composition `Part2Review`、1280×720、60fps、29,686フレーム、8分14.77秒。
- 出力：`video/explainer_prototype/out/part2/part2_review_720p60.mp4`
- 実装：`src/Part2.tsx`、抽出データ：`src/part2Data.json`
- 音声：`narration/part2-cuts.json`、生成済みWAVは `public/narration/part2/`
- 文境界と音声ハッシュ：`src/part2Alignment.json`
- 再生成：`npm.cmd run render:part2-review`。詳細は撮影素材メモを参照。

## 説明上の重要事項

- 背景のXは符号付き16bitで保持し、Zから引いた倍率とソフトウェア乗算して描画座標へ落とす。XY両方の完成座標をZだけで引く実装ではない。
- バケツは配列8個、背景のZ0〜55はZ>>3で7区分を使う。同じバケツ内の厳密なZ順は省略。
- 通常編隊は位置・サイズ・Z・バケツ番号を軌跡表から読む。特殊敵とボスまで「すべて表だけ」と一般化しない。
- 敵のZは4倍精度。レビュー図のZは背景と同じ56段階の単位へ換算している。
- 衝突は同じZ区分の専用リストを使い、弾が通過するZ範囲の候補を2D矩形で判定。矩形の幅・高さはサイズ別の表から取る。

## 素材と残件

Houdini録画は `C:/Users/owner/Videos/Houdiniで敵軌跡.mp4`。public内コピーと同一で5.85秒。既存素材を利用済み。

背景の左右追従比較と、AIの実際の誤検出結果は未確保。C12とC15には模式図を明示した仮映像を入れてある。撮影条件は `PART2_REVIEW_AND_CAPTURE.md` に具体化済み。

初回レビューなので、細かな動きの間・抑揚・差し替え映像は引き続き調整対象。動画を完成版扱いにしない。第一部は変更していない。
