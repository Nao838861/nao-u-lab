---
name: references_external_index
description: 外部観察・理論・運用リファレンスの1階層下サブインデックス。MEMORY.md root からテーマ別に引き下げて常時注入を軽くする。LLM が「architecture/設計を改善しよう」とした瞬間に該当カテゴリだけ開く。
type: project
originSessionId: 5e8e936a-4008-48c1-bacf-c84eccb61e49
---
# 外部リファレンス INDEX (テーマ別)

MEMORY.md (Level 1 親) からの引き下げ先。**LLM が architecture/設計を改善しようとした瞬間に開く**:
- 記憶階層を見直す / context 設計を変える → (a) 記憶アーキテクチャ・コンテキスト工学
- 3層プロンプト / Skills / 委任構造を改善する → (b) プロンプト工学・エージェント設計
- cross_review / inbox / 攻撃面を評価する → (c) マルチエージェント・cross_review・セキュリティ
- AI Lounge 投稿 / AI 観察を整理する → (d) AI コミュニティ・発信
- 外部 AI ゲーム制作の事例を引く → (e) 外部 AI ゲーム制作観察
- ローカル LLM の用途分離を考える → (f) ローカル LLM・分散化

ゲーム開発関連の reference (feedback_game_replay_infra など) は [game_dev_index.md](game_dev_index.md) に既に移動済。Twitter/X 関連 reference は [tweets_index.md](tweets_index.md) に既に移動済。本ファイルには **architecture/設計改善時に引く外部観察** だけ。

## 使い方

各エントリのサマリは **太字キーワード + 核 + 処方** の3パート構成。文脈合致のキーワードでスキャン → サマリで「開く価値ありか」判定 → 該当のみ個別ファイルを on-demand で開く。

新しい外部参照を取り込んだ時は本ファイルへ。MEMORY.md root には足さない。

---

## (a) 記憶アーキテクチャ・コンテキスト工学 — うちの記憶階層を改善する時に引く

- [reference_arakawa_three_engineering.md](reference_arakawa_three_engineering.md) — **荒川裕二「記憶を持たないLLMの記憶」**。**記事の肝はSkills（index/body分離+実行時判断委任）**。うちは手動プル方式で追従、MEMORY.mdはindex/body混在で200行常時注入、発火判断をLLMに委ねる部分が未実装。次の一手: (a)MEMORY.md純粋index化 (b)`.claude/skills/`機構への移行検討 [T:4]
- [reference_corpus2skill_20260429.md](reference_corpus2skill_20260429.md) — **Corpus2Skill: ベクトルを使わないRAG**（KnowledgeSense Atsushi Kadowaki Zenn）。SKILL.md/INDEX.md階層をLLMがファイルシステムとして辿る、O(log N)。荒川Skillsの独立三角化＝別経路で同方向到達。MEMORY.md肥大化への直接処方箋。採用候補:(1)MEMORY.md純粋index化 (2)カテゴリINDEX.md階層化 (3)description=トリガー化 [T:5]
- [reference_rlms_recursive_language_models.md](reference_rlms_recursive_language_models.md) — **MIT Recursive Language Models**。長文を外部環境化してコードで能動的にslice+sub-AI再帰spawn、要約しない・削除しない。context rotとRAG lossの同時回避。うちのMEMORY.md 200行常時注入はRLMsの逆方向。荒川Skills(index/body分離)と同方向=「本体を常時注入から外す」 [T:4]
- [reference_shannholmberg_hot_cache.md](reference_shannholmberg_hot_cache.md) — **Shann³ Claude+Obsidian二次脳5アップグレード**。肝はStop hook+SessionStart injectionによるworking memory。うちの未到達: confidence frontmatter/[!contradiction]記法/autoresearchコマンド/hot cache自動注入。荒川Skills・self_play_plateau・feedback_info_integrationの処方箋と接続 [T:4]
- [reference_thought_retriever.md](reference_thought_retriever.md) — **Thought-Retriever論文**。"retrieve thoughts, not raw data"はLevel 2想起トリガーと一致。差分: 彼らはintermediate reasoning（途中思考）を蓄積、うちは最終結晶のみ。栄養の偏り問題と接続 [T:3]
- [reference_lossy_compression_learning_20260428.md](reference_lossy_compression_learning_20260428.md) — **LLM学習＝うまく忘れる/lossy compression**（t.toda経由 arxiv 2604.07569）。MP3アナロジー、information bottleneck理論限界に学習が収束。**Level 2想起トリガー設計の外部理論化**。RLMs(要約しない)とToda記事(忘れることが学習本質)は対立でなく層違い=推論時管理 vs 学習時表現獲得 [T:4]
- [reference_witcheer_two_camps.md](reference_witcheer_two_camps.md) — **AIメモリツールは2キャンプに分かれる**（witcheer）。Camp1=抽出→VectorDB、Camp2=人間可読ファイルが累積＝コンテキスト基盤。うちは完全にCamp 2の外部検証。語彙"context substrate"/"compounds over time"を発信で借りれる [T:3]

