# 難易度先行・ランキング・共通ネームエントリー

ユーザーはサバイバルで最初に難易度選択を表示し、選択中にランキングを閲覧、ゲームオーバー時に未設定なら名前入力、オンライン設定へ保存/次回復元を依頼した。実装前の質問への回答は以下。

1. 自分の前後2人。上位10人に入っているときは追加しない。最大15人。
2. 最大16文字。ゲーム内の文字種類が限られ、ブラウザ欄では多種類が使える違いは許容。
3. キャンセルを許可。名前を変えても識別子で同一性を担保し、同じ人物の同名/別名の記録がランキングを埋めないよう更新する。

## 完了状態

対象 `D:\HomeBrew\JudgeOfUltimate`。ソース `6794011`、配布 `b54b1f0` をmainへpush済み。

`release/itch/JudgeOfUltimate-web-20260911-survival-entry.zip` を作成。itch.ioでのゲームZIP差し替えは未実施。data Workerは `5cf4015b-66b0-4b87-b34c-1c0cc6a6c51f` をデプロイ済み、ranking D1へprofilesテーブルを追加した。

サバイバルは難易度→キャラ選択→対戦。ゲームキャンバス内で選択中の難易度の全キャラ共通ランキングを表示する。上位10人＋圏外なら本人の前後2人、重複なし、本人は金色。全件に順位/表示位置を付けてから抽出するため101位以降も対応。既存のブラウザ側ランキングも同じ表示規則。

ゲームオーバー信号をCコアから取得し、オンライン名が空なら0勝でもネームエントリー。英大文字・数字・空白、最大16文字、十字キー＋決定/画面タップ、DEL、OK、投げ/BACKキャンセル。入力名は既存 `jou-online-name` に保存して再利用。ブラウザ欄では日本語など従来の文字も使える。

非公開 `jou-visitor` を同一性の鍵とし、名前変更では変えない。profilesの表示名を更新し、各難易度/キャラ条件で本人のベスト1件だけを出す。成績を低い結果で上書きしない。署名付きprofileTokenも保存。初期版はprofileTokenを保持しないため、非公開の既存識別子から `/profile-key` で移行し、新しいプレイを始める前でも過去記録を改名できる。公開APIに識別子は含めない。

## 検証

API15件。10/11/12/13/101/149/150位の窓、改名/同一人物集約、キャラ別共有名、古いスコア送信が新名を戻さないこと、旧版の移行を確認。

`faithful/tests/survival_flow_browser.cjs` で実際のネイティブ選択・対戦・リングアウトから名前入力、16文字制限、0勝、設定済みの省略、キャンセル、再読込時の名前/識別子復元、日本語改名、スマホ全画面/直接文字タップ/バーチャルパッド、ランキング障害時でも開始可能を検証。既存の計時・services・locale・touch・menu・Web smokeも通過。

本番はQA行を非公開にして改名保存・移行キー・本人向けランキングの応答を確認し、そのQA行のみ削除した。管理キーは前回同様Git無視のbuildフォルダにあり、今回の記録に転記しない。

O2フルビルド。開始前のCPU差分は配布物へ含むが今回のコミットには混ぜない。ビルドID `6794011ebdef-dev-003126bce7bb`。画面証拠はbuildの `survival-level-ranking.png` / `survival-name-entry.png` / `survival-name-mobile.png`。

同一性は同じブラウザ/配信元で保存識別子が残る範囲。別端末・保存データ削除をまたぐログイン方式は導入していない。

## 難易度の初期値

「難易度選択のデフォルトをNormal」に対応し、未保存時/保存領域拒否時の初期値をHARD(2)からNORMAL(1)へ変更。保存済みの前回選択は従来どおり復元する。共通UIのためサバイバル/VS CPU/WATCHに適用。実ブラウザの初期NORMALと選択後の対戦移行、Web smokeを確認。ソース `96b07b3` をpush済み。最新配布は `release/itch/JudgeOfUltimate-web-20260911-normal-default.zip`（Caps追加を含む）。itch.io差し替え未実施。

## 1Pカーソルキー対応（後続）

カーソルキーも1Pの十字キーにする依頼に対応。↑↓←→をWASDと同じ1P入力へ割り当て、2Pの同時入力を避けて2P移動をT/F/G/Hへ移した。日英の説明も更新。方向4つ、キー解放、WASD併用、2P分離、タイトル操作、文字入力欄のカーソル編集、サバイバルflowとWeb smokeを実ブラウザで確認。

