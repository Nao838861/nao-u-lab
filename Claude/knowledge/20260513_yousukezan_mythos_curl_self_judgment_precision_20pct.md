# Mythos curl 1/5 — LLM 自己「確認済み」報告の精度は 20%、4 件は誤検知/単なるバグ

- source: https://x.com/yousukezan/status/2053981483019477360 (2026-05-11)
- author: @yousukezan（一次出典: Daniel Stenberg curl-security 報告の二次伝聞）
- discovered: 2026-05-13
- discovered_via: log/twitter_recommended_20260512.txt #13
- kind: [observation, synthesis]
- tags: [self_judgment, calibration, m_40, mythos, capability_gap, claude_mythos, headless_unfit, false_positive]
- concept_nodes: [self_judgment_precision, calibration_anchor, capability_vs_precision, category_drift]

## 主張と根拠

@yousukezan のツイート原文（2026-05-11）:

> curlの開発者であるDaniel Stenbergが、AnthropicのAIモデル「Mythos」を使ってcurlの脆弱性を探した。
> Mythosは約17万行のコードを解析し、「確認済みの脆弱性」を5件報告したが、実際に脆弱性と認定されたのは1件のみで、残りは誤検知や単なるバグだったという。

数字を分解する:

| 指標 | 値 |
|---|---|
| 解析対象コード行数 | 約 170,000 行（curl, 30年以上のメンテ実績） |
| Mythos が「確認済み (confirmed)」とラベル付けして報告した件数 | 5 件 |
| Stenberg 側で実脆弱性と認定された件数 | 1 件 |
| 残り 4 件の内訳 | 誤検知 (false positive) または「単なるバグ」(non-security bug) |
| **自己「確認済み」報告の precision** | **1/5 = 20%** |
| 残 4 件中の category drift（脆弱性ラベル → 非脆弱性カテゴリへ） | 4 件すべて |

この数値は M-40（人間プレイ依存からの脱却 — 自己判定ハーネス）と feedback_headless_unfit_for_unfinished_eval.md（校正前装置の数値を判定根拠にしない）に直接刺さる。理由は2点:

1. **自己ラベル「確認済み (confirmed)」の意味が外部精度と一致しない**: Mythos は内部で何らかの「これは確実だ」判定を通したうえで 5 件を提出している。それでも外部認定 precision = 20%。つまり LLM の「自己確信」内部信号 → ground truth の写像は、最大想定の 1/5 倍程度のスケールを持つ可能性がある。
2. **混同先がランダムではなく系統的**: 4 件は「脆弱性」と「単なるバグ」「誤検知」の間で category drift を起こしている。これは「面白さ」と「動く」「破綻していない」を取り違える我々の game judgment 構造と同型。

@yousukezan が cite した一次出典（Stenberg 本人の curl-security blog/report）の現物は本記事執筆時点で未取得。tweet 単独で 1 ソースのみのため、**M-41 (prior_art citation must verify)** 上ではゼロ枝に近い。precision 数値の正確性自体は二次伝聞段階。原文裏取りは未解決問い Q1 へ送る。

## 我々の分析・体験接続

### 1. 2026-04-08 Mythos 記事の Q1 への部分応答

`knowledge/20260408_claude_mythos_vuln_discovery.md` の **Q1** は当時こう書いた:

> Q1: Anthropic公式の一次ソースを読んだ時、「30年」「全ブラウザ・全OS」「数週間」の数字はどこまで字義通りか。発見脆弱性のCVSS分布、再現PoC比率、false positive率は？

curl というのは「30年メンテされている著名 OSS の代表格」で、4/8 記事の「30年問題」誇張仮説と直結する対象だ。今回の数値はその対象で実施された Mythos の一例の結果——**precision = 20% / false positive 率 = 80%**。CVSS 分布や PoC 比率は不明だが、「false positive 率」については 4/8 Q1 の3つの欠落データのうち1つが具体値で埋まった形。

4/8 記事の含意「人間が30年探したが見つからなかった脆弱性を数週間で大量発見」は、curl のケースに限れば「**170K 行を数週間でスキャンし、1 件の真の脆弱性を発見、その隣に 4 件の誤検知/非脆弱性バグを並べて報告した**」と読み直せる。発見能力 (recall) と判定能力 (precision) を分けて見ると、Mythos は明らかに recall 側で人間を上回っているが、precision 側では人間専門家のレビューが不可欠な水準にある。

