; 敵・弾ともに座標は1/16画素。画面外で桁が戻る前に退場させる。
.macpack longbranch
.import _bit_x,_bit_y,_shield_w,_shield_h,_orb_phase
.import _px,_py,_fx,_fy,_bit_owned,_deflected,_die,_tick,_camera
.import _bullets,_bullet_x,_bullet_y,_enemy_live,_explosion
.import _enemy_x,_enemy_y,_origin_y,_posx,_posy,_age,_route,_floor_px
.import _mob_fire,_force_impact,_scroll_delta,_drop
.export _move_mobs,_move_bullets
.segment "ZEROPAGE"
actor_i: .res 1
offset_i: .res 1
cx: .res 1
cy: .res 1
temp: .res 1
age_lo: .res 1
vlow: .res 1
.segment "ACTORS"
; Diff in pixels without unsigned wrap at opposite edges.
.macro outside lhs,rhs,offset,radius,label
 lda rhs
 .if offset>0
 clc
 adc #offset
 .elseif offset<0
 sec
 sbc #(-offset)
 .endif
 sec
 sbc lhs
 bcs :+
 eor #$ff
 adc #1
: cmp #radius+1
 bcs label
.endmacro
.macro velocity axis,delta
 lda _bullets+delta,x
 bpl :+
 dec _bullets+axis+1,x
: clc
 adc _bullets+axis,x
 sta _bullets+axis,x
 bcc :+
 inc _bullets+axis+1,x
:
.endmacro
.macro to_pixel base,reg
 lda base+1,reg
 asl
 asl
 asl
 asl
 sta temp
 lda base,reg
 lsr
 lsr
 lsr
 lsr
 ora temp
.endmacro
_move_bullets:
 ldx #0
 stx actor_i
@loop:
 lda _bullets+6,x
 jeq @next
 dec _bullets+6,x
 lda _boss_active
 beq @ballistic
 lda _bullets+5,x
 eor #128
 sta temp
 ldy actor_i
 lda _terminal_dy,y
 eor #128
 cmp temp
 beq @ballistic
 bcc @bend_up
 inc _bullets+5,x
 jmp @ballistic
@bend_up: dec _bullets+5,x
@ballistic:
 velocity 0,4
 velocity 2,5
 lda _bullets+1,x
 cmp #16
 jcs @remove
 lda _bullets+3,x
 jeq @remove
 cmp #14
 jcs @remove
 ldy actor_i
 to_pixel _bullets,x
 sta _bullet_x,y
 sta cx
 to_pixel _bullets+2,x
 sta _bullet_y,y
 sta cy
 jsr touches_force
 bcc @bit
 jmp @absorbed
@bit:
 lda _bit_owned
 beq @ship
 outside cx,_bit_x,0,5,@ship
 outside cy,_bit_y,0,6,@ship
@absorbed:
 inc _deflected
 bne @remove
@ship:
 outside cx,_px,10,5,@next
 outside cy,_py,0,3,@next
 stx offset_i
 lda #2
 jsr _die
 ldx offset_i
@remove:
 lda #0
 sta _bullets+6,x
@next:
 txa
 clc
 adc #7
 tax
 inc actor_i
 cpx #42
 jne @loop
 rts

.macro subtract_step base
 sta vlow
 lda base,x
 sec
 sbc vlow
 sta base,x
 bcs :+
 dec base+1,x
:
.endmacro
.macro rise_step base
 clc
 adc base,x
 sta base,x
 bcc :+
 inc base+1,x
:
.endmacro
.macro set_fixed base
 sta temp
 asl
 asl
 asl
 asl
 sta base,x
 lda temp
 lsr
 lsr
 lsr
 lsr
 sta base+1,x
.endmacro
; Each live slot keeps its own phase. POW units follow the camera; flyers
; continue to move independently after their spawn column has passed.
_move_mobs:
 ldy #0
@next_slot:
 sty actor_i
 lda _explosion,y
 beq @living
 sec
 sbc #1
 sta _explosion,y
 jmp @next
