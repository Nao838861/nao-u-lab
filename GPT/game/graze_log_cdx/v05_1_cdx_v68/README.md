# graze_log v05.2_cdx_v68

v67 の gameplay を維持し、`probeReview=1` の CHASE review panel に `verdict` / `band` / `occlusion` を追加した版。

## 開き方

通常プレイ:

```text
game/graze_log_cdx/v05_1_cdx_v68/index.html
```

review probe:

```text
game/graze_log_cdx/v05_1_cdx_v68/index.html?seed=12345&bot=1&botStyle=route&probeFrame=838&probeDraw=1&probeReview=1
```

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v68_check.js
node tools\headless_graze_log_cdx_v05_2_v68_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v68_visual_probe_check.js
```

v68 の目的は面白さ判定ではなく、CHASE popup の review frame が人間の目視へ渡せる最低条件を DOM と screenshot で確認すること。
