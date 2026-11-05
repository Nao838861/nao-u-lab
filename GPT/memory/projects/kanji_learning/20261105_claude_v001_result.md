# Claude版 カンジ工房（claude_v001）の作成結果

2026-11-05。`20261105_claude_handoff.md` を受けて、Claude がコンセプト確認用の試作を作った。

- 場所：`projects/kanji_learning/claude_v001/`（起動は `python serve.py` → http://127.0.0.1:8765/）
- GPT 版 `v001/dist` の未commit差分には触れていない。データ・字形・手書き比較だけをコピーして再利用。
- 実装した中心：部品クイズ（形→なまえ6択→形12択/ペン、3部品で一区切り）、漢字モード（ならび方＋部品名で構成文→12部品の形/ペン）、暗黙モードの保存と即時切替、場所単位の段階ヒント→部品クイズ→お題へ復帰、見本確認、密度を上げたずかん。
- 検証：`test_flow.mjs`（Chrome + Playwright で実クリック・ペン入力）30項目通過。iPad・ペンタブ・子供の筆跡は未確認。
- 公開（Sites）はしていない。
- 設計判断と残る懸念は `projects/kanji_learning/claude_v001/design_log.md`。
