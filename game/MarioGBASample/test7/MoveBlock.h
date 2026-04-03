
typedef struct tagMOVE_BLOCK_FREE {
	int x;
	int y;
	int cnt;
	int type;
	OAMEntry	OAM;
} MOVE_BLOCK_FREE;

#define RENGA_TYPE_RENGA	0
#define RENGA_TYPE_HATENA	1
typedef enum  {
	BLKHIT_TYPE_SMALL,	// 小さいマリオが突付いた
	BLKHIT_TYPE_BIG,		// 大きいマリオが突付いた
} BLKHIT_TYPE;

// ブロックを突付く処理
void BlockHit(int x, int y, BLKHIT_TYPE type);
// ブロックの配置
void BlockSet(int x, int y, BLOCK_TYPE type);
// ブロックの消去
void BlockDelete(int x, int y);
