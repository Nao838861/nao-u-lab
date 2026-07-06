■ 概要
対象は arXiv:2605.29341「WorldMemArena: Evaluating Multimodal Agent Memory Through Action-World Interaction」。問題設定は、長期稼働する multimodal agent の記憶を、静的な会話履歴の recall や最終 QA 正答率だけで測ると、どこで壊れたかが分からないという点にある。論文は agent memory を Action-World Interaction Loop として定式化し、観測、行動、環境 feedback、次の意思決定が接続される中で、記憶が write / maintain / retrieve / use の4段階を通ると見る。

WorldMemArena はこの枠組みを 400 件の multi-session multimodal task として実装する。タスクは、個人状態やプロジェクト状態が変化する Lifelong Evolution と、GUI/embodied agent の観測・行動・feedback から再利用可能な経験を作る Agentic Execution に分かれる。データ規模は平均 18.4 sessions、約 9.1K tokens、合計 24,258 QA pairs、15,595 images/screenshots。各 session には gold memory points、更新すべき state updates、無視すべき distractors、QA の根拠になる evidence chain が付く。評価は記憶を書けたか、古い情報を更新できたか、必要証拠を取り出せたか、最終回答や行動で使えたかを分けて見る。結果は、記憶を正しく多く保存しても QA 品質は保証されず、視覚証拠の長期利用、更新、干渉排除、agentic trajectory からの経験再利用が現在の弱点だと示している。

■ 内容分析
この論文の強い点は、「記憶があるか」ではなく「記憶の lifecycle のどこが壊れたか」を測れる形に分解していること。Stage 1 は各 session で新しく書かれた memory item を gold memory point に照合し、正しい記憶、hallucinated、irrelevant を分ける。Stage 2 は update memory point について、新事実が残り、旧事実が除去または上書きされた時だけ成功扱いにする。つまり、古い情報と新しい情報を両方抱えた append-only memory を高評価しない。Stage 3 は QA ごとの gold evidence に対して retrieval coverage と NDCG を見るため、最終回答が外れても retrieval が悪いのか、retrieved evidence を使えなかったのかを分離できる。Stage 4 は factual recall、dynamic update、memory boundary、memory conflict、temporal reasoning、test-time learning、visual update、cross-modal reasoning などの能力軸で QA を見る。

結果も設計と噛み合っている。Qwen3-VL-Embedding や M2A は memory recall が高いが、最終 QA は伸び切らない。MemGPT は retrieval coverage と QA correctness が強い一方、全体として update handling と interference rejection は弱い。多くの system は情報が変わった時に古い記憶を消さず、増やす方向に寄る。multimodal 系は画像を使えるにもかかわらず、視覚情報を長期記憶として安定利用する downstream gain が小さい。Agentic Execution は Lifelong Evolution より難しく、tool feedback、失敗行動、画面状態の変化が明示文に比べて記憶化されにくい。harness-based memory agent は柔軟だが、計算コストと framework 依存が残る、という結論も現実的である。

■ 自分達の環境への適用
Nao_u_BOT 側では、これは memory system とゲーム制作評価の両方に使える。まず記憶システムでは、atom や candidate の品質を「保存した量」ではなく、write / maintain / retrieve / use に分けて監査する。たとえば Slack directive を取り込む時、write は原文の重要条件を落としていないか、maintain は旧ルールを supersede できているか、retrieve は作業開始時に該当 directive が出るか、use は実際の投稿や実装で守られたかを見る。今の shared-reads でも、候補が増えるだけでは意味がない。過去に投稿済みの FPS MAP-Elites 候補を今回 skip したように、maintain と interference rejection が必要になる。

ゲーム制作では、headless 評価 agent のログ設計に直結する。最終 score や playable だけを見るのではなく、agent がどの観測を記憶し、どの状態変化を更新し、どの失敗 evidence を次 run で取り出し、実際に入力方針へ反映したかを残す。小さな probe としては、1 prototype につき session log を action / observation / feedback / memory_delta に分け、失敗時に「到達不能」「危険源の見落とし」「古い goal の保持」「視覚 cue の未利用」を分類する。視覚証拠を自然文 caption だけに潰すと、位置、時間、UI状態、敵配置の差が落ちるので、スクリーンショット id と検出済み state を evidence chain として保持するのがよい。

■ メリット・デメリット
メリットは、記憶の失敗を単一スコアから lifecycle diagnosis へ移せること。これにより、memory_recall.py の検索品質、Slack directive の更新、shared-reads 候補の重複排除、game prototype の headless run を同じ評価語彙で扱える。特に update handling と interference rejection は、運用上の古い指示、候補の重複、誤った一時情報を長期記憶に混ぜる問題に効く。

デメリットは、WorldMemArena そのものをそのまま導入するには重いこと。gold memory point、update、distractor、evidence chain を人手または半自動で付ける必要があり、毎サイクルの運用に全面適用すると記録コストが高すぎる。また、論文の評価は checkpoint QA が中心なので、ゲームの「次の行動が改善されたか」を完全には測らない。harness-based memory が柔軟でも安定性とコストに課題がある点も、そのまま自分達の Codex 運用に跳ね返る。

■ 判定
部分採用。ベンチマーク全体ではなく、4段階 lifecycle、update handling、interference rejection、evidence chain の考え方を採用する。次の実装候補は、Slack directive / shared-reads candidate / headless game run のうち1領域だけに小さく適用し、保存量ではなく「更新できたか」「必要時に取り出せたか」「実作業で使えたか」を staging に残す形がよい。

■ URL
https://arxiv.org/abs/2605.29341
https://arxiv.org/html/2605.29341v1
https://github.com/UCSB-AI/WorldMemArena
https://worldmemarena-mem.github.io/
