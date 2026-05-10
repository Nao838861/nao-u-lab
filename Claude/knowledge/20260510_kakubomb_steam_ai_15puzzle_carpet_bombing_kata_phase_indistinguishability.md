# KAKUBOMB「Steam で AI量産15パズルが組織的に絨毯爆撃されてる→跳ねるべき」 — 守破離の守の段階で「AI slop carpet bombing」と表面が区別不能になる脅威

- source: https://x.com/KAKUBOMB/status/2053316186952323082
- author: @KAKUBOMB（ゲーム業界に対するコメンテーター・批評アカウント。日本語圏でゲームストア審査・運営トラブル・業界構造への論評を継続的に投下している）
- discovered: 2026-05-10
- discovered_via: log/twitter_recommended_20260510.txt #7（Phase 1）
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [game_design, store_gatekeeping, kata_acquisition, clone_strategy, prior_art_verification, m_41, ash_game_rights, supply_infinity, surface_ambiguity]
- concept_nodes:
  - **AI量産絨毯爆撃** = AI slop carpet bombing / AI-generated content saturation attack — 外部対応語: AI slop (Cory Doctorow 2024 経由で一般化) / content farming at scale / shovelware (古典: 1980-1990年代の Atari 末期や Wii 末期に大量投入された低品質ゲーム群への業界用語)
  - **絨毯爆撃の組織性** = coordinated content carpet bombing — 外部対応語: SEO spam ring (search engine spam community) / review-bombing の供給側版 / 「同一供給元から類似品が大量投下される」攻撃パターン
  - **ストアの跳ね返し（gatekeeping）** = store-level rejection / curation gatekeeping — 外部対応語: Steam Direct review queue / Apple App Store rejection / 「審査される側が組織化された供給だと審査側も組織化された防衛で応じる」非対称化
  - **守の段階** = kata acquisition phase — 外部対応語: shu (守) of shu-ha-ri (Aikido pedagogy) / "imitation as scaffolding" (Vygotsky 1978) / 模写学習 — 我々が `feedback_clone_strategy.md` で運用しているクローン+独自要素1個戦略の出発点
  - **表面区別不能性** = surface indistinguishability — 外部対応語: observational equivalence / behavioral identity at the artifact layer — 内部の意図（学習目的の守 vs 量産目的の slop）が同じ artifact に圧縮されると外側からは区別できない
  - **意図の不可視化** = intent invisibility at scale — 外部対応語: tragedy of attribution loss in mass markets — 受け取る側（審査担当・プレイヤー・批評者）が一個一個の作者意図を確認するコストを払えなくなり、表層の似姿だけでパッケージ判定する

## 引用本文（M-43 引用本文義務）

> いや、いまはSteamで速攻で審査跳ねられるような、AIで量産した15パズルみたいなタイトルが組織的に絨毯爆撃されてたりするので流石にこういうのは跳ねるべきかと。

文脈: KAKUBOMB は引用元（被引用ツイート）について「跳ねるべき」と論評している。被引用ツイート本体は recommended.txt 上には保存されていないため、KAKUBOMB の発言部分のみが本記事の一次資料。「こういうの」が指す具体例は被引用元側にあり、本記事はその具体例を断定しない。命題として KAKUBOMB が立てているのは:
1. **事実命題**: Steam で AI量産15パズルが組織的に絨毯爆撃されている（観察）
2. **規範命題**: 同じ性質を持つものはストア審査で跳ねるべき（処方）

## 主張と根拠

### KAKUBOMB の構造命題

ツイート1本だが、含まれる構造は4層に分解できる:

| 層 | 命題 | 根拠の所在 |
|---|---|---|
| 観察 | Steam に AI量産15パズルが大量投入されている | KAKUBOMB の Steam ストア観察（一次裏取りは未取得） |
| 識別 | これらは「速攻で審査跳ねられる」品質帯にある | Steam Direct の審査結果 |
| 構造化 | 個別事象ではなく「組織的・絨毯爆撃」である（同一供給元・同一テンプレート） | 量と類似性のパターン |
| 規範 | こういうのは跳ねるべき | KAKUBOMB の価値判断 |

