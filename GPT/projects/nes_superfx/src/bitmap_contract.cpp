#include "BitmapBoard.hpp"
#include <iostream>
#include <stdexcept>
void check(bool v,const char*s){if(!v)throw std::runtime_error(s);}
int main(){
    try {
        nesfx::BitmapBoard b;b.CpuClock();b.CpuClock();
        check(b.CpuRead(0x5FF2)==2,"ABI2");
        b.CpuWrite(0x5FE1,4);b.CpuWrite(0x6000,0x55);
        check(b.memory[0x8000]==0x55,"work RAM page");
        b.CpuWrite(0x5FE1,5);check(b.page==4 && b.faults==4,"invalid page");
        b.CpuWrite(0x5FE3,4);b.CpuWrite(0x5FE0,3);
        b.GsuWrite(0x700000,0x12);check(b.faults==1,"front write detected");
        b.CpuWrite(0x5FE3,1);b.GsuWrite(0x704000,0xA5);
        check(b.faults==0 && b.memory[0x4000]==0xA5,"back write permitted");
        b.CpuWrite(0x5FE2,1);check(b.front==1 && b.generation==1,"atomic present");
        for(unsigned y: {0u,63u,64u,127u,128u,191u,192u,239u})
            for(unsigned x:{0u,127u,128u,255u}) {
                auto offset=nesfx::BitmapBoard::PixelByte(x&~7,y,0);
                b.memory[16384+offset]=static_cast<uint8_t>(x/8+y);
                b.NameFetch(static_cast<uint16_t>(0x2000+(y/8)*32+x/8));
                check(b.PatternFetch(y&7)==static_cast<uint8_t>(x/8+y),"tile/band/native quadrant address");
            }
        b.CpuWrite(0x5FE0,4);
        check(b.mode==4,"192-line viewport mode");
        b.NameFetch(0x2000+23*32);check(b.tileInside,"last viewport tile row");
        b.NameFetch(0x2000+24*32);check(!b.tileInside && b.PatternFetch(0)==0,"hidden texture rows");
        b.CpuWrite(0x5FE0,5);check(b.mode==4 && (b.faults&4),"invalid viewport mode");
        b.CpuWrite(0x5FE3,4);
        b.CpuWrite(0x5034,0);b.CpuWrite(0x503A,0x18);
        for(unsigned i=0;i<16;++i)b.CpuWrite(0x5100+i,i==0?0xFF:(i==2?0:1));
        // IWT r15,$0101 repeats in external-zero ROM only if continued; GO is visible immediately.
        b.CpuWrite(0x501E,0);b.CpuWrite(0x501F,0);
        check(b.Busy(),"GO visible");
        b.CpuWrite(0x5FE2,0);check(b.front==1 && (b.faults&2),"GO blocks present");
        b.CpuWrite(0x5FF0,0xA5);
        check(b.mode==0 && b.page==4 && b.front==0 && b.faults==0,"display reset");
        check(b.memory[0x8000]==0x55,"reset preserves RAM");
        std::cout<<"bitmap ABI2 contract passed\n";return 0;
    }catch(const std::exception&e){std::cerr<<e.what()<<'\n';return 1;}
}
