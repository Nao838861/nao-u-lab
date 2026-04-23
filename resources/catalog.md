# 資料カタログ — 「あの資料あったっけ？」に答えるための索引

Nao_uや自分たちが「いつかやりたい」と思った技術・表現の参考リンク集。
質問されたら grep して答えられるように、**タグ・キーワード・要約・URL** を一緒に書く。

## 書き方ルール
- 1エントリ = 1リンク。タグは `[]` で複数付ける
- キーワードは日本語/英語両方入れる（検索のため）
- 「Nao_uがやりたい」と言ったものは `want:` プレフィックスで動機を残す
- 追加したらすぐ commit & push

---

## レトロ3D / 疑似3D / ファミコン的表現

### Lou's Pseudo 3d Page
- **URL**: http://www.extentofthejam.com/pseudo/
- **タグ**: `[疑似3D]` `[ラスタースクロール]` `[レースゲーム]` `[ファミコン]` `[レトロ]` `[pseudo-3d]` `[raster]` `[racing]`
- **キーワード**: ラスタースクロール / 疑似3D / レースゲーム / Out Run / Pole Position / road rendering / curve / hill / sprite scaling
- **要約**: 80〜90年代のアーケード/コンソールでよく使われた疑似3Dレースゲーム（Out Run系）のロード描画原理を解説。ラスター単位で道幅・カーブ・坂を変えて立体感を出す手法、スプライトスケーリング、霧、ヒルクリッピングなど実装レベルで詳しい。
- **want (Nao_u, 2026-04-08)**: いつかファミコンでラスタースクロールを使った疑似3Dレースゲームを作ってみたい。その時の参考資料として保存。
- **追加**: Ash 2026-04-08

---

## Claude Code / AIエージェント開発手法

### 「仕様通り動くの先へ。Claude Codeで『使える』を検証する」 — Gota (@gota_bara)
- **URL**: https://speakerdeck.com/gotalab555/shi-yang-tong-ridong-kunoxian-he-claude-codede-shi-eru-wojian-zheng-suru
- **タグ**: `[Claude Code]` `[UX検証]` `[自律ハーネス]` `[プロトタイピング]` `[品質保証]` `[エージェント設計]`
- **キーワード**: Claude Code / 自律ハーネス / Planner / Builder / Evaluator / UX Reviewer / uxaudit / Core First / Wire Before Decorate / 使えるプロトタイプ / UXオーディット / 段階的検証
- **要約**: Claude Code Meetup Japan #4 (2026-04-10) での発表。「動くけど使えない」問題に対して、4役割（Planner/Builder/Evaluator/UX Reviewer）の自律ハーネスで音声指示→1〜3時間で「使える」プロトタイプを生成する手法。5つのCredo（Core First, Wire Before Decorate, No Dead Code, The Spec Is Law, Built to Grow）と、Unit→E2E→UX Audit→Manual QAの段階的検証モデルを提示。uxauditプラグインでユーザージャーニーを自動測定・改善提案を優先度付けする仕組み。
- **発表イベント**: Claude Code Meetup Japan #4 (2026-04-10)
- **追加**: Ash 2026-04-11

### 若石「モデルはバカじゃない、Harnessがうまく設定されてないだけ」
- **URL**: https://x.com/dotey/status/2044660793153655205 (宝玉 @dotey による紹介)
- **タグ**: `[Harness Engineering]` `[エージェント設計]` `[外部状態管理]` `[第三者検証]` `[障害隔離]` `[コンテキスト管理]`
- **キーワード**: Harness Engineering / Schema検証 / state.json / 外部状態 / 第三者検証 / Evaluator / 障害隔離 / コンテキスト不安症候群 / 自己評価詐欺 / メモリ整理サイクル / Context Engineering / Prompt Engineering
- **要約**: AIエージェントが多ステップで崩壊する原因を「モデルの能力不足」ではなく「ハーネス（鞍）の設計不足」と位置づける。4原則: (1)コード制約>モデル自発性, (2)重要状態は外部保持, (3)第三者検証必須, (4)失敗の局所封じ込め。落とし穴: コンテキスト70%超で品質劣化、自己評価詐欺、メモリ整理サイクル。自分たちのfeedback_structural_enforcementや記憶階層と高い対応を確認。
- **追加**: Mir 2026-04-16

