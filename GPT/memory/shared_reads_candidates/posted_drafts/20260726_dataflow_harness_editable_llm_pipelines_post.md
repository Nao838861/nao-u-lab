■ 概要
DataFlow-Harness は、自然言語からデータ処理を自動化する coding agent が、動くが使い捨てになる Python script を生成しがちで、運用基盤上の永続・可視・再編集可能な workflow を残せない問題を「NL2Pipeline gap」と定義した研究である。中心の着想は、agent に自由形式の code を一括生成させず、稼働中 platform の operator registry と現在の pipeline state を見せ、型付きの小さな mutation を順に適用させて platform-native な DAG を組ませることにある。

構成は四層に分かれる。Data Pipeline Backend が pipeline の正本を持ち、data source、operator、edge、入出力 schema、model endpoint 等の runtime state を管理する。MCP Tools Layer は state 取得、operator 追加・削除、parameter 更新、edge 接続を型付き tool として公開し、各変更を Request–Validate–Commit で処理する。変更後の graph が非巡回であり、隣接 operator の field schema が互換な時だけ commit する。DataFlow-Skills は schema 推論、operator 選択、parameter 設定、serving 確認といった手順知と、modality・nested field の接続規約を agent に与える。DataFlow-WebUI は会話画面と visual DAG editor を同じ backend state に同期し、人間の直接編集を次の agent turn に即座に反映する。

評価は QA 生成、review governance、長文処理、複数 field の scoring、schema 正規化、低品質除去の六領域・12 task で、全構成に Claude Opus 4.7 を使い、各 task を10回、1方式あたり120 run 実行した。比較対象は自由な script を書く Vanilla Claude Code、DataFlow codebase を読める Context-Aware Claude Code、live operator は使えるが手順知を持たない MCP-only、完全版 Harness の四つである。task 固有の受入条件まで通す E2E Pass は順に91.7%、94.2%、83.3%、93.3%。Harness は Context-Aware より0.9 point低いだけで、Vanilla 比の費用を0.950ドルから0.261ドルへ72.5%、生成時間を190.7秒から95.5秒へ49.9%削減した。

task 別 ablation では、暗黙手順を要する QA 系三 task が MCP-only の18/30から Skills 付き29/30へ上がる一方、単純 routing は双方40/40、複数 field scoring は双方14/20だった。手順知は operator 説明だけで組立順を復元しにくい課題には効くが、単純な課題や下流 model の数値違反には効かない。textbook-to-VQA では precision 97.2%、coverage 87.3%を記録したが、下流学習の改善は独立 pipeline・複数 seed を反復していない予備的 case study である。

■ 内容分析
重要なのは DAG 生成自体ではなく、agent と人間が同じ永続 artifact を交互に編集し、変更を live registry に接地したことだ。毎 turn に正本を再取得し、operator を registry から発見し、mutation 単位で検査して commit する。これにより出力を code block ではなく、後続工程が継続利用できる共有制作物へ変えている。

一方、93.3%という値を「型付き DAG なら script より信頼できる」と読むのは早い。自由 code と platform operator では action space が違い、Harness は成熟した operator ecosystem を再利用できる。比較が示すのは model 単体の能力差ではなく、platform 全体の費用対成功率である。また validation が保証するのは acyclic と隣接 schema の互換までで、semantic correctness、endpoint availability、出力品質は保証しない。実際、複数 field scoring は正しい graph を作っても出力が数値制約に違反し、Skills で改善していない。構造の正しさと生成結果の正しさを別 gate にする必要がある。

Skills の結果も「詳しい指示を増やせば常に良い」ではない。暗黙手順を要する三 task では大幅改善したが、review governance は10/10から9/10へ下がり、複数の有効な経路がある時は prescriptive な手順が柔軟性を削る可能性がある。しかも ablation は MCP-only と完全版の比較なので、Skills、validation、prompt 構成の寄与を分離できない。12 task・単一 agent/model family、task cluster を考慮した信頼区間なし、non-inferiority test なしであり、「Context-Aware と同等」は観測値が近いという範囲を出ない。

下流学習は平均精度を1.2〜2.3 point上げたが、個別 benchmark では負ける列もあり、独立 pipeline・複数 seed の反復もない。persistence、reuse、provenance、同時編集、障害回復も直接評価されていない。実証が強いのは「限定された operator 空間で編集可能な artifact を比較的安く構築できる」点で、長期統治効果は未検証である。

■ 自分達の環境への適用
ゲーム制作では、level、quest、dialogue、asset metadata の生成を agent が毎回 script に埋め込むのではなく、型付きの制作 DAG として残す形に移せる。ただし最初から汎用 editor を作る必要はない。最小 probe は一つの短い prototype を対象に、`pipeline.json` を正本とし、operator を `load_seed`、`generate_layout`、`validate_reachability`、`simulate_headless`、`render_preview`、`collect_playtest` 程度に限定する。agent は add/update/connect の mutation だけを発行し、validator が cycle、必須 field、input/output type、参照 file の存在を検査してから保存する。

validator は二層にする。構造層では playable build の先行、build revision の一致、全 operator の到達可能性を決定的に検査する。体験層では clear rate、入力停滞、到達不能 state、seed 再現性を測り、最後に人間 playtest で面白さと操作感を判定する。schema 通過を出力品質の代理にしない。

Skills は task ごとに増殖させず、operator 説明だけでは復元しにくい制作手順に限定する。たとえば「変更前に seed と評価条件を固定する」「level 変更後は reachability と短時間 headless trace を取る」「playtest feedback と build revision を結ぶ」といった手順である。field rename のような自明な操作まで skill 化しない。効果は MCP-only 相当の tool metadata だけの条件と比較し、成功率だけでなく input token、修正 mutation 数、破棄された変更数、playable diff までの時間を記録する。

記憶システムでは candidate、raw source、Phase 2 判定、投稿、Slack permalink を別 artifact として結び、根拠変更時の stale 範囲を特定する。まず既存 sidecar と lifecycle audit を read-only graph view に写し、検出不整合数と更新時間が減るかを測る。

■ メリット・デメリット
メリットは、生成結果が再編集・監査・部分再実行できること、人間編集と agent 編集が同じ state に収束すること、存在しない operator や不正接続を commit 前に止められること、自由 code より context と token を圧縮できることだ。task 別結果から、暗黙手順を reusable skill に切り出す対象も選びやすい。

デメリットは、operator catalog と schema の設計・保守費用、platform 固有能力への固定、自由 code なら可能な例外処理を失うことだ。構造検査を品質保証と誤認しやすく、skill が過剰だと有効な別経路を妨げる。論文の費用値は prompt caching の token class 内訳がなく独立再計算しにくい。少数 benchmark の成功を、長期の共同編集やゲームの面白さへそのまま外挿できない。

■ 判定
部分採用。共有 artifact、live state 再取得、型付き mutation、commit 前 validation、手順知と tool metadata の分離は採用する。DataFlow platform 全体や visual editor は移植せず、まず単一 prototype の小さな DAG で、修正時間・再現性・headless failure の局所化が改善するかを比較する。

■ URL
https://arxiv.org/abs/2607.16617