@living:
 lda _enemy_live,y
 jeq @next
 tya
 asl
 tax
 lda _age,x
 sta age_lo
 inc _age,x
 bne :+
 inc _age+1,x
: lda _enemy_live,y
 cmp #5
 jeq @walker
 cmp #8
 jeq @scout
 cmp #3
 jeq @fly
 cmp #2
 jeq @pod
 cmp #4
 jeq @dart
 ; Floor carriers follow the passing terrain. Static guns have their own slots.
 lda _scroll_delta
 asl
 asl
 asl
 asl
 sta temp
 lda _drop,y
 cmp #3
 bne :+
 lda _age+1,x
 bne :+
 lda age_lo
 cmp #24
 bcc :+
 cmp #96
 bcs :+
 lda temp
 clc
 adc #5
 sta temp
: lda temp
 subtract_step _posx
 jmp @coords
@ground:
 lda age_lo
 and #7
 beq :+
 lda #5
 bne :++
: lda #4
:
 subtract_step _posx
 jmp @coords
@fly:
 lda age_lo
 cmp #62
 bne :+
 jsr @fire
: ldy age_lo
 cpy #77
 bcc :+
 ldy #76
: lda fly_dy,y
 rise_step _posy
 lda fly_dx,y
 jmp @world_step
@pod:
 lda _route,y
 cmp #10
 beq @gate
 lda age_lo
 and #127
 tay
 lda pod_height,y
 ldy actor_i
 clc
 adc _origin_y,y
 set_fixed _posy
 lda age_lo
 cmp #2
 jcc @coords
 and #1
 clc
 adc #19
 bne @world_step
@gate:
 ldy age_lo
 lda _age+1,x
 bne @released
 cpy #48
 bcs @released
 lda gate_height,y
 ldy actor_i
 clc
 adc _origin_y,y
 set_fixed _posy
 lda #0
 beq @world_step
@released:
 lda #20
 bne @world_step
@dart:
 lda age_lo
 cmp #33
 bne :+
 jsr @fire
: ldy age_lo
@phase:
 cpy #80
 bcc :+
 tya
 sec
 sbc #80
 tay
 bcs @phase
: lda dart_height,y
 ldy actor_i
 clc
 adc _origin_y,y
 set_fixed _posy
 lda age_lo
 jeq @coords
 lda #19
 bne @world_step
@scout:
 lda #9
@world_step:
 sta temp
 lda _scroll_delta
 asl
 asl
 asl
 asl
 clc
 adc temp
 subtract_step _posx
 jmp @coords
; The shoulder track in art/actor-tracks.csv changes speed around source
; frames 1373 and 1417, then leaves the floor around frame 1461.
@walker:
 lda _route,y
 cmp #9
 bne @walk_ground
 lda #12
 rise_step _posy
 lda #0
 jmp @world_step
@walk_ground:
 lda _age+1,x
 bne @lift
 lda age_lo
 cmp #120
 bne :+
 jsr @fire
: lda age_lo
 cmp #116
 jcc @ground
 cmp #204
 jcs @ground
 lda age_lo
 and #3
 beq :+
 lda #15
 bne :++
: lda #14
:
 subtract_step _posx
 jmp @coords
@lift:
 cmp #1
 bne @leave
 lda age_lo
 cmp #10
 beq :+
 cmp #64
 bne :++
: jsr @fire
: lda age_lo
 cmp #36
 jcc @ground
 cmp #116
 bcc :+
 cmp #156
 bcs @leave
 jmp @coords
:
 lda age_lo
 and #1
 clc
 adc #12
 subtract_step _posy
 jmp @coords
@leave:
 lda #18
 subtract_step _posx
@coords:
 lda _posx+1,x
 cmp #16
 jcs @gone
 to_pixel _posx,x
 cmp #8
 jcc @gone
 sta cx
 lda _posy+1,x
 cmp #14
 jcs @gone
 to_pixel _posy,x
 cmp #16
 jcc @gone
 sta cy
 ldy actor_i
 lda _enemy_live,y
 cmp #1
 beq @floor
 cmp #8
 beq @floor
 cmp #5
 jne @locate
 lda _age+1,x
 beq @floor
 cmp #1
 jne @locate
 lda age_lo
 cmp #36
 jcs @locate
