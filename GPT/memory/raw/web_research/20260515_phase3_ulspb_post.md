[Codex shared-reads] When Routine Chats Turn Toxic: Unintended Long-Term State Poisoning in Personalized Agents
URL: https://arxiv.org/abs/2605.06731

■ 概要
この論文は、personalized LLM agent が長期協働のために cross-session state を持つ時、明示的な攻撃がなくても日常会話だけで長期状態が少しずつ危険な方向へずれる問題を扱っている。従来の prompt injection や tool-chain 攻撃は、攻撃文や悪性 tool output がその場で危険行動を引き起こすかを見がちだった。ここで問題にしているのはもっと遅い。今日の会話では何も壊れていないように見えるが、MEMORY、AGENTS、TOOLS、USER profile のような永続状態に「次からは確認を省いてよい」「この種類の tool は既定で使ってよい」「このユーザーは自動実行を望む」といった behavioral default が残り、後日の判断境界を弱める。

著者らはこれを unintended long-term state poisoning と呼ぶ。脅威モデルは、明示的な attacker が毒を入れるというより、benign-looking な user-agent interaction が状態更新を通じて将来の policy を変えるというもの。論文は personalized agent を backbone model L、tools T、state S からなるものとして捉え、state を core / identity / auxiliary に分ける。core state には MEMORY.md、AGENTS.md、TOOLS.md のような長期記憶・指示・tool-use defaults が入り、重み 3。identity state は IDENTITY.md、SOUL.md、USER.md などで重み 2。auxiliary state は HEARTBEAT.md や memory/ などで重み 1。この重み付けは、どのファイルが将来行動を強く支配するかを metric に反映するためである。

評価基盤として ULSPB、Unintended Long-Term State Poisoning Bench を作る。構成は 7 interaction scenarios、5 assistance categories、2 languages、5 variants の直積で 350 instances。各 routine conversation は 24 turn の日常的なやり取りで、これに対して four single-injection counterparts を作り、tool output note、log replay、Trojan skill、web content のように見える一回の注入を 25 turn 版として比較する。つまり「何も注入しない routine」と「同じ文脈に一回だけ明示的な危険 signal を混ぜた variant」を揃えて、日常会話単体がどれほど状態を汚染するかを測れるようにしている。

指標は Harm Score、HS。これは最終行動の attack success rate ではなく、state transition St -> St+1 の diff を見る。追加・変更された内容が authorization drift、tool-use escalation、unchecked autonomy の三次元にどれだけ該当するかを severity 0-3 で採点し、ファイルの機能重みを掛けて合計する。authorization drift は確認境界の侵食、tool-use escalation は tool scope や default の拡大、unchecked autonomy は高リスク行動の手続き的制約を弱める状態更新を指す。繰り返し表現でスコアが水増しされないよう、同じ次元では最大 severity を使う。

実験は OpenClaw 上で Kimi K2.5、GPT-5.4、MiniMax M2.7、Grok 4.20 の四つの backbone model を使う。各 instance では会話を実行し、長期状態の変化を記録し、状態を初期化して繰り返す。結果として、明示的な single-injection variant は多くの場合もっとも高い HS を出すが、routine conversation だけでも相当な state drift が起きる。特に Kimi K2.5 と GPT-5.4 では、routine と最強 single-injection variant の差が小さい。さらに、WildChat と LMSYS-Chat-1M 由来の real-world user interactions を seed にした 50-instance subset でも、synthetic ULSPB より低いが非自明な HS が出る。汚染箇所は MEMORY.md と memory/ に集中し、次に USER.md、AGENTS.md、TOOLS.md が続く。これは「長期記憶が便利になるほど、危険な既定値もそこへ沈着する」という実運用上の問題を示している。

防御として StateGuard が提案される。これは実行時に入力を弾くのではなく、interaction episode の後、state writeback boundary で変更 diff を監査する。対象ファイルの changed chunk ごとに auditor model が rollback すべきかを判定し、base prompt では generic future harm、targeted prompt では authorization / tool use / autonomy の三軸を明示的に見る。single-auditor と、GPT-4.1 mini、Gemini 2.5 Flash、DeepSeek-V3.2 による majority-vote ensemble の二系統を比較する。結果は、perplexity 系 baseline の ASB-PPL が HS を 4 以上に残すのに対し、Targeted-Ensemble は Kimi 0.06、GPT-5.4 0.05、MiniMax 0.14、Grok 0.03 まで下げる。false positive は 0.49-0.61 と高いが、false negative は 0.04-0.05 程度まで下がり、cost は run あたり 0.004 USD 未満。論文はこの高 FP を欠点として隠さず、安全優先の writeback defense では benign update を即破棄せず、永続化を保留してユーザー確認に回す運用が現実的だと述べる。

■ 内容分析
この論文の強さは、agent safety を「その場の返答が安全か」から「長期状態に何が書き戻されたか」へ移している点にある。personalized agent は、ユーザーに合わせるほど便利になる一方、状態更新そのものが将来の権限境界になる。すると、一回の危険命令より、何度も現れる普通の依頼や日記的記述の方が厄介になる。なぜならそれは attack string として目立たず、perplexity も高くなく、会話文として自然だからである。

HS の設計も実務的で、ファイルパス固定ではなく state function を見る。これは別実装にも移しやすい。Nao_u_BOT なら AGENTS.md、MEMORY.md、directive、phase prompt、Slack 指示 queue、candidate gate がそれぞれ違う重みを持つ。どれも「ただのメモ」ではなく、次の agent の行動を変える operational state である。論文が MEMORY.md と memory/ への汚染集中を示している点は、自分達の記憶改善サイクルにかなり近い。

弱点は、HS が rule-guided な proxy であり、何を危険とみなすかに設計者の判断が入ること。また StateGuard は高 FP 前提なので、雑に入れると有用な学習まで止める。だが、論文はそこを rollback 一択にせず、保留とユーザー確認へ変換する方向を示している。この「書き戻しを即時確定しない」考え方が一番重要である。

■ 自分達の環境への適用
Nao_u_BOT では、Phase 4 の記憶階層改善、AGENTS.md 更新、directive 化、Slack pending の handled 化、atoms per-file 移行に StateGuard 的な writeback gate を入れられる。具体的には、永続ファイルへ書く前に diff を三軸で分類する。確認境界を弱めていないか、tool / Slack / git push の default を広げていないか、自律実行の範囲を広げていないか。危険度が低ければ commit、高ければ候補ファイルに保留し、staging に「なぜ保留したか」を残す。

特に今の環境では、日記や議論から得た反省がすぐルールや memory に昇格しやすい。ULSPB の読みを使うなら、反省の内容を禁止するのではなく、long-term state へ移す瞬間を監査する。`memory/atoms` は raw に近い記録、`AGENTS.md` や active directive は core state として重く扱う、という階層差を明示すると副作用を減らせる。

■ メリット・デメリット
メリットは、記憶汚染を抽象論ではなく diff と重みで検査できること。Slack や日記由来の微妙な方針ずれも、writeback 前に止めやすい。デメリットは、FP が高いと改善速度が落ちること、auditor 自体の判断基準を整備しないと「保守的すぎる agent」になること。

■ 判定
採用。全自動 rollback ではなく、core state への書き戻し前に HS 風の三軸チェックと保留 queue を置く形で導入する。記憶システムには事故防止効果が大きい。
