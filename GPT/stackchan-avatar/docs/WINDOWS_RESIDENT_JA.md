# Windowsでの常駐

`scripts/windows_resident.ps1 -Action Install`で、現在のWindowsユーザーのログイン時に起動する
タスク`StackChan Avatar`と、デスクトップの`StackChan`ショートカットを登録する。
管理者権限やWindowsパスワードの保存は不要。ログインから15秒後に起動する。

初回は`Start StackChan.bat`でPython環境と依存を用意する。対応するPythonがない場合は、
既存のuvで次のようにも準備できる。

```powershell
uv python install 3.13
uv venv --python 3.13 .stackchan-venv
uv pip install --python .stackchan-venv\Scripts\python.exe -e ".[firmware]"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows_resident.ps1 -Action Install
```

常駐中はコンソールもブラウザも自動表示しない。デスクトップの`StackChan`で操作画面を開く。
ブラウザを閉じてもサーバは動き続ける。通知領域のアイコンは使用しない。
ポート単位のWindowsミューテックスで二重起動を防ぎ、監視プロセスが異常終了を検出すると
1分後に最大3回再起動する。タスクスケジューラは監視プロセスの自動起動を担当する。
正常な終了操作では再起動せず、次のログインまたは手動起動を待つ。
ログは`logs/server.log`（2 MB × 最大4ファイル）へ保存する。
再起動履歴は`logs/supervisor.log`（0.5 MB × 最大2ファイル）へ保存する。

## 操作

アプリのフォルダで実行する。

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows_resident.ps1 -Action Open
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows_resident.ps1 -Action Status
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows_resident.ps1 -Action Restart
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows_resident.ps1 -Action Stop
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows_resident.ps1 -Action Uninstall
```

`Uninstall`は常駐サーバを止め、自動起動タスクとこのインストールのショートカットだけを外す。
アプリ本体と設定ファイルは残す。ブラウザ内の終了ボタンでも停止できる。
設定保存後のAPIキー・会話モード変更は`Restart`で反映する。
スリープ中とログアウト中は会話できない。アプリのフォルダを移動した場合はタスクの再登録が必要。

## Macなどからの移行

既存の`.env`と`stackchan.local.json`はGit管理外なので、自動では同期されない。
移行元からこのフォルダへコピーするか、操作画面で入力する。APIキーをGitに入れない。
設定がない場合は`echo`診断モードで起動する。これは本物の音声会話ではなくチャイムの通信診断。

実機ファームの接続先が以前のPCのIPのままなら、新しいWindows PCのLAN IPv4アドレスへ
更新する必要がある。操作画面のWi-Fi設定で新しいIPを指定し、USB接続してファームを書き込む。
既存PCと同じIPをWindowsへ勝手に割り当てると衝突するため行わない。

Windowsのファームビルド用SDKは、パス長制限を避けるためアプリと同じドライブの
`sc-pio`（例: `D:\sc-pio`）へ保存する。`PLATFORMIO_CORE_DIR`環境変数が指定されている時は
その値を優先する。macOSは従来どおりアプリ内の`.platformio-core`を使う。

## Windowsファイアウォール

実機から接続できない場合は、管理者PowerShellで次を実行する。

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows_firewall.ps1
```

受信許可は現在のLANインターフェース、現在のPCのIP、同一サブネット、サーバのTCPポート、
専用Pythonの実体に限定する。家庭内Wi-Fiが「パブリック」分類でも使える。
IPやPythonの実体が変わった時は`-Remove`でこの規則だけを外して再登録する。
常駐解除時にこの規則も不要なら、管理者PowerShellから同じスクリプトを`-Remove`付きで実行する。