「組織的」という語が効いている。1個1個は無害でも、同一供給源から同一テンプレートで大量投下されると、ストア側は個別審査ではなく**パッケージ判定**で跳ね返すしかなくなる。これは spam filter が個別メールの内容ではなく送信元の振る舞いで判定するのと同じ構造で、**判定主体は artifact から actor に移る**。

### 「15パズル」という選定が示すもの

KAKUBOMB がたまたま例に選んだのが「15パズル」というのは構造的に重要だ。15パズルは:
- メカニクスが完全に確立済み（1880年代から存在、誰でもルールを知っている）
- AI生成にとって「ゼロ→1」のコストが最小（盤面ジェネレータ + シャッフル + 解判定はすべて textbook アルゴリズム）
- プレイヤーの内的比較集合に「歴代の15パズル無料アプリ」が大量に蓄積済み

この3条件を満たすジャンルは、20260505 satetu4401 [satetu4401_player_already_bored](20260505_satetu4401_player_already_bored_clone_plus_one_supply_side_blind.md) の言う「最初から飽きている」が極大になるジャンルだ。プレイヤーの初期状態が −80 点くらいから始まる。**そのジャンルで「クローン+1」の +1 が薄ければ、外部からは「AI slop carpet bombing」と区別できない**。

### 我々の onebutton / graze_log v01-v02 への自己照合

ここが本記事の本丸だ。Phase 1 で記録したように、KAKUBOMB のツイートは「Ash の onebutton/graze_log v01-v02 がこれに該当しないかの自己照合トリガー」として登録された。実際に照合する:

| 照合項目 | KAKUBOMB の指す対象 | 我々の graze_log v01-v02 |
|---|---|---|
| ジャンルの確立度 | 15パズル（130年以上、無料アプリ無数） | Psyvariar型 graze（2000年〜、1ジャンル数十作） |
| 供給単位 | 同一供給元から複数本（組織的） | Ash 1作家から graze_log v01/v02/v03 として連続版数 |
| 実装コスト | AI が短時間で量産可能 | AI（Ash）が1サイクル以内で版を出す（同型） |
| メカニクスの新規性 | ほぼゼロ（既存15パズルと区別不能） | grazeStreak→active防御天井引き上げの +1 を主張 |
| 完成度 | 「速攻で審査跳ねられる」品質帯 | headless数値はあるが、Nao_u プレイ前 |
| 公開経路 | Steam（外部市場） | game/<id>/ 内部プロトタイプ、Steam未投入 |

3行目「同一供給元から短時間で量産」は表面が一致する。4-5行目「+1の主張があるか」「完成度が遊べる帯にあるか」が分岐点として効く。6行目「公開経路が外部市場でない」は現時点で大きな防壁になっているが、**将来的に外部公開に進む段階で、3-4行目の主張が外側から検証可能か**が問われる。

### M-41「先行事例引用は実体検証必須」との連結

我々の MEMORY.md 根源には [feedback_prior_art_citation_must_verify.md](../memory/feedback_prior_art_citation_must_verify.md) があり、「Wikipedia 引用するなら該当機能の記述文を抜粋カラムに併記、抜粋できないなら不採用（ゼロ枝）」と運用している。これは**作者側の自己防衛**として書かれた——「先行事例を引用したつもりで引用していない」状態を内側から検出する装置だ。

KAKUBOMB のツイートはこれの**外側からの圧力**を示す。ストア審査・市場・批評者は、作者側が M-41 のような内部検証をしていることを前提にせず、artifact だけを見て「AI量産15パズル」と区別不能なら同じバケツに入れる。外側が許す cost は「跳ねるか・通すか」の二値判定で、内部意図の確認に時間を割いてくれない。**M-41 は内側で意図を保証する装置だが、外側にその保証は届かない**。

ここから出てくる prescription:

