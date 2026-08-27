■ 概要
この論文は world model の性能向上を、収集動画と計算量ではなく、正しさを安く繰り返し検証できる data engine の有無として捉え直す。コードには compiler、test、runtime が再現可能な報酬を返すが、動画や3D生成は CLIP similarity や主観評価に依存し、物理破綻や到達不能を局所化しにくい。そこで game engine 上の scene を entity、transform、material、physics、script を持つ「executable world specification」と見なす。engine は load、collision、physics stability、navmesh reachability、script execution、限定的な playability を検査し、開発者は意図への適合と製品性を最終判断する。

この権限分離を学習に使うのが Reinforcement Learning with Human-Engine Verification（RLHEV）である。Agentic World Model（AWoMo）は単体の生成モデルではなく、intent、action、verification、review の4 interface を持つ workflow で、edit の提案、engine 実行・検査、修復、人間の accept/reject を回す。Unified World-Development Protocol（UWDP）はその過程を、設計意図、object ID、状態、edit/tool action、engine/harness 出力、render evidence、reviewer 判断、repair 関係・残余リスクを結ぶ state-action-check-review trace として保存する。完成 scene だけでは消える「なぜ失敗し、どの修復が効いたか」を next-edit prediction、preference modeling、RL の教師に変える。

評価は実用ゲームの自己改良証明ではなく pilot 実験である。UnitySceneBench は720 train、80 validation、200 test（accept/reject 各100）で、Full RLHEV は human reward 0.65 と engine reward 0.35 を組み合わせる。8 seed の最良値で primary score 0.681となり、最良の非 full baseline を 0.098 上回った。生成側の720例では quality 0.8197、engine-only RLVR は 0.7934。target data で適応させると、監査済み MLLM judge 上で Unity→Unreal は 0.25→0.35、Unity→Godot は 0.15→0.35。embodied 診断も正方向だったが、現実世界への転移、完成ゲーム品質、closed-loop deployment は未検証である。

■ 内容分析
最も価値があるのは、RL 自体より、検証の権限を分けて開発行為を教師化する設計である。engine check は反復しやすいが mood や面白さは決められず、人間が全構造検査まで行えば高価になる。そこで validity→physical plausibility→functional correctness→playability と段階化し、安い失敗を先に落とす。「機械は局所事実、人間は最終的効用」という分離は、headless の pass を「面白い」と誤解しない歯止めになる。

また UWDP の本質は log の量ではなく、反事実を含む因果の接続にある。同じ object ID に意図→edit→failure→repair→recheck→accept を連結するため、「次に何を変えるか」を検索・学習できる。追加 probe でも、最終 snapshot の粗い metadata では target-engine label との Spearman 相関が 0.141±0.084 だったのに対し、accept/reject、deviation type、engine ID、asset identity を含む trace では 0.758±0.044 だった。小さな probe だが、完成物より判断と修復履歴が転用可能な知識になるという説明になっている。

一方、証拠は主張より小さい。UnitySceneBench の主結果は完成 level の遊びやすさではなく asset edit の二値分類で、0.681 は seed 平均ではなく best-of-eight である。cross-engine の指標も engine-native verifier ではなく監査済み MLLM judge で、0.25→0.35 を engine 横断能力の証明とは読めない。embodied 実験も AWoMo 単体の policy ではなく、trajectory 選別や state-action 対の生成・filter を行う data augmentation workflow で、MuJoCo の分散も大きい。本論文はスケーリング則の証明ではなく、検証可能な制作 trace をどう試すかを示す research agenda と評価すべきである。

■ 自分達の環境への適用
移植すべきは RLHEV の学習器ではなく、まず UWDP の最小 trace と検証 ladder である。ゲーム制作の各 edit に `intent_id / object_id / before_state / action_or_diff / deterministic_checks / render_evidence / reviewer_decision / repair_of / residual_risk` を付ける。deterministic check は L0=読込・build・例外なし、L1=オブジェクト数・範囲・状態遷移の invariant、L2=固定 seed の headless simulation で collision・到達・objective completion、L3=screenshot/video による視覚的証拠、L4=人間の遊びと意図適合の判断に分ける。L0〜L2 は「満たさなければ即修復」の gate、L3〜L4 は一つの数値に混ぜず、証拠と accept/reject 理由を別 field で残す。これなら、自動テストを通すために動かない敵を置く、到達判定の閾値だけを緩めるなどの reward hacking を、最終採否と held-out probe で発見できる。

最初の小さな検証は、既存プロトタイプ1件の連続10 edit を対象にすればよい。毎回の diff に対して build、headless チェック、固定時刻の render、自己評価、最終採否を同じ ID で紐付ける。評価指標は「成功 trace の数」ではなく、失敗原因を特定できた比率、同種の失敗の再発率、修復までの edit 数、自動 pass 後の人間 reject 率とする。比較対象は final screenshot と自由文 log だけを残す従来方式である。過去の repair trace を参照する条件と参照しない条件で、再発率か edit 数が下がるかを見れば、大がかりな RL なしで data engine としての価値を反証可能にできる。

記憶システムでは、raw trace と長期記憶を分ける。全 edit、失敗、render は raw に保存し、長期 atom に昇格させるのは、「どの条件で、どの check が失敗し、何を変え、再検証と人間判断がどう変わったか」まで接続できる trace だけにする。成功結果だけを要約すると失敗条件を失い、似た場面で過剰一般化する。repair pair と residual risk を recall の単位にすれば、記憶は「過去の完成物集」ではなく「次の失敗を早く局所化するテスト付き修復集」になる。

■ メリット・デメリット
メリットは、制作作業と評価データ作成を別作業にしない点である。engine の同じ実行が検証を返すため、人間は機械で落とせない意図、テンポ、読みやすさに注力できる。失敗→修復→再検証を object ID で連結すれば、同種障害の再現、headless 評価の改良、次の agent への修復例提示を一つの trace で兼ねられる。また engine と人間の判断を別 label にするため、「自動評価は正しいが作品としては不採用」を学習可能な失敗として残せる。

デメリットは、測りやすい値への最適化が強くなることだ。collision 数、到達率、フレーム時間は有用だが、それだけを reward にすると、危険な要素を削って単調な scene にするなど、ゲーム性を損ねて pass する。対策には verifier の複数化、seed や条件を変える randomized probe、作成 agent から隠した held-out check、人間の最終採否が必要になる。さらに trace には未公開 asset、作者の意図、デバッグ判断が含まれるため、ローカル保存、project 単位の権限、対外学習への opt-in、秘密情報と IP の redaction を最初から設計すべきである。engine 間でも import、collision、navigation の意味は異なるので、他 engine では直接再利用せず target runtime で再校正する必要がある。

■ 判定
部分採用。UWDP の最小 trace、検証 ladder、engine と人間の権限分離は、現在のゲーム制作と記憶システムに小さく導入する価値がある。ただし RL 学習、engine 横断の一般化、sim-to-real はまだ pilot 証拠であり、採用範囲に含めない。まず10 edit の比較で再発率と修復 edit 数が下がるかを測り、効果がなければ schema の増築を止める。

■ URL
https://arxiv.org/abs/2608.25518v1
