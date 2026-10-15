# タイトルのモード順を変更

ユーザー依頼：「GRIP MODEとDRIFT MODEの順番を入れ替えて。簡単な処理なのでチェックは不要、すぐROMをだして。」

最新リザルト版main e8fa5f4を基に、上DRIFT・下GRIPへ変更。カーソル・上下入力・初期選択もDRIFTが上になるよう合わせた。テスト・全体再ビルドは省略し、最新配布ROMへ固定サイズの変換を適用した。再生成用の正本はui/menu-order.pyで、build_release.pyの最終段から呼ぶ。

ROM：releases/MMC5Racing_DriftFirst_136x184.nes。SHA256：0ab66dffd2b3e7b15c90bc43d0a35c17618ba199b567d5ccd61d54bc509d251e。play_latest.cmdの参照を更新した。
