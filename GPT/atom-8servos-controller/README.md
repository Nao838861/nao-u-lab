# ATOM + 8Servos HAT 安全動作テスト

ATOM Lite／MatrixとAtomHat、8Servos HATを使い、CH1とCH2へ接続した360度連続回転サーボを低速で短時間だけ動かすテストファームです。

## 安全動作

- 旧型HAT（I2C `0x38`）とv1.1（`0x36`）を自動検出
- 起動時にCH1／CH2へ停止パルス`1500µs`を設定
- v1.1は停止パルス設定後にサーボ電源を有効化
- 起動時は停止したまま待機し、自動では回転しない
- シリアル入力の`t`を受けると3秒待ってから、両サーボを逆方向へ低速で1.2秒回転
- 1.8秒停止後、逆向きへ1.2秒回転
- テスト完了後は停止命令を定期的に再送
- `s`で即時停止

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
