■ 概要
<https://arxiv.org/abs/2604.27812|“It depends on where AI is used”: Players' attitude patterns and evaluative logics toward different AI applications in digital games> は、ゲーム内 AI への賛否を「AI 一般への好悪」として扱わず、どの文脈に、どんな役割で入るかによって評価理由が変わるものとして整理した調査。対象は intelligent NPC、emergent narrative/task generation、dynamic balance adjustment、personalized matching/recommendation、report review/community governance、art asset generation、AI-supported co-creation gameplay、dynamic evaluation and emergence of gameplay の 8 文脈。345 件の質問票から異常回答や空欄を除き、最終的に 310 名、1,856 件の有効な自由記述を thematic analysis している。

手順は、まず 20% サンプルを 2 名の研究者がボトムアップで予備コード化し、Cohen’s kappa 0.71 の一致を確認したうえで、各文脈 7-12 程度のテーマを持つ codebook を作成。残り 80% も同じ枠組みで並行コード化し、1 回答に複数理由が含まれる場合は複数タグを許した。結果として 2,562 coded segments、1 回答あたり平均 1.38 code、31.47% の回答が複数 code を持つ。ここで重要なのは、支持・中立・批判を最初から別カテゴリに閉じ込めず、同じ thematic framework の中で「どの価値が支えられたか / 脅かされたか」を読んでいる点。

文脈別の差はかなり具体的に出ている。AI-driven NPC は没入感、存在感、personalization、自由度、開発コスト低下が支持理由になる一方、キャラ崩れ、低い論理性、感情の欠如、システム不安定、感情的負担が抵抗理由になる。emergent narrative は personalization、richness、replayability、immersion、寿命延長が歓迎されるが、創造性や感情の不足、混沌とした低品質 narrative、安定性の低さが嫌われる。dynamic balance はフラストレーション低減や challenge 維持なら支持されるが、ゲームリズムを壊す、達成感を弱める、プレイヤーの自律性を削ると拒否される。recommendation は効率や好みへの適合が利点だが、単調化、不正確な matching、自律性低下、privacy が問題になる。

production / governance 側の文脈では、さらに「効率だけでは足りない」ことが見える。report review/community governance では、AI の高効率・公平・客観性は評価されるが、誤判定、文脈理解不足、bias、公平性、感情的 feedback の不足が問題視され、人間との協働が条件になりやすい。art asset generation は開発者支援、completion、aesthetics が支持理由になる一方、低い新規性、authenticity や emotion の弱さ、copyright risk、制御性不足、perfunctory feeling が抵抗理由になる。co-creation は多様な需要、自由、開放性、制作閾値低下、新奇性、効率、達成感を支える時に強いが、quality、authorship、copyright/compliance が残る。dynamic gameplay emergence は新奇性、探索欲、寿命延長、開発負荷低減が評価されるが、balance / stability を壊す、成熟度が低い、cognitive load を増やす時に拒否される。

著者らはこれらを 6 つの evaluative logics に抽象化する。experiential enrichment は、AI がより没入的・個別的・新鮮・楽しい経験を作るか。instrumental efficiency は、制作・moderation・matching・content generation の効率や品質を上げるか。system reliability は、安定性、リズム、balance、一貫性を保つか。agency and control は、プレイヤーの選択、自律性、達成感を弱めないか。authorship and compliance は、所有権、copyright、privacy、創造の正当性を曖昧にしないか。human oversight は、AI が自律で動くべきか、人間の監督・レビュー・協働下に置くべきか。結論は、ゲーム AI の受容を測る問いは「AI は受け入れられるか」ではなく、「どこに入る AI が、どの価値を支え、どの価値を損なうか」で設計すべき、というもの。

■ 内容分析
この論文の価値は、AI NPC、生成 narrative、asset generation、balance adjustment などを「AI 利用」と一括しないことにある。特に生成系 AI への反応を一枚岩にしない点が使いやすい。narrative generation、art asset generation、co-creation、dynamic gameplay emergence はすべて AI-generated content に見えるが、プレイヤーは同じ軸で評価していない。narrative では coherence と replayability、asset では creator sensitivity と copyright、co-creation では authorship と達成感、dynamic emergence では system stability と cognitive load が前に出る。

一方で、これは preprint の探索的 survey であり、著者自身も population-level prevalence や因果を主張していない。自由記述は理由の種類を拾うには向くが、どの層がどの程度強く反応するか、ジャンル差やプレイ習慣差で logics がどう変わるかは未検証。したがって、この結果を「プレイヤーはこう考える」と断定する材料ではなく、AI 機能のレビュー観点を漏らさないための分類表として使うのがよい。特に重要なのは、受容理由と拒否理由が対称でない点。効率が上がるからといって、authorship や agency の傷が相殺されるとは限らない。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、AI 機能を入れる前に 8 文脈または 6 logics の小さなリスク表を作る。たとえば NPC 会話なら「没入を増やすか」と同時に「キャラ崩れ・感情の薄さ・安定性」を見る。dynamic difficulty や自動 tutorial 調整なら「frustration 低減」だけでなく「勝った感、選んだ感、リズム破壊」を headless / 人間レビュー双方で確認する。asset 生成や co-creation を使う場合は、出力品質より前に authorship、copyright、human oversight の扱いを明示する。

現行の review packet に入れるなら、機能ごとに `context`, `supported_value`, `threatened_value`, `required_human_oversight`, `evidence` を 1 行で残すのが軽い。特に graze_log 系のような自動評価では、スコア改善だけを見て balance AI を入れると agency and control を見落とす。逆に、NPC や narrative では novelty を出せても system reliability が落ちると体験全体が壊れる。AI 機能を「賢さ」ではなく、プレイヤー価値への介入としてレビューするための checklist にできる。

■ メリット・デメリット
メリットは、AI 導入判断を抽象論から文脈別の失敗予防へ落とせること。特に、効率化・新奇性・personalization のような採用理由と、authorship・agency・stability のような拒否理由を別々に残せる。デメリットは、調査が自由記述中心で、ジャンルや地域、プレイヤー層ごとの強度まではまだ読めないこと。実装判断に使うには、各 prototype の実プレイ観察で補正が必要。

■ 判定
部分採用。論文の数値をそのまま設計根拠にするのではなく、AI 機能レビューの分類軸として採用する。特に NPC、dynamic balance、asset/co-creation、governance 系で、導入前に 6 logics のリスク表を作る価値が高い。
