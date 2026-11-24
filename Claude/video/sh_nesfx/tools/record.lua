-- Replay an input list from power-on and record: one PNG per frame, audio register writes with CPU cycle, per-frame info.
-- Lua only supplies pad input and reads memory/screen; no game state is written. Params (@...@) from tools/record.py
local out = @OUTDIR@
local MAXF, PNG = @MAXF@, @PNG@
local inputs = {}
for l in io.lines(@INPUTS@) do inputs[#inputs + 1] = tonumber(l) end
local A, B, SEL, STA, UP, DN, LF, RT = 1, 2, 4, 8, 16, 32, 64, 128
local frame = 0
local alog = assert(io.open(out .. '/apu.txt', 'w'))
local flog = assert(io.open(out .. '/frames.jsonl', 'w'))
local key
local function cyc()
  local s = emu.getState()
  if not key then
    for _, k in ipairs({'cpu.cycleCount', 'nes.cpu.cycleCount', 'masterClock'}) do if s[k] then key = k break end end
    alog:write('# key ', tostring(key), '\n')
  end
  return s[key]
end
local function onwrite(addr, value) alog:write(string.format('%d %04X %02X\n', cyc(), addr, value)) end
emu.addMemoryCallback(onwrite, emu.callbackType.write, 0x4000, 0x4017)
emu.addMemoryCallback(onwrite, emu.callbackType.write, 0x5000, 0x5015)
emu.addEventCallback(function()
  local m = inputs[frame + 1] or 0
  emu.setInput({a = m & A ~= 0, b = m & B ~= 0, select = m & SEL ~= 0, start = m & STA ~= 0,
                up = m & UP ~= 0, down = m & DN ~= 0, left = m & LF ~= 0, right = m & RT ~= 0}, 0)
end, emu.eventType.inputPolled)
emu.addEventCallback(function()
  frame = frame + 1
  local t = emu.read(5, emu.memType.nesSpriteRam)
  flog:write(string.format('{"f":%d,"c":%d,"tile":%d,"px":%d,"py":%d}\n', frame, cyc(), t,
    emu.read(7, emu.memType.nesSpriteRam), emu.read(4, emu.memType.nesSpriteRam)))
  if PNG then
    local p = assert(io.open(string.format('%s/png/%05d.png', out, frame), 'wb')); p:write(emu.takeScreenshot()); p:close()
  end
  if frame >= MAXF then alog:close(); flog:close(); emu.stop(0) end
end, emu.eventType.endFrame)
