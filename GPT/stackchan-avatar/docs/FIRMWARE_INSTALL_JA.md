# M5StackChan K151 カスタムファーム導入

## 注意

この操作は購入時のM5Stack製ファームをカスタムファームへ置き換えます。出荷時ファームへはM5Burnerで戻せますが、本体設定や導入済みアプリは消える場合があります。

作業前に次を行ってください。

1. サーボのホーム位置や音量設定を写真に残す
2. 十分に充電するかUSB給電する
3. 首の周囲から物を除く
4. 電源が入って抵抗がある状態で首を無理に回さない

このカスタムファームは公式StackChan BSPの保存済みサーボ校正値と可動域制限を利用します。

## 必要なもの

- M5StackChan K151（CoreS3搭載）
- データ通信対応USB-Cケーブル
- Windows 11またはmacOS
- Python 3.11〜3.13
- 2.4 GHz Wi-Fi
- PlatformIO（`pip install -e '.[firmware]'`で導入）

## 手順

### 推奨: GUIで導入

Windowsでは`Start StackChan.bat`、macOSでは`Start StackChan.command`をダブルクリックします。
ブラウザに表示される1〜4の順番で設定し、「本体へ書き込む」を押してください。通常は以下のコマンド操作は不要です。

### コマンドで導入する場合

#### 1. PCサーバを先に確認

READMEの手順でechoモードのPCサーバとmock StackChanを動かします。ブラウザに接続台数1台が出てから実機へ進みます。

#### 2. PCのLAN IPを固定

```bash
python scripts/find_pc_ip.py
```

表示値をルーターのDHCP予約へ登録します。VPNを使っている場合は家庭内LAN側のアドレスを選びます。

#### 3. ファーム設定を生成

```bash
python scripts/configure_firmware.py --ssid "SSID" --password "PASSWORD" --server-host "192.168.1.20"
```

生成される`firmware/include/config.h`にはWi-Fiパスワードが含まれるため、Git管理対象外です。

#### 4. ビルド

```bash
python scripts/firmware.py build
```

初回はESP32ツールチェーンとライブラリを取得するため時間がかかります。ビルド対象は`m5stack-official-stackchan`です。

#### 5. 書き込み

K151のベース側USB-C端子とPCを接続して実行します。

```bash
python scripts/firmware.py upload
```

自動検出できない場合は`--port`を指定します。ポート自体が現れない場合は、別のUSBケーブルを試し、必要に応じてRSTボタンを約3秒押してダウンロードモードへ入れます。

#### 6. ログ確認

```bash
python scripts/firmware.py monitor
```

PC側では別ターミナルで次を起動します。

```bash
python -m stackchan_avatar
```

K151画面が`Idle`になり、`http://127.0.0.1:8000/api/status`の`connected_devices`が1なら成功です。
初期のecho診断モードでは、話しかけると入力内容にかかわらず固定文を処理し、短い2音のチャイムが鳴ります。これでマイクからPCへの送信、PCからスピーカーへの返信、サーボ指令をAPIキーなしで確認できます。
自然な会話音声を試す場合は、READMEに従って`.env`をOpenAIモードへ変更してください。

## Windows固有の確認

- Windows Defender Firewallの確認では、Pythonをプライベートネットワークだけ許可する
- ポートは通常`COM3`、`COM4`など
- 公衆ネットワーク側への8000番ポート許可は行わない

## macOS固有の確認

- USBアクセサリ接続の確認ダイアログを許可する
- ポートは通常`/dev/cu.usbmodem...`
- ファイアウォール確認ではPythonの着信接続を許可する

## 出荷時ファームへ戻す

1. M5BurnerをM5Stack公式サイトから取得
2. `StackChan`を検索
3. `Only Official`を有効にする
4. 公式ファームをDownload
5. K151をUSB接続し、対象ポートを選択
6. `Burn`を実行

復元後は、公式モバイルアプリでWi-Fi、AI Agent、サーボなどを再設定します。