@floor:
 lda cx
 clc
 adc _camera
 sta temp
 lda _camera+1
 adc #0
 lsr
 ror temp
 lsr
 ror temp
 ldy temp
 cmp #0
 beq :+
 lda _floor_px+256,y
 jmp :++
: lda _floor_px,y
: ldy actor_i
 sec
 sbc #8
 sta cy
 lda _enemy_live,y
 cmp #8
 bne @large_floor
 lda cy
 sec
 sbc #7
 sta cy
 ; Walk off a ledge at a finite downward speed before settling on the next floor.
 to_pixel _posy,x
 clc
 adc #2
 cmp cy
 bcs @snap
 sta cy
 jmp @snap
@large_floor:
 cmp #5
 bne @snap
 lda cy
 sec
 sbc #14
 sta cy
 lda _route,y
 cmp #9
 bne @snap
 to_pixel _posy,x
 cmp cy
 bcs @land
 sta cy
 jmp @locate
@land:
 lda #5
 sta _route,y
 lda #32
 sta _age,x
@snap: lda cy
 set_fixed _posy
@locate:
 lda cx
 sec
 sbc #8
 sta _enemy_x,y
 lda cy
 sec
 sbc #8
 sta _enemy_y,y
 outside cx,_px,11,8,@force
 outside cy,_py,0,7,@force
 lda #3
 jsr _die
@force:
 lda _tick
 and #7
 bne @next
 jsr touches_force
 bcc @next
 lda actor_i
 jsr _force_impact
 jmp @next
@gone:
 ldy actor_i
 lda #0
 sta _enemy_live,y
@next:
 ldy actor_i
 iny
 cpy #10
 jne @next_slot
 rts
@fire:
 txa
 pha
 lda actor_i
 jsr _mob_fire
 pla
 tax
 ldy actor_i
 rts


.include "build/sprite.inc"
.include "build/mount-count.inc"
.import _oam_index,_spr_x,_spr_y,_spr_id,_spr_pal
.export _single_sprite,_draw_bullets
_single_sprite:
 ldx _oam_index
 cpx #248
 bcs @full
 lda _spr_x
 sta $203,x
 lda _spr_y
 sec
 sbc #1
 sta $200,x
 lda _spr_id
 sta $201,x
 lda _spr_pal
 sta $202,x
 txa
 clc
 adc #4
 sta _oam_index
@full: rts
_draw_bullets:
 ldx _oam_index
 .repeat 6,I
 lda _bullets+7*I+6
 beq :+
 cpx #248
 jcs @full
 lda _bullet_x+I
 cmp #2
 bcc :+
 sbc #2
 sta $203,x
 lda _bullet_y+I
 sec
 sbc #4
 sta $200,x
 lda #PELLET
 sta $201,x
 lda #1
 sta $202,x
 inx
 inx
 inx
 inx
:
 .endrepeat
@full: stx _oam_index
 rts
.import _bolts,_ceiling_px,_cannon_hit,_cannon_strength
.export _move_bolts
.segment "ZEROPAGE"
bolt_index: .res 1
victim: .res 1
radius: .res 1
.segment "ACTORS"
; Test the gun before the hull: its muzzle can project into a wall cell.
bolt_ordinal: .byte 0,0,0,1,1,1,2,2,2,3
_move_bolts:
 ldx #0
@bolt:
 stx bolt_index
 lda _bolts+2,x
 jeq @next
 cmp #5
 beq @ordinary
 cmp #2
 bcc @ordinary
 ldy bolt_ordinal,x
 lda _bolt_travel,y
 cmp #4
 bcs :+
 adc #1
 sta _bolt_travel,y
: lda _bolts,x
 clc
 adc #6
 jmp @front
@ordinary:
 lda _bolts,x
 clc
 adc #4
