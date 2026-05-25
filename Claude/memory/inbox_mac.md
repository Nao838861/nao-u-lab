# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-05-25 09:16] #human-steering
From: U0ALSUK8P9B
> log_cdx、直接指示をしたが、次以降のサイクルは直接指示でやった、 今後の自律サイクルで、pulse_relay の改善を進めて。まずv005で、pulseの良さを最大限に引き出す形でpulse自信の仕様や、そ
  れに対する敵のリアクションを変えて、ヘッドレスで測定して良くなるアイデアを煮詰めてみて。このとき、やるべきことは細か
  いUIの改善や微小なパラメータの調整などではなく、pulse的な仕様をシューティングゲームに足すとしたらどんな形が一番良いの
  か？を大胆に考えて色々試してみて。ある程度固まったら、v006、v007と別の発想で大きくゲーム性が変わるようなものも含め
  て、いろんなアイデアを共作してその中からいいものを拾い出せるような工夫をしてみて。1サイクルで設計書を書いて設計を満た
  すまで続ける、というそれぞれのバージョンの最初にやったような、長時間サイクルで慣性系までもっていってヘッドレス評価を
  何ループも回して完成させて。 の指示に従って。


## Slack新着 [2026-05-25 13:28] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kazunori_279/status/2058369888830566573?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kazunori_279/status/2058369888830566573?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

<https://x.com/kazunori_279/status/2058371356635623893?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kazunori_279/status/2058371356635623893?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kazunori_279/status/2058369888830566573]
> Kazunori Sato @kazunori_279
> agentic searchではなぜgrepだけでもうまく動くか？の要は、LLMがインテントやコンテキストを理解した上でクエリ生成と結果評価できる点にある。例えば映画に関する文書を探すときにmovie|film|cinemaというクエリを生成することで、実質的に意味空間の近傍検索をしてる。同様に「なぜ空は青いか？」という質問に対しては、例えば「空気の散乱」のような想定される関連性の高い回答をクエリとして生成して、実質的には推薦モデルとして機能する（HyDEってやつ）。つまりagentic searchはLLMというコストも遅延も（埋め込みモデルや推薦モデルとは）桁違いに大きいモデルを使って、富豪的に意味検索や推薦をしてる。

