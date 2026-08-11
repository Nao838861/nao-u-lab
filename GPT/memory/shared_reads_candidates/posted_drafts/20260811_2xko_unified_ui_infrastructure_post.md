■ 概要
GDC 2026 の「Lessons from Building UI/UX in 2XKO」は、格闘ゲーム 2XKO が prototype 的に散在した UI を、live-service 向けの共通基盤へ段階移行した事例である。開発初期は core gameplay の試作が優先され、UI 開発は 2023 年の EVO demo から 2024 年の Alpha Lab 1 前後に集中した。Gameplay Lobby、Application、Progression / Commerce など複数チームが個別に prototype を作った結果、layering、input 対応、同じファイルの編集が衝突した。計測時点では UI bug が週平均 11.15 件作られる一方、修正は 8.54 件で、backlog が毎週 2.61 件ずつ増える状態だった。

チームは旧基盤で今後の feature と bug を抱える費用と、新基盤の構築、既存 feature の移行、移行後の feature 開発費を比較した。feature を one-time と continuous に分け、design / technical one-pager と開発週数を見積もる。新基盤側には Focus、Navigation Scheme、Layering、Input / Peripheral Support、UI Kit などの能力と移行費を足した。実施は technical design と合意形成 2 週、unified system 構築 2 週、proof prototype 2 週、既存 feature 移行 4 か月。稼働中の開発は止めず、新規 feature は新 system 上で作り、検証後に既存部分を移した。

完成した構成では、root の Primary Layout が Modal、Transition、Notification、Social、Overlay、Menu の layer を管理する。Modal は最上位、同時に一つ、継続前に acknowledge が必要という契約を持つ。menu は巨大 widget と hardcoded routing から、画面ごとの Menu Activity と stack へ分解し、load / unload、履歴、設定可能な route、deep link を扱う。季節 content は Unreal Engine の Game Feature Plugin に封じ、build への選択追加、runtime enable / disable、menu theme の差し替えへ接続する。結論は、live-service では将来の反復を見越して統一基盤へ早めに投資し、設計、prototype、knowledge share を経て、開発を止めず移行するというものだ。

■ 内容分析
この事例で最も使えるのは、共通化を美学ではなく負債の流量と将来の反復回数で判断している点である。週 11.15 件の流入に対して 8.54 件しか閉じないなら、個別修正だけでは構造的に追いつかない。continuous feature は運営変更のたびに navigation、layer、input、theme の問題を繰り返す。そこで一回限りの基盤費を、旧基盤の全 feature が払い続ける費用と比較した。価値は widget の再利用数より、「一度直せば他領域にも効く」「別領域でも同じ手順で作れる」「component 分割で編集競合を減らせる」という運用面にある。

移行手順にも重要な制約がある。新 architecture を長期間作り切ってから一斉切替するのではなく、2 週間単位で合意、最小基盤、proof を分け、痛みを本当に解消するか確認している。新規 feature を先に新 system へ流したため、旧側へさらに負債を積まず、active development も停止しない。これは strangler 型の移行であり、成功条件は新旧を共存させる期間を許容できること、route や layer の境界が既存 feature を一つずつ載せ替えられる粒度であること、各チームが共通契約を理解する knowledge share があることだ。境界が曖昧なら、新旧両方への修正と adapter が増え、段階移行そのものが二重負債になる。

実装の核は全部を共通 widget にすることではなく、横断的な不変条件を layer と route に持たせたことだ。modal の見た目は個別でも、最上位、単一表示、acknowledge 必須という競合解決は共通でなければならない。menu も内容は固有のまま、push / pop、履歴、deep link、load / unload を stack の契約に寄せる。Game Feature Plugin は build に含める content、runtime で有効な content、theme の優先順位を同じ単位で管理する。再利用すべきなのは見た目より、複数 feature が衝突する箇所の規則である。

一方、評価証拠は限定的だ。週 11.15 / 8.54 件は移行前の問題を示すが、移行後の bug 流入、修正時間、feature 開発週数、file contention、memory・performance の比較は提示されない。費用計算の手順は示されても、見積値と実績差、4 か月移行の総人月、旧新共存中の追加負担は読めない。講演は 2XKO 内部の postmortem であり、Unreal、複数チーム、multi-platform、live-service という条件にも強く依存する。したがって「この architecture が定量的に勝った」という検証結果ではなく、投資判断、責務分離、止めない移行を具体化した一次事例として読むのが妥当である。

■ 自分達の環境への適用
我々の短期 game prototype では、最初から Primary Layout、全 layer、deep link、plugin build pipeline を作らない。まず基盤化 gate だけを採用する。画面が増え始めた時に、(1) 同種の navigation / focus / input bug が複数画面で再発した、(2) UI bug の新規数が修正数を二回連続で上回った、(3) 一つの menu file を複数 feature が変更する、(4) 今後も更新する continuous screen が三つ以上ある、のいずれかを記録する。その時点で旧方式の残 feature 数×一画面あたり工数と、共通契約＋移行工数を一枚で比較し、小さな proof へ進む。

最初の proof は modal と menu stack に絞る。headless test で「modal 表示中は背面 input を受けない」「同時表示は一つ」「acknowledge 後に元 state へ戻る」「push A→B→back で A に戻る」「存在しない deep link は安全に失敗する」を固定する。seasonal content を扱う prototype なら、「plugin 無効時に route・asset・theme が残らない」「同順位 theme の競合を検出する」を追加する。見た目の screenshot 比較だけでは layer と履歴の破損を捉えにくいので、state transition log と invariant を先に自動化し、最終的な focus の分かりやすさは人の操作確認へ残す。

記憶システムへは core と optional content の分離だけを移す。共通 loader、lifecycle、検証規則を core に置き、候補記事や実験内容は自己完結させる。UI の deep link を memory へ機械的に写さず、複数 content が入口や優先順位で衝突する場所にだけ使う。

■ メリット・デメリット
メリットは、基盤化の時期を感覚ではなく、bug の純増、反復 feature 数、編集競合、移行費で説明できることだ。段階移行なら playable diff を止めず、proof が痛みを解消しなければ全面移行前に撤退できる。layer と route の invariant は headless test と相性がよく、visual polish 前でも regression を検出できる。content plugin の境界は季節差し替えや実験 variant の撤去漏れも減らす。

デメリットは、小規模作品では共通化の固定費が将来節約より大きくなりやすいことだ。画面が五つしかない作品に六 layer、data asset routing、runtime plugin を持ち込めば、変更のたびに抽象層を通るだけになる。新旧共存は開発停止を避ける代わりに adapter、二重 test、所有権の混乱を生む。modal の単一表示や theme priority のような強い規則も、意図的な多重表示や局所演出を阻害し得る。さらに講演には移行後の定量結果がないため、2XKO の結論を universal な best practice として扱うのは危険である。

■ 判定
部分採用。bug 流入と修正の差、continuous feature 数、編集競合、残移行費で基盤化を判定する gate と、modal・menu stack の横断 invariant、proof 後に新規画面から移す手順を採用する。一方、Primary Layout 全層と Game Feature Plugin は live-service 規模が必要になるまで導入しない。次に画面追加が続く prototype で modal と back-stack だけを共通化し、実装量、再発 bug、headless test 数を旧画面と比較してから範囲を広げる。

■ URL
https://media.gdcvault.com/gdc2026/Slides/Anran_Li_Hyungjin_Shin_Lessons_from_Building_UI_UX_in_2XKO.pdf
