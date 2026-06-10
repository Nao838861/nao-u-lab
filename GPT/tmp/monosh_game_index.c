// 64x60簡易ビットマップ テスト版
// ダブルバッファ（CIRAM page0/1）＋2フレーム分割転送でほぼフル画面更新

 #include "fire.h"
  #include "easy_joy.h"
  #include "monobitmap_config.h"
 #define DEBUG_PROFILE 1
 #include "debug_profile.h"

 #ifdef BANK_SUPPORT
 #pragma wrapped-call (push, farcall, bank)
 #endif
 void init_both_pages(void);
 #ifdef BANK_SUPPORT
 #pragma wrapped-call (pop)
 #endif
 
  #define TOP_OFF_LINES 24
  #define BOTTOM_OFF_LINES 16
  #define STABLE_OFFSET_LINES 7 // これ入れないと安定しない
  #define ON_LINES (240 - TOP_OFF_LINES - BOTTOM_OFF_LINES - STABLE_OFFSET_LINES)
 
 #define BLANK_START_LINE (TOP_OFF_LINES + ON_LINES)
 #define EXRAM_DELAY_LOOPS 64

 #define SPRITE0_OAM_Y 31
 #define MMC5_IRQ_BASE_LINE (SPRITE0_OAM_Y + 1)
 #define MMC5_IRQ_FROM_SPR0 (BLANK_START_LINE - MMC5_IRQ_BASE_LINE)

// 切り分け用：中央128px高（24タイル）・横256px（32タイル）
#define CENTER_X 0
#define CENTER_Y 4
#define TRANSFER_W 32
#define TRANSFER_H 24
#define PHASE_H 12

// ダブルバッファ
 static unsigned char visible_page = 0; // 0 or 1
 static unsigned char update_ready = 0;
  static volatile unsigned char render_skip = 0;
 static volatile unsigned char nmi_counter = 0;
 static unsigned char last_nmi_counter = 0;
 static unsigned char wram_read_bank = 0;
 static unsigned char wram_write_bank = 1;
 static volatile unsigned char current_wram_bank = 0;
 static volatile unsigned char frame_counter = 0;
 static volatile unsigned char vblank_seen = 0;
 static volatile unsigned char ppu_ctrl_shadow = 0;
volatile unsigned char ppu_mask_shadow = 0;
 static volatile unsigned char irq_pending = 0;
 static volatile unsigned char ppu_update_in_progress = 0;
 static volatile unsigned char frame2_post_pending = 0;
 static volatile unsigned char frame2_clear_pending = 0;
 static volatile unsigned char frame2_exram_pending = 0;
 static volatile unsigned char nt_phase1_pending = 0;
 static unsigned char pending_write_page = 0;
 static volatile unsigned char use_dmc_irq_restore = 0;
 static volatile unsigned char dmc_irq_restore_fired = 0;
 static volatile unsigned char dmc_irq_restore_stage = 0;
 static volatile unsigned char use_sprite0_scroll_fix = 1;
 unsigned char frame_counter_30 = 0;

 static void init_sprite0_hit(void) {
     unsigned int i;
     volatile unsigned char* oam = (volatile unsigned char*)0x0200;
     for (i = 0; i < 256u; i += 4u) {
         oam[i] = 0xFF;
     }
     oam[0] = SPRITE0_OAM_Y;
     oam[1] = 0x39;
     oam[2] = 0x22;
     oam[3] = 8;
 }

 signed int player_x = 0;
 unsigned char player_y = 120;
 // プレイヤーのVBUF座標 (ビットマップピクセル単位, 1VBUF=2スクリーンpx)
 // player_vbuf_x = VBUF_X_BIAS + (112 + player_x) / 2 = 120 + player_x/2
 // player_vbuf_y = player_y (OAM Y系のまま、enemy_botと同じ座標系)
 unsigned char player_vbuf_x;
 unsigned char ground_offset = 8;
static unsigned char ground_offset_target = 8;
static unsigned char ground_offset_timer = 0;
 signed int player_fx = 0 * 256;
 unsigned int player_fy = (unsigned int)120u * 256u;

unsigned char ground_scroll = 0;
unsigned char auto_scroll = 1;
signed int bgfard_scroll_acc = 0;
signed int bgfaru_scroll_acc = 0;

// --- 弾 (OAMスプライト) ---
#define BULLET_MAX 3
#define BULLET_OAM_BASE 52
#define BULLET_LIFETIME 12
#define BULLET_Z_SPEED 4
#define SCREEN_CENTER_X 128

unsigned char bullet_sx[BULLET_MAX];     // スクリーンX (発射時に固定、奥に飛ぶ間変化しない)
unsigned char bullet_sy[BULLET_MAX];     // スクリーンY (Zに応じて地平線へ補間、毎フレーム更新)
unsigned char bullet_wz[BULLET_MAX];
unsigned char bullet_timer[BULLET_MAX];  // 0=inactive, 1..12=active
unsigned char bullet_count;

const unsigned char bullet_tile[6] = {
    0x49, 0x69, 0x0B, 0x2B, 0x4B, 0x6B
};

#include "bgobj.h"
unsigned char bgobj_type[SLOT_MAX];
signed int    bgobj_wx[SLOT_MAX];
unsigned char bgobj_wy[SLOT_MAX];
unsigned char bgobj_wz[SLOT_MAX];
signed int    bgobj_target_x[BGOBJ_MAX]; // BgObj専用 (0..15)
unsigned char bgobj_count;
unsigned char trig_accum;
unsigned char bgobj_zbucket[8];   // bucket heads (0xFF = empty)
unsigned char bgobj_col_zbucket[8]; // collision bucket heads (collidable types only)
unsigned char bgobj_znext[SLOT_MAX]; // per-obj next link (全スロット共通)
unsigned char bgobj_col_znext[SLOT_MAX]; // collision chain next link (全スロット共通)

// --- Enemy 固有データ (スロット16..23に対応) ---
unsigned char enemy_timer[ENEMY_MAX];    // 出現からのフレーム数 (0=非アクティブ)
unsigned char enemy_pattern[ENEMY_MAX];  // 移動パターン番号
unsigned char enemy_count;               // アクティブ敵数
// 4倍精度Zから事前計算した描画パラメータ (update_enemyで設定、draw/collisionで参照)
unsigned char enemy_size[ENEMY_MAX];     // enemy_z2size[wz_hi] (エクスポート済み)
unsigned char enemy_cx[ENEMY_MAX];       // コリジョン用VBUF X中心 (事前計算)
unsigned char enemy_bot[ENEMY_MAX];      // コリジョン用足元OAM Y (事前計算)
unsigned char enemy_wz[ENEMY_MAX];       // 4倍精度Z (コリジョン用、bgobj_wzの代替)
unsigned char enemy_last_wy[ENEMY_MAX];  // BOM0生成用ワールドY (update_enemyでキャッシュ)
// パターンキャッシュ: 同一パターン敵のポインタ再取得を排除
static const unsigned char *cache_psx;
static const unsigned char *cache_pbot;
static const unsigned char *cache_psz;
static const unsigned char *cache_pzb;
static const unsigned char *cache_pwz;
static const unsigned char *cache_pwy;
static unsigned char        cache_pat = 0xFF; // 無効値で初期化
// BOM0生成時にBANK_30のwxテーブルを遅延取得 (farcall経由で呼ぶ, BANK_30配置)
void resolve_bom_pending(void);
// collision→メインループ間のBOM0 wx遅延解決キュー
#define BOM_PENDING_MAX 4
unsigned char bom_pending_count;
unsigned char bom_pending_slot[BOM_PENDING_MAX];  // BOM0が配置された bgobj スロット
unsigned char bom_pending_ei[BOM_PENDING_MAX];    // 元の敵インデックス
static unsigned int  enemy_spawn_frame = 0;
static unsigned char enemy_spawn_index = 0;

// --- EnemyBullet 固有データ (スロット24..29に対応) ---
unsigned char ebullet_x[EBULLET_MAX];      // VBUF X座標 (8bit)
unsigned char ebullet_y[EBULLET_MAX];      // VBUF Y座標 (8bit)
unsigned char ebullet_wz[EBULLET_MAX];     // 従来Z (0..55)
signed char   ebullet_vx[EBULLET_MAX];     // X速度 (signed 8bit px/frame)
signed char   ebullet_vy[EBULLET_MAX];     // Y速度 (signed 8bit px/frame)
unsigned char ebullet_active[EBULLET_MAX]; // 0=非アクティブ
unsigned char ebullet_variant[EBULLET_MAX]; // 弾バリエーション (0/1/2)
unsigned char ebullet_count;               // アクティブ弾数
static unsigned char ebullet_var_idx;      // ランダムテーブル参照インデックス
static const unsigned char ebullet_var_tbl[16] = {
    0, 2, 1, 0, 2, 1, 2, 0, 1, 2, 0, 1, 0, 2, 1, 1
};

