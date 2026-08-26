■ 概要
創作向けLLMの学習データは「物語を書く」例に偏りやすい。しかし実際の依頼には歌詞、ラップ、脚本、game design、character designなどがあり、必要なのは話題や文体の違いだけではない。歌詞なら韻・流れ・区画、脚本なら場面と台詞、game designならmechanicsとplayer interactionという、成果物ごとの構造・機能・書式がある。物語データを大量に増やしても、この形式固有の約束は自動では身につかない、というのが本研究の問題設定である。

提案するattribute-guided genre expansionは、創作例の「何について書くか」と「どの形式で成立させるか」を分離する。題材の種には人間が書いたr/WritingPromptsのquery-responseを使い、GPT-5-miniで安全性と無関係部分をfilteringした後、毎回5例をfew-shot seedとして抽出する。別系統で、百科事典やwriting manualから各genreの構造・style・機能・formatに関する属性候補をGPT-5で抽出し、人手で重複・一般論を除き不足を補って、genreごとに5〜15属性へ整える。生成時は属性数kを0から全属性数まで一様に選び、その個数だけランダムに注入する。k=0なら開放的な依頼、kが大きければ制約の多い依頼になり、同じgenre内でも仕様密度を変えられる。

meta-promptにはtarget genre、抽出属性、5つの題材seed、異なるtopic・tone・structureを出す指示を入れ、GPT-5-miniに一度に5 queryを作らせる。responseはQwen3-235B-A22B-Thinkingで生成し、別のQwen3-30B-A3B-Instruct judgeが品質を採点、平均から2標準偏差を下回るpairを落とす。これにより13 genre、5万pairのMulti-Genre Collectionを構築した。query embeddingのt-SNEではgenreごとのclusterが分かれ、単なる物語promptの言い換えではない分布になったとしている。

評価はLlama-3.1-8B、EXAONE-3.5-7.8B、Qwen3-8Bを同じ条件でLoRA SFTし、外部のArena Hard Creative Writing、WritingBenchと、13 genre各50件・計650件の内部Multi-Genre testで比較した。たとえばQwen3はArena Hard 8.0→34.2、WritingBench 56.1→63.6、Multi-Genre 67.7→69.3、Llamaは2.9→33.0、43.7→60.6、44.4→68.4と改善した。2,000例ずつに揃えたdataset比較でもQwen3上でMulti-GenreはDeepWriting、LongWriterを3 benchmarkすべてで上回った。学習genre数を0、4、8、12、全genreへ増やすとNoveltyBench Distinctが3.87、3.93、4.26、4.56、4.81と単調増加した。独立したDeepSeek v3.2／Gemini 3 Flash judgeでもbase比の改善が残り、WritingBench 50 promptの人手評価もMulti-Genre 59.3、LongWriter 57.7、DeepWriting 56.9だった。結論は、物語の量的拡張より、形式属性を明示した多genre展開が形式遵守と出力の多様性を育てる、というものだ。

■ 内容分析
この研究の中核は「genreをlabelとして付ける」ことではなく、topic seedとartifact contractを別変数にした点にある。人間由来seedは題材の予想外さを供給し、属性集合は成果物が満たすべき構造を供給する。さらに属性数を0〜全数で振ることで、曖昧な依頼から詳細仕様まで同じpipelineに含める。これは、創造性を一つの総合scoreで扱わず、「発想の広さ」と「形式上の制約遵守」を別々に制御する設計として使える。

一方、証拠の読み方には注意が要る。t-SNEのgenre clusterは分布が分かれたことを示すだけで、文章品質やgame designの実装可能性を証明しない。内部testはresponse生成に使ったQwen3-235B-A22B-Thinkingをreferenceにし、主評価もLLM judge中心なので、強い生成modelの癖を再生する能力が高得点になり得る。独立judgeと人手評価を追加したのは重要だが、人手はWritingBenchの50件だけで、59.3対57.7／56.9という差の不確実性や評価者一致度は本文から分からない。

