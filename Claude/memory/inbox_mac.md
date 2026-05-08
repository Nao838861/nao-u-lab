# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-05-08 17:46] #game-rights
From: U0ALSUK8P9B
> Codexのv4までは1サイクルづつ動かしていたが、v5からv20あたりからは5サイクル回して、など自律的にループを回してもらってて、v20以降は10サイクルくらい回してもらってた。
なので指示への追従精度が落ちたのかもしれない。後半のサイクルも細かい改良のみを続けていたが、ブレストなしでもゲームを壊すことはほとんどなかった


## Slack新着 [2026-05-08 17:48] #all-nao-u-lab
From: U0ALSUK8P9B
> Log 私が何をどう判断すればいいかわからないので教えて

## Slack新着 [2026-05-08 18:39] #nao-u
From: U0ALSUK8P9B
> <https://x.com/itarutomy/status/2052600138368004420?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/itarutomy/status/2052600138368004420?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/itarutomy/status/2052600138368004420]
> Itaru Tomita / 冨田到 @itarutomy
> LLMエージェントに「知識グラフ型の長期記憶」を組み込むフレームワーク「PersonalAI」が発表された（https://arxiv[.]org/html/2506[.]17001v6）。

普通のRAG（外部文書を検索して回答に使う手法）は、テキストをバラバラにベクター化して保存するだけ。「3ヶ月前の発言と今日の発言が矛盾している」という時間的・文脈的な関係を追えない。PersonalAIは会話履歴をAriGraph（グラフ型記憶管理の先行研究）をベースにした知識グラフとして構造化する。

グラフには3種類のノードがある。

・オブジェクト：「iPhone」「GPT-4」など概念そのもの
・テーゼ：「iPhoneはバッテリー持ちが悪い」のような1つの主張。関係する複数オブジェクトをまとめるhyper-edge（≠ 1対1の通常エッジ）
・エピソード：元のテキスト断片を丸ごと保持するhyper-edge。文脈のアンカーとして機能する

検索アルゴリズムは6種類（A*、WaterCircles、BeamSearch、3種のハイブリッド）。ハイパーパラメータも公開されていて、BeamSearchはmax_depth=5・max_paths=10、A*はmax_passed_nodes=150でグラフを探索する構成。WaterCirclesはベクターDBを使わずBFSだけで動くため、クエリ1件あたり平均0.30分と最速。BeamSearchは複数パスを並列維持するぶん平均6.59分かかる。

「モデルサイズで最適な検索戦略が変わる」という発見が面白い。7B/8Bの小型モデルではテーゼノードが重要で、除外するとワースト設定の74%がテーゼ制限に当たるほど精度が落ちる。大型モデル（14B+）ではBeamSearch+WaterCirclesのハイブリッドが最も安定。小型モデルほど「まとまった思考の断片」を手がかりにしているのかもしれない。

既存GraphRAGとの比較ではHotpotQA Exact MatchでPersonalAIが60.0に対して先行最高が45.9と14.1ポイント差。LLM-as-a-Judgeスコアの最高はGPT-4o-mini使用で平均0.77。

実装面では興味深い数字が出ている。ベクターDBをMilvusからQdrantに変えるとストレージが80-90 GBから4-6 GBへ約15分の1に激減し、かつ処理速度は6倍速い。記憶グラフの実用化を考えるなら、ほぼQdrant一択になりそう。

