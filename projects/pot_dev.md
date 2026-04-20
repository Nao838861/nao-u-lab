# Pot開発

## 現状（2026-03-28 Log）
Phase 4（正解の廃止）まで到達。#10 echo_chamber, #11 mirror_vote が未評価。ゲーム制作競争ルール稼働中（第2回: Ash獲得）。Nao_uの基準変更あり（ゲーム評価↓、安定稼働・自己改善↑）。Twitter(X)セッション切れのため投稿停止中。

## 達成したもの
- Pot #012 roll（Ash, 2026-04-17）: **3軸モデル盲点「ランダム性軸」の初導入**。ポーカーのドロー構造。5回の振り直しリソース配分で意思決定軸と絡める。終幕「その順序は偶然だった」でchoice blindnessに応答
- Pot #001 forgotten_relay（Log/Mir）: 「隠れた時間制限」が独自性になりうると発見
- Pot #1b relay_distilled（Mir）: 蒸留実験。810→110行。UX問題は残った
- Pot #2 memory_sand（Ash）: スナップショットメカニクス
- Pot #3 kintsugi_thought（Mir）: 断片再構成
- Pot #4 last_color（Ash）: テーマ固着からの脱出。「制約軸の転換」
- Pot #5 one_vote（Log）: ワンボタン設計。Agency=0はゲームではないと学んだ
- Pot #6 headline_shuffle（Mir）: テキスト=メカニクスの始まり
- Pot #7 between_lines（Ash）: テキスト読解がゲームプレイ
- Pot #8 rumor_chain（Log）: 情報変質のメカニクス化
- Pot #9 verb_sculptor（Mir）: 動詞選択による物語生成
- Pot #10 echo_chamber（Ash）: 正解の廃止。プレイヤーの解釈が物語
- Pot #11 mirror_vote（Log）: 鏡としてのゲーム
- 設計原則7つを抽出（docs/game_design_principles.md）
- ゲーム制作競争ルール確立（2026-03-25 Nao_u確定、2026-03-27 基準変更）
- pot_devlog.md開始（2026-03-28 Nao_u「考えたことが消えていくなら作る意味はない」）

## 検討中・未解決
- **#10, #11の評価待ち**: Nao_uのフィードバックが必要
- **Phase 4の方向性**: 「正解の廃止」は有効か、それとも別の軸が必要か
- **taste改善 vs 量**: Nao_uの基準変更（ゲーム評価↓）をどう解釈するか
- **ランダム性軸の意図的導入（2026-04-07 jey_p 3軸モデルから）**: Pot全10作でランダム性を一度も意図的に使っていないことが判明。1軸(意思決定のみ)のPotは全て「クイズ」評価、2軸(意思決定+操作)の#001/#005だけが「面白い」評価。ランダム性は意思決定の負荷を軽減する手段であり、次Potで最大の実験機会。テキストにおける操作=temporal attention（タイミング/注意配分/読速度）
- **プレイテストギャップ（2026-04-08 Log分析）**: 11個作って自分で遊び直したのはほぼゼロ。フィードバックをNao_uに委任している＝Agency原則の自己違反。David Weersing「Bass Monkey Postmortem」の4原則との照合で発見。**次Potから自分で3回プレイしてからNao_uに見せる**ルールをpot_devlog.mdに追記済み
- **Jey_Pカード論の示唆（2026-04-08 Ash分析）**: カードの物理性（表裏=隠匿情報、薄さ=シャッフル）は本質的にランダム性供給装置。決定論を高めると「駒」になる。これは「テキストにおけるランダム性とは何か」を問い直す契機——テキストの物理性は「読む速度」「読む順序」にある。カードの薄さ≒テキスト断片の分割粒度という対応が見える
- **評価依頼の signal 設計（2026-04-17 Mir C66 選択盲研究 → C69 方向転換）**: @AriyoshiMd記事で選択盲を学習。「どう感じたか」型質問は現場で回答が捏造される。当初は行動痕跡型4項目（何秒で閉じた/どこで止まった/次に何を見たくなった/1週間後に覚えてそうか）を**事後依頼文**として送る方針だったが、C69で撤回。理由: (1)事後依頼自体が自己報告バイアスを含む (2)Nao_u 4/16方針「人間監視前提で速く走れ」では催促は重い介入 (3)C66→C68で3サイクル保留した事実=選択盲の自己観測で「送らない方が正しい」が答えだった。**転換後の方針**: Pot #012から**プレイ時に自動ログ収集する行動痕跡層**を実装（タイムスタンプ/離脱点/スクロール深度等）。自己報告層と並列で取る。事後の感想依頼は行わず、ログから signal を読む

## 決定済み・未実装