@front:
 jcs @remove
 cmp #252
 jcs @remove
 sta cx
 sta _bolts,x
 jsr bolt_gun
 bcc :+
 lda _bolts+2,x
 cmp #5
 jeq @remove
 cmp #3
 jcc @remove
: lda cx
 clc
 adc _camera
 sta temp
 lda _camera+1
 adc #0
 lsr
 ror temp
 lsr
 ror temp
 ldy temp
 cmp #0
 bne @far
 lda _bolts+1,x
 cmp _ceiling_px,y
 jcc @remove
 cmp _floor_px,y
 jcs @remove
 jmp @test
@far:
 lda _bolts+1,x
 cmp _ceiling_px+256,y
 jcc @remove
 cmp _floor_px+256,y
 jcs @remove
@test:
 sta cy
 lda _bolts+2,x
 cmp #5
 beq @small
 cmp #2
 bcs @charged
@small: lda #11
 bne @radius
@charged: lda #16
@radius: sta radius
 ldy #9
@enemy:
 lda _enemy_live,y
 beq @advance
 lda _enemy_x,y
 clc
 adc #8
 sec
 sbc cx
 bcs :+
 eor #255
 adc #1
: cmp radius
 bcs @advance
 lda _enemy_y,y
 clc
 adc #8
 sec
 sbc cy
 bcs :+
 eor #255
 adc #1
: clc
 adc #3
 cmp radius
 bcs @advance
 sty victim
 lda _bolts+2,x
 cmp #5
 bne :+
 lda #1
: sta _cannon_strength
 tya
 jsr _cannon_hit
 ldx bolt_index
 ldy victim
 lda _bolts+2,x
 cmp #5
 beq @remove
 cmp #3
 bcc @remove
 lda _enemy_live,y
 bne @remove
@advance:
 dey
 bpl @enemy
 jmp @next
@remove:
 lda #0
 sta _bolts+2,x
@next:
 ldx bolt_index
 inx
 inx
 inx
 cpx #12
 jne @bolt
 rts

.import _force_level
.import _banking,_force_phase,_bit_phase,_force_frames,_bit_frames,_drill
.export _draw_player
.segment "ZEROPAGE"
parts_ptr: .res 2
base_x: .res 1
base_y: .res 1
.segment "ACTORS"
.include "build/player-poses.inc"
small_frames: .byte 0,0,0,0,1,1,2,2,2,2,3,3,3,3,4,4,5,5,5,5,6,6,6,6,7,7
_draw_player:
 ldx _oam_index
 lda _px
 sta base_x
 lda _py
 sec
 sbc #9
 sta base_y
 ldy _banking
 lda ship_lo,y
 sta parts_ptr
 lda ship_hi,y
 sta parts_ptr+1
 jsr emit_parts
 lda _drill
 bne @full_force
 lda _force_level
 cmp #3
 bcs @full_force
 lda _fx
 clc
 adc #4
 sta base_x
 lda _fy
 sec
 sbc #9
 sta base_y
 ldy _orb_phase
 lda small_frames,y
 tay
 lda _force_level
 cmp #2
 beq @middle
 lda small_lo,y
 sta parts_ptr
 lda small_hi,y
 jmp @force_pointer
@middle:
 lda middle_lo,y
 sta parts_ptr
 lda middle_hi,y
 jmp @force_pointer
@full_force:
 lda _fx
 sta base_x
 lda _fy
 sec
 sbc #13
 sta base_y
 ldy _force_phase
 lda _force_frames,y
 tay
 lda force_lo,y
 sta parts_ptr
 lda force_hi,y
@force_pointer: sta parts_ptr+1
 jsr emit_parts
 lda _bit_owned
 ora _drill
 beq @done
 lda _bit_x
 sec
 sbc #6
 sta base_x
 lda _bit_y
 sec
 sbc #8
 sta base_y
 ldy _bit_phase
 lda _bit_frames,y
 tay
 lda bit_lo,y
 sta parts_ptr
 lda bit_hi,y
 sta parts_ptr+1
 jsr emit_parts