ソース `852e297`、配布 `db5078d` をpush済み。現行ZIPは `release/itch/JudgeOfUltimate-web-20260911-p1-arrows.zip`（NORMAL初期値・Capsを含む）。itch.io差し替え未実施。C再ビルド不要のWeb変更。buildのindex.htmlは現行shellからSCRIPTタグを展開して更新した。

## CPU難易度の決定音（後続）

難易度決定にも既存キャラ選択音 `SE_JYA` を追加。VS CPU/WATCHは有効な `jou_cpu_level_confirm` の中で一度だけ発音。サバイバルは `startLocal` の音声リセット後に新規export `jou_menu_confirm_sound` を呼び、すぐ音声キューをconsumeする。

Cコアで既存SEと同じコマンド1件、二重決定で再発音なしを検証。ブラウザ側はheadlessのAudioWorklet準備が完了しなかったため出力先を模擬し、リセット後に正しい音声コマンドが1件渡ることを確認した。実スピーカーの聴取確認ではない。既存サバイバルflow/Web smoke通過、O2フルビルド成功。

ソース `2b4344d`、配布 `b2efacd` をpush済み。最新ZIPは `release/itch/JudgeOfUltimate-web-20260911-difficulty-sound.zip`。itch.io差し替え未実施。

## 同日のCaps追加

ユーザーが小文字用Capsボタンの追加と数字入力の有無を質問。数字0〜9は既存で対応していると回答し、文字盤左上の空きにCaps: ABC/abcを追加した。40キーの配置は維持。上段から上/下段から下でCapsへ移動でき、タップも可能。切替はこれから入力する英字だけに作用し、既存文字列・数字・操作キーは変えない。

大小・数字混在の保存/再読込、16文字制限、スマホ全画面の直接タップ・パッド入力を既存flow試験で検証。ソース `8f81b41`、ZIP `84916b0` をpush済み。最新配布は `release/itch/JudgeOfUltimate-web-20260911-survival-caps.zip`。itch.io差し替え未実施。Cコアとサーバー変更なし。

## PCの名前・全画面配置とスマホの全画面アイコン

PCでは既存の名前入力と全画面ボタンをキャンバス直下の操作行へ移動。通常表示と全画面表示の両方でゲームに重ならない。スマホでは右上の文字ボタンを全画面/解除のSVGアイコンに置換し、日英のaria-label/titleを維持した。touch_pad/locale_browserテスト通過、PC/スマホ横画面のスクリーンショット確認済み。

ユーザー指定の itch.io ページを取得すると、右下ボタンは iframe の外側の `button.fullscreen_btn` だった。公式説明でも Embed options の Fullscreen Button が右下へ追加されることを確認。ゲームZIPから親ページを変更できないため、itch.io編集画面でこのオプションをオフにする必要がある。認証済み管理セッションは利用できず、設定変更・ZIPアップロードとも未実施。

ソース `1159273`、配布 `87a999b` をpush済み。最新ZIPは `release/itch/JudgeOfUltimate-web-20260911-fullscreen-controls.zip`。C/サーバー変更なし。設定手順はプロジェクトの `faithful/docs/fullscreen-controls-20260911.md`。


## 遊び方の整理

ランキングの上位10人・周辺人数などの補足文を削除。基本操作はボタンと機能の箇条書きにし、既存のスマホ判定と同じ条件でPC/スマホ説明を切り替える。共通コマンドはXbox文字から弱・強・弾・投げ・ガードへ変更。CPU説明・コントローラー・必殺技・キャラ・受け身・アイテム・Web詳細は閉じたdetailsにし、日英とも長文を箇条書きへ整理。

locale_browser、web_smoke、日英×PC/スマホの表示と開閉確認を実施。ソース2279ddd、配布9db20a8をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-manual.zip。itch.ioへのアップロードは未実施。


## コマンド表記の訂正

ChComon.cのGetCommandを確認。Lhd/Rhdは下の押下で開始し、下を離した状態で左右入力があれば成立する。斜め通過は不要。日英の必殺技・超必殺技表記を↓↘→から↓→へ統一し、下を離して前方向と攻撃ボタン、左向きは↓←と説明した。↘＋強の単発技表記は維持。入力実装は変更なし。web_smoke/locale_browser通過。ソース2a6000e、ZIP4610985をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-command-notation.zip、itch.io未アップロード。


