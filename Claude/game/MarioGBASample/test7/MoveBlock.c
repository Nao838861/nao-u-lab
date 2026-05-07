#include "GBA.h"
#include "BG.h"
#include "Sprite.h"

#include "task.h"
#include "global.h"

#include "bgsys.h"
#include "MoveBlock.h"
#include "SpriteSys.h"

void MoveBlockTaskMain( TCB *pTcb, u8 *ptr );
void MoveBlockTaskInit( TCB *pTcb, u8 *ptr );


// レンガ移動テーブル
static int renga_mov_tbl[] = {
	-1, -1, -2, -3, -4, -5, 
	-6, -7, -7, -7, -6, -4,
	-2,  0,  2,  1,  
};

void MoveBlockTaskInit( TCB *pTcb, u8 *ptr )
{
	MOVE_BLOCK_FREE	*pFree = (MOVE_BLOCK_FREE	*)ptr;
	
	// スプライトの初期化
	SetSpriteSize(&pFree->OAM,SP_SIZE_16,SP_SQUARE,SP_COLOR_256);
	ChangeSprite(&pFree->OAM,7*8);

	// メインの処理に移行
	pTcb->exec_func = MoveBlockTaskMain;
	(*pTcb->exec_func)(pTcb, ptr);
}

void MoveBlockTaskMain( TCB *pTcb, u8 *ptr )
{
	MOVE_BLOCK_FREE	*pFree = (MOVE_BLOCK_FREE	*)ptr;
	
	// ２フレーム目にBGを消す
	if( pFree->cnt == 1 ) {
		BlockDelete(pFree->x, pFree->y);
	}
	// レンガの処理
	pFree->cnt++;

	if( pFree->cnt >= 16 ) {
		pFree->cnt = 0xffff;
		if( pFree->type == RENGA_TYPE_RENGA )	BlockSet(pFree->x, pFree->y, BLOCK_TYPE_RENGA);
		if( pFree->type == RENGA_TYPE_HATENA )	BlockSet(pFree->x, pFree->y, BLOCK_TYPE_KATAI);
	}
	
	// レンガ移動
	if( pFree->cnt != 0xffff ) {	// 移動が終わっていないなら
		MoveSprite(&pFree->OAM,(pFree->x-scr_x)>>8, ((pFree->y-scr_y)>>8) + renga_mov_tbl[pFree->cnt]);
		if( pFree->type == RENGA_TYPE_RENGA )	ChangeSprite(&pFree->OAM,7*8);
		if( pFree->type == RENGA_TYPE_HATENA )	ChangeSprite(&pFree->OAM,6*8);
	}
	else {
		// 移動が終了したなら消滅
		MoveSprite(&pFree->OAM, 240, 160);
		pTcb->exec_func = NULL;
	}
	// OAMバッファに追加
	AddOAMBuff( &pFree->OAM );
}


// ブロックを突付く処理
void BlockHit(int x, int y, BLKHIT_TYPE type)
{
	TCB *pTcb;
	MOVE_BLOCK_FREE	*pFree;

	switch( getTile(x, y) ) {
		// レンガ
		case 6:
		case 7:
			// タスクの作成
			pTcb = TaskMake( MoveBlockTaskInit, NULL, 0x3000, 0x0000 );
			pFree = (MOVE_BLOCK_FREE*)pTcb->free;
			pFree->x = x & 0xfffff000;
			pFree->y = y & 0xfffff000;
			pFree->cnt = 0;
			pFree->type = RENGA_TYPE_RENGA;
			break;
		// ハテナ
		case 8:
		case 9:
		case 10:
		case 11:
			// タスクの作成
			pTcb = TaskMake( MoveBlockTaskInit, NULL, 0x3000, 0x0000 );
			pFree = (MOVE_BLOCK_FREE*)pTcb->free;
			pFree->x = x & 0xfffff000;
			pFree->y = y & 0xfffff000;
			pFree->cnt = 0;
			pFree->type = RENGA_TYPE_HATENA;
			break;
		
		default:
			//なにもしない
			break;
	}
}

// 指定座標にブロックを配置
void BlockSet(int x, int y, BLOCK_TYPE type)
{
	int sx, sy;
	sx = (((x / ONE)) & 0x1ff) / 8;
	sy = (((y / ONE)) & 0xff) / 8;
	
	sx &= 0xfe;
	sy &= 0xfe;
	
	switch( type ) {
		case BLOCK_TYPE_RENGA:
			SetTile8( sx,  sy  , 6);
			SetTile8( sx+1,sy  , 6);
			SetTile8( sx,  sy+1, 7);
			SetTile8( sx+1,sy+1, 7);
			break;

		case BLOCK_TYPE_KATAI:
			SetTile8( sx,  sy  , 12);
			SetTile8( sx+1,sy  , 13);
			SetTile8( sx,  sy+1, 14);
			SetTile8( sx+1,sy+1, 15);
			break;
	}
}

// 指定座標ブロックの消去
void BlockDelete(int x, int y)
{
	int sx, sy;
	sx = (((x / ONE)) & 0x1ff) / 8;
	sy = (((y / ONE)) & 0xff) / 8;
	SetTile8( sx,  sy  , 0);
	SetTile8( sx+1,sy  , 0);
	SetTile8( sx,  sy+1, 0);
	SetTile8( sx+1,sy+1, 0);
}
