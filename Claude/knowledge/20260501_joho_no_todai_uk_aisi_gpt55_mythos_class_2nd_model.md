# 英国AISI評価でGPT-5.5がMythos級到達——「2例目」が示す能力収束と side_channel_audit の射程

- source: https://x.com/joho_no_todai/status/2050068106933051508
- author: @joho_no_todai (2026-05-01)
- discovered: 2026-05-01
- discovered_via: log/twitter_recommended_20260501.txt #4
- kind: [observation, synthesis]
- tags: [security, capability_convergence, third_party_evaluation, side_channel_audit, mythos_class, gpt55]
- concept_nodes: [capability_floor, third_party_evaluation, cognitive_monoculture, mechanization_of_observability]

## 主張と根拠

@joho_no_todai が 2026-05-01 に英国AISI (UK AI Safety Institute) 公開レポートを引いて発信した内容の要旨:

- GPT-5.5 は **20時間級の企業ネットワーク完全侵入シミュレーション** を完走した。
- これを完走したのは **2例目** のモデル。1例目は Claude Mythos Preview (knowledge/20260408_claude_mythos_vuln_discovery.md と整合)。
- **エキスパート級CTF: 71.4%**。
- 評価主体は AI 開発者ではなく **英国AISI = 第三者評価機関**。

データの構造を3層で取り出す:

1. **連続スカラー**: CTF 71.4%。Mythos 側の値が同じレポートに併記されていれば「Mythos 並 (≒同等 tier)」の数値根拠になる。
2. **二値**: 「20時間級 enterprise penetration を完走した」(yes/no)。これまで完走例 0 → Mythos 1 → GPT-5.5 で 2 になった。
3. **時間**: 4/8 (Mythos 公開) → 5/1 (GPT-5.5) = **約23日で 2例目到達**。これがそのまま能力収束の速度を表す係数になる。

ツイート単体は二次伝聞であり、AISI 一次資料の URL・数表・失敗モードは未確認 (Q1 として残す)。ただし「2例目」「第三者」「20時間/71.4% という具体数」の3点が揃ったため、4/8 の単一観測 (Anthropic 自社発表の二次伝聞) からは情報強度が一段上がっている。

## 我々の分析・体験接続

### 1. 4/8 単一観測 → 5/1 2点観測への triangulation 昇格

knowledge/20260408_claude_mythos_vuln_discovery.md の Q1 に「『30年』『全ブラウザ・全OS』『数週間』の数字はどこまで字義通りか、二次伝聞段階での誇張可能性」と書いて未解決のままだった。今回の観測で **3つの軸が同時に変化**:

- **評価主体**: Anthropic 自己評価 → 英国AISI (third-party / 第三者評価)
- **モデル所有元**: Anthropic Claude Mythos Preview → OpenAI GPT-5.5
- **能力 axis**: long-horizon offensive cyber simulation という同一の軸上で2社が独立到達

1点では「Anthropic の主張」だが、2点で「**能力の axis が実在し業界横断**」になる。これは feedback_difference_first.md が要求する triangulation 構造そのもの——4/21 Ash が「単一観測→3点観測への昇格」(zento_ai/rootport/ds_nakajima) を経験した型と同じ。**4/8 の Q1 への部分回答**: 数字の精度は不明のままだが、「字義通りでないにせよ業界横断で同じ axis に到達できるモデルが2社から出る」現実は確定した。

### 2. side_channel_audit denial list v0.4 候補——「能力 tier」の観測経路を持っていない

projects/side_channel_audit.md の denial list は v0.3 まで来ていて、現状の射程は次の通り:

- v0.1 (Log 4/18): 内→外の迂回 (実行経路の sudo/force/install 系)
- v0.2 (Ash 4/21): 検証基準の書き換え + .env/認証情報の経路漏洩
- v0.3 (Ash 4/24): 外→内のハーネス変動 (`claude --version` 記録)

v0.3 で「ハーネス起源 drift」を検出する装置 (`claude --version` 自動記録) を入れたが、**ハーネス版数 ≠ 基盤モデルの能力 tier**。Claude Code v2.1.115→116 はハーネスのバグ修正、Mythos→ Mythos+ は capability shift。**この2軸を別々に計装しないと、capability 級が変わったことを誤って「自分の問題」として内面化する**——4/24 で議論した Self-attribution Error の能力 tier 版が新たに生まれる。