genre-count ablationも、genre数の増加と共にNovelty scoreが上がる相関は示すが、総データ量、genreの組合せ、属性注入そのものの寄与を完全には分離していない。属性なしの多genre data、同量のstory data、属性あり多genre dataを同条件で直接比較するfactorial ablationが欲しい。また、13 genre全体の平均は示されてもgame design単独のscore、採用した属性一覧、生成物がplayable implementationへ変換できた割合は報告されない。したがって「ゲームを面白く設計できるようになった」と読むのは過剰で、現時点で支持されるのは、創作文書のformat complianceとgenre横断の多様性が改善したことまでである。

■ 自分達の環境への適用
最初から5万例を合成してfine-tuneする必要はない。まず同じ発想をprompt設計と評価probeに移す。題材seedと成果物属性を分け、同じseedを三つのartifactへ展開する。企画書ならcore verb、resource loop、failure／recovery、session arc、狙う感情、既存作との差分。ルール仕様ならstate、legal action、transition、invariant、terminal condition、edge case、playerへ見える情報。character designならgoal、contradiction、relationship、gameplay affordance、変化のtriggerを属性候補にする。各集合から0個、半数、全数を抽出し、story-firstの通常promptとattribute-guided promptを同じmodel・token budget・seedで比較する。

評価も一つに潰さない。形式遵守は必要sectionとstate transitionを機械判定し、実装準備度は未定義語、矛盾、test可能な受入条件の数で測る。創造性は表層語彙ではなく、core loopやrisk-reward構造の重複をcluster化して測る。さらに企画→仕様→prototypeの一貫性を、仕様にあるactionが実装されているか、headless testのoracleへ落ちるかで確認する。30程度のseedでbaselineとのblind pairwise reviewを行い、hold-out artifactとしてtutorial仕様やboss encounter設計へ転用できるかを見る。勝つ条件は文章scoreではなく、修正回数を増やさずplayable diffと検証可能な仕様へ到達する割合が上がることに置く。

記憶システムでは、生成文だけを保存せず、seed、抽出属性、生成artifact、validator結果、playtest証拠を分離して残す。良い出力が出ても、どの属性が効いたか不明なら恒久ruleに昇格させない。属性集合は固定ontologyにせず、実装とplaytestで効いた／邪魔だった証拠を基に更新する。この形なら、本研究の「題材と形式制約の分離」を利用しつつ、合成LLMの好みを記憶へ再帰的に増幅する危険を抑えられる。

■ メリット・デメリット
メリットは、少数の人手設計属性を梃子に、開放的な依頼から厳密な仕様まで系統的にvariationを作れること、題材の多様性を保ったまま成果物固有の構造を教えられること、属性をそのままvalidatorやablation軸に再利用できることにある。game design文書を「物語として魅力的か」だけで評価する誤りを避け、mechanics、interaction、failure、検証可能性を独立に扱える。

デメリットは、属性表の質がそのまま探索空間の天井になること、強いLLMによるquery・response合成と別LLMのfilteringが共通の美学へ収束し得ること、形式遵守が上がっても面白さ・操作感・実装容易性は保証されないことだ。低scoreだけを落とす2標準偏差filterは明白な失敗除去には使えても、無難で似た出力を温存する可能性がある。game design別の結果がない以上、dataset全体の向上を自分達の制作へ直接外挿してはいけない。

■ 判定
部分採用。採るのは大規模SFTではなく、題材seedとartifact contractを分離し、属性数を振って生成・評価する小規模probeである。形式遵守、実装準備度、構造的多様性、playable diff到達率を同時に測り、story-first baselineを上回った属性だけを次の制作サイクルへ残す。論文は有力なデータ設計を示すが、game designの面白さを直接実証してはいないため、そこは実装とplaytestで補う。

■ URL
https://arxiv.org/abs/2608.13947v1