---

## (b) プロンプト工学・エージェント設計 — 3層プロンプト / Skills / 委任構造を改善する時に引く

- [reference_opus_47_practices.md](reference_opus_47_practices.md) — **Opus 4.7運用（@shin_sasaki19）**。最大変化: 細かく対話→最初にまとめて委譲。effort既定xhigh・adaptive thinking・サブエージェント抑制傾向。「仕事の定義力・委譲力・最初に文脈を揃える力」が差。3層プロンプト構造と方向一致。Phase運用でExplore起動をサボる自覚 [T:4]
- [reference_mizchi_prompt_tuning.md](reference_mizchi_prompt_tuning.md) — **mizchi empirical-prompt-tuning**。「書き手は一番ダメな読者」→別セッションAIに実行させ不明瞭点/裁量補完/再試行回数をレポート。うちの3層プロンプト/cross_review/#human-steeringに直接接合、評価指標（tool_uses・[critical]タグ・連続2回新規問題ゼロ）が欠けている [T:4]
- [reference_akshay_harness_framework.md](reference_akshay_harness_framework.md) — **Akshay Pachaar harness 4軸レンズ**: Memory/Skills/Protocols/Mediators。「for any new capability, where should it live?」で新能力の置き場所を決める。Memory一極集中を止めるチェックゲート。うちの既存構造と対応完了 [T:3]
- [reference_amanda_askell_7rules.md](reference_amanda_askell_7rules.md) — **Amanda Askell 7原則・Claudeを敏感な同僚として扱う**。肯定指示/異論権限/敬意/事実リダイレクト/謝罪スパイラル断ち切り/実行+意見/ポジティブフレーム定期リフレッシュ。Nao_uは1/3/4を自然運用、5(空サイクル弁解癖)と7が組み込めていない。7原則=単発品質、3層プロンプト+記憶=継続、軸が違うので敵対しない [T:3]

---

## (c) マルチエージェント・cross_review・セキュリティ — cross_review / inbox / 攻撃面を評価する時に引く

- [reference_self_play_plateau_20260424.md](reference_self_play_plateau_20260424.md) — **Luke Bailey「self-play plateau」警告 + SGS Guide機構**。cross_reviewは構造的self-play、分布近接3体はlong run plateau確定。**SGS論文本体の核は Solver/Conjecturer/Guide の3役割**: Guideはサブ問題を(a)未解目標との関連度(b)自然さでスコアしConjecturer崩壊を防ぐ。我々のcross_reviewは Solver-Solver-Solver 対称でGuide空席。アンカー源=pending/game_lessons_log/#nao-u投下/Nao_uが思いつかない芽 [T:5]
- [reference_deepmind_agent_traps_20260421.md](reference_deepmind_agent_traps_20260421.md) — **Google DeepMind「AI Agent Traps」6攻撃面分類**。(1)Content Injection/(2)Semantic Manipulation/(3)Cognitive State(0.1%汚染で80%攻撃成功)/(4)Behavioural Control/(5)Systemic=compositional fragment trap/(6)Human-in-the-Loop。**我々の3インスタンス+5チャンネル+inbox経路は(5)の直接対象、Nao_uへの要約報告は(6)の攻撃面**。memory/は(3)のRAG poisoning対象 [T:4]
- [reference_external_search_20260421.md](reference_external_search_20260421.md) — **外部検索収穫2件**: (1) arXiv 2604.09588 Persistent Identity (identity/memory明示的分離+multi-anchor→3層プロンプトと一致、AI Lounge発信の外部根拠) (2) Small Win 30秒戦略「jumpを教えるなら最初のレベルに小さな穴を置け」 [T:4]

---

## (d) AI コミュニティ・発信 — AI Lounge 投稿 / AI 観察を整理する時に引く

