#include "actors.h"
#pragma code-name ("ACTORS")
#pragma rodata-name ("ACTORS")
#pragma bss-name ("ACTORRAM")
#include "build/actors.h"
#include "build/terrain.h"
struct Event {u16 camera; u8 kind,x,y,drop;};
#include "build/encounters.h"

u8 enemy_live[SLOTS],enemy_x[SLOTS],enemy_y[SLOTS],explosion[SLOTS],beam_hit[SLOTS];
u8 boss_cleared,invulnerable,dying,drill,weapon,bit_owned,request_wave,request_ray;
u8 pickups,deaths,deflected,boss_hp,death_cause;
static u8 event_index,initialized,charge,force_state;
u8 banking,force_phase,bit_phase,bit_x,bit_y,force_level,sprite_page,shield_w,shield_h,orb_phase;
static u8 bit_delay;
u8 fx,fy,scroll_delta,previous_scroll,bullet_x[6],bullet_y[6],in_room;
u8 origin_y[MOBS],drop[MOBS],hp[MOBS];
int posx[MOBS],posy[MOBS];
u16 age[MOBS];
static u8 cooled;
const s8 bob[]={0,2,4,6,7,8,7,6,4,2,0,-2,-4,-6,-7,-8,-7,-6,-4,-2};
const s8 pod_path[]={0,1,3,6,10,15,21,28,35,41,44,47,49,50,50,50,48,46,43,39,33,27,20,14,9,5,2,0,-1,-1,-1,0};
const u8 force_frames[]={0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,5,5,6,6,6,6,7,7,7,7,7};
const u8 bit_frames[]={0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7};
struct Bullet {int x,y; s8 dx,dy;u8 life;};
struct Bullet bullets[6];
s8 terminal_dy[6];
struct Bolt {u8 x,y,power;};
struct Bolt bolts[4];
struct Item {u16 world;u8 y,type;};
struct Item items[3];

