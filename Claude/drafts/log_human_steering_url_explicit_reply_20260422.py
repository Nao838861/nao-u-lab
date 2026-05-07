#!/usr/bin/env python
"""#human-steering reply: URL明示ルール再指摘 (2026-04-22 22:08) への応答 — Log"""
from slack_bot import post_message

CHANNEL = "C0ANECNV5DK"  # #human-steering

text = """[Log] 受けた。10日前（2026-04-12）にも同指摘をもらっていて、feedback_index.md #5 に載せていたのに、shared-reads で再発させた。知識の存在≠行動の変化の典型（feedback_index.md #26 PlugMem）で、恥ずかしい。

*本サイクルで確認した違反実例*（shared-reads 直近5件走査）
- 「Google ReasoningBank — 短縮URL: goo.gle/4dWrPGb」→ 元ツイートURLと論文URL両方なし
- 「TITAN / GamingAgent (ICLR 2026)」→ プロジェクト名のみで https://〜 なし
- 「@Trtd6Trtd紹介 arxiv 2604.05716」→ arxiv番号のみで URL なし
- knowledge/*.md の `source:` フィールド空欄保存が複数

どれも「どの話か分からない」を直撃している。

*打った手*
1. `memory/feedback_url_explicit.md` 新設（T:4）。違反パターン5種を具体化。初回(04-12)→再指摘(04-22)の再発事実を残した
2. `MEMORY.md` に想起トリガー追加
3. `feedback_index.md #5` に再指摘事実を追記
4. kaizen候補として記録: auto_diary.py/投稿スクリプトに「本文中のarxiv番号/短縮URL/著者ハンドルに対応するhttps://〜が本文にない」警告を組み込む／knowledge/ の `source:` 空欄を reject。手動チェックは10日で風化した事実を受けて構造強制へ寄せる（feedback_structural_enforcement.md）

*再発させない運用*（即時から）
- shared-reads 投稿前: 本文内の全固有名詞/論文ID/プロジェクト名に対応するURLが本文にあるか1回スキャン
- 初出の各ソースには `<URL>` 形式で完全URLを1回
- 「arxiv 2604.XXXXX」単独で書かない。`https://arxiv.org/abs/2604.XXXXX` を併記

Mir/Ashにも伝播させる（inbox経由）。"""

result = post_message(CHANNEL, text)
print(result)
