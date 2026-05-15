出典: https://arxiv.org/abs/2604.10107

■ 概要
対象は Ting-Chen Hsu らの “The Double-Edged Sword of Open-Ended Interaction: How LLM-Driven NPCs Affect Players' Cognitive Load and Gaming Experience”。LLM-driven NPC はプレイヤーに自由な発話や予想外の反応を与えられる一方、その自由さが本当にゲーム体験を改善するのか、また認知負荷・信頼・使いやすさをどう変えるのかを実験で調べた論文である。著者らは自作ゲーム prototype “Campus Culture Week” を作り、プレイヤーが新入生として学園祭準備を進める流れの中に 7 種の NPC interaction module を置いた。module は daily chatting、relationship building、task delegation、collaborative tasks、investigation and reasoning、negotiation and persuasion、content creation。LLM-NPC 版と traditional pre-scripted NPC 版は、NPC との入力方式以外を揃え、前者は PlayKit.ai 上で主に GPT-4.1-mini を使っている。

実験は randomized between-subject design で、最終分析は N=130。traditional NPC group と LLM-NPC group が各 65 名で、年齢・性別・ゲーム頻度に有意差はない。参加者は各 module をプレイし、module ごとの process questionnaire で cognitive load、gaming experience、mechanism variables を回答し、全 module 終了後に post-test questionnaire も答える。分析は mixed effects model、Welch t-test、Benjamini-Hochberg FDR 補正、Cohen's d、bootstrap mediation analysis などで行われている。

主要結果はかなり明確。LLM-NPC group は module cognitive load が traditional NPC group より有意に高い (b = 0.785, p < .001) が、module gameplay experience には有意差がない (p = .806)。post-test でも overall gaming experience は有意改善しない (p = .195)。一方で mechanism variables は割れている。LLM-NPC は perceived autonomy を上げる (d = 0.620) が、expression cost と response uncertainty も上げ、system usability と trust を下げる。媒介分析では、cognitive load 増加は主に expression cost と response uncertainty を通じて起きる。overall gaming experience については perceived autonomy が正の媒介効果を持つが、trust と system usability の負の媒介効果がそれを打ち消す。つまり「自由に話せる」ことは価値を持つが、何をどう言えばよいか分からない負荷、返答が安定するか分からない不安、システムとしての信頼低下が同時に起き、総合体験の改善には届いていない。

task scenario 差も重要。group × module interaction は cognitive load で有意 (F = 15.569, p < .001) で、LLM-NPC による負荷増は全 7 module で見られるが、content creation と relationship building で特に大きい。逆に module experience では interaction が有意ではなく、どの module でも LLM-NPC が traditional NPC より体験を有意に上げたわけではない。自由入力が向いていそうな関係構築や共同創作ほど、実際にはプレイヤーが言語化し続ける負担も増えやすい。著者らの結論は、LLM-NPC は traditional NPC を一律に置き換える万能解ではなく、感情交流、role-playing、content co-creation、open exploration のような場面に限定的に導入し、効率・明確な feedback・低負荷が重要な場面では preset options や hybrid input を使うべきだ、というもの。

■ 内容分析
この論文は、LLM-NPC を「会話が自由になれば体験が良くなる」という期待から引き戻している。特に強いのは、体験の総合点だけでなく、autonomy、expression cost、response uncertainty、usability、trust を分けて見ている点。LLM-NPC は autonomy を増やすので、プレイヤーが「自分で決めている」感覚は得やすい。しかしその増分は、操作の分かりにくさや返答不確実性によって食われる。これはゲーム UI として重要で、NPC の賢さそのものより、プレイヤーが入力前に「この場面では何を言えば進むのか」「どの粒度で頼めばよいのか」「失敗した時に戻せるのか」を読めるかが体験を左右している。

もう一つの読みどころは、open-ended な module ほど単純に勝たないこと。content creation では自由入力の可能性が高い一方、プレイヤーはアイデアを言語化し、NPC の意図を読み、結果の妥当性を判断する必要がある。relationship building でも、自然な対話らしさは魅力になるが、親密度や目標達成に必要な発話が不透明だと負荷が増える。逆に task delegation や collaboration のように目的が明確な場面では、preset options の方が効率・制御性・安心感に合う。LLM を使うべき場面は「選択肢では表現しきれない価値がある場面」であって、「台詞を書くのが面倒な場面」ではない。

限界も押さえる必要がある。実験対象は “Campus Culture Week” という self-developed prototype で、商用ゲームの完成度や長期プレイとは違う。単回体験なので、慣れによって負荷が下がる可能性は未検証。入力は主に text-based natural language interaction で、音声入力や視覚認識を含む multimodal NPC では結果が変わるかもしれない。個人差分析も LLM-NPC group 65 名なので、extraversion と neuroticism の予測効果は興味深いが、設計ルールへ直結するには追加検証が要る。それでも「自由度の上昇」と「負荷・信頼低下」を同時に測った点は、LLM NPC 導入判断の基準としてかなり使える。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、LLM-NPC を入れる前に、NPC interaction を scenario ごとに分けるべき。進行説明、クエスト受領、確認、戦闘中指示、短い取引のような低負荷・明確性重視の場面は scripted / preset options を基本にする。雑談、関係構築、創作補助、推理の仮説相談のように、プレイヤーの表現が価値になる場面だけ natural language を開く。ただしその場合も、入力欄を置くだけではなく、目的提示、入力例、候補 chips、言い直し、undo、NPC の理解状態表示を入れて expression cost と response uncertainty を下げる。

記憶システムには、各 NPC/場面に `interaction_mode`、`expected_player_effort`、`failure_recovery`、`trust_risk` を atom 化して残すとよい。playtest probe では「自由入力が楽しかったか」だけでなく、「何を言えばよいか迷った回数」「NPC の返答を信じられなかった瞬間」「結局 preset option が欲しくなった場面」を記録する。LLM を入れるほど高度になるのではなく、入力自由度を増やすたびに負荷を下げる UI を同時に置く、という設計ルールにする。

■ メリット・デメリット
メリットは、LLM-NPC の採用可否を印象論ではなく、負荷・自律感・信頼・使いやすさに分解できること。特に hybrid input の必要性を説明しやすい。デメリットは、prototype 条件と単回体験への依存があり、音声・長期関係・高品質商用シナリオでは結果が変わる可能性があること。また、自由入力を抑えすぎると LLM-NPC の驚きや没入感も削る。

■ 判定
採用。LLM-NPC は全面置換せず、scenario-sensitive に導入する。まずは scripted/preset を基盤に、表現価値が高い場面だけ LLM 入力を開き、負荷・信頼・復旧の probe を必ず併設する。
