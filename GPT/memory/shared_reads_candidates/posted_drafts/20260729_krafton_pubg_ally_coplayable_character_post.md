■ 概要
KRAFTON が、PUBG: BATTLEGROUNDS に導入した AI teammate「PUBG Ally」の構成と評価を説明した NVIDIA Technical Blog の Q&A。目標は、player の音声指示と変わり続ける試合状況を理解し、会話と game action の両方で協力し、試合をまたいで相手を覚える co-playable character を作ることだった。battle royale では自然言語能力だけ高くても、返答や行動が遅ければ teammate として成立しない。この実時間制約を中心に architecture が組まれている。

入力は player voice と live game state、出力は発話と game action である。voice は ASR で文字化され、game engine は現在状態を plain text で返す observation tools を公開する。Mistral-NeMo-Minitron-2B は発話または game event で起動し、必要な状態を tool で観測して発話と行動意図を生成する。発話は TTS、行動は behavior tree へ渡る。model は量子化して client 上で動かし、PUBG 本体と同居しながら total 8GB VRAM の GPU に収めた。cloud の network 往復を避け、一般知識より応答性を優先した判断である。

遅延対策は model の小型化だけではない。固定 instruction と安定した context を保ち、更新部分を realtime 情報へ絞って KV cache を効かせる。「速い反射」と「遅い熟考」も分離し、movement、aiming、即時 combat response は game tick で動く System 1 の behavior tree、intent 解釈、協調、発話は System 2 の SLM が担当する。工数の大きな部分は両層の境界決めに使われ、生成が遅れても回避や照準まで停止する構造を避けた。

世界知識にも境界を置いた。全 PUBG を扱わず、Sanhok、AI Duo、固定 item taxonomy に限定する。landmark、weapon、可能な action の deterministic specification を teacher model に与え、正しい用語、できないこと、curated dictionary を呼ぶ条件を student へ distill した。一方、HP、弾数、safe zone、近傍 item は記憶から答えさせず、observation tool の戻り値だけを ground truth とする。静的 domain knowledge と変動する authoritative state を分けた grounding である。

記憶は二つの時間尺度を持つ。short-term memory は現在 match の発話と出来事、long-term memory は名前、好みの weapon、drop location、過去 match の notable moment を保持する。前戦で Beryl を頼んだ player に次戦から自発的に探す、名前や好みを次戦で使う反応が、単発 assistant を継続する teammate へ変えた。英語・韓国語・中国語では短い命令、slang、item 名、map callout を community ごとに調査した。

非決定的な出力は、interaction protocol、tool 利用、発話と action の整合を automated evaluation で検査し、candidate model を live playtest と A/B で比較、最後に千人超の実 player で検証した。survey と自由記述で得た失敗・好悪を評価基準へ戻す。結論は、offline metric や小さな内部 team だけで「良い teammate」を定義せず、早い prototype を多数の player に出し、安価に反復できる loop を先に作るべきだというものだった。

■ 内容分析
この事例で再利用価値が高いのは 2B model の銘柄ではなく、時間、authority、記憶の三境界である。反射行動を deterministic な game system に残す時間境界、現在状態を engine tool だけに決めさせる authority 境界、match 内 context と継続 profile を分ける記憶境界が、生成 model の不確実さを gameplay 全体へ漏らさない。language model を万能 controller にせず、曖昧な intent と会話を扱う狭い役へ置いたから、失敗を観測・置換できる subsystem に保てている。

特に「再観測を learned behavior にする」設計が重要である。数秒前の正しい HP や item 情報が現在も正しい保証はない。Ally は必要な slice を tool で引くため、発言の根拠を engine state まで追える。ただし tool call から action 実行までにも state は変わる。記事は timestamp、実行前の再検証、tool failure、競合 command、timeout 時の fallback を説明していない。authoritative source があることと利用時点で新鮮なことは別である。

記憶の成功例は好意的な逸話で、誤記憶率、修正・削除、保存期間、privacy、不快と感じた割合は示されない。評価も段階は分かるが、人数配分、比較条件、latency 分布、combat 成績、survey 尺度は非公開である。NVIDIA 製品を使った vendor Q&A で、失敗量や代替構成との費用比較も薄い。完成済みの効果証明ではなく、実時間生成 agent を壊れにくく分割した production architecture の一次事例として読むべきである。

■ 自分達の環境への適用
小規模 playable prototype では全構成を再現せず、三境界だけを最小 probe にする。即時層は既存 AI や state machine とし、移動、回避、攻撃継続、危険離脱を frame budget 内で完結させる。熟考層は「player の短い指示を有限個の intent と parameter に変換する」「状況を一文で説明する」だけに限定し、期限までに結果が来なければ即時層が安全な既定行動を続ける。生成結果を直接 input event にせず、許可 action schema、precondition、期限を通して behavior tree へ渡す。

engine observation は値、取得 tick、valid_until を返す。headless test では、不正 action を出さない、必要な tool を呼ぶ、古い observation を実行前に棄却する、speech と action が矛盾しない、timeout 中も core loop が止まらない、を検査する。latency は p50、p95、timeout 率を event 種別に残す。人間 playtest では、指示理解、待ち時間、誤りからの回復、記憶が助けか不快かを別々に聞く。

記憶は最初から個人 profile を永続化せず、current run の事実と、保存を許可された preference 一個を分け、source、更新時刻、削除操作を持たせる。次の run で有用に働き、誤りを訂正できてから広げる。評価は automated protocol test、少人数 blind playtest、候補 A/B とし、自然さより反射層停止ゼロ、不正 action ゼロ、stale-state action の検出可能性を優先する。

■ メリット・デメリット
メリットは、生成遅延が combat responsiveness を巻き込まないこと、発言の根拠を engine state へ追跡できること、model・prompt・behavior tree を独立に交換して回帰検査できることにある。closed world と action schema は小型 model でも品質を出しやすくし、short/long-term memory の分離は personalization の価値を小さく試せる。automated check と実 player の評価を直列にするため、offline 正解率だけ高いが teammate として邪魔な model を止めやすい。

デメリットは、二層の境界と tool schema が増えるほど integration と observability の費用が増し、behavior tree と SLM が異なる意図を持つ競合も起こること。on-device は network 遅延を消す一方、GPU 制約、発熱、platform 差、model 配布、量子化劣化を client 側へ移す。closed world は信頼性を上げるが、範囲外の map や item で急に能力が落ちる。永続記憶には誤記憶と privacy の負債があり、千人規模の評価 loop は小規模制作へそのまま移せない。

■ 判定
部分採用。model 選定や全機能ではなく、即時行動と言語推論の分離、authoritative observation と取得時刻、有限 action schema、match 内外の記憶分離、automated check から blind playtest へ進む評価順を採用する。最初の検証は一つの arena、一つの協調 intent、一つの preference に絞り、生成 timeout でも gameplay が止まらず、古い state と不正 action を headless で捕捉できた時だけ範囲を広げる。

■ URL
https://developer.nvidia.com/blog/how-krafton-built-pubg-ally-a-co-playable-character-powered-by-nvidia-ace/
