#include "GBA.h"
#include "Sprite.h"

#include "global.h"

OAMEntry	OAMBuff[128];



// すべてのスプライトを表示させない
void InitializeSprites()
{
	OAMEntry* sprites = &OAMBuff[0];
	int loop;
	for(loop = 0; loop < 128; loop++)
	{
		sprites[loop].attribute0 = 160;  //y to > 159
		sprites[loop].attribute1 = 240;  //x to > 239
	}
	// とりあえずＤＭＡでなくコピーで実装
	OAMEntry* pOAM = (OAMEntry*)OAMmem; 		// OAM
	int i;
	for( i=0; i<128; i++ ) {
		pOAM[i] = sprites[i];
	}
}


// スプライトの位置を変更
void MoveSprite(OAMEntry* sp, int x, int y)
{
	if(x < 0)
		x = 512 + x;
	if(y < 0)
		y = 256 + y;

	sp->attribute1 = sp->attribute1 & 0xFE00;
	sp->attribute1 = sp->attribute1 | (x & 0x1ff);
	
	sp->attribute0 = sp->attribute0 & 0xFF00;
	sp->attribute0 = sp->attribute0 | (y & 0x0ff);
}	

/* -----------------------------------------  /
	SetSpriteSize
	スプライトの形状を設定
	sp・・・変更するスプライトを指定
	size・・SP_SIZE_8,SP_SIZE_16,SP_SIZE_32,SP_SIZE_64のいずれか
	form・・SP_SQUARE,SP_TALL,SP_WIDE
	color・・SP_COLOR_16,SP_COLOR_256
/ ------------------------------------------ */
void SetSpriteSize(OAMEntry* sp,u16 size,u16 form,u16 color)
{	
	sp->attribute0 &= 0x1FFF;
	sp->attribute0 |= color | form | (160);
	
	sp->attribute1 &= 0x3FFF;
	sp->attribute1 |= size | (240);
}

void SetSpriteFlip(OAMEntry* sp, u16 flip)
{	
	sp->attribute1 &= 0xcfff;
	sp->attribute1 |= flip;
}

// スプライトキャラクタを変更
void ChangeSprite(OAMEntry* sp, int ch)
{
	sp->attribute2 = sp->attribute2 & 0xFE00;
	sp->attribute2 = sp->attribute2 | ch;
}

int OAM_no = 0;
// OAMバッファの初期化
void InitOAMBuff()
{
	OAMEntry* sprites = &OAMBuff[0];
	int loop;
	if( OAM_no > 128 ) OAM_no = 128;
	for(loop = 0; loop < OAM_no; loop++)
	{
		sprites[loop].attribute0 = 160;  //y to > 159
		sprites[loop].attribute1 = 240;  //x to > 239
	}
	
	OAM_no = 0;
}

// OAMバッファに追加
void AddOAMBuff( OAMEntry *pOAM )
{
	OAMEntry* sprites = &OAMBuff[0];

	if( OAM_no >= 30 ) return;

	sprites[OAM_no] = *pOAM;
	OAM_no++;
}

// DMA転送開始
void OAMStartDMA()
{
	int i;
	OAMEntry* sprites = &OAMBuff[0]; // テンポラリ
	OAMEntry* pOAM = (OAMEntry*)OAMmem; 		// OAM

	// とりあえずＤＭＡでなくコピーで実装
//	for( i=0; i<OAM_no; i++ ) {
	for( i=0; i<32; i++ ) {
		pOAM[i] = sprites[i];
	}
}
