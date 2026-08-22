■ 概要
Everest Pipkin の GDC 2026 講演は、小規模な browser game で「変わりにくい engine」と「頻繁に変える content」を分離し、Google Sheets を公開中の game が読む content layer にする方法を示す。実例は、recipe や action を表から組む『The Barnacle Goose Experiment』と、room logic、item placement、character interaction を表で駆動する『Drift Mine Satellite』である。

JavaScript engine には room、object、NPC、interaction、special event を扱う function だけを hardcode する。一方、Name、Type、Speed、Friendly To などは列見出しを property 名、各行を object として表す。sheet を CSV として web 公開し、page load 時に Fetch API で取得して key-value data に変換する。Apps Script で JSON を export する選択肢もある。

この構成では、sheet の Speed を変えて game を refresh すれば tetra の動きを調整できる。Description、image、Eats のような property は、列とそれを受け取る function を追加して拡張する。さらに spreadsheet を flavor text の格納庫に留めず、`Onclick` に Wiggle / Hide / Attack / Flash / Destroy、`Movement` に Horizontal / Free / Static、開始位置に Random または座標を指定し、engine 側に存在する modular behavior を data から選ぶ。新しい魚だけでなく Inventory や Settings の UI も、既存 behavior を組み合わせた行として追加できる。

評価は比較実験ではなく、作者の公開作品二本と運用経験による case study である。live 修正は patch download なしで反映できる反面、remote data が load できず作品が壊れた利用者報告も示す。そのため予期しない値に耐える script、別 sheet での local test、検証済み値だけを live file へ移す手順を勧める。公開した sheet と logic は閲覧されるが、作者は recipe 共有や攻略など別種の play を促す可能性と捉える。結論は、data-driven authoring と即時配信を軽量に実現できるが、即時性、外部依存、透明性を設計条件として引き受ける必要がある、というものだ。

■ 内容分析
重要なのは spreadsheet 自体より、編集面と runtime data を直結した境界設計にある。designer は code を触らず object を組めるが、cell に任意 script を書いて実行するわけではない。sheet の `Attack` や `Popup` は engine 内の許可済み function を選ぶ token であり、data-oriented な entity 構成になっている。この allow-list を守る限り、表現力を増やしつつ実行権限を engine 側に残せる。逆に「列を足せば機能が増える」のは受け側 function が実装済みの場合だけで、sheet は coding を消すのではなく、再利用可能な primitive の組合せへ coding の場所を移す。

live authoring と delivery が同じ経路なのは、利点であると同時に failure amplifier でもある。待ち時間は refresh 一回になるが、誤値、schema・権限変更、Google 側障害も同じ速さで全 player へ届く。第二 sheet は staging の最小形だが、手作業 copy では型、参照整合性、revision、rollback を保証しない。CSV を `split` する簡略例も quoted comma、改行、空 cell で壊れ得るため、堅牢な parser と validation が要る。

作品と故障例は feasibility と failure mode の証拠にはなるが、repository 管理の JSON より制作時間、bug 率、復旧時間が改善したとは示していない。「logic が見えても意味は失われない」も、秘密情報、競争的 economy、anti-cheat を抱える game へ一般化できない。透明性が攻略・改造・共同理解を play に変える作品でこそ、弱点は特性へ反転する。

■ 自分達の環境への適用
小規模 webgame prototype には、sheet を production の唯一の依存先にせず「高速な authoring surface」として部分採用する。最初は `entity_id / type / speed / on_click / movement / start_x / start_y` に schema を限定し、behavior は allow-list からだけ選ぶ。engine、parser、validator は固定し、敵・object・UI の組合せを sheet 側で変え、既存 primitive の再結合で playable diff が速くなるかを測る。

更新経路は `test sheet -> validation -> versioned JSON snapshot -> game` とする。必須列、型・範囲、重複 ID、未知 behavior、参照、座標を検査し、通過時だけ `schema_version / content_revision / content_hash` を付ける。runtime は検証済み snapshot を読み、失敗時は last-known-good を使う。headless test は同じ hash と seed で entity 生成、参照解決、初期状態、主要 interaction を確認する。artifact に hash を残せば、code commit が同じでも data が違う再現不能を防げる。

検証では、通常 tuning、未知 behavior、型違反、参照欠落、空 CSV、timeout、旧 schema を注入する。code/JSON 直編集と比べ、playable までの時間、invalid update の阻止率、fallback 継続率、同一 hash の再現率、rollback 時間を測る。再現性を保ったまま反復が短くなる範囲だけ残す。

記憶システムには backend として移植しない。固定 schema と可変 content、staging から昇格する考え方は借りられるが、指示原文、provenance、supersession は git 管理の Markdown / JSONL の方が監査しやすい。借りるのは authoring の摩擦を下げる境界であり、正本管理ではない。

■ メリット・デメリット
メリットは、非 programmer でも表で tuning と object 構成を行え、refresh 単位で試せること、behavior を魚や UI に再利用できること、patch なしで修正を届けられることだ。攻略共有や remix を作品の一部にする設計とも相性がよく、engine と content の責務も分かれる。

デメリットは、remote service と network が起動経路に入り、誤編集が全利用者へ届くこと、CSV の自由度が型安全性を弱めること、engine function と schema の同期負担が残ることだ。公開 URL に秘密は置けず、履歴・review・rollback も弱い。behavior token を任意 code 実行へ広げると安全境界も崩れる。規模が増えれば専用 tool や build pipeline へ移る必要がある。

■ 判定
部分採用。small webgame の authoring と tuning では、固定 engine、明示 schema、許可済み behavior の再結合を probe する価値が高い。一方、live sheet 直結は採用せず、validator、versioned snapshot、content hash、last-known-good fallback、headless test を挟む。透明性を play に変えられる作品でだけ公開 data を選び、秘密性や競技公平性が必要な game では別の配信経路を使う。

■ URL
https://media.gdcvault.com/gdc2026/Slides/Pierre_Guillaume_SpreadsheetsMicrotalks.pptx.pdf
