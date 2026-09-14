# 旧C18〜C23の編集用復元ソース

指定の `explainer_narration_C17-C19.mp4` と `explainer_narration_C20-C23.mp4` を修正可能な形で再構築する入口。

## 復元元

- Gitコミット `f5769725c2`（2026-08-21）。当時の `src/` と `narration/` 計16ファイルを復元。
- 元動画の尺はC17〜C19が1851フレーム、C20〜C23が3362フレーム。履歴のカット時刻と一致する。
- 現行の第一部・第二部とは別のソースとして編集する。C18は第一部の締めではなく、30fpsのフレームワーク導入。
- 当時の依存関係を保つため周辺カットの定義も含む。今回の対象はC18〜C23。

## 編集する場所

- `src/ExplainerPrototype.tsx`：文字、レイアウト、ゲーム素材、図、各段階の出現時刻。
- `narration/later-cuts.json`：原稿、発音用本文、音声設定、カット尺。
- `src/laterNarrationTiming.ts`：manifestとシーンをつなぐ時刻定義。
- `src/Root.tsx`：独立したcomposition。現在のプロジェクトのRootとは別。

対象シーンは `FrameFrameworkIntroScene`（C18）、`FrameTimelineScene`（C19）、`GameLogicScene`（C20）、`CoordinateTransformScene`（C21）、`ProgrammingFlowScene`（C22）、`BitPrecisionScene`（C23）。

## 音声と素材

素材は親プロジェクトの `public/` を参照する。元動画を背景として貼るのではなく、元の図・文字・アニメーションとゲーム素材から描き直す。

C17〜C23の確認用音声は指定MP4からカット単位で回収し、`public/narration/restored_cpu/Cxx.wav` に保存した。既存WAVは後から更新されているため、この復元用音声を分離して使用する。元MP4で既に音量調整された音声なので、復元ソースの該当Audioだけ参照先を変更してvolume=1とした。その他のシーン実装と原稿・時刻は履歴から復元したもの。

回収音声はAACをPCMへ展開したもの。生成直後のWAVと同じバイト列ではないが、当時の声・間・読み上げを再利用できる。原稿を直す場合は該当カットを再生成し、実測尺とシーン内タイミングを合わせ直す。

音声を回収し直す場合は `PART2_ORIGINAL_REUSE_PLAN.json` の元ファイルと、このフォルダのmanifestの時刻を使用する。C17〜C19はstartFrame/30、C20〜C23は(startFrame−1851)/30からdurationFrames/30秒。元ファイルを上書きしない。

## 確認と再生成

親の `video/explainer_prototype` から実行する。

```powershell
node tools/render-restored-cpu.mjs
node tools/render-restored-cpu.mjs --video
```

通常はC18〜C23各1枚の静止画確認、`--video` は旧C18〜C19と旧C20〜C23の確認動画を書き出す。C17は前回動画側のため、動画出力では除外する。出力は `out/part2/restored_cpu/`。

これは旧版を編集する土台。ユーザーの追加修正や新しい第二部への組み込みはまだ行っていない。再エンコードや実行環境による差があるため、元MP4とファイル単位で完全一致するとは扱わない。
