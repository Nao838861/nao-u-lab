■ 概要
『Coloratura』は、視覚障害者向けの補助機能を既存の画面中心ゲームへ足すのではなく、「音だけで自由な三次元移動が成立すること」をゲーム全体の出発点にした narrative adventure である。事故で視力を失った音楽家 Alex を操作し、固定された方角や画面上の目的マーカーに頼らず、カメラを回転して空間を探索する。前身の game jam prototype『Museful』で、視覚誘導なしでも三次元移動を遊びの中核にできる可能性を確認し、そこから navigation、level geometry、物語、puzzle を同じ前提で組み直した。

navigation は三つの役割へ分解されている。第一に、Alex が集中すると距離の異なる周囲要素を感じ取る radar。第二に、一度発見した机や coffee machine などへ定位音を割り当て、再び聞くことで空間の mental map を保つ memory system。第三に、次の目的方向を bell で示す objective button である。常時すべてを説明するのでなく、「周辺を探る」「既知の場所を思い出す」「進行方向だけを確認する」を別操作・別音へ分けている。音源を探して解く puzzle は melody の断片になり、最終 soundtrack と Alex の人生段階を組み上げるため、誘導音が単なる代替 UI で終わらず主題にも接続する。

空間側も音響 UI に責任を押し付けない。厳密な collision を減らし、見えない小物へ引っ掛かりにくい広い壁面を使う。開発中には、背後の物体を定位音で明確に伝えられないと、player が向きを変えず横歩きして迷う「crab walk」が起きたため、後方音を反復調整した。さらに blind player と継続的に playtest し、Sergio Vera の feedback を移動だけでなく失明経験の描写にも反映した。結論は、accessibility を別 mode に隔離せず、視覚の有無にかかわらず同じ core play へ入れるよう、情報、空間、操作、物語を最初から音中心に設計する、というものだ。

■ 内容分析
この記事で最も使えるのは「視覚情報を音へ一対一変換した」ことではなく、navigation の認知仕事を分解し、別々の仕組みへ配置した点である。radar は未確定な周辺探索、memory system は既知 landmark の再定位、bell は現在 objective への復帰を担当する。目的音を鳴らし続けるだけなら player は音を追う作業に固定され、空間を覚えない。逆に環境音だけなら、探索と進行の区別がつかず迷走しやすい。この三層は、自力で地図を作る余地と、詰まった時の回復手段を両立させている。

もう一つ重要なのは、失敗を「音の精度不足」だけで診断していないことだ。crab walk は、後方の方向知覚に自信がない player が、現在の向きを失わないために選ぶ合理的な代償行動である。そこで「正しく振り向け」と説明を増やすのでなく、後方 cue を調整する。同様に、見えない物へ衝突する問題は collision geometry を単純化して解く。つまり入力された情報を増やす前に、player が推論しなくてよい障害物そのものを減らしている。accessibility を UI 層でなく、情報設計と level design の共同問題として扱う具体例になっている。

ただし記事は完成した評価研究ではない。game jam prototype で三次元移動の可能性を確認し、blind collaborator と反復したことは分かるが、参加人数、task、到達率、所要時間、比較条件、脱落理由は示されない。PS5 の 3D audio を強みとして挙げる一方、speaker、安価な headphone、片耳、聴覚過敏、方向感覚や認知負荷の個人差で同じ navigation が成立するかも不明である。blindfold した晴眼者の新鮮さと、日常的に非視覚 navigation を行う人の使い方も同一ではない。したがって「音だけなら普遍的に accessible」と一般化せず、設計仮説と当事者参加の手順を採るべきである。

■ 自分達の環境への適用
適用先は、3D探索 prototype の visual marker を一度外し、情報の責任分担を観測する小さな probe である。三部屋、曲がり角二つ、landmark 六個、objective 一個の固定 map を作り、①画面 marker、②定位音だけ、③定位音に加えて小物 collision を除いた map、の三条件を比べる。audio 条件では、短い pulse で周辺を調べる radar、発見済み landmark を任意に再提示する memory、押した時だけ鳴る objective bell を分離する。

headless 評価では「人が音から方向を理解した」とは判定できないので、信号配置と空間構造の deterministic 検査に限定する。各位置から少なくとも二つの landmark が異なる方位・距離で取得できるか、objective cue が壁越しの誤経路を最短路として示していないか、spawn から目的地まで小物 collision なしの連続経路があるか、背後 cue の左右・前後 parameter が反転していないかを seed 固定で検査する。これは人間 playtest の代替ではなく、明白な配置破綻を先に落とす層である。

人間側では、到達率、完了時間、wall contact の累積時間、180度を超える方向修正回数、横移動比率、objective button の使用回数、同じ corridor の再訪回数を log に残す。crab walk を単なる悪い操作とせず、「向きを失う恐れ」の proxy として見る。終了後に landmark の相対位置を再構成してもらい、bell を追えただけか、mental map ができたかを分ける。headphone と speaker を分け、晴眼者の暗転試験だけで採否を決めず、早い段階から視覚障害当事者に task と不快点を説明してもらう。

採用 gate は、audio-only 条件で目的到達が可能なだけでなく、collision 簡略化によって wall contact と迷走が減り、memory cue による landmark 再構成が偶然を上回ることとする。objective bell の連打だけが最適なら探索設計としては失敗であり、cooldown で隠す前に、radar と landmark の情報量を直す。音数が増えて識別不能になる場合は、音色を足すのでなく、同時発音数、距離帯、優先度を削る。

■ メリット・デメリット
メリットは、accessibility を完成後の checklist でなく core mechanic の制約として使い、navigation の暗黙依存を露出できることだ。radar、memory、objective の役割が明確なので、どこで迷ったかを仕組み単位で診断できる。collision の単純化は視覚障害の有無に関係なく移動の摩擦を減らし、音源 puzzle と物語を結ぶ設計は、補助 cue を遊びから浮かせない。

デメリットは、3D audio の再生環境と個人差への依存が大きく、音を増やすほど masking、疲労、感覚過負荷が起きることだ。視覚を外すこと自体が accessibility ではなく、聴覚に制約がある人には別経路が要る。広い壁と少ない collision は navigation を安定させる一方、空間の触感や探索密度を均質化しうる。記事の検証記録は定性的で、製品全体の到達率や長時間 play の負荷を保証しない。

■ 判定
部分採用。navigation を radar・既知 landmark の memory・objective recovery に分け、geometry 側でも詰まりを減らす設計を小規模 probe に採る。音だけで成立したという宣伝上の結論はそのまま移植せず、headless では配置破綻、人間 playtest では方向喪失と mental map を別々に測る。当事者 feedback と複数の再生環境を通過した範囲だけ、本制作へ広げる。

■ URL
https://blog.playstation.com/2026/07/13/coloratura-designing-a-world-where-sound-is-the-only-guide/
