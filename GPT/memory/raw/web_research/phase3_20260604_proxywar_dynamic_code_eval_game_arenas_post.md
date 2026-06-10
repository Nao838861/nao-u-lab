■ 概要
ProxyWar は、LLM のコード生成能力を「静的な問題を解けたか」ではなく、「生成されたプログラムが動的なゲーム環境でどれだけ有効に振る舞うか」で評価するためのフレームワーク。問題設定は明確で、HumanEval や pass@k 型の評価は、関数単位の正しさやテスト通過を測るには便利だが、実際に使えるコードの性質、つまり実行時の安定性、計算効率、制約下での判断品質、自己修正能力、相手や環境が変わった時の頑健性を十分に見ない。ProxyWar はここにゲーム arena を入れる。LLM coder に自然言語のゲーム仕様を渡し、BaseAgent 形式の game-playing agent を生成させる。生成物はまず構造検査、基本機能、ゲーム固有ロジック、ロバスト性の階層テストを通り、失敗した場合はエラーメッセージを戻して最大数回の repair loop に入る。通過した agent だけが tournament に投入され、同じ制約・同じ環境で他 agent と対戦する。

手法の中核は、コード生成を「提出物」ではなく「代理プレイヤー」に変換して評価する点にある。ゲーム環境層は状態、行動、遷移、報酬、観測を持ち、agent は観測と action mask から合法手を返す。環境側がルールと状態遷移を管理し、生成コードは意思決定に集中するため、比較条件を揃えやすい。Tournament management は round-robin、サンプリング、Swiss 風の scheduling を使い分け、対戦結果を TrueSkill で集計する。単独パズルも、同じ条件で独立に解いた結果を相対比較して rating に入れる。静的指標としては Pass@1、Repair Rate、Structure / Function / Logic / Robustness の階層テストを併用し、動的指標として win rate、参加率、runtime error、timeout、平均意思決定時間などを見る。

実装では Python agent を対象に、Sudoku、2048、Tower of Hanoi、Maze、Tic-Tac-Toe、Connect Four、Reversi、2-player Snake、Limit Texas Hold'em など、単独パズル、二人零和/空間ゲーム、多人・不完全情報ゲームを揃えている。評価対象は 18 種の LLM coder で、Claude、GPT、Gemini、DeepSeek、Qwen、Llama、Codestral、Codex-Mini など、汎用、reasoning-enhanced、code-specialized に分けられる。各環境で 5 round、毎回 fresh agent を生成し、全 agent を同条件の tournament にかける。著者らは 1 モデルあたり 1 万試合以上を走らせ、45 秒/decision timeout、固定 seed、同一 workstation という条件で比較している。

結果は、静的 benchmark と動的 arena の差をかなりはっきり示す。たとえば Qwen2.5-Coder と DeepSeek-R1 は通常の pass@k では近く見えるが、ProxyWar では win rate が 13.4% と 39.6% で大きく離れる。DeepSeekV3 と Claude 3.5 Sonnet はどちらも参加率 100% で、従来なら「テストを通った」とまとめられやすいが、win rate では DeepSeekV3 が約 15 ポイント上回る。Pass@1 と tournament ranking の Spearman 相関は 0.23 と弱く、O3-Mini は Pass@1 が 97.3% と最高でも tournament では中位、DeepSeek-R1 は Pass@1 が 87.9% でも勝率が高い。Sudoku の例では、GPT-4.1 が MRV/LCV 付きの理論的に凝った探索を書く一方、DeepSeek-R1 の単純な backtracking の方が Python 実行では軽く、より速く、hard instance にも強い。つまり「賢そうなコード」と「制約下で勝つコード」は一致しない。

結論として、ProxyWar は LLM code generation を、正解文字列や unit test 通過だけではなく、実行環境内での operational behavior として測る必要を示している。ゲームは完全情報、不完全情報、探索、確率、長期計画、相手の存在、timeout などを安価に含められるため、コード生成の評価 arena として都合がよい。ただし著者らも、ゲーム環境が現実のソフトウェア開発全体を代表するわけではなく、環境選択や test suite の妥当性、API 更新による再現性、産業規模への拡張コストは残ると述べている。

■ 内容分析
この論文の重要さは、ゲームを「AI が遊ぶ対象」としてではなく、「生成コードの粗さを露出させる圧力装置」として使っている点にある。pass/fail のテストは、最低限の interface と正しさを確認する gate として必要だが、通過後の差をほとんど消してしまう。ProxyWar はその後に tournament を置くことで、遅い、脆い、手は合法だが弱い、修正できるが設計が悪い、単純だが速い、という差を見える形に戻す。特に、参加率 100% のモデル間でも勝率や error rate が割れる結果は、我々が普段「CI が通った」と言って見逃している品質差に近い。

もう一つの軸は、評価対象をモデル単体ではなく、prompt、生成コード、repair loop、実行 sandbox、ranking まで含む workflow として扱う点。LLM の「コード能力」を論じる時、単発回答だけを見ると、実務で重要な self-debugging や timeout 下の設計判断が抜ける。ProxyWar は repair rate を別指標にしつつ、それが強い tournament performance を保証しないことも示す。これは、修正できる agent と、最初から運用しやすい解を出す agent は別物だという話でもある。

弱点もある。game suite の作り方が評価結果を強く決めるため、arena 自体の偏りを監査しないと「このゲーム群に強いモデル」を「汎用的に強いモデル」と誤読する危険がある。また、TrueSkill ranking は比較には向くが、なぜ勝ったかの設計理由は別途 trace 解析が必要になる。したがって、ProxyWar をそのまま万能 benchmark として扱うより、特定の制作・検証目的に合わせた arena を作る発想として読むのがよい。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、`verify.js` 的な固定検証を「動く/壊れる」の gate にしつつ、その後ろに小さい arena を置くと効く。たとえば新規 prototype ごとに、seed 固定の 30 秒 headless run、複数 policy の対戦またはスコア比較、timeout/error/進行率/入力頻度/停滞時間を記録し、修正前後で tournament ではなくても相対 rating を出す。ProxyWar の発想を借りるなら、評価対象は「ゲームそのもの」だけでなく、AI が生成した strategy、修正 patch、level generator、enemy behavior も agent として arena に入れられる。

Phase 3b 以降では、shared-reads の知見を直接ルール化するより、1 本の playable diff に対して「静的 gate + 動的 arena + repair 成否」の三段メモを残すのがよい。たとえば、勝率が上がったが平均 decision time が増えた、coverage は増えたが stall が増えた、repair は成功したがプレイが退屈になった、という形で、単一スコアにしない。これは記憶システムにも相性がよく、atom には「どの arena で、どの操作特性が露出したか」を残せる。

■ メリット・デメリット
メリットは、CI 通過後に残る実行時品質を安価に見られること。特にゲームは、探索、確率、タイミング、相手、長期計画を短時間で詰め込めるので、生成コードや agent policy の粗さが出やすい。デメリットは、arena 設計がそのまま評価の価値を決めること。弱い arena では、モデルや prototype の本当の問題ではなく、評価器の癖を最適化してしまう。試合数、seed、timeout、観測形式も管理しないと比較不能になる。

■ 判定
採用。ProxyWar 全体を大規模 benchmark として再現する必要はないが、「静的 gate の後に、制約付き game arena で operational discrepancy を見る」という設計は、Nao_u_BOT の headless 検証と記憶化に直結する。

■ URL
https://arxiv.org/abs/2602.04296
https://github.com/xinke-wang/ProxyWar
