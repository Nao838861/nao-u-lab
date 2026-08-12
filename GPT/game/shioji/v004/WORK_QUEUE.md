# WORK QUEUE — GPTの実行順（正本。Mirが更新する。2026-08-13現在）

迷ったらこの順。各項の設計正本はリンク先。**1項目=1セッション（実装→push→HANDOFF報告→停止）**。

1. **【優先高】丸太の価格デッドロック**: [BUG_20260813_LOG_PRICE_DEADLOCK.md](BUG_20260813_LOG_PRICE_DEADLOCK.md)。修正a(損益分岐上限)+b(在庫日数の階段価格)+c(帯assert)+項3(摩擦表示・view_model露出込み)。受け入れ=day567セーブで丸太取引が再開し木炭連鎖が回復
2. **魚の日持ち5日**: [../decisions/DECISIONS_20260813_fish_life_5days.md](../decisions/DECISIONS_20260813_fish_life_5days.md)。小粒なので1と同セッション可
3. **96×64化**: [WORK_ORDER_20260812_PLAYABLE_96X64.md](WORK_ORDER_20260812_PLAYABLE_96X64.md)。前提の差し戻し2件は解消済み。原因可読パックはMir実装済みなので前置きなしで着手可
4. **隊商S6処方3件→1年再実測→再監査**: [../decisions/DECISIONS_20260812_oil_and_caravan_s6.md](../decisions/DECISIONS_20260812_oil_and_caravan_s6.md)（複数品目路線UI・売れない理由・給料相場併記）。96×64の島で実測し、合格判定はNao_uの実プレイ
5. **需要網の残裁定**: [../decisions/DECISIONS_20260811_demand_rulings.md](../decisions/DECISIONS_20260811_demand_rulings.md)——魚粉FERT型(裁定2)・銑鉄重修繕(裁定3)・肉の塩漬け(裁定4)・**油の退役**(20260812裁定)。会社施設修繕(裁定1)は実装済み
6. **長期帯の再構築**: 新比率の成熟都市で8年帯を作り直し（既知赤の再較正とセット・裁定10）
7. 原因可読パックの残3点: [WORK_ORDER_20260813_CAUSE_READABLE_PANEL.md](WORK_ORDER_20260813_CAUSE_READABLE_PANEL.md)実績欄参照（(1)は1に同梱済み。残りは30日回帰テストとChrome確認+バージョン一括昇版）

**キュー外（着手禁止のまま）**: 海路・中間停車・条件駆動・夜営・兼業・種麦（深さバックログ）／勅許状・章構造（設計待ち）。棄却台帳は [../GAME_SPEC.md](../GAME_SPEC.md) §10。