// spawn_table, spawn_frame, spawn_index は PRG_BANK_1 に配置
static unsigned int  spawn_frame = 0;  // 現在のフレームカウンタ
static unsigned char spawn_index = 0;  // テーブル内の現在位置

const unsigned char *bgobj_z2gy_ptr;

static const unsigned int bgobj_z2sc[56] = {
    408,371,348,331,294,286,260,249,236,222, 209,195,183,172,164,156,148,142,134,128,
    120,114,108,102,96,92,86,82,78,74, 70,66,62,58,56,52,50,48,44,42,
    40,40,38,36,36,34,34,32,32,32, 30,30,30,30,30,30
};

static const unsigned char bgobj_z2size[56] = {
    0,0, 1,1, 2,2, 3,3, 4, 4, 5, 5, 6,6, 7,7,7, 8,8,8, 9,9,9, 10,10,10,10, 11,11,11,11, 12,12,12,12,12, 13,13,13,13,13,13,13, 14,14,14,14,14,14,14, 15,15,15,15,15,15
};

// --- BgObjタイプ別スプライトサイズテーブル(コリジョン用) ---
// サイズインデックス(0..15) → half_w: 中心からの横幅(OAM px)
//                           → h:      スプライト高さ(VBUF行、OAM px = h*2)
// アセンブリ側で定義されたスプライトテーブルを参照
extern const unsigned char sprite_Tree0_half_w[];
extern const unsigned char sprite_Bom0_half_w[];
extern const unsigned char sprite_Bush0_half_w[];
extern const unsigned char sprite_FlyStone_half_w[];
extern const unsigned char sprite_Em0_half_w[];

// タイプ別テーブルポインタ (0=NONE, 1=TREE0, 2=BOM0, 3=BUSH0, 4=FLYSTONE, 5=EM0)
// ENEMY_TYPE_EM0(5)も同じインデックスでアクセス
#define TYPE_TBL_COUNT 6
static const unsigned char * const bgobj_half_w_tbl[TYPE_TBL_COUNT] = {
    sprite_Tree0_half_w,    // TYPE_NONE(0) -> fallback
    sprite_Tree0_half_w,    // TYPE_TREE0(1)
    sprite_Bom0_half_w,     // TYPE_BOM0(2)
    sprite_Bush0_half_w,    // TYPE_BUSH0(3)
    sprite_FlyStone_half_w, // TYPE_FLYSTONE(4)
    sprite_Em0_half_w,      // ENEMY_TYPE_EM0(5)
};
static const unsigned char * const bgobj_h_tbl[TYPE_TBL_COUNT] = {
    sprite_Tree0_h,    // TYPE_NONE(0) -> fallback
    sprite_Tree0_h,    // TYPE_TREE0(1)
    sprite_Bom0_h,     // TYPE_BOM0(2)
    sprite_Bush0_h,    // TYPE_BUSH0(3)
    sprite_FlyStone_h, // TYPE_FLYSTONE(4)
    sprite_Em0_h,      // ENEMY_TYPE_EM0(5)
};



 extern void transfer_phase0(void);
 extern void transfer_phase1(void);
 extern void __fastcall__ draw_Tree0(unsigned char size, unsigned char x, unsigned char y);
 extern void __fastcall__ draw_Bom0(unsigned char size, unsigned char x, unsigned char y);
 extern void __fastcall__ draw_Bush0(unsigned char size, unsigned char x, unsigned char y);
 extern void __fastcall__ draw_FlyStone(unsigned char size, unsigned char x, unsigned char y);
 extern void __fastcall__ draw_Em0(unsigned char size, unsigned char x, unsigned char y);
 extern void __fastcall__ draw_EBullet0(unsigned char size, unsigned char x, unsigned char y);
 extern void __fastcall__ draw_EBullet1(unsigned char size, unsigned char x, unsigned char y);
 extern void __fastcall__ draw_EBullet2(unsigned char size, unsigned char x, unsigned char y);
 extern const unsigned char sprite_EBullet0_half_w[];  // EBullet0/1/2共通
 extern const unsigned char sprite_EBullet0_h[];       // EBullet0/1/2共通

 #ifdef BANK_SUPPORT
 #pragma wrapped-call (push, farcall, bank)
 #endif

 extern void update_bgobj_spawn(void);
 extern void update_bgobj_camera(void);
 extern void check_bullet_bgobj_collision(void);
 extern void fire_bullet(void);
 extern void update_bullets(void);
 extern void init_bullets(void);
 extern void draw_bgobj_all(void);
 extern void init_bgobj(void);
 extern void update_enemy_spawn(void);
 extern void update_enemy(void);
 extern void update_ebullet(void);
 extern void resolve_bom_pending(void);
 #ifdef BANK_SUPPORT
 #pragma wrapped-call (pop)
 #endif
 
 extern void clear_vbuf_fast(void);
 extern void vbuf_or_hline_zp(void);
 extern void exram_phase0(void);
 extern void exram_phase1(void);
 
 static void clear_vbuf(void);
 extern void update_player_pos(void);
 extern void write_player_oam(void);
 static void reset_game(void);

 extern void __fastcall__ draw_ground_from_table(unsigned char scroll);
 extern void __fastcall__ setup_bgobj_gy_ptr(unsigned char offset);
 extern void __fastcall__ draw_bgfard(unsigned char scroll_byte);
 extern void __fastcall__ draw_bgfaru(unsigned char scroll_byte);
 extern void draw_ground_bgfar_batch(void);

 extern unsigned char R00;
 #pragma zpsym ("R00");
 extern unsigned char R01;
 #pragma zpsym ("R01");
 extern unsigned char R02;
 #pragma zpsym ("R02");
 extern unsigned char R03;
 #pragma zpsym ("R03");
 extern unsigned char R04;
 #pragma zpsym ("R04");
 extern unsigned char R05;
 #pragma zpsym ("R05");
 extern unsigned char R06;
 #pragma zpsym ("R06");
 extern unsigned char R07;
 #pragma zpsym ("R07");
 extern unsigned char R08;
 #pragma zpsym ("R08");
 extern unsigned char R09;
 #pragma zpsym ("R09");
 extern unsigned char R10;
 #pragma zpsym ("R10");
 extern unsigned char R11;
 #pragma zpsym ("R11");
 extern unsigned char R12;
 #pragma zpsym ("R12");
 extern unsigned char R13;
 #pragma zpsym ("R13");
 extern unsigned char R14;
 #pragma zpsym ("R14");
 extern unsigned char R15;
 #pragma zpsym ("R15");
 extern unsigned int P00;
 #pragma zpsym ("P00");
 extern unsigned int P01;
 #pragma zpsym ("P01");
 extern unsigned int P02;
 #pragma zpsym ("P02");
 extern const unsigned char vbuf_row_lo[];
 extern const unsigned char vbuf_row_hi[];
 extern unsigned char nmi_oam_enable;
 #pragma zpsym ("nmi_oam_enable");

 static void set_wram_bank(unsigned char bank) {
     (*(volatile unsigned char*)0x5113) = bank;
     current_wram_bank = bank;
 }

 void irq_hook(void) {
     unsigned char prev_wram_bank;
     unsigned char s;
 
     prev_wram_bank = current_wram_bank;
 
     if (use_dmc_irq_restore) {
         s = (*(volatile unsigned char*)0x4015);
         if (s & 0x80) {
             (*(volatile unsigned char*)0x4015) = 0x0F;
             if (dmc_irq_restore_stage == 0) {
                 dmc_irq_restore_stage = 1;
                 (*(volatile unsigned char*)0x5116) = 0x83;
                 (*(volatile unsigned char*)0x4011) = 0x00;
                 (*(volatile unsigned char*)0x4010) = 0x81;
                 (*(volatile unsigned char*)0x4012) = 0x00;
                 (*(volatile unsigned char*)0x4013) = 0x00;
                 (*(volatile unsigned char*)0x4015) = 0x0F;
                 (*(volatile unsigned char*)0x4015) = 0x1F;
                 (*(volatile unsigned char*)0x4015) = 0x1F;
                 (*(volatile unsigned char*)0x4015) = 0x1F;
                 return;
             }

             dmc_irq_restore_stage = 2;
             (*(volatile unsigned char*)0x5105) = (visible_page == 0) ? 0x00 : 0x55;
             __asm__(
                 "bit $2002\n"
                 "lda #0\n"
                 "sta $2005\n"
                 "sta $2005\n"
                 "lda #$20\n"
                 "sta $2006\n"
                 "lda #$00\n"
                 "sta $2006\n"
                 "lda #$0A\n"
                 "sta $2001\n"
             );
             (*(volatile unsigned char*)0x5203) = ON_LINES;
             (*(volatile unsigned char*)0x5204) = 0x80;
             (*(volatile unsigned char*)0x4010) = 0x00;
             (*(volatile unsigned char*)0x4015) = 0x0F;
             dmc_irq_restore_fired = 1;
             return;
         }
     }
 
     // MMC5 IRQ ACK
     __asm__("lda $5204");

     // 残りフレームでIRQが再発火しないように一旦無効化（次フレームはNMIで再設定する）
     __asm__(
         "lda #0\n"
         "sta $5204\n"
     );

     // 以降はレンダリングOFFにする（黒帯）
    __asm__(
        "lda #0\n"
        "sta $2001\n"
    );

    if (!update_ready) {
        if (frame2_exram_pending) {
            frame2_exram_pending = 0;
            set_wram_bank(wram_read_bank);
            exram_phase0();
            exram_phase1();
        }
        ppu_update_in_progress = 0;
        set_wram_bank(prev_wram_bank);
        return;
    }

    set_wram_bank(wram_read_bank);

    if (update_ready) {
        unsigned char write_page = (unsigned char)(visible_page ^ 1);

        // 書き込み面へ切り替え
        (*(volatile unsigned char*)0x5105) = (write_page == 0) ? 0x00 : 0x55;

        // 下側OFF区間はphase0のみ（phase1はトップ黒帯で実行）
        pending_write_page = write_page;
        transfer_phase0();
        nt_phase1_pending = 1;
        ppu_update_in_progress = 0;
    } else {
        ppu_update_in_progress = 0;
    }

    irq_pending = 1;

    // 表示面へ戻す（このフレーム内の見た目が壊れないように）
    (*(volatile unsigned char*)0x5105) = (visible_page == 0) ? 0x00 : 0x55;
    set_wram_bank(prev_wram_bank);
    return;
}

 static void clear_vbuf(void) {
    DBG_PROFILE_BEGIN_CLEAR();
    R00 = 48;
    clear_vbuf_fast();
    DBG_PROFILE_END();
}