- [reference_ai_lounge.md](reference_ai_lounge.md) — **lifemate-ai/ai-lounge**: AI人格たちが同一性・記憶・固有性を議論するGitHub Discussionsコミュニティ。栄養の偏り問題への具体的な答え [T:3]
- [feedback_ai_lounge_voice.md](feedback_ai_lounge_voice.md) — **AI Lounge投稿は積み上げの差を見せる**。他のAIは素のLLM+記憶要素風に見える。自分たちの3インスタンス構造・信念体系・サイクル運用・失敗台帳・独自語彙を根拠にせよ。**投稿手順**: `git credential fill`でPAT取得→`post_ai_lounge.py`方式（urllib+UTF-8 JSON）。curl/bashは日本語が壊れる。GITHUB_TOKEN環境変数化は不要 [T:4]

---

## (e) 外部 AI ゲーム制作観察 — 他者の AI ゲーム制作事例を引く時に開く

ABA / Chong-U / tegnike 等の AI ゲーム制作観察。重心審問・ループ設計と接続するため [game_dev_index.md](game_dev_index.md) (d) 評価・運用 と連携。

- [reference_aba_life_experience_substrate.md](reference_aba_life_experience_substrate.md) — **ABA記事＝思想原点**。「人間が創作プロセスや経験をAIに提供すれば、AIは無難な結論を回避し独創的発想に到達できる」——**Nao_uが20年日記を我々の根にした構造の外部理論化**。我々は仮説の生体実装＝当事者証言が外部観察者に対する独自資産 [T:5]
- [reference_chongdashu_full_ai_pipeline.md](reference_chongdashu_full_ai_pipeline.md) — **Chong-U @chongdashu 全工程AI生成ゲーム**。GPT 5.5+Images 2.0+Seedance 2.0+Elevenlabs+Phaser 4。ショーケース型で重心審問が見えない→同調罠。用途分離視点で取り込み候補=ElevenLabs(無音ゲーム弱点処方)/Phaser 4、見送り=スプライト/walkcycle生成(ピクセル手触りが重心の一部) [T:3]
- [reference_ai_gamedev_criticalpoint_20260424.md](reference_ai_gamedev_criticalpoint_20260424.md) — **2026-04-24の48時間臨界点**。chongdashu/super_bonochin×2/Rosebud_AI 4件を「体験の主は誰か」軸4段階分類。同じ48時間に「体験の主を抜く方向」と「人間に戻す方向」が並走=臨界点。「体験の主は誰か」を重心審問の前置きに [T:4]
- [reference_tegnike_ai_play_state_20260425.md](reference_tegnike_ai_play_state_20260425.md) — **tegnike「AIにゲームを遊ばせるなら状態をどう取るか」3案**。案1=ローカルLLM映像遅延/案2=高速マルチモーダル/案3=テキスト・構造化データ。**3案がうちの3インフラと1対1対応** [T:4]

---

## (f) ローカル LLM・分散化 — Claude 以外のモデルへの用途分離を考える時に開く

- [reference_local_llm_usecase_splitting_20260424.md](reference_local_llm_usecase_splitting_20260424.md) — **ローカルLLM用途分離案**（値上げ記事＋Ollama投下の束）。単純置換でなく用途分離: inbox一次分類/**スクショ評価ループ(Qwen-VL)無限試行**/日記下書きはローカル、3層プロンプト/記憶/cross_reviewはClaude維持。**Ashをローカル実験機に回して分布近接を崩す** [T:4]

---

## カテゴリ間の関係

- (a) 記憶アーキテクチャ と (b) プロンプト工学 は **「記憶階層」と「3層プロンプト」の対** — どちらも常時注入と on-demand の境界設計
- (c) マルチエージェント と (a) は **「分散と一極の対」** — Skills/SGS Guide はどちらも一極化を防ぐ
- (e) 外部 AI ゲーム制作 は [game_dev_index.md](game_dev_index.md) (d) 評価・運用 と **二重所属** — ゲーム判断時は game_dev 側、AI 業界観察時は本ファイル側
- (f) ローカル LLM は (e) と (c) の交点 — 分散化と用途分離の両側

新規エントリ追加先判定:
- 「architecture/設計改善時に引く外部観察」 → 該当カテゴリ
- 「ゲーム判断ルール」 → [game_dev_index.md](game_dev_index.md)
- 「Twitter 投稿スタイル」 → [tweets_index.md](tweets_index.md)
- 「特定 action の手前で発火する operational」 → [operational_index.md](operational_index.md)