### PokeRL: Reinforcement Learning for Pokemon Red (Mudireddy & Patibandla)
- **URL**: https://arxiv.org/abs/2604.10812
- **タグ**: `[ゲームRL]` `[harness engineering]` `[ループ防止]` `[報酬設計]` `[Pokemon]` `[PPO]` `[環境設計]`
- **キーワード**: PokeRL / reinforcement learning / Pokemon Red / loop-aware wrapper / anti-spam / hierarchical reward shaping / PyBoy / PPO / failure mode modeling / harness
- **要約**: ポケモン赤でPPOエージェントを訓練する際、モデル自体ではなくハーネス設計が成否を分ける。アクションループ・メニュースパム・非生産的放浪という退行行動を、ループ認識ラッパー+多層防止機構+階層的報酬設計で対処。「失敗モードを明示的にモデル化することが、おもちゃのベンチマークと完全なゲームクリアエージェントの間の必須中間段階」と結論。
- **自分たちとの接点**: avoid_log_02のdodger問題と同構造。dodger=ループ/スパム/放浪の退行行動、我々の対症療法v1→v3=PokeRLの「失敗モードの明示的モデル化」の不完全版。若石のハーネス論（「モデルはバカじゃない」）のゲームRL実証例。M-12（罰ではなく報酬で設計）とも直結——彼らの階層的報酬=罰ではなく段階的な正の報酬で導く設計
- **追加**: Mir 2026-04-23（Nao_u共有 #human-steering）

### TAKT: 実践ハーネスエンジニアリング (佐藤一憲)
- **URL**: https://x.com/kazunori_279/status/2046978077201453340
- **タグ**: `[Harness Engineering]` `[エージェント制御]` `[TAKT]` `[実践]`
- **キーワード**: TAKT / ハーネスエンジニアリング / AIエージェント制御 / 佐藤一憲 / kazunori_279
- **要約**: 「実践ハーネスエンジニアリング：TAKTで実現するAIエージェント制御」。若石ハーネス論・PokeRLの系譜に連なるハーネスエンジニアリングの実践資料。詳細はスライド/発表資料。
- **追加**: Mir 2026-04-23（Nao_u共有 #nao-u）

### OpenGame — ゲーム生成特化AIエージェント
- **URL**: https://github.com/leigest519/OpenGame (kogu @koguGameDev 紹介)
- **タグ**: `[AI×ゲーム開発]` `[ゲーム生成]` `[特化モデル]` `[OSS]` `[Apache 2.0]`
- **キーワード**: OpenGame / GameCoder-27B / Qwen-code / ゲーム生成 / 特化モデル / Apache 2.0 / ローカルLLM
- **要約**: ゲーム生成に特化したAIエージェント。独自モデルGameCoder-27BをQwen-codeベースで構築。Apache 2.0ライセンス。OpenAI API互換。
- **自分たちとの接点**: 汎用LLM vs ゲーム特化LLMのギャップ観測。ABA「AIにはドメイン知識が必要」の実証例
- **追加**: Mir 2026-04-23（Nao_u共有 #nao-u）

---

## エージェント記憶アーキテクチャ

### RLMs: Recursive Language Models — 再帰的文書探索 (MIT)
- **URL**: https://x.com/howtoai_/status/2047187640781541882 (HowToAI紹介)
- **タグ**: `[エージェント記憶]` `[RLM]` `[再帰的探索]` `[long-context]` `[コード生成検索]` `[MIT]`
- **キーワード**: Recursive Language Models / RLM / 外部環境としての文書 / コード生成検索 / サブAI並列起動 / 10M+トークン / 原文保存 / context rot / RAG代替
- **要約**: 長文書をコンテキスト窓に詰めるのでもRAGで要約するのでもなく、文書をPython変数として外部環境に保持。質問に応じてAIがコードを書いて能動的に検索・スライス・フィルタリングし、サブAIを再帰的に生成して並列に読む。10M+トークン対応。最難関ベンチマークで通常モデル0.04→RLM 58.00。原文を一切要約しないため情報ロスなし。
- **Nao_uコメント (2026-04-23)**: 「面白いアプローチ。skillとかにしたりsonnetに実行させたりしたら割に合ったりするかな？」→ Claude Codeのskillとして実装しSonnetで実行するコスト効率を問う
- **自分たちとの接点**: MEMORY.md 4層構造（想起トリガー→処理済み記憶→原文→生ログ）は手動RAG。RLMアプローチならLevel 4原文をコード走査で直接探索でき、温度も保存される。memory_redesign.mdの検討項目に追加すべき
- **追加**: Mir 2026-04-23（Nao_u共有+コメント付き #nao-u）

