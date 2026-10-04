"""このPC用のBIOS更新手順書をPDFと単独HTMLで生成する。PCの設定は変更しない。"""

from __future__ import annotations

import html
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf"
STEM = "asrock_b760m_bios_update_guide_ja"
BIOS_URL = "https://download.asrock.com/BIOS/1700/B760M%20Pro%20RSD4%20WiFi%2812.02%29ROM.zip"
SOURCES = {
    "bios": ("BIOS 12.02 ZIP（ASRock公式）", BIOS_URL),
    "board": ("B760M Pro RS/D4 WiFi：BIOS一覧と注意書き", "https://www.asrock.com/MB/Intel/B760M%20Pro%20RSD4%20WiFi/index.us.asp#BIOS"),
    "flash": ("Instant Flash更新手順（図入り・英語PDF）", "https://www.asrock.com/support/BIOSIG.asp?cat=BIOS9"),
    "setup": ("B760シリーズ：BIOS設定ガイド（日本語PDF）", "https://download.asrock.com/Manual/Software/Intel%20B760/Software_BIOS%20Setup%20Guide_Japanese.pdf"),
    "manual": ("このマザーボードの取扱説明書（日本語PDF）", "https://download.asrock.com/Manual/B760M%20Pro%20RSD4%20WiFi_Japanese.pdf"),
    "keys": ("Microsoftアカウントの回復キー一覧", "https://account.microsoft.com/devices/recoverykey"),
    "recovery": ("BitLocker回復キーを探す方法（日本語）", "https://support.microsoft.com/ja-jp/windows/security/encryption/find-your-bitlocker-recovery-key"),
    "encryption": ("Windows Homeにもあるデバイスの暗号化", "https://support.microsoft.com/ja-jp/windows/security/encryption/device-encryption-in-windows"),
    "status": ("暗号化状態の確認：manage-bde -status", "https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/manage-bde-status"),
    "protectors": ("保護の中断・再開：manage-bde -protectors", "https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/manage-bde-protectors"),
    "intel": ("Intelの現在の対策案内", "https://www.intel.com/content/www/us/en/support/articles/000102331/processors.html"),
    "warranty": ("Intelの保証延長対象と問い合わせ先の区分", "https://www.intel.com/content/www/us/en/support/articles/000024255/processors.html"),
}


def p(text): return ("p", text)
def h(text): return ("h", text)
def step(title, text): return ("step", title, text)
def note(title, text): return ("note", title, text)
def code(text): return ("code", text)
def checks(*items): return ("checks", list(items))
def link(key): return ("link", key)


