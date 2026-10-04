"""MonoSH FX2 の設計用帯域概算。エミュレータや実機の測定ではない。"""

import argparse
import math


MASTER_HZ = 21_477_272
LINE_CLOCKS = 1364
REFRESH_CLOCKS = 40
FRAME_LINES = 262
VBLANK_LINES = 37
NORMAL_HEIGHT = 224
DMA_CLOCKS_PER_BYTE = 8


def estimate(width, height, commands, command_bytes, header_bytes, reserve_ms):
    framebuffer_bytes = width * height * 2 // 8
    packet_bytes = header_bytes + commands * command_bytes
    blank_lines = VBLANK_LINES + NORMAL_HEIGHT - height
    clocks_per_line_available = LINE_CLOCKS - REFRESH_CLOCKS
    blank_bytes = math.floor(blank_lines * clocks_per_line_available / DMA_CLOCKS_PER_BYTE)
    effective_bytes_per_ms = (
        MASTER_HZ / DMA_CLOCKS_PER_BYTE / 1000
        * clocks_per_line_available / LINE_CLOCKS
    )
    frame_ms = FRAME_LINES * LINE_CLOCKS / MASTER_HZ * 1000
    fb_dma_ms = framebuffer_bytes / effective_bytes_per_ms
    packet_dma_ms = packet_bytes / effective_bytes_per_ms
    render_ms = frame_ms - fb_dma_ms - packet_dma_ms - reserve_ms
    reserve_bytes = math.ceil(reserve_ms * effective_bytes_per_ms)
    # 描画リストの reverse DMA は表示中でも可能。ここでは同じ blank 窓へ
    # まとめる単純なスケジュールを、より厳しい条件として計算する。
    blank_margin = blank_bytes - framebuffer_bytes - packet_bytes - reserve_bytes
    return framebuffer_bytes, blank_bytes, fb_dma_ms, packet_dma_ms, render_ms, blank_margin


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--commands", type=int, default=64)
    parser.add_argument("--command-bytes", type=int, default=24)
    parser.add_argument("--header-bytes", type=int, default=32)
    parser.add_argument("--reserve-ms", type=float, default=0.3)
    args = parser.parse_args()
    if min(args.commands, args.command_bytes, args.header_bytes, args.reserve_ms) < 0:
        parser.error("各値は0以上にしてください")
    print("設計概算。DRAM refreshを控除。HDMA・設定・OAM等はreserveに含める仮定。")
    print("CPU処理とGSU処理は並行する仮定。CPU処理時間はGSU時間から引いていない。")
    print("GSUの最大時間にはclear・cache fill・flush・STOPを含む。")
    print("解像度     FB bytes  blank上限  FB DMA ms  list DMA ms  GSU最大ms  blank余裕bytes")
    for width, height in ((256, 224), (256, 192), (224, 192), (256, 176), (256, 160), (256, 128)):
        values = estimate(width, height, args.commands, args.command_bytes, args.header_bytes, args.reserve_ms)
        fb, blank, fb_ms, packet_ms, render_ms, margin = values
        print(f"{width}x{height:<3}  {fb:>8}  {blank:>9}  {fb_ms:>9.3f}  {packet_ms:>11.3f}  {render_ms:>9.3f}  {margin:>14}")
    print("blank余裕が負なら、この全転送＋リスト転送スケジュールは成立しない。")
    print("256x176はGSU高さ192の格納領域から列ごとに転送するため、設定費用を別途要計測。")


if __name__ == "__main__":
    main()
