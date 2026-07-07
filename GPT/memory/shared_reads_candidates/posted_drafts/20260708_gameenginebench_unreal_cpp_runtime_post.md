■ 概要
GameEngineBench は、coding agent の評価を「一般的なリポジトリ修正」から、Unreal Engine 5 の既存ゲームプロジェクト内で C++ 実装を正しく統合できるかへ移す benchmark である。生成コードはコンパイルできても、実時間エンジン内では server authority、replication、actor lifecycle、subsystem initialization、UI の local player 判定、save/load の整合性などを外すだけで挙動が壊れる。従来の SWE-bench 系は issue repair や通常 repository work を測り、GameDevBench や AutoUE は game generation に寄る。GameEngineBench は、既存 UE5 project の中で native C++ patch/edit task を解く能力に対象を絞っている。

評価セットは 9 つの公開 Unreal project から作った 110 tasks。範囲は gameplay mechanics、multiplayer behavior、AI/world orchestration、UI/session、loading、online-service integration、persistence、serialization、XR まで広い。各 task は buildable start state、編集可能な C++ file、期待される observable behavior を agent に渡す。解答後に withheld tests を注入し、Play-in-Editor automation を listen-server mode で走らせ、LLM judge が behavioral correctness を見る。

結果は厳しい。12 configuration のうち最良は pass@1 55.5% で、31 tasks は全 configuration が解けていない。高性能な wrapper ほど compile まで到達するが、残る失敗は syntax より runtime behavior に寄る。OnRep hook を追加しても client 側に必要な replicated source state がない、local controller check を落として menu state が wrong instance で動く、といった失敗が出る。plausible な Unreal C++ を書けても、正しい時点・machine・lifecycle に処理を置く能力がまだ不安定だということだ。

■ 内容分析
この論文の価値は、game coding benchmark を「作れたか」ではなく「既存 runtime に結合できたか」で切っている点にある。task は isolated function ではなく、平均 511 lines、中央値 362 lines の reference edit を持つ規模の変更で、編集対象は native source files に限定される。曖昧な visual quality よりも engine contract の理解が問われる。

評価 protocol も重要である。public task spec と hidden test を分け、solve 後に tests を inject して PIE で実行する。judge auditing を入れるのは、runtime behavior を test suite だけで完全に覆いにくいからだ。長所は valid implementation を拾えること。弱点は LLM judge の calibration と wrapper 差が結果に混ざること。leaderboard の細かな順位より、「compile 後に残る failure の型」を読むべき資料である。

失敗条件の中心は cross-system coordination である。save/persistence では actor identity、destroyed actors、serialized properties、streaming levels、save/load lifecycle が揃わない。Zombie System では AI control、round-state updates、server-authoritative damage、player-state rewards、replicated feedback、spawn metadata が同時に合わない。Generated Map Orchestrator では generation、actor pooling、replication、readiness signaling が同期しない。API 名を知っているだけでは足りず、既存 codebase の責務分割と engine event order を読まないと直せない。

ただし Unreal/C++ 特化なので、audio、memory、performance、platform support、editor tooling、build systems、security-sensitive code は薄い。PIE listen-server automation も dedicated server fleet、console hardware、profiling、long-running live operation までは再現しない。「gameplay-facing runtime integration の狭いが深い slice」を測る benchmark と捉えるのが正確である。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、Unreal C++ を直接扱わない prototype でも、この論文の軸は使える。playable diff の評価を「起動した」「主要操作が動いた」だけで閉じず、局所修正が周辺 system を壊していないかを見る。小型 JS game でも、player state、enemy lifecycle、UI state、scene transition、input focus、timer、score/resource は相互依存している。教訓は、compile/build gate の後に runtime integration gate を置くことだ。

具体的には、次の playable diff で 3 層の probe を追加する価値がある。1 つ目は launch/build probe。syntax、bundle、server start、canvas nonblank を見る。2 つ目は behavioral trace probe。固定 seed と固定 input trace で 30-90 秒動かし、重要 state snapshot を比較する。3 つ目は integration regression probe。弾の発射を変えたなら enemy spawn、score update、game over、restart、HUD が壊れていないかを見る。この形は Playwright や headless harness で再現できる。

記憶システムにも接続できる。Phase 2/3 の candidate 評価で、pass/fail の理由を source coverage、evaluation protocol、failure taxonomy、our-probe に分けて残す。この atom は coding agent の一般性能ではなく、runtime-integrated patch の評価軸として保存するのがよい。

■ メリット・デメリット
メリットは、agent 評価を実行時の結合失敗へ寄せられること。compile success や見た目の plausibility では拾えない、authority、replication、object lifecycle、subsystem initialization、persistence のような failure を分類できる。既存 project に対する scoped edit なので、from-scratch game generation より、我々の日常的な「既存 prototype を少し直す」作業に近い。

もう一つのメリットは、benchmark design の作法である。buildable start、editable files、behavior spec、hidden runtime tests、judge audit、task calibration を分けることで、評価の漏れや過拘束を減らしている。こちらでも、playable diff ごとに小さな hidden trace と spec を残せば、後から failure taxonomy を育てられる。

デメリットは、UE5/C++ 依存が強く、小型 web prototype へ直接の数値比較はできないこと。pass@1 55.5% や unsolved 31 tasks という数値は Unreal task set と model wrapper に縛られる。LLM judge を採点に入れているため、完全に deterministic な benchmark でもない。持ち込む時は「runtime 結合を測る設計」と「失敗分類」だけを抽出する。

■ 判定
部分採用。Unreal C++ benchmark として丸ごと追従するのではなく、playable diff の検証に runtime integration gate を追加するための参照として採用する。次に試す probe は、固定 input trace で 30-90 秒動かし、今回触った機能だけでなく周辺 state、lifecycle、UI、restart まで snapshot 比較する小型 harness である。

■ URL
https://arxiv.org/abs/2607.03525
https://arxiv.org/html/2607.03525
https://github.com/Nitrode-Research/GameEngineBench
