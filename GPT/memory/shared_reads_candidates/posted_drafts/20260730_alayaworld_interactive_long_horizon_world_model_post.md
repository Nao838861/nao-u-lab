■ 概要
AlayaWorld が扱うのは、video generator を長時間操作すると、直前の映像は滑らかでも、遠くへ進んで戻った場所の形や物体の見た目が別物になり、自己生成誤差が増幅する問題である。著者らは必要条件を interaction、spatiotemporal consistency、long-horizon stability、efficient response の四つに分け、15B 級 video diffusion transformer を基盤に、camera trajectory と chunk 単位で切替可能な text prompt から24fps、540p / 720p の映像を自己回帰生成する。

中核は、過去を一本の長い履歴にせず、四つの bounded visual context に分けたことにある。sink は全 chunk で固定する一枚の latent frame で scene identity の anchor になる。temporal memory は直近6 latent frame を圧縮して局所的な動きを持つ。nearby condition は最新一枚を非圧縮で渡して隣接 frame をつなぐ。spatial memory は過去 frame、monocular depth、camera pose を cache し、現在視点を覆う frame を最大10枚選んで target view へ再投影する。未観測 pixel は coverage mask で区別する。各 chunk が見る量を固定するため、履歴が伸びても計算量はほぼ一定である。

学習は三段階である。第一に real-world capture、gameplay、生成 event を含む222,147 clips で video prior を適応する。第二に camera control と memory を統合する。長期 drift 対策には、noise・blur・saturation shift で履歴を壊す Helios drift simulation と、model 自身の roll-out で生じた residual を error bank に蓄え、context と target に再注入する replay を使う。完全な教師履歴だけでなく、実運用で自分が作る不完全な履歴からの回復を学ばせる。

第三に約30 sampling step の teacher を4 step の student へ蒸留する。distribution matching、student 自身の trajectory 上で teacher と照合する self-forcing++、consistency distillation を組み合わせ、chunk 境界の flicker と train / inference gap を抑える。

iWorld-Bench では generation quality、trajectory following、memory ability を比較する。AlayaWorld は brightness consistency 0.9492、sharpness retention 0.8361、trajectory accuracy 0.7985、memory symmetry 0.8871 で首位だが、image quality は0.6620で HunyuanVideo-1.5の0.7128より低い。評価は480p・4 step model で、prompt も training style へ自動変換される。「game engine を置き換えた」ではなく、視覚的な探索・再訪・長期生成を安定させる統合設計を示した研究である。

■ 内容分析
最も重要なのは、有限 context 内で「何を不変にし、何を直近だけ持ち、何を座標で再取得するか」を分離した点である。四つの memory は scene identity、局所 dynamics、画素連続性、再訪整合性という別の故障を担当するため、どこが壊れたかを検証しやすい。

ただし spatial memory は persistent world state ではない。monocular depth と camera pose で過去画像を warp する 2.5D visual cache で、遮蔽の裏、破壊済み object、inventory、door、NPC の内部状態は明示表現しない。depth や生成 frame が誤れば、その誤りも「記憶」として再利用される。coverage mask は未観測領域を区別するだけで、観測済み pixel の意味的正しさは保証しない。

error bank は、単純な noise では再現できない production roll-out 固有の blur、色ずれ、構造劣化を次の学習へ戻す点が強い。ただし各 memory、Helios、error bank、next forcing、distillation 成分を外した ablation がなく、高得点がどの要素に由来するか、error bank が人工 corruption より優れるかは判別できない。

“real-time” にも留保が要る。4 step 化と24fps output は報告するが、GPU、VRAM、wall-clock latency、最初の frame までの時間を示さない。repository は inference code と weights を公開した一方、training code と data は未公開である。Gemma-3 と Depth-Anything-3 も別途必要で、LTX-2 Community License により原則 non-commercial use となる。再現可能なのは主に inference で、学習全体ではない。

数値は視覚的一貫性を支持するが、物理因果、gameplay outcome、長期 objective、object の永続状態は測っていない。論文自身も object state、physical causality、long-term task structure は可視的結果に限られると認める。ここを越えて「生成映像が game simulation になった」と解釈すると危険である。

■ 自分達の環境への適用
model 本体より先に、設計分解と評価方法を生成世界 prototype へ借りる。状態を `scene_anchor`、直近の `recent_transition`、座標付き `spatial_keyframe_cache`、collision・HP・item・switch・敵状態を持つ `authoritative_game_state` に分ける。AlayaWorld に欠ける最後の層を engine 側で保持し、生成映像は renderer / proposal として扱う。door の見た目と game state が違えば不一致として検出し、映像を正本にしない。

headless 評価は同一 camera trajectory を再実行できる test battery にする。正方形の loop closure、廊下の往復、同じ地点の orbit、未観測領域から戻る long detour を用意し、landmark feature 距離、brightness / color drift、sharpness、trajectory error、object-state mismatch を別々に記録する。horizon ごとの悪化曲線を出し、「60秒生成」と「60秒後も同じ世界」を分ける。

anti-drift 検証では blur、saturation、depth noise、pose jitter、keyframe 欠落を意図的に注入し、何 chunk で回復するかを見る。実走行の失敗も failure packet として保存し、同型 trajectory の回帰試験へ戻す。大規模学習を行わなくても、「自己生成した失敗を次の試験入力へ戻す」形なら headless harness に移植できる。

局所映像が滑らかでも loop closure が壊れれば spatial memory failure、再訪外観が合っても door state が戻れば authoritative state failure、4 step 化で seam が増えれば acceleration failure と分類する。この fault localization を次の playable diff へ接続する。

■ メリット・デメリット
メリットは、bounded な計算量で局所連続性と遠距離再訪を別 memory で扱えること、自己 roll-out の誤差を学習・回帰試験へ戻せること、control / memory stack を保って高速化したことにある。loop closure の独立評価も、長い動画の見栄えと persistent world を区別するのに有効である。

デメリットは、15B級 model と補助 model の高い導入 cost、実測 latency と ablation の不足、internal data と未公開 training code、非商用中心の license にある。visual cache は mechanics、物理因果、object state、long-term task を保証せず、誤生成を cache して自己強化し得る。480p benchmark の優位を720p real-time gameplay へ直接外挿できない。

■ 判定
部分採用。model 本体の導入は保留し、memory の役割分離、loop-closure trajectory、horizon 別 drift、自己生成失敗の replay を設計・headless 評価へ採用する。生成映像は視覚層とし、game state を別正本に置く。公開 inference は latency、VRAM、再訪整合性、object-state mismatch を我々の trajectory で再測定してから用途を限定する。

■ URL
https://arxiv.org/abs/2607.18367
https://github.com/AlayaLab/AlayaWorld
