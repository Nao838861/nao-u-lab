# B-1 母港様式スライス — 提出物

## Nao_uへの合否質問

**このafter画像を、人に見せたいと思うか。**

「beforeより良いか」「技術的に動くか」ではなく、この一問だけで合否を決める。不合格なら項目10へ進まず様式スライスを直す。合格後に、AI生成タイルセット／手描き／外注のどれで量産するかをNao_uが裁定する。

## 見るもの

- 動くafter: `http://localhost:8420/game/shioji/v004/?mode=sandbox&art-slice=after`
- 同構図before: `http://localhost:8420/game/shioji/v004/?mode=sandbox&art-slice=before`
- [after 1440×900](art_slice_comparison/mother_port_after_1440x900.png)
- [before 1440×900](art_slice_comparison/mother_port_before_1440x900.png)
- [別時刻after 1440×900](art_slice_comparison/mother_port_after_motion_1440x900.png)

afterは盤面のみ、夏昼固定のペイント調スタイライズド2D。海→港→市場→峠街道を一画面に置き、港・市場・民家・住民・荷・煙・波・鳥を背景板へまとめた。帆船は入り江を12秒周期で航行し、二台の荷馬車と二人の御者は港から市場へ続く道を16秒周期で往復する。

## 実装境界

- `?art-slice=after`だけが背景板＋専用動体を描く。通常URLの描画、世界、経済、セーブ、入力は変更しない
- `?art-slice=before`は同じ1440×900・盤面のみの現行Canvasを出す
- これは様式合否用の垂直スライスであり、背景一枚を通常ゲームの盤面として採用したものではない
- 合格後に作画を地形・海岸・道・建物・小物・動体へ分解し、連続ズームとヒットテストを保つ量産方式を決める
- 256×256基盤（WORK_QUEUE 10）には未着手
- ユーザー指示により全テストは後回し。今回は構文確認、実Chrome撮影、UI非表示、1440×900一致、runtime error 0、別時刻フレーム差分だけを確認した

## imagegen成果物

imagegen built-inを使用した。最終成果物はすべてプロジェクト内へ保存済み。

- `assets/art_slice/mother_port_painterly_v1.png` — 母港背景板
- `assets/art_slice/cargo_ship_painterly_v1.png` — 船の透過スプライト
- `assets/art_slice/caravan_painterly_v1.png` — 隊商の透過スプライト

船・隊商はbuilt-in生成時に一度暗い背景が付いたため、同じ対象を保ったまま背景だけ一様な`#ff00ff`へ編集し、imagegenスキル付属の`remove_chroma_key.py`でalpha化した。透明角、alpha channel、輪郭を目視確認した。

## 最終プロンプト

### 母港背景板

```text
Use case: stylized-concept
Asset type: game environment art-direction vertical-slice background plate, 16:9 landscape
Primary request: a richly painted isometric coastal trading settlement inside a sheltered inlet, designed as a polished strategy-game board screenshot that could work as advertising art
Scene/backdrop: foreground and lower-left are deep teal sea flowing into turquoise shallows; an irregular curved stone-and-sand shoreline encloses a working harbor; inland rises gently into summer grass, clustered pines, and a winding ochre road toward a compact market village
Subject: one timber quay with crane, ropes, barrels, fishing nets and stacked cargo; a central red-roofed open market; 6–8 varied timber-and-plaster homes and workshops; carts, sacks, wood piles, laundry, fences, kitchen gardens, smoke chimneys; a road clearly connects quay to market and exits uphill; leave an open sea lane for an animated sailing ship and a clear road lane for an animated caravan overlay
Style/medium: painterly stylized 2D game environment, hand-painted brush texture, readable simplified shapes, restrained outlines, premium production concept translated into a playable isometric board, not photorealistic and not 3D render
Composition/framing: fixed isometric three-quarter top-down camera, no horizon, the whole canvas is a continuous playable-looking board; harbor in lower-left, market near center, road sweeping toward upper-right; strong triangular visual flow; important objects within central safe area; exact 16:9 composition
Lighting/mood: clear summer midday, warm sunlight from upper-left, soft cool shadows to lower-right, lively prosperous working harbor, subtle atmospheric depth
Color palette: deep teal and turquoise water, moss and olive summer greens, warm ochre earth and stone, muted terracotta and oxblood roofs, cream plaster, weathered brown wood; cohesive low-saturation palette with a few warm focal accents
Materials/textures: visible painterly grain; wet dark shoreline edge; white wavelets; worn cart ruts; mossy stones; timber grain; canvas awnings; dense irregular vegetation clusters
Constraints: no UI, no HUD, no borders, no labels, no lettering, no logo, no watermark; no baked-in large ship and no baked-in caravan on the two reserved movement lanes; preserve isometric strategy-game camera; all buildings must be structurally plausible; people may appear only as small incidental workers away from the reserved overlay lanes; visually rich but not cluttered; no grid lines or square tile seams; no futuristic objects, no modern machinery, no fantasy magic
```

### 船

```text
Use case: stylized-concept
Asset type: single game vehicle sprite for a painterly isometric strategy game
Primary request: one small late-medieval coastal cargo sailing ship, seen in fixed isometric three-quarter top-down view, bow pointing diagonally up-right, suitable for moving across a hand-painted teal sea
Subject: weathered warm-brown timber hull, one mast, two gently curved cream canvas sails with one muted oxblood-red panel, simple rigging, three ochre cargo bundles visible on deck, subtle painted highlights and cool lower-right shadowing
Style/medium: hand-painted stylized 2D game sprite, refined brush texture, simplified readable silhouette, premium strategy-game asset; match a low-saturation coastal settlement painting
Composition/framing: ship fully visible and centered, generous padding on all sides, no cropped rigging, no water or wake included
Lighting/mood: clear summer midday light from upper-left, soft shadows lower-right
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for local background removal
Constraints: background must be one uniform #ff00ff color with no shadows, gradients, texture, reflections, floor plane, or lighting variation; crisp silhouette; no cast shadow; no water; no wake; no text; no logo; no watermark; do not use #ff00ff anywhere in the ship; exactly one ship, no people, no harbor
```

### 隊商

```text
Use case: stylized-concept
Asset type: single game vehicle group sprite for a painterly isometric strategy game
Primary request: a small late-medieval overland caravan traveling together, seen in fixed isometric three-quarter top-down view, heading diagonally up-left, suitable for moving along a hand-painted ochre road
Subject: two compact weathered wooden two-wheel carts in a short line, each pulled by one sturdy brown draft horse; two full-body walking teamsters beside the horses in practical muted-earth travel clothes; carts loaded with tied canvas sacks, one muted oxblood-red bundle and one warm ochre bundle; readable wheels, harnesses and human walking silhouettes
Style/medium: hand-painted stylized 2D game sprite, refined brush texture, simplified readable silhouette, premium strategy-game asset; cohesive low-saturation palette
Composition/framing: entire caravan fully visible and centered, all horse legs, people, wheels and cargo visible, generous padding, no crop
Lighting/mood: clear summer midday light from upper-left, cool lower-right shading
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for local background removal
Constraints: background must be one uniform #ff00ff color edge-to-edge with no shadows, gradients, texture, reflections, ground plane or lighting variation; crisp silhouette; no cast shadow; no dust cloud; no road; no scenery; no text; no logo; no watermark; do not use #ff00ff in subjects; exactly two carts, two horses and two teamsters, no extra people or animals
```