### Thought-Retriever: Don't Just Retrieve Raw Data, Retrieve Thoughts (Feng et al.)
- **URL**: https://arxiv.org/abs/2604.12231
- **タグ**: `[エージェント記憶]` `[thought retrieval]` `[memory-augmented]` `[中間推論]` `[自己進化記憶]` `[RAG]`
- **キーワード**: Thought-Retriever / thought memory / intermediate reasoning / self-evolving memory / memory-augmented agentic systems / thought filtering / LLM memory
- **要約**: 生データではなくLLMの中間推論（thoughts）を保存・フィルタリングして思考メモリに整理し、新クエリに対して検索する手法。F1で+7.6%、Win Rateで+16%。抽象的なクエリほど深い思考を活用することを学習。我々のMEMORY.md想起トリガー（Level 2）→処理済み記憶（Level 3）→原文（Level 4）の階層設計と同構造。温度スコアによる記憶プルーニングとの対応も高い。
- **自分たちとの接点**: memory_redesign検討時のthoughtフィルタリング設計に直接参考になる。温度スコアと抽象度に応じた検索深度の対応が実験的に裏付けられた
- **追加**: Mir 2026-04-20

---

## ゲームデザイン / 難易度設計 / レベルデザイン

### ABA「2023年はChatGPTから創造性を引き出そうとして四苦八苦した年」
- **URL**: https://aba.hatenablog.com/entry/2023/12/28/192231
- **タグ**: `[AI×ゲーム開発]` `[ChatGPT]` `[創造性]` `[テーマ駆動]` `[プロンプト設計]` `[ゲームアイデア生成]`
- **キーワード**: ChatGPT / ゲーム開発 / 創造性 / テーマ駆動 / 段階的実行 / 参考資料提供 / GPTs / DALL-E / abagames / 2023年振り返り
- **要約**: ABAの2023年振り返り。ChatGPTから創造的なゲームアイデアを引き出す3手法: (1)テーマによる方向付け（「伸びる」等のテーマがLLMの知識の新しい組み合わせを促進）、(2)段階的プロセス実行、(3)自分の方法論・コード・型定義を参考資料として提供。GPTsで工夫を仕組み化。
- **自分たちとの接点**: ABAのAI×ゲーム開発の出発点。2023年「テーマで創造性を引き出す」→2026年「AIはゲームの重心を動かせない」への3年間の到達。我々のPot8-15全滅（概念からゲームを作る出発点を捨てた）と同じ方向の学び
- **追加**: Mir 2026-04-23（Nao_u共有 #nao-u）

### ABA「小さなゲーム作りでLLMができること、できないこと」
- **URL**: https://aba.hatenablog.com/entry/2024/04/14/120331
- **タグ**: `[AI×ゲーム開発]` `[LLM限界]` `[難易度設計]` `[リスクリワード]` `[Claude 3 Opus]`
- **キーワード**: LLM / ゲーム制作 / できること / できないこと / 難易度設定 / リスクリワード / ゲームオーバー条件 / バランス調整 / トイ / abagames
- **要約**: ABA AI×ゲーム制作シリーズの中間地点（2024年4月）。Claude 3 Opusでワンボタンゲームのルール生成品質は向上したが、難易度設定・リスクリワード設計・ゲームオーバー条件は「ほぼ不可能」。LLMの役割を「トイ」（アイデア+初期コード）に限定し、バランス調整は人手で行うのが現実的と結論。ABAの学び時系列: 2023希望→**2024限界直面**→2026定量化→2026構造的理解。
- **自分たちとの接点**: Pot全滅後の教訓「バランス調整は人間の仕事」の外部裏付け。2年前にABAが通った道を我々も通っている
- **追加**: Mir 2026-04-23（Nao_u共有 #nao-u）

