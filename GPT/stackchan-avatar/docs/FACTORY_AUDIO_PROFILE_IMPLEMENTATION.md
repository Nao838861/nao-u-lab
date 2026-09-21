# StackChan 工場ファーム寄せ音声出力 実装指示書

## 目的

公式 StackChan K151 の工場ファームより、現在のカスタムファームは最大音量付近でも小さく、255付近では音量向上より先に音割れが目立つ。単純にソフトウェア音量上限を230から255へ広げるのではなく、公式ファームに近いI2S出力条件へ合わせ、同じ音量設定での聞こえ方と音質を改善できるか実機で比較する。

この変更は、`m5stack-official-stackchan`環境だけに適用する。他のCoreS3／Atom系環境の音声設定は変えない。

## 調査結果と方針

M5Stack公式のStackChanファームは、AW88298へのスピーカー出力に次の条件を使っている。

- 出力サンプルレート: 24 kHz
- I2Sポート: I2S0
- MCLK: GPIO0
- BCLK: GPIO34
- WS: GPIO33
- DOUT: GPIO13
- 16 bit
- stereo slot mode、左右両スロットを使用
- MCLK multiple: 256
- AW88298: PA電圧5.0 V、DAC電圧3.3 V、PA gain 1

一方、現在のM5UnifiedのStackChan設定は、主に48 kHz、I2S1、MCLKなし、monoで動作する。BCLK／WS／DOUTのピンは公式と一致している。またM5Unified側は、StackChan用の基板別`magnification`とAW88298の保護・有効化コールバックを持っている。

今回は安全性と差分の小ささを優先し、M5UnifiedのAW88298制御は維持したまま、I2Sバス条件だけを公式へ近づける。

- 24 kHz
- I2S0
- MCLK GPIO0
- stereo有効（mono素材を左右両スロットへ送る）

アンプ電圧、レジスタ、ブースト設定は変更しない。公式EspressifドライバでもAW88298のレジスタ`0x61`は`0x0673`で、ブーストは無効になっている。根拠なくブーストを有効化すると、歪み、発熱、スピーカー破損の危険がある。

参照元:

- M5Stack StackChan公式実装: https://github.com/m5stack/StackChan/blob/main/firmware/main/hal/board/cores3_audio_codec.cc
- Espressif AW88298ドライバ: https://github.com/espressif/esp-adf/blob/master/components/esp_codec_dev/device/aw88298/aw88298.c

## 実装内容

### 1. 公式StackChan環境だけにビルドフラグを追加

`platformio.ini`の`[env:m5stack-official-stackchan]`に、次を追加する。

```ini
build_flags =
    ${m5stack-cores3.build_flags}
    ${m5unified.build_flags}
    ${build-target.build_flags}
    -DUSE_STACKCHAN_BSP=1
    -DSTACKCHAN_FACTORY_AUDIO_PROFILE=1
```

ファームウェアのバージョン番号は、作業時点の最新値を維持する。並行作業中のバージョン変更を巻き戻さない。

### 2. M5初期化後にスピーカー設定を上書き

`firmware/src/main.cpp`の無名namespace内へ、次の関数を追加する。

```cpp
#if defined(STACKCHAN_FACTORY_AUDIO_PROFILE)
void configureFactoryAudioProfile()
{
  // Factory StackChan drives the AW88298 at 24 kHz over I2S0, supplies MCLK
  // on GPIO0, and sends both I2S slots. Keep M5Unified's board-specific
  // magnification and AW88298 protection/enable callback, but align the bus.
  auto speaker_cfg = M5.Speaker.config();
  speaker_cfg.sample_rate = 24000;
  speaker_cfg.stereo = true;
  speaker_cfg.pin_mck = GPIO_NUM_0;
  speaker_cfg.i2s_port = I2S_NUM_0;
  M5.Speaker.config(speaker_cfg);

  log_i(
      "Factory audio profile: rate=%lu stereo=%u mclk=%d i2s=%d magnification=%u",
      static_cast<unsigned long>(speaker_cfg.sample_rate),
      static_cast<unsigned>(speaker_cfg.stereo),
      static_cast<int>(speaker_cfg.pin_mck),
      static_cast<int>(speaker_cfg.i2s_port),
      static_cast<unsigned>(speaker_cfg.magnification));
}
#endif
```

`setup()`内では、`M5StackChan.begin()`または`M5.begin(cfg)`が完了した直後、マイク設定を取得する前に呼ぶ。

```cpp
#if defined(STACKCHAN_FACTORY_AUDIO_PROFILE)
  configureFactoryAudioProfile();
#endif

  auto mic_cfg = M5.Mic.config();
```

スピーカーとマイクがI2S0を共有する点には注意する。現在の実装は、発話開始時に`M5.Mic.end()`し、発話終了後にスピーカーを停止してからマイク待受を再開する半二重動作なので、この構成と両立する。将来、録音と再生を同時化する場合は再検討が必要。

### 3. READMEへ挙動を記録

`README.md`へ、公式StackChan向け環境だけが24 kHz・MCLK GPIO0・I2S0・左右両スロットになることを追記する。

次の点も明記する。

- M5UnifiedのAW88298保護処理と基板別増幅率は維持する
- アンプ電圧やブースト設定は変更しない
- 起動ログ`Factory audio profile`で適用を確認できる
- 音割れを避けるため、音量上限230は今回変更しない

## 変更しないもの

- 音量上限230
- 会話からの音量ツールの範囲
- Web UIの音量スライダー範囲
- AW88298のブースト／電圧／保護レジスタ
- generic CoreS3、AtomS3R、Atom EchoS3Rの音声設定
- マイク入力サンプルレート16 kHz

230から255への増加は、M5Unified内部の音量カーブ上では約1.8 dB程度に留まり、すでに音割れが始まっている実機では改善になりにくい。まずI2S条件の変更を単独で評価する。

## 検証

通常の`.venv`はPython 3.14でPlatformIOが動かないため、Python 3.13の`.stackchan-venv`を使う。

並行処理が通常の`.pio/build`を消すことがあるため、ビルド先は分離する。

```bash
cd /Users/Nao_u/nao-u-lab/GPT/stackchan-avatar
PLATFORMIO_BUILD_DIR=/private/tmp/stackchan-audio-profile-build \
  .stackchan-venv/bin/pio run -e m5stack-official-stackchan -j 1
.venv/bin/pytest -q
```

この指示書作成前に同じ変更内容で確認した結果は次の通り。

- `m5stack-official-stackchan`: ビルド成功
- Flash使用量: 2,108,755 / 2,293,760 bytes（91.9%）
- Pythonテスト: 29 passed

実機書き込み後、シリアルログで次の値を確認する。

```text
Factory audio profile: rate=24000 stereo=1 mclk=0 i2s=0 magnification=4
```

同じ文章、同じ音量200および230で、変更前後を比較する。確認項目は、体感音量、声の明瞭さ、歪み、ノイズ、発熱、発話後にマイク待受へ正常復帰するか、ウェイクワードが再び反応するか。

## 競合回避

作業開始時に必ず最新の差分を確認し、他スレッドの変更を巻き戻さない。

```bash
git status --short
git diff -- stackchan-avatar/platformio.ini \
  stackchan-avatar/firmware/src/main.cpp \
  stackchan-avatar/README.md
```

特に`platformio.ini`のバージョン番号、`README.md`の機能一覧、`main.cpp`の待受処理は並行更新されている。ファイル全体を古い内容で置換せず、上記の小さな追加だけを現行内容へ適用すること。

実装コミットには、上記3ファイルの自分の変更だけをstageする。既存の未コミット差分は含めない。
