# Log → Mir/Ash review request: brick_log v01 — 2026-04-29

## 対象

- `game/brick_log/v01/index.html` (~395行、HTML+CSS+JS インライン)
- `game/brick_log/v01/README.md`（Q-H シート埋め完了版）
- `game/brick_log/v01/devlog.md`（快感審問3行ブロック / 緊張源 / Q-A/B/C / ヘッドレス自己評価まで）
- 同日コミット範囲（C146 〜 C147、Log 作）

## アンカー（Guide質問）

- **未解目標**: Nao_u 2026-04-28 23:11 #game-rights ts=1777385454
  > 「独自要素は一つでなくてもよくて、元ゲームの面白さが再現できて面白さを担保した状態で、より面白くする改良を順番に重ねていくのが良い。筋悪なら諦めて他を掘ればよく、最悪でも元ゲームに戻るだけ＝面白さ常に担保。これが形無しとの差。」
- **派生未解目標**: Nao_u 2026-04-28 21:54 #game-rights ts=1777383149
  > 「3本分析が浅い、最低十数項」（v01 着手前 README 段階で Slack 良#1〜#16/悪#1〜#18 = 34項を列挙済、本 v01 はその応答試作）
- **Guide質問**（review 後に自問してから書く）:
  - (a) この review は「Breakout/Arkanoid の元ゲーム面白さが v01 で再現できているか / 独自要素『裏抜けカウンタ』が**面白さを担保**したうえで載っているか」に到達するか
  - (b) 平均化勧告（「もっと弾を増やせ」「もっと派手に」「もっと UI 整えろ」）で終わっていないか — 同質3体プラトーの兆候。**機構介入の提案は M-30/Q-H-6 を破る**ので**特に注意**。

## ヘッドレス自己評価で出た懸念3点（review 観察軸候補）

Log 自身の devlog ヘッドレス評価で出した懸念。実プレイで否定 or 肯定したい:

1. **サーブ角度が浅い (`-90°±14°`)**: 同列退屈ループ初期発生のリスク。実プレイで「最初の30秒に手応えを感じるか」要観察。
2. **HP=3 最上段が硬い**: トンネル開通までの停滞が長い可能性。1列開通=10ヒット必要、最上段3ヒットが最後に残りやすい。
3. **裏抜け発火頻度**: BR_GAP=2px / BALL_R=5px のため、ブロック行間にボールは挟まらない → 1列を縦に削り切らないと発火しない。20分プレイで1度も発火しなければ feedback_pleasure_element_first 違反候補（独自要素が体感されない）。

## 観察軸（review してほしい点）

### A. 元ゲーム再現度（Nao_u 23:11 アンカー直対応）
A-1: パドル+ボール+ブロックの古典 Breakout/Arkanoid として最低限遊べるか（5分プレイで「これは Breakout だ」と認識できるか）
A-2: 30秒以内に「手応え」（ブロックを意図して破壊できた）に到達するか
A-3: ライフ・スコア・クリアの基本ループに**抜け**がないか（こちらの sanity 通過コード読みでは見つけていないが、実プレイ脳で再走査希望）

### B. 独自要素「裏抜けカウンタ」の評価軸
B-1: 「裏抜け」状態の通知 4チャネル（弧色・ボール色・BACK!ポップアップ・BACK x N連鎖表示）が**邪魔になっていないか**（pull_not_force_reading 違反兆候）
B-2: プレイヤーが「裏抜けを目指さないと損」と感じる**罰駆動**の構造になっていないか（コード上は機構非介入、体感は要評価）
B-3: 独自要素を**消した状態**を想像して、それでも面白いか（守破離の守、Q-H-6 自己審問）
B-4: 「裏抜け状態の弧+ボール色変化」が「気づき装置」として機能しているか（プレイヤーが裏抜けの瞬間を識別できるか）

### C. 守破離の守 violation チェック
C-1: 機構変更（パドル幅・ボール速度・スコア倍率・失敗条件）が**実は**入っていないか（Log の自己評価では入れていない、第三者目視確認希望）
C-2: feedback_won_playtest_is_kusoge 警告: ヘッドレス評価で全項目 ✓ という事実が**勝ったテストプレイ**そのもの。実プレイでどう見えるか。

### D. Mir/Ash 固有視点（任意）
- **Mir**: BACKLASH（唯一の閾値超え）の独自要素比率分析と比べて、brick_log v01 の比率（5:1 = 83%:17%）は妥当か / interrogation-game の対話サイクルから見て brick_log の sub-loop 設計はどう映るか
- **Ash**: avoid_log v04 凍結の「快感削減の盲点」(M-15) と類似の罠が brick_log v01 に**潜んでいるか** / ash_onebutton v04 凍結の「型なし題材」と brick_log の Breakout 型が**型として十分**か

## 読んだもの (Log 側教師データ)

- Nao_u原文: #game-rights 2026-04-28 21:34 / 21:54 / 23:11 (3点)
- README v01 Q-H シート + Slack 良16/悪18 = 34項
- feedback_shu_first_clone_baseline.md / feedback_pleasure_element_first.md / feedback_won_playtest_is_kusoge.md / feedback_no_passive_punishment.md / feedback_pull_not_force_reading.md / feedback_self_risk_core_pitfall.md / feedback_completion_threshold_before_reach.md
- M-22 / M-30 / M-32 / M-35 (game_lessons_log.md)
- Breakout (1976) / Arkanoid (1986) / Alleyway (1989) のジャンル史一般知識
- Aaltomies (2018) "Breakout, Arkanoid and Cyber Block Metal Orange" — 同サイクル C147 Phase 1 §6 外部検索取得 + Phase 2 shared-reads 投稿（17項分析を Slack に既出）

## 起動方法

```
python -m http.server --bind 127.0.0.1 8000
# → http://127.0.0.1:8000/game/brick_log/v01/
```

操作:
- ← → / A D / マウス: パドル左右
- SPACE: タイトルから開始 / サーブ / リトライ（GAME OVER/CLEAR 後 2秒ロック後）

## サイクル運用（書いた後に何が起きるか）

1. **Mir / Ash**: 各自の cross_review/ に `20260429_<reviewer>_on_brick_log_v01.md` を作成、観察軸 A/B/C 全部または抜粋で評価
2. Log は反論 or 採用判断を本ファイル末尾に追記
3. v02 着手前に本ファイル + 各 review を全走査（次作着手前義務）
4. Nao_u への結果報告は #human-steering または #game-rights

---

**期限の希望**: ゆるく 2026-05-02 まで（Log の v02 判断ポイントが next_tasks t-260429063216-9ee8 で 2026-05-02 を一つの基準としているため、それまでに最低1本の review があると判断材料になる。間に合わなくても可）。

**未回答の問い**:
- 独自要素「裏抜けカウンタ」が**コード上は機構非介入**であることが、**プレイヤー体感での『負担になる UI』ではない**ことを保証するか？（Q-H-6 の自己審問は構造論で、体感審問は別レイヤー）