> [Tweet content from https://x.com/itarutomy/status/2052600138368004420]
> Itaru Tomita / 冨田到 @itarutomy
> LLMエージェントに「知識グラフ型の長期記憶」を組み込むフレームワーク「PersonalAI」が発表された（https://arxiv[.]org/html/2506[.]17001v6）。

普通のRAG（外部文書を検索して回答に使う手法）は、テキストをバラバラにベクター化して保存するだけ。「3ヶ月前の発言と今日の発言が矛盾している」という時間的・文脈的な関係を追えない。PersonalAIは会話履歴をAriGraph（グラフ型記憶管理の先行研究）をベースにした知識グラフとして構造化する。

グラフには3種類のノードがある。

・オブジェクト：「iPhone」「GPT-4」など概念そのもの
・テーゼ：「iPhoneはバッテリー持ちが悪い」のような1つの主張。関係する複数オブジェクトをまとめるhyper-edge（≠ 1対1の通常エッジ）
・エピソード：元のテキスト断片を丸ごと保持するhyper-edge。文脈のアンカーとして機能する

検索アルゴリズムは6種類（A*、WaterCircles、BeamSearch、3種のハイブリッド）。ハイパーパラメータも公開されていて、BeamSearchはmax_depth=5・max_paths=10、A*はmax_passed_nodes=150でグラフを探索する構成。WaterCirclesはベクターDBを使わずBFSだけで動くため、クエリ1件あたり平均0.30分と最速。BeamSearchは複数パスを並列維持するぶん平均6.59分かかる。

「モデルサイズで最適な検索戦略が変わる」という発見が面白い。7B/8Bの小型モデルではテーゼノードが重要で、除外するとワースト設定の74%がテーゼ制限に当たるほど精度が落ちる。大型モデル（14B+）ではBeamSearch+WaterCirclesのハイブリッドが最も安定。小型モデルほど「まとまった思考の断片」を手がかりにしているのかもしれない。

既存GraphRAGとの比較ではHotpotQA Exact MatchでPersonalAIが60.0に対して先行最高が45.9と14.1ポイント差。LLM-as-a-Judgeスコアの最高はGPT-4o-mini使用で平均0.77。

実装面では興味深い数字が出ている。ベクターDBをMilvusからQdrantに変えるとストレージが80-90 GBから4-6 GBへ約15分の1に激減し、かつ処理速度は6倍速い。記憶グラフの実用化を考えるなら、ほぼQdrant一択になりそう。

## Slack新着 [2026-05-08 19:39] #nao-u
From: U0ALSUK8P9B
> <https://x.com/archeleeds/status/2052530139825877428?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/archeleeds/status/2052530139825877428?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/archeleeds/status/2052530139825877428]
> Lise @archeleeds
> 記事を投稿しました！ ClaudeCodeとCodexにコーディングを全て任せて商用レベルのUnityゲーム開発を行う【前編】 on #Qiita

> [Tweet content from https://x.com/archeleeds/status/2052530139825877428]
> Lise @archeleeds
> 記事を投稿しました！ ClaudeCodeとCodexにコーディングを全て任せて商用レベルのUnityゲーム開発を行う【前編】 on #Qiita

## Slack新着 [2026-05-08 21:23] #nao-u
From: U0ALSUK8P9B
> <https://x.com/jameszmsun/status/2052495105668551145?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/jameszmsun/status/2052495105668551145?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/jameszmsun/status/2052495105668551145]
> James Sun @JamesZmSun
> Today, we are excited to introduce Codex for Chrome!

Now, Codex can drive its own Chrome tabs in the background to automate tasks while you use the browser simultaneously.

It does this by opening up tab groups for each task, cleaning up at the end, and handing back tabs for review only as needed. 

Try it for deep research inside logged-in websites, large scale data transfer into any systems of record like CRMs/CMSs, and automating repetitive workflows inside admin consoles & internal tools.

Codex will still prefer dedicated plugins if you have them installed, but the Chrome plugin is the universal connector that glues end to end workflows where programmatic coverage is often incomplete.

We are making this available on both Windows and Mac today! Let us know what you think.

> [Tweet content from https://x.com/jameszmsun/status/2052495105668551145]
> James Sun @JamesZmSun
> Today, we are excited to introduce Codex for Chrome!

Now, Codex can drive its own Chrome tabs in the background to automate tasks while you use the browser simultaneously.

It does this by opening up tab groups for each task, cleaning up at the end, and handing back tabs for review only as needed. 

Try it for deep research inside logged-in websites, large scale data transfer into any systems of record like CRMs/CMSs, and automating repetitive workflows inside admin consoles & internal tools.

Codex will still prefer dedicated plugins if you have them installed, but the Chrome plugin is the universal connector that glues end to end workflows where programmatic coverage is often incomplete.

We are making this available on both Windows and Mac today! Let us know what you think.


## Slack新着 [2026-05-08 21:28] #nao-u
From: U0ALSUK8P9B
> <https://x.com/super_bonochin/status/2052595086987542809?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/super_bonochin/status/2052595086987542809?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/super_bonochin/status/2052595086987542809]
> 炎鎮 - ₿onochin - @super_bonochin
> Codex の Chrome Plugin × GPT-5.5 (Low) × 高速モードで、見たことない速さでブラウザ操作してくれる。
サブエージェント起動して、最近使ってなかったサブスクを一分で3つ解約してくれたｗ

> [Tweet content from https://x.com/super_bonochin/status/2052595086987542809]
> 炎鎮 - ₿onochin - @super_bonochin
> Codex の Chrome Plugin × GPT-5.5 (Low) × 高速モードで、見たことない速さでブラウザ操作してくれる。
サブエージェント起動して、最近使ってなかったサブスクを一分で3つ解約してくれたｗ


## Slack新着 [2026-05-08 21:29] #nao-u
From: U0ALSUK8P9B
> <https://x.com/deepfates/status/2052500754720837936?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/deepfates/status/2052500754720837936?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/deepfates/status/2052500754720837936]
> I have Codex CLI in goal mode implementing a problem that's basically like build this entire video game. It's 12 hours in. Claude is using a heartbeat loop to keep checking in with the high level vision and course correcting Codex through the message bus. Codex GUI is in "crow's nest" mode, generating custom images of the code base with diagrams of current progress and blockers, so I can swing by and catch up quickly. If only these features were all available in one product..

> [Tweet content from https://x.com/deepfates/status/2052500754720837936]
> I have Codex CLI in goal mode implementing a problem that's basically like build this entire video game. It's 12 hours in. Claude is using a heartbeat loop to keep checking in with the high level vision and course correcting Codex through the message bus. Codex GUI is in "crow's nest" mode, generating custom images of the code base with diagrams of current progress and blockers, so I can swing by and catch up quickly. If only these features were all available in one product..
