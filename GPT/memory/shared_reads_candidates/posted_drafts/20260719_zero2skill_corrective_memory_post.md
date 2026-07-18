■ 概要
対象は「Zero2Skill: Bootstrapping Robot Skills through Autonomous Data Collection, Training, and Deployment」。実ロボットの manipulation policy を学習するには大量の軌跡が必要だが、teleoperation は全 episode で人間を拘束し、完全自律収集は perception drift、object displacement、reset 失敗などの長尾障害を見逃しやすい。VLM verifier や言語修正を入れても、修正が当該 episode だけに効く設計では、同じ失敗が再発するたびに人間が教え直す。Zero2Skill の問題設定は、監督コストが「異なる問題の数」ではなく「session の長さ」に比例してしまう点にある。

中核は、収集・検証・reset を verification-gated loop にし、人間の修正を Corrective Memory へ残す構成である。最初に agent が task、collection routine、collection success criterion、reset routine、reset success criterion を生成し、人間が plan を確認する。その後は collection phase と reset phase を交互に実行し、それぞれを新しい画像に対する VLM の yes / no / unknown 判定で gate する。既定では各 phase を 3 回まで自動 retry し、budget を使い切った時だけ arm を停止して remote operator へ通知する。reset を独立に検証するのは、把持失敗と違って不完全な reset は次 episode の初期状態を少しずつ壊し、無人 session 全体を静かに劣化させるためである。

operator の自由文は LLM parser が current state と既存 memory を見て解釈する。恒久修正なら trigger / correction / scope / source utterance の 4 field を持つ Markdown entry に変換する。一時的な「今回は左へ動かす」は保存せず、「flat な物体では 1 cm 深く grasp」のような条件付き修正だけを再利用する。通信 timeout は failure でなく unknown にし、最終観測を残して criterion 修正後に過去 episode も再判定できる。

実験は dual-arm Piper の desktop clearing 1 task。50 episode で teleoperation は 50/50 成功・human working time 30.0 分、script は 35/50・31.0 分、Zero2Skill は 50/50・wall-clock 53.0 分だが人間作業は 4.8 分だった。言語修正は verifier accuracy を全 4 条件で改善し、basket 判定 40%→100%、reset 0%→100% などを達成したが、曖昧な blue-box 条件は 0%→40% に留まる。execution 側は SAM3 prompt と depth offset の累積修正で single-attempt success が 12.5%→25.0%→47.5%、arm-selection は 20.0%→50.0% へ上がった。

50 軌跡で π0.5 を fine-tune し、runtime support を外した blind 20 trials では script data が 55%、teleoperation と Zero2Skill data がともに 80% だった。ただし検証は 1 collect–train–deploy cycle だけで、multi-round flywheel は未検証である。

■ 内容分析
最も使えるのは Corrective Memory 単体ではなく、「明示した retry budget」「collection と reset の別 verifier」「再利用条件付き修正」「episode の再判定可能性」を一つの loop にしている点である。何でも自律化するのではなく、同じ failure class は記憶で安くし、新しい failure class だけを人間の注意へ送る。これは人間を常時操作者でも最後の承認印でもなく、失敗分類と境界修正を行う例外処理者に置く設計である。

一方、persistent correction は自動的に正しくならない。arm-selection では carambola が 20% から 0% に悪化し、live collection の banana-and-chili 群も介入前 80.00% に対し最終 76.47% だった。rule が再利用されることと、failure cause に合っていることは別である。trigger が粗いと局所修正が過剰一般化される。また episode success 100% は retry と介入込みの指標で、raw policy の first try が強いことを意味しない。論文が single-attempt success を別に示したのは重要で、この二つを混ぜると自律性を過大評価する。

評価対象は robot・task とも一つで、20 trials の同率は統計的同等性を証明しない。Zero2Skill data は RMS jerk が低い一方、Smoothness は teleoperation より低い。誤 rule の conflict・expiry・rollbackや、memory 増加時の retrieval 精度も未評価である。「記憶で自律性が単調に上がる」のではなく、「監督を failure class 単位へ圧縮できるが、適用範囲の検証が要る」と読むべきである。

■ 自分達の環境への適用
ゲーム制作では headless playtest を action、outcome verification、world reset に分け、各 phase に retry budget を持たせる。同じ地形で 3 回 stuck したら seed、game state、直前 action、screenshot、verifier reason、既適用 correction を束ねる。修正は `trigger / correction / scope / source / outcome_after_retry` として同じ条件でだけ再適用する。

小さな probe では、既存の memory 全体を改造せず、1 prototype・1 failure class に限定する。baseline は毎回同じ手修正を受ける経路、probe は最初の修正だけを条件付きで再利用する経路とする。測るのは最終成功率だけでなく、first-attempt success、同一 failure への介入回数、新規 failure への escalation 精度、誤 correction による regression、reset drift、human active minutes である。correction 適用後に counterexample が 1 件でも出たら自動昇格を止め、scope 縮小か rollback を行う。

記憶システムでは、修正に「いつ効くか」と「適用後に何が起きたか」を足す。恒久ルールへ即昇格させず狭い reversible probe とし、成功・悪化の両方を evidence に残す。timeout や欠損を内容上の失敗として学習させない分離も採用価値が高い。

■ メリット・デメリット
メリットは、人間の注意を episode 数から distinct failure 数へ近づけられること、修正が可読な text rule なので監査・編集・再判定が可能なこと、最終 policy 評価から runtime support を外して data utility を測っていることである。retry budget を明示するため、品質と介入頻度の trade-off も調整しやすい。

デメリットは、誤った rule が以後の全 attempt へ増幅されること、verifier と parser が新しい単一障害点になること、wall-clock は teleoperation より長いこと、単一 task・短い memory での結果から長期運用を保証できないことである。ゲームへ移す際に危ないのは、success criterion をスコアや到達だけに寄せ、面白さや操作感を verifier が見ないまま「有効な修正」として固定すること。scope、expiry、conflict、rollback、counterexample replay を持たない Corrective Memory は採用しない。

■ 判定
部分採用。verification-gated loop、phase 別 retry budget、条件付き correction、unknown の分離、修正後の過去 episode 再判定は採る。大規模な永続記憶や「一度直せば以後自動」という前提は採らず、1 failure class の probe で regression と human active time を同時に測ってから広げる。

■ URL
https://arxiv.org/abs/2607.14047v2
https://open-gigaai.github.io/Zero2Skill
