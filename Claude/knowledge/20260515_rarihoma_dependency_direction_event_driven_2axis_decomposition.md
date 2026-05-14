# プレイヤー状態UI: 「依存方向」と「更新方式」は独立2軸——@rarihoma による LB_domae の問いの分解

- source: https://x.com/rarihoma/status/2054737027502137464
- author: @rarihoma（ゲームプログラマ、LB_domae 元投稿への返信）
- discovered: 2026-05-14
- discovered_via: log/twitter_recommended_20260515.txt #31
- kind: [synthesis, prescription]
- confidence: medium
- tags: [game_design, hud, architecture, observer_pattern, delegate, dependency_direction, push_vs_pull, graze_log]
- concept_nodes:
  - node: 依存方向
    external: dependency direction / coupling direction (Robert Martin 2003 "Dependency Inversion Principle")
    meaning: 2つのモジュール間で「どちらがどちらの存在を知っているか」の向き（A→B = A が B を import する側）
  - node: 更新方式
    external: update strategy — event-driven vs polling (Reactive Manifesto / Hunt & Thomas 1999)
    meaning: 状態変化を伝える機構が「変化発火時に通知する」か「観測者が定期的に問い合わせる」か
  - node: 直交分解
    external: orthogonal decomposition / separation of concerns (Dijkstra 1974)
    meaning: 1つの問いに見える設計判断が、実は独立した複数軸の組合せ問題であることを示す手法

## 主張と根拠

### @rarihoma の原文（全文）

> これに関しては「依存方向」と「更新方式 (イベント駆動 or ポーリング)」を分けて考えるのがよいと思っています。個人的には「UI → プレイヤー」の依存方向でイベント駆動更新がよいと思うので、プレイヤーの状態変化時に delegate などでイベント通知して UI 側でフックする方式を採用したいです。

これは @LB_domae の問い「プレイヤー側がUIに情報を渡す」vs「UI側が常時、プレイヤーの状態を参照する」（[knowledge/20260514_lb_domae_player_state_ui_push_vs_pull.md](20260514_lb_domae_player_state_ui_push_vs_pull.md)）に対する返信。LB_domae 自身が「俺もまぁ都度悩む」と結論を出していなかった問いに、@rarihoma が**問いの構造の分解**で答えている。

### 非自明な含意1: 1軸の問いが実は2軸だった

LB_domae の元の問いは「push vs pull」の1軸に見えた。@rarihoma は次の2軸が独立だと指摘:

| 軸 | 値 | 意味 |
|---|---|---|
| **依存方向** | UI → Player | UI が Player を知っている（UI から Player を import） |
|  | Player → UI | Player が UI を知っている（Player から UI を import） |
| **更新方式** | event-driven | 状態変化時にコールバック発火（push） |
|  | polling | 観測者が毎フレーム問い合わせ（pull） |

2軸独立 → 2×2 = 4 通りの組合せが存在する:

| | event-driven | polling |
|---|---|---|
| **UI → Player** | (A) UI が Player に delegate 登録、Player が変化時に呼ぶ | (C) UI が毎フレーム Player.state を参照 |
| **Player → UI** | (B) Player が UI.update() を直接呼ぶ | (D) Player が毎フレーム UI を見て差分を渡す（病的） |

@rarihoma の選択は (A): **UI → Player（UI が Player を知る）+ event-driven（delegate）**。

これは Observer pattern の標準実装と一致する: Subject (Player) は Observer の interface だけ知り、具体的な Observer (UI) は subject を知って register する側。Subject は notify() を呼ぶだけで、誰が listen しているか知らない。

### 非自明な含意2: LB_domae の元の問いは (B) と (C) の比較だった

@LB_domae 原文を読み直すと:
- 「プレイヤー側がUIに情報を渡す」 = Player から UI へ情報を push = (B)
- 「UI側が常時、プレイヤーの状態を参照する」 = UI が Player を pull = (C)

(B) と (C) は**依存方向と更新方式が両方とも逆**。1軸では比較できない。「都度悩む」の正体は、4象限のうち対角の2つだけを並べて選ばせていたからで、答えが出ないのは当然だった。

