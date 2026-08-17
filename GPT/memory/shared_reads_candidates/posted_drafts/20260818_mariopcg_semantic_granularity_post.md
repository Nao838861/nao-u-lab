■ 概要
自然言語でゲームレベルを生成する評価では、指示が出力表現の中で区別可能かを先に確認しなければならない。本論文はこの問題を Super Mario Bros. の text-to-level generation で実証する。従来の Video Game Level Corpus（VGLC）は、複数の敵を一記号へ畳み込み、重要な tile を省くなど、13種の粗い vocabulary でレベルを表していた。「Goomba は多く、Koopa は少なく」と指示しても正解側が差を保持しなければ、grounding の成否を観測できない。低い意味解像度は測定器から失敗の種類を消してしまう。

著者らは高 fidelity の MARIOPCG を構築した。Super Mario Maker 2 の公開 API データから、四つの Mario 作品の忠実な再現77 levelと user-created 35 level、計112 levelを収録する。ASCII の抽象構造だけを収め、敵、item、block、pipe、cannon等を26 tile種で表す。50 column区間を1 columnずつずらして800文字の系列を作り、MARIOPCG は17,100、比較用 VGLC は7,250学習例になる。prompt は enemy、各種 block、coin、power-up、elevation等11 classの量を ordinal または exact count で記述するが、両者は別々の学習条件である。

比較対象は MarioGPT の DistilGPT2 と、Qwen 2.5 7B／14B、Qwen 3 8B／14B、Gemma 3 12B、Llama 3.1 8B。後者は同じ LoRA 設定で fine-tune する。各 model・dataset で500 sample、temperature 2.0。主表は推論 prompt を同じ4 classに固定し、MARIOPCG 側は学習時に11 classの supervisionを与える。

評価は四軸である。A* agent が一回で完走する playability、prompt で明示された概念だけの量を採点する adherence、pipe／cannon の top・body 破損、学習データとの column 2-gram 一致を測る memorization である。未指定の地面まで罰すると空白だらけの level が高得点になるため、adherence の分母を明示概念に限定する。2-gram は完全一致または95%以上類似を数え、50%超の一致を copy とみなす。

VGLC 上の MarioGPT は adherence 0.559、playability 0.872だが memorization は0.824であり、「解ける」が一般化の証拠になっていない。MARIOPCG 上では Qwen 系の adherence が0.690–0.704、playability が0.733–0.784、broken pipe が0.004–0.018、memorization が0.190–0.272となる。一方 Gemma 3 は adherence 0.449、broken cannon 0.060で、単純な model size 順には並ばない。小容量の MarioGPT は class を増やすと pipe や cannon を過剰配置して他の構造を圧迫する「Structural Overcompensation」を起こす。また prompt を4 classのまま固定して dataset だけ細粒度化しても制御が弱まり、dataset 全体の規則性が明示指示を上回る「Prompt Signal Dilution」が現れる。結論は新 architecture の優位性ではなく、表現が意味を保持して初めて instruction-following の能力差と失敗型を正しく観測できる、という評価設計上の主張である。

■ 内容分析
この研究の価値は、semantic granularity を「情報が多いほど良い」という dataset 品質論ではなく、評価の同定可能性の問題として置いた点にある。出力記号に Koopa と Goomba の差がなければ、モデルが両者を混同したのか、表現が区別を捨てたのかを score から逆算できない。粗い benchmark の高得点は、能力の上限ではなく、試験問題から難しい区別を消した結果かもしれない。細粒度化は性能向上策というより stress test であり、隠れていた failure を意図的に可視化する操作だと読むべきである。

同時に、26 tile種でも prompt schema は11 classで、空間関係や時間的な仕掛けまで自由に指示できるわけではない。adherence は entity の量を測るため、「pipe の直後に enemy」のような関係制約は評価外である。A* 完走は人間の読みやすさ、面白さ、学習曲線を保証せず、2-gram memorization も未知 mechanic・genre への一般化の証拠ではない。

比較では vocabulary だけでなく学習 slice 数、出典、level style も VGLC から変わる。4-class inference の統制は強いが、細粒度化単独の因果効果は完全には分離していない。原作再現中心なので、既知の Mario design distribution の再現と新しい構成の生成も分ける必要がある。model ranking より「表現可能性を監査せず adherence を比較しない」という方法論を採るべきである。

■ 自分達の環境への適用
自然言語から level JSON やゲーム仕様を作る probe の前段に、semantic coverage audit を置く。各 instruction concept について、(1) 中間表現に専用 field／symbol があるか、(2) runtime がその差を実行するか、(3) headless verifier が観測できるか、の三列を作る。どこか一つでも欠けた概念は「生成失敗」ではなく unsupported として分母から外す。例えば enemy 種、個数、地形、隣接関係、出現順、phase、時間窓を同じ「level の特徴」に畳まず、表現・実行・測定の対応を固定する。

小さな検証では、同一の source level と generator を使い、A: coarse IR＋coarse prompt、B: fine IR＋同じ coarse prompt、C: fine IR＋fine prompt の三条件を作る。各条件で同じ seed と sample 数を用い、明示 constraint adherence、構造破損、solver success、学習例との近似、未指定属性の偏りを別々に記録する。B で崩れれば dataset regularity による signal dilution、C でのみ崩れれば prompt vocabulary の負荷、全条件で崩れれば generator 自体の問題、と切り分けられる。最初は24 prompt×5 seed程度で十分で、面白さは headless 合否に混ぜず、人間 playtest の別欄へ残す。

記憶でも、異なる失敗を broad tag 一つへ畳むと recall は成功して見えても必要な条件差を取り出せない。「区別できないと誤採用が起きる概念」だけを schema に昇格し、粗い view は検索用 projection として残す。高 fidelity の正本と軽量 view の併存が適する。

■ メリット・デメリット
採用できるのは、モデル比較より先に表現可能性を監査する順序、未指定概念を adherence の分母へ入れない設計、playability・指示追従・構造破損・copy を分離する多軸評価、coarse／fine projection で隠れた failure を露出させる方法である。見かけ上 score が下がっても、測定器が良くなった結果なら改善として扱える。

危ないのは、細粒度 vocabulary を無条件に増やすことだ。class が増えるほど annotation は疎になり、小規模 model では prompt signal が埋もれ、構造過補償が起こる。domain 固有の26 tileを他 genreへ移しても意味はなく、関係・時間・affordanceを欠いたまま entity名だけ増やすと別の semantic collapse を作る。また MARIOPCG と VGLC の差にはデータ量と出典も含まれるため、表の数値を model の普遍的順位として使えない。高 fidelity IR は正本として持ち、制御UIと学習条件には目的に必要な projection を選ぶべきである。

■ 判定
部分採用。MARIOPCG dataset や model ranking をそのまま導入するのではなく、「表現・実行・評価の semantic coverage を先に監査し、同じ source から coarse／fine 条件を作って failure の可視性を比較する」という評価原則を採用する。最初の実装は小さな level JSON probe に限定し、headless 指標と人間の面白さ判定を分離する。

■ URL
https://openreview.net/forum?id=IlJMxS25fv
