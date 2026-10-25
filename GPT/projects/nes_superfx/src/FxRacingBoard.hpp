#pragma once
#include "BitmapBoard.hpp"

namespace nesfx {
// Functional model of racing_gsu.vhd: both framebuffer addresses alias one
// physical drawing buffer. Completed images live in external CHR memory.
class FxRacingBoard : public BitmapBoard {
public:
    uint8_t MemoryClockScale() const override { return 1; }
    static unsigned Address(unsigned a) { return a<32768 ? a&16383 : a; }
    static bool Valid(unsigned a) { return a<40960 && (a>=32768 || (a&0x2800)!=0x2800); }
    uint8_t GsuRead(uint32_t a) override {
        unsigned o=a&65535;
        return ((a>>16)&0x7e)==0x70 && Valid(o)?memory[Address(o)]:0;
    }
    void GsuWrite(uint32_t a,uint8_t v) override {
        unsigned o=a&65535;
        if(((a>>16)&0x7e)==0x70 && Valid(o))memory[Address(o)]=v;
    }
    uint8_t CpuRead(uint16_t a) {
        if(a>=0x6000 && a<=0x7fff) {
            unsigned o=page*8192+(a&8191);
            return !Busy() && !fillBusy && Valid(o)?memory[Address(o)]:0;
        }
        return BitmapBoard::CpuRead(a);
    }
    void CpuWrite(uint16_t a,uint8_t v) {
        if(a>=0x6000 && a<=0x7fff) {
            unsigned o=page*8192+(a&8191);
            if(!Busy() && !fillBusy && Valid(o))memory[Address(o)]=v;
            return;
        }
        if(a==0x5fee) {
            if(v!=1 || Busy() || fillBusy || unsigned(fillAddress)+fillLength>40960) { FillError();return; }
            fillCursor=fillAddress;fillRemaining=fillLength;fillPosition=0;
            fillBusy=fillLength!=0;fillDone=!fillBusy;fillError=false;
            lastFillClocks=0;fillClockRemainder=0;return;
        }
        BitmapBoard::CpuWrite(a,v);
    }
    void CpuClock() {
        // Let the inherited instruction engine run, but service fill through
        // the aliased physical RAM instead of its two-buffer ABI2 helper.
        bool filling=fillBusy;fillBusy=false;
        uint64_t before=targetClock;BitmapBoard::CpuClock();
        fillBusy=filling;
        if(filling) {
            fillClockRemainder+=(targetClock-before)*25000000;
            uint64_t count=std::min<uint64_t>(fillClockRemainder/gsuClockHz,fillRemaining);
            fillClockRemainder%=gsuClockHz;
            for(uint64_t i=0;i<count;++i) {
                unsigned o=fillCursor++;
                uint8_t value=(fillPosition++&1)?fillHigh:fillLow;
                if(Valid(o))memory[Address(o)]=value;
            }
            fillRemaining-=uint16_t(count);lastFillClocks+=count;
            if(!fillRemaining){fillBusy=false;fillDone=true;}
        }
    }
};
}
