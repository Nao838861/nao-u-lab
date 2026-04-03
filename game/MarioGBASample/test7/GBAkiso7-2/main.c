


#include "GBA.h"
#include "Sprite.h"

#include "data/Image.h"



// 垂直同期待ち
void WaitForVsync(void)
{
	while (*(volatile u16*)0x4000006 >= 160) {};
	while (*(volatile u16*)0x4000006 < 160) {};

}

// すべてのスプライトを表示させない
void InitializeSprites(OAMEntry* sprites)
{
	int loop;
	for(loop = 0; loop < 128; loop++)
	{
		sprites[loop].attribute0 = 160;  //y to > 159
		sprites[loop].attribute1 = 240;  //x to > 239
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
	sp->attribute1 = sp->attribute1 | x;
	
	sp->attribute0 = sp->attribute0 & 0xFF00;
	sp->attribute0 = sp->attribute0 | y;
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

// スプライトキャラクタを変更
void ChangeSprite(OAMEntry* sp, int ch)
{
	sp->attribute2 = sp->attribute2 & 0xFE00;
	
	sp->attribute2 = sp->attribute2 | ch;
}


/******************************************************/
/*                     メイン関数                     */
/******************************************************/

int main(void)
{
	u16 i;
	
	OAMEntry* sprites = (OAMEntry*)OAMmem; // OAM
	
	u16* OAMData = OAMdata; // スプライトデータアドレス
	u16* OBJPaletteMem = OBJpal; // スプライトパレットアドレス
	
	
	// 全スプライトの位置を初期化
	InitializeSprites(sprites);
	
	
	// スプライトのデータ格納
	for(i = 0; i < 2*2*32; i++)
		OAMData[i] = Image_data[i*2] | (Image_data[i*2+1]<<8);
	
	// スプライトパレット格納
	for(i=0;i<256;i++)
		OBJPaletteMem[i] = Image_pal[i];
	
	
	// スプライトの形状設定
	SetSpriteSize(&sprites[0],SP_SIZE_16,SP_SQUARE,SP_COLOR_256);
	
	// スプライトの使用キャラクタ番号を変更
	ChangeSprite(&sprites[0],0);
	
	// スプライト移動
	MoveSprite(&sprites[0],20,20);
	
	
	// モード設定
	SetMode( MODE_0 | OBJ_ENABLE | OBJ_MAP_1D );
	
	
	// メインループ
	while(1)
	{
		
		WaitForVsync(); // 垂直同期待ち
		
	}

} // メイン関数はここで終わり