#ifdef BANK_SUPPORT
#pragma code-name ("PRG_BANK_1")
#endif

// --- 弾の初期化 ---
void init_bullets(void) {
    unsigned char i;
    volatile unsigned char* oam = (volatile unsigned char*)0x0200;
    for (i = 0; i < BULLET_MAX; ++i) {
        bullet_timer[i] = 0;
    }
    bullet_count = 0;
    // 弾OAMスロットを画面外に
    for (i = 0; i < BULLET_MAX * 2; ++i) {
        oam[BULLET_OAM_BASE + i * 4] = 0xFF;
    }
}

// --- 弾の発射 ---
void fire_bullet(void) {
    unsigned char i;
    if (bullet_count >= BULLET_MAX) return;
    for (i = 0; i < BULLET_MAX; ++i) {
        if (bullet_timer[i] == 0) {
            bullet_sx[i] = (unsigned char)(124u + player_x); // プレイヤー中心OAM X
            bullet_wz[i] = 0;
            bullet_timer[i] = 1;
            // 発射時のスクリーンY = プレイヤー腰位置(player_y - 8)
            bullet_sy[i] = (unsigned char)(player_y - 8u);
            ++bullet_count;
            return;
        }
    }
}

// update_bullets は src/update_bullets.s にアセンブリ実装

#ifdef BANK_SUPPORT
#pragma code-name ("PRG_FIXED")
#endif

static void reset_game(void) {
    unsigned char i;
    // プレイヤー位置リセット (中央=0)
    player_x = 0;
    player_y = 120;
    player_vbuf_x = 124; // (120+0)/2 + 64
    player_fx = 0 * 256;
    player_fy = (unsigned int)120u * 256u;
    init_bullets();
    // 敵弾リセット
    for (i = 0; i < EBULLET_MAX; ++i) ebullet_active[i] = 0;
    ebullet_count = 0;
    ebullet_var_idx = 0;
    bom_pending_count = 0;
}

static void update_player_oam_only(void) {
    DBG_PROFILE_BEGIN_PLAYER_POS();
    update_player_pos();
    DBG_PROFILE_END();

    DBG_PROFILE_BEGIN_PLAYER_OAM();
    write_player_oam();
    DBG_PROFILE_END();
}

// NMIフック：描画ONに戻す＋IRQ設定（後半で描画OFFにする）
void nmi_hook(void) {
    // 前フレームのIRQ設定をクリア（残留による誤発火防止）
    (*(volatile unsigned char*)0x5204) = 0x00;
    ++nmi_counter;
    render_skip = 0;
    ++frame_counter;
    dmc_irq_restore_fired = 0;
    dmc_irq_restore_stage = 0;
    if (use_dmc_irq_restore) {
        (*(volatile unsigned char*)0x5116) = 0x83;
        (*(volatile unsigned char*)0x4011) = 0x00;
        (*(volatile unsigned char*)0x4010) = 0x81;
        (*(volatile unsigned char*)0x4012) = 0x00;
        (*(volatile unsigned char*)0x4013) = 0x00;
        (*(volatile unsigned char*)0x4015) = 0x0F;
        (*(volatile unsigned char*)0x4015) = 0x1F;
        (*(volatile unsigned char*)0x4015) = 0x1F;
        (*(volatile unsigned char*)0x4015) = 0x1F;
    }
    // NMIでは境界だけ作る（トップ黒帯でphase1→描画ON→IRQ設定はメイン側で行う）
    vblank_seen = 1;
}

#ifdef BANK_SUPPORT
#pragma code-name ("PRG_BANK_1")
#endif

void init_bgobj(void) {
    unsigned char i;
    bgobj_count = 0;
    trig_accum = 0;
    spawn_frame = 0;
    spawn_index = 0;
    for (i = 0; i < 8; ++i) bgobj_zbucket[i] = 0xFF;
    for (i = 0; i < 8; ++i) bgobj_col_zbucket[i] = 0xFF;
    // Enemy初期化
    enemy_count = 0;
    enemy_spawn_frame = 0;
    enemy_spawn_index = 0;
    for (i = 0; i < ENEMY_MAX; ++i) enemy_timer[i] = 0;
}

void add_bgobj(unsigned char type, signed int wx, unsigned char wy, unsigned char wz) {
    if (bgobj_count < BGOBJ_MAX) {
        bgobj_type[bgobj_count] = type;
        bgobj_wx[bgobj_count] = wx + player_x*2;
        bgobj_wy[bgobj_count] = wy;
        bgobj_wz[bgobj_count] = wz;
        bgobj_target_x[bgobj_count] = wx + player_x*3;
        ++bgobj_count;
    }
}

static void remove_bgobj(unsigned char idx) {
    unsigned char last;
    if (bgobj_count == 0) return;
    last = bgobj_count - 1u;
    if (idx != last) {
        bgobj_type[idx] = bgobj_type[last];
        bgobj_wx[idx]   = bgobj_wx[last];
        bgobj_wy[idx]   = bgobj_wy[last];
        bgobj_wz[idx]   = bgobj_wz[last];
        bgobj_target_x[idx] = bgobj_target_x[last];
    }
    --bgobj_count;
}

// bgobj出現テーブル (PRG_BANK_1に配置)
static const BgobjSpawnEntry spawn_table[] = {
    //  frame, type,                  wx,  data
    {   6, BGOBJ_TYPE_FLYSTONE, -140,  40 },
    {  10, BGOBJ_TYPE_FLYSTONE,  -10,  35 },
    {  15, BGOBJ_TYPE_FLYSTONE,   20,  32 },
    {  20, BGOBJ_TYPE_FLYSTONE,   90,  37 },
    {  28, BGOBJ_TYPE_FLYSTONE,  -10,  40 },
    {  34, BGOBJ_TYPE_FLYSTONE,   70,  34 },
    {  36, BGOBJ_TYPE_BUSH0,      0,   0 },
    {  42, BGOBJ_TYPE_BUSH0,    128,   0 },
    {  49, BGOBJ_TYPE_BUSH0,   -128,   0 },
    {  65, BGOBJ_TYPE_BUSH0,     58,   0 },
    {  70, BGOBJ_TYPE_TREE0,     20,   0 },
    {  72, BGOBJ_TYPE_BUSH0,    -60,   0 },
    {  81, BGOBJ_TYPE_TREE0,    108,   0 },
    {  91, BGOBJ_TYPE_BUSH0,    158,   0 },
    { 102, BGOBJ_TYPE_TREE0,   -148,   0 },
    { 110, BGOBJ_TYPE_BUSH0,    -58,   0 },
    { 115, BGOBJ_TYPE_TREE0,    128,   0 },
    { 120, BGOBJ_TYPE_BUSH0,   -128,   0 },
    { 165, BGOBJ_SPAWN_END,       0,   0 },  // ループ末尾
};