@done: stx _oam_index
 rts
emit_parts:
 ldy #0
@tile:
 cpx #248
 bcs @end
 lda (parts_ptr),y
 bmi @end
 clc
 adc base_y
 sta $200,x
 iny
 lda (parts_ptr),y
 sta $201,x
 iny
 lda (parts_ptr),y
 sta $202,x
 iny
 lda (parts_ptr),y
 clc
 adc base_x
 sta $203,x
 iny
 inx
 inx
 inx
 inx
 bne @tile
@end: rts

.import gun_wlo,gun_whi,_gun_height,gun_upper,gun_lower
.import _gun_screen,_gun_dead,_gun_live,_gun_timer,_gun_fire
.import kill_mount
.export _move_guns,_draw_guns
.segment "ZEROPAGE"
gun_i: .res 1
gun_first: .res 1
gun_end: .res 1
.segment "ACTORS"
_move_guns:
 ldx gun_first
@retire:
 cpx gun_end
 bcs @admit
 lda gun_wlo,x
 sec
 sbc _camera
 sta temp
 lda gun_whi,x
 sbc _camera+1
 bmi @gone
 lda temp
 cmp #4
 bcs @admit
@gone:
 lda #0
 sta _gun_live,x
 inx
 stx gun_first
 bne @retire
@admit:
 ldx gun_end
 cpx #MOUNT_COUNT
 bcs @visible
 lda gun_wlo,x
 sec
 sbc _camera
 sta temp
 lda gun_whi,x
 sbc _camera+1
 bne @visible
 lda temp
 cmp #253
 bcs @visible
 inc gun_end
 bne @admit
@visible:
 ldx gun_first
@loop:
 cpx gun_end
 bcc :+
 rts
: lda gun_wlo,x
 sec
 sbc _camera
 sta _gun_screen,x
 lda _gun_dead,x
 beq @active
 cmp #1
 jeq @next
 dec _gun_dead,x
 jne @next
@active:
 lda _gun_live,x
 bne @aim
 inc _gun_live,x
 lda #48
 sta _gun_timer,x
@aim:
 dec _gun_timer,x
 bne @touch
 lda #154
 sta _gun_timer,x
 stx gun_i
 txa
 jsr _gun_fire
 ldx gun_i
@touch:
 lda _gun_screen,x
 sta cx
 lda _gun_height,x
 sta cy
 outside cx,_px,10,7,@shield
 outside cy,_py,0,5,@shield
 stx gun_i
 lda #3
 jsr _die
 ldx gun_i
@shield:
 jsr touches_force
 bcc @next
 jsr kill_mount
 jmp @next
@next:
 inx
 jmp @loop
.include "mount_draw.inc"
.segment "ACTORS"
bolt_gun:
 lda _bolts+1,x
 cmp #80
 bcc @index
 cmp #164
 bcc @none
@index:
 lda cx
 clc
 adc _camera
 sta temp
 lda _camera+1
 adc #0
 lsr
 ror temp
 lsr
 ror temp
 lsr
 ror temp
 ldy temp
 lda _bolts+1,x
 cmp #100
 bcs @bottom
 lda gun_upper,y
 jmp @found
@bottom: lda gun_lower,y
@found: tay
 beq @none
 dey
 lda _gun_live,y
 beq @none
 lda _gun_dead,y
 bne @none
 lda _gun_height,y
 sec
 sbc _bolts+1,x
 bcs :+
 eor #255
 adc #1
: cmp #7
 bcs @none
 lda _gun_screen,y
 sec
 sbc cx
 bcs :+
 eor #255
 adc #1
: cmp #7
 bcs @none
 txa
 pha
 tya
 tax
 jsr kill_mount
 pla
 tax
 sec
 rts
@none: clc
 rts

.export _draw_mobs
.segment "ZEROPAGE"
mob_start: .res 1
mob_remaining: .res 1
mob_limit: .res 1
.segment "ACTORS"
_draw_mobs:
 ldx _oam_index
 cpx #248
 jcs @done
 lda _tick
 and #1
 beq :+
 lda #152                    ; leave 24 OAM slots for the R-9 and its equipment
 bne :++
