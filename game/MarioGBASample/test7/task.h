#define NULL	0

#define TASK_FREE_SIZE	(128-0x14)
#define TCB_MAX			64

typedef struct tagTCB {
	void	(*exec_func)(struct tagTCB *, u8 *);	// 処理関数 
	void	(*dstr_func)(struct tagTCB *, u8 *);	// デストラクタ 
	struct tagTCB		*prev;						// 前タスクへのポインタ 
	struct tagTCB		*next;						// 次タスクへのポインタ 
	u16		priority;								// 処理優先 高 0000 - ffff 低 
	u16		attr;									// 消去用属性 
	
	u8 free[TASK_FREE_SIZE];
} TCB;

// 処理関数、デストラクタ
typedef void (*TCB_FUNC)(TCB *, u8 *);

extern TCB		tcb[TCB_MAX];			// ＴＣＢデータ 
extern TCB		*tcb_buf[TCB_MAX];		// ＴＣＢプール 
extern s16	tcb_num;					// 存在するＴＣＢ数 
extern TCB	*tcb_top;					// 先頭ＴＣＢへのポインタ 

// タスクの初期化
extern void TaskInit(void);
// タスクの作成
extern TCB *TaskMake(TCB_FUNC exec, TCB_FUNC dstr, u16 prio, u16 attr);
// タスクの実行
extern void TaskExecute(void);

