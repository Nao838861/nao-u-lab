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
void __fastcall__ queue(u16 address);
u8 readpad(void);

static const u8 palette[]={
  0x0f,0x2d,0x10,0x30, 0x0f,0x2d,0x10,0x26, 0x0f,0x2d,0x10,0x2c, 0x0f,0x00,0x10,0x37,
  0x0f,0x01,0x21,0x30, 0x0f,0x06,0x27,0x38, 0x0f,0x07,0x16,0x28, 0x0f,0x11,0x2c,0x30
};
static u8 px,py,tick,oam_index;
u8 hit_count;
u8 enemy_x[3],enemy_y[3],explosion[3];
static const u8 lanes[]={115,57,163,96,140,76};
static u8 next_lane;
struct Shot {u8 active,origin,row,age;};
static struct Shot red,blue;

static void setup(void){
    u16 i;
    REG(0x5104)=2;
    for(i=0;i<1024;++i)
        REG(0x5c00+i)=(i<128 || i>=832)?0xc0:0;
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
    REG(0x2000)=0x80;REG(0x2001)=0x1e;
}
static void obj(u8 x,u8 y,u8 id,u8 pal){
    OAM[oam_index++]=y-1;OAM[oam_index++]=id;
    OAM[oam_index++]=pal;OAM[oam_index++]=x;
}
static void meta(u8 x,u8 y,u8 id,u8 w,u8 h,u8 pal){
    u8 i,j;
    for(j=0;j<h;++j) for(i=0;i<w;++i){
        if((unsigned)x+i*8<256) obj(x+i*8,y+j*8,id,pal);
        ++id;
    }
}
static void sprites(void){
    u8 i;
    oam_index=0;
    meta(px,py-6,0,3,2,0);
    meta(px+22,py-7,6,2,2,1);
    obj(px+12,py-15,10,3);obj(px+12,py+11,10,3);
    for(i=0;i<3;++i){
        if(explosion[i]){
            u8 d=(12-explosion[i])/2;
            if(enemy_x[i]>d && enemy_x[i]<242){
                obj(enemy_x[i]-d,enemy_y[i]-d,15,1);
                obj(enemy_x[i]+5+d,enemy_y[i]+d,15,2);
            }
        }else meta(enemy_x[i],enemy_y[i],11,2,2,2);
    }
    while(oam_index) {OAM[oam_index]=255;oam_index+=4;}
}
static void respawn(u8 i){
    enemy_x[i]=248;
    enemy_y[i]=lanes[next_lane];
    if(++next_lane==6) next_lane=0;
}
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
static void fire(struct Shot* s,u8 key){
    if(s->active || !key) return;
    s->active=1;s->origin=(px+34)>>3;s->row=(py+4)>>3;s->age=0;
    REG(0x4000)=0x88;REG(0x4002)=s==&red?0x5c:0x91;REG(0x4003)=8;
}
static void wave_shot(void){
    u8 x,y,base;
    if(!red.active) return;
    base=red.origin+(red.age>>1);
    {
        u8 index=(red.age&1)?24:0;
        for(y=0;y<4;++y){
            row=red.row+y-2;
            for(x=0;x<6;++x){
                column=base+x;bank=wave[index++];
                ink=bank|(y<2?0x80:0x40);
                light();
            }
        }
    }
    ++red.age;
    if(base>=31) red.active=0;
}
static void reflect_shot(void){
    u8 step,head,dir;
    if(!blue.active) return;
    head=blue.age>>1;
    for(step=head>5?head-5:0;step<=head;++step){
        for(dir=0;dir<2;++dir){
            /* Unfold 22 rows into a 44-row mirrored corridor. */
            u8 phase=(dir?43-(blue.row-4):blue.row-4)+step;

            if(phase>=44) phase-=44;
            row=4+(phase<22?phase:43-phase);
            column=blue.origin+step;bank=diagonal[phase>=22];ink=bank|0x80;light();
        }
    }
    ++blue.age;
    if(blue.origin+head>=37) blue.active=0;
}
void main(void){
    u8 pad;
    px=27;py=120;
    enemy_x[0]=170;enemy_x[1]=220;enemy_x[2]=246;
    enemy_y[0]=115;enemy_y[1]=62;enemy_y[2]=166;
    setup();
    for(;;){
        while(ready){}
        ++tick;pad=readpad();
        if((pad&1)&&px<200) px+=2;
        if((pad&2)&&px>2) px-=2;
        if((pad&4)&&py<190) py+=2;
        if((pad&8)&&py>48) py-=2;
        enemies();
        fire(&red,pad&0x80);fire(&blue,pad&0x40);
        begin_list();erase_lights();
        wave_shot();reflect_shot();sprites();
        end_list();ready=1;
    }
}

