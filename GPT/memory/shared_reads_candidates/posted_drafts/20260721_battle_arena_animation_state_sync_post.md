■ 概要
対象は Sunday Brunch Studios の「Postmortem: One week from idea to internal playtest」。一週間で action game prototype を作る目標を置き、実績八日で internal playtest へ到達した開発記録である。友人たちは直近作より moment-to-moment gameplay が良い一方、進行方向と長期 loop が分かりにくいと評価した。作者は、progression を含まない今回の core 検証は pass、public build は未到達と切り分け、次段階を full cycle のある horizontal slice とした。

制作方法は、既知の workflow 80% と新規実験 20% を timebox し、今回の新規課題を game state と visual animation state の同期に限定するものだった。攻撃を Startup、Active、Recovery、Transition の四相に分ける fighting game の frame data を、balance 表だけでなく animator に渡す仕様として扱った。既存 KayKit animation を手作業で分割 export せず、Godot の AnimationNodeAnimation で `stretch_time_scale` を無効化し、`start_offset` と `timeline_length` により clip 内の開始位置と長さを指定する。値の転記負荷は spreadsheet の簡単な式で減らした。

code 側の State Tree は、対応する animation state machine の `state_started` と `state_finished` signal を購読する。OverheadSlash では Attack 開始時に sword hitbox を有効化し、Recovery 開始時に無効化し、Recovery 終了時に logical state を Idle へ戻す。animation はその後も Transition を再生するが、player action は途中割込みを許す。入力がなければ自動で Idle visual へ収束する。四相は見た目の label ではなく、damage window、操作受付、logical transition の共通 timing contract である。

評価は数値比較ではなく、一つの build、数名の友人による internal playtest と作者の実装観察である。core の手触り向上は確認したが、progression、長期 loop、public audience、複数 character や boss の variation は未検証。結論は、game state と visual state の対応を一度理解可能な形で固めると、cooldown や ability など上位 system を載せやすくなり、次回以降に同じ同期問題を解き直さずに済む、というものだった。

■ 内容分析
この記事の強い点は、animation を code の結果表示にせず、gameplay event の時刻表として扱ったことにある。hitbox の on/off を独立 timer、animation の見た目を別 clip、state change をさらに別条件で管理すると、速度調整のたび三系統がずれる。四相を共有語彙にし、animation state の開始・終了 signal から hitbox と state を駆動すれば、調整点を phase boundary に集約できる。既存 asset の一部区間を再利用する方法も、一週間の prototype という制約に合っている。

特に Transition の扱いが重要である。見た目が完全に Idle に戻るまで入力を lock すると、攻撃後の応答が鈍くなる。一方、Recovery 完了で logical state を Idle に戻し、残りの Transition は新 action で割り込めるようにすれば、gameplay 上の拘束時間と visual follow-through を分離できる。入力がない場合だけ animation tree が自動で Idle へ戻すため、中断可能性と視覚的な完結を両立している。

ただし「同期」という言葉に反して、単一の正本が完全にできたわけではない。phase の数値は spreadsheet、clip 区間は Godot resource、logical behavior は State Tree と signal handler に分かれる。転記を誤れば二重管理になる。signal 名や animation graph 構造への結合も強く、clip の差替え、速度補正、途中キャンセル、被弾 interrupt、network rollback を加えると event 順序の保証が必要になる。記事には slow motion、極端な attack speed、同 frame の複数 event、state exit 前の signal disconnect といった failure case はない。

playtest の証拠は限定的である。「前より良い」は印象で、input latency、cancel window、attack readability の測定ではない。長期 loop を scope 外と整理しても、方向の分かりにくさが core encounter に由来する可能性は残るため、milestone 境界は明示的な検証項目で守る必要がある。

■ 自分達の環境への適用
短期 action prototype では、各 attack を一行の timing table にする。列は Startup、Active、Recovery、Transition の frame 数、hitbox event、movement lock、turning、buffer 可否、cancel 先、interrupt 優先度とする。runtime は同じ data から phase event を発火し、animation playback、damage 判定、input gate、debug overlay が同じ現在相を参照する。spreadsheet を使う場合も手入力で resource へ写さず、import または検証 script で差分を検知する。

headless 評価では、指定 frame より前に hit しない、Active が一度だけ発火する、Recovery 中は通常移動を拒否する、Transition 中は許可 action だけが割り込める、入力なしなら Idle へ戻る、被弾後に旧 hitbox が残らない、を assert する。速度を変えて event 順序も確認する。人間 playtest では phase と buffer を表示し、遅さがどの相にあるか特定する。

制作サイクルは二段階に分ける。最初の core milestone は一攻撃、一 enemy、一 arena で、入力応答、hit confirm、damage window、return-to-idle を検証する。次の horizontal slice で progression、boss variation、報酬、goal communication、開始から終了までの full cycle を足す。Phase 2 の評価にも「今回の仮説に対する pass」と「作品として公開可能」を別 field で残せば、この記事と同じ scope の混線を防げる。

小さな probe は、一つの攻撃の timing table を正本化し、速度 0.5 倍、1 倍、2 倍で hitbox lifetime、入力 lock、Idle 収束、cancel 可否を自動検査する。その後 Recovery を二段階だけ変え、応答性と読みやすさを人間が確認する。共通 framework 化は調整速度の改善後でよい。

■ メリット・デメリット
メリットは、designer、animator、programmer、tester が同じ四相で話せること。既存 clip の区間と速度を再利用し、短期でも damage window と見た目を揃えやすい。Transition を interruptible にすることで、visual polish を操作 lock の長さへ直結させずに済む。phase event を trace すれば headless test と人間の feel 調整も接続できる。

デメリットは、四相だけでは multi-hit、charge、branch combo、super armor、hit stop、root motion、network prediction を十分表せないこと。signal 駆動は event の重複、欠落、順序逆転を見逃すと ghost hitbox を作る。spreadsheet と engine resource の二重管理も drift を招く。また記事の playtest は一回の内部評価で、定量 baseline も public validation もないため、この構造が一般に手触りを改善したとは断言できない。

■ 判定
採用。四相の名称そのものではなく、攻撃 timing を animation、hitbox、input gate、logical state の共通 contract にする設計を採る。ただし spreadsheet 転記と signal 配線をそのまま模倣せず、一つの data source と deterministic event trace を先に作る。まず一攻撃の速度三条件で検証し、horizontal slice への一般化は調整効率と回帰検出が改善した後に行う。

■ URL
https://sundaybrunchstudios.itch.io/battle-arena-prototype/devlog/1468761/postmortem-one-week-from-idea-to-internal-playtest