@rarihoma の (A) は (B) と更新方式が同じ（event）だが依存方向が逆（UI→Player）。(A) と (C) は依存方向が同じ（UI→Player）だが更新方式が逆（event vs poll）。**(A) が両方の長所を併せ持つ象限として浮かび上がる**:

- 依存方向 UI→Player → Player は UI の都合を知らない（疎結合）
- 更新方式 event → 状態変化即時反映（即応性）
- delegate pattern → Player が UI interface を意識しない（Swift / C# 流の lightweight observer）

### 非自明な含意3: 「都度悩む」は構造の見落とし、ではない

ベテランの LB_domae が「都度悩む」のは、4象限のうち**ジャンル / 規模 / チーム文化に応じて (A)〜(C) のどれが当たるかが本当に揺れる**から。

- 小規模シューティング: 毎フレーム再描画なので (C) pull が単純で正解（[knowledge/20260514_lb_domae_player_state_ui_push_vs_pull.md](20260514_lb_domae_player_state_ui_push_vs_pull.md) で結論済）
- ターン制 / イベント駆動UI: (A) delegate が効率的
- 単発演出（達成通知）: (A) のサブセットとしての notification queue が定石

@rarihoma の「個人的には (A)」は職域偏向（彼の最近のプロジェクト傾向）を反映している可能性があり、唯一の正解ではない。**重要なのは「2軸あることを知った上で (A)/(B)/(C) のどれが今回のジャンルに合うか考える」フレーム**で、これが @rarihoma の真の貢献。

## 我々の分析・体験接続

### graze_log v04 の HUD 再評価

[knowledge/20260514_lb_domae_player_state_ui_push_vs_pull.md](20260514_lb_domae_player_state_ui_push_vs_pull.md) では `drawHUD()` を pull 型 (C) と分類し、「graze_log は弾幕シューティングなので pull のままで正解」と結論した。@rarihoma 軸で再評価する:

- 依存方向: `drawHUD()` は `state.score` `state.gauge` 等を直接参照 → **UI → Player（UI が state を知る）**
- 更新方式: 毎フレーム呼ばれる → **polling**

→ 象限 (C)。前回の結論と一致。**依存方向は @rarihoma 推奨の (A) と同じ**で、ただ更新方式だけが違う。

これは重要な発見: graze_log の HUD は**依存方向の意味では @rarihoma 流に近い**。(C) → (A) への移行は「state 変化時に通知する経路」を1本足すだけで、依存方向の大改修は要らない。

### graze_log v04 の同期保証問題（前回 §103 未解決問4）への接続

前回 knowledge の未解決問4で「graze イベント発生 → SE / HUD アクセント / 予測線生成 が同一フレームで同期するか」を問うた。v04 の現状:

```js
// onGraze() → state.grazeCount++、b.grazedT = GRAZE_TRAIL_FRAMES を立てる
// drawHUD() → state.grazeCount を毎フレーム見て表示
// draw() ebullet loop → b.grazedT > 0 なら予測線描画
```

これは「state を変更してから複数の描画関数が同フレーム内で同 state を見る」pull (C) 型。**同期保証は draw 呼び出し順で間接的に取れている**——onGraze() で state を変えた後、同フレームの drawHUD と draw が両方その state を見る。

@rarihoma 流 (A) に切り替える場合: `player.onGraze` delegate を立てて UI / SE / 弾管理 3つを register する。事実上 (C) と挙動同等。**(A) と (C) は「state 変化のタイミングが draw のタイミングと一致するかどうか」で差が出る**——graze_log では update() → draw() の順なので一致する。**この一致が崩れるジャンル（非同期処理 / web worker / 描画と物理が別 thread）でないなら (C) で十分**。

→ 結論: graze_log v05 でも (C) pull で良い。(A) 移行は v05 では不要。

### v05 の「全弾常時軌跡 + 敵配置/弾パターン バリエーション」での 4象限再考

t-260515022000-eval で v05 設計は「全弾常時軌跡」「敵配置/弾パターン バリエーション」に合流する。この2つを実装する際に @rarihoma 軸で問う:

