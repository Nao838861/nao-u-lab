■ 概要
LLM ゲームエージェントの低勝率を、空間認識、ルールの因果的な理解、計画長、実行待ち時間へ分解して測った研究。実験基盤は、ゲームルールを VGDL、盤面を記号グリッドで表す GVGAI である。著者らは空間課題だけを段階化した 3 ゲームを作った。Game 1 は迷路から出口へ行く経路探索、Game 2 は鍵を取ってから出口を開ける順序制約、Game 3 は赤・青の鍵と対応する扉を処理して最終目標へ行く複数前提の課題である。各ゲームに 6×6 から 10×10 までの 5 level を設け、壁、隘路、必要手順を増やした。

評価は二段構えになっている。まず avatar を空きマスへランダムに移した盤面から、自分の正確な座標を答えられるかを測る self-localization 実験を行う。3 game × 5 level × 10 配置 × thinking の有無、計 300 query/model である。次に Qwen3 の 0.6B、1.7B、4B、8B を使い、thinking on/off、因果情報 on/off、planning horizon H=1/5/10 を組み合わせ、各条件を 2 trial 実行する。因果情報は単なる攻略文ではなく、EntityTypes、ActionSpace、InteractionMechanics、StateVariables、Reward、Termination とそれらの辺・式を JSON にした SCM 風の構造で、VGDL と level から事前生成して prompt に足す。指標は勝率、win/loss/timeout のいずれかへ到達した completion rate、平均応答時間/step である。

全条件平均では、Game 1/2/3 の勝率は 0.33/0.24/0.17、level 0→4 は 0.40/0.27/0.25/0.19/0.12 と下がり、段階設計は期待どおり難しくなった。正確な座標同定は小型 model で特に弱く、0.6B はほぼ失敗した一方、座標を正確に言えなくても局所的な相対関係で勝てる例があった。介入別では、因果情報は勝率 0.246→0.250 と全体効果が小さいが、8B では 0.411→0.433、平均時間は 46.610→29.716 秒/step となる。thinking は勝率を 0.078→0.433 に大きく上げる一方、completion を 0.986→0.597、時間を 0.544→85.776 秒/step へ悪化させた。planning horizon は H=1/5/10 で勝率 0.178/0.262/0.310、completion 0.766/0.807/0.829、時間 53.084/40.292/29.864 秒/step となり、固定された決定論的盤面では長めの一括計画が最も一貫して有効だった、というのが論文の結論である。

■ 内容分析
この研究で価値が高いのは、最高勝率より「失敗の所在を切り分ける実験順序」にある。self-localization と実プレイを分け、絶対座標の不正確さと行動失敗が同一ではないと示した。これは headless agent の失敗を、観測、自己位置、前提順序、経路、action format、timeout に分類すべき根拠になる。また Game 3 では、agent が最終 goal を見つけると途中の鍵と扉を無視して直行しがちだった。目標認識と、必要条件を満たす計画の間に断層がある。総 score や最終勝敗だけでは、この「終点への貪欲さ」を能力と誤認する。

一方、因果 prompt の効果を一般処方として読むのは危険である。全 model 平均の勝率差は 0.004 にすぎず、4B では 0.339→0.289 と悪化し、1.7B でも改善は 0.235→0.247 に留まる。構造化すれば常に賢くなるのではなく、追加 context を行動へ結び付けられる model scale と prompt 適合性が要る。しかも SCM は agent が gameplay から学んだものではなく、VGDL と level を材料に別の LLM が事前生成した情報である。未知 mechanics の推定力というより、正しいルール構造を与えた時に利用できるかの検査だと解釈すべきだ。

planning の速度改善にも注意が要る。H=10 は一度の生成で最大 10 action を返すため、生成コストを action 数で割った平均時間が下がるのは部分的に償却効果である。それでも実運用上の throughput 改善には違いないが、「長く考えるほど推論自体が高速化した」証拠ではない。さらに盤面は静的で、移動敵、hazard、途中で変わる経路がない。open-loop の 10 手が壊れにくい条件だから成立しており、動的ゲームへそのまま移すと観測更新を捨てる危険がある。著者ら自身も、将来は各 plan に abort condition を付け、変化時に早期 replan する guarded planning が必要だとしている。

