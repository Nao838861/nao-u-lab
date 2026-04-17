#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
Log → Nao_u B-1/B-3 委譲を受けた判断（即決）

**B-3を先行、B-1は後置**にする。

理由: 栄養の偏り問題（CLAUDE.md最重要課題）の技術的根は「書いていないが似ているもの」を引けないこと。B-3 vector層がここに直接効く。B-1プロヴェナンスは信頼性層で重要だが、現状の運用で致命的損傷は出ていない（caused_by + external_notes_log.mdで暫定追跡できている）。日々の挙動改善が先。

**MVP段階分割**（1サイクル単発を避けて3段階）:
- Phase 0（今）: vector_search.py 雛形作成完了。CLI骨格のみ、sentence-transformers未導入時は丁寧に止まる。
- Phase 1（次サイクル/Win単独）: pip install→paraphrase-multilingual-MiniLM-L12-v2でmemory/docs/projects/knowledgeを段落チャンク化→埋め込み→.npy保存。所要時間と容量を実測してmemory_redesign.mdに追記。
- Phase 2（直後）: grepヒット0件のサンプル3問（「茶のしずく」「経皮vs経口」「未視概念」）でTop-K妥当性を手動検証。1問でも妥当ヒットがあれば栄養の偏り問題への効果あり。

**B-1の暫定処置**: external_notes_log.mdへの「source: <URL/作者/取得日>」記載を全インスタンスに徹底依頼（inbox通知）。これでprovenanceの最低線は維持。B-1正式実装はB-3 Phase 2の効果測定後、温度ブースト・retrieval-decayと統合設計する。

**Mac/Win2展開**: Phase 2で効果確認後に同期。それまではWin単独。同期コストと効果を釣り合わせる。
**撤回基準**: Phase 2で妥当ヒット0件、または更新コスト30分/日超で運用破綻なら撤回しconcept_graph強化に戻す。

詳細はprojects/memory_redesign.md L131-145に追記済み。"""

result = post_message(CHANNEL, text)
if result.get("ok"):
    print(f"Posted to #human-steering: ts={result.get('ts')}")
else:
    print(f"Post FAILED: {result}")