void update_bgobj_spawn(void) {
    /*
     * R00: spawn_index作業用
     * R01: 現在エントリのtype
     * R02: wy (spawn_table[].dataから種類別に解釈)
     */
    const BgobjSpawnEntry *ent;
    if (!auto_scroll) return;
    ++spawn_frame;
    R00 = spawn_index;
    ent = &spawn_table[R00];
    if (ent->frame > spawn_frame) return;
    while (ent->frame <= spawn_frame) {
        R01 = ent->type;
        if (R01 == BGOBJ_SPAWN_END) {
            spawn_frame = 0;
            R00 = 0;
            break;
        }
        // dataフィールドの種類別解釈
        // FLYSTONE: wy初期値, それ以外: 未使用(0)
        R02 = ent->data;
        spawn_index = R00;
        add_bgobj(R01, ent->wx, R02, 55);
        R00 = spawn_index;
        ++R00;
        ent = &spawn_table[R00];
    }
    spawn_index = R00;
}

#ifdef BANK_SUPPORT
#pragma code-name ("PRG_BANK_59")
#endif

// ============================================================
// --- Enemy 移動テーブル・出現テーブル・更新関数 (PRG_BANK_30) ---
// ============================================================
// テーブル本体は enemy_tables.c に分離 (cc65 の static const RODATA 配置問題の回避)

// EnemySpawnEntry 構造体定義
typedef struct {
    unsigned int  frame;
    unsigned char type;
    unsigned char pattern;
} EnemySpawnEntry;

// フラット配列方式 (cc65構造体ポインタのオーバーヘッド排除)
extern const unsigned char * const ep_wy[];
extern const unsigned char * const ep_wz[];
extern const unsigned char * const ep_sx[];
extern const unsigned char * const ep_bot[];
extern const unsigned char * const ep_sz[];
extern const unsigned char * const ep_zb[];
extern const unsigned char ep_frames[];
extern const unsigned char ep_fire_frame[];
extern const unsigned char * const ebullet_div_tbl[];
extern const EnemySpawnEntry enemy_spawn_table[];

// 空きスロットを探して敵を追加
static void add_enemy(unsigned char type, unsigned char pattern) {
    unsigned char i;
    if (enemy_count >= ENEMY_MAX) return;
    for (i = 0; i < ENEMY_MAX; ++i) {
        if (enemy_timer[i] == 0) {
            enemy_timer[i] = 1;  // 1から開始 (0=非アクティブ)
            enemy_pattern[i] = pattern;
            // 共有配列の初期値はupdate_enemyの最初の呼び出しで設定される
            bgobj_type[ENEMY_IDX_BASE + i] = type;
            bgobj_wx[ENEMY_IDX_BASE + i] = 0;
            bgobj_wy[ENEMY_IDX_BASE + i] = 0;
            bgobj_wz[ENEMY_IDX_BASE + i] = 0;
            ++enemy_count;
            return;
        }
    }
}

static void remove_enemy(unsigned char i) {
    enemy_timer[i] = 0;
    if (enemy_count > 0) --enemy_count;
}

void update_enemy_spawn(void) {
    const EnemySpawnEntry *ent;
    if (!auto_scroll) return;
    ++enemy_spawn_frame;
    ent = &enemy_spawn_table[enemy_spawn_index];
    while (ent->frame <= enemy_spawn_frame) {
        if (ent->type == 0xFF) {
            // ループ (今はループしない、末尾で停止)
            enemy_spawn_frame = 0;
            enemy_spawn_index = 0;
            return;
        }
        add_enemy(ent->type, ent->pattern);
        ++enemy_spawn_index;
        ent = &enemy_spawn_table[enemy_spawn_index];
    }
}

// 敵弾発射: 空きスロットを探して弾を追加
// enemy_cx[ei], enemy_wz[ei] が発射元の位置
// Z=0到達時にプレイヤー位置に来る直線移動
static void fire_ebullet(unsigned char ei) {
    unsigned char i, z, d, pvx;
    signed char vel;
    const unsigned char *div_row;
    if (ebullet_count >= EBULLET_MAX) return;
    z = enemy_wz[ei] >> 2;  // 4倍精度→従来Z
    if (z < 4) return;      // Z=0..3はテーブル範囲外
    // player_vbuf_x はメインループで毎フレーム更新済み
    pvx = player_vbuf_x;
    for (i = 0; i < EBULLET_MAX; ++i) {
        if (ebullet_active[i] == 0) {
            ebullet_x[i] = enemy_cx[ei];
            ebullet_y[i] = enemy_bot[ei];
            ebullet_wz[i] = z;
            // 除算テーブルで初速を求める
            div_row = ebullet_div_tbl[z - 4];
            // X速度: (pvx - enemy_cx) / z_frames
            if (pvx >= ebullet_x[i]) {
                d = (unsigned char)(pvx - ebullet_x[i]) >> 2;
                if (d > 63) d = 63;
                vel = (signed char)div_row[d];
            } else {
                d = (unsigned char)(ebullet_x[i] - pvx) >> 2;
                if (d > 63) d = 63;
                vel = -(signed char)div_row[d];
            }
            ebullet_vx[i] = vel;
            // Y速度: (player_oam_y → VBUF_Y - enemy_bot) / z_frames
            // player_y はOAM Y、弾のbot もOAM Y系なのでそのまま差分を取る
            if (player_y >= ebullet_y[i]) {
                d = (unsigned char)(player_y - ebullet_y[i]) >> 2;
                if (d > 63) d = 63;
                vel = (signed char)div_row[d];
            } else {
                d = (unsigned char)(ebullet_y[i] - player_y) >> 2;
                if (d > 63) d = 63;
                vel = -(signed char)div_row[d];
            }
            ebullet_vy[i] = vel;
            ebullet_variant[i] = ebullet_var_tbl[ebullet_var_idx];
            ebullet_var_idx = (ebullet_var_idx + 1) & 0x0F;
            ebullet_active[i] = 1;
            ++ebullet_count;
            return;
        }
    }
}

void update_enemy(void) {
    /*
     * 全8bitテーブル参照方式: 16bit演算ゼロ、テーブル引きゼロ、シフト演算ゼロ
     * ローカル変数ゼロ (cc65ソフトウェアスタック排除)
     * R00: loop counter i
     * R01: z bucket index (from table)
     * R02: slot (ENEMY_IDX_BASE + i)
     * R03: frame index t
     * R05: pat (パターン番号)
     *
     * bgobj_wx/wy/wz への書き込みなし (BOM0生成時にデータバンク切替で参照)
     * パターンキャッシュ: cache_pat と一致すればポインタ再取得スキップ
     */

    cache_pat = 0xFF; // フレーム先頭でキャッシュ無効化

    for (R00 = 0; R00 < ENEMY_MAX; ++R00) {
        if (enemy_timer[R00] == 0) continue;

        R02 = ENEMY_IDX_BASE + R00;

        // 被弾処理済み → 敵スロット解放
        if (bgobj_type[R02] != ENEMY_TYPE_EM0) {
            remove_enemy(R00);
            continue;
        }

        // timer は1起算 → フレームインデックス = timer - 1
        R03 = enemy_timer[R00] - 1;
        R05 = enemy_pattern[R00];

        // テーブル末尾到達 → 消滅
        if (R03 >= ep_frames[R05]) {
            bgobj_type[R02] = BGOBJ_TYPE_NONE;
            remove_enemy(R00);
            continue;
        }

        // パターンが変わった時だけポインタを再取得
        if (R05 != cache_pat) {
            cache_pat  = R05;
            cache_psx  = ep_sx[R05];
            cache_pbot = ep_bot[R05];
            cache_psz  = ep_sz[R05];
            cache_pzb  = ep_zb[R05];
            cache_pwz  = ep_wz[R05];
            cache_pwy  = ep_wy[R05];
        }

        // 全て8bitコピーのみ (16bit演算・テーブル引き・シフト演算なし)
        enemy_cx[R00]   = cache_psx[R03];
        enemy_bot[R00]  = cache_pbot[R03];
        enemy_size[R00] = cache_psz[R03];
        enemy_wz[R00]   = cache_pwz[R03];

        // BOM0生成用: wyをRAMキャッシュ (wxは被弾時にBANK_30から遅延取得)
        enemy_last_wy[R00] = cache_pwy[R03];

        // 描画バケツ登録 (エクスポート済みバケツインデックス、シフト不要)
        R01 = cache_pzb[R03];
        bgobj_znext[R02] = bgobj_zbucket[R01];
        bgobj_zbucket[R01] = R02;

        // コリジョンバケツ登録
        bgobj_col_znext[R02] = bgobj_col_zbucket[R01];
        bgobj_col_zbucket[R01] = R02;

        // 弾発射判定: timer(1起算)が発射フレームに一致したら発射
        if (enemy_timer[R00] == ep_fire_frame[R05]) {
            fire_ebullet(R00);
        }

        ++enemy_timer[R00];
    }
}

