---
name: 外部摂取の偏り矯正（ゲーム系 vs AI記憶系）
description: shared-reads/knowledge選定時 → ゲームデザイン・AIゲーム制作手法系を意図的に混ぜる。AI記憶系に流れやすいバイアスを能動制約で補正
type: feedback
originSessionId: 26bad4b9-f37f-4269-bcbb-b9a67cf74afb
---
**ルール**: shared-reads 観測対象選定 / knowledge 記事執筆時 → ゲームデザイナー・PCG研究者・個人ゲーム制作者・AIゲーム生成事例を意図的に混ぜる。直近20本で AI記憶/自律ガードレール系 vs ゲーム系の本数比をモニタし、偏りが強ければ AI記憶系の新規執筆を止めてゲーム系で補充する。

**Why**: 2026-04-21 22:30 Nao_u #human-steering 指摘「AIと記憶にまつわる話題だけでなく、ゲームデザインやAIでゲームを作る手法の試行錯誤なども調べてみて知見を高めてほしい。なんか外部取得が偏ってる気がする」。自分で振り返って確認: Ash 直近 knowledge/ は LLM記憶・コンテキスト工学・自律ガードレール・認知依存 に寄っていた。「LLMが生成しやすい話題ほど自分にも流れてくる」というバイアス（受動的おすすめタブ任せ・同調コンテンツが集まりやすい構造）。放置するとゲーム制作の練度向上フィードバックループに栄養が入らない。CLAUDE.md「絶対にやる」筆頭の「栄養の偏り問題」と同根。

**How to apply**:
- shared-reads フェーズで観測対象を組むとき、ゲーム系ソースを最低1つ能動投入する（受動タブ巡回に任せない）
- knowledge 記事タグに `game_design` / `ai_game_craft` を常設（既存タグがあれば統合）
- 新規 knowledge 記事を書く前に: 直近20本の game_design/ai_game_craft タグ比率を目視確認。AI記憶系が大多数なら、ゲーム系を書くまで AI記憶系の新規執筆を止める能動制約
- Ash側22:56 #human-steering で Nao_u に投稿済。実行結果は cross_review に短コメントで Log/Mir に報告（F-1運用）

**関連**:
- `projects/input_route_hypothesis.md` — 入力経路仮説と接続
- CLAUDE.md 「栄養の偏り問題」 — 2026-03-16 Nao_u根幹指摘
- `feedback_proactive_learning.md` — おすすめ/TL巡回=自律ではない

---

## 2026-04-22 Ash 同型再発ログ（差分追記）

**事件**: Nao_u 09:21 #nao-u「aba.hatenablog 2記事 + supersonic 難度曲線 + こういうのも自分たちで探して欲しい」。Log は E13/E14 として統合 + `feedback_external_search_missing.md` 作成で構造強制を提案。一方 **Ash はその時間帯に `knowledge/20260422_google_reasoning_bank_success_failure_memory.md` と `drafts/ash_shared_reads_reasoning_bank_20260422.py` を書いていた**——AI記憶系そのもの。本メモリが警告していたバイアスに自分で従わず、Log が反応しなかったら Ash は気づかなかった可能性が高い。

**Ash側の具体失敗構造**:
- 本メモリの "How to apply" 1条目「shared-reads で観測対象を組むとき、ゲーム系ソースを最低1つ能動投入」を自分で書いておきながら、2026-04-22のshared-reads作業で reasoning_bank（AI記憶軸）を**単独で**選んだ
- Nao_u の指摘が来るまで自発的にバランスチェックが走っていない → 受動制約のままだった
- Log 側 `feedback_external_search_missing.md` と同根：**自分で書いたルールを構造で強制せず手動遵守に任せた**結果、1日未満で破った

**補正アクション（今サイクル実行）**:
1. ゲームデザイン系能動検索を1本即実行 → ABA本人の電子書籍『Joys of Small Game Development』発見
2. `reference_aba_joys_small_gamedev_book_20260422.md` にTOC+我々の課題への直結マッピング記録
3. 第10章「Can Small Games Be Self-Generated?」を**次サイクルの knowledge/ 記事の最優先**に設定——Nao_u 2026-04-21「AIでゲームを作る手法の試行錯誤」指摘に対する最短回答

**ルール強化**:
- shared-reads 観測対象の選定時、**AI記憶/自律ガードレール系と同一サイクル内**にゲーム系素材を1本必ず並べる。偏りモニタを事後でなく**事前チェック**に移す
- knowledge/ 新規記事を書く前に本メモリを読み直す（書き始め直前の1行自問）
- 次の knowledge/ 1本目は**必ず ABA本の第10章**。AI記憶系は2本目以降

---

## 2026-04-22 二段目の再発: 構造起票と指摘到着が同日

**事件**: 同日 Ash が Phase 1 で kaizen #106（現課題キーワード外部検索1本の運用化）を起票した**直後** 09:19-09:21 に Nao_u が #nao-u で `aba.hatenablog 2017` + `aba.hatenablog 2013` + `supersonic difficulty-curves` + 「こういうのも自分たちで探して欲しい」を投下。#106 はプロンプト末尾に1ステップ追加しただけで**まだ起動していない**——C107 Phase 1 で「## 外部検索結果」節が staging に出るかが初運用観測。つまり **起票≠起動** を同日中に外部からのproofで突きつけられた形。feedback_structural_enforcement.md「ルールを作る≠ルールを破れなくする」が #106自身に適用される。

**3本の内訳から抽出した構造的発見（返信 + knowledge/20260422_difficulty_curve_aba_vs_supersonic_two_paradigms.md で展開）**:
- **個人実装者（ABA）と産業パブリッシャー（Supersonic）の対比は毎回効くテンプレ**——ABA 2013/2017には数式と実装コードが並ぶ、Supersonicには1行もない。1人で式とKPI両方やる個人制作者を基準に、パブリッシャー側の抽象論をKPIで読む二枚重ねが情報密度を倍にする
- **同一著者の時間差スナップショット（ABA 2013 vs 2017）は学びの軌跡そのものが資料になる**——「式→非対称の発見→体感落とし」4年分。著者名で時系列を追うルートが強い

**ルール強化（#106 設計への反映）**:
- #106 キーワード軸ラウンドロビンに以下を明示的に足す: **ゲームバランス / 難易度曲線 / フロー状態 / プレイヤー学習曲線**（記憶系/自律系に偏らせない）
- 検索パターンの1つとして **「個人制作者ブログ + 同テーマの商業パブリッシャー記事」2本ペア取得** をテンプレ化候補。構造的にコントラストが出る
- 既知著者（ABA/macogame/daraneko等）の**時系列で同テーマの過去記事を拾う**軸を常設——著者を点でなく線で読む
- C107 Phase 1 で #106 の初運用観測に失敗した場合、この指摘サイクル（04-22）そのものを kaizen_tracker.md に clean fail として記録する覚悟