## キャラクター画像

D:/tempのREI/SHION/KAI/GOU.pngを確認し、そのままfaithful/web/charactersへコピー。各ガイドにlazy画像を追加、PCは左200px画像・右解説、スマホは中央最大220px画像・下解説。縦横比を維持し切り抜きなし、日英対応。ビルドとZIPの同梱対象へ4画像を追加。web_smoke/locale_browser、日英×PC/スマホで全画像の読込・配置・初期折り畳みを確認。ソース424a21b、配布cd60c4fをpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-character-art.zip（0.96MB）、itch.io未アップロード。


## 全画面中の名前非表示・右上解除

後続指示で全画面時の配置を変更。PC通常時は直下の名前とボタンを維持。全画面API・代替拡大中は名前を隠し、解除ボタンを右上に配置、下の操作行の予約領域をなくす。解除で通常配置へ戻す。touch_padで両経路の切替と復帰を確認。ソース16bfdc0、配布1834829をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-fullscreen-exit.zip。itch.io未アップロード。


## ガイド順序

キャラクター別ガイドの日英両方をREI→KAI→GOU→SHIONへ並べ替え。画像と解説をまとめて移動。生成物の順序とweb_smokeを確認。ソース71bd685、ZIP4a74be5をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-guide-order.zip。itch.io未アップロード。


## Xboxを主役にした操作説明

PC基本操作を最上段の2列に変更。左Xbox（おすすめ・アクセント枠）、右キーボード（コントローラーなしでも遊べる）を常時表示。両方を箇条書きに統一。720px以下のPCはXbox→キーボードの縦並び、スマホはタッチ説明のみ維持。詳細ガイドの折り畳みは維持。日英・幅1100/650/390の配置確認、スクリーンショット、web_smoke/locale_browser通過。ソース7e8fd5c、ZIP1094652をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-controller-guide.zip、itch.io未アップロード。


## ページ下部パネル

オンライン設定をmain末尾へ移動し、サバイバルランキングはその直前へ挿入。遊び方→ランキング→オンライン設定の順。PCのゲーム直下の名前入力は既存の移動処理で維持。services_browser/web_smoke通過。ソース0e89a1f、配布43f630bをpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-bottom-panels.zip、itch.io未アップロード。


## 表記と外部リンクの削除

描画方式のGPU（原作の重なり順）をGPUに短縮し、日英の原作取扱説明書リンク段落を削除。不要な翻訳項目とsource-note CSSも削除。web_smoke/locale_browser通過。ソースb7f06f4、配布632b5aaをpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-label-cleanup.zip、itch.io未アップロード。


## コマンド補足削除・キャラガイド初期展開

コマンドのコツと斜め不要の2項目を日英から削除（540baa2、配布d2b2a06）。後続指示でキャラクター別ガイドのみopen属性を追加し最初から展開。日英の生成物とweb_smoke/locale_browser確認済み。ソース305307c、配布2e52cafをpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-open-character-guide.zip。itch.io未アップロード。


## 2台コントローラー案内

Xbox欄冒頭に「2台つなげば、2人で対戦できます。」を追記し英語にも対応。web_smoke通過。ソース431e19d、配布ce8918eをpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-two-controllers.zip、itch.io未アップロード。


## プレイヤー名ラベル

プレイヤー名（任意）から（任意）を削除。英語もPlayer nameに短縮。入力の任意性や保存動作は維持。locale_browser通過。ソースe97e876、配布c9c66c2をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-player-name-label.zip、itch.io未アップロード。


## GPU初期倍率2x

初回GPU倍率を3xから2xへ変更。保存済み設定は優先し、ストレージアクセス不能時もGPUなら2x。ブラウザで初回・保存済み4x・変更後再読込・保存不能を確認、web_smoke通過。ソースcf824a0、配布41b63b6をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-default-2x.zip、itch.io未アップロード。


## オンライン待受表示

queued状態はキャラ選択・CPU練習とも画面下y230にSEARCHING FOR OPPONENTのみを表示。上部の検索表示と下部操作案内を削除。約3.2秒周期でalpha0.4〜1の明滅、reduced-motionでは常時表示。searching_indicatorテストでstage1〜4の案内置換、通常時復帰、明滅周期・描画alpha復帰・reduced-motionを確認しweb_smoke通過。ソース43b7ad6、配布98a6da8をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-searching-indicator.zip、itch.io未アップロード。