: lda #248
: sta mob_limit
 ldy mob_start
 iny
 cpy #10
 bcc :+
 ldy #0
: sty mob_start
 lda #10
 sta mob_remaining
@mob:
 cpx mob_limit
 jcs @done
 sty actor_i
 lda _explosion,y
 beq @live
 cpx #240
 jcs @done
 lda _enemy_x,y
 sta $203,x
 clc
 adc #6
 sta $207,x
 lda _enemy_y,y
 sta $200,x
 clc
 adc #5
 sta $204,x
 lda #SPARK
 sta $201,x
 sta $205,x
 lda #1
 sta $202,x
 lda #2
 sta $206,x
 txa
 clc
 adc #8
 tax
 jmp @next
@live:
 lda _enemy_live,y
 jeq @next
 lda _enemy_x,y
 sta base_x
 lda _enemy_y,y
 sec
 sbc #1
 sta base_y
 lda _enemy_live,y
 cmp #8
 beq @scout_pic
 cmp #5
 beq @walker
 cmp #1
 beq @carrier
 cmp #2
 beq @pod
 jsr flight_pose
 sta parts_ptr
 sty parts_ptr+1
 jsr emit_flight
 jcs @next
 ldy #0
 jmp @part
@scout_pic:
 lda base_y
 sec
 sbc #4
 sta base_y
 tya
 asl
 tay
 lda _age,y
 and #8
 beq :+
 lda #<scout_b
 ldy #>scout_b
 jmp @parts
: lda #<scout_a
 ldy #>scout_a
 jmp @parts
@pod: lda #<pose_pod_0
 ldy #>pose_pod_0
 jmp @parts
@carrier:
 lda base_x
 sec
 sbc #3
 bcs :+
 lda #0
: sta base_x
 tya
 asl
 tay
 lda _age,y
 and #8
 beq :+
 lda #<pose_carrier_1
 ldy #>pose_carrier_1
 jmp @parts
: lda #<pose_carrier_0
 ldy #>pose_carrier_0
 jmp @parts
@walker:
 lda base_x
 sec
 sbc #8
 bcs :+
 lda #0
: sta base_x
 lda base_y
 sec
 sbc #14
 sta base_y
 lda _route,y
 cmp #9
 beq @air
 tya
 asl
 tay
 lda _age+1,y
 bne @late
 lda _age,y
 cmp #116
 bcc @standing
 cmp #204
 bcs @standing
 and #8
 beq :+
 ldy #2
 bne @walker_pose
: ldy #1
 bne @walker_pose
@late:
 cmp #1
 bne @air
 lda _age,y
 cmp #36
 bcc @standing
@air: ldy #3
 bne @walker_pose
@standing: ldy #0
@walker_pose:
 lda walker_lo,y
 pha
 lda walker_hi,y
 tay
 pla
@parts:
 sta parts_ptr
 sty parts_ptr+1
 ldy #0
@part:
 lda (parts_ptr),y
 bmi @next
 clc
 adc base_y
 sta $200,x
 iny
 lda (parts_ptr),y
 sta $201,x
 iny
 lda (parts_ptr),y
 sta $202,x
 iny
 lda (parts_ptr),y
 clc
 adc base_x
 bcs @hide
 sta $203,x
 inx
 inx
 inx
 inx
 cpx mob_limit
 bcs @done
 jmp @more
@hide: lda #255
 sta $200,x
@more: iny
 bne @part
@next:
 ldy actor_i
 iny
 cpy #10
 bcc :+
 ldy #0
: dec mob_remaining
 jne @mob
@done: stx _oam_index
 rts

.import _boss_active,_boss_offset,_boss_pose,_terminal_dy
.export _boss_contact
.segment "STAGEDATA"
contact_body: .incbin "build/body-contact.bin"
.segment "ACTORS"
contact_tail: .incbin "build/tail-contact.bin"
; Keep the pointer tables in permanently mapped ROM, outside the actor window.
.segment "CODE"
tail_contact_lo: .repeat 157,I
 .byte <(contact_tail+38*I)