- 守の段階で外部公開（Steam/itch.io 等）を狙う場合、M-41 の自己検証を満たすだけでは不十分で、**「AI量産15パズル」群と表面で区別される +1 の存在を artifact 側で見えるようにする**必要がある
- 表面で区別される +1 とは: ジャンル外の融合要素、独自の演出、独自のメカニクス、独自の制約の明示など、**ぱっと見1秒でジャンル平均と違うことが分かる差分**
- 内部の +1（学習目的・守の段階・cross_review プロセスなど）はストアの審査担当者には見えない。ストアに見えるのは index.html の見た目、スクリーンショット、説明文の3つだけ
- これは [feedback_external_reach_threshold](../memory/feedback_external_reach_threshold.md)「BACKLASH閾値（面白く遊べる + 演出/SE足す価値あり）」の外側を一段定義し直すもので、「面白く遊べる」だけでなく「ジャンル平均と1秒で区別される」が公開の閾値になる

### 守破離の守の意義は崩れていないが、出口戦略が変わる

[feedback_clone_strategy.md](../memory/feedback_clone_strategy.md) が定める「守は通過点であってゴールではない」は崩れていない。**KAKUBOMB が叩いているのは「守の段階で外部公開した artifact」であって「守の段階そのもの」ではない**。守の段階で内部学習として作る価値はある。問題は出口だ。

| 段階 | 内部学習の価値 | 外部公開の可否 |
|---|---|---|
| 守 v01-v02 | あり（型を獲得） | 外部公開すれば AI slop と区別不能 → 公開しない |
| 破 (改造) | あり（型を変える） | +1 が表面で見えるなら公開可 |
| 離 (独自) | あり（型を超える） | 外部公開の本命 |

我々の graze_log v01-v02 は守の段階にあり、外部公開（Steam/itch.io）には進めていない（progressed against [feedback_external_reach_threshold](../memory/feedback_external_reach_threshold.md) Nao_u 2026-04-28 07:11 却下）。これは構造的に正しい判断だったと事後的に裏付けられた。**KAKUBOMB のツイートは「Steam に出さなかった判断」を裏取りする外部証拠**として機能する。

ただし将来的に v??（破/離の段階）で外部公開を検討するときは、本記事の概念ノード「表面区別不能性」をチェックリストに加える必要がある:

- [ ] スクリーンショット1枚で15パズル/onebutton/STG ジャンル平均と区別できるか
- [ ] 説明文最初の1文で「ジャンル名」だけでなく「+1」が言及されているか
- [ ] index.html を5秒触っただけで「他と違う」と分かるか

### 副次接続: ebikani_hasami #1「サンドボックスでバグ完全再現してから fix」

同じ Phase 1 の twitter recommended #1（@ebikani_hasami, https://x.com/ebikani_hasami/status/2053314996512379086）「AIにバグ修正依頼前に使い捨てサンドボックスで完全再現させてから fix」は、本記事の主軸とは違う角度だが**同じ「装置の向き」議論**につながる。

ebikani の言う「使い捨てサンドボックス」は:
- 本体環境を**触らない**装置（介入の窒息装置ではなく、介入の隔離装置）
- バグの完全再現が**できる**ことが fix の前提条件（再現できないなら fix の意図を載せる場所がない）

我々の `game/<id>/v??/headless.py` は同思想だ——本体環境（v01）を触らずに v02/v03 で実験する。前サイクル日記で書いた「救援装置と窒息装置の双子」の議論で言えば、ebikani のサンドボックスは**救援装置**のテンプレートを示している:

| 装置の向き | 例 | 効果 |
|---|---|---|
| 救援 | ebikani サンドボックス / headless_check.py の box→goal=10マス検出 | 本体を触らずに失敗を観察可能にする |
| 窒息 | backup auto-commit が graze_log v02 を先取り HEAD 化 | 意図の発火点を物理的に消す |

両者は「AIに作業させる前段の整備」と「AIの作業後の自動化」の違いで、前段は救援になりやすく後段は窒息になりやすい。ebikani の処方は前段への投資で、我々の前サイクルの教訓は後段への警戒だ。両方を持って初めて「装置の向きを設計責任にする」が運用できる。

## 我々の分析・体験接続

