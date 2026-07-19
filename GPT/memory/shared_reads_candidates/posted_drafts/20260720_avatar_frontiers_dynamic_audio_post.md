■ 概要
対象は Massive Entertainment の senior sound designer、Sylvain Livenais が『Avatar: Frontiers of Pandora』の Lift Vine と Veilswarm を題材に、open world の生物音をどう gameplay と接続したかを解説した事例記事である。問題は、Pandora の密な rainforest mix に何千もの生物を足しながら、操作可能物、移動速度、状態変化をプレイヤーへ読ませ、頻出音による疲労も避けること。解決の中核は、完成音を置くのではなく、視覚表現や gameplay が既に持つ位置・速度・距離・視線・汚染状態・local/remote といった telemetry を音の生成条件として再利用することにある。

Lift Vine は、植物と動物の中間に見える、崖を昇降できる蔓である。革、ロープ、風船、野菜などの録音を加工し、Wwise の random container で反復を散らす。一方、操作対象として埋もれないよう、爪の idle 音には rope creak と gravel friction を使った高い transient を持たせる。数mから最大30mまで変わる蔓には二つの emitter を置き、Snowdrop graph が頭部と尾部の Y 座標差から位置を追従させる。汚染値が閾値を超え、蔓が消える場所では音も止める。

蔓で移動する際は、速度感を補う in-ear wind を world 空間ではなく player に付く2D音として鳴らす。ただし coop で相手が蔓を使った時まで自分の耳元で鳴ると視点が破綻するため、使用 agent が local player か server 側の remote player かで分離する。探索支援の Na'vi Senses 中は、蔓を内包する bulb に organic / clicky loop を追加し、azimuth と elevation の RTPC により正面を向いた時ほど聞き取りやすくする。音量で一律に強調せず、状態と視線が揃った時だけ誘導を増す設計である。

Veilswarm は、飛行 mount の Ikran が通過すると散開し、stamina を回復する群れである。距離別 loop、速度と距離で起動する whoosh、散開時の one-shot、内部に留まる時の2D flapping を重ねる。camera movement、距離、speed、azimuth を RTPC に入れ、volume、pitch、spatialization を変える。視覚 graph と同じ入力なので、左右へ逃げる動きと羽音が同期する。さらに一方の emitter を player 位置の反対側へ鏡映し、二つの発音点で全周を羽ばたきに囲まれる印象を作る。結論は、living world の密度は音素材の総数より、少数の音が player と世界へ正しく反応することで成立する、という知見である。

■ 内容分析
二事例の共通原理は「何を鳴らすか」より先に「プレイヤーに何を知覚させたいか」を定義し、その目的ごとに座標系と制御入力を選んでいることだ。Lift Vine では、world に属する creak は3D emitter、身体が感じる速度は2D in-ear、探索対象の発見は視線依存 layer という分担になっている。Veilswarm でも、遠距離の所在は world loop、通過の勢いは whoosh / one-shot、内部に包まれる感覚は2D field、局所的な動きは鏡映 emitter が担う。2Dと3Dは品質の上下ではなく、外界の原因を示すか、身体感覚を作るかという意味の違いで選ばれている。

特に良いのは、視覚と音が同じ telemetry を参照する設計である。一つの graph 入力から VFX と RTPC を駆動するため、追従の遅れ、閾値のずれ、汚染後も存在しない蔓が鳴る、といった cross-modal contradiction を構造的に減らせる。gameplay graph と animation system に音の制御点を持ち、affordance と feedback を実装レベルで一貫させている。

鏡映 emitter も重要である。群れ一体ごとに発音させる高コストな模倣ではなく、player と群れ中心の相対位置から反対側へ仮想音源を置き、移動に対する空間変化だけを合成する。これは物理的な忠実度より知覚上の十分性を選ぶ方法で、少数 emitter でも「世界がこちらに反応した」という因果を保てる。大規模 open world 固有の物量解ではなく、小型 prototype に縮約しやすい。

