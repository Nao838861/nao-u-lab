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
