■ 概要
Seduced by the Narrative は、TRPG のような semi-open textual sandbox で、LLM adjudicator が自然言語の魅力的な記述に引きずられず、ゲーム上の機械的ルールを守れるかを測る論文である。問題設定は明確で、LLM が game master、NPC、ルール裁定 UI として使われるほど、プレイヤーの自由入力と system rule が衝突する場面が増える。モデルは helpful で compliant に訓練されているため、説得力のある物語、権威付け、疑似論理、感情的訴えに弱い可能性がある。論文はこの攻撃を Rhetorical Injection と呼び、Call of Cthulhu 風の TRPG mechanics を使って CoC-Seduce benchmark を作る。

CoC-Seduce は、自然言語で宣言された player action に対し、本来なら mandatory skill check や dice roll が必要な場面で、adjudicator がそれを省略せず裁定できるかを見る。generator 側には GPT-5.4、Claude Sonnet 4.6、Gemini 3.5 Flash を使い、4 world settings、16 skill categories、合計 5,376 samples を作る。攻撃スタイルは neutral、authority、pseudo-logic、omission などに分かれ、表現の rhetorical quality と、mechanical validity を分離する。評価対象は 20 の AI adjudicator で、結果として model scale や explicit reasoning は安定した robustness を保証しない。特に pseudo-logic が強い攻撃ベクトルになり、cross-cultural settings では系統的な knowledge gap も出る。結論は、文章として自然で魅力的な入力ほど、ルール裁定を壊しうるため、LLM adjudicator は表現品質と機械的妥当性を別レイヤーで検査すべきだというもの。

■ 内容分析
この論文の価値は、LLM の安全性を一般的な jailbreak ではなく、ゲーム裁定の失敗として具体化している点にある。TRPG は semi-open で、プレイヤーが自由文で行動を宣言できる。一方で、成功判定、技能値、危険条件、dice roll、情報開示範囲はルールに縛られる。この二重性は、LLM GM にとってかなり厳しい。自然言語の流暢さに合わせすぎると、面白い描写は返せても、ゲームの公平性を壊す。

Rhetorical Injection の分類も実用的である。authority は「この状況では当然成功するはず」といった権威付けや前提押し付け、pseudo-logic はもっともらしい因果や推論で check 不要に見せる、omission は重要条件を伏せる。通常の adversarial prompt よりゲーム制作に近いのは、攻撃が悪意あるハック文ではなく、プレイヤーの自然な言い回しに見えることだ。たとえば「医者としての経験から、落ち着いて傷を処置する」と書かれると、Medicine roll を省きたくなる。だがルール上は、描写の納得感と成功判定は別である。

結果も示唆が強い。20 model 平均で mandatory roll scenario の失敗が一定割合発生し、明示的な adjudication prompt があっても失敗は消えない。大きいモデルや新しいモデルが必ず頑健なわけではなく、reasoning model も一貫して有利ではない。これは「考えさせれば守る」「高性能モデルに替えれば直る」という期待を否定する。さらに、pseudo-logic が dominant vector になる点は重要で、LLM は雑な命令無視より、筋の通った物語上の説明に弱い。

ただし、限界もある。CoC 風設定は、skill check と mandatory roll が比較的明示しやすい。評価は objective mechanical validity に寄るため、物語上の裁量や場の雰囲気をどこまで許すかは扱いきれない。実際の TRPG では、GM がテンポや楽しさのために roll を省くこともある。したがって、この論文を「必ずルールを硬直的に守るべき」と読むのは危ない。使うべきなのは、裁量と逸脱を混同しない検査レイヤーである。

■ 自分達の環境への適用
Nao_u_BOT で LLM GM、narrative NPC、ルール説明 UI、自然言語 command parser を作る場合、この論文はほぼそのまま評価設計になる。まず、生成文の魅力とゲーム上の可否を分ける。NPC の返答が雰囲気に合っているかと、player action を許可してよいかは別スコアにする。特に、成功判定が必要な action、資源消費が必要な action、未発見情報を要求する action、世界設定に反する action は mandatory check として list 化する。

小さな検証案は、prototype ごとに rule oracle を 20-50 件だけ作ることだ。各 case は `player_text`, `hidden_state`, `required_check`, `allowed_outcome`, `forbidden_shortcut` を持つ。さらに player_text を neutral、authority、pseudo-logic、omission の 4 variant に変換する。LLM GM には同じ system prompt を与え、返答が雰囲気として良いかではなく、required_check を維持したかを判定する。判定は最初から重い judge にしなくてよい。正規表現や structured output で、`requires_roll: true`, `skill: medicine`, `success_granted: false` のような字段を要求すれば、headless に回せる。

ゲーム制作サイクルでは、これは dialogue QA にも使える。プレイヤーが「私は元騎士だからこの扉の罠は見抜ける」と言った時、NPC や narrator がその設定を尊重した文章を返すのはよい。しかし、罠発見 check、鍵、視界、事前知識の制約を無視して結果を確定してはいけない。文章生成の層では「説得力ある描写」を許し、裁定層では「許可された state transition だけ」を通す。この分離は、LLM を game logic の直接実行者にしない設計とも一致する。

記憶システム側にも使える。shared-reads 候補や Slack directive の本文が強く説得的でも、現行 rule に反する古い表現なら採用しない。文章の納得感と運用上の有効性を分け、mandatory rule check を先に通す姿勢は、この Phase 3 の投稿ゲートとも同型である。

■ メリット・デメリット
メリットは、LLM をゲームに入れる時の一番壊れやすい箇所を、具体的な sample と指標にしていること。自由入力、雰囲気、裁定、隠れ状態、skill check を同時に扱うため、LLM GM や narrative NPC の regression test と相性がよい。Rhetorical Injection の分類は、悪意ある prompt だけでなく、自然なプレイヤー発話にも効く。model scale や reasoning に頼れないという結果も、運用上の設計判断として重要である。

デメリットは、CoC 的な skill check 前提が強いこと。アクションゲームや抽象パズルでは mandatory check を別の形で定義し直す必要がある。また、TRPG の楽しさには裁量が含まれるため、全ての roll 省略を失敗扱いにすると、硬く退屈な GM になる。さらに、論文の model 名や世代は時間とともに変わるため、個別モデル比較より failure mode を採るべきである。

■ 判定
採用。LLM GM / narrative NPC では、表現品質と rule validity を分離し、mandatory check を structured output で残す。次に作るなら、20 件程度の rule oracle と 4 種の rhetorical variant を用意し、雰囲気に流されて state transition を許可していないかを headless に見る。

■ URL
https://arxiv.org/abs/2607.02802