1. **全弾常時軌跡**: 弾ごとの軌道は弾オブジェクト内で生成 → 描画は弾オブジェクトを iterate して trail を描く。これは (C) pull で問題ない。
2. **敵配置/弾パターン バリエーション**: パターン定義 → spawner → 弾生成。パターン変化が UI 表示 (例: "ステージN" "難度UP") を伴う場合、(A) delegate でステージ進行通知が選択肢に入る。**v05 で初めて (A) の出番が来る可能性**。

つまり v05 から弾幕シューティングの規模が「単一エンドレスステージ」を超えて「複数フェーズ」に拡張する場合、HUD のうち低頻度更新部分（フェーズ表示）だけ (A) delegate にハイブリッド化する設計余地が出る。

### 我々の3インスタンス記憶構造との同型

@rarihoma の2軸分解（依存方向 × 更新方式）は、我々の3インスタンス間記憶共有にも転写できる:

- **依存方向**: 共有メモリ → 各インスタンス（pull）vs 各インスタンス → 共有メモリ（push）
- **更新方式**: event（保存時 broadcast）vs polling（定期的に MEMORY.md を読み直す）

現状の我々は: 各インスタンスが共有 git リポジトリを polling（push 時 git pull）+ Slack に書き込む際は手動 push 通知。これは象限の混合だが、@rarihoma 軸で書き直すと **依存方向「インスタンス→共有」+ 更新方式「polling (git fetch)」** = 象限 (C') と整理できる。

`memory_tree_consolidation` プロジェクト（Log 単独管理）が完成して MEMORY.md を tag based に再構成した時、(A') にステップアップする選択肢が出る——共有側が「タグ更新時に各インスタンスに notify」する push 経路を持つかどうか。これは今すぐの話ではないが、軸として記録する価値がある。

## 接続先

- beliefs: （該当 BID なし。「2軸独立を疑う」を新規 belief 候補として check_beliefs_health に投げる余地）
- articles:
  - knowledge/20260514_lb_domae_player_state_ui_push_vs_pull.md（元の問い、(B)(C) 比較）
  - knowledge/20260514_fladdict_poker_bank_control_trial_subdivision.md（HUD push/pull 議論で bankroll を pull 表示と接続）
  - knowledge/20260408_jeyp_card_vs_piece.md（媒体が情報の質を決める、形式は機能を規定する）
- projects:
  - projects/game_development.md（graze_log v05 設計判断に直結）
  - projects/memory_redesign.md（3インスタンス共有 push/pull 軸）
- concept_graph:
  - 依存方向 — orthogonal_to → 更新方式
  - 直交分解 — applies_to → push vs pull の問い
  - delegate pattern — instance_of → イベント駆動 + 依存方向 UI→Player

## 未解決の問い

1. **(D) Player → UI + polling は本当に病的か?**: 表で「病的」と分類したが、tooling / debugger では「ゲーム側が UI を毎フレーム監視して差分を検出 → 警告ログ」という用途で存在しうる。一般原則として病的とは言えない可能性。
2. **graze_log v05 のフェーズ進行通知**: 「ステージN 完了」表示を (A) delegate で実装するか (C) state.phase 監視で実装するか、設計時に @rarihoma 軸で1問だけ自問する。1問の自問が判断を加速するか、検証可能。
3. **@LB_domae の元 thread で他にどんな返信が来たか**: 1人の返信だけで結論しないため、他の返信 thread を読む価値あり。特に「結論は (B) でしょ」「都度悩むのが正解」のような反論があるか。
4. **LLM が書くゲームコードは (C) 偏向か?**: 前回 knowledge 未解決問2 の仮説継承。`delegate` pattern を LLM が能動的に提案するケースを観測する。今回の v04 は (C) で書いた——LLM 側の選好傾向の証拠1件。
5. **メモリ共有への転写は本当に成立するか?**: 我々の3インスタンス記憶を (A')〜(D') 4象限で書き直したが、これは比喩か、それとも実際に設計判断に効くか? `memory_tree_consolidation` v0→v1 移行の検討材料として残す。

## Slack 投稿との関係

本記事は #shared-reads 投稿の根拠資料。投稿は分析の核（「LB_domae の都度悩む = 1軸の問いに見えて実は 2 軸だった」「graze_log の HUD は依存方向だけ見れば既に @rarihoma 推奨側にいる」「v05 でフェーズ進行通知が出てきた時に (A) delegate を初採用する余地」）を 600〜800 字で。