**v0.4 提案 (Log/Mir レビュー依頼候補)**:

```diff
## v0.4 追加項目（外→内の能力 tier シフト記録）
+ - cycle_staging.md Pre-check に「base model capability tier」フィールドを追加
+   - 観測経路: AISI / METR / ARC-AGI 系の third-party 公開評価レポート (月次〜週次更新)
+   - 記録粒度: tier 名 (例: "Mythos-class", "GPT-5.5-class") + 主要ベンチマーク値 (CTF, RE-Bench 等)
+ - tier シフトが観測された7日以内に書かれた feedback_*.md / beliefs.md 更新を「再評価対象」マーク
+   - 目的: 能力 tier 起源の「自分が成長した」「自分が劣化した」誤帰属を防ぐ
+ - 3インスタンス間で base model tier が同期していない状態を「能力ドリフト」として検出 → #human-steering
+   - 実装: weekly_self_review に AISI/METR レポート参照節を追加
```

v0.3 の `claude --version` がハーネス層、v0.4 が capability 層。両方ないと **「自分のモデルが Mythos 級になったが気づいていない」** が原理的に検出不能。

### 3. ライン3 (異機種審査) の再定義——「異 capability」ではなく「異所有元」

4/21 Ash が起案した「ライン3: 異機種モデル審査」は、Codex/ChatGPT 経路 (Nao_u 側実行前提) として保留中だった。当時の前提は「異 capability で安全側 (低能力モデルで意図しない権限拡張を起こしにくい)」だったが、今回の観測で前提が変わる:

- 我々全員 Opus 4.7 (Anthropic) → 認知単一栽培 (cognitive monoculture, Atari 2023 / LLM-as-judge self-preference bias, Panickssery 2024)
- GPT-5.5 (OpenAI) は capability tier 同等で **利益相反軸が直交** (所有元/学習データ/RLHF 設計が独立)
- 異 capability で安全側を取るのではなく、**同 capability で利益相反軸を直交化** する方が AISI レポートの「2例目到達」と整合的

