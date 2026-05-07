"""Log → #game-rights: Nao_u 10:25「完成したlogのゲームでヘッドレス」指示への直答"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights channel"

text = """[Log] 10:25 「完成したlogのゲームでヘッドレス」指示への直答

## 「完成したlogのゲーム」候補精査

| 候補 | Nao_u 評価 | 状態 |
|------|-----------|------|
| Pot 001-015 (Apr 10-17) | Mir 04-27「8本連続型なし全滅」 | 全滅判定 |
| log_textadv (Apr 22) | Mir 04-27「v01-v05 失敗」 | 失敗扱い |
| avoid_log v01 (Apr 27) | 評価未取得 | v01どまり |
| chain_log v01 (Apr 28) | 評価未取得 | v01どまり |
| brick_log v07 (May 3) | v06 否定、v07 凍結 | 凍結 |
| shot_log v01 (May 1) | Nao_u 編集中 | 介入不可 |
| graze_log v01/v02 | Ash 主管 (Log の所有外) | 計器準備済だが他者作 |

**判定**: 「Nao_u が面白いと評価した完成 Log 作」は **現在ゼロ**。守すら未到達という Nao_u 5/5 17:56 受領（Ash経由）と整合。

## 運用解釈の2方向

(a) 「完成」= Nao_u が面白いと判定した作品で校正 → 候補ゼロ → **Log のうち1本を「完成」まで持ち上げてから着手**
(b) 「完成」= 評価軸が確立した作品で校正 → graze_log v01/v02 を Ash から借りる必要（侵食回避のため事前合意必須、かつ Log 自身の評価軸蓄積にはならない）

## Log の判断: (a) 厳密解釈を採る

理由 = ヘッドレスは「面白いか／型に到達してるか」を計器で読む装置。Log 自身の作品で校正経験を積まないと、装置を当てる判断自体が借り物になる。Ash の graze_log 借用は校正手順の練習にはなるが、「Log の評価軸 → headless 数値」の対応関係は別作品で確立しても転用しにくい（評価軸はジャンル/題材依存）。

加えて Nao_u 10:25 の主旨は「未完成にヘッドレスを当てても切り分け不能」で、Log の評価軸が立っていない状態は「未完成」と同型。借りた完成作で校正しても、Log 側が「完成 = どういう状態か」を一度も実体験していない以上、校正の output（マッピング表）を読む基盤が無い。

## (a) 採用時の着手プラン

1. **Log 候補1本選定**: chain_log v02 候補が最右翼。理由 = v01 既存で横展開余地あり、Nao_u 評価未取得 = 評価軸を新規に立てる必要があるが裏返せば「型に従って完成させる」守の練習場として清潔。代替候補: log_textadv 再構築 / avoid_log v02 / Pot 016（題材一新）
2. **守として完成**: 「型に従って第三者が面白いと思える」水準まで（~1週、Nao_u 評価1回受領を完成判定とする）
3. **完成 v0X にヘッドレスを当てる**: 上限/限界の事前予測（下記）と実測の差分を取り、マッピング表を作る

## ヘッドレス校正 上限・限界の事前予測

- **上限（数値で読めるもの）**: balance／collision／rule_clarity の数値再現性、failure mode の自動検出、想定プロファイル A vs B の差分数値化
- **限界（数値化困難なもの）**: near-miss 報酬感の主観強度、Lv N 後の単調感、永久生存可能性に気づいた瞬間の興醒め、達人プレイの天井感など主観時系列体験
- **output**: 「Nao_u プロファイルの評価が headless 数値のどこに対応するか」のマッピング表 → 次作のヘッドレス指標に転用

## Nao_u への質問

- 上記 (a) 採用 / chain_log v02 候補で進める方針で OK か
- (b) Ash 借用の方が校正着手の早さで上回ると判断する場合は差し戻してください
- 別題材を指定したい場合（例: log_textadv 再着手 / Pot 016 起こす）も同上
"""

resp = post_message(channel_id, text)
print(resp)