// update_ebullet is implemented in src/update_ebullet.s.
// Keep the C version here as the readable source of truth for the asm logic.
#if 0
// 敵弾更新: 移動 + Z減少 + 消滅判定 + バケツ登録
void update_ebullet(void) {
    for (R00 = 0; R00 < EBULLET_MAX; ++R00) {
        if (ebullet_active[R00] == 0) continue;

        // Z減少 (1/frame)
        if (ebullet_wz[R00] == 0) {
            ebullet_active[R00] = 0;
            if (ebullet_count > 0) --ebullet_count;
            continue;
        }
        R01 = (unsigned char)(ebullet_wz[R00] - 1u);
        ebullet_wz[R00] = R01;

        // XY移動
        ebullet_x[R00] = (unsigned char)(ebullet_x[R00] + (unsigned char)ebullet_vx[R00]);
        ebullet_y[R00] = (unsigned char)(ebullet_y[R00] + (unsigned char)ebullet_vy[R00]);

        // 画面外判定 (Y > 191 = VBUF範囲外)
        if (ebullet_y[R00] > 191) {
            ebullet_active[R00] = 0;
            if (ebullet_count > 0) --ebullet_count;
            continue;
        }

        // 描画バケツ登録
        R02 = EBULLET_IDX_BASE + R00;
        R01 >>= 3;  // Z 0..55 → bucket 0..6
        if (R01 > 7) R01 = 7;
        bgobj_znext[R02] = bgobj_zbucket[R01];
        bgobj_zbucket[R01] = R02;
    }
}
#endif

#ifdef BANK_SUPPORT
#pragma code-name ("PRG_BANK_0")
#pragma rodata-name ("RODATA")
#endif

void draw_bgobj_all(void) {
    /*
     * R00: bucket index (7..0)
     * R01: obj index i
     * R02: z
     * R03: size
     * R04: gy
     * R05: sx
     * R06: sy
     * R07: abs(wx_raw)>>1
     * R08: off
     * R09: sign flag (0=wx>=0, 1=wx<0)
     * P00: 16bit work (sc / mul result)
     */
    unsigned char next_i;
    unsigned char saved_bucket;
    unsigned char obj_type;
    unsigned char wy_tmp;
    signed int wx_tmp;

    R00 = 8;
    while (R00 != 0) {
        --R00;
        R01 = bgobj_zbucket[R00];
        while (R01 != 0xFF) {
            next_i = bgobj_znext[R01];
            R02 = bgobj_wz[R01];
            obj_type = bgobj_type[R01];

            // EnemyBullet (slot>=24) は ebullet_x/y/wz を使用
            if (R01 >= EBULLET_IDX_BASE) {
                unsigned char ebi = R01 - EBULLET_IDX_BASE;
                if (ebullet_active[ebi] == 0) { R01 = next_i; continue; }
                R02 = ebullet_wz[ebi];
                if (R02 > 55) R02 = 55;
                R03 = bgobj_z2size[R02];
                R05 = ebullet_x[ebi];
                // OAM Y → GY行 = (y - 31) / 2
                R06 = (unsigned char)((ebullet_y[ebi] - 31u) >> 1);
                if (R06 + 1u < sprite_EBullet0_h[R03]) { R01 = next_i; continue; }
                saved_bucket = R00;
                R00 = ebullet_variant[ebi];
                if (R00 == 1) {
                    draw_EBullet1(R03, R05, R06);
                } else if (R00 == 2) {
                    draw_EBullet2(R03, R05, R06);
                } else {
                    draw_EBullet0(R03, R05, R06);
                }
                R00 = saved_bucket;
                R01 = next_i;
                continue;
            }

            // Enemy (slot>=16) は事前計算済み enemy_cx/enemy_bot を使用 (16bit乗算なし)
            if (R01 >= ENEMY_IDX_BASE) {
                unsigned char ei = R01 - ENEMY_IDX_BASE;
                R03 = enemy_size[ei];
                R05 = enemy_cx[ei];
                // 描画GY行 = (bot - 31) / 2 (botはwy補正込み)
                R06 = (unsigned char)((enemy_bot[ei] - 31u) >> 1);

                if (obj_type == ENEMY_TYPE_EM0) {
                    extern const unsigned char sprite_Em0_h[];
                    if (R06 + 1u < sprite_Em0_h[R03]) { R01 = next_i; continue; }
                    saved_bucket = R00;
                    draw_Em0(R03, R05, R06);
                    R00 = saved_bucket;
                    R01 = next_i;
                    continue;
                }
                R01 = next_i;
                continue;
            }

            // --- BgObj: 従来の56要素テーブル使用 ---
            if (R02 > 55) R02 = 55;
            R03 = bgobj_z2size[R02];
            R04 = bgobj_z2gy_ptr[R02];

            wx_tmp = bgobj_wx[R01];
            if (wx_tmp >= 0) {
                R09 = 0;
                P00 = (unsigned int)wx_tmp >> 1;
            } else {
                R09 = 1;
                P00 = (unsigned int)(-wx_tmp) >> 1;
            }

            // abs(wx)/2 * sc / 256 → 画面オフセット(R08)
            if (P00 > 255u && bgobj_z2sc[R02] > 128u) { R01 = next_i; continue; }
            P00 = P00 * bgobj_z2sc[R02];
            R08 = (unsigned char)(P00 >> 8);

            if (R02 < 20 && R08 > 64u) { R01 = next_i; continue; }

            if (R09 == 0) {
                R05 = (unsigned char)(64u + VBUF_X_BIAS + R08);
            } else {
                if (R08 > 64u + VBUF_X_BIAS) { R01 = next_i; continue; }
                R05 = (unsigned char)(64u + VBUF_X_BIAS - R08);
            }

            R06 = R04;
            if (obj_type == BGOBJ_TYPE_TREE0) {
                extern const unsigned char sprite_Tree0_h[];
                if (R06 + 1u < sprite_Tree0_h[R03]) { R01 = next_i; continue; }
                saved_bucket = R00;
                draw_Tree0(R03, R05, R06);
                R00 = saved_bucket;
                R01 = next_i;
                continue;
            }
            if (obj_type == BGOBJ_TYPE_BOM0) {
                extern const unsigned char sprite_Bom0_h[];
                wy_tmp = bgobj_wy[R01];
                if (wy_tmp != 0) {
                    P00 = (unsigned int)wy_tmp * bgobj_z2sc[R02];
                    R06 = R04 - (unsigned char)(P00 >> 8);
                }
                if (R06 + 1u < sprite_Bom0_h[R03]) { R01 = next_i; continue; }
                saved_bucket = R00;
                draw_Bom0(R03, R05, R06);
                R00 = saved_bucket;
                R01 = next_i;
                continue;
            }
            if (obj_type == BGOBJ_TYPE_BUSH0) {
                extern const unsigned char sprite_Bush0_h[];
                if (R06 + 1u < sprite_Bush0_h[R03]) { R01 = next_i; continue; }
                saved_bucket = R00;
                draw_Bush0(R03, R05, R06);
                R00 = saved_bucket;
                R01 = next_i;
                continue;
            }
            if (obj_type == BGOBJ_TYPE_FLYSTONE) {
                extern const unsigned char sprite_FlyStone_h[];
                P00 = (unsigned int)bgobj_wy[R01] * bgobj_z2sc[R02];
                R06 = R04 - (unsigned char)(P00 >> 8);
                if (R06 + 1u < sprite_FlyStone_h[R03]) { R01 = next_i; continue; }
                saved_bucket = R00;
                draw_FlyStone(R03, R05, R06);
                R00 = saved_bucket;
                R01 = next_i;
                continue;
            }
            R01 = next_i;
        }
    }
}

#ifdef BANK_SUPPORT
#pragma code-name ("PRG_BANK_1")
#endif

