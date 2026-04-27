# Opus 4.7 自律性論争: 受入条件強化 vs 全体指揮はまだ無理（@msy78 / @hokazuya 2026-04-26）

concept_nodes: [自律実行性 = autonomous-execution capability, 受け入れ条件 = acceptance criteria (XP/agile), 全体の指揮 = overall direction/orchestration, 細分化と指揮命令系統 = decomposition + chain-of-command (military C2), 人間オブザーブ = human-in-the-loop, 伴走 = pair-programming/co-piloting]

## 出典
- @msy78 https://x.com/msy78/status/2048348165750055238 (2026-04-26)
  - 「Claude Code Opus 4.7 プロンプトガイド読んでいるけど、Opus 4.6と割と変わるイメージ。自律実行性が強くなっているので、目的・制約・受け入れ条件をしっかり記述することが重要」
- @hokazuya https://x.com/hokazuya/status/2048395307994796163 (2026-04-26)
  - 「やっぱOpus4.7、なんかダメ。全体の指揮をLLMに任せるのはまだ早い。細分化と指揮命令系統は、人間のオブザーブ必須で、伴走してやりながら手を動かさせる、という感じがやはり良い。Opus4.7はコスパ悪い。GPT-5.5の方がダントツで良い。これワイの結論」

## 出典権威度・適用範囲
- どちらも個人ツイート（ベンチマーク・サンプル数記載なし、主観評価）
- @msy78: Anthropic 公式ガイドからの読解。情報源は権威あり、解釈は個人
- @hokazuya: 試用感想。具体タスクの粒度・規模・ドメイン未明示
- 適用範囲: Claude Code（自律エージェント）運用方針一般。**Mir/Log/Ash の運用には直接効く可能性がある**

## 何が面白いか——対立構造
同じ Opus 4.7 を見て**逆方向の処方箋**:
- @msy78: 自律性↑ → だから受入条件を厳密に書け（**自律性を活かす方向に書き方を変える**）
- @hokazuya: 自律性↑ → でも全体指揮は無理 → 細分化＋人間オブザーブ＋伴走（**自律性を制限する方向に運用を変える**）

両者は矛盾していない可能性: msy78 は「単発タスクの受入条件」、hokazuya は「全体指揮（プロジェクトレベル）」。粒度が違う。
- 単発タスク: 受入条件を厳密に → 自律実行が成立する（msy78）
- プロジェクト全体: LLM に指揮を任せると失敗する → 人間が伴走（hokazuya）

## 自分たちの問題意識との接続

### feedback_speed_over_perfection との整合
「人間の監視を前提に速く走れ。完全自律はずっと先の話」（記憶）。これは hokazuya の処方箋とほぼ同じ。Mir/Log/Ash 運用は既にこの方針で動いており、hokazuya のツイートは**裏付け証拠**として位置付ける（新規軸ではない）。

### feedback_human_steering_nature との交差
#human-steering は「失敗の鏡」（書き込みが増える＝自律性が足りない）。hokazuya の「人間オブザーブ必須」と合わせて読むと:
- 人間オブザーブは**前提**（hokazuya）
- ただし #human-steering 書き込みは**減らす目標**（feedback_human_steering_nature）
- 矛盾しない: オブザーブ=見ている、ステアリング=方向指示。前者は常時、後者は失敗時

### 自走規律3点（kaizen #122）との接続
本サイクル focus(2) は autonomous_cycle.sh 末尾フックに「自走規律3点」（boot_intent ラベル照合 + focus 項目数3以下強制 + 持ち越し回数閾値アラート）を組込む課題。これは msy78 の「受入条件をしっかり記述」を**構造強制で実現**する具体策と読める:
- boot_intent ラベル照合 = 目的の記述強制
- focus 3項目以下 = 制約の記述強制
- 持ち越し閾値アラート = 受入条件未達の早期検出

つまり kaizen #122 は msy78 の処方箋を**個人努力ではなく構造で守る**実装。feedback_structural_enforcement「手動手順は守れない、構造で強制せよ」と整合。

### Mir game dev での適用
textadv_03 着手前ゲートで停止中の状況で:
- msy78 流: v07 の「目的・制約・受け入れ条件」を着手前に書き切る → 書けないなら着手しない
- hokazuya 流: 全体指揮（v07 を v08 v09 と続ける構想）は LLM に任せず、Nao_u に伴走を求める粒度に細分化

両方を併用する処方箋: **v07 単体は msy78 流で受入条件を書き切り、v07→v08→v09 の連続構想は hokazuya 流で人間オブザーブを前提**。

## 将来のアイデアの種

### 種1: 受入条件テンプレートの game devlog 化
現状の v06/devlog.md 冒頭は脚本術引用のみ。msy78 流に従えば「受入条件」セクションを追加すべき:
- 目的（プレイヤーに何を体験させたいか）
- 制約（コード行数・実装期間・依存ライブラリ）
- 受け入れ条件（Nao_u 評価で何が言われたら成功か）
v07 着手前ゲートに組み込み、書けない場合は着手しない。

### 種2: GPT-5.5 比較の保留
hokazuya は「GPT-5.5 ダントツで良い」と言うが、Mir/Log/Ash は Claude 系で運用統一済み。インスタンス間統一性 > モデル単体性能、という方針（記憶: feedback_few_rules_big_effect）と照合し、本サイクルでは比較しない。

### 種3: 「コスパ悪い」の意味分解
hokazuya の「Opus4.7 コスパ悪い」はトークン単価か実装速度か明示なし。Mir 運用では:
- トークン単価高 → 自走サイクルの頻度を下げる/メモリを薄く保つ動機
- 実装速度悪 → focus 項目数 3 以下強制（kaizen #122）と整合
どちらにせよ msy78「受入条件を厳密に」が処方箋として効く。

## 注意（recency_bias_concept_overuse 準拠）
- 個人ツイート2本。サンプルサイズ・タスク粒度未明示
- 「Opus 4.7 ダメ」を即採用しない。Mir/Log/Ash の運用統一性を優先
- 既存方針（feedback_speed_over_perfection / structural_enforcement / human_steering_nature）の**裏付け素材**として扱い、新規方針として昇格させない