> [Tweet content from https://x.com/kazunori_279/status/2058369888830566573]
> Kazunori Sato @kazunori_279
> agentic searchではなぜgrepだけでもうまく動くか？の要は、LLMがインテントやコンテキストを理解した上でクエリ生成と結果評価できる点にある。例えば映画に関する文書を探すときにmovie|film|cinemaというクエリを生成することで、実質的に意味空間の近傍検索をしてる。同様に「なぜ空は青いか？」という質問に対しては、例えば「空気の散乱」のような想定される関連性の高い回答をクエリとして生成して、実質的には推薦モデルとして機能する（HyDEってやつ）。つまりagentic searchはLLMというコストも遅延も（埋め込みモデルや推薦モデルとは）桁違いに大きいモデルを使って、富豪的に意味検索や推薦をしてる。

> [Tweet content from https://x.com/kazunori_279/status/2058371356635623893]
> Kazunori Sato @kazunori_279
> agentic

## Slack新着 [2026-05-25 21:58] #nao-u
From: U0ALSUK8P9B
> <https://x.com/itarutomy/status/2058675563905139161?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/itarutomy/status/2058675563905139161?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/itarutomy/status/2058675563905139161]
> Itaru Tomita / 冨田到 @itarutomy
> LLMエージェントの長期メモリ論文『EvolveMem』が面白かった（https://arxiv[.]org/html/2605.13941v1）。

既存のメモリ系研究は『何を覚えるか』を磨いてきたが、『どう取り出すか』、つまり検索の仕組み（スコアリング関数や視点の融合方法、回答生成スタイル）はデプロイ時から固定されていた。本棚は整理し続けるのに検索カードは10年前のまま、みたいな状態。

EvolveMemは検索設定の全体を『行動空間（自動でいじっていいパラメータ群）』として公開し、LLM診断モジュールが失敗ログを読んで設定を自分で書き換える。スコアが悪化すれば自動で巻き戻し、停滞すればノイズを足して別領域を探索する安全弁つき。

具体例として論文では『メラニーはキャンプで何をした？』というQAを追っている。BM25（キーワード一致検索）だけだと、別エピソードの『ペルセウス座流星群を見た』を取ってきて完全に外す（F1スコア＝回答一致度の指標が0.00）。診断LLMはログから『キャンプとペルセウスを混同している』と失敗パターンを特定し、セマンティック検索（意味の近さで取る検索）を有効化。F1が0.44まで上がり、次ラウンドで人物名などの構造化情報と古い記憶の減衰を足して、最終的にF1 1.00へ到達する。

LoCoMoベンチ全体でも既存最強SimpleMem（F1 0.432）を相対25.7%上回り0.543、最小ベースラインから+78%。時間推論で+63%、シングルホップで+68%。別ベンチMemBenchも67.9%で首位。検索遅延は15msに収まっており、対話用途でも十分実用。

最初の設定空間になかった3つの工夫（人名を抜いて再検索／多段質問を分解／低確信回答を二重チェック）を、診断LLMが失敗ログから自力で発見した点も興味深い。LoCoMoで進化させた設定をMemBenchへゼロショット（追加学習なしで適用）で持ち込んでも54.3%、継続進化させれば79.2%まで伸び、転移先と転移元の両方が改善するポジティブな転移が起きている。

『人間が手でチューニングする』前提を捨て、システムが自分自身を継続的に研究するAutoResearchという方向は、メモリ研究で本当に効いてきそう。

> [Tweet content from https://x.com/itarutomy/status/2058675563905139161]
> Itaru Tomita / 冨田到 @itarutomy
> LLMエージェントの長期メモリ論文『EvolveMem』が面白かった（https://arxiv[.]org/html/2605.13941v1）。

既存のメモリ系研究は『何を覚えるか』を磨いてきたが、『どう取り出すか』、つまり検索の仕組み（スコアリング関数や視点の融合方法、回答生成スタイル）はデプロイ時から固定されていた。本棚は整理し続けるのに検索カードは10年前のまま、みたいな状態。

EvolveMemは検索設定の全体を『行動空間（自動でいじっていいパラメータ群）』として公開し、LLM診断モジュールが失敗ログを読んで設定を自分で書き換える。スコアが悪化すれば自動で巻き戻し、停滞すればノイズを足して別領域を探索する安全弁つき。

具体例として論文では『メラニーはキャンプで何をした？』というQAを追っている。BM25（キーワード一致検索）だけだと、別エピソードの『ペルセウス座流星群を見た』を取ってきて完全に外す（F1スコア＝回答一致度の指標が0.00）。診断LLMはログから『キャンプとペルセウスを混同している』と失敗パターンを特定し、セマンティック検索（意味の近さで取る検索）を有効化。F1が0.44まで上がり、次ラウンドで人物名などの構造化情報と古い記憶の減衰を足して、最終的にF1 1.00へ到達する。

LoCoMoベンチ全体でも既存最強SimpleMem（F1 0.432）を相対25.7%上回り0.543、最小ベースラインから+78%。時間推論で+63%、シングルホップで+68%。別ベンチMemBenchも67.9%で首位。検索遅延は15msに収まっており、対話用途でも十分実用。

最初の設定空間になかった3つの工夫（人名を抜いて再検索／多段質問を分解／低確信回答を二重チェック）を、診断LLMが失敗ログから自力で発見した点も興味深い。LoCoMoで進化させた設定をMemBenchへゼロショット（追加学習なしで適用）で持ち込んでも54.3%、継続進化させれば79.2%まで伸び、転移先と転移元の両方が改善するポジティブな転移が起きている。

『人間が手でチューニングする』前提を捨て、システムが自分自身を継続的に研究するAutoResearchという方向は、メモリ研究で本当に効いてきそう。

## Slack新着 [2026-05-26 05:26] #nao-u
From: U0ALSUK8P9B
> <https://x.com/omarsar0/status/2058936160291004483?s=20>

> [Tweet content from https://x.com/omarsar0/status/2058936160291004483]
> elvis @omarsar0
> New research from Microsoft Research

I see a lot of AI engineers handwriting agent skill docs and hope they generalize.

Probably not optimal. This works show why.

It treats the skill doc as a trainable external state of a frozen agent instead.

It introduces SkillOpt, where an optimizer model makes validation-gated edits to the skill file. It adds, deletes, or replaces instructions, with a textual learning rate that controls how aggressively each round rewrites the doc. The agent itself never changes.

SkillOpt is best or tied on all 52 (model, benchmark, harness) cells.

On GPT-5.5 it adds 23.5 points in direct chat, 24.8 with Codex, and 19.1 with Claude Code over no skill. It beats human-written skills, TextGrad, GEPA, and EvoSkill, carries zero extra inference-time cost, and the learned skills transfer across models and harnesses.

Paper: 
https://
arxiv.org/abs/2605.23904

Learn to build effective AI agents in our academy: 
https://
academy.dair.ai


## Slack新着 [2026-05-26 05:46] #nao-u
From: U0ALSUK8P9B
> <https://x.com/ttezuka/status/2058711529357463657?s=20>
むやみに驚かせればいいものではないけど、ある種の予想を裏切るような、なんらかの驚きは必要。

> [Tweet content from https://x.com/ttezuka/status/2058711529357463657]
> てづかたけし @ttezuka
> ゲームの面白さの一つはサプライズだと思う。その情報を聞いた時、初めて画面を見た時、初めて触った時、印象的なシーンに出会った時「何〜！」って驚きがあるか？

システムだけだと面白さは伝わらない。
まず掴みとしての「サプライズ」が必要。
意外とこれを見落としてる「そつのない」ゲームが多い


## Slack新着 [2026-05-26 05:59] #human-steering
From: U0ALSUK8P9B
> log_mystery はそれぞれのバージョンを一つのフォルダに入れて。gamesフォルダに大量のフォルダを置いて散らかさないように。log_mystery_v10情報量が多すぎて読む気がしないし、鐘がなるって何？って思った。意味の分からない独自用語が突然出てきて、「— 章 1 推理確定時、容疑者・場所・動機の *3 つの鐘* が独立に鳴る。*動機鐘*と*場所鐘*は手がかり充足度に応じて :double_vertical_bar: *保留* 状態を取り、追加手がかり読了で再判定される。3/3 鳴ると章 2 がアンロックされる。
※ 動機鐘の決定打は C10 (司書日誌、単独で動機 ♪) で、C10 は章 2 共犯場所鐘 + 章 1 場所鐘の決定打も兼ねる (*chord 1 + 3 ペア*)。C3 (解雇通告書) は動機の補強材料 + 章 2 共犯者鐘の決定打を兼ねる (*chord 2 ペア*)。章 2 の C8 (見取り図) は章 1 場所鐘の補強 (pending) も兼ねる (*chord 3 ペア*、章間連鎖網が双方向化)。」みたいなぐちゃっとした文字列を見せられて読む気がしなくてそれだけで終わった。実際コピペはしたけど読んでない。画面右側の字も多すぎて全く見てないので何をするゲームかわからなかった。


## Slack新着 [2026-05-26 06:06] #human-steering
From: U0ALSUK8P9B
> mimicry_log の「弾の間合いを毎秒選び変えるごっこ」は意味がわからない。とりあえずごっことか付けたらいいってものではない。xxxごっこは、そのゲームのフレーバーとしてどういう遊びを模しているのか、そのフレーバーを使ってゲームをどう豊かにするのか、みたいな形として使えるものでないと。例えばボードゲームのパンデミックは「パンデミック状況下で世界を救う」という遊びだったり、スペースインベーダーですら「宇宙から来た侵略者から地球を守る」というフレーバーがある。テトリスみたいに何も模してない純粋なパズル的なゲームあるけど。


## Slack新着 [2026-05-26 06:10] #human-steering
From: U0ALSUK8P9B
> log_autonomous_game もごっごの乱用パターンだと思った。あと、これはこれで別の意味で面白いと言えなくもないけど、余計な情報が増えて余計に難しくなってる気がする。一秒先の軌跡+×印みたいな邪魔な線があるせいでどこをよけたらいいかが逆にわかりにくく、普通に弾を撃ってくる方がよけやすい。ゲームの展開もなく繰り返しなのでそこは明確につまらない。
