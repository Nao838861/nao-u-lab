# MonoSH FX2の現時点のROM起動案内

2026年10月5日、別スレッドで進行中の移植について、既存成果物を読み取り確認した。ビルドや実行中のMesenには手を加えていない。

単独起動用ROMは `D:\AI\Nao_u_BOT\GPT\projects\monosh_fx2\build\game_v001\MonoSHFX2_v001.sfc`。確認時点で2,097,152bytes、SHA-256は `94ed6e9a105038c5751a2e842118430f36c61faeebc05c776a4b4f950d4cd2e8`。build配下なので別スレッドの再ビルドで更新される。

Mesenの既存起動ログでは `MONOSH FX2 GAME V001`、LoROM、Super FX GSU1/2として認識されている。既存の `build/game_v001/play/trace.jsonl` はゲーム状態・自弾・画像更新を記録し、`field360.png` には自機・地面・遠景が映っている。起動コードはCのmainへ入り、入力待ちプローブではない。Luaは自動テストに使われているが、通常起動にLuaスクリプトは不要。

Mesenでこのsfcをファイルから開くか、ウィンドウへドラッグして起動する。入力コードの対応は十字キーが移動、Aが押し続ける射撃、Yが押した瞬間の射撃、Startがポーズ切替。キーボード側のキーはMesenのSNESコントローラ1設定による。

初期の `build/v001/*/probe.sfc` はLua入力待ちの測定ROMなので、ゲームを見る目的には使わない。確認時点のゲーム側cpu.sは上下各20行forced blank、184行表示の暫定構成。既存ログには画像更新が2fieldに1回となる場面があり、256×192・60fpsの完成版とは扱わない。

関連する正本は [プロジェクト入口](../../../projects/monosh_fx2/README.md)。ただし入口の「ゲーム移植はこれから」はこの確認時点の未commit作業より古い。今回の案内は実際のROM、移植中のソース、既存起動ログを根拠にしている。
