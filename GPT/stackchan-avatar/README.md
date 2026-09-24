# StackChan Avatar

M5StackChan K151（CoreS3）を、Windows/macOS上のPCと家庭内LANで接続する汎用アバター基盤です。
スタックちゃんは顔・首・マイク・スピーカーを担当し、会話、APIキー、キャラクター設定はPC側に置きます。

現段階では次を実装しています。

- K151向けWebSocketカスタムファーム一式
- protobufによる音声・状態・サーボ通信
- Windows/macOS共通のFastAPIサーバ
- APIキー不要のecho会話モード
- OpenAI Responses APIによる短い日本語会話
- 必要な質問だけ自動実行するOpenAI Web検索（最新情報・ニュース・天気・価格・日程）
- OpenAI音声認識と音声合成
- 周囲の定常音へ自動追従する音声区間判定（発話後の無音1.5秒で確定）
- 返答生成が長引く時だけ、質問に合った短いフィラーを先に発話
- OpenAI SpeechのPCMストリーミング再生
- 返答終了後15秒間のフォローアップ音声待受（続けて話す時は再タップ不要）
- 公式に近い状態色（音声待受は緑、発話中は青）
- 公式StackChan向けビルドでは工場ファームに近い24 kHz・MCLKあり・ステレオI2S出力
- 再生音声の強弱に合わせた口パクアニメーション（消音時は停止）
- 会話またはGUIからの安全な音量変更（0〜230）
- PCサーバ接続時に安全上限230を自動適用（設定で変更可能）
- 会話からの安全な首操作（うなずき、首振り、上下左右、正面、ダンス）
- 要求時だけ撮影するカメラ静止画とOpenAI画像認識
- ブラウザの初期設定・ファーム書き込み・会話画面
- Windows/macOS用のダブルクリック起動ランチャー
- 実機なしで接続確認するmock StackChan
- Wi-Fi設定生成、ビルド、USB書き込み用Pythonコマンド

実機K151での最終確認は未実施です。最初は必ず机上で、首の周囲に物を置かずに試してください。

## 構成

```text
M5StackChan K151
  └─ Wi-Fi WebSocket / protobuf / PCM
       └─ PC: stackchan-avatar
            ├─ ブラウザ操作画面
            ├─ OpenAI Responses API
            ├─ OpenAI Transcriptions
            └─ OpenAI Speech
```

APIキーはPCの`.env`だけに保存します。ファームへは書き込みません。
Wi-Fi情報はPCの`stackchan.local.json`から読み込めます。このファイルもGitの対象外です。

## いちばん簡単な起動方法

Python 3.11〜3.13を一度インストールした後は、コンソールへのコマンド入力は不要です。

### Windows

`Start StackChan.bat`をダブルクリックします。
初回だけ必要な部品を自動インストールし、その後ブラウザで設定画面が開きます。

Windowsログイン時から常駐させる場合は
[Windows常駐手順](docs/WINDOWS_RESIDENT_JA.md)に従って登録します。
デスクトップのショートカットから操作画面を開け、ブラウザを閉じても動き続けます。

### macOS

`Start StackChan.command`をダブルクリックします。
初回にmacOSが確認を出した場合は、右クリックして「開く」を選びます。

設定画面では次の操作を上から順に行えます。

1. 診断モードまたはOpenAI会話を選ぶ
2. 2.4 GHz Wi-Fi名、パスワード、PCのLANアドレスを入力して保存
3. USBポートを選び、「先にビルド」または「本体へ書き込む（必要時のみ）」を押す
4. 書き込み後に本体を再起動し、接続表示を確認する

APIキーとWi-Fiパスワードは画面へ再表示しません。2回目以降は空欄のまま既存設定を保持できます。
`stackchan.local.json`がある場合は、起動時にSSIDとPCのLANアドレスを自動入力し、パスワードは画面に出さず内部で補完します。
初期状態は`echo`診断モードなので、APIキーなしで画面と通信経路を確認できます。
実機では入力内容の代わりに固定文「音声テスト」を使い、返答音声の代わりに短い2音のチャイムを鳴らします。
実際の言葉を聞き取って話すには、次節のOpenAIモードへ切り替えます。

## 音量とカメラ

この機能を含むファームを一度書き込むと、設定画面の「4. 本体機能」から手動確認できます。

- 音量スライダー：0〜230の範囲で本体スピーカーの音量を変更
- 「静止画を1枚撮る」：確認後に正面カメラで1枚だけ撮影し、画面へ表示
- 「音量を120にして」：会話から音量ツールを実行
- 「右を向いて」「2回うなずいて」「首で踊って」：安全範囲の定型首動作を実行
- 「目の前に何がある？」：会話から撮影し、画像をOpenAIへ送って回答

撮影時は本体画面に赤い`CAMERA`表示を出します。常時撮影・動画配信・自動保存は行いません。
撮った写真は本体画面にも表示され、会話から撮影した場合は写真へのコメントが終わると顔へ戻ります。GUIから単独撮影した場合は5秒間表示します。通信異常時も60秒で自動的に顔へ戻ります。
画像は質問への回答用にOpenAI APIへ送信されるため、人物や私物が写る場所では利用者へ知らせてください。
この機能を初めて追加するときだけファームの再書き込みが必要です。その後の音量変更や撮影には再書き込みは不要です。

`m5stack-official-stackchan`環境では、スピーカー出力を工場ファームに近い24 kHz、MCLK GPIO0、I2S0、左右両スロットへ設定します。M5UnifiedのAW88298保護処理と基板別の増幅率は維持し、アンプ電圧やブースト設定は変更しません。起動ログの`Factory audio profile`で適用を確認できます。音割れを避けるため、音量上限は引き続き230です。

