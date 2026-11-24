-- Replay committed inputs from power-on, then drive an autopilot until CHUNK frames pass or the player dies.
-- The autopilot aims at objects it sees on screen (pixels that are not sky/ground) and keeps firing.
-- It is meant to look like a person playing: delayed reactions, held directions, a dead zone near the target,
-- and re-aiming only every 0.3-0.6 s (dodges react faster).
-- Lua only supplies pad input and reads memory/screen; no game state is written. Params (@...@) from tools/autopilot.py
local out = @OUTDIR@
local START, STOP, START_AT = @START@, @STOP@, @START_AT@
math.randomseed(@SEED@)
local P = @PARAMS@
local committed = {}
for l in io.lines(@INPUTS@) do committed[#committed + 1] = tonumber(l) end
local A, B, SEL, STA, UP, DN, LF, RT = 1, 2, 4, 8, 16, 32, 64, 128
local SKY = 0xC676FF
local RED = 0xB53120
local BG = {[0x5CE430] = true, [0x388700] = true, [0xCFEF96] = true, [SKY] = true}
local frame = 0
local mine = {}
local tx, ty, wander_x, wander_y = 128, 120, 128, 120
local death = -1
local dodge = 0
local want = {}            -- target decided by scan(), applied after a reaction delay: {at=frame, x=, y=}
local retarget = 0         -- next frame at which a new aim target may be taken
local dirx, diry, holdx, holdy = 0, 0, 0, 0

local function player()
  return emu.read(7, emu.memType.nesSpriteRam) + 16, emu.read(4, emu.memType.nesSpriteRam) + 24
end

local function scan()
  local buf = emu.getScreenBuffer()
  local px, py = player()
  -- horizon: first row (step 4) where the left/right edge pixels are not sky
  local hz = 200
  for y = 8, 220, 4 do
    if (buf[y * 256 + 1] & 0xFFFFFF) ~= SKY and (buf[y * 256 + 256] & 0xFFFFFF) ~= SKY then hz = y; break end
  end
  local bins, sumy, near, red_near = {}, {}, 0, 0
  local left_mass, right_mass, up_mass, down_mass = 0, 0, 0, 0
  for y = 0, 200, 2 do
    if y < hz - P.mtn or y > hz + 4 then
      local row = y * 256
      for x = 0, 255, 2 do
        if not (x > px - 18 and x < px + 18 and y > py - 26 and y < py + 26) then
          local c = buf[row + x + 1] & 0xFFFFFF
          if not BG[c] then
            local close = math.abs(x - px) < P.zone_x and math.abs(y - py) < P.zone_y
            if c == RED then
              if close then red_near = red_near + 1 end
            else
              local b = x // 16
              bins[b] = (bins[b] or 0) + 1; sumy[b] = (sumy[b] or 0) + y
              if close then near = near + 1 end
            end
            if close then
              if x < px then left_mass = left_mass + 1 else right_mass = right_mass + 1 end
              if y < py then up_mass = up_mass + 1 else down_mass = down_mass + 1 end
            end
          end
        end
      end
    end
  end
  if near > P.near_th or red_near > P.red_th then
    -- something big (close) or a red shot next to the player: step away from the side where it is
    local dx = (left_mass > right_mass) and 1 or -1
    local dy = (up_mass > down_mass) and 1 or -1
    -- on retries, sometimes pick the other way so attempts do not all repeat the same escape
    if P.retry > 0 and math.random() < 0.3 then dx = -dx end
    if P.retry > 0 and math.random() < 0.3 then dy = -dy end
    -- never run into a screen edge: turn back toward the middle instead
    if px + dx * 70 < 40 or px + dx * 70 > 216 then dx = -dx end
    if py + dy * 50 < P.ty_min or py + dy * 50 > P.ty_max then dy = -dy end
    if dodge == 0 then
      want = {at = frame + math.random(4, 8), x = math.max(32, math.min(224, px + dx * 80)), y = math.max(P.ty_min, math.min(P.ty_max, py + dy * 50))}
      retarget = frame + math.random(20, 36)
    end
    dodge = P.dodge
    return
  end
  if dodge > 0 or frame < retarget then return end
  local best, bb = P.minpix, nil
  for b, n in pairs(bins) do
    local s = n + (bins[b - 1] or 0) * 0.5 + (bins[b + 1] or 0) * 0.5
    if s > best and s < P.far_max then best = s; bb = b end
  end
  local nx, ny
  if bb then
    nx = bb * 16 + 8; ny = sumy[bb] // bins[bb] + P.aim_dy
  else
    nx, ny = wander_x, wander_y
  end
  -- aim is never pixel perfect; the error is chosen once per target, not every frame
  local J = P.jit + 8 * P.retry
  nx = nx + math.random(-J, J); ny = math.max(P.ty_min, math.min(P.ty_max, ny + math.random(-J, J)))
  want = {at = frame + math.random(8, 14), x = nx, y = ny}
  retarget = frame + math.random(18, 36)
end

emu.addEventCallback(function()
  local m = 0
  if frame < START then
    m = committed[frame + 1] or 0
  elseif frame >= START_AT then
    if frame % P.repick == 0 then wander_x = math.random(50, 206); wander_y = math.random(70, 180) end
    if dodge > 0 then dodge = dodge - 1 end
    if frame % 2 == 0 then scan() end
    if want.at and frame >= want.at then tx, ty = want.x, want.y; want = {} end
    m = A
    local x, y = player()
    -- dead zone with hysteresis, and a minimum time a direction stays held (no frame-by-frame twitching)
    local function axis(d, cur, hold)
      local need = (cur == 0) and P.dead or 3
      local nd = (d > need) and 1 or (d < -need) and -1 or 0
      if nd ~= cur and hold <= 0 then return nd, P.hold + math.random(0, 4) end
      return cur, hold - 1
    end
    dirx, holdx = axis(tx - x, dirx, holdx)
    diry, holdy = axis(ty - y, diry, holdy)
    if dirx > 0 then m = m | RT elseif dirx < 0 then m = m | LF end
    if diry > 0 then m = m | UP elseif diry < 0 then m = m | DN end  -- up = descend, down = climb
  end
  mine[frame + 1] = m
  emu.setInput({a = m & A ~= 0, b = m & B ~= 0, select = m & SEL ~= 0, start = m & STA ~= 0,
                up = m & UP ~= 0, down = m & DN ~= 0, left = m & LF ~= 0, right = m & RT ~= 0}, 0)
end, emu.eventType.inputPolled)

local function finish()
  local f = assert(io.open(out .. '/attempt.txt', 'w'))
  f:write(tostring(death), '\n')
  for i = 1, frame do f:write(tostring(mine[i] or 0), '\n') end
  f:close(); emu.stop(0)
end

emu.addEventCallback(function()
  frame = frame + 1
  if frame > math.max(START, START_AT) and emu.read(5, emu.memType.nesSpriteRam) == 113 then death = frame; finish() return end
  if frame >= STOP then finish() end
end, emu.eventType.endFrame)
