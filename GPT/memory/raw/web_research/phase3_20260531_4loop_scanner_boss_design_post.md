■ 概要
4:Loop の Scanner boss 記事は、co-op shooter の boss を「プレイヤーへ直接撃つ敵」ではなく、移動、空間認識、役割分担、事前準備を同時に要求する encounter として設計する例である。Bad Robot Games の Mike Booth は、boss design の目標を、振る舞いごとに異なる敵を作り、プレイヤーに新しい協力、improvisation、equipment / ability combination を要求することだと説明している。Scanner、内部名 The Cube は、direct combat から意図的に外し、navigation、spatial awareness、cross-map coordination を中心に作られている。

Scanner は巨大な floating cube で、プレイヤーを弾で撃たない。代わりに map 全体へ Laser Matrix を放つ。Grid of Doom とも呼ばれる赤い laser grid で、1 hit で down、2 hit で fight から除外される。序盤の grid は遅く見やすいが、fight が進むにつれて tighter になり、navigation と survival が難しくなる。避けるだけでは勝てず、Laser Matrix を避けながら Scanner を破壊しなければならない。

Scanner は cube なので 6 faces を持つ。各 face には 9 destructible tiles があり、合計 54 targets。damage を与えるには、54 panels をすべて壊し、vulnerable Reactor Core を露出させる必要がある。Scanner は常に rotate し、sections を swap し、巨大な cube puzzle のように動く。さらに damaged panels は時間経過で reset される。チームは複数角度へ散り、Laser Matrix を避け、panel reset より速く破壊を進め、core が開いた短い window に集中火力を入れる必要がある。

記事が強調するのは、この coordination が UI の命令や voice line で強制されるのではなく、boss の構造から自然に出る点だ。54 panels を壊す段階では players は map 上で離れた位置にいるかもしれない。しかし Reactor Core が brief window だけ露出するため、その瞬間はチーム全体が同じ目的へ収束する。co-op の圧力は、分散せざるを得ない前半と、同時に撃たざるを得ない後半のリズムで作られる。

さらに Scanner は fight 中だけでなく、run / act の preparation decision にも影響する。4:Loop には Probability Map があり、Act end にどの boss と戦うかを事前に把握できる。Scanner が来ると分かっていれば、道中で gear と abilities の選択が変わる。shotgun のような近距離火力は強いが、Reactor Core に遠距離から効きにくいかもしれない。Cloaking Backpack より、Laser Matrix を避けやすくする装備を選ぶべきかもしれない。boss design は arena 内の攻撃 pattern だけで完結せず、事前の loadout choice まで含む。

結論として、Scanner は「撃たない boss」でも高圧になる。breakable panels、rotating cube puzzle、tightening Laser Matrix、panel reset、brief core window、Probability Map による事前準備が重なり、direct damage ではなく空間と時間の制約でプレイヤーを追い込む。複数の improvisation layer に触れる boss であり、プレイヤーへ一発も撃たずに overwhelming obstacle を作る。

■ 内容分析
この設計は、boss の難しさを attack density 以外から作る実例として有用である。通常、action prototype で boss を強くしようとすると、弾を増やす、速度を上げる、HP を増やす方向に行きがちだ。Scanner はその逆で、弾を撃たない。代わりに arena 全体を動く hazard にし、target を複数面に分散させ、damage window を短くし、破壊済み panel を reset する。pressure は、移動・視線・時間管理・チーム配置の同期に分散している。

特に面白いのは、分散と収束を同じ encounter 内で切り替えていること。panel phase では複数角度から cube を削る方がよい。core phase では、離れていた全員が一瞬で同じ vulnerable target に火力を集中する必要がある。この構造により、co-op は「近くに固まる」だけでも「各自が勝手に撃つ」だけでも不十分になる。会話や即興判断が、boss の幾何と timer から自然に発生する。

ただし、記事は商業ゲームの紹介記事であり、内部 tuning、失敗率、playtest data、Laser Matrix の速度や reset time は出ていない。このまま数値として移植する材料ではない。抽出すべきは、direct attack を減らしても boss pressure を作れる構造、事前に boss 情報を見せて loadout choice を意味づける構造、短い damage window で分散行動を収束させる構造である。特に「攻撃しないのに危険」という設計は、弾幕量を増やす前の代替案になる。

■ 自分達の環境への適用
Nao_u_BOT の action prototype では、boss を強くする前に「その boss は何を撃たないか」を決める probe が使える。弾幕 density ではなく、地形、露出 window、壊す順番、装備準備、移動経路の制約で圧を作る。たとえば cube でなくても、複数 shield node を壊すと 3 秒だけ core が開く、node は一定時間で再生する、hazard は player を狙わず arena を掃く、という最小構成で再現できる。

さらに、boss 前に「次の boss の傾向が分かる」情報を置くと、道中の選択が単なる強化ではなく準備になる。近距離火力、移動補助、範囲攻撃、防御、視認性改善のうち、次 fight に必要なものを選ぶ形にする。検証では kill time だけでなく、分散 phase と集中 phaseを切り替えられたか、damage window に火力が間に合ったか、hazard hit が移動判断の失敗として読めたかを見る。

■ メリット・デメリット
メリットは、弾数や HP を増やさずに boss の個性と協力圧を作れること。事前準備まで含めると、encounter が run 全体の選択に接続される。デメリットは、構造が複数層になるため、小型 prototype では何が難しさを生んだか分解しにくいこと。まずは panel / reset / core window の 1 セットだけで試し、hazard と damage window の責務を分けて見るべき。

■ 判定
部分採用。商業紹介記事なので数値や検証は不足しているが、「撃たない boss で圧を作る」設計パターンとして有用。小さな再現 probe に落とし、まずは単独プレイでも pressure と目的が読めるかを確認してから使う。数値は自作側で測る。

■ URL
https://blog.playstation.com/2026/04/28/4loop-designing-the-ominous-cube-shaped-scanner-boss/
