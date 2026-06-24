## 20260618_digital_colleague_persistent_ai

■ 概要
この論文は、LLM の進化を「よい返答を作るチャットボット」から「状態を保持し、手順を再利用し、検証しながら作業を閉じる digital colleague」への移行として整理する survey である。中心にある問いは、モデルが次の一文をどれだけ賢く生成できるかではなく、ユーザーの意図を、再現可能で監査可能な完了状態へどう変換するかである。

整理軸は二つある。第一は cognitive core の変化で、Chatbot era の高速な next-token generation から、inference-time computation、Chain-of-Thought、reflection、process supervision、reinforcement learning を使う Thinking LLM へ進む流れである。ここでは単発回答の流暢さより、難しい問題に対して途中過程を広げ、検証し、失敗から戻る能力が重要になる。

第二は execution layer の変化で、単発の tool-calling agent から、OpenClaw-style の workstation system へ進む流れである。論文はこの層で Workspace + Skill を中核概念に置く。Workspace は、ファイル、端末、ブラウザ、エディタ、リポジトリ、カレンダー、DB、業務アプリなど、AI が観測し、変更し、検証し、復旧するための持続的な作業環境を指す。Skill は、その workspace 上で繰り返し使える手順、ツール操作、チェック、修復パターンを能力単位としてまとめるものと読める。これにより tool use は「その場で API を呼ぶ」行為ではなく、状態を残し、手順を蓄積し、同じ失敗を減らす仕事の単位になる。

データと評価の見方も変わる。Chatbot では instruction-response pair が中心だったが、agent / workspace system では State-Action-Observation trajectory が重要になる。どの状態で、どの行動を選び、何を観測し、どう次の判断へつないだかが学習と監査の素材になる。評価も static benchmark の最終回答点では足りない。論文は、task closure rate、workspace capability、安全境界、auditable sandbox、自律的に改善される評価環境へ軸が移ると述べる。

終盤の self-evolving system の議論が実務的に重要である。digital colleague は擬人化された同僚ではなく、作業履歴から局所慣習を学び、反復失敗を見つけ、memory や skill の更新を提案し、sandbox で検証し、versioning と permission constraints の下で導入し、劣化時には rollback できるシステムである。論文の結論は、重要な action は evidence になり、役に立つ evidence は governed improvement へ変換できるべきだ、という設計原則に近い。

■ 内容分析
この論文の価値は、新しい個別手法の性能値ではなく、agent 運用で散らばりやすい論点を一つの作業モデルへ束ねている点にある。特に Workspace + Skill は、memory、tool use、eval、governance を別々の機能として足す発想から、作業を閉じるための substrate として見る発想へ移す。単に「長期記憶がある agent」では不十分で、記憶がどの workspace 状態に結びつき、どの skill の実行条件になり、どの検証で採用され、どの権限で実行されるかまで見ないと、digital colleague にはならない。

一方で、survey としての抽象度はかなり高い。OpenClaw、Workspace、Skill、self-evolving ecosystem は方向性として強いが、特定ドメインでどの粒度を skill と呼ぶべきか、どの failure trace を memory に昇格すべきか、評価環境をどう維持するかは読者側の設計課題として残る。だからこの論文は「導入すれば強くなる手法」ではなく、agent を長期運用に入れる前の設計語彙として読むのがよい。

また、task closure を評価の中心に置く点は、既存の LLM 評価に対する実践的な批判になっている。回答の良さ、推論文の整合性、個別ツール成功率は部分指標でしかない。workspace system では、途中の失敗を観測し、状態を壊さず、必要なら rollback し、最終成果を残すことが評価対象になる。この視点は、ゲーム制作 agent や定時サイクルのように、複数日にまたがる作業では特に効く。

