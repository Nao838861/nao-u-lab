'Battlefield 6': Game Feel is the Message / Using choreography to enhance Battlefield 6's game feel
GDC schedule: https://schedule.gdconf.com/session/battlefield-6-game-feel-is-the-message/915257
Game Developer: https://www.gamedeveloper.com/design/using-choreography-to-enhance-battlefield-6-s-game-feel

■ 概要
これは Battlefield 6 の「銃を撃つ感触」を、単なる低 latency や派手な演出ではなく、入力、画面、音、アニメーション、プレイヤーの身体感覚が往復する loop として設計する話。GDC Festival of Gaming 2026 の講演は、DICE の Jac Carlsson が Battlefield 6 の 3C / game feel designer として、FPS の gun feel を中心に「player intent と game response の質的側面が噛み合う瞬間」をどう作るかを扱う。講演概要で強調されているのは、technical performance だけでなく perceived latency、visual/audio の behavioral quality、procedural animation、combat mechanics の tactile response が同じ問題に属するという点である。

Game Developer の取材記事は、この抽象を Battlefield 2042 後の反省と DICE の具体的な再設計に接続している。Carlsson の基準は function over form。見た目として軍事的にリアルであることや、大規模戦場の spectacle を盛ることより、FPS の基礎である movement、aiming、firing、damage が gameplay の現実と rhythm に接続されているかを先に見る。記事では、腕の揺れ、sprint、aiming、weapon handling などの一人称アニメーションが、単に「リアルっぽい手元」を見せるためではなく、視線、姿勢、射撃、被弾の理解を支える Kinesthetic Combat Systems として扱われている。

この話で面白いのは、Carlsson が dance choreography の経験を持ち込み、game feel を「行動の単発結果」ではなく「入力が hardware から screen に出て、そこから player body へ戻る loop」と読んでいること。入力から発火までの応答時間は重要だが、それだけでは足りない。応答がどのような質で返ってくるか、つまり visual feedback と audio feedback が次の emotion/action sequence を直感的に組み立てられるかが問題になる。プレイヤーはただ銃を撃つ人ではなく performer であり、ゲームはその performer に、今の動作がどの勢いで、どの危険に接続し、次に何をすべきかを返し続ける必要がある。

結論として、この素材は「game feel = 気持ちよさ」という曖昧語を、perception alignment の設計問題へ引き戻している。技術的 latency、見た目、音、procedural animation、被弾・射撃 feedback は別々の polish 項目ではなく、プレイヤーが action を理解し、次の action を選べるようにする情報返却の品質である。

■ 内容分析
この記事固有の軸は、choreography が「演出を足す」ために使われていない点にある。普通に読むと、ダンス経験を FPS に持ち込んだという逸話は、開発者プロフィールの面白い話で終わりやすい。しかし Carlsson の使い方は、身体の流れ、重心、rhythm、momentum を、プレイヤーが画面上の状態を身体的に解釈するための設計語彙にしている。ここでの choreography は、カットシーン的な見せ方ではなく、入力後に返す情報の順番と重み付けである。

Battlefield の文脈では、この区別が重要になる。大規模 FPS は、爆発、煙、味方、敵、車両、弾道、UI が同時に走り、visual clarity が壊れやすい。そこで「もっとリアルに」「もっと派手に」と進むと、プレイヤーが movement、aiming、firing、damage を読む能力が落ちる。function over form は、見た目を捨てる方針ではなく、見た目を core function に従わせる方針だと読める。リアルな軍事 fantasy と arcade shooter の間に立つ Battlefield では、この優先順位が game feel の品質を決める。

もう一つのポイントは、perceived latency の扱い。実 latency が低くても、応答の質が悪いとプレイヤーには遅い、鈍い、信用できないと感じられる。逆に、visual/audio の返答が適切なら、プレイヤーは次の動作を早く組み立てられる。これは「操作感の評価」を ms だけで測れない理由であり、headless test だけでは取り逃がす層でもある。Battlefield の記事が useful なのは、失敗を「視覚が足りない」ではなく「何の function を返すべきかが揃っていない」と読める点にある。

■ 自分達の環境への適用
Nao_u_BOT の STG / action prototype では、まず「気持ちいいか」を総合点で聞く前に、入力が身体に戻る loop を分解してレビューする。例えば Pulse Relay なら、dash、shot、graze、被弾、reload、敵破壊の各 action について、1) 入力直後に何が変わるか、2) 画面・音・ヒットストップ・shake が何を返すか、3) その返答が次の判断を早めているか、4) 逆に情報を濁していないか、をチェック項目にする。

headless 評価は到達率や死亡地点を見るが、それだけでは perceived response を拾えない。そこで Phase 3b/4a の probe として、実装レビュー時に「function over form 表」を作る価値がある。各演出を decoration ではなく、movement / aiming / firing / damage / resource のどれを読ませるための返答かに分類し、分類不能な演出は削るか弱める。小規模 2D 作品ほど、Battlefield 的な豪華さではなく、返答の順番と明瞭さだけを借りるのがよい。特に graze や parry のような成功 feedback は、得点表示より前に、入力した身体へ「今の判断は正しかった」と返す必要がある。

■ メリット・デメリット
メリットは、game feel を「あとで polish」ではなく、入力と情報返却の実装単位へ分解できること。失敗理由を「なんとなく鈍い」から「被弾 feedback は強いが、回避入力の成功返答が弱い」のように言い換えられる。デメリットは、素材が AAA FPS 固有で、銃、腕、音響、procedural animation の前提が強いこと。2D STG へ持ち込む時は、表面表現ではなく loop 設計だけを抽出しないと過剰演出になる。

■ 判定
部分採用。Battlefield 6 の具体演出を真似るのではなく、function over form と perceived latency / behavioral quality の評価軸を採用する。次の action prototype では「入力が身体へ戻る loop」を実装レビュー項目に落とす。
