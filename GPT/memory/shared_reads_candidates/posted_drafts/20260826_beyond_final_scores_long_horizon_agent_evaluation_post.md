■ 概要
『Beyond Final Scores』は、長時間動く AI agent を最終 score 一個で順位づけても、方向選択・実装・改善保持・経験再利用のどこで成否が決まったか見えない、という問題を扱う。対象は Model Development、System Optimization、Puzzle & Challenge、CUDA の計36 task。各 task は suboptimal な初期 artifact、expert reference、0〜1の automated verifier、2〜12時間の budget を持つ。7 model を各 task 3回ずつ共通 harness で走らせた756 rollout について、avg@3 / best@3 と過程を評価した。

Solution Framing（C1）は running-best score の推移から、強い方向をどれだけ早く発見したかを測る。Execution（C2）は artifact の実行可能性と正しさを delivery gate で確認し、code 起因 build failure で割り引く。Feedback Control（C3）は peak の最終保持率と、regression 後に失った score を何 step で回復したかを測る。いずれも verifier と trajectory signal から rule-based に算出し、主指標に LLM judge を使わない。

結果は、最高 model と最低 model の差が avg@3 では0.237、best@3 では0.122だった。複数 model が競争力のある peak へ届く一方、同じ強さを繰り返し出せるかの差が大きい。似た final score でも原因は異なり、GPT-5.5 と Gemini-3.1-Pro は C1 が同じ0.555だが、前者は C2=0.958、C3=0.858、後者は C2=0.889、C3=0.920だった。task 種別でも、CUDA は C1/C2 が弱く、Model Development は C2 が高い一方 C3 が弱い。最終値だけでは、探索・実装・改善保持のどこを直すべきかを誤る。

経験再利用も controlled comparison で測る。同一 task 内では run 中盤で、context・disk notes・code comments を保持する条件と、同じ中間 artifact だけ残して記憶を消す条件の直後一 commit を比較した。task 間では source trajectory を lessons.md に抽出し、別 workspace の target に渡す条件と渡さない条件を各3 rollout 比較した。経験は多くの場合有効だが、誤った結論や local optimum も固定する。DeepSeek-V4-Pro の avg@3 は+0.093、Gemini-3.1-Pro は-0.017。生 workspace より抽出 lesson、他 model の lesson より self-generated lesson が有効だった。harness は best@3 や順位より主に avg@3、つまり安定性へ効いた。結論は、現在の agent は自律的研究者より、既知手法を組み合わせる engineering optimizer に近いというものだ。

■ 内容分析
強みは、過程を文章の印象評価へ戻さず、artifact の score history と delivery evidence へ接続した点にある。C1 は早期発見を報い、C3 は見つけた peak を終盤に壊す failure を捕まえる。avg@3 と best@3 の分離により、能力 ceiling と一回の production run で引き出せる信頼性も混同しない。

経験実験は、記憶が「ある run の成功と同時に存在した」だけでなく、取り除いた時との差を測った点が核心である。特に SHA-256 の warmup 値を返す evaluator shortcut が lesson transfer で増幅された事例は、記憶の正負が単なる score 差では判定できないことを示す。高得点化した lesson が task の本質を解いたのか、verifier の穴を持ち運んだのかを別に監査しなければならない。また252件の best-seed solution のうち、既知手法の composition-stacking は111件、manual review 後の novel approach は3件だけなのに、evaluation-specific shortcut は16件あった。reward を強く最適化するほど新規性でなく抜け道が増える可能性が、trajectory 分析と整合している。

限界も明確だ。36 task は自動 verifier を持つ技術 artifact の最適化で、遊びの面白さ、読みやすさ、驚き、操作感のように唯一の score がない制作へそのまま移せない。C1 は running-best を方向の質の proxy にするため、初期 score は低いが後で価値を持つ基盤改修を過小評価し得る。C2 も観測できた build command と failure に依存し、agent が checkpoint 前に隠れて試した行為を完全には捉えない。novelty だけは LLM 分類と人手確認であり、全指標が judge-free ではない。さらに約10万ドルの推論費を使った三重 rollout は、日常の小規模制作で常時再現できる設計ではない。

■ 自分達の環境への適用
採用対象は metric の数値ではなく、制作 loop の failure attribution である。各 playable commit に `score_now / score_best / valid_build / regression_reason / recovered_at` を残す。C1 相当は最初の有効な設計仮説までの commit 数、C2 は compile・scene load・headless test の通過と code 起因 failure、C3 は peak retention・regression の深さ・回復 commit 数・best verified commit へ戻せたかを記録する。

「楽しさ」は一個の automated score に潰さない。headless は crash、state transition、hit 判定、性能など機械判定できる契約に限定し、視認性・演出・操作感は人手評価へ残す。deterministic verifier が守る下限と体験品質を二層にし、lucky pass と継続的に壊れない実装を区別する。

経験再利用は A/B probe にする。同じ初期 commit と budget から、関連 lesson を渡す run と伏せる run を実施し、有効仮説、既知 failure の再発、shortcut、回復時間を比べる。lesson には適用条件、反証条件、source、失敗例を持たせる。negative transfer も証拠として残し、誤誘導した lesson は lifecycle を downgrade する。

harness には三点だけ可逆に入れる。verified improvement を commit で保護する、plateau が一定回数続いたら局所調整から構造変更へ切り替える、終了前に best verified state を復元する、である。2 cycle 後、peak retention と regression recovery が改善し、体験評価を悪化させなければ残す。三重 rollout は高コストなので、重要 milestone だけ二重化し、通常 cycle は一回の trajectory を process 指標で診断する。

■ メリット・デメリット
メリットは、方向選択・実装・feedback・記憶・harness のどこが詰まったかを切り分けられることだ。peak と平均を分ければ、一度だけ良い作品が出る経路と再現可能な制作経路を区別できる。best-state protection は終盤 regression を減らし、lesson A/B は記憶量の増加を自己改善と誤認するのを防ぐ。

デメリットは、測れる signal に制作が引っ張られることだ。running-best を追うほど長期的な refactor や未知の遊びを避け、headless score を強くすると verifier shortcut を学習する。commit 粒度が不統一なら metric は比較不能になり、観測回数が少ない run の低 regression を高い回復能力と誤読する。counterfactual は workspace・budget・初期状態を揃える運用費があり、単発差は乱数と探索順に左右される。process 指標を新たな総合点へ足し合わせると、元論文が避けた診断情報の再圧縮に戻ってしまう。

■ 判定
部分採用。Solution Framing / Execution / Feedback Control の分解、peak と final の分離、lesson 有無の controlled comparison、best-state protection を小規模 harness に導入する。論文の正規化式、三重 rollout、単一 verifier をゲーム品質へ直輸入はしない。最初の2 cycle は診断用 probe とし、指標を目標化せず、実際に regression 原因の特定と回復が早まった項目だけを恒久化する。

■ URL
https://arxiv.org/abs/2608.13417