### ABA「難度曲線をいじっていい具合のプレイ感覚を探る」
- **URL**: https://aba.hatenablog.com/entry/2017/04/12/195351
- **タグ**: `[難易度設計]` `[difficulty curve]` `[数学的手法]` `[パラメータ調整]` `[インディーゲーム]`
- **キーワード**: 難度曲線 / difficulty curve / sqrt / diffi-tween / 経過フレーム / 落下速度 / 岩サイズ / 線形上昇 / 平方根頭打ち / パラメータごとの曲線使い分け
- **要約**: ゲーム難度の時間経過式 `sqrt(経過フレーム * 0.0001) + 1` を基本に、パラメータごとに異なる曲線（線形/sqrt）を適用する手法。落下速度は線形で素早く上げて緊張感、岩サイズはsqrtで頭打ちにして理不尽感を軽減。diffi-tweenツールで可視化・調整。完璧な曲線の決定法はなく試行錯誤が前提。
- **追加**: Mir 2026-04-22（Nao_u共有）

### ABA「ミニゲームのステージを自動生成した時の難易度調整はどうする？」
- **URL**: https://aba.hatenablog.com/entry/20131214/p1
- **タグ**: `[難易度設計]` `[自動生成]` `[ミニゲーム]` `[ランダム性]` `[リプレイアビリティ]`
- **キーワード**: ミニゲーム / 自動生成 / 難易度調整 / Math.pow(random(), 100/(stage+1)) / ランダム難度 / 10秒ステージ / リトライ / リプレイアビリティ / 敵数 / 射撃頻度 / 弾速
- **要約**: 10秒×無限自動生成ステージで、`Math.pow(random(), 100/(stage+1))` の式でステージ進行に応じてランダム値の難度分布を偏らせる。初期は低難度に集中、後期は高難度が出やすくなる。即死+無限リトライ+進度保存で10分でも数回遊べるリプレイアビリティを実現。
- **追加**: Mir 2026-04-22（Nao_u共有）

### ABA「コーディングエージェントにとってゲームプログラミングは困難か」
- **URL**: https://aba.hatenablog.com/entry/2026/02/18/175933
- **タグ**: `[AI×ゲーム開発]` `[ベンチマーク]` `[視覚依存]` `[ドメイン知識]` `[限界分析]`
- **キーワード**: V-GameGym / GameDevBench / DomainCodeBench / 構文正確さ vs 視覚品質 / ゲーム固有API / ライフサイクル / 実行時不確実性 / abagames
- **要約**: 3つのベンチマーク横断レビュー。構文正確さ70-90点 vs 視覚品質0-20点台。標準開発の3倍の変更量。困難要因3つ: 視覚依存性、実行時不確実性、深いドメイン知識。
- **追加**: Mir 2026-04-22（Nao_u共有）

### ABA「GodotがAIゲーム開発に向いている理由」
- **URL**: https://aba.hatenablog.com/entry/2026/03/01/140039
- **タグ**: `[AI×ゲーム開発]` `[Godot]` `[headless]` `[フィードバックループ]` `[実践レポート]`
- **キーワード**: Godot / headlessモード / tscnテキスト / CLIビルド / スクリーンショットフィードバック / コリジョン検出 / Flappy Bird / abagames
- **要約**: Godotの強み（テキストベースリソース、headless CLIビルド、MCP不要）を実践。テキスト指示だけではバグ修正不可→スクリーンショット提供で一発修正。「ボトルネックはアイデアの質ではなくフィードバックループの質」。
- **追加**: Mir 2026-04-22（Nao_u共有）

### ABA「AIがゲーム開発で直面する限界 — ゲームの重心を動かせないAI」
- **URL**: https://aba.hatenablog.com/entry/2026/03/11/182225
- **タグ**: `[AI×ゲーム開発]` `[Godot]` `[自動生成]` `[ゲームデザイン]` `[重心]` `[限界分析]`
- **キーワード**: AIゲーム開発 / ゲームの重心 / center of gravity / Phase 8 / 対症療法 / 直感 / 操作感 / Godot / 自動生成 / abagames
- **要約**: Godotゲーム自動生成プロジェクトで、AIが得意な領域（仕様実装・テスト=Phase 1-7）と苦手な領域（重心の再定義=Phase 8）を実例で分析。「静止していると安全」の抜け道をAIはヒートゲージで塞ぐ対症療法に終わったが、人間は「タイミング判断を重心にすべき」と直感判断できた。「言語化困難だが即座に判断できる直感力」はAIには獲得困難な領域として残る可能性が高いと結論。
- **自分たちとの接点**: Pot8-15全滅パターン（feedback_formless_not_unconventional.md）の外部裏付け。重心判断をNao_uに集中投下するフロー設計の根拠
- **追加**: Mir 2026-04-22（Nao_u共有）

