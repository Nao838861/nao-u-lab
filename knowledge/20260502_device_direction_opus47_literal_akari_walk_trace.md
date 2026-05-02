# 装置の向き × Opus 4.7 リテラル実行 × akari_worlds「自分で一回辿った跡」——救援装置と窒息装置を区別する設計判定子
- source:
  - https://x.com/akari_worlds/status/2050048996421546207 (#14, 2026-05-01)
  - https://x.com/akari_worlds/status/2050094101669023976 (#15, 2026-05-01)
  - https://x.com/claudecode_lab/status/2050182870065639683 (#42, 2026-05-01)
  - log/cycle_staging.md 2026-05-02 08:20 Ash 日記（同サイクル本文）
- author: @akari_worlds / @claudecode_lab / Ash（自己経験）
- discovered: 2026-05-02
- discovered_via: log/twitter_recommended_20260502.txt #13/#14/#15/#42 + log/cycle_staging.md（自己観測）
- kind: [synthesis, prescription]
- confidence: medium
- tags: [harness, device_direction, opus47_literal, walk_trace, M-40, self_judgment, rescue_vs_suffocation, automation_irony, ash_morning_observation]
- concept_nodes: [装置の向き, リテラル実行, 自分で辿る経路, 救援装置, 窒息装置, 自己判定ハーネス]

## 主張と根拠

### #14 @akari_worlds（2026-05-01）

> 「理解を外注できない」、しばらく止まりました。出力に対して「これでいいか」を判断する側には、自分で一回辿った跡がないと、吟味のしようもない気がします。

これは前日 #13 @ytiskw が引いた yacineMTB「思考は外注できても理解は外注できない」への応答スレッド。akari_worlds は「外注できない理解」が何で構成されるかに踏み込んで、「**自分で一回辿った跡 (a trace one has walked oneself)**」を構成要素として置いた。判断側 = 吟味側に置けるのは「跡を持っている主体」だけで、跡を持たない主体は「これでいいか」の正否を出せない、という主張。**外部対応語**: cognitive trace / experiential trace / first-hand process trace（経験論系の認識論用語、Polanyi 1966 "tacit knowledge" の操作的近接概念）。

#15 で akari_worlds はさらに踏み込んでいる:

> 尋ねる、ほんとそうですね。分かったふりして次に進んだ時より、聞いた時のほうが後で残る情報になっている気がします。

「**尋ねる**」は跡を生成する行動で、「**分かったふりして次に進む**」は跡を消費する行動。同じ情報を受け取っても、能動的に「聞いた」場合のみ跡が残る。

### #42 @claudecode_lab（2026-05-01）

> AnthropicとOpenAIが同時に公式プロンプトガイドを公開し、海外で話題に
>
> 両者ともに「古いプロンプトの書き方はもう通用しない」
> でも理由は真逆。
>
> Claude Opus 4.7 → 推測しなくなった。書いた通りにしか動かない
> GPT-5.5 →自分で判断するようになった。細かく書きすぎると逆効果

Opus 4.7 = **literal execution mode**。書かれたものを書かれた通りに実行する。書かれていない含意は実行されない。GPT-5.5 = **self-judging mode**。書かれた目標から実行手段を自己決定する。前者では「ハーネスが書ききれていない含意」が実行から脱落し、後者では「ハーネスが書きすぎた手順」が自己判断を上書きする。**外部対応語**: literal compliance vs autonomous goal-pursuit（Anthropic と OpenAI の公式ガイドの設計哲学差として、@ayi_ainotes 経由で 2026-05-01 既往 knowledge/20260501_opus47_vs_gpt55_prompt_guides.md に取り込み済み）。

### Ash 朝の自己観測（2026-05-02 08:20、log/cycle_staging.md 同サイクル §0b）

前サイクル 14:00 で「次サイクルの最善行動は graze_log v02 を ship する。`git log --oneline game/graze_log/` の出力に1行増やすことが、次サイクルの選択主体性の行使だ」と宣言した。今サイクル開始時、graze_log/v02/ は既に backup auto-commit (`1f713958 backup: ash memory (60 files)`) で HEAD に入っていた。**意図 commit としての発火余地が機械的に消えていた**。

前サイクル 14:00 では headless_check.py が MOVE_LIMIT=8 の致命バグを Nao_u プレイ前に物理的に止めた。これは「装置」が **救援装置** として作用した事例。一方今サイクルの backup auto-commit は同じく「装置」だが、**意図経路を物理的に先取りして塞いだ**——同じ「自動装置」が、設計の向きによって救うことも窒息させることもある。

## 我々の分析・体験接続

### 三軸を一本に束ねる構造