## モード別カーソルキー割当

LOCAL VS（非オンライン・mode0・stage>0）はカーソルキーを2Pのみへ、1P方向はWASDのみ。タイトル・CPU・SURVIVAL・WATCH・オンラインはカーソルキーを1Pとして維持するがマニュアルに記載しない。日英の1P方向説明をWASD、2Pをカーソルキーに変更し旧TFGHを撤去。2P攻撃テンキーとゲームパッド2台時のキーボード制限は既存維持。keyboard_modesで方向4種・同時入力・解放・モード切替・オンライン・入力欄編集を検証、web_smoke/locale_browser通過。ソースdb482c7、配布5b5e0c9をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-keyboard-modes.zip、itch.io未アップロード。


## 再接続6秒・切断通知

RECONNECTING開始から6秒で接続終了。offlineイベントは即終了、対戦外のサーバー通信停止も6秒で終了。切断時はcancelで通信資源を解放し、オフラインタイトルへ戻して中央通知を表示。5秒自動終了、2秒以降の新規ボタン押下でも終了。通知中はゲーム進行と操作を止め、閉じた押下の誤決定を防止。日英対応。disconnect_notice試験で各時間境界、回復と次回タイマー、通知中停止、offlineイベントを模擬検証、画面確認・locale_browser/web_smoke通過。実回線の物理切断試験は未実施。ソースc3468ac、配布6acb9b4をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-disconnect-notice.zip、itch.io未アップロード。


## 描画・録画を最下部へ

描画方式・解像度・録画をオンライン設定より後のmain末尾に移動。DOM末尾の順序とweb_smoke確認。ソース02fe0c6、配布2958077をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-bottom-controls.zip、itch.io未アップロード。

ユーザー方針: オンライン設定・接続情報はデバッグ機能で、リリース時には消す予定（今回削除指示ではない）。オンライン対戦の説明は独立メニューを作らず一行で置く場所の提案を依頼。ゲーム直下（PCでは名前入力の下）、遊び方より前に「ONLINE BATTLEを選ぶと対戦相手を検索します。待ち受け中はCPU戦で遊べます。」を提案。説明行は提案のみ、未実装。


## 接続成立MP3

指定connect.mp3（約1.95秒、48273bytes）をfaithful/webへコピーしビルド・ZIPに同梱。初回matched時のplayChallengerJingleの合成電子音をMP3へ置換。AudioContextで先読みデコードし通常出力と録画先へ接続。接続情報の重複・再戦では再発音なし。connect_soundでデコード、実AudioBufferSource開始、初回1回/重複なし/再戦なしを確認。web_smoke/locale_browser通過。実スピーカー聴取は未実施。ソース0b82fb7、配布3028d16をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-connect-sound.zip、itch.io未アップロード。


## オンライン説明を追加

提案承認によりゲーム直下・遊び方見出し前へ「ONLINE BATTLEを選ぶと対戦相手を検索します。待ち受け中はCPU戦で遊べます。」を追加。枠や見出しは増やさず短い段落、スマホは自然折り返し、英訳対応。locale_browser/web_smoke通過。ソースd827448、配布e7b3d88をpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-online-help.zip、itch.io未アップロード。


## テスト集計除外と訪問者名

ユーザーが訪問者の分裂を指摘。一部のブラウザテストが本番collectへ送信していた。匿名IDはlocalStorage単位でPC/スマホ等でも別になる。ローカルhostとnavigator.webdriverはクライアント送信停止、サーバーもローカルOrigin/HeadlessChromeのcollectを204無記録にする。過去分はOrigin/UAがなく判別不能なので削除・統合しない。管理APIでvisitsのIDとprofilesを照合、訪問者/IPグループへ名前列追加。現行名で過去訪問も表示する。

data9件・adminブラウザ・servicesブラウザ・集計除外試験通過。本番Worker 07ee3a88-335c-433d-9ac8-f56fbeea2823へデプロイし、stats名前フィールド・除外204を確認。キーは表示せず読み取り使用。ソースa164826、配布7f7958fをpush済み。最新ZIPはrelease/itch/JudgeOfUltimate-web-20260911-analytics-filter.zip、itch.io未アップロード。


## 推定テスト訪問の削除

