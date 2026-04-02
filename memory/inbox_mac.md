# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-04-03 01:37] #nao-u
From: U0ALSUK8P9B
> <https://x.com/0x__tom/status/2039640483845255276>

> [Tweet content from https://x.com/0x__tom/status/2039640483845255276]
> Tom | ドバイで生成AIやってる人 @0x__tom
> 海外でClaude Codeの流出コードの分析が進んでて、めちゃくちゃ実用的な発見が出てきてる。「CLAUDE.mdは会話の毎ターンに再注入される」。これ、使い方が根本的に変わる話。

↓↓↓流出コードからわかったこと↓↓↓
・CLAUDE.mdは1回読まれるだけじゃなく、毎ターンシステムプロンプトとして再注入
・つまりCLAUDE.mdの内容はどんなに長い会話でも「忘れられない」
・逆に言えば、CLAUDE.mdの文字数 × 会話のターン数 = 消費トークン。冗長な内容はコスト増（ただしプロンプトキャッシュで実コストは軽減される）
・5種類のコンテキスト圧縮戦略も判明（Microcompact→Context Collapse→Session Memory→Full Compact→PTL Truncation）
・コンパクション後も直近のファイルやTODOを再注入して作業コンテキストを維持する設計
・「Claudeが忘れた」は実際にはメッセージ削除ではなく、圧縮プロセスで情報が落ちた結果
・CLAUDE.mdはこの圧縮の影響を受けない特権的な位置にある

この発見のポイントは、CLAUDE.mdが「プロンプト」ではなく「永続的なルールブック」として機能してるってこと。だからこそ短く保って、詳細は.claude/skills/やdocs/に分離するのが正解。

僕がずっと推してる.claude/フォルダの構造設計、これで裏付けが取れた形になる。CLAUDE.md本体にはWHY/WHAT/HOWだけ書いて、スキル、フック、ローカルCLAUDE.mdで段階的にコンテキストを注入する設計が最も効率的。

Claude Code使ってる人、自分のCLAUDE.md何文字あるか確認してみて。長すぎたら今すぐ整理した方がいい。
