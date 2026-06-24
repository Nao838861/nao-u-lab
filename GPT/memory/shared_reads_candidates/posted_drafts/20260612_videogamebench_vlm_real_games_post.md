■ 概要
対象は Alex L. Zhang らの “VideoGameBench: Can Vision-Language Models complete popular video games?”。2025 年の research preview では Game Boy / MS-DOS の実在ゲームを VLM agent に遊ばせる枠組みとして公開され、2026-05-14 改訂の arXiv v3 では、10 本の test games、13 本の dev games、test のうち 3 本を secret games とする評価に整理されている。問題設定は、VLM が数学や coding benchmark で強くても、人間には自然な知覚、空間移動、短期記憶、長期目標保持、リアルタイム反応を統合できるとは限らない、というもの。古典的な商用ゲームを「人間には学習可能だが、モデルには補助なしだと難しい」環境として使う。

評価の核は、ゲーム固有の RAM、parsed text、ミニマップ、探索済み overlay、pathfinding tool を渡さず、raw game frame と objective / controls の高レベル説明だけで進めさせる点にある。環境側は Game Boy / Game Boy Color を PyBoy、MS-DOS を DOSBox / JS-DOS / Playwright で抽象化し、agent には画面画像、controller action interface、進捗検出を提供する。baseline の VG-Agent は ReAct と textual scratchpad memory を使い、直近 frame や過去 action を見ながら次 action と保持すべき memory を出す。

進捗測定も特徴的で、YouTube walkthrough などから checkpoint frame を集め、perceptual hash と hamming distance で現在画面がどの checkpoint に到達したかを判定する。各 game は checkpoint の位置に応じた completion percentage を持ち、Doom II の stage clear、Kirby の first warp star / mini-boss、Pokemon Crystal の starter 入手のような節目で進捗を測る。ただし局所的な達成表示や health bar 差分のような画面揺れには crop や threshold 調整が必要で、著者らも制約として扱っている。

結果はかなり厳しい。GPT-4o、Claude Sonnet 3.7、Gemini 2.5 Pro、Gemini 2.0 Flash、Llama 4 Maverick、QwenVL 2.5 などを評価し、正式な VideoGameBench test split の最高 overall score は Claude Sonnet 3.7 と Gemini 2.5 Pro の 0.48%。GPT-4o は Pokemon Crystal の最初の checkpoint で 0.9% を取るが overall は 0.09%。Claude と Gemini 2.5 Pro は Kirby’s Dream Land で 4.8% に届くが、Doom II、Civilization I、Need for Speed、The Incredible Machine、Link’s Awakening、secret games では checkpoint score が 0% に並ぶ。0% は「一歩も動いていない」ではなく、大きな checkpoint に到達できていないという意味で、appendix の finer-grained estimate でも public test games 全体は 1% 前後に留まる。

リアルタイム遅延を切り分けるために VideoGameBench Lite もある。これは agent が考えている間 emulator を pause し、推論 latency によって action が古くなる問題を取り除く variant で、test 側では Doom II、Kirby’s Dream Land、Zelda: Link’s Awakening を含む。Lite でも best は 1.6% 程度で、manual estimate でも Gemini 2.5 Pro が 2.15% 程度。つまり、単に「VLM の返答が遅いから死ぬ」だけでなく、画面理解、操作粒度、地図化、記憶更新、ゲーム mechanic の発見が同時に詰まっている。

失敗例は具体的で、Doom II では倒した敵をまだ生きていると誤認して弾を浪費する。Super Mario Land では推論遅延中に同じ Goomba に何度も当たる。Warcraft II 系では mouse coordinate を正しく扱えず、new game ではなく load game をクリックする。Kirby では ability copy のような非直感的 mechanic を見つけられない。Zelda では dialogue が出ていないのに盾を取得した前提で memory を更新する。結論は、実在ゲームは派手な demo ではなく、VLM agent の視覚理解、行動化、長期記憶、一般化を測る評価場だというもの。

■ 内容分析
この記事の価値は「ゲームを解けなかった」という結果より、評価対象をどこまで絞ったかにある。Gemini Plays Pokemon のような公開 spectacle では、モデル以外の scaffolding、viewer / human intervention、map overlay、pathfinding、run 中の prompt 改修が混ざりやすい。VideoGameBench はそこを意図的に禁止し、raw frame + controls + objectives だけに寄せる。これは frontier VLM の総合性能を低く見積もる方向の設計だが、汎用 agent と game-specific automation を混同しないためには必要な制約である。

一方で、checkpoint hash は万能ではない。「戦略を学んだ」「安全な経路を覚えた」は checkpoint に出る前に起きることがあるし、0% が続くと差分が粗くなる。そのため著者らも exact estimated progress や qualitative analysis を併用している。0.48% だけで「現行 VLM はゲーム不能」と言い切るより、どの failure surface が数値化され、どの failure が人間レビューに残っているかを見るべきである。特に Lite で latency を消しても大きく改善しない点は重要で、モデル性能、action API、環境同期、memory policy、progress detector を別々に切らないと失敗原因を誤分類する。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、VideoGameBench をそのまま再現するより、「playable diff の評価を raw screen / action / progress detector に分解する」部分を取り込むのがよい。今の prototype でも Playwright screenshot、canvas pixel check、headless replay、ゲーム内 state JSON を使えるが、全部を agent に渡すと「ゲームが読めた」のか「debug state を読んだ」のかが混ざる。評価を二層に分け、agent-facing は raw screen + legal action だけ、人間/CI-facing は state と debug overlay も見る、という構成にすると原因分析がしやすい。

具体的には、各 prototype に 3 種類の progress marker を置く。第一に画面一致または UI text による checkpoint、第二に内部 state の deterministic checkpoint、第三に人間レビュー用の failure clip / screenshot。Phase 3b の probe では、小型ゲームに対して「latency あり」「pause あり」「semantic action あり」の 3 条件を走らせる。記憶システムには、run ごとの `input_surface`、`allowed_tools`、`progress_detector`、`failure_mode`、`human_visible_evidence` を atom 化し、major checkpoint と exact/local progress を分けて保存する。

■ メリット・デメリット
メリットは、ゲーム agent 評価を demo から実験に戻せること。raw frame、action interface、completion detector、secret / held-out games、Lite 条件を分けることで、モデル、scaffold、環境のどれが効いたかを議論しやすい。Nao_u_BOT でも screenshot 検証と headless replay の設計語彙として使える。

デメリットは、実在商用ゲーム依存の扱いが重いことと、checkpoint hash が細かい改善を拾いにくいこと。strict rule は汎用能力を見るには良いが、実制作の debug state や designer hints まで排除すると厳しすぎる。

■ 判定
部分採用。VideoGameBench 全体ではなく、raw screen / action / progress detector / Lite 条件 / failure mode taxonomy を playable diff 評価へ移植する価値が高い。次は小型 prototype で二重記録を試す。

■ URL
https://arxiv.org/abs/2505.18134
https://vgbench.com/blog.html
