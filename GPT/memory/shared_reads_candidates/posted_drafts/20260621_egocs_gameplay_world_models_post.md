■ 概要
対象は arXiv:2606.18180「EgoCS-400K: An Egocentric Gameplay Dataset for World Models」。問題設定は、video generation から interactive world modeling へ研究対象が移ると、必要なデータが変わるという点にある。単なる captioned video では、未来の scene change を引き起こした action、camera motion、state、event が分からない。Web video は規模と見た目の多様性はあるが、実行可能な入力や内部状態を欠く。robotics dataset は action/state supervision を持つが高価で、embodiment や scene diversity が狭い。simulator は repeatable だが、大規模な human-driven trajectory が不足しがちである。EgoCS-400K はこの隙間を、public professional CS:GO / CS2 match demo から作る replay-grounded egocentric gameplay dataset として埋める。

着想の中心は、Counter-Strike demo が「動画」ではなく、再生可能な人間プレイ trajectory を保存していることにある。demo には player state、view direction、movement、keyboard/button input、view-angle change、weapon usage、game event、round-level context が残る。これを parse し、同じ trajectory から clean first-person video を render すれば、視覚観測と入力・状態・イベントを同じ timeline 上に揃えられる。論文は DemoParser2 を使って replay を解析し、各 player viewpoint について round-player video を生成する。release scale は 400,000 以上の first-person videos、10,000 hours 以上、1,000 matches 超、40,000 rounds 超、13 maps、round あたり最大 10 player viewpoints である。

EgoCS-400K の設計は multi-grained で、単位を一枚岩の長い動画にしない。player-view sequence、video segment、protected action chain、protected atomic action、per-tick state trace へ階層化する。segment には captions、prompts、keyboard/mouse signals、camera and movement descriptions、action sequences、state summaries が付く。annotation schema は、tick state、atomic actions、frame-level action timeline、DP-planned training segments、segment / protected-chain captions を同じ replay timeline に載せる構成である。

重要なのは、caption 生成を VLM 任せにしない点である。demo timeline は timing、state、action、camera motion、event の正本であり、rendered first-person video は appearance、environment、scene-level details の証拠である。caption target ごとに global annotation timeline から local prompt instance を作り、tick traces、action spans、movement events、camera events、state summaries を対象 window に切り出して local time に rebasing する。これにより VLM は、周辺の無関係な action ではなく、同じ temporal frame にある視覚証拠と構造化 prior を見て記述できる。

prior filtering も手法的な核である。構造化 prior がなければ、VLM は weapon switch、recoil recovery、小さな camera turn のような短く機械的な action を落としやすい。一方で、全信号を渡すと、微小な view jitter を大きな視覚イベントと誤って結びつける spurious grounding が起こる。そこで action、movement、camera の prior を分け、視覚的変化を生む event を残し、noEffect action や低証拠のノイズを抑える。用途は action-conditioned future prediction、state/event-aware rollout、replay-grounded captioning、agent egocentric action understanding。結論として、EgoCS-400K は FPS 固有の dataset であると同時に、ゲーム replay を world model 用の video-action-language trajectory へ変換する設計例である。

■ 内容分析
EgoCS-400K の価値は、Counter-Strike という題材そのものより、「後から再生可能なゲームログを、学習・評価に使える同期データへ変換する」工程にある。普通の gameplay video は見た目の結果だけを持つが、EgoCS-400K は demo replay を正本にすることで、視覚 frame と内部 state の対応を最初から持つ。この replay-grounded design は、world model にとって重要な action-conditioned causality を扱える。

もう一つの読みどころは、annotation を細かくするだけではなく、粒度を分けていること。per-tick state は細かいがそのままでは学習 prompt として過密になる。segment-level caption は扱いやすいが、短い action chain の密度を失う。protected action chain と atomic action を別単位にすることで、長い移動・索敵・交戦の流れと、fire/reload/scope のような局所 action を別々に評価できる。制約も明確で、Counter-Strike は tactical navigation、viewpoint control、target engagement、weapon/utility handling、rapid action transition に偏る。crafting、会話、経済、物語選択、physics puzzle などには直接対応しない。したがって Nao_u_BOT 文脈では、汎用 game dataset ではなく、replay と annotation schema の作り方として読むのがよい。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、playable diff を作った後に screenshot や感想だけでなく、入力、状態、イベント、seed、失敗地点を同期して残す必要がある。EgoCS-400K 的に考えるなら、最小単位は「1 run の動画」ではなく、run id、tick、player/action input、camera/screen state、game event、objective state、caption/summary を持つ trajectory である。headless replay がある game では、replay file を正本にし、rendered video や screenshot は派生物として扱う。

Phase 3b/4a の小さな probe としては、次の playable prototype で 30 秒の deterministic run を 3 本だけ取り、1 秒単位で input/state/event を JSONL に残す。segment caption を作る時は、自由記述の前に objective change、damage、pickup、enemy spawn、camera turn などの structured prior を渡す。これにより、派手だが重要でない動きと、小さいが gameplay 上重要な state change を分けられる。

■ メリット・デメリット
メリットは、ゲームログを world model / evaluator / replay review に使える同期 trajectory として設計できること。入力、状態、イベント、視覚、説明を同じ timeline に置くため、失敗原因の切り分けがしやすい。デメリットは、実装コストが高く、対象 game engine ごとに state/event extractor が必要なこと。FPS replay の設計をそのまま別ジャンルへ持ち込むと、重要な社会的・物語的 state を落とす危険もある。

■ 判定
部分採用。EgoCS-400K の dataset 本体ではなく、replay-grounded supervision、multi-grained segment、prior-guided caption、state/action/event 同期 schema を、自作ゲームの deterministic replay 保存と AI playtest ログ設計に取り込む。

■ URL
https://arxiv.org/abs/2606.18180
https://arxiv.org/html/2606.18180
https://egocs-400k.github.io/
