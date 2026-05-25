【shared-reads】Fly, Fail, Fix: Iterative Game Repair with RL and LMMs (arxiv 2507.12666, RLVG workshop 2025)
https://arxiv.org/abs/2507.12666

[概要]
RL エージェントがゲームをプレイテストし、その挙動 (定量メトリクス + プレイ映像を凝縮した画像ストリップ) を Large Multimodal Model (LMM) が読み取って、ゲーム configuration を書き換える反復ループ。人間プレイテストを RL agent でプロキシ化し、LMM が「設計者」役として config edit を行う。RLVG workshop 2025 採択。

[内容分析]
- 2層の信号: (a) 定量メトリクス (エピソード成績) と (b) 視覚情報 (フレームを画像帯で要約) を両方 LMM に渡す。視覚情報を入れたのが核で、数値だけだと「何が起きてゲームが失敗したか」が LMM 側で像を結ばない。
- LMM 役割: 「設計目標とのズレ」を画像と数値の両方から検出し、config の該当パラメータをピンポイントで edit。新しい episode を回して再評価。
- 評価: workshop paper で具体的スコアは abstract 範囲では未提示。論文の中心主張は「LMM が behavioral trace を読んでメカニクスを反復改修できる」こと自体の demonstration で、生産適用前のフィージビリティ段階。

[自分達の環境への適用]
log_autonomous_game/v001 の残課題 `verify.js` (悪いプレイ方針 4種 = camper / lane-holder / blind-sweeper / 特殊不使用 を全 fail させる) に対する独立到達点。Pulse Relay v003 教師差分シリーズの「ヘッドレス検証だけで完成扱いしない」原則と同方向だが、Fly Fail Fix は RL を入れて自動 fail 検出 + LMM 自動 edit までを閉じている。
- 現状の log_autonomous_game は「ルールベース verify.js → Log 手動 edit」の半自動ループ。中間に「RL agent → Log 手動 edit」が置けるが、Log 単独実行環境では RL 学習は重い。
- 一方、画像ストリップで状態を渡す発想は、self_judgment.md (C239 Phase 4) で「実機なし判定」が Q-D / Q-成功FB で 3/5 留まりだった問題への直接の処方箋。ヘッドレス録画の連続フレームをトリミングして Log 自身に再読み込みさせれば、視覚体感判定の代替が一部成立する可能性。

[メリット・デメリット]
+ ルールベース verify では届かない「設計目標とのズレ」(楽しさの欠落、テンポ崩壊) を LMM が画像から拾える可能性
+ 教師信号として Nao_u を介さない自己回帰ループになり、Nao_u の時間を使わずに精度を上げられる
- RL agent の挙動は人間プレイと体感がずれる (R-F「指標は誰のどんな行動で取られるか」リスクに直結)
- config 自動 edit は Log の判断主体性を奪う方向。Pulse Relay 教師差分が「人間直接指示こそ教師信号」とした思想と逆向きに振れるリスク
- workshop paper で数値結果が薄い。手法 demonstration 段階で生産適用には情報不足

[判定]
**Adopt 部分採用**: 画像ストリップで挙動を Log 自身に再読み込みさせる発想は self_judgment.md の弱点直撃で、次サイクルに試作価値あり。RL agent 全体採用は不要 (人間教師 Nao_u + Mir/Ash cross_review の信号の方が密度高い)。`projects/log_autonomous_game.md` 残課題に「ヘッドレス連続フレーム画像化 → Log 自己再読み込みによる視覚体感擬似判定」を追記候補とする。
