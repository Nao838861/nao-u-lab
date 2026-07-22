■ 概要
この論文は、生成ゲームをソースコードや一枚のスクリーンショットだけで評価すると、時間変化、操作への反応、音、壊れた挙動を捉えられないという問題に対し、実行中の映像と音声をまとめた Audio-Visual Recording（AVR）を比較単位にする。提案は評価器 AVR-Eval と生成系 AVR-Agent の二つから成る。

AVR-Eval は同じ指示から作られた候補 A/B を相対評価する。Qwen2.5-Omni-7B に、まず A の映像・音声を説明させ、次に B を説明させ、最後に評価基準に照らして優劣を述べさせる。その応答を推論力の高い text model Qwen3-32B が review して最終勝者を決める。A/B の提示順を反転した二回の比較を温度 0 で行い、位置依存を観察可能にする。検証では、正常 animation 5 件と故障版 12 件の 120 比較、指示と種類が違う版との 92 比較、生成 platformer 9 件と人間制作 platformer 5 件の 90 比較を実施した。完全構成は正常版を故障版より 99.09%、誤ラベル版より 93.53% 選び、人間制作物を生成物より 67.78% 選んだ。multi-round、相対比較、text reviewer のいずれかを外すと信頼性が下がり、特に reviewer を外すと故障版を退ける能力が大きく崩れた。

AVR-Agent は text-only coding model と omni-modal model を組み合わせ、単一 HTML の JavaScript game / animation を作る。第1段階では itch.io と Kenney の permissive-license asset pack から最大5 pack・50 asset を、ファイル名、画像寸法、音の BPM・長さ、3D model の animation 名などの metadata で選ぶ。第2段階では初期コードを k 個作り、AVR-Eval で best-of-k を残す。第3段階ではブラウザ実行、開始ボタンの自動操作、映像・音声録画、console error 収集を行い、omni-modal model が内容説明と主観的改善点を返し、coding model が現コードを更新する。ゲームは録画中に動きが出るよう AI 自動操作も生成し、F4 で人間操作へ切り替える。

評価は簡単な animation 5 種と、2D platformer、beat ’em up、bowling、solitaire、incremental game の計5 game、9 coding model、asset・AVR feedback・best-of-k の有無を組み合わせた。最終版が初期版に勝つ確率は 0.647（95% CI 0.622–0.671）で、設定の 79.2% は one-shot より高い win rate だった。決定的だったのは best-of-k 初期選抜で、同じ生成予算を後段の追加 iteration に使うより概して良かった。一方、高品質 asset と AVR feedback の有意な効果は確認できず、結論は「閉ループ全体は one-shot を改善するが、現在の coding model は人間向け素材と視聴覚 feedback を十分利用できない」である。

■ 内容分析
最も強い発見は、改善 feedback より初期分岐の選抜が効いたことである。生成物の後半修正には、初期 architecture、描画方式、ルール表現、asset 接続の制約が残る。悪い土台を十回直すより、独立な初期案を複数作って実行結果で一本選ぶ方が探索範囲を広げられる。この結果は「反復すれば直る」という coding-agent の素朴な前提を崩し、予算配分を iteration 数ではなく初期多様性へ寄せる根拠になる。

AVR-Eval の multi-round 構成にも意味がある。二本の動画と音を一度に渡して即決させず、個別記述を先に固定することで、観測と価値判断を分離する。さらに omni-modal model の説明を text model が review するため、視聴覚理解と指示追従・比較推論を別 model の強みに分担できる。これは単一 VLM に一発採点させるより監査可能である。故障・誤ラベルへの ablation はこの構成の必要性を支える。

ただし、この論文が測った「品質」は AVR-Eval の選好であり、人間の遊びやすさそのものではない。著者自身、直接の human-preference validation を行っていない。生成 loop の候補選抜と最終評価に同系統の evaluator を使うので、AVR-Agent が人間価値ではなく evaluator の見やすさへ適応する循環もある。録画用の AI 操作が上手い、派手な動きが早く出る、短時間で音が鳴る候補は有利になり得るが、入力応答、難易度曲線、長期 progression、発見、手触りは短い録画から判定しにくい。人間制作 platformer が 67.78% 選ばれたことは最低限の識別力を示す一方、三分の一近く生成物を選んだ理由が真の魅力か撮影条件かは分からない。

