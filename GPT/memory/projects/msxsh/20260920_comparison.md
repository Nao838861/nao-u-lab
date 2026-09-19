# diff.avi のMP4化と比較動画差し替え

ユーザー依頼: `C:\Users\owner\Documents\openMSX\videos\diff.avi` をMP4化し、`MSXSH_vs_Arcade_20260913_SmoothTreeZ_ExactFieldSync_1m21s.mp4` を差し替える。

## 出力

すべて `C:\Users\owner\Documents\openMSX\videos` 内。

- `diff.mp4`: 元録画全体、90.816936秒、960×720、約59.922744fps。H.264 CRF17/preset fast/yuv420p、AAC 192kbps、faststart。
- 指定の比較動画名へ新しい比較動画を配置。1920×720、60fps、映像78.033008秒。名前はユーザー指定の差し替え先を維持したため、日付・1m21sは今回の内容を示さない。
- 旧版は `MSXSH_vs_Arcade_20260913_SmoothTreeZ_ExactFieldSync_1m21s.before_20260920.mp4` に保存。

## 再現手順と同期根拠

既存 `D:\MSXDev\MSXSH\make-sync-comparison.ps1` は左MSX・右アーケード、右側crop=960:720:960:0、アーケード音声を使用する。右の85%表示は既存映像に含まれるためそのまま再利用。

今回のAVIには前のプレイとリセット待ちがある。旧比較の左側のフレーム0/5/10/20/30/50と新AVIを320×240グレースケールで比較し、最小平均絶対誤差がそれぞれ766/771/776/786/796/816に一致した。開始位置は0始まり766フレーム、12.783126219987523秒。

比較生成時は再圧縮済みdiff.mp4ではなく元AVIを入力0、旧比較を入力1に使用した。

```text
[0:v]trim=start_frame=766,setpts=PTS-STARTPTS,fps=60[left];[1:v]crop=960:720:960:0,fps=60[right];[left][right]hstack=inputs=2:shortest=1[outv]
```

出力オプション: `-map [outv] -map 1:a? -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a copy -shortest -movflags +faststart`。

今回の録画に対応するruntime-lagログはないため、旧録画の欠落フィールド削除位置は流用していない。ステージ開始を画像で整合し、以後は録画の本来の時間進行を維持する。旧ファイル名のExactFieldSyncは全区間での厳密なフィールド一致を保証するものではない。

両出力とも `ffmpeg -v error -xerror -i <file> -f null NUL` による全フレームデコード検査でエラーなし。比較映像の抜粋を画像で確認後、旧版をコピー保存して指定ファイルを差し替えた。
