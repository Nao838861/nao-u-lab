■ 概要
Microsoft が GDC 2026 で示した Advanced Shader Delivery（ASD）は、D3D12 ゲームの shader stutter を、状態収集、GPU／driver 構成別の事前コンパイル、store 配布、実機観測からなる供給系として解く提案である。PC は console と違って GPU と driver が固定されず、単一 cache を全利用者へ配っても互換性を保証できない。開発側は playthrough の trace または engine からの生成により、pipeline state object（PSO）や state object の記述を State Object Database（SODB）へ集める。GPU vendor が driver から分離した offline compiler と SODB を組み合わせ、adapter family、compiler ABI、application profile に合う Precompiled Shader Database（PSDB）を生成し、installer/store が利用者の構成に合うものだけを登録する。D3D12 runtime は一致する shader があれば runtime compile を避ける。

Agility SDK 1.619 では App Identity API と Stats API が追加された。前者は device 作成前に application descriptor と GUID を登録し、SODB を title に結び付ける。これは Xbox Partner Center への提出要件になる。後者は特定 hardware での PSDB cache hit rate を返し、2026年5月版 PIX で real-time counter 表示する計画が示された。PSO 数が巨大で全組合せを列挙できない title 向けには、共通する pre-rasterization program と pixel shader program を部分単位で作り、残りの state と runtime link する partial graphics programs も準備中である。結論は、SODB collection を engine に統合し game package と共に配布することで、shader stutter を個々の PC の初回実行に押し付けず ecosystem 全体で前処理する、というものだ。

■ 内容分析
この設計の本質は「shader を事前コンパイルすること」より、hardware 非依存の入力と hardware 依存の成果物を分離した点にある。SODB は title が作り得る state の正規化された材料、PSDB は特定 adapter family／compiler ABI／application profile に対する派生成果物である。公式仕様では installer が D3D Shader Cache Registration API を通じて対象 adapter と compiler 互換情報を問い合わせ、対応 PSDB を取得して application に登録する。driver 更新時には callback／service trigger で再点検し、無効になった PSDB を更新する責務も store／installer 側へ置かれる。これにより「cache file が存在する」ことと「現在の環境で安全に使える」ことを区別できる。

同時に、SODB の品質が system 全体の上限になる。trace 方式は通った level、material、quality setting、rare effect しか記録できず、未訪問状態は実行時 compile に落ちる。programmatic generation は網羅性を上げられるが、実際には到達不能な組合せまで列挙すると、SODB、offline compile 時間、PSDB 配布量が膨らむ。partial graphics programs は組合せ爆発を共通部分の再利用で抑えるが、link が runtime に残る以上、「完全な PSO を全て事前生成した場合と同じ無停止性」が自動的に得られるわけではない。どの state を部分化できるか、runtime link の CPU cost と新たな hitch が許容範囲かを別に測る必要がある。

評価面で重要なのは Stats API だが、hit rate 単独では十分ではない。95% hit でも、残り5%が boss 初登場や大規模 effect に集中すれば体感は悪い。必要なのは hit／miss 数に加え、miss が起きた frame の compile 時間、frame-time spike、scene／event ID、fresh install と driver 更新後の差を結び付けることだ。なお GDC 記事は仕組みと導入手順の紹介であり、比較対象、hardware matrix、p95／p99 frame time、PSDB size、offline compile cost を揃えた定量実験は掲載していない。後続の公式発表には対応 title で launch time を最大95%短縮したとの値があるが、全 title・全構成の一般的保証ではない。ASD を「stutter 解消済み」と評価するには、各 title 側の測定が残る。

■ 自分達の環境への適用
MonoSH 本体は NES／6502 向けで D3D12 shader を使わないため、ASD の直接対象ではない。適用するのは将来 Windows／D3D12 の prototype や custom engine を作る場合である。その際は、① shader／PSO 作成点へ SODB collection hook を置く、② headless の scripted playthrough で stage、boss、damage、quality tier、rare effect を通す、③複数 GPU／driver の clean cache 実行で hit rate と frame-time spike を同時収集する、④ build ID・SODB hash・adapter family・driver version を manifest に固定する。初期の合否は平均 FPS ではなく「主要経路で compile 起因の33ms超 frame が0」「必須経路の hit率100%」「driver 更新後に互換 PSDB が再取得される」とし、miss の場所を消す評価にする。

現在の headless 評価と記憶システムへは責務分離を移植できる。SODB を「起こり得る状態の宣言」、PSDB を「環境別の検証成果物」、Stats API を「宣言に対する実行時 coverage」と捉える。game test なら level／enemy pattern／入力列の catalog と platform 別 replay 結果を分け、artifact に build hash と emulator version を付ける。記憶では source atom と派生 summary を分け、consumer の canonical hit／fallback を記録する。「材料・環境依存成果物・利用観測を混ぜない」という原則の転用である。

■ メリット・デメリット
メリットは、初回 compile の費用を player の不意な frame から offline／配布工程へ移せること、hardware 差を互換条件として明示できること、hit rate により収集漏れを release 前に観測できること、driver 更新時の再生成まで installer workflow に組み込めることにある。partial graphics programs が実用化すれば、巨大な PSO 空間を完全列挙せず共通部分を再利用できる。

デメリットは、stutter が消えるのではなく upstream の収集漏れ・compile farm・store 配布・version 管理へ移ることだ。SODB が不完全なら miss は残り、過剰なら build 時間と artifact 容量が増える。GPU vendor、driver、store、Agility SDK に跨るため、自前 engine 内だけで完結せず、Xbox Partner Center 以外の配布経路では対応状況も確認が要る。cache hit率は体感品質の代理指標にすぎず、frame-time telemetry と結ばなければ良い数字を作れてしまう。記事時点で一部機能は coming soon であり、partial programs を production 前提に固定するのも早い。

■ 判定
部分採用。Windows／D3D12 作品では SODB collection と Stats API を小規模 prototype で試す価値が高く、特に「状態収集→構成別 artifact→実機 hit 観測」の閉ループを採る。一方、MonoSH への直接導入、記事中にない性能保証、partial graphics programs の先行採用はしない。採用判断は clean cache、複数 GPU／driver、miss 発生 frame を含む title 固有の計測後に確定する。

■ URL
https://developer.microsoft.com/en-us/games/articles/2026/03/gdc-2026-advanced-shader-delivery-on-windows/
https://devblogs.microsoft.com/directx/advanced-shader-delivery-whats-new-at-gdc-2026/
https://microsoft.github.io/DirectX-Specs/d3d/ShaderCacheRegistrationAPI.html
https://developer.microsoft.com/en-us/games/articles/2026/06/expanding-advanced-shader-delivery-support/
