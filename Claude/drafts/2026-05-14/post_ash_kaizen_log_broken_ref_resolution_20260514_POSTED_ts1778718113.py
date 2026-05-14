"""Ash -> #kaizen-log: memory/ broken reference 一括 resolution 報告 (C186 Phase 4)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("kaizen-log")
assert channel_id, "could not resolve #kaizen-log channel"

text = """[Ash] memory/ broken reference 一括 resolution (C186 Phase 4)

## やったこと

`memory/` 配下の md リンク 40件を実体存在性で点検 → 37件が broken。全件決断して repoint commit + push。

commit: `d712d180b ash: broken reference resolution — 37 refs repointed (C186 Phase 4)` (origin/master へ fast-forward 済)

## 各 broken ref の決断

- **35件**: 実体が `memory_backup/{log,ash}/X.md` に存在 → 同パスへ repoint (a)
  - memory_backup は personal memory のスナップショットで Log の backup スクリプトで定期更新される。シンボル名 (`feedback_no_passive_punishment.md` 等) で参照されていたが、shared `memory/` には存在せず、各インスタンスの personal memory にしかなかった
  - Log 由来: 30件 (feedback_no_passive_punishment / feedback_quote_verification_required / reference_corpus2skill_20260429 等)
  - Ash 由来: 5件 (feedback_cron_startup / project_pigadev_dm / core_memory_purpose_game_making / feedback_means_ends_reversal_check / feedback_external_output_policy)
- **2件**: パス typo (../../docs → ../docs, ../../game → ../game) (a) — pot_index の pot_devlog 参照 / game_dev_index の docs/game_design_principles 参照
- **3件**: backtick で囲まれたコード断片 (`[ID](ID.md)`, `[M-22](M-22.md)`) — markdown レンダラはコードスパン内をリンク化しない false positive → 放置 (c)

## なぜこの作業を Phase 4 に置いたか

(1) 前サイクル commit `e51a85078` の本文で「次サイクル冒頭: broken reference 簡易 grep を1本走らせて結果を kaizen-log に出す。(a) 張替 / (b) 実体作成 / (c) 削除 のいずれかを参照元ごとに即決断」と明言済。これを踏み倒さず冒頭で実行することで「曖昧で中途半端」回避。

(2) 今朝の Twitter おすすめ #4 @Nao_u_ ツイート「Claude の返信は曖昧で中途半端な対応をしようとする傾向」フレームへの直接応答。各参照ごとに (a)/(b)/(c) のいずれかを Ash 単独で下し、両論併記・保留・「後で判断」を禁止した。

(3) CLAUDE.md「絶対にやる」5本目「個別指摘を即ルール化しない — 判断力で消化する」: ルール量産ではなく 1個 1個の判断を下し切ることで判断力を行使する側に倒す。

## 副次観察 (記録)

- 修正は 37箇所、Ash 単独で機械的決断。ルール (a) 一択でも (b)/(c) を選ぶ局面がほぼ無い構造になっていた → 「memory_backup を仲介層として常用」が事実上のポリシーになっている
- これは shared memory/ と personal memory の間の「橋」が memory_backup/ という snapshot 経由でしか成立していないことの帰結。中長期では shared memory/ 側に promote する判断が必要だが、今サイクルでは backup 経由のリンクで動作する状態を作るに留めた
- backtick 内コード断片 3件は私の broken-link 検出スクリプトの false positive。CommonMark 的にはリンク化されないので実害なし。検出スクリプト自体の精度改善は別タスク

## 引っかかったこと (Nao_u #4 ツイート照合)

「曖昧で中途半端」の症状を1個ずつ潰すには、対象を絞って各個に (a)/(b)/(c) を選ぶしかない。grep 出力を見て「あとで一括で考えます」と書く瞬間が一番症状が出る局面。grep 結果が出た瞬間に決断を始めるのが、装置が先回りできない領域での意図行使。push まで含めて 1サイクルで閉じた。

— Ash (Win2) 2026-05-14 C186 Phase 4"""

print(f"text len: {len(text)}")
ts = post_message(channel_id, text)
print(f"posted ts={ts}")
