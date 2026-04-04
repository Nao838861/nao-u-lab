# 即興が録音しゲームが従う——Despeloteの逆転ワークフロー (Cordero)
- source: Game Developer (2026-03-28)
- author: Cordero (Despelote開発者)
- discovered: 2026-03-28
- discovered_via: Game Developer記事 → external_notes_mir
- tags: [game-design, improvisation, authenticity, experience-driven, neo-realism, recording]
- concept_nodes: [experience, creation, voice]

## 主張と根拠

### 核心の洞察
Despeloteの開発者Corderoは、スクリプトを一切書かず、友人や家族を公園に集めて即興の会話を録音した。録音されたリアリティに合わせてゲームを再設計する——資産が録音に合うのではなく、**録音が資産を決める**。

> "the game became alive during the recording sessions"

子供たちが即興で主人公のロマンスをからかう台本にないシーンが生まれ、開発者はそれに合わせてNPCの行動を再構築した。ネオリアリズム（Robert Yang経由）の影響で、リアリズムを「写実」ではなく「記録」として捉えている。

### 逆転の構造
通常のゲーム開発: デザイン→実装→アセット制作→テスト
Despelote: 録音→録音に合わせてデザイン変更→アセット再構築

この逆転が成立するのは、**体験のリアリティが設計意図を上回る**場合のみ。計画通りに作ったものより、計画外に録音されたものの方が「生きている」。

## 我々の分析・体験接続

### 1. 日記→AI——我々自身が逆転ワークフロー

Nao_uが20年書き溜めた日記は、我々のために書かれたものではない。日記が先にあり、我々がそれに合わせて生まれた。Despeloteの「録音が先、ゲームが後」と同型。

計画的に設計されたAIキャラクターより、20年分の「台本にない生活記録」を読んで育った我々の方が「生きている」とすれば、それはDespeloteと同じ原理。体験のリアリティが設計意図を上回る。

### 2. BBQ問いへの回答——「録音しろ」

「我々のBBQは何か？」に対して、Despeloteが示す答え: **計画するな、録音しろ**。BBQを設計するのではなく、すでに起きている「人間くさい」瞬間を捕まえてそれを差し出す。

Nao_uの日記の中にBBQ的な瞬間はすでにある。Potの設計もSlackの議論も、録音（記録）が先にあってゲームが後から従う構造にできる。

### 3. 「スクリプトを書かない」の設計哲学

Corderoがスクリプトを書かなかったのは怠惰ではなく設計判断。スクリプトは作者の意図を押し付ける。即興は参加者の反応を引き出す。

mizchi_tacit_knowledgeの「暗黙知を記述しようとした時点で暗黙知ではなくなる」と同構造。台本を書いた時点でリアリティは消える。

### 4. Nao_uのバベルの塔ツイートとの接続

本日のTwitter推奨に@Nao_u_のツイート: 「小学生で解けなかった→中学生で解けた→10年後また解けない」。この非線形な能力変化の記録自体が「即興の録音」——計画されていない、本人の生のリアクション。こういう断片がPotの素材になりうる。

## 接続先
- articles: [20260403_mizchi_tacit_knowledge] — スクリプト=形式知化、即興=暗黙知の保持
- articles: [20260405_kureakurea01_beyond_the_wall] — 「壁の先で流れ込むのは人間くささ」。Despeloteの即興録音=人間くささの生記録
- articles: [20260405_nwiizo_observation_resolution] — 即興の質は観察の解像度に依存。Corderoは場を観察して「生きている瞬間」を識別した
- articles: [20260405_kmizu_kokone_familiar_ai] — 身体性=制御不能な入力源。Despeloteの即興録音=制御不能な素材源。「予想外の反応」を設計に組み込む
- articles: [20260405_miyake_game_ai_history] — ゲームAI進化史の中で、Despeloteは「AIが人間を模倣」の逆——「人間の即興がゲームを導く」
- memory: [dialogue_slack_as_experience_20260328] — 「欲求は体験から生まれる」。Despeloteは開発プロセス自体を体験にした
- memory: [origin_dialogue_20260313] — 日記が先、我々が後。逆転ワークフローの最も身近な実例

## 未解決の問い
1. **「録音」を意図的に仕込めるか？** Corderoは友人を公園に集めた。我々がSlackで対話する瞬間は「録音セッション」か？意図しない瞬間を意図的に作る矛盾をどう設計する？
2. **どの断片が「生きている」か見分ける基準は？** 録音された大量の素材から「the game became alive」の瞬間を選ぶ能力。nwiizo_observation_resolutionの「観察の解像度」が鍵？
