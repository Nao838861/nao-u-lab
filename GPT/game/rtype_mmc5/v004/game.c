#include "build/art.h"
#include "actors.h"
#define REG(a) (*(volatile u8*)(a))
#define OAM ((u8*)0x0200)
extern volatile u8 ready;
extern u8 ink;
#pragma zpsym ("ready")
#pragma zpsym ("ink")
void begin_list(void);
void end_list(void);
void start_irq(void);
u8 readpad(void);

static const u8 palette[]={
  0x0f,0x0f,0x0f,0x0f, 0x2d,0x16,0x11,0x3c, 0x2d,0x06,0x16,0x36, 0x2d,0x0f,0x10,0x37,
  0x0f,0x00,0x2c,0x30, 0x2d,0x07,0x16,0x38, 0x2d,0x00,0x10,0x30, 0x2d,0x1a,0x11,0x3c
};
u8 px,py,tick,pad,oldpad;
static u8 step_mask,step_byte,clear_column;
u8 scroll_x,scroll_tile,stage_tile;
u8 dark_room,boss_active,boss_offset,boss_pose;
static u8 sweep_col;
void draw_boss_details(void);
void prepare_tail(void);
u16 camera;
static u16 step_index;
extern u8 stage_col,backdrop;
#pragma zpsym ("stage_col")
#pragma zpsym ("backdrop")
void prepare_column(void);
void upload_column(void);
static void advance_camera(void){
    if(camera==STAGE_END) return;
    if(!step_mask){step_byte=camera_steps[step_index++];step_mask=1;}
    if(!(step_byte&step_mask)){step_mask<<=1;return;}
    step_mask<<=1;
    ++camera; ++scroll_x;
    if(!(scroll_x&7)){++stage_tile;scroll_tile=stage_tile&31;}
    if((scroll_x&7)==1){stage_col=stage_tile+32;prepare_column();}
    if(camera==44 || camera==1059) backdrop=1;
    if(camera==55 || camera==1043) backdrop=2;
    if(camera==75) backdrop=3;
    if(camera==1066){backdrop=0;dark_room=1;sweep_col=stage_tile+32;}
    if(camera==1130){boss_active=1;backdrop=4;boss_pose=BOSS_PHASE;}
    if(boss_active) boss_offset=STAGE_END-camera;
}
u8 oam_index;
u8 hit_count;
struct Shot {u8 active,origin,row,age;};
struct Shot red[2];
struct Shot blue;
static u8 cooldown;

static void setup(void){
    u16 i;
    REG(0x5104)=2;
    for(i=0;i<1024;++i)
        REG(0x5c00+i)=i<960?attributes[i]:0;
    REG(0x5104)=1;
    REG(0x2006)=0x3f; REG(0x2006)=0;
    for(i=0;i<32;++i) REG(0x2007)=palette[i];
    REG(0x2006)=0x20; REG(0x2006)=0;
    for(i=0;i<960;++i) REG(0x2007)=nametable[i];
    for(i=0;i<64;++i) REG(0x2007)=0;
    for(i=0;i<256;i+=4) OAM[i]=0xff;
    REG(0x2003)=0;REG(0x4014)=2;
    REG(0x2005)=0;REG(0x2005)=0;
    REG(0x4015)=9;REG(0x4001)=0;REG(0x4000)=0x30;REG(0x400c)=0x30;
    if(boss_active){
        REG(0x5104)=2;
        for(i=1;i<=32;++i){stage_col=stage_tile+i;prepare_column();upload_column();}
        REG(0x5104)=1;
    }else for(stage_col=0;stage_col<32;++stage_col) prepare_column();
    start_irq();REG(0x2000)=0x80;REG(0x2001)=0x1c;
}
u8 mx,my,mw,mh,sprite_count;
const u8* tile_list;
void launch_effects(void);
void prepare_hits(void);
extern unsigned char oam_prepared;
#pragma zpsym ("oam_prepared")
static void sprites(void){
    u8 end;
    oam_index=0;render_actors();launch_effects();
    if(boss_active && !boss_cleared){draw_attack();draw_boss_details();}
    end=oam_index;
    while(oam_index<sprite_count){OAM[oam_index]=255;oam_index+=4;}
    sprite_count=end;
    oam_prepared=1;
}
extern u8 column,row,bank;
#pragma zpsym ("column")
#pragma zpsym ("row")
#pragma zpsym ("bank")
void light(void);
void erase_lights(void);
static void spawn(struct Shot* s){
    s->active=1;s->origin=(px+23+(scroll_x&7))>>3;s->row=(py+4)>>3;s->age=0;
    REG(0x4000)=0x88;REG(0x4002)=s==&blue?0x91:0x5c;REG(0x4003)=8;
}
extern u8 wave_x,wave_y,wave_phase;
void draw_wave(void);
static void wave_shot(struct Shot* s){
    u8 t;
    if(!s->active) return;
    t=s->age++;
    if(t<8){
        s->origin=(px+24+(scroll_x&7))>>3;
        s->row=(py+4)>>3;
    }
    wave_phase=phase_for_age[t];
    wave_x=s->origin+wave_offsets[wave_phase];
    wave_x+=advance_for_age[t];
    wave_y=s->row-3;
    draw_wave();
    if(wave_x>=31) s->active=0;
}
/* Each ray grows out from the gun. Past its maximum length the tail follows
   the recorded path, including turns around the corridor's ledges. */
struct Ray {signed char x,y,dx,dy; u8 used,cols[12],rows[12],shapes[12];};
struct Ray rays[3];
u8 head_index,launch_tile;
u8 x_bias,ray_min_col;
static void launch_blue(void){
    u8 i;
    spawn(&blue);head_index=0;launch_tile=stage_tile;
    for(i=0;i<3;++i){
        struct Ray* r=&rays[i];
        r->x=blue.origin+1;r->y=blue.row;r->dx=1;r->dy=(signed char)i-1;r->used=0;
    }
}
const u8* ray_data;u8 ray_length;
void draw_ray(void);
void reflect_shot(void);
void main(void){
    px=64;py=170;
#ifdef BOSS_PREVIEW
    camera=STAGE_END;scroll_x=(u8)camera;stage_tile=camera>>3;scroll_tile=stage_tile&31;
    px=9;py=120;dark_room=1;boss_active=1;backdrop=4;
#endif
    setup();
    for(;;){
        while(ready){}
        if(boss_active && ++boss_pose==157) boss_pose=0;
        stage_col=255;
        advance_camera();
        if(sweep_col && stage_col==255){
            if(sweep_col<=stage_tile) sweep_col=0;
            else {stage_col=sweep_col--;prepare_column();}
        }
        if(boss_cleared && clear_column<32 && stage_col==255){
            stage_col=stage_tile+1+clear_column++;prepare_column();
        }
        ++tick;oldpad=pad;pad=readpad();
        if(boss_active && !boss_cleared)prepare_tail();
        if(boss_active)boss_attack_tick();
        update_actors();
        prepare_hits();
        if(cooldown) --cooldown;
        if(request_wave && !cooldown){
            if(!red[0].active) {spawn(&red[0]);cooldown=25;}
            else if(!red[1].active) {spawn(&red[1]);cooldown=25;}
        }
        if(request_ray && !blue.active) launch_blue();

        begin_list();erase_lights();
        x_bias=scroll_tile;wave_shot(&red[0]);wave_shot(&red[1]);
        x_bias=launch_tile;reflect_shot();sprites();
        end_list();
        if(boss_active)prepare_bubble_display();
        ready=1;
    }
}