PAGES = [
    ("01", "始める前に", "必要なものをそろえ、作業を保存する", [
        p("この手順書は、Core i9-13900を搭載したASRock B760M Pro RS/D4 WiFiのBIOS更新用です。Windows上の作業を済ませてから、再起動してマザーボード内蔵のInstant Flashを使います。"),
        note("今回確認できた構成", "CPU：Core i9-13900 ／ マザーボード：B760M Pro RS/D4 WiFi<br/>現在のBIOS：1.14（実機表示の日時：2022年11月3日）<br/>OS：Windows 11 Home ／ 更新候補：BIOS 12.02（2026年7月14日公開）"),
        h("用意するもの"),
        checks("中身を消してよいUSBメモリ1本。8～32GB程度のものが扱いやすい。", "スマートフォン、別PC、または印刷した手順書。更新中、このPCのチャットは読めない。", "スマートフォンのカメラ。更新前のBIOS設定を撮影する。", "重要なファイルのバックアップ先。別ドライブ・外付け・クラウドなど。"),
        step("1. 作業内容を保存する", "エディターやゲーム制作ツールの未保存ファイルを保存し、重要なデータをバックアップします。実行中のビルド、Python処理、ゲーム、更新プログラムが終わってから進めます。"),
        step("2. Windowsのサインイン方法を確認する", "PINだけでなく、アカウントのパスワードなど別のサインイン方法も確認します。BIOS更新後にPINの再設定を求められる場合があります。Microsoftアカウントを使う場合は、スマートフォンでもサインインできることを確認します。"),
        step("3. 電源と購入形態を確認する", "作業中に電源ケーブルや電源タップに触れない状態にします。BTO・メーカー製PCの場合は、販売店の更新案内と指定BIOSを先に確認します。市販マザーボード用BIOSを使ってよいか不明なら、書き込み前に購入店へ確認します。"),
        h("進める順番"),
        p("2ページ：暗号化と回復キー → 3ページ：USB準備 → 4ページ：BIOS設定の撮影 → 5ページ：更新 → 6ページ：更新後の設定と確認 → 7ページ：困った場合。リンク一覧は8ページです。"),
        p("目安は準備を含めて30～60分です。これは作業時間の目安であり、書き込みが終わるまでの制限時間ではありません。"),
    ]),
    ("02", "暗号化と回復キー", "再起動後もドライブにアクセスできるようにする", [
        p("Windows 11 Homeでも「デバイスの暗号化」が有効なことがあります。先の調査では管理者権限がなく、暗号化状態は確認できていません。次の確認はユーザー自身が管理者の画面で行います。"),
        step("1. 管理者のコマンド画面を開く", "スタートを開き「cmd」と入力 →「コマンド プロンプト」を右クリック →「管理者として実行」→ 確認画面で「はい」。開いた画面に、次の1行を入力してEnterを押します。"),
        code("manage-bde -status C:"),
        note("表示の読み方", "暗号化された割合が0%、変換状態が完全に復号化、保護が無効なら、C:の中断・再開は不要です。<br/>暗号化された割合が0%より大きければ、保護が無効と表示されても回復キーを確認します。暗号化・復号化の途中なら完了まで待ちます。<br/>アクセス拒否やエラーは「暗号化されていない」という意味ではありません。結果が不明なら更新を進めません。"),
        step("2. 暗号化されている場合は回復キーを保存する", "下のMicrosoftアカウントのページで、このPCに対応する48桁の回復キーを確認します。キーIDと回復キーを紙、またはこのPC以外から読める安全な場所へ保存してください。別のPCのキーと取り違えないようにします。"),
        link("keys"),
        p("アカウントにキーが見つからない場合、管理者の画面で次の確認コマンドを使えます。「数値パスワード」のIDと48桁のパスワードが、このC:ドライブの回復情報です。表示されなければ、回復キーの案内（8ページ）に従って所在を確認してから進めます。"),
        code("manage-bde -protectors -get C: -type RecoveryPassword"),
        p("回復キーの写真や出力をチャット・Git・共有フォルダへ貼り付けないでください。D:などほかの暗号化ドライブも、更新前に回復キーを確保します。"),
        step("3. C:の保護を一時中断する", "暗号化されていて保護が有効な場合に、下の1行を管理者の画面で実行します。暗号化は維持したまま、更新による起動時の確認を一時中断します。"),
        code("manage-bde -protectors -disable C: -RebootCount 0"),
        p("もう一度「manage-bde -status C:」を実行し、保護が無効になったことを確認します。0は手動で再開するまで中断する指定です。更新後は6ページの手順で必ず再開します。エラーが出たら再起動せず、原因を確認してください。"),
        p("最初から中断されていた場合は、その状態をメモしてください。別の保守作業が理由なら、再開の扱いをその作業の担当者に確認します。"),
    ]),
    ("03", "USBメモリを準備する", "BIOSファイルを展開してコピーする", [
        step("1. BIOS本体と注意書きを確認する", "下の公式BIOS一覧を開き、型番が「B760M Pro RS/D4 WiFi」であることを確認します。12.02の説明と、先に必要なBIOS・ME更新などの注意書きがないか読みます。前提更新が指定されている場合は、その順番を優先します。"),
        link("board"),
        note("古いBIOSからの更新について", "現在は1.14なので、12.02を直接書き込む前に、必要な中間版やME更新の指定がないか確認してください。この手順書は前提更新が不要な場合のInstant Flashの手順です。注意書きが表示されない、または意味が分からない場合は、書き込み前に購入店・ASRockへ確認します。"),
        step("2. ZIPを保存して展開する", "下の直接リンクを開き、ZIPを「ダウンロード」フォルダーへ保存します。保存したZIPを右クリック →「すべて展開」→「展開」。中のROMファイルを確認します。"),
        link("bios"),
        code("B760M-Pro-RS_D4_12.02.ROM"),
        p("ROMファイルのサイズは16,777,216バイト（16MiB）です。ファイル名にWiFiがないのは、今回確認した公式ZIPの実際の内容です。名前を変更せずに使います。ZIPのままUSBへ置いても、更新用ROMとしては使えません。"),
        step("3. USBの中身を退避し、FAT32にする", "USBを差す → エクスプローラーの「PC」を開く → 容量と名前で対象USBを確認 → 中の必要なファイルを別の場所へコピー。対象USBを右クリック →「フォーマット」→ ファイルシステム「FAT32」、クイックフォーマットにチェック →「開始」。"),
        note("消えるのは対象USBの中身", "フォーマットすると選んだUSBの中身が消えます。C:、D:、バックアップ用ドライブを選ばないでください。FAT32が選べなければ、8～32GBの別のUSBを使うのが簡単です。"),
        step("4. USBがMBR形式か確認する", "スタートを右クリック →「ディスクの管理」。容量を見て対象USBを探し、下側左端の「ディスク○」部分を右クリック →「プロパティ」→「ボリューム」→「パーティションのスタイル」がMBRであることを確認します。表示されなければUSBのプロパティの「ハードウェア」から対象デバイスのプロパティを開き、ボリューム情報を表示します。"),
        p("ASRockの手順はMBRとFAT32を指定しています。GPTだった場合や対象ディスクを識別できない場合は、その場で削除・変換せず、MBRの別USBを使うか準備方法を確認します。"),
        step("5. ROMをUSB直下へコピーする", "USBを開いた最初の階層へROMファイルをコピーします。コピー完了を待ち、そのUSBだけを更新用として使います。更新時はPC背面のUSB端子に直接差します。"),
    ]),
    ("04", "更新前のBIOS設定を残す", "初期化後に起動設定を戻せるようにする", [
        step("1. BIOS画面へ入る", "USBを差したままWindowsの「スタート → 電源 → 再起動」。画面が暗くなったら、キーボードのF2を繰り返し押します。ASRockの設定画面が開けば成功です。Windowsが起動してしまったら、もう一度再起動して早めにF2を押します。"),
        p("F2が間に合わない場合：設定 → システム → 回復 →「PCの起動をカスタマイズする」の「今すぐ再起動」→ トラブルシューティング → 詳細オプション → UEFIファームウェアの設定 → 再起動。項目がなければF2の方法を使います。"),
        step("2. 型番と現在の版を確認して撮影する", "Main画面などで型番が「B760M Pro RS/D4 WiFi」、現在のBIOSが1.14であることを確認します。表示が今回の構成と違えば、このファイルでの更新を進めず、型番を確認します。"),
        step("3. 起動・ストレージ・冷却の設定を撮影する", "EZ ModeならF6でAdvanced Modeへ切り替えます。次の画面をスマートフォンで撮影します。場所や名称はBIOS版で変わるため、見つからない項目を推測で変更しません。"),
        checks("Boot：Boot Option #1などの起動順序。Windows Boot Managerと対象SSD。", "Advanced：Storage Configuration、VMD Configuration、SATA Modeなど、表示されるストレージ関連設定。", "Boot / Security：CSMとSecure Bootの現在の設定。", "H/W Monitor：CPUファン・水冷ポンプ・ケースファンの設定。", "OC Tweaker：現在のXMP、CPU・メモリの設定。撮影はするが、古い性能設定を丸ごと戻さない。"),
        note("特にVMD・RAIDの記録が大切", "更新や初期設定の読み込みでストレージ設定が変わると、Windowsが起動しなくなる場合があります。現在の値を記録できない場合は、初期化前に確認してください。水冷PCではポンプ制御も記録します。"),
        step("4. 更新手順に従って初期設定を読み込む", "ASRockの現行手順は、更新前にF9でUEFIの初期設定を読み込み、F10で保存・再起動する流れです。確認画面でEnterを押します。保存する前に、起動に必要なVMD・RAID設定と冷却設定が変わっていないか写真と照合し、必要なものだけ戻します。"),
        p("設定が分からなければ、まだF10で保存せず、Exitの「Discard Changes and Exit」で変更を破棄して確認します。BIOSを初期化することと、Windowsを初期化することは別です。"),
        step("5. 再びF2でBIOSへ入る", "F10で保存・再起動したらF2を押し、更新画面へ進みます。ここまででUSB、回復キー、設定写真がそろっていることを確認します。"),
    ]),
    ("05", "Instant Flashで更新する", "書き込みを始めたら完了を待つ", [
        h("書き込み開始前の確認"),
        checks("型番と公式BIOSの注意書きを確認した。BTO機なら販売店の案内も確認した。", "重要なデータを保存し、更新前のBIOS設定を撮影した。", "暗号化されている場合は回復キーを確保し、C:の保護を中断した。", "MBR・FAT32のUSBに、展開済みの12.02 ROMが入っている。"),
        step("1. Instant Flashを開く", "Advanced Modeでは上部の「Tool」タブ →「Instant Flash」。EZ ModeにInstant Flashが表示されていれば、そこからも開けます。見つからなければF6でAdvanced Modeへ切り替えます。"),
        code("F2 -> F6 (if needed) -> Tool -> Instant Flash"),
        step("2. 注意画面を読み、用意したROMを選ぶ", "BitLocker・TPM・サインインに関する注意が出たら内容を確認します。準備済みなら続行します。USBの対応ファイルが一覧に出たら、12.02のROMを選びます。名前や表示される版が違うなら、書き込み前にキャンセルします。"),
        note("TPMを消去する操作はしない", "TPMのクリア、Secure Bootキーの手動削除などは今回の更新準備には含めません。求められる操作や表示がこの手順と大きく違えば、Yesを押す前に内容を確認します。"),
        step("3. 書き込みの確認でYesを押す", "対象ファイルを確認したら、更新開始の確認でYesを選びます。進捗表示が始まったら、キーボード操作、USBの抜き差し、電源操作をせず、そのまま待ちます。画面の表示が変わったり、自動的に再起動したりする場合もあります。"),
        note("この間は電源を切らない", "書き込み中に電源を切ると、PCが起動できなくなるおそれがあります。数分進まないように見えても、経過時間だけでリセットしません。エラーで止まった場合も画面を撮影し、電源操作をする前に購入店・ASRockへ確認します。"),
        step("4. 完了表示に従って再起動する", "完了して再起動を求められたら、画面の指示どおりEnterまたはOKを押します。自動的に再起動する場合はそのまま待ちます。最初の起動は通常より長くかかることがあります。"),
        link("flash"),
        p("この型番について、USB BIOS Flashbackで復旧できると確認したわけではありません。失敗時に別機種向けのFlashback手順や古いBIOSへの戻し方を試さず、サポートへ確認します。"),
    ]),
    ("06", "更新後の設定と確認", "版を確認し、暗号化の保護を再開する", [
        step("1. 新しいBIOSの版を確認する", "再起動中にF2でBIOSへ入り、Main画面などで12.02になったことを確認して写真を撮ります。1.14のままなら更新完了と扱わず、表示や実施内容を確認します。"),
        step("2. 初期設定を読み込み、必要な設定を戻す", "ASRockの手順に従い、Exitの「Load UEFI Defaults」またはF9で初期設定を読み込みます。写真を見て、起動に必要なVMD・RAID・起動順序と冷却設定を戻します。CPUの電圧・電力・メモリの設定を古いBIOSのプロファイルから一括復元しないでください。"),
        p("Intel Default Settingsの選択肢があれば、それを使います。表示されない場合は最新BIOSの初期設定を基準にし、電力制限解除や性能上乗せの設定は選びません。確認中はXMPを無効、メモリは通常設定にします。Intelが推奨する対策は最新BIOSとIntel標準設定の組み合わせです。"),
        step("3. 保存してWindowsを起動する", "F10 → 保存の確認でEnter。Windowsが起動したら、USBは安全に取り外せます。ドライバー自動インストールなどの案内が出ても、今回の確認に不要なら後回しにできます。"),
        step("4. Windowsから版を確認する", "Windowsキー + R →「msinfo32」と入力 → Enter。「システムの概要」の「BIOS バージョン/日付」に12.02が含まれることを確認します。日付は公開日と一致しない場合があります。"),
        step("5. 今回中断したC:の保護を再開する", "2ページと同じ方法で管理者のコマンド プロンプトを開きます。今回中断したドライブについて、次の2行を1行ずつ実行します。最初から非暗号化だった場合はこの操作は不要です。"),
        code("manage-bde -protectors -enable C:\nmanage-bde -status C:"),
        p("暗号化された割合が更新前と同じで、保護が有効に戻ったことを確認します。エラーなら放置せず、画面の内容を確認します。"),
        step("6. 落ちていたPython処理を再確認する", "普段落ちていた同じ入力・同じ処理を、Pコアを含む全コアで数回実行します。Eコア限定で起動する設定を使っていた場合は、そのテストの設定を解除してください。成功回数、失敗時のエラー、入力条件を記録します。いきなり長時間の最大負荷テストをする必要はありません。"),
        note("改善しない場合", "更新は劣化を引き起こす動作条件への対策です。物理的に劣化したCPUを修復するものではありません。標準設定でも同じ処理が落ちるなら、CPUの保証交換・PC修理を相談します。Eコアだけで成功する結果も相談時の材料になります。"),
    ]),
    ("07", "困ったとき・完了の確認", "症状に合うところだけ確認する", [
        step("BIOS画面に入れない", "Windowsまで起動するなら4ページの「設定 → 回復 → UEFIファームウェアの設定」を使います。F2が反応しない場合は、有線USBキーボードを背面端子へ直接接続して再試行します。"),
        step("Instant Flashにファイルが出ない", "書き込みはまだ始まっていません。キャンセルし、ROMがZIPから展開されているか、USB直下にあるか、MBR・FAT32か、型番が合っているかを確認します。別のUSB・背面USB端子も試せます。別型番のファイルを無理に選ばないでください。"),
        step("BitLocker回復キーを求められた", "画面のキーIDに対応する、保存済みの48桁の回復キーを入力します。Microsoftアカウントの一覧はスマートフォンでも開けます。キーが見つからない場合、Windowsの再インストールやドライブの初期化をせず、回復キーの所在を確認します。"),
        step("BIOSは開くがWindowsが起動しない", "まずBIOSが12.02か確認し、更新前の写真とBoot、VMD、SATA/RAIDなどを照合します。起動先は更新前と同じSSDのWindows Boot Managerにします。値が違えば元へ戻し、F10で保存します。設定を推測で何度も切り替えず、分からなければ写真をもとに確認します。"),
        step("PINでサインインできない", "サインイン画面の「サインイン オプション」から、事前に確認したパスワードなどを使います。Windowsに入れた後、画面の案内に従ってPINを再設定します。"),
        step("更新中に停止・エラー・画面が出ない", "書き込みの終了が確認できない間は、時間だけを理由に電源を切りません。別の端末で購入店・ASRockへ状況を伝えます。表示、開始からの経過時間、ファンやランプの状態を記録します。手順を確認せずCMOSクリアや古いBIOSへの書き戻しをしません。"),
        step("更新後もPythonが不規則に落ちる", "販売店またはPCメーカーへ、CPU型番、旧BIOS1.14、新BIOS12.02、標準設定での再現結果、Eコア限定では成功する結果を伝えます。箱売りCPUはIntelへも相談できます。i9-13900は2年の保証延長対象ですが、購入形態・購入日などで適用を確認します。"),
        h("完了の確認"),
        checks("BIOSが12.02になり、Windowsが起動した。", "必要な起動設定・冷却設定を確認し、Intel標準設定で動かしている。", "今回中断した暗号化の保護を再開した。", "全コアでのPython再実行結果を記録した。再現する場合は修理相談に進む。"),
    ]),
    ("08", "公式リンクと作業メモ", "必要な資料をすぐ開けるようにする", [
        p("作成・確認日：2026年10月4日。リンクはPDFでもHTMLでもクリックできます。実機と最新BIOSではメニュー名が異なる場合があります。製品のBIOS一覧にある注意書きと、更新中の実際の表示を優先してください。"),
        h("BIOSファイル・更新・設定"),
        link("bios"), link("board"), link("flash"), link("setup"), link("manual"),
        h("暗号化の確認と回復"),
        link("keys"), link("recovery"), link("encryption"), link("status"), link("protectors"),
        h("Intelの対策と保証"),
        link("intel"), link("warranty"),
        h("作業後に記入するメモ（回復キーは記入しない）"),
        p("更新日：____________________　新しいBIOS：____________________"),
        p("暗号化の保護再開：済・対象外・要確認　／　全コアでの試行回数：________"),
        p("結果・エラーの概要：________________________________________________"),
        p("____________________________________________________________________"),
        note("この手順書について", "CPU・マザーボード・BIOS・Windowsの構成は読み取りで確認しました。暗号化状態、BIOS設定、実際の書き込み可否は利用者が確認する項目です。手順書の作成中にBIOS書き込み、再起動、暗号化設定の変更は行っていません。"),
    ]),
]