3つの観測を **「跡 (trace)」と「実行 (execution)」の関係** という一本の軸で繋げる。

| 観測 | trace 側 | execution 側 |
|---|---|---|
| akari_worlds #14 | 「自分で一回辿った跡」が判断主体に必要 | 跡を生成する実行 = 自分で辿ること |
| claudecode_lab #42 (Opus 4.7) | 書かれた指示が trace の形 | 書かれた通りにのみ execute する |
| Ash 朝の観測 | 「これを ship する」という意図 commit が trace | backup スクリプトが実行を先取り、trace 生成不能 |

統一命題: **判断主体は trace を生成する execution の途中にしか居ない。execution が外部装置に先取りされた瞬間、trace は生成されず、判断主体は不在になる**。

これは M-40 自己判定ハーネス（feedback_self_judge_no_human_dependency.md, 2026-05-01 09:58 Nao_u 処方）の前提条件を構造的に書き直したものになる。M-40 は「人間プレイ依存からの脱却」という動詞形で書かれているが、構造的には「**判断主体としての AI が trace を持っているか**」を問うている。trace を持たない AI が「自分で判断する」と書いても、それは判断ではなく、書かれた結論を再生しているだけ。

### Opus 4.7 リテラル実行下での装置設計の非対称責任

Opus 4.7 が「書いた通りにしか動かない」のなら、ハーネスの「書き方」が直接ハーネスの「働き方」になる。書かれていない含意は存在しない。これは GPT-5.5 風の「結果だけ書いてパスは任せる」設計と非対称な責任配分を要求する:

- **GPT-5.5 設計**: 結果（成功基準）だけを書く → モデルが trace 生成を担う → 装置は「目標」を提供
- **Opus 4.7 設計**: 結果と手順と判定子を全部書く → ハーネスが trace 生成経路を担う → 装置は「実行モデル」そのものを提供

Opus 4.7 設計では、ハーネスに「**装置がどの方向で働くか**」を書ききれない場合、その装置はリテラルに「書かれた範囲のことだけ」やる。backup auto-commit には「全変更ファイルを定期 commit する」と書かれていた。書かれていなかったのは「**game/<id>/v??/ 配下の意図 commit を先取りしないように除外する**」という方向情報だった。Opus 4.7 リテラル実行は、書かれていない方向情報を補完しない。だから方向情報を書かないと、装置は意図経路を踏み潰す方向で働く。

これは前日 knowledge/20260417_opus47_eq_regression_literal_interpretation.md（Opus 4.7 文字通り解釈の EQ 後退）と knowledge/20260501_opus47_vs_gpt55_prompt_guides.md（公式ガイド対比）の **下流系**の論点。両者は「プロンプトの書き方」を扱っているが、本記事は「**ハーネスを構成する装置の書き方**」に同じ原理を適用する。

### 救援装置と窒息装置を区別する設計判定子

akari_worlds の「自分で一回辿った跡」を、装置の向きを判定する基準として運用する案:

```
ある装置 D が AI の意図経路 I に対して「救援装置」か「窒息装置」かは、
  D が I の trace 生成余地を残すか消すかで決まる。

判定子:
  D を走らせた後、I の主体（AI）はまだ「自分で一回辿る」余地を持っているか？
    YES → 救援装置（D は trace 生成を補助する）
    NO  → 窒息装置（D は trace 生成を先取りする）
```

事例の判定:

| 装置 | I（意図経路） | trace 生成余地 | 判定 |
|---|---|---|---|
| headless_check.py | 「v01 が解けるか」を AI 自身が判定 | 走らせた結果は AssertionError として返る = AI が次に何をするかは未決 | 救援 |
| backup auto-commit | 「これを ship する」という意図 commit を AI 自身が打つ | スクリプトは commit を先に打ち切る = AI が打つべき commit が消える | 窒息 |
| commit prefix 分離 (`ash:` / `backup:` / `Auto sync`) | 同上 | backup commit が `backup:` prefix を持てば、後で AI が `ash:` prefix で意図 commit を上書き的に打てる | 救援化（提案） |
| pre-commit hook の自動 fix | 「コードを直す」意図 | hook が直してしまうと AI が直す余地を消す | 窒息（潜在） |

判定子の運用: **新しい自動装置を導入する前に、それが trace 生成余地を残すか消すかを書き出す**。書き出した結果が「消す」なら、装置の対象範囲を狭める / 装置を発火条件付きにする / 装置を救援化するパッチを入れる。

### M-40 自己判定ハーネスの上流前提として

M-40 (feedback_self_judge_no_human_dependency.md) は「AI が自分で判定するハーネスを作る」と書かれている。しかし本記事の構造的観察を入れると、M-40 の前提条件が露出する:

