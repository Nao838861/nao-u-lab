■ 概要
Social Gym は、LLM の「社会的推論」を主観的な judge model に採点させず、ゲーム規則が確定する勝敗・得点・生存で測るための multi-agent 評価環境である。従来は、Theory of Mind の設問なら客観採点できても一問一答に閉じ、自由会話なら長期の交渉や欺瞞を扱えても LLM judge の位置・冗長性・自己贔屓 bias が入る。また、Werewolf や Diplomacy の単独研究では社会能力の一側面しか見えない。そこで著者らは、複数 turn、広い相互作用、rule-verifiable outcome を同時に満たす 21 種のゲームを一つの共通基盤に載せた。

ゲーム群は normal-form 6 種、economic 3 種、bluffing 4 種、hidden-role deduction 6 種、social strategy 2 種から成り、Prisoner's Dilemma から Werewolves、Resistance、Survivor までを含む。情報構造は完全情報・hidden state・hidden role、通信は無し・定型・自由会話にまたがる。共通の finite-state-machine engine が phase 遷移を管理し、message visibility を public、team-private、individual-private に分ける。各ゲームは state、available actions、visible messages、reward function の同一 interface を実装する。

評価では全 model の組合せを tournament にし、role と seat を均衡させる。17 種の競争ゲームは最終 score から異なる model 間の pairwise outcome を作り、L2 正則化した Bradley–Terry fit で rating を推定する。同得点 bucket や同一 team 内は除外する。協力ゲーム 4 種は win rate、hidden-role game は多数派・協力側の Elo-Main と少数派・欺瞞側の Elo-Alt も用いる。

7 model、各 model 560 episode 以上の総合結果では GPT-5-mini が 1110 Elo で首位、Qwen2.5-3B が 926 で最下位だった。しかし Qwen3-32B は Chicken で 1328 と首位なのに Werewolves では 817 と最下位で、単一 score は能力 profile を隠す。小型 model の parroting や role ごとの強さの反転も観察された。

SPaRTan（Self-Play and Reflect-Transfer）は、この episode log を重み更新なしで再利用する三段 loop である。まず model が自己対戦し、次に trajectory と role 別 outcome を読んで、欺瞞・検出・説得・情報管理・連合・timing を含む game-agnostic な一人称 playbook を書く。最後に、その文章を後続 episode の system prompt へ前置する。同一ゲームで R1〜R4 を反復する実験、1 ゲームから未見ゲーム、複数ゲームから held-out game、強い model から弱い model への distillation を比較した。

GPT-5-mini の弱い少数派側は 3 ゲーム平均 24% から R1 で 36%、R3 で 43% へ上がったが、R4 は 35% へ戻り、反復は単調改善しない。cross-game transfer も弱い側は中央値 +7 point、強い側は -7 point で、playbook は万能強化ではなく role imbalance を均す介入だった。複数 source は多くの target で単一 R1 を越えず、Resistance だけが 23% から 47% へ改善した。Resistance の弱い Spies 側への distillation は 6 student 中 3 model が +13〜+24 point、2 model は改善なしだった。

Qwen3-32B で再現すると、明瞭な改善は action が単純な Prisoner's Dilemma の 13%→58% が中心で、会話中心の 4 ゲームはほぼ横ばいだった。自分の parroting を reflection に書けても実行時には直せない。結論は、SPaRTan が一部の強い model・弱い role・単純な action channel では失敗 log を戦略へ変える一方、文章化だけでは能力不足を越えず、量を増やしても改善は累積しない、というものだ。

■ 内容分析
この研究で強いのは、「社会知能」を一つの曖昧な点数にせず、環境側の構造を測定器として設計した点である。FSM、可視範囲、合法 action、reward を model の自由文から切り離すことで、会話は豊かなまま outcome を deterministic にできる。role・seat を均衡し、協力ゲームを無理に Elo 化せず、非対称ゲームを側ごとに分けたため、「model が弱い」のか「その側が構造的に不利」なのかを切り分けられる。総合 Elo より per-game・per-role の反転が重要な成果である。

一方、SPaRTan の結果は自己反省一般への強い警告でもある。R を増やすほど良くなるわけではなく、複数ゲームの経験を束ねても情報が積み上がらない。playbook が強い側を悪化させることは、良い助言が context-free な規範ではなく、baseline の失敗分布に対する補正器だと示す。したがって「成功 episode を要約して恒久記憶に追加する」だけでは危険で、どの game、role、opponent、model、reflection round で有効だったかを scope として保持すべきである。

限界も大きい。各条件は原則 30 game で 95% CI は約 ±18 point と広い。同長 placebo playbook がなく、戦略内容と generic な prompt 変更の効果を完全には分離できない。Chameleon には ceiling effect があり、固定規則の synthetic game から信頼形成へ外挿できない。tool、retrieval、structured scratchpad も対象外で、欺瞞・説得・連合操作の強化には dual-use risk がある。

■ 自分達の環境への適用
第一の適用先は、対戦型 prototype の headless 評価 schema である。各 run に build hash、seed、game state、legal actions、agent ごとの observation、public/private message、role、seat、opponent、terminal outcome を保存する。勝率だけを集計せず、role-conditioned win rate、illegal-action rate、timeout、同語反復、情報漏洩、episode 長を並べる。総合 score が同じでも、特定 role の破綻や会話が進まない失敗を検出できる。

小さな probe は、2 role を持つ短い非対称ゲームを 30〜50 seed 回す。baseline の弱い側を確定し、失敗 trajectory から一度だけ playbook を生成する。注入、同長 placebo、無注入を両 role で比較する。gate は弱い側の改善だけでなく、強い側の悪化、illegal action、cost、seed 間分散も含める。R2 以降は前 round を上回った時だけ残す。

記憶には playbook 本文だけでなく、source trajectory IDs、game family、role、model、baseline、評価結果、失敗条件、有効期限を付ける。広い一般則へ昇格するのは別ゲーム・別 seed で再現した項目だけにする。効果が消えたものも superseded として残せば、「反省文は増えたが行動は変わらない」型の記憶汚染を追跡できる。

■ メリット・デメリット
メリットは、主観 judge を主要な勝敗判定から外し、会話を含む長い episode を再現可能に比較できること、role・seat・可視情報の交絡を明示できること、失敗 trajectory を重み更新なしの小さな介入へ戻せることにある。共通 interface は新しい game mechanic の評価を追加しやすく、playbook の適用前後を同じ runner で測れる。

デメリットは、rule outcome が面白さ、自然さ、長期的信頼を直接測らないこと、十分な episode 数と model API cost が要ること、単一 Elo が再び failure profile を隠すことだ。playbook は model capacity と role に強く依存し、反復や source 数の増加が悪化を招く。自由会話の改善を action-only game の成功から推定できず、欺瞞戦略を人間相手へ転用してはならない。

■ 判定
部分採用。Social Gym の 21 ゲーム全体や Elo leaderboard を移植するのではなく、FSM・visibility・legal action・rule outcome の共通 log、role/seat-balanced evaluation、per-role failure profile を headless test の設計原則として採る。SPaRTan は一回の scoped playbook と placebo を含む可逆 probe に限定し、再現した場合だけ candidate memory へ昇格する。反復 reflection と複数 playbook の自動統合は、改善が非単調で model 依存なため採用しない。

■ URL
https://arxiv.org/abs/2608.09128
