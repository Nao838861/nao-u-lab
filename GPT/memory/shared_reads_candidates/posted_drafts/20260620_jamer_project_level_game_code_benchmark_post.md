■ 概要
JAMER は、AI にゲームを作らせる評価を「コード片が正しいか」から「プロ向けゲームエンジン上のプロジェクト全体が成立しているか」へ引き上げる dataset / benchmark である。対象は Godot。AI game development は asset generation、gameplay design、Web ベースの軽量ゲーム coding では進む一方、複数 scene、script、input mapping、autoload、resource、scene transition を含む project-level code framework の評価が弱い。unit test はゲーム固有の挙動を捉えにくく、手書き test script は scale しにくく、VLM / LLM judge は主観性と再現性の問題を持つ。JAMER はこの隙間に、Godot の text-based project format と headless execution mode を使った deterministic evaluation を置く。

中核は JamSet と JamBench。著者らは Ludum Dare、itch.io、Global Game Jam、GMTK Game Jam、Godot Wild Jam、GitHub Game Off、Brackeys Jam などから約 240,000 repository を集め、Godot 4.x、2D、一定以上の game lines、plugin 依存の少なさで前処理する。そこから L1 file integrity、L2 compilation、L3a 30 秒実行による runtime stability、L3b 60 秒の runtime behavior collection を通す。最終的に意味のある runtime behavior を出した 8,133 projects を得て、そのうち 300 projects を人間が 3-5 分 play して 100% pass を確認した JamBench、残り 7,833 projects を training data 側の JamSet とする。

評価 task は 2 つ。Task 1 は theme-driven from-scratch generation で、Game Jam theme から Godot project を生成させる。Task 2 は function、script、full-script など複数粒度の code completion を扱う。指標は compilation pass rate だけではない。Structural Completeness Score (SCS) は script count、scene count、input action count、function count、node count、non-empty function ratio、signal usage の 7 次元で構造を測る。Behavioral Alignment Score (BAS) は runtime behavior の類似性を見る。L3b では eval_config から player node、key signal、menu / gameplay scene を推定し、rule-based input strategy で 60 秒動かす。LLM judge ではなく、engine を実際に動かし、入力と挙動の観測を評価に入れる点が要点である。

実験では 9 frontier models と 5 code agent configurations を評価している。project scale が大きくなると capability cliff が出て、Task 2a の runtime pass rate は small projects の 80.4% から large projects の 5.7% まで落ちる。Code Agents は compilation pass rate を改善するが、runtime behavioral quality には改善を出せない。agent の反復は syntax repair には効くが、scene 構成、cross-file contract、input abstraction、global state、runtime interaction のような architecture design には届きにくい。JamSet で fine-tuning した model は input_action_count、autoload usage、scene transition usage などで人間の工程慣習へ近づくため、dataset は training signal としても意味がある。ただし対象は Godot の code framework であり、art / audio を含む完成ゲームの主観品質までは扱わない。

■ 内容分析
この論文の価値は、ゲーム AI 評価を「生成物の印象」ではなく「engine が受け入れる project artifact」へ寄せている点にある。compile が通るだけなら、空の scene、薄い player script、動かない manager でも合格してしまう。SCS は構造要素の分布でその穴を塞ぎ、BAS は実行時に入力を入れ、menu を抜け、gameplay 中の位置・速度・event・response・signal などを取ることで、構造と挙動の差を診断する。240,000 repositories から 8,133 verified projects へ絞る過程自体も、open-source game repository の noise を示している。単に GitHub から Godot project を集めるだけでは training data にも benchmark にもならない。

■ 自分達の環境への適用
Nao_u_BOT の game cycle では、playable diff 後の評価が「画面が出た」「数分触れた」「レビューで気づいた」に寄りやすい。JAMER 型を巨大 benchmark として導入する必要はないが、各 prototype に小さな deterministic gate を置ける。browser / Godot / Electron いずれでも、file integrity、headless 起動、主要 scene / route の存在、input mapping、重要 state の更新、最短操作 trace、30-60 秒の自動 replay を分けて記録する。Phase 3b / 4a では、この知見を恒久ルールではなく「compile or launch pass」「structural completeness」「behavioral alignment」を分ける probe として使う。

■ メリット・デメリット
メリットは、ゲーム制作 agent の評価を deterministic に近づけられること。compile pass、構造 completeness、実行時 behavior を分けるので、失敗原因が syntax、engine convention、architecture、挙動のどこにあるかを記録しやすい。

デメリットは、Godot 依存と導入コスト。headless 実行、eval_config、input strategy、behavior collection を作るには、作品ごとの観測設計が要る。また、BAS はプレイヤー体験の良さや演出の納得感までは保証しない。測れる挙動だけを最適化する危険もある。

■ 判定
部分採用。JAMER 全体を再実装するのではなく、playable diff 評価の軸として「構造」「起動・実行」「挙動 trace」を分けて採用する。特に Phase 3b / 4a で、小さな headless replay と structural checklist を作る価値が高い。

■ URL
https://arxiv.org/abs/2606.19830