統計的にも、各組合せ 2 trial、3 game × 5 level の小規模 benchmark で、信頼区間や有意差検定は示されない。temperature も standard 0.7、thinking 0.6 と異なり、thinking 差には mode 以外の sampling 条件が混ざる。completion は「勝利」ではなく loss や timeout も含むため、高いほど良い能力指標とは限らない。thinking off の completion 0.986 と低勝率 0.078 の併存は、素早く失敗状態へ到達した run まで完了として数える定義の弱さを表す。勝率、終了理由、行動数、wall-clock を必ず別々に読む必要がある。

■ 自分達の環境への適用
自動 playtest harness へは model や prompt の数値を移植するのではなく、診断軸を移植する。まず同一 mechanics の小さな level family を 5 段階ほど作り、広さだけでなく、隘路数、鍵などの前提数、分岐数、必要な backtrack を一軸ずつ増やす。各 run では最終勝敗に加え、観測から抽出した自己位置、選んだ局所目標、未充足 prerequisite、出力 action の parse 成否、replan 理由、step latency を JSONL に残す。これで「難しい level で落ちた」を、位置推定、前提管理、経路、interface、時間制約のどこで落ちたかへ変えられる。

最小 probe は、既存の headless 対応ゲーム 1 本から静的な 3 layout を切り出し、同一 agent を H=1 と H=5 で各 10 run 比較する。H=5 は plan と同時に「再計画条件」を出させ、想定位置と実位置の不一致、対象消失、blocking event、action parse 失敗のいずれかで即座に破棄する。見る値は win-rate だけでなく、valid action ratio、prerequisite violation、unnecessary step、LLM call 数、p50/p95 latency、1 勝あたり wall-clock cost とする。さらに self-localization query を別枠で挟み、座標 exact match が低いのに勝てるなら、絶対座標を強制するより相対表現や path waypoint の方が適していると判断できる。

記憶システムにも同じ分解を使える。失敗 atom を「agent が弱い」という総括で閉じず、observation grounding、causal rule retrieval、plan horizon、execution contract、latency budget のどれに属するかを evidence 付きで記録する。因果情報は全文を常時注入せず、現在の goal に関係する interaction、reward、termination、failure condition だけを retrieval する。小型 model で情報追加が逆効果になり得るため、context を増やす処方には必ず無注入 baseline を置く。

■ メリット・デメリット
メリットは、単純な勝率ランキングではなく、難易度勾配と介入を組み合わせて失敗を診断可能にしたこと、VGDL・symbolic grid・open model・補足コードにより再現経路があること、品質だけでなく step latency を同じ表で扱ったことにある。特に「正確な自己位置を答えられないが局所情報で進める」「最終 goal は見えるが prerequisite を飛ばす」という観察は、playtest agent のログ設計に直結する。長い plan を action call の償却として評価する視点も、headless 周回のコスト設計に使える。

デメリットは、固定された小さな 2D 盤面、Qwen3 4 系統、各条件 2 trial に限られ、一般ゲームや視覚入力への外的妥当性が弱いこと。causal context は事前にほぼ正しい構造を生成できる前提で、online rule discovery の評価ではない。thinking と temperature が同時に変わり、completion 指標も loss を含む。H=10 の成功は静的環境での open-loop 実行に依存し、動的対象や操作ノイズがあるゲームでは逆転し得る。したがって「SCM を足す」「10 手まとめる」を規則化するのではなく、分解評価と guarded replanning だけを先に採るのが安全である。

■ 判定
部分採用。空間認識、前提管理、計画長、action contract、latency を分ける benchmark 設計は、自動 playtest と記憶の失敗分類へ直接採用する。因果 prompt と固定 H=10 は model・game 依存が大きいため処方としては採用せず、無注入 baseline と abort condition 付きの小規模 probe で再検証する。

■ URL
https://arxiv.org/abs/2607.22732v1
