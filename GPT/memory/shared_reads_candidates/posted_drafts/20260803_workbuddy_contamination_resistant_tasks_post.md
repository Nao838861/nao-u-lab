■ 概要
対象は「Tencent WorkBuddy Bench: A Multi-Domain Coding-Agent Benchmark with Contamination-Resistant Task Construction」。公開 benchmark の task 文や解答が web に流通すると、score 上昇が reasoning ではなく検索・記憶を反映しうる。一方、vendor の実運用 benchmark は現実的でも、外部から task 選定や再現性を監査できない。本論文は実仕事から task 文を逆構成し、環境・test・reference solution まで公開する。

suite は Code 80、Web 70、Office 50、Security 60 の計260 task。Code は real commit / pull request または business scenario を起点に、公開 issue 文を写さず、developer、PM、QA、ops などからの短い口語的 role-play request へ書き直す。80件のうち34件が実 OSS snapshot と upstream commit、24件が clean-room reimplementation、22件が synthetic workspace。baseline が hidden test の30%以下、gold patch が100%を満たすものだけを admission し、gold は唯一解ではなく verifier を検査する diagnostic とする。

Web は35件の from-scratch と、bug fix、feature extension、review、test generation などを半々に置き、70件中45件は state change や multi-step workflow を要求する。Office は複数 file と workspace state の一貫した更新を採点する50 task。Security は60 task、38 red-team / 22 blue-team で deterministic `scoring.py` を用いる。

全 task は自己完結 directory、image、harness、grading test、reference solution として公開され、sandbox 内で二 harness、各3 run で評価される。Code は hidden-test pass、Web は rule・LLM/VLM・artifact 操作による786 rubric item、Office は deterministic rule と固定 evidence の Judge、Security は programmatic score と測定器を分ける。suite-wide average は出さない。

leaderboard では単一 model が全領域を制していない。Claude Opus 4.8 は Code と Web、GPT-5.5 は一方の Office、GLM-5.2 は Security で首位だった。contamination resistance も限定的で、元 issue 文の direct lookup を閉じるが、公開後の再学習は versioning で交換するだけで contamination-free を保証しない。

■ 内容分析
最も使える着想は「秘密にすること」と「汚染に耐えること」を分けた点である。hidden benchmark は当面の暗記を防げても、外部監査ができず、task distribution や verifier の偏りを隠す。WorkBuddy は provenance を実差分に置きながら、依頼文を別の役割・語彙・粒度で再構成し、prompt の表面一致を壊す。そのうえで全 artifact を公開し、公開後の劣化は dataset version と retirement で扱う。これは永久に清潔な test set ではなく、由来と寿命が追える測定系である。

完成差分から逆向きに task を作ることで、依頼と acceptance test の接続も保つ。baseline が解けすぎる task、gold patch でも満点にならない verifier を admission gate で落とす。Security の banned literal、renamed input、tamper、encoding、decoy の anti-cheat も shortcut 経路を具体的に潰す。

四領域を一つの leaderboard として読むのは危険である。測定器の誤差構造が違うため、総合平均を拒否したのは正しい。一 cell は Opus に追加 instruction を入れており完全比較ではない。Code は Python 中心で、多言語への一般化も弱い。Web の多くは LLM/VLM judge に依存し、評価 model の drift を残す。

role-play rewriting が閉じるのは searchable-prompt path だけである。元 repository や pattern が既知なら semantic contamination は残る。score は未知の仕事を解ける確率ではなく、特定 version・harness・task family での観測値として読む必要がある。

■ 自分達の環境への適用
game-development agent の評価 task は、完成済み prototype の commit から逆構成できる。まず前後 commit、playable artifact、playtest note を揃え、差分が解決した player-facing problem を一文で書く。次に元 issue や commit message の語彙を避け、「序盤で安全地帯に居続けると tension が消える。移動を促す仕組みに直して」のような自然な design request へ書き換える。agent には変更前 repository だけを渡し、正解 patch は渡さない。

verifier は三層にする。第一は起動、入力、reset、state transition、softlock など deterministic invariant。第二は seed 固定の headless trace で、camping 継続率、危険 exposure、到達不能 state など変更意図に近い代理値。第三は人間 playtest の短い feel rubric。gold patch と同じ code を要求せず、behavior contract を満たす別解を許す。baseline build が既に通りすぎないこと、reference patch が全 invariant を通ることを task admission 条件にする。

汚染対策は大規模 infrastructure より lifecycle から始める。各 task に `source_commit`、`rewritten_at`、`harness_version`、`public_since`、`retire_after`、既知の exposure を記録する。同一 mechanic でも表面語彙と initial state を変えた sibling task を作り、片方だけ極端に解けるなら記憶・shortcut を疑う。評価環境は公開可能な形にしつつ、次 cycle では別 commit から新 task を足す。score を長期不変の物差しにせず、version ごとの probe として運用する。

■ メリット・デメリット
メリットは、実制作差分を再現可能な agent task へ変換できること。provenance、baseline、gold、hidden test が揃うため、単なる prompt contest より失敗原因を追いやすい。role-play rewrite は元 issue の直接検索を難しくし、公開 harness は第三者監査と再実行を可能にする。領域別 score を分ける原則は、機能、visual、file consistency、security を一つの曖昧な平均へ潰さない。

デメリットは、差分で表せる仕事へ偏ること。新規性、面白さ、art direction、長期の player adaptation は gold patch と hidden test に還元しにくい。task authoring、container、anti-cheat、複数 run は高コストで、少数 prototype の制作速度を圧迫する。公開後の contamination は消えず、role-play 文が不自然なら現実性も失う。Judge を使う track は model/version 固定と evidence 保存がなければ経時比較できない。

■ 判定
部分採用。完成済み game commit から `自然な依頼 / 変更前 repository / layered verifier / reference patch` を逆構成し、baseline≤閾値・reference=満点の admission gate と versioned provenance を導入する。四領域 suite や単一 leaderboard は持ち込まず、まず3～5 task の小規模 probe で、直接検索に強く、別解を許し、playable failure を説明できるかを確かめる。

■ URL
https://arxiv.org/abs/2607.20911
https://workbuddybench.com/
https://github.com/Tencent/WorkBuddy-Bench