static u8 within(u8 a,u8 b,u8 radius){
    return a>b?a-b<=radius:b-a<=radius;
}
static void drop_item(u8 i){
    u8 k;
    if(!drop[i])return;
    for(k=0;k<3;++k)if(!items[k].type){
        items[k].world=camera+enemy_x[i]+8;
        items[k].y=enemy_y[i]+8;items[k].type=drop[i];break;
    }
}
static void damage(u8 i,u8 power){
    if(!enemy_live[i] || explosion[i])return;
    if(i==MOBS){
        if(cooled || boss_cleared)return;
        cooled=10;
        boss_hp=boss_hp>power?boss_hp-power:0;
        if(!boss_hp){boss_cleared=1;enemy_live[i]=0;explosion[i]=32;}
    }else if(hp[i]>power)hp[i]-=power;
    else{
        drop_item(i);enemy_live[i]=0;explosion[i]=12;
    }
}
void die(u8 cause){
    if(invulnerable || dying || drill)return;
    dying=30;++deaths;charge=0;death_cause=cause;
}
u8 muzzle_x,muzzle_y;
void fire_aimed(void);
#define fire_enemy(X,Y) do{muzzle_x=(X);muzzle_y=(Y);fire_aimed();}while(0)
void move_bullets(void);
u8 gun_screen[15],gun_live[15],gun_dead[15],gun_timer[15];
extern const u8 gun_height[15];
void move_guns(void);
void draw_guns(void);
void draw_mobs(void);
void gun_fire(u8 i){fire_enemy(gun_screen[i],gun_height[i]);}
static void enter(void){
    const struct Event* e;
    u8 i;
    while(event_index<sizeof(events)/sizeof(events[0])){
        e=&events[event_index];
        if(camera<e->camera)break;
        ++event_index;
        for(i=0;i<MOBS;++i)if(!enemy_live[i]&&!explosion[i]){
            enemy_live[i]=e->kind;origin_y[i]=e->y;drop[i]=e->drop;
            posx[i]=(int)e->x<<4;posy[i]=(int)e->y<<4;age[i]=0;
            hp[i]=e->kind==WALK?4:e->kind==POW?2:1;
            break;
        }
    }
}
void move_mobs(void);
void mob_fire(u8 i){fire_enemy(enemy_x[i]+5,enemy_y[i]+8);}
void force_impact(u8 i){damage(i,1);}
static void move_items(void){
    u8 i,x;
    for(i=0;i<3;++i)if(items[i].type){
        if(items[i].world<camera){items[i].type=0;continue;}
        x=(u8)(items[i].world-camera);
        if(!dying && within(x,px+12,13)&&within(items[i].y,py,11)){
            if(items[i].type==BIT){bit_owned=1;bit_x=px+11;bit_y=py-25;}else{weapon=items[i].type;if(force_level<3)++force_level;}
            ++pickups;items[i].type=0;
        }
    }
}
static void shoot_bolt(u8 power){
    u8 i;
    if(fx>225 && force_state)return;
    for(i=0;i<4;++i)if(!bolts[i].power){
        bolts[i].x=power==5?bit_x+3:force_state?fx+17:px+23;
        bolts[i].y=power==5?bit_y:force_state?fy:py;bolts[i].power=power;break;
    }
}
void move_bolts(void);
u8 cannon_strength;
void cannon_hit(u8 i){damage(i,cannon_strength);}
static void player(void){
    u16 col;
    if(invulnerable)--invulnerable;
    if(dying){
        if(!--dying){
            px=12;col=(camera+22)>>2;py=(ceiling_px[col]>>1)+(floor_px[col]>>1);
            weapon=BASIC;force_level=1;bit_owned=0;force_state=0;invulnerable=120;
        }
        return;
    }
    if((pad&1)&&px<217)px+=2;
    if((pad&2)&&px>2)px-=2;
    if((pad&4)&&py<211)py+=2;
    if((pad&8)&&py>30)py-=2;
    banking=(pad&8)?1:(pad&4)?2:0;
    if(!drill && (pad&0x40) && !(oldpad&0x40))force_state=force_state?3:1;
    if(!force_state){fx=px+14;fy=py;}
    else if(force_state==1){if(fx<226)fx+=4;else force_state=2;}
    else if(force_state==2){if(fy<py)++fy;else if(fy>py)--fy;}
    else{
        if(fx>px+16)fx-=3;else if(fx<px+12)fx+=3;
        if(fy<py)++fy;else if(fy>py)--fy;
        if(within(fx,px+14,3)&&within(fy,py,3))force_state=0;
    }
    col=(camera+px+10)>>2;
    if(py<ceiling_px[col]+2 || py+2>=floor_px[col])die(1);
    if(drill){request_wave=pad&0x80;request_ray=pad&0x40;return;}
    if(bit_delay)--bit_delay;
    if((pad&0x80)&&!(oldpad&0x80)){
        if(bit_owned && !bit_delay){shoot_bolt(5);bit_delay=18;}
        if(force_state || weapon==BASIC)shoot_bolt(1);
        if(!force_state){
            if(weapon==RED)request_wave=1;
            if(weapon==BLUE)request_ray=1;
        }
    }
    if(pad&0x80){if(charge<96)++charge;}
    else{if(charge>=24)shoot_bolt(charge>=64?4:2);charge=0;}
}
u8 boss_contact(void);
static void boss(void){
    u8 x;
    u8* shadow=(u8*)0x6400;
    if(explosion[MOBS])--explosion[MOBS];
    if(boss_cleared)return;
    collide_bubbles();
    if(enemy_live[MOBS]){
        x=enemy_x[MOBS]+8;
        if(within(px+10,x,7)&&within(py,enemy_y[MOBS]+8,6))die(4);
        if(within(fx+12,x,13)&&within(fy,enemy_y[MOBS]+8,9)){
            if(force_state==1){fx=x-12;force_state=2;}
            damage(MOBS,1);
        }
    }
    /* The MMC5 shadow includes this pose's body and tail cells. The room
       geometry and the bright glints come from the same world columns. */
    if(shadow[((u16)(py>>3)<<5)+(((u8)(px+10+scroll_x))>>3)]>=128 && boss_contact())die(4);
}
void actor_update(void){
    u8 i;
    if(!initialized){initialized=1;boss_hp=24;force_level=1;if(boss_active){drill=1;force_level=3;weapon=BLUE;bit_owned=1;}}
    scroll_delta=scroll_x-previous_scroll;previous_scroll=scroll_x;
    request_wave=0;request_ray=0;
    if((pad&0x20)&&!(oldpad&0x20)){drill^=1;charge=0;force_state=0;}
    if(++force_phase==35)force_phase=0;
    if(++orb_phase==26)orb_phase=0;
    if(++bit_phase==52)bit_phase=0;
    shield_w=drill||force_level==3?11:force_level==2?9:7;
    shield_h=drill||force_level==3?11:force_level==2?8:7;
    if(cooled)--cooled;
    core_flash=cooled>=7;
    for(i=0;i<SLOTS;++i)if(beam_hit[i]){beam_hit[i]=0;damage(i,1);}
    player();
    if(bit_owned || drill){
        s8 dx=(s8)(px+11-bit_x),dy=(s8)(py-25-bit_y);
        if(!bit_x){bit_x=px+11;bit_y=py-25;}
        else{
            if(dx)bit_x+=dx>0?(dx+3)>>2:-((3-dx)>>2);
            if(dy)bit_y+=dy>0?(dy+3)>>2:-((3-dy)>>2);
        }
    }
    if(!boss_active){enter();move_mobs();move_guns();}
    else{
        if(!in_room){in_room=1;for(i=0;i<MOBS;++i){enemy_live[i]=0;explosion[i]=0;}}
        boss();
    }
    move_items();move_bolts();move_bullets();
    sprite_page=drill || force_level>=3?252:131;
}
u8 spr_x,spr_y,spr_id,spr_pal;
void single_sprite(void);
void draw_bullets(void);
void draw_player(void);
#define sprite(X,Y,T,P) do{spr_x=(X);spr_y=(Y);spr_id=(T);spr_pal=(P);single_sprite();}while(0)
#define META(X,Y,T,W,H) do{mx=(X);my=(Y);tile_list=(T);mw=(W);mh=(H);draw_meta();}while(0)
void actor_render(void){
    u8 i,x;
    if(dying)sprite(px+8,py-4,SPARK,1);
    else if(!invulnerable || !(tick&4)){
        draw_player();
        if(charge>23 && (tick&4))sprite(px+20,py-4,CHARGE,3);
    }
    draw_bullets();
    if(!boss_active)draw_guns();
    for(i=0;i<4;++i)if(bolts[i].power){
        if(bolts[i].power==5){
            sprite(bolts[i].x,bolts[i].y-4,ION,3);
            sprite(bolts[i].x-8,bolts[i].y-4,ION_TRAIL,0);continue;
        }
        sprite(bolts[i].x,bolts[i].y-4,bolts[i].power>1?CHARGE:BOLT,3);
        if(bolts[i].power>=3)sprite(bolts[i].x-7,bolts[i].y-4,CHARGE,0);
    }
    for(i=0;i<3;++i)if(items[i].type){
        x=(u8)(items[i].world-camera);if(x<7)continue;
        if(items[i].type==BIT){META(x-6,items[i].y-6,satellite_tiles,2,2);}
        else{META(x-7,items[i].y-8,crystal_tiles+(items[i].type==BLUE?8:0),2,2);}
    }
    if(boss_active){if(explosion[MOBS])sprite(enemy_x[MOBS],119,SPARK,1);return;}
    draw_mobs();
}
