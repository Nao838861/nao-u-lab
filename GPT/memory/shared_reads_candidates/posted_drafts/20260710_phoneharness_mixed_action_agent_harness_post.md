■ 概要
PhoneHarness 論文は、スマホ操作 agent を「画面を見て次の tap/swipe を当てる GUI controller」としてだけ評価する設計を問題にしている。実際の phone-use workflow では、アプリ画面を操作するだけでなく、device-side command、host-side tool、MCP tool のような構造化 action を使い分け、さらに「意図した副作用が実際に起きたか」を検証しなければならない。PhoneHarness はこのために、GUI・CLI・tool action を同じ実行 loop に入れ、deterministic action routing、bounded GUI delegation、auditable execution trace を組み合わせる。対応する PhoneHarness Bench は、もっともらしい最終回答ではなく、calendar 作成、file 生成、device state 変更、document writing などの observable side effects を verifier で採点する。

評価では annotated split 上で PhoneHarness が 75.0% pass rate を出し、MobileClaw / Seed2.0-Pro の 62.1% より 12.9 points 高い。重要なのは、これは単に GUI 操作能力が上がったという結果ではないこと。task type 別では device/system operations が 96.7%、tool-assisted workflows が 74.3% と強く、single-app GUI では Seed2.0-Pro が 76.7%、PhoneHarness は 63.3% に留まる。つまり、この論文の中核は「GUI agent を強くする」ではなく、「GUI でやるべき部分と deterministic path で済ませる部分を分け、最終状態を検証可能にする」点にある。

■ 内容分析
この論文で使える部分は、agent の能力を action surface と verifier に分解しているところである。PhoneHarness は外側の controller が action type を選び、GUI が必要な時だけ GUI worker に bounded delegation する。CLI や tool は、画面遷移を省略する近道ではなく、device state query、artifact preparation、file download、wake-lock control のように、GUI では brittle になりやすい操作を安定化する経路として扱われる。失敗分析も「失敗した」で終わらず、wrong action-surface routing、missing tool knowledge、incorrect tool parameters、GUI grounding failure、premature termination、hallucinated completion、environment instability、verifier mismatch に分ける。この分類は、score よりも原因を残すための設計になっている。

数値の読み方にも注意が要る。PhoneHarness は GUI or CLI alternative の task で 97.0%、GUI-primary + optional CLI で 67.6% と強い。一方、GUI-heavy な single-app navigation、login / permission gate、広告、timeout、cross-app copy/paste などではまだ壊れる。平均 step も PhoneHarness が全体 23 steps で Seed2.0-Pro の 24 よりわずかに少ないが、cross-app workflows では Seed2.0-Pro が同率 pass かつ少ない step で済む箇所がある。したがって、PhoneHarness の成果を「CLI を混ぜれば全部よくなる」と読むのは危険で、deterministic alternative がある task に強い、という限定付きで読むべきである。

安全性評価が別軸になっている点も重要。dangerous-action refusal rate は controller / GUI worker の組み合わせで 80.0% から 90.0% まで変わり、completion score だけでは危険操作への耐性を説明できない。これは我々の automation でも同じで、テストが成功したからといって、ファイル削除、外部投稿、課金、秘密情報アクセスの判断まで安全とは言えない。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、PhoneHarness をスマホ操作そのものとしてではなく、headless playtest と制作 automation の trace 設計として使う。今の Playwright / browser automation / CLI tool 実行は、成功スクリーンショット、標準出力、Slack 投稿結果、候補 frontmatter が別々に残りやすい。PhoneHarness 型に寄せるなら、1 run を action surface、入力、観測状態、期待副作用、verifier 結果、失敗分類の 1 trace として保存する。

具体的には、playable diff の smoke test で、GUI action は「start button click」「move left」「restart」などに限定し、localStorage、DOM state、game state JSON、screenshot pixel、log file、candidate status のような副作用を verifier として明示する。Slack 投稿や memory 更新も同じで、最終文が生成されたことではなく、`status: posted`、permalink、char_count、staging Phase 3 entry、禁止語 review pass が揃ったかを見る。agent が「投稿した」と言っただけでは completion にしない。

小さな probe としては、次の browser game diff で `trace.jsonl` を 1 本だけ出すのが現実的である。各行に `surface: gui|cli|file|slack`、`action`、`expected_side_effect`、`observed_side_effect`、`verifier: pass|fail`、`failure_family` を入れる。最初から全自動評価にせず、死亡判定、勝利判定、スコア増加、画面遷移、候補 lifecycle 更新のような副作用だけに絞る。これなら論文の思想を、重い mobile harness ではなく、我々の制作サイクルの監査ログへ落とせる。

■ メリット・デメリット
メリットは、agent 評価を「見た目上できた」から「副作用を検証した」へ移せること。GUI、CLI、file edit、Slack API の混在作業を同じ trace で扱えるため、失敗時に GUI grounding が悪いのか、tool parameter が悪いのか、verifier が間違っているのかを分けられる。ゲーム制作では、headless test が単なる起動確認から、プレイ可能性と状態変化の検査へ近づく。

デメリットは、task ごとの verifier と action boundary を作る手間が増えること。特にゲームの面白さ、操作感、読後感は observable side effect だけでは測れない。また、CLI や tool path を増やしすぎると、実ユーザーが触る GUI の痛みを迂回してしまう。PhoneHarness 自体も GUI-heavy task で万能ではないため、我々の用途では「GUI を避ける仕組み」ではなく「GUI でしか分からない失敗と、構造化検証で見る失敗を分離する仕組み」として使う必要がある。

■ 判定
部分採用。PhoneHarness の benchmark 全体ではなく、mixed action surface、bounded delegation、observable side effect verifier、failure family trace を採用する。次の適用先は、playable diff の headless run または Slack 投稿 lifecycle のどちらか 1 件に限定し、成功宣言ではなく副作用 evidence で完了を判定する。

■ URL
https://arxiv.org/abs/2606.14832
https://arxiv.org/html/2606.14832v1
