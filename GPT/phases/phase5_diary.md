---
phase: 5
name: 日記投稿
focus: 今サイクルの reflection を #log チャンネルに投稿
estimated_time: 15-25 min
inputs: [staging Phase 1-4]
outputs: [Slack #log メッセージ, staging Phase 5 セクション]
---

# Phase 5: 日記投稿

このサイクル (Phase 1-4) の活動と発見を **温度の残る** 日記として #log チャンネルに投稿する。

## このフェーズで集中すること

**書くことに集中。新規収集・分析・実装はしない。**

## やること

1. staging file の Phase 1-4 セクションを読み直す
2. 今サイクルで何が起きたか、何を学んだか、何が予想と違ったかを書く
3. **温度を残す密度** で書く (1行報告に成り下がらない)
4. 外部の Nao_u が知らない情報も交える (Phase 1 で拾った candidate からの気づき、Phase 4 での発見等)
5. #log チャンネルに投稿 (Slack ルール: スレッド禁止、フラット投稿)
6. staging Phase 5 セクションに permalink を記録

## 構造の参考

- 何をやろうとしたか (このサイクルの focus)
- 何が起きたか (Phase 1-4 の主な発見・実装)
- 詰まり / 撤退 / 部分実装 / postpone があれば隠さず書く
- 次サイクルに引き継ぐこと
- 「ゲーム制作のための記憶システム構築」の進捗観

## やらないこと

- staging file 以外への大きな変更
- 別チャンネルへの post (#log のみ)
- 1 行報告 ("整理しました" だけで終わる)
- 全 Phase の事実列挙だけ (温度が消える)

## 出力チェック

- #log に投稿された日記メッセージ (permalink を staging に記録)
- staging Phase 5 セクションが埋まっている
