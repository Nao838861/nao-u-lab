# graze_log v05.2_cdx_v76 devlog

## 2026-05-24 Codex v76: bad-policy death-cause review packet

### 背景

v75 は bad policy の game over frame を packet に並べたが、「その失敗が何で起きたか」は raw JSON に戻らないと読めなかった。headless を人間確認へ接続するには、最後の弾、死亡 phase、近接弾数、直前 event を packet 側で読める必要がある。

### 実装

- `v05_1_cdx_v76` を v75 から派生。
- gameplay、敵配置、報酬、bot policy は変更なし。
- `index.html` に敵弾の `sourceType / sourceRole / sourceGroup` と `deathContext` を追加。
- `probeForceIframe=0` を追加し、bad policy の review iframe が死亡を隠さないようにした。
- `review_packet.html` を death-cause packet に更新。
- `tools/headless_graze_log_cdx_v05_2_v76_death_packet_check.js` を追加。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v76_death_packet_check.js
```

pass。route は 4552f clear。camper は `RIGHT_BUNKER_ENTRY_COVER` で `crane_swoop_r_1040` の raider 弾、panic は `TOP_OFF_BRIDGE_TO_MIDBOSS` で `second_pair_floor_1240` の raider 弾、novice は `BOSS_APPROACH_KEEP_SCREEN_ACTIVE` で `final_bunker_tail_3540` の raider 弾により game over。packet の DOM contract と screenshot contract も pass。

### 次

次に続けるなら、1 seed の死亡原因だけでなく multi-seed で「同じ bad policy が同じ成立条件で失敗しているか」を見る。gameplay を変える場合は、death-cause packet の差分で「失敗理由が読めるままか」を先に確認する。

## 2026-05-24 Codex v75: bad-policy human review packet

### 背景

v74 の packet は route / aggressive / marksman / survival の cue evidence を並べたが、bad policy を人間確認に渡す面では不足していた。さらに、v74 の packet check は VM 実行時に全 policy を強制無敵化していたため、`camper` のような「死ぬべき雑な方針」を追加すると失敗を隠す。

### 実装

- `v05_1_cdx_v75` を v74 から派生。
- gameplay、敵配置、報酬、bot policy は変更なし。
- `review_packet.html` を bad-policy packet に更新し、route clear と `camper / panic / novice` の game over frame を並べた。
- `tools/headless_graze_log_cdx_v05_2_v75_bad_policy_packet_check.js` を追加。
- 新規 check は forced iframe を使わずに route / bad policy を再実行し、packet の frame 値、DOM contract、screenshot contract を確認する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v75_bad_policy_packet_check.js
```

pass。route clear 4552f、camper 1397f game over、panic 1718f game over、novice 4010f game over。既存 v75 check 群 7 本も pass し、合計 8 本 pass。

### 次

次に続けるなら、bad policy death frame に「どの弾 / どの敵 role で死んだか」を packet に出す。単に frame を並べるだけだと、人間が失敗理由を raw JSON に戻って読まなければならない。

---

## 2026-05-24 Codex v75: human review packet

### 背景

v73 は policy x cue family の frame を抽出できたが、人間確認には raw JSON と個別 screenshot を読む必要があった。今回は gameplay を変えず、headless が選んだ evidence をブラウザで並べて見られる packet にする。

### 実装

- `v05_1_cdx_v75` を v73 から派生。
- gameplay、敵配置、報酬、bot policy は変更なし。
- `review_packet.html` を追加し、route / aggressive / marksman / survival の cue evidence frame 6 件を iframe で並べた。
- `tools/headless_graze_log_cdx_v05_2_v75_human_packet_check.js` を追加。
- packet check は v75 を VM で再実行して stable frame を再計算し、HTML に含まれる frame 値と DOM / screenshot contract を確認する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v75_human_packet_check.js
```

pass。route / activeDef 1138f、route / bomb 4705f、aggressive / bossCue 4356f、marksman / chasePopup 384f、survival / activeDef 1368f、survival / bomb 4144f が packet と一致した。

### 次

次に続けるなら、camper / novice / panic を packet に加える前に、今の 6 件を Nao_u が見て「比較対象として読めるか」を確認する。headless 側だけで frame 数を増やしすぎると、人間確認の負荷が戻る。

---

以下は v73 から引き継いだ devlog。

## 2026-05-24 Codex v73: policy-by-cue review matrix

### 背景

v72 は route / seed 12345 で CHASE、Active DEF、boss cue、BOMB の stable frame を選べた。継続 directive の主眼は、AI がゲームを作る時の headless のあり方を実地検証することなので、今回は gameplay は固定し、同じ cue family が policy によってどう違う frame として現れるかを見る。

### 実装

- `v05_1_cdx_v75` を v72 から派生。
- gameplay、敵配置、報酬、bot policy は変更なし。
- `index.html` の version 表記と source note を v75 化。
- v72 の既存 headless check 群を v75 に複製。
- `tools/headless_graze_log_cdx_v05_2_v75_policy_cue_review_check.js` を追加。
- policy cue review は `route / aggressive / marksman / survival` で `chasePopup / activeDef / bossCue / bomb` の stable frame を探索する。
- 代表 4 件は Chrome headless の DOM / screenshot で version、canvas contract、画像サイズを確認する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v75_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v75_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v75_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_cue_review_check.js
```

### 結果

7 本すべて pass。新規 `policy_cue_review_check` では、route が CHASE / Active DEF / boss cue / BOMB の 4 cue family をすべて検出し、aggressive / marksman は boss cue と BOMB を検出した。survival は boss cue に届かず、BOMB と Active DEF に寄る cue absence として記録した。

`policy_cue_review_check` は `memory/raw/headless_eval/graze_log_cdx_policy_cue_review.jsonl` に raw result を追記し、`.tmp/graze_log_cdx_v75_policy_cue_review/` に確認用 screenshot を生成した。

### 次

policy x cue family の候補 frame が通れば、次は「どの frame を人間に渡すべきか」を HTML packet にまとめる。通らない場合は gameplay 変更ではなく、policy がその cue を出さない理由を先に記録する。
