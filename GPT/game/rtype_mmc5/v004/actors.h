typedef unsigned char u8;
typedef unsigned short u16;
typedef signed char s8;
enum { EMPTY, POW, POD, FLY, DART, WALK, GUN, WEAK };
enum { BASIC, RED, BLUE, BIT };
#define SLOTS 7
#define MOBS 6
extern u8 px,py,pad,oldpad,tick,scroll_x,stage_tile,boss_active,boss_offset,boss_pose;
extern u16 camera;
extern u8 enemy_live[SLOTS],enemy_x[SLOTS],enemy_y[SLOTS],explosion[SLOTS],beam_hit[SLOTS];
extern u8 boss_cleared,invulnerable,dying,drill,weapon,bit_owned,request_wave,request_ray;
extern u8 mx,my,mw,mh,oam_index,sprite_count;
extern const u8* tile_list;
void draw_meta(void);
void update_actors(void);
void render_actors(void);
extern u8 core_flash;
void boss_attack_tick(void);
void draw_attack(void);
void collide_bubbles(void);
void prepare_bubble_display(void);
