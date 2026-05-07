#include "GBA.h"
#include "BG.h"

#include "data/bg.h"

#include "global.h"
#include "bgsys.h"


// 指定座標のタイルを設定(8*8dot単位の座標系で指定)
void SetTile8( int x, int y, int no )
{
	// タイルマップデータ アドレス
	u16 *m0 = MEM_BG_MAP(TILE_START);

	int pl = (x>=32?32*32:0);
	x &= 0x1f;
	m0[pl+32*y+x] = no;
}

// 指定座標のタイルを取得(8*8dot単位の座標系で指定)
int GetTile8( int x, int y )
{
	// タイルマップデータ アドレス
	u16 *m0 = MEM_BG_MAP(TILE_START);

	int pl = (x>=32?32*32:0);
	x &= 0x1f;
	return m0[pl+32*y+x];
}

// 指定座標のBGの番号を取得(通常座標系)
int getTile(int x, int y)
{
	// 空の上は何もない
	if( y <= 0 ) return 0;
	
	u16 *m0 = MEM_BG_MAP(TILE_START);
	int sx, sy;

	sx = (((x / ONE)) & 0x1ff) / 8;
	sy = (((y / ONE)) & 0xff) / 8;
	int pl = (sx>=32?32*32:0);
	sx &= 0x1f;
	return m0[pl + 32*sy+sx];
//	return m0[32*sy+sx];
}

// BGの初期化
void InitBG()
{
	u16 i;
	
	// BGパレット アドレス
	u16 *pal = MEM_BG_PAL;
	// タイルキャラクタデータ アドレス
	u16 *tiles = MEM_BG_CHAR(0);
	
	int x;
	int y;
	
	// モード設定
//	SetMode( MODE_0 | BG0_ENABLE );
	
	// BG0の設定
	REG_BG0CNT = 
		( BG_SIZEA_512_256 | BG_COLOR_256 | 
		  BG_CHARBASE(0) | BG_MAPBASE(28) ); 
	
	// パレット設定
	for(i = 0; i < 256; i++) {
		pal[i] = bg_pal[i];
	}

	// 絵のデータ格納(とりあえず16*16単位で転送)
	for(i = 0; i < 8*8*16; i++) {
		tiles[i] = bg_data[i*2] | (bg_data[i*2+1]<<8);
//		OAMData[base+i] = mario_data[base+j*2] | (mario_data[base+j*2+1]<<8);
	}

	for(x=4; x<62; x++) {
		for(y=26; y<30; y++) {
			SetTile8( x, y, 2 + ((x&1)) + ((y&1))*2 );
		}
	}
	for(x=28; x<32; x++) {
		for(y=26; y<30; y++) {
			SetTile8( x, y, 0);
		}
	}
	for(x=34; x<36; x++) {
		for(y=26; y<30; y++) {
			SetTile8( x, y, 0);
		}
	}
	for(x=52; x<58; x++) {
		for(y=26; y<30; y++) {
			SetTile8( x, y, 0);
		}
	}
	

	x = 20;
	y = 6;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	x = 22;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	x = 24;
	// マップ格納
	SetTile8( x,  y  , 8);
	SetTile8( x+1,y  , 9);
	SetTile8( x,  y+1, 10);
	SetTile8( x+1,y+1, 11);
	x = 26;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);

	x = 6;
	y = 10;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	x = 8;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	x = 10;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	x = 12;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	
	// とりにくい縦並び
	x = 2;
	y = 8;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	y = 4;
	// マップ格納
	SetTile8( x,  y  , 8);
	SetTile8( x+1,y  , 9);
	SetTile8( x,  y+1, 10);
	SetTile8( x+1,y+1, 11);
	
	// 上にある二個並びのハテナ
	x = 8;
	y = 4;
	// マップ格納
	SetTile8( x,  y  , 8);
	SetTile8( x+1,y  , 9);
	SetTile8( x,  y+1, 10);
	SetTile8( x+1,y+1, 11);
	x = 10;
	// マップ格納
	SetTile8( x,  y  , 8);
	SetTile8( x+1,y  , 9);
	SetTile8( x,  y+1, 10);
	SetTile8( x+1,y+1, 11);

	x = 6;
	y = 4+9+11;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	x = 8;
	y = 4+9+11;
	// マップ格納
	SetTile8( x,  y  , 7);
	SetTile8( x+1,y  , 7);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	x = 8;
	y = 4+9+9;
	// マップ格納
	SetTile8( x,  y  , 7);
	SetTile8( x+1,y  , 7);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	x = 8;
	y = 4+9+7;
	// マップ格納
	SetTile8( x,  y  , 7);
	SetTile8( x+1,y  , 7);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	x = 8;
	y = 4+9+5;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);

	x = 12;
	y = 4+9+5;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	x = 14;
	// マップ格納
	SetTile8( x,  y  , 8);
	SetTile8( x+1,y  , 9);
	SetTile8( x,  y+1, 10);
	SetTile8( x+1,y+1, 11);
	x = 16;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	x = 18;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	
	x = 36;
	y = 4+9+5;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);
	for(x=38; x<38+2*2; x+=2) {
		// マップ格納
		SetTile8( x,  y  , 8);
		SetTile8( x+1,y  , 9);
		SetTile8( x,  y+1, 10);
		SetTile8( x+1,y+1, 11);
	}
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);


	// 高いとこにある小さな足場
	x = 24 + 2*12;
	y = 6;
	// マップ格納
	SetTile8( x,  y  , 8);
	SetTile8( x+1,y  , 9);
	SetTile8( x,  y+1, 10);
	SetTile8( x+1,y+1, 11);
	x = 24 + 2*13;
	// マップ格納
	SetTile8( x,  y  , 6);
	SetTile8( x+1,y  , 6);
	SetTile8( x,  y+1, 7);
	SetTile8( x+1,y+1, 7);

	x = 52;
	y = 20;
	// マップ格納
	SetTile8( x,  y  , 8);
	SetTile8( x+1,y  , 9);
	SetTile8( x,  y+1, 10);
	SetTile8( x+1,y+1, 11);

}

