# アーキテクチャ

## 責務分離

ファームは「身体」に限定します。

- マイクから16 kHz / 16-bit / mono PCMを取得
- スピーカーへPCMを再生
- 顔と状態表示
- サーボとLEDの安全な制御
- PCへのWebSocket再接続
- 通信断時のIdle復帰

PCは交換可能な「頭脳」です。

- 音声認識
- 会話履歴と人格
- LLM呼び出し
- 音声合成
- アプリ固有のルール
- 将来のツール呼び出し

この分離により、キャラクターやゲームを変更してもファームの再書き込みは不要です。

## 通信

スタックちゃんがWebSocketクライアントとなり、PCの
`ws://<PCのLAN IP>:8000/ws/stackchan`へ接続します。1 WebSocket binary frameに1 protobuf messageを格納します。

主なメッセージは次の通りです。

- `FirmwareMetadata` / `ServerMetadata`: 接続時の能力交換
- `AudioPcmStart/Data/End`: K151からPCへの録音
- `AudioWavStart/Data/End`: PCからK151への再生PCM
- `StateCommand/Event`: Idle、Listening、Thinking、Speaking
- `WakeWordEvent`: タッチまたはウェイクワード
- `ServoCommandSequence/Done`: 首動作

プロトコル正本は `protobuf/websocket-message.proto` です。

音量変更は`VolumeCommand`/`VolumeEvent`で要求と適用結果を対応付けます。カメラ静止画は
`CameraImageStart`、4KB単位の`CameraImageData`、`CameraImageEnd`に分割して転送します。
PC側は512KBを受信上限とし、要求時にだけ撮影します。撮影画像は本体にも描画し、会話時は写真への発話が終わるまで保持します。

## 最小会話フロー

```text
タッチ
  → WakeWordEvent
  → Listening
  → PCM送信
  → OpenAI Transcriptions
  → OpenAI Responses
  → OpenAI Speech (WAV)
  → PCM再生
  → Idle
```

初版は半二重です。再生中の割り込み、AEC、カメラ、長期記憶は対象外です。

## セキュリティ境界

- OpenAI APIキーはPCだけに置く
- サーバは家庭内LANだけで使い、ルーターでポート開放しない
- `.env`と`firmware/include/config.h`はGitへ入れない
- サーボ可動域はファームでも制限する
- 会話履歴はPCメモリ上の直近ターンだけとし、Responses APIは`store=False`で呼ぶ
