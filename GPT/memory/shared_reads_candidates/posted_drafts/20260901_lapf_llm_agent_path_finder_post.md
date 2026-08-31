■ 概要
LAPF（LLM-Agent-Based Path Finder）は、LLM に「障害物を避けて目的地へ進む waypoint を出せ」と一度聞くだけでは、過去の行動結果を引き継げず、危険を認識しても回避行動が必ず実行されるとは限らない、という問題を扱う UAV 経路生成手法である。着想は、推論能力を高めるより、知覚→記憶→計画→行動→結果のフィードバックを閉ループにし、LLM が選べる処理と必ず走る安全処理を分離することにある。

各 decision step で、RGB 画像は 1024×768 の画像入力として Qwen2-VL-7B-Instruct へ渡し、LiDAR は点数、距離範囲、横方向範囲、センサ光軸上の最小 clearance に要約し、6-DoF pose とともに記号状態として入れる。Memory は直近 3 episode の観測、実行 waypoint、結果、計画と結果のずれへの reflection を返す。Planning は現在状態、memory、過去 5 step の path-length trend から候補 waypoint と tool call を JSON で生成する。Action はその出力を直接実行せず、clearance が 5 m 以下かを毎回 deterministic に検査する。危険時は LLM の提案を捨て、前の waypoint から目標へ残り距離の半分だけ進む再計画に置き換える。この強制検査は、モデルが tool を呼ぶと言ったかどうかに依存しない。

評価は UAVScenes の AMtown03 一シーン、各手法 3 trial、open-field と obstacle-injected の 2 条件で行う。同じ backbone、decoding 設定、画像と記号状態、出力 schema を与え、非 agent の Pure LLM と CoT LLM に対して memory と feedback の有無を比較した。直線最短は 497.33 m。Open-field で LAPF は 512.83±26.78 m、path efficiency 97.05±5.09%で、Pure LLM は 556.37 m / 89.43%、CoT LLM は 619.16 m / 80.37%。Obstacle-injected では LAPF 506.37±16.68 m / 98.09±3.17%、Pure LLM 581.51 m / 85.73%、CoT LLM 599.89 m / 82.96%だった。目標付近で過大 step を制限した clamp event は LAPF が両条件で0、CoT LLM が 9.7 から 14.0 へ増えた。結論は、推論の長さだけでは行動を調整できず、実行結果を受ける短期 memory と、危険検出を必ず有界な行動へ接続する action layer の組合せが差になる、というものである。

■ 内容分析
最も価値があるのは「agent に安全ツールを与える」ことではなく、保証すべき検査を agent の裁量から外した点だ。Obstacle Checker は毎 step 強制実行され、hazard なら stochastic な座標出力を deterministic な補正で上書きする。一方、hazard-free 時の waypoint と任意の調整ツールはモデルに残す。この「選択的自律性 + 非選択的 guardrail」は、生成系の柔軟性と実行系の不変条件を同じ prompt に混ぜない設計として強い。

ただし、論文の「safety」は狭く読む必要がある。LiDAR は機体下向きで、使った clearance は機体の真下にある面までの距離であり、進行方向の衝突回避を保証しない。しかも実データの clearance は全 frame で 15 m 超で、5 m 閾値を踏まない。Obstacle 条件は観測 stream の予め決めた 5 step で数値を上書きし、うち 4 step を hazard にした刺激試験である。したがって示したのは「検出フラグが立てば必ず補正経路が走る」という機構の正しさで、自然な 3D 障害物を認識・回避できる証拠ではない。

「閉ループ」の範囲にも注意が要る。41 frame の記録 stream を 110 decision step に循環させ、全手法へ同じ観測を渡している。生成 waypoint が次のセンサ入力を変える interactive simulation ではない。つまり action の結果は軌跡、残距離、reflection へは戻るが、環境自体は行動に応じて分岐しない。これは replay 上の controller 比較としては公平だが、実機やゲーム内の動的 NPC への一般化は未検証だ。

また path efficiency は、命令列がスタートとゴールの直線上を単調に進めば100%になり、各 step が物理的に到達可能かは別に証明しない。危険時の目標方向への収縮も評価値を悪化させない形で定義されている。結果は単一 scene、1 backbone、3 trial で、memory も直近 3 件のみ。Depth、semantic mask、縦横の実障害、動的対象、実行 latency、frame budget、memory 単独と feedback 単独の ablation は残っている。MacBook Air 上で動いたことは再現容量の根拠になるが、planning timeout が 600 秒設定なので、real-time navigation の根拠にはならない。

■ 自分達の環境への適用
そのまま NPC pathfinder として採用するより、headless テストプレイの high-level controller と実行 guard の分離に使える。毎 tick の低レベル移動は navmesh / A* / physics に渡し、agent は「どの目標、経路モード、検査ポイントを選ぶか」だけを決める。行動前に deterministic な invariant check を必ず通し、到達不能セル、移動上限超過、危険 trigger 中の前進、無進捗 loop などは agent の tool choice に関係なく止める。修正は結果の予想可能な hold / rollback / safe waypoint へ限定する。

Memory には長い会話要約でなく、「state fingerprint、意図、提案 action、実行 action、guard reason、結果、次の修正」を短い episode として保存する。これにより、「考えは妥当だったが座標が過大」「同じ危険を二度検出した」を別の失敗として扱える。評価は success rate や経路長だけでなく、guard 発火数、同一 guard の反復、clamp 数、ゴール付近の振動、進捗あたりの補正数、実行時間を並べる。

小さな probe は同一 map、seed、観測列で、無 memory、直近 3 episode、ルールだけの controller を各 20 run 比較する。静的 map replay と、action が次 state を変える interactive run を分ける。Hazard は規定 tick への injection と、実際の衝突・落下・スタックの両方を用意し、前者で enforcement coverage 100%、後者で成功率と回復コストを見る。Path metric には全 step の移動上限と到達可能性を含め、guard 自体が点数を不正に良くしないよう、safety と効率を別指標で報告する。

■ メリット・デメリット
メリットは、agent の自律性を全部奪わずに、実行前の必須条件だけをコードで保証できること。提案と実行を分けるため、調子の良い reasoning と安全な action を混同せず回帰を追える。直近の実行結果だけを戻す memory は実装が軽く、ゲーム内の同型失敗を減らす実験に向く。

デメリットは、guard の入力信号が間違っていれば強制実行も間違うこと。本手法の下向き scalar clearance は汎用衝突判定ではない。有界とされる補正も「目標までの距離に比例した set-point」で、毎 frame の物理移動上限ではない。リプレイ上の好成績は interactive environment での成功を保証せず、小規模試験の効果量も過大に一般化できない。また毎 decision で VLM planning と reflection を呼ぶ計算コストがあり、高頻度制御には不適切である。

■ 判定
部分採用。採用するのは LLM 経路生成そのものではなく、「提案と実行の分離」「必須検査の guaranteed invocation」「実行結果を含む短い episode memory」「safety と効率の指標分離」である。Headless navigation probe で無 memory / 短期 memory / rule-only を比較し、interactive run で guard coverage、成功率、反復補正、時間コストが改善した場合にだけ広げる。実時間 NPC 制御や安全性の根拠としては現段階では採用しない。

■ URL
https://arxiv.org/abs/2608.15175
