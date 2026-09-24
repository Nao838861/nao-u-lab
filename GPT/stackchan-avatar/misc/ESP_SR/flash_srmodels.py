# scripts/flash_srmodels.py
Import("env")
import csv
import os
import subprocess


def find_partition_offset(csv_path, name_candidates=("model", "srmodels", "esp_sr")):
    with open(csv_path, newline="") as f:
        rows = csv.reader(f)
        for row in rows:
            if not row or row[0].strip().startswith("#"):
                continue
            # CSV: Name, Type, SubType, Offset, Size, Flags
            name = row[0].strip()
            if name in name_candidates:
                off = row[3].strip()
                if not off:
                    raise RuntimeError("Partition offset is empty; please set explicit Offset in CSV.")
                return int(off, 0)
    raise RuntimeError(f"Model partition not found in {csv_path}. Expected one of {name_candidates}.")

def after_upload(source, target, env):
    proj = env["PROJECT_DIR"]
    csv_path = os.path.join(proj, env.BoardConfig().get("build.partitions", "partitions.csv"))
    chip = env.BoardConfig().get("build.mcu", "esp32s3")  # CoreS3ならesp32s3想定
    srmodels = os.path.join("misc" , "ESP_SR", "srmodels_only_histackchan.bin")

    if not os.path.exists(srmodels):
        raise RuntimeError(f"srmodels.bin not found: {srmodels}")

    offset = find_partition_offset(csv_path)

    port = env.subst("$UPLOAD_PORT")
    speed = env.subst("$UPLOAD_SPEED")
    # pioarduinoはesptool.pyの固定配置ではなく専用venvの実行ファイルを使う。
    # メイン書き込みと同じUPLOADERを使い、空白を含むパスも引数配列で渡す。
    uploader = env.subst("$UPLOADER").strip('"')
    cmd = [uploader]
    if uploader.endswith(".py"):
        cmd.insert(0, env.subst("$PYTHONEXE").strip('"'))
    cmd.extend([
        "--chip", chip, "--port", port, "--baud", speed,
        "write-flash", hex(offset), os.path.join(proj, srmodels),
    ])
    print("Flashing srmodels:", subprocess.list2cmdline(cmd))
    subprocess.run(cmd, check=True)

env.AddPostAction("upload", after_upload)