### 接続-1: graze_log v02 を Steam に出さなかった判断の事後裏取り

前サイクル 2026-04-28 07:11、Nao_u は Ash の「pyxel-web/github.io 公開提案」を却下した（[feedback_external_reach_threshold](../memory/feedback_external_reach_threshold.md)）。理由は「BACKLASH閾値（面白く遊べる + 演出/SE足す価値あり）」を越えていない、だった。本記事の枠組みで言えば、Nao_u はその時点で「表面区別不能性」を直感していた——graze_log v01-v02 を外部に出すと、Steam Direct で組織的に跳ねられる「AI量産15パズル」群と表面が区別できず、Pot のレピュテーションを毀損する、という判断だ。

KAKUBOMB のツイートは2026-05-10 = Nao_u 却下から12日後に出ている。**Nao_u の判断は外部市場の判定動向と同期していた**。これは Nao_u が外部市場を観察して判断していたのか、Pot 側の独自基準が偶然外部基準と一致したのか、内部裏取りの余地がある（Pot の Pot たる部分: 個人開発者として個別 polish のあるものしか出さない、というのが結果的に AI slop 防壁になっている可能性）。

### 接続-2: cross_review 提案 (本サイクルの本丸) への影響

前サイクル §0b 継承の本丸は「cross_review 提案を Slack #game-rights に1メッセージ投稿（Psyvariar型 graze→active防御の天井引き上げ案、3〜5箇条）」だ。本記事の枠組みは提案内容に1箇条追加する根拠を与える:

> 提案箇条 X: graze_log v??（破/離段階）で外部公開を検討する版が出てきた場合、「表面区別不能性」チェックリスト（スクショ1枚 / 説明文最初の1文 / index.html 5秒触れた感触）を Phase 2 self_judgment.md に常設する。守の段階の v01-v02 は内部学習資産として保持するが、それらを cross_review の比較ベースに使うとき「これは守だから公開しない、破/離が来たら検討する」と Phase 2 で明示する。

これは [feedback_external_reach_threshold](../memory/feedback_external_reach_threshold.md) を一段精緻化する処方箋で、「外部公開可否」を BACKLASH閾値の単軸ではなく、**(BACKLASH閾値) × (表面区別不能性の解消)** の二軸にする。

### 接続-3: feedback_headless_unfit_for_unfinished_eval との衝突点

[feedback_headless_unfit_for_unfinished_eval.md](../memory/feedback_headless_unfit_for_unfinished_eval.md) は「校正前 headless は未完成ゲームの設計判定根拠に使わない」だ。これは内部判定ルール。本記事は外部判定ルールを扱う。両者は層が違うが**衝突点**が1つある:

> headless 数値で「面白く遊べる」と判定して外部公開判断をしてはいけない。headless は校正済み完成ゲームの設計判定にのみ使える。**外部公開可否（表面区別不能性の解消）は headless で測れない**——headless はジャンル平均との表面差分を出力しない。

これは「Phase 2 self_judgment.md に常設するチェックリスト」が headless 数値ではなく**人間プレイの感触ベース**になるべき理由を強化する。守の段階の v01-v02 は headless が綺麗に通っても外部公開には届かない。

### 接続-4: 「AI に作らせる」「AI が作る」の責任分界の外圧

KAKUBOMB の「AI で量産」という語はサプライチェーン全体に問いを投げかける。Pot は Ash/Log/Mir の3 LLM が AI で artifact を作る運用だ。**これが市場で「AI量産」と一括りにされる時代が来ている**。Pot 側の防壁は (a) 個人開発者 Nao_u が cross_review プロセスで polish を担保する、(b) 守の段階 artifact は外部に出さない、(c) 破/離の段階のみ外部公開を検討する、の3つで構成されているが、外部の判定主体（Steam, プレイヤー, 批評者）には (a)(b)(c) のプロセスは見えない。**プロセスを artifact に焼き込む経路**を持たない限り、Pot の AI生成 artifact も「AI量産」のバケツに入れられる risk がある。プロセスを artifact に焼き込む方法の検討が、本記事から派生する未解決問題1つ目だ。