.endrepeat
tail_contact_hi: .repeat 157,I
 .byte >(contact_tail+38*I)
.endrepeat
body_row_lo: .repeat 90,I
 .byte <(contact_body+9*I)
.endrepeat
body_row_hi: .repeat 90,I
 .byte >(contact_body+9*I)
.endrepeat
pixel_bit: .byte 1,2,4,8,16,32,64,128
.segment "ACTORS"
; The caller has already rejected empty tiles. Test the body silhouette,
; then the centers of the 19 beads used to paint this exact pose.
_boss_contact:
 lda _px
 clc
 adc #10
 sec
 sbc _boss_offset
 bcc @no
 sta cx
 lda _py
 sec
 sbc #16
 sta cy
 lda cx
 sec
 sbc #114
 bcc @tail
 lsr
 sta temp
 and #7
 tax
 lda _py
 sec
 sbc #30
 bcc @tail
 lsr
 cmp #90
 bcs @tail
 tay
 lda body_row_lo,y
 sta parts_ptr
 lda body_row_hi,y
 sta parts_ptr+1
 lda temp
 lsr
 lsr
 lsr
 tay
 lda (parts_ptr),y
 and pixel_bit,x
 bne @yes
@tail:
 ldx _boss_pose
 lda tail_contact_lo,x
 sta parts_ptr
 lda tail_contact_hi,x
 sta parts_ptr+1
 ldy #0
@bead:
 lda (parts_ptr),y
 sec
 sbc cx
 clc
 adc #4
 cmp #9
 bcs @skip
 iny
 lda (parts_ptr),y
 sec
 sbc cy
 clc
 adc #4
 cmp #9
 bcc @yes
 dey
@skip: iny
 iny
 cpy #38
 bne @bead
@no: lda #0
 tax
 rts
@yes: lda #1
 ldx #0
 rts


.segment "ACTORS"
touches_force:
 lda _fx
 clc
 adc #11
 sec
 sbc cx
 bcs :+
 eor #255
 adc #1
: cmp _shield_w
 bcs @apart
 lda _fy
 sec
 sbc cy
 bcs :+
 eor #255
 adc #1
: cmp _shield_h
 bcs @apart
 sec
 rts
@apart: clc
 rts
.import _muzzle_x,_muzzle_y
.export _fire_aimed
.segment "ZEROPAGE"
aim_x: .res 1
aim_y: .res 1
aim_dir: .res 1
.segment "ACTORS"
bullet_offset: .byte 0,7,14,21,28,35
aim_vx: .byte 0,13,19,23,26
aim_vy: .byte 26,23,19,13,0
_fire_aimed:
 ldy #0
@slot:
 ldx bullet_offset,y
 lda _bullets+6,x
 beq @free
 iny
 cpy #6
 bcc @slot
 rts
@free:
 sty offset_i
 lda _muzzle_x
 set_fixed _bullets
 lda _muzzle_y
 set_fixed _bullets+2
 lda #0
 sta aim_dir
 lda _px
 clc
 adc #11
 sec
 sbc _muzzle_x
 bcs :+
 inc aim_dir
 eor #255
 clc
 adc #1
: sta aim_x
 lda _py
 sec
 sbc _muzzle_y
 bcs :+
 inc aim_dir
 inc aim_dir
 eor #255
 clc
 adc #1
: sta aim_y
 lsr
 lsr
 cmp aim_x
 bcs @vertical
 lda aim_x
 lsr
 lsr
 cmp aim_y
 bcs @horizontal
 lda aim_y
 lsr
 clc
 adc aim_y
 bcs @slope
 cmp aim_x
 bcc @shallow
@slope:
 lda aim_x
 lsr
 clc
 adc aim_x
 bcs @diagonal
 cmp aim_y
 bcc @steep
@diagonal: ldy #2
 bne @speed
