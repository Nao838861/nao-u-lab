■ 概要
Mega Cat Studios の Matthew Wojtechko が、『Backyard Baseball』を発売可能な Unity プロジェクトへ育てる過程の知見を六つの lesson に整理した記事である。試作期には有効な「まず動かす」作り方が、機能・資産・担当者の増加後には、変更波及、資産の迷子、scene / prefab の競合、import 設定漏れ、手動 QA の肥大化として跳ね返る。prototype では機能と手触りを優先し、試作を抜けた時点で iteration velocity から stability へ重心を移す、という段階の切り替えが出発点になる。

第一の lesson は資産と scene の構造である。資産を Type、次に用途 Purpose で分ける。巨大 scene は critical system を持つ main、title、試合時に加算 load する baseball diamond などへ分割する。機能も自己完結 prefab に寄せ、変更を一つの serialized file に集中させない。Resources の path ではなく Addressables の key で必要時だけ load する。

第二、第三の lesson は code dependency の制御である。Component、ScriptableObject、class を単一責任の小さな building block にし、system 間は適切な interface や event で接続する。依存 graph を先に描いて循環と god script を避け、Assembly Definition を compile time 短縮だけでなく依存の強制装置にする。実例では Input と Gameplay を別 DLL に置き、gameplay は gamepad や netcode の詳細を知らないため、入力系の変更を player physics や AI behavior へ波及させにくい。

第四の lesson は automated test である。test を「要求事項の一覧」と捉え、fastball の速度、盗塁 timing、fielder の反応、ground collision、bat contact、ball trajectory、wind-up や swing の state flag を期待結果にする。共通の bat swing code や選手能力を変えた時、意外な破壊を QA 前に検出する。

第五、第六は asset と共同作業の失敗を入口で止める。AssetPostprocessor で import rule を強制し、OnValidate で missing reference を build 前に報告する。version control では small atomic commit、main からの日次 merge、専門家 review を用いる。scene / prefab は additive / nested component に分け、text serialization と YAML auto-merge を使う。難しい asset は ownership と semaphore で同時編集を防ぐ。結論は、規模対応は coding 量ではなく、architecture、検査、変更所有権を一貫させる discipline だというもの。ただし 10 分の手作業のために 10 日の自動化をしない、原則が開発を止めるなら team 固有の tradeoff を優先する、という上限も置く。

■ 内容分析
この記事の中核は個別の Unity API ではなく、変更の blast radius を境界で狭める設計にある。Assembly Definition と interface は code dependency、additive scene と prefab は serialized file、AssetPostprocessor / OnValidate / test は不正状態を main や build へ通すか、atomic commit と ownership は変更主体の境界を作る。これらは独立した tips ではない。scene を分けても system が直接参照で絡めば波及は残り、code を分けても requirement test がなければ境界を守れたか確認できない。architecture、test、asset pipeline、version control を同じ「早く局所化する」目的に接続した点が強い。

特に gameplay test は、pitch speed、steal timing、contact timing、trajectory、controller flag という play 感の中間量を requirement にする。最終的な「楽しい」ではなく、意図した feel を支える決定論的な契約を検査する。この切り分けなら自動 test は QA や playtest を置き換えず、探索する build が前提条件を満たすところまで絞れる。

評価には注意が必要である。出荷経験が背景にある一方、導入前後の defect、compile time、merge conflict、QA 時間、memory 使用量を比較していない。どの lesson がどれだけ効き、どの規模から費用対効果が正になるかも不明である。Addressables、細かな AsmDef、日次 merge、asset lock は、catalog 管理、dependency 設計、同期作業、待ち時間を生む。「medium to large」の処方を短期一人試作へ一括移植する根拠にはならない。

asset ownership は conflict 予防には強いが、所有者待ちを常態化させると bottleneck になる。これは万能原則ではなく、scene / prefab merge が高コストな箇所の例外策と読むべきである。自動化も、発生頻度、失敗時損失、検査の安定性、保守費を見積もらず増やせば pipeline 自体が負債になる。

■ 自分達の環境への適用
こちらでは、すべての prototype を最初から production 構造にせず、「昇格ゲート」として部分採用する。短い playable diff で核となる操作を確かめる間は、最短の一枚 scene や直接実装を許す。継続開発へ移す条件を、①同じ system を二回以上変更する、②複数の feature が共通 state を読む、③scene / asset の並行編集が始まる、④回帰確認が手作業一回では済まない、のいずれかに置く。条件を満たした時だけ、system boundary、asset rule、headless test を追加する。これなら初期速度を殺さず、負債が複利化する直前に構造へ投資できる。

最初の probe は既存 prototype 一つで行う。input と gameplay simulation を分け、headless 側から command を注入する。固定 seed / step で、移動距離、collision 後の位置、攻撃判定 frame、damage、state flag を JSON に保存し、期待範囲との差で fail させる。面白さは背負わせず deterministic な requirement だけを守る。asset / scene には missing reference、想定外 texture size、禁止 path、重複 ID、build 対象漏れなど、誤検出が少なく修正が一意な規則だけを加える。

効果は四週間、回帰の検出時点、手動再現時間、false positive、test 保守時間、merge conflict 件数で記録する。保守費が上回る規則は外し、scene 分割や ownership は競合が繰り返された箇所だけへ適用する。Unity 以外でも、AsmDef は module dependency、OnValidate は asset lint、Addressables は logical asset ID、Test Runner は headless requirement suite と翻訳できる。採るべきものは製品名ではなく、変更を局所化し境界を機械検査する構造である。

■ メリット・デメリット
メリットは、prototype の速度と production の安定性を移行時点の判断として扱えること。code、scene、asset、commit の境界が同じ目的を持つため、障害の所在を絞りやすい。gameplay requirement を headless test に落とせば、playtest を感触・難度・演出へ集中できる。規則を import、validation、CI で早期実行すれば、低性能機や統合 build で初めて問題が出る確率も下げられる。

デメリットは定量評価がなく、team 規模と project 寿命に応じた損益分岐点が不明なこと。分割しすぎると dependency と build 設定の認知負荷が増え、event の追跡も難しくなる。Addressables や custom importer は保守を要求し、asset lock は待ちを作る。test は契約には強いが、操作感、animation の読みやすさ、戦術の多様性は保証しない。一式の best practice として先回り導入すれば、過剰設計を別の形で再現する。

■ 判定
部分採用。試作終了後の昇格ゲート、input と gameplay の依存分離、headless requirement test、誤検出の少ない asset validation、small atomic commit は採用する。Addressables、細粒度 Assembly Definition、asset semaphore は問題が実測された箇所に限定する。導入前後の回帰検出時間、保守費、競合件数を記録し、局所化の利益が運用費を上回る規則だけを残す。

■ URL
https://unity.com/blog/scaling-workflows-lessons-from-medium-to-large-projects