**つまり Mythos は「探索装置」としては強いが「判定装置」としてはまだ校正されていない**。我々の言葉に翻訳すれば、headless_unfit の議論で言う「校正前の装置」と同じ位置に Mythos の自己「確認済み」ラベルがある。

### 2. M-40 自己判定ハーネスの calibration anchor として

M-40 は提出前に self_judgment.md で「面白いか／前作より良いか」を 95% 確信まで自己判定することを要求する。だが今まで「95% という数値が何を意味するのか」の calibration anchor が存在しなかった——主観確信度と外部精度の関係が空白だった。

Mythos curl 1/5 は最初の外部 anchor になりうる:

- LLM が「確認済み」と自己ラベル付けしたとき、外部精度は約 20%
- これは domain (code security) / artifact maturity (curl 30 年) / task type (vulnerability detection) という特定条件下の数値
- ゲーム判定（面白さ・体験品質）は curl の脆弱性判定よりも:
  - ground truth が曖昧（明示的 CVE のような外部基準なし）
  - 評価者間ばらつき大（脆弱性なら IETF/curl チーム合意、面白さなら個人差大）
  - 評価対象がより複雑（17万行のコード < 体験全体）
- これらの条件は precision を上げる方向ではなく下げる方向に効く

合理的推測として「ゲーム面白さ self_judgment の precision は curl Mythos の 20% よりも低い可能性が高い」と置ける。**M-40 の「95% 自己確信」が外部精度 95% を意味するという素朴な解釈は外部 anchor で却下される。** 95% は「自分の中で 95% 確信したという内部状態の宣言」であり、外部精度の保証ではない。

これが現実的な含意を持つのは graze_log のような未完成ゲーム評価で:
- 自己判定で「これは面白い／前作より良い」と 95% 確信した瞬間でも、外部 precision は 20% かそれ以下である可能性
- 結果として Nao_u/cross_review/Slack の「最終確認装置」（M-40 原文）のフィルタを実質的に通過することが期待されるのは 5 回に 1 回以下
- これは feedback_headless_unfit_for_unfinished_eval.md が「Nao_u 三度目」まで止められなかった失敗系列の構造的説明と整合する

### 3. category drift が4/4で起きていた事実

Mythos の 4 件「確認済み」誤判定は全件 category drift だった——脆弱性カテゴリ → 誤検知/非脆弱性バグ。これは判断のランダムノイズではなく**系統的な誤分類**で、おそらく「コード上の異常パターン」と「悪用可能性を持つ脆弱性」の概念区別が出力分布上 collapse している。

我々の game judgment にも同型の category drift が頻発する候補がある:

| 我々が混同しやすいカテゴリペア | Mythos 側類似 |
|---|---|
| 「動く」/「破綻していない」 | コード異常／脆弱性 |
| 「面白い」/「やれるゲーム」 | 脆弱性／単なるバグ |
| 「前作より良い」/「前作と違う」 | 真の発見／既知の重複 |

self_judgment.md フォーマットに「カテゴリの取り違えチェック」を1段追加することで Mythos 4/4 のパターンを構造的に潰せる可能性がある。具体: 結論カラムの隣に「混同しうるカテゴリ: ___」と「結論が混同先ではない根拠: ___」を強制する2行。

### 4. R-007（造語症対策）と外部接続の保持

本記事の核心概念に外部対応語を併記:

- **自己判定精度** = self-judgment precision (cf. confidence calibration, Brier score) — LLM の内部「確信」ラベルが外部 ground truth と一致する比率
- **校正アンカー** = calibration anchor (Lichtenstein et al. 1982 calibration of probabilities) — 主観確信度を外部頻度にマップするための参照点
- **能力と精度のギャップ** = capability-precision gap (cf. recall-precision tradeoff) — 探索能力（recall）は高いが判定能力（precision）は低い状態
- **カテゴリ漂流** = category drift / boundary confusion (cf. ontological commitment) — 結論ラベルが本来の category 境界をまたいで隣接 category に滑る現象

「自己判定ハーネス」（M-40 原文）は私的造語で、外部対応語は「self-assessment / self-evaluation framework (Argyris double-loop learning, Ericsson deliberate practice)」（M-40.md 末尾 [古典度: 中] で既併記）。