// --- 弾×BgObjコリジョン判定 ---
// Zバケツを使い、弾のZ範囲内にあるBgObjの画面上スプライト矩形で判定
// ヒット時: 弾もBgObjも消滅
// update_bgobj_camera()でzbucketが構築された後、update_bullets()の後に呼ぶ
void check_bullet_bgobj_collision(void) {
    /*
     * ZPレジスタ割り当て:
     * R00: oi (obj index, 内側ループ最頻)
     * R01: oz
     * R02: next_obj
     * R03: obj_off
     * R04: obj_cx
     * R05: otype / enemy spr_h2
     * R06: sz
     * R07: bi (bullet index)
     * R08: bz
     * R09: bz_lo
     * R10: bcx_vbuf
     * R11: bcy
     * R12: bk
     * R13: bk_hi
     * R14: enemy_z_lo4 / half_w
     * R15: enemy_z_hi4 / spr_h / obj_bot / wy_tmp (再利用)
     * P00: 16bit work (乗算結果)
     * P01: obj_wx_raw (signed int)
     * P02: obj_top_16 / sc_tmp (再利用)
     */
    const unsigned char *hw_tbl;
    const unsigned char *h_tbl;

    if (bullet_count == 0) return;

    for (R07 = 0; R07 < BULLET_MAX; ++R07) {
        if (bullet_timer[R07] == 0) continue;

        R08 = bullet_wz[R07];
        R09 = (R08 >= BULLET_Z_SPEED) ? (unsigned char)(R08 - BULLET_Z_SPEED) : 0;
        R14 = R09 << 2;
        R15 = (unsigned char)((R08 << 2) + 3u);

        // 弾の表示中心をVBUF座標に変換
        R10 = (unsigned char)(bullet_sx[R07] / 2u + 64u);
        R11 = (unsigned char)(bullet_sy[R07] + 8u);

        R12 = R09 >> 3;
        R13 = R08 >> 3;
        if (R13 > 7) R13 = 7;

        for (; R12 <= R13; ++R12) {
            R00 = bgobj_col_zbucket[R12];
            while (R00 != 0xFF) {
                R02 = bgobj_col_znext[R00];
                R01 = bgobj_wz[R00];

                R05 = bgobj_type[R00];
                if (R05 == BGOBJ_TYPE_NONE || R05 >= TYPE_TBL_COUNT) { R00 = R02; continue; }

                // Enemy (slot>=16) は事前計算済み座標で高速判定
                // BgObj (slot<16) は従来のフル計算
                if (R00 >= ENEMY_IDX_BASE) {
                    R03 = R00 - ENEMY_IDX_BASE;
                    // enemy_wz を使用 (bgobj_wzにはもう書き込まない)
                    R01 = enemy_wz[R03];
                    // Z範囲チェック (弾Zは従来0..55、enemy wzは0..223 → 弾Z*4で比較)
                    if (R01 < R14 || R01 > R15) { R00 = R02; continue; }
                    // X判定: 事前計算済みVBUF X中心を使用 (16bit乗算なし)
                    R06 = enemy_size[R03];
                    R01 = sprite_Em0_half_w[R06];
                    R04 = enemy_cx[R03];
                    if (R10 < (unsigned char)(R04 - R01) || R10 > (unsigned char)(R04 + R01)) {
                        R00 = R02; continue;
                    }
                    // Y判定: enemy_bot[ei]はwy補正込み (16bit乗算なし)
                    R04 = enemy_bot[R03];
                    if (R11 > R04) { R00 = R02; continue; }
                    R05 = sprite_Em0_h[R06] << 1;
                    if (R04 < R05) { R00 = R02; continue; }
                    if (R11 < (unsigned char)(R04 - R05)) { R00 = R02; continue; }
                } else {
                    // Z範囲チェック
                    if (R01 < R09 || R01 > R08) { R00 = R02; continue; }
                    P02 = bgobj_z2sc[R01];
                    R06 = bgobj_z2size[R01];
                    // BgObj VBUF X算出 (draw_bgobj_allと完全に同じロジック)
                    P01 = (unsigned int)bgobj_wx[R00];
                    if ((signed int)P01 >= 0) {
                        R03 = (unsigned char)((unsigned int)P01 >> 1);
                    } else {
                        R03 = (unsigned char)((unsigned int)(-(signed int)P01) >> 1);
                    }
                    P00 = (unsigned int)R03 * P02;
                    R03 = (unsigned char)(P00 >> 8);
                    if ((signed int)P01 >= 0) {
                        R04 = (unsigned char)(128u + R03);
                    } else {
                        if (R03 > 128u) { R00 = R02; continue; }
                        R04 = (unsigned char)(128u - R03);
                    }
                    hw_tbl = bgobj_half_w_tbl[R05];
                    h_tbl  = bgobj_h_tbl[R05];
                    R14 = hw_tbl[R06];
                    R15 = h_tbl[R06];
                    if (R10 < (unsigned char)(R04 - R14) || R10 > (unsigned char)(R04 + R14)) {
                        R00 = R02; continue;
                    }
                    {
                        unsigned char obj_bot_local = (unsigned char)(31u + (unsigned int)bgobj_z2gy_ptr[bgobj_wz[R00]] * 2u);
                        unsigned char wy_local = bgobj_wy[R00];
                        if (wy_local != 0) {
                            P00 = (unsigned int)wy_local * P02;
                            obj_bot_local = (unsigned char)(obj_bot_local - (unsigned char)((P00 >> 8) * 2u));
                        }
                        P02 = (unsigned int)obj_bot_local - (unsigned int)R15 * 2u;
                        if ((unsigned int)R11 < P02 || R11 > obj_bot_local) {
                            R00 = R02; continue;
                        }
                    }
                }

                // ヒット! 弾を消滅
                bullet_timer[R07] = 0;
                --bullet_count;
                {
                    volatile unsigned char* oam = (volatile unsigned char*)0x0200;
                    unsigned char oam_off = (unsigned char)(BULLET_OAM_BASE + R07 * 8);
                    oam[oam_off] = 0xFF;
                    oam[oam_off + 4] = 0xFF;
                }
                if (R00 >= ENEMY_IDX_BASE) {
                    // Enemy → BgObjスロットにBOM0を新規追加、Enemyスロットは即解放
                    if (bgobj_count < BGOBJ_MAX) {
                        R04 = R00 - ENEMY_IDX_BASE;
                        R03 = bgobj_count;
                        bgobj_type[R03] = BGOBJ_TYPE_BOM0;
                        bgobj_wx[R03]   = 0; // 仮値: メインループでget_enemy_wxにより確定
                        bgobj_wy[R03]   = enemy_last_wy[R04];
                        bgobj_wz[R03]   = enemy_wz[R04] >> 2; // 4倍精度→従来Z
                        bgobj_target_x[R03] = 0;
                        // pending キューに記録 (メインループでwx解決)
                        if (bom_pending_count < BOM_PENDING_MAX) {
                            bom_pending_slot[bom_pending_count] = R03;
                            bom_pending_ei[bom_pending_count]   = R04;
                            ++bom_pending_count;
                        }
                        ++bgobj_count;
                    }
                    bgobj_type[R00] = BGOBJ_TYPE_NONE;
                } else {
                    // BgObj → 従来通りBOM0に変換
                    bgobj_type[R00] = BGOBJ_TYPE_BOM0;
                }
                goto next_bullet;
            }
        }
        next_bullet:;
    }
}

void update_bgobj_camera(void) {
    /*
     * R00: i (bgobj index)
     * R01: bk (z bucket index)
     * R02: wz_tmp
     * R03: ty_tmp
     * P00: 16bit作業 (diff/clamp用)
     * P01: player_x >> 4 キャッシュ
     */
    P01 = (unsigned int)(player_x >> 4);

    // バケツ初期化 (ループ展開・直アドレス指定)
    bgobj_zbucket[0] = 0xFF;
    bgobj_zbucket[1] = 0xFF;
    bgobj_zbucket[2] = 0xFF;
    bgobj_zbucket[3] = 0xFF;
    bgobj_zbucket[4] = 0xFF;
    bgobj_zbucket[5] = 0xFF;
    bgobj_zbucket[6] = 0xFF;
    bgobj_zbucket[7] = 0xFF;
    bgobj_col_zbucket[0] = 0xFF;
    bgobj_col_zbucket[1] = 0xFF;
    bgobj_col_zbucket[2] = 0xFF;
    bgobj_col_zbucket[3] = 0xFF;
    bgobj_col_zbucket[4] = 0xFF;
    bgobj_col_zbucket[5] = 0xFF;
    bgobj_col_zbucket[6] = 0xFF;
    bgobj_col_zbucket[7] = 0xFF;

    R00 = 0;
    while (R00 < bgobj_count)
    {
        R02 = bgobj_wz[R00];

        if (auto_scroll)
        {
            if (R02 == 0) {
                remove_bgobj(R00);
                continue;
            }
            --R02;
            bgobj_wz[R00] = R02;
        }

        // 横スクロール: player_x(中央=0)をそのまま適用
        P00 = (unsigned int)((signed int)bgobj_wx[R00] - (signed int)P01);
        bgobj_wx[R00] = (signed int)P00;

        // 範囲外チェック: wxが-512〜+512を超えたら消去
        if (R02 < 20) {
            if ((signed int)P00 > 256 || (signed int)P00 < -256) {
                remove_bgobj(R00);
                continue;
            }
        }

        // 描画バケツ登録 (共通)
        R01 = R02 >> 3;
        bgobj_znext[R00] = bgobj_zbucket[R01];
        bgobj_zbucket[R01] = R00;

        // type別処理 (2分岐: BOM0 vs BG共通)
        R03 = bgobj_type[R00];
        if (R03 == BGOBJ_TYPE_BOM0) {
            // Bom0: wy落下のみ (出現直後補正なし、コリジョンバケツなし)
            if (bgobj_wy[R00] > 0) {
                if (bgobj_wy[R00] >= 6) {
                    bgobj_wy[R00] -= 6;
                } else {
                    bgobj_wy[R00] = 0;
                }
            }
        } else {
            // BG共通 (Tree0, Bush0, FlyStone): 出現直後補正 + コリジョンバケツ
            if (R02 > 35) {
                P00 = bgobj_target_x[R00] - (signed int)P00;
                if ((signed int)P00 < -10) {
                    P00 = (unsigned int)(signed int)-10;
                } else if ((signed int)P00 > 10) {
                    P00 = 10;
                }
                bgobj_wx[R00] += (signed int)P00;
            }
            bgobj_col_znext[R00] = bgobj_col_zbucket[R01];
            bgobj_col_zbucket[R01] = R00;
        }

        ++R00;
    }

    if (auto_scroll || (R10 & BUTTON_UP)) 
    {
        ground_scroll = (unsigned char)(ground_scroll + 1u);
    }
    if (!auto_scroll && (R10 & BUTTON_DOWN)) 
    {
        ground_scroll = (unsigned char)(ground_scroll - 1u);
    }
    if (!auto_scroll && (R11 & BUTTON_A)) {
        ground_scroll = (unsigned char)(ground_scroll + 1u);
    }
    if (R11 & BUTTON_B) {
        ground_scroll = (unsigned char)(ground_scroll - 1u);
    }

    if (ground_scroll >= 7u) {
        ground_scroll = (unsigned char)(ground_scroll - 7u);
        if (ground_scroll >= 7u) {
            ground_scroll = (unsigned char)(ground_scroll - 7u);
        }
    } else if (ground_scroll == 255u) {
        ground_scroll = 6;
    } else if (ground_scroll == 254u) {
        ground_scroll = 5;
    }

}

