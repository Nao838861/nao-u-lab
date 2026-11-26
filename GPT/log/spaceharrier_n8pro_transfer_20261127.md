# SpaceHarrier N8 Pro USB転送記録（2026-11-27）

依頼元ZIP: `C:\Users\deep7\Downloads\SpaceHarrier_TV_StripeDarker_N8Pro.zip`

公式edlink v1.0.0.2でCOM3のEverDrive-N8 PROへ転送。ZIP内の2組の `.nes.fpgrom` フォルダ構成を保ち、各ROMと `mapper.rbf` を `sd:/usb-games/` 配下へ配置した。全4ファイルをSDから読み戻し、元ファイルとのSHA-256一致を確認した。ゲームの起動・実機画面は未検証。

| 転送先 | バイト数 | SHA-256 |
|---|---:|---|
| sd:/usb-games/SpaceHarrier_TV_A_Stripe_29.nes.fpgrom/SpaceHarrier_TV_A_Stripe_29.nes | 1179664 | 5b451010fee7228eec4034c64d60f084348c56ed1af563389e3104521762e065 |
| sd:/usb-games/SpaceHarrier_TV_A_Stripe_29.nes.fpgrom/mapper.rbf | 169122 | a815d020706a5729d2eeed270c95fc8f1eb4bb8b2a7bc31fc52142409c66799c |
| sd:/usb-games/SpaceHarrier_TV_B_Stripe_1A.nes.fpgrom/SpaceHarrier_TV_B_Stripe_1A.nes | 1179664 | 053f46bf094d2029209a6bc9830a8305cbbac60e651c858fa3368d2c0c9a0c51 |
| sd:/usb-games/SpaceHarrier_TV_B_Stripe_1A.nes.fpgrom/mapper.rbf | 169122 | a815d020706a5729d2eeed270c95fc8f1eb4bb8b2a7bc31fc52142409c66799c |
