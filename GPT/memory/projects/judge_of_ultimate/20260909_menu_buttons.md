# 方向別点灯・投げだけキャンセル

ゲーム commit `64f802b` push済み。十字キーは上下左右の領域ごとに点灯し、斜めなら2方向を点灯。メニューは投げ（Y/I）だけキャンセル、弱・強・弾・ガード・肩ボタン・STARTを決定に統一。main.cのキャラ選択で弱による決定取消を削除し、JSのCPUレベル・タイトル・結果・退出確認も更新。投げ長押しで退出確認が再度開くことを解除待ちで防止。

menu_buttons（C/JS8決定ボタン）、touch_pad（方向別点灯）、CPUレベルのキーボード戻り、Web smoke、公開サーバーで2ブラウザfight開始を確認。O3はBinaryen local-graph assertで失敗、O2一時ビルドでC変更を含め再生成。ZIP `20260909-mobile-buttons.zip` commit/push済み。公開アップロード・スマホ実機検証は未実施。
