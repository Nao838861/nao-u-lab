# M5StickC + 8Servos HAT 全チャンネル動作テスト

M5StickC／M5StickC Plusへ8Servos HATを直接接続し、ボタンAでCH1～CH8を5秒間低速回転させるテストファームです。

## 操作

- 緑画面 `READY`: 全サーボ停止・待機中
- 青画面 `RUNNING`: CH1～CH8を5秒間回転中
- 赤画面 `STOPPED`: 回転中のボタンA再押下による緊急停止
- 赤画面 `ERROR`: 8Servos HATを検出できない、または通信エラー
- シリアルの`t`でも開始、`s`で即時停止

起動時は必ず全チャンネルへ停止パルス`1500us`を送り、自動では回転しません。旧型HAT（I2C `0x38`）とv1.1（`0x36`）を自動検出します。

## 電源

充電済みの対応16340／18350電池をHATへ正しい向きで装着してください。最初はサーボを無負荷にし、物や指に当たらない状態で試します。

## ビルドと書き込み

```bash
cd /Users/Nao_u/nao-u-lab/GPT/m5stickc-8servos-controller
../stackchan-avatar/.stackchan-venv/bin/pio run
../stackchan-avatar/.stackchan-venv/bin/pio run -t upload --upload-port /dev/cu.usbserial-XXXXXXXX
```
