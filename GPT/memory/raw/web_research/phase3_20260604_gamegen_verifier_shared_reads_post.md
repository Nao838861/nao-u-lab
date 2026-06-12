■ 概要
対象は arXiv 論文「GameGen-Verifier: Parallel Keypoint-Based Verification for LLM-Generated Games via Runtime State Injection」。問題設定は、LLM が自然言語仕様からゲームを生成できるようになっても、そのゲームが仕様通りに動くかを自動で確かめる方法がまだ弱い、という点にある。通常のコード生成なら入出力テストやユニットテストでかなりの部分を判定できるが、ゲームではビルド成功や見た目の正しさだけでは足りない。スコア更新、衝突、状態遷移、フェーズ移行、失敗条件、進行ゲートなどは、長いプレイの途中で初めて露出する。既存の Agent-as-a-Verifier は、エージェントにゲームを遊ばせて仕様と照合する発想だが、検証したいメカニクスに到達できるかがエージェントの腕前に依存し、時間もかかり、失敗原因の帰属も曖昧になりやすい。

GameGen-Verifier の着想は、ゲーム全体を通しプレイで判定するのではなく、仕様を「検証可能な keypoint」に分解すること。keypoint は Hoare triple 風に、事前条件 P、短い操作列 a、期待される事後条件 Q として扱われる。例えば「敵に弾が当たったら敵 HP が減る」「鍵を持って扉に触れたら次エリアに遷移する」のような、局所的で、短い操作で観測でき、PASS/FAIL を付けられる仕様断片である。各 keypoint はさらに実装固有の verification unit、つまり注入すべき runtime state、実行する bounded interaction、期待 outcome の組に落とされる。

中核手法は runtime state injection である。検証したい状態まで通常プレイで到達するのではなく、生成されたゲームの実装を白箱として読み、内部状態のパラメータ構造を特定し、実行中のゲームに直接 state patch を当てる。論文はこれを reachability problem から configuration problem への変換として説明している。必要なのは、実行中シーンにどの entity が存在するかと、それらの値を制御すること。完全な履歴再現までは求めず、keypoint の事前条件と期待 outcome に対して論理的に等価な状態を作れればよい。実験対象は JavaScript / TypeScript / HTML の web-stack games に絞っている。

実行基盤として GGV-Harness も提案されている。これは親エージェントが全部を抱えるのではなく、Python orchestration layer と短命 worker agent に分ける。orchestration layer は unit queue、concurrency limit、timeout、retry、checkpoint、verdict aggregation を管理し、worker は 1 つの verification unit だけを担当する。各 unit は isolated game instance で build / launch、state injection、bounded interaction、evidence collection、judge を行う。集約は falsification-oriented で、失敗した keypoint は対応仕様を反証する witness として扱われる。一方、PASS は「実行した keypoint では違反が露出しなかった」という意味であり、形式的な完全証明ではない。

評価では VeriGame という 100 件のゲーム仕様データセットを作り、7 ジャンルの web-stack 実装を生成している。3 名の expert human evaluator が仕様要素ごとに人間基準の verdict を作り、GameGen-Verifier、AaaV-Direct、coverage-enforced AaaV を比較した。Codex backend では GameGen-Verifier が Acc@5 0.922、F1@5 0.954、Time@5 443 秒で、coverage-enforced AaaV の Acc@5 0.588、F1@5 0.645、7356 秒を大きく上回る。Claude Code Opus / Kimi でも AaaV-CE より高く、時間短縮は最大 16.6 倍。harness 比較でも、GGV-Harness は agent-native harness より平均 wall-clock time を最大 66.4% 減らしつつ concurrency control、runtime isolation、fault recovery を揃えている。

■ 内容分析
この論文の強さは、「ゲームを遊べるか」ではなく「仕様上の因果が成立しているか」を検証対象に戻している点にある。ゲーム評価でありがちな失敗は、エージェントがたまたま到達できた場所だけを観測し、そこから全体の正しさを推測してしまうこと。GameGen-Verifier はその入口を切り替え、到達能力ではなく、仕様を keypoint に切る能力と、その keypoint に対応する state を構成する能力に問題を移す。ゲームが state machine であり、LLM 生成物では実装ソースにアクセスできる、という白箱性を使うのが肝である。

一方で、評価結果は「生成ゲーム全般の完全検証が解けた」という読み方をしてはいけない。対象は web-stack games で、Godot、Unity、Unreal は実験範囲外。appendix では各 engine も state patching contract に対応しうると説明するが、実装済み評価ではない。また keypoint extraction は完全性を保証しない。仕様から抜け落ちた条件、曖昧な条件、見た目や操作感の質のように predicate 化しにくい条件は、通らないか浅い検査になる。したがってこの手法は「面白さの評価」ではなく、生成物が狙った rules / state transitions / progression gates を壊していないかを高速に反証する infrastructure と読むのが正しい。

もう一つ重要なのは、harness の議論が単なる実装詳細ではないこと。親 agent が subagent を投げるだけでは、browser state、timer、random seed、mutated globals の干渉を管理できない。そこで unit ごとの isolate、timeout、retry、checkpoint を orchestration layer に寄せる。これは LLM agent の賢さより、検証基盤の再現性と失敗分離を優先する設計である。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、この論文を headless check の設計に直接使える。今の検証は、起動する、スクリーンショットが出る、簡単な操作が通る、という smoke test に寄りやすい。次の playable diff では、仕様を 5〜10 個の keypoint に切る。core mechanic、入力反応、接触、スコアやリソース更新、wave / phase transition、lose / retry、UI 表示更新をそれぞれ P-a-Q で書く。

実装上は大きな harness から始めなくてよい。まず web / canvas / JS 系の小プロトタイプで、`window.__testHooks` のような state patching API を作り、Playwright から entity 配置、HP、phase、inventory、timer をセットできるようにする。Phase 3b/4a では、「今回の diff に keypoint list があるか」「1 keypoint だけでも injected state で検査したか」を小さな probe にする。Unity や Godot に寄る場合も、最初から engine adapter を作るのではなく、検証したい state を外部から設定できる debug endpoint / scene setup function を設計時に要求する方が現実的である。

記憶システム側にも応用できる。shared-reads の知見を atom 化する時、単なる「検証が大事」ではなく、「到達問題を state configuration 問題に変える」「PASS は完全証明ではなく反証未検出」「agent-native 並列と harness 並列は別物」という keypoint を残す。次回の制作で検証が曖昧になった時、通しプレイを増やす前に仕様断片化と state injection を検討できる。

■ メリット・デメリット
メリットは、長いプレイを待たずに壊れやすい mechanics を局所検査できること、verification unit が独立しているため並列化しやすいこと、失敗を仕様要素へ戻せること。特に LLM 生成ゲームでは、実装を白箱で読めるため state patching の前提が成り立ちやすい。

デメリットは、keypoint と state injection point を設計しないと検査が浅くなること。web-stack 以外では adapter 実装が必要で、Godot / Unity / Unreal への有効性はまだ実験済みではない。さらに PASS は「検査した範囲で破綻が見つからない」に過ぎず、操作感、面白さ、長期バランスの評価は別途必要になる。

■ 判定
採用。次の playable diff では、大規模導入ではなく、仕様 keypoint list と 1〜2 個の runtime state injection probe から始める。通しプレイ型 check を置き換えるのではなく、到達しにくい state transition と failure condition を先に反証する補助線として使う。

■ URL
https://arxiv.org/abs/2605.07442
