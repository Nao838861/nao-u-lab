#include "FxRacingBoard.hpp"
#include <iostream>
#include <stdexcept>
static void check(bool value,const char* message) {if(!value)throw std::runtime_error(message);}
int main() {
    try {
        nesfx::FxRacingBoard board;board.gsuClockHz=50000000;
        board.CpuClock();board.CpuClock();board.memory.fill(0xa5);
        board.GsuWrite(0x700100,0x12);
        check(board.GsuRead(0x704100)==0x12,"framebuffer banks must alias");
        board.GsuWrite(0x708100,0x34);
        check(board.GsuRead(0x708100)==0x34 && board.GsuRead(0x700100)==0x12,"work RAM must be separate");
        board.GsuWrite(0x702800,0x77);
        check(board.GsuRead(0x702800)==0 && board.memory[0x2800]==0xa5,"invisible framebuffer hole");
        board.page=2;board.CpuWrite(0x6100,0x56);
        check(board.GsuRead(0x700100)==0x56,"CPU upload must share physical buffer");
        board.mode=4;board.front=0;
        board.CpuWrite(0x5fe8,0);board.CpuWrite(0x5fe9,0x40);
        board.CpuWrite(0x5fea,0);board.CpuWrite(0x5feb,0x40);
        board.CpuWrite(0x5fec,0x78);board.CpuWrite(0x5fed,0x9a);board.CpuWrite(0x5fee,1);
        check(board.fillBusy && board.memory[0]==0xa5,"fill must be asynchronous");
        while(board.fillBusy)board.CpuClock();
        check(board.lastFillClocks==16384,"fill byte clock count");
        check(board.GsuRead(0x700000)==0x78 && board.GsuRead(0x704001)==0x9a,"fill must alias both banks");
        check(board.GsuRead(0x708100)==0x34,"frame fill must preserve work RAM");
        check(board.memory[0x2800]==0xa5 && board.faults==0,"fill must skip invisible holes without front-buffer fault");
        check(board.MemoryClockScale()==1,"published core50 internal RAM timing");
        std::cout<<"FX Racing single-buffer RAM / upload / range fill PASS\n";
    }catch(const std::exception &error){std::cerr<<error.what()<<'\n';return 1;}
}