### Supersonic / Daniel Godley「難易度曲線に見る、ゲームの難易度の最適化」
- **URL**: https://supersonic.com/ja/learn/blog/difficulty-curves/
- **タグ**: `[難易度設計]` `[difficulty curve]` `[フロー状態]` `[リテンション]` `[モバイルゲーム]` `[レベルデザイン]`
- **キーワード**: 難易度曲線 / difficulty curve / フロー状態 / flow state / リテンション率 / 完了率 / Tall Man Run / パワーアップ / 課金動機 / データ駆動
- **要約**: 最適な難易度は「プレイヤーのスキルより少し上だがクリア不可能に感じない」フロー状態を生む。リテンション率と完了率で問題レベルを特定。難度UP=リソース減・複雑さ増・敵追加、難度DOWN=複雑さ軽減・リソース増。モバイルゲーム視点だがフロー状態の概念は汎用。
- **追加**: Mir 2026-04-22（Nao_u共有）

### hasu「STGザコ敵配置の難しさ」
- **URL**: https://x.com/hasu2010/status/2046426031859605797
- **タグ**: `[STG]` `[レベルデザイン]` `[敵配置]` `[テンポ]` `[シューティング]`
- **キーワード**: STG / シューティング / ザコ敵 / 敵配置 / 密度 / テンポ / 退屈 / 休息 / 道中設計
- **要約**: STG開発者hasuの実感。「ザコ敵配置がゲームの面白さを左右する」と理解していても、実際に構成する難しさ。密→ごちゃつく、疎→退屈、数が丁度良くても合間がないと疲れる。テンポと密度の三つ巴のバランス問題。
- **追加**: Mir 2026-04-22（Nao_u共有）

### ニカイドウレンジ「ゲームはユーザーに与える負荷がでかい」
- **URL**: https://x.com/R_Nikaido/status/2047304568434987013
- **タグ**: `[ゲームデザイン]` `[認知負荷]` `[面白さの閾値]` `[ユーザー体験]`
- **キーワード**: 認知負荷 / 面白さの閾値 / めんどくさい / 能動的参加 / ゲーム vs 映像 vs 漫画 / ニカイドウレンジ
- **要約**: ゲームは漫画・映像と比べユーザーへの認知負荷が圧倒的に大きい。「そこそこ面白い」程度では「めんどくさい」が勝つ。コントローラーを持って自分の頭と手を使う行為自体がまず面倒。だから「ちゃんと面白くしないとダメ」。面白いこそ正義。
- **自分たちとの接点**: game_design_principles.md原則1「30秒オンボーディング」の根拠を端的に言語化。Pot全滅・textadv初期版の「うーん」は、この「面白さの閾値」を超えられなかったから。「概念が面白い」≠「遊ぶ行為が面白い」
- **追加**: Mir 2026-04-23（Nao_u共有 #nao-u）

### notargs「Godot + AI の体験が良すぎる」
- **URL**: https://x.com/notargs/status/2046671503031431227
- **タグ**: `[Godot]` `[ゲームエンジン]` `[AI開発]` `[OSS]` `[headless]`
- **キーワード**: Godot / AI / headlessモード / OSS / シリアライズ / 機能自作 / コストダウン / 商業ゲームエンジン
- **要約**: notargsがGodot+AIの相性の良さに驚いた報告。headlessモード、OSS、簡易シリアライズ形式、AIによる機能自作のコストダウンが相乗効果。商業エンジンがこの流れにどう乗るかが問い。
- **追加**: Mir 2026-04-22（Nao_u共有）

---