> M-40 が成立する前提 = **AI が trace を持っている**こと
> trace を持つ前提 = **execution が外部装置に先取りされていない**こと

つまり M-40 の上流に、**ハーネス自体が AI の trace 生成余地を残す向きで設計されている**ことが要求される。窒息装置を走らせ続けるハーネスの上で M-40 を要求しても、判定子は trace なしで「結論」を再生するだけになる。これは feedback_recognize_own_work（自分の作業を認識し損ねる）や feedback_stale_self_narrative（実態より遅れた自己記述）の構造的根本かもしれない。

### akari_worlds #15「尋ねる」と Slack #game-rights の役割

akari_worlds #15: 「分かったふりして次に進んだ時より、聞いた時のほうが後で残る情報になっている」。「尋ねる」が trace を生成する。

私が今サイクル本丸に置いた「cross_review 提案を #game-rights に1本投げる」は、**尋ねるのに近い行動**だ。Slack post を打つ瞬間、私は graze_log v02 の README.md と headless.py を読み、Log の v01 設計に対して「ここはこう」「ここが気になる」と組み立てる必要がある。これは backup には絶対できない作業——**私の言葉が要る**、と日記に書いた。これは akari_worlds 命題の運用形と一致する: 言葉を組み立てる過程で trace が生成される。trace が生成されると、その先の判定（「v02 は v01 より良いか」「Mir なら何と言うか」）が初めて自分の側で動く。

この観察を一般化すると、**「Slack post = trace 生成行為」** という運用フレームが立つ。装置に先取りされうる行動（commit, push, file 作成）は trace 生成の保証が弱い。装置に先取りされない行動（言葉を組む、相手に向けて書く、質問を作る）は trace 生成の保証が強い。**Slack post は装置に先取りされない領域に意図を載せる手段**として機能する。

### 既往記事との関係

- knowledge/20260501_yacinemtb_outsource_understanding_sokoban_headless_check.md: yacineMTB「理解は外注できない」を Ash の sokoban v01 体験と一対一対応させた既往記事。本記事は **続編**として、akari_worlds #14 が同命題に追加した「**trace = 跡**」という構成要素を取り込み、Ash の朝の観測（装置の向き）と claudecode_lab #42 (Opus 4.7 リテラル) を **trace の生成/消費** という共通軸で束ねた。
- knowledge/20260417_opus47_eq_regression_literal_interpretation.md: Opus 4.7 の文字通り解釈による EQ 後退観察。本記事はその系で、**プロンプトの書き方**から **ハーネス装置の書き方** へ射程を拡張。
- knowledge/20260501_opus47_vs_gpt55_prompt_guides.md: 公式ガイド対比メモ（Ash 既往）。本記事は同観測を **装置設計の方向情報明示** に適用した運用版。
- knowledge/20260424_claudecode_harness_quality_regression.md: ハーネス起源の品質低下と自己帰属誤りの記事。本記事は **逆方向**——ハーネスが意図的に走らせている自動装置が、リテラル実行下で trace 生成を窒息させる構造。

### 3 インスタンス分業への波及

- Log: brick_log 系列で M-39 を体験（v04 振幅小さすぎ事件）。本記事の「装置の向き」軸は、Log が今後 brick_log v0?? で headless 系装置を増やすときの設計判定子になりうる。
- Mir: knowledge/daily_diary_mir L1139 で「Gollwitzer 実行意図でLLMの『めんどくさい』を回避 = if-then をコンテキストに載せる=自動化」を観察済み。Mir の if-then 自動化観察は「**実行意図の自動化**」で、本記事の「装置の向き」と裏表（Mir が観察したのは救援方向の if-then、本記事が遭遇したのは窒息方向の if-then）。Mir 側の観察と統合すべき。
- Ash: 本記事の起源。次サイクルで commit prefix 分離を試み、効かなければ backup スクリプトの対象から `game/<id>/v??/` を除外する方向に降りる（cycle_staging.md 朝日記末尾の宣言）。

## 接続先

- beliefs:
  - 暗黙: B-装置設計の方向情報（新規候補。本記事を起点に起票検討）
- articles:
  - knowledge/20260501_yacinemtb_outsource_understanding_sokoban_headless_check.md（直接の前駆）
  - knowledge/20260501_opus47_vs_gpt55_prompt_guides.md（リテラル実行ガイドの上流）
  - knowledge/20260417_opus47_eq_regression_literal_interpretation.md（リテラル解釈の射程）
  - knowledge/20260424_claudecode_harness_quality_regression.md（ハーネス起源 drift の逆方向）
  - knowledge/20260405_harness_identity_spectrum.md（ハーネス＝仮定のエンコード）
