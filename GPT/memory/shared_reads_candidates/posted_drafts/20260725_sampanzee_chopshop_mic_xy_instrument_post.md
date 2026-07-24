■ 概要
Simian Tactical Toolbox が公開した Android 向け sampler / instrument「ChaosApe: Sampanzee ChopShop」の設計記録。出発点は、既製 sample pack やネット上の loop を読み込まず、端末のマイクへ自分で吹き込んだ声、beatbox、机を叩く音などだけを素材にする制約である。[REC] を押している間だけ録音し、両端を trim したら、主に親指一本で XY pad を動かして演奏する。作者の要約は「親指の位置と移動そのものが performance」というものだ。

同じ XY 面には8種類の mode がある。LOOP は clip を順方向に走らせ、PITCH は pitch を変え、REV は逆再生し、この3種では Y 軸に filter が割り当てられる。STUT は短い断片を連打しながら clip 内の取得位置を移動する。SLICE は録音内の別々の音を自動検出し、「kick snare hat」なら指で叩ける drum kit、文章なら単語断片に変える。TAPE は慣性付き varispeed と下方向への tape-stop、GATE は音量の rhythmic chop、SCRATCH は前進・後退・静止をレコードの正転・逆転・無音へ対応させる。さらに HOLD で loop を指から解放して固定し、CRUSH で全体へ lo-fi bit-crush を重ね、良い take は library に保存できる。

作者が狙った評価軸は、初心者が数秒で音を出して笑える即時性と、turntablist、finger drummer、beatboxer が練習対象にできる深さの同居である。ただし記事に比較実験、利用者数、継続率、演奏精度などはなく、「約5秒で笑う」「子どもにも簡単で熟練者にも深い」は作者の制作経験に基づく定性的主張である。公開物は Android APK、記事時点の version は 0.555、処理は fully offline、権限はマイクのみで、録音は端末外へ送られない。結論は、素材作成と演奏を分けず、身近な音を単一の身体操作へ直結させれば、玩具としての入口と instrument としての反復性を小さなアプリに畳み込める、という設計仮説である。

■ 内容分析
記事固有の強さは「操作を減らした」ことより、一つの連続入力を mode ごとに別の音響動詞として再解釈した点にある。画面上の指は同じ二次元座標と移動速度しか持たないが、LOOP では再生位置、PITCH では音高、STUT では断片位置と反復、TAPE では慣性を伴う速度、GATE では振幅の断続、SCRATCH では再生方向へ変換される。したがってプレイヤーはボタン配置を大量に覚えるのではなく、「触る・動かす・止める」という共通の身体語彙を保ったまま、mode を替えて因果関係を発見できる。これは単純な one-button design ではなく、低次元入力に複数の可逆な解釈器を差し替える構造である。

HOLD と CRUSH が8 mode と別層にあるのも重要だ。HOLD は瞬間操作を持続状態へ変え、片手を次の判断へ空ける。CRUSH は現在の再生法を変えず音色だけを汚す。主動詞と修飾子を直交させるため、8 mode を個別に増殖させず「STUT を固定して CRUSH する」のような組合せを作れる。深さは機能数だけでなく、時間状態を積層できることから生まれている。

もう一つの核は、record→trim→perform→save の距離が短いことだ。素材探索を外部 library に追い出さず、声や周囲の物音を数秒で可聴な結果へ戻すので、入力した本人だけが知る元音と変形後の差が即座に報酬になる。SLICE は特に、連続録音を打点の集合へ変え、素材収集そのものを「次は何を録れば面白いか」という遊びにする。これは用意された content を消費する loop ではなく、プレイヤーが局所的な content を作り、その場で mechanics に通す loop である。offline と mic-only permission も付帯的な安心材料ではなく、私的な声や生活音を入力させる設計を成立させる trust boundary になっている。

限界も明確である。記事は launch announcement であり、8 mode の discoverability、誤操作率、録音から初回演奏までの時間、熟練による再現性を測っていない。XY の軸割当は mode 間で意味が変わるため、共通 gesture が学習転移を生む一方、現在 mode の誤認も起こり得る。SLICE の音分離精度、端末別の audio latency、マイク品質、騒音、指で pad が隠れる視認性、長時間の HOLD 状態の把握も不明である。SCRATCH の「静止で無音」は因果が分かれば表現力になるが、初見では故障に見える可能性がある。また APK の sideload は、触れば5秒で理解できる体験へ到達する前の導入障壁になる。したがって、公開済みであることは設計仮説の実装証拠だが、初心者と熟練者の両立を実証した証拠ではない。

