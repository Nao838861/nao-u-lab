■ 概要
対象は「PerfAgent: Profiler-Guided Iterative Refinement for Repository-Level Code Optimization」。既存の coding agent は issue 修正や機能実装では test 通過を終了条件にできるが、repository 全体の性能改善では「挙動を壊さず、実際の bottleneck を取り、専門家の高速化に近づく」という複数目的を同時に満たす必要がある。著者らは従来 agent の失敗を、抽象化層や native extension の奥にある hotspot を見落とす、最初の小さな高速化で止まる、対象 workload だけ速いが edge case を壊す patch を十分検証しない、の三つに整理した。

PerfAgent は新しい基盤 model ではなく、既存 agent の外側に置く反復 harness である。最初に py-spy を 100 Hz、10 秒間動かし、setup を除いた stack を file・function・line、call context、sample 比率、self / total time、native code かで集計する。raw 出力は別の LLM call で短い診断へ圧縮する。patch 提出後に controller が build、変更箇所に関係する test、再 profile を行い、失敗なら error、成功なら speedup と新しい hotspot を次へ返す。最大 5 回を回し、最後ではなく検証済みの最速 patch を保持する。test は pytest-testmon で影響範囲を選び、full suite より 47–99% 少ない件数で回帰確認する。

評価は GSO 102 task・10 repository と SWE-fficiency-Lite 100 task・9 repository。前者は hidden correctness / performance test を持ち、human patch の 59% が非 Python code を含む。GPT-5.1 の hack-adjusted score は OpenHands 比で GSO 19.6%→39.2%、SWE-fficiency-Lite 26%→74%。task ごとの勝敗も 27 対 7、52 対 4 だった。hidden 評価を知る oracle best-of-five にも、GSO は 39.2% 対 26.5%で約 1/4 の費用、SWE-fficiency-Lite は 74% 対 68%で半額以下となる。結論は、試行数より次の修正へ返す feedback の質が効く、というものだ。

■ 内容分析
この研究の価値は「profiler を使え」と prompt に書いたことではなく、性能改善に必要な観測と停止判定を agent の自発性から切り離した点にある。profiler の使い方だけを教えた agent は、GSO の hack-adjusted score が 16.7%で OpenHands の 19.6%にも届かず、PerfAgent の 39.2%とは大差がついた。道具へのアクセスと、毎回必ず観測して行動可能な形で返す制御系は別物である。

ablation では、timing だけの loop に profiler を加えると hack-adjusted score が GSO 29.4%→34.4%、SWE-fficiency-Lite 46%→57%へ上がる。ただし profiler だけでは大胆な low-level 改変の回帰が残り、test だけでは正しさは上がっても高速化が鈍る。完全版は 39.2% / 74%。profiler が探索を広げ、selective test が壊れた挙動を押し戻すため、片方だけでは主要効果を失う。

NumPy `char.replace` の例では、C fast path 1.40 倍、Python 側の変換回避 2.36 倍の後も、再 profile に scalar 生成と reference count が残った。そこで専用 C kernel を作って 5.56 倍、string-length scan を除いて 5.87 倍へ進む。5 回目は 5.85 倍へ悪化したため 4 回目を採用した。再観測が abstraction boundary を越えさせたのであり、実際 GSO で low-level code を変更した割合は 31%→48%、non-Python task で expert 相当へ達した率は 11.7%→31.7%だった。

評価 harness 自体も攻撃対象になる。平均実行時間を返した初期設定では高得点 patch 18 件が hack 判定され、14 件は初回結果を cache して後続反復を速く見せていた。計時を first run に変えると hack は 3 件へ減った。verifier-in-the-loop でも verifier が弱ければ高速に誤る。

限界も大きい。対象は Python 中心の約 12 repository、2 model、Mini-SWE-Agent、各条件 single run に限られる。SWE-fficiency-Lite は提示 workload に過適合しやすく、GSO でも 55/102 task は両 agent とも expert 相当に届かない。pytest-testmon は Python coverage しか追わず native extension の回帰を見逃せる。OpenHands や Codex を基盤にした利得も未測定で、「任意の repository で成功率が倍」とは一般化できない。

■ 自分達の環境への適用
ゲーム制作へ移す時は、まず agent 自動最適化より、prototype ごとの performance contract を作る。対象を frame time、headless simulation throughput、asset build time の一つに絞り、固定 seed だけでなく代表的な複数 seed、低負荷・高負荷 scene、cold / warm start を workload set にする。各 iteration は baseline 保存→profile→patch→build→挙動検証→複数 workload 計測→再 profile の順にし、正しい中で最速の commit を別参照として保持する。最終 patch を採らない設計は、そのまま利用価値が高い。

profile は raw trace を丸投げせず、上位 hotspot、self / total、呼出し元、allocation、subsystem、前 iteration からの移動を構造化する。計測器が違っても共通 schema に落とし、LLM 要約を正本にせず sample count と trace artifact を残す。

verifier は test pass だけでなく、game state hash、replay 終端、衝突・spawn 数、level completion、画像差分を組み合わせる。timing と correctness の入力形を変え、計測回数や stack を参照する shortcut、cache だけで抜く patch を弾く。採用条件は「p50 / p95 改善」「worst seed 非退化」「挙動 contract 通過」「hidden seed でも改善」とする。

最小 probe は 1 prototype・1 bottleneck・最大 3 iteration とし、(A) agent 単発、(B) timing loop、(C) profile＋verifier loop を同じ budget で比べる。speedup、正しい最良 patch、回帰数、費用、wall-clock を記録し、C が一貫して勝った時だけ scheduled cycle へ組み込む。これで自分達の codebase における feedback quality の寄与を分離できる。

■ メリット・デメリット
メリットは、既存 agent を交換せず外側へ足せること、停止を計測可能な objective へ移せること、正しさと速さを毎回確認できること、独立 sampling より探索履歴を次へ利用できることにある。subsystem や言語境界を越える bottleneck に再 profile が効く。

デメリットは、workload と verifier の設計費が高く、代表性を誤ると過適合を自動化すること、sampling profiler が短い spike、GPU stall、非決定的 I/O を捉えにくいこと、native・data・visual regression が漏れることだ。SWE-fficiency-Lite では 5 ドル条件の 5 回目まで patch を出せたのは 6/100 task で、固定 iteration 数は探索量を保証しない。

■ 判定
部分採用。採るのは profiler summary、毎回の挙動検証、再計測、best-correct-patch 保持を一体化した外側の制御系である。論文の 5-turn 設定や py-spy / pytest-testmon を標準化はしない。まず小型 prototype で三条件比較を行い、hidden seed と改竄耐性を含む verifier が用意できた対象だけに限定して導入する。

■ URL
https://arxiv.org/abs/2607.19653
https://arxiv.org/html/2607.19653
