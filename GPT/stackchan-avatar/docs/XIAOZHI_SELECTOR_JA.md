# XiaoZhi 接続先 Selector

工場出荷ファームの AI Agent が参照する `wifi/ota_url` を Selector に向け、会話バックエンドを切り替えるための小さな中継サービスです。工場出荷ファーム、StackChan World の紐付け、サーボ校正値には手を加えません。

## 動作モード

- `Auto`: Home を優先し、接続不能、タイムアウト、HTTP 5xx の場合だけ公式へ退避する
- `Home`: Home だけを使用し、障害時も公式へ送らない
- `Official`: 公式だけを使用する

HTTP 4xx は端末認証や設定の問題である可能性が高いため、`Auto`でも公式へ退避せず、その応答を端末へ返します。

切替と退避は、端末が会話を開始する際のOTA問い合わせに対して働きます。すでに確立したWebSocket会話を途中で別サーバへ継ぎ替えるものではありません。モード変更後は、現在の会話を終了して次の会話から反映させます。

## 起動

通常の StackChan Avatar 開発環境をインストールした後、次の環境変数を設定します。

```bash
export STACKCHAN_SELECTOR_HOME_OTA_URL="http://192.168.1.20:12800/xiaozhi/ota/"
export STACKCHAN_SELECTOR_OFFICIAL_OTA_URL="https://api.tenclass.net/xiaozhi/ota/"
export STACKCHAN_SELECTOR_DEFAULT_MODE="auto"
stackchan-selector
```

標準では `0.0.0.0:8765` で待ち受けます。同じPCのブラウザで `http://127.0.0.1:8765/` を開くと、モードを切り替えられます。外部端末からのモード変更は拒否します。

StackChan の NVS に設定する値は次です。

```text
wifi/ota_url = http://<Selectorを動かす機器のLANアドレス>:8765/xiaozhi/ota/
```

既存NVSを丸ごと置き換えると、Wi-Fi、StackChan Worldの紐付け、校正値などを失う可能性があります。必ず全フラッシュとNVSをバックアップし、既存NVSへ `wifi/ota_url` の1項目だけを追加してください。

## 障害時の注意

SelectorとHome Agentを同じPCで動かすと、PC自体が停止した場合は公式へ退避できません。自動退避を成立させるには、SelectorをRaspberry Pi、NAS、Home Assistant機、ルーターなどの常時稼働機へ置きます。

Selectorは端末から受け取った認証ヘッダーと本文を選択先へ転送します。アクセスログへ `Authorization`、端末トークン、リクエスト本文を記録しないでください。公式接続の利用条件も事前に確認してください。

## 現在の範囲

このSelectorはOTA接続先の選択だけを担当します。Home側には別途、XiaoZhi WebSocketプロトコル（Opus音声、STT/TTSイベント、MCP）を実装したサーバが必要です。既存実装として `stackchan-ai-server` や `xiaozhi-esp32-server` を利用するか、現在の `stackchan-avatar` へ互換アダプターを追加します。