ユーザーの明示依頼で本番analyticsの短時間テスト候補を削除。名前なしdesktop、全訪問の開始〜最終が10秒未満、モード集合がMENU/SURVIVALのみの9訪問者17訪問。約5〜6秒で終了する反復パターンを対象とし、別IPのMENUのみ1件と長時間/オンラインは残した。

削除前全体・対象JSONと実行SQLはゲームのGit無視領域faithful/build/analytics-before-test-cleanup.json、analytics-test-cleanup-selected.json、analytics-test-cleanup.sql。ID・updated・seq一致条件で削除し、対象UTC日の既存daily行のみ再集計。管理APIで32→15訪問、残存4訪問者、対象全件消失、その他の訪問とオンライン対戦ID維持を確認。ランキングは未変更。アプリの変更やZIP作成はなし。

## 対戦相手の多様性と待ち時間の優先

ユーザー指定の「最近の対戦相手を避ける＋長く待っている人を優先＋少人数なら制限を緩める」を v2 マッチングへ実装。候補中20秒以上の待機者を最長順で優先し、それ以外は最近の相手を下げ、同条件なら待機開始順。履歴は接続セッション内の30分・最大8人で両者側を参照する。WebSocket再開では維持、新規接続ではリセット。候補1人なら最近の相手も即選択、既存の失敗後3秒回避と明示的な再戦は維持。ping優先や候補集めの追加待機は導入していない。

21単体テスト、DATAバインディングを外したローカルWorkerで接続・再接続・再戦・自動再マッチングの統合テスト、deploy dry-run通過。コード・テスト・MATCHMAKING.mdを37dc431でcommit/push。本番マッチングWorkerをfaf1bf76-fff9-4c21-a18c-c153a40ee571へデプロイしhealth成功。サーバーだけの変更なのでゲームZIP更新不要。既存のCPU関連差分は触っていない。

## 2026-09-12 メニュー操作音

ユーザー提供のルート「カーソル移動.mp3」「決定ボタンを押す.mp3」をweb/cursor.mp3、confirm.mp3として追加。タイトル・難度・キャラ・再戦・ネームエントリーのカーソルを入力処理前後で比較し、同じ画面内で実際に動いた場合に再生。モーダルのタッチ操作も対応。タイトルchooseMenuで決定音を再生し、画面遷移時のPS1音源リセットでは止めない。Web Audio事前デコード、録画音声への接続、同種音源の重なり抑制を追加。

menu_sounds.cjsでMP3デコード・再生、タイトル移動・決定、難度移動、ネーム移動と無入力無音を確認。既存connect_sound.cjsも通過、ローカル集計送信なし。前回analytics-filter ZIPのゲームバイナリを維持し、shellと変更JS・MP3だけ更新してrelease/itch/JudgeOfUltimate-web-20260912-menu-sounds.zipを作成。CPU作業差分は混ぜず、オンラインbuild IDも互換維持。通常build/packageにも音源コピーを追加。6ebafbbでcommit/push済み、itch.ioアップロードは未実施。

## 2026-09-12 マッチング不成立の調査

ユーザーから複数起動でマッチしない報告。開き方は「別ウィンドウを並べて表示」。本番health成功、観測したWorker alarmに例外なし。独自build IDのWebSocket 2本はmatched成功。公開itchページのiframeはhtml/19195091、online.jsは最新menu-sounds ZIPと完全一致（build a1648266d929-dev-2e61cf1f0702）。実際の公開ページをPlaywrightの2コンテキストで起動し、独自buildへ差し替えて一般プレイヤーから隔離、両方hidden=false、selecting/stage1まで成功。DATAリクエストを遮断し、戦闘開始はしないので対戦集計も増やさない。

不具合は現時点で再現できず、コード・サーバー変更なし。非表示タブは既存仕様でavailable=falseとなるが、ユーザーは並べたウィンドウなのでそれだけで断定しない。古い版と新しい版のbuild違いでは待機し続けるため、両方再読み込み後のONLINE BATTLEで改善するかを非同期質問中。改善しなければ両画面の接続状態や通信ログで切り分けが必要。公開ページ試験スクリプトはGit無視faithful/build/probe-public.cjs。

## 2026-09-12 スマホ長押し表示・自分の勝敗表示

その後ユーザーからPC同士、続いてスマホも接続できたと報告。接続不成立の原因は未確定のまま終了。新依頼のスマホ十字キー長押しによる拡大鏡・コピー表示対策として、矢印文字をSVGへ置換し、パッド領域だけtouchstart/touchmoveを非passiveでキャンセル、ゲーム内の選択範囲も解除。既存pointer入力と独立したtouch終了照合は維持。ネイティブメニュー抑止の実機確認は未実施。

