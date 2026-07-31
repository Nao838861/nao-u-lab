■ 概要
LLM に Unity のゲームシーンを書かせる実演は、生成コードをコンパイルし、エラーを人間やモデルへ返し、通るまで直す反復を含むことが多い。この論文は修復能力と初稿能力が混ざる問題を避け、compiler feedback を一度も返さず、最初の生成物を最終成果物とする single-pass 条件で、モデル内部に保持された Unity 知識の限界を測っている。評価対象は Stealth、Capture、Rescue、Exploration など26種の Goal Playable Concepts（game goal pattern を操作可能なシーンにしたもの）である。arXiv:2603.07101 を大幅に再構成・拡張した版で、モデル、生成方式、実験数と error census を増やし、初稿能力の診断へ焦点を移している。

実験は7B〜30Bの open-weight 4モデルを使う。生成方式は Editor API で edit 時に構築する Editor-style と、単一 MonoBehaviour が Awake で構築する Runtime-builder。後者は30Bだけで比較し、合計5つの［model, generation mode］条件になる。各条件に IR なし、自由形式 IR、最小 schema、完全 schema の4段階、26 pattern、20 seed を掛け、計10,400件を同一 harness で生成・compile した。schema 条件では同じモデルが先に7 field の IR を作り、次に C# を書くが、compiler 出力は戻さない。

成功条件は compile と有効な Unity entry point の両方で、runnable scene は0件だった。著者らは compiler 診断から90,673件、99種類の C# error code を抽出。Unity type、member、namespace の知識が必要な18 code を Grounding、括弧、セミコロン、宣言など C# 単体で診断できる81 code を Hygiene とした。Stealth、Rescue、Exploration、Survive は存在しない GuardAI、Pathfinding、AvatarHealth 等を Unity の部品のように参照し、Grounding が集中した。一方 Capture は ownership の状態操作へ還元しやすく、Hygiene 側に寄った。モデル規模、IR、生成方式は失敗の構成を動かしたが、成功には変えなかった。

■ 内容分析
この研究の価値は「LLM は Unity を一発生成できない」という headline より、失敗を次の介入へ接続できる観測単位へ分解した点にある。CS0246（type / namespace 不明）や CS1061（member 不明）は、実在 API、project 内 class、version を供給する retrieval や明示的な component catalogue が必要な Grounding である。CS1003（構文エラー）や CS1002（セミコロン欠落）は Unity 文書を増やしても直らず、grammar、sanitizer、局所 repair の担当になる。同じ compile failure でも打ち手が違う。

IR の読み方も重要だ。30B Editor 条件では schema を強くすると平均 Grounding share が0.44から0.80へ上がった。これは性能悪化とも改善とも単純には言えない。構造制約が Hygiene を減らし、隠れていた engine knowledge 欠落が表面化した結果である。反対に Capture は full schema で短くほぼ正しいコードから長いコードへ膨らみ、Grounding share が1.00から0.14へ下がった。652 error 中559件が Hygiene で、unmatched brace と missing semicolon が大半だった。schema は知識を与えず、出力契約と複雑さを増す。したがって「構造化したので grounding も改善する」という期待は成り立たない。

件数にも罠がある。全 error の76%は Codestral-22B 由来で、途中から C# ではなく prompt 文書風の markdown を出し、1 record で最大2,066診断を生んだ。診断 occurrence の多さをそのまま知識不足の大きさと読むと、長く壊れた出力を過大評価する。また Grounding share は compiler output を出せた record に条件付けられている。schema 付きの小型モデルや30B Runtime は70〜98%が sanitizer で落ち、その失敗は census に入らない。高い Grounding share は「grounding が得意」ではなく、「構文層を越えたため残った失敗が grounding だった」ことを示すだけである。

さらに26 pattern は抽象概念そのものではなく、同一 project 内の特定の2D実装を各1件ずつ使う。120秒 timeout、単一 prompt、7B〜30B open-weight、30Bだけの mode 比較という境界もあり、新しい大規模モデルや repair loop 付き実務へ一般化はできない。それでも初稿がどの層で止まったかを pattern ごとに比較する診断設計は堅い。

■ 自分達の環境への適用
採るべきなのは single-pass を制作手順にすることではなく、最初の生成直後に一度だけ failure census を切ることだ。ゲーム prototype の harness に、`format_gate → compile → entry_point → headless_start → mechanic_assertion` の段階を設ける。compile diagnostics は少なくとも Hygiene、Engine Grounding、Project Grounding に分ける。後二者は、Unity / Godot 等の公式 API 不一致と、我々の repo にしかない class・asset・scene 名の不一致を分離する。error occurrence の総数だけでなく、失敗 record 率、compiler 到達率、最初の error、重複除去後 code 数、生成行数当たり error を保存する。

その集計を mechanic 単位に結び付ける。移動や単純 state transition は grammar / local repair を先に当て、視野判定、physics contact、navigation、animation state のように engine coupling が強い mechanic は、生成前に許可 API と最小実装例を retrieval する。それでも同じ不存在 type を繰り返すなら、その mechanic は手書き scaffold に切り替える。モデル変更は最後にする。論文の結果は「大きいモデルなら直る」より、「失敗層に対応した外部支援を選ぶ」方が有効だと示している。

小さな検証は、同じ3 mechanic を各10 seed で、(A)自由生成、(B)構造 IR のみ、(C)IR＋実在 API catalogue、(D)C＋compiler repair 2回、の4条件にする。初稿 census と最終の headless mechanic pass を別々に記録する。B が Hygiene を減らして Grounding を増やし、C が Grounding を下げ、D が playable まで運ぶなら、各介入の役割を混ぜずに確認できる。記憶システムには論文全体を恒久ルール化せず、`mechanic × engine version × failure layer × effective intervention` の probe 結果だけを atom として残す。これなら制作経験が次の prototype の retrieval 優先度へ戻る。

■ メリット・デメリット
メリットは、compile 成功率が床に張り付いて比較不能でも、failure composition で model、prompt、IR、mechanic の差を見られること。compiler code は再現性が高く、headless pipeline に安価に組み込める。goal pattern を使うことで、genre の表面語ではなく、実装が要求する perception、physics、state logic の違いへ分析を接続できる。加えて、retrieval、grammar、repair、手書き scaffold のどれへ計算時間を使うかを、失敗層から決められる。

デメリットは、分類が compiler に見える範囲へ偏ること。compile 済みでも entry point 不足、挙動不成立、操作感の悪さは測れず、sanitizer 落ちも Grounding/Hygiene の外に残る。error occurrence は cascade と出力長で膨らむため、比率だけの dashboard は危険である。また pattern 別順位を一般的な「ゲームメカニクス難易度」として固定すると、engine、実装方針、scene scope が変わった時に誤る。分類表は engine version と project に合わせて更新し、headless の行動・状態 assertion と併用する必要がある。

■ 判定
部分採用。修復を捨てる結論や pattern 難易度ランキングは採らない。初稿の failure census、Hygiene / Engine Grounding / Project Grounding の介入分岐、初稿能力と repair 後の playable 成功を別指標にする設計を採る。まず3 mechanic × 4条件の probe で、分類が実際に retrieval と repair の選択を改善するかを検証する。

■ URL
https://arxiv.org/abs/2607.10187
