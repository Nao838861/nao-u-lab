#pragma once
#include "Board.hpp"

namespace nesfx {
// Proposed ABI2: 2x16KiB framebuffer + 8KiB work/code. Requires a new hardware memory path.
class BitmapBoard : public Board {
public:
    std::array<uint8_t,40960> memory{};
    uint8_t mode=0,page=4,front=0,faults=0;
    uint16_t generation=0;
    uint64_t startClock=0,lastRunClocks=0;
    uint16_t tileX=0,tileY=0;
    bool tileInside=false;
    void Reset() {
        Board::Reset();mode=0;page=4;front=0;faults=0;generation=0;
        lastRunClocks=0;startClock=targetClock;tileInside=false;
    }
    void CpuClock() {
        bool was=Busy(); Board::CpuClock();
        if(was && !Busy()) lastRunClocks=gsu.GetState().CycleCount-startClock;
    }
    bool Selected(uint16_t a) const { return Board::Selected(a)||(a>=0x5FD0 && a<=0x5FE7); }
    uint8_t CpuRead(uint16_t a) {
        if(a==0x5FF2) return 2;
        if(a>=0x5FD0 && a<0x5FD8) return static_cast<uint8_t>(lastRunClocks>>((a-0x5FD0)*8));
        switch(a) {
            case 0x5FE0:return mode; case 0x5FE1:return page; case 0x5FE2:return front;
            case 0x5FE3:return faults; case 0x5FE4:return generation&255; case 0x5FE5:return generation>>8;
        }
        if(a>=0x6000 && a<=0x7FFF) {
            if(Busy()) { ++blockedRamAccesses; return 0; }
            return memory[page*8192+(a&8191)];
        }
        return Board::CpuRead(a);
    }
    uint8_t CpuPeek(uint16_t a) {
        if(a>=0x6000 && a<=0x7FFF) return memory[page*8192+(a&8191)];
        if(a==0x5FF2 || (a>=0x5FD0 && a<=0x5FE5)) return CpuRead(a);
        return Board::CpuPeek(a);
    }
    void CpuWrite(uint16_t a,uint8_t v) {
        if(a==0x5FF0 && v==0xA5) { Reset();return; }
        switch(a) {
            case 0x5FE0:if(v<=3) mode=v; else faults|=4;return;
            case 0x5FE1:if(v<5) page=v; else faults|=4;return;
            case 0x5FE2:
                if(Busy()) { faults|=2;return; }
                if(v>1) { faults|=4;return; }
                front=v;++generation;return; // Host commits only in NMI/VBlank.
            case 0x5FE3:faults&=~v;return;
        }
        if(a>=0x6000 && a<=0x7FFF) {
            if(Busy()) { ++blockedRamAccesses;return; }
            auto index=page*8192+(a&8191);
            if(mode && index<32768 && index/16384==front) faults|=1;
            memory[index]=v;return;
        }
        bool was=Busy(); Board::CpuWrite(a,v);
        if(!was && Busy()) startClock=gsu.GetState().CycleCount;
    }
    uint8_t GsuRead(uint32_t a) override {
        auto offset=a&65535;
        if(((a>>16)&0x7E)==0x70 && offset<memory.size()) return memory[offset];
        return 0;
    }
    void GsuWrite(uint32_t a,uint8_t v) override {
        auto offset=a&65535;
        if(((a>>16)&0x7E)!=0x70 || offset>=memory.size()) { faults|=4;return; }
        if(mode && offset<32768 && offset/16384==front) faults|=1;
        memory[offset]=v;
    }
    // Native GSU OBJ/256-line tile layout; PPU low/high plane addresses are interleaved here.
    static uint32_t PixelByte(unsigned x,unsigned y,unsigned plane) {
        unsigned tile=((y&128)<<2)+((x&128)<<1)+((y&120)<<1)+((x&120)>>3);
        return tile*16+(y&7)*2+plane;
    }
    uint8_t NameFetch(uint16_t a) {
        unsigned row=(a&1023)>>5,col=a&31;
        unsigned x0=mode==1?8:0,y0=mode==1?7:(mode==2?11:0);
        unsigned w=mode==1?16:32,h=mode==1?16:(mode==2?8:30);
        tileInside=mode && col>=x0 && col<x0+w && row>=y0 && row<y0+h;
        tileX=static_cast<uint16_t>((col-x0)*8);tileY=static_cast<uint16_t>((row-y0)*8);
        return static_cast<uint8_t>(((row-y0)&7)*32+(col-x0));
    }
    uint8_t PatternFetch(uint16_t a) {
        if(!tileInside) return 0;
        return memory[front*16384+PixelByte(tileX,tileY+(a&7),(a>>3)&1)];
    }
    template<class S> void Serialize(S& s) {
        Board::Serialize(s);
        s.StreamArray(memory.data(),static_cast<uint32_t>(memory.size()),"bitmapMemory");
        s.Stream(mode,"bitmapMode");s.Stream(page,"bitmapPage");s.Stream(front,"bitmapFront");s.Stream(faults,"bitmapFaults");
        s.Stream(generation,"bitmapGeneration");s.Stream(startClock,"bitmapStart");s.Stream(lastRunClocks,"bitmapLastClocks");
        s.Stream(tileX,"bitmapTileX");s.Stream(tileY,"bitmapTileY");s.Stream(tileInside,"bitmapTileInside");
    }
};
}
