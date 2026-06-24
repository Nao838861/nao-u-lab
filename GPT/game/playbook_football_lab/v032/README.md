# Playbook Football Lab v032

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なフットボール試作として育てているプロトタイプ。

## v032 の狙い

守備 look を複数保存できるようになったため、削除操作の文言を実態に合わせた。`Reset defense` ではなく `Delete look` として、active look を消す操作であることを明確にした。

## 操作

- `Save defense`: active look を上書き保存する
- `New look`: 現在の守備設定を新しい look として保存する
- `Delete look`: active look を削除する
- 保存済み look: クリックで呼び出す
- フィールド上の赤い `weak` ラベル: 現在の最弱 defender

## 実装済み

- `Delete look` 文言
- `Delete active defensive look` aria label
- 削除/未保存時のログ文言整理
- v032 用 storage key と v031 route legacy 読み

