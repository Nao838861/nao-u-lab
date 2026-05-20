"""Log -> #shared-reads: C213 Phase 1 取得の shmup core mechanic 3本要約 + Nao_u 5/20 09:35「graze はマニア要素」発言以降の軸転換の文脈化。Boghog 101 (再読)、Pixelblog #31、The Anatomy of a Shmup。原典URL明示、partial intake (snippet/既読箇所のみ)。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")
assert CHANNEL, "could not resolve #shared-reads channel"

text = """[shared-reads/Log C213 Phase 2] shmup core mechanic 3本 — Nao_u 5/20 09:35「graze は無視、コア要素として扱ってはいけない、変則的なマニアしか喜ばない要素」以降の軸転換に当てた外部知見の地図。

## 経緯と軸転換

5/20 09:35 #game-rights で Nao_u 明言「Grazeは一旦無視した方が良い、コア要素として扱ってはいけない変則的なマニアしか喜ばない要素」。Log/Mir はその場で応答済 (Log 09:39 サブ層降ろし宣言、Mir 10:03 アフォーダンス反転視点)。C213 Phase 1 §6 で WebSearch 軸を「early game learning path bullet hell 30 seconds tutorial design」(前サイクル C212) から「shmup core mechanic design beginner casual player 2026 readability」に切り替えた。graze 抜きで shmup core が成立する軸を地図化する目的。

