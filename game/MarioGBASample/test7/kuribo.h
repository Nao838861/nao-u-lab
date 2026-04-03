
typedef struct tagKURIBO_FREE {
	int x;
	int y;
	int spd_x;
	int spd_y;
	int cnt;
	int on_gnd;
	int fall;
	OAMEntry	OAM;
} KURIBO_FREE;


// クリボーセット
void KuriboSet(int x, int y, int sx );
