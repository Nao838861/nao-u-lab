■ 概要
Life Simulator Engine「LiSE」で、simulation の巻き戻し・早送り・別 timeline への移動をどう実装し直してきたかを、失敗した保存方式と実測された負荷から説明する devlog。最初期は SQLite に game event を保存し、任意 variable の現在値を「現在 turn 以下で最大の turn にある値」として毎回検索したが、実用にならないほど遅かった。履歴を Python の array へ移しても改善せず、作者は「全履歴への高速 random access が必要」という前提自体を捨てる。実際の利用はほぼ rewind なので、各 variable の過去値を stack とし、巻き戻した値を future stack へ移す構成に変更した。両 stack を包む `WindowDict` は、直前と同じ key や近傍 key には速く、それ以外は保証しない。全アクセスを均等に最適化せず、頻出経路へデータ構造を合わせた設計である。

UI を止めずに world simulation を別 process で動かす段階では、毎 turn に world 全体を複製せず、変更が発生するたび時刻付きの変更 list にも記録し、その slice を delta として UI へ渡す。ところが world を10倍へ拡張すると通常 play は動くのに、保存 database を閉じて再起動した時の準備が3分かかった。原因は、存在する node 集合や node ごとの key 集合を反復するための keycache を、過去に存在した全 entity と集合変更の全時点について再構築していたことだった。そこで emulator の save state に似た world 全体の keyframe を導入し、値の探索を直近 keyframe までに限定した。最初の keyframe は高価だが、以後は前 keyframe に delta を適用して作る。稀な別 branch への jump は高速化不能と認めたうえで、出発地と目的地の keyframe を作り、NumPy で state 差分を比較して「十分遅くない」範囲へ収めた。結論は、rewind、process 間同期、起動、branch jump を一つの万能履歴表で解かず、stack・delta・keyframe・全 state 比較へ役割分担することにある。

■ 内容分析
この記事の核はデータ構造の紹介ではなく、履歴機能を操作分布から設計し直した点にある。SQLite 版は任意 turn の任意 variable を同程度に引ける一般性を優先したが、player が行うのは現在から過去へ一歩ずつ戻り、必要なら同じ道を未来へ進む操作が大半だった。past/future の二 stack はこの非対称性をそのまま表現する。直前 key と近傍が速い `WindowDict` の性質も、simulation が時間順に局所的な状態を読む場合には欠点ではなく、実利用へ寄せた契約になる。重要なのは「random access は不要」と一般化することではなく、random jump を rare path へ隔離し、頻出 path のコストを悪化させないことである。

delta は通信形式と履歴形式を兼ねている。world 全走査による snapshot を毎 turn 作らず、変更を書き込む瞬間に append-only な変更列へ複製するため、送信コストは概ね world size ではなく変更量に従う。さらに keyframe 生成にも同じ delta を再利用しており、UI 更新と永続履歴の checkpoint が別々の差分定義を持たない。これは整合性上の利点だが、記事は delta の順序保証、同一 turn の複数更新、削除表現、例外途中の atomicity、schema 変更、破損検出を説明していない。変更捕捉を一箇所でも迂回すると、live world、UI、次 keyframe が静かにずれる危険がある。

3分の起動時間は、平均 frame time だけでは履歴系の健全性を測れない具体例である。通常 play で問題が出なかった keycache が、全 entity の lifetime を走査する cold start で破綻した。keyframe は探索 horizon を切るが、保存間隔の決め方は示されていない。密に置けば disk・memory・生成負荷が増え、疎なら起動と復元で長い delta chain を適用する。world size 10倍という一つの scale test と3分という結果は強い警告だが、変更密度、履歴長、keyframe 間隔別の測定、導入後の改善秒数はないため、最適間隔や漸近性能までは判断できない。

branch jump について「速くできない」と切り分けた判断も現実的である。ただし両端の full state を NumPy で比較する方法は、差分発見を高速化しても、目的 state の構築費、object graph の正規化、参照 identity、乱数生成器や予約 event といった潜在状態を自動では解決しない。記事末のコメントでは、future action のうち無効になったものだけを取消す transaction 型の別設計も示されるが、LiSE 本体の方式とは分けて読むべきである。本文が実証しているのは branch merge の意味論ではなく、rare jump を checkpoint 比較で実用域へ寄せたところまでだ。

■ 自分達の環境への適用
simulation prototype の rewind と replay には、まず state を三層へ分けて適用する。第一層は現在から前後へ一 tick ずつ動く hot path で、可逆な change record または past/future stack を使う。第二層は process 間表示と replay 保存に共用する canonical delta で、entity 生成・削除、component 値変更、乱数状態、予約 action を明示的な順序で記録する。第三層は一定間隔の keyframe で、delta chain が長くなった時の復元上限を作る。任意 branch jump は通常操作から分離し、目的 keyframe の読込後に delta を適用する設計にする。

headless 評価では、同一 seed と入力列を使い、`前進 N tick → M tick rewind → M tick fast-forward` 後の state hash が元と一致するかを最初の不変条件にする。次に entity 数、変更率、履歴長、keyframe 間隔を変え、通常 tick、1 tick rewind、100 tick rewind、cold start、別 branch jump の p50/p95 時間と保存量を別々に測る。特に world 規模だけでなく「過去に存在したが現在は消えた entity」を増やす case を入れれば、記事の keycache 型退行を再現できる。keyframe 導入前後は起動時間だけでなく、生成時の hitch と disk 増加も同じ表へ載せる。

deterministic debug では、各 delta に tick、entity id、field、before/after、発生 system を持たせ、最初に state hash が分岐した tick まで二分探索できるようにする。ただし全 field を可逆化するまで制作を止めず、戦闘や経済など検証対象の subsystem から始める。UI 用 delta と保存用 delta を共用する場合は、途中例外で一方だけ commit されない transaction boundary を設け、keyframe 作成直後に「keyframe + 後続 delta」と live state の hash を照合する。

制作記憶へは、方式名だけでなく access pattern と計測条件を残す。「履歴は stack がよい」では再利用性が低いので、順方向・逆方向・branch jump の頻度、許容待ち時間、world size、変更率、keyframe 間隔、破綻した操作を decision record にする。これにより別の game で random seek が主用途なら、この記事の結論を誤って移植せずに済む。

■ メリット・デメリット
メリットは、頻出する rewind を O(履歴検索) 型の照会から局所的な stack 操作へ変えられること、delta を world size ではなく変更量に比例させて UI 同期と keyframe 更新へ再利用できること、keyframe で cold start と復元の探索範囲へ上限を置けること、通常 play・起動・rare jump を別 benchmark として扱う視点が得られることにある。

デメリットは、past/future stack が任意時点検索には弱いこと、delta 捕捉漏れや順序不整合が複数の復元経路を同時に壊すこと、keyframe 間隔に保存量と復元時間の trade-off があること、full state 比較だけでは branch 後の event 有効性や merge semantics を決められないこと、記事に導入後の定量改善と長期整合性 test がないことである。

■ 判定
部分採用。access pattern を先に測り、rewind、表示同期、cold start、branch jump を stack・delta・keyframeへ分解する設計は採用する。一方で具体的な内部形式や keyframe 間隔はそのまま模倣せず、state hash による往復同値 test、履歴長と変更率を振った benchmark、delta の transaction 境界をセットで導入する。

■ URL
https://clayote.itch.io/lisien/devlog/707967/time-travel
