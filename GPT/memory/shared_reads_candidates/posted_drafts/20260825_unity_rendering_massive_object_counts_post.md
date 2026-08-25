■ 概要
この記事は、『Backyard Baseball 2026』で大量 object を描画した経験をもとに、static batching、GPU instancing、vertex animation texture（VAT）などを万能な高速化 tips として並べるのではなく、最初に CPU bound / GPU bound を profile し、対象の性質と bottleneck に応じて手段を選ぶ診断順序を示している。狙いは、60 fps を保ちながら密な環境や数千の animated entity を成立させることだが、各手法は負荷を消すのではなく、CPU、GPU、memory、collision、制作自由度の間で負荷を移す。

描画では CPU が「何を描くか」を draw call として GPU へ渡す。mesh、shader、lighting が複雑なら GPU 側を軽くし、CPU が redundant な指示や大量の draw call に時間を使うなら、まとめ方を変える。stationary mesh が多い scene では、視界に入らないものを描かない occlusion culling を使えるが memory cost がある。同じ material を持つ静止 object は static batching で combined mesh にまとめ、draw call と CPU overhead を減らす一方、combined mesh を保持する GPU memory が増える。

同じ mesh・material の複製が多い foliage には GPU instancing を使い、個別の描画命令を一括化する。色などの差は shader parameter で instance ごとに渡せる。さらに standard skinned mesh renderer と Animator が数十 character で重くなる場面では、vertex の position・rotation を texture に encode し shader で読む VAT と instancing を組み合わせ、数千の animated entity を出せたと報告する。ただし animation は視覚だけで collider は追従せず、CPU cost を GPU compute と RAM へ移すため、正確な hit 判定や個体別の骨 animation が必要な対象には向かない。

描画外では MonoBehaviour Update の集約、Job System・Burst、参照の cache、重複 texture の監査も挙げる。初期から厳しく縛らず後期に shader・asset・script を横断監査し、計測、対象分類、負荷移送後の再計測、見た目以外の意味保存を一組にするのが結論である。

■ 内容分析
記事の価値は、optimization を object の型へ結びつけた点にある。隠れる静止環境なら culling、同 material の静止集合なら batching、同じ形の反復 object なら instancing、反復する視覚 animation で collision が不要なら VAT、object ごとの script 呼出しが支配的なら Update 集約や Job 化、というように適用条件が異なる。これは「大量 object」という表面的な症状から直接 VAT へ飛ばず、main thread、render thread、GPU、memory のどこが限界かを先に特定する診断表として使える。

VAT は特に「最適化は意味の圧縮でもある」ことを見せる。通常の Animator を捨てることで骨、個別 state、物理との同期を簡略化し、texture sample で再生できる表現へ変換する。数千体という規模は魅力的だが、collider が動かないため、gameplay 上の entity として同等ではない。背景 crowd、grass、遠景生物には使えても、敵の攻撃判定や地形へ反応する character に同じ数字を期待すると設計が破綻する。描画数の増加と simulation fidelity の低下を別々の指標で評価すべきである。

限界は比較実験の詳細がないことだ。数十から数千へ増えたという VAT の主張に、hardware、vertex 数、animation frame 数、draw call、frame time、memory 増分の表はない。static batching の memory 説明にも RAM と GPU memory の言い分けが曖昧な箇所がある。一般化可能な benchmark ではないため、technique の候補抽出には使えても、数字や URP 推奨を保証として持ち込めない。

■ 自分達の環境への適用
まず大量敵、grass、particle 代替、背景 crowd などを一括して「object 多すぎ」と呼ばず、五つに分類する。A は unique で静止、B は同 mesh の反復で静止、C は同 mesh の反復で移動、D は反復する視覚 animation だけが必要、E は個別 logic・collision・state が必要な gameplay entity である。A は culling と asset simplification、B は batching / instancing、C は instancing、D は VAT、E は simulation 側の Update 集約や data-oriented 化を最初の候補にする。分類表には見た目だけでなく「正確な collider が必要か」「個体差を何で表すか」を必須欄にする。

比較 probe は一度に一手法だけ変える。代表 scene と段階的な entity count を固定し、同じ camera path で CPU main/render thread、GPU frame time、draw call、GC、memory、build size を記録する。重要なのは technique ごとの破綻点を同じ条件で探すことだ。平均 fps だけでなく percentile と spike を残し、一定時間 run して温度や streaming の影響も見る。変更後に別 processor が bottleneck へ移ったなら成功と決めつけず、総 frame time と memory budget で再判定する。

headless 評価は GPU 性能を保証できないが、semantic regression の検出に使える。生成 object 数、pool の再利用、state transition、collider、hit 判定、asset reference の重複、例外を検査し、render capture と役割を分ける。VAT 版では collision が静的だと仕様化し、gameplay entity の test suite を誤って通さない。visual fidelity は固定 camera の画像差分と人手確認で見る。

done condition は、対象 hardware の代表 scene で baseline より frame budget が改善し、memory 上限を越えず、必要な collision と個体差が保存され、同じ手順で再計測できることとする。最初の実装候補は既存 scene の repeated static object 一群への instancing か、多数 Update の集約のどちらか一つでよい。VAT や render pipeline 移行は、profiling が animation / draw submission を主因と示した場合だけ次段へ進める。

■ メリット・デメリット
メリットは、手法名から始めず bottleneck と object 特性から選ぶため、不要な複雑化を減らせることだ。instancing は反復 asset の variation を保ちながら draw call を削減でき、VAT は視覚 animation を大量表示へ拡張する。Update 集約や texture audit は render pipeline に依存せず効く可能性がある。計測表へ collision、memory、authoring cost を含めれば、fps 改善の裏で gameplay を壊す変更を見逃しにくい。

デメリットは、どの手法も別の budget と制約を増やすことだ。batching は memory と静止性、instancing は shader・material の共通化、VAT は texture memory、shader 複雑性、静的 collider、個別 animation の喪失を伴う。centralized Update は呼出し overhead を減らせても manager の責務集中や debug 困難を招く。Job/Burst は data layout と thread safety の再設計が要る。早すぎる共通化は artist の iteration を遅くし、遅すぎる監査は asset 全体の作り直しを招く。さらに記事の定量 evidence が不足しているため、自分達の hardware と content で再現しなければ採否を決められない。

■ 判定
部分採用。採るのは profile first、object 分類、one-change comparison、性能と semantic fidelity の二重評価である。static batching、instancing、VAT、Update 集約は診断結果に応じた候補として保持し、URP/HDRP 選択や「数千体」という規模は保証として採らない。まず一つの repeated object 群で baseline と instancing の比較を行い、frame time、memory、見た目、collision の全条件を満たした時だけ適用範囲を広げる。

■ URL
https://unity.com/blog/rendering-at-scale-efficient-strategies-for-massive-object-counts