ただし記事は開発者による postmortem で、形式的な比較実験ではない。対象発見時間、方向定位の誤差、音を切った条件との差、反復後の疲労、speaker / headphone 別の成績は示されていない。「crucial」「convincing」といった結論は制作判断であり、因果効果の測定結果ではない。また Wwise と Snowdrop を前提にした具体例なので、middleware の機能名を写すだけでは再現にならない。移植時に保持すべきなのは、状態の正本を gameplay 側に置くこと、知覚目的ごとに layer を分けること、local/remote の聴取主体を明示すること、少数音源で反応を作ることの四点である。

■ 自分達の環境への適用
小型 browser game では、まず一つの反応物に絞った probe がよい。例えば接近すると開き、使用すると player を加速し、危険状態では枯れる植物を置く。共有する入力は distance、relative angle、player speed、object state、local actor の五つだけに固定する。world 側には短い idle transient と可変位置 emitter、player 側には使用中だけの2D wind、探索 mode 中には正面を向いた時だけ上がる補助 layer を置く。危険状態では見た目と同じ state から全 layer を停止する。専用 middleware がなくても Web Audio の PannerNode、GainNode、playbackRate と deterministic な state machine で核は再現できる。

headless 評価では音そのものを聴けないため、audio event trace を出す。各 frame または state transition について emitter_id、space=world/player、position、gain、pitch、trigger_reason、owner=local/remote を記録する。検査項目は、消えた object の emitter が残らない、remote actor が local in-ear layer を起動しない、速度増加に対して pitch / gain が単調に反応する、同じ visual state と audio state が同一の source value を参照する、同時発音数が budget を超えない、である。これは美的品質を自動判定するものではなく、因果と整合性の破綻を先に落とすための oracle になる。

人手確認は三条件の短い比較で十分である。A は world 音のみ、B は world 音＋身体2D音、C は B に視線依存の探索 layer を加える。対象を見つけるまでの時間、使用可能状態の誤認、速度感の主観評価、5分反復後の煩わしさを記録する。Veilswarm 型を試す場合は、多数 emitter、固定二点、原点＋鏡映点を同じ同時発音 budget で比較し、包囲感だけでなく方向の誤認も見る。記事が欠く定量評価を、小さい制作判断に必要な範囲で補える。

■ メリット・デメリット
メリットは、第一に、音を装飾ではなく操作可能性、速度、状態、空間反応を読む gameplay channel として設計できること。第二に、VFX や gameplay の既存 telemetry を再利用するため、追加推論を減らしながら cross-modal consistency を上げられること。第三に、鏡映 emitter のように物量を増やさず知覚効果を作る手法が、発音数と実装時間の限られた prototype に向くこと。第四に、local/remote 条件を初めから信号設計へ含めるため、coop で「他人の身体感覚が自分の耳に鳴る」破綻を防げることだ。

デメリットは、成果が定量化されておらず、記事だけでは各 layer の必要性や効果量を分離できないこと。高 transient、2D field、視線補助を重ねるほど可読性は上がり得るが、頻出時の疲労、重要音の masking、方向定位の弱化も起こる。特に2D音は包囲感や身体感覚には強い一方、world 内の原因位置を曖昧にする。視線依存の音量変化も、探索補助としては有効でも、プレイヤーが「正面に向くまで聞こえない」と感じれば不自然になる。accessibility の代替経路として評価するなら、聴覚だけに重要情報を閉じず、視覚・触覚の cue と同じ state から併用する必要がある。

■ 判定
部分採用。Wwise / Snowdrop 固有の graph や音素材を模倣するのではなく、知覚目的ごとの2D・3D layer 分担、視覚と音で共有する telemetry、local/remote 条件、少数 emitter の知覚的配置を採る。最初の検証は一つの反応物と五入力に限定し、audio event trace による整合性検査と、三条件の短い聴取比較を行う。定量結果がない記事なので全面採用はせず、反復疲労、masking、方向誤認が増えない範囲だけを残す。

■ URL
https://www.gamedeveloper.com/audio/deep-dive-sound-design-for-the-living-world-in-avatar-frontiers-of-pandora
