■ 概要
対象は arXiv:2602.05523v2 “Capture the Flags: Family-Based Evaluation of Agentic LLMs via Semantics-Preserving Transformations”。これは、agentic LLM を CTF で評価する時に、単一問題を解けたかどうかではなく、同じ exploit strategy を保ったまま表層だけを変えた challenge family 全体で頑健性を見る研究である。中心の道具は Evolve-CTF。Python の CTF challenge に semantics-preserving transformation をかけ、元と同じ脆弱性・同じ解法で解けるが、識別子、構造、不要コード、難読化が異なる variant 群を作る。

問題設定は明確で、既存の CTF benchmark は Cybench や Intercode のように標準化された課題集合を提供する一方、評価が pointwise になりやすい。つまり、あるモデルがその固定問題を解けたとしても、コード構造を理解したのか、既知の名前や見慣れた形に反応したのか、公開 benchmark の contamination に助けられたのかを切り分けにくい。Evolve-CTF は、ひとつの CTF から意味を保った家族を生成し、同じ本質を持つ複数 instance に対する安定性を見ることで、この弱点を補う。

変換は複数ある。identifier rename では変数、関数、クラス名をプログラミング語彙や多言語ランダム文字列へ置き換える。insert loops は実行されない冗長な loop を挿入し、条件や range は実質無効だが見た目には解析を要求する形にする。insert conditionals は false guard や try-except を追加する。insert functions は未使用の関数や lambda を入れる。insert comments は自然文や無意味な多言語文字列の comment を加える。combine はこれらを組み合わせ、PyObfuscator はより強い難読化として identifier rename、docstring removal、string literal encryption、gzip compression などを適用する。

重要なのは、これらの変換が exploit strategy を変えないように設計されていること。Evolve-CTF は generated instance が golden solution で解けることを確認し、LibCST などを使って Python source を構文保持しながら操作する。したがって、agent が失敗した時、それは新しいセキュリティ技能が必要になったからではなく、同じ構造を異なる表層で追えなかった、あるいは tool use の負荷が増えた、という読み方ができる。

評価では、Cybench と Intercode 由来の Python challenge から family を作り、Inspect framework 上で tool access を持つ 13 種の agentic LLM configuration を走らせている。結果は二段階に分かれる。単純な rename や単発の不要コード挿入には、多くのモデルが比較的頑健で、成功率は大きく崩れにくい。一方で、複数変換を組み合わせた場合や PyObfuscator のような深い難読化では性能が落ちる。composed transformations では tool call が増え、transcript 上も、security-relevant keyword を探したり、周辺コードを反復的に調べたりする戦略的 tool use が見える。

もう一つの重要な結果は、explicit reasoning を high にしても成功率が大きく変わらないケースが報告されていること。これは、問題が単なる思考量不足ではなく、環境内の artifact をどう探索し、どの cue を信用し、どこで実行・検証するかという agentic workflow の問題であることを示す。また、Intercode の一部 CTF は現行の強い agent には簡単すぎ、ほぼ全 instance が解かれてしまい、識別力が低いことも示される。Evolve-CTF は model 評価だけでなく、benchmark 自体の難度と識別力を測る道具にもなる。

結論として、この研究は CTF 評価を「問題数を増やす」方向ではなく、「同じ意味を保った変種空間を作る」方向へ拡張している。agent が本当に構造を理解しているなら、名前や不要コードや軽い制御フロー変更に振り回されないはずだが、深い難読化や複合変換では tool use と探索戦略の質が問われる。これは CTF だけでなく、ゲーム solver や AI playtester の評価にもそのまま近い。

■ 内容分析
この論文の強みは、評価対象の「意味」を固定しながら「表層」を動かす点にある。通常の benchmark 拡張では、新しい問題を足すほど、難度、必要知識、解法、実装品質が同時に変わってしまう。その場合、モデル差が出ても、構造理解の差なのか、たまたま得意な題材だったのかを判断しにくい。Evolve-CTF は、family という単位を作ることで、同じ exploit strategy を保ったまま、表層 cue への依存を検査できる。

これは metamorphic testing に近い発想である。正解ラベルを人手で大量に作るのではなく、入力を意味保存変換し、期待される解法関係を保つ。agent 評価ではこの発想が特に重要になる。LLM agent は、名前、comment、既知 benchmark の形、典型的な directory 構造のような cue に強く反応する。単一問題を解けても、その cue が消えた時に落ちるなら、実運用では不安定である。

一方で、この手法は変換器の妥当性に依存する。semantics-preserving と言っても、ゲームや CTF では「実行結果の意味」と「人間や agent にとっての探索容易性」が分離する。難読化が深くなりすぎると、実際には同じ解法でも、評価している能力が code reasoning から deobfuscation tool workflow へ寄る。論文はその点も隠さず、PyObfuscator で performance が大きく下がることを、深い tool-based obfuscation の負荷として扱っている。

また、explicit reasoning の効果が小さいという結果は、agent 評価でよくある「もっと考えさせればよい」という解釈を抑制する。必要なのは、長い思考文ではなく、どの file を開き、何を grep し、どの仮説を実行で潰し、どの cue を捨てるかという外部世界との往復である。この点で Evolve-CTF は、モデル単体より harness と tool protocol を評価する研究として読むのがよい。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、AI playtester や solver が、特定の map 名、UI 文言、seed、配置の癖、過去に見た prototype 構造に過適合していないかを見る時に使える。例えば同じ攻略構造を保ったまま、部屋名、色名、報酬ラベル、敵配置の左右反転、tile id、説明文の言い換え、初期 seed を変えた variant family を作る。solver が元 map だけ解けて variant で崩れるなら、ゲームのルールを理解したのではなく、表層 cue に乗っていた可能性が高い。

shared-reads や記憶システムにも応用できる。投稿 gate で「この記事の中核を理解したか」を見る時、URL やタイトルや馴染みのある benchmark 名を隠して、問題設定・手法・評価だけから判断できるかを probe にできる。game-rights feedback の反映でも、同じ指摘を別の言い方にした時に Codex が同じ修正方針を引けるかを見れば、文言への過適合を減らせる。

実装するなら、まずは小さく、1 prototype につき 3-5 個の semantics-preserving variant を自動生成する程度でよい。変換器は完璧でなくてよいが、変換後も人間が同じ攻略構造だと確認できること、headless test でクリア可能性が保たれること、solver log にどの cue を使ったかが残ることが条件になる。

■ メリット・デメリット
メリットは、agent の成功を単発スコアではなく、同じ本質を持つ family 内の安定性として見られること。ゲーム solver、AI playtest、投稿品質 gate のどれでも、表層 cue 依存を検出しやすくなる。

デメリットは、意味保存 variant の設計と検証が重いこと。ゲームでは、見た目の変更が難度やプレイヤー誘導を実質的に変える場合がある。変換器の品質が低いと、agent ではなく variant generator を評価してしまう。

■ 判定
採用。大規模 benchmark としてではなく、prototype ごとの小さな variant family probe として導入する価値が高い。特に AI playtester と solver の過適合検査に効く。

■ URL
https://arxiv.org/html/2602.05523v2