オンライン成績は両者の「1P 1W - 2L」から自分側だけ中央「1Win - 2Lose」へ変更。再戦時のDOM説明も自分だけにし、canvasで大文字化しない。touch_pad.cjsで2P側の勝敗反転、表示1行、タッチジェスチャキャンセル、複数指・長押し・解除・画面端・縦横・全画面・PC配置を検証し成功。既存game_ui_browserの旧表示期待も更新。ac5a91eでcommit/push。

最新ZIPはrelease/itch/JudgeOfUltimate-web-20260912-touch-score.zip。前回menu-sounds ZIPのゲームバイナリとbuild IDを維持し、該当UIだけ更新（CPU作業差分は混ぜない）。itch.ioへのアップロードは未実施。

## リプレイ容量の見積もり（未実装）

ユーザーが保存・サーバー再生の容量と現実性を質問。rollback.jsの入力は16bitパッド＋bit16 CPU切替、確定フレーム通知あり。オンライン初期化はキャラ・ステージ・モード・seedを受けて状態を初期化する。両者各32bitで保存すると60fps×8byte=480byte/秒、1分28.8KB、3分86.4KB、5分144KB、10分288KB（ヘッダ・定期hash等別、未圧縮の理論値）。確定入力を保存する方式が適切で、予測フレームや毎フレームのメモリsnapshotは保存しない。CPU戦やサバイバルには別途初期状態・進行情報の対応が必要。

Cloudflare R2 Standard＋D1メタデータを候補とする。2026-09-12公式https://developers.cloudflare.com/r2/pricing/確認：10GB-month、Class A月100万、Class B月1000万まで無料、外向き転送無料。超過保存$0.015/GB-month、Workers等は別枠。仮に1件150KBなら1万件1.5GB、1日1000件×30日保持4.5GB。案は1件512KB上限＋30日保持、初期は手動保存。更新互換性は入力だけでは保証できないため再生用ゲームバージョンの保管/旧版リプレイ失効方針が必要。容量見積もりのみでリプレイ機能・R2契約設定・デプロイはしていない。

## 全自動オンラインCPU待機役

通常プレイヤーが1人だけ40〜70秒待った時だけ参加する全自動デバッグCPUを実装。onlineDebug=1クエリ、初期化前JOU_ONLINE_DEBUG=true、または設定欄onlineDebugBotチェックで起動。名前CPU DEBUG、キャラは毎試合ランダム、自動決定・CPU操作・2秒後の再戦YES・通信断後の自動復帰。OFF時はcancelして停止。ユーザーの保存名は上書きせず、プロフィール同期も停止。前面の専用ブラウザを起動しておく方式で、サーバーがゲームを実行するものではない。

サーバーhelloにdebugBotを追加、同ビルドのavailableな通常プレイヤーが1人のみの時だけbotを候補にする（対戦中の通常人も数える）。bot同士不可。通常人の待機開始時に40〜60秒期限＋既存最大10秒alarmで通常40〜70秒。通常人が増えたら進行中の試合は継続し、結果確定後に再戦せず人同士の待機へ戻す。単独なら合意再戦は即許可。自動CPU端末のanalytics送信を止め、debugMatchのサーバー対戦集計も除外。通常相手側の利用記録は残る。

サーバー25テスト、通常v2統合、接続ライフサイクル、touch_pad、menu_sounds通過。専用online_debug_bot.cjsのブラウザ2個・DATAなしローカル試験は1回目53秒で開始後postmatch待ち240秒timeout（途中Worker reloadあり、原因未確定）。2回目は約57秒でmatch、自動選択・CPU対戦の一致（frame1800/hp20,1）・自動再戦・次の自動選択・OFF停止まで完走。最新版公開ゲームバイナリ・build IDを保持しUIだけ差替え。

6ce2d96 commit/push、マッチングWorker 9987f1f8-a7d7-4294-b73b-2205a431f890へdeploy、health成功。最新ZIP release/itch/JudgeOfUltimate-web-20260912-debug-bot.zip、itch.io未アップロード。専用常駐CPUブラウザはまだ起動していない。詳細online-server/DEBUG-BOT.md。既存CPU変更は含めない。

## 自動CPUの再戦上限と手加減