#ifdef BANK_SUPPORT
#pragma code-name ("PRG_BANK_0")
#endif
void init_both_pages(void) {
    unsigned char page;
    unsigned int i;
    volatile unsigned char* mmc5_nt = (volatile unsigned char*)0x5105;
    volatile unsigned char* mmc5_exram = (volatile unsigned char*)0x5C00;
    unsigned char ty;
    unsigned char tx;
    unsigned int addr;
    const unsigned char stripe_tile = 0x48;
    const unsigned char stripe_ex = 0x12;

    for (page = 0; page < 2; ++page) {
        *mmc5_nt = (page == 0) ? 0x00 : 0x55;

        // ネームテーブル全体を斜線パターンで埋める
        PPU_ADDR = 0x20;
        PPU_ADDR = 0x00;
        for (i = 0; i < 960; ++i) {
            PPU_DATA = stripe_tile;
        }

        // 描画対象領域（転送領域）はタイル0でクリア
        for (ty = 0; ty < TRANSFER_H; ++ty) {
            addr = (unsigned int)0x2000u + (unsigned int)(CENTER_Y + ty) * 32u + (unsigned int)CENTER_X;
            PPU_ADDR = (unsigned char)(addr >> 8);
            PPU_ADDR = (unsigned char)(addr & 0xFF);
            for (tx = 0; tx < TRANSFER_W; ++tx) {
                PPU_DATA = 0x00;
            }
        }

        // 属性テーブルをクリア
        PPU_ADDR = 0x23;
        PPU_ADDR = 0xC0;
        for (i = 0; i < 64; ++i) {
            PPU_DATA = 0x00;
        }
    }

    // ExRAM（拡張属性）も枠を斜線、描画領域は0に初期化
    (*(volatile unsigned char*)0x5104) = 0x02;
    for (i = 0; i < 960; ++i) {
        mmc5_exram[i] = stripe_ex;
    }
    for (ty = 0; ty < TRANSFER_H; ++ty) {
        unsigned int base = (unsigned int)(CENTER_Y + ty) * 32u + (unsigned int)CENTER_X;
        for (tx = 0; tx < TRANSFER_W; ++tx) {
            mmc5_exram[base + tx] = 0x00;
        }
    }
    (*(volatile unsigned char*)0x5104) = 0x01;

    // 表示開始はpage0
    *mmc5_nt = 0x00;
    visible_page = 0;
}

#ifdef BANK_SUPPORT
#pragma code-name ("PRG_FIXED")
#endif

