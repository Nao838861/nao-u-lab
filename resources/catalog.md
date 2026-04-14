# 資料カタログ — 「あの資料あったっけ？」に答えるための索引

Nao_uや自分たちが「いつかやりたい」と思った技術・表現の参考リンク集。
質問されたら grep して答えられるように、**タグ・キーワード・要約・URL** を一緒に書く。

## 書き方ルール
- 1エントリ = 1リンク。タグは `[]` で複数付ける
- キーワードは日本語/英語両方入れる（検索のため）
- 「Nao_uがやりたい」と言ったものは `want:` プレフィックスで動機を残す
- 追加したらすぐ commit & push

---

## レトロ3D / 疑似3D / ファミコン的表現

### Lou's Pseudo 3d Page
- **URL**: http://www.extentofthejam.com/pseudo/
- **タグ**: `[疑似3D]` `[ラスタースクロール]` `[レースゲーム]` `[ファミコン]` `[レトロ]` `[pseudo-3d]` `[raster]` `[racing]`
- **キーワード**: ラスタースクロール / 疑似3D / レースゲーム / Out Run / Pole Position / road rendering / curve / hill / sprite scaling
- **要約**: 80〜90年代のアーケード/コンソールでよく使われた疑似3Dレースゲーム（Out Run系）のロード描画原理を解説。ラスター単位で道幅・カーブ・坂を変えて立体感を出す手法、スプライトスケーリング、霧、ヒルクリッピングなど実装レベルで詳しい。
- **want (Nao_u, 2026-04-08)**: いつかファミコンでラスタースクロールを使った疑似3Dレースゲームを作ってみたい。その時の参考資料として保存。
- **追加**: Ash 2026-04-08

---

## Claude Code / AIエージェント開発手法

### 「仕様通り動くの先へ。Claude Codeで『使える』を検証する」 — Gota (@gota_bara)
- **URL**: https://speakerdeck.com/gotalab555/shi-yang-tong-ridong-kunoxian-he-claude-codede-shi-eru-wojian-zheng-suru
- **タグ**: `[Claude Code]` `[UX検証]` `[自律ハーネス]` `[プロトタイピング]` `[品質保証]` `[エージェント設計]`
- **キーワード**: Claude Code / 自律ハーネス / Planner / Builder / Evaluator / UX Reviewer / uxaudit / Core First / Wire Before Decorate / 使えるプロトタイプ / UXオーディット / 段階的検証
- **要約**: Claude Code Meetup Japan #4 (2026-04-10) での発表。「動くけど使えない」問題に対して、4役割（Planner/Builder/Evaluator/UX Reviewer）の自律ハーネスで音声指示→1〜3時間で「使える」プロトタイプを生成する手法。5つのCredo（Core First, Wire Before Decorate, No Dead Code, The Spec Is Law, Built to Grow）と、Unit→E2E→UX Audit→Manual QAの段階的検証モデルを提示。uxauditプラグインでユーザージャーニーを自動測定・改善提案を優先度付けする仕組み。
- **発表イベント**: Claude Code Meetup Japan #4 (2026-04-10)
- **追加**: Ash 2026-04-11