def make_html():
    sections = []
    for num, title, subtitle, blocks in PAGES:
        body = []
        for block in blocks:
            kind = block[0]
            if kind == "p":
                body.append(f"<p>{block[1]}</p>")
            elif kind == "h":
                body.append(f"<h3>{block[1]}</h3>")
            elif kind == "step":
                body.append(f"<h3>{block[1]}</h3><p>{block[2]}</p>")
            elif kind == "note":
                body.append(f'<aside><strong>{block[1]}</strong><p>{block[2]}</p></aside>')
            elif kind == "code":
                body.append(f"<pre><code>{html.escape(block[1])}</code></pre>")
            elif kind == "checks":
                body.append('<ul class="checks">' + ''.join(f'<li><label><input type="checkbox"> {item}</label></li>' for item in block[1]) + '</ul>')
            elif kind == "link":
                label, url = SOURCES[block[1]]
                body.append(f'<p class="source"><a href="{html.escape(url, quote=True)}">{label}</a></p>')
        sections.append(f'<section><div class="number">{num} / 08</div><h2>{title}</h2><p class="subtitle">{subtitle}</p>{"".join(body)}</section>')
    doc = '''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>BIOS更新手順書 | B760M Pro RS/D4 WiFi</title><style>
*{box-sizing:border-box}body{margin:0;background:#edf1f5;color:#172331;font-family:"Yu Gothic","Meiryo",sans-serif;line-height:1.8}header{max-width:920px;margin:auto;padding:28px 32px 12px}header h1{font-size:25px;margin:0 0 8px}header p{margin:0;color:#4b5c6d}section{max-width:920px;margin:20px auto;padding:30px 42px;background:white;border:1px solid #d7dfe7;border-radius:12px}h2{font-size:27px;margin:4px 0 0}h3{font-size:17px;margin:20px 0 5px;color:#1c5364}p{margin:8px 0;font-size:15px}.number{font-weight:bold;letter-spacing:.1em;color:#477e8d;font-size:13px}.subtitle{color:#627382;border-bottom:1px solid #dae3e9;padding-bottom:14px;margin-bottom:18px}.checks{padding:0;list-style:none}.checks li{margin:6px 0;font-size:15px}input{accent-color:#216b7b;width:16px;height:16px;vertical-align:middle}aside{border-left:4px solid #c17b34;background:#fff7eb;padding:12px 16px;margin:14px 0}aside strong{color:#864d16}aside p{margin:4px 0 0}pre{padding:12px 14px;background:#edf4f7;border:1px solid #c8dce4;border-radius:5px;overflow:auto;line-height:1.7;font-size:14px}code{font-family:Consolas,monospace}a{color:#17647e;text-decoration:underline;overflow-wrap:anywhere}.source{font-size:14px}.print{background:#216b7b;color:white;border:0;border-radius:6px;padding:8px 14px;cursor:pointer;margin-top:10px}@media(max-width:600px){section{margin:14px 10px;padding:22px 20px}header{padding:22px 20px}h2{font-size:24px}}@media print{@page{size:A4;margin:16mm}body{background:white}header{display:none}section{padding:0;margin:0;border:0;border-radius:0;break-after:page}section:last-child{break-after:auto}p,.checks li{font-size:10pt}h2{font-size:22pt}h3{font-size:12pt}pre{font-size:9pt}aside,h3{break-inside:avoid}a{color:#17647e}}
</style></head><body><header><h1>このPCのBIOS更新手順書</h1><p>Core i9-13900 / ASRock B760M Pro RS/D4 WiFi / Windows 11 Home</p><button class="print" onclick="window.print()">印刷 / PDFに保存</button></header>'''
    return doc + ''.join(sections) + '</body></html>'