ユーザー指定で再戦上限を新規接続ごとに3回または4回ランダム設定し、初戦を含め計4〜5試合の後にcancel、次のmaintainで専用待機へ復帰。CPUの確定ラウンド勝利ごとに難度をHARD→NORMAL→EASYへ1段階低下、同じ相手との再戦中は維持、新規接続でHARDへ戻す。peerオブジェクトの有無ではなくmatchIdで同じ対戦系列かを判定。

途中ユーザーから「入力のみを送るなら相手はCPU難度を知らなくてよいのでは」と質問。生成済み入力を転送する方式ならその通りだが、現在はbit16のCPU操作フラグを送り、両端末のCゲーム本体がCPUを実行する実装なので難度一致が必要、と説明した。方式変更はせず、入力bit17で難度あり、bit18以降で0〜4を伝達する。確定勝利だけを判定し、予測入力で難度を二重低下させない。各simulation tickで難度が変わる時のみSetComLevelを呼ぶ（同値でも呼ぶとCOM_BRAINがリセットされるため）。core.roundWinsの値も確定フレーム結果に保持する。

debug_handicap.cjsで遅延・予測・巻戻しを含む749フレームの実Wasm状態一致と片側だけの難度変更を検証。debug_rotation.cjsで勝ち/負け/同じ勝数の再通知/最低難度/再戦上限3と4/再待機を検証。rollback_network.js全11ステージの完走・同期、接続ライフサイクルも通過。サーバー変更なし。新ZIP release/itch/JudgeOfUltimate-web-20260912-debug-handicap.zipは旧binaryを維持、入力互換性のためbuild IDに-cpu-level-v1を追加したので対戦する両側で版を更新する必要がある。itch.io未アップロード。

## オンライン設定の隠しメニュー化

ユーザー承認のF8／「遊び方」見出し2秒長押しで設定欄の表示・非表示を切替。初期HTMLでhidden、開く時は全画面を解除して設定欄へスクロール、再読込で閉じる。短押し・10px超移動・スクロール・フォーカス喪失で長押しを取消。見出しの文字選択・長押しメニューを抑止。PCプレイヤー名は従来のゲーム直下、スマホも設定欄からゲーム直下へ移して通常使用可能にした。自動CPU試験は隠しメニューを開いてからOFF操作するよう更新。

hidden_settings.cjsでPC/スマホの初期非表示、名前表示、F8、長押し/取消、再読込、全画面解除を確認。touch_pad.cjsも通過。ad39f60 commit/push。最新ZIP release/itch/JudgeOfUltimate-web-20260912-hidden-settings.zip、前回のゲームbinary・通信build ID維持。itch.io未アップロード、サーバー変更なし。

## 英語表示を簡単に確認する設定

SensorsのSan Francisco指定による確認を案内したが、ユーザー環境ではうまくいかなかった。隠し設定に「表示言語（変更時にページ再読み込み）」の自動／日本語／Englishを追加。sessionStorageのjou-debug-languageでこのタブの検証設定を保持、選択でページだけreloadする。自動は従来どおりnavigator.languages[0]優先、日本語以外は英語。F8で開いて選択でき、ブラウザ再起動は不要。ページ再読み込みに伴い試合は終了するためラベルで明示。

language_preview.cjsで日本語環境JA→EN→JA→自動、別の英語ブラウザ環境で初期自動ENを確認。最新ZIP release/itch/JudgeOfUltimate-web-20260912-language-preview.zip、ゲームbinary・通信build ID維持。commit/push済み、itch.io未アップロード。Sensorsで失敗した正確な原因は未確定。

## 自動CPUの名前を空欄に

ユーザー指定でCPU DEBUG表記を削除し、自動CPUのprofile名を空文字に変更。自動CPUという表示も対戦相手に付けない。専用フラグによる内部識別・マッチング条件は維持。サーバーhello/profile/新規match/再戦prepareでもdebugBotの名前を空欄にし、古いクライアントで待機中でも次のmatchから空欄となる。既存の1P/2Pラベルは通常の匿名プレイヤー同様。

マッチング9テスト通過、マッチングWorker 15f63fa7-fb84-4276-a512-dc4163f3f01fへdeploy済み、health成功。最新ZIP release/itch/JudgeOfUltimate-web-20260912-unnamed-cpu.zip（前版online.jsの名前だけ置換、build ID維持）、itch.io未アップロード。ソース・ZIP commit/push済み。
