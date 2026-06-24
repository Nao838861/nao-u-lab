■ 概要
対象は arXiv:2506.03610 v3「Orak: A Foundational Benchmark for Training and Evaluating LLM Agents on Diverse Video Games」。問題設定は、LLM agent をゲームで評価するとき、既存 benchmark が text game、2D grid、少数ジャンル、単一ゲーム向け custom workflow に寄りがちで、実際の video game に必要な能力を横断的に測れていないことにある。論文はこの不足を三つに整理する。第一に、主要ジャンルをまたぐ diverse LLM capabilities の評価が足りない。第二に、complex gameplay に必要な self-reflection、memory、tool use、planning などの agentic modules を十分に分析していない。第三に、pre-trained LLM を gaming agent へ寄せる fine-tuning dataset が不足している。

Orak はこの穴を埋めるため、12 本の実 video games を使って LLM/VLM game agents を訓練・評価する benchmark として設計されている。対象ゲームは Street Fighter III、Super Mario、Ace Attorney、Her Story、Pokemon Red、Darkest Dungeon、Minecraft、Stardew Valley、StarCraft II、Slay the Spire、Baba Is You、2048。action、adventure、role-playing、simulation、strategy、puzzle の 6 major genres を覆う構成で、細かい操作、長期記憶、error handling、論理推論、多段 planning、story-driven quest、resource management などを一つの benchmark family に収める。単にゲーム数が多いだけではなく、各ゲームの observation、action、評価指標、agentic module を扱うための接続様式を揃えようとしている点が中核である。

接続基盤として Orak は Model Context Protocol (MCP) ベースの plug-and-play interface を使う。各 game environment と agentic module package は独立した MCP server として動き、ゲーム状態取得、step 実行、reflection、planning などを callable tools として LLM に提供する。評価時の LLM は、game state を取得し、必要な module を使って action inference を行い、game step を実行する。この構造により、ゲームごとの ad hoc な agent を作るだけでなく、同じ LLM に対して input modality、agentic strategy、fine-tuning の効果を比較しやすくする。さらに、expert LLM gameplay trajectories からなる fine-tuning dataset を公開し、一般 LLM に「各ジャンルでどのように agentic strategies を使うか」という meta-knowledge を移すことを狙う。

評価枠は game score leaderboards、LLM battle arenas、agentic modules の ablation、visual input state の効果、fine-tuning effects まで含む。実験では 15 LLM を評価し、proprietary LLM が全体として open-source LLM より高い一方、battle scenario では差が狭まること、proprietary LLM は extended agentic workflows の恩恵を受けやすいが open-source LLM は限定的であること、現時点の models は visual input から十分な価値を引き出せていないこと、fine-tuning によって大きな LLM 由来の gameplay meta-knowledge を小型 model に移し、intra-game、OOD-game、non-game unseen scenarios にも一定の generalization が出ることを報告している。たとえば Street Fighter III の appendix では、zero-shot、reflection、planning、ref-plan、text/image/both input、fine-tuning の比較が示され、単に大きい model が常勝するというより、環境・入力・戦略・対戦形式で順位が変わることが見えている。

■ 内容分析
Orak の強みは、「LLM がゲームを遊べるか」を一枚の leaderboard に押し込まず、ジャンル、入力、agentic module、fine-tuning、対戦相手の有無を切り分けている点にある。特に Street Fighter III の結果で、single-agent score と multi-agent arena の順位が一致しないという観察は重要である。相手が知的に振る舞うだけで dynamics が変わり、評価対象が反射的操作、戦術選択、相手の誘導、失敗回復の混合になる。これは「ゲーム agent の能力」は固定 task score だけでは捉えきれないことを示している。

MCP による interface の統一も実務的に面白い。ゲーム状態と agentic strategy を tool として切り出すと、LLM 本体、memory、planning、reflection、visual parser、fine-tuned policy を差し替えやすい。これは評価 benchmark というより、game-agent harness の設計思想に近い。ただし、実ゲーム側には emulator、mod、API wrapper、visual parsing などの重い前処理が必要で、完全に frictionless な plug-and-play ではない。各ゲームの metric も score、progress、battle result、quest success など性質が違うため、横断比較は便利だが、最終的にはゲーム固有の意味を読まなければならない。

fine-tuning dataset の扱いも単純な模倣学習ではなく、agentic strategies の使い方を軌跡として保存する点が示唆的である。小型 model が形式遵守や Street Fighter III の performance を大きく改善する一方、visual input の効果がまだ不安定なことは、game AI 評価で「画面を見せれば強くなる」と仮定する危うさを示す。状態表現、テキスト化、tool affordance、行動空間の設計が、model size と同じくらい結果を左右する。

■ 自分達の環境への適用
Nao_u_BOT では、Orak 全体を再現するより、game-agent harness の分解を借りるのが現実的である。自作 prototype ごとに、状態取得 tool、action tool、短期 memory、reflection、planning を小さな MCP 風 interface として揃え、同じ prompt / same budget / same logging で比較する。AI playtester を一つのスコアで判断せず、genre 差、入力 modality、strategy module、trajectory の残り方を分けて見る。

具体的には、Phase 3b/4a の probe として「同じ小型ゲームを zero-shot、planning 付き、reflection 付き、memory 付きで 3 回ずつ走らせ、成功率だけでなく失敗軌跡を保存する」形に落とせる。GameCraft-Bench が artifact を作る側の評価なら、Orak はできあがったゲームを agent がどう遊び、どの interface で失敗するかを見る側の評価である。この二つを分けると、制作 agent の失敗と playtest agent の失敗を混同しにくくなる。

■ メリット・デメリット
メリットは、game-agent 評価をジャンル横断、tool interface、trajectory dataset、ablation で扱えること。単発 score では見えない、入力形式や strategy module の効き方を観察できる。

デメリットは、環境構築が重く、各ゲームの wrapper と metric に強く依存すること。MCP 風に揃えても、ゲームごとの観測可能性や action granularity が違うため、横断スコアを雑に読むと判断を誤る。

■ 判定
部分採用。Orak をそのまま追うのではなく、MCP 風の state/action/strategy interface、trajectory 保存、agentic module ablation を小型 prototype 用に取り込む。制作物評価の GameCraft-Bench と、playtester 評価の Orak を分けて使う。

■ URL
https://arxiv.org/abs/2506.03610
https://arxiv.org/html/2506.03610v3
https://github.com/krafton-ai/Orak
https://huggingface.co/datasets/KRAFTON/Orak
