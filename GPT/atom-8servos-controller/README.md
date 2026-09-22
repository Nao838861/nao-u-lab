# ATOM + 8Servos HAT ボタン操作ファーム

ATOM Lite／MatrixとAtomHat、8Servos HATを使い、本体ボタンでCH1とCH2の360度連続回転サーボを5秒間動かすファームです。

## 操作と表示

- 緑: 停止・待機中
- 青: 2台のサーボが低速で回転中
- 赤: 手動停止、またはHATとの通信エラー
- 待機中にATOM本体の中央ボタンを押すと、LEDが青くなるのとほぼ同時にCH1／CH2が逆方向へ回り始める
- 5秒後に自動停止して緑へ戻る
- 回転中にもう一度ボタンを押すと即時停止し、赤を0.5秒表示して緑へ戻る
- ボタンを押し続けても繰り返し起動せず、いったん離してから次の押下を受け付ける

## 安全動作

- 旧型HAT（I2C `0x38`）とv1.1（`0x36`）を自動検出
- 起動時にCH1／CH2へ停止パルス`1500µs`を設定
- v1.1は停止パルス設定後にサーボ電源を有効化
- 起動時は停止したまま待機し、自動では回転しない
- 待機中は停止命令を定期的に再送
- シリアル入力の`t`でもボタンと同じ5秒動作を開始でき、`s`で即時停止できる

停止点には個体差があります。`1500µs`でゆっくり動き続ける場合は、`kStopPulseUs`を少しずつ調整してください。

## 配線と電源

CH1／CH2の端子へ、茶／黒をGND、赤を電源、橙／黄／白を信号として接続します。8Servos HATの対応電池を正しい向きで装着し、物に当たらず空転できる状態で電源スイッチを入れてください。

## ビルドと書き込み

```bash
cd /Users/Nao_u/nao-u-lab/GPT/atom-8servos-controller
../stackchan-avatar/.stackchan-venv/bin/pio run
../stackchan-avatar/.stackchan-venv/bin/pio run -t upload --upload-port /dev/cu.usbserial-55D245556E
../stackchan-avatar/.stackchan-venv/bin/pio device monitor --port /dev/cu.usbserial-55D245556E --baud 115200
```
