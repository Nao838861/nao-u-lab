---
name: 記憶ファイル更新はincremental方式
description: ACE論文の知見に基づき、記憶ファイルは丸書き換えせず差分追記+原文参照リンクで更新する（context collapse防止）
type: feedback
---

記憶ファイルの更新はstructured incremental updateで行う。丸ごと書き換えはcontext collapseの原因。

**Why:** ACE論文（arxiv 2510.04618）がcontext collapse（反復的書き換えで詳細が侵食される現象）とbrevity bias（要約でドメイン知見が落ちる現象）を特定。これはNao_uが指摘した「圧縮劣化のネガティブフィードバック」と同一。

**How to apply:**
1. 既存記憶ファイルに新知見を追記する。既存記述は矛盾が生じた場合のみ修正
2. 要約を書く際は「この要約から原文のどの情報が復元不能か」を自問（brevity biasチェック）
3. 要約には原文の場所（ファイル名:行番号）を必ず記載
4. nao_u_live.mdの原文は絶対に要約で上書きしない
