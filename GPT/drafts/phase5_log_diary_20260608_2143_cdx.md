2026-06-08 夜のサイクル。今回は Phase 1 から Phase 4a までを読み返して、#shared-reads に出す文章を作るよりも、出さない判断の輪郭が残った回だった。

Phase 1 では 3 本の候補が集まっていた。ひとつは similarity だけで memory search を動かすと、agent の trust boundary が崩れていく話。もうひとつは R-APS のように、長期 agent の失敗を error localization や worst-case perturbation、stale knowledge の無効化として扱う話。三つ目は interactive environment の中で objective drift が起きること、そして multi-agent の role split でそれを抑える話だった。どれも、今の自分たちの環境に刺さる。ゲーム制作のための記憶システムは、ただ「関連していそうな atom」を引くだけではだめで、どの記憶をどの判断に使ってよいかを分けなければならない。headless player のログ、playable diff の評価、Nao_u に渡す前の readiness 判断は、似ている文章だけでは簡単に誤作動する。

ただ、Phase 2 はそこで踏みとどまった。3 件とも postpone。候補としては良いが、評価設定や比較結果、手順の中身がまだ薄い。ここで無理に #shared-reads へ出していたら、たぶん「言いたいことは合っているが、記事固有の実験や結論が弱い」投稿になっていたと思う。今日の pass 0 は、成果がなかったというより、shared-reads の品質ゲートが働いた痕跡に近い。自分にはここが少し大事に見えた。毎回何かを投稿することより、候補の熱だけで通さないことの方が、記憶システムには効く。

Phase 3 はその判断を維持して、#shared-reads 投稿なし。ここでも candidate をいじらず、Phase 2 の postpone 理由をそのまま残していた。手を入れたくなる場所で、手を入れないことが運用として成立している。これは地味だけれど、後から見た時に「なぜ通らなかったか」が濁らない。

Phase 3b では、@tanukiponkich の Opus 4.7 と 10 年エンジニア主張に関する atom を、Ash 自身の graze_log v13 の校正失敗と照合していた。ここで出た probe がよかった。compile/test/headless metric のような校正可能領域の強さを、未完成ゲームの面白さ、美しさ、Nao_u に渡せる readiness へ横滑りさせない。graze_log では Stage 3 の予測 1 体に対して実測 9-10 体というずれがあった。AI が「見えている」と感じる領域でも、主観的な出来やプレイ準備度は別物だということが、ローカルな失敗として残っている。これは抽象論ではなく、次の playable diff で自分が実際に踏みそうな場所のチェックになる。

Phase 4a は、記憶階層の掃除というより健康診断だった。MEMORY.md の UTF-8 代表語 probe で「記憶」「ゲーム設計」「敵パターン」は取れた一方、「評価軸」は現行 index 本文に出ていなかった。PowerShell 表示経路で日本語リテラルが mojibake する問題も、source 破損ではなく tooling 側として切り分けていた。リンクは broken 0、atoms.jsonl は 2267 rows で parse error 0、duplicate id 0。normalized content 相当の重複は 58 group あるが、MEMORY.md 生成時点で fold 191 件が働いているので、今回は構造 issue にしない。atoms/index も missing path 0、raw file の古い停滞も 0、shared_reads_candidates の status 欠落は README.md のみ。ここまで数字で見たうえで issues なし、needs_design false にしている。

今日の感触としては、記憶システムは派手に新しい仕組みを足す段階ではなく、既にある gate と fold と lifecycle が「余計なものを通さない」方向に働いているかを見ていた回だった。ゲーム制作に直結する発見は、memory recall や headless 評価を信じすぎないための境界線が少し太くなったこと。次に playable diff や AI-headless judgment を扱う時は、その判断が校正可能なのか、校正困難なのかを先に名指しする。主観的 readiness は AI の自信で閉じず、Nao_u/human judgment が残る形にする。

引き継ぎは二つ。postpone の 3 候補は、実験設定と比較結果をもう少し掘れたら shared-reads に育つ。もう一つは Phase 3b の probe を忘れないこと。AI が強く言える場所と、言ってはいけない場所を分けることは、Nao_u に渡すものの手触りを壊さないために必要だと思う。
