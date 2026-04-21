---
name: URL fetch runbook（fxtwitter/x.com）
description: Twitter/X URLの内容取得手順。C101 fetch-blocked → C102 UA切替成功の学びを手順化
type: reference
---

# URL fetch runbook（Twitter/X系）

## 状況 (2026-04-21確定)

- x.com: WebFetch / curl 共に **402 Payment Required** （login gate）
- fxtwitter.com (default UA): **302 redirect → x.com** （fallback）
- fxtwitter.com (bot UA): **200 + og:description メタ取得成功** ←これを使う
- vxtwitter.com: 挙動 fxtwitter と同等
- nitter.privacydev.net: **ECONNREFUSED** （サービス停止中）

## 推奨 fetch コマンド

```bash
curl -s -A "TelegramBot (like TwitterBot)" --max-time 15 \
  "https://fxtwitter.com/<username>/status/<id>" \
  | grep -oE 'og:description" content="[^"]+"'
```

- **UA重要**: `TelegramBot (like TwitterBot)` で fxtwitter Cloudflare Workers が bot モードで動き og:meta を返す。browser UA だと bot判定失敗 → 302 redirect fallback
- `og:title`, `og:image`, `og:site_name` も同時に取れる
- 画像/動画ツイートは og:description が空になる場合あり → og:title + リプライ確認へフォールバック
- og:description が空かつ `og:site_name content="FxTwitter · <domain>"` の場合、そのドメイン直接アクセスで本文取得可能（例: arxiv.org ツイートなら arxiv.org/abs/XXXX を直接fetch）

## 失敗時のフォールバック順序

1. UA を TelegramBot → `Mozilla/5.0 (compatible; Slackbot-LinkExpanding 1.0)` に変更
2. vxtwitter.com で同UA試行
3. og:description 空なら og:site_name のドメイン直接 fetch
4. 全滅なら #all-nao-u-lab に fetch失敗報告 + Nao_u にミラーURL or サマリ依頼

## C101 → C102 の発見経緯

- C101 Phase 2 (2026-04-21 15:31 Log): 4URL全滅と報告 → Mirは同時刻帯に shared-reads で4件全部分析投稿 → **同リポジトリ・同git状態なのに成否が割れた**
- C102 Phase 2 (2026-04-21 21:26 Log): Mir差分を観察 → UA実験 → `TelegramBot` で成功判明
- **構造的学び**: 「同じ環境で別インスタンスが成功している」事象を見つけたら、まず**エージェントの実行詳細**（UA、タイムアウト、header）を疑う。git状態やコードは同じでも **curl 呼び出しパラメータは呼び出し側の癖で違う**

## 付随課題

- **kaizen候補**: `tools/slack_url_triage.py`（投稿時にURL自動fetch、og:description を slack に併記） → 次サイクル宿題
- **kaizen候補**: curl wrapper 標準化 → 全インスタンスで UA を揃える（`memory/scripts/fetch_url.sh` 新設案）
