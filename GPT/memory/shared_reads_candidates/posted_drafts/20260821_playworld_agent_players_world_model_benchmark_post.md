■ 概要
PlayWorld は、操作から次の映像を作る interactive video world model を、固定 action sequence ではなく「同じ長期目的を達成し、その過程で世界を保てるか」で比較する benchmark である。モデルごとに一入力で進む距離や回転角が違うため、同じキー列では到達地点が揃わず、世界の空間記憶と軌道到達失敗を混ぜて測ってしまう。

各 case は、初期画像、長期 objective、人手の基本 action sequence、固有の Yes/No rubric を持つ。multi-modal Agent Player は最新 frame と履歴を見て、Keep、Stop、Extend、Correct、End の五判断だけを返す。基本 sequence を共通 prior とし、行き過ぎなら止め、不足なら延長し、予定から外れた時だけ補正する。W/A/S/D、矢印、WAIT を各モデル固有操作へ変換し、End または40 step まで回す。rollout は約10～60秒である。

benchmark は171 case、50 action pattern、9 model、1,400本超の video、820問超の rubric からなる。中核は、再訪後も物体 identity と配置を保つ geometry consistency、接触が運動・衝突・視覚反応を伴う interaction fidelity、画面外の対象が同一性を保って進行する out-of-sight evolution、固定視点の調理や行列が停止・反復・飛躍せず進む insight evolution の四軸である。別に映像品質7指標と、推定 camera pose による移動・回転 control も測る。

Gemini 3.1 Pro が10 FPS の低解像度 contact sheet と0.5 FPS の高解像度 stream を読み、固有質問へ二値回答する。ただし geometry と out-of-sight は軌道、interaction は対象反応と到達を先に gate とし、失敗 rollout は最低点1にする。「水へ着かなかったため波紋がない」を物理表現の失敗とする混同を抑える設計だ。

最良の Genie 3 でも四軸平均2.12 / 5、次点 HappyOyster 1.92で、持続的 state evolution が特に弱い。Taj Mahal を一周すると別位置に複製する、画面外の作業が進まない、水へ入っても反応がない、といった長期破綻が出る。Preset Only、Agent Only、Preset + Agent を2モデル各25 case で比べると、併用方式が trajectory score と人間選好で最良、変更操作は12.0%と14.9%だった。全行動をLLMに作らせず、共通 script を狭く補正する方が比較可能性と到達性を両立した。

■ 内容分析
この研究の価値は「agent が遊べる」ことより、評価対象への到達と、到達後に測りたい能力を分離したことにある。固定 replay は再現性が高いが、操作感度が違う対象間では同じ意味の状態へ着かない。完全自律 player は目的へ適応できるが、経路差が大きくなり、遅く、player の失敗を対象モデルの失敗と誤認しやすい。PlayWorld の基本 sequence＋限定補正は、その中間に比較単位を作る。公平性を「同一キー列」ではなく「同一 objective、同一初期 prior、記録された補正規則」として定義し直した点が重要である。

結果も、従来の映像指標だけでは足りないことを具体的に示す。多くのモデルは motion smoothness や temporal flicker で95～99%台を得る一方、四軸 rubric は低い。HappyOyster は九つの基礎指標を順位化した Basic Ability Score では最高76.4だが、長期 objective の総合は1.92で Genie 3 に及ばない。SANA-WM も軌道 validation 通過率80.4%に対して rubric 総合1.48で、操作に従って評価地点へ行けることと、その地点まで因果的な世界を保てることが別能力だと分かる。見た目、control、objective 到達、world state 保持を一つの成功率へ潰さない設計は堅い。

限界もある。制御 ablation は2つの closed-source model、各25 case だけで、異なる game mechanics まで一般化した証拠ではない。Agent model 三種の差が小さいのも、自由 planning でなく既定 sequence の補正に限定した条件である。人間評価との順位相関は総合 Spearman ρ=0.933と良好だが、120 pair・600 judgment の全員一致は29.2%、Fleiss κは0.434で、個別 case の絶対正解まで保証しない。VQA の追加採点との平均 sample variance 0.0112も集約安定性の確認に留まる。

adaptive player は各モデルへ異なる実操作を与えるため、objective-level の公平性を上げる代わりに exposure は同一でなくなる。易しい経路へ逃げる可能性もあり、実操作列、補正率、到達 gate、終了理由を score と並べる必要がある。PlayWorld が task id、初期 frame、基本 sequence、実操作、途中 frame、Agent 判断、終了条件、最終 video を保存するのは、この弱点への重要な対策である。

■ 自分達の環境への適用
生成ゲームや MonoSH 系 prototype の版間 headless / GUI playtest には、構造を部分移植できる。まず一つの test case を `initial_state + objective + basic_action_prior + observable_completion + rubric` とする。例として「開始地点から砲台を回り込み、裏側の印を再確認する」「敵を画面外へ誘導し、戻った時もHPと位置が継続する」「水面へ侵入し移動速度と演出が変わる」を置く。A/B build へ同じ seed と objective を与え、scripted bot は基本 prior を実行し、画面または deterministic state から不足時だけ Extend / Correct する。

player と judge は別 process にし、judge は最初に objective-validity gate を通す。未到達なら interaction score を推測せず `trajectory_fail`、到達後だけ collision、damage、state transition、visual feedback を採点する。記録単位には build hash、seed、objective、基本操作、実操作、補正理由、state snapshot、screenshot、終了理由を必須にする。比較表には成功率だけでなく、agent-modified action ratio、到達率、平均 step、deterministic assertion、visual rubric を並べる。

我々の実ゲームでは engine state が正本として取れるため、VQA を主 judge にする必要はない。位置、HP、inventory、event id、off-screen timer、collision flag は deterministic assertion で判定し、画面固有の読みやすさ、演出、animation の因果性だけを視覚 judge に任せる。これにより、論文の VQA 誤差を持ち込まず、screen-only な web model より強い oracle を使える。小さな probe は同一 build に操作感度だけを0.7倍・1.0倍・1.3倍にした三条件を作り、固定 replay、完全 agent、基本 prior＋補正を各10 seed で比較する。到達率が上がりつつ補正率20%以下、deterministic failure の見逃しが増えないなら採用する。

■ メリット・デメリット
メリットは、異なる操作感度を持つ build 間でも「同じ目的」を比較でき、短い replay では隠れる再訪、画面外 state、長い因果連鎖を test case にできることだ。基本 prior が経路のばらつきと推論費用を抑え、限定された五判断は実行 trace を監査しやすい。到達 gate によって player failure と game failure を分離し、映像品質、control、task 達成、state persistence を別軸で残せる。

デメリットは、Agent の補正が新しい交絡要因になること、objective と rubric の人手設計費が高いこと、長時間 rollout が不安定で高コストなことだ。VQA はもっともらしい frame に騙され、内部 state の破綻を見逃しうる。逆に実ゲームで取れる完全な state trace を捨てて画面採点へ寄せると精度が落ちる。40 step や補正率の閾値も環境依存で、論文値をそのまま標準にできない。目的達成のため経路を変えすぎると、同じ難所を踏んでいない二 rollout を比較する危険もある。

■ 判定
部分採用。`基本 action prior + 狭い closed-loop 補正 + objective-validity gate + player/judge 分離 + 完全 trace` を、操作感度が異なる prototype の版間比較へ導入する。採点の正本は deterministic engine state とし、視覚 judge は補助に限定する。まず三操作感度×10 seed の probe で、到達率、補正率、誤判定、実行費を測り、固定 replay より長期破綻の検出が増えた時だけ harness の標準部品にする。

■ URL
https://arxiv.org/abs/2608.13552