本体がPCサーバへ接続すると、サーバから初期音量230を自動適用します。ファームの再書き込みは
不要です。小さくしたい場合は`.env`の`STACKCHAN_AVATAR_INITIAL_VOLUME`を0〜230で変更し、
PC側アプリを再起動してください。

別のターミナルで擬似端末を起動すると、接続台数が1台になります。

```bash
python scripts/mock_stackchan.py
```

mockは音声を再生しませんが、PCから送られた状態、チャイム音声、サーボ命令を表示して完了応答を返します。

## OpenAI会話を有効にする

設定画面で「OpenAI会話」を選び、APIキーを入力して「設定を保存」します。
アプリを閉じ、ランチャーをもう一度ダブルクリックすると反映されます。

モデル名、声、履歴数などは`.env.example`にあります。音声合成された声はAI生成音声であることを、利用者へ明示してください。

OpenAI会話ではWeb検索が既定で有効です。「今日のニュース」「いまの天気」など、
最新情報が必要な質問だけモデルが検索を選びます。通常の雑談では検索しません。
検索範囲は既定で`low`にして、待ち時間とAPI費用を抑えています。

返答が0.45秒以内に生成されない時だけ、質問に合った短い相づちを先に話します。
天気・ニュース・比較・手順・理由・気持ちの共有・追加質問などをローカルで判定し、
同じ文や似た出だしの連続を避けて選びます。「今日は疲れた」を検索扱いにしたり、
「写真の撮り方」をカメラ操作として受け取ったりしないよう、依頼の表現を優先します。
挨拶・お礼・停止要求・緊急の呼びかけには相づちを追加しません。
選択用の追加LLM呼び出しはありませんが、発声時の音声合成APIは使います。
相づちを話している間も回答生成は継続します。

```dotenv
STACKCHAN_AVATAR_WEB_SEARCH_ENABLED=true
STACKCHAN_AVATAR_WEB_SEARCH_CONTEXT_SIZE=low
STACKCHAN_AVATAR_FILLER_ENABLED=true
STACKCHAN_AVATAR_FILLER_DELAY_SECONDS=0.45
```

検索を完全に止める場合は`STACKCHAN_AVATAR_WEB_SEARCH_ENABLED=false`にします。
より詳しい検索結果が必要な場合は`medium`または`high`へ変更できます。
設定変更後はPC側アプリを再起動してください。ファームの再書き込みは不要です。

現在のK151ファームは半二重音声です。返答中の画面タップによる割り込みには対応しますが、
マイク入力と音声出力を常時同時に扱うGPT-Live全二重モードは未実装です。

## ローカル設定ファイル

`stackchan.local.example.json`を`stackchan.local.json`という名前でコピーし、自宅の設定を記入できます。
`server_host`を空にすると、このPCのLANアドレスを起動時に自動検出します。

```json
{
  "wifi_ssid": "HOME_WIFI_2G",
  "wifi_password": "replace-me",
  "server_host": ""
}
```

`stackchan.local.json`、`.env`、生成される`firmware/include/config.h`はすべてGitの対象外です。
GitHubへ置くのは値を含まないサンプルだけです。

## コマンド操作（開発者向け）

通常利用では不要です。自動起動で問題が起きたときや開発時だけ使用します。

```bash
python3.13 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev,firmware]'
python -m stackchan_avatar
```

### K151用ファームを準備する

PCのLANアドレスを調べます。

```bash
python scripts/find_pc_ip.py
```

表示されたIP、家庭の2.4 GHz Wi-Fi情報を使い、コミット対象外の`firmware/include/config.h`を生成します。

```bash
python scripts/configure_firmware.py \
  --ssid "YOUR_WIFI" \
  --password "YOUR_PASSWORD" \
  --server-host "192.168.1.20"
```

PowerShellでは1行で実行するか、行末の継続記号にバッククォートを使ってください。

```powershell
python scripts/configure_firmware.py --ssid "YOUR_WIFI" --password "YOUR_PASSWORD" --server-host "192.168.1.20"
```

PCのIPはルーターのDHCP予約で固定することを推奨します。

### ビルドとUSB書き込み

K151をデータ通信対応USB-Cケーブルで接続します。首が回ってケーブルを巻き込まないよう、ベース側USB-C端子を使います。

```bash
python scripts/firmware.py build
python scripts/firmware.py upload
python scripts/firmware.py monitor
```

複数のシリアル機器がある場合はポートを指定します。

```powershell
python scripts/firmware.py upload --port COM4
python scripts/firmware.py monitor --port COM4
```

```bash
python scripts/firmware.py upload --port /dev/cu.usbmodem1101
python scripts/firmware.py monitor --port /dev/cu.usbmodem1101
```

書き込み後、PCサーバを起動してK151を再起動します。画面が`Disconnected`から`Idle`になれば接続成功です。画面または頭部タッチで録音が始まり、発話終了後にPC側で音声認識・会話・音声合成を行います。スタックちゃんが話している途中で画面をタップすると、その発話を中止して次の音声入力へ切り替わります。

より詳しい手順と復旧方法は [docs/FIRMWARE_INSTALL_JA.md](docs/FIRMWARE_INSTALL_JA.md) を参照してください。

## 開発確認

```bash
pytest
ruff check stackchan_avatar stackchan_server scripts tests
```

## 由来とライセンス

ファーム、protobuf契約、WebSocketサーバの中核はMITライセンスの
[74th/websocket-control-stackchan](https://github.com/74th/websocket-control-stackchan)
を基にしています。詳細は [NOTICE.md](NOTICE.md) を参照してください。