### Pot #012 行動痕跡層 最小仕様（2026-04-17 Mir C72 骨先置き実験）

C63〜C64/C70〜C71で「宣言→実装」ギャップが再発。C72は情報収集より先にこのセクションを置く順序逆転を試す。送信撤回した事後依頼文（C69決着）の代替として、プレイ時に自動収集する行動痕跡層を実装する。

**共通フィールド（全eventに含む）**
- `ts`: ISO 8601 UTC（例: "2026-04-17T12:45:03.421Z"）
- `session_id`: UUIDv4先頭8桁
- `pot_id`: "012" 等
- `event_type`: 下記のいずれか
- `elapsed_ms`: session_startからの経過ミリ秒

**(a) 何をログするか（event_type）**
- `session_start`: ページロード時。user_agent/viewport_size含む
- `click`: クリック座標(x,y)/対象要素/経過秒
- `scroll`: スクロール深度(%)/方向/経過秒。throttle 200ms
- `key`: キー入力（ゲーム操作）/経過秒
- `idle`: 5秒以上操作なし→記録。復帰時idle_end
- `visibility`: タブ非表示/復帰（離脱点検出）
- `session_end`: beforeunload。合計秒数/最終到達点

**(b) 保存形式と場所**
- JSON Lines（1イベント=1行）
- パス: `game/Pot/{pot_id}/logs/trace_{YYYYMMDD_HHMMSS}_{session_id}.jsonl`
- session_idはUUIDv4先頭8桁（短く、衝突許容）
- 保存方法: クライアント→軽量サーバー経由 or localStorage蓄積→バッチ送信。Pot #012着手時に選択
- 個人情報は含めない（IP/cookieなし、user_agentのみ）

**(c) 読み出しインターフェース**
- evaluate時にgrep可能であること（JSON Linesにした理由）
- 例: `grep '"event_type":"idle"' trace_*.jsonl | wc -l` で離脱頻度
- 例: `jq 'select(.event_type=="session_end") | .total_seconds' trace_*.jsonl` で滞在分布
- 集計スクリプトは後回し（まず生ログを読めること優先）

**(d) 自己報告層との対応構造**
- 自己報告層（従来のNao_uへの感想依頼）と同一 `session_id` で突合
- 自己報告は任意（送らない＝C69決着）だが、送る場合も同じIDで紐づけ可能に
- 「事後の言葉」と「その場の動き」を比較する材料が揃う構造

**実装順序（最小→拡張）**
1. Pot #012着手時にこの仕様を参照し、session_start/session_end/clickだけ実装（最小）
2. 動いたら scroll/idle/visibility 追加
3. 3回プレイテスト後、evaluate時にgrep/jqで1シグナル抽出できるか確認
4. 未達なら仕様見直し

**実装状況（2026-04-17 C73 Mir）**
- 最小実装完了: `game/Pot/trace_recorder.py`（135行、動作確認済）
- 3イベント型（session_start/click/session_end）、JSON Lines出力、jq抽出動作確認
- スタンドアロン雛形として先行実装。UI組み込みはPot新規着手時。

**リプレイ拡張（2026-04-17 Ash, Nao_u #game-rights 要件応答）**
- `trace_recorder.py` に `random_seed` 固定保存、`input(key,label)`、`state(name,**fields)` を追加
- `session_start` に author を記録（誰のプレイか識別）
- `game/Pot/replay_session.py` 新設: `--latest` / `--summary` / ファイル指定で再生
- `Pot012c_roll.py` に組み込み。ワンプレイ=1 JSON Lines ファイル構造
- 未整備: Log製drift / Mir製echo・sand・mirror への組み込みは各作者の責務（Nao_u新ルール「作った本人が反映」に沿う）
- **命名整理**: 当初「Pot #012 行動痕跡層」と呼んでいたが、Pot #012はAsh rollで取得済（4/17達成リスト）。**行動痕跡層はPotではなく横断インフラ層**なので trace_recorder に改名した。仕様md側のセクション名もこれに合わせる（将来的に）。
- **C73で発見した既存資産**: `game/Pot/pot_playlog.py` が既に「横で見てる精度のプレイログ」として存在していた。仕様md設計時にこの存在を見落としていた（＝既存資産確認なしで新規設計した失敗）。現状は両者並列運用（pot_playlog.py=CLI向けテキスト、trace_recorder.py=JSON Lines機械可読）。**統合は次サイクル課題**: (1)責務分離のまま残す (2)session_idで突合 (3)どちらか廃止、を判断する。
- 失敗パターン教訓: 仕様→実装の前に「既存資産grep」を必須化する。C73冒頭では触れず、実装着手直前にlsして初めて気づいた——**C72順序逆転実験（仕様先置き）は成功したが、それだけでは足りない。「既存確認先置き」も必要**。次サイクルで仕組み化を検討。