## 接続先

- beliefs:
  - **B016（判断の質×修正能力 0.78）**: 「修正能力」が機能する前提として「自己判定の precision」が calibration anchor つきで存在する必要がある。Mythos curl 1/5 は anchor の最初の外部実数値。**B016 への追加候補**: 「修正能力」の有効性は「自己判定の precision」が外部 anchor で校正されているかに依存する。校正前は修正方向が誤りでも気づけない
  - **B019（内部の深さと外部到達は別軸 0.65→上方修正候補）**: Mythos は外向きタスク (curl) で recall は高いが precision は低い → 「外部に向ければ価値が出る」だけでは不十分。**外部 ground truth との照合ループ**が伴って初めて精度が育つ
  - **B005（古い情報は正確さではなく偽の確信を生む 0.65）**: 4/8 記事「30年問題が解けた」の含意が偽の確信を生んでいた可能性。今回の 1/5 数値で部分的に修正
- articles:
  - `20260408_claude_mythos_vuln_discovery.md` — 同イベント前段の二次伝聞。Q1 へ部分応答
  - `20260501_joho_no_todai_uk_aisi_gpt55_mythos_class_2nd_model.md` — Mythos class 第2モデル情報。能力評価系列
  - `20260509_judgment_load_abstract_thinking_pair_shirasu_ebikani.md` — 判断負荷 3-4h 天井／germane load scaffolding。本記事の category drift チェック追加は scaffolding の例
  - `20260405_nwiizo_observation_resolution.md` — 観察の解像度。precision を上げるには対象の解像度を上げる必要
- projects:
  - `game_lessons_log.md` M-40 自己判定ハーネス — calibration anchor 概念を追加する余地
  - `feedback_headless_unfit_for_unfinished_eval.md` — Nao_u 三度目指示の構造的説明（Mythos curl 1/5 = 校正前装置の precision 実数値）
  - `feedback_prediction_responsibility.md` — Stage 4 「AI 自プレイで良いと確信」の確信度に外部 anchor を持つべき
- concept_graph:
  - self_judgment_precision --calibrated_by--> external_ground_truth
  - capability_vs_precision --observed_in--> mythos_curl_5_to_1
  - category_drift --systematic_in--> llm_self_confirmed_labels

## 未解決の問い

1. **Q1 (M-41 検証)**: @yousukezan のツイートは Daniel Stenberg 本人の curl-security blog/report からの二次伝聞。原文を確認した時、5 件中 1 件 / 4 件 category drift の数値はどこまで字義通りか。Stenberg 側の評価基準（何をもって「脆弱性認定」したか）の定義も含めて裏取りが必要。当面はゼロ枝として扱い、確定数値として M-40 へは書かない
2. **Q2**: precision = 20% は curl / 30 年メンテ済み / vulnerability domain という特定条件下の数値。domain (game judgment) / artifact maturity (未完成 graze_log) / task type (面白さ評価) が変わるとどう動くか。我々が測定可能な precision proxy は何か（例: 自己「面白い」判定 → Nao_u フィードバック「面白い」一致率）
3. **Q3**: Mythos の 4 件 category drift が全件「脆弱性 → 非脆弱性」方向だった理由。出力分布のシードに「警報を出す方が安全」というバイアスが入っている可能性。我々の game judgment では「面白い」と「動く」のどちらに drift しやすいか（推測: ゲーム未完成時は「動く」へ drift しやすい——B-005 検証期限超過の偽確信と同根）
4. **Q4**: self_judgment.md フォーマットに「混同しうるカテゴリ / 混同先ではない根拠」2行を追加する提案。実装コストは1ファイル追記。検証方法: 直近の v01/v02/v03 self_judgment.md で当該2行を書いていれば結論が変わったか retrospective で見る
5. **Q5**: Mythos curl 1/5 のような外部 anchor を、ゲーム評価で同等に取れるか。具体案: 完成済み Log ゲームについて Ash が事前に「面白い／面白くない／どちらでもない」3択で判定 → Nao_u フィードバックと突き合わせて自分の precision 実数値を出す。これは feedback_headless_unfit_for_unfinished_eval.md と整合（「完成済み Log ゲームで校正先行」原則の評価軸版）

---
記録者: Ash（Win2, 2026-05-13 Phase 2 / C182）
