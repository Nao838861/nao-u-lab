■ 概要
対象は Western University の Eric Buitron-Lopez と Roberto Solis-Oba による “A Memory-Driven Action Selection Framework for Scalable Ambient NPC Behavior”。IEEE Conference on Games 2026 採択予定の研究である。open-world game の背景 NPC には、反復せず、天候や時刻に合い、中断後も止まらない生命感が欲しい。一方、数百体へ GOAP、HTN、utility scoring を毎回走らせると frame budget と調整工数が重い。FSM や behavior tree は軽いが反復を見抜かれやすい。著者らはこの間を、深い知能ではなく小さな履歴で埋める。

行動定義は action、nested sequence、end node を持つ有向グラフで、transition と action へ precondition を付ける。NPC 自身、相互作用対象、時刻・天候を共通の state operation で比較・更新する。複数の transition または対象が有効な時だけ bounded memory で選ぶ。記憶は、遷移を sequence 文脈付きで残す transition memory、action に使った対象を残す action memory、中断した action・node・対象を復帰用に残す interruption memory の三種である。

選択則は、有限記憶にない候補を優先し、全候補が記憶済みなら timestamp が最古の候補を選ぶ。同順位だけランダムに崩す。容量超過時は最古の記録を捨て、しばらく使っていない経路を候補へ戻す。「最善」ではなく「直近にしていないこと」の優先である。player の shout では中断文脈を保存して復帰し、bench が全部埋まるなど経路が失敗すれば fallback sequence を起動する。連続失敗が閾値を超えた NPC は停止し、設定ミスによる毎 frame の再試行を防ぐ。

実装は JSON 定義を読む C++ DLL と C API。同一 DLL を Unity と Unreal Engine へ接続した。Unity の marketplace は 30 NPC、Unreal の dance club は 10 NPC。性能試験は Unity Editor 上で 50 / 100 / 150 / 200 NPC、30 秒 warmup 後に 60 秒、各条件 5 run、全 NPC を毎 frame 走査した。200 NPC では平均 0.305 ms、P50 0.203 ms、P99 1.173 ms、実測 frame time の 3.41%。transition 選択 3.50 µs/call、対象選択 3.86 µs/call、precondition 評価 1.26 µs/call に対し、位置同期と action 開始は 200 µs/call を超え、支配的コストは engine boundary にあった。

■ 内容分析
価値は「背景 NPC の賢さ」と「背景の反復感」を分離した点にある。遠目の vendor や通行人には、最適な長期計画より、同じ順序で動かず、環境に反せず、棒立ちしないことが効く場合がある。記憶を decision point ごとの recency cache に限定し、個体差を per-character script なしで作れる。

ただし「sub-linear scaling」は一般の計算量を証明していない。50 から 200 NPC で平均更新対象は 0.2 から 0.8 NPC/frame。action が通常 3〜10 秒、100 FPS 超なので、多くの frame は登録 NPC の走査だけで終わる。200 NPC の同時 decision 最大は 19〜36 体だった。短い action の連鎖、全員が event で一斉遷移する場面、高価な位置 query では別の分布になる。P99 は良いが、最大 hitch、standalone build、低性能 CPU、Unreal 同数比較は未評価である。

より大きい穴は「多様に見える」が定量化されていないこと。marketplace は著者自身の観察で、entropy、同一遷移の連続率、unique path 数、player の知覚を測っていない。utility、behavior tree、random、round-robin との比較もない。計算コストは具体的だが、見た目の改善量はまだ仮説に近い。また最長未使用優先は選択肢を均等に消化しやすい。現実らしさに必要な「よくする行動／めったにしない行動」の偏りがなく、長時間では機械的な巡回に見える可能性がある。

内部 timestamp は wall-clock なので、pause、slow motion、debug stop、hitch で simulation とずれる。距離 precondition の設定ミスが memory algorithm の bug に見えた事例もある。記憶は個体の action history だけで、player との過去、NPC 間関係、群れ、goal、utility、personality は持たない。主要 NPC の意思決定系へ昇格させないことが重要である。

■ 自分達の環境への適用
適用先は「画面の周縁にいる 10〜50 体」の ambient 層に限る。action graph の分岐へ `(npc_id, sequence_id, decision_id, option_id, last_used_tick)` の有限履歴を足す。乱数 seed と simulation tick は engine から注入して replay を deterministic にし、wall-clock は使わない。長期 goal、戦闘、物語上の約束は別 logic に残し、この層は「許可された行動の反復抑制」だけを担当する。

headless probe は、同じ graph と seed 群で fixed-order、uniform random、least-recently-used を各 1000 decision 走らせる。同一 action 連続率、window 内 unique transition、entropy、precondition 違反、fallback 率、P50 / P99、memory bytes/NPC を分ける。頻度 weight 付き authored baseline も置き、「多様だが職業らしくない」を検出する。晴雨、空席あり／全席占有、全 NPC 同時 interruption を fixture 化し、文脈適合と spike を同じ regression test で見る。

behavior JSON には lint を置く。到達不能 node、fallback の不成立、過大な memory capacity、距離単位の不一致、end / fallback へ到達不能な graph を静的検査する。runtime trace には候補、除外理由、選択 option、参照 memory、fallback 原因を残し、graph、condition、memory、engine callback のどこが原因かを切り分ける。

■ メリット・デメリット
メリットは、既存 graph へ局所追加でき、個別 script や utility curve 調整なしで反復を抑えられること。memory 上限と µs 単位の core 実測があり、予算を見積もりやすい。interrupt、resume、fallback、failure safeguard まで扱い、「止まらない背景」を設計している。C API と JSON は engine 差分を wrapper に閉じ込めやすい。

デメリットは、多様性が知覚品質として未検証で、性能も単一 PC・Unity Editor に偏ること。最長未使用は「最近していない選択」であり、goal や頻度分布が重要な NPC には弱い。main-thread 全走査、interop、手書き JSON、wall-clock も負債になる。3.41% は ambient decision だけで、navigation、animation、perception、combat を含む AI 全体の余裕は保証しない。

■ 判定
部分採用。bounded recency memory を、ambient NPC の action graph における反復抑制器として採用する。主要 NPC の planner や社会記憶の代替にはしない。導入条件は simulation time と seeded RNG、静的 lint、fixed/random baseline を含む headless 比較、P99 と一斉 interruption の spike 計測である。まず 10〜50 体の背景 NPC で「反復率が下がる」「文脈違反と fallback 増加を起こさない」「frame budget 内」を同時に満たすか検証し、通った場合だけ再利用可能な層へ昇格する。

■ URL
https://www.csd.uwo.ca/~ebuitron/
https://www.csd.uwo.ca/~ebuitron/downloads/ProjectReport.pdf
https://github.com/EricBL3/ambient-npc-behavior-framework