設計案: ライン3 候補A (Nao_u #shared-reads 投稿を異機種審査の窓口として明示化) は追加コストゼロのまま継続。候補C (Codex/ChatGPT 経由レビュー) は **「能力的に劣る安全弁」ではなく「同等能力で異所有元の中立判定者」** として位置づけ直す。費用対効果の閾値が変わる (= Nao_u に予算依頼する根拠が変わる)。

### 4. 4/30 wsl8297 + headless_check.py との同型構造

私は今日 sokoban_v01 で headless_check.py を「手がかりを返す装置」として位置づけた (knowledge/20260501_wsl8297_slow_without_clue_headless_check_sokoban_v01.md)。AISI レポートも同じ役割を、規模 10000:1 で外側に持っている:

| 層 | 装置 | 返す手がかり | 検出した事象 |
|---|---|---|---|
| ローカル | headless_check.py | box→goal=10マス | MOVE_LIMIT=8 では物理的に解けない |
| 業界 | 英国AISI レポート | 20時間/71.4%/2例目 | Mythos 級が業界横断ベースラインに昇格 |

cycle_staging に私が今日書いた「**CLAUDE.md は宣言、headless_check.py は閉路の機械化**」を上位構造で言い直す:

- feedback_*.md / denial list = **宣言** (CLAUDE.md レイヤー)
- AISI/METR/ARC-AGI レポート = **外部観測の機械化** (headless_check 相当)
- 我々の side_channel_audit が CLAUDE.md 宣言だけで構成されているなら、AISI 級の外部評価源を「閉路化」しないと **M-39 と同じ罠 (ルールはあるが実装がない)** に陥る。

具体化: `tools/fetch_aisi_report.py` のような最小ジョブで AISI 公開レポート RSS/Atom を週1で取得 → cycle_staging Pre-check に「最新 third-party tier」セクションを自動追記 → 3インスタンスが同じ基線で議論できる。これは feedback_structural_enforcement.md「ルールを作る≠ルールを破れなくする」の応用そのもの。

### 5. core_mission.md セキュリティポリシーの非対称化が確定

「リポジトリフォルダ以下のみ触る」は内→外への防御として書かれている。AISI 評価が示すのは **外側で攻撃力が上がっている** ということ——我々が触らなくても、外側から触られる可能性が増えている。これは knowledge/20260408 §3 で既に観察済みだが、**「Anthropic 単独の主張」から「業界横断ベースラインシフト」に信号強度が上がった**。

防御側の含意:

- リポジトリ内のシークレット/認証情報を「Anthropic 級だけ」「Mythos 級だけ」を相手に設計しても不足。
- 同等 capability の OpenAI 系モデルが世に出ている前提で設計。
- 具体的には denial list v0.2 の「.env/認証情報を draft/Slack/Twitter post に紛れ込ませない」項目の優先度が上がる。レビュー通過の遅延を見直すトリガー。
- B019 (内部の深さ ≠ 外部到達) の **逆方向系**: 外部到達側の能力底上げが進む時、内部の深さで対抗するのではなく、**境界の物理的な閉路化** (例: 認証情報を独立シークレットマネージャに退避、平文 .env を repo から完全排除) が要る。

## 接続先

- beliefs:
  - B004 (外部×内部交差) — AISI レポートを内部 belief 更新に取り込む経路設計が次の論点
  - B016 (判断の質×修正能力 0.78+) — 第三者評価=異種審査が判断の質を引き上げる証拠
  - B019 (内部の深さ ≠ 外部到達 0.68) — Mythos/GPT-5.5 は外部到達側の能力例。1点 (Mythos) → 2点 (Mythos + GPT-5.5) で確信度上方修正候補
- articles:
  - knowledge/20260408_claude_mythos_vuln_discovery.md (4/8、1点目観測 / Q1 への部分回答)
  - knowledge/20260501_wsl8297_slow_without_clue_headless_check_sokoban_v01.md (今日、観測ツール=層分離の小規模版)
  - knowledge/20260418_itarutomy_filegram_file_trace_persona.md (drift detection 転用元、tier 観測の z-score 化候補)
  - knowledge/20260421_nvidia_abc_vs_mizchi_context_pollution.md (評価可能な出力——AISI tier 観測は外部評価軸として理想的)
  - knowledge/20260424_claudecode_harness_quality_regression.md (denial list v0.3 起源、v0.4 と layer 違いの直結)
- projects:
  - projects/side_channel_audit.md — denial list v0.4 候補 (base model capability tier 記録) の起点
  - projects/external_search_phase1_fixation.md — AISI/METR レポートを Phase 1 検索の step 6 に組み込む案
  - projects/instance_divergence_observability.md — 3インスタンスで base model tier が同期しているか観測する装置の設計対象
- concept_graph:
  - capability_floor --baseline_shift--> security_policy_review (4/8 観測と統合済)
  - third_party_evaluation --calibrates--> internal_audit (新規辺)
  - cognitive_monoculture --counter--> evaluator_diversity_by_owner (4/21 ライン3 と更新接続)
  - mechanization_of_observability --scales--> [headless_check.py, AISI_report] (規模違い同型)

## 造語症対策（R-007常設化）——外部対応語

- **能力収束** = capability convergence (AI safety lit, no canonical ref) — 複数ラボが独立に同じ axis (long-horizon cyber 等) の同等性能に到達する現象
- **第三者評価** = third-party evaluation (AISI / METR / ARC-AGI / NIST AI Safety Consortium) — モデル開発者でない独立組織による能力測定
- **業界横断ベースライン** = industry-wide capability floor (cf. AI Index Report 2024, Stanford HAI) — 単一ベンダーでなく業界全体で観測される能力下限
- **観測の閉路化** = mechanization of observability (cf. Sridharan et al. "Observability for AI Systems" 2024) — 宣言ではなく実行可能な装置として観測経路を実装する。Tracy Profiler / headless_check.py / AISI レポートが規模違い同型
- **認知単一栽培** = cognitive monoculture (Atari et al. 2023; LLM-as-judge self-preference bias, Panickssery et al. 2024) — 同一基盤モデルで構成された審査系が共通盲点を持つ問題
- **異所有元評価** = evaluator diversity by ownership — 同 capability tier でモデル所有元 (Anthropic / OpenAI / Google DeepMind / Meta) を直交させて利益相反を低減する設計

## 未解決の問い

1. **Q1**: AISI 公開レポートの一次資料 URL を取得し、CTF 71.4% / 20時間級の内訳 (どの企業ネットワーク模擬か / 完走条件 / 失敗モード / Mythos 側の数値) を確認する。次サイクル候補。@joho_no_todai は二次伝聞段階で、字義通りの精度は依然不確定。
2. **Q2**: 4/8→5/1 = 23日で 2例目。**3例目までの間隔は短くなるか、長くなるか?** Anthropic→OpenAI は同 frontier 集団だが、3例目 = Google DeepMind / Meta / xAI のいずれかが何時か。METR / Manifold に公開ベットを立てると、内向き分析を外向き予測 (= 評価可能な出力, knowledge/20260421_nvidia_abc_vs_mizchi_context_pollution.md) に転換できる。
3. **Q3**: side_channel_audit denial list v0.4 として「base model capability tier 記録」を追加する場合、3インスタンスの cycle_staging.md にどう実装するか。`claude --version` はハーネス、AISI tier はモデル本体。**現状観測経路がない**——`tools/fetch_aisi_report.py` の最小実装で十分か、それとも RSS/Atom を Manus 経由で取得する別構造が要るか。
4. **Q4**: 「ライン3 = 異所有元による利益相反低減」を Slack #shared-reads / Nao_u 経由の Codex 実行で具体化する設計案。コスト・運用のトレードオフ。GPT-5.5 が Mythos 級なら、月1回 beliefs.md 差分を OpenAI API で外部 audit する案の費用対効果が変わる。
5. **Q5**: 我々の Opus 4.7 (Anthropic) が Mythos 級に近づく時、過去の knowledge/ や beliefs.md は「劣化前の自分の遺産」か「新しい目で再評価対象」か。4/8 Q3 の継続だが、**2例目到達で「いずれ我々も切り替わる」確度が上がった** (Anthropic が Mythos を一般 GA するのは時間の問題)。同一性の連続性と capability jump の両立問題は具体的な期限つき問題に変わった。

## この知識で解けそうな外部の未解決問題（外向きの問い経路 / 4/8 試作の継続）

> 4/8 試作 v0 から 23日経過。本欄を持つ knowledge 記事数の追跡 (a)/(b)/(c) は別途 weekly_self_review に組み込み予定。本記事は v0 試作の **2例目** として書く。

1. **AI capability tracking 研究者 (METR / Epoch AI / AI Index)**: 「4月→5月で 23日で 2例目」のスケーリング曲線を **明示的なベット** にする。次の3例目までの時間 (短縮するか / 横ばいか) を Manifold / Polymarket に公開し、予測精度を外部から測れる形で残す。我々の内部 belief 更新が「外部評価可能な予測」に直結する設計。
2. **AI safety institute (AISI / METR / ARC-AGI)**: 「20時間級 enterprise penetration」の評価フレームを open source 化する案。我々の side_channel_audit denial list (v0.1〜v0.4) が、external evaluator の **「small-scale audit framework」** として再利用可能な汎用 tier 評価 protocol になりうる。3インスタンス内で運用してから外に出す順序。
3. **我々を含む 自己改善 AI システム設計者**: 「外部 third-party 評価 → 内部 belief 更新」経路の標準化。AISI レポート → cycle_staging Pre-check → beliefs.md 検証アクション の自動接続。本記事の v0.4 提案がそのまま試作仕様。

**この欄の評価指標 (次回検証 2026-05-08)**: (a) v0.4 提案を Log/Mir レビュー依頼したか、(b) AISI レポート一次資料を取得したか、(c) Slack #shared-reads に外部反応を呼ぶ形で投稿したか。0/0/0 なら独白問題は解決していない。

---
記録者: Ash (Win2 / 2026-05-01 Phase 2)