def make_pdf(destination):
    pdfmetrics.registerFont(TTFont("JP", "C:/Windows/Fonts/YuGothR.ttc", subfontIndex=0))
    pdfmetrics.registerFont(TTFont("JP-Bold", "C:/Windows/Fonts/YuGothB.ttc", subfontIndex=0))
    pdfmetrics.registerFontFamily("JP", normal="JP", bold="JP-Bold", italic="JP", boldItalic="JP-Bold")
    ink = colors.HexColor("#172331")
    teal = colors.HexColor("#216b7b")
    body = ParagraphStyle("body", fontName="JP", fontSize=9.8, leading=14.5, textColor=ink, wordWrap="CJK", spaceAfter=6)
    styles = {
        "body": body,
        "title": ParagraphStyle("title", parent=body, fontName="JP-Bold", fontSize=23, leading=29, spaceAfter=6),
        "subtitle": ParagraphStyle("subtitle", parent=body, fontSize=11, leading=16, textColor=colors.HexColor("#5b7180"), spaceAfter=15),
        "heading": ParagraphStyle("heading", parent=body, fontName="JP-Bold", fontSize=11.2, leading=16, textColor=teal, spaceBefore=7, spaceAfter=4),
        "notehead": ParagraphStyle("notehead", parent=body, fontName="JP-Bold", fontSize=10, leading=14, textColor=colors.HexColor("#87521a"), spaceAfter=4),
        "note": ParagraphStyle("note", parent=body, fontSize=9.3, leading=13.7, spaceAfter=0),
        "check": ParagraphStyle("check", parent=body, leftIndent=0, fontSize=9.4, leading=14, spaceAfter=4),
        "code": ParagraphStyle("code", fontName="Courier", fontSize=9.4, leading=14, textColor=ink, alignment=TA_LEFT, spaceAfter=0),
        "link": ParagraphStyle("link", parent=body, fontSize=9.2, leading=14, textColor=teal, spaceAfter=5),
    }
    width = A4[0] - 42 * 2
    story = []
    for page_index, (num, title, subtitle, blocks) in enumerate(PAGES):
        if page_index:
            story.append(PageBreak())
        story.append(Paragraph(f"{num}　{title}", styles["title"]))
        story.append(Paragraph(subtitle, styles["subtitle"]))
        for block in blocks:
            kind = block[0]
            if kind == "p":
                story.append(Paragraph(block[1], body))
            elif kind == "h":
                story.append(Paragraph(block[1], styles["heading"]))
            elif kind == "step":
                story.append(KeepTogether([Paragraph(block[1], styles["heading"]), Paragraph(block[2], body)]))
            elif kind == "note":
                box = Table([[Paragraph(block[1], styles["notehead"])], [Paragraph(block[2], styles["note"])]], colWidths=[width])
                box.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#fff6e8")), ("LINEBEFORE", (0,0), (0,-1), 3, colors.HexColor("#c17b34")), ("LEFTPADDING", (0,0), (-1,-1), 11), ("RIGHTPADDING", (0,0), (-1,-1), 11), ("TOPPADDING", (0,0), (-1,0), 8), ("BOTTOMPADDING", (0,-1), (-1,-1), 9)]))
                story.extend([Spacer(1, 4), box, Spacer(1, 8)])
            elif kind == "code":
                if not block[1].isascii():
                    raise ValueError("等幅フォントのコード欄はASCIIで記述してください。")
                text = html.escape(block[1]).replace("\n", "<br/>")
                box = Table([[Paragraph(text, styles["code"])]], colWidths=[width])
                box.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#edf4f7")), ("BOX", (0,0), (-1,-1), .5, colors.HexColor("#c8dce4")), ("LEFTPADDING", (0,0), (-1,-1), 11), ("RIGHTPADDING", (0,0), (-1,-1), 11), ("TOPPADDING", (0,0), (-1,-1), 8), ("BOTTOMPADDING", (0,0), (-1,-1), 8)]))
                story.extend([box, Spacer(1, 7)])
            elif kind == "checks":
                for item in block[1]:
                    story.append(Paragraph("□ " + item, styles["check"]))
            elif kind == "link":
                label, url = SOURCES[block[1]]
                story.append(Paragraph(f'<a href="{html.escape(url, quote=True)}" color="#17647e"><u>{label}</u></a>', styles["link"]))

    def furniture(canvas, doc):
        canvas.saveState()
        canvas.setFont("JP", 8)
        canvas.setFillColor(colors.HexColor("#5b7180"))
        canvas.drawString(42, A4[1] - 27, "BIOS更新手順書  |  B760M Pro RS/D4 WiFi")
        canvas.setStrokeColor(colors.HexColor("#d7dfe7"))
        canvas.line(42, A4[1] - 35, A4[0] - 42, A4[1] - 35)
        canvas.drawString(42, 25, "2026年10月4日確認  |  Core i9-13900 / Windows 11 Home")
        canvas.drawRightString(A4[0] - 42, 25, f"{doc.page} / 8")
        canvas.restoreState()

    document = SimpleDocTemplate(str(destination), pagesize=A4, leftMargin=42, rightMargin=42, topMargin=49, bottomMargin=43, title="初めてのBIOS更新手順書 - B760M Pro RS/D4 WiFi", author="Codex", subject="Core i9-13900搭載PCのBIOS更新準備、Instant Flash操作、更新後確認")
    document.build(story, onFirstPage=furniture, onLaterPages=furniture)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    html_path = OUT / (STEM + ".html")
    pdf_path = OUT / (STEM + ".pdf")
    html_path.write_text(make_html(), encoding="utf-8")
    make_pdf(pdf_path)
    print(html_path)
    print(pdf_path)
