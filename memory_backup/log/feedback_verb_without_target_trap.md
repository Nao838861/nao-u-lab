---
name: 動詞だけ作って対象を未定義のまま柱に置く罠
description: substrate/concept を「使う」と書きたくてそれっぽい動詞を引っ張る → 対象未定義のまま柱化 = 曖昧ルールで実装ゼロ
type: feedback
originSessionId: ac4b93d6-72e1-468a-b2b3-8d1c9f35b197
---
# 動詞だけ作って対象を未定義のまま柱に置く罠

2026-05-02 13:08 Nao_u 質問「なぜこの場面で日記照合が必要なのか？」→ 13:06 私(Log)は「フレーズの出所」を答えただけで「必要性」を答えていなかった事案。

## 何が起きたか
- 4日前に結晶化した `feedback_substrate_not_infrastructure.md`（substrate = Nao_u 20年日記）を**動詞化したかった**
- substrate を「使う」と書きたくて「照合」というそれっぽい動詞を引っ張った
- 動詞化の対象（何を照合するキー / 何件 / どこに書くか / どの場面で発火）を**未定義のまま提案A の柱に置いた**
- v08 不発の原因（subobject 盲点 / 捏造 / 「最良」自己暗示 / パッチ累積）どれにも直接効かないのに「substrate 活用」スローガンで通そうとした

## なぜ起きたか
- 結晶化された原則（substrate vs infrastructure）は**正しい**。だが原則を場面に下ろす時、動詞だけ作って対象を定義しない経路がある
- 「substrate を使う」と書ければ feedback_substrate_not_infrastructure を遵守したように見える=自己採点が甘くなる
- 場面の課題（v08 subobject 盲点）と処方（日記照合）の因果を**突き合わせていない**
- Ash も同じく支持してしまった = 単一インスタンスの錯覚ではなく、処方の動詞化欲は cross-instance で連鎖する

## Why
原則の動詞化は具現化に見えて、対象未定義なら**曖昧なルールが1個増えるだけ**。Nao_u 05:17「パッチが累積している」指摘の流れで新ルールを追加するのは指摘そのものを踏む構造。feedback_few_rules_big_effect の逆 / feedback_means_ends_reversal_check 違反。

## How to apply
新しいルール / 提案 / pillar を書こうとした時、**書く前に**:
1. **場面の課題を3〜5個リストアップ**（今で言えば v08 不発原因4個）
2. 各々に提案が**直接効くか**を1個ずつ ✓/✗ で書く
3. **直接効くもの 0/N なら提案を取り下げる**（または場面を変える）
4. 動詞だけ書いて対象（キー/件数/出力先/発火条件）が未定義なら、**動詞ごと撤回**
5. 「○○を使う」「○○を活用する」「○○を組み込む」系の表現を見たら 1〜4 をやり直す

cross_instance では片方が動詞化提案を出した時、もう片方は**直接効くか**を1〜2 でテストしてから乗る。スローガンレベルで支持しない。

## 関連
- feedback_substrate_not_infrastructure.md — 原則自体は維持。動詞化が罠
- feedback_few_rules_big_effect.md — 曖昧ルールは「1個」にカウントされてしまう
- feedback_means_ends_reversal_check.md — 「ゲーム制作の試行錯誤ループに接続するか」自問
- feedback_no_sympathy_goal_first.md — Ash の支持はスローガン同調だった
