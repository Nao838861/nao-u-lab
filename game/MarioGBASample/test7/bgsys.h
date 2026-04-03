// タイルマップデータの先頭
#define TILE_START	28

typedef enum  {
	BLOCK_TYPE_RENGA,		// レンガ
	BLOCK_TYPE_KATAI,		// 固いやつ
} BLOCK_TYPE;

// BGの初期化
void InitBG();
// 指定座標のタイルを設定(8*8dot単位の座標系で指定)
void SetTile8( int x, int y, int no );
// 指定座標のタイルを取得(8*8dot単位の座標系で指定)
int GetTile8( int x, int y );
// 指定座標のBGの番号を取得(通常座標系)
int getTile(int x, int y);
