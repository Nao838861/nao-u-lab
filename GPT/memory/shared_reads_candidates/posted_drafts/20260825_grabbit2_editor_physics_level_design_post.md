■ 概要
Grabbit 2 は、Unity の Play Mode に入らず、Editor 上の選択物だけを一時的な physics simulation に入れて level dressing を行う plugin の全面再構築事例である。椅子や瓦礫を座標で直接置くのでなく、重力・衝突で落ち着いた結果を transform へ書き戻し、一時 component と設定は消す。対象 object に Collider や Rigidbody がなくても動く一方、scene の他の物体や project physics settings を変えず、失敗時にも元へ戻す必要がある。さらに一万 object 以上の scene で全 mesh を準備すると数秒かかるため、自然な配置だけでなく、局所性・隔離・復旧可能性が設計課題になる。

中核は manual physics loop と selection 周辺だけを読む局所 world である。Grabbit 2 は scene を事前解析した persistent spatial cache から近傍 object を取り込み、既存 Rigidbody を一時停止し、physics settings を退避してから Editor 時間で simulation を進める。終了時には設定と object を戻す。初版が scene 全体を毎回読み込んだのに対し、処理量を選択範囲の周辺へ閉じ、temporary collider は pool、collider bake は parallel 化した。

任意 mesh の衝突形状も実行時に作る。PhysX では動的 object に concave MeshCollider をそのまま使えないため、複数の convex piece へ分解する。方式は、高速な voxel decomposition の Balance、凹部を保ちやすい collision-aware decomposition の Precision、box・sphere・capsule・cylinder へ単純化する Performance の三つ。高精度 bake が終わるまでは粗い近似を差し、操作待ちを隠す。生成形状は prefab や Project window から恒久 bake でき、runtime に Grabbit code を含めず build へ持ち込める。

初版は約二千行の単一 tool として育ち、script recompile や Editor crash で一時 Rigidbody や変更設定が残る、large scene で遅い、Undo が不安定、専用 window との往復で scene 文脈が切れる、という失敗を持った。再構築版は interrupted session の state を記録して次回 load 時に残骸を検出・復元し、one-click cleanup も用意する。全変更を Unity Undo 経由にし、操作 UI は Scene toolbar と overlay へ移した。著者の結論は、物理配置の着想より、cleanup・Undo・局所 cache・文脈維持が実 project で信頼できる tool を作る、というものだ。

■ 内容分析
価値があるのは physics を「配置結果を作る algorithm」ではなく、「一時 state を借り、結果だけ commit する transaction」として組んだ点である。開始時に既存状態を snapshot、simulation 中は周囲から隔離、成功時は transform または collider asset だけを確定、失敗・中断時は rollback、次回起動時は recovery する。この境界なら、物理の非決定性や Editor lifecycle の中断を、scene 全体の破損へ波及させにくい。

五つの mode も単なる機能一覧ではない。Select は volume、画面内、現 selection から作業集合を作り、mesh・size・resting height で絞る。Create は weighted collection から prop を生成し、line・spline・ring・volume に置いて落ち着かせる。Place は surface slide と overlap 回避、click 点を保持した精密な掴みを行う。Arrange は line・curve・plane への整列や重なり解消、Scatter は randomize、爆風状の拡散、heap、微小 variation を物理で行う。すべてが rebind 可能な native Editor tool で、同じ primary action を持つ。つまり「自然に散らす」という曖昧な一機能を、作業集合の決定、生成、手置き、秩序化、乱雑化へ分け、各段階を人が修正できる。

任意の MCP hook も重要な境界を示す。AI assistant に最終座標を推測させず、Place や Scatter という既存の検証可能な operation を呼ばせ、衝突解決は同じ physics core に任せる。integration は opt-in、Editor-only、host を導入しなければ無効で build に追加物もない。AI の役割を「scene を直接書き換える主体」から「限定 operation を選ぶ caller」へ狭めている。

一方、記事は著者自身による tool 解説であり、客観的な性能評価ではない。一万 object 以上でも速いという課題設定はあるが、初版との load time、memory、bake throughput、Undo 成功率、復旧率の測定値は示されない。三 collider 方式の形状誤差や simulation cost の比較もない。別 project、複雑な prefab、joint、custom physics setting での検証や user study もないため、「scene 規模にかかわらず速い」「正確に復元する」は設計意図として読み、保証として扱うべきではない。

■ 自分達の環境への適用
直接使えるのは、level 自動生成を一発の座標列出力にせず、preview / commit / rollback を持つ局所 operation にする考え方である。まず prop 20〜100個の小 scene で、対象 bounds を明示し、周辺 collider だけ cache し、seed・physics step・engine version・入力 selection を artifact に残す。AI には `select_region`、`scatter_props`、`settle_selection`、`commit_transforms`、`rollback_session` のような粗い tool だけを渡し、任意 component 追加や全 scene 保存は許可しない。

headless 評価では、見た目の自然さだけでなく transaction の安全性を測る。①overlap 数と penetration depth、②支持面を失った floating prop、③範囲外 transform の変更数、④同一 seed の結果差、⑤中断後の temporary component 残数、⑥rollback 後の scene hash、⑦Undo 一回で戻る変更範囲、⑧近傍 object 数に対する処理時間を記録する。粗い collider を使う preview と高精度 bake 後の commit で結果が変わるため、preview quality と final quality を別に測る。

制作サイクルには「生成→物理 settle→診断→人の承認→確定」を一単位として入れる。失敗 snapshot を残せば、単に再生成するのでなく、薄い脚、深い凹形状、極端な scale、階層化 prefab など collider 近似が壊れた条件を次の fixture にできる。runtime collider bake は別 gate にし、Editor 配置用の近似が gameplay collision、navigation、performance に適するかを自動的に同一視しない。

■ メリット・デメリット
メリットは、自然な接触配置を人の微調整と両立し、large scene の費用を局所化できること、AI と scene の間に狭い operation 境界を置けること、Undo・cleanup・session recovery を最初から製品機能として扱えることだ。convex decomposition の品質と費用を三段階に分け、待ち時間中は近似へ退避する設計も、対話的 tool の latency 管理として使える。

デメリットは、近似 collider が細い脚や穴を潰して不自然な安定姿勢を作り得ること、pool と persistent cache の invalidation が新たな複雑性になること、physics settings や Unity version の差で再現性が崩れることだ。simulation が自然に見えても gameplay 上の可読性や意図した導線を保証しない。AI hook を付けても選択範囲、保存権限、復旧検査が弱ければ、誤操作を高速化するだけになる。Unity 6 が必要で、旧 project は Grabbit 1 の範囲に留まる点も移植制約である。

■ 判定
部分採用。製品導入を即決するのでなく、「一時 world で試し、結果だけ確定する」「局所 cache」「中断復旧」「Undo」「AI には限定 operation を渡す」という tool architecture を小規模 prop 配置 probe に採る。範囲外変更ゼロ、rollback hash 一致、残骸ゼロ、再現性、処理時間を gate にし、collider 誤差と runtime 適性は別評価する。記事にない定量比較は自分達の fixture で補う。

■ URL
https://80.lv/articles/how-grabbit-2-simulates-physics-inside-the-unity-editor
