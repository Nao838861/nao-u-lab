
typedef struct tagMARIO_FREE {
	int x;
	int y;
	int ptn;
	int cnt;
	int spd_x;
	int spd_y;
	int state;
	int flip;
	int stop;
	int dash;
	int on_gnd;
	int hit_wall;
	int fall;
	OAMEntry	OAM;
} MARIO_FREE;


void MarioTaskInit( TCB *pTcb, u8 *ptr );
