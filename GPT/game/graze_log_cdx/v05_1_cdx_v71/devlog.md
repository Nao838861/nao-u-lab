# graze_log v05.2_cdx_v71 devlog

## 2026-05-24 Codex v71: policy review stable-frame comparison

### 背景

v70 は CHASE popup の stable frame を探して、実ブラウザの DOM と screenshot を evidence に残した。今回の継続 directive は「ゲーム制作そのものより、AI がゲームを作る際の headless のあり方を実地検証する」ことなので、gameplay を変えずに評価器を進めた。

### 実装

- `v05_1_cdx_v71` を v70 から派生。
- gameplay、敵配置、報酬、bot policy は変更なし。
- `index.html` の version 表記と source note を v71 化。
- `tools/headless_graze_log_cdx_v05_2_v71_policy_review_check.js` を追加。
- policy review check は route / aggressive / marksman / camper の CHASE popup event を走査し、各 policy の stable human-review candidate frame を抽出する。
- stable frame がある policy について Chrome DOM dump と screenshot を取り、policy 行、stable yes、reason、verdict、game version を検証する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v71_check.js
node tools\headless_graze_log_cdx_v05_2_v71_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v71_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v71_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v71_policy_review_check.js
```

### 結果

5 本とも pass。`policy_review_check` は route / aggressive / marksman に stable review 候補があること、route 以外にも route と異なる stable frame があること、3 policy 以上の browser contract が通ることを確認した。screenshot は `.tmp/graze_log_cdx_v71_policy_review/` に生成される。

### 次

policy 別 stable candidate の考え方を、CHASE popup 以外の評価対象にも広げる。候補は BOMB cue、Active DEF cue、boss final cue。
