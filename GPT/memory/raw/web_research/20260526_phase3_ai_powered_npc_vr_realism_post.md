■ 概要
An Empirical Evaluation of AI-Powered Non-Player Characters' Perceived Realism and Performance in Virtual Reality Environments
https://arxiv.org/abs/2507.10469

この論文は、GPT-4 Turbo を使った AI-powered NPC を VR interrogation simulator に組み込み、NPC の perceived realism、usability、system performance を人間参加者で評価した実証研究である。題材は警察の尋問シナリオで、参加者は警察官として suspect NPC を尋問し、その人物がビールケース窃盗で有罪か無罪かを判断する。もう 1 体の partner NPC は観察室側にいて、事件情報、次に聞くべき質問、過去発言の整理などを助言する。研究の焦点は、参加者が正しく有罪判定できるかよりも、GPT 制御 NPC がどれだけ believable に見えるか、そして STT、GPT 応答、TTS を含む会話サイクルの遅延が体験をどの程度壊すかに置かれている。

実装は Unity + OpenXR + Meta Quest 2。プレイヤーの音声質問を録音し、speech-to-text でテキスト化し、その内容を OpenAI GPT-4 Turbo に送り、生成された返答を text-to-speech で音声化して NPC が再生する。尋問中の「記憶」は、会話履歴を chat log として配列に蓄積し、次の質問時に過去の質問と返答をまとめてモデルへ送る方式で実現されている。この仕組みは NPC に状況記憶があるように見せられる一方、会話が進むほど送信する context が増え、GPT 応答時間が伸びるという構造的な遅延要因になる。partner NPC は尋問室内のログにアクセスできるが、suspect NPC は partner との相談を聞けない、という情報非対称も設計されている。

参加者は 18 人、20-25 歳、英語での理解と会話が可能な人を対象にした convenience sample。各セッションでは、説明と同意後、最大 20 分のプレイで suspect の有罪/無罪を判断し、その後に System Usability Scale、Game Experience Questionnaire の social presence module、Virtual Agent Believability Questionnaire、遅延に関する追加質問へ回答する。latency は STT、TTS、GPT model、cycle latency に分けて記録され、cycle latency はプレイヤーが質問を終えてから suspect の音声回答が再生されるまでの待ち時間として定義されている。

結果では、平均 cycle latency は 6909 ms、中央値 6066 ms、最大 24362 ms、最小 2021 ms。内訳の平均は GPT model 3113 ms、STT 1365 ms、TTS 2376 ms で、GPT の標準偏差が最も大きい。論文は、会話履歴が伸びるほど GPT latency が増え、GPT response length が伸びるほど TTS latency も伸びると分析している。参加者の 12/18 は許容誤差内で自分が経験した平均遅延を見積もれており、遅延は単なる内部メトリクスではなく体験上も知覚されていた。追加質問でも、response time が realism に悪影響を与えたという項目が 3.33/5、短ければより楽しめたという項目が 3.61/5 だった。

believability は 0-10 に再スケールされ、total believability は 6.67。behavior 8.09、social relationships 8.24、intelligence 7.99 は高めで、NPC は行動・社会的応答・知的応答の面ではそれなりに人間らしく見られた。一方、emotion 6.16、personality 5.74、agency 5.34 は中程度で、感情や人格の厚みは弱い。SUS は平均 79.44 で grade B、excellent に近い good usability とされる。partner NPC の有用性は 4.28/5 と高く、完全な人間らしい会話相手よりも、情報整理や助言を担う assistant 的 NPC の方が現状の LLM/VR 実装に向いていることも示唆される。結論は、GPT-powered NPC は VR 内で一定の realism と interaction を作れるが、長い context による遅延増加と emotional depth の不足が没入を制限する、というもの。

■ 内容分析
この論文の価値は、LLM NPC の品質を「賢く返答できるか」だけでなく、会話サイクル全体の待ち時間、believability の内訳、社会的存在感、補助役 NPC の有用性に分けて測っている点にある。特に cycle latency を STT/GPT/TTS に分解したことは実装判断に効く。プレイヤーは内部 API のどこが遅いかは知らないが、体験上は待ち時間としてまとめて受け取る。さらに、その待ち時間が毎回一定ではなく、会話が進むほど伸びる場合、NPC は「考えている」より「処理が詰まっている」と読まれやすい。

もう一つ重要なのは、believability の高低が一枚岩ではないこと。behavior、social relationships、intelligence は高いが、emotion、personality、agency は伸びない。この結果は、LLM を入れると知的な返答や文脈応答は作りやすいが、身体性、感情表現、能動性、沈黙や間の演出までは自動では埋まらないことを示している。制約も明確で、参加者は 18 人、年齢層も狭く、シナリオは尋問に限定され、NPC の外見や移動などは主対象ではない。したがって一般的なゲーム NPC 論として広げすぎるより、会話型 VR/推理/チュートリアル NPC の評価設計として読むのが妥当である。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、LLM NPC や会話アシスタントを入れる前に、この論文の評価分解を checklist 化できる。ログには、発話開始から返答完了までの total latency だけでなく、入力認識、思考、音声/表示生成、再生開始を分けて残す。headless 評価では「正しい返答か」だけでなく、会話履歴が増えた時に応答時間と返答長が増えるか、補助役 NPC が次アクションを具体化できたか、感情・人格の項目が単に説明文で埋まっていないかを見る。

ゲーム用途では、完全な人間らしい会話相手より、観察ログを読んで助言する partner NPC、チュートリアル役、推理の整理役から試す方がよい。そこでは人間らしさより、短い応答、見落としの補助、次の行動候補の提示が体験価値になる。逆に suspect や仲間キャラのように emotional depth が必要な役では、遅延対策と表情/動作/沈黙の演出を同時に設計しないと、LLM の文だけでは薄く見える。

■ メリット・デメリット
メリットは、実装済み LLM NPC を評価する時に、SUS、believability、GEQ、latency 内訳という観測項目をそのまま借りられること。デメリットは、VR 尋問という限定条件、少人数サンプル、英語会話、Quest 2 環境に依存しており、非 VR や高速アクションの NPC へ直接一般化できないこと。特に入力が音声でない UI では、待ち時間の感じ方が変わる。

■ 判定
部分採用。実装方式そのものではなく、会話 NPC の評価ログと失敗検出リストとして採用する。特に cycle latency、context 増加時の劣化、emotion/personality の薄さを別項目で見る。
