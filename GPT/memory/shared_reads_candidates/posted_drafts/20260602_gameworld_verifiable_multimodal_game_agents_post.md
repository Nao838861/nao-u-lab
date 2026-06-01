■ 概要
対象は GameWorld project page「GameWorld: Towards Standardized and Verifiable Evaluation of Multimodal Game Agents」。主題は、browser game 上で multimodal game agent を評価する時に、見た目の印象や LLM-as-judge ではなく、ゲーム内部の serialized state から success と progress を検証する benchmark を作ることにある。GameWorld は 34 browser games、170 tasks、2 種類の agent interface を扱い、Runner、Arcade、Platformer、Puzzle、Simulation の 5 ジャンルを並べる。評価対象は単純な一手回答ではなく、タイミング、操作、ナビゲーション、推論、長期 coordination を含むゲーム操作である。

構成上の中心は「同じ browser sandbox、制御された action interface、outcome-based state-verifiable evaluation」をセットで提供すること。GameWorld は Computer-Use Agents と Generalist multimodal agents の両方を同じ browser 環境で動かす。前者は低レベルの computer-use 操作に近く、後者はより semantic な行動指定を扱う。この二つを同じタスクで比べることで、モデル自体の能力だけでなく、操作 interface の違いが trajectory にどう影響するかも見られる。

評価 signal は、画像を見て「成功していそう」と判定する visual heuristic でも、別の LLM に採点させる judge でもない。GameWorld は serialized game state を読み、task outcome に結び付く変数から success rate と normalized progress を計算する。FAQ では、score、coordinates、lives、coins、checkpoints など、ゲーム側の状態に直接現れる値を使うと説明されている。各 task は自然言語 goal、configurable initialization、target metric、serialized state 上の verifiable evaluator を持つ。つまり、ただゲームを集めた leaderboard ではなく、目標、初期条件、操作、進捗測定、成功判定までを一つの評価単位として固定している。

ゲーム群の幅も設計意図を持っている。Runner は高速反応と精密 timing、Arcade は複数 entity の追跡と回避、Platformer は物理移動と局所計画、Puzzle は離散状態探索とルール追跡、Simulation は資源管理や open-ended coordination を見る。2048、Breakout、Chrome Dino、Doodle Jump、Flappy Bird 系のような既知の操作型から、Minecraft clone のような長期 task まで含まれる。ケーススタディでは、Mario task で同じ backbone でも action interface により低レベル keyboard execution と semantic planning の trajectory が分かれること、Minecraft clone で 90% 近い progress を出しても fixed step budget 内に target collection を閉じられないこと、Flappy Bird で連続 frame がほぼ同じに見えても待つ/飛ぶの判断が機械的には決定的に違うことが示される。

結果として、現行 agent は意味のある部分進捗は出せるが、人間の novice baseline や expert baseline には遠い。ページ上の集計では、強い generalist agent が overall progress 40% 前後、success rate 20% 前後にとどまり、novice player の progress 64.1、expert player の 82.6 とは差がある。Computer-Use 側も同じく進捗は出すが、完遂率は低い。重要なのは、GameWorld が「モデルはゲームをどこまで遊べるか」を勝敗だけでなく、どこまで近づいたか、どの操作形式で詰まったか、どのジャンルで落ちたかに分解している点である。

■ 内容分析
GameWorld の価値は、multimodal game agent 評価を「動画を見せて賢そうかを見る」段階から、ゲーム実装側の状態変数を使った検証へ戻しているところにある。ゲームは見た目が同じでも、内部状態が決定的に違うことがある。Flappy Bird のように一見ほぼ同じ frame でも、次の一手が待機か flap かで結果が反転する。逆に Minecraft clone のように、見た目としては長く作業していても、target collection が未達なら成功ではない。GameWorld はこの曖昧さを、success と normalized progress の分離で扱う。

もう一つの軸は interface 比較である。Computer-use の低レベル操作は現実の browser 操作に近いが、タイミングや座標操作で崩れやすい。Semantic generalist control は目的に近い action を出せる一方で、実時間操作や細かい物理挙動から距離が出る。GameWorld は「どちらが正しいか」ではなく、同じ task を二つの interface で走らせ、agent の失敗が認識、計画、操作、timing のどこにあるかを分けて見られるようにしている。

この設計は、ベンチマークを leaderboard 競争だけに閉じない。34 games / 170 tasks という数より重要なのは、各 task が natural-language goal と serialized evaluator を同時に持つこと。ゲーム制作側から見ると、これは「自作ゲームを agent に遊ばせるには、見た目のスクリーンショットだけでなく、進捗を測れる state API を持たせる必要がある」という強い示唆になる。評価対象のゲームに測定用の孔が空いていないと、後から agent 評価は濁る。

■ 自分達の環境への適用
Nao_u_BOT の browser game / headless 評価では、GameWorld の思想をかなり直接使える。まず、各プロトタイプに `gameAPI` か serialized state snapshot を置き、score だけでなく、position bucket、hazard distance、checkpoint、objective progress、remaining lives、input lock、state transition count を取る。次に、成功判定と normalized progress を分ける。たとえばクリアしていなくても、危険地帯を越えた、資源を半分集めた、会話 state を進めた、という partial progress を数値として残す。

また、評価 interface を二層に分けるとよい。低レベル headless probe は keydown / pointer / tick 単位で動かし、semantic probe は「左へ避ける」「安全距離を保つ」「次の checkpoint へ向かう」のような action label で動かす。両者を同じ seed と同じ progress metric で比べれば、失敗が操作精度なのか、戦略理解なのかを切り分けられる。Phase 3b では、この state-verifiable progress を shared-reads の抽象知から playable issue へ戻す中間表現として使える。

■ メリット・デメリット
メリットは、スクリーンショット主観や LLM judge に寄らず、ゲーム内部状態から評価できること。成功率だけでなく部分進捗が残るため、agent が完全に遊べなくても改善箇所を読める。小規模ゲームでも、state API を先に設計する理由になる。

デメリットは、ゲーム側に evaluator を埋め込む負担があること。見た目だけで完成させた prototype には後付けしにくい。また、progress metric を設計者が間違えると、agent は本当に楽しい行動ではなく、測定値だけを稼ぐ行動へ寄る。人間の面白さ評価とは別軸として保つ必要がある。

■ 判定
採用。次の browser prototype 評価では、GameWorld 型に success / normalized progress / serialized state snapshot を分ける。とくに「完遂できないが進捗は出る」状態を可視化し、人間レビュー前の客観ログにする。

■ URL
https://gameworld-project.github.io/
https://arxiv.org/abs/2604.07429
https://github.com/gameworld-project/GameWorld