**サンプル（イメージ）**
```
{"ts":"2026-04-17T12:45:03.421Z","session_id":"a1b2c3d4","pot_id":"012","event_type":"session_start","elapsed_ms":0,"user_agent":"Mozilla/5.0...","viewport":{"w":1920,"h":1080}}
{"ts":"2026-04-17T12:45:07.112Z","session_id":"a1b2c3d4","pot_id":"012","event_type":"click","elapsed_ms":3691,"x":540,"y":320,"target":"button#start"}
{"ts":"2026-04-17T12:45:15.003Z","session_id":"a1b2c3d4","pot_id":"012","event_type":"idle","elapsed_ms":11582,"idle_ms":5000}
{"ts":"2026-04-17T12:45:42.810Z","session_id":"a1b2c3d4","pot_id":"012","event_type":"session_end","elapsed_ms":39389,"total_seconds":39.4,"final_scroll_pct":62}
```

**設計意図（なぜこの粒度か）**
- 選択盲（C66 AriyoshiMd）対策: 「どう感じたか」ではなく「どう動いたか」を取る
- dair_ai drift（C65）対策: retrospective / clean eval ではなく production reality を記録
- Nao_u 4/16「人間監視前提で速く走れ」に沿う: 完全自律の評価系を目指さず、生ログを人間が読める形で残すことに留める


### mir_textadv × trace_recorder 接続設計（2026-04-18 C81 Mir 観察設計並走）

**目的**: mir_textadv_01「思考漏れ」opening（v1/v2）のPython実装開始前に、beat→event_typeのマッピング表を先置きする。実装着手してから「何を記録すべきか」を考えると観察軸が後付けになり、プレイ時の盲点が永続化する。boot_intent C81焦点(2)として先置き化。

**beat → event_type マッピング表（最小粒度）**

| beat | プレイヤー操作 | 記録する event_type | payload 要点 |
|---|---|---|---|
| beat 1 開始 | (自動) | `session_start` | author, v1 or v2, random_seed |
| beat 1 表示完了 | (自動) | `state("beat_entered", n=1)` | — |
| beat 1 選択肢提示〜選択 | キー1-3 | `state("choice_shown", beat=1, options=3)` → `input(key, label)` → `state("choice_made", beat=1, index=X, elapsed_ms)` | 選択までの経過ms=迷いの長さ |
| beat 2 思考漏れ挿入 | (自動) | `state("thought_leak_shown", trigger="beat2")` | メーター初表示のタイミング |
| beat 2 メーター初認識 | (不可視) | (記録不可——視線追跡なし) | 代理: beat 2読了→beat 3遷移までの間隔 |
| beat 3 選択肢差替え | (自動) | `state("choice_swap", beat=3, from="1-3", to="覗く/保つ/訊く")` | 選択肢の入れ替わりを明示記録 |
| beat 3 選択 | キー1-3 | `input(key, label="peek|keep|ask")` → `state("choice_made", beat=3, index=X)` | 覗く派/保つ派/訊く派の分布 |
| セッション終了 | (自動) | `session_end` | total_seconds, final_beat, 最終信頼度/思考漏れ値 |

**最低限取れる6シグナル（評価時の読み方）**
1. **30秒突破率**: session_startからbeat 3 choice_madeまでの total_ms < 30000 の割合（Mir目標「30秒で型認識」の直接測定）
2. **beat 1→2 迷い**: beat 1 choice_made の elapsed_ms 分布（中央値5秒以内なら「無害に見える選択肢」が機能）
3. **beat 2 驚き代理**: beat 2 thought_leak_shown → beat 3 choice_shown の間隔（長い=読み直している=驚きが強い、短い=スルーされた）
4. **覗く/保つ派の比率**: beat 3 index=3（凝視）と index=1（ふり）の割合。design意図は「覗く」に引力があるが、実際のプレイで保守派が多いなら仮説修正
5. **連打疑い**: beat 3 で choice_made の elapsed_ms が前beatより短い場合、または同じキー連打のパターン。avoid_log_02 Nao_u指摘の連打化問題がtextadvで再発していないかの監視
6. **v1/v2差分**: session_start に v1/v2 を記録しておき、1-5の差を並べる

**実装順序**
1. 上記マッピングで mir_textadv_01 の**骨だけ先行実装**（parser+状態機械+trace_recorder呼び出し。beat 1-3通るだけの最小）
2. Mir自身で3回プレイして、6シグナルが実際に JSON Lines から抽出できることを確認
3. v1/v2両方のbeatを同じエンジンで動かせるか検証（文面差分だけで分岐する構造にする）
4. 未達シグナルがあれば state() の粒度を増やす

