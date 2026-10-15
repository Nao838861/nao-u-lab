#include "BitmapBoard.hpp"
#include <iostream>
#include <stdexcept>
void check(bool value,const char* label) { if(!value)throw std::runtime_error(label); }
void command(nesfx::BitmapBoard& b,unsigned address,unsigned length,unsigned pattern) {
    b.CpuWrite(0x5fe8,address&255);b.CpuWrite(0x5fe9,address>>8);
    b.CpuWrite(0x5fea,length&255);b.CpuWrite(0x5feb,length>>8);
    b.CpuWrite(0x5fec,pattern&255);b.CpuWrite(0x5fed,pattern>>8);b.CpuWrite(0x5fee,1);
}
int main() {
    try {
        nesfx::BitmapBoard b;b.CpuClock();b.CpuClock();b.mode=3;
        check(b.CpuRead(0x5fe7)==1,"capability");
        b.memory.fill(0xa5);command(b,0x4000,16384,0);
        check(b.fillBusy && b.memory[0x4000]==0xa5,"asynchronous start");
        b.TickFill(16383);
        check(b.fillBusy && b.lastFillClocks==16383 && b.memory[0x7fff]==0xa5,"not early");
        b.TickFill(1);
        check(!b.fillBusy && b.fillDone && b.lastFillClocks==16384,"exact duration");
        for(unsigned i=0;i<40960;++i)check(b.memory[i]==(i>=0x4000&&i<0x8000?0:0xa5),"range isolation");
        command(b,0x4003,5,0xff00);b.TickFill(100);
        for(unsigned i=0;i<5;++i)check(b.memory[0x4003+i]==(i&1?0xff:0),"relative pattern phase");
        check(b.lastFillClocks==5,"oversized tick");
        command(b,0x8000,0,0);check(!b.fillBusy&&b.fillDone&&b.lastFillClocks==0,"zero length");
        command(b,0x8000,3,0x1234);b.TickFill(3);
        check(b.memory[0x8000]==0x34&&b.memory[0x8001]==0x12&&b.memory[0x8002]==0x34,"work RAM fill");
        command(b,0x3fff,2,0);check(b.fillError&&!b.fillBusy&&b.memory[0x3fff]==0xa5,"front overlap rejected atomically");
        b.CpuWrite(0x5fe3,255);b.CpuWrite(0x5fef,6);
        command(b,0x9fff,2,0);check(b.fillError&&!b.fillBusy&&b.memory[0x9fff]==0xa5,"past RAM end");
        command(b,0xffff,2,0);check(!b.fillBusy,"address overflow");
        b.CpuWrite(0x5fe3,255);command(b,0x4000,10,0x5678);
        b.CpuWrite(0x5fec,0);b.CpuWrite(0x5fee,1);
        check(b.fillError&&b.fillLow==0x78&&b.fillRemaining==10,"busy command preserves active job");
        b.CpuWrite(0x5fe2,1);b.CpuWrite(0x501f,0x94);
        check(b.front==0&&!b.Busy()&&(b.faults&2),"fill blocks GO and present");
        b.TickFill(4);b.CpuWrite(0x5ff0,0xa5);
        check(!b.fillBusy&&b.lastFillClocks==0&&b.memory[0x4000]==0x78,"reset abort preserves committed writes");
        b.CpuClock();b.CpuClock();b.mode=3;
        command(b,0x4000,16384,0);
        while(b.fillBusy)b.CpuClock();
        check(b.lastFillClocks==16384,"NES clock integration");
        b.gsuClockHz=50000000;
        check(b.CpuRead(0x5fe6)==50 && b.MemoryClockScale()==2,"50MHz clock and fixed memory timing");
        b.gsu.GetState().ClockSelect=true;
        check(b.gsu.MemoryAccessClocks()==10,"RAM access keeps 200ns at 50MHz");
        b.targetClock=b.gsu.GetState().CycleCount;
        auto start=b.targetClock;
        command(b,0x4000,16384,0);
        while(b.fillBusy)b.CpuClock();
        auto elapsed=b.gsu.GetState().CycleCount-start;
        check(b.lastFillClocks==16384 && elapsed>=32768 && elapsed<32800,"fill remains 25MHz at 50MHz GSU");
        std::cout<<"range fill timing/protection/pattern/reset contract PASS\n";
        return 0;
    } catch(const std::exception& e) { std::cerr<<e.what()<<'\n';return 1; }
}
