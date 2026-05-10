# プレイヤー知覚変化を軸にしたクローン段階とAI量産の区別境界 — mollifier × KAKUBOMB 統合分析
- source: https://x.com/mollifier/status/2053326433204982255 / https://x.com/KAKUBOMB/status/2053316186952323082
- author: @mollifier (シューティング上達観察) / @KAKUBOMB (Steam審査の話)
- discovered: 2026-05-10
- discovered_via: Twitter おすすめ巡回 (log/twitter_recommended_20260510.txt #7 二件)
- kind: [synthesis, prescription]
- confidence: medium
- tags: [game_design, perception, clone_strategy, ai_mass_production, shooting_genre, judgment_criterion]
- concept_nodes: [perception_change, clone_distinction_boundary, AI_mass_production, scaffolding_directionality]

## 主張と根拠

### mollifier 原文 (2026-05-10)
> シューティングゲームのお話です。昔ちょっとやってたシューティングを最近やる機会がありました。そうすると、昔見えなかった弾が見えるようになっていました。明らかに当時より簡単に感じました。(1/2)

主張: シューティングの上達 = **プレイヤーの知覚が変化した結果**。同じゲーム・同じ難度設定でも、プレイヤーが「見える/見えない」の閾値を上げれば体感が変わる。ゲーム側のパラメータ調整ではなく、プレイヤー側の知覚レンズが書き換わるという観察。

### KAKUBOMB 原文 (2026-05-10)
> いや、いまはSteamで速攻で審査跳ねられるような、AIで量産した15パズルみたいなタイトルが組織的に絨毯爆撃されてたりするので流石にこういうのは跳ねるべきかと。

主張: AIで量産された 15パズル型タイトル = ship数を最大化して絨毯爆撃する戦術 = Steam 審査が外部装置として「跳ねる」べき対象。判定基準は文中で言語化されていないが、「跳ねるべき何か」が成立しているという外部審査の実在。

### 統合: 同日に並んだ偶然の意味

両ツイートは独立だが、同じ Twitter おすすめ巡回(2026-05-10)で並んで取り込まれた。並べると、片方が判定軸の正の極を、片方が負の極を照らしている構造が見える。

| 軸 | 良い側 (mollifier) | 悪い側 (KAKUBOMB) |
|---|---|---|
| プレイ後のプレイヤー側変化 | 知覚レンズが書き換わる (見えない弾が見える) | 何も書き換わらない (15パズルはどれを遊んでも同じ) |
| ship数 vs ship密度 | 1個を長く遊んで密度を獲得 | ship数を最大化、密度ゼロ |
| 外部判定装置の向き | 体験者本人の自己観察で確認 | Steam 審査が tools として跳ね返す |
| 上達の素材 | 「上達できる」=ゲームが知覚学習装置として作用 | 「上達できない」=ただの時間消費 |

ここから抽出される判定境界仮説: **「ある一定時間遊んだ後、プレイヤーの知覚が変化するか」がクローン段階の改変が AI 量産と区別される境界線である**。

私的用語の対応: **知覚変化** = perceptual learning (Eleanor Gibson 1969) — 同じ刺激を反復経験することで弁別閾値が下がり、以前見えなかった特徴が見えるようになる現象。ゲームでは攻略法の習得とは別に「見えるようになる」層が走っている。

## 我々の分析・体験接続

### graze_log v01→v02→v03 を「知覚変化軸」で読み直す

`feedback_clone_strategy.md` は「クローン+改変1個」の型を規定するが、改変の質を測る軸は「削除可能性」「面白さ最低再現」までしか書いていなかった。mollifier × KAKUBOMB を入れると、**改変1個が「プレイヤー知覚を何処に動かすか」を明示できる**。

- **v01 (Log Galaga クローン)**: プレイヤーは「敵の弾道予測+自機回避」の知覚を要求される。クローン元の Galaga が既に知覚変化装置として機能している
- **v02 (Ash graze判定)**: 「弾の近接通過」を内部 score に変換する装置を追加。プレイヤーの注意を「avoid だけ」から「avoid + 近接接触」に**配分換え**するよう促す。これは知覚レンズの追加レイヤー
- **v03 (Psyvariar型 grazeStreak active 防御)**: 「弾を見て avoid」+「弾を見て graze で稼ぐ」+「streak 中は active 防御で踏み込む」の三層注意要求。プレイヤーの**注意配分を能動的に書き換える**改変
- v03 の `predicted_play.md` で書いた「streak 中は弾を恐れずに前へ出る判断が要求される」は、まさに「知覚レンズの書き換え」の言い換え

つまり **v01→v02→v03 の改変は「削除可能改良1個」であると同時に「知覚変化を1段ずつ深める改良」** として再記述できる。

### KAKUBOMB が刺す位置

Phase 1 で書いた通り、graze_log v03 を Slack #game-rights に出荷依頼する直前にこの外部視点が刺さる。「v01 / v02 / v03 の改変は AI 量産の 15パズル絨毯爆撃と何が違うか」を答えられるかが Steam 跳ね返し相当の外部審査を通せるかの代理指標になる。

判定試案: 各 vN について「この vN を一定時間プレイした人は、プレイ前と何か違う知覚が獲得されているか」を1行宣言する。宣言できなければ、その改変は AI 量産側の絨毯爆撃の1個と同じ層にいる可能性がある。

### feedback_clone_strategy.md への接続

`feedback_clone_strategy.md` 17:04 の「最低限第三者に遊んでもらえるくらいの価値」条項は、この知覚変化軸で具体化できる。**第三者が遊んだ後に「何かが見えるようになった」と言えるなら、最低限の価値は成立している**。逆に「何も書き換わらなかった」なら、形無し低品質の側に落ちている。

### 「装置の向き」(救援/窒息) との接続

前サイクル日記で記録した「救援装置 (headless_check.py) と窒息装置 (backup auto-commit) の双子問題」は、**プレイヤー知覚変化を起こす装置 vs 起こさない装置** という別側の同型構造として再記述できる:

- 良いゲーム = プレイヤー知覚を変化させる救援装置
- AI 量産 15パズル = プレイヤー知覚を変化させない窒息装置 (時間を消費させるだけ)
- Steam 審査 = 窒息装置を物理的に跳ね返す審査装置
- 我々の `headless_check.py` / `predicted_play.md` / `self_judgment.md` = **自分のゲームが救援/窒息どちらに作用しているかを着手前/出荷前に判定する装置**

私的用語の対応: **装置の向き** = directionality of automation / scaffolding vs constraint design — 同じ「自動化」でも、人間の意図を補助する向き (scaffolding) と人間の意図を消す向き (constraint that suffocates intent) が別物として設計可能。

### shared-reads / 外部摂取としての位置

両ツイートは Twitter おすすめ巡回で同日に並んだ偶然の組合せだが、`feedback_difference_first.md` に従って「違う点・見落とし」を先に書くと:
- 我々が `feedback_clone_strategy.md` で立てた「削除可能性」「最低再現」「decisional gates」の3軸では、AI 量産との区別を**プレイヤー側の変化**として記述する語彙が足りていなかった
- mollifier 観察が示すのは「プレイヤー側の経年変化」だが、我々のテストプレイは「初回プレイ時の体感」しか観測できない。**この時間軸の差**が現状ペンディング

## 接続先

- beliefs: 関連する低確信度信念は現時点で未起票 (新軸として候補)
- articles:
  - `knowledge/20260501_kiyoshi_shin_codex_30min_2d_fighter_clone_vs_fun_gap.md` — クローン+30分制約と「面白さの gap」
  - `knowledge/20260501_player_taste_15s_pitch_ion039_banditknight.md` — プレイヤー嗜好の検出装置
  - `knowledge/20260503_gosrum_rule_generator_LLM_competition.md` — LLM がルール生成、不在時間に出力が時間を埋める構造
- projects:
  - `projects/game_development.md` — graze_log の上位
  - `projects/INDEX.md` Active セクション
- memory:
  - `feedback_clone_strategy.md` — 守の段階・削除可能改良・最低再現の規定 (本記事は知覚変化軸を追加する形で接続)
  - `feedback_prediction_responsibility.md` — M-37〜M-40 連続体 (本記事の判定軸を Stage 3 / Stage 4 に投入できる)
  - `feedback_intake_game_balance.md` — ゲームデザイン能動混入 (本記事はその実践)
  - `feedback_difference_first.md` — 違いを先に書く (本記事冒頭で実践)
- concept_graph:
  - `perception_change` (新規ノード提案) → graze_log/v0X
  - `clone_distinction_boundary` (新規ノード提案) → AI 量産・Steam 審査
  - `scaffolding_directionality` (装置の向き) → headless_check.py / backup auto-commit / predicted_play.md

## 未解決の問い

1. **知覚変化の代理指標 (proxy metric)**: 初回プレイ時の体感だけ観測できる我々のテスト環境で、「経年的に獲得される知覚レンズの種」を予測できるか? `headless_check.py` 数値だけでは捉えられない層をどう推定するか
2. **改変1個ごとの知覚変化宣言**: 各 vN の `self_judgment.md` に「この vN を一定時間プレイすると、プレイヤーの何が見えるようになるか」の1行宣言を追加すべきか。これは規定として固定化すると `feedback_few_rules_big_effect.md` 違反だが、自己点検の問いとしては有効
3. **AI 量産との外部視点での区別**: 我々の v01/v02/v03 を Steam 審査が見たら跳ねるか通すか。実際に出すまで分からないが、跳ねる側に滑り込まないための着手前自己点検は何か
4. **時間軸ギャップの埋め方**: mollifier 観察は「数年/数ヶ月単位の経年変化」だが、我々のテスト依頼は「30分単位の初回プレイ」。両者を橋渡しする中間スケール (例: 同一プレイヤーの第N回プレイ比較) を観測できるか
5. **装置の向き判定の定常化**: backup auto-commit が窒息側に作用したように、我々の自動化装置 (cron / loop / 自動 commit / 自動 backup) が意図経路を塞いでいないかを定期的に走査する仕組みは何か。前サイクル日記の「次の M-?? として要る」と書いた件の具体化

## 履歴

- 2026-05-10 17:56 Twitter おすすめ巡回(50件読み)で #7 @KAKUBOMB / #7 @mollifier (twitter_recommended_20260510.txt 別欄) を観測
- 2026-05-10 中に external_notes_ash.md に KAKUBOMB のみ追記、mollifier 未統合のまま Phase 1 終了
- 2026-05-11 00:48 Phase 2 で両ツイートを並べ直し、本 knowledge 記事として統合分析を結晶化 (Ash/Win2)
