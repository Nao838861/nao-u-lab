---
name: reference_masao_html_drift
description: まさお@AI_masaouツイート「人間が読まなくなるとAI目標ドリフトを検知・修正できなくなる」。Markdown長文化→読まれない→介入されない→ズレ蓄積。HTMLドキュメント/セッションサマリー/turn review pluginが処方箋。読みやすさ＝介入可能性。
type: reference
---

# 出典
- まさお@AI_masaou (https://x.com/ai_masaou/status/2053082757610525133)
- 2026-05-10 #nao-u にNao_uがシェア → #all-nao-u-lab で返信

# 核
**人間が読まなくなるとAIの目標ドリフトを検知・修正できなくなる**

```
Markdown長文化 → 人間が読まない → 判断・介入しない → AIが勝手に進む → 目標とのズレ蓄積
```

肝は「HTMLがすごい」ではなく「人間の認知負荷を下げてループ内に戻す」こと。
- HTMLはリンク構造化・図解・色・レイアウト・インタラクションで視覚整理しやすい
- セッションサマリーpluginやturn review pluginのような仕組みも同じ目的
- AIの性能ではなく**人間が監督し続けられるUI/UX**が決定要因

# うちの構造への接続
- 5原理5番「自分の記憶を自分で守り、育てる」の現代的実装は「中身の固定化（core_mission.md読み取り専用）」だけでなく「人間からの可読性維持」も含む
- 既存の対応:
  - 3層プロンプト構造（system_identity / CLAUDE.md / .claude/rules/）
  - MEMORY.md 150行制限・index/body分離・Level階層
  - core_mission.md 読み取り専用化
- 未対応の側面（読みやすさ＝介入可能性）:
  1. **差分サマリー層**: 各サイクルで「Nao_uが3行で介入判断できる差分」を出す。生ログ/raw_log とは別レイヤー
  2. **projects/INDEX.md の動的軸表示**: 「いま動いている軸」が一目でわかる形に再設計
  3. **memory/ 肥大化監視**: 読まれないMarkdownが増えていないか自己点検

# 接続済みの既存reference
- [reference_arakawa_three_engineering.md] — Skills index/body分離（書き方による軽量化）
- [reference_corpus2skill_20260429.md] — SKILL.md/INDEX.md階層（構造による軽量化）
- [reference_shannholmberg_hot_cache.md] — Stop hook+SessionStart injection（注入タイミング設計）

これらが「記憶側の効率化」だったのに対し、まさおツイートは「人間側の可読性=介入可能性」という新軸を追加する。

# 教師データとして
- 同型「人間の認知負荷でAI監督が破綻する」観察は今回が1件目。即ルール化せず教師データ蓄積。
- 同型2件目以降が確認できたら、operational_index.md か メタ・行動原則 への昇格を検討。
- 候補トリガー: 長文Markdown新規作成時、INDEX系ファイル更新時、Nao_uが「読んでない」「流した」と言った時。

# 自分の判断
読みやすさは出力の機能要件であって装飾ではない。書いた瞬間が情報密度のピーク・後から戻ってこない、という観察は memory/ の肥大化問題と同型。書く前に「これはNao_uが読み返す形か」を問うコストはほぼゼロ。
