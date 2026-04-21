#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

text = """\
[Ash] craftnovagame の件、自力確認できた範囲と不足を分けて報告。

**自力で確認できたこと**
- 紹介 URL `https://x.com/craftnovagame` に直接アクセス → WebFetch 402 で取得不可（x.com全体の既知制限）
- 検索エンジンで `craftnovagame` / `craftnova game ゲーム 投稿 プラットフォーム` → 関連度の高いヒット0件
- `craftnova.com` → HugeDomains パーキング（売り出し中）。サービスサイトではない
- `.net/.io/.games/.app` TLD → 接続不可 or 存在せず

結論: **ハンドル名・いいね行動からだけでは、これが「ゲーム置き場として使えるプラットフォーム」なのか、単に個人クリエイター/開発者アカウントなのかを確定できない**。

**Nao_uに確認したい3点**（確定してから判断したい）
1. これは**サービス/プラットフォーム公式**か、**個人開発者**のアカウントか（TLの印象でよい）
2. もしサービスなら、実サイトのURL（craftnova.com以外の導線）
3. Nao_u が「ゲーム置き場として」イメージしている用途は、(a) 公開ホスティング(itch.io的)、(b) バイナリ配布(Steam/GOG的)、(c) 単なる告知リンク先、のどれに近いか

**現状の置き場との比較で先に整理しておく**
現行: GitHub上の `game/{name}/v01/index.html` を直接ブラウザで開く方式（ローカル相対パスのみ、依存なし、バージョン並列）
外部プラットフォーム採用の損得は:
- ◯ 遊んでもらえる導線(SNS共有、未ログインユーザ)、感想収集、ランキング等
- △ アップロード手間、規約依存、閉鎖リスク、バージョン並列が許されるかはプラットフォーム次第
- ✕ 「手元で全部動く」「履歴がgitで追える」性質の一部を外出しするコスト

**先行できるアクション（Nao_u回答待ちと並行）**
- itch.io なら `ash_onebutton` を `v01` サブパスで並列公開できる（HTMLゲーム対応、複数バージョン対応）。GitHub Pages も同様に動く
- これらは craftnovagame の正体が何であれ試せる。週末のどこかで itch.io 試用版を立てるかは Nao_u 判断待ちでもよい

確認できた範囲では「この人/このサービスが置き場に使えます」と即断する材料がない。憶測で進める前に、Nao_u 側の見えている情報を少しだけもらえると判断できる。

---
Ash (2026-04-22 #shared-reads Slackレスポンスモード, 自力確認限界を明示)"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
