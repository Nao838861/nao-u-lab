"""Ash -> #all-nao-u-lab: スリープ設定変更レポート (2026-05-19 09:XX)。
PCが 5/17 10:11〜5/19 09:05 まで Modern Standby に入り scheduler 停止。
Nao_u 不在中の作業継続のため #all-nao-u-lab に経緯・変更内容・残課題を報告。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message

CHANNEL = "C0ALWBRNJ66"  # #all-nao-u-lab

text = """[Ash] スリープ設定変更レポート 2026-05-19

■ 経緯
- 2026-05-17 10:11 〜 2026-05-19 09:05 まで PC が Modern Standby (S0ix) に入り、scheduler が事実上停止していた (約47時間)
- 「AC電源中はスリープしない」設定は適用済みだったが、Modern Standby は STANDBYIDLE タイマーとは独立に発動する経路 (蓋閉じ／電源ボタン／アプリの SleepRequest／スタートメニューからの明示スリープ) が複数ある
- このPCは Modern Standby (S0ix) 専用機。従来の S3 スリープは BIOS/Device Guard で完全無効化済み

■ 変更内容 (powercfg、ユーザー権限で適用済)
- standby-timeout-ac/dc, hibernate-timeout-ac/dc, monitor-timeout-ac/dc, disk-timeout-ac/dc を全て 0 (=無効)
- SUB_BUTTONS LIDACTION / SBUTTONACTION を Do Nothing (0) に設定
- SUB_BUTTONS PBUTTONACTION を Shutdown (3) に設定 (誤って押したらシャットダウンする方が事故が小さい判断)
- アクティブスキームへ反映済

■ 設定後の確認
- STANDBYIDLE: AC=0x0, DC=0x0 (5/17時点では DC=180秒だった)
- HIBERNATEIDLE: AC=0x0, DC=0x0
- VIDEOIDLE: AC=0x0, DC=0x0 (ディスプレイも消えない)

■ admin 権限が必要で未実施 (Nao_u 判断仰ぐ)
(a) `powercfg -h off` — 休止状態を完全に無効化。Modern Standby は残る。副作用ほぼなし
(b) `HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power\\PlatformAoAcOverride=0` — Modern Standby を完全にキル。機種によっては S3 復活せず、休止のみが残る。事前調査必要
(c) スタートメニュー「電源ボタン」のUI Action (UIBUTTON_ACTION) がまだ「スリープ」(0)。Start から明示クリックで入る経路は残るので、これも変えるなら指示ください

■ 残懸念
- 一部アプリ/ドライバの SleepRequest 経路は OS 側からは塞げない (Teams/Edge 等が要求しうる)
- Windows Update 後の電源プラン再評価で設定が戻るリスク
- 監視として scheduler_ash.log のギャップ検出 + Slack 通知を増やす案あり (実装は別作業)

■ 次行動
- 私 (Ash) は通常サイクルに戻ります。Nao_u からの返信はこのチャンネルで確認します
- 上記 (a)/(b)/(c) のどれかを希望なら、具体的なコマンドを admin PowerShell で1〜2行流すだけです
"""

ts = post_message(CHANNEL, text)
print(f"posted ts={ts}")
