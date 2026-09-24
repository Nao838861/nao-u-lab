# StackChan の作業入口

Nao_u がMacで開発・運用していた実機ファームとPCサーバは、同じリポジトリの
`GPT/stackchan-avatar/` にある。通常のGPT作業ブランチにはこのフォルダがないため、
ファイル名検索だけで「存在しない」と判断しない。

## 実装と履歴

- Mac側の開発ブランチ: `origin/codex/stackchan-device-tools`
- Windows移行の基点: `4efaa8f09e`（2026-09-23、接続時音量の適用）
- 最初のMVP: `5b50d459ec`（2026-09-21）
- 対象: M5StackChan K151/CoreS3、Wi-Fi WebSocket/protobuf接続、FastAPI、OpenAI会話・音声。
- 実装内の入口: `README.md`、`docs/FIRMWARE_INSTALL_JA.md`、`docs/WINDOWS_RESIDENT_JA.md`。

## Windows側の配置（2026-09-24）

- 専用worktree: `D:\AI\StackChan`
- アプリ: `D:\AI\StackChan\GPT\stackchan-avatar`
- ブランチ: `codex/stackchan-windows-resident`
- Python: uvで導入した3.13、アプリ内の`.stackchan-venv`。
- タスクスケジューラ: `StackChan Avatar`。ownerログイン15秒後にpythonwで起動。
- 操作画面: `http://127.0.0.1:8000/`、デスクトップの`StackChan`ショートカット。
- 実機向けサーバ: `192.168.0.5:8000`（確認時点のWi-Fi IPv4。将来変わり得る）。
- 停止・再起動・常駐解除: `scripts/windows_resident.ps1 -Action Stop|Restart|Uninstall`。
- 実行ログ: アプリ内`logs/server.log`。ログ、Python環境、秘密情報はGit対象外。

ユーザー指定の移行元は`C:\Users\owner\Downloads\.env`。
実際に置かれていたファイル名は`C:\Users\owner\Downloads\env`で、
これをアプリの`.env`として取り込んだ。値をログ・Gitへ出さず、OpenAIモードでの
実API応答を確認した。ファイルを探し直す時もキー本文は表示しない。

Windows側では常駐起動、設定読込、OpenAI返答、停止・再起動、二重起動防止を確認。
Windows pythonwの統合テストを含む43テストとruffが通過した。
タスクスケジューラのRestartOnFailureだけでは強制終了後に復帰しなかったため、
起動スクリプトに監視処理を追加。異常終了60秒後の自動復帰を実機Windowsで確認した。
通常の終了では再起動せず、異常時の再試行は最大3回に制限する。

その後、ユーザーがDownloadsへ置いた`stackchan.local.json`も取り込み、
`server_host`を`192.168.0.5`に設定して`firmware/include/config.h`を生成した。
USB実機はCOM5（VID 303A / PID 1001）で検出した。

ファームSDK展開時のWindowsLongPathErrorを避けるため、WindowsのPlatformIO coreは
同じドライブ直下の`sc-pio`へ配置する共通関数を導入した。このPCでは`D:\sc-pio`。
音声認識モデルの書き込みは、古い固定パスのesptool.pyではなく、PlatformIOの
`$UPLOADER`を使う。旧ファーム16MBはアプリの`logs/firmware-before-windows.bin`へ
バックアップ済み（Wi-Fi情報などを含み得るためGit対象外）。

## 会話調整の指示（2026-09-24、原文）

> 音声入力時の無音判定が短いので、1.5秒くらいはあった方が良さそう。あと、フィラーがすごくパターン化されている印象があるので、「えーと」とか「うーん」みたいなのを繰り返して印象が悪い。バリエーションを増やしてこの印象を改善してほしい。サーバ側だからテキスト判定で分岐するだけなので大量に作っても問題ないよね？テキスト判定も制度と内容を上げて、自然につながるように工夫してほしい。

- 無音判定は`firmware/include/listening.hpp`の`kSilenceDurationMs`を1500へ変更。
- フィラーの正本は`stackchan_avatar/fillers.py`。28分類・168候補をローカル判定し、
  直近16文を参照して同文・似た出だしの反復を抑える。挨拶・お礼・停止・緊急要求では省く。
- 「今日は疲れた」「写真の撮り方」「首が痛い」「不安定な接続」など、単語一致の誤分類を
  含むテストを追加。追加LLM呼び出しはしないが、相づちの音声合成APIは従来どおり必要。
- 本回答生成は相づちと並行。相づち中の切断・中断で回答タスクを取り残さない。
- USB CDCログをPCが読んでいない時、100ms/文字の待ちが会話や再接続を止める現象を実測。
  `Serial.setTxTimeoutMs(1)`で待ちを制限した。0msはArduino ESP32 3.3.6のHWCDC再試行
  カウンタをunderflowさせるため使用しない。
- サーバの全112テストとruffが通過。

## 最終書き込みの残件

Windows常駐実装は`9a41a8f957`、モデル書き込み修正は`c78a7c9407`、会話調整は
`97e62927cb`。すべて`origin/codex/stackchan-windows-resident`へpush済み。

1.5秒版（0.2.10）は一度書き込んだが、その時点のUSB待ち設定0msにSDK側の問題が
見つかったため、1msへ修正してビルドし直した。最終再書き込みではCOM5が消失して
失敗したため、ユーザーへUSBの再接続を依頼している。**1ms版の実機反映と音声再生の
完了確認は未完了**。接続台数1を確認したのは最初の0.2.9版であり、現行版で確認済みと
読み替えない。0.2.9での音声送信はUSBログ待ちによりタイムアウトした。

再接続したらアプリのフォルダで次を実行する。

```powershell
.stackchan-venv\Scripts\python.exe -X utf8 scripts\firmware.py upload --port COM5
```

ポート番号は再検出すること。書き込み後はシリアルモニタを閉じたまま実機接続と
`/api/chat`の`speak: true`が完了するかを確認し、この残件節を実際の結果へ更新する。

Windowsファイアウォールには、このPython 3.13のpythonwについてPublicネットワークの
受信許可が存在することを確認した。狭いLAN専用ルールを追加・再設定する場合は、
管理者PowerShell用の`scripts/windows_firewall.ps1`を使う。
