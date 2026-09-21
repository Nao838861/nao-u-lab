# StackChan Avatar

M5StackChan K151（CoreS3）を、Windows/macOS上のPCと家庭内LANで接続する汎用アバター基盤です。
スタックちゃんは顔・首・マイク・スピーカーを担当し、会話、APIキー、キャラクター設定はPC側に置きます。

現段階では次を実装しています。

- K151向けWebSocketカスタムファーム一式
- protobufによる音声・状態・サーボ通信
- Windows/macOS共通のFastAPIサーバ
- APIキー不要のecho会話モード
- OpenAI Responses APIによる短い日本語会話
- OpenAI音声認識と音声合成
- ブラウザからのテキスト会話画面
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

## 1. PCアプリだけを起動する

Python 3.11〜3.13を推奨します。

### Windows PowerShell

```powershell
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -U pip
pip install -e ".[dev,firmware]"
Copy-Item .env.example .env
python -m stackchan_avatar
```

### macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip
pip install -e '.[dev,firmware]'
cp .env.example .env
python -m stackchan_avatar
```

ブラウザで `http://127.0.0.1:8000/` を開きます。初期状態は`echo`診断モードなので、APIキーなしで画面と通信経路を確認できます。
実機では入力内容の代わりに固定文「音声テスト」を使い、返答音声の代わりに短い2音のチャイムを鳴らします。
実際の言葉を聞き取って話すには、次節のOpenAIモードへ切り替えます。

別のターミナルで擬似端末を起動すると、接続台数が1台になります。

```bash
python scripts/mock_stackchan.py
```

mockは音声を再生しませんが、PCから送られた状態、チャイム音声、サーボ命令を表示して完了応答を返します。

## 2. OpenAI会話を有効にする

`.env`を次のように変更します。

```dotenv
STACKCHAN_AVATAR_BRAIN=openai
OPENAI_API_KEY=sk-...
```

モデル名、声、履歴数などは`.env.example`にあります。音声合成された声はAI生成音声であることを、利用者へ明示してください。

## 3. K151用ファームを準備する

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

## 4. ビルドとUSB書き込み

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

書き込み後、PCサーバを起動してK151を再起動します。画面が`Disconnected`から`Idle`になれば接続成功です。画面または頭部タッチで録音が始まり、発話終了後にPC側で音声認識・会話・音声合成を行います。

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
