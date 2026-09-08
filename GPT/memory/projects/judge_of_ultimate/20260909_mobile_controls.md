# スマホ用バーチャルパッドと全画面

依頼: 「バーチャルパッドを表示して、スマホでも動くようにしてほしい。スマホでフルスクリーンで動かせる？」

ゲーム commit `af47b92`、main へ push 済み。`faithful/web/touch-pad.js` / `.css` にタッチ方向パッド、弱・強・弾・投げ・ガード、START・タイトルへを実装。スマホ自動表示、PCは表示切替。斜め・同時押し・スライド、長押し、pointercancel / blur 等の解除に対応。shell の既存入力マスクへ合成する。

全画面はゲームステージ全体へ Fullscreen API を要求し、非対応・拒否時は画面内拡大にする。横持ちは左右パッドと中央4:3画面、縦持ちはパッドを下へ。manifest / Apple standalone メタ情報とホーム画面起動時の自動拡大を追加。オフライン機能は追加していない。

Release ビルド・Web smoke・新規 `faithful/tests/touch_pad.cjs` 合格。Chromium のモバイルエミュレーションで390×844 / 844×390、入力合成、解除、全画面成功と非対応、standalone を検証。iPhone / Android 実機は未確認。既存 game_ui_browser はローカル選択通過後、テスト対戦サーバー8788未起動の接続待ちで失敗。オンライン回帰合格ではない。

配布ZIP `release/itch/JudgeOfUltimate-web-20260909-mobile.zip` 作成・必要ファイル同梱確認済み。公開先へのアップロードはしていない。ZIPのゲーム本体は元からの未コミット変更も含む現行作業ツリーのビルド。詳細 `faithful/docs/mobile-controls-20260909.md`。
