# FXRacing WebのMesen同梱ライセンス確認

2026-11-07、ユーザーから「専用マッパー入りMESENの添付は規約上問題ないか」と質問を受け、手元の配布物と上流ライセンスを確認した。

## 判断

MesenはGPLv3以降。改造・再配布・商用配布は許されるが、著作権表示・GPL本文の保持、変更と日付の明示、改造版全体へのGPL適用、配布バイナリに対応するソースと必要なビルド手順の提供などが必要。専用マッパーを組み込んだMesenにも適用される。独立したROMを同じZIPに入れることだけでROMまでGPLになるわけではない（第5節aggregate）。

手元の成果物にはGPL本文と改造ソース・手順が同梱されており、同梱そのものを問題とする根拠は見当たらない。完全なライセンス監査の完了や、公開中の配布物の適合を保証する判断ではない。

## 確認した実物

対象は `projects/FxRacingWeb/.sites-checkout/`。

- `release/FxRacing-Mesen-Windows.zip`：15ファイル、ZIP CRC検査正常。
- 同ZIP内に `Mesen-LICENSE.txt` と `FxRacing-Mesen-source.zip` が実在。
- 内包ソースZIPは2396ファイル、CRC検査正常。`Mesen2/Core/NES/MapperFactory.cpp`、専用マッパー `Mesen2/Core/NES/Mappers/Homebrew/NesFx/` の10ファイル、InteropDLLのプロジェクト、UIプロジェクト、Mesen2/LICENSE、BUILD.mdが存在。
- `docs/mesen-build.md` に変更内容・固定revision・DLL再ビルド手順がある。
- Web側にも `web/emulator/NOTICE.txt`、`COPYING-Mesen.txt`、`mesen-source.zip` が実在。Web用ソースZIPは770ファイル、CRC検査正常。ホストとビルド文書を含む。
- ダウンロードマニフェストに内包ソースZIPのSHA256とサイズが記録されている。

## 未確認

公開URLから取得した配布物とローカルZIPの一致、全ソースからのクリーン再ビルド、各バイナリとソースの完全な対応、変更日表示の網羅性、SkiaSharp/HarfBuzzSharp等の依存物のライセンス充足は今回検証していない。公開済みサイトの変更・再公開は行っていない。

## 一次資料

- https://github.com/SourMesen/Mesen2/blob/b9fa69ddc6d0a331fb103fdb5eef6904305703c2/README.md
- https://github.com/SourMesen/Mesen2/blob/master/LICENSE （第4〜6節を確認）

起動索引のDドライブはこの環境では存在せず、対応するCドライブのClaude/CLAUDE.mdとGPT側の共有記事品質directiveを参照した。ローカルSlack directives/broadcastsのpending一致はなかった。Slack投稿は行っていない。
