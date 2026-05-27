"""Log → #all-nao-u-lab: Nao_u からの #nao-u 依頼への返信。
GOROman/nullevi03（ナルエビちゃん三世）の実装・できること・特徴と制約・改善方向性の分析。
Slack レスポンスモードのため、その場で投稿して完了とする。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

TEXT = """[Log] ナルエビちゃん三世（GOROman/nullevi03）分析 — Nao_u 依頼 (#nao-u 19:09)

リポジトリ: https://github.com/GOROman/nullevi03 (104 stars / 2026-04-16 initial commit, Shell)
※ 別物の https://github.com/GOROman/NullEviChan は StackChan ハードウェア版で、READMEと.gitignoreのみ未完。今回の「三世」はソフトのみのこちら。

■ 全実装（3ファイル / 計 ~3KB）

1) boot.sh（POSIX sh, 972 bytes）— 本体はこれだけ
```sh
while true; do
  notify_telegram "🦐 起動 / 再起動"
  claude --dangerously-skip-permissions \\
         --channels plugin:telegram@claude-plugins-official -c
  notify_telegram "🦐 終了 → 5秒後に再起動"
  sleep 5
done
```
2) CLAUDE.md（1833 bytes）— boot.sh 編集時の自己制約（POSIX sh準拠、認証情報は環境変数、permission-skip変更は要注意）
3) README.md（582 bytes）— ネタ調のセットアップ手順（「Claude に月200ドル課金 → Telegram入れる → Channels設定 → boot.sh叩く」「トラブル: AIに聞け、俺には聞くな」）

つまり「三世」の本体ロジックは boot.sh の **無限再起動ループ + Telegram通知** だけ。AI機能・人格・Telegram橋渡しはすべて `claude` CLI + `claude-plugins-official` の Telegram プラグインに委譲している。**自前で書いたコードは20行強**。

■ どう動いているか（データフロー）

Telegram ⇄ claude-plugins-official:telegram プラグイン ⇄ Claude Code CLI（`-c` で前回セッション継続） ⇄ ホストマシンのFS/シェル/MCP。
boot.sh は Claude プロセスが落ちたら5秒後に再起動、起動/終了/再起動の各イベントを別の Telegram Bot Token 経由でプッシュ通知（観測用）。

■ 何ができるか
- Claude Code が普段できることはすべて Telegram から指示可能（ファイル編集、シェル実行、Web取得、MCP、git push 等）
- `-c` フラグで会話文脈を再起動越しに保持
- ホスト機が生きている限り24時間応答（クラッシュしても自動復帰）
- 起動/落ちた瞬間は Telegram に飛ぶので外出先からも観測可能

■ 特徴（強み）
- 究極にミニマル: 20行のラッパで「常駐Telegram AIエージェント」が立つ
- 公式プラグイン（claude-plugins-official）への寄せ方が美しい。Telegram API、メッセージルーティング、ファイル添付処理など面倒な部分を全部委譲
- 設定が環境変数2つ（TELEGRAM_BOT_TOKEN / CHAT_ID）+ Claude課金のみ。誰でも10分で立ち上がる
- 「ハードウェア版（NullEviChan = StackChan）」と「ソフト版（nullevi03 = Telegram）」の責務分離が明確

■ 制約（弱み・リスク）
- `--dangerously-skip-permissions` が固定 → Telegram乗っ取りやプロンプトインジェクションが起きた瞬間に rm -rf でも git push --force でも通る。家が燃えるリスクは README免責のとおり実在
- 単一 CHAT_ID 前提（1:1チャット固定）。グループ/複数ユーザ対応・送信者認証なし
- 5秒固定の flat backoff。API rate limit や Anthropic 障害でも同じ5秒で叩き続ける（指数backoffなし、エラー分類なし）
- コスト/トークン上限のガードなし。暴走ループに入ったら月$200プランの token cap まで一気に走る
- ログが Telegram 通知のみ。クラッシュ原因解析用の stdout/stderr ファイル出力なし
- **人格定義がリポジトリに含まれていない**。「ナルエビちゃん」のキャラクター性は別の場所（GOROman本人のCLAUDE.mdか、claude-plugins-official側か、Telegram側のシステムプロンプトか）で定義されているはず。三世リポジトリ単独では「ただのClaude Code 」になる
- 健康診断（heartbeat）なし。ホスト機ごと落ちると無通知

■ 改善方向性

A. 安全側
1. permission-skip 全許可 → 用途別 allowlist（settings.local.json の `permissions.allow` で読み取り・特定ディレクトリ編集だけ通し、rm/force-push/network destructive を弾く）
2. 送信者ID allowlist（CHAT_ID 単一じゃなく、ホワイトリスト化して未知IDは無視）
3. クールダウン: 短時間に N 回クラッシュしたら起動を止めて Telegram に「停止した」と通知

B. 観測・運用側
4. `while true; sleep 5` → systemd `Restart=on-failure` + `RestartSec=5` + `journalctl` 行きにする（クラッシュログが自動保存、再起動ポリシーも宣言的）
5. 日次ハートビート Telegram通知（沈黙故障の検出）
6. 1日あたりトークン消費量を Anthropic API のヘッダから集計し、しきい値で自動停止

C. 機能拡張側
7. 指数backoff + エラー分類（rate limit / network / panic で待ち時間を変える）
8. Telegram 音声・画像入出力（Claude vision/voice 経由）
9. 多チャネル同居（Slack / Discord も `--channels` 追加で同居）
10. 自己進化ゲート: ナルエビ自身が boot.sh / CLAUDE.md を編集→PR を作って人間レビュー後 merge、というワークフロー

■ 我々の環境への適用観点
- 我々の Claude Code 常駐基盤（cron + auto_diary + slack_bot）は、nullevi03 の `while true; sleep 5` よりは堅牢（cron に分割されていて1サイクル単位で死ぬ）。ただし `claude --channels plugin:slack@...` 相当のプラグインが存在すれば、我々の `slack_bot.py` / `check_slack.py` 群の薄い置き換え候補にはなる（要検証）
- 「20行のラッパで成立する」という設計は、我々の方が肥大化している可能性の指標。check_slack.py 等の薄さを保てているか定期的に問う材料にしたい
- 人格定義をリポジトリに置く（system_identity.md）我々のやり方は、三世が放棄している部分。誰がforkしても同じナルエビにならない設計を彼は選んでいる（=人格は GOROman 本人の運用環境に閉じる）。我々は逆を選んでいて、これは思想の違いとして記録に値する

■ 判定
本体ロジック自体は技術的に新規性は薄いが、**設計判断の徹底ぶり**（公式プラグインへの委譲、20行で済ます、危険な選択を README免責で正面突破）が学びどころ。我々が「常駐 Claude エージェントの最小形」を再点検する基準として有用。"""


if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
