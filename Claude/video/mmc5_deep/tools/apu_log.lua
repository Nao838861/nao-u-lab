-- タイトルから DRIFT を開始し、GO 以降はリプレイの入力列を流す。音源レジスターへの書き込みを記録する（ゲームのメモリには書き込まない）
local dir = os.getenv('APU_DIR')
local inputs = assert(io.open(dir .. '/drift1_inputs.bin', 'rb')):read('a')
local log = assert(io.open(dir .. '/apu_writes.csv', 'w'))
log:write('frame,cycle,addr,value,scene\n')
local frame, race, done = 0, -1, -1
local function scene() return emu.read(0x6720, emu.memType.nesMemory) end
local function onwrite(addr, value)
  local s = emu.getState()
  log:write(frame .. ',' .. s['cpu.cycleCount'] .. ',' .. addr .. ',' .. value .. ',' .. scene() .. '\n')
end
emu.addMemoryCallback(onwrite, emu.callbackType.write, 0x4000, 0x4017)
emu.addMemoryCallback(onwrite, emu.callbackType.write, 0x5000, 0x5015)
local bits = {'a', 'b', 'select', 'start', 'up', 'down', 'left', 'right'}
emu.addEventCallback(function()
  local k = {}
  if race < 0 then
    if frame > 180 and frame < 184 then k.start = true end
  else
    local i = frame - race + 1
    if i <= #inputs then
      local m = inputs:byte(i)
      for b = 0, 7 do if (m >> b) & 1 == 1 then k[bits[b + 1]] = true end end
    end
  end
  emu.setInput(k, 0)
end, emu.eventType.inputPolled)
emu.addEventCallback(function()
  frame = frame + 1
  local s = scene()
  if race < 0 and s == 1 then race = frame end
  if race >= 0 and s == 2 and done < 0 then done = frame; log:write('# goal at race frame ' .. (frame - race) .. ' tick ' .. (emu.read(0x6726, emu.memType.nesMemory) + 256 * emu.read(0x6727, emu.memType.nesMemory)) .. '\n') end
  if (done > 0 and frame > done + 420) or frame > 4000 then log:close(); emu.stop(0) end
end, emu.eventType.endFrame)
