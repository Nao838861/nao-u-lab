# shot_log dialogue_archive から v14 へ

## 読み直した中心

- `dialogue_archive/INDEX.md`
- `v01_creation_20260427_0133_d5662c35.md`
- `v02_planning_20260517_1739_2718715a.md`
- v13 で作成済みの `shot_log_archive_analysis.md`

## 方法として抽出したもの

shot_log の品質は、初期プロトタイプの仕様だけで出たものではない。Nao_u のプレイ感指摘に対して、ボム後の見え方、MAX 到達 cue、中ボス/ボスの存在感、中型敵のメリハリ、30秒で死ぬAI評価の失敗などを、短い差分で繰り返し直したことが大きい。

v14 で使う抽象は次の通り。

1. **波の役割を決める**: すべてを圧にしない。読ませる、休ませる、回復させる、節目を作る。
2. **節目の敵に価値を持たせる**: medium は早く倒したい脅威にする。倒すと報酬、放置すると逃げる。
3. **見える cue を優先する**: MAX、BOMB、boss final に加え、wave intent も表示する。
4. **評価できるAIで測る**: clear-capable bot と headless の検査項目を増やし、途中死亡AIの印象で判断しない。

## v14 への反映

- `WAVE_INTENTS` により、各 wave の役割を HUD と popup に表示。
- shield を 4 にして、リカバー性と緊張のバランスを取り直した。
- medium を anchor 敵として強化し、reward と escape cue を追加。
- headless check に wave intent / medium threat / shield stock 検査を追加。

## 残る注意

wave intent 表示は制作側の検査にも効くが、画面情報が増えすぎる可能性がある。次回は実プレイで、HUD が邪魔か、また `ANCHOR ESCAPING` が脅威として読めるかを見る。