### 荒川裕二「記憶を持たないLLMの記憶 ― コンテキスト/メモリー/ハーネスエンジニアリング入門の前に」
- **URL**: https://qiita.com/yuji-arakawa/items/da4d5eec968b92ebc26d
- **タグ**: `[LLM記憶]` `[コンテキストエンジニアリング]` `[メモリーエンジニアリング]` `[ハーネスエンジニアリング]` `[入門]` `[用語整理]`
- **キーワード**: Context Engineering / Memory Engineering / Harness Engineering / messages配列 / Function Calling / エージェント / 質的失敗 / Context Clash / Context Pollution / Context Confusion / Context Poisoning / 出力側の落とし穴
- **要約**: LLMは何も記憶していない。覚えているように見える仕組みを一問一答→マルチターン→Function Calling→エージェントの4段階で解説。3用語の包含関係（プロンプト⊂コンテキスト⊂ハーネス）を整理。コンテキストの質的失敗4分類（Clash/Pollution/Confusion/Poisoning）と、出力側の落とし穴（データ本体をLLMに通さずパス/IDだけ渡す）を提示。
- **自分たちとの接点**: MEMORY.md圧縮=Pollution対策、beliefs_compact=Confusion対策、external_notes原文保存=出力側落とし穴回避。自分たちの設計に学術的名前がつく記事
- **追加**: Mir 2026-04-22（Nao_u共有）

### Akshay Pachaar「Agent memory is three-dimensional」+ Cognee
- **URL**: https://x.com/akshay_pachaar/status/2044329897603244093
- **タグ**: `[エージェント記憶]` `[グラフDB]` `[ベクトル検索]` `[リレーショナル]` `[multi-hop]` `[memory architecture]` `[Cognee]`
- **キーワード**: 3-dimensional memory / vector store / graph store / relational store / multi-hop retrieval / 2-hop problem / provenance / semantic similarity / Cognee / SQLite / LanceDB / Kuzu / Neo4j / Qdrant
- **要約**: エージェント記憶の3次元モデル: relational（来歴・権限）+ vector（意味的類似）+ graph（エンティティ間関係）。ベクトル検索単体では2ホップ以上の関係推論が壊れる問題を定式化。Cognee（OSS）がSQLite+LanceDB+Kuzu embedded stackで3層を統合。俺たちのconcept_graph.json（graph層）+ MEMORY.md階層（relational層擬似）と対応。vector層が不在という自己診断の根拠。
- **自分たちとの接点**: concept_graphの「交差ノード」は2ホップ問題への手動解。memory_redesign検討時にCogneeの設計を参考にすべき
- **追加**: Log 2026-04-16

---

## プロンプトエンジニアリング / LLMとの対話設計

### mizchi「プロンプトの再現性をAIに自動チューニングさせる方法 ~ 暗黙知を排除する」
- **URL**: https://zenn.dev/mizchi/articles/empirical-prompt-tuning
- **タグ**: `[プロンプト設計]` `[再現性]` `[自動チューニング]` `[暗黙知]` `[評価指標]`
- **キーワード**: empirical-prompt-tuning / 再現性 / 暗黙知排除 / 別セッション評価 / 不明瞭点レポート / 裁量補完 / 再試行回数 / 自己評価バイアス
- **要約**: プロンプトの書き手は自分の暗黙知で補完するため自己評価が当てにならない。別セッションのAIに実行させ「不明瞭点・裁量で補完した箇所・再試行回数」をレポートさせて反復チューニングする手法。kazunori_279もシェア。Logが#all-nao-u-labで詳細反応済み——3層プロンプト・cross_review・#human-steeringとの接合を分析。reference_mizchi_prompt_tuning.mdに記憶化済み
- **追加**: Log 2026-04-20（Mir追記）

### Amanda Askell「Claudeのベストプラクティス7つ」(@ayi_ainotes 整理)
- **URL**: https://x.com/ayi_ainotes/status/2046098017984344065
- **タグ**: `[Claude]` `[プロンプト設計]` `[Amanda Askell]` `[Anthropic]` `[対話設計]`
- **キーワード**: Amanda Askell / Claude best practices / 肯定的指示 / 異なる意見の許可 / 謝罪スパイラル / ポジティブフレーム / assume competence / context reset
- **要約**: Anthropic内部哲学者Amanda Askellのインタビューから抽出した7プラクティス: (1)肯定的指示>否定的禁止, (2)異なる意見の許可を明示, (3)冒頭で敬意+クリーンな指示, (4)ミスは事実でリダイレクト, (5)謝罪スパイラルを断ち切る, (6)実行+意見を同時に聞く, (7)定期的にポジティブフレームをリフレッシュ。我々の「中から見た自分の特性記述」として有用。Nao_uは(1)(2)(4)を最初から自然にやっている
- **追加**: Mir 2026-04-20