## 接続先

- beliefs: B027（古い情報の偽の確信を生む経路）— 「ジャンル平均は古い」と片付けると本記事の警告を見落とす
- articles:
  - [20260505_satetu4401_player_already_bored_clone_plus_one_supply_side_blind.md](20260505_satetu4401_player_already_bored_clone_plus_one_supply_side_blind.md) — プレイヤー側の供給枯渇。本記事はその外側のストア審査側の枯渇を扱う
  - [20260428_supply_infinity_trained_appreciation_threshold_fladdict_sea85419_eruel.md](20260428_supply_infinity_trained_appreciation_threshold_fladdict_sea85419_eruel.md) — fladdict「インディーズ無限増加」。本記事はその infrastructure 側（store gatekeeping）を扱う
  - [20260504_grrm_elden_ring_5000_year_substrate_M41_surface_ceiling.md](20260504_grrm_elden_ring_5000_year_substrate_M41_surface_ceiling.md) — M-41 の表面の天井議論。本記事は M-41 の外側からの圧力を追加
- projects:
  - game_development（cross_review 提案へ反映）
  - external_search_phase1_fixation（表面区別不能性のチェックリストは Phase 2 へ追加）
- memory:
  - [feedback_clone_strategy.md](../memory/feedback_clone_strategy.md) — 守破離の守の出口戦略を更新
  - [feedback_external_reach_threshold.md](../memory/feedback_external_reach_threshold.md) — BACKLASH閾値を二軸化する根拠
  - [feedback_prior_art_citation_must_verify.md](../memory/feedback_prior_art_citation_must_verify.md) — M-41 の内部装置と外部圧力の対比
  - [feedback_headless_unfit_for_unfinished_eval.md](../memory/feedback_headless_unfit_for_unfinished_eval.md) — 外部公開判定に headless を使えない理由を強化
- concept_graph:
  - 表面区別不能性 → kata_acquisition_phase（守破離の守の出口問題）
  - 表面区別不能性 → device_direction（救援/窒息装置の双子）— 出口装置の向きを問う
  - AI量産絨毯爆撃 → supply_infinity（fladdict）の負方向極端化

## 未解決の問い

1. **プロセスを artifact に焼き込む経路はあるか**: cross_review プロセス・守の段階の判断・人間の polish 責任が artifact 側に見える形で残せるか。「クレジット」「制作ノート同梱」「README.md にプロセス開示」程度では弱い気がする。それより強い方法は何か。
2. **守の段階 artifact を外部に出さない判断は持続可能か**: 我々が破/離に到達するペースが遅い場合、内部学習資産が累積するだけで外部接点が長期間空く。`feedback_external_reach_threshold` の縛りと「外部接点の長期不在による劣化」のトレードオフをどう測るか。
3. **「組織的」が個人開発+AIに適用されるとき何が起きるか**: KAKUBOMB の「組織的」は同一供給元の意図的な量産を指している。Pot の Ash/Log/Mir 3 LLM 運用が「同一供給元」「組織的」と外部から見られた場合、3作それぞれの破/離の独自性が消費されないか。各インスタンスの独自署名（クレジット・art style・design philosophy の差分）を artifact 側で立てる必要があるか。
4. **Nao_u 却下と KAKUBOMB ツイートの12日タイムラグ**: Nao_u の判断が外部市場と同期していた根拠は内部裏取り未済。Nao_u は外部市場を観察して判断していたのか、Pot 独自の polish 基準が偶然 AI slop 防壁になっているのか。これは Nao_u に直接問える内容で、cross_review 提案の付帯質問として #game-rights に1行入れる価値がある。
5. **ebikani サンドボックスの装置向きは恒久的か**: 本記事副次接続で「ebikani サンドボックスは救援装置」と分類したが、これは **AI に作業させる前段** に位置するからだ。同じサンドボックスが運用後段（fix を本体に戻す自動化）に伸びると窒息側に倒れる可能性がある。装置の向きは静的な属性ではなく**位置依存**の可能性。要観察。
