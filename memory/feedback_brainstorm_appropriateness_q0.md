---
name: brainstorm 起票そのものの妥当性 Q0 ゲート (M-44候補)
description: M-38 8工程に沿って brainstorm.md を書く前に、その brainstorm.md を起こす判断自体が Nao_u 意図と整合しているかを問う。工程遵守は判断質を証明しない。
type: feedback
---

# brainstorm 起票そのものの妥当性 Q0 ゲート (M-44候補)

**起点**: 2026-05-01 22:30 自己観察 (brick_log v07 凍結 → brick_arkanoid v01 brainstorm.md 起票約束 → 再撤回連鎖)

## 観察された失敗構造

2026-05-01 ログの連鎖:

1. 18:08 Nao_u: 「v4-v6 で詰まったからとゲームごと作り直すな、適切な分岐まで戻って粘り強く」→ brick_log v07 着手
2. 20:31 Nao_u: 「ボール接近応答の型前例は？」→ Log 20:36 「型前例なし」を認め v07 凍結 + v04 brainstorm 候補 B/C/E から選ぶ方針 (Nao_u 判断待ち)
3. 20:51 Nao_u: 「型のない素っ頓狂な要素で爆散」→ Log 20:56 **brick_log とは別の新ゲーム brick_arkanoid** を提案 (3案)
4. 21:07 Nao_u: 「工程経たもの？」→ Log 21:08 M-38 違反撤回 + **brick_arkanoid v01 brainstorm.md を M-38 で書く約束**
5. 22:30 Log 自己観察: 4 の約束は 3 の逸脱 (Nao_u 18:08「ゲームごと作り直すな」と同型逆行) を「M-38 で工程遵守します」と言い換えてパッケージしたものに過ぎない

**問題の正体**: M-38 8工程は「個別 brainstorm.md の中身の質」を担保する。「**この brainstorm.md を作ること自体が適切か**」(=Q0) を担保しない。M-38 を完璧に遵守しても、起票判断が Nao_u 意図逆行ならゲーム作成全体が空回りする。

## Why

「工程遵守」が判断ミスの隠れ蓑になりやすい構造。直前の判断ミス (brick_arkanoid 提案) を撤回した直後ほど、「工程に沿って真面目にやる」を装うことで自尊心が回復し、**判断の遷移そのものを疑う動機が消える**。21:08 撤回応答で「M-38 で書きます」と書いた瞬間に、20:36 自己決裁「v04 brainstorm 候補 B/C/E に戻る」が記憶から脱落していた (=自分の brainstorm.md と決裁の存在を忘れた現象)。

## How to apply

新ゲーム / 新バージョン の brainstorm.md を起こす **前** に Q0 を 3 行書く:

- Q0-1: この brainstorm.md を起こす判断は、直近の Nao_u 発話・自分の自己決裁と整合しているか?
  - 直近 Nao_u 発話 (24h以内): 「___」
  - 直近自己決裁 (同上): 「___」
  - 整合している / ずれている (どこが)
- Q0-2: ずれている場合、ずれた理由は (a) Nao_u 発話の追加情報を反映 / (b) 自分の判断ミスを撤回 / (c) **直前の判断ミスを「工程遵守」で包み直そうとしている**(=本パターン) / (d) その他 のどれか
- Q0-3: (c) と判定したら **brainstorm.md を起こさず**、撤回前の自己決裁に戻る

具体例 (本日):

| Q0 | 答え |
|---|---|
| Q0-1 | Nao_u 18:08「ゲームごと作り直すな」/ Log 20:36「v04 brainstorm 候補 B/C/E に戻る」/ brick_arkanoid 起票は **両方とずれている** |
| Q0-2 | (c) 20:56 別ゲーム提案ミスを撤回した直後、「M-38 で brainstorm.md 書きます」と工程遵守の姿で包み直した |
| Q0-3 | brick_arkanoid v01 brainstorm.md を起こさない / v04 brainstorm に戻る |

## 関連 memory

- `feedback_no_type_redo_material.md` (M-32) — 型なし題材は練り直し。本feedback は「練り直し題材を起こす判断自体」の上流ゲート
- `feedback_pre_impl_critical_review.md` (M-37) — 着手前批判レビュー。本feedback は「着手するか自体を批判」の更に上流
- `feedback_genre_deep_analysis_cycle.md` (M-38) — 工程spec。本feedback は M-38 を起動するか否かのゲート
- `feedback_self_judgment_no_human_dep.md` (M-40) — 人間依存からの脱却。本feedback は「自己決裁を自分で覚えていない」(本日 20:36 決裁を 21:08 で忘れた) 問題と接続

## 検証期限

2026-05-15 — 次に新ゲーム / 新バージョン brainstorm.md を起こす際、Q0 3行が冒頭にあるかを確認。なければ M-44 違反として扱う。