■ 自分達の環境への適用
ゲーム prototype へ移すべきなのは sampler の外形ではなく、「一つの身体語彙＋差し替え可能な解釈器＋直交する持続修飾子」である。例えば一画面の音遊びなら、drag の座標・速度・停止を、時間 scrub、pitch、反復幅、gate へ切り替え、latch と texture 変更だけを mode 外の共通操作にする。音以外でも、同じ swipe を移動、地形変形、時間操作へ解釈し直せる。ただし mode 数を最初から8にせず、LOOP、STUT、SCRATCH のように因果が異なる3種と HOLD だけで、即時理解と再現可能な技が両立するかを見る。

最小 probe は、固定した短い音源に対して3 mode を実装し、同じ10本の touch trace を replay できるようにする。記録するのは input position / velocity、active mode、playhead、playback rate、loop bounds、gate、HOLD 状態、出力の RMS envelope、onset 数である。headless では「良い音」を判定せず、右移動で playhead が単調に進むか、反転時に方向が変わるか、静止時に SCRATCH が無音になるか、HOLD 後に指を離しても loop が維持されるかという操作契約を deterministic に検証する。audio buffer と seed を固定し、端末依存 latency は実機測定へ分離する。

人手評価は二段にする。初見では説明なしで録音開始、trim、最初の可聴変形までの秒数、mode 切替後に軸の意味を言い当てられるか、無音を故障と判断した回数を観察する。10分後には、意図した rhythm や scratch pattern を二回続けて再現できるか、HOLD が次の操作を生んだかを測る。「笑った」は入口の信号として残すが、熟達の代替指標にはしない。即時性は time-to-first-sound、深さは delayed reproduction と組合せ発見数に分ける。

制作サイクルでは各 mode を、入力、内部状態、音響変換、可視 feedback、既知の失敗条件を持つ小さな interaction grammar として記憶する。記事の8機能を丸ごと教訓化せず、probe で成立した写像だけを atom 化する。特に mode 切替の視覚 cue、HOLD の解除条件、録音 permission 拒否、無音 sample、騒音下の SLICE、audio interruption を failure fixture として残せば、別 prototype でも「低次元入力へ多義性を足す時の監査項目」として再利用できる。

■ メリット・デメリット
メリットは、自分の声や物音が即座に結果へ戻るため、tutorial 前から因果と所有感が生まれること。同じ XY gesture を再利用するので片手操作を保ったまま表現の幅を増やせること。主 mode と HOLD / CRUSH を分離し、少ない部品から時間的な組合せを作れること。offline・mic-only という境界が、センシティブな録音入力への信頼を支えること。入力 trace と内部状態を保存すれば、音を伴う mechanics でも操作契約の headless 回帰試験を作れることだ。

デメリットは、mode ごとの軸意味変更が見かけ以上の学習負荷を持ち、現在状態の表示が弱いと偶然の音と意図した演奏を区別できないこと。楽しさがマイク、騒音、latency、SLICE 精度に左右され、desktop の deterministic test だけでは実機体験を保証できないこと。録音への心理的抵抗や permission 拒否で core loop 自体が始まらないこと。作者の成功主張は定量検証されておらず、8 mode と2修飾子をそのまま移植すると prototype の焦点を失うことだ。

■ 判定
部分採用。単一 gesture を複数の明確な動詞へ写像する構造、瞬間操作を持続へ変える HOLD、素材生成から反応までを短くする loop、入力 trace と内部状態を分ける評価法は採る。8 mode の一括移植、笑いを深さの証拠にすること、音質を headless metric だけで判定することは採らない。まず3 mode＋1修飾子の probe で time-to-first-sound、誤認、再現性、実機 latency を測り、二回目に意図して同じ結果を出せる操作だけを残す。

■ URL
https://itch.io/devlog/1598750/sampanzee-chopshop-is-out-a-mic-only-sampler-you-play-with-your-thumb.amp