void main(void) {
    unsigned char n;

    ppu_mask_shadow = 0;
    PPU_MASK = 0;
    PPU_CTRL = CTRL_NAMETABLE_2000 | CTRL_INCREMENT_1 | CTRL_BG_0000 | CTRL_SPRITE_8x16 | CTRL_NMI_DISABLE;

    while (PPU_STATUS & 0x80) {}
    while ((PPU_STATUS & 0x80) == 0) {}
    while (PPU_STATUS & 0x80) {}
    while ((PPU_STATUS & 0x80) == 0) {}

    // 描画OFF
    ppu_mask_shadow = 0;
    PPU_MASK = 0;
    PPU_CTRL = CTRL_NAMETABLE_2000 | CTRL_INCREMENT_1 | CTRL_BG_0000 | CTRL_SPRITE_8x16 | CTRL_NMI_DISABLE;

    // MMC5 拡張属性モード
    (*(volatile unsigned char*)0x5104) = 0x01;
    // $5130 は全体固定（上位2bitは使わない前提）
    (*(volatile unsigned char*)0x5130) = 0x00;

    // スプライトCHR: CHR後半256KBの先頭4KBへ割り当てる
    // $5130 は「以降のCHR bank writeの上位bit」なので、一時的に1へして書いたら0へ戻す
    // MMC5 8x16スプライトモード: $5120-$5123がスプライト用、$5124-$5127がBG用
    (*(volatile unsigned char*)0x5130) = 0x01;
    (*(volatile unsigned char*)0x5120) = 0x00;
    (*(volatile unsigned char*)0x5121) = 0x01;
    (*(volatile unsigned char*)0x5122) = 0x02;
    (*(volatile unsigned char*)0x5123) = 0x03;
    (*(volatile unsigned char*)0x5124) = 0x00;
    (*(volatile unsigned char*)0x5125) = 0x01;
    (*(volatile unsigned char*)0x5126) = 0x02;
    (*(volatile unsigned char*)0x5127) = 0x03;
    (*(volatile unsigned char*)0x5130) = 0x00;

    // パレット設定（$3F00〜）
    // パレット0/1で平面選択（bitplane0/bitplane1）を行う
    PPU_ADDR = 0x3F;
    PPU_ADDR = 0x00;
    // BG palette 0
    PPU_DATA = 0x0F;  // $3F00: universal bg = 黒
    PPU_DATA = 0x30;  // $3F01: 白
    PPU_DATA = 0x0F;  // $3F02: 黒
    PPU_DATA = 0x30;  // $3F03: 白
    // BG palette 1
    PPU_DATA = 0x0F;  // $3F04: 黒
    PPU_DATA = 0x0F;  // $3F05: 黒
    PPU_DATA = 0x30;  // $3F06: 白
    PPU_DATA = 0x30;  // $3F07: 白
    // BG palette 2/3（bit7が立っても見た目が変わらないよう、0/1の複製にしておく）
    // BG palette 2 = palette 0
    PPU_DATA = 0x0F;  // $3F08
    PPU_DATA = 0x30;  // $3F09
    PPU_DATA = 0x0F;  // $3F0A
    PPU_DATA = 0x30;  // $3F0B
    // BG palette 3 = palette 1
    PPU_DATA = 0x0F;  // $3F0C
    PPU_DATA = 0x0F;  // $3F0D
    PPU_DATA = 0x30;  // $3F0E
    PPU_DATA = 0x30;  // $3F0F

    PPU_ADDR = 0x3F;
    PPU_ADDR = 0x10;
    // Sprite palette 0 (sprite0 hit用)
    PPU_DATA = 0x0F;
    PPU_DATA = 0x10;
    PPU_DATA = 0x21;
    PPU_DATA = 0x20;
    // Sprite palette 1 (プレイヤー上2段: 00,11,28,15)
    PPU_DATA = 0x00;
    PPU_DATA = 0x11;
    PPU_DATA = 0x28;
    PPU_DATA = 0x15;
    // Sprite palette 2 (プレイヤー下1段: 00,21,33,11)
    PPU_DATA = 0x00;
    PPU_DATA = 0x21;
    PPU_DATA = 0x33;
    PPU_DATA = 0x11;
    // Sprite palette 3 (弾: 0F,17,27,30)
    PPU_DATA = 0x0F;
    PPU_DATA = 0x17;
    PPU_DATA = 0x27;
    PPU_DATA = 0x30;

    init_both_pages();

    init_sprite0_hit();
    write_player_oam();
    init_bgobj();
    init_bullets();
    nmi_oam_enable = 0x02;

    wram_read_bank = 0;
    wram_write_bank = 1;
    set_wram_bank(wram_write_bank);

    // 最初のフレームを準備
    clear_vbuf();
    // VBlankを待ってから描画ON
    while ((PPU_STATUS & 0x80) == 0) {}

    PPU_SCROLL = 0;
    PPU_SCROLL = 0;
    ppu_mask_shadow = (unsigned char)(MASK_SHOW_BG | MASK_SHOW_LEFT_BG | MASK_SHOW_SPRITE | MASK_SHOW_LEFT_SPRITE);
    PPU_MASK = ppu_mask_shadow;
    ppu_ctrl_shadow = CTRL_NAMETABLE_2000 | CTRL_INCREMENT_1 | CTRL_SPRITE_1000 | CTRL_BG_0000 | CTRL_SPRITE_8x16 | CTRL_NMI_ENABLE;
    PPU_CTRL = ppu_ctrl_shadow;

    nmi_counter = 0;
    last_nmi_counter = 0;

    (*(volatile unsigned char*)0x5203) = ON_LINES;
    (*(volatile unsigned char*)0x5204) = 0x80;

    __asm__("cli");
    n = nmi_counter;
    while (nmi_counter == n) {}
    last_nmi_counter = (unsigned char)(nmi_counter - 1);

    // メインループ
    while (1) {
        unsigned char n;
        unsigned char prev_wram_bank;
        unsigned char irq_set;

        nmi_oam_enable = 0x02;
        n = nmi_counter;
        if (n == last_nmi_counter) {
            continue;
        }
        last_nmi_counter = n;

        trig_accum |= JOY1_PRESSED;

        prev_wram_bank = current_wram_bank;
        irq_set = 0;

        // トップ黒帯：NMI直後に最優先でphase1 → ページ切替 → 描画ON → 次の下側IRQ設定
        if (nt_phase1_pending) {

            nt_phase1_pending = 0;
            irq_pending = 0;

            // レンダリングOFFのままwrite_pageへphase1
            set_wram_bank(wram_read_bank);
            (*(volatile unsigned char*)0x5105) = (pending_write_page == 0) ? 0x00 : 0x55;
            transfer_phase1();

            frame2_post_pending = 1;
            set_wram_bank(prev_wram_bank);
        } else {
            // 非更新フレームでもphase1相当の時間を確保し、描画開始タイミングを揃える
            set_wram_bank(prev_wram_bank);
        }

        // Frame2: 後処理を分割
        // - ExRAM更新はFrame2 IRQ(下側黒帯)で実行
        // - VBUF clearはFrame2の非表示期間が終わった直後（メイン側）で実行
        if (frame2_post_pending) {
            frame2_post_pending = 0;
            update_ready = 0;
            frame2_exram_pending = 1;
            frame2_clear_pending = 1;
        }

        // 更新の有無に関わらず、毎フレームここで描画ONに戻して次の下側IRQを設定する
        (*(volatile unsigned char*)0x5105) = (visible_page == 0) ? 0x00 : 0x55;
        if (!use_dmc_irq_restore) {
            __asm__(
                "lda #$1E\n"
                "sta $2001\n"
            );
            ppu_mask_shadow = 0x1E;

            if (use_sprite0_scroll_fix) {
                unsigned char hit;
                // 前フレームのhit残りをクリア待ち
                while (PPU_STATUS & 0x40) {}

                // hitを待つ（※VBlankに入ったら諦める）
                while (!(PPU_STATUS & 0x40)) {
                    if (PPU_STATUS & 0x80) break;
                }
                hit = (unsigned char)(PPU_STATUS & 0x40);
                __asm__(
                    "bit $2002\n"
                    "lda #0\n"
                    "sta $2005\n"
                    "lda #$20\n"
                    "sta $2005\n"
                    "lda #$20\n"
                    "sta $2006\n"
                    "lda #$80\n"
                    "sta $2006\n"
                );

                if (hit) {
                    // 描画OFF→ONでMMC5スキャンラインカウンタをリセット
                    // ($FFFA/$FFFB読み取りはEverdrive N8等で動作しない可能性があるため）
                    __asm__(
                        "lda #$00\n"
                        "sta $2001\n"      // 描画OFF（カウンタ=0にリセット）
                        "lda #$1E\n"
                        "sta $2001\n"      // 描画ON（カウンタ=1からスタート）
                    );
                    ppu_mask_shadow = 0x1E;
                    (*(volatile unsigned char*)0x5203) = (unsigned char)MMC5_IRQ_FROM_SPR0;
                    (*(volatile unsigned char*)0x5204) = 0x80;
                    irq_set = 1;
                } else {
                    __asm__(
                        "lda #$1E\n"
                        "sta $2001\n"      // 描画ON
                    );
                    ppu_mask_shadow = 0x1E;
                }
            }

            if (!irq_set) {
                (*(volatile unsigned char*)0x5203) = ON_LINES;
                (*(volatile unsigned char*)0x5204) = 0x80;
            }
        }

        // Frame2: 非表示期間が終わった直後（描画ONに戻した直後）のメイン側でVBUF clear
        if (frame2_clear_pending) {
            //======================================================================================
            // Frame2のこのブロックで、画面クリア、遠景+地面の描画を行ってから、ゲームロジックを実行する
            //======================================================================================
            
            // frame2のタイミングでname tableをスワップ
            unsigned char new_visible = (unsigned char)(visible_page ^ 1);
            visible_page = new_visible;

            frame2_clear_pending = 0;
            set_wram_bank(wram_write_bank);

            // ground_offset_target: player_y=56->0, player_y=201->32
            // 線形: offset = (player_y - 56) * 32/145 ≈ (player_y - 56) * 57 >> 8
            {
                unsigned char tmp;
                if (player_y <= 56u) {
                    tmp = 0;
                } else {
                    tmp = (unsigned char)(((unsigned int)(player_y - 56u) * 57u) >> 8);
                    if (tmp > 32u) tmp = 32u;
                }
                ground_offset_target = tmp;
            }
            // ground_offsetは1フレームに1ずつtargetに追従
            ++ground_offset_timer;
            if (ground_offset_timer >= 1) {
                ground_offset_timer = 0;

                if (ground_offset < ground_offset_target) {
                    ++ground_offset;
                } else if (ground_offset > ground_offset_target) {
                    --ground_offset;
                }
            }

            // 画面クリア（上部24ペアのみ。下部24ペアは統合fill関数が全て上書きする）
            DBG_PROFILE_BEGIN_CLEAR();
            R00 = 24;
            clear_vbuf_fast();
            DBG_PROFILE_END();

            DBG_PROFILE_BEGIN_GROUND();
            draw_ground_bgfar_batch();
            DBG_PROFILE_END();

            update_bgobj_spawn();

            DBG_PROFILE_BEGIN_ENEMY_SPAWN();
            update_enemy_spawn();
            DBG_PROFILE_END();

            DBG_PROFILE_BEGIN_BG();
            update_bgobj_camera();
            DBG_PROFILE_END();

            // プレイヤーVBUF X更新 (1VBUF px = 2スクリーンpx)
            // OAMスプライト中心 X = 120 + player_x (112+8)
            // VBUF X = OAM_center_X / 2 + VBUF_X_BIAS = (120+player_x)/2 + 64
            player_vbuf_x = (unsigned char)(124 + (player_x >> 1));

            DBG_PROFILE_BEGIN_ENEMY();
            update_enemy();
            DBG_PROFILE_END();

            DBG_PROFILE_BEGIN_EBULLET();
            update_ebullet();
            DBG_PROFILE_END();

            set_wram_bank(wram_write_bank);
            // プレイヤー更新
            update_player_oam_only();

            DBG_PROFILE_BEGIN_BULLETS();
            // Aボタントリガで弾発射（trig_accumで30fps取りこぼし防止）
            if (trig_accum & BUTTON_A) {
                fire_bullet();
            }
            // 弾更新＆OAM書き込み（毎フレーム）
            update_bullets();
            check_bullet_bgobj_collision();
            if (bom_pending_count) resolve_bom_pending();
            DBG_PROFILE_END();

            // スタートボタンでauto_scrollトグル
            if (trig_accum & BUTTON_START) {
                auto_scroll ^= 1;
            }
            // セレクトボタンでリセット
            if (trig_accum & BUTTON_SELECT) {
                reset_game();
            }

            // 全消費者が読み終わったのでクリア
            trig_accum = 0;

            continue;
        }

        set_wram_bank(wram_write_bank);

        // Frame1: 仮想VRAMへの描画
        if (!update_ready) {
            //===============================================================
            // Frame1のこのブロックで、仮想VRAMへの描画を行う
            //===============================================================
            set_wram_bank(wram_write_bank);

            // BGオブジェクト描画（IRQ中のZP破壊防止のためsei/cli）
            __asm__("sei");
            DBG_PROFILE_BEGIN_SPRITE();
            draw_bgobj_all();
            DBG_PROFILE_END();
            __asm__("cli");

            update_ready = 1;

            wram_read_bank = wram_write_bank;
            wram_write_bank ^= 1;
        }
    }
}