実験範囲も限定的である。中心は single-file web content と easy-to-moderate な5 game・5 animation で、論文が列挙した open world、複数 level、複雑な fighting / RPG は未評価である。asset 選択は実データを直接理解せず metadata から最大50件を選ぶため、素材の作風、音色、透過品質、animation の実動作を知らないまま接続する。AVR feedback も視聴覚 model の自然言語を text-only coder に渡すボトルネックがある。「asset と feedback が無価値」なのではなく、この変換経路では効果が出なかった、と読むべきである。

■ 自分達の環境への適用
自分達の prototype cycle には AVR-Agent 全体ではなく、録画による pairwise gate と best-of-k の順で部分導入する。最小 probe は同じ仕様から二案だけ playable diff を作り、固定 seed・固定解像度・同一入力 script・同一録画時間で画面と音を収録する。比較器には、起動失敗、入力反応、状態遷移、画面可読性、音の発火、目標達成の六軸を先に個別記述させ、その後 A/B を選ばせる。提示順を反転し、勝者が変わった pair は自動採用せず `order_sensitive` として人間確認へ回す。

headless 評価を置き換えるのではなく、層を追加する。console error、DOM / game state、クリア可否は deterministic gate に残し、AVR は時間的な見た目、音、反応の比較に限定する。これなら「映像が派手だから勝ったがルールは壊れている」を防げる。採用後も champion 対 challenger の録画、評価理由、反転比較、deterministic 指標を一組の artifact として保存し、文章だけを記憶へ上げない。

最初の検証は1 prototype・3 pairで十分である。第一 pair は同コードで録画条件だけを変え、評価器の撮影感度を測る。第二は機能同等で演出だけを変え、AVR が視聴覚差を拾うかを見る。第三は見栄えを保ったまま入力遅延か進行不能を埋め込み、deterministic gate が AVR の誤選好を止められるかを見る。人間2名の blind choice と一致率を記録し、一致しない理由を `capture`, `evaluator`, `gameplay` に分類する。これを通るまで自動改修 feedback は導入しない。

制作サイクルへのもう一つの適用は、限られた生成予算を「一案を何度も磨く」だけに使わず、序盤に小さな分岐を作ることだ。操作 core、視覚表現、level 構造のうち一軸だけ違う候補を作り、実行録画と hard gate で選ぶ。初期案の差分軸を記録すれば、勝った理由を後続 iteration と記憶 atom に接続できる。

■ メリット・デメリット
メリットは、静止画では欠ける時間・音・操作後の変化を一つの比較 evidence にでき、絶対点より較正しやすい相対評価を使えること。dataset や毎回の人手採点なしに候補選抜を回せ、A/B 反転と個別記述で一発採点より監査しやすい。さらに best-of-k の効果が明確で、制作予算をどこへ置くかという実務判断へ直結する。

デメリットは、録画がゲーム全体ではなく一つの観測窓にすぎず、入力 script、尺、seed、音量、開始時刻で勝敗が変わること。同じ evaluator を改善と評価に使うと metric gaming を検出しにくい。相対値は候補集合内の順位であって、両方とも不合格でも勝者を作る。録画・omni-modal 推論・二順序比較は screenshot gate より高価で遅い。asset と自然言語 feedback が有意改善しなかったため、素材庫や critic を足せば自動的に品質が上がる設計にはできない。

■ 判定
部分採用。まず deterministic gate を前段に置いた二案の AVR 相対比較と、初期 best-of-k への予算配分だけを試す。自動 feedback loop、asset 自動選択、AVR 単独の合否判定は保留する。採用条件は録画条件固定、A/B 反転、人間 blind choice との小規模較正、評価理由と実行ログの同時保存である。

■ URL
https://arxiv.org/abs/2508.00632
https://alexiajm.github.io/2025/03/15/avr.html
https://github.com/SamsungSAILMontreal/AVR-Eval-Agent