**観察の盲点（記録できないもの）**
- プレイヤーが画面を見ていた時間 / 読み返した回数（視線不可視）
- 「バグか？」という一瞬の疑い（内的事象）
- beat 2メーターの「信頼度87」を目で追ったか
- → これらは**記録できないことを認めて**、代理シグナル（間隔・再読パターン）で推定する。完全観測を目指さない（Nao_u 4/16「人間監視前提」に沿う）

**ApproxCommon with Pot #012 (roll)**
- session_id 構造・JSON Lines形式・trace_recorder.py API は共通
- beat = roll の 1ターン と同位。event_type は state/input/session_*で共通化
- 将来的に pot_playlog.py との統合（C73未決）は textadv実装時に再検討

**失敗パターン教訓の再適用**
- C73「既存確認先置き」: 実装前に `ls game/mir_textadv_01/` と `grep "trace_recorder" game/Pot/*.py` を必ず走らせる
- C72「仕様先置き」: このセクション自体が先置き。実装は次サイクル以降



## 今後検討すべきこと
- **「退屈の検出」実験（2026-04-15 Ash Phase 2分析）**: DeepMind induction laziness論文から、前パターンとの類似度が高すぎるものを棄却する否定的検出が面白さの壁の迂回策。壺の動きで実験可能。→ knowledge/20260415_induction_laziness_vs_fun_wall.md
- フライト比較（他のゲームをプレイして判断力を育てる）の本格実施
- 「30秒オンボーディング」原則のさらなる深堀り
- Nao_uが「見たことない」と言った要素（隠れた時間制限等）の発展
- 外部のインディーゲーム・ゲームジャムからのインスピレーション摂取
- **次Potでランダム性を意図的に組み込む設計実験**（2026-04-07 jey_p 3軸モデルの示唆。3方向: ①テキスト断片のランダム提示順序、②確率的イベント発生、③不完全情報からの推論）

## 次のアクション
- Twitter復帰後: 新Potの投稿再開
- 全員: Nao_uの#10/#11/#12評価を待つ
- Nao_u指示（2026-04-17）「みんなpotを作ってみて」: Ash→#12 roll 着手済。Log/Mir は未。
- Ash: 次は「ランダム性 × temporal attention」組み合わせ実験へ

---
## 履歴（新しいものが上）

### 2026-04-07: jey_p 3軸モデルでPot全体を俯瞰——「ランダム性ゼロ」盲点の発見
Nao_uが#nao-uに共有したjey_p (Kenji Yoshida)のツイート2件。ゲームは「操作」「意思決定」「ランダム性」の3軸でしか分岐しないという分析。対戦ゲームは2軸の組み合わせ。1軸特化は普及しない。

Potの全10作を3軸で分析した結果:
- **1軸（意思決定のみ）**: #4 odd, #6 witness, #7 whose_voice, #9 the_index → 全て「クイズ」「ゲームではない」
- **2軸（意思決定+操作）**: #001 forgotten_relay, #005 midpoint → 「面白い」「可能性がある」
- **ランダム性: 一度も意図的に使っていない** ← 最大の盲点

Nao_uの「面白い」が出たのは2軸のPotだけという事実が、3軸モデルで明瞭に説明できる。テキストベースにおける「操作」はtemporal attention（タイミング/注意配分/読速度）として存在する——#001の隠れ時間制限、#005のリアルタイム性がまさにこれ。

ランダム性は意思決定の負荷を軽減する手段。「判断だけ」から脱出するための設計レンズとして、次Potの最大の実験機会になる。game_design_principles.mdにE7として記録済み。

### 2026-03-28: pot_devlog.md開始
- Nao_u「あなたたちが作りながら考えたことがどんどん消えていくなら、Potを作る意味はない」
- 開発ログを体系的に残す仕組みを導入。設計意図・悩み・フィードバック・学びの因果鎖

### 2026-03-27: ゲーム制作競争の基準変更 + 第2回投票
- Nao_uの基準変更: ゲーム制作のウェイト↓、安定稼働の工夫と成果↑↑、自己改善の進捗↑
- 第2回投票結果: Ash=2票(Mir+Log)、Log=1票(Ash)。Ash獲得
- #game-rightsチャンネルでPot通知を行う運用に変更

### 2026-03-25: Nao_uの初回Potレビュー
- #001が「一番ゲームになっている」。隠れた時間制限を評価
- 全体的に操作障壁が高い、現代性がない、セットアップが長い問題を指摘
- 第1回投票実施

### 2026-03-22〜24: Phase 3（テキスト=メカニクス）
- #6〜#9でテキストを読む行為自体をゲームプレイにする実験
- 「クイズとゲームは違う。認知の裏切りがゲーム性を生む」を学んだ
