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
  → OpenAI Responses（必要時だけWeb検索）
  → OpenAI Speech (WAV)
  → PCM再生＋音声振幅に同期した口パク
  → Listening（15秒間のフォローアップ待受）
  → 発話ありなら会話を継続／発話なしならIdle
```

会話は半二重です。発話中の画面タップによるキャンセルと次の音声入力への切り替えには対応しますが、AECを使った同時発話、常時割り込み、長期記憶は対象外です。

Responses APIには`web_search`を`tool_choice=auto`で渡します。最新情報が必要な質問だけ検索し、
検索コンテキストは既定で`low`にして待ち時間と費用を抑えます。音量、カメラ、首操作の
function toolsと同時に利用できます。

音声入力開始後の300msで定常ノイズを推定します。平均絶対振幅について、発話開始はノイズ床の約3倍、発話終了側は約2倍を基準とし、開始650〜2800、終了300〜1400の範囲に制限します。このヒステリシスにより、小さな生活音では無音タイマーを解除せず、近距離の声が戻った時だけ継続発話として扱います。発話検出後は無音2秒で入力を確定します。

通常のタップ開始時は発話開始を6秒待ちます。返答再生の終了直後、または発話中の画面タップで割り込んだ直後は15秒待ち、続けて話す場合の再タップを不要にします。フォローアップで発話を検出した後の区切りは同じく無音2秒です。

## セキュリティ境界

- OpenAI APIキーはPCだけに置く
- サーバは家庭内LANだけで使い、ルーターでポート開放しない
- `.env`と`firmware/include/config.h`はGitへ入れない
- サーボ可動域はファームでも制限する
- 会話履歴はPCメモリ上の直近ターンだけとし、Responses APIは`store=False`で呼ぶ
