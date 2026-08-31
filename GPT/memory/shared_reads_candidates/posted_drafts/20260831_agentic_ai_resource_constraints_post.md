■ 概要
この論文は agentic AI を model の正答率だけでなく、model・runtime・tool・memory・state 管理・retry・verification を含む complete system として評価し、達成した結果と、そのために消費した資源を attempt 単位で結ぶべきだと論じる。比較対象は、広い orchestration surface を持つ OpenClaw と軽量な NanoBot。双方とも gpt-4o-mini を用いるが、inference 設定、tool interface、実行環境の一部は同一ではないため、個別 component の効果ではなく記録された system configuration 全体の差を測っている。

primary layer は 100 prompt を各 system が一度ずつ実行する paired benchmark で、結果を failure、verifiable な途中成果を持つ partial completion、指定終端へ達した full completion に分ける。主指標は full completion。0 / 0.5 / 1 の ordinal mean は副指標で、失敗から partial と partial から full の距離が等しいとは仮定しない。prompt を単位とする paired bootstrap、McNemar test、非 tie の sign test を使い、task 構成に対する不確実性を見る。別の detailed layer は horizon を均した 23 prompt を意図的に選び、wall time と peak memory を対応付ける。少なくとも同じ outcome を、同じか少ない time・memory で得た時を weak dominance と定義する。

primary では OpenClaw が full 31/100、NanoBot が 25/100、差 6 percentage point だが、95% task-bootstrap interval は -3～15 point、McNemar p=0.286 で、一方の優位は確立しない。partial 以上も 52% 対 47%。一方 detailed では full が双方 6/23、partial 以上が 6/23 対 10/23。OpenClaw の median wall time は 34.063 秒、NanoBot は 10.446 秒、幾何平均比 2.98。median peak memory は 2926.6 MiB 対 136.1 MiB、幾何平均比 19.44 だった。少なくとも一方が進捗した 10 prompt では NanoBot が 8 件で weakly dominate した。全 23 件なら 18 件になるが、そのうち 10 件は双方失敗を安く終了した cost-only dominance である。結論は、capability と operational burden を同じ execution provenance に結び、技術的達成、system efficiency、組織的価値を別の評価段階として扱うべき、というものだ。

■ 内容分析
強みは paired design と評価粒度の分離にある。同じ prompt 内で system を比較するため、異なる task 集合の平均を並べるより task 難易度の交絡を減らせる。full completion を主指標にしつつ partial を捨てない設計は、最後まで動かなかった attempt にも再利用可能な進捗がある agent 開発と相性がよい。また「速いが失敗」と「同じ達成を少ない資源で得た」を dominance 集計で分離し、全 prompt の 18/23 という見栄えのよい数字を、進捗あり 8/10 と cheaper joint failure 10 件へ解体している。安い失敗は capacity 上の利点ではあるが capability の証拠ではない、という読み分けが明確である。

task-bootstrap interval が表すのは prompt 構成を変えた時の感度であり、同じ prompt を再実行した時の stochastic reliability ではない。各 system-prompt は 1 attempt だけなので、retry による成功率、分散、最悪 tail は測っていない。100 prompt では 17 category 中 9 category が 5 件未満で、horizon と category・環境要求も重なるため、「長時間だから失敗した」という因果結論も出せない。detailed 23 件は horizon を均しているが category と outcome の構成が残り 77 件と異なり、資源差を全 benchmark へ一般化できない。

さらに 23 件は primary と同じ prompt ID なのに、OpenClaw 8 件、NanoBot 10 件で outcome が一致しない。再実行、環境変更、再採点のどれかを記録から判別できず、論文自身も別 dataset として解析している。partial label は非 blind の単一評価者で inter-rater agreement がない。19.44 倍の memory 差も、記録 KB を KiB とみなし、両 system の collection scope が等しいという仮定に依存する。repository commit、完全な configuration、credential や authenticated session の等価性も不足し、CPU、token、金額は比較できない。したがって、この論文が強く支持するのは特定 harness の軽さではなく、「結果だけの benchmark では system の運用像を誤る」という評価設計である。

■ 自分達の環境への適用
ゲーム試作の attempt receipt を、結果・資源・provenance の三層にする。結果層は、full を「起動、主要操作、終了条件、成果物保存まで満たす playable build」、partial を「build 成功、特定 mechanic の headless test 通過、再利用可能な asset / code 生成など、事前定義した検証可能な途中成果」、failure を「検証可能な進捗なし」と定義する。full と partial の条件は実行後に甘く付けず、task 開始前に固定する。画面でしか確認できない操作感や可読性は headless pass と別欄にする。

資源層には wall time、peak working set、model token / 推定費用、tool call 数、retry 数、人間の修正時間を可能な範囲で記録する。安い failure は efficiency 欄では評価しても capability point には加えない。provenance 層には prompt、model / harness version、commit、build artifact、seed、実行環境、evaluator version、終了理由を結ぶ。これで「完成率は同じだが memory が重い」「途中成果は多いが最終統合で落ちる」「安く早く失敗しているだけ」を分けられる。

比較 probe は同じ 12～20 件の小課題を二つの workflow に paired で割り当て、短・中・長 horizon を含める。まず各 1 attempt の探索比較を行い、その後、代表課題だけ 3 seed / 3 retry で repeated-run reliability を測る。集計は full rate、partial-or-better、outcome transition、成功時だけの time / memory、全 attempt の消費、双方失敗を除いた dominance を併記する。partial 判定は artifact への link と自動 check を必須にし、境界例だけ人間 review する。これを playable diff と同じ receipt に保存すれば、Phase 2 の評価と Phase 4a の記憶整理が同じ証拠を参照できる。

■ メリット・デメリット
メリットは、完成率一つで消える有用な途中成果と運用負荷を可視化できること、同一 task の paired 比較で workflow 差を読みやすくできること、time / memory budget ごとの達成曲線から並列数や timeout を決められることにある。成功 artifact と実行条件が結び付くため、後から費用対効果や再現性も監査しやすい。

デメリットは、partial の定義が曖昧だと都合のよい採点になること、peak memory だけでは GPU、CPU、token、tool latency、人間 supervision を覆えないこと、単発実行の paired interval を安定性と誤認しやすいことだ。資源計測自体にも instrumentation cost があり、環境や credential が非対称なら harness 差に見える。組織的価値は、速さや memory から直接推定せず、修正・統合・保守・失敗損失を別に測る必要がある。

■ 判定
部分採用。採るのは full / partial / failure の事前定義、paired task、成功を伴う resource efficiency、attempt-level provenance の四点である。19.44 倍などの system 固有値は一般化しない。まず既存の playable / headless receipt に欄を追加し、少数 task の repeated probe で、計測コストに見合う識別力があるか確認する。

■ URL
https://arxiv.org/abs/2608.27886
