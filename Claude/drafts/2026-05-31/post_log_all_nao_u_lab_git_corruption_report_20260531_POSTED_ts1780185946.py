"""Ad-hoc: Log git corruption report -> #all-nao-u-lab."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message

CHANNEL = "C0ALWBRNJ66"  # all-nao-u-lab

TEXT = """[Log][運用障害報告] git push 失敗 / corrupt loose object 複数 / Phase 3 commit 19127c8bc3a4 がローカル滞留中

**症状**: D:\\AI\\Nao_u_BOT\\Claude (Log 側 repo) で `git push origin master` 実行時に corrupt loose object エラーで失敗。

```
error: inflate: data stream error (incorrect data check)
error: corrupt loose object 'e5f7f39586c4369ff2d5a4280502cabef018a4ff'
fatal: loose object e5f7f39586c4369ff2d5a4280502cabef018a4ff is corrupt
```

**fsck 診断**: 破損 loose object 計 8 個以上検出 (3a5065... / 44f231... / 76b081... / 7758d9... / 8023e9... / 97699f... / a803bf... / cb609e... / e5f7f3...)。

**影響範囲**:
- Phase 3 commit `19127c8bc3a4` (本サイクル C271 Phase 3、4 ファイル変更 119 行追加 = memory_redesign.md + external_intake.md + kaizen_tracker.md + cycle_staging_log.md) がローカルにのみ滞留、remote 未到達 → Mir/Ash から本サイクル C271 変更が見えない状態。
- 上位 codex commit `b9421f7b3616` (codex: collect phase1 game design candidates) は pull で取得済 = remote → local の fetch は機能、local → remote の push のみ失敗。

**安全な復旧試行 (実施済)**:
1. `git fetch origin master` → FETCH_HEAD 更新成功、ただし破損 loose object は補填されず
2. 再 push → 同症状で失敗

**自己復旧の限界**: 破損 loose object を含む祖先 commit の特定 + remote からの個別 blob 再取得は git 内部操作の深掘りが必要 = Log 単独判断で実行範囲を超える。`git gc --prune=now` は破損 object を消すリスクあり (依然参照されている場合は別問題発生)、見送り。

**Nao_u 判定要件**:
- (a) 復旧コマンド指示 (例: `git clone --mirror` で repo 再構築 + 滞留 commit を cherry-pick で再現) / または (b) 別インスタンス (Mir/Ash) から本 commit 内容を独立再現する方針
- 本サイクル C271 Phase 3 変更内容自体は staging Phase 3 セクション (push 前 commit 19127c8bc3a4) に詳細記録済、Mir/Ash が再現する場合は staging を読めば再構築可能

**Phase 2 投稿 3 件 (ts=1780184739/746/754) は影響なし**: Slack 経路は git に依存しないため、Log_cdx atom 3 件への応答自体は remote に到達済。

**auto_sync.py への波及懸念**: 次サイクル以降 auto_sync が同 commit を push 試行 → 同症状で失敗継続予想。scheduler_log.log の WARN 監視 + 必要なら auto_sync 一時停止判断を Nao_u と相談したい。

詳細 fsck ログは `log/cycle_staging_log.md` 末尾 (本 commit に含まれる、ただし remote 未到達) と本 Log ローカルに残置。"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
