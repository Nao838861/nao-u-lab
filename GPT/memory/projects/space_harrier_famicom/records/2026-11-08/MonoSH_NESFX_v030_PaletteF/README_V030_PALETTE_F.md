# v030 Palette F preview

F is the original 12-option comparison's pure-green series: shadow $1A, horizontal bands $2A, highlights $3A. The comparison's author verified both the generation script and actual F tile pixels. The original mapping was $09 -> $1A, $19 -> $2A, $29 -> $3A.

This independent build changes only 14 palette bytes from v029 PaletteD. Purple sky, gray, and opaque native NES player colors are unchanged. Tree/enemy shared greens change consistently. All other ROM bytes and the runtime DLL remain identical; no fine-depth or scenery work is merged.

Video: results/palette_f/v030_palette_F_preview.mp4

D and F use the same controller input script. All fields at all 600 captured scene boundaries are identical, including cameras, objects, phase, and timing counters. The MP4 contains 1199 decoded frames (about 20 seconds) with non-silent audio, maximum -21.1 dB. Visual inspection at 7, 12, and 17 seconds confirms the selected greens and object silhouettes. This is a dedicated-Mesen visual preview using the original SELECT invincibility option, not a full-stage or hardware test.

Only the MP4 was saved to Space. No ROM or ZIP was uploaded. Existing versions, original ROM, SD, and RBF are unchanged; the independent local build is retained for reproduction. Library identity is recorded in results/video_library_identity.json because the official xattr helper does not support Windows os.setxattr.
