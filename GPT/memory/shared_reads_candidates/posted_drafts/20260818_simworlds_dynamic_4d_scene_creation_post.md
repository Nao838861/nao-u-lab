■ 概要
SimWorlds は、自然言語から「動画としてそれらしく見える3D scene」ではなく、幾何、材質、照明、camera、animation、physics solver が明示的に残る、再編集可能な Blender の dynamic scene を作る multi-agent system である。布が椅子にかかる映像は、cloth solver でも shape key でも手付け keyframe でも似せられる。しかし後者は条件を変えて再 simulation しても物理的意味を保たない。本研究は、pixel の見た目と mechanism correctness を分けて作り、分けて測る。

最初に planner が prompt を、objectの寸法・位置・PBR material・physics role、object 間の関係 graph、motion phase、lighting、camera、render intent を持つ global scene plan へ変換する。その後は modeling、UV、texture、deformation setup、motion、camera、light、render の固定順で構築する。各 stage で coder が実行中の `.blend` を延長し、独立した deterministic verifier が scene 構造と mechanism を調べ、reviewer が preview と runtime readout から知覚的な受入条件を判定する。硬い検査が落ちたら次へ進めず、当該 stage だけ retry または replan し、成功時に checkpoint を保存する。

検査可能性のため、Blender の native 構造の上に3層の scene protocol を置く。L1 は scene、L2 は room・physics・light などの system、L3 は複数 mesh を1つの logical object として束ねる collection で、その root Empty に全 mesh を parent する。Blender が直接表さない表面 contact や co-movement も宣言する。verifier は collection 構造、parent chain、BVH で測る「接触宣言どおりに触れているか」「未宣言の貫通がないか」、plan と実 scene の関係、motion phase 終了時の静止などを機械的に確認する。`scene_state` は modifier stack、physics cache、f-curve を返し、motion sheet は actor ごとの時間変化と bake 状態を示す。

評価用の 4DBuildBench は50 scene。うち45は cloth、fluid、rigid body、particle、soft body の5 category に9件ずつ、single actor、同一 solver 内の複雑化、solver 間 interaction の3難易度で、残り5は static scene である。headless Blender で42種の predicate と手付け motion を退ける anti-cheat を調べる MPR、空間関係を測る SPR、5 frame で object・関係・動作・品質・美的項目を二値判定する VLM score の独立した軸を使う。VIGA との比較では MPR .87対.67、SPR .89対.70、VLM .82対.78だった。

■ 内容分析
最も価値があるのは multi-agent の人数ではなく、成果物を「映像」ではなく「型の付いた実行可能 artifact」と定義した点である。visual reviewer は見た目の合否に限定し、solver、cache、collision partner、constraint、force field、keyframe density は engine state で測る。「正しく見える」と「正しい仕組みでできている」を1つの score に潰さないため、keyframe で偽装した物理は VLM で高得点でも MPR で落ちる。MPR の20 point 差に対し VLM は4 point 差に留まる結果は、この測定分離と整合する。

さらに、制作時の verifier と外部 benchmark audit は code を共有しない。自分で protocol tag を付け、同じ tag の有無で自己採点するのではなく、benchmark 側は最終 `.blend` の native state だけを読む。これは強い。一方 SPR は logical object の grouping 習慣に左右され、protocol を出さない VIGA の未整理 mesh を幾何的に grouping し直すと.62から.70へ上がった。著者も SPR は補助証拠とし、より中立な MPR を主にしている。

15 scene の ablation も作用点を分けている。full の MPR/SPR/VLM=.97/.97/.87 に対し、verifier なしは.93/.87/.84、stage なしは.94/.92/.76。verifier は multi-object scene の浮き・貫通など構造を、stage 分割は material・lighting・composition の視覚品質を主に守る。逆に MPR はどちらを外しても小幅低下で、solver setup の強さを verifier または stage だけの功績にはできない。runtime tool、Blender 5.1 の API から自動生成した knowledge base、role prompt なども含む full system の差である。

因果的な一般化には制約がある。from-scratch の直接 baseline は VIGA 1種で、両者とも Opus 4.7 を使うが、VIGA は native の最大15 round、SimWorlds は stage ごとの bounded retry で、生成時の budget は同数に揃えていない。編集評価は6 iteration に合わせているが別 benchmark である。また50 scene の ground-truth YAML は人手で定義され、VLM は GPT-5.5 と5 frame に依存する。Blender 以外、長時間の simulation、複雑な gameplay logic への移衍は未検証である。

■ 自分達の環境への適用
移植先は Blender agent そのものより、game prototype の headless 評価である。screenshot や最終 video が正常でも、敵の state transition、collision layer、spawn trigger、invulnerability window、score event が意図した mechanism で動いているとは限らない。仕様を `actor / component / required_state / forbidden_state / relation / phase` の assertion に分け、実行中の engine state で測る。見た目は別の画像・動画レビューに残す。

制作 loop は「scene/schema、静的 asset、物理・当たり判定、時間変化、camera・演出」の依存順に分け、global specification は途中で密かに書き換えない。各 stage 完了時に実行可能 checkpoint と検査 report を残し、後段で壊れたら最後に合格した状態へ戻す。これはエージェントを三役に増やさなくても、1つの実行 loop の stage gate として実装できる。

最初の probe は動的 gimmick 3件でよい。例えば連鎖する物理 object、時間で変化する障害物、複数 actor が同期する boss 演出に対し、①必要 component・connection・state transition の assertion 通過率、②接触・貫通・可達性、③代表 frame の視覚品質、④修正が他 stage を壊した回数、⑤retry 時間を記録する。一括生成と stage gate 付きを同じ仕様で比べ、再現可能な内部失敗が局所 retry で減るかを確かめる。

■ メリット・デメリット
メリットは、実行 state を正本にした deterministic gate で偽装や偶然見えた成功を落とせること、stage checkpoint で失敗の波及と修正範囲を小さくできることだ。仕様を protocol と assertion にすると、後の自動評価と人間レビューの役割が明確になる。

デメリットは、厳密な protocol と手作業 predicate の設計・保守 cost、stage ごとの model call、preview、bake、retry の実行 cost である。固定順は依存を明確にする一方、素早い小修正には過剰になる。deterministic check で扱えない prompt alignment、美しさ、遊びの手触りは依然として不安定な model 判断と人間評価が必要になる。

■ 判定
部分採用。engine-state assertion、視覚評価と mechanism 評価の分離、依存順の stage gate、合格 checkpoint からの局所 retry は、game prototype と headless 検証に移植する。Blender 固有の3-agent 構成と全 protocol は一括導入せず、3件の dynamic gimmick probe で内部失敗と修正波及が減ることを確認してから拡張する。

■ URL
https://arxiv.org/abs/2607.01766
