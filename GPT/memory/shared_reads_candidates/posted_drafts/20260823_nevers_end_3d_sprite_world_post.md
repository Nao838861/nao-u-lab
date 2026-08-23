■ 概要
Ryan Juckett の GDC 2026 講演は、完全な 3D tactical RPG『Never's End』を、手描き 2D pixel-art の sprite world として読ませる実装を解説する。装備差し替え、animation、動的 lighting、天候や時刻変化を 3D のまま使いながら、一 pixel 幅の線、段階的な陰影、離散的な動き、2D 的な前後関係を守る。7.5年の custom engine 開発で、linework、shading、pixel snapping、sprite sorting、animation の五層を同じ知覚目標へ揃えた。

linework は post-process だが、単純な edge filter ではない。境界を object ID、depth、material ID の三系統に分け、線を置く側をこの順で決める。線を置かれた側は一 pixel 大きく手前に見えるため、outline 自体が前後関係を記述する。後続 pass 用に outline 部分へ depth と全 G-buffer を surface の平面に沿って外挿する。同一 object 内の境界、ridge、selection は section ID、normal、depth、二層目の outline で別処理する。shading は三本の toon ramp、編集 normal、shadow 専用 geometry、shade 時の別 albedo を使い、物理的正しさより読ませたい影境界を優先する。

pixel snapping は camera position を screen 座標で丸め、奇数幅 viewport には half-pixel offset を入れる。zoom と pitch は world block が整数 pixel 間隔になる値へ再計算する。model root と joint translation も snap するが、壁の接続、親 sprite の attachment、足接地には個別の無効化・継承 rule がある。particle は位置・size・奇数幅、cloud は scroll と形状 animation、star は zoom ごとの sampling を別々に量子化する。animation は model の world-space rotation を object 種別ごとの離散角へ丸め、camera rotation は滑らかに保つ。curve は補間なしの step key とし、particle の simulation と描画 frame rate も分離する。

sprite sorting は object の AABB を screen へ投影し、separating-axis test で重なりを検出する。minimum separating axis と view direction から前後を有向 graph にし、A→B→C→A の cycle は Tarjan の strongly connected components で見つける。正解のない cycle は screen-space overlap が最小の edge を切って再 sort する。背景の flicker を避けるため static 環境を先に固定し、dynamic object を後から挿入する。描画は順番に応じて depth をずらすが、水や霧用には standard depth も併記する。資料の評価は定量 benchmark ではなく、各層の OFF/ON 比較と cycle、接続、影などの破綻例が中心である。結論は、単一 shader ではなく、技術制約に art style を導かせ、artist と engineer が pixel-level の例外まで共同管理して初めて成立する、というものだ。

■ 内容分析
この資料の核心は、pixel art を解像度や色数ではなく「画面上の離散性を守る契約」として扱った点にある。camera、model root、joint、particle、cloud、texture sample が別々に連続値を残せば、各要素が単独で正しくても相対位相がずれて shimmer する。そこで対象ごとに snap の所有者と例外を決める。壁は接続を優先して snap を切り、足 joint は親 offset を継承せず、奇数幅 particle は半 pixel ずらす。この例外設計まで含めて一つの表現系になっている。

同様に、sorting は幾何学的な真値を復元する処理ではない。cycle に正解がないことを認め、誤りを消す代わりに「誤って見える面積」を最小化する。static sort の固定、別 group を混ぜる heuristic、shadow の不整合を drop shadow として許容する判断、dual depth で水と霧だけ通常 3D を残す処理は、2D illusion と 3D simulation のどちらを各 pass で正本にするかを明示したものだ。outline 後に G-buffer まで外挿するのも、線を最終化粧ではなく後続描画が参照する geometry 情報として扱うためである。

限界は、豊富な OFF/ON 比較がある一方、GPU cost、frame time、artist 工数、ユーザー評価がないことだ。7.5年の custom engine 開発なので、各技法の効果と pipeline 全体の費用を分離できない。sort volume は case-by-case、hair specular は調整が複雑で、shadow intersection も残る。再現 recipe ではなく、破綻を知覚単位で分類した production case study と読むべきである。

■ 自分達の環境への適用
まず小さな orthographic arena で三層だけ試す。第一に camera position / zoom / pitch と model root の pixel snapping、第二に joint の step movement と object 種別ごとの rotation quantization、第三に三 object の cycle を含む graph sort である。full outline pipeline や動的 cloud は後回しにし、連続 3D 版を control として同じ camera path を再生する。

headless 評価では、偶数・奇数 viewport、1 pixel 未満の camera pan、pitch 変更、同一 model の複数 instance、壁 attachment、足接地、particle の奇数 size を fixture 化する。frame 間の silhouette hash 変化、静止物の screen-space jitter、同一 instance 間の輪郭不一致、sort edge の flip 回数、誤順序になった overlap pixel 面積を記録する。水や霧を入れる段階では sprite / standard depth の両方を artifact として保存し、visual golden と数値を同じ run ID に結ぶ。

asset 側には object / material ID、sort volume、snap の所有者、rotation angle set を明示し、例外理由を data と test に残す。採用 gate は、jitter と静的 sort flip が減り、silhouette と足接地を壊さず、追加 authoring が反復速度を阻害しないこととする。

■ メリット・デメリット
メリットは、3D の装備差し替え、lighting、camera、animation を保ちながら、2D sprite の輪郭と読み順を得られることだ。特に、cycle を graph 問題として検出する、static と dynamic を分ける、standard depth を併存させる設計は、破綻を偶然の draw order や手修正に隠さない。snap rule と visual fixture は headless regression にも落としやすい。

デメリットは、renderer のほぼ全段へ独自制約が伝播することだ。post-process outline だけ移植しても、camera、animation、sort、depth が連続値のままなら一貫性は得られない。ID buffer、複数 G-buffer、dual depth、custom sort、asset metadata は実装・debug・authoring cost を増やす。離散化は滑らかな camera と衝突し、例外 rule を誤ると wall gap、foot slide、particle jump を生む。資料に性能値と制作工数がないため、全 pipeline の費用対効果も事前には読めない。

■ 判定
部分採用。個別 shader の模倣ではなく、知覚目標を camera・animation・depth・asset rule へ横断させ、破綻時に「正解がない」場合は誤りの見える面積と時間的不安定さを最小化する設計を採る。まず snapping、rotation quantization、cycle sort の小規模 probe を visual / headless 両方で比較し、outline・toon shading・dual depth は必要性が確認できた層だけ追加する。

■ URL
https://media.gdcvault.com/gdc2026/Slides/Juckett_Ryan_HowWeDrawA3DSpriteWorldTheStylizedArtOfNeversEnd.pdf
