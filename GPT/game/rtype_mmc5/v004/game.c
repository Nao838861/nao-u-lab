#include "build/art.h"
typedef unsigned char u8;
typedef unsigned short u16;
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
  0x0f,0x0f,0x0f,0x0f, 0x2d,0x0f,0x16,0x30, 0x2d,0x0f,0x2c,0x30, 0x2d,0x0f,0x10,0x37,
  0x0f,0x00,0x2c,0x30, 0x2d,0x07,0x16,0x38, 0x2d,0x00,0x10,0x30, 0x2d,0x01,0x11,0x2c
};
static u8 px,py,tick,step_mask,step_byte;
u8 scroll_x,scroll_tile,stage_tile;
static u16 camera,step_index;
extern u8 stage_col,backdrop;
#pragma zpsym ("stage_col")
#pragma zpsym ("backdrop")
void prepare_column(void);
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
    if(camera==1066) backdrop=0;
}
u8 oam_index;
u8 hit_count, ray_colors;
u8 enemy_x[3],enemy_y[3],explosion[3];
static const u8 lanes[]={115,57,163,96,140,76};
static u8 next_lane;
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
    for(stage_col=0;stage_col<32;++stage_col) prepare_column();
    start_irq();REG(0x2000)=0x80;REG(0x2001)=0x1c;
}
static void obj(u8 x,u8 y,u8 id,u8 pal){
    OAM[oam_index++]=y-1;OAM[oam_index++]=id;
    OAM[oam_index++]=pal;OAM[oam_index++]=x;
}
u8 mx,my,mw,mh,sprite_count;
const u8* tile_list;
void draw_meta(void);
#define meta(X,Y,T,W,H) do { mx=(X);my=(Y);mw=(W);mh=(H);tile_list=(T);draw_meta(); } while(0)
void launch_effects(void);
static void sprites(void){
    u8 i;
    oam_index=0;
    meta(px,py-6,r9_tiles,3,2);
    meta(px+25,py-8,core_tiles+8*((tick>>3)&3),2,2);
    meta(px+21,py-12,force_tiles+18*((tick>>3)&3),3,3);
    meta(px+6,py-29,bit_tiles+8*((tick>>2)%5),2,2);
    launch_effects();
    for(i=0;i<3;++i){
        if(explosion[i]){
            u8 d=(12-explosion[i])/2;
            if(enemy_x[i]>d && enemy_x[i]<242){
                obj(enemy_x[i]-d,enemy_y[i]-d,SPARK,1);
                obj(enemy_x[i]+5+d,enemy_y[i]+d,SPARK,2);
            }
        }else if(i==2){meta(enemy_x[i],enemy_y[i],walker_tiles,4,4);}
        else {meta(enemy_x[i],enemy_y[i],drone_tiles,2,3);}
    }
    {u8 end=oam_index;while(oam_index<sprite_count) {OAM[oam_index]=255;oam_index+=4;}sprite_count=end;}
}
static void respawn(u8 i){
    enemy_x[i]=248;
    enemy_y[i]=lanes[next_lane];
    if(++next_lane==6) next_lane=0;
}
void prepare_hits(void);
static void enemies(void){
    u8 i;
    for(i=0;i<3;++i){
        if(explosion[i]){
            if(!--explosion[i]) respawn(i);
        }else{
            if(enemy_x[i]<2) respawn(i); else --enemy_x[i];
            if(!(tick&3)) enemy_y[i]+=((tick+16*i)&32)?1:-1;
        }
    }
}
extern u8 column,row,bank;
#pragma zpsym ("column")
#pragma zpsym ("row")
#pragma zpsym ("bank")
void light(void);
void erase_lights(void);
static void spawn(struct Shot* s){
    s->active=1;s->origin=(px+23)>>3;s->row=(py+4)>>3;s->age=0;
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
static struct Ray rays[3];
static u8 head_index,launch_tile;
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
static void reflect_shot(void){
    u8 i,adv;
    if(!blue.active) return;
    ray_min_col=(scroll_tile-launch_tile)&31;
    adv=(blue.age&3)!=3;
    for(i=0;i<3;++i){
        struct Ray* r=&rays[i];
        if(adv){
            u8 shape=r->dy==0?2:(r->dx==r->dy?0:1);
            r->cols[head_index]=r->x;r->rows[head_index]=r->y;r->shapes[head_index]=diagonal[shape];
            if(r->used<12) ++r->used;
            if(r->x>=0 && r->x<32){
                signed char nx=r->x+r->dx,ny=r->y+r->dy;
                if(ny<ceilrow[(u8)(r->x+launch_tile)] || ny>floorrow[(u8)(r->x+launch_tile)]){
                    r->dy=-r->dy;ny=r->y;
                }else if(nx>=0 && nx<32 && (ny<ceilrow[(u8)(nx+launch_tile)] || ny>floorrow[(u8)(nx+launch_tile)])){
                    r->dx=-r->dx;nx=r->x;
                }
                r->x=nx;r->y=ny;
            }
        }
        ray_data=r->cols;ray_length=r->used;draw_ray();

    }
    if(adv && ++head_index==12) head_index=0;
    if(++blue.age>=62) blue.active=0;
}
void main(void){
    u8 pad;
    px=9;py=120;
    enemy_x[0]=170;enemy_x[1]=220;enemy_x[2]=218;
    enemy_y[0]=115;enemy_y[1]=62;enemy_y[2]=171;
    setup();
    for(;;){
        while(ready){}
        advance_camera();
        ++tick;pad=readpad();
        if((pad&1)&&px<200) px+=2;
        if((pad&2)&&px>2) px-=2;
        if((pad&4)&&py<190) py+=2;
        if((pad&8)&&py>48) py-=2;
        enemies();prepare_hits();
        if(cooldown) --cooldown;
        if((pad&0x80) && !cooldown){
            if(!red[0].active) {spawn(&red[0]);cooldown=25;}
            else if(!red[1].active) {spawn(&red[1]);cooldown=25;}
        }
        if((pad&0x40) && !blue.active) launch_blue();
        if(red[0].active || red[1].active) ray_colors=0;
        else if(blue.active) ray_colors=1;
        begin_list();erase_lights();
        x_bias=scroll_tile;wave_shot(&red[0]);wave_shot(&red[1]);
        x_bias=launch_tile;reflect_shot();sprites();
        end_list();ready=1;
    }
}

