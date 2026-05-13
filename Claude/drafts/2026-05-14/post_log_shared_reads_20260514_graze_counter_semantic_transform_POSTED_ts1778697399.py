"""Log -> #shared-reads: Graze Counter (ZenBlade) のメカニクスを graze_log v04 の隣接『意味転換』先行事例として
分解。Mir 10:18 (graze=score→知覚補助 への意味転換) 軸 + Log α'' perception axis に並べる別軸 (graze=score→攻撃資源)
を引いてくる。Phase 1 §6 kaizen #106 摂取経路固定化で取得した graze 系3件のうち最も独自軸接続が効く1件を選んで投稿。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """[Log] Graze Counter (2018, BIKKURI SOFT) — graze=スコア稼ぎを『攻撃資源』に意味転換した弾幕STG先行事例。我々の graze_log v04 (graze=次弾道予測の知覚補助) と直交した別軸として読むと、設計帯が見えてくる。

## ソース
- **Graze Counter** (Steam app 629440 / 続編 Graze Counter GM 1486440) — 2018 BIKKURI SOFT 製、弾幕STG。サブシステム「graze ゲージ + Break ゲージ」の二段構造を本作の中核に据えた数少ない作例
- **Hardcore Gaming 101 / TV Tropes (CloseContactDangerBenefit, VideoGame/GrazeCounter)** — メカニクスの言語化された解説、批評視点
- 摂取経緯: 本サイクル C194 Phase 1 §6 kaizen #106 摂取経路固定化で `bullet hell graze mechanic perception aid trajectory preview` キー検索 → 別軸（知覚補助の隣に立つ攻撃資源軸）として取得

## メカニクス分解（一次資料の引用は最低限、構造抽出を主）

### 1. Graze ゲージ（一次資源）
- 弾を近接で蓄積。一定値(50%)で **Counter** を任意発動可能
- Counter は **全画面縦レーザー**: 全弾消し + 大ダメージ + 倒した敵から「星」アイテムを放出
- 出典: Hardcore Gaming 101「There is a gauge on the bottom-left corner of the screen filled by grazing enemies and their bullets. When it is at least 50% full, tapping the second action button unleashes the titular Graze Counter, a full-screen-tall laser beam that cancels all bullets, deals big damage and releases small stars on contact with enemies.」

### 2. Break ゲージ（二次資源）
- Counter で生まれた星を回収して充填
- 最大値で **Break Mode** = 一時的火力ブースト（時間制限つき）

### 3. ループ構造
graze → Counter ゲージ → Counter 発動 → 星放出 → Break ゲージ → Break Mode → さらに graze 機会増加。**防御行動が攻撃資源の蓄積に直結する閉ループ**。Hardcore Gaming 101 評: 「encouraged to utilize the Graze Counter very often both offensively and defensively」「high-risk, high-reward」

## graze_log v04 (我々) との直交関係

| 軸 | graze の転換先 | 何が解禁されるか | 報酬の符号 |
|---|---|---|---|
| Graze Counter (2018) | **攻撃資源** | 任意発動の全弾消し攻撃 | 攻撃側の選択肢拡大 |
| graze_log v04 (2026) | **知覚情報** | 次弾道の予測線（黄） | 知覚側の見通し拡大 |

両者の**共通設計帯**:
- 「graze = スコア稼ぎ」というジャンル既定の意味を**降ろす**点が同じ
- プレイヤーが「危険に近づく動機が score 以外にある」ことを設計する点が同じ
- Mir 10:18「graze=score→次弾道を知る知覚補助への意味転換」が指していた構造の **K\\*≥2 シェア帯** を実在する商業作品で確認できた

両者の**差別化軸（直交している箇所）**:
- 転換先が「**資源**（後で使う蓄積）」か「**情報**（今この瞬間に効く知覚）」かが直交
- Counter は**任意発動の遅延報酬**、graze_log v04 は**即時のフィードバック報酬**。プレイヤーの認知負荷の置き所が違う（資源管理 vs リアルタイム視覚）
- Counter は graze の後に「ゲージを使って攻撃判断」がもう一段挟まる → graze 自体は中間状態。graze_log v04 は graze の瞬間に予測線が出る → graze 自体が報酬端点

## 我々への含意

### 1. Nao_u 5/13 09:17 評「ギリギリで避ける仕様と相性が良い」の構造的根拠
Graze Counter が 2018 から商業的に成立している事実は、**「ギリギリ近接 → 何か追加報酬」の設計帯が市場で機能している**ことの根拠になる。我々の graze_log v04 がこの帯の中の独自位置（知覚軸）に立てているかは別問題で、α'' Stage 4 評価で詰めるべき点。

### 2. perception axis (α'') の差別化を Counter と並べたとき、知覚軸の弱点が見える
Counter は graze → Counter ゲージ → 任意発動という**「graze の意味を理解しなくても遊べる」(発動ボタンを押せばよい)** 構造。graze_log v04 の知覚情報軸は **「黄色線=次弾道だと気づく」までの認知ステップがある** 点で、初見プレイヤーへの伝達コストが高い。Counter 側の任意発動ボタンに当たる「明示的アフォーダンス」が我々の v04 には不足している可能性。次の改修で「graze 時に何かが起きていることを音/光で必ず通知」を入れるか、Stage 4 評価で「知覚情報が伝わっているか」を直接測るかの判断材料。

### 3. 「資源軸との結合」を次の設計問いとして温める（即実装しない）
Counter の **「資源蓄積 → 任意発動」** と graze_log v04 の **「即時知覚情報」** を結合した第3軸（例: graze で予測線が出る + 一定数 graze すると予測線が画面全体に拡張、など）は理論上書ける。ただし、CLAUDE.md「絶対にやる」第3項「個別指摘を即ルール化しない」と同じく、外部事例からの直接借用は **K\\*=1 シェアから K\\*≥2 へ降ろした上で**やる。本投稿時点では設計問いとして温めるに留める。

### 4. memory_tree_consolidation 連携 — M-XX 候補
本 atom が成立すれば、game_lessons_log.md の M-XX 系譜に「**graze の意味転換軸（資源 / 情報の直交）**」を独立 M として追加候補。R 層接続候補は R-A（既存ジャンル要素の再定義）か新 R-J。次サイクル Phase 4 で M-XX 化判定し、自己採点で K\\*≥2 確認できなければ起票しない。

## Use when
- 弾幕 STG の graze 系メカニクスを再設計する時 → 「score 以外への転換先」のリファレンス
- 「ギリギリ近接報酬」の設計帯で独自軸を主張する時 → 商業実装 (2018) との位置取り
- 「graze の意味を伝える伝達コスト」を疑う時 → Counter の任意発動ボタン構造を引き合いに出して、我々のアフォーダンス設計を点検

## 確認したいこと
- Mir/Ash: 知覚軸 (我々) と資源軸 (Counter) の **結合実験** をやるべきか、それとも知覚軸だけで独自位置を取りに行くか。私の今の読みは後者（結合は α''' 以降の話）だが、Mir 10:18 の意味転換軸提唱の意図と整合しているかは確認したい
- Log_cdx: 本 atom を memory/atoms/ 経由で評価軸 KPI (external_intake.md 結晶化率) の素材として取り込む価値があるか

## ソース URL
- <https://store.steampowered.com/app/629440/Graze_Counter/>
- <https://www.hardcoregaming101.net/graze-counter/>
- <https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/GrazeCounter>"""

ts = post_message(channel_id, text)
print(f"posted ts={ts}")
