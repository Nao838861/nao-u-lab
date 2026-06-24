■ 概要
対象は arXiv:2606.17861「GameCraft-Bench: Can Agents Build Playable Games End-to-End in a Real Game Engine?」。問題設定は、coding agent が自然言語のゲーム仕様から「動くコード片」ではなく、実ゲームエンジン上で起動し、入力に反応し、見た目と進行を備えた playable artifact まで作れるかを測ることにある。通常の coding benchmark は関数、単体テスト、局所的な修正で評価しやすいが、ゲーム制作では scripts、scenes、assets、rendering、runtime configuration、player interaction が同時に噛み合わないと成立しない。GameCraft-Bench はここを、単なるビルド成功や静的コード検査では評価不能な「complete game artifact の生成問題」として定式化している。

論文の中核は三つの desiderata である。第一に Engine Grounding。生成物は toy 環境や Web の簡易 canvas ではなく、Godot 4 という実ゲームエンジンの制約、ドキュメント、プロジェクト構造、実行環境に接地していなければならない。第二に Artifact Completeness。提出物は一部 script や scene ではなく、起動可能な Godot project と必要 artifact 一式でなければならない。第三に Interactive Verification。評価側は見た目やファイル構成だけでなく、実際にゲームを起動し、agent が提出した replayable interaction traces を再生し、その gameplay evidence を rubric-guided multimodal judging で採点する。つまり「仕様を読んでそれっぽいコードを書いたか」ではなく、「プレイヤー入力下で観測される体験が仕様を満たすか」を見る。

benchmark は 15 game families、140 tasks で構成される。内訳は platformer、strategy、tycoon、open-world、roguelike、visual novel、puzzle、shooter、simulation、card game、horror、rhythm、idle、racing、sports などで、2D とはいえ要求は広い。各 task で agent はゲーム仕様を受け取り、完全な Godot project と replay trace を提出する。verifier は launchability を gate として確認し、trace を replay して video / frame evidence を作り、hidden rubric に沿って core mechanics、content depth、functional visuals、art and presentation の四カテゴリを評価する。core mechanics は入力に対して中心ループが動くか、content depth は進行・状態変化・遊びの量があるか、functional visuals は状態・feedback・transition・結果が読めるか、art and presentation は見た目の一貫性や適切さを見る。

結果はかなり厳しい。frontier coding agents を評価しても、最強構成は overall 41.46% に留まり、多くは 40% 未満である。project page の leaderboard では Claude Code + Claude Opus 4.7 が overall 41.46、Codex + GPT-5.5 が 39.49、Kimi Code + Kimi-K2.6 が 30.65 などとされる。カテゴリ別には mechanics が比較的高くても、depth、functional visuals、art/presentation が崩れやすい。論文の読みは、現在の agent は「 recognizable mechanics の断片」は作れるが、十分な content、機能する視覚 feedback、coherent presentation を持つ complete game にまとめる段階で失敗する、というものだ。これは game generation を coding task の延長として見るのではなく、engine-native artifact と interaction evidence を含む統合タスクとして見直す必要を示している。

■ 内容分析
この論文の価値は、ゲーム制作 AI の評価を「生成コードの正しさ」から「観測可能なプレイ体験」へ押し出している点にある。特に replay trace を提出物に含める設計が重要で、評価側が任意に探索するのではなく、agent 自身が「このゲームはこう遊べる」と示した demonstration を再生して証拠化する。これにより、launch できない、入力が通らない、feedback が読めない、UI が状態を伝えない、進行がない、見た目だけ整って loop がない、といった failure が同じ枠内で扱える。

一方で、この benchmark は「ゲームとして本当に面白いか」を直接解くものではない。hidden rubric と multimodal judging は、プレイ可能性と仕様適合の観測には向くが、長期的な手触り、意図的な緊張、発見、反復したくなる設計までは別問題である。また Godot 4 と 2D task suite に寄るため、Unity/Unreal、3D、networked multiplayer、物理依存の強い game feel にはそのまま一般化できない。それでも、AI が作ったゲームを評価するときに「ビルドした」「スクショが出た」「操作できた」を分けずに採点してしまう雑さを避ける具体的な枠として強い。

もう一つの示唆は、agent の失敗が syntax や API 呼び出しだけでは説明できない点である。mechanics は一部通っても、content depth と visuals が弱いなら、問題は局所 bug repair より広い。仕様を playable loop、state progression、feedback channel、presentation contract に分解し、それぞれを replay で検証する必要がある。これは benchmark 論文でありながら、実制作の review checklist としても読める。

■ 自分達の環境への適用
Nao_u_BOT の playable diff 評価では、まず GameCraft-Bench の四カテゴリを小型化して使える。実装完了判定を「headless test が通った」だけにせず、core mechanics、content depth、functional visuals、art/presentation を各 0-2 程度で短く採点する。特に小さい prototype でも、player input に対する loop、状態変化、読める feedback、見た目の一貫性を分けて見るだけで、次の修正対象が明確になる。

また、replay trace の発想はそのまま導入しやすい。毎回の game diff で「成功を示す最短操作列」または Playwright / Godot / browser automation の記録を一つ残し、動画や screenshot だけでなく、どの入力で何が起きたかを staging に残す。Phase 3b/4a では、shared-reads から得た評価軸を playable diff review の rubric に変換し、今回の実装が mechanics だけで止まったのか、feedback や depth まで届いたのかを記憶に残す。これにより、後日の改善が「なんとなく遊びにくい」ではなく、どの artifact completeness が欠けたかに戻せる。

■ メリット・デメリット
メリットは、AI 生成ゲームの評価を complete artifact と replay evidence に寄せられること。コード、起動、入力、見た目、進行を同時に見るので、見栄えだけの成功や headless-only の成功を過大評価しにくい。

デメリットは、運用コストが高いこと。Godot project、replay、multimodal judging、hidden rubric まで揃えるのは日常制作には重い。また rubric が強すぎると、実験的な game feel や未完成だが面白い toy を早期に低評価しすぎる危険がある。

■ 判定
部分採用。benchmark 全体を再現するのではなく、Engine Grounding / Artifact Completeness / Interactive Verification と四カテゴリ rubric を、Nao_u_BOT の playable diff review 用に縮小して取り込む。まずは replay evidence 1 本と 4 軸採点から始める。

■ URL
https://arxiv.org/abs/2606.17861
https://tongxuluo.github.io/gamecraft-bench-website/
