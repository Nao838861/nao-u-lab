void MoveSprite(OAMEntry* sp, int x, int y);
void SetSpriteSize(OAMEntry* sp,u16 size,u16 form,u16 color);
void SetSpriteFlip(OAMEntry* sp, u16 flip);
void ChangeSprite(OAMEntry* sp, int ch);


void InitializeSprites();
// OAMバッファの初期化
void InitOAMBuff();
// OAMバッファに追加
void AddOAMBuff( OAMEntry *pOAM );
// DMA転送開始
void OAMStartDMA();
