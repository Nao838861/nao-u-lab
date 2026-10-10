#!/bin/sh
# Record every gameplay clip used by part 2 and encode it to public/video/*.mp4 (256x180 -> 512x360 nearest).
# Usage: SCRATCH=<dir with venv/, roms/, bin/, MonoSH_FX2/> sh tools/record_all.sh
set -e
cd "$(dirname "$0")/.."
S=${SCRATCH:?set SCRATCH}
PY=$S/venv/bin/python
R=$S/rec_out
LBL=$S/MonoSH_FX2/build/game_v001/game.lbl
mkdir -p public/video
rec() { # $1 name, rest: rec_mac args
  n=$1; shift
  if [ -f "$R/$n/summary.json" ] && grep -q '"exit": 0' "$R/$n/summary.json"; then echo "skip $n"; else $PY tools/rec_mac.py --out $R/$n "$@"; fi
}
enc() { # $1 rec dir, $2 output name
  "$S/bin/ffmpeg_full" -y -loglevel error -f rawvideo -pix_fmt rgb24 -s 256x239 -framerate 60 -i "$R/$1/frames.rgb" \
    -vf "crop=256:180:0:29,scale=512:360:flags=neighbor" -c:v libx264 -crf 14 -pix_fmt yuv420p "public/video/$2.mp4"
}
rec color --rom $S/roms/main_color.sfc --labels $LBL --fields 9000
enc color color
rec mono --rom $S/roms/main_color.sfc --labels $LBL --fields 9000 --mono
enc mono mono
rec gsu_color --rom $S/roms/main_color.sfc --mode replay --inputs $R/color/inputs.txt --fields 3000 --hide bg1,bg3,bg4,obj
enc gsu_color gsu_color
rec fourbpp --rom $S/roms/fourbpp30.sfc --mode replay --inputs $R/color/inputs.txt --fields 9000
enc fourbpp fourbpp
rec sa1 --rom $S/roms/sa1.sfc --mode replay --inputs $R/color/inputs.txt --fields 6000
enc sa1 sa1
echo ALL_DONE