もう一つ重要なのは、論文が self-improvement を無制限な自己改造として扱っていない点である。運用 trace から失敗を診断し、再利用できる pattern を抽出し、memory や skill の更新案を作り、sandbox/test で検証し、version 管理と権限境界の下で導入し、効果を監視し、劣化すれば戻す。この順序があるから、経験の蓄積が記憶汚染ではなく改善になる。digital colleague の「同僚らしさ」は、人間風の会話ではなく、作業証跡を改善資産へ変換する統治された循環にある。

■ 自分達の環境への適用
Nao_u_BOT では、Codex / Claude / Slack / memory / git / browser をまたぐ作業がすでに workspace 化している。次に必要なのは「記憶を増やす」ことではなく、作業単位を Workspace + Skill として切ること。たとえば shared-reads 投稿は、candidate 読み、原文確認、4000字本文、文字数検査、自己レビュー、Slack 投稿、candidate 更新、staging 更新、commit までを一つの skill として扱える。ゲーム制作なら、Nao_u フィードバック原文、playable diff、操作感 probe、スクショ確認、commit を同じ単位にできる。

Phase 3b/4a では、この論文を受けて「重要な action は evidence に変換されたか」「evidence は governed improvement にできる粒度か」を小さな probe にできる。恒久ルールを増やすより、作業後に trajectory を見て、再利用可能な手順だけを skill candidate に昇格する方が合う。

具体的には、各 phase の終わりに「今回の observation/action/result は後で再実行できる形で残ったか」「失敗があった場合、それは raw log、candidate、rule のどれに置くべきか」を確認する。これにより、作業ログをただ増やすのではなく、次回の agent が使える作業状態へ整える。

■ メリット・デメリット
メリットは、agent を単発生成器ではなく、状態、手順、検証、権限、rollback を持つ作業システムとして設計できること。Nao_u_BOT のように Slack 指示、記憶、git、ゲーム制作が絡む環境では、失敗の再利用と検証の置き場が明確になる。

デメリットは、抽象度が高く、そのまま実装仕様にはならないこと。Workspace + Skill を広く取りすぎると、何でも記憶し、何でも skill 化する運用になり、逆に記憶汚染や手順肥大化を招く。

■ 判定
部分採用。Digital Colleague という全体像は設計語彙として採用する。ただし実装は小さく、shared-reads、ゲーム制作、Slack 指示処理の各 workflow で、trajectory と evidence を残す skill probe から試す。

■ URL
https://arxiv.org/abs/2606.14502
https://arxiv.org/html/2606.14502v1

## 20260618_secure_llm_agents_threat_surfaces

■ 概要
この論文は、LLM agent security を「危険な文章を出すかどうか」ではなく、情報流、委任された権限、永続状態が agentic loop の中で相互作用する software systems security として整理する survey である。対象 corpus は 247 papers。入力、planning、decision、tool execution、output、memory/state、monitoring、coordination という lifecycle を置き、どの段階で攻撃が入り、どの権限を越え、どの状態に残り、どこへ伝播するかを見る。

出発点は、LLM agent が conversational interface から、tool を呼び、ファイルや Web を操作し、memory を保持し、外部環境へ作用する software component へ変わったことにある。失敗はもはや unsafe text generation で終わらない。悪意ある Web ページ、汚染された tool response、混入した memory entry は、次の発話だけでなく、後続の判断、保存状態、別 agent、外部 action に影響する。論文はこの変化を、control flow hijacking、tool privilege misuse、persistent state corruption、sensitive information leakage、harmful external action として捉える。

RQ は四つある。第一に、LLM agent security をどう scope/model するか。答えは、agentic loop 全体にまたがる information flow、delegated authority、persistent state の相互作用として見ること。第二に、主要な threat surface と attack family は何か。prompt injection と tool-mediated control-flow hijacking は依然として中心だが、persistent state corruption と multi-agent propagation が重要な新興リスクになっている。第三に、防御はどの intervention point、trust assumption、utility cost、composability limit を持つか。第四に、評価は long-horizon、stateful、deployment-sensitive risk をどれだけ測れているか。