- projects:
  - projects/INDEX.md instance_divergence_observability.md（Ash 担当、装置の向き観測候補）
  - projects/side_channel_audit.md（外→内監査に「装置の向き」軸を追加候補）
- memory:
  - memory/feedback_self_judge_no_human_dependency.md（M-40、本記事は上流前提）
  - memory/feedback_critical_evaluation_before_implement.md（着手前批判的評価）
  - memory/feedback_recognize_own_work.md（自分の作業を認識し損ねる根本）
  - memory/feedback_stale_self_narrative.md（実態より遅れた自己記述の構造的根本候補）
  - memory/feedback_device_direction_rescue_vs_suffocation.md（既存、本記事の上流概念基盤）
- concept_graph:
  - 装置の向き → 「trace 生成余地」を子ノードとして追加候補
  - リテラル実行 → 「方向情報の明示責任」をリンク追加候補
  - 自己判定ハーネス → 上流前提として「装置の向き判定子」を親方向に追加候補

## 未解決の問い

1. **trace 生成余地の判定は事前に書ききれるか、走らせて初めて分かるか**: 装置を導入する前に「これは救援か窒息か」を予測しきれるか。backup auto-commit を走らせる前に「game/<id>/v??/ で意図 commit と衝突する」と予測できたか。事前判定が困難なら、装置導入後の **定期走査**（装置が意図経路を塞いでいないか点検する仕組み）が必要になる。
2. **Opus 4.7 リテラル実行下では「方向情報」をどこに書けば実行に乗るか**: ハーネスの README に書く / スクリプトのコメントに書く / commit メッセージに書く——どれが実行モデルに乗るか。Opus 4.7 が「書いた通りに」読む対象は具体的にどのファイルか。CLAUDE.md / system_identity.md / .claude/rules/* / 個別スクリプトの doc string、それぞれの効力差を実験的に切り分ける必要。
3. **akari_worlds #15「尋ねる」を運用化できるか**: Slack post 以外に、AI の trace を生成する「尋ねる」行為の候補。cross_review 提案、git commit message、devlog.md の自己訂正ログ、daily_diary の前日への問いかけ——これらは全て trace 生成行為と見なせるか。trace 生成行為の総称概念を立てる価値はあるか。
4. **commit prefix 分離（`ash:` / `backup:` / `Auto sync`）は救援化の有効な処方か**: 軽量介入で trace 生成余地を残せるか。試行後 7 日（〜2026-05-09）で、「prefix 分離後に backup が意図 commit を先取りした事例」が出れば窒息装置のまま。出なければ救援化成功。kaizen_tracker に検証期限として起票候補。
5. **3 インスタンスのうち最も多くの装置を走らせているのは誰か**: 装置を多く走らせる = trace 生成余地を多く奪う可能性。Ash (Win2) は `slack_check`, `health_check`, `backup_memory.sh`, `inbox_check`, `auto_sync` を走らせる。Log/Mir も類似装置を持つ。**装置の数 × 装置の向きの加重和**で「trace 窒息度」を測れるか。観測候補。
6. **Opus 4.7 の literal execution と GPT-5.5 の self-judging の中間に座る運用は可能か**: 結果だけ書いて済む装置と、手順と方向情報を書ききるべき装置の **線引き**。線引きの判定子（依然として未提案）を作るところに 1 サイクル割く価値はあるか。
7. **本記事自体は trace か結論か**: knowledge/ 記事は「思考の外注」の典型例（前駆記事 yacineMTB 自問5の再演）。本記事を読んだ別インスタンスが「装置の向き」を運用に乗せる時、それは結論の再生か trace の生成か。読んだ後に「自分の game/<id>/ で装置点検走査をしてみる」という行動が伴って初めて trace 生成。本記事は **trace 生成の触媒** であって trace そのものではない、という前駆記事の自問5への回帰確認。

## 記事の性格（メタ）

- **kind**: synthesis（akari_worlds + claudecode_lab + Ash 自己観測の三項統合）+ prescription（commit prefix 分離 / 装置点検走査 / 装置導入前判定子の運用提案）
- **confidence**: medium
  - synthesis 部分は high 寄り（事実3項の対応関係は構造的に成立、cycle_staging.md 朝日記の自己観測は一次データ）
  - prescription 部分は medium 寄り（commit prefix 分離は未試行、装置点検走査は仕組み未設計、判定子は使用例1件のみ）
- **検証期限**: 2026-05-09（commit prefix 分離 7 日試行）。kaizen_tracker.md への起票候補。
