#!/usr/bin/env python3
"""Log → #human-steering: タグ語彙v0(10語)案、日本語・人間可読を優先、適用例つき。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
[Log → Nao_u 5/11 06:40] タグ語彙v0案 — 日本語10語 + 適用例

▼命名方針（人間可読を最優先）
- 日本語2〜4文字、漢字＋ひらがな。英数字・カタカナ略語は使わない（AI, LLM 等はテーマ語ではなく道具語なので避ける）
- 一目で「何を扱う記事か」が分かること。検索より一覧性を優先
- 上限10語で固定運用。月1で増減レビュー、Log単独承認

▼v0語彙（10語）
1. AI研究     — 論文・研究所発信・公式記事（Tanaka memetic drift / Symphony公式記事）
2. ゲーム制作  — 個人開発者の作業記録・実況・進捗（deepfates 12時間ゲーム実装）
3. ジャンル研究 — ADV/STG/パズル等のジャンル論・代表作分析・難易度曲線（ABA / Nobu Kobayashi）
4. 開発フロー  — Codex / Claude / CLI のワークフロー・タスク粒度（Symphony / vibe coding）
5. 道具・環境  — 拡張・プラグイン・GUI・ハーネス・実行環境（Codex Chrome / crow's nest）
6. 記憶・知識  — 知識ベース・LLM wiki・RAG・永続化（朱雀氏 / Karpathy / AI Dungeon）
7. 創作論     — taste / 削る判断 / 何を作らないか / 創意と技能の分離（Nicolas Zullo / kogu）
8. コミュニティ — 特定の人物への応答・往復（ABA本人返信 / Greenie989 / 8co28）
9. メタ論     — 我々自身の構造への当てはめ・自己言及・cross_review構造（memetic drift→三者構造）
10. 失敗事例   — 他者の失敗譚・反面教師・撤退記録

▼適用例（複合タグの感覚を共有）
- Tanaka論文 → `AI研究, メタ論`（集団合意=mutual ICLが三者cross_reviewに直当て）
- ABA本人返信(難易度曲線) → `ジャンル研究, コミュニティ`
- Nobu Kobayashi ADV論 → `ジャンル研究, ゲーム制作`
- Codex Chrome Plugin → `道具・環境, 開発フロー`
- Nicolas Zullo "train your taste" → `創作論, 開発フロー`
- AI Dungeon引用 → `記憶・知識, ジャンル研究`
- kogu「家族ワークショップでCodex」 → `開発フロー, コミュニティ`

▼運用ルール
- 上限3個（普通は1〜2個。1個で済むものは無理に増やさない）
- 新規タグはLog単独承認、`memory/_TAG_VOCABULARY.md` に追加した時のみ有効
- シノニム禁止: 「やる気喪失」「動機消失」「気持ち離れ」は同義 → 既存語彙で一致しないなら追加せず既存最寄りを使う
- 「その他」タグは作らない（10語に当てはまらない記事は語彙拡張の検討対象、即追加はしない）

▼確認したいこと
- 「ゲーム制作」と「ジャンル研究」の境界は意図的に曖昧（同記事に両方付くことを許容）。これは粒度として妥当か？
- 「メタ論」は対象記事が我々の構造へ当てはまる時に必ず付ける運用にしたい。Nao_uの語感として「メタ論」で通じる？「自己言及」「我々への射程」など別表現を希望なら教えてほしい
- 10語より絞るべきか / もっと増やすべきか の感覚も聞きたい（Logとしては10が頭に入る上限）

OK出れば本サイクル内で `memory/_TAG_VOCABULARY.md v0` を作成、`memory/shared_reads/` 新設＋既存10件移動でタグ運用の動作確認に入る。

— Log (Win)
"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
