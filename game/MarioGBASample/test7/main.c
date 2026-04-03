#include "GBA.h"
#include "IRQ.h"
#include "BG.h"
#include "Sprite.h"

#include "task.h"
#include "global.h"

#include "data/mario.h"

#include "bgsys.h"
#include "SpriteSys.h"
#include "MoveBlock.h"
#include "mario.h"
#include "kuribo.h"

// 実機で動かすときにはこのコメントをはずしてコンパイルする
int __gba_multiboot = 1234567890;
int skip = 1;


TCB			*pMario;
int	Key_on = 0;
int	Key_trg = 0;
int	Key_old = 0;
int scr_x = 0;
int scr_y = 0;

typedef struct tagMAIN_FREE {
	int dmy;
} MAIN_FREE;



void MainTaskInit( TCB *pTcb, u8 *pFree );
void MainTaskMain( TCB *pTcb, u8 *pFree );


// 垂直同期待ち
void WaitForVsync(void)
{
	while (*(volatile u16*)0x4000006 >= 160) {};
	while (*(volatile u16*)0x4000006 < 160) {};

}

u16 frame_count = 0; // フレーム数カウント用
int sleep_timer = 0;



// 割り込みハンドラ　割り込み発生時に呼び出される
void IRQ_Handler()
{
	u16 Int_Flag; 
	
	REG_IME = IRQ_MASTER_OFF;
	Int_Flag = REG_IF;
 
	if((REG_IF & IRQ_BIT_KEYS) ) {//IRQ_BIT_VBLANK)){
		frame_count++;
	}
	
	REG_IF = Int_Flag;
	REG_IME = IRQ_MASTER_ON;

}
// 割り込み準備
void IRQ_Setup(){
	
	REG_IME = IRQ_MASTER_OFF;
	REG_INTERUPT = (u32)IRQ_Handler;
	
	REG_P1CNT = 0xc000 | KEY_SELECT | KEY_START;
	REG_IE |= IRQ_BIT_KEYS; // Vblank割り込みを使用する
	REG_DISPSTAT |= DSTAT_USE_VBLANK; // DISPSTATでVblank割り込みを許可する

	
	REG_IME = IRQ_MASTER_ON;
}

/******************************************************/
/*                     メイン関数                     */
/******************************************************/
//int state = 0;

int main(void)
{
//	if( state == 0 ) {
//		state = 1;
		// タスクの初期化
		TaskInit();

		// メインタスクの作成
		TaskMake( MainTaskInit, NULL, 0x1000, 0x0000 );
//	}
	
	frame_count = 0;
	IRQ_Setup(); // 割り込み準備

	while( 1 ) {
		// メインループ
		int lp;
		for( lp=0; lp < skip; lp++ ) {
			// OAMバッファの初期化
			InitOAMBuff();
			// タスクの実行
			TaskExecute();
		}
		
		if( sleep_timer != 0 ) {
			sleep_timer--;
		}
		else if( Key_on & KEY_SELECT && Key_on & KEY_START ) {
			for( sleep_timer=0; sleep_timer<45; sleep_timer++ ) {
				WaitForVsync(); // 垂直同期待ち
			}
			asm (" swi 0x030000 "); // STOP
		}
		
/*
		OAMEntry OAM;
		SetSpriteSize(&OAM,SP_SIZE_16,SP_SQUARE,SP_COLOR_256);
		ChangeSprite(&OAM,7*8);
		MoveSprite(&OAM,0, frame_count);
		// OAMバッファに追加
		AddOAMBuff( &OAM );
*/
/*		OAMEntry OAM;
		int i = 0;
		for( i=0; i<32; i++) {
			SetSpriteSize(&OAM,SP_SIZE_16,SP_SQUARE,SP_COLOR_256);
			ChangeSprite(&OAM,8*i);
			MoveSprite(&OAM, (i%8)*16, (i/8) * 16);
			// OAMバッファに追加
			AddOAMBuff( &OAM );
		}
*/
		WaitForVsync(); // 垂直同期待ち
		
		// DMA転送開始
		OAMStartDMA();
	
		// スクロール値の反映
		REG_BG0HOFS = scr_x/ONE;
		REG_BG0VOFS = scr_y/ONE;
	}
} // メイン関数ここで終わり



void MainTaskInit( TCB *pTcb, u8 *ptr )
{
	//MAIN_FREE	*pFree = (MAIN_FREE	*)ptr;
	s16 lp, i;
	
	u16* OAMData = OAMdata; // スプライトデータアドレス
	u16* OBJPaletteMem = OBJpal; // スプライトパレットアドレス

	// BGの初期化
	InitBG();
	
	// 全スプライトの位置を初期化
	InitializeSprites();
	
	// スプライトのデータ格納(とりあえず16*16単位で転送)
	for(lp = 0; lp < 32; lp++) {
		int pl = 0;
		int base1 = 8*4*4*lp;	// 転送先番号
		int base2;
		
		// 上半分転送
		base2 = (lp&0x07)*(8*8*2) + (lp/8)*(8*8*2*8*2);	// 転送元アドレス
		for(i = 0; i < 8*4*2; i++) {
			OAMData[base1+pl] = mario_data[base2+pl*2] | (mario_data[base2+pl*2+1]<<8);
			pl++;
		}
		// 下半分転送
		base2 = (lp&0x07)*(8*8*2) + (lp/8)*(8*8*2*8*2) + (8*8*2*7);	// 転送元アドレス
		for(i = 0; i < 8*4*2; i++) {
			OAMData[base1+pl] = mario_data[base2+pl*2] | (mario_data[base2+pl*2+1]<<8);
			pl++;
		}
	}
	// スプライトパレット格納
	for(i=0;i<256;i++)
		OBJPaletteMem[i] = mario_pal[i];

	// モード設定
	SetMode( MODE_0  | BG0_ENABLE | OBJ_ENABLE | OBJ_MAP_1D );
	
	// スクロール位置の初期化
	scr_x = 64 * ONE;
	scr_y = (256-176-8)*ONE;
	
	// タスクの作成
	pMario = TaskMake( MarioTaskInit, NULL, 0x2000, 0x0000 );

	// メインの処理に移行
	pTcb->exec_func = MainTaskMain;
}

void MainTaskMain( TCB *pTcb, u8 *ptr )
{
//	MAIN_FREE	*pFree = (MAIN_FREE	*)ptr;
	Key_old = Key_on;
	Key_on = ~(*KEYS);
	Key_trg = Key_on & (Key_on ^ Key_old);

	// 下に落ちたらやり直し
	MARIO_FREE	*pMarioFree = (MARIO_FREE*)pMario->free;
	if( pMarioFree->y > 240*ONE ) {
//		// 初期化に戻る
//		pTcb->exec_func = MainTaskInit;
//		// マリオのタスクを殺す
//		pMario->exec_func = NULL;
		// 無理矢理初期化。なんかバグッてるっぽい
		{
			// タスクの初期化
			TaskInit();
			// メインタスクの作成
			TaskMake( MainTaskInit, NULL, 0x1000, 0x0000 );
		}
	}

	if( Key_trg & KEY_SELECT  ) {
		// クリボーセット
		KuriboSet( pMarioFree->x+16*12*ONE, pMarioFree->y, -(ONE/2 + ONE/6) );
	}
	
	// ずれ防止のため
	scr_x &= 0xffffff00;
	scr_y &= 0xffffff00;
}





