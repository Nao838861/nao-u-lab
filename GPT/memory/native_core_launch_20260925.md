# 自作NESコアのローカル起動確認（2026-09-25）

ユーザーの依頼で、Mesenを使用しない自作版を起動した。

- 対象: FamiBASIC_Turbo の `codex/native-nes-core`、commit `cbe18395226319ed9040f56881264995d34cc3c3`。
- 作業場所: `C:\AI\FamiBASIC_Turbo_native`。mainと別のdetached worktree。
- LLVM-MinGW 20260922を当該worktreeの `.tmp/` に展開し、C++20・O3・静的ランタイムで `build/native_nes/Release/fbt_nes.dll` を生成。
- 既存Python環境: `D:\Homebrew\FamiBASIC_Turbo\.tmp\venv`。
- `tests.test_native_host.NativeHostTests` の1試験が成功。実ROMの画面、入力、停止・フレーム送り、セーブ排他、終了を確認。
- `.tmp/StartNativeIDE.cmd` で再起動可能。自作バックエンドを明示し、専用user_dataでデモを自動実行する。Mesen指定先は意図的に存在しないパス。
- 起動後、ネイティブホストから256×240のフレーム受信を確認。ウィンドウ名は `FamiBASIC Turbo - Native NES (Mesen-free)`。

9月20日の自作コア版であり、9月25日のmainの全機能を統合した版ではない。Mesen同等の精度認定ではない。今回、ソース変更やmainへの統合は行っていない。

## IDEから開くシューティング例

同ブランチの FLIGHT LAB v004（中型敵と護衛）から、C:\AI\FamiBASIC_Turbo_native\.tmp\flight_lab_medium.project.json を生成し、BuildServiceでROM生成成功を確認。IDEの「開く」からこのJSONを選びRUNする。最新全部入り版とは異なる旧サンプル。