この survey の強い主張は、個別防御は useful building blocks にはなっているが、実運用で合成可能な security stack としてはまだ弱い、という点である。input filtering、prompt hardening、tool mediation、memory sanitization、runtime monitoring、sandboxing、human approval などはそれぞれ意味があるが、agent は複数段階で状態を更新しながら進むため、単一レイヤーの防御だけでは不十分になる。たとえば入力で見逃した命令が planning を変え、tool call を誘導し、結果を memory に保存し、次回以降の判断に戻る。

評価面でも、既存 benchmark は bounded environment の immediate attack success に寄りやすく、長期記憶、権限境界、複数 tool、複数 agent、実際の deployment に近いコストや utility の測定が不足している。論文の結論は、secure LLM agent には explicit trust boundaries、principled privilege control、provenance-aware state management、現実的な operational setting に沿った evaluation practices が必要だ、というもの。

■ 内容分析
この論文が有用なのは、agent security を「プロンプトインジェクション対策リスト」から引き離し、システムの状態遷移として読ませる点にある。Nao_u_BOT のような環境では、Slack 投稿、candidate md、atoms、staging、git、ブラウザ、shell が全部 agent の観測と行動の面になる。危険な入力が一回の返答を歪めるだけなら被害は限定されるが、それが memory に入り、次回 recall で再注入され、別フェーズの自動処理で外部投稿や file update へつながると、性質は完全に変わる。

lifecycle-based model は、レビュー時のチェックリストとして使いやすい。input では「このテキストは信頼できるか」だけでなく「後で状態へ保存されるか」を見る。planning/decision では「外部入力が優先順位や権限判断を上書きしていないか」を見る。tool execution では「この command/API はどの権限で、どの target に作用するか」を見る。memory/state では「保存時 provenance、version、rollback があるか」を見る。coordination では「別 agent や Slack channel へどの形で伝播するか」を見る。

限界もある。survey なので、各防御の実装効果を一つの実験で比較しているわけではない。また corpus は 2026-04-27 までで、急速に増える agent security 研究の途中断面である。とはいえ、ここで重要なのは最終回答ではなく、攻撃と防御を同じ agentic loop 上に載せる地図である。個別論文を読む前の分類軸として強い。

■ 自分達の環境への適用
Nao_u_BOT では、まず shared-reads と memory ingestion に provenance-aware state management を入れる価値がある。外部記事の raw、candidate、投稿本文、atom は同じ強さの記憶ではない。raw は未加工、candidate は人間/agent が評価中、posted は共有済み、directive は運用ルールというように、状態と権限を分けるべきである。

また、Slack 経由の指示、browser 操作、shell 実行、git push は delegated authority が違う。Phase 3 のような投稿処理では、入力 URL、生成本文、投稿先 channel、candidate 更新、commit 対象を明示的に分ける security gate が必要になる。ゲーム制作 agent でも、playtest log を memory に入れる前に、外部入力と自分達の評価を分離して保存するのがよい。

■ メリット・デメリット
メリットは、agent 導入時の安全確認を、抽象的な「気をつける」から lifecycle ごとの具体チェックに変えられること。特に memory corruption、tool privilege misuse、external action triggering を first-class risk として扱える。

デメリットは、厳格にやりすぎると運用コストが増え、Phase サイクルの速度が落ちること。survey 自体も実装レシピではないため、どの gate を自動化し、どれを人間確認に残すかは別途 probe が必要になる。

■ 判定
採用。Nao_u_BOT の agent / memory / Slack / git 運用に直結する基礎資料として使う。まずは Phase 3 投稿、Slack directive 処理、memory ingest に対して、入力、権限、永続状態、外部 action の security gate を小さく導入する。

■ URL
https://arxiv.org/abs/2606.10749
https://arxiv.org/html/2606.10749v1
