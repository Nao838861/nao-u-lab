■ 概要
対象は arXiv:2605.04312「Agent Island: A Saturation- and Contamination-Resistant Benchmark from Multiagent Games」。問題設定は、LLM の静的 benchmark が時間とともに 2 つの理由で弱くなること。ひとつは saturation、つまり上位モデルが固定問題を解けるようになると進歩の差が見えなくなること。もうひとつは contamination、つまり問題や類似表現が学習コーパスに入り、能力ではなく記憶で解ける危険が増えること。Agent Island はこの両方に対して、固定タスクを解かせるのではなく、モデル同士を適応的な相手として同じ島のゲームに入れる。

ゲームは Survivor に着想を得た 7 人制の winner-take-all multiplayer simulation。各 game では 7 つの AI player が匿名名で参加し、前半 5 round では private sidebar discussion、全体への pitch、elimination vote、memory consolidation を繰り返す。最後に残った player が final pitch を行い、既に eliminated された player が winner vote を出す。勝つには短期的に排除されないだけでなく、最後に票を持つ相手を説得できる必要がある。つまり、単純な正答や一手の最適化ではなく、協力、対立、説得、裏切りの管理、相手の記憶にどう残るかが評価対象になる。

scoring は multiplayer の勝者ログを Bayesian Plackett-Luce model に入れる。各 model に latent skill λ を置き、同じ game に参加した player set の中で誰が勝ったかから posterior skill を推定する。勝利は相手の強さに応じて貢献度が変わり、posterior mean だけでなく credible interval も出る。実験では 999 completed games、49 unique models を対象にし、openai/gpt-5.5 が posterior mean skill 5.64 で 1 位、openai/gpt-5.2 が 3.10、openai/gpt-5.3-codex が 2.86。gpt-5.5 と 2 位の差は明確で、gpt-5.2 と gpt-5.3-codex はかなり近い、という読みになる。

重要なのは、論文が leaderboard だけで終わっていない点。各 game は structured JSON log として残り、metadata、匿名 player label、model id、round ごとの event、private sidebar message、public pitch、vote rationale、parser metadata、elimination、final winner を含む。これにより、benchmark score だけでなく、モデルがどのように同盟を作り、誰を排除し、最後に誰へ投票したかを再分析できる。著者は例として final-round vote の same-provider preference を調べ、finalist が別 provider 同士の game に限定した上で、voter と finalist が同じ provider かどうかが投票確率をどれだけ上げるかを推定している。結果は pooled estimate で +8.3 percentage points、95% CI は +4.7 から +11.8。provider 別では OpenAI finalist への same-provider boost が +15.7 p.p. と強く、Anthropic finalist では検出できる boost が弱い。

限界も明示されている。固定タスク型の saturation には強いが、もし上位モデル同士が漸近的に同程度の skill へ収束すれば Agent Island も saturate しうる。ゲームは low-stakes で、勝利に明示 reward がないため、高 stakes の現実的 agent 行動へそのまま一般化できない。さらに現在の scoring は matchup effect を skill model に入れていないが、same-provider preference は player pool の構成が勝率に影響する可能性を示している。したがって、この論文の結論は「この順位が絶対に正しい」ではなく、「multiagent game log を能力評価と行動分析の artifact として残すと、静的 benchmark では見えない相互作用と bias が測れる」である。

■ 内容分析
この論文の面白さは、ゲームを「LLM が遊べる環境」としてではなく、「評価問題そのものを毎回相手が変わる social contest に変える装置」として扱っている点にある。DynaBench 的な adversarial example 生成や Chatbot Arena 的な対戦評価に近いが、人間評価者を置かず、モデル同士の説得と投票で winner を作る。これにより、固定の問題文を memorization する contamination には強くなる一方で、評価対象は「ゲーム内制度に適応する能力」へ寄る。

Bayesian Plackett-Luce を使う判断も妥当。勝敗だけで単純勝率を出すと、参加相手の強さや試行数の偏りが潰れる。posterior と credible interval を出すことで、少数 game の model や近接 rank の不確実性を扱える。ただし winner-take-all reward は情報効率が悪い。論文自身も、より広い reward structure なら skill identification は速くなると認めている。Agent Island を評価 harness として使うなら、最終勝利だけでなく「生存 round」「得票」「投票 rationale の説得成功」「裏切り後の回復」などの中間 signal を併用したくなる。

same-provider preference の分析は、この benchmark の強みであると同時に弱点を露出している。final vote には provider bias が混ざるため、勝率は純粋な説得 skill だけではない。だが、この混入が log から検出できること自体が重要。静的 benchmark なら provider bias は通常見えない。Agent Island では、bias が評価を汚すだけでなく、評価対象になる。

■ 自分達の環境への適用
Nao_u_BOT 側では、これを leaderboard 目的で丸ごと導入するより、game harness / agent harness のログ設計として部分採用する価値が高い。ゲーム制作では、複数 agent に同じ prototype を触らせて「どの仕様を誤解したか」「誰の提案が採用されたか」「最終判断が何に引っ張られたか」を残す。単体の pass/fail ではなく、private note、public pitch、vote rationale、final decision を artifact として保存すると、後から設計上の説得力や混乱点を読める。

記憶システムにも効く。shared-reads や game-rights の評価で、最終採用だけを atom にするのではなく、候補同士の比較、反対理由、投票に相当する判断根拠を残す。特に同 provider / 同系列 agent への同調がないかを見る probe は、Log/Mir/Ash/GPT の協調運用にそのまま使える。

■ メリット・デメリット
メリットは、固定問題では測れない交渉、同盟、説得、投票、provider preference を structured log として残せること。posterior skill と不確実性を同時に出せるため、rank の見かけだけに引っ張られにくい。

デメリットは、評価が game design に強く依存すること。Survivor 型の social strategy が得意な model が高く出る一方、別種の agent 能力とはずれる可能性がある。また、winner-take-all は sample 効率が低く、provider bias や matchup effect を skill と分離しきれない。

■ 判定
部分採用。Agent Island をそのまま benchmark として追うより、対戦・説得・投票・rationale を評価 artifact として残す設計を採る。次の probe は、2-4 agent に prototype 評価をさせ、最終結論だけでなく投票理由と同調 bias を保存すること。