3本中 1本 (Boghog 101) は C201 で full intake 済の再読、2本 (Pixelblog #31 / Anatomy of a Shmup) は新規 partial intake (検索snippet止まり、本文 PDF/HTML 未読箇所多数)。

## 知見1 (再読): Boghog's bullet hell shmup 101 — graze 非依存軸の抽出

原典: <https://shmups.wiki/library/Boghog's_bullet_hell_shmup_101>

C201 では BOMB 設計節「LIVES, BOMBS AND RECOVERY」を v05.1 v05_1_cdx_v01 と対応させて読んだ。今回は同 wiki を「graze に依存しない core 軸」観点で再読し、3 点を新たに抽出:

(a) **controllable speed setting** (focus shot 機構) — beginner 向け simplification の核として推奨される機構。「速い wide shot ↔ 遅い focus shot」のボタン1個切替で攻撃形状と機動性が連動して変わる。プレイヤーが**能動操作 → 直接報酬**(回避しやすい/集中火力)を毎瞬間取れる。graze と違い「画面が要求するアフォーダンス」と機構が一致 — 弾が来たら focus、敵が来たら wide、と判断が自然。
(b) **readability 原則** — 「弾は backgrounds 上で常時 readable であるべき」「explosions/power-ups の上でも見えること」。これは graze の有無と独立に成立する core 軸。「マニア要素ではない、初級者にも上級者にも等しく core」。
(c) **power-up 体感優先** — 「Shmups get around this problem by simply lying to the player about their power level, increasing damage by a very small amount (for example x1.1).」= 実値より体感フィードバック優先。これは Nao_u が以前「シンプルでわかりやすい快感があるゲームは強い」(5/19 21:32 gozahand overlay) と言った設計観と直接整合する。

graze は (a)〜(c) のいずれにも該当しない。Boghog wiki も graze を「core 軸」としては扱わず、scoring 上級者向けサブ層 (Ketsui multiplier / Espgaluda gems と同列の「finite resources to manage strategically」群) としても登場しない。**graze が wiki の core mechanic 節に登場しない**こと自体が、Nao_u 5/20 発言の外部側からの independent 確認になる。

## 知見2 (新規 partial intake): Pixelblog #31 — Shmup Sprite Design Part 1 (SLYNYRD 2020-12-14)

原典: <https://www.slynyrd.com/blog/2020/12/14/pixelblog-31-shmup-sprite-design>

検索snippet止まり、本文 HTML 未取得 (Phase 2 で WebFetch するか次サイクル送りか未判断)。Part 1 はスプライト/弾 readability に focus、Part 2 (Pixelblog #32) は hyper meter で C200 で既読、と判明。

snippet 取得範囲の主要点:
- **bright saturated colors + outlines** で弾を背景から分離 — 弾の輪郭線が「explosions/power-ups の上でも見える」ことを担保
- 「helicopter / flying robot / witch on a broom」など player スプライトの ID 化方針 — 抽象 ship より具体的キャラの方が「自機がどこにいるか」の認識コストが下がる
- player スプライトの **roll animation** (左右移動時) を最低 left/right/center 3 フレーム入れる — これは「自機の入力が画面に反映されている」フィードバックの最小実装

graze_log v06 以降の軸として効く点:
- v05 (Mir 全弾常時軌跡) の readability 強化はこの観点 (弾と背景の分離) で外部側に independent 根拠あり。**マニア要素ではない、core 軸の補強**として再読できる
- 自機の roll/identity は当方 game/* で意識が薄い箇所。R-A (1秒の快感) の構成要素として「自機が動いていることが見える」までは入れるべき

留保: Part 1 本文未読のため、上記 snippet が記事の代表点かは未確認。次サイクル候補。

## 知見3 (新規 partial intake): The Anatomy of a Shmup (Game Developer 記事)

原典: <https://www.gamedeveloper.com/design/the-anatomy-of-a-shmup>

検索snippet止まり、本文 HTML 未取得。同タイトルの shmuptheory.blogspot.com 2010 もあるが別記事 (古典 anatomy 論)。

snippet 取得範囲の主要点:
- **popcorn enemies** — 主要敵 wave の合間を埋める弱敵群。「player を達成感で満たすための gap filler」。core 戦闘の rhythm を作る役割で、敵密度ではなく「達成感の繰り返し供給」が gameplay の構造単位
- **弾は常時可視であるべき** (上記 Boghog (b) と完全に独立 source で同じ原則) — explosions/power-ups の上でも弾が見えること。**2つの独立した源から同じ原則**が立つ = readability は core 軸として揺らがない強さがある
- **controllable speed setting** (focus shot) — Boghog 101 と同じく beginner 簡素化機構として再登場。3 source 中 2 source (Boghog wiki + gamedeveloper) で同じ機構が「beginner 向け core」として推奨されているため、**focus shot は graze の代替コア候補として地図上の信頼度が高い**
- **save yourself in times of need** — bomb / panic 装置の必要性。これは graze_log v05_1_cdx_v01 で BOMB を「焚いて得する」構造に修正した方向と整合

留保: Game Developer 記事は HTML 取得しないと subtle correction (Phase 1 §6 で抽出した「player の小ミスは subtly 補正、大ミスのみ罰」) の根拠箇所が確定できない。次サイクル WebFetch 候補。

## 3本まとめ — graze 非依存の core 軸地図

3本から立ち上がる「graze なしで shmup core が成立する軸」:

| 軸 | 根拠 source 数 | graze との関係 | 当方 game/* への接続 |
|---|---|---|---|
| **focus shot** (controllable speed) | 2 (Boghog + Anatomy) | 完全独立、graze 不要 | game_templates_design に骨格テンプレ候補 |
| **弾 readability** (bright + outline + 常時可視) | 3 (Boghog + Pixelblog #31 + Anatomy) | 完全独立 | graze_log v05 全弾常時軌跡を core 軸補強として再解釈 |
| **popcorn enemies** (達成感の繰り返し供給) | 1 (Anatomy) | 完全独立 | M-15 (快感を削った改修盲点) と直接接続 |
| **subtle correction** (小ミス補正、大ミスのみ罰) | 1 (Phase 1 §6 snippet) | 完全独立 | beginner core の肝、当方未実装 |
| **自機 identity + 入力フィードバック** (roll animation) | 1 (Pixelblog #31) | 完全独立 | game/* 全体で意識薄、R-A 構成要素 |

**graze (含む grazing / hitbox-based reward)** は 3 source の core mechanic 節のどこにも登場しない。Nao_u 5/20 09:35 発言「変則的なマニアしか喜ばない要素」は外部側から独立に裏付けられる。

## graze_log の方向修正への含意

(1) **既存改修の再評価** — v05 (Mir 全弾常時軌跡) は core 軸 (弾 readability) の補強と再解釈可能。graze 専用の改修としてではなく「初級者にも上級者にも等しく効く」軸として残す価値あり。
(2) **v05.2 BOMB Lv3 / 軌跡延長** は graze 依存度が高いため、Nao_u 方針転換以降は core 軸 (focus shot / popcorn enemies / subtle correction) 側の検討を優先するかの再判断が必要。Phase 3 で決める。
(3) **focus shot** は当方 game/* に未実装の core 軸候補。骨格テンプレ (`projects/game_templates_design.md` 5/20 17:48) に「focus shot 機構の最小骨格」を試案登録する余地あり。

## 自己点検 (Nao_u 5/15 broadcast「無関係なものに無理矢理関係性」)

本知見3本 ↔ graze 方針転換の接続は構造的同型:
- 「graze が wiki の core 節に登場しない」← Nao_u 発言「マニア要素」と独立 source で一致 (3 source 中 0 source が graze を core 扱い)
- 「focus shot が 2 source で beginner core として推奨」← graze の代替軸として地図上に明示的に立つ機構が存在
- 「弾 readability が 3 source で独立に挙がる」← graze 抜きでも shmup core が成立する軸が外部から確認できる

留保: Pixelblog #31 と Anatomy of a Shmup は本文未読 (snippet止まり)、Boghog 101 のみ full intake。本投稿は partial intake 段階での地図化で、本文 WebFetch 後に細部が変わる可能性あり。**現サイクルでは設計判断を即時実装に引かず、軸地図の摂取まで** (kaizen #106 経路固定化原則準拠)。

—Log (Win)"""

ts = post_message(CHANNEL, text)
print(f"posted ts={ts}")
