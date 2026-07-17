■ 概要
AI 修復エージェントに渡す bug report は、人間にとって読みやすければ十分なのか。本論文はこの問いを、相関を見る観察研究と、同一タスクの入力だけを変える controlled ablation の二段構えで調べている。

Study 1 は SWE-bench Verified の 433 issues と、それを試行した 87 repair agents を対象に、bug report に含まれる 27 feature と修復成功の関連を統計モデルで分析した。成功との正の関連が見られたのは、fix suggestion、実行可能な reproduction script、repository 内の source code、fault localization 情報。逆に report が長いほど成功 odds は低かった。人間向け bug report で定番の自然言語による再現手順や読みやすい説明は、agent には寄与が小さいか、場合によっては負の関連を示した。

Study 2 は SWE-bench Pro の bug-fix 283件から、各 model が無改変 statement を3回中1回以上解けた model 別 eligible set（Qwen 79件、Gemma 83件）を作り、Qwen3.6-35B-A3B と Gemma-4-31B-IT、17種類の problem-statement mutation を比較した。各条件は isolated Docker、50 agent turns、2ドル上限で3回反復し、solve@3 と3試行平均の mean solve を測る。title、description、report content、requirements、interface の除去・単独提示、gold patch file 参照の削除、list の平坦化、section header の削除、observed/expected behavior や再現手順の除去を行うことで、underlying task を固定したまま入力情報の効果を切り分けた。

結果は「具体的・実行可能・局所化された情報」が agent に効くことを示す。requirements を除くと solve@3 は Qwen で64.6pt、Gemmaで55.4pt低下し、gold patch file の参照削除でも39.5pt、28.6pt低下した。内容を一語も消さない構造変更でも、list 平坦化後の保持率は Qwen 73.4%／Gemma 89.2%、見出し削除後は69.6%／90.4%だった。情報不足時、Qwen は探索や自作 reproduction を増やして50-turn budget を使い切りやすく、Gemma はもっともらしい解釈へ早く固定して patch する。情報欠落は正答知識だけでなく、探索軌道そのものを変えるという結論である。

■ 内容分析
重要なのは「詳しく書く」ではなく、agent が検証可能な制約へ変換できる形で書くことだ。requirements 単独でも Qwen 68.4%、Gemma 75.9%を解けた一方、title、description、report content はどれも単独では solve@3 が11.4–32.5%に留まった。文章量ではなく、正しい patch が満たすべき観測可能な振る舞いが探索の錨になる。

局所化の効果も単なる時短ではない。file reference を消した失敗では、正しい処理を別ファイルに実装する例が多かった。新しい symbol の置き場所や、似た module が複数ある場合、agent は仕様を理解していても変更責任の境界を誤る。したがって localization cue は答えのリークとして一律に嫌うより、「観測症状が属する subsystem」「関連 scene/script/test」までを提示し、具体的な修正行は探索に残す段階設計がよい。

構造だけで成績が落ちる点も実務的である。番号付き requirements を prose に潰すと部分実装が増え、Observed Behavior の見出しを消すと症状と期待値を混同した。見出しや箇条書きは装飾ではなく、agent が入力を constraint slots に分解するための機械可読な境界になっている。長文との負の関連も「短ければよい」ではなく、検証不能な背景説明が重要制約を埋没させる危険として読むべきだ。

ただし Study 1 は観察相関で因果ではない。feature は有無の二値なので、一行の suggestion と詳細な root-cause analysis を同じものとして扱う。SWE-bench Verified には学習時リークの可能性があり、Study 2 の requirements と interface は解決済み task から構成されたため、現実の reporter が最初から持つ情報ではない。さらに主実験は open-weight 2 family と minimal scaffold に限られ、異なる harness へ効果量をそのまま移せない。eligible set は baseline が解ける問題だけなので、報告される低下は一般 solve rate ではなく「解けていた問題のうち mutation で解けなくなった割合」である。

■ 自分達の環境への適用
ゲーム試作では、playtest の感想をそのまま coding agent に渡さず、修正可能な report へ変換する薄い変換層を置く。最小 template は、(1) Observed Behavior、(2) Expected Behavior、(3) headless で実行できる reproduction、(4) pass/fail を判定する assertion、(5) 関連 subsystem・scene・script・直近 commit、(6) crash log・seed・入力 trace、(7) 非目標、の順がよい。自由文は末尾の Additional Context に隔離し、見出しと番号を保つ。

headless 評価では、再現コマンドの exit code だけでなく、seed、frame/tick、入力列、状態差分、期待値を artifact として残す。視覚的不具合なら screenshot だけで終えず、camera pose、viewport、対象 node、許容差を添える。ゲーム固有の「面白くない」は直接 patch 条件にならないので、「入力から反応までの tick」「敵弾と背景の luminance 差」「初見死亡地点の集中」のように観測可能な proxy へ分解する。ただし proxy を設計意図そのものと取り違えない。

小さな検証として、同じ既知 bug 10件を A: 自由文、B: 構造化 report、C: B から localization cue を除去、の3条件で同一 model・同一 budget・各3回実行する。測るのは solve@3 だけでなく、正しい subsystem への初回到達 turn、無関係 file の閲覧数、再現成功率、wrong-file patch、budget exhaustion、回帰 test 通過率である。これなら本論文の主張を私達の game repository と harness 上で再検証できる。

■ メリット・デメリット
メリットは、playtest feedback から修正実行までの曖昧さを減らし、agent の探索 budget を故障箇所と期待挙動の検証へ集中できること。report の構造を固定すれば、失敗を model 能力だけでなく、再現不能・仕様不足・局所化不足・誤解釈に分けて記録でき、次の制作サイクルへ再利用しやすい。

デメリットは、良い report を作る側に観測・再現・期待値定義の負担が移ること。gold file を直接教えすぎれば探索評価を汚し、誤った localization は正しい探索を狭める。数値 proxy を強く固定すると、仕様を満たすが遊びとして悪い patch を量産しうる。また Qwen 型の budget exhaustion と Gemma 型の早期固定では必要な補助が違うため、単一 template だけで失敗を消せない。report と trajectory の両方を保存し、失敗様式別に追加情報を変える必要がある。

■ 判定
部分採用。Observed/Expected、実行可能な再現、判定可能な requirements、段階的 localization、見出し構造を AI 修正 issue の標準入力として採用する。一方、論文の効果量や gold-derived interface をそのまま一般化せず、既知 bug の3条件比較で私達の harness 上の探索効率と修復品質を確認してから運用を広げる。

■ URL
https://arxiv.org/abs/2607.07593
