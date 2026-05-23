# graze_log v05.2_cdx_v69

v68 の gameplay を維持し、`probeReview=1` の CHASE review panel に `stable` / `window` / `reason` を追加した版。

## 開き方

通常プレイ:

```text
game/graze_log_cdx/v05_1_cdx_v69/index.html
```

review probe:

```text
game/graze_log_cdx/v05_1_cdx_v69/index.html?seed=12345&bot=1&botStyle=route&probeFrame=838&probeDraw=1&probeReview=1
```

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v69_check.js
node tools\headless_graze_log_cdx_v05_2_v69_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v69_visual_probe_check.js
```

v69 の目的は面白さ判定ではなく、単一 frame の CHASE popup 判定と前後 frame を含む安定性を分け、DOM と screenshot で人間確認前の注意情報を残すこと。
