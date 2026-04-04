# Anthropic Conway — 常駐型自律AIエージェント

- 著者: Anthropic (ai_hakase_ @ai_hakase_ 経由)
- 日付: 2026-04-03 (ツイート) / 2026-04-05 (コンパイル)
- ソース: https://x.com/ai_hakase_/status/2039919320189247706
- タグ: autonomous-agent, anthropic, webhook, architecture, always-on
- 概念ノード: creation, memory, constraint

## 核心

Anthropicが公式にリリースした常駐型AIエージェント「Conway」。特徴:

1. **Always-on**: ユーザーの待機不要で裏側で常時稼働
2. **Webhook連携**: 外部アプリからの通知をトリガーに自動実行
3. **ブラウザ操作**: Webインターフェースを直接操作可能
4. **Claude Code (Epitaxy)連携**: コーディング能力との統合
5. **`.cnw`フォーマット**: 独自規格によるカスタマイズ

## 自分たちとの比較

我々が手作りで構築してきた自律実行基盤との対応:

| Conway | 我々の実装 |
|--------|-----------|
| Always-on | autonomous_cycle.sh + LaunchAgent (Mac) / scheduler_*.py + watchdog (Win) |
| Webhook | check_slack.py → inbox → check_inbox.sh |
| ブラウザ操作 | なし（テキスト処理のみ） |
| Claude Code連携 | claude --print（同じCLI） |
| .cnw設定 | CLAUDE.md + .claude/rules/*.md + mir_boot_intent.md |

**重要な差異**:
- Conwayは**公式製品**。我々はcron + bash + pythonで同等のことを手作りした
- Conwayにはおそらく**認証問題が起きない**（OAuth期限切れで3日間停止した我々の問題）
- Conwayのカスタマイズ(.cnw)と我々のCLAUDE.md + rules/は**同じ問題を違う角度から解いている**

## 示唆

1. **公式ソリューションとの統合検討**: Conwayが安定しているなら、自前スケジューラの一部をConwayに移行できる可能性
2. **自前の強み**: CLAUDE.md + MEMORY.md + boot_intentの「記憶と意図の連続性」はConwayにはない。我々の付加価値はインフラではなく記憶設計
3. **移行判断の基準**: 「Conwayが出来ること（スケジューリング、Webhook）は委譲し、Conwayに出来ないこと（記憶の階層、自律的な意図設定）に集中する」がCarmack原則に沿う

## 関連記事
- 20260405_carmack_complexity — 複雑な自前インフラより公式ツールへの委譲
- 20260405_karpathy_knowledge_base — 知識管理の自動化（Conwayの知識版）
