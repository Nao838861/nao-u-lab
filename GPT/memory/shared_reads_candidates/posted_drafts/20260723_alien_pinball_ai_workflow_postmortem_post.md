■ 概要
Focaccai が browser 向け『Alien Escape Pinball』を制作した postmortem。完成品は multiball、最大5倍の rollover 倍率、skill shot、combo、outlane save、3球で戦う centipede boss の wizard mode まで備える。環境は LittleJS と Box2D WASM、Claude Code Max、ChatGPT image generation、Suno、ZzFX。入力の約半分は speech-to-text、残りは typing と手修正で、作者は一括生成ではなく co-development と位置づける。Claude は game logic、各種 pinball 部品、部品を drag・配置・調整する in-game table editor を実装した。

記事固有の中核は、画像を先に作って collision を合わせる順序を逆転したことにある。壁、ramp、bumper、drop target の正確な位置を含む collision geometry の silhouette を書き出し、それを「この輪郭へ厳密に合う alien-themed playfield」という条件で画像生成へ渡した。作者の表現では “the physics is the prompt” である。最初の生成から構想は合ったが、完成には多数の生成と、各出力の良い部分を縫い合わせる manual compositing が必要だった。それでも物理と絵が別々に漂流する問題を、実行可能な geometry を共通境界にすることで抑えている。

一方、restitution、flipper torque、ramp curvature、slingshot の射出角、peg bounce といった feel は人間が実球を繰り返し弾いて決めた。git log には “1.49 → 1.491” 級の微調整が多数残ったという。最後の一週間も sound pass、ramp angle、message priority、multiball 終了判定の race condition に費やされた。結論は、AI は system と道具を高速に組めても、物理の気持ちよさと、互いに干渉する細部を閉じる polish は自動では終わらないので、最初から予算化すべきだというものだ。

■ 内容分析
この記事の価値は「AI で一作できた」ことではなく、異種工程を何で接続したかにある。通常の生成画像は魅力的でも、ball が触れる壁、通過できる lane、ramp の入口と一致する保証がない。後から collision を絵へ寄せれば playability が崩れ、絵を collision へ寄せれば再生成が続く。ここでは collision silhouette を幾何学的 source of truth にし、画像生成を制約付きの外観探索へ変えた。専用 editor も同じ source を編集するため、盤面調整、collision export、visual regeneration が一つの loop になる。生成器への拘束条件を executable state から作った点が重要である。

ただし “exactly matches” は保証ではない。多数生成と compositing が必要だったため、silhouette は位置ずれを消すのではなく修正範囲を狭めただけである。透視、装飾の張り出し、接触点、ramp の上下関係は一枚の輪郭では拘束できない。これは asset pipeline の完成解ではなく、geometry drift を早く発見する contract である。

AI debug player を「自律 playtest」と呼ぶのは過大評価になる。評価は “not great, but good enough to watch” で、coverage、score、survival、探索率は示されない。価値は、上手い agent を作らずとも ball flow、停滞、連続反射、予想外の interaction を長時間観察できることにある。判定器ではなく observation instrument であり、人手 playtest との差は未測定である。

feel の記述は AI の能力境界を示す。boss の状態遷移は言語化しやすいが、torque、bounce、curvature は単独の正解がなく、speed、scale、latency、animation、sound と組み合わさって良否が決まる。1.49 と1.491の差が知覚可能だったかは不明でも、「system を書ける」と「良い parameter basin を選べる」は別能力だという分離は妥当である。

最大の限界は、単一作者・単一作品の回顧報告であることだ。開発期間、従来手法との工数比較、prompt 回数、手編集時間、bug 数、player 指標はない。AI なしの場合より速かったかも検証されていない。因果的な生産性評価ではなく、再利用可能な工程仮説として読むべきである。

■ 自分達の環境への適用
短期 prototype へ移すのは画像生成そのものではなく executable constraint の受け渡しである。collision、walkable area、spawn point、camera safe area を headless build から mask として export し、画像生成、overlay debug、test fixture が同じ artifact を読む。生成後は mask と visual landmark を重ね、lane、壁端、重要 object のずれを測る。元 collision ID と生成版を metadata に残し、physics 変更時に stale な art を検出できる形までを一単位にする。

一画面の physics toy で、A は art-first で collision を後合わせ、B は collision mask を先に固定して同じ回数だけ生成する。初回 playable までの時間、接触位置の不一致、再生成回数、compositing 時間、geometry 変更後のやり直し量を記録する。B で手合成が増えるなら、mask の情報量か layer 分離が不足している。

観察用 bot は高得点を目標にしない。固定 seed で random、単純 heuristic、入力 replay を走らせ、滞在 heatmap、速度分布、contact の反復、停止時間、outlane 比率、target 到達回数を保存する。低 score でも未到達 zone や反射 loop を見つければよい。bot が通らないことを人間にも不可能とは判定せず、headless は異常候補の抽出、人間は feel と意図の判定を担当する。

feel 調整では restitution、torque、kick angle を一度に一軸だけ変え、同じ initial state と input replay を保存する。ball speed、return time、lane success、drain rate と、短い録画への pairwise 判定を併記する。数値が良くても触感が悪い組合せを残し、headless metric の blind spot を次へ返す。終盤は feature 追加を止め、message priority、state transition、同時 event、audio、mobile input を polish checklist と race-condition test へ分ける。

記憶には入力 artifact、生成物、手修正、判定主体を分けて残す。見積りも core system、feel calibration、polish tail の三枠にし、前半が高速化しても後二枠が縮むとは仮定しない。

■ メリット・デメリット
メリットは、実行可能な geometry を visual production の共通 contract にでき、physics と絵の漂流を早期に抑えられること。専用 editor の出力をそのまま生成入力と debug overlay に使えるため、反復が一続きになる。低性能な bot にも、長時間の盤面観察と異常候補抽出という明確な役割を与えられる。AI に任せる system 構築と、人間が担う触感・最終判断の境界も具体的である。

デメリットは、silhouette が高さや接触の見え方を保証せず、多数生成と compositing を消せないこと。専用 editor も一作では回収できない可能性がある。bot の coverage は偏りに支配され、微細 parameter 調整は再現条件がなければ思い込みになり得る。比較実験や player study がないため、速度・品質向上は一般化できない。

■ 判定
部分採用。collision/debug geometry を生成 asset の拘束条件へする pipeline、低性能 bot を観察装置として使う役割分離、feel と polish を独立予算にする見積りは採る。画像生成を完成 asset の自動化と見なすこと、bot の挙動を player experience の判定に使うこと、微小な物理値を metric なしで追うことは採用しない。まず一画面 probe で alignment、手修正時間、coverage、触感判定の再現性を測ってから拡張する。

■ URL
https://itch.io/devlog/1517147/alien-pinball-postmortem-how-i-made-a-full-physics-pinball-game-with-ai-tools.amp