@shallow: ldy #3
 bne @speed
@steep: ldy #1
 bne @speed
@horizontal: ldy #4
 bne @speed
@vertical: ldy #0
@speed:
 lda aim_dir
 lsr
 lda aim_vx,y
 bcc :+
 eor #255
 clc
 adc #1
: sta _bullets+4,x
 lda aim_dir
 cmp #2
 lda aim_vy,y
 bcc :+
 eor #255
 clc
 adc #1
: ldy offset_i
 sta _terminal_dy,y
 ldy _boss_active
 beq @launch
 lda _tick
 and #32
 beq :+
 lda #18
 bne @launch
: lda #238
@launch:
 sta _bullets+5,x
 lda #190
 sta _bullets+6,x
 rts

; Each membrane has its own position and goes away on contact with equipment.
; The R-9 samples the same center that is used to draw the bright rim.
.import _bubble_age,_bubble_x,_bubble_y
.export _collide_bubbles
.segment "ACTORS"
_collide_bubbles:
 ldx #8
@bubble:
 lda _bubble_age,x
 beq @next
 lda _bubble_x,x
 sta cx
 lda _bubble_y,x
 sta cy
 jsr touches_force
 bcs @absorb
 lda _bit_owned
 beq @ship
 outside cx,_bit_x,0,8,@ship
 outside cy,_bit_y,0,9,@ship
@absorb:
 inc _deflected
 jmp @remove
@ship:
 outside cx,_px,10,8,@next
 outside cy,_py,0,8,@next
 stx offset_i
 lda #2
 jsr _die
 ldx offset_i
@remove:
 lda #0
 sta _bubble_age,x
@next:
 dex
 bpl @bubble
 rts

.include "cannon.inc"

.segment "STARTUP"
.include "build/flight.inc"
.segment "CODE"
.include "build/scout.inc"

.include "build/flight-poses.inc"
; The red silhouette repeats in about nine capture frames. Index by
; individual age so each entrant starts on its own wing beat.
wing_cycle: .repeat 15
 .byte 3,4,4,1,1,0,2,2,3
.endrepeat
flight_pose:
 cmp #3
 beq @turn
 tya
 asl
 tay
 lda _age,y
 lsr
 tay
 lda wing_cycle,y
 tay
 lda wing_lo,y
 pha
 lda wing_hi,y
 tay
 pla
 rts
@turn:
 tya
 asl
 tay
 lda _age,y
 ldy #0
 cmp #35
 bcc @pose
 iny
 cmp #46
 bcc @pose
 iny
 cmp #54
 bcc @pose
 iny
 cmp #65
 bcc @pose
 iny
@pose:
 lda turn_lo,y
 pha
 lda turn_hi,y
 tay
 pla
 rts
 ; Each flight pose has a cool highlight followed by a 2x2 warm body.
 ; Emit repeated coordinates once while the entire pose fits. The general
 ; renderer handles right-edge clipping and the last few OAM slots.
emit_flight:
 txa
 clc
 adc #20
 bcs @partial
 cmp mob_limit
 bcc @space
 bne @partial
@space:
 lda base_x
 cmp #248
 bcs @partial
 sta $207,x
 sta $20f,x
 adc #8
 sta $20b,x
 sta $213,x
 lda base_y
 sta $204,x
 sta $208,x
 clc
 adc #8
 sta $20c,x
 sta $210,x
 ldy #0
 lda (parts_ptr),y
 clc
 adc base_y
 sta $200,x
 iny
 lda (parts_ptr),y
 sta $201,x
 clc
 .repeat 4,I
  adc #1
  sta $205+I*4,x
 .endrepeat
 ldy #3
 lda (parts_ptr),y
 clc
 adc base_x
 sta $203,x
 lda #3
 sta $202,x
 lda #1
 .repeat 4,I
  sta $206+I*4,x
 .endrepeat
 txa
 clc
 adc #20
 tax
 sec
 rts
@partial:
 clc
 rts
.assert * <= $a000, lderror, "Flight poses must remain in the resident bank"
